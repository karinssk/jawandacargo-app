'use client';

import Image from 'next/image';
import { Suspense, useEffect, useState, type CSSProperties } from 'react';
import { useSearchParams } from 'next/navigation';

function SvgPointerIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8.5 20.2l1.2-5.2-3.9-1.8 11.5-8.2-5.6 13.1-2.8-2.4-1.2 4.5z" fill={color} />
    </svg>
  );
}

function SvgBoxIcon({ size = 48, color = '#9ca3af' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3.5 7.4L12 3l8.5 4.4L12 11.7 3.5 7.4z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M3.5 7.4v9.2L12 21l8.5-4.4V7.4" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 11.7V21" stroke={color} strokeWidth="1.6" />
    </svg>
  );
}

type Block = {
  id: number;
  type: 'image' | 'add_friend' | 'hero-full-width' | 'hero-full-width-btn-left' | 'add_friend_banner' | 'add_friend_card' | 'hero-with-dynamic-add-line';
  image_url: string | null;
  label: string | null;
  button_url: string | null;
  button_left_pct: number | null;
  button_top_pct: number | null;
  button_width_pct: number | null;
  block_height_px: number | null;
  sort_order: number;
};

type NavLink = { label: string; href: string };
type Col3Link = { label: string; href: string; color: string };

type HeaderCfg = {
  logo_url: string;
  brand_name: string;
  nav_links: NavLink[];
};

type FooterCfg = {
  col1_title: string;
  col1_lines: string[];
  col2_title: string;
  col2_brand: string;
  col2_desc: string;
  col3_title: string;
  col3_links: Col3Link[];
  copyright: string;
};

const DEFAULT_HEADER: HeaderCfg = {
  logo_url: '/logo.png',
  brand_name: 'JAWANDA CARGO',
  nav_links: [
    { label: 'หน้าแรก',        href: 'https://jawandacargo-th.com/' },
    { label: 'เกี่ยวกับเรา',   href: 'https://jawandacargo-th.com/about-us' },
    { label: 'บริการของเรา',   href: 'https://jawandacargo-th.com/services' },
    { label: 'โปรโมชั่นพิเศษ', href: 'https://jawandacargo-th.com/' },
    { label: 'สินค้าแนะนำ',    href: 'https://jawandacargo-th.com/' },
    { label: 'สาระน่ารู้',     href: 'https://jawandacargo-th.com/' },
    { label: 'ติดต่อเรา',      href: 'https://jawandacargo-th.com/contact-us' },
  ],
};

const DEFAULT_FOOTER: FooterCfg = {
  col1_title: 'ติดต่อเรา',
  col1_lines: [
    'โกดังสายไหม-เพิ่มสิน เขตสายไหม',
    'กรุงเทพมหานคร',
    'Line : @jawandacargo',
    'Facebook : @jawandacargo',
    'TEL. 02-165-0162',
    'TEL. 099-420-7491',
  ],
  col2_title: 'เกี่ยวกับเรา',
  col2_brand: 'บริษัท จาวานด้า คาร์โก้',
  col2_desc: 'ผู้ให้บริการสั่งของจากจีน นำเข้าสินค้าจากจีน ครบวงจร ประสบการณ์มากกว่า 10 ปี พร้อมให้คำปรึกษาฟรี ทีมงานไทย-จีนคอยดูแล',
  col3_title: 'ช่องทางการติดต่อ',
  col3_links: [
    { label: 'สอบถาม / เพิ่มเพื่อน คลิกที่นี้', href: 'https://lin.ee/8NQIBi9',                  color: '#06c755' },
    { label: 'ปรึกษาฟรีได้ที่ Facebook',         href: 'https://www.facebook.com/jawandacargo', color: '#1877f2' },
    { label: 'สายด่วน 099-420-7491',              href: 'tel:0994207491',                        color: '#374151' },
  ],
  copyright: '2026 © Jawanda Cargo · jawandacargo-th.com',
};

