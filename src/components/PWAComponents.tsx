'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, X, Download, Smartphone, Wifi, WifiOff, Share2, PlusSquare, CheckCircle2 } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

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
  const [showIOSGuide, setShowIOSGuide] = useState(false);
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
      setTimeout(() => setShowBanner(true), 2500);
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
    triggerHaptic('medium');
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowBanner(false);
    if (result.outcome === 'accepted') {
      setIsInstalled(true);
      triggerHaptic('success');
    }
  };

  const handleDismiss = () => {
    triggerHaptic('light');
    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  if (isInstalled || !showBanner) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            position: 'fixed',
            bottom: 'calc(64px + env(safe-area-inset-bottom, 0px) + 12px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 24px)',
            maxWidth: 440,
            background: 'linear-gradient(135deg, rgba(15,23,42,0.97), rgba(24,18,43,0.97))',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: 16,
            padding: '12px 14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(16px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          {/* İkon */}
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
            boxShadow: '0 4px 12px rgba(139,92,246,0.35)',
          }}>
            ✨
          </div>

          {/* Metin */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 13.5, marginBottom: 2 }}>
              YKS Yıldızı Uygulaması
            </div>
            <div style={{ color: '#94a3b8', fontSize: 11.5, lineHeight: 1.35 }}>
              {isIOS
                ? 'Hızlı erişim & tam ekran için ana ekrana ekle'
                : 'Uygulamayı ana ekrana ekle, anında başla!'}
            </div>
          </div>

          {/* Butonlar */}
          {isIOS ? (
            <button
              onClick={() => {
                triggerHaptic('light');
                setShowIOSGuide(true);
              }}
              style={{
                padding: '7px 12px', borderRadius: 8, flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(99,102,241,0.2))',
                border: '1px solid rgba(139,92,246,0.45)', color: '#c4b5fd', fontWeight: 700, fontSize: 12,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              <Smartphone size={13} />
              Nasıl?
            </button>
          ) : (
            <button
              onClick={handleInstall}
              style={{
                padding: '7px 13px', borderRadius: 8, flexShrink: 0,
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                border: 'none', color: '#fff', fontWeight: 700, fontSize: 12.5,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                boxShadow: '0 2px 8px rgba(139,92,246,0.4)',
              }}
            >
              <Download size={13} />
              Yükle
            </button>
          )}

          <button
            onClick={handleDismiss}
            aria-label="Kapat"
            style={{
              background: 'none', border: 'none', color: '#64748b',
              cursor: 'pointer', padding: 4, flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        </motion.div>
      </AnimatePresence>

      {/* iOS Kurulum Rehberi Bottom Sheet */}
      <AnimatePresence>
        {showIOSGuide && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              zIndex: 100000,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
            onClick={() => setShowIOSGuide(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 480,
                backgroundColor: '#0f172a',
                borderTop: '1px solid rgba(139,92,246,0.3)',
                borderRadius: '24px 24px 0 0',
                padding: '24px 20px calc(24px + env(safe-area-inset-bottom)) 20px',
                boxShadow: '0 -10px 40px rgba(0,0,0,0.6)',
              }}
            >
              <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)', margin: '0 auto 18px' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    ✨
                  </div>
                  <div>
                    <h4 style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: 0 }}>iPhone'a YKS Yıldızı'nı Ekle</h4>
                    <p style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>3 Kolay Adımda Uygulama Olarak Çalıştırın</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                {/* 1. Adım */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,130,246,0.15)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Share2 size={16} />
                  </div>
                  <div style={{ flex: 1, fontSize: 13, color: '#e2e8f0', lineHeight: 1.4 }}>
                    <span style={{ fontWeight: 700, color: '#60a5fa' }}>1. Adım:</span> Safari alt çubuğundaki <strong style={{ color: '#fff' }}>Paylaş (📤)</strong> butonuna dokunun.
                  </div>
                </div>

                {/* 2. Adım */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(139,92,246,0.15)', color: '#c4b5fd', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <PlusSquare size={16} />
                  </div>
                  <div style={{ flex: 1, fontSize: 13, color: '#e2e8f0', lineHeight: 1.4 }}>
                    <span style={{ fontWeight: 700, color: '#c4b5fd' }}>2. Adım:</span> Açılan menüden <strong style={{ color: '#fff' }}>"Ana Ekrana Ekle"</strong> seçeneğine tıklayın.
                  </div>
                </div>

                {/* 3. Adım */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckCircle2 size={16} />
                  </div>
                  <div style={{ flex: 1, fontSize: 13, color: '#e2e8f0', lineHeight: 1.4 }}>
                    <span style={{ fontWeight: 700, color: '#6ee7b7' }}>3. Adım:</span> Sağ üst köşedeki <strong style={{ color: '#fff' }}>"Ekle"</strong> butonuna basın. Artık tam ekran app hazır!
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  triggerHaptic('success');
                  setShowIOSGuide(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Anladım, Teşekkürler! 👍
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
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
          onClick={() => {
            triggerHaptic(isSubscribed ? 'light' : 'success');
            if (isSubscribed) {
              unsubscribe();
            } else {
              subscribe();
            }
          }}
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

// ──────────────────────────────────────────
// Offline Status Floating Banner
// ──────────────────────────────────────────
export function OfflineStatusBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!navigator.onLine) {
      setIsOffline(true);
    }

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {(isOffline || showReconnected) && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 260 }}
          style={{
            position: 'fixed',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 20px',
            borderRadius: '30px',
            background: isOffline
              ? 'rgba(239, 68, 68, 0.95)'
              : 'rgba(16, 185, 129, 0.95)',
            color: '#ffffff',
            boxShadow: isOffline
              ? '0 8px 25px rgba(239, 68, 68, 0.4)'
              : '0 8px 25px rgba(16, 185, 129, 0.4)',
            backdropFilter: 'blur(10px)',
            fontSize: '13px',
            fontWeight: 700,
            pointerEvents: 'none',
          }}
        >
          {isOffline ? (
            <>
              <WifiOff size={16} />
              <span>İnternet bağlantısı kesildi. Çevrimdışı moddasınız.</span>
            </>
          ) : (
            <>
              <Wifi size={16} />
              <span>Yeniden bağlandınız! Veriler eşitleniyor.</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ──────────────────────────────────────────
// Offline Focus Session Sync Toast
// ──────────────────────────────────────────
export function OfflineFocusNotification() {
  const [notification, setNotification] = useState<{
    type: 'saved' | 'synced';
    title: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleSaved = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setNotification({
        type: 'saved',
        title: '💾 Çevrimdışı Kaydedildi',
        message: `${detail.session.durationMin} dk odaklanma oturumu cihazınıza güvenle kaydedildi. İnternete bağlandığınızda otomatik olarak eşitlenecek.`,
      });
      setTimeout(() => setNotification(null), 5000);
    };

    const handleSynced = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setNotification({
        type: 'synced',
        title: '⚡ Odaklanma Verileri Eşitlendi!',
        message: `${detail.syncedCount} adet çevrimdışı oturum (${detail.totalMinutes} dk) veritabanına aktarıldı. Tebrikler! 🎉`,
      });
      setTimeout(() => setNotification(null), 5500);
    };

    window.addEventListener('yks-focus-offline-saved', handleSaved);
    window.addEventListener('yks-focus-synced', handleSynced);

    return () => {
      window.removeEventListener('yks-focus-offline-saved', handleSaved);
      window.removeEventListener('yks-focus-synced', handleSynced);
    };
  }, []);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          style={{
            position: 'fixed',
            bottom: 'calc(75px + env(safe-area-inset-bottom, 16px))',
            right: '20px',
            maxWidth: '380px',
            width: 'calc(100% - 40px)',
            zIndex: 999999,
            padding: '14px 18px',
            borderRadius: '16px',
            background: notification.type === 'saved'
              ? 'linear-gradient(135deg, rgba(30, 27, 75, 0.97), rgba(15, 23, 42, 0.97))'
              : 'linear-gradient(135deg, rgba(6, 78, 59, 0.97), rgba(15, 23, 42, 0.97))',
            border: notification.type === 'saved'
              ? '1px solid rgba(139, 92, 246, 0.45)'
              : '1px solid rgba(16, 185, 129, 0.45)',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(16px)',
            color: '#fff',
          }}
        >
          <div style={{
            fontWeight: 800, fontSize: '14px', marginBottom: '4px',
            color: notification.type === 'saved' ? '#c4b5fd' : '#6ee7b7'
          }}>
            {notification.title}
          </div>
          <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.45 }}>
            {notification.message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


