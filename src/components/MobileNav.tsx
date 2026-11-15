"use client";

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Calendar,
  Timer,
  BarChart3,
  TrendingUp,
  Target,
  BrainCircuit,
  Swords,
  Shield,
  MessageSquare,
  Headphones,
  Compass,
  GraduationCap,
  Calculator,
  ClipboardList,
  XCircle,
  BookOpen,
  FileText,
  Trophy,
  ShoppingBag,
  Layers,
  School,
  User,
  Settings,
  Sprout,
  FileEdit,
  Atom,
  Sparkles,
  Users,
  Bell,
  Menu,
  X,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import NotificationCenter from '@/components/NotificationCenter';

interface MobileTabItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

const MAIN_TABS: MobileTabItem[] = [
  { icon: Home, label: 'Ana Sayfa', href: '/dashboard?tab=home' },
  { icon: Calendar, label: 'Program', href: '/dashboard?tab=schedule' },
  { icon: Timer, label: 'Odak', href: '/dashboard?tab=focus' },
  { icon: BarChart3, label: 'Analiz', href: '/dashboard?tab=analysis' },
];

const MORE_TABS: MobileTabItem[] = [
  { icon: TrendingUp, label: 'Denemeler', href: '/denemeler' },
  { icon: Target, label: 'Hedeflerim', href: '/dashboard?tab=hedef' },
  { icon: BrainCircuit, label: 'Astra AI Koç', href: '/dashboard?tab=astratutor' },
  { icon: Swords, label: 'Bilgi Arenası', href: '/duello' },
  { icon: Shield, label: 'Klanlar', href: '/klanlar' },
  { icon: MessageSquare, label: 'Topluluk Forumu', href: '/forum' },
  { icon: Headphones, label: 'Çalışma Odaları', href: '/calisma-odalari' },
  { icon: Compass, label: 'Simülasyonlar', href: '/simulasyonlar' },
  { icon: GraduationCap, label: 'Tercih Robotu', href: '/dashboard?tab=tercih-robotu' },
  { icon: Calculator, label: 'Puan Hesaplama', href: '/puan-hesaplama' },
  { icon: ClipboardList, label: 'Ödevlerim', href: '/odevlerim' },
  { icon: XCircle, label: 'Yanlışlarım', href: '/dashboard?tab=mistakes' },
  { icon: BookOpen, label: 'Konular', href: '/dashboard?tab=topics' },
  { icon: FileText, label: 'Testler & Soru Havuzu', href: '/testler' },
  { icon: Trophy, label: 'Ligler', href: '/ligler' },
  { icon: ShoppingBag, label: 'Mağaza', href: '/magaza' },
  { icon: Layers, label: 'Hafıza Kartları', href: '/dashboard?tab=cards' },
  { icon: School, label: 'Sınıfım', href: '/dashboard?tab=sinif' },
  { icon: User, label: 'Profilim', href: '/dashboard?tab=profile' },
  { icon: Settings, label: 'Ayarlar', href: '/ayarlar' },
];

const MAARIF_MAIN_TABS: MobileTabItem[] = [
  { icon: Sprout, label: 'Maarif', href: '/maarif' },
  { icon: FileEdit, label: 'Yazılılar', href: '/maarif?tab=senaryolar' },
  { icon: BookOpen, label: 'Kazanımlar', href: '/maarif?tab=dersler' },
  { icon: Sparkles, label: 'Mentor', href: '/maarif?tab=mentor' },
];

const MAARIF_MORE_TABS: MobileTabItem[] = [
  { icon: Atom, label: 'Deney & Simülasyon', href: '/maarif?tab=deneyler' },
  { icon: ClipboardList, label: 'Ödevlerim', href: '/odevlerim' },
  { icon: Headphones, label: 'Çalışma Odaları', href: '/calisma-odalari' },
  { icon: Compass, label: 'Tüm Simülasyonlar', href: '/simulasyonlar' },
  { icon: Swords, label: 'Bilgi Arenası', href: '/duello' },
  { icon: Shield, label: 'Klanlar', href: '/klanlar' },
  { icon: MessageSquare, label: 'Topluluk Forumu', href: '/forum' },
  { icon: Trophy, label: 'Ligler', href: '/ligler' },
  { icon: ShoppingBag, label: 'Mağaza', href: '/magaza' },
  { icon: User, label: 'Profilim', href: '/maarif' },
  { icon: Settings, label: 'Ayarlar', href: '/ayarlar' },
];

