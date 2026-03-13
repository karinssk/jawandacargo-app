'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';

function SvgImageIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke={color} strokeWidth="1.8" />
      <circle cx="9" cy="10" r="1.7" fill={color} />
      <path d="M5.6 17l4.3-4.2 3.2 3.2 2.4-2.5 2.9 3.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SvgHeroIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke={color} strokeWidth="1.8" />
      <path d="M6.2 15.8l3.8-3.8 2.8 2.7 2.1-2.1 2.9 3.2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8.3" cy="9.2" r="1.2" fill={color} />
    </svg>
  );
}

function SvgChatIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 18l-3 2v-3.3c-.9-1.2-1.4-2.7-1.4-4.3C2.6 8 6.9 4.5 12.2 4.5S21.8 8 21.8 12.4 17.5 20.2 12.2 20.2c-1.8 0-3.6-.4-5.2-1.2z" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9.2" cy="12.2" r="1" fill={color} />
      <circle cx="12.2" cy="12.2" r="1" fill={color} />
      <circle cx="15.2" cy="12.2" r="1" fill={color} />
    </svg>
  );
}

function SvgDocIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 3.8h6.7L20.2 9v11a2.2 2.2 0 0 1-2.2 2.2H8A2.2 2.2 0 0 1 5.8 20V6A2.2 2.2 0 0 1 8 3.8z" stroke={color} strokeWidth="1.8" />
      <path d="M14.5 3.8V9h5.7" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9.2 13.1h5.6M9.2 16.3h5.6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SvgPointerIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8.5 20.2l1.2-5.2-3.9-1.8 11.5-8.2-5.6 13.1-2.8-2.4-1.2 4.5z" fill={color} />
    </svg>
  );
}

