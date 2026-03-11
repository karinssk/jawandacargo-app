'use client';

import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';

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
  expires_at: string | null;
  confirmed_at: string | null;
  created_at: string;
}

const TEMPLATE_TYPES = [
  { value: 'IMPORT_INVOICE', label: 'ใบแจ้งหนี้นำเข้า (Import Invoice)', accent: '#1565c0', footer: 'กรุณายืนยันภายใน 24 ชั่วโมง' },
  { value: 'CONFIRM', label: 'ยืนยันคำสั่งซื้อ', accent: '#2e7d32', footer: 'คำสั่งซื้อได้รับการยืนยันเรียบร้อยแล้ว' },
  { value: 'RECEIPT', label: 'ใบเสร็จ', accent: '#6a1b9a', footer: 'ใบเสร็จสำหรับรายการที่ยืนยันแล้ว' },
] as const;

type TemplateType = typeof TEMPLATE_TYPES[number]['value'];

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
  const [templateType, setTemplateType] = useState<TemplateType>('IMPORT_INVOICE');
  const [accountType, setAccountType] = useState('');
  const [accountTypes, setAccountTypes] = useState<AccountTypeOption[]>([]);
  const [customerOrders, setCustomerOrders] = useState<OrderOption[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [amount, setAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState('');
  const [exchangeRateCurrency, setExchangeRateCurrency] = useState<'USD' | 'CNY' | 'THB'>('CNY');
  const [applyVat, setApplyVat] = useState(false);
  const [applyWithholding, setApplyWithholding] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; orderCode?: string; lineError?: string } | null>(null);

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

  const needsExistingOrder = templateType !== 'IMPORT_INVOICE';
  const eligibleOrders = useMemo(
    () => customerOrders.filter((order) => order.template_type === 'IMPORT_INVOICE' && order.status === 'CONFIRMED'),
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

  const autoBaseAmount = useMemo(() => toNum(amount) * toNum(exchangeRate), [amount, exchangeRate]);

  const summary = useMemo(() => {
    const base = autoBaseAmount;
    const vatAmount = applyVat ? base * 0.07 : 0;
    const withholdingAmount = applyWithholding ? base * 0.03 : 0;
    const netTotal = base + vatAmount - withholdingAmount;
    return { base, vatAmount, withholdingAmount, netTotal };
  }, [autoBaseAmount, applyVat, applyWithholding]);

  const effectiveAccountType = needsExistingOrder ? selectedOrder?.account_type || '' : accountType;
  const effectiveAmount = needsExistingOrder ? Number(selectedOrder?.amount || 0) : toNum(amount);
  const effectiveExchangeRate = needsExistingOrder ? Number(selectedOrder?.exchange_rate || 0) : toNum(exchangeRate);
  const effectiveExchangeRateCurrency = needsExistingOrder ? selectedOrder?.exchange_rate_currency || 'CNY' : exchangeRateCurrency;
  const effectiveBase = needsExistingOrder ? Number(selectedOrder?.total_amount || 0) : summary.base;
  const effectiveNetTotal = needsExistingOrder ? Number(selectedOrder?.total_amount || 0) : summary.netTotal;

  const meta = TEMPLATE_TYPES.find((x) => x.value === templateType) || TEMPLATE_TYPES[0];
  const previewOrderCode = selectedOrder?.order_code || 'IMP-INV-YYMMDD-001';

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
          ${selectedOrder ? `<div><b>อ้างอิง Order:</b> ${selectedOrder.order_code}</div>` : ''}
          ${effectiveNetTotal ? `<div><b>ยอดสุทธิ:</b> ${money(effectiveNetTotal)}</div>` : ''}
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
          accountType: needsExistingOrder ? undefined : accountType || undefined,
          amount: needsExistingOrder ? undefined : (amount ? Number(amount) : undefined),
          exchangeRate: needsExistingOrder ? undefined : (exchangeRate ? Number(exchangeRate) : undefined),
          exchangeRateCurrency,
          totalAmount: needsExistingOrder ? undefined : (summary.base || undefined),
          applyVat: needsExistingOrder ? undefined : applyVat,
          applyWithholding: needsExistingOrder ? undefined : applyWithholding,
          vatAmount: needsExistingOrder ? undefined : (summary.vatAmount || undefined),
          withholdingAmount: needsExistingOrder ? undefined : (summary.withholdingAmount || undefined),
          netTotal: needsExistingOrder ? undefined : (summary.netTotal || undefined),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResult({ ok: false, lineError: extractApiError(data) });
        Swal.fire({ icon: 'error', title: 'ส่งไม่สำเร็จ', text: extractApiError(data) });
        return;
      }
      setResult(data);
      Swal.fire({ icon: 'success', title: 'ส่งสำเร็จ!', text: `Order: ${data.orderCode}`, timer: 2000, showConfirmButton: false });
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
      <p className="page-subtitle">สร้าง Import Invoice ใหม่ หรือส่งเอกสารต่อเนื่องจาก order เดิมที่ยืนยันแล้ว</p>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(320px, 1fr) minmax(300px, 420px)', alignItems: 'start' }}>
        <div className="table-shell" style={{ padding: 18 }}>
          <form onSubmit={handleSend}>
            <label className="field-label">Customer *</label>
            {selectedCustomer ? (
              <div className="input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ecf9f2', marginBottom: 10 }}>
                <span>{selectedCustomer.customer_code} - {selectedCustomer.display_name}</span>
                <button type="button" onClick={() => { setSelectedCustomer(null); setSearch(''); }} style={{ background: 'transparent', border: 0, cursor: 'pointer' }}>x</button>
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
                      <button
                        key={c.id}
                        type="button"
                        style={{ width: '100%', textAlign: 'left', border: 0, background: '#fff', padding: 10, borderBottom: '1px solid #f1f3f7', cursor: 'pointer' }}
                        onClick={() => { setSelectedCustomer(c); setSuggestions([]); }}
                      >
                        <strong>{c.customer_code}</strong> - {c.display_name}
                      </button>
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

            {needsExistingOrder ? (
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
                      {order.order_code} • {statusLabel(order.status)}
                    </option>
                  ))}
                </select>

                {selectedOrder && (
                  <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: '#f7f8fb', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>{selectedOrder.order_code}</div>
                    <div style={{ display: 'grid', gap: 6, fontSize: 13, color: '#475569' }}>
                      <div>สถานะ: {statusLabel(selectedOrder.status)}</div>
                      <div>ประเภทบัญชี: {selectedOrder.account_type || '-'}</div>
                      <div>จำนวนเงิน: {money(Number(selectedOrder.amount || 0))}</div>
                      <div>อัตราแลกเปลี่ยน: {selectedOrder.exchange_rate != null ? `${selectedOrder.exchange_rate} ${selectedOrder.exchange_rate_currency || 'CNY'}` : '-'}</div>
                      <div>ยอดสุทธิ: {money(Number(selectedOrder.total_amount || 0))}</div>
                    </div>
                  </div>
                )}
              </>
            ) : (
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
                {result.ok ? `Sent successfully (${result.orderCode})` : (result.lineError || 'Error')}
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
          <div style={{ border: '1px solid #eceff4', borderRadius: 16, overflow: 'hidden', background: '#fff' }}>
            <div style={{ background: meta.accent, color: '#fff', padding: '12px 14px' }}>
              <p style={{ fontSize: 15, fontWeight: 800 }}>{meta.label}</p>
              <p style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>{previewOrderCode}</p>
            </div>
            <div style={{ padding: 12, display: 'grid', gap: 8 }}>
              <PreviewRow label="ประเภทบัญชี" value={effectiveAccountType || '-'} />
              <PreviewRow label="จำนวนเงิน" value={money(effectiveAmount)} />
              <PreviewRow label="อัตราแลกเปลี่ยน" value={effectiveExchangeRate ? `${effectiveExchangeRate} ${effectiveExchangeRateCurrency}` : '-'} />
              <PreviewRow label="ยอดฐาน" value={money(effectiveBase)} />
              {!needsExistingOrder && applyVat && <PreviewRow label="VAT 7%" value={money(summary.vatAmount)} />}
              {!needsExistingOrder && applyWithholding && <PreviewRow label="หัก ณ ที่จ่าย 3%" value={money(summary.withholdingAmount)} />}
              <PreviewRow label="ยอดสุทธิ" value={money(effectiveNetTotal)} emphasize />
              <div style={{ borderTop: '1px solid #eef2f7', marginTop: 2, paddingTop: 8, fontSize: 12, color: '#64748b' }}>
                {meta.footer}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function PreviewRow({ label, value, emphasize = false }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13, borderBottom: '1px solid #f2f4f8', paddingBottom: 6 }}>
      <span style={{ color: '#64748b' }}>{label}</span>
      <span style={{ fontWeight: emphasize ? 800 : 600, color: emphasize ? '#c95b00' : '#0f172a', textAlign: 'right' }}>{value}</span>
    </div>
  );
}
