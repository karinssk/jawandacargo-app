import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db.js';
import { requireAuth } from './auth.js';

const router = Router();
const LEGACY_RECEIPT_FOOTER = 'ใบเสร็จสำหรับรายการที่ยืนยันแล้ว';
const RECEIPT_FOOTER_DEFAULT = 'End-to-End Logistics Partner';

const SendSchema = z.object({
  customerId: z.number().int().positive(),
  templateType: z.enum(['IMPORT_INVOICE', 'CONFIRM', 'RECEIPT']),
  customMode: z.boolean().optional(),
  orderId: z.number().int().positive().optional(),
  accountType: z.string().optional(),
  customHeaderTitle: z.string().trim().max(200).optional(),
  customHeaderSubtitle: z.string().trim().max(200).optional(),
  bodyIntroText: z.string().trim().max(2000).optional(),
  bodyIntroColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  accountNote: z.string().trim().max(1000).optional(),
  footerNote: z.string().trim().max(1000).optional(),
  receiptButtonLabel: z.string().trim().max(200).optional(),
  receiptButtonUrl: z.string().trim().max(2000).optional(),
  amount: z.number().positive().optional(),
  exchangeRate: z.number().positive().optional(),
  exchangeRateCurrency: z.enum(['USD', 'CNY', 'THB']).optional(),
  totalAmount: z.number().positive().optional(),
  applyVat: z.boolean().optional(),
  applyWithholding: z.boolean().optional(),
  vatAmount: z.number().nonnegative().optional(),
  withholdingAmount: z.number().nonnegative().optional(),
  netTotal: z.number().nonnegative().optional(),
});

const TEMPLATE_META = {
  IMPORT_INVOICE: {
    title: 'ใบแจ้งหนี้นำเข้า',
    accent: '#1565c0',
    headerTextColor: '#ffffff',
    bodyLabelColor: '#6b7280',
    bodyTextColor: '#111827',
    footerTextColor: '#4b5563',
    separatorColor: '#f3f4f6',
    footerSeparatorColor: '#e5e7eb',
    codePrefix: 'IMPORT INVOICE',
    footer: 'กรุณาชำระค่าใช้จ่ายนำเข้าตามบิลนี้',
    buttonConfirmLabel: 'ยืนยัน',
    buttonConfirmColor: '#16a34a',
    buttonCancelLabel: 'ยกเลิก',
    detailLabels: {
      orderCode: 'เลขคำสั่งซื้อ',
      documentType: 'ประเภทเอกสาร',
      accountType: 'ประเภทบัญชี',
      accountName: 'ชื่อบัญชี',
      accountNumber: 'เลขบัญชี',
      amount: 'จำนวนเงิน',
      exchangeRate: 'อัตราแลกเปลี่ยน',
      total: 'ยอดฐาน',
      vat: 'VAT 7%',
      withholding: 'หัก ณ ที่จ่าย 3%',
      netTotal: 'ยอดสุทธิ',
    },
  },
  CONFIRM: {
    title: 'คำสั่งซื้อสินค้า',
    accent: '#2e7d32',
    headerTextColor: '#ffffff',
    bodyLabelColor: '#6b7280',
    bodyTextColor: '#111827',
    footerTextColor: '#4b5563',
    separatorColor: '#f3f4f6',
    footerSeparatorColor: '#e5e7eb',
    codePrefix: 'PURCHASE ORDER',
    footer: 'กรุณาตรวจสอบรายละเอียดและยืนยันคำสั่งซื้อ',
    buttonConfirmLabel: 'ยืนยัน',
    buttonConfirmColor: '#16a34a',
    buttonCancelLabel: 'ยกเลิก',
    detailLabels: {
      orderCode: 'เลขคำสั่งซื้อ',
      documentType: 'ประเภทเอกสาร',
      accountType: 'ประเภทบัญชี',
      accountName: 'ชื่อบัญชี',
      accountNumber: 'เลขบัญชี',
      amount: 'จำนวนเงิน',
      exchangeRate: 'อัตราแลกเปลี่ยน',
      total: 'ยอดฐาน',
      vat: 'VAT 7%',
      withholding: 'หัก ณ ที่จ่าย 3%',
      netTotal: 'ยอดสุทธิ',
    },
  },
  RECEIPT: {
    title: 'ใบเสร็จรับเงิน',
    accent: '#6a1b9a',
    headerTextColor: '#ffffff',
    bodyLabelColor: '#6b7280',
    bodyTextColor: '#111827',
    footerTextColor: '#4b5563',
    separatorColor: '#f3f4f6',
    footerSeparatorColor: '#e5e7eb',
    codePrefix: 'RECEIPT',
    footer: RECEIPT_FOOTER_DEFAULT,
    buttonConfirmLabel: 'ยืนยัน',
    buttonConfirmColor: '#16a34a',
    buttonCancelLabel: 'ยกเลิก',
    buttonReceiptLabel: 'คลิกที่นี้',
    buttonReceiptUrl: null,
    detailLabels: {
      orderCode: 'เลขคำสั่งซื้อ',
      documentType: 'ประเภทเอกสาร',
      accountType: 'ประเภทบัญชี',
      accountName: 'ชื่อบัญชี',
      accountNumber: 'เลขบัญชี',
      amount: 'จำนวนเงิน',
      exchangeRate: 'อัตราแลกเปลี่ยน',
      total: 'ยอดฐาน',
      vat: 'VAT 7%',
      withholding: 'หัก ณ ที่จ่าย 3%',
      netTotal: 'ยอดสุทธิ',
    },
  },
};

