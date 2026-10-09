"use client";

import React, { useState, useCallback, Suspense, useRef, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Settings, User, Sparkles, ChevronRight } from 'lucide-react';
import NotificationCenter from '@/components/NotificationCenter';

// ─── Nav Data ────────────────────────────────────────────────────────
const STUDENT_NAV_GROUPS: {
  label: string;
  color: string;
  items: { emoji: string; label: string; href: string }[];
}[] = [
  {
    label: 'Ana Menü',
    color: '#8b5cf6', // purple
    items: [
      { emoji: '🏠', label: 'Ana Sayfa', href: '/dashboard?tab=home' },
      { emoji: '🎯', label: 'Hedeflerim', href: '/dashboard?tab=hedef' },
      { emoji: '📊', label: 'Analizim', href: '/dashboard?tab=analysis' },
    ],
  },
  {
    label: 'Çalışma & Dersler',
    color: '#3b82f6', // cobalt blue
    items: [
      { emoji: '📈', label: 'Denemeler', href: '/denemeler' },
      { emoji: '📚', label: 'Konular', href: '/dashboard?tab=topics' },
      { emoji: '📝', label: 'Testlerim', href: '/dashboard?tab=tests' },
      { emoji: '❌', label: 'Yanlışlarım', href: '/dashboard?tab=mistakes' },
      { emoji: '🎴', label: 'Hafıza Kartları', href: '/dashboard?tab=cards' },
      { emoji: '🍅', label: 'Odaklanma', href: '/dashboard?tab=focus' },
      { emoji: '📅', label: 'Haftalık Program', href: '/dashboard?tab=schedule' },
      { emoji: '🔬', label: 'Simülasyonlar', href: '/simulasyonlar' },
    ],
  },
  {
    label: 'Akıllı Araçlar',
    color: '#10b981', // emerald
    items: [
      { emoji: '🤖', label: 'Astra AI Rehber', href: '/dashboard?tab=astratutor' },
      { emoji: '🎓', label: 'Tercih Robotu', href: '/dashboard?tab=tercih-robotu' },
      { emoji: '🧮', label: 'Puan Hesaplama', href: '/puan-hesaplama' },
      { emoji: '📋', label: 'Ödevlerim', href: '/odevlerim' },
    ],
  },
  {
    label: 'Sosyal & Arena',
    color: '#f59e0b', // amber
    items: [
      { emoji: '⚔️', label: 'Bilgi Arenası', href: '/duello' },
      { emoji: '🛡️', label: 'Klanlar', href: '/klanlar' },
      { emoji: '💬', label: 'Topluluk Forumu', href: '/forum' },
      { emoji: '🎧', label: 'Çalışma Odaları', href: '/calisma-odalari' },
      { emoji: '🏫', label: 'Sınıfım', href: '/dashboard?tab=sinif' },
      { emoji: '🏆', label: 'Lig Sıralaması', href: '/ligler' },
      { emoji: '🛍️', label: 'Puan Mağazası', href: '/magaza' },
    ],
  },
];

