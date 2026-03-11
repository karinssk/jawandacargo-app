export type TemplateType = 'IMPORT_INVOICE' | 'CONFIRM' | 'RECEIPT';

export interface TemplatePreviewConfig {
  template_type: TemplateType;
  display_name: string;
  accent_color: string;
  header_text_color: string;
  body_label_color: string;
  body_text_color: string;
  footer_text_color: string;
  separator_color: string;
  footer_separator_color: string;
  subtitle: string | null;
  footer_note: string | null;
  button_confirm_label: string | null;
  button_confirm_color: string;
  button_cancel_label: string | null;
  detail_order_code_label: string;
  detail_document_type_label: string;
  detail_account_type_label: string;
  detail_account_name_label: string;
  detail_account_number_label: string;
  detail_amount_label: string;
  detail_exchange_rate_label: string;
  detail_total_label: string;
  detail_vat_label: string;
  detail_withholding_label: string;
  detail_net_total_label: string;
}

export const DEFAULT_TEMPLATE_CONFIGS: Record<TemplateType, TemplatePreviewConfig> = {
  IMPORT_INVOICE: {
    template_type: 'IMPORT_INVOICE',
    display_name: 'ใบแจ้งหนี้นำเข้า',
    accent_color: '#1565c0',
    header_text_color: '#ffffff',
    body_label_color: '#6b7280',
    body_text_color: '#111827',
    footer_text_color: '#4b5563',
    separator_color: '#f3f4f6',
    footer_separator_color: '#e5e7eb',
    subtitle: 'IMPORT INVOICE',
    footer_note: 'กรุณายืนยันภายใน 24 ชั่วโมง',
    button_confirm_label: 'ยืนยัน',
    button_confirm_color: '#16a34a',
    button_cancel_label: 'ยกเลิก',
    detail_order_code_label: 'เลขคำสั่งซื้อ',
    detail_document_type_label: 'ประเภทเอกสาร',
    detail_account_type_label: 'ประเภทบัญชี',
    detail_account_name_label: 'ชื่อบัญชี',
    detail_account_number_label: 'เลขบัญชี',
    detail_amount_label: 'จำนวนเงิน',
    detail_exchange_rate_label: 'อัตราแลกเปลี่ยน',
    detail_total_label: 'ยอดฐาน',
    detail_vat_label: 'VAT 7%',
    detail_withholding_label: 'หัก ณ ที่จ่าย 3%',
    detail_net_total_label: 'ยอดสุทธิ',
  },
  CONFIRM: {
    template_type: 'CONFIRM',
    display_name: 'ยืนยันคำสั่งซื้อ',
    accent_color: '#2e7d32',
    header_text_color: '#ffffff',
    body_label_color: '#6b7280',
    body_text_color: '#111827',
    footer_text_color: '#4b5563',
    separator_color: '#f3f4f6',
    footer_separator_color: '#e5e7eb',
    subtitle: 'ORDER CONFIRMATION',
    footer_note: 'คำสั่งซื้อได้รับการยืนยันเรียบร้อยแล้ว',
    button_confirm_label: 'ยืนยัน',
    button_confirm_color: '#16a34a',
    button_cancel_label: 'ยกเลิก',
    detail_order_code_label: 'เลขคำสั่งซื้อ',
    detail_document_type_label: 'ประเภทเอกสาร',
    detail_account_type_label: 'ประเภทบัญชี',
    detail_account_name_label: 'ชื่อบัญชี',
    detail_account_number_label: 'เลขบัญชี',
    detail_amount_label: 'จำนวนเงิน',
    detail_exchange_rate_label: 'อัตราแลกเปลี่ยน',
    detail_total_label: 'ยอดฐาน',
    detail_vat_label: 'VAT 7%',
    detail_withholding_label: 'หัก ณ ที่จ่าย 3%',
    detail_net_total_label: 'ยอดสุทธิ',
  },
  RECEIPT: {
    template_type: 'RECEIPT',
    display_name: 'ใบเสร็จรับเงิน',
    accent_color: '#6a1b9a',
    header_text_color: '#ffffff',
    body_label_color: '#6b7280',
    body_text_color: '#111827',
    footer_text_color: '#4b5563',
    separator_color: '#f3f4f6',
    footer_separator_color: '#e5e7eb',
    subtitle: 'RECEIPT',
    footer_note: 'ใบเสร็จสำหรับรายการที่ยืนยันแล้ว',
    button_confirm_label: 'ยืนยัน',
    button_confirm_color: '#16a34a',
    button_cancel_label: 'ยกเลิก',
    detail_order_code_label: 'เลขคำสั่งซื้อ',
    detail_document_type_label: 'ประเภทเอกสาร',
    detail_account_type_label: 'ประเภทบัญชี',
    detail_account_name_label: 'ชื่อบัญชี',
    detail_account_number_label: 'เลขบัญชี',
    detail_amount_label: 'จำนวนเงิน',
    detail_exchange_rate_label: 'อัตราแลกเปลี่ยน',
    detail_total_label: 'ยอดฐาน',
    detail_vat_label: 'VAT 7%',
    detail_withholding_label: 'หัก ณ ที่จ่าย 3%',
    detail_net_total_label: 'ยอดสุทธิ',
  },
};

