// Minimal stroke-based SVG icons (Heroicons style, 16×16 viewport)

interface IconProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

const def = (size: number | undefined, color: string | undefined) => ({
  width: size ?? 16,
  height: size ?? 16,
  stroke: color ?? 'currentColor',
  fill: 'none',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  flexShrink: 0,
});

export function UserIcon({ size, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...def(size, color), ...style }}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function UserPlusIcon({ size, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...def(size, color), ...style }}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}

export function GlobeIcon({ size, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...def(size, color), ...style }}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" />
    </svg>
  );
}

export function LinkIcon({ size, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...def(size, color), ...style }}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export function PackageIcon({ size, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...def(size, color), ...style }}>
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

export function MessageIcon({ size, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...def(size, color), ...style }}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function MailIcon({ size, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...def(size, color), ...style }}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export function ChartIcon({ size, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...def(size, color), ...style }}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}

export function ClockIcon({ size, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...def(size, color), ...style }}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function CheckIcon({ size, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...def(size, color), ...style }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function XIcon({ size, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...def(size, color), ...style }}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function ArrowLeftIcon({ size, color, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...def(size, color), ...style }}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}
