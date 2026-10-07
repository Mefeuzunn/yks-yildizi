'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import NotificationCenter from '@/components/NotificationCenter';

export default function MobileHeader() {
  const pathname = usePathname();
  const { user } = useAuth();

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
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
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
            <span
              style={{
                fontSize: '9.5px',
                fontWeight: 700,
                color: isMaarif ? '#34d399' : '#94a3b8',
                backgroundColor: isMaarif ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
                border: `1px solid ${isMaarif ? 'rgba(16, 185, 129, 0.25)' : 'rgba(99, 102, 241, 0.25)'}`,
                padding: '1px 5px',
                borderRadius: '4px',
                letterSpacing: '0.02em',
              }}
            >
              {isMaarif ? 'MAARİF' : '345'}
            </span>
          </div>
        </Link>

        {/* Action icons: Bildirim Çanı & Hızlı Kısayol */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <NotificationCenter align="right" />
        </div>
      </div>
    </header>
  );
}
