'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Maximize, Minimize, Loader2, ExternalLink } from 'lucide-react';

interface SimulationViewerProps {
  url: string;
  title: string;
}

export default function SimulationViewer({ url, title }: SimulationViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: '#0b0f19',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: isFullscreen ? '0' : '16px',
        aspectRatio: isFullscreen ? 'auto' : '16/9',
        height: isFullscreen ? '100vh' : 'auto',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
      }}
    >
      {/* Üst Bar */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '48px',
        backgroundColor: 'rgba(18,24,43,0.9)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 10,
        backdropFilter: 'blur(8px)'
      }}>
        <h3 style={{ color: 'white', fontWeight: 600, fontSize: '14px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#9ca3af', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="Yeni Sekmede Aç"
          >
            <ExternalLink size={18} />
          </a>
          <button 
            onClick={toggleFullscreen}
            style={{ background: 'none', border: 'none', color: '#9ca3af', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title={isFullscreen ? "Tam Ekrandan Çık" : "Tam Ekran"}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>

      {/* Yükleniyor (Skeleton Loader) Ekranı */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0b0f19',
          zIndex: 0
        }}>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            <Loader2 size={40} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </div>
          <p style={{ color: '#9ca3af', fontSize: '14px', fontWeight: 500 }}>PhET Simülasyonu Yükleniyor...</p>
        </div>
      )}

      {/* Iframe */}
      <iframe
        src={url}
        title={title}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        style={{ width: '100%', height: '100%', border: 'none', paddingTop: '48px', boxSizing: 'border-box' }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      />
    </div>
  );
}
