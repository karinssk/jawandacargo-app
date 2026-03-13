'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import FlexPreview from '../../customers/[id]/FlexPreview';
import type { TemplatePreviewConfig, TemplateType } from '../../../../lib/flexMessagePreview';
import { buildPreviewFlexMessage, DEFAULT_TEMPLATE_CONFIGS } from '../../../../lib/flexMessagePreview';

interface Customer {
  id: number;
  customer_code: string;
  display_name: string;
}

interface AccountTypeOption {
  id: number;
  code: string;
  label: string;
  account_name: string | null;
  account_number: string | null;
  account_note: string | null;
  is_active: boolean;
  sort_order: number;
}

interface OrderOption {
  id: number;
  order_code: string;
  template_type: string;
  account_type: string | null;
  amount: number | null;
  exchange_rate: number | null;
  exchange_rate_currency: 'USD' | 'CNY' | 'THB' | null;
  total_amount: number | null;
  status: 'PENDING' | 'CONFIRMED' | 'UNCONFIRMED';
  stage: string;
  expires_at: string | null;
  confirmed_at: string | null;
  created_at: string;
}

const TEMPLATE_TYPES = [
  { value: 'CONFIRM', label: 'คำสั่งซื้อสินค้า (Purchase Order)', accent: '#2e7d32', footer: 'กรุณาตรวจสอบรายละเอียดและยืนยันคำสั่งซื้อ' },
  { value: 'IMPORT_INVOICE', label: 'ใบแจ้งหนี้นำเข้า (Import Invoice)', accent: '#1565c0', footer: 'กรุณาชำระค่าใช้จ่ายนำเข้าตามบิลนี้' },
  { value: 'RECEIPT', label: 'ส่งข้อความแบบกำหนดเอง', accent: '#6a1b9a', footer: 'กรุณาตรวจสอบรายละเอียดข้อความก่อนส่ง' },
] as const;
const CUSTOM_HEADER_TITLE_DEFAULT = 'Jawanda Cargo';
const CUSTOM_HEADER_SUBTITLE_DEFAULT = 'นำเข้าสินค้าจากจีนแบบครบวงจร';
const LEGACY_RECEIPT_FOOTER = 'ใบเสร็จสำหรับรายการที่ยืนยันแล้ว';
const RECEIPT_FOOTER_DEFAULT = 'End-to-End Logistics Partner';

