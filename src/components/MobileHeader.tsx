'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { GraduationCap, Sprout } from 'lucide-react';
import NotificationCenter from '@/components/NotificationCenter';
import DesignModeSwitcher from '@/components/DesignModeSwitcher';

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

  const badgeText = isMaarif ? 'MAARİF' : 'PRO';

  return (
    <header
      className="mobile-only"
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 45,
        backgroundColor: 'var(--surface-header, rgba(9, 13, 22, 0.94))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
        minHeight: 'calc(50px + env(safe-area-inset-top, 0px))',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
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
        {/* Brand Logo & Badge */}
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
                  : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: isMaarif
                  ? '0 0 10px rgba(16, 185, 129, 0.35)'
                  : '0 0 10px rgba(37, 99, 235, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              {isMaarif ? <Sprout size={16} strokeWidth={2.2} /> : <GraduationCap size={16} strokeWidth={2.2} />}
            </div>
            <span
              style={{
                color: '#f8fafc',
                fontSize: '15px',
                fontWeight: 800,
                letterSpacing: '-0.025em',
              }}
            >
              YKS<span style={{ color: isMaarif ? '#10b981' : '#38bdf8' }}>Yıldızı</span>
            </span>
          </Link>

          {/* Clean Pro / Maarif Badge */}
          <span
            style={{
              fontSize: '9.5px',
              fontWeight: 700,
              color: isMaarif ? '#34d399' : '#60a5fa',
              backgroundColor: isMaarif ? 'rgba(16, 185, 129, 0.12)' : 'rgba(37, 99, 235, 0.14)',
              border: `1px solid ${
                isMaarif ? 'rgba(16, 185, 129, 0.25)' : 'rgba(37, 99, 235, 0.28)'
              }`,
              padding: '1px 6px',
              borderRadius: '5px',
              letterSpacing: '0.04em',
              lineHeight: 1.3,
            }}
          >
            {badgeText}
          </span>
        </div>

        {/* Action icons: Tasarım Modu & Bildirim Çanı */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DesignModeSwitcher variant="compact" />
          <NotificationCenter align="right" />
        </div>
      </div>
    </header>
  );
}
