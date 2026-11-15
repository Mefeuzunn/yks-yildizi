"use client";

import React, { useState, useCallback, Suspense, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Home,
  Target,
  BarChart3,
  TrendingUp,
  BookOpen,
  FileText,
  XCircle,
  Layers,
  Timer,
  Calendar,
  Compass,
  BrainCircuit,
  GraduationCap,
  Calculator,
  ClipboardList,
  Swords,
  Shield,
  MessageSquare,
  Headphones,
  School,
  Trophy,
  ShoppingBag,
  Sprout,
  FileEdit,
  Atom,
  Sparkles,
  Users,
  Bell,
  LogOut,
  Settings,
  User,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';
import NotificationCenter from '@/components/NotificationCenter';
import DesignModeSwitcher from '@/components/DesignModeSwitcher';

// ─── Nav Data Interfaces ─────────────────────────────────────────────
interface NavItemDef {
  icon: LucideIcon;
  label: string;
  href: string;
}

interface NavGroupDef {
  label: string;
  color: string;
  items: NavItemDef[];
}

// ─── Student Nav Groups ──────────────────────────────────────────────
const STUDENT_NAV_GROUPS: NavGroupDef[] = [
  {
    label: 'Ana Menü',
    color: '#2563eb', // Oxford Academic Blue
    items: [
      { icon: Home, label: 'Ana Sayfa', href: '/dashboard?tab=home' },
      { icon: Target, label: 'Hedeflerim', href: '/dashboard?tab=hedef' },
      { icon: BarChart3, label: 'Analizim', href: '/dashboard?tab=analysis' },
    ],
  },
  {
    label: 'Çalışma & Dersler',
    color: '#0284c7', // Ocean Slate
    items: [
      { icon: TrendingUp, label: 'Denemeler', href: '/denemeler' },
      { icon: BookOpen, label: 'Konular', href: '/dashboard?tab=topics' },
      { icon: FileText, label: 'Testler & Soru Havuzu', href: '/testler' },
      { icon: XCircle, label: 'Yanlışlarım', href: '/dashboard?tab=mistakes' },
      { icon: Layers, label: 'Hafıza Kartları', href: '/dashboard?tab=cards' },
      { icon: Timer, label: 'Odaklanma', href: '/dashboard?tab=focus' },
      { icon: Calendar, label: 'Haftalık Program', href: '/dashboard?tab=schedule' },
      { icon: Compass, label: 'Simülasyonlar', href: '/simulasyonlar' },
    ],
  },
  {
    label: 'Akıllı Araçlar',
    color: '#10b981', // Maarif Emerald
    items: [
      { icon: BrainCircuit, label: 'Astra AI Rehber', href: '/dashboard?tab=astratutor' },
      { icon: GraduationCap, label: 'Tercih Robotu', href: '/dashboard?tab=tercih-robotu' },
      { icon: Calculator, label: 'Puan Hesaplama', href: '/puan-hesaplama' },
      { icon: ClipboardList, label: 'Ödevlerim', href: '/odevlerim' },
    ],
  },
  {
    label: 'Sosyal & Arena',
    color: '#f59e0b', // Amber
    items: [
      { icon: Swords, label: 'Bilgi Arenası', href: '/duello' },
      { icon: Shield, label: 'Klanlar', href: '/klanlar' },
      { icon: MessageSquare, label: 'Topluluk Forumu', href: '/forum' },
      { icon: Headphones, label: 'Çalışma Odaları', href: '/calisma-odalari' },
      { icon: School, label: 'Sınıfım', href: '/dashboard?tab=sinif' },
      { icon: Trophy, label: 'Lig Sıralaması', href: '/ligler' },
      { icon: ShoppingBag, label: 'Puan Mağazası', href: '/magaza' },
    ],
  },
];

// ─── Maarif Modeli Öğrenci Navigasyonu (9, 10, 11. Sınıf) ────────────────
const MAARIF_NAV_GROUPS: NavGroupDef[] = [
  {
    label: 'Maarif Portalı',
    color: '#10b981', // emerald
    items: [
      { icon: Sprout, label: 'Maarif Ana Sayfa', href: '/maarif' },
      { icon: FileEdit, label: 'Yazılı Senaryoları', href: '/maarif?tab=senaryolar' },
      { icon: BookOpen, label: 'Müfredat & Kazanımlar', href: '/maarif?tab=dersler' },
      { icon: Atom, label: 'Deney & Simülasyon', href: '/maarif?tab=deneyler' },
      { icon: Sparkles, label: 'Sokratik Mentor', href: '/maarif?tab=mentor' },
    ],
  },
  {
    label: 'Çalışma & Araçlar',
    color: '#0284c7', // sky
    items: [
      { icon: ClipboardList, label: 'Ödevlerim', href: '/odevlerim' },
      { icon: Headphones, label: 'Çalışma Odaları', href: '/calisma-odalari' },
      { icon: Compass, label: 'Tüm Simülasyonlar', href: '/simulasyonlar' },
    ],
  },
  {
    label: 'Topluluk & Motivasyon',
    color: '#f59e0b', // amber
    items: [
      { icon: Swords, label: 'Bilgi Arenası', href: '/duello' },
      { icon: Shield, label: 'Klanlar', href: '/klanlar' },
      { icon: MessageSquare, label: 'Topluluk Forumu', href: '/forum' },
      { icon: Trophy, label: 'Ligler', href: '/ligler' },
      { icon: ShoppingBag, label: 'Mağaza', href: '/magaza' },
    ],
  },
];

const TEACHER_NAV_ITEMS: NavItemDef[] = [
  { icon: Home, label: 'Genel Bakış', href: '/ogretmen/dashboard' },
  { icon: School, label: 'Sınıflarım', href: '/ogretmen/dashboard?tab=siniflar' },
  { icon: Users, label: 'Öğrenciler', href: '/ogretmen/dashboard?tab=ogrenciler' },
  { icon: ClipboardList, label: 'Ödev Yönetimi', href: '/ogretmen/dashboard?tab=odevler' },
  { icon: BarChart3, label: 'Sınıf Analitiği', href: '/ogretmen/dashboard?tab=analiz' },
  { icon: BookOpen, label: 'Ders Kaynakları', href: '/ogretmen/dashboard?tab=kaynaklar' },
  { icon: Bell, label: 'Duyurular', href: '/ogretmen/dashboard?tab=duyurular' },
];

// ─── NavItem ─────────────────────────────────────────────────────────
function NavItem({
  icon: Icon,
  label,
  href,
  active,
  accentColor,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  href: string;
  active: boolean;
  accentColor?: string;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const accent = accentColor || '#2563eb';

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
        gap: '9px',
        padding: '7px 10px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontSize: '13px',
        fontWeight: active ? 600 : 500,
        color: active ? '#ffffff' : hovered ? '#f1f5f9' : '#94a3b8',
        background: active
          ? `linear-gradient(90deg, ${accent}22 0%, ${accent}0a 100%)`
          : hovered
          ? 'rgba(255, 255, 255, 0.04)'
          : 'transparent',
        border: active
          ? `1px solid ${accent}38`
          : hovered
          ? '1px solid rgba(255, 255, 255, 0.05)'
          : '1px solid transparent',
        transition: 'all 0.16s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        boxShadow: active ? `0 2px 10px ${accent}18` : 'none',
      }}
    >
      {/* 2.5px Active indicator bar on the left */}
      {active && (
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: '6px',
            bottom: '6px',
            width: '2.5px',
            borderRadius: '0 3px 3px 0',
            backgroundColor: accent,
            boxShadow: `0 0 8px ${accent}90`,
          }}
        />
      )}
      <span
        style={{
          width: '26px',
          height: '26px',
          borderRadius: '7px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          backgroundColor: active
            ? `${accent}25`
            : hovered
            ? 'rgba(255, 255, 255, 0.06)'
            : 'rgba(255, 255, 255, 0.02)',
          color: active ? (accent === '#2563eb' ? '#60a5fa' : accent) : hovered ? '#e2e8f0' : '#64748b',
          transition: 'all 0.16s ease',
          border: active ? `1px solid ${accent}30` : '1px solid transparent',
        }}
      >
        <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
      </span>
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
        {label}
      </span>
      {active && (
        <span
          style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            backgroundColor: accent,
            flexShrink: 0,
            boxShadow: `0 0 6px ${accent}`,
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
  items: (NavItemDef & { active: boolean; onClick?: () => void })[];
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
            display: 'flex',
            alignItems: 'center',
            transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          <ChevronDown size={13} strokeWidth={2} />
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
          {items.map((item) => (
            <NavItem
              key={item.href}
              icon={item.icon}
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
      if (pathname === '/test-coz' && href === '/testler') return true;
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
function FooterLink({
  icon: Icon,
  label,
  href,
  onClick,
  danger,
}: {
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const content = (
    <>
      <span
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          backgroundColor: hovered && danger
            ? 'rgba(239, 68, 68, 0.15)'
            : hovered
            ? 'rgba(255, 255, 255, 0.06)'
            : 'rgba(255, 255, 255, 0.02)',
          color: danger ? (hovered ? '#ef4444' : '#f87171') : hovered ? '#f1f5f9' : '#64748b',
          transition: 'all 0.16s ease',
        }}
      >
        <Icon size={14} strokeWidth={1.8} />
      </span>
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </>
  );

  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    padding: '7px 10px',
    borderRadius: '8px',
    fontSize: '12.5px',
    fontWeight: 500,
    color: hovered && danger ? '#fca5a5' : hovered ? '#f1f5f9' : '#94a3b8',
    background: hovered && danger ? 'rgba(239, 68, 68, 0.08)' : hovered ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
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
        type="button"
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
      href={href || '#'}
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
      : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';

  const avatarGlow =
    user?.role === 'ogretmen' || isMaarif
      ? 'rgba(16, 185, 129, 0.25)'
      : 'rgba(37, 99, 235, 0.25)';

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
        backgroundColor: 'var(--bg-sidebar, #090d16)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
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
            gap: '9px',
            textDecoration: 'none',
            cursor: 'pointer',
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              flexShrink: 0,
              background: isMaarif
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: `0 0 16px ${avatarGlow}`,
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            {isMaarif ? <Sprout size={17} strokeWidth={2.2} /> : <GraduationCap size={18} strokeWidth={2.2} />}
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
              YKS<span style={{ color: isMaarif ? '#10b981' : '#38bdf8' }}>Yıldızı</span>
            </span>
            <span
              style={{
                fontSize: '9px',
                fontWeight: 700,
                color: isMaarif ? '#34d399' : '#64748b',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginTop: '1px',
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
            border: '1px solid rgba(255, 255, 255, 0.07)',
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
              border: '1px solid rgba(255, 255, 255, 0.12)',
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
          background: 'rgba(255, 255, 255, 0.06)',
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
          background: 'rgba(255, 255, 255, 0.06)',
          margin: '0 10px 4px',
          flexShrink: 0,
        }}
      />

      {/* ── Footer ── */}
      <div style={{ padding: '4px 8px 12px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <div style={{ padding: '0 2px 4px' }}>
          <DesignModeSwitcher variant="sidebar" />
        </div>
        <FooterLink icon={User} label="Profilim" href={profileHref} />
        <FooterLink icon={Settings} label="Ayarlar" href="/ayarlar" />
        <FooterLink icon={LogOut} label="Çıkış Yap" onClick={logout} danger />
      </div>
    </aside>
  );
}
