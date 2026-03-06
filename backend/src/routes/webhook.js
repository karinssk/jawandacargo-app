import { Router } from 'express';
import crypto from 'crypto';
import { pool } from '../db.js';

const router = Router();

const WELCOME_MESSAGE = `ยินดีต้อนรับสู่ Jawanda Cargo! 🎉

ขอบคุณที่เพิ่มเราเป็นเพื่อนนะคะ 😊
ทีมงานของเราพร้อมให้บริการด้านการขนส่งสินค้าอย่างรวดเร็วและปลอดภัย

หากมีคำถามหรือต้องการสอบถามราคา ทักมาได้เลยค่ะ 📦`;

function verifySignature(body, signature) {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret) return true; // skip in dev if not set
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('base64');
  return hmac === signature;
}

async function sendLineMessage(to, messages) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token || !to) throw new Error('LINE not configured or no line uid');

  const resp = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ to, messages }),
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`LINE API error ${resp.status}: ${body}`);
  }
}

async function fetchLineProfile(lineUid) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token || !lineUid) return null;
  const profileRes = await fetch(
    `https://api.line.me/v2/bot/profile/${lineUid}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!profileRes.ok) return null;
  return profileRes.json();
}

async function logWebhook({
  source = 'LINE_WEBHOOK',
  eventType,
  status,
  webhookEventId = null,
  lineUid = null,
  payload = null,
  errorMessage = null,
}) {
  await pool.query(
    `INSERT INTO webhook_logs
       (source, event_type, status, webhook_event_id, line_uid, payload, error_message)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [source, eventType, status, webhookEventId, lineUid, payload, errorMessage],
  );
}

async function upsertCustomer(lineUid, displayName = null, pictureUrl = null) {
  const result = await pool.query(
    `INSERT INTO customers (customer_code, line_uid, display_name, picture_url, is_blocked)
     VALUES ('JWD-' || LPAD(nextval('customer_seq')::text, 6, '0'), $1, $2, $3, FALSE)
     ON CONFLICT (line_uid) DO UPDATE
       SET display_name = COALESCE(EXCLUDED.display_name, customers.display_name),
           picture_url  = COALESCE(EXCLUDED.picture_url, customers.picture_url),
           is_blocked   = FALSE
     RETURNING id`,
    [lineUid, displayName || lineUid, pictureUrl],
  );
  return result.rows[0].id;
}

function parseInboundMessage(event) {
  if (!event?.message) return '';
  if (event.message.type === 'text') return event.message.text || '';
  return `[${event.message.type}]`;
}

function parsePostbackData(data) {
  const params = new URLSearchParams(data || '');
  return {
    type: params.get('type') || '',
    action: params.get('action') || '',
    orderId: Number(params.get('orderId') || 0),
  };
}

