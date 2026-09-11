"use client";

import React, { useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';

const STUDENT_NAV_ITEMS = [
  { emoji: '🏠', label: 'Ana Sayfa', href: '/dashboard' },
  { emoji: '🎯', label: 'Hedeflerim', href: '/dashboard?tab=hedef' },
  { emoji: '🔬', label: 'Simülasyonlar', href: '/simulasyonlar' },
  { emoji: '❌', label: 'Yanlışlarım', href: '/dashboard?tab=mistakes' },
  { emoji: '📚', label: 'Konular', href: '/dashboard?tab=topics' },
  { emoji: '📝', label: 'Testlerim', href: '/dashboard?tab=tests' },
  { emoji: '📊', label: 'Analizim', href: '/dashboard?tab=analysis' },
  { emoji: '🏆', label: 'Ligler', href: '/ligler' },
  { emoji: '🛡️', label: 'Klanlar', href: '/klanlar' },
  { emoji: '🛍️', label: 'Mağaza', href: '/magaza' },
  { emoji: '🎴', label: 'Kartlar', href: '/dashboard?tab=cards' },
  { emoji: '🍅', label: 'Odak', href: '/dashboard?tab=focus' },
  { emoji: '📅', label: 'Program', href: '/dashboard?tab=schedule' },
  { emoji: '🏫', label: 'Sınıfım', href: '/dashboard?tab=sinif' },
  { emoji: '📋', label: 'Ödevlerim', href: '/odevlerim' },
  { emoji: '💬', label: 'Sınıf Forumu', href: '/dashboard?tab=forum' },
  { emoji: '👤', label: 'Profilim', href: '/dashboard?tab=profile' },
];

const TEACHER_NAV_ITEMS = [
  { emoji: '🏠', label: 'Genel Bakış', href: '/ogretmen/dashboard' },
  { emoji: '🏫', label: 'Sınıflarım', href: '/ogretmen/dashboard?tab=siniflar' },
  { emoji: '👥', label: 'Öğrenciler', href: '/ogretmen/dashboard?tab=ogrenciler' },
  { emoji: '📋', label: 'Ödevler', href: '/ogretmen/dashboard?tab=odevler' },
  { emoji: '📊', label: 'Sınıf Analizi', href: '/ogretmen/dashboard?tab=analiz' },
  { emoji: '📚', label: 'Kaynaklar', href: '/ogretmen/dashboard?tab=kaynaklar' },
  { emoji: '📢', label: 'Duyurular', href: '/ogretmen/dashboard?tab=duyurular' },
  { emoji: '👤', label: 'Profilim', href: '/ogretmen/dashboard?tab=profile' },
];

function NavItem({ emoji, label, href, active }: any) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 12px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: active ? 600 : 500,
        color: active ? '#ffffff' : (isHovered ? '#e2e8f0' : '#94a3b8'),
        backgroundColor: active
          ? 'rgba(255, 255, 255, 0.1)'
          : isHovered
          ? 'rgba(255, 255, 255, 0.05)'
          : 'transparent',
        boxShadow: active ? '0 0 0 1px rgba(168, 85, 247, 0.5)' : 'none',
        transition: 'all 0.2s ease',
      }}
    >
      <span style={{ fontSize: '18px' }}>{emoji}</span>
      <span>{label}</span>
    </Link>
  );
}

function SidebarNav({ user }: { user: any }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const navItems = user?.role === 'ogretmen' ? TEACHER_NAV_ITEMS : STUDENT_NAV_ITEMS;
  
  return (
    <nav
      style={{
        flex: 1,
        padding: '20px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        overflowY: 'auto',
      }}
      className="custom-scrollbar"
    >
      {navItems.map((item) => {
        const tab = searchParams?.get('tab');
        
        let isActive = false;
        if ((item.href === '/dashboard' || item.href === '/ogretmen/dashboard') && !tab && (pathname === '/dashboard' || pathname === '/ogretmen/dashboard')) {
          isActive = true;
        } else if (item.href.includes(`?tab=${tab}`) && tab) {
          isActive = true;
        } else if (item.href === pathname && !item.href.includes('?')) {
          isActive = true;
        }
        
        return (
          <NavItem
            key={item.href}
            emoji={item.emoji}
            label={item.label}
            href={item.href}
            active={isActive}
          />
        );
      })}
    </nav>
  );
}

export default function AppSidebar() {
  const { user, logout } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <aside
      className="desktop-only"
      style={{
        width: '240px',
        height: '100vh',
        backgroundColor: '#12141c',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 50,
        fontFamily: '"Inter", sans-serif',
      }}
    >
      {/* Brand */}
      <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(139, 92, 246, 0.2)'
        }}>
          <span style={{ fontSize: '18px' }}>✨</span>
        </div>
        <span style={{ color: '#fff', fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em' }}>
          YKS<span style={{ color: '#8b5cf6' }}>Yıldızı</span>
        </span>
      </div>

      {/* User Profile Snippet */}
      <div style={{ padding: '0 16px', marginBottom: '24px' }}>
        <div style={{
          padding: '12px',
          borderRadius: '12px',
          backgroundColor: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            backgroundColor: user?.role === 'ogretmen' ? '#10b981' : '#8b5cf6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '14px'
          }}>
            {getInitials(user?.username)}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.username?.toUpperCase() || 'Kullanıcı'}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '2px' }}>
              {user?.role === 'ogretmen' ? 'Eğitmen' : (user?.sinif === 'Mezun' ? 'Mezun' : `${user?.sinif || 12}. Sınıf ${user?.alan === 'Yok' ? '' : 'Öğrenci'}`)}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation - Wrapped in Suspense because of useSearchParams */}
      <Suspense fallback={<div style={{ flex: 1 }}></div>}>
        <SidebarNav user={user} />
      </Suspense>

      {/* Footer */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <button
          onClick={logout}
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.03)',
            border: 'none',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.05) inset',
            cursor: 'pointer',
            padding: '10px 12px',
            color: '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
            fontSize: '14px',
            fontWeight: 500,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            e.currentTarget.style.color = '#fca5a5';
            e.currentTarget.style.boxShadow = '0 0 0 1px rgba(239, 68, 68, 0.2) inset';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
            e.currentTarget.style.color = '#e2e8f0';
            e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.05) inset';
          }}
        >
          <LogOut size={16} />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
