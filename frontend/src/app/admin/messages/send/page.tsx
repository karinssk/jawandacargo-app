'use client';

import { useEffect, useMemo, useState } from 'react';
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
  { value: 'RECEIPT', label: 'ใบเสร็จ', accent: '#6a1b9a', footer: 'ใบเสร็จสำหรับรายการที่ยืนยันแล้ว' },
] as const;

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
  const [accountType, setAccountType] = useState('');
  const [accountTypes, setAccountTypes] = useState<AccountTypeOption[]>([]);
  const [templateConfigs, setTemplateConfigs] = useState<TemplatePreviewConfig[]>([]);
  const [customerOrders, setCustomerOrders] = useState<OrderOption[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [bodyIntroText, setBodyIntroText] = useState('');
  const [footerNote, setFooterNote] = useState('');
  const [amount, setAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState('');
  const [exchangeRateCurrency, setExchangeRateCurrency] = useState<'USD' | 'CNY' | 'THB'>('CNY');
  const [applyVat, setApplyVat] = useState(false);
  const [applyWithholding, setApplyWithholding] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; orderId?: number; orderCode?: string; lineError?: string } | null>(null);
  const [editingCode, setEditingCode] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [savingCode, setSavingCode] = useState(false);

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

  const needsExistingOrder = templateType !== 'CONFIRM';
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
    if (!exchangeRate && selectedOrder.exchange_rate != null) {
      setExchangeRate(String(selectedOrder.exchange_rate));
    }
    if (selectedOrder.exchange_rate_currency) {
      setExchangeRateCurrency(selectedOrder.exchange_rate_currency);
    }
  }, [selectedOrder, accountType, exchangeRate]);

  const autoBaseAmount = useMemo(() => toNum(amount) * toNum(exchangeRate), [amount, exchangeRate]);

  const summary = useMemo(() => {
    const base = autoBaseAmount;
    const vatAmount = applyVat ? base * 0.07 : 0;
    const withholdingAmount = applyWithholding ? base * 0.03 : 0;
    const netTotal = base + vatAmount - withholdingAmount;
    return { base, vatAmount, withholdingAmount, netTotal };
  }, [autoBaseAmount, applyVat, applyWithholding]);

  const selectedTemplateConfig = templateConfigs.find((item) => item.template_type === templateType) || DEFAULT_TEMPLATE_CONFIGS[templateType];
  const selectedAccountMeta = accountTypes.find((item) => item.code === accountType) || null;

  const defaultBodyIntroText: Record<TemplateType, string> = {
    CONFIRM: 'รายละเอียดออเดอร์สำหรับ {{customer_name}}\nยอดสุทธิ {{net_total}}\nกรุณาตรวจสอบข้อมูลให้เรียบร้อย',
    IMPORT_INVOICE: 'รายละเอียดใบแจ้งหนี้นำเข้าสำหรับ {{customer_name}}\nยอดสุทธิ {{net_total}}\nกรุณาชำระค่าใช้จ่ายตามบิลนี้',
    RECEIPT: 'ใบเสร็จรับเงินสำหรับ {{customer_name}}\nยอดสุทธิ {{net_total}}\nขอบคุณที่ใช้บริการ',
  };

  useEffect(() => {
    setBodyIntroText(selectedTemplateConfig.body_intro_text || defaultBodyIntroText[templateType]);
    setFooterNote(selectedTemplateConfig.footer_note || '');
  }, [selectedTemplateConfig.template_type, selectedTemplateConfig.body_intro_text, selectedTemplateConfig.footer_note]);

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
      customerName: selectedCustomer?.display_name || 'P\'rin',
      bodyIntroText,
      footerNote,
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

  async function handleSaveCode() {
    if (!selectedCustomer || !codeInput.trim()) return;
    setSavingCode(true);
    try {
      const res = await fetch(`/api/customers/${selectedCustomer.id}/code`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ customer_code: codeInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || 'Failed to update code'); return; }
      setSelectedCustomer((prev) => prev ? { ...prev, customer_code: data.customer_code } : prev);
      setEditingCode(false);
    } finally {
      setSavingCode(false);
    }
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
          orderId: selectedOrder ? selectedOrder.id : undefined,
          accountType: accountType || undefined,
          bodyIntroText: bodyIntroText || undefined,
          footerNote: footerNote || undefined,
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
      <p className="page-subtitle">เริ่มต้นด้วยคำสั่งซื้อสินค้า แล้วค่อยส่งใบแจ้งหนี้นำเข้าและใบเสร็จตาม order เดิม</p>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(320px, 1fr) minmax(300px, 420px)', alignItems: 'start' }}>
        <div className="table-shell" style={{ padding: 18 }}>
          <form onSubmit={handleSend}>
            <label className="field-label">Customer *</label>
            {selectedCustomer ? (
              <div style={{ marginBottom: 10 }}>
                <div className="input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ecf9f2' }}>
                  <span><strong>{selectedCustomer.customer_code}</strong> - {selectedCustomer.display_name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => { setCodeInput(selectedCustomer.customer_code); setEditingCode(true); }}
                      title="แก้ไขรหัสลูกค้า"
                      style={{ background: 'transparent', border: '1px solid #aacfb5', borderRadius: 5, padding: '2px 7px', cursor: 'pointer', fontSize: 11, color: '#2e7d32' }}
                    >
                      ✎ แก้ไขรหัส
                    </button>
                    <button type="button" onClick={() => { setSelectedCustomer(null); setSearch(''); setEditingCode(false); }} style={{ background: 'transparent', border: 0, cursor: 'pointer', fontSize: 14, color: '#546e7a' }}>✕</button>
                  </div>
                </div>
                {editingCode && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                    <input
                      className="input"
                      style={{ flex: 1, padding: '4px 8px', fontSize: 13 }}
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveCode();
                        if (e.key === 'Escape') setEditingCode(false);
                      }}
                      placeholder="เช่น JWD/000001"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveCode}
                      disabled={savingCode}
                      style={{ background: '#0b57b7', color: '#fff', border: 0, borderRadius: 6, padding: '4px 12px', fontSize: 13, cursor: 'pointer' }}
                    >
                      {savingCode ? '...' : 'บันทึก'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCode(false)}
                      style={{ background: '#f1f3f7', border: 0, borderRadius: 6, padding: '4px 10px', fontSize: 13, cursor: 'pointer' }}
                    >
                      ยกเลิก
                    </button>
                  </div>
                )}
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
                          onClick={() => { setSelectedCustomer(c); setSuggestions([]); setEditingCode(false); }}
                        >
                          <strong>{c.customer_code}</strong> - {c.display_name}
                        </button>
                        <button
                          type="button"
                          title="แก้ไขรหัสลูกค้า"
                          style={{ background: 'transparent', border: '1px solid #dde2ea', borderRadius: 5, padding: '3px 8px', margin: '0 8px', cursor: 'pointer', fontSize: 11, color: '#546e7a', whiteSpace: 'nowrap' }}
                          onClick={() => { setSelectedCustomer(c); setSuggestions([]); setCodeInput(c.customer_code); setEditingCode(true); }}
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
            <select className="select" style={{ width: '100%' }} value={templateType} onChange={(e) => setTemplateType(e.target.value as TemplateType)}>
              {TEMPLATE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            <label className="field-label">Custom Body Text</label>
            <textarea
              className="input"
              style={{ width: '100%', minHeight: 96, resize: 'vertical' }}
              value={bodyIntroText}
              onChange={(e) => setBodyIntroText(e.target.value)}
            />

            <label className="field-label">Custom Footer</label>
            <textarea
              className="input"
              style={{ width: '100%', minHeight: 72, resize: 'vertical' }}
              value={footerNote}
              onChange={(e) => setFooterNote(e.target.value)}
              placeholder={'บัญชีโอนสินค้าออก ในนามบริษัทฯ เท่านั้น\nThank You'}
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
                  <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: '#f7f8fb', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>{selectedOrder.order_code}</div>
                    <div style={{ display: 'grid', gap: 6, fontSize: 13, color: '#475569' }}>
                      <div>Order Ref ID: #{selectedOrder.id}</div>
                      <div>สถานะ: {statusLabel(selectedOrder.status)}</div>
                      <div>Stage: {selectedOrder.stage}</div>
                      <div>ประเภทบัญชี: {selectedOrder.account_type || '-'}</div>
                      <div>จำนวนเงิน: {money(Number(selectedOrder.amount || 0))}</div>
                      <div>อัตราแลกเปลี่ยน: {selectedOrder.exchange_rate != null ? `${selectedOrder.exchange_rate} ${selectedOrder.exchange_rate_currency || 'CNY'}` : '-'}</div>
                      <div>ยอดสุทธิ: {money(Number(selectedOrder.total_amount || 0))}</div>
                    </div>
                  </div>
                )}
              </>
            )}

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