function SvgEditIcon({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20h4.2L19.1 9.1a1.9 1.9 0 0 0 0-2.7l-1.5-1.5a1.9 1.9 0 0 0-2.7 0L4 15.8V20z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12.8 6.9l4.3 4.3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SvgExternalIcon({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14.5 4.8h4.7v4.7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 14l9.2-9.2" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M19.2 12.5V19a1.9 1.9 0 0 1-1.9 1.9H5.8A1.9 1.9 0 0 1 3.9 19V7.5A1.9 1.9 0 0 1 5.8 5.6h6.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// ─── Block Thumbnail Components ──────────────────────────────────────────────
function ThumbHero() {
  return (
    <div style={{ width: 62, height: 50, borderRadius: 5, overflow: 'hidden', flexShrink: 0, border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 10, background: '#1a2744', display: 'flex', alignItems: 'center', padding: '0 4px', gap: 2 }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#e87722' }} />
        <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.35)', borderRadius: 2 }} />
      </div>
      <div style={{ height: 5, background: '#e87722' }} />
      <div style={{ flex: 1, background: 'linear-gradient(135deg,#f97316,#ea580c)', padding: '3px 4px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ height: 3, width: '65%', background: 'rgba(255,255,255,0.85)', borderRadius: 2 }} />
        <div style={{ height: 2, width: '85%', background: 'rgba(255,255,255,0.5)', borderRadius: 2 }} />
        <div style={{ height: 2, width: '45%', background: 'rgba(255,255,255,0.5)', borderRadius: 2 }} />
      </div>
    </div>
  );
}

function ThumbImage() {
  return (
    <div style={{ width: 62, height: 50, borderRadius: 5, overflow: 'hidden', flexShrink: 0, border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 10, background: '#1a2744', display: 'flex', alignItems: 'center', padding: '0 4px', gap: 2 }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#e87722' }} />
        <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.35)', borderRadius: 2 }} />
      </div>
      <div style={{ height: 4, background: '#e87722' }} />
      <div style={{ flex: 1, background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3px 6px' }}>
        <div style={{ width: '100%', height: '100%', background: '#e5e7eb', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 16, height: 12, background: '#d1d5db', borderRadius: 2, position: 'relative' }}>
            <div style={{ position: 'absolute', bottom: 2, left: 2, right: 2, height: 4, background: '#9ca3af', borderRadius: 1 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ThumbLine() {
  return (
    <div style={{ width: 62, height: 50, borderRadius: 5, overflow: 'hidden', flexShrink: 0, border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 10, background: '#1a2744', display: 'flex', alignItems: 'center', padding: '0 4px', gap: 2 }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#e87722' }} />
        <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.35)', borderRadius: 2 }} />
      </div>
      <div style={{ height: 4, background: '#e87722' }} />
      <div style={{ flex: 1, background: '#fff', display: 'flex', alignItems: 'center', padding: '4px 4px' }}>
        <div style={{ width: '100%', height: 18, background: '#06c755', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3, padding: '0 5px' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fff', flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
            <div style={{ height: 2, background: 'rgba(255,255,255,0.9)', borderRadius: 2 }} />
            <div style={{ height: 2, width: '60%', background: 'rgba(255,255,255,0.6)', borderRadius: 2 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ThumbLineBanner() {
  return (
    <div style={{ width: 62, height: 50, borderRadius: 5, overflow: 'hidden', flexShrink: 0, border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 10, background: '#1a2744', display: 'flex', alignItems: 'center', padding: '0 4px', gap: 2 }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#e87722' }} />
        <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.35)', borderRadius: 2 }} />
      </div>
      <div style={{ height: 4, background: '#e87722' }} />
      {/* orange banner background with centered pill button */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg,#ff9500,#ffb700)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3px 4px' }}>
        <div style={{ width: '100%', height: 14, background: '#06c755', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, padding: '0 4px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
        }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#06c755' }} />
          </div>
          <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.9)', borderRadius: 2 }} />
          <div style={{ width: 6, height: 6, color: '#fff', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SvgPointerIcon size={6} color="#ffffff" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ThumbLineCard() {
  return (
    <div style={{ width: 62, height: 50, borderRadius: 5, overflow: 'hidden', flexShrink: 0, border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 10, background: '#1a2744', display: 'flex', alignItems: 'center', padding: '0 4px', gap: 2 }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#e87722' }} />
        <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.35)', borderRadius: 2 }} />
      </div>
      <div style={{ height: 4, background: '#e87722' }} />
      {/* white bg to show max-width constraint, card inset */}
      <div style={{ flex: 1, background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3px 5px' }}>
        <div style={{ width: '100%', background: 'linear-gradient(135deg,#ff9500,#ffb700)', borderRadius: 5, padding: '3px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', height: 12, background: '#06c755', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, padding: '0 3px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.22)'
          }}>
            <div style={{ width: 7, height: 7, borderRadius: 2, background: '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#06c755' }} />
            </div>
            <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.9)', borderRadius: 2 }} />
            <div style={{ width: 6, height: 6, color: '#fff', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SvgPointerIcon size={6} color="#ffffff" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThumbHeroWithBtn() {
  return (
    <div style={{ width: 62, height: 50, borderRadius: 5, overflow: 'hidden', flexShrink: 0, border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 10, background: '#1a2744', display: 'flex', alignItems: 'center', padding: '0 4px', gap: 2 }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#e87722' }} />
        <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.35)', borderRadius: 2 }} />
      </div>
      <div style={{ height: 4, background: '#e87722' }} />
      {/* image area with overlaid pill button on left */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg,#f97316,#ea580c)', position: 'relative', display: 'flex', alignItems: 'center' }}>
        {/* faint image lines */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', padding: '2px 0', opacity: 0.25 }}>
          <div style={{ height: 2, background: '#fff' }} />
          <div style={{ height: 2, background: '#fff' }} />
          <div style={{ height: 2, background: '#fff' }} />
        </div>
        {/* LINE pill button */}
        <div style={{ marginLeft: 4, background: '#06c755', borderRadius: 6, padding: '2px 5px', display: 'flex', alignItems: 'center', gap: 2, zIndex: 1 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', flexShrink: 0 }} />
          <div style={{ height: 2, width: 14, background: 'rgba(255,255,255,0.9)', borderRadius: 2 }} />
        </div>
      </div>
    </div>
  );
}

function ThumbHeroDynamicAddLine() {
  return (
    <div style={{ width: 62, height: 50, borderRadius: 5, overflow: 'hidden', flexShrink: 0, border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 10, background: '#1a2744', display: 'flex', alignItems: 'center', padding: '0 4px', gap: 2 }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#e87722' }} />
        <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.35)', borderRadius: 2 }} />
      </div>
      <div style={{ height: 4, background: '#e87722' }} />
      <div style={{ flex: 1, background: 'linear-gradient(135deg,#dbeafe,#bfdbfe)', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#f8fafc,#e2e8f0)', opacity: 0.9 }} />
        <div style={{ position: 'absolute', left: 24, top: 15, width: 32, height: 14, borderRadius: 7, background: '#06c755', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
      </div>
    </div>
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
  sort_order: number;
  is_active: boolean;
};

type EditForm = {
  type: 'image' | 'add_friend' | 'hero-full-width' | 'hero-full-width-btn-left' | 'add_friend_banner' | 'add_friend_card' | 'hero-with-dynamic-add-line';
  image_url: string;
  label: string;
  button_url: string;
  button_left_pct: number;
  button_top_pct: number;
  button_width_pct: number;
  is_active: boolean;
};

const MAX_DATA_URL_BYTES = 850 * 1024;
const MAX_IMAGE_DIMENSION = 1920;
const MIN_IMAGE_DIMENSION = 420;
const JPEG_QUALITIES = [0.9, 0.84, 0.78, 0.72, 0.66, 0.6, 0.54, 0.48, 0.42, 0.36];
const RESIZE_SCALES = [1, 0.92, 0.84, 0.76, 0.68, 0.6, 0.52, 0.44, 0.36, 0.28];
const BLOCK_TYPE_SET = new Set([
  'image',
  'add_friend',
  'hero-full-width',
  'hero-full-width-btn-left',
  'add_friend_banner',
  'add_friend_card',
  'hero-with-dynamic-add-line',
]);

function parseErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === 'object' && 'error' in payload) {
    const raw = (payload as { error?: unknown }).error;
    if (typeof raw === 'string' && raw.trim()) return raw;
  }
  return fallback;
}

function normalizeBlock(raw: unknown): Block | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  const id = Number(item.id);
  const type = String(item.type || '');
  if (!Number.isInteger(id) || id <= 0) return null;
  if (!BLOCK_TYPE_SET.has(type)) return null;

  return {
    id,
    type: type as Block['type'],
    image_url: typeof item.image_url === 'string' ? item.image_url : null,
    label: typeof item.label === 'string' ? item.label : null,
    button_url: typeof item.button_url === 'string' ? item.button_url : null,
    button_left_pct: typeof item.button_left_pct === 'number' ? item.button_left_pct : 50,
    button_top_pct: typeof item.button_top_pct === 'number' ? item.button_top_pct : 44,
    button_width_pct: typeof item.button_width_pct === 'number' ? item.button_width_pct : 42,
    sort_order: typeof item.sort_order === 'number' ? item.sort_order : 0,
    is_active: typeof item.is_active === 'boolean' ? item.is_active : true,
  };
}

function dataUrlByteLength(dataUrl: string) {
  const base64 = dataUrl.split(',')[1] || '';
  return Math.ceil((base64.length * 3) / 4);
}

function loadImageFromUrl(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('invalid-image'));
    img.src = url;
  });
}

function renderCompressedDataUrl(
  img: HTMLImageElement,
  width: number,
  height: number,
  mimeType: 'image/png' | 'image/jpeg',
  quality?: number,
) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas-context-failed');

  // JPEG has no alpha; fill with white to avoid black transparent areas.
  if (mimeType === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return quality != null
    ? canvas.toDataURL(mimeType, quality)
    : canvas.toDataURL(mimeType);
}

async function compressImageToDataUrl(file: File) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImageFromUrl(objectUrl);
    const longest = Math.max(img.width, img.height);
    const scale = longest > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / longest : 1;
    const baseWidth = Math.max(1, Math.round(img.width * scale));
    const baseHeight = Math.max(1, Math.round(img.height * scale));

    let bestDataUrl = '';
    let bestSize = Number.POSITIVE_INFINITY;

    // Keep PNG only when already small enough; otherwise force JPEG for better compression.
    if (file.type === 'image/png') {
      const pngData = renderCompressedDataUrl(img, baseWidth, baseHeight, 'image/png');
      const pngBytes = dataUrlByteLength(pngData);
      if (pngBytes <= MAX_DATA_URL_BYTES) return pngData;
      bestDataUrl = pngData;
      bestSize = pngBytes;
    }

    for (const resizeScale of RESIZE_SCALES) {
      const width = Math.max(1, Math.round(baseWidth * resizeScale));
      const height = Math.max(1, Math.round(baseHeight * resizeScale));
      const currentLongest = Math.max(width, height);
      const allowTinyFallback = resizeScale === RESIZE_SCALES[RESIZE_SCALES.length - 1];
      if (currentLongest < MIN_IMAGE_DIMENSION && !allowTinyFallback) continue;

      for (const quality of JPEG_QUALITIES) {
        const jpegData = renderCompressedDataUrl(img, width, height, 'image/jpeg', quality);
        const jpegBytes = dataUrlByteLength(jpegData);
        if (jpegBytes < bestSize) {
          bestSize = jpegBytes;
          bestDataUrl = jpegData;
        }
        if (jpegBytes <= MAX_DATA_URL_BYTES) {
          return jpegData;
        }
      }
    }

    // Last fallback: return best attempt only if close enough to limit to avoid false rejects.
    if (bestDataUrl && bestSize <= MAX_DATA_URL_BYTES * 1.03) {
      return bestDataUrl;
    }

    throw new Error('too-large-after-compress');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function AdminLandingPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    type: 'image',
    image_url: '',
    label: '',
    button_url: '',
    button_left_pct: 50,
    button_top_pct: 44,
    button_width_pct: 42,
    is_active: true,
  });
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [error, setError] = useState('');
  const [uploadingImg, setUploadingImg] = useState(false);

  const selectedBlock = blocks.find((b) => b.id === selectedId) ?? null;

  async function load() {
    try {
      const res = await fetch('/api/landing-blocks/all', { credentials: 'include' });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(parseErrorMessage(data, 'โหลดไม่สำเร็จ'));
        return;
      }
      if (Array.isArray(data)) {
        const normalized = data.map(normalizeBlock).filter((item): item is Block => item !== null);
        setBlocks(normalized);
      } else {
        setBlocks([]);
      }
    } catch {
      setError('โหลดไม่สำเร็จ');
    }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  // Sync edit form when selection changes
  useEffect(() => {
    if (selectedBlock) {
      setEditForm({
        type: selectedBlock.type,
        image_url: selectedBlock.image_url ?? '',
        label: selectedBlock.label ?? '',
        button_url: selectedBlock.button_url ?? '',
        button_left_pct: selectedBlock.button_left_pct ?? 50,
        button_top_pct: selectedBlock.button_top_pct ?? 44,
        button_width_pct: selectedBlock.button_width_pct ?? 42,
        is_active: selectedBlock.is_active,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  async function addBlock(type: Block['type']) {
    setError('');
    try {
      const res = await fetch('/api/landing-blocks', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        const errMsg = parseErrorMessage(payload, 'เพิ่ม block ไม่สำเร็จ');
        setError(errMsg);
        return;
      }
      const newBlock = normalizeBlock(payload);
      if (!newBlock) {
        setError('รูปแบบข้อมูล block ไม่ถูกต้อง');
        return;
      }
      setBlocks((prev) => [...prev.filter((b) => Number.isInteger(b.id) && b.id > 0), newBlock]);
      setSelectedId(newBlock.id);
    } catch {
      setError('เพิ่ม block ไม่สำเร็จ');
    }
  }

  async function saveBlock() {
    if (!Number.isInteger(selectedId)) return;
    setSaving(true);
    setError('');
    try {
      if (editForm.image_url.startsWith('data:') && dataUrlByteLength(editForm.image_url) > MAX_DATA_URL_BYTES) {
        setError('รูปภาพใหญ่เกินไป กรุณาอัปโหลดรูปที่เล็กลง หรือลดขนาดก่อนบันทึก');
        setSaving(false);
        return;
      }

      const body = {
        type: editForm.type,
        image_url: editForm.image_url || null,
        label: editForm.label || null,
        button_url: editForm.button_url || null,
        button_left_pct: editForm.button_left_pct,
        button_top_pct: editForm.button_top_pct,
        button_width_pct: editForm.button_width_pct,
        is_active: editForm.is_active,
      };
      const res = await fetch(`/api/landing-blocks/${selectedId}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        if (res.status === 413) throw new Error('payload-too-large');
        const errMsg = parseErrorMessage(payload, 'บันทึกไม่สำเร็จ');
        throw new Error(errMsg);
      }
      const updated = normalizeBlock(payload);
      if (!updated) throw new Error('รูปแบบข้อมูล block ไม่ถูกต้อง');
      setBlocks((prev) => prev.map((b) => (b.id === selectedId ? updated : b)));
      setSaveMsg('Saved');
      setTimeout(() => setSaveMsg(''), 2000);
    } catch (err) {
      if (err instanceof Error && err.message === 'payload-too-large') {
        setError('ข้อมูลรูปภาพใหญ่เกินไป (413) กรุณาลดขนาดรูป หรือใช้ URL รูปแทนการอัปโหลดไฟล์');
      } else {
        setError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ');
      }
    }
    finally { setSaving(false); }
  }

  async function deleteBlock(id: number) {
    if (!Number.isInteger(id)) {
      setError('ไม่สามารถลบ block นี้ได้ (id ไม่ถูกต้อง)');
      return;
    }
    if (!confirm('ลบ block นี้?')) return;
    try {
      const res = await fetch(`/api/landing-blocks/${id}`, { method: 'DELETE', credentials: 'include' });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        setError(parseErrorMessage(payload, 'ลบ block ไม่สำเร็จ'));
        return;
      }
      setBlocks((prev) => prev.filter((b) => b.id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch {
      setError('ลบ block ไม่สำเร็จ');
    }
  }

  async function reorderBlocks(newBlocks: Block[]) {
    setBlocks(newBlocks);
    try {
      await fetch('/api/landing-blocks/reorder', {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: newBlocks.map((b) => b.id) }),
      });
    } catch { setError('เรียงลำดับไม่สำเร็จ'); }
  }

  function onDragStart(e: React.DragEvent, idx: number) {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  }
  function onDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    setDragOverIdx(idx);
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    if (dragIdx === null || dragOverIdx === null || dragIdx === dragOverIdx) {
      setDragIdx(null); setDragOverIdx(null); return;
    }
    const arr = [...blocks];
    const [moved] = arr.splice(dragIdx, 1);
    arr.splice(dragOverIdx, 0, moved);
    reorderBlocks(arr);
    setDragIdx(null); setDragOverIdx(null);
  }

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    setError('');
    try {
      const compressedDataUrl = await compressImageToDataUrl(file);
      setEditForm((f) => ({ ...f, image_url: compressedDataUrl }));
    } catch (err) {
      if (err instanceof Error && err.message === 'too-large-after-compress') {
        setError(`ไฟล์นี้มีรายละเอียดสูงมาก ระบบบีบอัดอัตโนมัติแล้วแต่ยังเกิน ${Math.round(MAX_DATA_URL_BYTES / 1024)}KB กรุณาใช้ภาพขนาดเล็กลง`);
      } else {
        setError('อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่');
      }
    } finally {
      setUploadingImg(false);
      e.target.value = '';
    }
  }

  // ─── Left Panel ─────────────────────────────────────────────────────────────
  const PALETTE_ITEMS: { type: Block['type']; label: string; sub: string; Thumb: () => React.ReactElement }[] = [
    { type: 'hero-full-width',          label: 'Hero Full-Width',          sub: '+ Add Hero Full-Width',          Thumb: ThumbHero        },
    { type: 'hero-full-width-btn-left', label: 'Hero + LINE Btn Left',     sub: '+ Add Hero with Button',         Thumb: ThumbHeroWithBtn },
    { type: 'hero-with-dynamic-add-line', label: 'Hero Dynamic Add LINE',  sub: '+ Add Hero Dynamic Add LINE',    Thumb: ThumbHeroDynamicAddLine },
    { type: 'image',                    label: 'Image Block',               sub: '+ Add Image Block',              Thumb: ThumbImage       },
    { type: 'add_friend_banner',        label: 'LINE Banner (Full-Width)',  sub: '+ Add LINE Banner',              Thumb: ThumbLineBanner  },
    { type: 'add_friend_card',          label: 'LINE Banner (Card)',        sub: '+ Add LINE Card',                Thumb: ThumbLineCard    },
    { type: 'add_friend',               label: 'LINE Button (Flush)',       sub: '+ Add LINE Button (flush)',      Thumb: ThumbLine        },
  ];

  const TYPE_COLOR: Record<Block['type'], string> = {
    'hero-full-width':          '#6366f1',
    'hero-full-width-btn-left': '#8b5cf6',
    'hero-with-dynamic-add-line': '#0ea5e9',
    'image':                    '#f97316',
    'add_friend_banner':        '#16a34a',
    'add_friend_card':          '#15803d',
    'add_friend':               '#06c755',
  };

  const LeftPanel = (
    <div style={{ width: 220, flexShrink: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Header */}
      <div style={{ marginBottom: 10 }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: '#111827', marginBottom: 2 }}>Full Page Preview</p>
        <p style={{ fontSize: 11, color: '#9ca3af' }}>Click a section to edit inline</p>
      </div>

      <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 12, marginBottom: 2 }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Page Blocks
        </p>

        {/* Search (cosmetic) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 10px', marginBottom: 10 }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="#9ca3af" strokeWidth="1.5"/><path d="M11 11l3 3" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>Search blocks...</span>
        </div>

        {/* Palette cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {PALETTE_ITEMS.map(({ type, label, sub, Thumb }) => (
            <button
              key={type}
              onClick={() => addBlock(type)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '8px 10px',
                background: '#fff', border: '1px solid #e5e7eb',
                borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = TYPE_COLOR[type];
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 0 3px ${TYPE_COLOR[type]}22`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
              }}
            >
              <Thumb />
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: '#111827', marginBottom: 2, lineHeight: 1.2 }}>{label}</p>
                <p style={{ fontSize: 11, color: TYPE_COLOR[type], fontWeight: 600 }}>{sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Block layer list */}
      {blocks.length > 0 && (
        <div style={{ marginTop: 16, borderTop: '1px solid #f3f4f6', paddingTop: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Layers ({blocks.length})
          </p>
          {blocks.map((b, idx) => (
            <div
              key={b.id}
              onClick={() => setSelectedId(b.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
                borderRadius: 8, cursor: 'pointer', marginBottom: 3,
                background: selectedId === b.id ? '#fff7ed' : '#fafafa',
                border: `1px solid ${selectedId === b.id ? '#fed7aa' : '#f3f4f6'}`,
                opacity: b.is_active ? 1 : 0.5,
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: 2, background: TYPE_COLOR[b.type], flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, fontWeight: 500 }}>
                {b.label || `${b.type === 'hero-full-width' ? 'Hero' : b.type === 'hero-full-width-btn-left' ? 'Hero+BTN' : b.type === 'hero-with-dynamic-add-line' ? 'Hero Dynamic' : b.type === 'image' ? 'Image' : b.type === 'add_friend_banner' ? 'LINE Banner' : b.type === 'add_friend_card' ? 'LINE Card' : 'LINE'} ${idx + 1}`}
              </span>
              <span style={{ fontSize: 10, color: '#9ca3af', flexShrink: 0 }}>#{idx + 1}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ─── Center Preview ──────────────────────────────────────────────────────────
  const CenterPreview = (
    <div style={{ flex: 1, overflowY: 'auto', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
      <div>
        {/* Simulated Header */}
        <div style={{ background: '#1a2744', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e87722', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>J</div>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: 1 }}>JAWANDA CARGO</span>
        </div>
        <div style={{ background: '#e87722', padding: '7px 16px', display: 'flex', gap: 0, overflowX: 'auto' }}>
          {['หน้าแรก', 'เกี่ยวกับเรา', 'บริการของเรา', 'โปรโมชั่น', 'ติดต่อเรา'].map((l) => (
            <span key={l} style={{ color: '#fff', fontSize: 12, fontWeight: 600, padding: '3px 10px', whiteSpace: 'nowrap' }}>{l}</span>
          ))}
        </div>

        {/* Empty state */}
        {!loading && blocks.length === 0 && (
          <div style={{ background: '#fff', padding: '60px 20px', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
              <SvgDocIcon size={34} color="#9ca3af" />
            </div>
            <p style={{ fontSize: 14 }}>ยังไม่มี block — คลิก block ทางซ้ายเพื่อเพิ่ม</p>
          </div>
        )}
        {loading && (
          <div style={{ background: '#fff', padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>กำลังโหลด...</div>
        )}

        {/* Blocks */}
        {blocks.map((block, idx) => {
          const isSelected = selectedId === block.id;
          const isDragging = dragIdx === idx;
          const isDragOver = dragOverIdx === idx;
          const isHovered = hoverIdx === idx;
          const showActions = isSelected || isHovered;

          return (
            <div
              key={block.id}
              className="preview-block"
              draggable
              onDragStart={(e) => onDragStart(e, idx)}
              onDragOver={(e) => onDragOver(e, idx)}
              onDrop={onDrop}
              onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
              onMouseEnter={() => setHoverIdx(idx)}
              onMouseLeave={() => setHoverIdx(null)}
              onClick={() => setSelectedId(block.id)}
              style={{
                position: 'relative',
                cursor: 'pointer',
                outline: isSelected
                  ? '3px solid #f97316'
                  : isDragOver
                  ? '2px dashed #3b82f6'
                  : 'none',
                outlineOffset: isSelected ? -2 : 0,
                opacity: isDragging ? 0.4 : block.is_active ? 1 : 0.5,
                background: block.type === 'add_friend'
                  ? '#f0fdf4'
                  : (block.type === 'add_friend_banner' || block.type === 'add_friend_card')
                    ? '#fff7ed'
                    : (block.type === 'hero-full-width-btn-left' || block.type === 'hero-with-dynamic-add-line') && !block.image_url
                      ? '#eff6ff'
                      : '#fff',
                transition: 'outline 0.1s',
              }}
            >
              {/* Action bar (shows on hover/select) */}
              <div
                className="block-action-bar"
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'rgba(0,0,0,0.55)', padding: '4px 8px',
                  opacity: showActions ? 1 : 0,
                  transition: 'opacity 0.15s',
                  pointerEvents: showActions ? 'auto' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#fff', fontSize: 14, cursor: 'grab', padding: '2px 4px' }} title="ลากเพื่อเรียงลำดับ">⠿</span>
                  <span style={{ color: '#fff', fontSize: 11, opacity: 0.7 }}>
                    {block.type === 'hero-full-width' ? 'Hero Full-Width' :
                     block.type === 'hero-full-width-btn-left' ? 'Hero + LINE Btn' :
                     block.type === 'hero-with-dynamic-add-line' ? 'Hero Dynamic Add LINE' :
                     block.type === 'image' ? 'Image Block' :
                     block.type === 'add_friend_banner' ? 'LINE Banner' :
                     block.type === 'add_friend_card' ? 'LINE Card' : 'LINE Button'} · #{idx + 1}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <span
                    style={{ background: isSelected ? '#f97316' : '#6b7280', color: '#fff', borderRadius: 4, padding: '2px 7px', fontSize: 11, fontWeight: 600 }}
                    onClick={(e) => { e.stopPropagation(); setSelectedId(isSelected ? null : block.id); }}
                  >
                    {isSelected ? 'Editing' : 'Edit'}
                  </span>
                  <span
                    onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                    style={{ background: '#ef4444', color: '#fff', borderRadius: 4, padding: '2px 7px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                  >
                    ✕
                  </span>
                </div>
              </div>

              {/* Block Content */}
              {block.type === 'hero-full-width' && (
                block.image_url
                  ? (
                    <div style={{ position: 'relative', lineHeight: 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={block.image_url} alt={block.label || ''} style={{ width: '100%', display: 'block' }} />
                      <span style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(99,102,241,0.85)', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 4, padding: '2px 6px' }}>
                        HERO FULL-WIDTH
                      </span>
                    </div>
                  )
                  : (
                    <div style={{ height: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#818cf8', background: '#f5f3ff', borderBottom: '1px dashed #c7d2fe', gap: 6 }}>
                      <SvgHeroIcon size={30} color="#818cf8" />
                      <span style={{ fontSize: 12 }}>Hero Full-Width — คลิก Edit เพื่อเพิ่มรูปภาพ</span>
                    </div>
                  )
              )}
              {block.type === 'hero-full-width-btn-left' && (
                block.image_url
                  ? (
                    <div style={{ position: 'relative', lineHeight: 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={block.image_url} alt={block.label || ''} style={{ width: '100%', display: 'block' }} />
                      {/* Overlaid LINE button preview */}
                      <div style={{ position: 'absolute', top: '50%', left: '5%', transform: 'translateY(-50%)', zIndex: 2 }}>
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          background: 'linear-gradient(135deg,#00b900,#06c755)',
                          color: '#fff', borderRadius: 50,
                          padding: '6px 12px', fontSize: 11, fontWeight: 800,
                          boxShadow: '0 3px 12px rgba(0,0,0,0.3), 0 0 0 2px rgba(255,255,255,0.3)',
                          whiteSpace: 'nowrap',
                        }}>
                          <SvgChatIcon size={12} color="#ffffff" /> {block.label || 'ทักตอนนี้! เพื่อรับสิทธิ์'}
                        </div>
                      </div>
                      <span style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(139,92,246,0.85)', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 4, padding: '2px 6px' }}>
                        HERO + LINE BTN
                      </span>
                    </div>
                  )
                  : (
                    <div style={{ height: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6', background: '#f5f3ff', borderBottom: '1px dashed #ddd6fe', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <SvgHeroIcon size={28} color="#8b5cf6" />
                        <SvgChatIcon size={24} color="#8b5cf6" />
                      </div>
                      <span style={{ fontSize: 12 }}>Hero + LINE Button — คลิก Edit เพื่อเพิ่มรูปภาพ</span>
                    </div>
                  )
              )}
              {block.type === 'hero-with-dynamic-add-line' && (
                ((isSelected ? (editForm.image_url || block.image_url) : block.image_url))
                  ? (
                    <div style={{ position: 'relative', lineHeight: 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={(isSelected ? (editForm.image_url || block.image_url) : block.image_url) || ''}
                        alt={(isSelected ? (editForm.label || block.label) : block.label) || ''}
                        style={{ width: '100%', display: 'block' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: `${Math.min(95, Math.max(0, Number(isSelected ? editForm.button_top_pct : (block.button_top_pct ?? 44))))}%`,
                          left: `${Math.min(95, Math.max(0, Number(isSelected ? editForm.button_left_pct : (block.button_left_pct ?? 50))))}%`,
                          width: `${Math.min(95, Math.max(8, Number(isSelected ? editForm.button_width_pct : (block.button_width_pct ?? 42))))}%`,
                          transform: 'translate(-50%, -50%)',
                          zIndex: 2,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            width: '100%',
                            borderRadius: 999,
                            padding: '8px 14px',
                            color: '#fff',
                            fontSize: 13,
                            fontWeight: 900,
                            background: 'linear-gradient(135deg,#00b900,#06c755)',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.3), 0 0 0 2px rgba(255,255,255,0.35)',
                            textAlign: 'center',
                          }}
                        >
                          <span style={{ background: '#fff', borderRadius: 999, width: 18, height: 18, color: '#06c755', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>+</span>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {(isSelected ? editForm.label : block.label) || '@JAWANDACARGO'}
                          </span>
                        </div>
                      </div>
                      <span style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(14,165,233,0.92)', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 4, padding: '2px 6px' }}>
                        HERO DYNAMIC ADD LINE
                      </span>
                    </div>
                  )
                  : (
                    <div style={{ height: 132, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#0284c7', background: '#eff6ff', borderBottom: '1px dashed #93c5fd', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <SvgHeroIcon size={28} color="#0284c7" />
                        <SvgChatIcon size={24} color="#0284c7" />
                      </div>
                      <span style={{ fontSize: 12 }}>Hero Dynamic Add LINE — คลิก Edit เพื่อเพิ่มรูปภาพ</span>
                    </div>
                  )
              )}
              {block.type === 'image' && (
                block.image_url
                  ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={block.image_url} alt={block.label || ''} style={{ width: '100%', display: 'block', minHeight: 60 }} />
                  )
                  : (
                    <div style={{
                      height: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      color: '#9ca3af', background: '#f9fafb', borderBottom: '1px dashed #e5e7eb', gap: 6
                    }}>
                      <SvgImageIcon size={30} color="#9ca3af" />
                      <span style={{ fontSize: 12 }}>คลิก Edit เพื่อเพิ่มรูปภาพ</span>
                    </div>
                  )
              )}

              {block.type === 'add_friend_banner' && (
                <div style={{
                  width: '100%',
                  background: block.image_url
                    ? `url(${block.image_url}) center/cover no-repeat`
                    : 'linear-gradient(135deg,#ff9500 0%,#ffb700 45%,#ff6b00 100%)',
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  padding: '18px 16px',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 10, width: '100%', maxWidth: 480,
                    background: 'linear-gradient(135deg,#00b900,#06c755)',
                    borderRadius: 100, padding: '12px 20px',
                    color: '#fff', fontWeight: 900, fontSize: 15,
                    boxShadow: '0 6px 22px rgba(0,0,0,0.28), 0 0 0 3px rgba(255,255,255,0.22)',
                  }}>
                    <span style={{ background: '#fff', borderRadius: 8, padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ width: 22, height: 22, background: '#06c755', borderRadius: '50%', display: 'block' }} />
                    </span>
                    <span style={{ flex: 1, textAlign: 'center' }}>{block.label || 'ทักตอนนี้! เพื่อรับสิทธิ์'}</span>
                    <span style={{ lineHeight: 1, flexShrink: 0, display: 'inline-flex' }}>
                      <SvgPointerIcon size={18} color="#ffffff" />
                    </span>
                  </div>
                </div>
              )}

              {block.type === 'add_friend_card' && (
                <div style={{ background: '#f9fafb', padding: '10px 12px' }}>
                  <div style={{
                    background: block.image_url
                      ? `url(${block.image_url}) center/cover no-repeat`
                      : 'linear-gradient(135deg,#ff9500 0%,#ffb700 45%,#ff6b00 100%)',
                    borderRadius: 12, padding: '14px 14px',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: 8, width: '100%',
                      background: 'linear-gradient(135deg,#00b900,#06c755)',
                      borderRadius: 100, padding: '10px 16px',
                      color: '#fff', fontWeight: 900, fontSize: 14,
                      boxShadow: '0 5px 18px rgba(0,0,0,0.28), 0 0 0 3px rgba(255,255,255,0.22)',
                    }}>
                      <span style={{ background: '#fff', borderRadius: 7, padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ width: 18, height: 18, background: '#06c755', borderRadius: '50%', display: 'block' }} />
                      </span>
                      <span style={{ flex: 1, textAlign: 'center' }}>{block.label || 'ทักตอนนี้! เพื่อรับสิทธิ์'}</span>
                      <span style={{ lineHeight: 1, flexShrink: 0, display: 'inline-flex' }}>
                        <SvgPointerIcon size={15} color="#ffffff" />
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {block.type === 'add_friend' && (
                <div style={{ padding: '16px' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #00b900 0%, #06c755 100%)',
                    borderRadius: 10, padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    color: '#fff', boxShadow: '0 4px 14px rgba(6, 199, 85, 0.35)',
                  }}>
                    <span style={{ lineHeight: 1, display: 'inline-flex' }}>
                      <SvgChatIcon size={24} color="#ffffff" />
                    </span>
                    <span style={{ fontWeight: 800, fontSize: 16 }}>
                      {block.label || 'ทักตอนนี้! เพื่อรับสิทธิ์'}
                    </span>
                  </div>
                </div>
              )}

              {/* Selected overlay */}
              {isSelected && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(249,115,22,0.04)', pointerEvents: 'none' }} />
              )}
            </div>
          );
        })}

        {/* Simulated Footer */}
        <div style={{ background: '#0f1c36', color: '#8899aa', padding: '20px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, marginBottom: 6, fontSize: 12 }}>ติดต่อเรา</p>
              <p style={{ fontSize: 11, lineHeight: 1.8 }}>Line: @jawandacargo<br />Facebook: @jawandacargo<br />TEL. 099-420-7491</p>
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, marginBottom: 6, fontSize: 12 }}>เกี่ยวกับเรา</p>
              <p style={{ fontSize: 11, lineHeight: 1.7 }}>บริการนำเข้าสินค้าจากจีน One Stop Service ครบจบในที่เดียว ประสบการณ์มากกว่า 10 ปี</p>
            </div>
          </div>
          <p style={{ fontSize: 10, textAlign: 'center', color: '#3a4a5a', borderTop: '1px solid #1e2e4a', paddingTop: 10 }}>
            2026 © Jawanda Cargo
          </p>
        </div>
      </div>
    </div>
  );

  // ─── Right Edit Panel ────────────────────────────────────────────────────────
  const RightPanel = selectedBlock && (
    <div style={{ width: 264, flexShrink: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: 14, color: '#111827', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <SvgEditIcon size={14} color="#111827" />
              <span>Inline Editor</span>
            </p>
            <p style={{ fontSize: 11, color: '#9ca3af' }}>
              Editing: {
                selectedBlock.type === 'hero-full-width' ? 'Hero Full-Width' :
                selectedBlock.type === 'hero-full-width-btn-left' ? 'Hero + LINE Button' :
                selectedBlock.type === 'hero-with-dynamic-add-line' ? 'Hero Dynamic Add LINE' :
                selectedBlock.type === 'image' ? 'Image Block' :
                selectedBlock.type === 'add_friend_banner' ? 'LINE Banner (Full)' :
                selectedBlock.type === 'add_friend_card' ? 'LINE Banner (Card)' : 'LINE Button'
              }
            </p>
          </div>
          <button
            onClick={() => setSelectedId(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 16, lineHeight: 1, padding: '2px 4px' }}
          >✕</button>
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', marginTop: 10, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Image URL / Upload (image blocks only) */}
          {(selectedBlock.type === 'image' || selectedBlock.type === 'hero-full-width' || selectedBlock.type === 'hero-full-width-btn-left' || selectedBlock.type === 'hero-with-dynamic-add-line' || selectedBlock.type === 'add_friend_banner' || selectedBlock.type === 'add_friend_card') && (
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {(selectedBlock.type === 'add_friend_banner' || selectedBlock.type === 'add_friend_card') ? 'Background Image (optional)' : 'Image'}
              </label>

              {/* Preview */}
              {editForm.image_url && (
                <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb', marginBottom: 8 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={editForm.image_url} alt="" style={{ width: '100%', display: 'block', maxHeight: 140, objectFit: 'cover' }} />
                </div>
              )}

              {/* Upload file */}
              <label
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  width: '100%', padding: '8px 10px', fontSize: 12, fontWeight: 600,
                  background: '#fff', border: '1.5px dashed #d1d5db', borderRadius: 8,
                  cursor: 'pointer', color: '#374151', marginBottom: 6,
                }}
              >
                {uploadingImg ? 'กำลังโหลด...' : 'อัปโหลดรูปภาพ'}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageFile}
                />
              </label>

              {/* URL input */}
              <input
                type="text"
                className="field-input"
                value={editForm.image_url}
                onChange={(e) => setEditForm((f) => ({ ...f, image_url: e.target.value }))}
                placeholder="หรือวาง URL รูปภาพ..."
              />
            </div>
          )}

          {/* Label */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {(selectedBlock.type === 'add_friend' || selectedBlock.type === 'hero-with-dynamic-add-line') ? 'Button Label' : 'Caption (optional)'}
            </label>
            <input
              type="text"
              className="field-input"
              value={editForm.label}
              onChange={(e) => setEditForm((f) => ({ ...f, label: e.target.value }))}
              placeholder={(selectedBlock.type === 'add_friend' || selectedBlock.type === 'hero-with-dynamic-add-line') ? '@JAWANDACARGO' : 'ชื่อรูปภาพ'}
            />
          </div>

          {selectedBlock.type === 'hero-with-dynamic-add-line' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Button URL (optional)
                </label>
                <input
                  type="text"
                  className="field-input"
                  value={editForm.button_url}
                  onChange={(e) => setEditForm((f) => ({ ...f, button_url: e.target.value }))}
                  placeholder="https://lin.ee/..."
                />
                <p style={{ marginTop: 5, fontSize: 11, color: '#6b7280' }}>
                  เว้นว่างได้ ระบบจะใช้ลิงก์ Add LINE ค่าเริ่มต้น
                </p>
              </div>

              <div style={{ padding: '10px 10px 8px', background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Button Area
                </p>

                <label style={{ display: 'block', fontSize: 11, color: '#6b7280' }}>
                  Left: {Math.round(editForm.button_left_pct)}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={95}
                  step={1}
                  value={editForm.button_left_pct}
                  onChange={(e) => setEditForm((f) => ({ ...f, button_left_pct: Number(e.target.value) }))}
                  style={{ width: '100%' }}
                />

                <label style={{ display: 'block', fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                  Top: {Math.round(editForm.button_top_pct)}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={95}
                  step={1}
                  value={editForm.button_top_pct}
                  onChange={(e) => setEditForm((f) => ({ ...f, button_top_pct: Number(e.target.value) }))}
                  style={{ width: '100%' }}
                />

                <label style={{ display: 'block', fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                  Width: {Math.round(editForm.button_width_pct)}%
                </label>
                <input
                  type="range"
                  min={8}
                  max={95}
                  step={1}
                  value={editForm.button_width_pct}
                  onChange={(e) => setEditForm((f) => ({ ...f, button_width_pct: Number(e.target.value) }))}
                  style={{ width: '100%' }}
                />
              </div>
            </>
          )}

          {/* Active toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb' }}>
            <input
              type="checkbox"
              id="edit-is-active"
              checked={editForm.is_active}
              onChange={(e) => setEditForm((f) => ({ ...f, is_active: e.target.checked }))}
              style={{ width: 16, height: 16, cursor: 'pointer' }}
            />
            <label htmlFor="edit-is-active" style={{ fontSize: 13, color: '#374151', cursor: 'pointer', flex: 1 }}>
              <strong>{editForm.is_active ? '● Active' : '○ Inactive'}</strong>
              <br />
              <span style={{ fontSize: 11, color: '#9ca3af' }}>แสดงบนหน้า Landing Page</span>
            </label>
          </div>

          {/* Error */}
          {error && <p style={{ fontSize: 12, color: '#b91c1c', background: '#fef2f2', padding: '6px 10px', borderRadius: 6 }}>{error}</p>}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <button
              className="btn btn-primary"
              onClick={saveBlock}
              disabled={saving}
              style={{ flex: 1, height: 36, fontSize: 13 }}
            >
              {saving ? '...' : saveMsg || 'บันทึก'}
            </button>
            <button
              onClick={() => deleteBlock(selectedBlock.id)}
              style={{ height: 36, padding: '0 12px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
            >
              ลบ
            </button>
          </div>

          {/* Move up/down */}
          <div style={{ display: 'flex', gap: 6 }}>
            {(() => {
              const idx = blocks.findIndex((b) => b.id === selectedId);
              return (
                <>
                  <button
                    onClick={() => {
                      if (idx <= 0) return;
                      const arr = [...blocks];
                      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
                      reorderBlocks(arr);
                    }}
                    disabled={blocks.findIndex((b) => b.id === selectedId) <= 0}
                    style={{ flex: 1, height: 32, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#374151' }}
                  >
                    ▲ ขึ้น
                  </button>
                  <button
                    onClick={() => {
                      if (idx >= blocks.length - 1) return;
                      const arr = [...blocks];
                      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
                      reorderBlocks(arr);
                    }}
                    disabled={blocks.findIndex((b) => b.id === selectedId) >= blocks.length - 1}
                    style={{ flex: 1, height: 32, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#374151' }}
                  >
                    ▼ ลง
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 148px)', minHeight: 500 }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>Landing Page Builder</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>คลิก block เพื่อแก้ไข · ลากเพื่อเรียงลำดับ</p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="btn btn-soft"
          style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, height: 36 }}
        >
          <SvgExternalIcon size={13} color="currentColor" />
          <span>ดูหน้าจริง</span>
        </a>
      </div>

      {/* Three panels */}
      <div style={{ display: 'flex', gap: 12, flex: 1, overflow: 'hidden' }}>
        {LeftPanel}
        {CenterPreview}
        {RightPanel}
      </div>
    </div>
  );
}
