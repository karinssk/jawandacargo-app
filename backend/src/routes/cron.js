import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

function requireCronSecret(req, res, next) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.authorization || '';
  if (secret && auth !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// POST /api/cron/expire-orders
router.post('/expire-orders', requireCronSecret, async (_req, res) => {
  try {
    const result = await pool.query(
      `UPDATE orders
       SET status = 'UNCONFIRMED'
       WHERE status = 'PENDING' AND expires_at < NOW()
       RETURNING id`,
    );
    res.json({ expired: result.rowCount, ids: result.rows.map((r) => r.id) });
  } catch (err) {
    console.error('[cron/expire-orders]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
