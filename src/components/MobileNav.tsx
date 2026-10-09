"use client";

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut, ChevronRight } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import NotificationCenter from '@/components/NotificationCenter';

const MAIN_TABS = [
  { emoji: '🏠', label: 'Ana Sayfa', href: '/dashboard?tab=home' },
  { emoji: '📅', label: 'Program', href: '/dashboard?tab=schedule' },
  { emoji: '🍅', label: 'Odak', href: '/dashboard?tab=focus' },
  { emoji: '📊', label: 'Analiz', href: '/dashboard?tab=analysis' },
];

const MORE_TABS = [
  { emoji: '📈', label: 'Denemeler', href: '/denemeler' },
  { emoji: '🎯', label: 'Hedeflerim', href: '/dashboard?tab=hedef' },
  { emoji: '🤖', label: 'Astra AI Koç', href: '/dashboard?tab=astratutor' },
  { emoji: '⚔️', label: 'Bilgi Arenası', href: '/duello' },
  { emoji: '🛡️', label: 'Klanlar', href: '/klanlar' },
  { emoji: '💬', label: 'Topluluk Forumu', href: '/forum' },
  { emoji: '🎧', label: 'Çalışma Odaları', href: '/calisma-odalari' },
  { emoji: '🔬', label: 'Simülasyonlar', href: '/simulasyonlar' },
  { emoji: '🎓', label: 'Tercih Robotu', href: '/dashboard?tab=tercih-robotu' },
  { emoji: '🧮', label: 'Puan Hesaplama', href: '/puan-hesaplama' },
  { emoji: '📋', label: 'Ödevlerim', href: '/odevlerim' },
  { emoji: '❌', label: 'Yanlışlarım', href: '/dashboard?tab=mistakes' },
  { emoji: '📚', label: 'Konular', href: '/dashboard?tab=topics' },
  { emoji: '📝', label: 'Testlerim', href: '/dashboard?tab=tests' },
  { emoji: '🏆', label: 'Ligler', href: '/ligler' },
  { emoji: '🛍️', label: 'Mağaza', href: '/magaza' },
  { emoji: '🎴', label: 'Hafıza Kartları', href: '/dashboard?tab=cards' },
  { emoji: '🏫', label: 'Sınıfım', href: '/dashboard?tab=sinif' },
  { emoji: '👤', label: 'Profilim', href: '/dashboard?tab=profile' },
  { emoji: '⚙️', label: 'Ayarlar', href: '/ayarlar' },
];

const MAARIF_MAIN_TABS = [
  { emoji: '🌱', label: 'Maarif', href: '/maarif' },
  { emoji: '📝', label: 'Yazılılar', href: '/maarif?tab=senaryolar' },
  { emoji: '📚', label: 'Kazanımlar', href: '/maarif?tab=dersler' },
  { emoji: '🤖', label: 'Mentor', href: '/maarif?tab=mentor' },
];

const MAARIF_MORE_TABS = [
  { emoji: '🔬', label: 'Deney & Simülasyon', href: '/maarif?tab=deneyler' },
  { emoji: '📋', label: 'Ödevlerim', href: '/odevlerim' },
  { emoji: '🎧', label: 'Çalışma Odaları', href: '/calisma-odalari' },
  { emoji: '🔬', label: 'Tüm Simülasyonlar', href: '/simulasyonlar' },
  { emoji: '⚔️', label: 'Bilgi Arenası', href: '/duello' },
  { emoji: '🛡️', label: 'Klanlar', href: '/klanlar' },
  { emoji: '💬', label: 'Topluluk Forumu', href: '/forum' },
  { emoji: '🏆', label: 'Ligler', href: '/ligler' },
  { emoji: '🛍️', label: 'Mağaza', href: '/magaza' },
  { emoji: '👤', label: 'Profilim', href: '/maarif' },
  { emoji: '⚙️', label: 'Ayarlar', href: '/ayarlar' },
];

function MobileNavContent() {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();

  const TEACHER_MAIN_TABS = [
    { emoji: '🏠', label: 'Genel Bakış', href: '/ogretmen/dashboard' },
    { emoji: '🏫', label: 'Sınıflarım', href: '/ogretmen/dashboard?tab=siniflar' },
    { emoji: '👥', label: 'Öğrenciler', href: '/ogretmen/dashboard?tab=ogrenciler' },
    { emoji: '📋', label: 'Ödevler', href: '/ogretmen/dashboard?tab=odevler' },
  ];

  const TEACHER_MORE_TABS = [
    { emoji: '📊', label: 'Sınıf Analizi', href: '/ogretmen/dashboard?tab=analiz' },
    { emoji: '📚', label: 'Kaynaklar', href: '/ogretmen/dashboard?tab=kaynaklar' },
    { emoji: '📢', label: 'Duyurular', href: '/ogretmen/dashboard?tab=duyurular' },
    { emoji: '👤', label: 'Profilim', href: '/ogretmen/dashboard?tab=profil' },
    { emoji: '⚙️', label: 'Ayarlar', href: '/ayarlar' },
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

  const accentColor = isMaarif ? '#10b981' : '#6366f1';

  return (
    <>
      {/* ── Native Flutter-Style Bottom Navigation Bar ── */}
      <nav
        className="mobile-flex"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 'calc(60px + env(safe-area-inset-bottom))',
          backgroundColor: 'rgba(8, 12, 20, 0.94)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 -4px 28px rgba(0, 0, 0, 0.6)',
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
                gap: '2px',
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
                  fontSize: '20px',
                  lineHeight: 1,
                  opacity: active ? 1 : 0.65,
                  transform: active ? 'scale(1.12)' : 'scale(1)',
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                  filter: active ? `drop-shadow(0 0 8px ${accentColor}80)` : 'none',
                }}
              >
                {tab.emoji}
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
            gap: '2px',
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
                fontSize: '20px',
                lineHeight: 1,
                opacity: isMoreOpen ? 1 : 0.65,
                transform: isMoreOpen ? 'scale(1.12)' : 'scale(1)',
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                filter: isMoreOpen ? `drop-shadow(0 0 8px ${accentColor}80)` : 'none',
              }}
            >
              ✨
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
                  border: '1.5px solid #080c14',
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

      {/* ── Native Flutter Bottom Sheet Drawer ── */}
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
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
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
                backgroundColor: '#0c101c',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                padding: '12px 18px',
                paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
                zIndex: 101,
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                maxHeight: '84dvh',
                overflowY: 'auto',
                boxShadow: '0 -12px 48px rgba(0, 0, 0, 0.75)',
                touchAction: 'pan-y',
              }}
            >
              {/* Native Drag Handle */}
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
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
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
                        : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '15px',
                    }}
                  >
                    {isMaarif ? '🌱' : '⭐'}
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
                        padding: '11px 12px',
                        backgroundColor: active
                          ? `${accentColor}18`
                          : 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        color: active ? '#ffffff' : '#cbd5e1',
                        fontWeight: active ? 700 : 500,
                        border: active
                          ? `1px solid ${accentColor}40`
                          : '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'all 0.16s ease',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '18px',
                          lineHeight: 1,
                          width: '30px',
                          height: '30px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: active
                            ? `${accentColor}30`
                            : 'rgba(255, 255, 255, 0.04)',
                          flexShrink: 0,
                        }}
                      >
                        {tab.emoji}
                      </span>
                      <span
                        style={{
                          fontSize: '12.5px',
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
                  padding: '12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '12px',
                  color: '#f87171',
                  fontSize: '13px',
                  fontWeight: 700,
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
