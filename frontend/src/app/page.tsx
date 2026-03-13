'use client';

import Image from 'next/image';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const SERVICE_HIGHLIGHTS = [
  {
    title: 'บริการให้คำปรึกษาฟรี',
    detail: 'ให้คำแนะนำด้านนำเข้าสินค้าจากจีนทุกขั้นตอน เพื่อให้คุณตัดสินใจได้มั่นใจ',
  },
  {
    title: 'ไม่มีค่าบริการฝากสั่งสินค้า',
    detail: 'เช็กสินค้า คุยกับทางร้านจีน และดีลราคาให้ฟรี ไม่มีค่าบริการแฝง',
  },
  {
    title: 'ไม่มีค่าเปิดโกดัง',
    detail: 'ไม่คิดค่าเปิดโกดังแรกเข้า และไม่มีค่าธรรมเนียมจุกจิกเกี่ยวกับโกดัง',
  },
  {
    title: 'บริการนำส่งสินค้าฟรี',
    detail: 'แพ็กสินค้าและจัดส่งให้ฟรี สำหรับลูกค้าที่เปิดรหัสสมาชิกกับเรา',
  },
];

const ABOUT_JAWANDA = [
  'บริการนำเข้าสินค้าจากจีนแบบ One Stop Service ครบจบในที่เดียว',
  'สั่งผลิตสินค้าและทำโลโก้แบรนด์ของคุณได้',
  'สั่งซื้อได้ทั้ง Taobao, 1688 และ Alibaba',
  'ทีมงานไทย-จีนมีประสบการณ์สูง ต่อรองภาษาจีนได้โดยตรง',
];

async function readJsonSafely(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

function LandingInner() {
  const searchParams = useSearchParams();
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const LINE_OA_URL = 'https://lin.ee/8NQIBi9';

  useEffect(() => {
    const utmParams = {
      utm_source: searchParams.get('utm_source') || undefined,
      utm_medium: searchParams.get('utm_medium') || undefined,
      utm_campaign: searchParams.get('utm_campaign') || undefined,
      utm_content: searchParams.get('utm_content') || undefined,
      utm_term: searchParams.get('utm_term') || undefined,
      fbclid: searchParams.get('fbclid') || undefined,
      source_url: window.location.href,
    };

    fetch('/api/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(utmParams),
    })
      .then(async (r) => {
        const data = await readJsonSafely(r);
        if (data?.trackingId) setTrackingId(data.trackingId);
      })
      .catch((err) => console.error('[landing visit]', err))
      .finally(() => setLoading(false));
  }, [searchParams]);

  async function handleAddFriend() {
    setAdding(true);
    try {
      if (trackingId) {
        await fetch('/api/pre-follow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trackingId }),
        });
      }
    } catch (err) {
      console.error('[pre-follow]', err);
    }
    window.open(LINE_OA_URL, '_blank');
    setAdding(false);
  }

  return (
    <div className="landing-wrap">
      <div className="landing-grid">
        <section className="landing-hero">
          <div className="landing-cover">
            {/* <p className="landing-caption">LINE OFFICIAL ACCOUNT</p> */}
            <h1 className="landing-heading">
              มืออาชีพด้านการ
              <br />
              นำเข้าสินค้าจากจีน
            </h1>
            <div className="landing-cover-art" />
          </div>

          <div className="landing-profile">
            <div className="landing-profile-row">
              <Image src="/logo.png" alt="Jawanda Cargo" width={82} height={82} style={{ borderRadius: '50%', border: '4px solid #ff8a00', background: '#fff' }} />
              <div className="landing-profile-info">
                <div className="landing-profile-head">
                  <h2 className="landing-brand">JAWANDA CARGO</h2>
                  
                </div>
                {/* <p className="landing-friends">Friends 17,784</p> */}
                <p className="landing-desc">
                  นำเข้าสินค้าจากจีน | บริการสั่งซื้อครบวงจร One Stop Service
                  <br />
                  เปิดบริการทุกวัน 09:00 น. พร้อมทีมงานไทย-จีนคอยดูแล
                </p>
                <p className="landing-link-wrap">
                  <a href="https://jawandacargo-th.com/" target="_blank" rel="noreferrer" className="landing-link">
                    jawandacargo-th.com
                  </a>
                </p>
                <div className="landing-actions">
                  <button
                    className="btn btn-primary landing-chat-btn"
                    onClick={handleAddFriend}
                    disabled={loading || adding}
                  >
                    <Image src="/line-logo.png" alt="LINE" width={18} height={18} />
                    <span>{loading ? 'กำลังโหลด...' : adding ? 'กำลังเปิด...' : 'เพิ่มเพื่อนใน Line'}</span>
                  </button>
                </div>
                <p className="info-note landing-note">กรุณาเปิดหน้านี้ผ่านเบราว์เซอร์ในแอป LINE</p>
              </div>
            </div>
          </div>
        </section>

        <section style={{ background: 'rgba(255,255,255,0.96)', borderRadius: 18, padding: '16px 14px', boxShadow: '0 10px 30px rgba(0,0,0,0.12)' }}>
          <h2 style={{ color: '#0b57b7', fontSize: 22, marginBottom: 10, fontWeight: 800 }}>เกี่ยวกับเรา Jawanda Cargo</h2>
          <ul style={{ listStyle: 'none', display: 'grid', gap: 8 }}>
            {ABOUT_JAWANDA.map((item) => (
              <li key={item} style={{ fontSize: 15, color: '#1e2946', background: '#fff8ee', border: '1px solid #ffd9ac', borderRadius: 12, padding: '10px 12px', lineHeight: 1.55, fontWeight: 600 }}>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section style={{ background: 'rgba(255,255,255,0.96)', borderRadius: 18, padding: '16px 14px', boxShadow: '0 10px 30px rgba(0,0,0,0.12)' }}>
          <h2 style={{ color: '#0b57b7', fontSize: 22, marginBottom: 10, fontWeight: 800 }}>จุดเด่นบริการของเรา</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
            {SERVICE_HIGHLIGHTS.map((item) => (
              <article key={item.title} style={{ background: '#0b57b7', borderRadius: 14, padding: '12px 12px' }}>
                <h3 style={{ color: '#fff', fontSize: 16, marginBottom: 6, fontWeight: 800 }}>{item.title}</h3>
                <p style={{ color: '#dce9ff', fontSize: 13, lineHeight: 1.55 }}>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense>
      <LandingInner />
    </Suspense>
  );
}
