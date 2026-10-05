"use client";

import React, { useState, useCallback, Suspense, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Settings, User } from 'lucide-react';
import NotificationCenter from '@/components/NotificationCenter';

// ─── Nav Data ────────────────────────────────────────────────────────
const STUDENT_NAV_GROUPS: {
  label: string;
  color: string;
  items: { emoji: string; label: string; href: string }[];
}[] = [
  {
    label: 'Ana',
    color: '#8b5cf6',  // purple
    items: [
      { emoji: '🏠', label: 'Ana Sayfa', href: '/dashboard?tab=home' },
      { emoji: '🎯', label: 'Hedeflerim', href: '/dashboard?tab=hedef' },
      { emoji: '📊', label: 'Analizim', href: '/dashboard?tab=analysis' },
    ],
  },
  {
    label: 'Çalışma',
    color: '#3b82f6',  // blue
    items: [
      { emoji: '📈', label: 'Denemeler', href: '/denemeler' },
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
    color: '#10b981',  // emerald
    items: [
      { emoji: '🤖', label: 'Astra AI & Rehberlik', href: '/dashboard?tab=astratutor' },
      { emoji: '🎓', label: 'Tercih Robotu', href: '/dashboard?tab=tercih-robotu' },
      { emoji: '🧮', label: 'Puan Hesaplama', href: '/puan-hesaplama' },
      { emoji: '📋', label: 'Ödevlerim', href: '/odevlerim' },
    ],
  },
  {
    label: 'Sosyal',
    color: '#f59e0b',  // amber
    items: [
      { emoji: '⚔️', label: 'Bilgi Arenası', href: '/duello' },
      { emoji: '🎧', label: 'Çalışma Odaları', href: '/calisma-odalari' },
      { emoji: '🏫', label: 'Sınıfım', href: '/dashboard?tab=sinif' },
      { emoji: '🏆', label: 'Ligler', href: '/ligler' },
      { emoji: '🛍️', label: 'Mağaza', href: '/magaza' },
    ],
  },
];

const TEACHER_NAV_ITEMS: { emoji: string; label: string; href: string }[] = [
  { emoji: '🏠', label: 'Genel Bakış', href: '/ogretmen/dashboard' },
  { emoji: '🏫', label: 'Sınıflarım', href: '/ogretmen/dashboard?tab=siniflar' },
  { emoji: '👥', label: 'Öğrenciler', href: '/ogretmen/dashboard?tab=ogrenciler' },
  { emoji: '📋', label: 'Ödevler', href: '/ogretmen/dashboard?tab=odevler' },
  { emoji: '📊', label: 'Sınıf Analizi', href: '/ogretmen/dashboard?tab=analiz' },
  { emoji: '📚', label: 'Kaynaklar', href: '/ogretmen/dashboard?tab=kaynaklar' },
  { emoji: '📢', label: 'Duyurular', href: '/ogretmen/dashboard?tab=duyurular' },
];

// ─── NavItem ─────────────────────────────────────────────────────────
function NavItem({
  emoji, label, href, active, accentColor, onClick,
}: {
  emoji: string; label: string; href: string; active: boolean; accentColor?: string; onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const accent = accentColor || '#8b5cf6';

  return (
    <Link
      href={href}
      prefetch={true}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '6px 10px 6px 10px',
        borderRadius: '9px',
        textDecoration: 'none',
        fontSize: '13px',
        fontWeight: active ? 600 : 500,
        color: active ? '#fff' : hovered ? '#f1f5f9' : '#94a3b8',
        background: active
          ? `linear-gradient(90deg, ${accent}25, ${accent}08)`
          : hovered
          ? 'rgba(255,255,255,0.04)'
          : 'transparent',
        borderLeft: active
          ? `2.5px solid ${accent}`
          : '2.5px solid transparent',
        transition: 'all 0.15s ease',
        position: 'relative',
      }}
    >
      <span style={{ 
        width: '24px', 
        height: '24px', 
        borderRadius: '7px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        flexShrink: 0,
        backgroundColor: active ? `${accent}25` : hovered ? 'rgba(255,255,255,0.05)' : 'transparent',
        fontSize: '15px',
        lineHeight: 1,
        transition: 'all 0.15s ease',
        filter: active ? 'drop-shadow(0 0 6px rgba(255,255,255,0.25))' : 'none'
      }}>
        {emoji}
      </span>
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
              icon={item.icon}
              emoji={item.emoji}
              label={item.label}
              href={item.href}
              active={item.active}
              accentColor={accentColor}
              onClick={item.onClick}
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
    // Check for Student Home
    const isStudentHome = (href === '/dashboard' || href === '/dashboard?tab=home');
    if (isStudentHome) {
      return pathname === '/dashboard' && (!tab || tab === 'home');
    }

    // Check for Teacher Home
    const isTeacherHome = (href === '/ogretmen/dashboard' || href === '/ogretmen/dashboard?tab=genel');
    if (isTeacherHome) {
      return pathname === '/ogretmen/dashboard' && (!tab || tab === 'genel');
    }

    if (tab && href.includes(`?tab=${tab}`)) return true;
    if (href === pathname && !href.includes('?')) return true;
    return false;
  }, [pathname, tab]);

  if (user?.role === 'ogretmen') {
    return (
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {TEACHER_NAV_ITEMS.map(item => {
          const tabKey = item.href.includes('?tab=') ? item.href.split('?tab=')[1] : (item.href === '/ogretmen/dashboard' ? 'genel' : null);
          return (
            <NavItem
              key={item.href}
              {...item}
              active={isActive(item.href)}
              accentColor="#10b981"
              onClick={tabKey ? () => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('yks:navigate-teacher-tab', { detail: tabKey }));
                }
              } : undefined}
            />
          );
        })}
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
          items={group.items.map(i => {
            const tabKey = i.href.includes('?tab=') ? i.href.split('?tab=')[1] : null;
            return {
              ...i,
              active: isActive(i.href),
              onClick: tabKey ? () => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('yks:navigate-tab', { detail: tabKey }));
                }
              } : undefined,
            };
          })}
        />
      ))}
    </nav>
  );
}

