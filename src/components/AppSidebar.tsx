"use client";

import React, { useState, useCallback, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Settings, User } from 'lucide-react';

// ─── Nav Data ────────────────────────────────────────────────────────
const STUDENT_NAV_GROUPS = [
  {
    label: 'Ana',
    color: '#8b5cf6',  // purple
    items: [
      { emoji: '🏠', label: 'Ana Sayfa', href: '/dashboard' },
      { emoji: '🎯', label: 'Hedeflerim', href: '/dashboard?tab=hedef' },
      { emoji: '📊', label: 'Analizim',   href: '/dashboard?tab=analysis' },
    ],
  },
  {
    label: 'Çalışma',
    color: '#3b82f6',  // blue
    items: [
      { emoji: '📚', label: 'Konular',      href: '/dashboard?tab=topics' },
      { emoji: '📝', label: 'Testlerim',    href: '/dashboard?tab=tests' },
      { emoji: '❌', label: 'Yanlışlarım', href: '/dashboard?tab=mistakes' },
      { emoji: '🎴', label: 'Kartlar',      href: '/dashboard?tab=cards' },
      { emoji: '🍅', label: 'Odak',         href: '/dashboard?tab=focus' },
      { emoji: '📅', label: 'Program',      href: '/dashboard?tab=schedule' },
      { emoji: '🔬', label: 'Simülasyonlar',href: '/simulasyonlar' },
    ],
  },
  {
    label: 'Araçlar',
    color: '#10b981',  // emerald
    items: [
      { emoji: '🤖', label: 'AstraTutor AI',   href: '/dashboard?tab=astratutor' },
      { emoji: '🎓', label: 'Tercih Robotu',   href: '/dashboard?tab=tercih_robotu' },
      { emoji: '🧮', label: 'Puan Hesaplama',  href: '/puan-hesaplama' },
      { emoji: '📋', label: 'Ödevlerim',       href: '/odevlerim' },
    ],
  },
  {
    label: 'Sosyal',
    color: '#f59e0b',  // amber
    items: [
      { emoji: '🏫', label: 'Sınıfım',      href: '/dashboard?tab=sinif' },
      { emoji: '💬', label: 'Sınıf Forumu', href: '/dashboard?tab=forum' },
      { emoji: '🏆', label: 'Ligler',        href: '/ligler' },
      { emoji: '🛡️', label: 'Klanlar',      href: '/klanlar' },
      { emoji: '🛍️', label: 'Mağaza',       href: '/magaza' },
    ],
  },
];

const TEACHER_NAV_ITEMS = [
  { emoji: '🏠', label: 'Genel Bakış',  href: '/ogretmen/dashboard' },
  { emoji: '🏫', label: 'Sınıflarım',   href: '/ogretmen/dashboard?tab=siniflar' },
  { emoji: '👥', label: 'Öğrenciler',   href: '/ogretmen/dashboard?tab=ogrenciler' },
  { emoji: '📋', label: 'Ödevler',      href: '/ogretmen/dashboard?tab=odevler' },
  { emoji: '📊', label: 'Sınıf Analizi',href: '/ogretmen/dashboard?tab=analiz' },
  { emoji: '📚', label: 'Kaynaklar',    href: '/ogretmen/dashboard?tab=kaynaklar' },
  { emoji: '📢', label: 'Duyurular',    href: '/ogretmen/dashboard?tab=duyurular' },
];

// ─── NavItem ─────────────────────────────────────────────────────────
function NavItem({
  emoji, label, href, active, accentColor,
}: {
  emoji: string; label: string; href: string; active: boolean; accentColor?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const accent = accentColor || '#8b5cf6';

  return (
    <Link
      href={href}
      prefetch={true}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '7px 10px 7px 12px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontSize: '13px',
        fontWeight: active ? 600 : 400,
        color: active ? '#fff' : hovered ? '#e2e8f0' : '#94a3b8',
        background: active
          ? `linear-gradient(90deg, ${accent}22, ${accent}10)`
          : hovered
          ? 'rgba(255,255,255,0.04)'
          : 'transparent',
        borderLeft: active
          ? `2px solid ${accent}`
          : '2px solid transparent',
        transition: 'all 0.15s ease',
        position: 'relative',
      }}
    >
      <span style={{ fontSize: '15px', lineHeight: 1, flexShrink: 0 }}>{emoji}</span>
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      {active && (
        <span style={{
          width: 5, height: 5, borderRadius: '50%',
          backgroundColor: accent,
          flexShrink: 0,
          boxShadow: `0 0 6px ${accent}`,
        }} />
      )}
    </Link>
  );
}

