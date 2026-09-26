'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, X, Download, Smartphone } from 'lucide-react';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

// ──────────────────────────────────────────
// Push Notification Hook
// ──────────────────────────────────────────
export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
      setSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (!supported) return;
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setSubscription(sub);
      });
    }).catch(() => {});
  }, [supported]);

  const subscribe = useCallback(async () => {
    if (!supported || isSubscribing) return;
    setIsSubscribing(true);

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission !== 'granted') {
        setIsSubscribing(false);
        return false;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Sunucuya kaydet
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      });

      setSubscription(sub);
      setIsSubscribing(false);
      return true;
    } catch (err) {
      console.error('Push subscribe hatası:', err);
      setIsSubscribing(false);
      return false;
    }
  }, [supported, isSubscribing]);

  const unsubscribe = useCallback(async () => {
    if (!subscription) return;
    try {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint }),
      });
      setSubscription(null);
    } catch (err) {
      console.error('Push unsubscribe hatası:', err);
    }
  }, [subscription]);

  return { permission, subscription, isSubscribing, supported, subscribe, unsubscribe };
}

// ──────────────────────────────────────────
// PWA Install Banner ("Ana Ekrana Ekle")
// ──────────────────────────────────────────
export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Zaten kurulu mu?
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // iOS tespiti
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    // Daha önce reddetti mi?
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (dismissed) return;

    if (ios) {
      // iOS'ta beforeinstallprompt yok, manuel banner göster
      setTimeout(() => setShowBanner(true), 3000);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      // iOS'ta prompt yok, kullanıcıya rehber göster
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowBanner(false);
    if (result.outcome === 'accepted') {
      setIsInstalled(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  if (isInstalled || !showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{
          position: 'fixed',
          bottom: 'calc(64px + env(safe-area-inset-bottom) + 12px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: 420,
          background: 'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(18,20,28,0.98))',
          border: '1px solid rgba(139,92,246,0.3)',
          borderRadius: 16,
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,92,246,0.1)',
          backdropFilter: 'blur(20px)',
          zIndex: 9999,
        }}
      >
        {/* İkon */}
        <div style={{
          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
          background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24,
        }}>
          ✨
        </div>

        {/* Metin */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
            YKS Yıldızı'nı Yükle
          </div>
          <div style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.4 }}>
            {isIOS
              ? 'Safari\'de 📤 paylaş → "Ana Ekrana Ekle" seç'
              : 'Uygulamayı ana ekranına ekle, her şeye hızlı ulaş!'}
          </div>
        </div>

        {/* Butonlar */}
        {!isIOS && (
          <button
            onClick={handleInstall}
            style={{
              padding: '8px 14px', borderRadius: 8, flexShrink: 0,
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              border: 'none', color: '#fff', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Download size={14} />
            Yükle
          </button>
        )}

        <button
          onClick={handleDismiss}
          style={{
            background: 'none', border: 'none', color: '#64748b',
            cursor: 'pointer', padding: 4, flexShrink: 0,
          }}
        >
          <X size={18} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

// ──────────────────────────────────────────
// Bildirim İzni Butonu (Profil veya Ayarlar sayfası için)
// ──────────────────────────────────────────
export function PushNotificationToggle() {
  const { permission, subscription, isSubscribing, supported, subscribe, unsubscribe } = usePushNotifications();

  if (!supported) return null;

  const isSubscribed = !!subscription && permission === 'granted';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px',
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${isSubscribed ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: isSubscribed ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {isSubscribed ? <Bell size={18} color="#10b981" /> : <BellOff size={18} color="#64748b" />}
        </div>
        <div>
          <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 14 }}>
            Anlık Bildirimler
          </div>
          <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
            {isSubscribed
              ? '✅ Aktif — ödev ve rapor bildirimleri geliyor'
              : permission === 'denied'
              ? '🚫 Tarayıcı ayarlarından izin verin'
              : 'Ödev atamaları ve haftalık raporlar için aç'}
          </div>
        </div>
      </div>

      {permission !== 'denied' && (
        <button
          onClick={isSubscribed ? unsubscribe : subscribe}
          disabled={isSubscribing}
          style={{
            padding: '8px 16px', borderRadius: 8,
            background: isSubscribed
              ? 'rgba(239,68,68,0.1)'
              : 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.15))',
            border: `1px solid ${isSubscribed ? 'rgba(239,68,68,0.3)' : 'rgba(139,92,246,0.4)'}`,
            color: isSubscribed ? '#fca5a5' : '#c4b5fd',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
            opacity: isSubscribing ? 0.6 : 1,
            transition: 'all 0.2s ease',
          }}
        >
          {isSubscribing ? '...' : isSubscribed ? 'Kapat' : 'Aç'}
        </button>
      )}
    </div>
  );
}