function MobileNavContent() {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();

  const TEACHER_MAIN_TABS: MobileTabItem[] = [
    { icon: Home, label: 'Genel Bakış', href: '/ogretmen/dashboard' },
    { icon: School, label: 'Sınıflarım', href: '/ogretmen/dashboard?tab=siniflar' },
    { icon: Users, label: 'Öğrenciler', href: '/ogretmen/dashboard?tab=ogrenciler' },
    { icon: ClipboardList, label: 'Ödevler', href: '/ogretmen/dashboard?tab=odevler' },
  ];

  const TEACHER_MORE_TABS: MobileTabItem[] = [
    { icon: BarChart3, label: 'Sınıf Analizi', href: '/ogretmen/dashboard?tab=analiz' },
    { icon: BookOpen, label: 'Kaynaklar', href: '/ogretmen/dashboard?tab=kaynaklar' },
    { icon: Bell, label: 'Duyurular', href: '/ogretmen/dashboard?tab=duyurular' },
    { icon: User, label: 'Profilim', href: '/ogretmen/dashboard?tab=profil' },
    { icon: Settings, label: 'Ayarlar', href: '/ayarlar' },
  ];

  const isMaarif =
    user?.curriculum_mode === 'maarif_v1' ||
    ['9', '10', '11'].includes(user?.sinif || '');

  const currentMainTabs =
    user?.role === 'ogretmen'
      ? TEACHER_MAIN_TABS
      : isMaarif
      ? MAARIF_MAIN_TABS
      : MAIN_TABS;

  const currentMoreTabs =
    user?.role === 'ogretmen'
      ? TEACHER_MORE_TABS
      : isMaarif
      ? MAARIF_MORE_TABS
      : MORE_TABS;

  const [unreadCount, setUnreadCount] = useState(0);

  // Unread notification listener
  useEffect(() => {
    const handleCount = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      if (typeof customEvent.detail === 'number') {
        setUnreadCount(customEvent.detail);
      }
    };
    window.addEventListener('yks:unread-count', handleCount);
    fetch('/api/notifications')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.unreadCount !== undefined) setUnreadCount(d.unreadCount);
      })
      .catch(() => {});
    return () => window.removeEventListener('yks:unread-count', handleCount);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setIsMoreOpen(false);
  }, [pathname, searchParams]);

  const checkIsActive = (href: string) => {
    const [targetPath, targetQuery] = href.split('?');
    if (pathname === '/test-coz' && targetPath === '/testler') return true;
    if (pathname !== targetPath) return false;
    const tab = searchParams?.get('tab');
    if (!targetQuery) {
      return !tab || tab === 'home';
    }
    const paramMatch = targetQuery.match(/tab=([^&]+)/);
    if (paramMatch) {
      return tab === paramMatch[1];
    }
    return true;
  };

  const accentColor = isMaarif ? '#10b981' : '#2563eb';

  return (
    <>
      {/* ── Native Mobile Bottom Navigation Bar ── */}
      <nav
        className="mobile-flex"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 'calc(60px + env(safe-area-inset-bottom))',
          backgroundColor: 'var(--surface-header, rgba(9, 13, 22, 0.95))',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 -4px 28px rgba(0, 0, 0, 0.65)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          paddingBottom: 'env(safe-area-inset-bottom)',
          zIndex: 50,
          touchAction: 'manipulation',
        }}
      >
        {currentMainTabs.map((tab) => {
          const active = checkIsActive(tab.href);
          const TabIcon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => {
                triggerHaptic('light');
                const targetTab = tab.href.includes('?tab=') ? tab.href.split('?tab=')[1] : null;
                if (targetTab && typeof window !== 'undefined') {
                  if (user?.role === 'ogretmen') {
                    window.dispatchEvent(new CustomEvent('yks:navigate-teacher-tab', { detail: targetTab }));
                  } else {
                    window.dispatchEvent(new CustomEvent('yks:navigate-tab', { detail: targetTab }));
                  }
                }
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                flex: 1,
                height: '100%',
                textDecoration: 'none',
                position: 'relative',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {active && (
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    width: '28px',
                    height: '2px',
                    borderRadius: '0 0 4px 4px',
                    backgroundColor: accentColor,
                    boxShadow: `0 0 10px ${accentColor}`,
                  }}
                />
              )}
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '7px',
                  backgroundColor: active ? `${accentColor}25` : 'transparent',
                  color: active ? (accentColor === '#2563eb' ? '#38bdf8' : accentColor) : '#64748b',
                  transform: active ? 'scale(1.08)' : 'scale(1)',
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <TabIcon size={19} strokeWidth={active ? 2.2 : 1.8} />
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: active ? 700 : 500,
                  color: active ? '#ffffff' : '#8592a6',
                  transition: 'color 0.18s ease',
                  letterSpacing: '-0.01em',
                }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}

        {/* ── More (Menü) Button ── */}
        <button
          onClick={() => {
            triggerHaptic('medium');
            setIsMoreOpen(true);
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            flex: 1,
            height: '100%',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            touchAction: 'manipulation',
            position: 'relative',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                backgroundColor: isMoreOpen ? `${accentColor}25` : 'transparent',
                color: isMoreOpen ? '#38bdf8' : '#64748b',
                transform: isMoreOpen ? 'scale(1.08)' : 'scale(1)',
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <Menu size={19} strokeWidth={isMoreOpen ? 2.2 : 1.8} />
            </span>
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-6px',
                  minWidth: '15px',
                  height: '15px',
                  padding: '0 3px',
                  borderRadius: '9999px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '9px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)',
                  border: '1.5px solid #090d16',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span
            style={{
              fontSize: '10px',
              fontWeight: isMoreOpen ? 700 : 500,
              color: isMoreOpen ? '#ffffff' : '#8592a6',
              transition: 'color 0.18s ease',
              letterSpacing: '-0.01em',
            }}
          >
            Menü
          </span>
        </button>
      </nav>

      {/* ── Native Bottom Sheet Drawer ── */}
      <AnimatePresence>
        {isMoreOpen && (
          <>
            {/* Frosted Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                triggerHaptic('light');
                setIsMoreOpen(false);
              }}
              className="mobile-only"
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.70)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                zIndex: 100,
              }}
            />

            {/* Bottom Sheet Container */}
            <motion.div
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.16}
              onDragEnd={(e, info) => {
                if (info.offset.y > 70 || info.velocity.y > 350) {
                  triggerHaptic('medium');
                  setIsMoreOpen(false);
                }
              }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="mobile-only"
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: '#090d16',
                borderTopLeftRadius: '22px',
                borderTopRightRadius: '22px',
                padding: '12px 16px',
                paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
                zIndex: 101,
                borderTop: '1px solid rgba(255, 255, 255, 0.10)',
                maxHeight: '84dvh',
                overflowY: 'auto',
                boxShadow: '0 -16px 48px rgba(0, 0, 0, 0.85)',
                touchAction: 'pan-y',
              }}
            >
              {/* Drag Handle */}
              <div
                style={{
                  width: '100%',
                  padding: '4px 0 14px 0',
                  display: 'flex',
                  justifyContent: 'center',
                  cursor: 'grab',
                  touchAction: 'none',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '4px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(255, 255, 255, 0.22)',
                  }}
                />
              </div>

              {/* Sheet Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '9px',
                      background: isMaarif
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    }}
                  >
                    {isMaarif ? <Sprout size={17} strokeWidth={2.2} /> : <GraduationCap size={18} strokeWidth={2.2} />}
                  </div>
                  <div>
                    <h2
                      style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: '#ffffff',
                        margin: 0,
                        lineHeight: 1.2,
                      }}
                    >
                      {user?.username?.toUpperCase() || 'ÖĞRENCİ MENÜSÜ'}
                    </h2>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      {isMaarif ? 'Maarif Modeli Portalı' : 'YKS Hazırlık Merkezi'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <NotificationCenter />
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      setIsMoreOpen(false);
                    }}
                    aria-label="Kapat"
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      touchAction: 'manipulation',
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* 2-Column Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px',
                }}
              >
                {currentMoreTabs.map((tab) => {
                  const active = checkIsActive(tab.href);
                  const TabIcon = tab.icon;
                  return (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      onClick={() => {
                        triggerHaptic('light');
                        setIsMoreOpen(false);
                        const targetTab = tab.href.includes('?tab=')
                          ? tab.href.split('?tab=')[1]
                          : null;
                        if (targetTab && typeof window !== 'undefined') {
                          if (user?.role === 'ogretmen') {
                            window.dispatchEvent(
                              new CustomEvent('yks:navigate-teacher-tab', { detail: targetTab })
                            );
                          } else {
                            window.dispatchEvent(
                              new CustomEvent('yks:navigate-tab', { detail: targetTab })
                            );
                          }
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 11px',
                        backgroundColor: active
                          ? `${accentColor}18`
                          : 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        color: active ? '#ffffff' : '#cbd5e1',
                        fontWeight: active ? 700 : 500,
                        border: active
                          ? `1px solid ${accentColor}40`
                          : '1px solid rgba(255, 255, 255, 0.06)',
                        transition: 'all 0.16s ease',
                      }}
                    >
                      <span
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '7px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: active
                            ? `${accentColor}30`
                            : 'rgba(255, 255, 255, 0.04)',
                          color: active ? (accentColor === '#2563eb' ? '#38bdf8' : accentColor) : '#64748b',
                          flexShrink: 0,
                        }}
                      >
                        <TabIcon size={16} strokeWidth={active ? 2.2 : 1.8} />
                      </span>
                      <span
                        style={{
                          fontSize: '12px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {tab.label}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  setIsMoreOpen(false);
                  logout();
                }}
                style={{
                  marginTop: '16px',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '11px',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '10px',
                  color: '#f87171',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.16s ease',
                }}
              >
                <LogOut size={16} />
                <span>Oturumu Kapat</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default function MobileNav() {
  return (
    <Suspense fallback={null}>
      <MobileNavContent />
    </Suspense>
  );
}
