"use client";

import React, { useState, useCallback, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Settings, User, ChevronDown, ChevronUp } from 'lucide-react';

// ─── Navigation Groups ──────────────────────────────────────────────
const STUDENT_NAV_GROUPS = [
  {
    label: 'Ana',
    items: [
      { emoji: '🏠', label: 'Ana Sayfa', href: '/dashboard' },
      { emoji: '🎯', label: 'Hedeflerim', href: '/dashboard?tab=hedef' },
      { emoji: '📊', label: 'Analizim', href: '/dashboard?tab=analysis' },
    ],
  },
  {
    label: 'Çalışma',
    items: [
      { emoji: '📚', label: 'Konular', href: '/dashboard?tab=topics' },
      { emoji: '📝', label: 'Testlerim', href: '/dashboard?tab=tests' },
      { emoji: '❌', label: 'Yanlışlarım', href: '/dashboard?tab=mistakes' },
      { emoji: '🎴', label: 'Kartlar', href: '/dashboard?tab=cards' },
      { emoji: '🍅', label: 'Odak', href: '/dashboard?tab=focus' },
      { emoji: '📅', label: 'Program', href: '/dashboard?tab=schedule' },
      { emoji: '🔬', label: 'Simülasyonlar', href: '/simulasyonlar' },
    ],
  },
  {
    label: 'Araçlar',
    items: [
      { emoji: '🤖', label: 'AstraTutor AI', href: '/dashboard?tab=astratutor' },
      { emoji: '🎓', label: 'Tercih Robotu', href: '/dashboard?tab=tercih_robotu' },
      { emoji: '🧮', label: 'Puan Hesaplama', href: '/puan-hesaplama' },
      { emoji: '📋', label: 'Ödevlerim', href: '/odevlerim' },
    ],
  },
  {
    label: 'Sosyal',
    items: [
      { emoji: '🏫', label: 'Sınıfım', href: '/dashboard?tab=sinif' },
      { emoji: '💬', label: 'Sınıf Forumu', href: '/dashboard?tab=forum' },
      { emoji: '🏆', label: 'Ligler', href: '/ligler' },
      { emoji: '🛡️', label: 'Klanlar', href: '/klanlar' },
      { emoji: '🛍️', label: 'Mağaza', href: '/magaza' },
    ],
  },
];

const TEACHER_NAV_ITEMS = [
  { emoji: '🏠', label: 'Genel Bakış', href: '/ogretmen/dashboard' },
  { emoji: '🏫', label: 'Sınıflarım', href: '/ogretmen/dashboard?tab=siniflar' },
  { emoji: '👥', label: 'Öğrenciler', href: '/ogretmen/dashboard?tab=ogrenciler' },
  { emoji: '📋', label: 'Ödevler', href: '/ogretmen/dashboard?tab=odevler' },
  { emoji: '📊', label: 'Sınıf Analizi', href: '/ogretmen/dashboard?tab=analiz' },
  { emoji: '📚', label: 'Kaynaklar', href: '/ogretmen/dashboard?tab=kaynaklar' },
  { emoji: '📢', label: 'Duyurular', href: '/ogretmen/dashboard?tab=duyurular' },
];

// ─── NavItem ──────────────────────────────────────────────────────
function NavItem({ emoji, label, href, active }: { emoji: string; label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      prefetch={true}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 10px',
        borderRadius: '7px',
        textDecoration: 'none',
        fontSize: '13.5px',
        fontWeight: active ? 600 : 400,
        color: active ? '#ffffff' : '#94a3b8',
        backgroundColor: active ? 'rgba(139,92,246,0.15)' : 'transparent',
        borderLeft: active ? '2px solid #8b5cf6' : '2px solid transparent',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
          e.currentTarget.style.color = '#e2e8f0';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#94a3b8';
        }
      }}
    >
      <span style={{ fontSize: '16px', flexShrink: 0 }}>{emoji}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
    </Link>
  );
}

