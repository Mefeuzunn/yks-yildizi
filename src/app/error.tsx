'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected errors
    console.error('App Error Boundary caught:', error);
  }, [error]);

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
        width: '72px',
        height: '72px',
        borderRadius: '20px',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
        boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)',
      }}>
        <AlertCircle size={36} color="#ef4444" />
      </div>

      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 14px',
        borderRadius: '20px',
        background: 'rgba(239, 68, 68, 0.1)',
        color: '#fca5a5',
        fontSize: '0.8rem',
        fontWeight: 700,
        marginBottom: '0.75rem',
      }}>
        SİSTEM BİLGİSİ
      </div>

      <h1 style={{
        fontSize: '1.75rem',
        fontWeight: 800,
        marginBottom: '0.75rem',
        color: '#ffffff',
      }}>
        Beklenmeyen Bir Hata Oluştu
      </h1>

      <p style={{
        maxWidth: '460px',
        color: '#94a3b8',
        fontSize: '0.95rem',
        lineHeight: 1.6,
        marginBottom: '2rem',
      }}>
        Sayfa yüklenirken geçici bir sorunla karşılaştık. Lütfen sayfayı yenilemeyi deneyin veya ana sayfaya dönün.
      </p>

      {/* Buttons */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        justifyContent: 'center',
      }}>
        <button
          onClick={() => reset()}
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
            transition: 'opacity 0.2s',
          }}
        >
          <RefreshCw size={18} />
          Tekrar Dene
        </button>

        <Link
          href="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 22px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#e2e8f0',
            fontWeight: 600,
            fontSize: '0.9rem',
            textDecoration: 'none',
          }}
        >
          <Home size={18} />
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
