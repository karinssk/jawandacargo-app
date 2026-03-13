import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from './auth.js';

const router = Router();

// GET /api/site-config/:key — public
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { rows } = await pool.query(
      `SELECT value FROM site_config WHERE key = $1`,
      [key]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0].value);
  } catch (err) {
    console.error('[site-config GET]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/site-config/:key — admin, upsert
router.put('/:key', requireAuth, async (req, res) => {
  try {
    const { key } = req.params;
    const value = req.body;
    if (!value || typeof value !== 'object') {
      return res.status(400).json({ error: 'Body must be a JSON object' });
    }
    const { rows } = await pool.query(
      `INSERT INTO site_config (key, value, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (key) DO UPDATE
         SET value = EXCLUDED.value, updated_at = NOW()
       RETURNING *`,
      [key, JSON.stringify(value)]
    );
    res.json(rows[0].value);
  } catch (err) {
    console.error('[site-config PUT]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
