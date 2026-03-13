export type TemplateType = 'IMPORT_INVOICE' | 'CONFIRM' | 'RECEIPT';
const LEGACY_RECEIPT_FOOTER = 'ใบเสร็จสำหรับรายการที่ยืนยันแล้ว';
const RECEIPT_FOOTER_DEFAULT = 'End-to-End Logistics Partner';

export interface TemplatePreviewConfig {
  template_type: TemplateType;
  display_name: string;
  accent_color: string;
  header_text_color: string;
  body_label_color: string;
  body_text_color: string;
  body_intro_text: string | null;
  body_intro_color: string;
  footer_text_color: string;
  separator_color: string;
  footer_separator_color: string;
  subtitle: string | null;
  footer_note: string | null;
  button_confirm_label: string | null;
  button_confirm_color: string;
  button_cancel_label: string | null;
  button_receipt_label: string | null;
  button_receipt_url: string | null;
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
    body_intro_text: null,
    body_intro_color: '#0b57b7',
    footer_text_color: '#4b5563',
    separator_color: '#f3f4f6',
    footer_separator_color: '#e5e7eb',
    subtitle: 'IMPORT INVOICE',
    footer_note: 'กรุณาชำระค่าใช้จ่ายนำเข้าตามบิลนี้',
    button_confirm_label: 'ยืนยัน',
    button_confirm_color: '#16a34a',
    button_cancel_label: 'ยกเลิก',
    button_receipt_label: 'คลิกที่นี้',
    button_receipt_url: null,
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
    display_name: 'คำสั่งซื้อสินค้า',
    accent_color: '#2e7d32',
    header_text_color: '#ffffff',
    body_label_color: '#6b7280',
    body_text_color: '#111827',
    body_intro_text: null,
    body_intro_color: '#0b57b7',
    footer_text_color: '#4b5563',
    separator_color: '#f3f4f6',
    footer_separator_color: '#e5e7eb',
    subtitle: 'PURCHASE ORDER',
    footer_note: 'กรุณาตรวจสอบรายละเอียดและยืนยันคำสั่งซื้อ',
    button_confirm_label: 'ยืนยัน',
    button_confirm_color: '#16a34a',
    button_cancel_label: 'ยกเลิก',
    button_receipt_label: 'คลิกที่นี้',
    button_receipt_url: null,
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
    body_intro_text: null,
    body_intro_color: '#0b57b7',
    footer_text_color: '#4b5563',
    separator_color: '#f3f4f6',
    footer_separator_color: '#e5e7eb',
    subtitle: 'RECEIPT',
    footer_note: RECEIPT_FOOTER_DEFAULT,
    button_confirm_label: 'ยืนยัน',
    button_confirm_color: '#16a34a',
    button_cancel_label: 'ยกเลิก',
    button_receipt_label: 'คลิกที่นี้',
    button_receipt_url: null,
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
  customerCode?: string;
  customerName?: string;
  customHeaderTitle?: string;
  customHeaderSubtitle?: string;
  bodyIntroText?: string;
  bodyIntroColor?: string;
  accountNote?: string | null;
  footerNote?: string;
  receiptButtonLabel?: string | null;
  receiptButtonUrl?: string | null;
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

function fmtBaht(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} บาท`;
}

function fmtYuan(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} หยวน`;
}

function pickColor(value: string | null | undefined, fallback: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value || '') ? String(value) : fallback;
}

function interpolateTemplateText(value: string | null | undefined, context: {
  customerCode?: string;
  customerName?: string;
  netTotal?: number;
}) {
  if (!value) return '';
  const customerRef = context.customerCode || context.customerName || '-';
  return String(value)
    .replace(/\{\{\s*customer_name\s*\}\}/gi, customerRef)
    .replace(/\{\{\s*customer_code\s*\}\}/gi, customerRef)
    .replace(/\{\{\s*net_total\s*\}\}/gi, fmtBaht(context.netTotal));
}

