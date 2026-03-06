import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from './auth.js';

const router = Router();

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
      ${where}
      ORDER BY o.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    params.push(limit, offset);

    const countSql = `
      SELECT COUNT(*) FROM orders o
      LEFT JOIN customers c ON c.id = o.customer_id
      ${where}
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

// GET /api/orders/:id  — full order detail
router.get('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });

  try {
    const [orderRes, messagesRes] = await Promise.all([
      pool.query(
        `SELECT o.*,
                c.id AS customer_id, c.customer_code, c.display_name,
                c.picture_url, c.line_uid, c.is_blocked
         FROM orders o
         LEFT JOIN customers c ON c.id = o.customer_id
         WHERE o.id = $1`,
        [id],
      ),
      pool.query(
        `SELECT id, template_type, message_text, line_error, sent_at
         FROM message_logs WHERE order_id = $1
         ORDER BY sent_at ASC`,
        [id],
      ),
    ]);

    if (orderRes.rowCount === 0) return res.status(404).json({ error: 'Not found' });

    res.json({ order: orderRes.rows[0], messages: messagesRes.rows });
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
           confirmed_at = NOW()
       WHERE id = $1 AND status = 'PENDING'
       RETURNING id, status, confirmed_at`,
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
       WHERE id = $1 AND status = 'PENDING'
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

export default router;
