"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RehberlikPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard?tab=astratutor&mode=rehberlik');
  }, [router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#94a3b8' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>🧠</div>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#f1f5f9', margin: '0 0 8px' }}>Astra AI & Rehberlik</h2>
        <p style={{ margin: 0, fontSize: '14px' }}>Yapay Zeka Rehberlik Moduna aktarılıyorsunuz...</p>
      </div>
    </div>
  );
}