// ─── Maarif Modeli Öğrenci Navigasyonu (9, 10, 11. Sınıf) ────────────────
const MAARIF_NAV_GROUPS: {
  label: string;
  color: string;
  items: { emoji: string; label: string; href: string }[];
}[] = [
  {
    label: 'Maarif Portalı',
    color: '#10b981', // emerald
    items: [
      { emoji: '🌱', label: 'Maarif Ana Sayfa', href: '/maarif' },
      { emoji: '📝', label: 'Yazılı Senaryoları', href: '/maarif?tab=senaryolar' },
      { emoji: '📚', label: 'Müfredat & Kazanımlar', href: '/maarif?tab=dersler' },
      { emoji: '🔬', label: 'Deney & Simülasyon', href: '/maarif?tab=deneyler' },
      { emoji: '🤖', label: 'Sokratik Mentor', href: '/maarif?tab=mentor' },
    ],
  },
  {
    label: 'Çalışma & Araçlar',
    color: '#3b82f6', // blue
    items: [
      { emoji: '📋', label: 'Ödevlerim', href: '/odevlerim' },
      { emoji: '🎧', label: 'Çalışma Odaları', href: '/calisma-odalari' },
      { emoji: '🔬', label: 'Tüm Simülasyonlar', href: '/simulasyonlar' },
    ],
  },
  {
    label: 'Topluluk & Motivasyon',
    color: '#f59e0b', // amber
    items: [
      { emoji: '⚔️', label: 'Bilgi Arenası', href: '/duello' },
      { emoji: '🛡️', label: 'Klanlar', href: '/klanlar' },
      { emoji: '💬', label: 'Topluluk Forumu', href: '/forum' },
      { emoji: '🏆', label: 'Ligler', href: '/ligler' },
      { emoji: '🛍️', label: 'Mağaza', href: '/magaza' },
    ],
  },
];

const TEACHER_NAV_ITEMS: { emoji: string; label: string; href: string }[] = [
  { emoji: '🏠', label: 'Genel Bakış', href: '/ogretmen/dashboard' },
  { emoji: '🏫', label: 'Sınıflarım', href: '/ogretmen/dashboard?tab=siniflar' },
  { emoji: '👥', label: 'Öğrenciler', href: '/ogretmen/dashboard?tab=ogrenciler' },
  { emoji: '📋', label: 'Ödev Yönetimi', href: '/ogretmen/dashboard?tab=odevler' },
  { emoji: '📊', label: 'Sınıf Analitiği', href: '/ogretmen/dashboard?tab=analiz' },
  { emoji: '📚', label: 'Ders Kaynakları', href: '/ogretmen/dashboard?tab=kaynaklar' },
  { emoji: '📢', label: 'Duyurular', href: '/ogretmen/dashboard?tab=duyurular' },
];

// ─── NavItem ─────────────────────────────────────────────────────────
function NavItem({
  emoji,
  label,
  href,
  active,
  accentColor,
  onClick,
}: {
  emoji: string;
  label: string;
  href: string;
  active: boolean;
  accentColor?: string;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const accent = accentColor || '#6366f1';

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
        padding: '7px 11px',
        borderRadius: '10px',
        textDecoration: 'none',
        fontSize: '13px',
        fontWeight: active ? 600 : 500,
        color: active ? '#ffffff' : hovered ? '#f1f5f9' : '#94a3b8',
        background: active
          ? `linear-gradient(90deg, ${accent}28 0%, ${accent}0e 100%)`
          : hovered
          ? 'rgba(255, 255, 255, 0.04)'
          : 'transparent',
        border: active
          ? `1px solid ${accent}45`
          : hovered
          ? '1px solid rgba(255, 255, 255, 0.05)'
          : '1px solid transparent',
        transition: 'all 0.16s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        boxShadow: active ? `0 2px 10px ${accent}20` : 'none',
      }}
    >
      <span
        style={{
          width: '26px',
          height: '26px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          backgroundColor: active
            ? `${accent}30`
            : hovered
            ? 'rgba(255, 255, 255, 0.05)'
            : 'rgba(255, 255, 255, 0.02)',
          fontSize: '15px',
          lineHeight: 1,
          transition: 'all 0.16s ease',
          boxShadow: active ? `0 0 8px ${accent}40` : 'none',
        }}
      >
        {emoji}
      </span>
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      {active && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: accent,
            flexShrink: 0,
            boxShadow: `0 0 8px ${accent}`,
          }}
        />
      )}
    </Link>
  );
}

