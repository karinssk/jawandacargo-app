'use client';

import { useEffect, useMemo, useState } from 'react';
import FlexPreview from '../../customers/[id]/FlexPreview';
import type { TemplatePreviewConfig, TemplateType } from '../../../../lib/flexMessagePreview';
import { buildPreviewFlexMessage } from '../../../../lib/flexMessagePreview';

type TemplateConfig = TemplatePreviewConfig & {
  is_active: boolean;
  updated_at: string;
};

const ORDER: TemplateType[] = ['IMPORT_INVOICE', 'CONFIRM', 'RECEIPT'];

function safeColor(value: string, fallback: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

export default function TemplateConfigPage() {
  const [templates, setTemplates] = useState<TemplateConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingType, setSavingType] = useState<TemplateType | null>(null);
  const [activeTab, setActiveTab] = useState<TemplateType>('IMPORT_INVOICE');

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
      <p className="page-subtitle">แก้ข้อความ สี ปุ่ม และ label ใน body ของ Flex Message ได้จากหน้านี้โดยตรง</p>

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
              return (
                <button
                  key={key}
                  type="button"
                  className={key === activeTab ? 'btn btn-primary' : 'btn btn-soft'}
                  onClick={() => setActiveTab(key)}
                >
                  {t.display_name || t.template_type}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(420px, 1fr) minmax(300px, 420px)', alignItems: 'start' }}>
            <article className="table-shell" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: 18, color: '#0b57b7', margin: 0 }}>{current.template_type}</h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={current.is_active}
                    onChange={(e) => updateTemplate(current.template_type, { is_active: e.target.checked })}
                  />
                  Active
                </label>
              </div>

              <div style={{ display: 'grid', gap: 16 }}>
                <FieldGroup title="Header">
                  <TextField
                    label="Display Name"
                    value={current.display_name}
                    onChange={(value) => updateTemplate(current.template_type, { display_name: value })}
                  />
                  <TextField
                    label="Subtitle / Code Prefix"
                    value={current.subtitle || ''}
                    onChange={(value) => updateTemplate(current.template_type, { subtitle: value })}
                  />
                  <ColorField
                    label="Accent Color"
                    value={current.accent_color}
                    onChange={(value) => updateTemplate(current.template_type, { accent_color: value })}
                  />
                  <ColorField
                    label="Header Text Color"
                    value={current.header_text_color}
                    onChange={(value) => updateTemplate(current.template_type, { header_text_color: value })}
                  />
                </FieldGroup>

                <FieldGroup title="Body Colors">
                  <ColorField
                    label="Body Label Color"
                    value={current.body_label_color}
                    onChange={(value) => updateTemplate(current.template_type, { body_label_color: value })}
                  />
                  <ColorField
                    label="Body Text Color"
                    value={current.body_text_color}
                    onChange={(value) => updateTemplate(current.template_type, { body_text_color: value })}
                  />
                  <ColorField
                    label="Separator Color"
                    value={current.separator_color}
                    onChange={(value) => updateTemplate(current.template_type, { separator_color: value })}
                  />
                </FieldGroup>

                <FieldGroup title="Footer">
                  <TextAreaField
                    label="Footer Note"
                    value={current.footer_note || ''}
                    onChange={(value) => updateTemplate(current.template_type, { footer_note: value })}
                  />
                  <ColorField
                    label="Footer Text Color"
                    value={current.footer_text_color}
                    onChange={(value) => updateTemplate(current.template_type, { footer_text_color: value })}
                  />
                  <ColorField
                    label="Footer Separator Color"
                    value={current.footer_separator_color}
                    onChange={(value) => updateTemplate(current.template_type, { footer_separator_color: value })}
                  />
                </FieldGroup>

                <FieldGroup title="Body Labels">
                  <TextField label="Order Code Label" value={current.detail_order_code_label} onChange={(value) => updateTemplate(current.template_type, { detail_order_code_label: value })} />
                  <TextField label="Document Type Label" value={current.detail_document_type_label} onChange={(value) => updateTemplate(current.template_type, { detail_document_type_label: value })} />
                  <TextField label="Account Type Label" value={current.detail_account_type_label} onChange={(value) => updateTemplate(current.template_type, { detail_account_type_label: value })} />
                  <TextField label="Account Name Label" value={current.detail_account_name_label} onChange={(value) => updateTemplate(current.template_type, { detail_account_name_label: value })} />
                  <TextField label="Account Number Label" value={current.detail_account_number_label} onChange={(value) => updateTemplate(current.template_type, { detail_account_number_label: value })} />
                  <TextField label="Amount Label" value={current.detail_amount_label} onChange={(value) => updateTemplate(current.template_type, { detail_amount_label: value })} />
                  <TextField label="Exchange Rate Label" value={current.detail_exchange_rate_label} onChange={(value) => updateTemplate(current.template_type, { detail_exchange_rate_label: value })} />
                  <TextField label="Total Label" value={current.detail_total_label} onChange={(value) => updateTemplate(current.template_type, { detail_total_label: value })} />
                  <TextField label="VAT Label" value={current.detail_vat_label} onChange={(value) => updateTemplate(current.template_type, { detail_vat_label: value })} />
                  <TextField label="Withholding Label" value={current.detail_withholding_label} onChange={(value) => updateTemplate(current.template_type, { detail_withholding_label: value })} />
                  <TextField label="Net Total Label" value={current.detail_net_total_label} onChange={(value) => updateTemplate(current.template_type, { detail_net_total_label: value })} />
                </FieldGroup>

                {current.template_type === 'IMPORT_INVOICE' && (
                  <FieldGroup title="Buttons">
                    <TextField
                      label="Confirm Button Label"
                      value={current.button_confirm_label || ''}
                      onChange={(value) => updateTemplate(current.template_type, { button_confirm_label: value })}
                    />
                    <ColorField
                      label="Confirm Button Color"
                      value={current.button_confirm_color}
                      onChange={(value) => updateTemplate(current.template_type, { button_confirm_color: value })}
                    />
                    <TextField
                      label="Cancel Button Label"
                      value={current.button_cancel_label || ''}
                      onChange={(value) => updateTemplate(current.template_type, { button_cancel_label: value })}
                    />
                  </FieldGroup>
                )}
              </div>

              <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
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

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ border: '1px solid #e9edf3', borderRadius: 14, padding: 14 }}>
      <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800, color: '#2b3550' }}>{title}</h4>
      <div style={{ display: 'grid', gap: 10 }}>{children}</div>
    </section>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <p className="field-label">{label}</p>
      <input className="input" style={{ width: '100%' }} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <p className="field-label">{label}</p>
      <textarea
        className="input"
        style={{ width: '100%', minHeight: 88, resize: 'vertical' }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const safe = safeColor(value, '#1565c0');
  return (
    <label>
      <p className="field-label">{label}</p>
      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 64px' }}>
        <input className="input" style={{ width: '100%' }} value={value} onChange={(e) => onChange(e.target.value)} />
        <input type="color" value={safe} onChange={(e) => onChange(e.target.value)} style={{ width: '100%', height: 42, border: 0, background: 'transparent' }} />
      </div>
    </label>
  );
}

function TemplateFlexPreview({ template }: { template: TemplateConfig }) {
  const previewJson = JSON.stringify(
    buildPreviewFlexMessage({
      template,
      templateType: template.template_type,
      orderCode: 'IMP-INV-250304-001',
      orderId: 101,
      accountType: 'KBANK',
      amount: 10000,
      exchangeRate: 4.75,
      exchangeRateCurrency: 'CNY',
      totalAmount: 10000,
      applyVat: true,
      applyWithholding: true,
      vatAmount: 700,
      withholdingAmount: 300,
      netTotal: 10400,
      accountMeta: {
        label: 'Kbank',
        account_name: 'Jawanda Cargo',
        account_number: '123-456-7890',
      },
    }),
  );

  return (
    <aside className="table-shell" style={{ padding: 14, position: 'sticky', top: 12, alignSelf: 'start' }}>
      <p style={{ fontWeight: 800, color: '#0b57b7', marginBottom: 10 }}>Live Preview</p>
      <FlexPreview json={previewJson} />
    </aside>
  );
}
