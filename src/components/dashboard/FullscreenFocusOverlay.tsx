'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Minimize,
  CheckCircle2,
  CloudRain,
  Wind,
  Waves,
  Coffee,
  TreePine,
  Music,
  SkipForward,
  Sparkles,
  BookOpen,
  Clock,
  Zap,
} from 'lucide-react';
import { useTimer, MODE_CONFIG, Mode } from '@/context/TimerContext';
import { triggerHaptic } from '@/lib/haptics';

const AMBIENT_SOUNDS = [
  { id: 'rain', label: 'Yağmur', icon: CloudRain, color: '#38bdf8', url: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg' },
  { id: 'wind', label: 'Rüzgar', icon: Wind, color: '#a78bfa', url: 'https://actions.google.com/sounds/v1/weather/strong_wind.ogg' },
  { id: 'waves', label: 'Dalga', icon: Waves, color: '#06b6d4', url: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg' },
  { id: 'cafe', label: 'Kafe', icon: Coffee, color: '#f59e0b', url: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg' },
  { id: 'forest', label: 'Orman', icon: TreePine, color: '#10b981', url: 'https://actions.google.com/sounds/v1/ambiences/outdoor_summer_ambience.ogg' },
  { id: 'lofi', label: 'Lofi', icon: Music, color: '#ec4899', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3' },
];

const MOTIVATIONAL_QUOTES = [
  "Başarı, her gün tekrarlanan küçük çabaların toplamıdır.",
  "Bugün yapacağın fedakarlıklar, yarının zaferleridir.",
  "Zorluklar, sıradan insanları sıradışı bir kadere hazırlar.",
  "En büyük rakibin, dünkü kendindir.",
  "Vazgeçme, başlangıç her zaman en zorudur.",
  "Hedefin dağın zirvesiyse, patikadaki taşlara takılma.",
  "Disiplin, ne istediğinle şu an ne istediğin arasındaki seçimdir.",
  "Gelecek, bugünden hazırlananlara aittir.",
];

interface FullscreenFocusOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

type OrientationMode = 'desktop' | 'mobile-portrait' | 'mobile-landscape';

export default function FullscreenFocusOverlay({ isOpen, onClose }: FullscreenFocusOverlayProps) {
  const timer = useTimer();
  const {
    mode,
    timeLeft,
    totalSec,
    isRunning,
    pomodoroCount,
    selectedSubject,
    selectedTopic,
    activeSound,
    volume,
    toggle,
    reset,
    skip,
    switchMode,
    playSound,
    stopSound,
    setVolume,
    finishSession,
  } = timer;

  const cfg = MODE_CONFIG[mode] || MODE_CONFIG.pomodoro;
  const progress = Math.min(100, Math.max(0, ((totalSec - timeLeft) / totalSec) * 100));

  const [orientationMode, setOrientationMode] = useState<OrientationMode>(() => {
    if (typeof window === 'undefined') return 'desktop';
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (w >= 1024) return 'desktop';
    if (w > h) return 'mobile-landscape';
    return 'mobile-portrait';
  });
  const [quote] = useState(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  const [showSoundsMenu, setShowSoundsMenu] = useState(false);

  // SVG Circle Parameters
  const R_DESKTOP = 135;
  const CIRC_DESKTOP = 2 * Math.PI * R_DESKTOP;
  const dashOffsetDesktop = CIRC_DESKTOP - (CIRC_DESKTOP * progress) / 100;

  const R_MOBILE = 110;
  const CIRC_MOBILE = 2 * Math.PI * R_MOBILE;
  const dashOffsetMobile = CIRC_MOBILE - (CIRC_MOBILE * progress) / 100;

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m.toString().padStart(2, '0')}:${rs.toString().padStart(2, '0')}`;
  };

  // 1. Orientation & Viewport Detection
  useEffect(() => {
    const updateLayout = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isLandscape = w > h;

      if (w >= 1024) {
        setOrientationMode('desktop');
      } else if (isLandscape) {
        setOrientationMode('mobile-landscape');
      } else {
        setOrientationMode('mobile-portrait');
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    window.addEventListener('orientationchange', updateLayout);
    return () => {
      window.removeEventListener('resize', updateLayout);
      window.removeEventListener('orientationchange', updateLayout);
    };
  }, []);

  // 2. Fullscreen API Entegrasyonu (Tarayıcı Tam Ekranı)
  useEffect(() => {
    if (!isOpen) return;

    // Tarayıcı destekliyorsa tam ekran talep et
    const docEl = document.documentElement;
    if (docEl && typeof docEl.requestFullscreen === 'function' && !document.fullscreenElement) {
      docEl.requestFullscreen().catch(() => {});
    }

    return () => {
      if (document.fullscreenElement && typeof document.exitFullscreen === 'function') {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [isOpen]);

  // 3. Klavye Kısayolları (Space: Durdur/Başlat, Esc: Çıkış, M: Ses)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        triggerHaptic('light');
        onClose();
      } else if (e.code === 'Space') {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault();
          triggerHaptic('medium');
          toggle();
        }
      } else if (e.key === 'm' || e.key === 'M') {
        if (activeSound) {
          stopSound();
        } else {
          playSound('rain', AMBIENT_SOUNDS[0].url);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, toggle, activeSound, stopSound, playSound]);

  if (!isOpen) return null;

  const currentSubjectText = selectedSubject
    ? `${selectedSubject}${selectedTopic ? ` · ${selectedTopic}` : ''}`
    : 'YKS Hazırlık Odaklanma Seansı';

  return (
    <AnimatePresence>
      <motion.div
        key="fullscreen-focus-overlay"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          background: `radial-gradient(ellipse at 50% 40%, ${cfg.color}15 0%, #070a13 65%, #030509 100%)`,
          color: '#f8fafc',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          overflow: 'hidden',
          width: '100vw',
          maxWidth: '100vw',
          height: '100dvh',
          maxHeight: '100dvh',
          boxSizing: 'border-box',
        }}
      >
        {/* ========================================================= */}
        {/* MOD 1: MOBİL YATAY (LANDSCAPE) - MASAÜSTÜ DİJİTAL SAAT    */}
        {/* ========================================================= */}
        {orientationMode === 'mobile-landscape' && (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'clamp(10px, 3vh, 18px) max(20px, env(safe-area-inset-right, 20px)) clamp(10px, 3vh, 18px) max(20px, env(safe-area-inset-left, 20px))',
              boxSizing: 'border-box',
              gap: 'clamp(16px, 4vw, 36px)',
            }}
          >
            {/* Sol Panel: Devasa Dijital Saat & İlerleme */}
            <div
              style={{
                flex: '1 1 62%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minWidth: 0,
              }}
            >
              {/* Ders & Konu Rozeti */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    background: `${cfg.color}20`,
                    border: `1px solid ${cfg.color}45`,
                    color: cfg.color,
                    fontSize: '11px',
                    fontWeight: 700,
                    maxWidth: '100%',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  <BookOpen size={13} />
                  {currentSubjectText}
                </span>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                  ● {cfg.label}
                </span>
              </div>

              {/* Devasa Dijital Sayaç */}
              <div
                style={{
                  fontSize: 'clamp(58px, 16vw, 104px)',
                  fontWeight: 900,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontVariantNumeric: 'tabular-nums',
                  lineHeight: 0.95,
                  letterSpacing: '-0.04em',
                  color: '#ffffff',
                  textShadow: `0 0 35px ${cfg.glow}`,
                  margin: '4px 0 14px 0',
                }}
              >
                {fmt(timeLeft)}
              </div>

              {/* Yatay İlerleme Çubuğu */}
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                  position: 'relative',
                  marginBottom: '6px',
                }}
              >
                <motion.div
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    background: `linear-gradient(90deg, ${cfg.color}, #38bdf8)`,
                    boxShadow: `0 0 12px ${cfg.color}`,
                    borderRadius: '999px',
                  }}
                />
              </div>

              {/* Bilgi Metni */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                <span>%{progress.toFixed(0)} tamamlandı</span>
                <span>Kalan: {Math.ceil(timeLeft / 60)} dakika</span>
              </div>
            </div>

            {/* Sağ Panel: Kontroller, Seans Döngüsü & Aksiyonlar */}
            <div
              style={{
                flex: '0 0 auto',
                width: 'clamp(180px, 32vw, 240px)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '20px',
                padding: '12px 14px',
                boxSizing: 'border-box',
              }}
            >
              {/* Üst Bar: Pomodoro Noktaları & Çıkış */}
              <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: i < pomodoroCount % 4 ? cfg.color : 'rgba(255,255,255,0.12)',
                        boxShadow: i < pomodoroCount % 4 ? `0 0 8px ${cfg.color}` : 'none',
                        transition: 'all 0.3s',
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={() => {
                    triggerHaptic('light');
                    onClose();
                  }}
                  title="Tam Ekrandan Çık"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    padding: '4px 10px',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Minimize size={13} /> Çık
                </button>
              </div>

              {/* Orta: Ana Başlat / Durdur Butonu */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => {
                    triggerHaptic('medium');
                    toggle();
                  }}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}bb)`,
                    border: 'none',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: `0 8px 24px ${cfg.glow}`,
                    transition: 'transform 0.15s active',
                  }}
                >
                  {isRunning ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" style={{ marginLeft: '3px' }} />}
                </button>

                <button
                  onClick={() => {
                    triggerHaptic('light');
                    skip();
                  }}
                  title="Sonraki Aşama"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <SkipForward size={16} />
                </button>
              </div>

              {/* Alt Butonlar: Oturumu Bitir veya Ses */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {mode === 'pomodoro' && (
                  <button
                    onClick={() => {
                      triggerHaptic('success');
                      finishSession();
                      onClose();
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '12px',
                      background: 'rgba(16, 185, 129, 0.18)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      color: '#34d399',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <CheckCircle2 size={14} /> Oturumu Bitir
                  </button>
                )}

                {/* Hızlı Ortam Sesi */}
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    if (activeSound) {
                      stopSound();
                    } else {
                      playSound('rain', AMBIENT_SOUNDS[0].url);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: '10px',
                    background: activeSound ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.04)',
                    border: activeSound ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid rgba(255,255,255,0.08)',
                    color: activeSound ? '#38bdf8' : '#64748b',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  {activeSound ? <Volume2 size={13} /> : <VolumeX size={13} />}
                  {activeSound ? 'Ortam Sesi: Açık' : 'Ortam Sesi: Kapalı'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MOD 2: MOBİL DİKEY (PORTRAIT) - ERGONOMİK TAŞMASIZ ODAK    */}
        {/* ========================================================= */}
        {orientationMode === 'mobile-portrait' && (
          <div
            style={{
              width: '100%',
              maxWidth: '100vw',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'max(16px, env(safe-area-inset-top, 16px)) 16px max(20px, env(safe-area-inset-bottom, 20px)) 16px',
              boxSizing: 'border-box',
              overflowX: 'hidden',
            }}
          >
            {/* Üst Bar: Ders Başlığı & Çıkış */}
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  background: `${cfg.color}15`,
                  border: `1px solid ${cfg.color}35`,
                  color: cfg.color,
                  fontSize: '12px',
                  fontWeight: 700,
                  maxWidth: '72%',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                <BookOpen size={14} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentSubjectText}</span>
              </div>

              <button
                onClick={() => {
                  triggerHaptic('light');
                  onClose();
                }}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  padding: '7px 14px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Minimize size={14} /> Çıkış
              </button>
            </div>

            {/* Orta Bölüm: Dairesel Sayaç */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 'auto', width: '100%' }}>
              {/* Pomodoro Döngü Noktaları */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: i < pomodoroCount % 4 ? cfg.color : 'rgba(255,255,255,0.12)',
                      boxShadow: i < pomodoroCount % 4 ? `0 0 10px ${cfg.color}` : 'none',
                      transition: 'all 0.3s',
                    }}
                  />
                ))}
              </div>

              {/* Dairesel SVG İlerleme */}
              <div
                style={{
                  position: 'relative',
                  width: 'min(270px, 72vw)',
                  height: 'min(270px, 72vw)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg viewBox="0 0 250 250" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="125" cy="125" r={R_MOBILE} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <motion.circle
                    cx="125"
                    cy="125"
                    r={R_MOBILE}
                    fill="none"
                    stroke={cfg.color}
                    strokeWidth="10"
                    strokeDasharray={CIRC_MOBILE}
                    strokeDashoffset={dashOffsetMobile}
                    strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 16px ${cfg.color})` }}
                    transition={{ duration: 0.8, ease: 'linear' }}
                  />
                </svg>

                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span
                    style={{
                      fontSize: 'clamp(44px, 12vw, 58px)',
                      fontWeight: 900,
                      color: '#ffffff',
                      fontVariantNumeric: 'tabular-nums',
                      letterSpacing: '-0.03em',
                      lineHeight: 1,
                    }}
                  >
                    {fmt(timeLeft)}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      color: cfg.color,
                      fontWeight: 800,
                      marginTop: '8px',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {cfg.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Alt Bölüm: Kontroller & Motivasyon */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              {/* Kontrol Butonları */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    reset();
                  }}
                  title="Sıfırla"
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <RotateCcw size={18} />
                </button>

                <button
                  onClick={() => {
                    triggerHaptic('medium');
                    toggle();
                  }}
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}bb)`,
                    border: 'none',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: `0 10px 30px ${cfg.glow}`,
                  }}
                >
                  {isRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" style={{ marginLeft: '4px' }} />}
                </button>

                <button
                  onClick={() => {
                    triggerHaptic('light');
                    skip();
                  }}
                  title="Sonraki Aşama"
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <SkipForward size={18} />
                </button>
              </div>

              {/* Oturumu Bitir Butonu */}
              {mode === 'pomodoro' && (
                <button
                  onClick={() => {
                    triggerHaptic('success');
                    finishSession();
                    onClose();
                  }}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '24px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1.5px solid rgba(16, 185, 129, 0.5)',
                    color: '#34d399',
                    fontWeight: 700,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
                  }}
                >
                  <CheckCircle2 size={16} /> Oturumu Bitir & XP Kazan
                </button>
              )}

              {/* Motivasyon Sözü */}
              <div
                style={{
                  color: '#64748b',
                  fontSize: '12px',
                  fontStyle: 'italic',
                  maxWidth: '360px',
                  textAlign: 'center',
                  lineHeight: 1.5,
                  padding: '0 10px',
                }}
              >
                "{quote}"
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MOD 3: MASAÜSTÜ (DESKTOP) - GENİŞ EKRAN ZEN STÜDYOSU      */}
        {/* ========================================================= */}
        {orientationMode === 'desktop' && (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px 36px',
              boxSizing: 'border-box',
              position: 'relative',
            }}
          >
            {/* Üst Bar: Sol Logo, Orta Konu Rozeti, Sağ Kontroller */}
            <div
              style={{
                width: '100%',
                maxWidth: '1280px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                zIndex: 20,
              }}
            >
              {/* Sol: Başlık */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: `linear-gradient(135deg, ${cfg.color}, #38bdf8)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                  }}
                >
                  <Sparkles size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                    YKS Yıldızı Odak Stüdyosu
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Dikkat Dağıtmayan Tam Ekran Modu</div>
                </div>
              </div>

              {/* Orta: Ders ve Konu Rozeti */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 20px',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <BookOpen size={16} color={cfg.color} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>{currentSubjectText}</span>
              </div>

              {/* Sağ: Kısayol İpuçları & Çıkış */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', gap: '10px' }}>
                  <span><kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px' }}>Boşluk</kbd> Başlat/Durdur</span>
                  <span><kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px' }}>Esc</kbd> Çıkış</span>
                </div>

                <button
                  onClick={() => {
                    triggerHaptic('light');
                    onClose();
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '12px',
                    padding: '8px 18px',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                  }}
                >
                  <Minimize size={16} /> Tam Ekrandan Çık
                </button>
              </div>
            </div>

            {/* Merkez Bölüm: Dairesel Sayaç, Mod Seçicisi & Pomodoro Noktaları */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                my: 'auto',
              }}
            >
              {/* Mod Seçici Segment */}
              <div
                style={{
                  display: 'flex',
                  background: 'rgba(255,255,255,0.03)',
                  padding: '5px',
                  borderRadius: '18px',
                  border: '1px solid rgba(255,255,255,0.07)',
                  gap: '4px',
                  marginBottom: '20px',
                }}
              >
                {(['pomodoro', 'shortBreak', 'longBreak'] as Mode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      triggerHaptic('light');
                      switchMode(m);
                    }}
                    style={{
                      padding: '8px 20px',
                      borderRadius: '14px',
                      fontSize: '12px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: mode === m ? MODE_CONFIG[m].color : 'transparent',
                      color: mode === m ? '#fff' : '#64748b',
                      boxShadow: mode === m ? `0 4px 16px ${MODE_CONFIG[m].glow}` : 'none',
                    }}
                  >
                    {MODE_CONFIG[m].label}
                  </button>
                ))}
              </div>

              {/* Pomodoro 4'lü Döngü Noktaları */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '32px' }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: i < pomodoroCount % 4 ? cfg.color : 'rgba(255,255,255,0.1)',
                      boxShadow: i < pomodoroCount % 4 ? `0 0 12px ${cfg.color}` : 'none',
                      transition: 'all 0.3s',
                    }}
                  />
                ))}
              </div>

              {/* Büyük 340px SVG Çember */}
              <div
                style={{
                  position: 'relative',
                  width: '340px',
                  height: '340px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '36px',
                }}
              >
                <svg viewBox="0 0 320 320" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="160" cy="160" r={R_DESKTOP} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
                  <motion.circle
                    cx="160"
                    cy="160"
                    r={R_DESKTOP}
                    fill="none"
                    stroke={cfg.color}
                    strokeWidth="12"
                    strokeDasharray={CIRC_DESKTOP}
                    strokeDashoffset={dashOffsetDesktop}
                    strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 24px ${cfg.color})` }}
                    transition={{ duration: 0.8, ease: 'linear' }}
                  />
                </svg>

                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div
                    style={{
                      fontSize: '76px',
                      fontWeight: 900,
                      color: '#ffffff',
                      fontVariantNumeric: 'tabular-nums',
                      letterSpacing: '-0.04em',
                      lineHeight: 1,
                    }}
                  >
                    {fmt(timeLeft)}
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      color: cfg.color,
                      fontWeight: 800,
                      marginTop: '10px',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {cfg.label}
                  </div>
                </div>
              </div>

              {/* Ana Kontrol Doku */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    reset();
                  }}
                  title="Sıfırla"
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <RotateCcw size={20} />
                </button>

                <button
                  onClick={() => {
                    triggerHaptic('medium');
                    toggle();
                  }}
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}bb)`,
                    border: 'none',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: `0 12px 36px ${cfg.glow}`,
                    transition: 'transform 0.15s ease',
                  }}
                >
                  {isRunning ? <Pause size={38} fill="currentColor" /> : <Play size={38} fill="currentColor" style={{ marginLeft: '4px' }} />}
                </button>

                <button
                  onClick={() => {
                    triggerHaptic('light');
                    skip();
                  }}
                  title="Sonraki Aşama"
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <SkipForward size={20} />
                </button>

                {mode === 'pomodoro' && (
                  <button
                    onClick={() => {
                      triggerHaptic('success');
                      finishSession();
                      onClose();
                    }}
                    style={{
                      padding: '14px 28px',
                      borderRadius: '24px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      border: '1.5px solid rgba(16, 185, 129, 0.5)',
                      color: '#34d399',
                      fontWeight: 700,
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
                      marginLeft: '12px',
                    }}
                  >
                    <CheckCircle2 size={18} /> Oturumu Bitir & XP Kaydet
                  </button>
                )}
              </div>
            </div>

            {/* Alt Panel: Ortam Sesleri & Motivasyon */}
            <div
              style={{
                width: '100%',
                maxWidth: '1280px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                paddingTop: '20px',
              }}
            >
              {/* Ortam Sesleri Seçicisi */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginRight: '4px' }}>
                  Ortam Sesleri:
                </span>
                {AMBIENT_SOUNDS.map((snd) => {
                  const isSelected = activeSound === snd.id;
                  const Icon = snd.icon;
                  return (
                    <button
                      key={snd.id}
                      onClick={() => {
                        triggerHaptic('light');
                        if (isSelected) {
                          stopSound();
                        } else {
                          playSound(snd.id, snd.url);
                        }
                      }}
                      title={snd.label}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '12px',
                        background: isSelected ? `${snd.color}25` : 'rgba(255,255,255,0.03)',
                        border: isSelected ? `1px solid ${snd.color}60` : '1px solid rgba(255,255,255,0.07)',
                        color: isSelected ? snd.color : '#94a3b8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        transition: 'all 0.2s',
                      }}
                    >
                      <Icon size={14} />
                      {snd.label}
                    </button>
                  );
                })}

                {activeSound && (
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      stopSound();
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '11px',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      fontWeight: 600,
                    }}
                  >
                    Durdur
                  </button>
                )}
              </div>

              {/* Motivasyon Sözü */}
              <div style={{ color: '#64748b', fontSize: '13px', fontStyle: 'italic', maxWidth: '440px', textAlign: 'right' }}>
                "{quote}"
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
