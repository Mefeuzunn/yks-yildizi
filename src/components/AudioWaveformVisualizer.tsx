"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Radio, Volume2, Square, Headphones, Sparkles } from 'lucide-react';

export interface AudioWaveformProps {
  isActive: boolean;
  mode?: 'normal' | 'podcast';
  phase?: 'idle' | 'front' | 'gap' | 'back' | 'next';
  onStop?: () => void;
  voiceName?: string;
}

export default function AudioWaveformVisualizer({
  isActive,
  mode = 'normal',
  phase = 'front',
  onStop,
  voiceName = 'Nöral Eğitmen Sesi',
}: AudioWaveformProps) {
  if (!isActive && mode !== 'podcast') return null;

  const barDelays = [0, 0.15, 0.3, 0.45, 0.2, 0.35, 0.1];
  const barHeights = [14, 22, 10, 24, 16, 20, 12];

  const getStatusText = () => {
    if (mode === 'podcast') {
      if (phase === 'front') return '🎙️ Soru Okunuyor';
      if (phase === 'gap') return '⏳ Düşünme Molası (2.5 sn)';
      if (phase === 'back') return '✨ Cevap & İpucu Okunuyor';
      if (phase === 'next') return '⚡ Sonraki Karta Geçiliyor';
      return '🎧 Podcast Aktif';
    }
    return '🎙️ Doğal Stüdyo Sesi Okuyor';
  };

  const getSubText = () => {
    if (mode === 'podcast' && phase === 'gap') {
      return 'Cevabı zihninde canlandır...';
    }
    return `${voiceName} · MEB / ÖSYM Tonlaması`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        width: '100%',
        padding: '10px 16px',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45), 0 0 20px rgba(56, 189, 248, 0.15)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        
        {/* Animated Waveform Equalizer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            height: '24px',
            padding: '0 4px',
            background: 'rgba(0, 0, 0, 0.25)',
            borderRadius: '8px',
          }}
        >
          {barDelays.map((delay, idx) => (
            <motion.span
              key={idx}
              animate={
                isActive
                  ? {
                      height: ['5px', `${barHeights[idx]}px`, '6px'],
                      backgroundColor: ['#38bdf8', '#10b981', '#38bdf8'],
                      boxShadow: [
                        '0 0 4px rgba(56, 189, 248, 0.4)',
                        '0 0 10px rgba(16, 185, 129, 0.7)',
                        '0 0 4px rgba(56, 189, 248, 0.4)',
                      ],
                    }
                  : {
                      height: '4px',
                      backgroundColor: mode === 'podcast' && phase === 'gap' ? '#f59e0b' : '#475569',
                      boxShadow: 'none',
                    }
              }
              transition={{
                duration: 0.55 + (idx % 3) * 0.15,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
                delay,
              }}
              style={{
                width: '3.5px',
                borderRadius: '2px',
                display: 'inline-block',
              }}
            />
          ))}
        </div>

        {/* Text Monitor */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>
              {getStatusText()}
            </span>
            <span
              style={{
                fontSize: '0.65rem',
                padding: '2px 7px',
                borderRadius: '6px',
                background: mode === 'podcast' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                color: mode === 'podcast' ? '#34d399' : '#38bdf8',
                border: mode === 'podcast' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(56, 189, 248, 0.3)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <Sparkles size={10} />
              {mode === 'podcast' ? 'Otomatik Oynatıcı' : 'HD Neural'}
            </span>
          </div>

          <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '1px' }}>
            {getSubText()}
          </span>
        </div>

      </div>

      {/* Stop / Pause Control */}
      {onStop && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStop();
          }}
          className="btn-interactive"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '8px',
            padding: '5px 10px',
            color: '#fca5a5',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <Square size={11} fill="#fca5a5" />
          <span>Durdur</span>
        </button>
      )}
    </motion.div>
  );
}
