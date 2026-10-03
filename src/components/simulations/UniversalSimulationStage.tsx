'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Maximize, Minimize, Loader2, ExternalLink, ArrowLeft, AlertTriangle } from 'lucide-react';
import { getPhetUrl, type PhetSim } from '@/lib/phet-registry';

interface Props {
  sim: PhetSim;
  onBack?: () => void;
}

export default function UniversalSimulationStage({ sim, onBack }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isMobileLandscapeWarning, setIsMobileLandscapeWarning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const phetUrl = getPhetUrl(sim.phet_id, sim.has_turkish);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Tam ekran hatası: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Mobil uyarısı: dikey modda küçük ekran
  useEffect(() => {
    const checkOrientation = () => {
      const isMobile = window.innerWidth < 768;
      const isPortrait = window.innerHeight > window.innerWidth;
      setIsMobileLandscapeWarning(isMobile && isPortrait);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  const categoryColor: Record<string, string> = {
    TYT: '#10b981',
    AYT: '#8b5cf6',
    'TYT/AYT': '#f59e0b',
  };

  const subjectEmoji: Record<string, string> = {
    Fizik: '⚡',
    Kimya: '🧪',
    Biyoloji: '🧬',
    Matematik: '📐',
    Genel: '🔬',
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#080c14',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: isFullscreen ? '0' : '16px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
      }}
    >
      {/* Üst Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: '56px', minHeight: '56px',
        backgroundColor: '#0f172a',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{ padding: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', cursor: 'pointer', display: 'flex' }}
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <span style={{ fontSize: '18px' }}>{subjectEmoji[sim.subject] || '🔬'}</span>
          <div>
            <h3 style={{ color: 'white', fontWeight: 700, fontSize: '15px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
              {sim.title_tr}
            </h3>
            <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: categoryColor[sim.category] || '#fff', background: `${categoryColor[sim.category]}20`, padding: '1px 6px', borderRadius: '4px' }}>
                {sim.category}
              </span>
              <span style={{ fontSize: '10px', color: '#64748b' }}>{sim.subject} • {sim.topic}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {!sim.has_turkish && (
            <span style={{ fontSize: '11px', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(245,158,11,0.2)' }}>
              🌐 İngilizce
            </span>
          )}
          <a
            href={phetUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#9ca3af', padding: '6px', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            title="Yeni Sekmede Aç"
          >
            <ExternalLink size={16} />
          </a>
          <button
            onClick={toggleFullscreen}
            style={{ background: 'none', border: 'none', color: '#9ca3af', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </div>

      {/* Mobil Uyarısı */}
      {isMobileLandscapeWarning && (
        <div style={{ padding: '8px 16px', background: 'rgba(245,158,11,0.1)', borderBottom: '1px solid rgba(245,158,11,0.2)', color: '#fcd34d', fontSize: '12px', textAlign: 'center' }}>
          📱 Daha iyi deneyim için telefonunuzu yatay tutun veya tam ekran modunu kullanın.
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div style={{
          position: 'absolute', inset: 0, top: '56px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          backgroundColor: '#0b0f19', zIndex: 5,
        }}>
          <div style={{ marginBottom: '20px', position: 'relative' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.3))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Loader2 size={32} color="#8b5cf6" style={{ animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '15px', fontWeight: 600, margin: 0 }}>Simülasyon Yükleniyor...</p>
          <p style={{ color: '#475569', fontSize: '12px', margin: '6px 0 0' }}>PhET Interactive Simulations • {sim.subject}</p>
        </div>
      )}

      {/* Hata Durumu */}
      {loadError && (
        <div style={{
          position: 'absolute', inset: 0, top: '56px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          backgroundColor: '#0b0f19', zIndex: 5, padding: '32px',
        }}>
          <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
          <p style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: 700, margin: '0 0 8px' }}>Simülasyon Yüklenemedi</p>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 16px', textAlign: 'center' }}>Bağlantınızı kontrol edin veya simülasyonu yeni sekmede açmayı deneyin.</p>
          <a
            href={phetUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: '10px 20px', background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: '10px', color: '#c4b5fd', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}
          >
            Yeni Sekmede Aç ↗
          </a>
        </div>
      )}

      {/* iframe */}
      <iframe
        src={phetUrl}
        title={sim.title_tr}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={() => { setIsLoading(false); setLoadError(true); }}
        style={{ flex: 1, width: '100%', border: 'none' }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
      />
    </div>
  );
}