const ORDER_SOURCE_TEMPLATE = 'CONFIRM';
const STAGE_BY_TEMPLATE = {
  CONFIRM: 'WAITING_ORDER_CONFIRMATION',
  IMPORT_INVOICE: 'IMPORT_INVOICE_SENT',
  RECEIPT: 'READY_FOR_DISPATCH',
};

async function generateOrderCode(client, templateType) {
  const seq = await client.query("SELECT nextval('order_seq') AS val");
  const n = String(seq.rows[0].val).padStart(3, '0');
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const prefix = templateType === 'CONFIRM'
    ? 'PO'
    : templateType === 'IMPORT_INVOICE'
      ? 'IMP-INV'
      : 'RCPT';
  return `${prefix}-${yy}${mm}${dd}-${n}`;
}

async function pushLineMessage(lineUid, messages) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token || !lineUid) throw new Error('LINE not configured or no lineUid');
  const resp = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ to: lineUid, messages }),
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`LINE API error ${resp.status}: ${body}`);
  }
}

function fmtBaht(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} บาท`;
}

function fmtYuan(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} หยวน`;
}

function pickColor(value, fallback) {
  return /^#[0-9a-fA-F]{6}$/.test(value || '') ? value : fallback;
}

function interpolateTemplateText(value, context) {
  if (!value) return '';
  const customerRef = context.customerCode || context.customerName || '-';
  return String(value)
    .replace(/\{\{\s*customer_name\s*\}\}/gi, customerRef)
    .replace(/\{\{\s*customer_code\s*\}\}/gi, customerRef)
    .replace(/\{\{\s*net_total\s*\}\}/gi, fmtBaht(context.netTotal));
}

