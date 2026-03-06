'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FlexPreview from '../../customers/[id]/FlexPreview';
import { UserIcon, MailIcon, PackageIcon, XIcon } from '../../icons';

interface MessageLog {
  id: number;
  customer_id: number | null;
  order_id: number | null;
  customer_code: string | null;
  display_name: string | null;
  picture_url: string | null;
  order_code: string | null;
  template_type: string;
  message_text: string;
  line_error: string | null;
  sent_at: string;
}

const TEMPLATE_LABELS: Record<string, string> = {
  INVOICE: 'แจ้งค่าส่ง',
  IMPORT_INVOICE: 'ใบแจ้งหนี้นำเข้า',
  CONFIRM: 'ยืนยันคำสั่งซื้อ',
  RECEIPT: 'ใบเสร็จรับเงิน',
  WELCOME: 'ต้อนรับ',
  INBOUND: 'จากลูกค้า',
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString('th-TH', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function msgPreview(text: string) {
  try {
    const p = JSON.parse(text);
    if (p?.type === 'flex') return p.altText || '[Flex Message]';
  } catch { /* plain */ }
  return text;
}

function isFlex(text: string) {
  try { return JSON.parse(text)?.type === 'flex'; } catch { return false; }
}

function Avatar({ src, size = 32 }: { src?: string | null; size?: number }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: '#e8edf6', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
      <UserIcon size={size * 0.5} color="#8a94a4" />
    </div>
  );
}

export default function MessageHistoryPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<MessageLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<MessageLog | null>(null);

  function load(p: number) {
    setLoading(true);
    fetch(`/api/messages?page=${p}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => { setMessages(data.messages); setTotal(data.total); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(1); }, []);

  // Close panel on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const totalPages = Math.ceil(total / 50);

  return (
    <section style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

      {/* Main table */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 className="page-title">ประวัติข้อความ ({total.toLocaleString()})</h1>
        <p className="page-subtitle">ประวัติการส่งข้อความและเวลาในการส่ง</p>

        {loading ? (
          <p className="page-subtitle">Loading...</p>
        ) : (
          <div className="table-shell table-wrap">
            <table className="table">
              <thead>
                <tr>
                  {['ลูกค้า', 'ประเภท', 'ข้อความ', 'Order', 'สถานะ', 'ส่งเมื่อ'].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => setSelected(m)}
                    style={{ cursor: 'pointer', background: selected?.id === m.id ? '#f0f5ff' : undefined }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar src={m.picture_url} size={28} />
                        <div style={{ lineHeight: 1.3 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1e2946' }}>{m.display_name || '-'}</div>
                          <div style={{ fontSize: 11, color: '#8a94a4' }}>{m.customer_code || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ background: '#f3e8ff', color: '#6a1b9a', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>
                        {TEMPLATE_LABELS[m.template_type] ?? m.template_type}
                      </span>
                    </td>
                    <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, color: '#546e7a' }}>
                      {msgPreview(m.message_text)}
                    </td>
                    <td style={{ fontSize: 12, color: '#546e7a' }}>{m.order_code || '-'}</td>
                    <td>
                      <span className={`badge ${m.line_error ? 'badge-danger' : 'badge-success'}`}>
                        {m.line_error ? 'Failed' : 'Sent'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{fmt(m.sent_at)}</td>
                  </tr>
                ))}
                {messages.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: '#8a94a4' }}>No data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => { setPage(page - 1); load(page - 1); }} disabled={page <= 1} className="btn btn-soft" type="button">Prev</button>
            <span className="page-subtitle" style={{ margin: 0 }}>Page {page} / {totalPages}</span>
            <button onClick={() => { setPage(page + 1); load(page + 1); }} disabled={page >= totalPages} className="btn btn-soft" type="button">Next</button>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <div style={{
          width: 380,
          flexShrink: 0,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
          padding: '20px',
          position: 'sticky',
          top: 24,
          maxHeight: 'calc(100vh - 48px)',
          overflowY: 'auto',
        }}>
          {/* Panel header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#2b3550' }}>รายละเอียดข้อความ</span>
            <button
              type="button"
              onClick={() => setSelected(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'grid', placeItems: 'center' }}
            >
              <XIcon size={18} color="#8a94a4" />
            </button>
          </div>

          {/* Customer row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#f4f7fb', borderRadius: 12, marginBottom: 12 }}>
            <Avatar src={selected.picture_url} size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1e2946' }}>{selected.display_name || '-'}</div>
              <div style={{ fontSize: 12, color: '#8a94a4' }}>{selected.customer_code || '-'}</div>
            </div>
            {selected.customer_id && (
              <button
                type="button"
                className="btn btn-soft"
                style={{ fontSize: 11, height: 26, padding: '0 10px', flexShrink: 0 }}
                onClick={() => router.push(`/admin/customers/${selected.customer_id}`)}
              >
                <UserIcon size={11} color="#546e7a" /> &nbsp;ดูลูกค้า
              </button>
            )}
          </div>

          {/* Meta rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            <Row label="ประเภท" value={TEMPLATE_LABELS[selected.template_type] ?? selected.template_type} />
            <Row label="ส่งเมื่อ" value={fmt(selected.sent_at)} />
            {selected.order_code && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Order</span>
                <button
                  type="button"
                  className="btn btn-soft"
                  style={{ fontSize: 11, height: 26, padding: '0 10px', display: 'flex', alignItems: 'center', gap: 4 }}
                  onClick={() => router.push(`/admin/orders/${selected.order_id}`)}
                >
                  <PackageIcon size={11} color="#f57c00" /> {selected.order_code}
                </button>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>สถานะ</span>
              <span className={`badge ${selected.line_error ? 'badge-danger' : 'badge-success'}`}>
                {selected.line_error ? 'Failed' : 'Sent'}
              </span>
            </div>
            {selected.line_error && (
              <div style={{ background: '#fff5f5', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#ef4444' }}>
                {selected.line_error}
              </div>
            )}
          </div>

          {/* Message preview */}
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <MailIcon size={13} color="#6a1b9a" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#2b3550' }}>ข้อความ</span>
            </div>
            {isFlex(selected.message_text) ? (
              <FlexPreview json={selected.message_text} />
            ) : (
              <div style={{
                background: '#fdf4ff',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 13,
                color: '#2b3550',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.7,
              }}>
                {selected.message_text}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: '#6b7280' }}>{label}</span>
      <span style={{ fontSize: 13, color: '#111827', fontWeight: 600 }}>{value}</span>
    </div>
  );
}
