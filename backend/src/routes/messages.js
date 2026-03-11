import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db.js';
import { requireAuth } from './auth.js';

const router = Router();

const SendSchema = z.object({
  customerId: z.number().int().positive(),
  templateType: z.enum(['IMPORT_INVOICE', 'CONFIRM', 'RECEIPT']),
  orderId: z.number().int().positive().optional(),
  accountType: z.string().optional(),
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
    footer: 'กรุณายืนยันภายใน 24 ชั่วโมง',
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
    title: 'ยืนยันคำสั่งซื้อ',
    accent: '#2e7d32',
    headerTextColor: '#ffffff',
    bodyLabelColor: '#6b7280',
    bodyTextColor: '#111827',
    footerTextColor: '#4b5563',
    separatorColor: '#f3f4f6',
    footerSeparatorColor: '#e5e7eb',
    codePrefix: 'ORDER CONFIRMATION',
    footer: 'คำสั่งซื้อได้รับการยืนยันเรียบร้อยแล้ว',
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
    footer: 'ใบเสร็จสำหรับรายการที่ยืนยันแล้ว',
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
};

const ORDER_SOURCE_TEMPLATE = 'IMPORT_INVOICE';

async function generateOrderCode(client, templateType) {
  const seq = await client.query("SELECT nextval('order_seq') AS val");
  const n = String(seq.rows[0].val).padStart(3, '0');
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const prefix = templateType === 'IMPORT_INVOICE' ? 'IMP-INV' : 'ORD';
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

function fmt(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} บาท`;
}

function pickColor(value, fallback) {
  return /^#[0-9a-fA-F]{6}$/.test(value || '') ? value : fallback;
}

function buildFlexMessage(data, orderCode, orderId, cfg, accountMeta = null) {
  const baseMeta = TEMPLATE_META[data.templateType] || TEMPLATE_META.IMPORT_INVOICE;
  const meta = {
    title: cfg?.display_name || baseMeta.title,
    accent: pickColor(cfg?.accent_color, baseMeta.accent),
    headerTextColor: pickColor(cfg?.header_text_color, baseMeta.headerTextColor),
    bodyLabelColor: pickColor(cfg?.body_label_color, baseMeta.bodyLabelColor),
    bodyTextColor: pickColor(cfg?.body_text_color, baseMeta.bodyTextColor),
    footerTextColor: pickColor(cfg?.footer_text_color, baseMeta.footerTextColor),
    separatorColor: pickColor(cfg?.separator_color, baseMeta.separatorColor),
    footerSeparatorColor: pickColor(cfg?.footer_separator_color, baseMeta.footerSeparatorColor),
    codePrefix: cfg?.subtitle || baseMeta.codePrefix,
    footer: cfg?.footer_note || baseMeta.footer,
    buttonConfirmLabel: cfg?.button_confirm_label || baseMeta.buttonConfirmLabel,
    buttonConfirmColor: pickColor(cfg?.button_confirm_color, baseMeta.buttonConfirmColor),
    buttonCancelLabel: cfg?.button_cancel_label || baseMeta.buttonCancelLabel,
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
    ? `${data.exchangeRate} ${(data.exchangeRateCurrency || 'CNY')}`.trim()
    : '-';

  const rows = [
    [meta.detailLabels.orderCode, orderCode],
    [meta.detailLabels.documentType, meta.codePrefix],
    [meta.detailLabels.accountType, accountMeta?.label || data.accountType || '-'],
    [meta.detailLabels.accountName, accountMeta?.account_name || '-'],
    [meta.detailLabels.accountNumber, accountMeta?.account_number || '-'],
    [meta.detailLabels.amount, fmt(data.amount)],
    [meta.detailLabels.exchangeRate, exchangeRateLabel],
    [meta.detailLabels.total, fmt(data.totalAmount)],
  ];

  if (data.applyVat) rows.push([meta.detailLabels.vat, fmt(data.vatAmount || 0)]);
  if (data.applyWithholding) rows.push([meta.detailLabels.withholding, fmt(data.withholdingAmount || 0)]);
  if (typeof data.netTotal === 'number') rows.push([meta.detailLabels.netTotal, fmt(data.netTotal)]);

  const contents = rows.flatMap(([label, value], i) => {
    const row = {
      type: 'box',
      layout: 'baseline',
      spacing: 'sm',
      contents: [
        { type: 'text', text: label, color: meta.bodyLabelColor, size: 'sm', flex: 4 },
        { type: 'text', text: value, wrap: true, color: meta.bodyTextColor, size: 'sm', flex: 6, align: 'end' },
      ],
    };
    return i === rows.length - 1 ? [row] : [row, { type: 'separator', margin: 'md', color: meta.separatorColor }];
  });

  const footerContents = [
    { type: 'separator', color: meta.footerSeparatorColor },
    { type: 'text', text: meta.footer, size: 'xs', color: meta.footerTextColor, wrap: true },
  ];

  if (data.templateType === 'IMPORT_INVOICE') {
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

  return {
    type: 'flex',
    altText: `${meta.title} ${orderCode}`,
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
              { type: 'text', text: meta.title, color: meta.headerTextColor, size: 'md', weight: 'bold' },
              { type: 'text', text: orderCode, color: meta.headerTextColor, size: 'xs', margin: 'sm' },
            ],
          },
          {
            type: 'box',
            layout: 'vertical',
            spacing: 'md',
            paddingAll: '12px',
            contents,
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
  const data = parse.data;
  if (data.templateType === ORDER_SOURCE_TEMPLATE) {
    if (
      typeof data.amount !== 'number'
      || typeof data.exchangeRate !== 'number'
      || typeof data.totalAmount !== 'number'
    ) {
      return res.status(400).json({ error: 'Import invoice requires amount, exchange rate, and total amount' });
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const custResult = await client.query(
      'SELECT id, line_uid FROM customers WHERE id = $1',
      [data.customerId],
    );
    if (custResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Customer not found' });
    }
    const { line_uid } = custResult.rows[0];

    const cfgResult = await client.query(
      `SELECT display_name, accent_color, header_text_color,
              body_label_color, body_text_color, footer_text_color,
              separator_color, footer_separator_color,
              subtitle, footer_note,
              button_confirm_label, button_confirm_color, button_cancel_label,
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
        `SELECT code, label, account_name, account_number
         FROM account_types
         WHERE code = $1 AND is_active = TRUE`,
        [data.accountType],
      )
      : { rowCount: 0, rows: [] };
    let accountMeta = accountMetaResult.rowCount > 0 ? accountMetaResult.rows[0] : null;
    let orderId;
    let orderCode;
    let payloadForMessage = data;

    if (data.templateType === ORDER_SOURCE_TEMPLATE) {
      const orderResult = await client.query(
        `INSERT INTO orders
           (order_code, customer_id, template_type, account_type,
            amount, exchange_rate, exchange_rate_currency, total_amount, status, expires_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'PENDING', NOW() + INTERVAL '24 hours')
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
        ],
      );
      orderId = orderResult.rows[0].id;
      orderCode = orderResult.rows[0].order_code;
    } else {
      if (!data.orderId) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'orderId is required for this document type' });
      }

      const orderResult = await client.query(
        `SELECT id, order_code, customer_id, template_type, account_type,
                amount, exchange_rate, exchange_rate_currency, total_amount, status
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
      if (order.template_type !== ORDER_SOURCE_TEMPLATE) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Only import invoice orders can be used as the source document' });
      }
      if (order.status !== 'CONFIRMED') {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Order must be confirmed before sending this document' });
      }

      orderId = order.id;
      orderCode = order.order_code;
      payloadForMessage = {
        ...data,
        accountType: order.account_type || undefined,
        amount: order.amount != null ? Number(order.amount) : undefined,
        exchangeRate: order.exchange_rate != null ? Number(order.exchange_rate) : undefined,
        exchangeRateCurrency: order.exchange_rate_currency || 'CNY',
        totalAmount: order.total_amount != null ? Number(order.total_amount) : undefined,
        netTotal: order.total_amount != null ? Number(order.total_amount) : undefined,
      };

      if (order.account_type) {
        const existingAccount = await client.query(
          `SELECT code, label, account_name, account_number
           FROM account_types
           WHERE code = $1 AND is_active = TRUE`,
          [order.account_type],
        );
        accountMeta = existingAccount.rowCount > 0 ? existingAccount.rows[0] : null;
      } else {
        accountMeta = null;
      }
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
