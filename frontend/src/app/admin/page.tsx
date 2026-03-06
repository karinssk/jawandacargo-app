'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserIcon, PackageIcon, MailIcon, ChartIcon,
  CheckIcon, ClockIcon, GlobeIcon,
} from './icons';

interface Stats {
  totalCustomers: number;
  newToday: number;
  pendingOrders: number;
  confirmedOrders: number;
  totalOrders: number;
  totalRevenue: number;
  messagesToday: number;
  totalMessages: number;
}

interface Customer {
  id: number;
  customer_code: string;
  display_name: string;
  picture_url: string | null;
  is_blocked: boolean;
  created_at: string;
  utm_source: string | null;
  utm_campaign: string | null;
}

interface Order {
  id: number;
  order_code: string;
  template_type: string;
  total_amount: number | null;
  created_at: string;
  expires_at: string | null;
  display_name: string;
  picture_url: string | null;
  customer_code: string;
}

interface Message {
  id: number;
  template_type: string;
  message_text: string;
  line_error: string | null;
  sent_at: string;
  display_name: string;
  picture_url: string | null;
}

interface UtmSource {
  utm_source: string;
  count: string;
}

interface DashboardData {
  stats: Stats;
  recentCustomers: Customer[];
  pendingOrders: Order[];
  recentMessages: Message[];
  utmSources: UtmSource[];
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

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'เมื่อกี้';
  if (m < 60) return `${m} นาทีที่แล้ว`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ชั่วโมงที่แล้ว`;
  return `${Math.floor(h / 24)} วันที่แล้ว`;
}

function Avatar({ src, name, size = 32 }: { src?: string | null; name?: string; size?: number }) {
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

function StatCard({
  label, value, sub, icon, accent, tint,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; accent: string; tint: string;
}) {
  return (
    <article style={{
      background: '#fff',
      borderRadius: 16,
      padding: '18px 20px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ background: tint, borderRadius: 10, padding: 10, display: 'grid', placeItems: 'center' }}>
          {icon}
        </div>
        {sub && (
          <span style={{ fontSize: 11, color: '#8a94a4', background: '#f4f7fb', borderRadius: 20, padding: '2px 8px', fontWeight: 600 }}>
            {sub}
          </span>
        )}
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: accent, lineHeight: 1 }}>
          {typeof value === 'number' ? value.toLocaleString('th-TH') : value}
        </div>
        <div style={{ fontSize: 13, color: '#8a94a4', marginTop: 4, fontWeight: 500 }}>{label}</div>
      </div>
    </article>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch('/api/dashboard/stats', { credentials: 'include' })
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) {
    return (
      <section>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">กำลังโหลดข้อมูล...</p>
      </section>
    );
  }

  const { stats, recentCustomers, pendingOrders, recentMessages, utmSources } = data;

  const maxUtm = Math.max(...utmSources.map((u) => Number(u.count)), 1);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Page header */}
      <div>
        <h1 className="page-title" style={{ marginBottom: 2 }}>Dashboard</h1>
        <p className="page-subtitle" style={{ margin: 0 }}>ภาพรวมธุรกิจ Jawanda Cargo</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <StatCard
          label="ลูกค้าทั้งหมด"
          value={stats.totalCustomers}
          sub={`+${stats.newToday} วันนี้`}
          icon={<UserIcon size={20} color="#0b57b7" />}
          accent="#0b57b7" tint="#dfeafe"
        />
        <StatCard
          label="รอยืนยัน"
          value={stats.pendingOrders}
          sub={`${stats.totalOrders} ทั้งหมด`}
          icon={<ClockIcon size={20} color="#c17a1a" />}
          accent="#c17a1a" tint="#fff4e0"
        />
        <StatCard
          label="ยืนยันแล้ว"
          value={stats.confirmedOrders}
          icon={<CheckIcon size={20} color="#1d975f" />}
          accent="#1d975f" tint="#dff6e7"
        />
        <StatCard
          label="รายได้รวม"
          value={`฿${stats.totalRevenue.toLocaleString('th-TH')}`}
          sub="ยืนยันแล้วเท่านั้น"
          icon={<ChartIcon size={20} color="#6a1b9a" />}
          accent="#6a1b9a" tint="#f3e8ff"
        />
        <StatCard
          label="ข้อความวันนี้"
          value={stats.messagesToday}
          sub={`${stats.totalMessages} ทั้งหมด`}
          icon={<MailIcon size={20} color="#1565c0" />}
          accent="#1565c0" tint="#e3f0ff"
        />
      </div>

      {/* Row 2: Pending orders + UTM sources */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

        {/* Pending orders */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#2b3550', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <PackageIcon size={15} color="#c17a1a" /> รอยืนยัน ({stats.pendingOrders})
            </h2>
            <button type="button" className="btn btn-soft" style={{ fontSize: 12, height: 28, padding: '0 12px' }} onClick={() => router.push('/admin/orders')}>
              ดูทั้งหมด →
            </button>
          </div>

          {pendingOrders.length === 0 ? (
            <p className="page-subtitle" style={{ margin: 0 }}>ไม่มีคำสั่งซื้อที่รอยืนยัน</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {pendingOrders.map((o) => (
                <div
                  key={o.id}
                  onClick={() => router.push(`/admin/orders/${o.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f4f7fb')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <Avatar src={o.picture_url} name={o.display_name} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: '#1e2946', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {o.display_name || o.customer_code}
                      </span>
                      <span style={{ fontSize: 11, color: '#8a94a4', flexShrink: 0, marginLeft: 8 }}>{timeAgo(o.created_at)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#8a94a4', marginTop: 1 }}>
                      <code style={{ fontSize: 11 }}>{o.order_code}</code>
                      {o.total_amount != null && (
                        <span style={{ marginLeft: 8, color: '#c17a1a', fontWeight: 700 }}>
                          ฿{Number(o.total_amount).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="badge badge-warning" style={{ fontSize: 11, flexShrink: 0 }}>รอ</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* UTM source breakdown */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#2b3550', display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 16px' }}>
            <GlobeIcon size={15} color="#0b57b7" /> แหล่งที่มา
          </h2>
          {utmSources.length === 0 ? (
            <p className="page-subtitle" style={{ margin: 0 }}>ยังไม่มีข้อมูล</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {utmSources.map((u) => {
                const pct = Math.round((Number(u.count) / maxUtm) * 100);
                return (
                  <div key={u.utm_source}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: '#2b3550', fontWeight: 600 }}>{u.utm_source}</span>
                      <span style={{ fontSize: 12, color: '#8a94a4' }}>{Number(u.count).toLocaleString()}</span>
                    </div>
                    <div style={{ background: '#f0f4f8', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: '#0b57b7', borderRadius: 99, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Recent customers + Recent messages */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

        {/* Recent customers */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#2b3550', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <UserIcon size={15} color="#0b57b7" /> ลูกค้าใหม่ล่าสุด
            </h2>
            <button type="button" className="btn btn-soft" style={{ fontSize: 12, height: 28, padding: '0 12px' }} onClick={() => router.push('/admin/customers')}>
              ดูทั้งหมด →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {recentCustomers.map((c) => (
              <div
                key={c.id}
                onClick={() => router.push(`/admin/customers/${c.id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f4f7fb')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Avatar src={c.picture_url} name={c.display_name} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: '#1e2946', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.display_name || '-'}
                    </span>
                    <span style={{ fontSize: 11, color: '#8a94a4', flexShrink: 0, marginLeft: 8 }}>{timeAgo(c.created_at)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#8a94a4', marginTop: 1 }}>
                    {c.customer_code}
                    {c.utm_source && <span style={{ marginLeft: 8, background: '#e8edf6', borderRadius: 4, padding: '0 5px', fontSize: 11 }}>{c.utm_source}</span>}
                  </div>
                </div>
                {c.is_blocked && <span className="badge badge-danger" style={{ fontSize: 10, flexShrink: 0 }}>Blocked</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Recent messages */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#2b3550', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <MailIcon size={15} color="#6a1b9a" /> ข้อความล่าสุด
            </h2>
            <button type="button" className="btn btn-soft" style={{ fontSize: 12, height: 28, padding: '0 12px' }} onClick={() => router.push('/admin/messages/history')}>
              ดูทั้งหมด →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {recentMessages.map((m) => {
              let preview = m.message_text;
              try {
                const p = JSON.parse(m.message_text);
                if (p?.type === 'flex') preview = p.altText || '[Flex Message]';
              } catch { /* plain */ }
              return (
                <div
                  key={m.id}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 12px', borderRadius: 10 }}
                >
                  <Avatar src={m.picture_url} name={m.display_name} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: '#1e2946' }}>
                        {m.display_name || '-'}
                      </span>
                      <span style={{ fontSize: 11, color: '#8a94a4', flexShrink: 0, marginLeft: 8 }}>{timeAgo(m.sent_at)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#8a94a4', marginTop: 1 }}>
                      <span style={{ background: '#f3e8ff', color: '#6a1b9a', borderRadius: 4, padding: '0 5px', fontSize: 11, marginRight: 6 }}>
                        {TEMPLATE_LABELS[m.template_type] ?? m.template_type}
                      </span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block', maxWidth: 200, verticalAlign: 'bottom' }}>
                        {preview}
                      </span>
                    </div>
                    {m.line_error && <span className="badge badge-danger" style={{ fontSize: 10, marginTop: 4, display: 'inline-block' }}>ส่งไม่สำเร็จ</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