function buildFlexMessage(data, orderCode, orderId, cfg, accountMeta = null) {
  const baseMeta = TEMPLATE_META[data.templateType] || TEMPLATE_META.IMPORT_INVOICE;
  const rawFooter = [data.accountNote, data.footerNote].filter(Boolean).join('\n') || cfg?.footer_note || baseMeta.footer;
  const normalizedFooter = data.templateType === 'RECEIPT' && rawFooter === LEGACY_RECEIPT_FOOTER
    ? RECEIPT_FOOTER_DEFAULT
    : rawFooter;
  const meta = {
    title: cfg?.display_name || baseMeta.title,
    accent: pickColor(cfg?.accent_color, baseMeta.accent),
    headerTextColor: pickColor(cfg?.header_text_color, baseMeta.headerTextColor),
    bodyLabelColor: pickColor(cfg?.body_label_color, baseMeta.bodyLabelColor),
    bodyTextColor: pickColor(cfg?.body_text_color, baseMeta.bodyTextColor),
    bodyIntroText: data.bodyIntroText || cfg?.body_intro_text || null,
    bodyIntroColor: pickColor(data.bodyIntroColor, pickColor(cfg?.body_intro_color, '#0b57b7')),
    footerTextColor: pickColor(cfg?.footer_text_color, baseMeta.footerTextColor),
    separatorColor: pickColor(cfg?.separator_color, baseMeta.separatorColor),
    footerSeparatorColor: pickColor(cfg?.footer_separator_color, baseMeta.footerSeparatorColor),
    codePrefix: cfg?.subtitle || baseMeta.codePrefix,
    footer: normalizedFooter || (data.templateType === 'RECEIPT' ? RECEIPT_FOOTER_DEFAULT : baseMeta.footer),
    buttonConfirmLabel: cfg?.button_confirm_label || baseMeta.buttonConfirmLabel,
    buttonConfirmColor: pickColor(cfg?.button_confirm_color, baseMeta.buttonConfirmColor),
    buttonCancelLabel: cfg?.button_cancel_label || baseMeta.buttonCancelLabel,
    buttonReceiptLabel: data.receiptButtonLabel || cfg?.button_receipt_label || baseMeta.buttonReceiptLabel || 'คลิกที่นี้',
    buttonReceiptUrl: data.receiptButtonUrl || cfg?.button_receipt_url || baseMeta.buttonReceiptUrl || null,
    detailLabels: {
      orderCode: cfg?.detail_order_code_label || baseMeta.detailLabels.orderCode,
      documentType: cfg?.detail_document_type_label || baseMeta.detailLabels.documentType,
      accountType: cfg?.detail_account_type_label || baseMeta.detailLabels.accountType,
      accountName: cfg?.detail_account_name_label || baseMeta.detailLabels.accountName,
      accountNumber: cfg?.detail_account_number_label || baseMeta.detailLabels.accountNumber,
      amount: cfg?.detail_amount_label || baseMeta.detailLabels.amount,
      exchangeRate: cfg?.detail_exchange_rate_label || baseMeta.detailLabels.exchangeRate,
      total: cfg?.detail_total_label || baseMeta.detailLabels.total,
      vat: cfg?.detail_vat_label || baseMeta.detailLabels.vat,
      withholding: cfg?.detail_withholding_label || baseMeta.detailLabels.withholding,
      netTotal: cfg?.detail_net_total_label || baseMeta.detailLabels.netTotal,
    },
  };

  const exchangeRateLabel = typeof data.exchangeRate === 'number'
    ? `${parseFloat(data.exchangeRate.toFixed(2))} ${(data.exchangeRateCurrency || 'CNY')}`.trim()
    : '-';
  const isImportInvoice = data.templateType === 'IMPORT_INVOICE';
  const isCustomMessage = data.templateType === 'RECEIPT';
  const headerTitle = isCustomMessage
    ? (data.customHeaderTitle || 'Jawanda Cargo')
    : meta.title;
  const headerSubtitle = isCustomMessage
    ? (data.customHeaderSubtitle || 'นำเข้าสินค้าจากจีนแบบครบวงจร')
    : orderCode;
  const introText = interpolateTemplateText(meta.bodyIntroText, {
    customerName: data.customerName,
    customerCode: data.customerCode,
    netTotal: data.netTotal,
  });

  const amountText = data.templateType === 'IMPORT_INVOICE'
    ? fmtBaht(data.amount)
    : data.templateType === 'CONFIRM'
      ? fmtYuan(data.amount)
      : fmtBaht(data.amount);

  const rows = [];
  if (!isCustomMessage) {
    rows.push(
      [meta.detailLabels.orderCode, orderCode],
      [meta.detailLabels.documentType, meta.codePrefix],
      [meta.detailLabels.accountType, accountMeta?.label || data.accountType || '-'],
      [meta.detailLabels.accountName, accountMeta?.account_name || '-'],
      [meta.detailLabels.accountNumber, accountMeta?.account_number || '-'],
      [meta.detailLabels.amount, amountText],
    );
  }
  if (!isImportInvoice && !isCustomMessage) {
    rows.push(
      [meta.detailLabels.exchangeRate, exchangeRateLabel],
      [meta.detailLabels.total, fmtBaht(data.totalAmount)],
    );
  }

  if (!isCustomMessage) {
    if (data.applyVat) rows.push([meta.detailLabels.vat, fmtBaht(data.vatAmount || 0)]);
    if (data.applyWithholding) rows.push([meta.detailLabels.withholding, fmtBaht(data.withholdingAmount || 0)]);
    if (typeof data.netTotal === 'number') rows.push([meta.detailLabels.netTotal, fmtBaht(data.netTotal)]);
  }

  const bankNameLabel = meta.detailLabels.accountName;
  const bankNumberLabel = meta.detailLabels.accountNumber;
  const bankTypeLabel = meta.detailLabels.accountType;

  const contents = rows.flatMap(([label, value], i) => {
    const isBankInfo = label === bankTypeLabel || label === bankNameLabel || label === bankNumberLabel;
    const isNameOrNumber = label === bankNameLabel || label === bankNumberLabel;
    const isNetTotal = label === meta.detailLabels.netTotal;
    const row = {
      type: 'box',
      layout: 'baseline',
      spacing: 'sm',
      contents: [
        { type: 'text', text: label, color: meta.bodyLabelColor, size: isNetTotal ? 'md' : 'sm', flex: 4, weight: isBankInfo || isNetTotal ? 'bold' : 'regular' },
        {
          type: 'text',
          text: value,
          wrap: true,
          color: isNameOrNumber ? meta.accent : meta.bodyTextColor,
          size: isNameOrNumber ? 'md' : (isNetTotal ? 'lg' : 'sm'),
          flex: 6,
          align: 'end',
          weight: isNameOrNumber || isNetTotal ? 'bold' : 'regular',
          decoration: isNameOrNumber ? 'underline' : 'none',
        },
      ],
    };
    return i === rows.length - 1 ? [row] : [row, { type: 'separator', margin: 'md', color: meta.separatorColor }];
  });

  const footerContents = [
    { type: 'separator', color: meta.footerSeparatorColor },
    { type: 'text', text: meta.footer, size: 'xs', color: meta.footerTextColor, wrap: true },
  ];

  if (data.templateType === 'CONFIRM') {
    footerContents.push(
      {
        type: 'box',
        layout: 'horizontal',
        spacing: 'sm',
        margin: 'md',
        contents: [
          {
            type: 'button',
            style: 'primary',
            height: 'sm',
            color: meta.buttonConfirmColor,
            action: {
              type: 'postback',
              label: meta.buttonConfirmLabel,
              data: `type=ORDER_ACTION&action=CONFIRM&orderId=${orderId}`,
              displayText: `ยืนยันคำสั่งซื้อ ${orderCode}`,
            },
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'postback',
              label: meta.buttonCancelLabel,
              data: `type=ORDER_ACTION&action=CANCEL&orderId=${orderId}`,
              displayText: `ยกเลิกคำสั่งซื้อ ${orderCode}`,
            },
          },
        ],
      },
    );
  }

  if (data.templateType === 'RECEIPT') {
    const receiptLabel = meta.buttonReceiptLabel || 'คลิกที่นี้';
    const action = meta.buttonReceiptUrl
      ? {
        type: 'uri',
        label: receiptLabel,
        uri: meta.buttonReceiptUrl,
      }
      : {
        type: 'postback',
        label: receiptLabel,
        data: 'type=CUSTOM_BUTTON&action=NO_URL',
        displayText: receiptLabel,
      };
    footerContents.push({
      type: 'button',
      style: 'primary',
      height: 'sm',
      margin: 'md',
      color: meta.accent,
      action,
    });
  }

  return {
    type: 'flex',
    altText: `${headerTitle} ${headerSubtitle}`,
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'none',
        paddingAll: '0px',
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: meta.accent,
            paddingAll: '14px',
            contents: [
              { type: 'text', text: headerTitle, color: meta.headerTextColor, size: 'md', weight: 'bold' },
              { type: 'text', text: headerSubtitle, color: meta.headerTextColor, size: 'xs', margin: 'sm' },
            ],
          },
          {
            type: 'box',
            layout: 'vertical',
            spacing: 'md',
            paddingAll: '12px',
            contents: [
              ...(introText
                ? [{
                  type: 'text',
                  text: introText,
                  wrap: true,
                  color: meta.bodyIntroColor,
                  size: 'md',
                  weight: 'bold',
                }]
                : []),
              ...(introText && contents.length > 0
                ? [{
                  type: 'separator',
                  margin: 'md',
                  color: meta.separatorColor,
                }]
                : []),
              ...contents,
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: '12px',
        contents: footerContents,
      },
    },
  };
}

