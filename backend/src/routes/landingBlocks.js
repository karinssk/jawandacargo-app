import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from './auth.js';

const router = Router();
const ALLOWED_TYPES = [
  'image',
  'add_friend',
  'hero-full-width',
  'hero-full-width-btn-left',
  'add_friend_banner',
  'add_friend_card',
  'hero-with-dynamic-add-line',
];

function toNullableText(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function toPercent(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(95, Math.max(0, parsed));
}

// GET /api/landing-blocks — public, active blocks sorted
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, type, image_url, label, button_url, button_left_pct, button_top_pct, button_width_pct, sort_order
       FROM landing_blocks
       WHERE is_active = TRUE
       ORDER BY sort_order ASC, id ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error('[landing-blocks GET]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/landing-blocks/all — admin, all blocks
router.get('/all', requireAuth, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, type, image_url, label, button_url, button_left_pct, button_top_pct, button_width_pct, sort_order, is_active, created_at
       FROM landing_blocks
       ORDER BY sort_order ASC, id ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error('[landing-blocks GET /all]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/landing-blocks — admin, create block
router.post('/', requireAuth, async (req, res) => {
  try {
    const { type, image_url, label, button_url, button_left_pct, button_top_pct, button_width_pct } = req.body;
    if (!type || !ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({ error: 'Invalid type' });
    }
    const { rows: maxRows } = await pool.query(
      `SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM landing_blocks`
    );
    const sort_order = maxRows[0].next_order;
    const leftPct = toPercent(button_left_pct, 50);
    const topPct = toPercent(button_top_pct, 44);
    const widthPct = toPercent(button_width_pct, 42);
    const { rows } = await pool.query(
      `INSERT INTO landing_blocks (type, image_url, label, button_url, button_left_pct, button_top_pct, button_width_pct, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        type,
        toNullableText(image_url),
        toNullableText(label),
        toNullableText(button_url),
        leftPct,
        topPct,
        widthPct,
        sort_order,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[landing-blocks POST]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/landing-blocks/reorder — admin, reorder blocks
router.put('/reorder', requireAuth, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids must be array' });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (let i = 0; i < ids.length; i++) {
        await client.query(
          `UPDATE landing_blocks SET sort_order = $1 WHERE id = $2`,
          [i, ids[i]]
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('[landing-blocks PUT /reorder]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/landing-blocks/:id — admin, update block (dynamic fields)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const sets = [];
    const params = [id];
    let idx = 2;

    if ('type' in body && body.type) {
      if (!ALLOWED_TYPES.includes(body.type)) return res.status(400).json({ error: 'Invalid type' });
      sets.push(`type = $${idx++}`);
      params.push(body.type);
    }
    if ('image_url' in body) { sets.push(`image_url = $${idx++}`); params.push(toNullableText(body.image_url)); }
    if ('label' in body) { sets.push(`label = $${idx++}`); params.push(toNullableText(body.label)); }
    if ('button_url' in body) { sets.push(`button_url = $${idx++}`); params.push(toNullableText(body.button_url)); }
    if ('button_left_pct' in body) { sets.push(`button_left_pct = $${idx++}`); params.push(toPercent(body.button_left_pct, 50)); }
    if ('button_top_pct' in body) { sets.push(`button_top_pct = $${idx++}`); params.push(toPercent(body.button_top_pct, 44)); }
    if ('button_width_pct' in body) { sets.push(`button_width_pct = $${idx++}`); params.push(toPercent(body.button_width_pct, 42)); }
    if ('is_active' in body) { sets.push(`is_active = $${idx++}`); params.push(body.is_active); }

    if (sets.length === 0) return res.status(400).json({ error: 'No fields to update' });

    const { rows } = await pool.query(
      `UPDATE landing_blocks SET ${sets.join(', ')} WHERE id = $1 RETURNING *`,
      params
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[landing-blocks PUT /:id]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/landing-blocks/:id — admin
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM landing_blocks WHERE id = $1`, [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('[landing-blocks DELETE /:id]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