// ─── Footer Action Item ────────────────────────────────────────────────
function FooterLink({ icon, emoji, label, href, onClick, danger }: any) {
  const [hovered, setHovered] = useState(false);
  const content = (
    <>
      <span style={{ fontSize: '15px', lineHeight: 1, flexShrink: 0 }}>{emoji || icon}</span>
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
  const navScrollRef = useRef<HTMLDivElement>(null);

  const initials = user?.username?.charAt(0)?.toUpperCase() || 'U';
  const roleLabel = user?.role === 'ogretmen'
    ? 'Eğitmen'
    : user?.sinif === 'Mezun'
    ? 'Mezun'
    : `${user?.sinif || 12}. Sınıf Öğrenci`;

  const profileHref = user?.role === 'ogretmen'
    ? '/ogretmen/dashboard?tab=profil'
    : '/dashboard?tab=profile';

  const avatarColor = user?.role === 'ogretmen'
    ? 'linear-gradient(135deg,#10b981,#059669)'
    : 'linear-gradient(135deg,#8b5cf6,#6366f1)';

  // Mouse wheel anywhere on aside will smoothly scroll the nav container
  const handleAsideWheel = (e: React.WheelEvent) => {
    if (navScrollRef.current) {
      navScrollRef.current.scrollTop += e.deltaY;
    }
  };

  return (
    <aside
      className="app-sidebar-aside desktop-flex"
      onWheel={handleAsideWheel}
      style={{
        width: '230px',
        height: '100vh',
        background: 'linear-gradient(180deg, #0c0e16 0%, #0f1117 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 50,
        fontFamily: '"Inter", -apple-system, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* ── Brand & Notification Center ── */}
      <div style={{
        padding: '16px 14px 12px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
      }}>
        <Link
          href={user?.role === 'ogretmen' ? '/ogretmen/dashboard' : '/dashboard?tab=home'}
          onClick={() => {
            if (typeof window !== 'undefined') {
              if (user?.role === 'ogretmen') {
                window.dispatchEvent(new CustomEvent('yks:navigate-teacher-tab', { detail: 'genel' }));
              } else {
                window.dispatchEvent(new CustomEvent('yks:navigate-tab', { detail: 'home' }));
              }
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            cursor: 'pointer',
            flex: 1,
            minWidth: 0,
          }}
        >
          <div style={{
            width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
            background: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px',
            boxShadow: '0 0 12px rgba(139,92,246,0.4)',
          }}>✨</div>
          <span style={{ color: '#f8fafc', fontSize: '15px', fontWeight: 800, letterSpacing: '-0.03em', whiteSpace: 'nowrap' }}>
            YKS<span style={{ color: '#8b5cf6' }}>Yıldızı</span>
          </span>
        </Link>
        <NotificationCenter align="left" />
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
        ref={navScrollRef}
        style={{
          flex: '1 1 0%',
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '6px 8px',
          minHeight: 0,
        }}
        className="sidebar-nav-scroll custom-scrollbar"
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
          emoji="👤"
          label="Profilim"
          href={profileHref}
        />
        <FooterLink
          emoji="⚙️"
          label="Ayarlar"
          href="/ayarlar"
        />
        <FooterLink
          emoji="🚪"
          label="Çıkış Yap"
          onClick={logout}
          danger
        />
      </div>
    </aside>
  );
}
