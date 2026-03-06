'use client';

import { useEffect, useState } from 'react';

interface AccountType {
  id: number;
  code: string;
  label: string;
  account_name: string | null;
  account_number: string | null;
  is_active: boolean;
  sort_order: number;
  updated_at: string;
}

export default function AccountTypesPage() {
  const [rows, setRows] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | 'new' | null>(null);
  const [newCode, setNewCode] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newSort, setNewSort] = useState('0');

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/account-types', { credentials: 'include' });
      const data = await res.json();
      setRows(data.accountTypes || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function patch(id: number, patchValue: Partial<AccountType>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patchValue } : r)));
  }

  async function save(row: AccountType) {
    setSavingId(row.id);
    try {
      const res = await fetch(`/api/account-types/${row.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          label: row.label,
          account_name: row.account_name || null,
          account_number: row.account_number || null,
          is_active: row.is_active,
          sort_order: row.sort_order,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Save failed');
        return;
      }
      patch(row.id, data.accountType);
    } finally {
      setSavingId(null);
    }
  }

  async function createRow() {
    if (!newCode.trim() || !newLabel.trim()) return;
    setSavingId('new');
    try {
      const res = await fetch('/api/account-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          code: newCode.trim().toUpperCase(),
          label: newLabel.trim(),
          account_name: newAccountName.trim() || null,
          account_number: newAccountNumber.trim() || null,
          sort_order: Number(newSort) || 0,
          is_active: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Create failed');
        return;
      }
      setRows((prev) => [...prev, data.accountType]);
      setNewCode('');
      setNewLabel('');
      setNewAccountName('');
      setNewAccountNumber('');
      setNewSort('0');
    } finally {
      setSavingId(null);
    }
  }

  async function removeRow(id: number) {
    if (!confirm('Delete this account type?')) return;
    const res = await fetch(`/api/account-types/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <section>
      <h1 className="page-title">Account Type Config</h1>
      <p className="page-subtitle">ตั้งค่า Account Type แล้วเลือกใช้งานผ่าน dropdown ในหน้า Send Message</p>

      <div className="table-shell" style={{ padding: 14, marginBottom: 12 }}>
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '140px 1fr 1fr 1fr 120px 120px' }}>
          <input className="input" placeholder="CODE" value={newCode} onChange={(e) => setNewCode(e.target.value)} />
          <input className="input" placeholder="Label" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
          <input className="input" placeholder="Account Name (optional)" value={newAccountName} onChange={(e) => setNewAccountName(e.target.value)} />
          <input className="input" placeholder="Account Number (optional)" value={newAccountNumber} onChange={(e) => setNewAccountNumber(e.target.value)} />
          <input className="input" type="number" placeholder="Sort" value={newSort} onChange={(e) => setNewSort(e.target.value)} />
          <button type="button" className="btn btn-primary" onClick={createRow} disabled={savingId === 'new'}>
            {savingId === 'new' ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="page-subtitle">Loading...</p>
      ) : (
        <div className="table-shell table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Label</th>
                <th>Account Name</th>
                <th>Account Number</th>
                <th>Sort</th>
                <th>Active</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><code>{r.code}</code></td>
                  <td>
                    <input className="input" style={{ width: '100%' }} value={r.label} onChange={(e) => patch(r.id, { label: e.target.value })} />
                  </td>
                  <td>
                    <input className="input" style={{ width: '100%' }} value={r.account_name || ''} onChange={(e) => patch(r.id, { account_name: e.target.value })} />
                  </td>
                  <td>
                    <input className="input" style={{ width: '100%' }} value={r.account_number || ''} onChange={(e) => patch(r.id, { account_number: e.target.value })} />
                  </td>
                  <td>
                    <input className="input" style={{ width: 90 }} type="number" value={r.sort_order} onChange={(e) => patch(r.id, { sort_order: Number(e.target.value) || 0 })} />
                  </td>
                  <td>
                    <input type="checkbox" checked={r.is_active} onChange={(e) => patch(r.id, { is_active: e.target.checked })} />
                  </td>
                  <td>{new Date(r.updated_at).toLocaleString('th-TH')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button type="button" className="btn btn-primary" style={{ height: 30, padding: '0 10px' }} disabled={savingId === r.id} onClick={() => save(r)}>
                        {savingId === r.id ? '...' : 'Save'}
                      </button>
                      <button type="button" className="btn btn-soft" style={{ height: 30, padding: '0 10px' }} onClick={() => removeRow(r.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: '#8a94a4' }}>No data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
