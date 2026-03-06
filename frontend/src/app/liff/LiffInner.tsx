'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

type Status = 'loading' | 'linking' | 'success' | 'error';

async function readJsonSafely(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export default function LiffInner() {
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('กำลังเชื่อมต่อ LINE...');
  const [showTestBtn, setShowTestBtn] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Prevent re-running if this session already linked successfully
    if (sessionStorage.getItem('liff-linked') === '1') {
      setStatus('success');
      setMessage('เชื่อมต่อสำเร็จ กรุณากดปุ่มด้านล่าง');
      setShowTestBtn(true);
      return;
    }

    async function run() {
      try {
        const cfgRes = await fetch('/api/config');
        const cfg = await readJsonSafely(cfgRes);
        if (!cfgRes.ok || !cfg?.liffId || !cfg?.lineOaId) {
          throw new Error(cfg?.error || `Config API failed (${cfgRes.status})`);
        }

        const liff = (await import('@line/liff')).default;
        await liff.init({ liffId: cfg.liffId, withLoginOnExternalBrowser: true });

        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href });
          return;
        }

        if (!mounted) return;
        setStatus('linking');
        setMessage('กำลังเชื่อมต่อบัญชี...');

        const params = new URLSearchParams(window.location.search);
        const tid = params.get('tid') || params.get('liff.state');

        const profile = await liff.getProfile();

        await fetch('/api/link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trackingId: tid,
            lineUid: profile.userId,
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl,
          }),
        });

        // Mark done so reloads don't re-link
        sessionStorage.setItem('liff-linked', '1');

        if (!mounted) return;
        setStatus('success');
        setMessage('เพิ่มเพื่อนเรียบร้อย กรุณากดเปิดแชท');
        setShowTestBtn(true);
      } catch (err) {
        console.error('[liff]', err);
        if (!mounted) return;
        setStatus('error');
        setMessage('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, []);

  const icon = status === 'success' ? '✅' : status === 'error' ? '❌' : '⏳';

  function handleTestBtnClick() {
    const testUrl = 'https://lin.ee/8NQIBi9';
    import('@line/liff')
      .then(({ default: liff }) => {
        if (liff.isInClient()) {
          liff.openWindow({ url: testUrl, external: false });
          setTimeout(() => {
            try {
              liff.closeWindow();
            } catch {
              // no-op
            }
          }, 300);
        } else {
          window.location.href = testUrl;
        }
      })
      .catch(() => {
        window.location.href = testUrl;
      });
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Image
          src="/logo.png"
          alt="Jawanda Cargo"
          width={84}
          height={84}
          style={{ borderRadius: 18, margin: '0 auto 14px', border: '1px solid #ffd8aa', background: '#fff' }}
        />
        <div style={styles.icon}>{icon}</div>
        <p style={styles.text}>{message}</p>
        {(status === 'loading' || status === 'linking') && <div style={styles.spinner} />}
        {showTestBtn && (
          <button type="button" className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleTestBtnClick}>
            เพิ่มเพื่อนเรียบร้อย กรุณากดเปิดแชท
          </button>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0b57b7 0%, #ff8a00 100%)',
    padding: '20px 14px',
    display: 'grid',
    placeItems: 'center',
  },
  card: {
    background: '#fff',
    borderRadius: '20px',
    padding: '32px 24px',
    width: '100%',
    maxWidth: '560px',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  icon: { fontSize: '46px', marginBottom: '14px' },
  text: { fontSize: '18px', color: '#2b3550', lineHeight: '1.6', fontWeight: 700 },
  spinner: {
    width: '36px',
    height: '36px',
    border: '4px solid #e0e0e0',
    borderTop: '4px solid #0b57b7',
    borderRadius: '50%',
    margin: '24px auto 0',
    animation: 'spin 0.8s linear infinite',
  },
};