// ─── NavGroup ─────────────────────────────────────────────────────────
function NavGroup({
  label, color, items, accentColor,
}: {
  label: string; color: string; items: any[]; accentColor: string;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ marginBottom: '2px' }}>
      {/* Section pill header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          padding: '5px 10px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginBottom: open ? '3px' : '0',
          borderRadius: '6px',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
      >
        {/* Colored indicator dot */}
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          backgroundColor: color,
          flexShrink: 0,
          boxShadow: `0 0 6px ${color}80`,
        }} />
        <span style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#475569',
          flex: 1,
          textAlign: 'left',
        }}>
          {label}
        </span>
        {/* Arrow indicator */}
        <span style={{
          color: '#334155',
          fontSize: '10px',
          transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
          transition: 'transform 0.2s ease',
          lineHeight: 1,
        }}>
          ▾
        </span>
      </button>

      {/* Items */}
      {open && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1px',
          paddingLeft: '4px',
        }}>
          {items.map((item: any) => (
            <NavItem
              key={item.href}
              emoji={item.emoji}
              label={item.label}
              href={item.href}
              active={item.active}
              accentColor={accentColor}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SidebarNav (needs useSearchParams → must be wrapped in Suspense) ─
function SidebarNav({ user }: { user: any }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams?.get('tab');

  const isActive = useCallback((href: string) => {
    if (
      (href === '/dashboard' || href === '/ogretmen/dashboard') &&
      !tab &&
      (pathname === '/dashboard' || pathname === '/ogretmen/dashboard')
    ) return true;
    if (href.includes(`?tab=${tab}`) && tab) return true;
    if (href === pathname && !href.includes('?')) return true;
    return false;
  }, [pathname, tab]);

  if (user?.role === 'ogretmen') {
    return (
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {TEACHER_NAV_ITEMS.map(item => (
          <NavItem
            key={item.href}
            {...item}
            active={isActive(item.href)}
            accentColor="#10b981"
          />
        ))}
      </nav>
    );
  }

  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {STUDENT_NAV_GROUPS.map(group => (
        <NavGroup
          key={group.label}
          label={group.label}
          color={group.color}
          accentColor={group.color}
          items={group.items.map(i => ({ ...i, active: isActive(i.href) }))}
        />
      ))}
    </nav>
  );
}

// ─── Footer Action Item ────────────────────────────────────────────────
function FooterLink({ icon, label, href, onClick, danger }: any) {
  const [hovered, setHovered] = useState(false);
  const content = (
    <>
      <span style={{ opacity: 0.7, flexShrink: 0 }}>{icon}</span>
      <span>{label}</span>
    </>
  );

  const baseStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '9px',
    padding: '8px 10px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 500,
    color: hovered && danger ? '#fca5a5' : hovered ? '#e2e8f0' : '#64748b',
    background: hovered && danger ? 'rgba(239,68,68,0.08)' : hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
    transition: 'all 0.15s ease',
    textDecoration: 'none',
    cursor: 'pointer',
    border: 'none',
    width: '100%',
    textAlign: 'left' as const,
  };

  if (onClick) {
    return (
      <button
        onClick={onClick}
        style={baseStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={href}
      prefetch={true}
      style={baseStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {content}
    </Link>
  );
}

// ─── AppSidebar ────────────────────────────────────────────────────────
export default function AppSidebar() {
  const { user, logout } = useAuth();

  const initials = user?.username?.charAt(0)?.toUpperCase() || 'U';
  const roleLabel = user?.role === 'ogretmen'
    ? 'Eğitmen'
    : user?.sinif === 'Mezun'
    ? 'Mezun'
    : `${user?.sinif || 12}. Sınıf Öğrenci`;

  const profileHref = user?.role === 'ogretmen'
    ? '/ogretmen/dashboard?tab=profile'
    : '/dashboard?tab=profile';

  const avatarColor = user?.role === 'ogretmen'
    ? 'linear-gradient(135deg,#10b981,#059669)'
    : 'linear-gradient(135deg,#8b5cf6,#6366f1)';

  return (
    <aside
      className="desktop-only"
      style={{
        width: '220px',
        height: '100vh',
        background: 'linear-gradient(180deg, #0c0e16 0%, #0f1117 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0,
        zIndex: 50,
        fontFamily: '"Inter", -apple-system, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* ── Brand ── */}
      <div style={{
        padding: '20px 16px 14px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
          background: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px',
          boxShadow: '0 0 12px rgba(139,92,246,0.4)',
        }}>✨</div>
        <span style={{ color: '#f8fafc', fontSize: '16px', fontWeight: 800, letterSpacing: '-0.03em' }}>
          YKS<span style={{ color: '#8b5cf6' }}>Yıldızı</span>
        </span>
      </div>

      {/* ── User Card ── */}
      <div style={{ padding: '0 10px 12px', flexShrink: 0 }}>
        <div style={{
          padding: '10px',
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
            background: avatarColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '13px',
            boxShadow: user?.role === 'ogretmen'
              ? '0 0 8px rgba(16,185,129,0.3)'
              : '0 0 8px rgba(139,92,246,0.3)',
          }}>
            {initials}
          </div>
          <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
            <div style={{
              color: '#f1f5f9', fontSize: '12.5px', fontWeight: 600,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {user?.username?.toUpperCase() || 'Kullanıcı'}
            </div>
            <div style={{ color: '#475569', fontSize: '11px', marginTop: '1px' }}>
              {roleLabel}
            </div>
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0 10px 6px', flexShrink: 0 }} />

      {/* ── Scrollable Nav ── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '6px 8px',
          minHeight: 0,
        }}
        className="custom-scrollbar"
      >
        <Suspense fallback={
          <div style={{ padding: '12px', color: '#334155', fontSize: '12px' }}>Yükleniyor…</div>
        }>
          <SidebarNav user={user} />
        </Suspense>
      </div>

      {/* ── Divider ── */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0 10px 4px', flexShrink: 0 }} />

      {/* ── Footer ── */}
      <div style={{ padding: '4px 8px 14px', flexShrink: 0 }}>
        <FooterLink
          icon={<User size={14} />}
          label="Profilim"
          href={profileHref}
        />
        <FooterLink
          icon={<Settings size={14} />}
          label="Ayarlar"
          href="/ayarlar"
        />
        <FooterLink
          icon={<LogOut size={14} />}
          label="Çıkış Yap"
          onClick={logout}
          danger
        />
      </div>
    </aside>
  );
}
