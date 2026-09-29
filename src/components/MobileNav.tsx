"use client";

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, LogOut, LucideIcon,
  Home, Calendar, Timer, BarChart3, TrendingUp, Target, 
  Sparkles, Swords, Headphones, FlaskConical, GraduationCap, 
  Calculator, ClipboardList, AlertCircle, BookOpen, FileText, 
  Trophy, ShoppingBag, Layers, Users, User, Megaphone
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

const MAIN_TABS = [
  { icon: Home, label: 'Ana Sayfa', href: '/dashboard?tab=home', emoji: '🏠' },
  { icon: Calendar, label: 'Program', href: '/dashboard?tab=schedule', emoji: '📅' },
  { icon: Timer, label: 'Odak', href: '/dashboard?tab=focus', emoji: '🍅' },
  { icon: BarChart3, label: 'Analiz', href: '/dashboard?tab=analysis', emoji: '📊' },
];

const MORE_TABS = [
  { icon: TrendingUp, label: 'Denemeler', href: '/denemeler', emoji: '📈' },
  { icon: Target, label: 'Hedeflerim', href: '/dashboard?tab=hedef', emoji: '🎯' },
  { icon: Sparkles, label: 'Astra AI & Rehberlik', href: '/dashboard?tab=astratutor', emoji: '🤖' },
  { icon: Swords, label: 'Bilgi Arenası', href: '/duello', emoji: '⚔️' },
  { icon: Headphones, label: 'Çalışma Odaları', href: '/calisma-odalari', emoji: '🎧' },
  { icon: FlaskConical, label: 'Simülasyonlar', href: '/simulasyonlar', emoji: '🔬' },
  { icon: GraduationCap, label: 'Tercih Robotu', href: '/dashboard?tab=tercih_robotu', emoji: '🎓' },
  { icon: Calculator, label: 'Puan Hesaplama', href: '/puan-hesaplama', emoji: '🧮' },
  { icon: ClipboardList, label: 'Ödevlerim', href: '/odevlerim', emoji: '📋' },
  { icon: AlertCircle, label: 'Yanlışlarım', href: '/dashboard?tab=mistakes', emoji: '❌' },
  { icon: BookOpen, label: 'Konular', href: '/dashboard?tab=topics', emoji: '📚' },
  { icon: FileText, label: 'Testlerim', href: '/dashboard?tab=tests', emoji: '📝' },
  { icon: Trophy, label: 'Ligler', href: '/ligler', emoji: '🏆' },
  { icon: ShoppingBag, label: 'Mağaza', href: '/magaza', emoji: '🛍️' },
  { icon: Layers, label: 'Kartlar', href: '/dashboard?tab=cards', emoji: '🎴' },
  { icon: Users, label: 'Sınıfım', href: '/dashboard?tab=sinif', emoji: '🏫' },
  { icon: User, label: 'Profilim', href: '/dashboard?tab=profile', emoji: '👤' },
];

function MobileNavContent() {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();

  const TEACHER_MAIN_TABS = [
    { icon: Home, label: 'Genel Bakış', href: '/ogretmen/dashboard', emoji: '🏠' },
    { icon: Layers, label: 'Sınıflarım', href: '/ogretmen/dashboard?tab=siniflar', emoji: '🏫' },
    { icon: Users, label: 'Öğrenciler', href: '/ogretmen/dashboard?tab=ogrenciler', emoji: '👥' },
    { icon: ClipboardList, label: 'Ödevler', href: '/ogretmen/dashboard?tab=odevler', emoji: '📋' },
  ];
  
  const TEACHER_MORE_TABS = [
    { icon: BarChart3, label: 'Sınıf Analizi', href: '/ogretmen/dashboard?tab=analiz', emoji: '📊' },
    { icon: BookOpen, label: 'Kaynaklar', href: '/ogretmen/dashboard?tab=kaynaklar', emoji: '📚' },
    { icon: Megaphone, label: 'Duyurular', href: '/ogretmen/dashboard?tab=duyurular', emoji: '📢' },
    { icon: User, label: 'Profilim', href: '/ogretmen/dashboard?tab=profile', emoji: '👤' },
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
              {tab.icon ? (
                <tab.icon
                  size={20}
                  strokeWidth={active ? 2.5 : 2}
                  style={{
                    color: active ? '#a78bfa' : '#94a3b8',
                    filter: active ? 'drop-shadow(0 0 8px rgba(167,139,250,0.6))' : 'none',
                    transition: 'all 0.2s',
                  }}
                />
              ) : (
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
              )}
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
                      {tab.icon ? (
                        <span style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: active ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                          color: active ? '#c4b5fd' : '#94a3b8',
                          flexShrink: 0
                        }}>
                          <tab.icon size={17} strokeWidth={active ? 2.5 : 2} />
                        </span>
                      ) : (
                        <span style={{ fontSize: '20px' }}>{tab.emoji}</span>
                      )}
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
