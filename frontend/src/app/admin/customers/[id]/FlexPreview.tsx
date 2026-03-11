import React from 'react';

// ── size / spacing maps ────────────────────────────────────────────────────────
const SIZE: Record<string, string> = {
  xxs: '10px', xs: '11px', sm: '13px', md: '14px',
  lg: '16px', xl: '18px', xxl: '22px', '3xl': '26px',
};
const SPACING: Record<string, string> = {
  none: '0', xs: '2px', sm: '4px', md: '8px',
  lg: '12px', xl: '16px', xxl: '20px',
};

function sp(val?: string) {
  if (!val) return undefined;
  return SPACING[val] ?? val;
}
function sz(val?: string) {
  if (!val) return undefined;
  return SIZE[val] ?? val;
}

// ── component types ────────────────────────────────────────────────────────────
interface FlexText {
  type: 'text';
  text?: string;
  color?: string;
  size?: string;
  weight?: string;
  align?: string;
  wrap?: boolean;
  flex?: number;
  margin?: string;
  decoration?: string;
}

interface FlexSeparator {
  type: 'separator';
  color?: string;
  margin?: string;
}

interface FlexButton {
  type: 'button';
  style?: 'primary' | 'secondary' | 'link';
  height?: 'sm' | 'md';
  color?: string;
  margin?: string;
  flex?: number;
  action?: {
    type?: string;
    label?: string;
  };
}

interface FlexBox {
  type: 'box';
  layout: 'vertical' | 'horizontal' | 'baseline';
  contents: FlexComponent[];
  backgroundColor?: string;
  cornerRadius?: string;
  paddingAll?: string;
  padding?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingStart?: string;
  paddingEnd?: string;
  spacing?: string;
  margin?: string;
  flex?: number;
  justifyContent?: string;
  alignItems?: string;
}

type FlexComponent = FlexText | FlexSeparator | FlexButton | FlexBox | { type: string };

// ── renderer ───────────────────────────────────────────────────────────────────
function renderComponent(comp: FlexComponent, idx: number): React.ReactNode {
  if (comp.type === 'separator') {
    const sep = comp as FlexSeparator;
    return (
      <hr
        key={idx}
        style={{
          border: 'none',
          borderTop: `1px solid ${sep.color ?? '#e5e7eb'}`,
          margin: `${sp(sep.margin) ?? '6px'} 0`,
        }}
      />
    );
  }

  if (comp.type === 'text') {
    const t = comp as FlexText;
    return (
      <span
        key={idx}
        style={{
          color: t.color ?? '#111827',
          fontSize: sz(t.size) ?? '13px',
          fontWeight: t.weight === 'bold' ? 700 : 400,
          textAlign: (t.align as React.CSSProperties['textAlign']) ?? 'left',
          whiteSpace: t.wrap ? 'pre-wrap' : 'nowrap',
          textDecoration: t.decoration,
          flex: t.flex,
          marginTop: sp(t.margin),
          wordBreak: 'break-word',
          display: 'block',
        }}
      >
        {t.text}
      </span>
    );
  }

  if (comp.type === 'button') {
    const button = comp as FlexButton;
    const style = button.style ?? 'secondary';
    const label = button.action?.label ?? 'Button';
    const primaryColor = button.color ?? '#1565c0';
    const secondaryColor = '#dbe3ef';
    const secondaryText = '#1f2937';

    return (
      <div
        key={idx}
        style={{
          flex: button.flex ?? 1,
          marginTop: sp(button.margin),
        }}
      >
        <div
          style={{
            width: '100%',
            minHeight: button.height === 'sm' ? 34 : 40,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 12px',
            fontSize: '13px',
            fontWeight: 700,
            border: style === 'secondary' ? '1px solid #cdd6e1' : '1px solid transparent',
            background: style === 'primary' ? primaryColor : style === 'link' ? 'transparent' : secondaryColor,
            color: style === 'primary' ? '#ffffff' : secondaryText,
            textAlign: 'center',
            boxSizing: 'border-box',
          }}
        >
          {label}
        </div>
      </div>
    );
  }

  if (comp.type === 'box') {
    const box = comp as FlexBox;
    const isBaseline = box.layout === 'baseline';
    const isHorizontal = box.layout === 'horizontal';

    const padding =
      box.paddingAll
        ? box.paddingAll
        : [box.paddingTop, box.paddingEnd, box.paddingBottom, box.paddingStart]
            .map((v) => v ?? '0')
            .join(' ');

    return (
      <div
        key={idx}
        style={{
          display: 'flex',
          flexDirection: isBaseline || isHorizontal ? 'row' : 'column',
          alignItems: isBaseline ? 'baseline' : box.alignItems ?? undefined,
          justifyContent: box.justifyContent ?? undefined,
          backgroundColor: box.backgroundColor,
          borderRadius: box.cornerRadius,
          padding: box.paddingAll ?? box.padding ?? (padding === '0 0 0 0' ? undefined : padding),
          gap: sp(box.spacing),
          marginTop: sp(box.margin),
          flex: box.flex,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {box.contents.map((child, i) => renderComponent(child, i))}
      </div>
    );
  }

  return null;
}

// ── bubble ─────────────────────────────────────────────────────────────────────
interface Bubble {
  type: 'bubble';
  body?: FlexBox;
  footer?: FlexBox;
  header?: FlexBox;
  hero?: FlexComponent;
}

function BubblePreview({ bubble }: { bubble: Bubble }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 18,
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)',
      border: '1px solid #e5e7eb',
      maxWidth: 360,
      fontFamily: '"LINE Seed Sans TH", "Noto Sans Thai", system-ui, sans-serif',
    }}>
      {bubble.header && (
        <div style={{ padding: '12px 16px 0' }}>
          {renderComponent(bubble.header, 0)}
        </div>
      )}
      {bubble.body && (
        <div>
          {renderComponent(bubble.body, 0)}
        </div>
      )}
      {bubble.footer && (
        <div>
          {renderComponent(bubble.footer, 0)}
        </div>
      )}
    </div>
  );
}

// ── public component ───────────────────────────────────────────────────────────
interface FlexMessage {
  type: 'flex';
  altText?: string;
  contents: Bubble | { type: 'carousel'; contents: Bubble[] };
}

export default function FlexPreview({ json }: { json: string }) {
  let msg: FlexMessage;
  try {
    msg = JSON.parse(json);
  } catch {
    return <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap', color: '#2b3550' }}>{json}</pre>;
  }

  if (msg.type !== 'flex') {
    return <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap', color: '#2b3550' }}>{json}</pre>;
  }

  const { contents } = msg;

  if (contents.type === 'bubble') {
    return <BubblePreview bubble={contents as Bubble} />;
  }

  if (contents.type === 'carousel') {
    const carousel = contents as { type: 'carousel'; contents: Bubble[] };
    return (
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
        {carousel.contents.map((b, i) => (
          <BubblePreview key={i} bubble={b} />
        ))}
      </div>
    );
  }

  return <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap', color: '#2b3550' }}>{json}</pre>;
}