router.post('/', async (req, res) => {
  const signature = req.headers['x-line-signature'];
  if (!verifySignature(req.body, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let payload;
  try {
    payload = JSON.parse(req.body.toString());
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  res.json({ ok: true }); // respond immediately

  for (const event of payload.events || []) {
    const eventId = event.webhookEventId || null;
    const eventType = event.type || 'unknown';
    const lineUid = event.source?.userId || null;

    try {
      if (eventId) {
        const dup = await pool.query(
          'SELECT 1 FROM webhook_events WHERE webhook_event_id = $1',
          [eventId],
        );
        if (dup.rowCount > 0) {
          await logWebhook({
            eventType,
            status: 'SKIPPED',
            webhookEventId: eventId,
            lineUid,
            payload: event,
            errorMessage: 'Duplicate webhook event',
          });
          continue;
        }

        await pool.query(
          'INSERT INTO webhook_events (webhook_event_id) VALUES ($1)',
          [eventId],
        );
      }

      if (eventType === 'follow' && lineUid) {
        const profile = await fetchLineProfile(lineUid);
        const customerId = await upsertCustomer(
          lineUid,
          profile?.displayName || lineUid,
          profile?.pictureUrl || null,
        );

        // Match the most recent UTM session where user clicked "Add LINE OA"
        // within the last 30 minutes and hasn't been linked yet
        await pool.query(
          `UPDATE utm_sessions
           SET line_uid = $1, linked_at = NOW()
           WHERE tracking_id = (
             SELECT tracking_id FROM utm_sessions
             WHERE follow_requested_at IS NOT NULL
               AND linked_at IS NULL
               AND follow_requested_at > NOW() - INTERVAL '30 minutes'
             ORDER BY follow_requested_at DESC
             LIMIT 1
           )`,
          [lineUid],
        );

        let lineError = null;
        try {
          await sendLineMessage(lineUid, [{ type: 'text', text: WELCOME_MESSAGE }]);
        } catch (err) {
          lineError = err.message;
        }

        await pool.query(
          `INSERT INTO message_logs (customer_id, template_type, message_text, line_error)
           VALUES ($1, 'WELCOME', $2, $3)`,
          [customerId, WELCOME_MESSAGE, lineError],
        );
      }

      if (eventType === 'unfollow' && lineUid) {
        await pool.query(
          'UPDATE customers SET is_blocked = TRUE WHERE line_uid = $1',
          [lineUid],
        );
      }

      if (eventType === 'message' && lineUid) {
        const profile = await fetchLineProfile(lineUid);
        const customerId = await upsertCustomer(
          lineUid,
          profile?.displayName || lineUid,
          profile?.pictureUrl || null,
        );
        const inboundText = parseInboundMessage(event);

        await pool.query(
          `INSERT INTO message_logs (customer_id, template_type, message_text, line_error)
           VALUES ($1, 'INBOUND', $2, NULL)`,
          [customerId, inboundText || '[empty]'],
        );
      }

      if (eventType === 'postback' && lineUid) {
        const parsed = parsePostbackData(event.postback?.data);
        if (parsed.type === 'ORDER_ACTION' && Number.isInteger(parsed.orderId) && parsed.orderId > 0) {
          const action = parsed.action === 'CONFIRM' ? 'CONFIRMED' : parsed.action === 'CANCEL' ? 'UNCONFIRMED' : '';
          if (action) {
            const update = await pool.query(
              `UPDATE orders o
               SET status = $1,
                   confirmed_at = CASE WHEN $1 = 'CONFIRMED' THEN NOW() ELSE NULL END
               FROM customers c
               WHERE o.customer_id = c.id
                 AND o.id = $2
                 AND c.line_uid = $3
                 AND o.status = 'PENDING'
               RETURNING o.id, o.order_code, o.status, o.customer_id`,
              [action, parsed.orderId, lineUid],
            );

            if (update.rowCount > 0) {
              const order = update.rows[0];
              const ackText = action === 'CONFIRMED'
                ? `ยืนยันคำสั่งซื้อเรียบร้อยแล้ว\nเลขที่: ${order.order_code}`
                : `ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว\nเลขที่: ${order.order_code}`;
              await sendLineMessage(lineUid, [{ type: 'text', text: ackText }]);
              await pool.query(
                `INSERT INTO message_logs (customer_id, order_id, template_type, message_text, line_error)
                 VALUES ($1, $2, 'ORDER_ACTION', $3, NULL)`,
                [order.customer_id, order.id, ackText],
              );
            } else {
              await sendLineMessage(lineUid, [{ type: 'text', text: 'ไม่พบคำสั่งซื้อที่รอดำเนินการ หรือทำรายการไปแล้ว' }]);
            }
          }
        }
      }

      await logWebhook({
        eventType,
        status: 'SUCCESS',
        webhookEventId: eventId,
        lineUid,
        payload: event,
      });
    } catch (err) {
      console.error('[webhook] event processing error:', err);
      try {
        await logWebhook({
          eventType,
          status: 'FAILED',
          webhookEventId: eventId,
          lineUid,
          payload: event,
          errorMessage: err.message || String(err),
        });
      } catch (logErr) {
        console.error('[webhook] logging failed:', logErr);
      }
    }
  }
});

export default router;
