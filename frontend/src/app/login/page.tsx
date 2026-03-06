'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        router.push('/admin');
      } else {
        setError('Invalid username or password');
      }
    } catch {
      setError('Connection failed, please try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-center">
      <div className="login-grid">
        <section className="hero-card">
          <Image src="/logo.png" alt="Jawanda Cargo" width={84} height={84} style={{ borderRadius: 16, marginBottom: 10 }} />
          <h1 className="panel-title">UTM Tracking</h1>
          <p className="panel-subtitle">Campaign source tracking, LINE linking, and admin messaging in one place.</p>
          <p style={{ marginTop: 14 }}>Sign in to review attribution, customer profiles, and order delivery status.</p>
        </section>

        <section className="panel-card">
          <h2 className="panel-title">Sign In</h2>
          <p className="panel-subtitle">Get started with your admin account</p>

          <form onSubmit={handleSubmit}>
            <label className="field-label">Username</label>
            <input className="input" style={{ width: '100%' }} type="text" value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" />

            <label className="field-label">Password</label>
            <input className="input" style={{ width: '100%' }} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />

            {error && <p className="field-error">{error}</p>}

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 18 }}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
            <p className="info-note">Session is secured with HTTP-only cookies.</p>
          </form>
        </section>
      </div>
    </div>
  );
}