// ─── NavGroup ─────────────────────────────────────────────────────────
function NavGroup({
  label,
  color,
  items,
  accentColor,
}: {
  label: string;
  color: string;
  items: any[];
  accentColor: string;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ marginBottom: '6px' }}>
      {/* Section pill header */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '5px 8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginBottom: open ? '3px' : '0',
          borderRadius: '6px',
          transition: 'background 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
      >
        {/* Colored indicator dot */}
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: color,
            flexShrink: 0,
            boxShadow: `0 0 6px ${color}80`,
          }}
        />
        <span
          style={{
            fontSize: '10.5px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#64748b',
            flex: 1,
            textAlign: 'left',
          }}
        >
          {label}
        </span>
        {/* Arrow indicator */}
        <span
          style={{
            color: '#475569',
            fontSize: '10px',
            transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 0.2s ease',
            lineHeight: 1,
          }}
        >
          ▾
        </span>
      </button>

      {/* Items */}
      {open && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          {items.map((item: any) => (
            <NavItem
              key={item.href}
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

// ─── SidebarNav (needs useSearchParams → wrapped in Suspense) ─
function SidebarNav({ user }: { user: any }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams?.get('tab');

  const isActive = useCallback(
    (href: string) => {
      // Check for Student Home
      const isStudentHome = href === '/dashboard' || href === '/dashboard?tab=home';
      if (isStudentHome) {
        return pathname === '/dashboard' && (!tab || tab === 'home');
      }

      // Check for Teacher Home
      const isTeacherHome = href === '/ogretmen/dashboard' || href === '/ogretmen/dashboard?tab=genel';
      if (isTeacherHome) {
        return pathname === '/ogretmen/dashboard' && (!tab || tab === 'genel');
      }

      if (tab && href.includes(`?tab=${tab}`)) return true;
      if (href === pathname && !href.includes('?')) return true;
      return false;
    },
    [pathname, tab]
  );

  if (user?.role === 'ogretmen') {
    return (
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {TEACHER_NAV_ITEMS.map((item) => {
          const tabKey = item.href.includes('?tab=')
            ? item.href.split('?tab=')[1]
            : item.href === '/ogretmen/dashboard'
            ? 'genel'
            : null;
          return (
            <NavItem
              key={item.href}
              {...item}
              active={isActive(item.href)}
              accentColor="#10b981"
              onClick={
                tabKey
                  ? () => {
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('yks:navigate-teacher-tab', { detail: tabKey }));
                      }
                    }
                  : undefined
              }
            />
          );
        })}
      </nav>
    );
  }

  const isMaarif =
    user?.curriculum_mode === 'maarif_v1' ||
    ['9', '10', '11'].includes(user?.sinif || '');

  const activeNavGroups = isMaarif ? MAARIF_NAV_GROUPS : STUDENT_NAV_GROUPS;

  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {activeNavGroups.map((group) => (
        <NavGroup
          key={group.label}
          label={group.label}
          color={group.color}
          accentColor={group.color}
          items={group.items.map((i) => {
            const tabKey = i.href.includes('?tab=') ? i.href.split('?tab=')[1] : null;
            return {
              ...i,
              active: isActive(i.href),
              onClick: tabKey
                ? () => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('yks:navigate-tab', { detail: tabKey }));
                    }
                  }
                : undefined,
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
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    padding: '8px 10px',
    borderRadius: '8px',
    fontSize: '12.5px',
    fontWeight: 500,
    color: hovered && danger ? '#fca5a5' : hovered ? '#f1f5f9' : '#94a3b8',
    background: hovered && danger ? 'rgba(239,68,68,0.1)' : hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
    transition: 'all 0.16s ease',
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

  const isMaarif =
    user?.curriculum_mode === 'maarif_v1' ||
    ['9', '10', '11'].includes(user?.sinif || '');

  const initials = user?.username?.charAt(0)?.toUpperCase() || 'Ö';
  const roleLabel =
    user?.role === 'ogretmen'
      ? 'Eğitmen Paneli'
      : isMaarif
      ? `${user?.sinif || 9}. Sınıf Maarif`
      : user?.sinif === 'Mezun'
      ? 'Mezun (YKS Hazırlık)'
      : `${user?.sinif || 12}. Sınıf YKS`;

  const profileHref =
    user?.role === 'ogretmen'
      ? '/ogretmen/dashboard?tab=profil'
      : isMaarif
      ? '/maarif'
      : '/dashboard?tab=profile';

  const avatarGradient =
    user?.role === 'ogretmen'
      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
      : isMaarif
      ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
      : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';

  const avatarGlow =
    user?.role === 'ogretmen' || isMaarif
      ? 'rgba(16, 185, 129, 0.3)'
      : 'rgba(99, 102, 241, 0.3)';

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
        width: '228px',
        height: '100vh',
        backgroundColor: '#080c14',
        borderRight: '1px solid rgba(255, 255, 255, 0.07)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
        fontFamily: 'var(--font-sans)',
        overflow: 'hidden',
      }}
    >
      {/* ── Brand & Notification Center ── */}
      <div
        style={{
          padding: '16px 14px 12px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <Link
          href={user?.role === 'ogretmen' ? '/ogretmen/dashboard' : isMaarif ? '/maarif' : '/dashboard?tab=home'}
          onClick={() => {
            if (typeof window !== 'undefined') {
              if (user?.role === 'ogretmen') {
                window.dispatchEvent(new CustomEvent('yks:navigate-teacher-tab', { detail: 'genel' }));
              } else if (!isMaarif) {
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
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '9px',
              flexShrink: 0,
              background: isMaarif
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '15px',
              boxShadow: `0 0 14px ${avatarGlow}`,
            }}
          >
            {isMaarif ? '🌱' : '✨'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                color: '#f8fafc',
                fontSize: '15px',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                lineHeight: 1.15,
                whiteSpace: 'nowrap',
              }}
            >
              YKS<span style={{ color: isMaarif ? '#10b981' : '#818cf8' }}>Yıldızı</span>
            </span>
            <span
              style={{
                fontSize: '9.5px',
                fontWeight: 700,
                color: isMaarif ? '#34d399' : '#94a3b8',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {isMaarif ? 'Maarif Portalı' : 'Hazırlık Portalı'}
            </span>
          </div>
        </Link>
        <NotificationCenter align="left" />
      </div>

      {/* ── User Card ── */}
      <div style={{ padding: '0 10px 10px', flexShrink: 0 }}>
        <div
          style={{
            padding: '9px 10px',
            borderRadius: '11px',
            background: 'rgba(255, 255, 255, 0.025)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              flexShrink: 0,
              background: avatarGradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '13px',
              boxShadow: `0 0 10px ${avatarGlow}`,
            }}
          >
            {initials}
          </div>
          <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
            <div
              style={{
                color: '#f8fafc',
                fontSize: '12.5px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.username?.toUpperCase() || 'ÖĞRENCİ'}
            </div>
            <div
              style={{
                color: '#64748b',
                fontSize: '11px',
                marginTop: '1px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {roleLabel}
            </div>
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div
        style={{
          height: '1px',
          background: 'rgba(255, 255, 255, 0.05)',
          margin: '0 10px 6px',
          flexShrink: 0,
        }}
      />

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
        <Suspense
          fallback={
            <div style={{ padding: '12px', color: '#475569', fontSize: '12px' }}>
              Menü yükleniyor…
            </div>
          }
        >
          <SidebarNav user={user} />
        </Suspense>
      </div>

      {/* ── Divider ── */}
      <div
        style={{
          height: '1px',
          background: 'rgba(255, 255, 255, 0.05)',
          margin: '0 10px 4px',
          flexShrink: 0,
        }}
      />

      {/* ── Footer ── */}
      <div style={{ padding: '4px 8px 12px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <FooterLink emoji="👤" label="Profilim" href={profileHref} />
        <FooterLink emoji="⚙️" label="Ayarlar" href="/ayarlar" />
        <FooterLink emoji="🚪" label="Çıkış Yap" onClick={logout} danger />
      </div>
    </aside>
  );
}