function toNum(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function money(v: number) {
  return `${v.toLocaleString(undefined, { maximumFractionDigits: 2 })} บาท`;
}

function extractApiError(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return 'Request failed';
  const p = payload as Record<string, unknown>;
  if (typeof p.error === 'string') return p.error;
  if (p.error && typeof p.error === 'object') {
    const flattened = p.error as Record<string, unknown>;
    const formErrors = flattened.formErrors;
    if (Array.isArray(formErrors) && typeof formErrors[0] === 'string') return formErrors[0];
  }
  return 'Request failed';
}

function statusLabel(status: OrderOption['status']) {
  if (status === 'CONFIRMED') return 'ยืนยันแล้ว';
  if (status === 'UNCONFIRMED') return 'ยกเลิก / หมดอายุ';
  return 'รอยืนยัน';
}

export default function SendMessagePage() {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [templateType, setTemplateType] = useState<TemplateType>('CONFIRM');
  const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false);
  const [accountType, setAccountType] = useState('');
  const [accountTypes, setAccountTypes] = useState<AccountTypeOption[]>([]);
  const [templateConfigs, setTemplateConfigs] = useState<TemplatePreviewConfig[]>([]);
  const [customerOrders, setCustomerOrders] = useState<OrderOption[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [customHeaderTitle, setCustomHeaderTitle] = useState(CUSTOM_HEADER_TITLE_DEFAULT);
  const [customHeaderSubtitle, setCustomHeaderSubtitle] = useState(CUSTOM_HEADER_SUBTITLE_DEFAULT);
  const [bodyIntroText, setBodyIntroText] = useState('');
  const [bodyIntroColor, setBodyIntroColor] = useState('#0b57b7');
  const [footerNote, setFooterNote] = useState('');
  const [amount, setAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState('');
  const [exchangeRateCurrency, setExchangeRateCurrency] = useState<'USD' | 'CNY' | 'THB'>('CNY');
  const [receiptButtonLabel, setReceiptButtonLabel] = useState('');
  const [receiptButtonUrl, setReceiptButtonUrl] = useState('');
  const [applyVat, setApplyVat] = useState(false);
  const [applyWithholding, setApplyWithholding] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; orderId?: number; orderCode?: string; lineError?: string } | null>(null);
  const templateDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/account-types', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        const rows = (data.accountTypes || []).filter((x: AccountTypeOption) => x.is_active);
        setAccountTypes(rows);
        if (!accountType && rows[0]) setAccountType(rows[0].code);
      })
      .catch(() => setAccountTypes([]));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetch('/api/templates', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setTemplateConfigs(data.templates || []))
      .catch(() => setTemplateConfigs([]));
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('exchangeRateCurrency');
    if (saved === 'USD' || saved === 'CNY' || saved === 'THB') {
      setExchangeRateCurrency(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('exchangeRateCurrency', exchangeRateCurrency);
  }, [exchangeRateCurrency]);

  useEffect(() => {
    if (!search || selectedCustomer) return;
    const t = setTimeout(() => {
      fetch(`/api/customers/search?q=${encodeURIComponent(search)}`, { credentials: 'include' })
        .then((r) => r.json())
        .then(setSuggestions)
        .catch(() => setSuggestions([]));
    }, 250);
    return () => clearTimeout(t);
  }, [search, selectedCustomer]);

  useEffect(() => {
    if (!selectedCustomer) {
      setCustomerOrders([]);
      setSelectedOrderId('');
      return;
    }

    setLoadingOrders(true);
    fetch(`/api/customers/${selectedCustomer.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        setCustomerOrders(data.orders || []);
      })
      .catch(() => setCustomerOrders([]))
      .finally(() => setLoadingOrders(false));
  }, [selectedCustomer]);

  const needsExistingOrder = templateType === 'IMPORT_INVOICE';
  const eligibleOrders = useMemo(
    () => customerOrders.filter((order) => order.template_type === 'CONFIRM' && order.status === 'CONFIRMED'),
    [customerOrders],
  );

  useEffect(() => {
    if (!needsExistingOrder) {
      setSelectedOrderId('');
      return;
    }

    if (!selectedOrderId || !eligibleOrders.some((order) => String(order.id) === selectedOrderId)) {
      setSelectedOrderId(eligibleOrders[0] ? String(eligibleOrders[0].id) : '');
    }
  }, [needsExistingOrder, eligibleOrders, selectedOrderId]);

  const selectedOrder = useMemo(
    () => eligibleOrders.find((order) => String(order.id) === selectedOrderId) || null,
    [eligibleOrders, selectedOrderId],
  );

  useEffect(() => {
    if (!selectedOrder) return;
    if (!accountType && selectedOrder.account_type) {
      setAccountType(selectedOrder.account_type);
    }
    if (!amount && selectedOrder.amount != null) {
      setAmount(String(selectedOrder.amount));
    }
    if (!exchangeRate && selectedOrder.exchange_rate != null) {
      setExchangeRate(String(parseFloat(Number(selectedOrder.exchange_rate).toFixed(2))));
    }
    if (selectedOrder.exchange_rate_currency) {
      setExchangeRateCurrency(selectedOrder.exchange_rate_currency);
    }
  }, [selectedOrder, accountType, amount, exchangeRate]);

  const autoBaseAmount = useMemo(() => toNum(amount) * toNum(exchangeRate), [amount, exchangeRate]);

  const summary = useMemo(() => {
    const base = autoBaseAmount;
    const vatAmount = applyVat ? base * 0.07 : 0;
    const withholdingAmount = applyWithholding ? base * 0.03 : 0;
    const netTotal = base + vatAmount - withholdingAmount;
    return { base, vatAmount, withholdingAmount, netTotal };
  }, [autoBaseAmount, applyVat, applyWithholding]);

  const selectedTemplateConfig = templateConfigs.find((item) => item.template_type === templateType) || DEFAULT_TEMPLATE_CONFIGS[templateType];
  const selectedTemplateOption = TEMPLATE_TYPES.find((item) => item.value === templateType) || TEMPLATE_TYPES[0];
  const selectedAccountMeta = accountTypes.find((item) => item.code === accountType) || null;
  const safeBodyIntroColor = /^#[0-9a-fA-F]{6}$/.test(bodyIntroColor) ? bodyIntroColor : '#0b57b7';

  const defaultBodyIntroText: Record<TemplateType, string> = {
    CONFIRM: 'รายละเอียดออเดอร์สำหรับ {{customer_name}}\nยอดสุทธิ {{net_total}}\nกรุณาตรวจสอบข้อมูลให้เรียบร้อย',
    IMPORT_INVOICE: 'รายละเอียดใบแจ้งหนี้นำเข้าสำหรับ {{customer_name}}\nยอดสุทธิ {{net_total}}\nกรุณาชำระค่าใช้จ่ายตามบิลนี้',
    RECEIPT: 'ข้อความสำหรับ {{customer_name}}\nโปรดตรวจสอบรายละเอียดด้านล่าง\nขอบคุณที่ใช้บริการ',
  };

  useEffect(() => {
    setBodyIntroText(selectedTemplateConfig.body_intro_text || defaultBodyIntroText[templateType]);
    setBodyIntroColor(selectedTemplateConfig.body_intro_color || '#0b57b7');
    const rawFooter = selectedTemplateConfig.footer_note || '';
    if (templateType === 'RECEIPT') {
      setFooterNote(rawFooter && rawFooter !== LEGACY_RECEIPT_FOOTER ? rawFooter : RECEIPT_FOOTER_DEFAULT);
    } else {
      setFooterNote(rawFooter);
    }
    setReceiptButtonLabel(selectedTemplateConfig.button_receipt_label || 'คลิกที่นี้');
  }, [selectedTemplateConfig.template_type, selectedTemplateConfig.body_intro_text, selectedTemplateConfig.body_intro_color, selectedTemplateConfig.footer_note, selectedTemplateConfig.button_receipt_label]);

  useEffect(() => {
    if (templateType === 'RECEIPT') {
      setCustomHeaderTitle(CUSTOM_HEADER_TITLE_DEFAULT);
      setCustomHeaderSubtitle(CUSTOM_HEADER_SUBTITLE_DEFAULT);
    }
  }, [templateType]);

  useEffect(() => {
    function closeWhenClickOutside(event: MouseEvent) {
      const node = templateDropdownRef.current;
      if (!node) return;
      if (!node.contains(event.target as Node)) setTemplateDropdownOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setTemplateDropdownOpen(false);
    }
    document.addEventListener('mousedown', closeWhenClickOutside);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeWhenClickOutside);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const previewOrderCode = templateType === 'CONFIRM'
    ? 'PO-YYMMDD-001'
    : templateType === 'IMPORT_INVOICE'
      ? 'IMP-INV-YYMMDD-001'
      : 'RCPT-YYMMDD-001';
  const previewFlexJson = JSON.stringify(
    buildPreviewFlexMessage({
      template: selectedTemplateConfig,
      templateType,
      orderCode: previewOrderCode,
      orderId: selectedOrder?.id || 999,
      customerCode: selectedCustomer?.customer_code || 'JWD/000001',
      customHeaderTitle: templateType === 'RECEIPT' ? customHeaderTitle : undefined,
      customHeaderSubtitle: templateType === 'RECEIPT' ? customHeaderSubtitle : undefined,
      bodyIntroText,
      bodyIntroColor: safeBodyIntroColor,
      accountNote: templateType === 'RECEIPT' ? undefined : (selectedAccountMeta?.account_note || undefined),
      footerNote,
      receiptButtonUrl: templateType === 'RECEIPT' ? (receiptButtonUrl || selectedTemplateConfig.button_receipt_url || undefined) : undefined,
      receiptButtonLabel: templateType === 'RECEIPT' ? (receiptButtonLabel || undefined) : undefined,
      accountType: accountType || undefined,
      amount: toNum(amount),
      exchangeRate: toNum(exchangeRate) || undefined,
      exchangeRateCurrency,
      totalAmount: summary.base,
      applyVat,
      applyWithholding,
      vatAmount: summary.vatAmount,
      withholdingAmount: summary.withholdingAmount,
      netTotal: summary.netTotal,
      accountMeta: selectedAccountMeta
        ? {
          label: selectedAccountMeta.label,
          account_name: selectedAccountMeta.account_name,
          account_number: selectedAccountMeta.account_number,
        }
        : null,
    }),
  );

  async function handleEditCode(target?: Customer) {
    const cust = target ?? selectedCustomer;
    if (!cust) return;
    const result = await Swal.fire({
      title: 'แก้ไขรหัสลูกค้า',
      html: `<div style="font-size:13px;color:#546e7a;margin-bottom:8px">${cust.display_name || '-'}</div>`,
      input: 'text',
      inputValue: cust.customer_code,
      inputLabel: 'รหัสลูกค้า',
      inputPlaceholder: 'เช่น JWD/000001',
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#0b57b7',
      cancelButtonColor: '#8a94a4',
      reverseButtons: true,
      didOpen: () => {
        const input = Swal.getInput();
        if (input) input.addEventListener('input', () => { input.value = input.value.toUpperCase(); });
      },
      preConfirm: (value: string) => {
        if (!value?.trim()) { Swal.showValidationMessage('กรุณาใส่รหัสลูกค้า'); return false; }
        return value.trim().toUpperCase();
      },
    });

    if (!result.isConfirmed || !result.value) return;

    const res = await fetch(`/api/customers/${cust.id}/code`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ customer_code: result.value }),
    });
    const data = await res.json();
    if (!res.ok) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: data.error || 'Failed to update', timer: 3000, showConfirmButton: false });
      return;
    }
    setSelectedCustomer((prev) => prev ? { ...prev, customer_code: data.customer_code } : prev);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `บันทึกรหัส ${data.customer_code} สำเร็จ`, timer: 2000, showConfirmButton: false });
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCustomer) return;
    if (needsExistingOrder && !selectedOrder) {
      await Swal.fire({ icon: 'warning', title: 'ยังไม่ได้เลือกคำสั่งซื้อ', text: 'กรุณาเลือกคำสั่งซื้อที่ยืนยันแล้วก่อนส่งเอกสารนี้' });
      return;
    }

    const templateLabel = TEMPLATE_TYPES.find((t) => t.value === templateType)?.label ?? templateType;
    const confirmed = await Swal.fire({
      title: 'ยืนยันการส่งข้อความ?',
      html: `
        <div style="text-align:left;font-size:14px;line-height:2">
          <div><b>ลูกค้า:</b> ${selectedCustomer.customer_code} — ${selectedCustomer.display_name}</div>
          <div><b>Template:</b> ${templateLabel}</div>
          ${selectedOrder ? `<div><b>Order Ref ID:</b> #${selectedOrder.id}</div>` : ''}
          ${selectedOrder ? `<div><b>อ้างอิง Order:</b> ${selectedOrder.order_code}</div>` : ''}
          ${bodyIntroText ? `<div><b>Custom Body:</b> ${bodyIntroText.replace(/\n/g, '<br/>')}</div>` : ''}
          ${footerNote ? `<div><b>Custom Footer:</b> ${footerNote.replace(/\n/g, '<br/>')}</div>` : ''}
          ${summary.netTotal ? `<div><b>ยอดสุทธิ:</b> ${money(summary.netTotal)}</div>` : ''}
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0b57b7',
      cancelButtonColor: '#8a94a4',
      confirmButtonText: 'ส่งข้อความ',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true,
    });
    if (!confirmed.isConfirmed) return;

    setSending(true);
    setResult(null);
    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          templateType,
          customMode: templateType === 'RECEIPT',
          orderId: selectedOrder ? selectedOrder.id : undefined,
          accountType: accountType || undefined,
          customHeaderTitle: templateType === 'RECEIPT' ? (customHeaderTitle || undefined) : undefined,
          customHeaderSubtitle: templateType === 'RECEIPT' ? (customHeaderSubtitle || undefined) : undefined,
          bodyIntroText: bodyIntroText || undefined,
          bodyIntroColor: templateType === 'RECEIPT' ? safeBodyIntroColor : undefined,
          accountNote: templateType === 'RECEIPT' ? undefined : (selectedAccountMeta?.account_note || undefined),
          footerNote: footerNote || undefined,
          receiptButtonLabel: templateType === 'RECEIPT' ? (receiptButtonLabel || undefined) : undefined,
          receiptButtonUrl: templateType === 'RECEIPT' ? (receiptButtonUrl || undefined) : undefined,
          amount: amount ? Number(amount) : undefined,
          exchangeRate: exchangeRate ? Number(exchangeRate) : undefined,
          exchangeRateCurrency,
          totalAmount: summary.base || undefined,
          applyVat,
          applyWithholding,
          vatAmount: summary.vatAmount || undefined,
          withholdingAmount: summary.withholdingAmount || undefined,
          netTotal: summary.netTotal || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResult({ ok: false, lineError: extractApiError(data) });
        Swal.fire({ icon: 'error', title: 'ส่งไม่สำเร็จ', text: extractApiError(data) });
        return;
      }
      setResult(data);
      Swal.fire({
        icon: 'success',
        title: 'ส่งสำเร็จ!',
        text: data.orderId ? `Order Ref #${data.orderId} • ${data.orderCode}` : `Order: ${data.orderCode}`,
        timer: 2200,
        showConfirmButton: false,
      });
    } catch {
      setResult({ ok: false, lineError: 'Unable to connect' });
      Swal.fire({ icon: 'error', title: 'เชื่อมต่อไม่ได้', text: 'Unable to connect to server' });
    } finally {
      setSending(false);
    }
  }

  return (
    <section>
      <h1 className="page-title">ส่งข้อความ Flex Message</h1>
      <p className="page-subtitle">ส่งคำสั่งซื้อ, ใบแจ้งหนี้นำเข้า หรือส่งข้อความแบบกำหนดเองให้ลูกค้า</p>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(320px, 1fr) minmax(300px, 420px)', alignItems: 'start' }}>
        <div className="table-shell" style={{ padding: 18 }}>
          <form onSubmit={handleSend}>
            <label className="field-label">Customer *</label>
            {selectedCustomer ? (
              <div className="input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ecf9f2', marginBottom: 10 }}>
                <span><strong>{selectedCustomer.customer_code}</strong> - {selectedCustomer.display_name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => handleEditCode()}
                    title="แก้ไขรหัสลูกค้า"
                    style={{ background: 'transparent', border: '1px solid #aacfb5', borderRadius: 5, padding: '2px 7px', cursor: 'pointer', fontSize: 11, color: '#2e7d32' }}
                  >
                    ✎ แก้ไขรหัส
                  </button>
                  <button type="button" onClick={() => { setSelectedCustomer(null); setSearch(''); }} style={{ background: 'transparent', border: 0, cursor: 'pointer', fontSize: 14, color: '#546e7a' }}>✕</button>
                </div>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  style={{ width: '100%' }}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or code"
                />
                {suggestions.length > 0 && (
                  <div className="table-shell" style={{ position: 'absolute', top: 44, zIndex: 20, width: '100%', background: '#fff' }}>
                    {suggestions.map((c) => (
                      <div
                        key={c.id}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f3f7' }}
                      >
                        <button
                          type="button"
                          style={{ flex: 1, textAlign: 'left', border: 0, background: '#fff', padding: 10, cursor: 'pointer' }}
                          onClick={() => { setSelectedCustomer(c); setSuggestions([]); }}
                        >
                          <strong>{c.customer_code}</strong> - {c.display_name}
                        </button>
                        <button
                          type="button"
                          title="แก้ไขรหัสลูกค้า"
                          style={{ background: 'transparent', border: '1px solid #dde2ea', borderRadius: 5, padding: '3px 8px', margin: '0 8px', cursor: 'pointer', fontSize: 11, color: '#546e7a', whiteSpace: 'nowrap' }}
                          onClick={() => { setSelectedCustomer(c); setSuggestions([]); handleEditCode(c); }}
                        >
                          ✎ แก้ไขรหัส
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <label className="field-label">Template *</label>
            <div
              ref={templateDropdownRef}
              style={{
                position: 'relative',
                borderRadius: 14,
                padding: 4,
                border: '1px solid #dbe6f8',
                background: 'linear-gradient(180deg, #f6faff 0%, #fff9ef 100%)',
              }}
            >
              <button
                type="button"
                onClick={() => setTemplateDropdownOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={templateDropdownOpen}
                style={{
                  width: '100%',
                  minHeight: 50,
                  borderRadius: 12,
                  border: templateDropdownOpen ? '2px solid #0b57b7' : '2px solid #f3b261',
                  background: templateDropdownOpen
                    ? 'linear-gradient(180deg, #eef5ff 0%, #f9fbff 100%)'
                    : 'linear-gradient(180deg, #fff8ee 0%, #ffffff 100%)',
                  color: '#1f2a44',
                  cursor: 'pointer',
                  padding: '9px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: templateDropdownOpen ? '0 0 0 3px rgba(11, 87, 183, 0.16)' : '0 4px 10px rgba(24, 33, 52, 0.06)',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: selectedTemplateOption.accent, flexShrink: 0 }} />
                  <span style={{ textAlign: 'left', fontWeight: 800, fontSize: 17, lineHeight: 1.2 }}>{selectedTemplateOption.label}</span>
                </span>
                <span style={{ fontSize: 14, color: '#0b57b7', fontWeight: 800 }}>{templateDropdownOpen ? '▲' : '▼'}</span>
              </button>

              {templateDropdownOpen && (
                <div
                  role="listbox"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    right: 0,
                    border: '1px solid #d7e0ee',
                    borderRadius: 12,
                    background: 'linear-gradient(180deg, #ffffff 0%, #f7faff 100%)',
                    padding: 6,
                    display: 'grid',
                    gap: 4,
                    zIndex: 30,
                    boxShadow: '0 12px 28px rgba(19, 31, 53, 0.14)',
                  }}
                >
                  {TEMPLATE_TYPES.map((t) => {
                    const active = t.value === templateType;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => {
                          setTemplateType(t.value);
                          setTemplateDropdownOpen(false);
                        }}
                        style={{
                          width: '100%',
                          border: active ? `1px solid ${t.accent}` : '1px solid #edf1f7',
                          background: active
                            ? `linear-gradient(180deg, ${t.accent}24 0%, ${t.accent}16 100%)`
                            : 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
                          borderRadius: 9,
                          cursor: 'pointer',
                          textAlign: 'left',
                          padding: '9px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          color: '#21304d',
                          fontWeight: active ? 800 : 600,
                          fontSize: 14,
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 999, background: t.accent, flexShrink: 0 }} />
                          <span>{t.label}</span>
                        </span>
                        {active && <span style={{ fontSize: 12, color: t.accent, fontWeight: 800 }}>Selected</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <label className="field-label">Custom Body Text</label>
            <textarea
              className="input"
              style={{ width: '100%', minHeight: 96, resize: 'vertical' }}
              value={bodyIntroText}
              onChange={(e) => setBodyIntroText(e.target.value)}
            />

            {templateType === 'RECEIPT' && (
              <>
                <label className="field-label">Header Title</label>
                <input
                  className="input"
                  style={{ width: '100%' }}
                  type="text"
                  value={customHeaderTitle}
                  onChange={(e) => setCustomHeaderTitle(e.target.value)}
                  placeholder={CUSTOM_HEADER_TITLE_DEFAULT}
                />

                <label className="field-label">Header Subtitle</label>
                <input
                  className="input"
                  style={{ width: '100%' }}
                  type="text"
                  value={customHeaderSubtitle}
                  onChange={(e) => setCustomHeaderSubtitle(e.target.value)}
                  placeholder={CUSTOM_HEADER_SUBTITLE_DEFAULT}
                />

                <label className="field-label">Custom Body Color</label>
                <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 64px' }}>
                  <input
                    className="input"
                    style={{ width: '100%' }}
                    type="text"
                    value={bodyIntroColor}
                    onChange={(e) => setBodyIntroColor(e.target.value)}
                    placeholder="#0b57b7"
                  />
                  <input
                    type="color"
                    value={safeBodyIntroColor}
                    onChange={(e) => setBodyIntroColor(e.target.value)}
                    style={{ width: '100%', height: 42, border: 0, background: 'transparent' }}
                  />
                </div>

                <label className="field-label">Custom Button Name</label>
                <input
                  className="input"
                  style={{ width: '100%' }}
                  type="text"
                  value={receiptButtonLabel}
                  onChange={(e) => setReceiptButtonLabel(e.target.value)}
                  placeholder={selectedTemplateConfig.button_receipt_label || 'คลิกที่นี้'}
                />

                <label className="field-label">Custom Button URL</label>
                <input
                  className="input"
                  style={{ width: '100%' }}
                  type="url"
                  value={receiptButtonUrl}
                  onChange={(e) => setReceiptButtonUrl(e.target.value)}
                  placeholder={selectedTemplateConfig.button_receipt_url || 'https://...'}
                />
              </>
            )}

            <label className="field-label">Custom Footer</label>
            {templateType !== 'RECEIPT' && selectedAccountMeta?.account_note && (
              <div style={{ padding: '6px 10px', background: '#f0f4ff', borderRadius: 8, border: '1px solid #c7d7f5', marginBottom: 6, fontSize: 12, color: '#1a3a6e', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <span style={{ opacity: 0.5, fontSize: 11, whiteSpace: 'nowrap', marginTop: 1 }}>auto ▸</span>
                <span style={{ whiteSpace: 'pre-line' }}>{selectedAccountMeta.account_note}</span>
              </div>
            )}
            <textarea
              className="input"
              style={{ width: '100%', minHeight: 60, resize: 'vertical' }}
              value={footerNote}
              onChange={(e) => setFooterNote(e.target.value)}
              placeholder={'บันทึกเพิ่มเติม / Thank You'}
            />

            {needsExistingOrder && (
              <>
                <label className="field-label">Order อ้างอิง *</label>
                <select
                  className="select"
                  style={{ width: '100%' }}
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  disabled={!selectedCustomer || loadingOrders || eligibleOrders.length === 0}
                >
                  <option value="">
                    {loadingOrders ? 'กำลังโหลด order...' : eligibleOrders.length === 0 ? 'ไม่มี order ที่ยืนยันแล้ว' : '-- Select Order --'}
                  </option>
                  {eligibleOrders.map((order) => (
                    <option key={order.id} value={order.id}>
                      #{order.id} • {order.order_code} • {statusLabel(order.status)}
                    </option>
                  ))}
                </select>

                {selectedOrder && (
                  <div style={{ marginTop: 8, borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                    <button
                      type="button"
                      onClick={() => setShowOrderDetail((v) => !v)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fb', border: 0, padding: '8px 12px', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: '#0f172a' }}
                    >
                      <span>{selectedOrder.order_code} <span style={{ fontWeight: 400, color: '#8a94a4', fontSize: 12 }}>#{selectedOrder.id}</span></span>
                      <span style={{ fontSize: 11, color: '#8a94a4' }}>{showOrderDetail ? '▲ ซ่อน' : '▼ รายละเอียด'}</span>
                    </button>
                    {showOrderDetail && (
                      <div style={{ padding: '10px 12px', display: 'grid', gap: 5, fontSize: 13, color: '#475569' }}>
                        <div>สถานะ: {statusLabel(selectedOrder.status)}</div>
                        <div>Stage: {selectedOrder.stage}</div>
                        <div>ประเภทบัญชี: {selectedOrder.account_type || '-'}</div>
                        <div>จำนวนเงิน: {money(Number(selectedOrder.amount || 0))}</div>
                        <div>อัตราแลกเปลี่ยน: {selectedOrder.exchange_rate != null ? `${parseFloat(Number(selectedOrder.exchange_rate).toFixed(2))} ${selectedOrder.exchange_rate_currency || 'CNY'}` : '-'}</div>
                        <div>ยอดสุทธิ: {money(Number(selectedOrder.total_amount || 0))}</div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {templateType !== 'RECEIPT' && (
              <>
                <label className="field-label">Account Type</label>
                <select
                  className="select"
                  style={{ width: '100%' }}
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                >
                  <option value="">-- Select Account Type --</option>
                  {accountTypes.map((a) => (
                    <option key={a.id} value={a.code}>
                      {a.label} ({a.code})
                    </option>
                  ))}
                </select>

                <label className="field-label">Amount</label>
                <input className="input" style={{ width: '100%' }} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} step="0.01" />

                <label className="field-label">Exchange Rate</label>
                <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 110px' }}>
                  <input className="input" style={{ width: '100%' }} type="number" value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)} step="0.000001" />
                  <select
                    className="select"
                    style={{ width: '100%' }}
                    value={exchangeRateCurrency}
                    onChange={(e) => setExchangeRateCurrency(e.target.value as 'USD' | 'CNY' | 'THB')}
                  >
                    <option value="CNY">CNY</option>
                    <option value="USD">USD</option>
                    <option value="THB">THB</option>
                  </select>
                </div>

                <label className="field-label">Total (ฐานคำนวณ)</label>
                <input
                  className="input"
                  style={{ width: '100%', background: '#f7f8fb', color: '#344054' }}
                  type="text"
                  value={summary.base.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  readOnly
                />

                <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: '#2a3547' }}>
                    <input type="checkbox" checked={applyVat} onChange={(e) => setApplyVat(e.target.checked)} />
                    Vat 7% (ภาษีมูลค่าเพิ่ม)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: '#2a3547' }}>
                    <input type="checkbox" checked={applyWithholding} onChange={(e) => setApplyWithholding(e.target.checked)} />
                    หัก ณ ที่จ่าย 3%
                  </label>
                </div>
              </>
            )}

            {result && (
              <div className={`badge ${result.ok ? 'badge-success' : 'badge-danger'}`} style={{ marginTop: 14 }}>
                {result.ok
                  ? `Sent successfully (${result.orderId ? `#${result.orderId} • ` : ''}${result.orderCode})`
                  : (result.lineError || 'Error')}
              </div>
            )}

            <button
              className="btn btn-primary"
              type="submit"
              disabled={!selectedCustomer || sending || (needsExistingOrder && !selectedOrder)}
              style={{ marginTop: 16, width: '100%' }}
            >
              {sending ? 'Sending...' : 'ส่ง Flex Message'}
            </button>
          </form>
        </div>

        <aside className="table-shell" style={{ padding: 14, position: 'sticky', top: 12 }}>
          <p style={{ fontWeight: 800, color: '#0b57b7', marginBottom: 10 }}>Flex Preview</p>
          {selectedOrder && <p className="info-note" style={{ marginTop: 0, marginBottom: 10 }}>Order Ref #{selectedOrder.id}</p>}
          <FlexPreview json={previewFlexJson} />
        </aside>
      </div>
    </section>
  );
}
