"use client";

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

const MAIN_TABS = [
  { emoji: '🏠', label: 'Ana Sayfa', href: '/dashboard?tab=home' },
  { emoji: '📅', label: 'Program', href: '/dashboard?tab=schedule' },
  { emoji: '🍅', label: 'Odak', href: '/dashboard?tab=focus' },
  { emoji: '📊', label: 'Analiz', href: '/dashboard?tab=analysis' },
];

const MORE_TABS = [
  { emoji: '📈', label: 'Denemeler', href: '/denemeler' },
  { emoji: '🎯', label: 'Hedeflerim', href: '/dashboard?tab=hedef' },
  { emoji: '⚔️', label: 'Bilgi Arenası', href: '/duello' },
  { emoji: '🎧', label: 'Çalışma Odaları', href: '/calisma-odalari' },
  { emoji: '🧠', label: 'Rehberlik', href: '/rehberlik' },
  { emoji: '🔬', label: 'Simülasyonlar', href: '/simulasyonlar' },
  { emoji: '🤖', label: 'AstraTutor AI', href: '/dashboard?tab=astratutor' },
  { emoji: '🎓', label: 'Tercih Robotu', href: '/dashboard?tab=tercih_robotu' },
  { emoji: '🧮', label: 'Puan Hesaplama', href: '/puan-hesaplama' },
  { emoji: '🛡️', label: 'Klanlar', href: '/klanlar' },
  { emoji: '📋', label: 'Ödevlerim', href: '/odevlerim' },
  { emoji: '❌', label: 'Yanlışlarım', href: '/dashboard?tab=mistakes' },
  { emoji: '📚', label: 'Konular', href: '/dashboard?tab=topics' },
  { emoji: '📝', label: 'Testlerim', href: '/dashboard?tab=tests' },
  { emoji: '🏆', label: 'Ligler', href: '/ligler' },
  { emoji: '🛍️', label: 'Mağaza', href: '/magaza' },
  { emoji: '🎴', label: 'Kartlar', href: '/dashboard?tab=cards' },
  { emoji: '🏫', label: 'Sınıfım', href: '/dashboard?tab=sinif' },
  { emoji: '💬', label: 'Sınıf Forumu', href: '/dashboard?tab=forum' },
  { emoji: '👤', label: 'Profilim', href: '/dashboard?tab=profile' },
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
    { emoji: '👤', label: 'Profilim', href: '/ogretmen/dashboard?tab=profile' },
  ];
  
  const currentMainTabs = user?.role === 'ogretmen' ? TEACHER_MAIN_TABS : MAIN_TABS;
  const currentMoreTabs = user?.role === 'ogretmen' ? TEACHER_MORE_TABS : MORE_TABS;


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

  return (
    <>
      <nav
        className="mobile-flex"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 'calc(64px + env(safe-area-inset-bottom))',
          backgroundColor: 'rgba(11, 15, 25, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(167, 139, 250, 0.15)',
          boxShadow: '0 -4px 20px rgba(168, 85, 247, 0.05)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          paddingBottom: 'env(safe-area-inset-bottom)',
          zIndex: 50,
        }}
      >
        {currentMainTabs.map((tab) => {
          const active = checkIsActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => triggerHaptic('light')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                flex: 1,
                height: '100%',
                textDecoration: 'none',
              }}
            >
              <span
                style={{
                  fontSize: '20px',
                  filter: active ? 'drop-shadow(0 0 8px rgba(167,139,250,0.5))' : 'none',
                  opacity: active ? 1 : 0.7,
                  transition: 'all 0.2s',
                }}
              >
                {tab.emoji}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: active ? 600 : 500,
                  color: active ? '#a78bfa' : '#94a3b8',
                  transition: 'color 0.2s',
                }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}

        {/* Daha Fazla Button */}
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
            gap: '4px',
            flex: 1,
            height: '100%',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: '20px', opacity: 0.7 }}>≡</span>
          <span style={{ fontSize: '10px', fontWeight: 500, color: '#94a3b8' }}>
            Daha Fazla
          </span>
        </button>
      </nav>

      {/* Slide-up Drawer */}
      <AnimatePresence>
        {isMoreOpen && (
          <>
            {/* Backdrop */}
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
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
                zIndex: 100,
              }}
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="mobile-only"
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: '#131827',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                padding: '16px 20px',
                paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
                zIndex: 101,
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                maxHeight: '82dvh',
                overflowY: 'auto',
                boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
              }}
            >
              {/* Native Drag Handle */}
              <div className="modal-drag-handle" style={{ marginBottom: 14 }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>Menü</h2>
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setIsMoreOpen(false);
                  }}
                  aria-label="Kapat"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {currentMoreTabs.map((tab) => {
                  const active = checkIsActive(tab.href);
                  return (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      onClick={() => {
                        triggerHaptic('light');
                        setIsMoreOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '16px',
                        backgroundColor: active ? 'rgba(168, 85, 247, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        color: active ? '#a78bfa' : '#e2e8f0',
                        fontWeight: active ? 600 : 500,
                        border: active ? '1px solid rgba(168, 85, 247, 0.2)' : '1px solid transparent',
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>{tab.emoji}</span>
                      <span style={{ fontSize: '14px' }}>{tab.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Logout Button in Mobile Drawer */}
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
                  gap: '10px',
                  padding: '14px',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '14px',
                  color: '#f87171',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                <LogOut size={18} />
                <span>Çıkış Yap</span>
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
