'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FlexPreview from './FlexPreview';
import {
  UserIcon, UserPlusIcon, GlobeIcon, LinkIcon,
  PackageIcon, MessageIcon, MailIcon, ChartIcon, ClockIcon,
} from '../../icons';
import Link from 'next/link';

interface Customer {
  id: number;
  customer_code: string;
  line_uid: string;
  display_name: string;
  picture_url: string;
  source_type: string;
  is_blocked: boolean;
  created_at: string;
}

interface Session {
  tracking_id: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  source_url: string;
  ip: string;
  follow_requested_at: string | null;
  linked_at: string | null;
  created_at: string;
}

interface Order {
  id: number;
  order_code: string;
  template_type: string;
  account_type: string;
  amount: number;
  exchange_rate: number;
  total_amount: number;
  status: string;
  expires_at: string;
  confirmed_at: string | null;
  created_at: string;
}

interface MessageLog {
  id: number;
  order_id: number | null;
  template_type: string;
  message_text: string;
  line_error: string | null;
  sent_at: string;
}

type TimelineEntry =
  | { kind: 'join'; date: string; customer: Customer }
  | { kind: 'session'; date: string; session: Session }
  | { kind: 'linked'; date: string; session: Session }
  | { kind: 'order'; date: string; order: Order }
  | { kind: 'message'; date: string; msg: MessageLog };

function fmt(iso: string) {
  return new Date(iso).toLocaleString('th-TH', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    PENDING: 'badge-warning',
    CONFIRMED: 'badge-success',
    UNCONFIRMED: 'badge-danger',
  };
  return map[status] || 'badge-soft';
}

function templateLabel(t: string) {
  const map: Record<string, string> = {
    IMPORT_INVOICE: 'ใบแจ้งหนี้นำเข้า',
    CONFIRM: 'คำสั่งซื้อสินค้า',
    RECEIPT: 'ใบเสร็จรับเงิน',
    WELCOME: 'ข้อความต้อนรับ',
    INBOUND: 'ข้อความจากลูกค้า',
  };
  return map[t] || t;
}

