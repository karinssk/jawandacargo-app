import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// Called just before the user is redirected to the LINE OA add-friend page.
// Stamps follow_requested_at so the follow webhook can match this session.
router.post('/', async (req, res) => {
  const { trackingId } = req.body;
  if (!trackingId) {
    return res.status(400).json({ error: 'trackingId required' });
  }

  try {
    await pool.query(
      `UPDATE utm_sessions
       SET follow_requested_at = NOW()
       WHERE tracking_id = $1`,
      [trackingId],
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('[pre-follow]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