export function buildPreviewFlexMessage(input: PreviewInput) {
  const {
    template,
    templateType,
    orderCode,
    orderId,
    customerCode,
    customerName,
    customHeaderTitle,
    customHeaderSubtitle,
    bodyIntroText,
    bodyIntroColor,
    accountNote,
    footerNote,
    receiptButtonLabel,
    receiptButtonUrl,
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
    ? `${parseFloat(exchangeRate.toFixed(2))} ${(exchangeRateCurrency || 'CNY')}`.trim()
    : '-';
  const isImportInvoice = templateType === 'IMPORT_INVOICE';
  const isCustomMessage = templateType === 'RECEIPT';
  const headerTitle = isCustomMessage
    ? (customHeaderTitle?.trim() || 'Jawanda Cargo')
    : template.display_name;
  const headerSubtitle = isCustomMessage
    ? (customHeaderSubtitle?.trim() || 'นำเข้าสินค้าจากจีนแบบครบวงจร')
    : orderCode;
  const introText = interpolateTemplateText(bodyIntroText || template.body_intro_text, {
    customerCode,
    customerName,
    netTotal,
  });
  const amountText = templateType === 'IMPORT_INVOICE'
    ? fmtBaht(amount)
    : templateType === 'CONFIRM'
      ? fmtYuan(amount)
      : fmtBaht(amount);

  type RowEntry = [string, string, boolean?]; // [label, value, isBankInfo?]
  const rows: RowEntry[] = [];
  if (!isCustomMessage) {
    rows.push(
      [template.detail_order_code_label, orderCode],
      [template.detail_document_type_label, template.subtitle || template.template_type],
      [template.detail_account_type_label, accountMeta?.label || accountType || '-', true],
      [template.detail_account_name_label, accountMeta?.account_name || '-', true],
      [template.detail_account_number_label, accountMeta?.account_number || '-', true],
      [template.detail_amount_label, amountText],
    );
  }
  if (!isImportInvoice && !isCustomMessage) {
    rows.push(
      [template.detail_exchange_rate_label, exchangeRateLabel],
      [template.detail_total_label, fmtBaht(totalAmount)],
    );
  }

  if (!isCustomMessage) {
    if (applyVat) rows.push([template.detail_vat_label, fmtBaht(vatAmount || 0)]);
    if (applyWithholding) rows.push([template.detail_withholding_label, fmtBaht(withholdingAmount || 0)]);
    if (typeof netTotal === 'number') rows.push([template.detail_net_total_label, fmtBaht(netTotal)]);
  }

  const bodyRows = rows.flatMap(([label, value, isBankInfo], idx) => {
    const isNameOrNumber = isBankInfo && (label === template.detail_account_name_label || label === template.detail_account_number_label);
    const isNetTotal = label === template.detail_net_total_label;
    const row = {
      type: 'box',
      layout: 'baseline',
      spacing: 'sm',
      contents: [
        {
          type: 'text',
          text: label,
          color: pickColor(template.body_label_color, '#6b7280'),
          size: isNetTotal ? 'md' : 'sm',
          flex: 4,
          weight: isBankInfo || isNetTotal ? 'bold' : 'regular',
        },
        {
          type: 'text',
          text: value,
          wrap: true,
          color: isNameOrNumber ? pickColor(template.accent_color, '#1565c0') : pickColor(template.body_text_color, '#111827'),
          size: isNameOrNumber ? 'md' : (isNetTotal ? 'lg' : 'sm'),
          flex: 6,
          align: 'end',
          weight: isNameOrNumber || isNetTotal ? 'bold' : 'regular',
          decoration: isNameOrNumber ? 'underline' : 'none',
        },
      ],
    };
    return idx === rows.length - 1 ? [row] : [row, { type: 'separator', margin: 'md', color: pickColor(template.separator_color, '#f3f4f6') }];
  });

  const footerParts = [accountNote, footerNote].filter(Boolean).join('\n');
  const normalizedTemplateFooter = templateType === 'RECEIPT' && template.footer_note === LEGACY_RECEIPT_FOOTER
    ? RECEIPT_FOOTER_DEFAULT
    : template.footer_note;
  const footerText = footerParts
    || normalizedTemplateFooter
    || (templateType === 'RECEIPT' ? RECEIPT_FOOTER_DEFAULT : 'ตัวอย่างข้อความ footer');

  const footerContents: Array<Record<string, unknown>> = [
    { type: 'separator', color: pickColor(template.footer_separator_color, '#e5e7eb') },
    {
      type: 'text',
      text: footerText,
      size: 'xs',
      color: pickColor(template.footer_text_color, '#4b5563'),
      wrap: true,
    },
  ];

  const effectiveReceiptUrl = receiptButtonUrl || template.button_receipt_url;
  if (templateType === 'RECEIPT') {
    const receiptLabel = receiptButtonLabel || template.button_receipt_label || 'คลิกที่นี้';
    const action = effectiveReceiptUrl
      ? {
        type: 'uri',
        label: receiptLabel,
        uri: effectiveReceiptUrl,
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
      color: pickColor(template.accent_color, '#6a1b9a'),
      action,
    });
  }

  if (templateType === 'CONFIRM') {
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
            backgroundColor: pickColor(template.accent_color, '#1565c0'),
            paddingAll: '14px',
            contents: [
              { type: 'text', text: headerTitle, color: pickColor(template.header_text_color, '#ffffff'), size: 'md', weight: 'bold' },
              { type: 'text', text: headerSubtitle, color: pickColor(template.header_text_color, '#ffffff'), size: 'xs', margin: 'sm' },
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
                  color: pickColor(bodyIntroColor, pickColor(template.body_intro_color, '#0b57b7')),
                  size: 'md',
                  weight: 'bold',
                }]
                : []),
              ...(introText && bodyRows.length > 0
                ? [{
                  type: 'separator',
                  margin: 'md',
                  color: pickColor(template.separator_color, '#f3f4f6'),
                }]
                : []),
              ...bodyRows,
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
