'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Auto-reload after 1.5 seconds when back online
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      textAlign: 'center',
      color: '#f8fafc',
    }}>
      {/* Icon Card */}
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '24px',
        background: isOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.12)',
        border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.25)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
        boxShadow: isOnline ? '0 0 35px rgba(16, 185, 129, 0.3)' : '0 0 35px rgba(239, 68, 68, 0.25)',
        transition: 'all 0.4s ease',
      }}>
        {isOnline ? (
          <RefreshCw size={36} color="#10b981" className="animate-spin" />
        ) : (
          <WifiOff size={36} color="#f87171" />
        )}
      </div>

      {/* Status Pill */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 14px',
        borderRadius: '20px',
        background: isOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.12)',
        color: isOnline ? '#34d399' : '#fbbf24',
        border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.25)'}`,
        fontSize: '0.8rem',
        fontWeight: 700,
        marginBottom: '0.85rem',
      }}>
        {isOnline ? '⚡ Bağlantı Yeniden Sağlandı!' : '📡 Çevrimdışı Mod'}
      </div>

      <h1 style={{
        fontSize: '1.75rem',
        fontWeight: 800,
        marginBottom: '0.75rem',
        color: '#ffffff',
      }}>
        {isOnline ? 'Sayfa Yenileniyor...' : 'İnternet Bağlantısı Bulunamadı'}
      </h1>

      <p style={{
        maxWidth: '460px',
        color: '#94a3b8',
        fontSize: '0.95rem',
        lineHeight: 1.6,
        marginBottom: '2rem',
      }}>
        {isOnline
          ? 'İnternet bağlantınız tespit edildi. Birkaç saniye içinde kaldığınız yere yönlendiriliyorsunuz.'
          : 'Şu anda çevrimdışısınız. Ancak endişelenmeyin! Çevrimdışı Pomodoro sayacını kullanmaya devam edebilir, bağlantı geldiğinde otomatik olarak devam edebilirsiniz.'}
      </p>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        justifyContent: 'center',
        marginBottom: '2.5rem',
      }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
          }}
        >
          <RefreshCw size={18} />
          Yeniden Bağlan
        </button>

        <Link
          href="/dashboard?tab=focus"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#e2e8f0',
            fontWeight: 600,
            fontSize: '0.9rem',
            textDecoration: 'none',
          }}
        >
          <Clock size={18} color="#f59e0b" />
          Pomodoro Sayacına Git
        </Link>
      </div>

      {/* Offline Info Box */}
      <div style={{
        maxWidth: '480px',
        width: '100%',
        padding: '16px 20px',
        borderRadius: '14px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        textAlign: 'left',
        fontSize: '0.85rem',
        color: '#94a3b8',
        lineHeight: 1.5,
      }}>
        <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          💡 İpucu
        </div>
        YKS Yıldızı PWA desteği sayesinde internet bağlantınız kesilse dahi önceden ziyaret ettiğiniz sayfaları görüntülemeye devam edebilirsiniz.
      </div>
    </div>
  );
}
