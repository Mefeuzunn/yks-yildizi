"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function PomodoroRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Immediately forward to the unified, full-featured focus tab
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('yks:navigate-tab', { detail: 'focus' }));
    }
    router.replace('/dashboard?tab=focus');
  }, [router]);

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#c4b5fd',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <motion.div
        animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        style={{ fontSize: '48px', marginBottom: '16px' }}
      >
        🍅
      </motion.div>
      <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', margin: '0 0 8px 0' }}>
        Odaklanma Modu Açılıyor...
      </h2>
      <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, maxWidth: '320px' }}>
        Gelişmiş ders ve konu takipli odaklanma merkezine yönlendiriliyorsunuz.
      </p>
    </div>
  );
}