function DotIcon({ icon, color }: { icon: React.ReactNode; color: string }) {
  return (
    <div style={{
      position: 'absolute',
      left: -23,
      top: 2,
      width: 22,
      height: 22,
      borderRadius: '50%',
      background: color + '18',
      border: `2px solid ${color}`,
      display: 'grid',
      placeItems: 'center',
    }}>
      {icon}
    </div>
  );
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<MessageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCode, setEditingCode] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [savingCode, setSavingCode] = useState(false);

  useEffect(() => {
    fetch(`/api/customers/${id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        setCustomer(data.customer);
        setSessions(data.sessions || []);
        setOrders(data.orders || []);
        setMessages(data.messages || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSaveCode() {
    if (!customer || !codeInput.trim()) return;
    setSavingCode(true);
    try {
      const res = await fetch(`/api/customers/${customer.id}/code`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ customer_code: codeInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || 'Failed to update code'); return; }
      setCustomer((prev) => prev ? { ...prev, customer_code: data.customer_code } : prev);
      setEditingCode(false);
    } finally {
      setSavingCode(false);
    }
  }

  if (loading) return <p className="page-subtitle">Loading...</p>;
  if (!customer) return <p className="page-subtitle">ไม่พบข้อมูลลูกค้า</p>;

  const timeline: TimelineEntry[] = [];
  timeline.push({ kind: 'join', date: customer.created_at, customer });
  for (const s of sessions) {
    timeline.push({ kind: 'session', date: s.created_at, session: s });
    if (s.linked_at) timeline.push({ kind: 'linked', date: s.linked_at, session: s });
  }
  for (const o of orders) timeline.push({ kind: 'order', date: o.created_at, order: o });
  for (const m of messages) timeline.push({ kind: 'message', date: m.sent_at, msg: m });
  timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <section>
      <button type="button" className="btn btn-soft" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => router.back()}>
        ← กลับ
      </button>

      {/* Customer header */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 24 }}>
        {customer.picture_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={customer.picture_url} alt="" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid #e8edf6' }} />
        ) : (
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#e8edf6', display: 'grid', placeItems: 'center' }}>
            <UserIcon size={32} color="#8a94a4" />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 className="page-title" style={{ margin: 0 }}>{customer.display_name || '-'}</h1>
            <span className={`badge ${customer.is_blocked ? 'badge-danger' : 'badge-success'}`}>
              {customer.is_blocked ? 'Blocked' : 'Active'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 0', flexWrap: 'wrap' }}>
            {editingCode ? (
              <>
                <input
                  className="input"
                  style={{ width: 140, padding: '3px 8px', fontSize: 13 }}
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveCode();
                    if (e.key === 'Escape') setEditingCode(false);
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveCode}
                  disabled={savingCode}
                  style={{ background: '#0b57b7', color: '#fff', border: 0, borderRadius: 6, padding: '3px 10px', fontSize: 12, cursor: 'pointer' }}
                >
                  {savingCode ? '...' : 'บันทึก'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCode(false)}
                  style={{ background: '#f1f3f7', border: 0, borderRadius: 6, padding: '3px 10px', fontSize: 12, cursor: 'pointer' }}
                >
                  ยกเลิก
                </button>
              </>
            ) : (
              <>
                <span className="page-subtitle" style={{ margin: 0, fontFamily: 'monospace' }}>{customer.customer_code}</span>
                <button
                  type="button"
                  onClick={() => { setCodeInput(customer.customer_code); setEditingCode(true); }}
                  title="แก้ไขรหัสลูกค้า"
                  style={{ background: 'transparent', border: '1px solid #dde2ea', borderRadius: 5, padding: '2px 7px', cursor: 'pointer', fontSize: 12, color: '#546e7a' }}
                >
                  ✎ แก้ไขรหัส
                </button>
              </>
            )}
            <span className="page-subtitle" style={{ margin: 0 }}>· LINE UID: {customer.line_uid || '-'}</span>
          </div>
          <p className="page-subtitle" style={{ margin: '2px 0 0', fontSize: 12 }}>
            สมัครเมื่อ {fmt(customer.created_at)}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
          {[
            { label: 'Sessions', value: sessions.length },
            { label: 'Orders', value: orders.length },
            { label: 'Messages', value: messages.length },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center', background: '#f4f7fb', borderRadius: 12, padding: '10px 18px' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0b57b7' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#8a94a4', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* UTM sessions summary */}
      {sessions.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#2b3550', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ChartIcon size={16} color="#0b57b7" /> UTM Sessions ({sessions.length})
          </h2>
          <div className="table-shell">
            <table className="table" style={{ fontSize: 13 }}>
              <thead>
                <tr>
                  {['Source', 'Medium', 'Campaign', 'Follow Requested', 'Linked', 'เยี่ยมชม'].map((h) => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.tracking_id}>
                    <td>{s.utm_source || '-'}</td>
                    <td>{s.utm_medium || '-'}</td>
                    <td>{s.utm_campaign || '-'}</td>
                    <td>{s.follow_requested_at ? fmt(s.follow_requested_at) : '-'}</td>
                    <td>{s.linked_at ? fmt(s.linked_at) : '-'}</td>
                    <td>{fmt(s.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders table */}
      {orders.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#2b3550', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <PackageIcon size={16} color="#f57c00" /> คำสั่งซื้อ ({orders.length})
          </h2>
          <div className="table-shell">
            <table className="table" style={{ fontSize: 13 }}>
              <thead>
                <tr>
                  {['Order Code', 'ประเภท', 'บัญชี', 'จำนวนเงิน', 'ยอดสุทธิ', 'Status', 'ยืนยันเมื่อ', 'สร้างเมื่อ'].map((h) => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => window.open(`/admin/orders/${o.id}`, '_self')}>
                    <td><code>{o.order_code}</code></td>
                    <td>{templateLabel(o.template_type)}</td>
                    <td>{o.account_type || '-'}</td>
                    <td>{o.amount != null ? Number(o.amount).toLocaleString() + ' ฿' : '-'}</td>
                    <td><strong>{o.total_amount != null ? Number(o.total_amount).toLocaleString() + ' ฿' : '-'}</strong></td>
                    <td><span className={`badge ${statusBadge(o.status)}`} style={{ fontSize: 11 }}>{o.status}</span></td>
                    <td>{o.confirmed_at ? fmt(o.confirmed_at) : '-'}</td>
                    <td>{fmt(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Messages table */}
      {messages.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#2b3550', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MailIcon size={16} color="#6a1b9a" /> ข้อความทั้งหมด ({messages.length})
          </h2>
          <div className="table-shell">
            <table className="table" style={{ fontSize: 13 }}>
              <thead>
                <tr>
                  {['ประเภท', 'Order', 'ข้อความ', 'สถานะ', 'ส่งเมื่อ'].map((h) => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => {
                  let preview = m.message_text;
                  try {
                    const parsed = JSON.parse(m.message_text);
                    if (parsed?.type === 'flex') preview = parsed.altText || '[Flex Message]';
                  } catch { /* plain text */ }
                  return (
                    <tr key={m.id} style={{ cursor: m.order_id ? 'pointer' : 'default' }} onClick={() => m.order_id && window.open(`/admin/orders/${m.order_id}`, '_self')}>
                      <td>{templateLabel(m.template_type)}</td>
                      <td>{m.order_id ? <Link href={`/admin/orders/${m.order_id}`} onClick={(e) => e.stopPropagation()} style={{ color: '#0b57b7', textDecoration: 'none', fontSize: 12 }}>#{m.order_id}</Link> : '-'}</td>
                      <td style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#546e7a' }}>{preview}</td>
                      <td>
                        {m.line_error
                          ? <span className="badge badge-danger" style={{ fontSize: 11 }}>ส่งไม่สำเร็จ</span>
                          : <span className="badge badge-success" style={{ fontSize: 11 }}>สำเร็จ</span>}
                      </td>
                      <td>{fmt(m.sent_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#2b3550', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ClockIcon size={16} color="#0b57b7" /> Timeline
        </h2>
        <div style={{ position: 'relative', paddingLeft: 28 }}>
          <div style={{ position: 'absolute', left: 10, top: 0, bottom: 0, width: 2, background: '#e8edf6' }} />

          {timeline.map((entry, i) => {
            let dotNode: React.ReactNode = null;
            let dotColor = '#8a94a4';
            let content: React.ReactNode = null;

            if (entry.kind === 'join') {
              dotColor = '#0b57b7';
              dotNode = <UserPlusIcon size={11} color={dotColor} />;
              content = (
                <div>
                  <strong style={{ color: '#0b57b7' }}>เพิ่มเป็นลูกค้า</strong>
                  <span style={{ marginLeft: 8, fontSize: 12, color: '#8a94a4' }}>{entry.customer.customer_code}</span>
                </div>
              );
            } else if (entry.kind === 'session') {
              dotColor = '#546e7a';
              dotNode = <GlobeIcon size={11} color={dotColor} />;
              const s = entry.session;
              content = (
                <div>
                  <strong style={{ color: '#2b3550' }}>เยี่ยมชมเว็บไซต์</strong>
                  {(s.utm_source || s.utm_campaign) && (
                    <div style={{ marginTop: 4, fontSize: 12, color: '#546e7a' }}>
                      {s.utm_source && <span style={pill}>source: {s.utm_source}</span>}
                      {s.utm_medium && <span style={pill}>medium: {s.utm_medium}</span>}
                      {s.utm_campaign && <span style={pill}>campaign: {s.utm_campaign}</span>}
                    </div>
                  )}
                  {s.source_url && <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{s.source_url}</div>}
                </div>
              );
            } else if (entry.kind === 'linked') {
              dotColor = '#2e7d32';
              dotNode = <LinkIcon size={11} color={dotColor} />;
              content = (
                <div>
                  <strong style={{ color: '#2e7d32' }}>เชื่อมต่อบัญชี LINE สำเร็จ</strong>
                </div>
              );
            } else if (entry.kind === 'order') {
              dotColor = '#f57c00';
              dotNode = <PackageIcon size={11} color={dotColor} />;
              const o = entry.order;
              content = (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <strong style={{ color: '#f57c00' }}>{templateLabel(o.template_type)}</strong>
                    <span style={{ fontSize: 13, color: '#546e7a' }}>{o.order_code}</span>
                    <span className={`badge ${statusBadge(o.status)}`} style={{ fontSize: 11 }}>{o.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#546e7a', marginTop: 4 }}>
                    {o.total_amount != null && <span>ยอดรวม: <strong>{Number(o.total_amount).toLocaleString()} บาท</strong></span>}
                    {o.confirmed_at && <span style={{ marginLeft: 12 }}>ยืนยันแล้ว: {fmt(o.confirmed_at)}</span>}
                  </div>
                </div>
              );
            } else if (entry.kind === 'message') {
              const m = entry.msg;
              const isInbound = m.template_type === 'INBOUND';
              dotColor = '#6a1b9a';
              dotNode = isInbound
                ? <MessageIcon size={11} color={dotColor} />
                : <MailIcon size={11} color={dotColor} />;
              content = (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ color: '#6a1b9a' }}>{templateLabel(m.template_type)}</strong>
                    {m.line_error && <span className="badge badge-danger" style={{ fontSize: 11 }}>ส่งไม่สำเร็จ</span>}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    {(() => {
                      try {
                        const parsed = JSON.parse(m.message_text);
                        if (parsed?.type === 'flex') return <FlexPreview json={m.message_text} />;
                      } catch { /* plain text */ }
                      return (
                        <div style={{
                          padding: '8px 12px',
                          background: isInbound ? '#f4f7fb' : '#fdf4ff',
                          borderRadius: 10,
                          fontSize: 12,
                          color: '#2b3550',
                          whiteSpace: 'pre-wrap',
                          maxWidth: 480,
                          lineHeight: 1.6,
                        }}>
                          {m.message_text}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            }

            return (
              <div key={i} style={{ position: 'relative', marginBottom: 24 }}>
                <DotIcon icon={dotNode} color={dotColor} />
                <div style={{ paddingLeft: 4 }}>
                  <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>{fmt(entry.date)}</div>
                  {content}
                </div>
              </div>
            );
          })}

          {timeline.length === 0 && <p className="page-subtitle">ยังไม่มีกิจกรรม</p>}
        </div>
      </div>
    </section>
  );
}

const pill: React.CSSProperties = {
  display: 'inline-block',
  background: '#e8edf6',
  borderRadius: 6,
  padding: '1px 7px',
  marginRight: 4,
  fontSize: 11,
  color: '#2b3550',
};
