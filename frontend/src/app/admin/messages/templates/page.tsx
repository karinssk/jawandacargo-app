'use client';

import { useEffect, useMemo, useState } from 'react';

type TemplateType = 'INVOICE' | 'IMPORT_INVOICE' | 'CONFIRM' | 'RECEIPT';

interface TemplateConfig {
  template_type: TemplateType;
  display_name: string;
  accent_color: string;
  subtitle: string | null;
  footer_note: string | null;
  is_active: boolean;
  updated_at: string;
}

const ORDER: TemplateType[] = ['INVOICE', 'IMPORT_INVOICE', 'CONFIRM', 'RECEIPT'];

export default function TemplateConfigPage() {
  const [templates, setTemplates] = useState<TemplateConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingType, setSavingType] = useState<TemplateType | null>(null);
  const [activeTab, setActiveTab] = useState<TemplateType>('INVOICE');

  useEffect(() => {
    fetch('/api/templates', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        const rows = data.templates || [];
        setTemplates(rows);
        if (rows.length > 0 && !rows.find((x: TemplateConfig) => x.template_type === activeTab)) {
          setActiveTab(rows[0].template_type);
        }
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const current = useMemo(
    () => templates.find((t) => t.template_type === activeTab) || null,
    [templates, activeTab],
  );

  function updateTemplate(type: TemplateType, patch: Partial<TemplateConfig>) {
    setTemplates((prev) => prev.map((t) => (t.template_type === type ? { ...t, ...patch } : t)));
  }

  async function saveTemplate(t: TemplateConfig) {
    setSavingType(t.template_type);
    try {
      const res = await fetch(`/api/templates/${t.template_type}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(t),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Save failed');
        return;
      }
      updateTemplate(t.template_type, data.template);
    } finally {
      setSavingType(null);
    }
  }

  return (
    <section>
      <h1 className="page-title">Template Config</h1>
      <p className="page-subtitle">แต่ละ Template แยกเป็นแท็บ พร้อม Preview ทันทีขณะพิมพ์</p>

      {loading ? (
        <p className="page-subtitle">Loading...</p>
      ) : !current ? (
        <p className="page-subtitle">No template data</p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {ORDER.map((key) => {
              const t = templates.find((x) => x.template_type === key);
              if (!t) return null;
              const active = key === activeTab;
              return (
                <button
                  key={key}
                  type="button"
                  className={active ? 'btn btn-primary' : 'btn btn-soft'}
                  onClick={() => setActiveTab(key)}
                >
                  {t.display_name || t.template_type}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(340px, 1fr) minmax(280px, 420px)' }}>
            <article className="table-shell" style={{ padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: 18, color: '#0b57b7' }}>{current.template_type}</h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={current.is_active}
                    onChange={(e) => updateTemplate(current.template_type, { is_active: e.target.checked })}
                  />
                  Active
                </label>
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                <label>
                  <p className="field-label">Display Name</p>
                  <input
                    className="input"
                    style={{ width: '100%' }}
                    value={current.display_name}
                    onChange={(e) => updateTemplate(current.template_type, { display_name: e.target.value })}
                  />
                </label>

                <label>
                  <p className="field-label">Accent Color</p>
                  <input
                    className="input"
                    style={{ width: '100%' }}
                    value={current.accent_color}
                    onChange={(e) => updateTemplate(current.template_type, { accent_color: e.target.value })}
                  />
                </label>

                <label>
                  <p className="field-label">Subtitle / Code Prefix</p>
                  <input
                    className="input"
                    style={{ width: '100%' }}
                    value={current.subtitle || ''}
                    onChange={(e) => updateTemplate(current.template_type, { subtitle: e.target.value })}
                  />
                </label>

                <label>
                  <p className="field-label">Footer Note</p>
                  <input
                    className="input"
                    style={{ width: '100%' }}
                    value={current.footer_note || ''}
                    onChange={(e) => updateTemplate(current.template_type, { footer_note: e.target.value })}
                  />
                </label>
              </div>

              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <p className="info-note" style={{ marginTop: 0 }}>
                  Last update: {new Date(current.updated_at).toLocaleString('th-TH')}
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={savingType === current.template_type}
                  onClick={() => saveTemplate(current)}
                >
                  {savingType === current.template_type ? 'Saving...' : 'Save'}
                </button>
              </div>
            </article>

            <TemplateFlexPreview template={current} />
          </div>
        </>
      )}
    </section>
  );
}

function TemplateFlexPreview({ template }: { template: TemplateConfig }) {
  const accent = /^#[0-9a-fA-F]{6}$/.test(template.accent_color) ? template.accent_color : '#1565c0';
  const subtitle = template.subtitle || template.template_type;
  const footer = template.footer_note || 'ตัวอย่างข้อความ footer';

  return (
    <aside className="table-shell" style={{ padding: 14, position: 'sticky', top: 12, alignSelf: 'start' }}>
      <p style={{ fontWeight: 800, color: '#0b57b7', marginBottom: 10 }}>Live Preview</p>
      <div style={{ width: '100%', border: '1px solid #e9edf3', borderRadius: 16, overflow: 'hidden', background: '#fff' }}>
        <div style={{ background: accent, color: '#fff', padding: '12px 14px' }}>
          <p style={{ fontSize: 15, fontWeight: 800 }}>{template.display_name}</p>
          <p style={{ fontSize: 12, opacity: 0.92, marginTop: 4 }}>{subtitle}</p>
        </div>

        <div style={{ padding: 12, display: 'grid', gap: 7 }}>
          <PreviewRow label="เลขคำสั่งซื้อ" value="ORD-INV-250304-001" />
          <PreviewRow label="ประเภทบัญชี" value="Kbank" />
          <PreviewRow label="ยอดฐาน" value="10,000 บาท" />
          <PreviewRow label="VAT 7%" value="700 บาท" />
          <PreviewRow label="หัก ณ ที่จ่าย 3%" value="300 บาท" />
          <PreviewRow label="ยอดสุทธิ" value="10,400 บาท" emphasize />

          <div style={{ borderTop: '1px solid #eef2f7', marginTop: 2, paddingTop: 8, fontSize: 12, color: '#64748b' }}>
            {footer}
          </div>
        </div>
      </div>
    </aside>
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
