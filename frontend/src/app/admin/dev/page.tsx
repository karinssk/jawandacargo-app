'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';

interface Action {
  label: string;
  description: string;
  endpoint: string;
  danger?: boolean;
}

const ACTIONS: Action[] = [
  {
    label: 'ลบ Orders + Message Logs ทั้งหมด',
    description: 'ลบข้อมูล orders ทั้งหมดและ message logs ที่เกี่ยวข้อง (ไม่กระทบ customers)',
    endpoint: '/api/dev/orders',
    danger: true,
  },
  {
    label: 'ลบ Message Logs ทั้งหมด',
    description: 'ลบประวัติข้อความที่ส่งทั้งหมด แต่คงข้อมูล orders ไว้',
    endpoint: '/api/dev/messages',
    danger: true,
  },
];

export default function DevToolsPage() {
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null);

  async function handleAction(action: Action, idx: number) {
    const confirmed = await Swal.fire({
      title: 'ยืนยันการลบข้อมูล?',
      html: `<div style="text-align:left;font-size:14px;line-height:1.8"><b>${action.label}</b><br/><span style="color:#ef4444">${action.description}</span><br/><br/>⚠️ <b>ไม่สามารถกู้คืนได้</b></div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#8a94a4',
      confirmButtonText: 'ยืนยัน ลบเลย',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true,
      input: 'text',
      inputPlaceholder: 'พิมพ์ "DELETE" เพื่อยืนยัน',
      preConfirm: (val: string) => {
        if (val !== 'DELETE') {
          Swal.showValidationMessage('กรุณาพิมพ์ "DELETE" เพื่อยืนยัน');
          return false;
        }
        return true;
      },
    });
    if (!confirmed.isConfirmed) return;

    setLoadingIdx(idx);
    try {
      const res = await fetch(action.endpoint, { method: 'DELETE', credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: data.error || 'Failed' });
        return;
      }
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: data.message || 'Done', timer: 2500, showConfirmButton: false });
    } catch {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Connection error', timer: 2500, showConfirmButton: false });
    } finally {
      setLoadingIdx(null);
    }
  }

  return (
    <section>
      <h1 className="page-title">Dev Tools</h1>
      <p className="page-subtitle">เครื่องมือสำหรับนักพัฒนา — ใช้เฉพาะ development/testing เท่านั้น</p>

      <div style={{ display: 'inline-block', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 10, padding: '10px 16px', marginBottom: 20, fontSize: 13, color: '#856404' }}>
        ⚠️ หน้านี้มีฟังก์ชันที่ <b>ลบข้อมูลถาวร</b> — ใช้ใน production ด้วยความระมัดระวัง
      </div>

      <div style={{ display: 'grid', gap: 12, maxWidth: 560 }}>
        {ACTIONS.map((action, idx) => (
          <div
            key={idx}
            className="table-shell"
            style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{action.label}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{action.description}</div>
            </div>
            <button
              type="button"
              disabled={loadingIdx === idx}
              onClick={() => handleAction(action, idx)}
              style={{
                flexShrink: 0,
                background: action.danger ? '#ef4444' : '#0b57b7',
                color: '#fff',
                border: 0,
                borderRadius: 8,
                padding: '7px 16px',
                fontWeight: 700,
                fontSize: 13,
                cursor: loadingIdx === idx ? 'not-allowed' : 'pointer',
                opacity: loadingIdx === idx ? 0.6 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              {loadingIdx === idx ? 'กำลังลบ...' : 'ลบ'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