async function readJsonSafely(res: Response) {
  const text = await res.text();
  try { return text ? JSON.parse(text) : null; } catch { return null; }
}

function LandingInner() {
  const searchParams = useSearchParams();
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [header, setHeader] = useState<HeaderCfg>(DEFAULT_HEADER);
  const [footer, setFooter] = useState<FooterCfg>(DEFAULT_FOOTER);

  const LINE_OA_URL = 'https://lin.ee/8NQIBi9';

  useEffect(() => {
    document.body.style.background = '#f0f0f0';
    return () => { document.body.style.background = ''; };
  }, []);

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
      .then(async (r) => { const d = await readJsonSafely(r); if (d?.trackingId) setTrackingId(d.trackingId); })
      .catch((err) => console.error('[landing visit]', err))
      .finally(() => setLoading(false));

    fetch('/api/landing-blocks')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setBlocks(d))
      .catch((err) => console.error('[landing blocks]', err));

    fetch('/api/site-config/header')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setHeader(d))
      .catch(() => {});

    fetch('/api/site-config/footer')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setFooter(d))
      .catch(() => {});
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
    } catch (err) { console.error('[pre-follow]', err); }
    window.open(LINE_OA_URL, '_blank');
    setAdding(false);
  }

  async function handleDynamicAddLine(block: Block) {
    const customUrl = block.button_url?.trim();
    if (!customUrl) {
      await handleAddFriend();
      return;
    }
    const shouldTrack = /lin\.ee|line\.me/i.test(customUrl);
    setAdding(true);
    try {
      if (shouldTrack && trackingId) {
        await fetch('/api/pre-follow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trackingId }),
        });
      }
    } catch (err) {
      console.error('[pre-follow custom]', err);
    }
    window.open(customUrl, '_blank');
    setAdding(false);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f0f0', margin: 0 }}>
      {/* ── Dynamic Header ── */}
      <header>
        <div style={{ background: '#1a2744' }}>
          <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={header.logo_url || '/logo.png'}
              alt={header.brand_name}
              width={38}
              height={38}
              style={{ borderRadius: '50%', border: '2px solid #e87722', flexShrink: 0, width: 38, height: 38, objectFit: 'cover' }}
            />
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 18, letterSpacing: 1 }}>{header.brand_name}</span>
          </div>
        </div>
        <nav style={{ background: '#e87722' }}>
          <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', overflowX: 'auto' }}>
            {header.nav_links.map((link, i) => (
              <a key={i} href={link.href} target="_blank" rel="noreferrer"
                style={{ color: '#fff', padding: '10px 14px', fontSize: 14, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap', display: 'block' }}>
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      </header>

      {/* ── Dynamic Content Blocks ── */}
      <main style={{ background: '#fff', minHeight: 200 }}>
        {blocks.length === 0 && !loading && (
          <div style={{ padding: '80px 20px', textAlign: 'center', color: '#9ca3af', maxWidth: 840, margin: '0 auto' }}>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
              <SvgBoxIcon />
            </div>
            <p>ยังไม่มีเนื้อหา</p>
          </div>
        )}
        {blocks.map((block) => {
          /* ── Hero Full-Width: no max-width ── */
          if (block.type === 'hero-full-width' && block.image_url) {
            return (
              <div key={block.id} style={{ lineHeight: 0, width: '100%' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={block.image_url} alt={block.label || ''} style={{ width: '100%', display: 'block', height: 'auto' }} />
              </div>
            );
          }

          /* ── Hero Full-Width + LINE button overlaid left-center ── */
          if (block.type === 'hero-full-width-btn-left' && block.image_url) {
            return (
              <div key={block.id} style={{ position: 'relative', width: '100%', lineHeight: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={block.image_url} alt={block.label || ''} style={{ width: '100%', display: 'block', height: 'auto' }} />
                <div style={{ position: 'absolute', top: '50%', left: '5%', transform: 'translateY(-50%)', zIndex: 10 }}>
                  <button
                    className="line-hero-btn"
                    onClick={handleAddFriend}
                    disabled={adding || loading}
                    style={{ opacity: adding ? 0.7 : 1, cursor: adding || loading ? 'not-allowed' : 'pointer' }}
                  >
                    <Image src="/line-logo.png" alt="LINE" width={30} height={30} />
                    <span style={{ lineHeight: 1.2 }}>
                      {adding ? 'กำลังเปิด...' : (block.label || 'ทักตอนนี้! เพื่อรับสิทธิ์')}
                    </span>
                  </button>
                </div>
              </div>
            );
          }

          /* ── Hero with Dynamic Add LINE area ── */
          if (block.type === 'hero-with-dynamic-add-line' && block.image_url) {
            const leftPct = Math.min(95, Math.max(0, Number(block.button_left_pct ?? 50)));
            const topPct = Math.min(95, Math.max(0, Number(block.button_top_pct ?? 44)));
            const widthPct = Math.min(95, Math.max(8, Number(block.button_width_pct ?? 42)));
            return (
              <div key={block.id} style={{ position: 'relative', width: '100%', lineHeight: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={block.image_url} alt={block.label || ''} style={{ width: '100%', display: 'block', height: 'auto' }} />
                <div
                  style={{
                    position: 'absolute',
                    top: `${topPct}%`,
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10,
                  }}
                >
                  <button
                    className="line-dynamic-hero-btn"
                    onClick={() => handleDynamicAddLine(block)}
                    disabled={adding || loading}
                    style={{ opacity: adding ? 0.7 : 1, cursor: adding || loading ? 'not-allowed' : 'pointer', ...(block.block_height_px ? { height: block.block_height_px } : {}) }}
                  >
                    <span style={{ background: '#fff', borderRadius: 999, width: 30, height: 30, color: '#06c755', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0, fontSize: 22 }}>+</span>
                    <span style={{ lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {adding ? 'กำลังเปิด...' : (block.label || '@JAWANDACARGO')}
                    </span>
                  </button>
                </div>
              </div>
            );
          }

          /* ── Regular image: centred max-width ── */
          if (block.type === 'image' && block.image_url) {
            return (
              <div key={block.id} style={{ maxWidth: 840, margin: '0 auto', lineHeight: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={block.image_url} alt={block.label || ''} style={{ width: '100%', display: 'block', height: 'auto' }} />
              </div>
            );
          }

          /* ── LINE Add Friend Banner — big pill button on background ── */
          if (block.type === 'add_friend_banner') {
            return (
              <div
                key={block.id}
                style={{
                  width: '100%',
                  background: block.image_url
                    ? `url(${block.image_url}) center/cover no-repeat`
                    : 'linear-gradient(135deg, #ff9500 0%, #ffb700 45%, #ff6b00 100%)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 'clamp(20px, 4vw, 44px) clamp(16px, 5vw, 40px)',
                }}
              >
                <button
                  className="line-banner-btn"
                  onClick={handleAddFriend}
                  disabled={adding || loading}
                  style={{ opacity: adding ? 0.7 : 1, cursor: adding || loading ? 'not-allowed' : 'pointer' }}
                >
                  <span className="line-banner-logo">
                    <Image src="/line-logo.png" alt="LINE" width={44} height={44} />
                  </span>
                  <span>{adding ? 'กำลังเปิด...' : (block.label || 'ทักตอนนี้! เพื่อรับสิทธิ์')}</span>
                  <span style={{ lineHeight: 1, flexShrink: 0, display: 'inline-flex' }}>
                    <SvgPointerIcon size={26} color="#ffffff" />
                  </span>
                </button>
              </div>
            );
          }

          /* ── LINE Add Friend Card — same as banner but max-width centered ── */
          if (block.type === 'add_friend_card') {
            return (
              <div key={block.id} style={{ maxWidth: 840, margin: '0 auto' }}>
                <div style={{
                  background: block.image_url
                    ? `url(${block.image_url}) center/cover no-repeat`
                    : 'linear-gradient(135deg, #ff9500 0%, #ffb700 45%, #ff6b00 100%)',
                  borderRadius: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 'clamp(16px, 3vw, 36px) clamp(14px, 4vw, 36px)',
                }}>
                  <button
                    className="line-banner-btn"
                    onClick={handleAddFriend}
                    disabled={adding || loading}
                    style={{ opacity: adding ? 0.7 : 1, cursor: adding || loading ? 'not-allowed' : 'pointer' }}
                  >
                    <span className="line-banner-logo">
                      <Image src="/line-logo.png" alt="LINE" width={44} height={44} />
                    </span>
                    <span>{adding ? 'กำลังเปิด...' : (block.label || 'ทักตอนนี้! เพื่อรับสิทธิ์')}</span>
                    <span style={{ lineHeight: 1, flexShrink: 0, display: 'inline-flex' }}>
                      <SvgPointerIcon size={26} color="#ffffff" />
                    </span>
                  </button>
                </div>
              </div>
            );
          }

          /* ── LINE Add Friend button ── */
          if (block.type === 'add_friend') {
            return (
              <div key={block.id} style={{ width: '100%', lineHeight: 0 }}>
                <button
                  className="line-add-btn"
                  onClick={handleAddFriend}
                  disabled={adding || loading}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 14, width: '100%',
                    background: 'linear-gradient(135deg, #00b900 0%, #06c755 100%)',
                    color: '#fff', border: 'none', borderRadius: 0,
                    padding: '20px 24px', fontSize: 'clamp(15px, 4vw, 18px)', fontWeight: 800,
                    cursor: adding || loading ? 'not-allowed' : 'pointer',
                    opacity: adding ? 0.7 : 1,
                    letterSpacing: 0.5,
                    lineHeight: 1.2,
                  }}
                >
                  <Image src="/line-logo.png" alt="LINE" width={32} height={32} />
                  <span>{adding ? 'กำลังเปิด...' : (block.label || 'ทักตอนนี้! เพื่อรับสิทธิ์')}</span>
                </button>
              </div>
            );
          }

          return null;
        })}
      </main>

      {/* ── Dynamic Footer ── */}
      <footer className="landing-footer">
        <div className="landing-footer-shell">
          <div className="landing-footer-grid">
            <section className="landing-footer-column">
              <p className="landing-footer-title">{footer.col1_title}</p>
              <ul className="landing-footer-contact-list">
                {footer.col1_lines.map((line, i) => (
                  <li key={`${line}-${i}`}>{line}</li>
                ))}
              </ul>
            </section>

            <section className="landing-footer-column">
              <p className="landing-footer-title">{footer.col2_title}</p>
              <p className="landing-footer-brand">{footer.col2_brand}</p>
              <p className="landing-footer-description">{footer.col2_desc}</p>
            </section>

            <section className="landing-footer-column landing-footer-social-col">
              <p className="landing-footer-title">{footer.col3_title}</p>
              <div className="landing-footer-links">
                {footer.col3_links.map((link, i) => {
                  const linkStyle = {
                    '--footer-link-color': link.color || '#374151',
                  } as CSSProperties;
                  return (
                    <a
                      key={i}
                      href={link.href}
                      target={link.href.startsWith('tel:') ? undefined : '_blank'}
                      rel={link.href.startsWith('tel:') ? undefined : 'noreferrer'}
                      className="landing-footer-link"
                      style={linkStyle}
                    >
                      {link.label}
                    </a>
                  );
                })}
              </div>
            </section>
          </div>
          <div className="landing-footer-copyright">{footer.copyright}</div>
        </div>
      </footer>
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
