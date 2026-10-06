'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NotificationCenter from '@/components/NotificationCenter';

export default function MobileHeader() {
  const pathname = usePathname();

  // Widget, login, register sayfalarında mobile header render edilmez
  if (pathname === '/' || pathname === '/login' || pathname === '/register' || pathname?.startsWith('/widget')) {
    return null;
  }

  return (
    <header
      className="mobile-only"
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 45,
        backgroundColor: 'rgba(11, 15, 25, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
        minHeight: 'calc(52px + env(safe-area-inset-top, 0px))',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
      }}
    >
      <div
        style={{
          height: '52px',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo */}
        <Link
          href="/dashboard"
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
              borderRadius: '7px',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              boxShadow: '0 0 10px rgba(139, 92, 246, 0.4)',
            }}
          >
            ✨
          </div>
          <span
            style={{
              color: '#f8fafc',
              fontSize: '15px',
              fontWeight: 800,
              letterSpacing: '-0.03em',
            }}
          >
            YKS<span style={{ color: '#8b5cf6' }}>Yıldızı</span>
          </span>
        </Link>

        {/* Action icons: Bildirim Çanı & Canlı Rozet */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <NotificationCenter align="right" />
        </div>
      </div>
    </header>
  );
}
