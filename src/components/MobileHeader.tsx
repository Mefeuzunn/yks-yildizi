'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import NotificationCenter from '@/components/NotificationCenter';

export default function MobileHeader() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Rozet modu: Varsayılan 'PRO'. 345 seçeneği de kod tabanında ve tercihlerde aktif olarak tutulur.
  const [badgeMode, setBadgeMode] = useState<'PRO' | '345' | 'PLUS'>('PRO');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('yks_brand_badge') as 'PRO' | '345' | 'PLUS';
      if (saved && ['PRO', '345', 'PLUS'].includes(saved)) {
        setBadgeMode(saved);
      }
    }
  }, []);

  // Rozete dokunulduğunda opsiyonel olarak PRO / 345 / PLUS arasında geçiş yapılabilir
  const toggleBadgeMode = () => {
    const nextMode = badgeMode === 'PRO' ? '345' : badgeMode === '345' ? 'PLUS' : 'PRO';
    setBadgeMode(nextMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('yks_brand_badge', nextMode);
      window.dispatchEvent(new CustomEvent('yks:badge-mode-change', { detail: nextMode }));
    }
  };

  // Login, register ve ana sayfada mobile header render edilmez
  if (pathname === '/' || pathname === '/login' || pathname === '/register') {
    return null;
  }

  const isMaarif =
    user?.curriculum_mode === 'maarif_v1' ||
    ['9', '10', '11'].includes(user?.sinif || '');

  const homeHref =
    user?.role === 'ogretmen'
      ? '/ogretmen/dashboard'
      : isMaarif
      ? '/maarif'
      : '/dashboard?tab=home';

  const badgeDisplay = isMaarif ? 'MAARİF' : badgeMode;

  return (
    <header
      className="mobile-only"
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 45,
        backgroundColor: 'rgba(8, 12, 20, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
        minHeight: 'calc(50px + env(safe-area-inset-top, 0px))',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div
        style={{
          height: '50px',
          padding: '0 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo & Edition */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link
            href={homeHref}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: isMaarif
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                boxShadow: isMaarif
                  ? '0 0 10px rgba(16, 185, 129, 0.35)'
                  : '0 0 10px rgba(99, 102, 241, 0.35)',
              }}
            >
              {isMaarif ? '🌱' : '✨'}
            </div>
            <span
              style={{
                color: '#f8fafc',
                fontSize: '15px',
                fontWeight: 800,
                letterSpacing: '-0.025em',
              }}
            >
              YKS<span style={{ color: isMaarif ? '#10b981' : '#818cf8' }}>Yıldızı</span>
            </span>
          </Link>

          {/* Rozet - Varsayılan PRO, tıklanarak 345 veya PLUS seçeneğine geçebilir */}
          <button
            type="button"
            onClick={toggleBadgeMode}
            title="Rozet Modu (Dokunarak Değiştir: PRO / 345 / PLUS)"
            style={{
              fontSize: '9.5px',
              fontWeight: 700,
              color: isMaarif ? '#34d399' : badgeMode === '345' ? '#f59e0b' : '#a5b4fc',
              backgroundColor: isMaarif
                ? 'rgba(16, 185, 129, 0.12)'
                : badgeMode === '345'
                ? 'rgba(245, 158, 11, 0.12)'
                : 'rgba(99, 102, 241, 0.12)',
              border: `1px solid ${
                isMaarif
                  ? 'rgba(16, 185, 129, 0.25)'
                  : badgeMode === '345'
                  ? 'rgba(245, 158, 11, 0.25)'
                  : 'rgba(99, 102, 241, 0.25)'
              }`,
              padding: '1px 6px',
              borderRadius: '5px',
              letterSpacing: '0.03em',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              lineHeight: 1.3,
            }}
          >
            {badgeDisplay}
          </button>
        </div>

        {/* Action icons: Bildirim Çanı */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <NotificationCenter align="right" />
        </div>
      </div>
    </header>
  );
}
