import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db.js';
import { requireAuth } from './auth.js';

const router = Router();

const TemplateSchema = z.object({
  template_type: z.enum(['INVOICE', 'IMPORT_INVOICE', 'CONFIRM', 'RECEIPT']),
  display_name: z.string().min(1),
  accent_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  subtitle: z.string().nullable().optional(),
  footer_note: z.string().nullable().optional(),
  is_active: z.boolean(),
});

router.get('/', requireAuth, async (_req, res) => {
  try {
    const data = await pool.query(
      `SELECT template_type, display_name, accent_color, subtitle, footer_note, is_active, updated_at
       FROM template_configs
       ORDER BY template_type`,
    );
    res.json({ templates: data.rows });
  } catch (err) {
    console.error('[templates/get]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:templateType', requireAuth, async (req, res) => {
  const templateType = String(req.params.templateType || '').toUpperCase();
  const parse = TemplateSchema.safeParse({
    ...req.body,
    template_type: templateType,
  });
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.flatten() });
  }

  const data = parse.data;

  try {
    const result = await pool.query(
      `UPDATE template_configs
       SET display_name = $1,
           accent_color = $2,
           subtitle = $3,
           footer_note = $4,
           is_active = $5,
           updated_at = NOW()
       WHERE template_type = $6
       RETURNING template_type, display_name, accent_color, subtitle, footer_note, is_active, updated_at`,
      [data.display_name, data.accent_color, data.subtitle || null, data.footer_note || null, data.is_active, data.template_type],
    );

    if (result.rowCount === 0) return res.status(404).json({ error: 'Template not found' });
    res.json({ ok: true, template: result.rows[0] });
  } catch (err) {
    console.error('[templates/put]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
