import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

async function logLinkEvent(status, payload, errorMessage = null) {
  await pool.query(
    `INSERT INTO webhook_logs
       (source, event_type, status, line_uid, payload, error_message)
     VALUES ('LIFF_LINK', 'LINK_COMPLETE', $1, $2, $3, $4)`,
    [status, payload?.lineUid || null, payload, errorMessage],
  );
}

router.post('/', async (req, res) => {
  const { trackingId, lineUid, displayName, pictureUrl } = req.body;
  if (!trackingId || !lineUid) {
    return res.status(400).json({ error: 'trackingId and lineUid required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const upsertResult = await client.query(
      `INSERT INTO customers (customer_code, line_uid, display_name, picture_url)
       VALUES ('JWD-' || LPAD(nextval('customer_seq')::text, 6, '0'), $1, $2, $3)
       ON CONFLICT (line_uid) DO UPDATE
         SET display_name = EXCLUDED.display_name,
             picture_url  = EXCLUDED.picture_url
       RETURNING id`,
      [lineUid, displayName, pictureUrl],
    );
    const { id: customerId } = upsertResult.rows[0];

    await client.query(
      `UPDATE utm_sessions
       SET line_uid = $1, linked_at = NOW()
       WHERE tracking_id = $2`,
      [lineUid, trackingId],
    );

    await client.query('COMMIT');

    await logLinkEvent('SUCCESS', { trackingId, lineUid, customerId });
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[link]', err);

    try {
      await logLinkEvent(
        'FAILED',
        { trackingId, lineUid, displayName, pictureUrl },
        err.message || String(err),
      );
    } catch (logErr) {
      console.error('[link] log failed', logErr);
    }

    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

export default router;
