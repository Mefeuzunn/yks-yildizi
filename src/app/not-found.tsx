import React from 'react';
import Link from 'next/link';
import { Home, Compass, BookOpen, ArrowLeft } from 'lucide-react';

export default function NotFound() {
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
      {/* Glow Effect */}
      <div style={{
        position: 'relative',
        marginBottom: '2rem',
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '220px',
          height: '220px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, rgba(139,92,246,0.15) 50%, transparent 70%)',
          filter: 'blur(30px)',
          zIndex: 0,
        }} />
        <div style={{
          fontSize: '6rem',
          fontWeight: 900,
          letterSpacing: '-0.05em',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          position: 'relative',
          zIndex: 1,
          lineHeight: 1,
        }}>
          404
        </div>
      </div>

      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 16px',
        borderRadius: '30px',
        background: 'rgba(99, 102, 241, 0.12)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        color: '#a5b4fc',
        fontSize: '0.85rem',
        fontWeight: 600,
        marginBottom: '1rem',
      }}>
        <span>🌌</span>
        <span>Yörüngeden Çıktınız</span>
      </div>

      <h1 style={{
        fontSize: '1.85rem',
        fontWeight: 800,
        marginBottom: '0.75rem',
        color: '#ffffff',
      }}>
        Aradığınız Sayfa Bulunamadı
      </h1>

      <p style={{
        maxWidth: '480px',
        color: '#94a3b8',
        fontSize: '0.95rem',
        lineHeight: 1.6,
        marginBottom: '2.5rem',
      }}>
        Gitmek istediğiniz sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
        Endişelenmeyin, YKS maratonunuza aşağıdaki bağlantılardan hemen geri dönebilirsiniz!
      </p>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        justifyContent: 'center',
        maxWidth: '520px',
        width: '100%',
      }}>
        <Link
          href="/dashboard"
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
            textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
            transition: 'transform 0.15s ease',
          }}
        >
          <Home size={18} />
          Ana Sayfaya Dön
        </Link>

        <Link
          href="/soru-coz"
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
            transition: 'background 0.15s ease',
          }}
        >
          <BookOpen size={18} color="#38bdf8" />
          Soru Çöz
        </Link>

        <Link
          href="/denemeler"
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
            transition: 'background 0.15s ease',
          }}
        >
          <Compass size={18} color="#f59e0b" />
          Denemelerim
        </Link>
      </div>
    </div>
  );
}
