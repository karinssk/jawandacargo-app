'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV_SECTIONS = [
  {
    title: 'Workspace',
    items: [
      { href: '/admin', label: 'Dashboard', icon: '◫' },
      { href: '/admin/customers', label: 'Customers', icon: '◎' },
      { href: '/admin/orders', label: 'Orders', icon: '▦' },
      { href: '/admin/landing', label: 'Landing Page', icon: '▣' },
      { href: '/admin/site',    label: 'Site Settings',  icon: '⚙' },
    ],
  },
  {
    title: 'Messaging',
    items: [
      { href: '/admin/messages/send', label: 'Send Message', icon: '✉' },
      { href: '/admin/messages/history', label: 'Message Logs', icon: '◷' },
      { href: '/admin/messages/templates', label: 'Template Config', icon: '⚙' },
      { href: '/admin/messages/account-types', label: 'Account Types', icon: '▤' },
    ],
  },
  {
    title: 'Developer',
    items: [
      { href: '/admin/dev', label: 'Dev Tools', icon: '⚠' },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/login');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <Image src="/logo.png" alt="Jawanda Cargo" width={44} height={44} className="brand-logo" />
          <span className="brand-name">Jawanda Cargo</span>
        </div>

        {NAV_SECTIONS.map((section) => (
          <div className="nav-section" key={section.title}>
            <p className="nav-label">{section.title}</p>
            <nav className="nav-list">
              {section.items.map((item) => {
                const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href} className={`nav-item${active ? ' active' : ''}`}>
                    <span className="nav-icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="ghost-btn" type="button">Logout</button>
        </div>
      </aside>

      <div className="main-wrap">
        <header className="topbar">
          <h2 className="topbar-title">Dashboard</h2>
          <div className="searchbox">
            <span>Search</span>
            <kbd>K</kbd>
          </div>
          <div className="topbar-actions">
            <button type="button" className="top-icon-btn">◷</button>
            <button type="button" className="top-icon-btn">◌</button>
          </div>
        </header>

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
