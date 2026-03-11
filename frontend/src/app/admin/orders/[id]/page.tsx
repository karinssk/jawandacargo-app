'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';
import FlexPreview from '../../customers/[id]/FlexPreview';
import { UserIcon, MailIcon, CheckIcon, XIcon } from '../../icons';

interface Order {
  id: number;
  order_code: string;
  template_type: string;
  account_type: string | null;
  amount: number | null;
  exchange_rate: number | null;
  total_amount: number | null;
  status: 'PENDING' | 'CONFIRMED' | 'UNCONFIRMED';
  stage: string;
  seller_tracking_no: string | null;
  seller_tracking_added_at: string | null;
  thai_warehouse_received_at: string | null;
  delivery_method: 'PICKUP' | 'DELIVERY' | null;
  delivery_provider: string | null;
  delivery_tracking_no: string | null;
  delivery_note: string | null;
  delivery_updated_at: string | null;
  confirmed_at: string | null;
  created_at: string;
  customer_id: number;
  customer_code: string;
  display_name: string;
  picture_url: string | null;
  line_uid: string | null;
  is_blocked: boolean;
}

interface MessageLog {
  id: number;
  template_type: string;
  message_text: string;
  line_error: string | null;
  sent_at: string;
}

interface RelatedDocument {
  id: number;
  order_code: string;
  template_type: string;
  account_type: string | null;
  amount: number | null;
  exchange_rate: number | null;
  exchange_rate_currency: string | null;
  total_amount: number | null;
  status: string;
  stage: string;
  created_at: string;
  confirmed_at: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'รอยืนยัน',
  CONFIRMED: 'ยืนยันแล้ว',
  UNCONFIRMED: 'ยกเลิก',
};
const STATUS_BADGES: Record<string, string> = {
  PENDING: 'badge-warning',
  CONFIRMED: 'badge-success',
  UNCONFIRMED: 'badge-danger',
};
const TEMPLATE_LABELS: Record<string, string> = {
  IMPORT_INVOICE: 'ใบแจ้งหนี้นำเข้า',
  CONFIRM: 'คำสั่งซื้อสินค้า',
  RECEIPT: 'ใบเสร็จรับเงิน',
};
const STAGE_LABELS: Record<string, string> = {
  WAITING_ORDER_CONFIRMATION: 'รอลูกค้ายืนยันคำสั่งซื้อ',
  ORDER_CONFIRMED: 'ยืนยันคำสั่งซื้อแล้ว',
  SELLER_SHIPPED: 'ผู้ขายส่งของแล้ว',
  WAREHOUSE_RECEIVED: 'สินค้าเข้าโกดังไทยแล้ว',
  IMPORT_INVOICE_SENT: 'ส่งใบแจ้งหนี้นำเข้าแล้ว',
  IMPORT_PAID: 'ชำระค่า Import แล้ว',
  READY_FOR_DISPATCH: 'พร้อมจัดส่งหรือรอรับหน้าโกดัง',
  PICKUP_SCHEDULED: 'นัดรับที่โกดังแล้ว',
  DISPATCHED: 'ส่งออกจากโกดังแล้ว',
  COMPLETED: 'งานเสร็จสมบูรณ์',
};
function fmt(iso: string) {
  return new Date(iso).toLocaleString('th-TH', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
      <span style={{ color: '#6b7280', fontSize: 14 }}>{label}</span>
      <span style={{ color: '#111827', fontSize: 14, fontWeight: 600, textAlign: 'right' }}>{value ?? '-'}</span>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<MessageLog[]>([]);
  const [documents, setDocuments] = useState<RelatedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  function load() {
    fetch(`/api/orders/${id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        setOrder(data.order);
        setMessages(data.messages || []);
        setDocuments(data.documents || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function updateOrder(action: 'confirm' | 'cancel') {
    if (!order) return;
    const isConfirm = action === 'confirm';
    const result = await Swal.fire({
      title: isConfirm ? 'ยืนยันคำสั่งซื้อ?' : 'ยกเลิกคำสั่งซื้อ?',
      html: isConfirm
        ? `ยืนยันคำสั่งซื้อ <strong>${order.order_code}</strong>?`
        : `ต้องการยกเลิกคำสั่งซื้อ <strong>${order.order_code}</strong>?`,
      icon: isConfirm ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: isConfirm ? '#1d975f' : '#e53935',
      cancelButtonColor: '#8a94a4',
      confirmButtonText: isConfirm ? 'ยืนยัน' : 'ยกเลิกคำสั่งซื้อ',
      cancelButtonText: 'ปิด',
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    setActing(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/${action}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: data.error || 'Update failed' });
      } else {
        await Swal.fire({ icon: 'success', title: isConfirm ? 'ยืนยันสำเร็จ' : 'ยกเลิกสำเร็จ', timer: 1500, showConfirmButton: false });
        load();
      }
    } finally {
      setActing(false);
    }
  }

  if (loading) return <p className="page-subtitle">Loading...</p>;
  if (!order) return <p className="page-subtitle">ไม่พบข้อมูลคำสั่งซื้อ</p>;

  const n = (v: number | null) => v != null ? Number(v).toLocaleString('th-TH') + ' บาท' : null;

  return (
    <section>
      <button type="button" className="btn btn-soft" style={{ marginBottom: 20 }} onClick={() => router.back()}>
        ← กลับ
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

        {/* Left column — order info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Header card */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h1 className="page-title" style={{ margin: 0 }}>{order.order_code}</h1>
                <p className="page-subtitle" style={{ margin: '4px 0 0' }}>
                  {TEMPLATE_LABELS[order.template_type] ?? order.template_type}
                </p>
              </div>
              <span className={`badge ${STATUS_BADGES[order.status]}`} style={{ fontSize: 13 }}>
                {STATUS_LABELS[order.status]}
              </span>
            </div>

            <Row label="ประเภทบัญชี" value={order.account_type} />
            <Row label="Workflow" value={STAGE_LABELS[order.stage] ?? order.stage} />
            <Row label="จำนวนเงิน" value={n(order.amount)} />
            <Row label="อัตราแลกเปลี่ยน" value={order.exchange_rate != null ? String(order.exchange_rate) : null} />
            <Row label="ยอดสุทธิ" value={n(order.total_amount)} />
            <Row label="เลขพัสดุผู้ขาย" value={order.seller_tracking_no} />
            <Row label="เข้าโกดังไทย" value={order.thai_warehouse_received_at ? fmt(order.thai_warehouse_received_at) : null} />
            <Row label="วิธีรับสินค้า" value={order.delivery_method === 'PICKUP' ? 'ลูกค้ารับหน้าโกดัง' : order.delivery_method === 'DELIVERY' ? 'จัดส่งปลายทาง' : null} />
            <Row label="ผู้ให้บริการขนส่ง" value={order.delivery_provider} />
            <Row label="เลขติดตามขนส่งไทย" value={order.delivery_tracking_no} />
            <Row label="สร้างเมื่อ" value={fmt(order.created_at)} />
            {order.confirmed_at && <Row label="ยืนยันเมื่อ" value={fmt(order.confirmed_at)} />}

            {order.status === 'PENDING' && (
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={acting}
                  onClick={() => updateOrder('confirm')}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <CheckIcon size={15} color="#fff" /> ยืนยันคำสั่งซื้อ
                </button>
                <button
                  type="button"
                  className="btn btn-soft"
                  disabled={acting}
                  onClick={() => updateOrder('cancel')}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <XIcon size={15} /> ยกเลิก
                </button>
              </div>
            )}
          </div>

          {/* Customer card */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#2b3550', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserIcon size={15} color="#0b57b7" /> ลูกค้า
          </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {order.picture_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={order.picture_url} alt="" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e8edf6' }} />
              ) : (
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#e8edf6', display: 'grid', placeItems: 'center' }}>
                  <UserIcon size={24} color="#8a94a4" />
                </div>
              )}
              <div>
                <div style={{ fontWeight: 700, color: '#111827' }}>{order.display_name || '-'}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{order.customer_code}</div>
                <span className={`badge ${order.is_blocked ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: 11, marginTop: 4, display: 'inline-block' }}>
                  {order.is_blocked ? 'Blocked' : 'Active'}
                </span>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <Link href={`/admin/customers/${order.customer_id}`} className="btn btn-soft" style={{ fontSize: 13 }}>
                ดูข้อมูลลูกค้าทั้งหมด →
              </Link>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#2b3550', marginBottom: 14 }}>เอกสารที่อ้างอิง order นี้</h2>
            {documents.length === 0 ? (
              <p className="page-subtitle">ยังไม่มีใบแจ้งหนี้นำเข้าหรือใบเสร็จ</p>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {documents.map((doc) => (
                  <div key={doc.id} style={{ border: '1px solid #edf2f7', borderRadius: 12, padding: 12, background: '#fbfdff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{doc.order_code}</div>
                        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{TEMPLATE_LABELS[doc.template_type] ?? doc.template_type}</div>
                      </div>
                      <span className="badge badge-success">{doc.status}</span>
                    </div>
                    <div style={{ marginTop: 10, display: 'grid', gap: 6, fontSize: 13, color: '#475569' }}>
                      <div>จำนวนเงิน: {n(doc.amount)}</div>
                      <div>อัตราแลกเปลี่ยน: {doc.exchange_rate != null ? `${doc.exchange_rate} ${doc.exchange_rate_currency || 'CNY'}` : '-'}</div>
                      <div>ยอดสุทธิ: {n(doc.total_amount)}</div>
                      <div>ส่งเมื่อ: {fmt(doc.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column — messages sent for this order */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#2b3550', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MailIcon size={15} color="#6a1b9a" /> ข้อความที่ส่ง ({messages.length})
          </h2>

          {messages.length === 0 ? (
            <p className="page-subtitle">ยังไม่มีข้อความที่ส่ง</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {messages.map((m) => {
                let isFlex = false;
                try { isFlex = JSON.parse(m.message_text)?.type === 'flex'; } catch { /* plain */ }

                return (
                  <div key={m.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>{fmt(m.sent_at)}</span>
                      {m.line_error && (
                        <span className="badge badge-danger" style={{ fontSize: 11 }}>ส่งไม่สำเร็จ</span>
                      )}
                    </div>
                    {isFlex ? (
                      <FlexPreview json={m.message_text} />
                    ) : (
                      <div style={{
                        padding: '10px 14px',
                        background: '#fdf4ff',
                        borderRadius: 10,
                        fontSize: 13,
                        color: '#2b3550',
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.6,
                      }}>
                        {m.message_text}
                      </div>
                    )}
                    {m.line_error && (
                      <div style={{ marginTop: 6, fontSize: 11, color: '#ef4444', background: '#fff5f5', padding: '4px 10px', borderRadius: 6 }}>
                        Error: {m.line_error}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
