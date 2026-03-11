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
  body_intro_text: z.string().nullable().optional(),
  body_intro_color: hexColor,
  footer_text_color: hexColor,
  separator_color: hexColor,
  footer_separator_color: hexColor,
  subtitle: z.string().nullable().optional(),
  footer_note: z.string().nullable().optional(),
  button_confirm_label: z.string().nullable().optional(),
  button_confirm_color: hexColor,
  button_cancel_label: z.string().nullable().optional(),
  button_receipt_label: z.string().nullable().optional(),
  button_receipt_url: z.string().nullable().optional(),
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
              body_label_color, body_text_color, body_intro_text, body_intro_color, footer_text_color,
              separator_color, footer_separator_color,
              subtitle, footer_note,
              button_confirm_label, button_confirm_color, button_cancel_label,
              button_receipt_label, button_receipt_url,
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
           body_intro_text = $6,
           body_intro_color = $7,
           footer_text_color = $8,
           separator_color = $9,
           footer_separator_color = $10,
           subtitle = $11,
           footer_note = $12,
           button_confirm_label = $13,
           button_confirm_color = $14,
           button_cancel_label = $15,
           button_receipt_label = $16,
           button_receipt_url = $17,
           detail_order_code_label = $18,
           detail_document_type_label = $19,
           detail_account_type_label = $20,
           detail_account_name_label = $21,
           detail_account_number_label = $22,
           detail_amount_label = $23,
           detail_exchange_rate_label = $24,
           detail_total_label = $25,
           detail_vat_label = $26,
           detail_withholding_label = $27,
           detail_net_total_label = $28,
           is_active = $29,
           updated_at = NOW()
       WHERE template_type = $30
       RETURNING template_type, display_name, accent_color, header_text_color,
                 body_label_color, body_text_color, body_intro_text, body_intro_color, footer_text_color,
                 separator_color, footer_separator_color,
                 subtitle, footer_note,
                 button_confirm_label, button_confirm_color, button_cancel_label,
                 button_receipt_label, button_receipt_url,
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
        data.body_intro_text || null,
        data.body_intro_color,
        data.footer_text_color,
        data.separator_color,
        data.footer_separator_color,
        data.subtitle || null,
        data.footer_note || null,
        data.button_confirm_label || null,
        data.button_confirm_color,
        data.button_cancel_label || null,
        data.button_receipt_label || null,
        data.button_receipt_url || null,
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