interface AccountMeta {
  label?: string | null;
  account_name?: string | null;
  account_number?: string | null;
}

interface PreviewInput {
  template: TemplatePreviewConfig;
  templateType: TemplateType;
  orderCode: string;
  orderId?: number;
  accountType?: string | null;
  amount?: number;
  exchangeRate?: number;
  exchangeRateCurrency?: 'USD' | 'CNY' | 'THB';
  totalAmount?: number;
  applyVat?: boolean;
  applyWithholding?: boolean;
  vatAmount?: number;
  withholdingAmount?: number;
  netTotal?: number;
  accountMeta?: AccountMeta | null;
}

function fmt(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} บาท`;
}

function pickColor(value: string | null | undefined, fallback: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value || '') ? String(value) : fallback;
}

export function buildPreviewFlexMessage(input: PreviewInput) {
  const {
    template,
    templateType,
    orderCode,
    orderId,
    accountType,
    amount,
    exchangeRate,
    exchangeRateCurrency,
    totalAmount,
    applyVat,
    applyWithholding,
    vatAmount,
    withholdingAmount,
    netTotal,
    accountMeta,
  } = input;

  const exchangeRateLabel = typeof exchangeRate === 'number'
    ? `${exchangeRate} ${(exchangeRateCurrency || 'CNY')}`.trim()
    : '-';

  const rows = [
    [template.detail_order_code_label, orderCode],
    [template.detail_document_type_label, template.subtitle || template.template_type],
    [template.detail_account_type_label, accountMeta?.label || accountType || '-'],
    [template.detail_account_name_label, accountMeta?.account_name || '-'],
    [template.detail_account_number_label, accountMeta?.account_number || '-'],
    [template.detail_amount_label, fmt(amount)],
    [template.detail_exchange_rate_label, exchangeRateLabel],
    [template.detail_total_label, fmt(totalAmount)],
  ];

  if (applyVat) rows.push([template.detail_vat_label, fmt(vatAmount || 0)]);
  if (applyWithholding) rows.push([template.detail_withholding_label, fmt(withholdingAmount || 0)]);
  if (typeof netTotal === 'number') rows.push([template.detail_net_total_label, fmt(netTotal)]);

  const bodyRows = rows.flatMap(([label, value], idx) => {
    const row = {
      type: 'box',
      layout: 'baseline',
      spacing: 'sm',
      contents: [
        { type: 'text', text: label, color: pickColor(template.body_label_color, '#6b7280'), size: 'sm', flex: 4 },
        { type: 'text', text: value, wrap: true, color: pickColor(template.body_text_color, '#111827'), size: 'sm', flex: 6, align: 'end' },
      ],
    };
    return idx === rows.length - 1 ? [row] : [row, { type: 'separator', margin: 'md', color: pickColor(template.separator_color, '#f3f4f6') }];
  });

  const footerContents: Array<Record<string, unknown>> = [
    { type: 'separator', color: pickColor(template.footer_separator_color, '#e5e7eb') },
    {
      type: 'text',
      text: template.footer_note || 'ตัวอย่างข้อความ footer',
      size: 'xs',
      color: pickColor(template.footer_text_color, '#4b5563'),
      wrap: true,
    },
  ];

  if (templateType === 'IMPORT_INVOICE') {
    footerContents.push({
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      margin: 'md',
      contents: [
        {
          type: 'button',
          style: 'primary',
          height: 'sm',
          color: pickColor(template.button_confirm_color, '#16a34a'),
          action: {
            type: 'postback',
            label: template.button_confirm_label || 'ยืนยัน',
            data: `type=ORDER_ACTION&action=CONFIRM&orderId=${orderId || 0}`,
            displayText: `ยืนยันคำสั่งซื้อ ${orderCode}`,
          },
        },
        {
          type: 'button',
          style: 'secondary',
          height: 'sm',
          action: {
            type: 'postback',
            label: template.button_cancel_label || 'ยกเลิก',
            data: `type=ORDER_ACTION&action=CANCEL&orderId=${orderId || 0}`,
            displayText: `ยกเลิกคำสั่งซื้อ ${orderCode}`,
          },
        },
      ],
    });
  }

  return {
    type: 'flex',
    altText: `${template.display_name} ${orderCode}`,
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
            backgroundColor: pickColor(template.accent_color, '#1565c0'),
            paddingAll: '14px',
            contents: [
              { type: 'text', text: template.display_name, color: pickColor(template.header_text_color, '#ffffff'), size: 'md', weight: 'bold' },
              { type: 'text', text: orderCode, color: pickColor(template.header_text_color, '#ffffff'), size: 'xs', margin: 'sm' },
            ],
          },
          {
            type: 'box',
            layout: 'vertical',
            spacing: 'md',
            paddingAll: '12px',
            contents: bodyRows,
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
