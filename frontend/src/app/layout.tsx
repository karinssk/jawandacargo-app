import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-main',
});

const SHARE_TITLE = 'JAWANDA CARGO';
const SHARE_DESCRIPTION = 'add line official account | JAWANDA CARGO บริการนำเข้าสินค้าจากจีนถูกต้องตามกฏหมาย100%';

export const metadata: Metadata = {
  title: SHARE_TITLE,
  description: SHARE_DESCRIPTION,
  applicationName: SHARE_TITLE,
  openGraph: {
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    siteName: SHARE_TITLE,
    locale: 'th_TH',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={manrope.variable}>{children}</body>
    </html>
  );
}
