'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, X, Zap, CheckCircle2 } from 'lucide-react';
import { useTimer } from '@/context/TimerContext';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function GlobalTimerWidget() {
  const timer = useTimer();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // If the user is on the Focus Tab (/dashboard?tab=focus), hide the global widget
  const isFocusTab = pathname === '/dashboard' && searchParams.get('tab') === 'focus';
  
  // Show widget if timer is active or paused (has started) but we aren't on focus tab
  const showWidget = (timer.isRunning || timer.timeLeft < timer.totalSec) && !isFocusTab;

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m.toString().padStart(2, '0')}:${rs.toString().padStart(2, '0')}`;
  };

  const modeColor = timer.mode === 'pomodoro' ? '#8b5cf6' : timer.mode === 'shortBreak' ? '#38bdf8' : '#10b981';

  return (
    <AnimatePresence>
      {showWidget && (
        <motion.div
          className="global-timer-widget"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: '#131827',
            padding: '10px 16px',
            borderRadius: '100px',
            border: `1px solid ${modeColor}40`,
            boxShadow: `0 10px 25px ${modeColor}20`,
            color: '#fff',
            textDecoration: 'none'
          }}
        >
          <Link
            href="/dashboard?tab=focus"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('yks:navigate-tab', { detail: 'focus' }));
              }
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#fff' }}
          >
            <div style={{ position: 'relative', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={14} style={{ color: modeColor, zIndex: 2 }} />
              <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                <circle cx="50" cy="50" r="45" fill="none" stroke={modeColor} strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 45}
                  strokeDashoffset={(2 * Math.PI * 45) * (1 - ((timer.totalSec - timer.timeLeft) / timer.totalSec))}
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                {fmt(timer.timeLeft)}
              </span>
              <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600 }}>
                {timer.mode === 'pomodoro' ? 'Odak' : 'Ara'}
              </span>
            </div>
          </Link>
          
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

          <button
            onClick={timer.toggle}
            aria-label={timer.isRunning ? 'Durdur' : 'Başlat'}
            style={{
              width: '38px', height: '38px', borderRadius: '50%', background: modeColor,
              color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              touchAction: 'manipulation'
            }}
          >
            {timer.isRunning ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" style={{ marginLeft: '2px' }} />}
          </button>

          {timer.mode === 'pomodoro' && (
            <button
              onClick={timer.finishSession}
              title="Oturumu Bitir & Ders/Konu Kaydet"
              aria-label="Oturumu Bitir"
              style={{
                width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.25)',
                color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                touchAction: 'manipulation'
              }}
            >
              <CheckCircle2 size={18} />
            </button>
          )}

          <button
            onClick={timer.reset}
            aria-label="Sıfırla"
            style={{
              width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
              color: '#9ca3af', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              touchAction: 'manipulation'
            }}
          >
            <X size={18} />
          </button>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
