'use client';

import { useEffect, useState, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
type NavLink   = { label: string; href: string };
type Col3Link  = { label: string; href: string; color: string };

type HeaderCfg = {
  logo_url:   string;
  brand_name: string;
  nav_links:  NavLink[];
};

type FooterCfg = {
  col1_title: string;
  col1_lines: string[];
  col2_title: string;
  col2_brand: string;
  col2_desc:  string;
  col3_title: string;
  col3_links: Col3Link[];
  copyright:  string;
};

// ─── Small shared components ──────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 12, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, marginTop: 18, borderBottom: '1px solid #f3f4f6', paddingBottom: 6 }}>
      {children}
    </p>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{children}</label>;
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      className="field-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ marginBottom: 0 }}
    />
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminSitePage() {
  const [header, setHeader] = useState<HeaderCfg | null>(null);
  const [footer, setFooter] = useState<FooterCfg | null>(null);
  const [saving, setSaving] = useState<'header' | 'footer' | null>(null);
  const [saved, setSaved]   = useState<'header' | 'footer' | null>(null);
  const [error, setError]   = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // ── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/site-config/header')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setHeader(d))
      .catch(() => {});
    fetch('/api/site-config/footer')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setFooter(d))
      .catch(() => {});
  }, []);

  // ── Save helpers ───────────────────────────────────────────────────────────
  async function saveSection(section: 'header' | 'footer') {
    setSaving(section);
    setError('');
    try {
      const body = section === 'header' ? header : footer;
      const res = await fetch(`/api/site-config/${section}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed');
      setSaved(section);
      setTimeout(() => setSaved(null), 2500);
    } catch {
      setError(`บันทึก ${section} ไม่สำเร็จ`);
    } finally {
      setSaving(null);
    }
  }

  // ── Logo upload ────────────────────────────────────────────────────────────
  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !header) return;
    setUploadingLogo(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setHeader((h) => h ? { ...h, logo_url: ev.target?.result as string } : h);
      setUploadingLogo(false);
    };
    reader.readAsDataURL(file);
  }

  // ── Nav links helpers ──────────────────────────────────────────────────────
  function updateNavLink(i: number, field: keyof NavLink, value: string) {
    setHeader((h) => {
      if (!h) return h;
      const links = [...h.nav_links];
      links[i] = { ...links[i], [field]: value };
      return { ...h, nav_links: links };
    });
  }
  function addNavLink() {
    setHeader((h) => h ? { ...h, nav_links: [...h.nav_links, { label: '', href: '' }] } : h);
  }
  function removeNavLink(i: number) {
    setHeader((h) => h ? { ...h, nav_links: h.nav_links.filter((_, idx) => idx !== i) } : h);
  }
  function moveNavLink(i: number, dir: -1 | 1) {
    setHeader((h) => {
      if (!h) return h;
      const arr = [...h.nav_links];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return h;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...h, nav_links: arr };
    });
  }

  // ── Col1 lines helpers ─────────────────────────────────────────────────────
  function updateCol1Line(i: number, value: string) {
    setFooter((f) => {
      if (!f) return f;
      const lines = [...f.col1_lines];
      lines[i] = value;
      return { ...f, col1_lines: lines };
    });
  }
  function addCol1Line() {
    setFooter((f) => f ? { ...f, col1_lines: [...f.col1_lines, ''] } : f);
  }
  function removeCol1Line(i: number) {
    setFooter((f) => f ? { ...f, col1_lines: f.col1_lines.filter((_, idx) => idx !== i) } : f);
  }

  // ── Col3 links helpers ─────────────────────────────────────────────────────
  function updateCol3Link(i: number, field: keyof Col3Link, value: string) {
    setFooter((f) => {
      if (!f) return f;
      const links = [...f.col3_links];
      links[i] = { ...links[i], [field]: value };
      return { ...f, col3_links: links };
    });
  }
  function addCol3Link() {
    setFooter((f) => f ? { ...f, col3_links: [...f.col3_links, { label: '', href: '', color: '#374151' }] } : f);
  }
  function removeCol3Link(i: number) {
    setFooter((f) => f ? { ...f, col3_links: f.col3_links.filter((_, idx) => idx !== i) } : f);
  }
  function moveCol3Link(i: number, dir: -1 | 1) {
    setFooter((f) => {
      if (!f) return f;
      const arr = [...f.col3_links];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return f;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...f, col3_links: arr };
    });
  }

  const btnBase: React.CSSProperties = {
    height: 36, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700,
  };
  const saveBtn = (section: 'header' | 'footer'): React.CSSProperties => ({
    ...btnBase,
    padding: '0 20px',
    background: saved === section ? '#16a34a' : '#f97316',
    color: '#fff',
    opacity: saving === section ? 0.7 : 1,
  });
  const addBtn: React.CSSProperties = {
    ...btnBase, padding: '0 14px',
    background: '#f0f9ff', color: '#0369a1',
    border: '1px dashed #7dd3fc', fontSize: 12, width: '100%',
  };
  const removeBtn: React.CSSProperties = {
    width: 28, height: 28, background: '#fee2e2', color: '#b91c1c',
    border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, flexShrink: 0,
  };
  const moveBtn: React.CSSProperties = {
    width: 26, height: 26, background: '#f3f4f6', color: '#374151',
    border: '1px solid #e5e7eb', borderRadius: 5, cursor: 'pointer', fontSize: 11, flexShrink: 0,
  };

  if (!header || !footer) {
    return <div style={{ padding: 40, color: '#9ca3af', fontSize: 14 }}>กำลังโหลด...</div>;
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Top */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Site Settings</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>แก้ไข Header และ Footer ของ Landing Page</p>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>

        {/* ── HEADER CARD ─────────────────────────────────────────────────── */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div>
              <p style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>🏠 Header</p>
              <p style={{ fontSize: 12, color: '#9ca3af' }}>โลโก้ · ชื่อแบรนด์ · เมนูนำทาง</p>
            </div>
            <button style={saveBtn('header')} onClick={() => saveSection('header')} disabled={saving === 'header'}>
              {saving === 'header' ? '...' : saved === 'header' ? '✓ Saved' : 'บันทึก Header'}
            </button>
          </div>

          {/* Logo */}
          <SectionTitle>โลโก้</SectionTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={header.logo_url || '/logo.png'}
              alt="logo"
              style={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid #e87722', objectFit: 'cover', flexShrink: 0, background: '#f9fafb' }}
              onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 32, fontSize: 12, fontWeight: 600, background: '#f9fafb', border: '1.5px dashed #d1d5db', borderRadius: 7, cursor: 'pointer', color: '#374151' }}
              >
                {uploadingLogo ? '⏳ กำลังโหลด...' : '📁 อัปโหลดโลโก้'}
                <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoFile} />
              </label>
              <TextInput value={header.logo_url} onChange={(v) => setHeader((h) => h ? { ...h, logo_url: v } : h)} placeholder="URL โลโก้" />
            </div>
          </div>

          {/* Brand name */}
          <SectionTitle>ชื่อแบรนด์</SectionTitle>
          <TextInput value={header.brand_name} onChange={(v) => setHeader((h) => h ? { ...h, brand_name: v } : h)} placeholder="JAWANDA CARGO" />

          {/* Nav links */}
          <SectionTitle>เมนูนำทาง ({header.nav_links.length} รายการ)</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {header.nav_links.map((link, i) => (
              <div key={i} style={{ display: 'flex', gap: 5, alignItems: 'center', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 9, padding: '7px 9px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <button style={moveBtn} onClick={() => moveNavLink(i, -1)} disabled={i === 0} title="ขึ้น">▲</button>
                  <button style={moveBtn} onClick={() => moveNavLink(i, 1)} disabled={i === header.nav_links.length - 1} title="ลง">▼</button>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <input
                    className="field-input"
                    value={link.label}
                    onChange={(e) => updateNavLink(i, 'label', e.target.value)}
                    placeholder="ชื่อเมนู"
                    style={{ height: 30, fontSize: 12 }}
                  />
                  <input
                    className="field-input"
                    value={link.href}
                    onChange={(e) => updateNavLink(i, 'href', e.target.value)}
                    placeholder="https://..."
                    style={{ height: 30, fontSize: 11, color: '#6b7280' }}
                  />
                </div>
                <button style={removeBtn} onClick={() => removeNavLink(i)} title="ลบ">✕</button>
              </div>
            ))}
            <button style={addBtn} onClick={addNavLink}>+ เพิ่มเมนู</button>
          </div>
        </div>

        {/* ── FOOTER CARD ─────────────────────────────────────────────────── */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div>
              <p style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>📋 Footer</p>
              <p style={{ fontSize: 12, color: '#9ca3af' }}>3 คอลัมน์ · ลิงก์โซเชียล · Copyright</p>
            </div>
            <button style={saveBtn('footer')} onClick={() => saveSection('footer')} disabled={saving === 'footer'}>
              {saving === 'footer' ? '...' : saved === 'footer' ? '✓ Saved' : 'บันทึก Footer'}
            </button>
          </div>

          {/* Column 1 */}
          <SectionTitle>คอลัมน์ 1 — ข้อมูลติดต่อ</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <FieldLabel>หัวข้อคอลัมน์</FieldLabel>
            <TextInput value={footer.col1_title} onChange={(v) => setFooter((f) => f ? { ...f, col1_title: v } : f)} placeholder="ติดต่อเรา" />
            <FieldLabel>บรรทัดข้อความ</FieldLabel>
            {footer.col1_lines.map((line, i) => (
              <div key={i} style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                <input
                  className="field-input"
                  value={line}
                  onChange={(e) => updateCol1Line(i, e.target.value)}
                  placeholder={`บรรทัดที่ ${i + 1}`}
                  style={{ flex: 1, height: 30, fontSize: 12 }}
                />
                <button style={removeBtn} onClick={() => removeCol1Line(i)}>✕</button>
              </div>
            ))}
            <button style={addBtn} onClick={addCol1Line}>+ เพิ่มบรรทัด</button>
          </div>

          {/* Column 2 */}
          <SectionTitle>คอลัมน์ 2 — เกี่ยวกับ</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <FieldLabel>หัวข้อคอลัมน์</FieldLabel>
            <TextInput value={footer.col2_title} onChange={(v) => setFooter((f) => f ? { ...f, col2_title: v } : f)} placeholder="เกี่ยวกับเรา" />
            <FieldLabel>ชื่อบริษัท / แบรนด์</FieldLabel>
            <TextInput value={footer.col2_brand} onChange={(v) => setFooter((f) => f ? { ...f, col2_brand: v } : f)} placeholder="บริษัท จาวานด้า คาร์โก้" />
            <FieldLabel>คำอธิบาย</FieldLabel>
            <textarea
              value={footer.col2_desc}
              onChange={(e) => setFooter((f) => f ? { ...f, col2_desc: e.target.value } : f)}
              placeholder="รายละเอียดเกี่ยวกับบริษัท..."
              rows={4}
              style={{ width: '100%', borderRadius: 8, border: '1px solid #e5e7eb', padding: '8px 10px', fontSize: 12, resize: 'vertical', fontFamily: 'inherit', color: '#374151', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Column 3 */}
          <SectionTitle>คอลัมน์ 3 — ลิงก์โซเชียล</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <FieldLabel>หัวข้อคอลัมน์</FieldLabel>
            <TextInput value={footer.col3_title} onChange={(v) => setFooter((f) => f ? { ...f, col3_title: v } : f)} placeholder="ช่องทางการติดต่อ" />
            <FieldLabel>ปุ่มลิงก์</FieldLabel>
            {footer.col3_links.map((link, i) => (
              <div key={i} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 9, padding: '8px 9px', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingTop: 2 }}>
                  <button style={moveBtn} onClick={() => moveCol3Link(i, -1)} disabled={i === 0}>▲</button>
                  <button style={moveBtn} onClick={() => moveCol3Link(i, 1)} disabled={i === footer.col3_links.length - 1}>▼</button>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <input
                    className="field-input"
                    value={link.label}
                    onChange={(e) => updateCol3Link(i, 'label', e.target.value)}
                    placeholder="💬 ข้อความปุ่ม"
                    style={{ height: 30, fontSize: 12 }}
                  />
                  <input
                    className="field-input"
                    value={link.href}
                    onChange={(e) => updateCol3Link(i, 'href', e.target.value)}
                    placeholder="https://... หรือ tel:..."
                    style={{ height: 30, fontSize: 11, color: '#6b7280' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="color"
                      value={link.color}
                      onChange={(e) => updateCol3Link(i, 'color', e.target.value)}
                      style={{ width: 30, height: 26, borderRadius: 5, border: '1px solid #e5e7eb', cursor: 'pointer', padding: 2 }}
                    />
                    <span style={{ fontSize: 11, color: '#6b7280' }}>สีพื้นหลังปุ่ม</span>
                    {/* preview */}
                    <div style={{ flex: 1, background: link.color, color: '#fff', borderRadius: 5, padding: '3px 8px', fontSize: 10, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {link.label || 'ตัวอย่าง'}
                    </div>
                  </div>
                </div>
                <button style={removeBtn} onClick={() => removeCol3Link(i)}>✕</button>
              </div>
            ))}
            <button style={addBtn} onClick={addCol3Link}>+ เพิ่มปุ่มลิงก์</button>
          </div>

          {/* Copyright */}
          <SectionTitle>Copyright</SectionTitle>
          <TextInput value={footer.copyright} onChange={(v) => setFooter((f) => f ? { ...f, copyright: v } : f)} placeholder="2026 © Jawanda Cargo" />
        </div>
      </div>

      {/* Live preview strip */}
      <div style={{ marginTop: 20, border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>👁 Live Preview</p>
          <a href="/" target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>ดูหน้าจริง ↗</a>
        </div>
        {/* Header preview */}
        <div style={{ background: '#1a2744', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={header.logo_url || '/logo.png'} alt="" style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid #e87722', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }} />
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 13 }}>{header.brand_name}</span>
        </div>
        <div style={{ background: '#e87722', padding: '4px 14px', display: 'flex', gap: 0, overflowX: 'auto' }}>
          {header.nav_links.map((l, i) => (
            <span key={i} style={{ color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 10px', whiteSpace: 'nowrap' }}>{l.label}</span>
          ))}
        </div>
        {/* Footer preview */}
        <div style={{ background: '#0f1c36', color: '#8899aa', padding: '16px 14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 10 }}>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 11, marginBottom: 4 }}>{footer.col1_title}</p>
              {footer.col1_lines.slice(0, 4).map((l, i) => <p key={i} style={{ fontSize: 10, lineHeight: 1.8 }}>{l}</p>)}
              {footer.col1_lines.length > 4 && <p style={{ fontSize: 10, color: '#3a4a5a' }}>+{footer.col1_lines.length - 4} more</p>}
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 11, marginBottom: 4 }}>{footer.col2_title}</p>
              <p style={{ color: '#e87722', fontWeight: 700, fontSize: 10, marginBottom: 4 }}>{footer.col2_brand}</p>
              <p style={{ fontSize: 10, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{footer.col2_desc}</p>
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 11, marginBottom: 4 }}>{footer.col3_title}</p>
              {footer.col3_links.map((l, i) => (
                <div key={i} style={{ background: l.color, color: '#fff', borderRadius: 5, padding: '4px 8px', fontSize: 10, fontWeight: 700, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.label}</div>
              ))}
            </div>
          </div>
          <p style={{ fontSize: 10, textAlign: 'center', color: '#3a4a5a', borderTop: '1px solid #1e2e4a', paddingTop: 8 }}>{footer.copyright}</p>
        </div>
      </div>
    </div>
  );
}
