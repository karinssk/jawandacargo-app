import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from './auth.js';

const router = Router();

// GET /api/customers?date=YYYY-MM-DD&utm_source=...&page=1
router.get('/', requireAuth, async (req, res) => {
  try {
    const { date, utm_source, page = '1' } = req.query;
    const limit = 50;
    const offset = (Number(page) - 1) * limit;

    const conditions = [];
    const params = [];
    let idx = 1;

    if (date) {
      conditions.push(`DATE(c.created_at) = $${idx++}`);
      params.push(date);
    }
    if (utm_source) {
      conditions.push(`us.utm_source = $${idx++}`);
      params.push(utm_source);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT
        c.id, c.customer_code, c.line_uid, c.display_name, c.picture_url,
        c.source_type, c.is_blocked, c.created_at,
        us.utm_source, us.utm_medium, us.utm_campaign, us.utm_content, us.utm_term,
        us.linked_at
      FROM customers c
      LEFT JOIN utm_sessions us ON us.line_uid = c.line_uid
      ${where}
      ORDER BY c.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    params.push(limit, offset);

    const countSql = `
      SELECT COUNT(*) FROM customers c
      LEFT JOIN utm_sessions us ON us.line_uid = c.line_uid
      ${where}
    `;

    const [data, count] = await Promise.all([
      pool.query(sql, params),
      pool.query(countSql, params.slice(0, -2)),
    ]);

    res.json({
      customers: data.rows,
      total: Number(count.rows[0].count),
      page: Number(page),
      limit,
    });
  } catch (err) {
    console.error('[customers]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/customers/search?q=
router.get('/search', requireAuth, async (req, res) => {
  try {
    const q = req.query.q || '';
    const result = await pool.query(
      `SELECT id, customer_code, display_name, line_uid, picture_url
       FROM customers
       WHERE display_name ILIKE $1 OR customer_code ILIKE $1
       LIMIT 10`,
      [`%${q}%`],
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[customers/search]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/customers/:id  — full detail for customer detail page
router.get('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });

  try {
    const [custRes, sessionsRes, ordersRes, messagesRes] = await Promise.all([
      pool.query(
        `SELECT id, customer_code, line_uid, display_name, picture_url,
                source_type, is_blocked, created_at
         FROM customers WHERE id = $1`,
        [id],
      ),
      pool.query(
        `SELECT tracking_id, utm_source, utm_medium, utm_campaign,
                utm_content, utm_term, source_url, ip,
                follow_requested_at, linked_at, created_at
         FROM utm_sessions WHERE line_uid = (
           SELECT line_uid FROM customers WHERE id = $1
         )
         ORDER BY created_at DESC`,
        [id],
      ),
      pool.query(
        `SELECT id, order_code, template_type, account_type,
                amount, exchange_rate, exchange_rate_currency, total_amount, status, stage,
                expires_at, confirmed_at, created_at
         FROM orders WHERE customer_id = $1 AND parent_order_id IS NULL
         ORDER BY created_at DESC`,
        [id],
      ),
      pool.query(
        `SELECT id, order_id, template_type, message_text, line_error, sent_at
         FROM message_logs WHERE customer_id = $1
         ORDER BY sent_at DESC`,
        [id],
      ),
    ]);

    if (custRes.rowCount === 0) return res.status(404).json({ error: 'Not found' });

    res.json({
      customer: custRes.rows[0],
      sessions: sessionsRes.rows,
      orders: ordersRes.rows,
      messages: messagesRes.rows,
    });
  } catch (err) {
    console.error('[customers/:id]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/customers/:id/code
router.patch('/:id/code', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });

  const { customer_code } = req.body;
  if (!customer_code || typeof customer_code !== 'string') {
    return res.status(400).json({ error: 'customer_code is required' });
  }
  const code = customer_code.trim().toUpperCase();
  if (!code) return res.status(400).json({ error: 'customer_code cannot be empty' });

  try {
    const result = await pool.query(
      'UPDATE customers SET customer_code = $1 WHERE id = $2 RETURNING id, customer_code',
      [code, id],
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Customer code already exists' });
    console.error('[customers/:id/code]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
