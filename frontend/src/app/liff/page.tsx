'use client';

import dynamic from 'next/dynamic';

const LiffInner = dynamic(() => import('./LiffInner'), { ssr: false });

export default function LiffPage() {
  return <LiffInner />;
}
