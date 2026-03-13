import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.post('/', async (req, res) => {
  const {
    utm_source, utm_medium, utm_campaign, utm_content, utm_term,
    fbclid,
    source_url,
  } = req.body;

  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim()
    || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'] || '';
  const liffId = process.env.LIFF_ID || '';
  console.log('[visit] LIFF_ID:', liffId || 'UNDEFINED/EMPTY');

  try {
    const result = await pool.query(
      `INSERT INTO utm_sessions
         (utm_source, utm_medium, utm_campaign, utm_content, utm_term, fbclid, source_url, ip, user_agent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING tracking_id`,
      [utm_source, utm_medium, utm_campaign, utm_content, utm_term, fbclid || null, source_url, ip, userAgent],
    );

    const { tracking_id } = result.rows[0];
    const liffUrl = `https://liff.line.me/${liffId}?tid=${tracking_id}`;

    res.json({ trackingId: tracking_id, liffUrl });
  } catch (err) {
    console.error('[visit] DB error:', err.message, err.code);
    // Return fallback liffUrl without tracking so the page still works
    const liffUrl = `https://liff.line.me/${liffId}`;
    res.json({ liffUrl });
  }
});

export default router;
