import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db.js';
import { requireAuth } from './auth.js';

const router = Router();
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);

const TemplateSchema = z.object({
  template_type: z.enum(['IMPORT_INVOICE', 'CONFIRM', 'RECEIPT']),
  display_name: z.string().min(1),
  accent_color: hexColor,
  header_text_color: hexColor,
  body_label_color: hexColor,
  body_text_color: hexColor,
  footer_text_color: hexColor,
  separator_color: hexColor,
  footer_separator_color: hexColor,
  subtitle: z.string().nullable().optional(),
  footer_note: z.string().nullable().optional(),
  button_confirm_label: z.string().nullable().optional(),
  button_confirm_color: hexColor,
  button_cancel_label: z.string().nullable().optional(),
  detail_order_code_label: z.string().min(1),
  detail_document_type_label: z.string().min(1),
  detail_account_type_label: z.string().min(1),
  detail_account_name_label: z.string().min(1),
  detail_account_number_label: z.string().min(1),
  detail_amount_label: z.string().min(1),
  detail_exchange_rate_label: z.string().min(1),
  detail_total_label: z.string().min(1),
  detail_vat_label: z.string().min(1),
  detail_withholding_label: z.string().min(1),
  detail_net_total_label: z.string().min(1),
  is_active: z.boolean(),
});

router.get('/', requireAuth, async (_req, res) => {
  try {
    const data = await pool.query(
      `SELECT template_type, display_name, accent_color, header_text_color,
              body_label_color, body_text_color, footer_text_color,
              separator_color, footer_separator_color,
              subtitle, footer_note,
              button_confirm_label, button_confirm_color, button_cancel_label,
              detail_order_code_label, detail_document_type_label,
              detail_account_type_label, detail_account_name_label, detail_account_number_label,
              detail_amount_label, detail_exchange_rate_label, detail_total_label,
              detail_vat_label, detail_withholding_label, detail_net_total_label,
              is_active, updated_at
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
           header_text_color = $3,
           body_label_color = $4,
           body_text_color = $5,
           footer_text_color = $6,
           separator_color = $7,
           footer_separator_color = $8,
           subtitle = $9,
           footer_note = $10,
           button_confirm_label = $11,
           button_confirm_color = $12,
           button_cancel_label = $13,
           detail_order_code_label = $14,
           detail_document_type_label = $15,
           detail_account_type_label = $16,
           detail_account_name_label = $17,
           detail_account_number_label = $18,
           detail_amount_label = $19,
           detail_exchange_rate_label = $20,
           detail_total_label = $21,
           detail_vat_label = $22,
           detail_withholding_label = $23,
           detail_net_total_label = $24,
           is_active = $25,
           updated_at = NOW()
       WHERE template_type = $26
       RETURNING template_type, display_name, accent_color, header_text_color,
                 body_label_color, body_text_color, footer_text_color,
                 separator_color, footer_separator_color,
                 subtitle, footer_note,
                 button_confirm_label, button_confirm_color, button_cancel_label,
                 detail_order_code_label, detail_document_type_label,
                 detail_account_type_label, detail_account_name_label, detail_account_number_label,
                 detail_amount_label, detail_exchange_rate_label, detail_total_label,
                 detail_vat_label, detail_withholding_label, detail_net_total_label,
                 is_active, updated_at`,
      [
        data.display_name,
        data.accent_color,
        data.header_text_color,
        data.body_label_color,
        data.body_text_color,
        data.footer_text_color,
        data.separator_color,
        data.footer_separator_color,
        data.subtitle || null,
        data.footer_note || null,
        data.button_confirm_label || null,
        data.button_confirm_color,
        data.button_cancel_label || null,
        data.detail_order_code_label,
        data.detail_document_type_label,
        data.detail_account_type_label,
        data.detail_account_name_label,
        data.detail_account_number_label,
        data.detail_amount_label,
        data.detail_exchange_rate_label,
        data.detail_total_label,
        data.detail_vat_label,
        data.detail_withholding_label,
        data.detail_net_total_label,
        data.is_active,
        data.template_type,
      ],
    );

    if (result.rowCount === 0) return res.status(404).json({ error: 'Template not found' });
    res.json({ ok: true, template: result.rows[0] });
  } catch (err) {
    console.error('[templates/put]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
