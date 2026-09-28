"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, BookOpen, Music } from 'lucide-react';
import FocusBeats from '@/components/FocusBeats';
import { triggerHaptic } from '@/lib/haptics';

type Mode = 'pomodoro' | 'shortBreak' | 'longBreak';

export default function PomodoroPage() {
  const [mode, setMode] = useState<Mode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  
  // Custom durations
  const [customTimes, setCustomTimes] = useState({
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  });

  // Audio toggle for ambiance (visual only for now, could embed an iframe)
  const [musicPlaying, setMusicPlaying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (mode === 'pomodoro') setSessionCount(c => c + 1);
      setIsActive(false);
      // alert or play sound here
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(customTimes[mode]);
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(customTimes[newMode]);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const total = customTimes[mode];
    return ((total - timeLeft) / total) * 100;
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(1rem, 4vw, 2rem)' }}>
      
      {/* Background ambient effect */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1, background: `radial-gradient(circle at center, ${mode === 'pomodoro' ? 'rgba(239,68,68,0.1)' : mode === 'shortBreak' ? 'rgba(16,185,129,0.1)' : 'rgba(56,189,248,0.1)'} 0%, transparent 70%)`, transition: 'background 1s ease' }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="premium-card"
        style={{ 
          width: '100%', 
          maxWidth: '500px', 
          padding: 'clamp(1.5rem, 5vw, 3rem)', 
          textAlign: 'center',
          backdropFilter: 'blur(20px)',
          background: 'rgba(15, 16, 21, 0.7)',
          border: `1px solid ${mode === 'pomodoro' ? 'rgba(239,68,68,0.2)' : mode === 'shortBreak' ? 'rgba(16,185,129,0.2)' : 'rgba(56,189,248,0.2)'}`
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          <button 
            onClick={() => { triggerHaptic('light'); switchMode('pomodoro'); }}
            className="btn-interactive"
            style={{ 
              background: mode === 'pomodoro' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
              color: mode === 'pomodoro' ? '#ef4444' : 'var(--text-secondary)',
              padding: '0.5rem 0.85rem',
              fontSize: '0.9rem'
            }}
          >
            <BookOpen size={16} style={{ marginRight: '6px' }} /> Odak
          </button>
          <button 
            onClick={() => { triggerHaptic('light'); switchMode('shortBreak'); }}
            className="btn-interactive"
            style={{ 
              background: mode === 'shortBreak' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: mode === 'shortBreak' ? '#10b981' : 'var(--text-secondary)',
              padding: '0.5rem 0.85rem',
              fontSize: '0.9rem'
            }}
          >
            <Coffee size={16} style={{ marginRight: '6px' }} /> Kısa Mola
          </button>
          <button 
            onClick={() => { triggerHaptic('light'); switchMode('longBreak'); }}
            className="btn-interactive"
            style={{ 
              background: mode === 'longBreak' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: mode === 'longBreak' ? '#38bdf8' : 'var(--text-secondary)',
              padding: '0.5rem 0.85rem',
              fontSize: '0.9rem'
            }}
          >
            <Coffee size={16} style={{ marginRight: '6px' }} /> Uzun Mola
          </button>
        </div>

        {/* Circular Progress & Timer */}
        <div style={{ position: 'relative', width: '240px', height: '240px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            <circle cx="120" cy="120" r="110" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
            <motion.circle 
              cx="120" 
              cy="120" 
              r="110" 
              stroke={mode === 'pomodoro' ? '#ef4444' : mode === 'shortBreak' ? '#10b981' : '#38bdf8'} 
              strokeWidth="8" 
              fill="none" 
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 110}
              strokeDashoffset={2 * Math.PI * 110 * (1 - getProgress() / 100)}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div style={{ 
            fontSize: 'clamp(2.8rem, 11vw, 3.8rem)', 
            fontWeight: 800, 
            fontFamily: 'var(--font-display)',
            color: '#fff',
            textShadow: `0 0 20px ${mode === 'pomodoro' ? 'rgba(239,68,68,0.5)' : mode === 'shortBreak' ? 'rgba(16,185,129,0.5)' : 'rgba(56,189,248,0.5)'}`
          }}>
            {formatTime(timeLeft)}
          </div>
        </div>

        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', gap: '1.25rem', alignItems: 'center' }}>
          <button 
            onClick={() => { triggerHaptic('medium'); toggleTimer(); }}
            style={{ 
              width: '64px', height: '64px', borderRadius: '50%', 
              background: mode === 'pomodoro' ? '#ef4444' : mode === 'shortBreak' ? '#10b981' : '#38bdf8',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
              touchAction: 'manipulation'
            }}
            className="hover-scale"
          >
            {isActive ? <Pause size={30} fill="currentColor" /> : <Play size={30} fill="currentColor" style={{ marginLeft: '4px' }} />}
          </button>
          <button 
            onClick={() => { triggerHaptic('warning'); resetTimer(); }}
            style={{ 
              width: '46px', height: '46px', borderRadius: '50%', 
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', touchAction: 'manipulation'
            }}
            className="hover-scale"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        {!isActive && mode === 'pomodoro' && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
            {[15, 25, 45, 60].map(mins => (
              <button
                key={mins}
                onClick={() => {
                  const seconds = mins * 60;
                  setCustomTimes(prev => ({ ...prev, pomodoro: seconds }));
                  setTimeLeft(seconds);
                }}
                style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: customTimes.pomodoro === mins * 60 ? 'rgba(239, 68, 68, 0.2)' : 'transparent', color: customTimes.pomodoro === mins * 60 ? '#ef4444' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.875rem' }}
              >
                {mins} dk
              </button>
            ))}
          </div>
        )}
      </motion.div>

      <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%', maxWidth: '500px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <BookOpen size={18} />
          <span>Tamamlanan: <strong style={{ color: '#fff' }}>{sessionCount}</strong></span>
        </div>
        <FocusBeats />
      </div>

      <style jsx>{`
        .hover-scale { transition: transform 0.2s; }
        .hover-scale:hover { transform: scale(1.05) translateY(-2px); }
        .hover-scale:active { transform: scale(0.95) translateY(2px); }
      `}</style>
    </div>
  );
}
