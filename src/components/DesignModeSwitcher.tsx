'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Layers, Check } from 'lucide-react';

interface DesignModeSwitcherProps {
  variant?: 'compact' | 'cards' | 'pill' | 'sidebar';
  showLabel?: boolean;
  className?: string;
  onModeChange?: (mode: 'lumina' | 'classic') => void;
}

export default function DesignModeSwitcher({
  variant = 'compact',
  showLabel = true,
  className = '',
  onModeChange,
}: DesignModeSwitcherProps) {
  const [mode, setMode] = useState<'lumina' | 'classic'>('lumina');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('yks_design_mode');
    const initialMode = saved === 'classic' ? 'classic' : 'lumina';
    setMode(initialMode);

    const handleModeChange = (e: CustomEvent) => {
      const newMode = e.detail === 'classic' ? 'classic' : 'lumina';
      setMode(newMode);
    };

    window.addEventListener('designModeChanged' as any, handleModeChange);
    return () => {
      window.removeEventListener('designModeChanged' as any, handleModeChange);
    };
  }, []);

  const switchMode = (newMode: 'lumina' | 'classic') => {
    setMode(newMode);
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-design-mode', newMode);
      localStorage.setItem('yks_design_mode', newMode);
      window.dispatchEvent(new CustomEvent('designModeChanged', { detail: newMode }));
      if (onModeChange) onModeChange(newMode);
    }
  };

  const toggleMode = () => {
    switchMode(mode === 'lumina' ? 'classic' : 'lumina');
  };

  if (!mounted) {
    // Avoid hydration mismatch
    return null;
  }

  // 1. CARDS VARIANT (For Settings page or full selection modal)
  if (variant === 'cards') {
    return (
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}
      >
        {/* Lumina Studio Option */}
        <button
          type="button"
          onClick={() => switchMode('lumina')}
          style={{
            padding: '1.25rem',
            borderRadius: '16px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            background:
              mode === 'lumina'
                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.08) 100%)'
                : 'rgba(255, 255, 255, 0.02)',
            border:
              mode === 'lumina'
                ? '2px solid rgba(99, 102, 241, 0.75)'
                : '1px solid rgba(255, 255, 255, 0.09)',
            boxShadow:
              mode === 'lumina'
                ? '0 12px 32px -4px rgba(99, 102, 241, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                : 'none',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {mode === 'lumina' && (
            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '9999px',
                background: 'rgba(99, 102, 241, 0.2)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                color: '#818cf8',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              <Check size={12} />
              <span>Aktif</span>
            </div>
          )}

          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              marginBottom: '12px',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Sparkles size={20} />
          </div>

          <div
            style={{
              fontWeight: 800,
              fontSize: '1.05rem',
              color: mode === 'lumina' ? '#c7d2fe' : '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            Lumina Studio
            <span
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '6px',
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                color: '#fff',
                fontWeight: 800,
                letterSpacing: '0.04em',
              }}
            >
              ULTRA-PREMIUM
            </span>
          </div>

          <p
            style={{
              fontSize: '0.82rem',
              color: '#94a3b8',
              marginTop: '6px',
              lineHeight: 1.45,
            }}
          >
            Liquid glass paneller, kozmik obsidian derinliği, bento ızgara mimarisi ve mikro etkileşimler ile piyasa üstü Linear ve Apple VisionOS standardı.
          </p>
        </button>

        {/* Klasik Mod Option */}
        <button
          type="button"
          onClick={() => switchMode('classic')}
          style={{
            padding: '1.25rem',
            borderRadius: '16px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            background:
              mode === 'classic'
                ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(30, 41, 59, 0.15) 100%)'
                : 'rgba(255, 255, 255, 0.02)',
            border:
              mode === 'classic'
                ? '2px solid rgba(56, 189, 248, 0.65)'
                : '1px solid rgba(255, 255, 255, 0.09)',
            boxShadow:
              mode === 'classic'
                ? '0 12px 32px -4px rgba(56, 189, 248, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                : 'none',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {mode === 'classic' && (
            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '9999px',
                background: 'rgba(56, 189, 248, 0.2)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                color: '#38bdf8',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              <Check size={12} />
              <span>Aktif</span>
            </div>
          )}

          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
              marginBottom: '12px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <Layers size={20} />
          </div>

          <div
            style={{
              fontWeight: 800,
              fontSize: '1.05rem',
              color: mode === 'classic' ? '#38bdf8' : '#f8fafc',
            }}
          >
            Klasik Mod
          </div>

          <p
            style={{
              fontSize: '0.82rem',
              color: '#94a3b8',
              marginTop: '6px',
              lineHeight: 1.45,
            }}
          >
            YKS Yıldızı&apos;nın orijinal, sade ve yüksek kontrastlı klasik tasarımı. Alışıldık düzeni korur.
          </p>
        </button>
      </div>
    );
  }

  // 2. SIDEBAR VARIANT (Sleek horizontal toggle pill for the sidebar footer)
  if (variant === 'sidebar') {
    const isLumina = mode === 'lumina';
    return (
      <button
        type="button"
        onClick={toggleMode}
        title={isLumina ? 'Klasik Tasarım Moduna Geç' : 'Lumina Studio (Ultra-Premium) Moduna Geç'}
        aria-label="Tasarım Modu Değiştirici"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          borderRadius: '10px',
          background: isLumina
            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)'
            : 'rgba(255, 255, 255, 0.03)',
          border: isLumina
            ? '1px solid rgba(99, 102, 241, 0.35)'
            : '1px solid rgba(255, 255, 255, 0.08)',
          cursor: 'pointer',
          color: '#cbd5e1',
          fontSize: '12px',
          fontWeight: 600,
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          outline: 'none',
          boxShadow: isLumina ? '0 2px 10px rgba(99, 102, 241, 0.15)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '6px',
              background: isLumina
                ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                : 'rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isLumina ? '#fff' : '#94a3b8',
              fontSize: '11px',
              flexShrink: 0,
            }}
          >
            {isLumina ? <Sparkles size={13} /> : <Layers size={13} />}
          </div>
          <span style={{ color: isLumina ? '#e0e7ff' : '#94a3b8', letterSpacing: '-0.01em' }}>
            {isLumina ? 'Lumina Studio' : 'Klasik Mod'}
          </span>
        </div>

        {/* Switch track / indicator */}
        <div
          style={{
            width: '32px',
            height: '18px',
            borderRadius: '9999px',
            background: isLumina ? '#6366f1' : 'rgba(255, 255, 255, 0.12)',
            position: 'relative',
            transition: 'background 0.2s ease',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '2px',
              left: isLumina ? '16px' : '2px',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              transition: 'left 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
      </button>
    );
  }

  // 3. COMPACT / PILL VARIANT (For MobileHeader or Topbar)
  const isLumina = mode === 'lumina';
  return (
    <button
      type="button"
      onClick={toggleMode}
      title={isLumina ? 'Klasik Tasarım Moduna Geç' : 'Lumina Studio Moduna Geç'}
      aria-label="Tasarım Modu Değiştirici"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 9px',
        borderRadius: '9999px',
        background: isLumina
          ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(139, 92, 246, 0.12) 100%)'
          : 'rgba(255, 255, 255, 0.05)',
        border: isLumina
          ? '1px solid rgba(99, 102, 241, 0.4)'
          : '1px solid rgba(255, 255, 255, 0.1)',
        cursor: 'pointer',
        color: isLumina ? '#c7d2fe' : '#94a3b8',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '-0.01em',
        transition: 'all 0.2s ease',
        boxShadow: isLumina ? '0 0 12px rgba(99, 102, 241, 0.22)' : 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isLumina ? '#a5b4fc' : '#94a3b8',
        }}
      >
        {isLumina ? <Sparkles size={12} /> : <Layers size={12} />}
      </div>
      {showLabel && <span>{isLumina ? 'Lumina' : 'Klasik'}</span>}
    </button>
  );
}
