'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, X, Zap } from 'lucide-react';
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
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
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
          {/* Progress circle small */}
          <Link href="/dashboard?tab=focus" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#fff' }}>
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
            style={{
              width: '32px', height: '32px', borderRadius: '50%', background: modeColor,
              color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}
          >
            {timer.isRunning ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" style={{ marginLeft: '2px' }} />}
          </button>

          <button
            onClick={timer.reset}
            style={{
              width: '28px', height: '28px', borderRadius: '50%', background: 'transparent',
              color: '#9ca3af', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
