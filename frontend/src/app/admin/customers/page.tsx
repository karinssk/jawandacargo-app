'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Customer {
  id: number;
  customer_code: string;
  display_name: string;
  picture_url: string;
  is_blocked: boolean;
  created_at: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  linked_at: string;
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [date, setDate] = useState('');
  const [utmSource, setUtmSource] = useState('');
  const [loading, setLoading] = useState(false);

  function load(p = page) {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p) });
    if (date) params.set('date', date);
    if (utmSource) params.set('utm_source', utmSource);

    fetch(`/api/customers?${params}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        setCustomers(data.customers);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(1); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.ceil(total / 50);

  return (
    <section>
      <h1 className="page-title">ลูกค้า ({total.toLocaleString()})</h1>
      <p className="page-subtitle">ติดตามสถานะลูกค้าและแหล่งที่มาของแคมเปญ</p>

      <div className="filter-row">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input"
          placeholder="Date"
        />
        <input
          type="text"
          value={utmSource}
          onChange={(e) => setUtmSource(e.target.value)}
          className="input"
          placeholder="UTM Source"
        />
        <button onClick={() => { setPage(1); load(1); }} className="btn btn-primary" type="button">Search</button>
        <button
          onClick={() => { setDate(''); setUtmSource(''); setPage(1); load(1); }}
          className="btn btn-soft"
          type="button"
        >
          Reset
        </button>
      </div>

      {loading ? (
        <p className="page-subtitle">Loading...</p>
      ) : (
        <div className="table-shell table-wrap">
          <table className="table">
            <thead>
              <tr>
                {['Code', 'Name', 'UTM Source', 'UTM Campaign', 'Linked', 'Status', 'Created'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} onClick={() => router.push(`/admin/customers/${c.id}`)} style={{ cursor: 'pointer' }}>
                  <td>{c.customer_code}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {c.picture_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.picture_url} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />
                      )}
                      <span>{c.display_name || '-'}</span>
                    </div>
                  </td>
                  <td>{c.utm_source || '-'}</td>
                  <td>{c.utm_campaign || '-'}</td>
                  <td>{c.linked_at ? 'Yes' : 'No'}</td>
                  <td>
                    <span className={`badge ${c.is_blocked ? 'badge-danger' : 'badge-success'}`}>
                      {c.is_blocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td>{new Date(c.created_at).toLocaleDateString('th-TH')}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#8a94a4' }}>
                    No data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => { setPage(page - 1); load(page - 1); }}
            disabled={page <= 1}
            className="btn btn-soft"
            type="button"
          >
            Prev
          </button>
          <span className="page-subtitle" style={{ margin: 0 }}>Page {page} / {totalPages}</span>
          <button
            onClick={() => { setPage(page + 1); load(page + 1); }}
            disabled={page >= totalPages}
            className="btn btn-soft"
            type="button"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
