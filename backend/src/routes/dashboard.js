import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from './auth.js';

const router = Router();

router.get('/stats', requireAuth, async (_req, res) => {
  try {
    const [summary, recentCustomers, pendingOrders, recentMessages, utmSources] = await Promise.all([
      pool.query(`
        SELECT
          (SELECT COUNT(*) FROM customers)                                                   AS total_customers,
          (SELECT COUNT(*) FROM customers WHERE DATE(created_at) = CURRENT_DATE)            AS new_today,
          (SELECT COUNT(*) FROM orders WHERE status = 'PENDING')                            AS pending_orders,
          (SELECT COUNT(*) FROM orders WHERE status = 'CONFIRMED')                          AS confirmed_orders,
          (SELECT COUNT(*) FROM orders)                                                      AS total_orders,
          (SELECT COALESCE(SUM(total_amount),0) FROM orders WHERE status = 'CONFIRMED')     AS total_revenue,
          (SELECT COUNT(*) FROM message_logs WHERE DATE(sent_at) = CURRENT_DATE)            AS messages_today,
          (SELECT COUNT(*) FROM message_logs)                                                AS total_messages
      `),

      pool.query(`
        SELECT c.id, c.customer_code, c.display_name, c.picture_url, c.is_blocked, c.created_at,
               us.utm_source, us.utm_campaign
        FROM customers c
        LEFT JOIN utm_sessions us ON us.line_uid = c.line_uid
        ORDER BY c.created_at DESC
        LIMIT 5
      `),

      pool.query(`
        SELECT o.id, o.order_code, o.template_type, o.total_amount, o.created_at, o.expires_at,
               c.display_name, c.picture_url, c.customer_code
        FROM orders o
        LEFT JOIN customers c ON c.id = o.customer_id
        WHERE o.status = 'PENDING'
        ORDER BY o.created_at DESC
        LIMIT 8
      `),

      pool.query(`
        SELECT ml.id, ml.template_type, ml.message_text, ml.line_error, ml.sent_at,
               c.display_name, c.picture_url
        FROM message_logs ml
        LEFT JOIN customers c ON c.id = ml.customer_id
        ORDER BY ml.sent_at DESC
        LIMIT 5
      `),

      pool.query(`
        SELECT utm_source, COUNT(*) AS count
        FROM utm_sessions
        WHERE utm_source IS NOT NULL AND utm_source <> ''
        GROUP BY utm_source
        ORDER BY count DESC
        LIMIT 6
      `),
    ]);

    const row = summary.rows[0];
    res.json({
      stats: {
        totalCustomers:  Number(row.total_customers),
        newToday:        Number(row.new_today),
        pendingOrders:   Number(row.pending_orders),
        confirmedOrders: Number(row.confirmed_orders),
        totalOrders:     Number(row.total_orders),
        totalRevenue:    Number(row.total_revenue),
        messagesToday:   Number(row.messages_today),
        totalMessages:   Number(row.total_messages),
      },
      recentCustomers: recentCustomers.rows,
      pendingOrders:   pendingOrders.rows,
      recentMessages:  recentMessages.rows,
      utmSources:      utmSources.rows,
    });
  } catch (err) {
    console.error('[dashboard]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