// POST /api/messages/send
router.post('/send', requireAuth, async (req, res) => {
  const parse = SendSchema.safeParse(req.body);
  if (!parse.success) {
    console.error('[messages/send][400][validation]', {
      body: req.body,
      issues: parse.error.issues,
    });
    return res.status(400).json({ error: parse.error.flatten() });
  }
  let data = parse.data;
  const looksLikeCustomContent = (() => {
    const intro = (data.bodyIntroText || '').trim();
    const footer = (data.footerNote || '').trim();
    const startsWithCustomIntro = intro.startsWith('ข้อความสำหรับ');
    const isReceiptFooter = footer === RECEIPT_FOOTER_DEFAULT || footer === LEGACY_RECEIPT_FOOTER;
    const mentionsImportInvoice = intro.includes('ใบแจ้งหนี้นำเข้า') || intro.toLowerCase().includes('import invoice');
    return (startsWithCustomIntro || isReceiptFooter) && !mentionsImportInvoice;
  })();
  const looksLikeCustomMessage = data.customMode === true || [
    data.customHeaderTitle,
    data.customHeaderSubtitle,
    data.receiptButtonLabel,
    data.receiptButtonUrl,
  ].some((value) => typeof value === 'string' && value.trim().length > 0);

  // Backward/compat safety:
  // if frontend sends custom-message fields (or explicit customMode) but wrong templateType, coerce to RECEIPT.
  if (data.templateType !== 'RECEIPT' && (looksLikeCustomMessage || looksLikeCustomContent)) {
    data = { ...data, templateType: 'RECEIPT' };
  }

  if (data.templateType === 'CONFIRM') {
    if (
      typeof data.amount !== 'number'
      || typeof data.exchangeRate !== 'number'
      || typeof data.totalAmount !== 'number'
    ) {
      return res.status(400).json({
        error: 'CONFIRM requires amount, exchange rate, and total amount',
      });
    }
  }

  if (data.templateType === 'IMPORT_INVOICE') {
    if (typeof data.amount !== 'number') {
      return res.status(400).json({
        error: 'IMPORT_INVOICE requires amount',
      });
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const custResult = await client.query(
      'SELECT id, line_uid, display_name, customer_code FROM customers WHERE id = $1',
      [data.customerId],
    );
    if (custResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Customer not found' });
    }
    const { line_uid } = custResult.rows[0];

    const cfgResult = await client.query(
      `SELECT display_name, accent_color, header_text_color,
              body_label_color, body_text_color, body_intro_text, body_intro_color, footer_text_color,
              separator_color, footer_separator_color,
              subtitle, footer_note,
              button_confirm_label, button_confirm_color, button_cancel_label,
              button_receipt_label, button_receipt_url,
              detail_order_code_label, detail_document_type_label,
              detail_account_type_label, detail_account_name_label, detail_account_number_label,
              detail_amount_label, detail_exchange_rate_label, detail_total_label,
              detail_vat_label, detail_withholding_label, detail_net_total_label,
              is_active
       FROM template_configs
       WHERE template_type = $1`,
      [data.templateType],
    );
    const cfg = cfgResult.rows[0];
    if (!cfg || cfg.is_active === false) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `Template ${data.templateType} is not active or not configured` });
    }

    const accountMetaResult = data.accountType
      ? await client.query(
        `SELECT code, label, account_name, account_number, account_note
         FROM account_types
         WHERE code = $1 AND is_active = TRUE`,
        [data.accountType],
      )
      : { rowCount: 0, rows: [] };
    let accountMeta = accountMetaResult.rowCount > 0 ? accountMetaResult.rows[0] : null;
    let orderId;
    let orderCode;
    let payloadForMessage = {
      ...data,
      customerCode: custResult.rows[0].customer_code || undefined,
      customerName: custResult.rows[0].display_name || undefined,
    };

    if (data.templateType === ORDER_SOURCE_TEMPLATE) {
      const orderResult = await client.query(
        `INSERT INTO orders
           (order_code, customer_id, parent_order_id, template_type, account_type,
            amount, exchange_rate, exchange_rate_currency, total_amount, status, stage, expires_at)
         VALUES ($1,$2,NULL,$3,$4,$5,$6,$7,$8,'PENDING',$9, NOW() + INTERVAL '24 hours')
         RETURNING id, order_code`,
        [
          await generateOrderCode(client, data.templateType),
          data.customerId,
          ORDER_SOURCE_TEMPLATE,
          data.accountType,
          data.amount,
          data.exchangeRate,
          data.exchangeRateCurrency || 'CNY',
          data.netTotal ?? data.totalAmount,
          STAGE_BY_TEMPLATE[data.templateType],
        ],
      );
      orderId = orderResult.rows[0].id;
      orderCode = orderResult.rows[0].order_code;
    } else if (data.templateType === 'IMPORT_INVOICE') {
      if (!data.orderId) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'orderId is required for this document type' });
      }

      const orderResult = await client.query(
        `SELECT id, order_code, customer_id, parent_order_id, template_type, account_type,
                amount, exchange_rate, exchange_rate_currency, total_amount, status, stage
         FROM orders
         WHERE id = $1 AND customer_id = $2
         LIMIT 1`,
        [data.orderId, data.customerId],
      );

      if (orderResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Order not found for this customer' });
      }

      const order = orderResult.rows[0];
      if (order.template_type !== ORDER_SOURCE_TEMPLATE || order.parent_order_id != null) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Only purchase orders can be used as the source document' });
      }
      if (order.status !== 'CONFIRMED') {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Order must be confirmed before sending this document' });
      }

      const documentResult = await client.query(
        `INSERT INTO orders
           (order_code, customer_id, parent_order_id, template_type, account_type,
            amount, exchange_rate, exchange_rate_currency, total_amount, status, stage, confirmed_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'SENT',$10,NOW())
         RETURNING id, order_code`,
        [
          await generateOrderCode(client, data.templateType),
          data.customerId,
          order.id,
          data.templateType,
          data.accountType,
          data.amount,
          data.exchangeRate,
          data.exchangeRateCurrency || 'CNY',
          data.netTotal ?? data.totalAmount,
          STAGE_BY_TEMPLATE[data.templateType],
        ],
      );

      orderId = documentResult.rows[0].id;
      orderCode = documentResult.rows[0].order_code;
      payloadForMessage = {
        ...data,
        customerCode: custResult.rows[0].customer_code || undefined,
        customerName: custResult.rows[0].display_name || undefined,
      };

      if (data.accountType) {
        const existingAccount = await client.query(
          `SELECT code, label, account_name, account_number
           FROM account_types
           WHERE code = $1 AND is_active = TRUE`,
          [data.accountType],
        );
        accountMeta = existingAccount.rowCount > 0 ? existingAccount.rows[0] : null;
      } else {
        accountMeta = null;
      }

      await client.query(
        `UPDATE orders
         SET stage = $2
         WHERE id = $1`,
        [order.id, STAGE_BY_TEMPLATE[data.templateType]],
      );
    } else {
      orderId = null;
      orderCode = await generateOrderCode(client, data.templateType);
      payloadForMessage = {
        ...data,
        customerCode: custResult.rows[0].customer_code || undefined,
        customerName: custResult.rows[0].display_name || undefined,
      };
      accountMeta = null;
    }

    const flexMessage = buildFlexMessage(payloadForMessage, orderCode, orderId, cfg, accountMeta);
    let lineError = null;

    try {
      await pushLineMessage(line_uid, [flexMessage]);
    } catch (err) {
      lineError = err.message;
    }

    await client.query(
      `INSERT INTO message_logs
         (customer_id, order_id, template_type, message_text, line_error)
       VALUES ($1,$2,$3,$4,$5)`,
      [data.customerId, orderId, data.templateType, JSON.stringify(flexMessage), lineError],
    );

    await client.query('COMMIT');

    if (lineError) {
      return res.status(207).json({ ok: false, orderId, orderCode, lineError });
    }
    res.json({ ok: true, orderId, orderCode, preview: flexMessage });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[messages/send]', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// GET /api/messages?page=1
router.get('/', requireAuth, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 50;
    const offset = (page - 1) * limit;

    const [data, count] = await Promise.all([
      pool.query(
        `SELECT ml.*, c.customer_code, c.display_name, c.picture_url,
                o.order_code
         FROM message_logs ml
         LEFT JOIN customers c ON c.id = ml.customer_id
         LEFT JOIN orders o ON o.id = ml.order_id
         ORDER BY ml.sent_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset],
      ),
      pool.query('SELECT COUNT(*) FROM message_logs'),
    ]);

    res.json({
      messages: data.rows,
      total: Number(count.rows[0].count),
      page,
      limit,
    });
  } catch (err) {
    console.error('[messages]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
