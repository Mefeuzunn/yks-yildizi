'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Flame, Zap, Timer, Sparkles, CheckCircle2, Play, Pause, RotateCcw, ArrowRight, Smartphone } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { usePushNotifications } from '@/components/PWAComponents';
import { useTimer } from '@/context/TimerContext';
import { getYksTargetDate, calculateYksCountdown } from '@/lib/yks-countdown';

interface MobileLiveActivityWidgetProps {
  streak?: number;
  solvedQuestions?: number;
  dailyGoal?: number;
}

export default function MobileLiveActivityWidget({
  streak = 1,
  solvedQuestions = 0,
  dailyGoal = 40,
}: MobileLiveActivityWidgetProps) {
  const timer = useTimer();
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 260, hours: 0, minutes: 0, seconds: 0 });

  const { permission, subscription, isSubscribing, subscribe } = usePushNotifications();
  const isSubscribed = !!subscription && permission === 'granted';

  // Live countdown to YKS (Dynamic target)
  useEffect(() => {
    const targetDate = getYksTargetDate();

    const updateTimer = () => {
      const { days, hours, minutes, seconds } = calculateYksCountdown(targetDate);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const progressPercent = Math.min(100, Math.round((solvedQuestions / Math.max(1, dailyGoal)) * 100));

  // Focus Timer active status
  const isFocusActive = timer.isRunning || (timer.timeLeft < timer.totalSec && timer.timeLeft > 0);
  const focusMinutes = Math.floor(timer.timeLeft / 60);
  const focusSeconds = timer.timeLeft % 60;
  const formattedFocusTime = `${focusMinutes.toString().padStart(2, '0')}:${focusSeconds.toString().padStart(2, '0')}`;
  const focusProgressPercent = Math.min(
    100,
    Math.round(((timer.totalSec - timer.timeLeft) / Math.max(1, timer.totalSec)) * 100)
  );

  const navigateToFocus = () => {
    triggerHaptic('light');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('yks:navigate-tab', { detail: 'focus' }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="mobile-live-activity"
      style={{
        background: isFocusActive
          ? 'linear-gradient(135deg, rgba(24, 18, 43, 0.95), rgba(15, 23, 42, 0.95))'
          : 'linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(15, 23, 42, 0.95))',
        border: isFocusActive ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(139, 92, 246, 0.25)',
        borderRadius: 20,
        padding: '16px 18px',
        marginBottom: '20px',
        boxShadow: isFocusActive
          ? '0 10px 32px rgba(139, 92, 246, 0.2), 0 0 0 1px rgba(168, 85, 247, 0.15)'
          : '0 8px 30px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(139, 92, 246, 0.1)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Dynamic Background Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: isFocusActive
            ? 'radial-gradient(circle, rgba(168, 85, 247, 0.35), transparent 70%)'
            : 'radial-gradient(circle, rgba(139, 92, 246, 0.25), transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Header: Live Activity Dynamic Pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: isFocusActive ? 'rgba(168, 85, 247, 0.2)' : 'rgba(239, 68, 68, 0.15)',
              border: isFocusActive ? '1px solid rgba(168, 85, 247, 0.45)' : '1px solid rgba(239, 68, 68, 0.35)',
              color: isFocusActive ? '#c084fc' : '#f87171',
              padding: '3px 8px',
              borderRadius: 20,
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: isFocusActive ? (timer.isRunning ? '#a855f7' : '#eab308') : '#ef4444',
                boxShadow: isFocusActive
                  ? (timer.isRunning ? '0 0 8px #a855f7' : '0 0 8px #eab308')
                  : '0 0 8px #ef4444',
                animation: timer.isRunning ? 'pulse 1.4s infinite' : 'none',
              }}
            />
            {isFocusActive
              ? (timer.isRunning ? '🍅 CANLI ODAK AKTİF' : '⏸️ ODAK DURAKLATILDI')
              : 'CANLI AKTİVİTE'}
          </span>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              color: '#fbbf24',
              padding: '3px 8px',
              borderRadius: 20,
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            <Flame size={12} color="#f59e0b" />
            {streak} Gün Seri
          </span>
        </div>

        {/* Bildirim Butonu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {!isSubscribed && permission !== 'denied' && (
            <button
              onClick={() => {
                triggerHaptic('light');
                subscribe();
              }}
              disabled={isSubscribing}
              style={{
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.35)',
                borderRadius: 16,
                padding: '3px 9px',
                color: '#c4b5fd',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Bell size={11} />
              {isSubscribing ? 'İzin...' : 'Bildirim'}
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Content Area: Focus Session Active vs Exam Countdown */}
      {isFocusActive ? (
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: 14,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 900,
                  color: '#e9d5ff',
                  lineHeight: 1.1,
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '0.02em',
                }}
              >
                {formattedFocusTime}
              </div>
              <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: 4, fontWeight: 500 }}>
                {timer.selectedSubject ? `📚 ${timer.selectedSubject}` : '🎯 Odaklanma Seansı'}
                {timer.selectedTopic ? ` · ${timer.selectedTopic}` : ''}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  timer.toggle();
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: timer.isRunning ? 'rgba(234, 179, 8, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  border: timer.isRunning ? '1px solid rgba(234, 179, 8, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
                  color: timer.isRunning ? '#fde047' : '#6ee7b7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                {timer.isRunning ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: 2 }} />}
              </button>

              <button
                onClick={() => {
                  triggerHaptic('light');
                  timer.reset();
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={15} />
              </button>

              <Link
                href="/dashboard?tab=focus"
                onClick={navigateToFocus}
                style={{
                  padding: '6px 10px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
                }}
              >
                Aç <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Focus Session Progress Bar */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#a78bfa',
                marginBottom: 4,
                fontWeight: 600,
              }}
            >
              <span>Oturum İlerlemesi</span>
              <span>%{focusProgressPercent}</span>
            </div>
            <div
              style={{
                width: '100%',
                height: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: 3,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${focusProgressPercent}%`,
                  background: 'linear-gradient(90deg, #8b5cf6, #d946ef)',
                  borderRadius: 3,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Main Countdown Digits Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 8,
              marginBottom: 14,
            }}
          >
            {/* Gün */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(167, 139, 250, 0.25)',
                borderRadius: 12,
                padding: '8px 4px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  color: '#c4b5fd',
                  lineHeight: 1.1,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {timeLeft.days}
              </div>
              <div
                style={{
                  fontSize: '9.5px',
                  color: '#94a3b8',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  marginTop: 2,
                }}
              >
                GÜN
              </div>
            </div>

            {/* Saat */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                borderRadius: 12,
                padding: '8px 4px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  color: '#86efac',
                  lineHeight: 1.1,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {timeLeft.hours.toString().padStart(2, '0')}
              </div>
              <div
                style={{
                  fontSize: '9.5px',
                  color: '#94a3b8',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  marginTop: 2,
                }}
              >
                SAAT
              </div>
            </div>

            {/* Dakika */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(234, 179, 8, 0.25)',
                borderRadius: 12,
                padding: '8px 4px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  color: '#fde047',
                  lineHeight: 1.1,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {timeLeft.minutes.toString().padStart(2, '0')}
              </div>
              <div
                style={{
                  fontSize: '9.5px',
                  color: '#94a3b8',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  marginTop: 2,
                }}
              >
                DAKİKA
              </div>
            </div>

            {/* Saniye */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 12,
                padding: '8px 4px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  color: '#fca5a5',
                  lineHeight: 1.1,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {timeLeft.seconds.toString().padStart(2, '0')}
              </div>
              <div
                style={{
                  fontSize: '9.5px',
                  color: '#94a3b8',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  marginTop: 2,
                }}
              >
                SANİYE
              </div>
            </div>
          </div>

          {/* Daily Target Progress Bar */}
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px',
                color: '#94a3b8',
                marginBottom: 6,
              }}
            >
              <span>🎯 Günlük Soru Hedefi</span>
              <span style={{ fontWeight: 700, color: '#f1f5f9' }}>
                {solvedQuestions} / {dailyGoal} Soru ({progressPercent}%)
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                borderRadius: 3,
                overflow: 'hidden',
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  background:
                    progressPercent >= 100
                      ? 'linear-gradient(90deg, #10b981, #059669)'
                      : 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                  borderRadius: 3,
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* Quick Action Buttons Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 8,
        }}
      >
        <Link
          href="/soru-coz"
          onClick={() => triggerHaptic('light')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            padding: '8px 4px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(99, 102, 241, 0.15))',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            borderRadius: 10,
            color: '#c4b5fd',
            fontSize: '11.5px',
            fontWeight: 700,
            textDecoration: 'none',
            textAlign: 'center',
          }}
        >
          <Zap size={13} color="#a78bfa" />
          Soru Çöz
        </Link>

        <Link
          href="/dashboard?tab=focus"
          onClick={navigateToFocus}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            padding: '8px 4px',
            background: isFocusActive
              ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(239, 68, 68, 0.2))'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(245, 158, 11, 0.1))',
            border: isFocusActive ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 10,
            color: isFocusActive ? '#e9d5ff' : '#fca5a5',
            fontSize: '11.5px',
            fontWeight: 700,
            textDecoration: 'none',
            textAlign: 'center',
          }}
        >
          <Timer size={13} color={isFocusActive ? '#c084fc' : '#f87171'} />
          {isFocusActive ? 'Sayaca Git' : 'Odaklan'}
        </Link>

        <Link
          href="/simulasyonlar"
          onClick={() => triggerHaptic('light')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            padding: '8px 4px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.1))',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 10,
            color: '#6ee7b7',
            fontSize: '11.5px',
            fontWeight: 700,
            textDecoration: 'none',
            textAlign: 'center',
          }}
        >
          <Sparkles size={13} color="#34d399" />
          Deneyler
        </Link>
      </div>

    </motion.div>
  );
}
