import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db.js';
import { requireAuth } from './auth.js';

const router = Router();

function normalizeNullableText(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const cleaned = String(value).trim();
  return cleaned.length ? cleaned : null;
}

const CreateSchema = z.object({
  code: z.string().min(1).max(40),
  label: z.string().min(1).max(120),
  account_name: z.string().max(200).nullable().optional(),
  account_number: z.string().max(120).nullable().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

const UpdateSchema = z.object({
  label: z.string().min(1).max(120).optional(),
  account_name: z.string().max(200).nullable().optional(),
  account_number: z.string().max(120).nullable().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

router.get('/', requireAuth, async (_req, res) => {
  try {
    const data = await pool.query(
      `SELECT id, code, label, account_name, account_number, is_active, sort_order, updated_at
       FROM account_types
       ORDER BY sort_order ASC, id ASC`,
    );
    res.json({ accountTypes: data.rows });
  } catch (err) {
    console.error('[account-types/get]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const parsed = CreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data = parsed.data;
  const accountName = normalizeNullableText(data.account_name);
  const accountNumber = normalizeNullableText(data.account_number);

  try {
    const result = await pool.query(
      `INSERT INTO account_types (code, label, account_name, account_number, is_active, sort_order, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,NOW())
       RETURNING id, code, label, account_name, account_number, is_active, sort_order, updated_at`,
      [
        data.code.toUpperCase(),
        data.label,
        accountName ?? null,
        accountNumber ?? null,
        data.is_active ?? true,
        data.sort_order ?? 0,
      ],
    );
    res.json({ ok: true, accountType: result.rows[0] });
  } catch (err) {
    console.error('[account-types/post]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });
  const parsed = UpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data = parsed.data;
  const accountName = normalizeNullableText(data.account_name);
  const accountNumber = normalizeNullableText(data.account_number);

  try {
    const before = await pool.query('SELECT * FROM account_types WHERE id = $1', [id]);
    if (before.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    const row = before.rows[0];
    const result = await pool.query(
      `UPDATE account_types
       SET label = $1,
           account_name = $2,
           account_number = $3,
           is_active = $4,
           sort_order = $5,
           updated_at = NOW()
       WHERE id = $6
       RETURNING id, code, label, account_name, account_number, is_active, sort_order, updated_at`,
      [
        data.label ?? row.label,
        accountName !== undefined ? accountName : row.account_name,
        accountNumber !== undefined ? accountNumber : row.account_number,
        data.is_active ?? row.is_active,
        data.sort_order ?? row.sort_order,
        id,
      ],
    );
    res.json({ ok: true, accountType: result.rows[0] });
  } catch (err) {
    console.error('[account-types/put]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });
  try {
    const result = await pool.query('DELETE FROM account_types WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[account-types/delete]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
