"use client";

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { TimerProvider } from '@/context/TimerContext';
import GlobalTimerWidget from '@/components/GlobalTimerWidget';
import AppSidebar from '@/components/AppSidebar';
import MobileNav from '@/components/MobileNav';
import MobileHeader from '@/components/MobileHeader';
import { PWAInstallBanner, OfflineStatusBanner, OfflineFocusNotification } from '@/components/PWAComponents';
import SessionLogModal from '@/components/dashboard/SessionLogModal';
import ThemeEngine from '@/components/ThemeEngine';

function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        reg.update().catch(() => {});
      }).catch(() => {});
    }
  }, []);
  return null;
}

/**
 * CurriculumBoundaryGuard — Katı Müfredat & Panel İzolasyon Koruyucusu (Zero Contamination)
 * - 9, 10, 11. Sınıf öğrencileri ASLA klasik YKS panellerine giremez (hemen /maarif'e yönlendirilir).
 * - 12. Sınıf ve Mezun öğrencileri ASLA Maarif senaryolarına/yazılılarına giremez (hemen /dashboard'a yönlendirilir).
 */
function CurriculumBoundaryGuard() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;

    // Sadece öğrenci rolü için katı izolasyon kuralları uygulanır
    if (user.role === 'ogrenci' || !user.role) {
      const isMaarifUser =
        user.curriculum_mode === 'maarif_v1' ||
        ['9', '10', '11'].includes(user.sinif);

      const isLegacyUser =
        user.curriculum_mode === 'legacy_yks' ||
        ['12', 'Mezun'].includes(user.sinif);

      // Klasik YKS'ye özel sayfalar (9-11 girmemeli)
      const legacyOnlyPrefixes = ['/dashboard', '/denemeler', '/puan-hesaplama', '/konular', '/eksikler'];

      if (isMaarifUser) {
        const isTryingLegacy = legacyOnlyPrefixes.some(
          prefix => pathname === prefix || pathname?.startsWith(`${prefix}/`) || pathname?.startsWith(`${prefix}?`)
        );
        if (isTryingLegacy) {
          router.replace('/maarif');
          return;
        }
      }

      // Maarif'e özel sayfalar (12 ve Mezun girmemeli)
      if (isLegacyUser && (pathname === '/maarif' || pathname?.startsWith('/maarif/'))) {
        router.replace('/dashboard');
        return;
      }
    }
  }, [user, loading, pathname, router]);

  return null;
}

/**
 * LayoutShell — renders the appropriate layout based on the route.
 * Landing and auth pages have no sidebar.
 * Authenticated inner pages have the new AppSidebar and a light theme.
 */
export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Pages that use their own self-contained layout (no sidebar)
  const isWidgetPage = pathname?.startsWith('/widget');
  if (isWidgetPage) {
    return (
      <AuthProvider>
        <TimerProvider>
          {children}
          <ServiceWorkerRegistrar />
        </TimerProvider>
      </AuthProvider>
    );
  }

  const isNoSidebarPage = pathname === '/' || pathname === '/login' || pathname === '/register';

  if (isNoSidebarPage) {
    return (
      <AuthProvider>
        <TimerProvider>
          <ThemeEngine />
          {children}
          <React.Suspense fallback={null}>
            <GlobalTimerWidget />
          </React.Suspense>
          <SessionLogModal />
          <OfflineStatusBanner />
          <OfflineFocusNotification />
          <ServiceWorkerRegistrar />
        </TimerProvider>
      </AuthProvider>
    );
  }

// All other pages: dark-theme layout with sidebar
  return (
    <AuthProvider>
      <TimerProvider>
      <CurriculumBoundaryGuard />
      <ThemeEngine />
      <div style={{ minHeight: '100vh', backgroundColor: '#080c14', overflowX: 'hidden' }}>
        <MobileHeader />
        <React.Suspense fallback={<div className="desktop-only" style={{ width: 228, borderRight: '1px solid rgba(255,255,255,0.06)' }} />}>
          <AppSidebar />
        </React.Suspense>
        <React.Suspense fallback={<div className="mobile-only" style={{ height: 60 }} />}>
          <MobileNav />
        </React.Suspense>
        <main
          className="dashboard-main-responsive"
          style={{
            minHeight: '100vh',
            backgroundColor: '#080c14',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </main>
        <React.Suspense fallback={null}>
          <GlobalTimerWidget />
        </React.Suspense>
        <SessionLogModal />
        <ServiceWorkerRegistrar />
        <PWAInstallBanner />
        <OfflineStatusBanner />
        <OfflineFocusNotification />
      </div>
      </TimerProvider>
    </AuthProvider>
  );
}