// ─── NavGroup (Collapsible) ────────────────────────────────────────
function NavGroup({ label, items, isActive }: { label: string; items: any[]; isActive: boolean }) {
  const [open, setOpen] = useState(true); // default open

  return (
    <div style={{ marginBottom: '4px' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 10px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#475569',
          fontSize: '10.5px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: open ? '2px' : '0',
        }}
      >
        {label}
        {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
      </button>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {items.map(item => (
            <NavItem key={item.href} {...item} active={isActive} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SidebarNav (uses useSearchParams → needs Suspense) ───────────
function SidebarNav({ user }: { user: any }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams?.get('tab');

  const isItemActive = useCallback((href: string) => {
    if ((href === '/dashboard' || href === '/ogretmen/dashboard') && !tab &&
        (pathname === '/dashboard' || pathname === '/ogretmen/dashboard')) return true;
    if (href.includes(`?tab=${tab}`) && tab) return true;
    if (href === pathname && !href.includes('?')) return true;
    return false;
  }, [pathname, tab]);

  if (user?.role === 'ogretmen') {
    return (
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {TEACHER_NAV_ITEMS.map(item => (
          <NavItem key={item.href} {...item} active={isItemActive(item.href)} />
        ))}
      </nav>
    );
  }

  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {STUDENT_NAV_GROUPS.map(group => {
        const groupHasActive = group.items.some(i => isItemActive(i.href));
        return (
          <NavGroup
            key={group.label}
            label={group.label}
            items={group.items.map(i => ({ ...i, active: isItemActive(i.href) }))}
            isActive={groupHasActive}
          />
        );
      })}
    </nav>
  );
}

// ─── Main Sidebar ──────────────────────────────────────────────────
export default function AppSidebar() {
  const { user, logout } = useAuth();

  const initials = user?.username?.charAt(0)?.toUpperCase() || 'U';
  const roleLabel = user?.role === 'ogretmen'
    ? 'Eğitmen'
    : user?.sinif === 'Mezun' ? 'Mezun' : `${user?.sinif || 12}. Sınıf Öğrenci`;

  const profileHref = user?.role === 'ogretmen'
    ? '/ogretmen/dashboard?tab=profile'
    : '/dashboard?tab=profile';

  return (
    <aside
      className="desktop-only"
      style={{
        width: '220px',
        height: '100vh',
        backgroundColor: '#0f1117',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 50,
        fontFamily: '"Inter", sans-serif',
        overflow: 'hidden', // ensures inner scroll works
      }}
    >
      {/* ── Brand ── */}
      <div style={{ padding: '18px 16px 12px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '15px', flexShrink: 0,
          }}>✨</div>
          <span style={{ color: '#fff', fontSize: '17px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            YKS<span style={{ color: '#8b5cf6' }}>Yıldızı</span>
          </span>
        </div>
      </div>

      {/* ── User Card ── */}
      <div style={{ padding: '0 12px 12px', flexShrink: 0 }}>
        <div style={{
          padding: '10px 12px',
          borderRadius: '10px',
          backgroundColor: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
            background: user?.role === 'ogretmen'
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '14px',
          }}>
            {initials}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ color: '#f1f5f9', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.username?.toUpperCase() || 'Kullanıcı'}
            </div>
            <div style={{ color: '#64748b', fontSize: '11px', marginTop: '1px' }}>
              {roleLabel}
            </div>
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)', margin: '0 12px', flexShrink: 0 }} />

      {/* ── Scrollable Nav ── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '12px 10px',
          minHeight: 0,
        }}
        className="custom-scrollbar"
      >
        <Suspense fallback={<div style={{ color: '#475569', fontSize: 12, padding: 8 }}>Yükleniyor...</div>}>
          <SidebarNav user={user} />
        </Suspense>
      </div>

      {/* ── Divider ── */}
      <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)', margin: '0 12px', flexShrink: 0 }} />

      {/* ── Footer Actions ── */}
      <div style={{ padding: '10px 12px 16px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>

        {/* Profilim */}
        <Link
          href={profileHref}
          prefetch={true}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 10px', borderRadius: '8px',
            textDecoration: 'none', color: '#94a3b8',
            fontSize: '13px', fontWeight: 500,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.color = '#e2e8f0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          <User size={15} />
          Profilim
        </Link>

        {/* Ayarlar */}
        <Link
          href="/ayarlar"
          prefetch={true}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 10px', borderRadius: '8px',
            textDecoration: 'none', color: '#94a3b8',
            fontSize: '13px', fontWeight: 500,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.color = '#e2e8f0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          <Settings size={15} />
          Ayarlar
        </Link>

        {/* Çıkış Yap */}
        <button
          onClick={logout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 10px', borderRadius: '8px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#94a3b8', fontSize: '13px', fontWeight: 500,
            transition: 'all 0.15s ease', textAlign: 'left',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)';
            e.currentTarget.style.color = '#fca5a5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          <LogOut size={15} />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
