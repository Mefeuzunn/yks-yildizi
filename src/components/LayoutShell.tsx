"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';
import { TimerProvider } from '@/context/TimerContext';
import GlobalTimerWidget from '@/components/GlobalTimerWidget';
import AppSidebar from '@/components/AppSidebar';
import MobileNav from '@/components/MobileNav';

/**
 * LayoutShell — renders the appropriate layout based on the route.
 * Landing and auth pages have no sidebar.
 * Authenticated inner pages have the new AppSidebar and a light theme.
 */
export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Pages that use their own self-contained layout (no sidebar)
  const isNoSidebarPage = pathname === '/' || pathname === '/login' || pathname === '/register';

  if (isNoSidebarPage) {
    return (
      <AuthProvider>
        <TimerProvider>
          {children}
          <React.Suspense fallback={null}>
            <GlobalTimerWidget />
          </React.Suspense>
        </TimerProvider>
      </AuthProvider>
    );
  }

// All other pages: dark-theme layout with sidebar
  return (
    <AuthProvider>
      <TimerProvider>
      <div style={{ minHeight: '100vh', backgroundColor: '#0b0f19', overflowX: 'hidden' }}>
        <React.Suspense fallback={<div style={{ width: 240, borderRight: '1px solid #1f2937' }} />}>
          <AppSidebar />
        </React.Suspense>
        <React.Suspense fallback={<div style={{ height: 60 }} />}>
          <MobileNav />
        </React.Suspense>
        <main
          className="dashboard-main-responsive"
          style={{
            marginLeft: '240px', // Offset for fixed sidebar
            padding: '40px',
            paddingBottom: '80px', // Mobile bottom bar clearance
            minHeight: '100vh',
            backgroundColor: '#0b0f19',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </main>
        <React.Suspense fallback={null}>
          <GlobalTimerWidget />
        </React.Suspense>
      </div>
      </TimerProvider>
    </AuthProvider>
  );
}
