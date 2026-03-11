import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db.js';
import { requireAuth } from './auth.js';

const router = Router();
const LifecycleSchema = z.object({
  stage: z.enum([
    'WAITING_ORDER_CONFIRMATION',
    'ORDER_CONFIRMED',
    'SELLER_SHIPPED',
    'WAREHOUSE_RECEIVED',
    'IMPORT_INVOICE_SENT',
    'IMPORT_PAID',
    'READY_FOR_DISPATCH',
    'PICKUP_SCHEDULED',
    'DISPATCHED',
    'COMPLETED',
  ]),
  sellerTrackingNo: z.string().trim().max(120).optional().or(z.literal('')),
  thaiWarehouseReceivedAt: z.string().trim().max(40).optional().or(z.literal('')),
  deliveryMethod: z.enum(['PICKUP', 'DELIVERY']).optional().or(z.literal('')),
  deliveryProvider: z.string().trim().max(120).optional().or(z.literal('')),
  deliveryTrackingNo: z.string().trim().max(120).optional().or(z.literal('')),
  deliveryNote: z.string().trim().max(500).optional().or(z.literal('')),
});

// GET /api/orders?customer_code=&date=&status=&page=1
router.get('/', requireAuth, async (req, res) => {
  try {
    const { customer_code, date, status, page = '1' } = req.query;
    const limit = 50;
    const offset = (Number(page) - 1) * limit;

    const conditions = [];
    const params = [];
    let idx = 1;

    if (customer_code) {
      conditions.push(`c.customer_code = $${idx++}`);
      params.push(customer_code);
    }
    if (date) {
      conditions.push(`DATE(o.created_at) = $${idx++}`);
      params.push(date);
    }
    if (status) {
      conditions.push(`o.status = $${idx++}`);
      params.push(status);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT o.*, c.customer_code, c.display_name
      FROM orders o
      LEFT JOIN customers c ON c.id = o.customer_id
      ${where ? `${where} AND o.parent_order_id IS NULL` : 'WHERE o.parent_order_id IS NULL'}
      ORDER BY o.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    params.push(limit, offset);

    const countSql = `
      SELECT COUNT(*) FROM orders o
      LEFT JOIN customers c ON c.id = o.customer_id
      ${where ? `${where} AND o.parent_order_id IS NULL` : 'WHERE o.parent_order_id IS NULL'}
    `;

    const [data, count] = await Promise.all([
      pool.query(sql, params),
      pool.query(countSql, params.slice(0, -2)),
    ]);

    res.json({
      orders: data.rows,
      total: Number(count.rows[0].count),
      page: Number(page),
      limit,
    });
  } catch (err) {
    console.error('[orders]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/orders/export?customer_code=&date=&status=&template_type=
router.get('/export', requireAuth, async (req, res) => {
  try {
    const { customer_code, date, status, template_type } = req.query;

    const conditions = [];
    const params = [];
    let idx = 1;

    if (customer_code) {
      conditions.push(`c.customer_code ILIKE $${idx++}`);
      params.push(`%${customer_code}%`);
    }
    if (date) {
      conditions.push(`DATE(o.created_at) = $${idx++}`);
      params.push(date);
    }
    if (status) {
      conditions.push(`o.status = $${idx++}`);
      params.push(status);
    }
    if (template_type) {
      conditions.push(`o.template_type = $${idx++}`);
      params.push(template_type);
    }

    const where = conditions.length
      ? `WHERE ${conditions.join(' AND ')} AND o.parent_order_id IS NULL`
      : 'WHERE o.parent_order_id IS NULL';

    const result = await pool.query(
      `SELECT o.order_code, c.customer_code, c.display_name,
              o.template_type, o.account_type,
              o.amount, o.exchange_rate, o.exchange_rate_currency,
              o.total_amount, o.status, o.stage,
              o.seller_tracking_no, o.delivery_tracking_no,
              o.confirmed_at, o.created_at
       FROM orders o
       LEFT JOIN customers c ON c.id = o.customer_id
       ${where}
       ORDER BY o.created_at DESC`,
      params,
    );

    res.json({ ok: true, orders: result.rows });
  } catch (err) {
    console.error('[orders/export]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/orders/:id  — full order detail
router.get('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });

  try {
    const [orderRes, messagesRes, documentsRes] = await Promise.all([
      pool.query(
        `SELECT o.*,
                c.id AS customer_id, c.customer_code, c.display_name,
                c.picture_url, c.line_uid, c.is_blocked
         FROM orders o
         LEFT JOIN customers c ON c.id = o.customer_id
         WHERE o.id = $1 AND o.parent_order_id IS NULL`,
        [id],
      ),
      pool.query(
        `SELECT id, order_id, template_type, message_text, line_error, sent_at
         FROM message_logs
         WHERE order_id = $1
            OR order_id IN (SELECT id FROM orders WHERE parent_order_id = $1)
         ORDER BY sent_at ASC`,
        [id],
      ),
      pool.query(
        `SELECT id, order_code, template_type, account_type, amount, exchange_rate,
                exchange_rate_currency, total_amount, status, stage,
                created_at, confirmed_at
         FROM orders
         WHERE parent_order_id = $1
         ORDER BY created_at ASC`,
        [id],
      ),
    ]);

    if (orderRes.rowCount === 0) return res.status(404).json({ error: 'Not found' });

    res.json({ order: orderRes.rows[0], messages: messagesRes.rows, documents: documentsRes.rows });
  } catch (err) {
    console.error('[orders/:id]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/orders/:id/confirm
router.post('/:id/confirm', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const result = await pool.query(
      `UPDATE orders
       SET status = 'CONFIRMED',
           stage = 'ORDER_CONFIRMED',
           confirmed_at = NOW()
       WHERE id = $1 AND status = 'PENDING' AND parent_order_id IS NULL
       RETURNING id, status, stage, confirmed_at`,
      [id],
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Order not found or not pending' });
    res.json({ ok: true, order: result.rows[0] });
  } catch (err) {
    console.error('[orders/confirm]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/orders/:id/cancel
router.post('/:id/cancel', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const result = await pool.query(
      `UPDATE orders
       SET status = 'UNCONFIRMED'
       WHERE id = $1 AND status = 'PENDING' AND parent_order_id IS NULL
       RETURNING id, status`,
      [id],
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Order not found or not pending' });
    res.json({ ok: true, order: result.rows[0] });
  } catch (err) {
    console.error('[orders/cancel]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/lifecycle', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const parsed = LifecycleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const data = parsed.data;

  try {
    const result = await pool.query(
      `UPDATE orders
       SET stage = $2,
           seller_tracking_no = NULLIF($3, ''),
           seller_tracking_added_at = CASE WHEN NULLIF($3, '') IS NOT NULL THEN NOW() ELSE seller_tracking_added_at END,
           thai_warehouse_received_at = NULLIF($4, '')::timestamptz,
           delivery_method = NULLIF($5, ''),
           delivery_provider = NULLIF($6, ''),
           delivery_tracking_no = NULLIF($7, ''),
           delivery_note = NULLIF($8, ''),
           delivery_updated_at = NOW()
       WHERE id = $1 AND parent_order_id IS NULL
       RETURNING id, stage, seller_tracking_no, thai_warehouse_received_at,
                 delivery_method, delivery_provider, delivery_tracking_no, delivery_note, delivery_updated_at`,
      [
        id,
        data.stage,
        data.sellerTrackingNo || '',
        data.thaiWarehouseReceivedAt || '',
        data.deliveryMethod || '',
        data.deliveryProvider || '',
        data.deliveryTrackingNo || '',
        data.deliveryNote || '',
      ],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ ok: true, order: result.rows[0] });
  } catch (err) {
    console.error('[orders/lifecycle]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
