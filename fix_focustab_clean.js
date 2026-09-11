const fs = require('fs');

const fullFile = `import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, RotateCcw, Volume2, VolumeX, Settings, Plus, Minus,
  CheckCircle2, Circle, Target, Calendar, TrendingUp,
  X, Flame, Trophy, Zap, BookOpen, ChevronRight, SkipForward,
  Maximize, Minimize, Music, CloudRain, Wind, Waves, Coffee, TreePine
} from 'lucide-react';
import { useTimer } from '@/context/TimerContext';

type Mode = 'pomodoro' | 'shortBreak' | 'longBreak';
type SessionLog = { mode: Mode; duration: number; completedAt: Date; subject?: string };

const MODE_CONFIG: Record<Mode, { label: string; color: string; glow: string; minutes: number }> = {
  pomodoro:   { label: 'Odak',      color: '#8b5cf6', glow: 'rgba(139,92,246,0.35)', minutes: 25 },
  shortBreak: { label: 'Kısa Ara',  color: '#38bdf8', glow: 'rgba(56,189,248,0.35)', minutes: 5  },
  longBreak:  { label: 'Uzun Ara',  color: '#10b981', glow: 'rgba(16,185,129,0.35)', minutes: 15 },
};

const SUBJECTS = [
  { label: 'Matematik', emoji: '📐', color: '#3b82f6' },
  { label: 'Türkçe',    emoji: '📖', color: '#f59e0b' },
  { label: 'Fizik',     emoji: '⚡', color: '#ec4899' },
  { label: 'Kimya',     emoji: '🧪', color: '#10b981' },
  { label: 'Biyoloji',  emoji: '🔬', color: '#a78bfa' },
  { label: 'Tarih',     emoji: '🏛️', color: '#f97316' },
  { label: 'Coğrafya',  emoji: '🌍', color: '#14b8a6' },
  { label: 'Edebiyat',  emoji: '✍️', color: '#e879f9' },
];

const WEEKLY_DATA = [
  { day: 'Pzt', hours: 0 }, { day: 'Sal', hours: 0 }, { day: 'Çar', hours: 0 },
  { day: 'Per', hours: 0 }, { day: 'Cum', hours: 0 }, { day: 'Cmt', hours: 0 },
  { day: 'Paz', hours: 0 },
];

const AMBIENT_SOUNDS = [
  { id: 'rain',   label: 'Yağmur',    icon: <CloudRain size={18}/>, color: '#38bdf8', url: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg' },
  { id: 'wind',   label: 'Rüzgar',    icon: <Wind size={18}/>,     color: '#a78bfa', url: 'https://actions.google.com/sounds/v1/weather/strong_wind.ogg' },
  { id: 'waves',  label: 'Dalga',     icon: <Waves size={18}/>,    color: '#06b6d4', url: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg' },
  { id: 'cafe',   label: 'Kafe',      icon: <Coffee size={18}/>,   color: '#f59e0b', url: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg' },
  { id: 'forest', label: 'Orman',     icon: <TreePine size={18}/>, color: '#10b981', url: 'https://actions.google.com/sounds/v1/ambiences/outdoor_summer_ambience.ogg' },
  { id: 'lofi',   label: 'Lofi',      icon: <Music size={18}/>,    color: '#ec4899', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3' },
];

const MOTIVATIONAL_QUOTES = [
  "Başarı, her gün tekrarlanan küçük çabaların toplamıdır.",
  "Bugün yapacağın fedakarlıklar, yarının zaferleridir.",
  "Zorluklar, sıradan insanları sıradışı bir kadere hazırlar.",
  "En büyük rakibin, dünkü kendindir.",
  "Vazgeçme, başlangıç her zaman en zorudur.",
  "Her şey üstüne geliyorsa, belki de sen ters gidiyorsundur.",
  "Hedefsiz bir gemiye hiçbir rüzgar yardım edemez.",
  "Hayallerin, sınırların bittiği yerde başlar."
];

function SettingsModal({
  durations, onSave, onClose
}: {
  durations: Record<Mode, number>;
  onSave: (d: Record<Mode, number>) => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState({ ...durations });
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 30 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        style={{ background: '#131827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '40px', width: '380px', maxWidth: '95vw' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, margin: 0 }}>⚙️ Ayarlar</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X size={22}/></button>
        </div>
        {(['pomodoro','shortBreak','longBreak'] as Mode[]).map(m => (
          <div key={m} style={{ marginBottom: '24px' }}>
            <label style={{ color: '#d1d5db', fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '10px' }}>
              {MODE_CONFIG[m].label} (dakika)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button onClick={() => setLocal(p => ({...p, [m]: Math.max(1, p[m] - 1)}))}
                style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1e293b', border: '1px solid #374151', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Minus size={16}/>
              </button>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '22px', minWidth: '40px', textAlign: 'center' }}>{local[m]}</span>
              <button onClick={() => setLocal(p => ({...p, [m]: Math.min(120, p[m] + 1)}))}
                style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1e293b', border: '1px solid #374151', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={16}/>
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => { onSave(local); onClose(); }}
          style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, fontSize: '15px', cursor: 'pointer', marginTop: '8px' }}
        >
          Kaydet
        </button>
      </motion.div>
    </motion.div>
  );
}

const CIRC = 2 * Math.PI * 120;
const R = 120;

function ZenModeOverlay({
  timeLeft, totalSec, cfg, isRunning, onToggle, onExit
}: {
  timeLeft: number; totalSec: number; cfg: typeof MODE_CONFIG.pomodoro;
  isRunning: boolean; onToggle: () => void; onExit: () => void;
}) {
  const progress = ((totalSec - timeLeft) / totalSec) * 100;
  const dashOffset = CIRC - (CIRC * progress) / 100;
  const [quote] = useState(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return \`\${m.toString().padStart(2, '0')}:\${rs.toString().padStart(2, '0')}\`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: \`radial-gradient(ellipse at center, \${cfg.color}15 0%, #050810 70%)\`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: 'default',
      }}
    >
      <button onClick={onExit}
        style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 16px', color: '#6b7280', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', zIndex: 201 }}>
        <Minimize size={16}/> Zen Modundan Çık
      </button>

      <div style={{ position: 'relative', width: 'min(400px, 70vw)', height: 'min(400px, 70vw)', marginBottom: '48px' }}>
        <svg viewBox="0 0 300 300" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
          <circle cx="150" cy="150" r={R} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8"/>
          <motion.circle cx="150" cy="150" r={R} fill="none" stroke={cfg.color} strokeWidth="10"
            strokeDasharray={CIRC} strokeDashoffset={dashOffset} strokeLinecap="round"
            style={{ filter: \`drop-shadow(0 0 20px \${cfg.color})\` }}
            transition={{ duration: 0.8, ease: 'linear' }}/>
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 'min(80px, 15vw)', fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', lineHeight: 1 }}>
            {fmt(timeLeft)}
          </div>
          <div style={{ fontSize: '16px', color: cfg.color, fontWeight: 700, marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            {cfg.label}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <button onClick={onToggle}
          style={{ width: '80px', height: '80px', borderRadius: '50%', background: \`linear-gradient(135deg, \${cfg.color}, \${cfg.color}dd)\`, border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: \`0 10px 30px \${cfg.color}40\` }}>
          {isRunning ? <Pause size={32} fill="currentColor"/> : <Play size={32} fill="currentColor" style={{ marginLeft: '4px' }}/>}
        </button>
      </div>

      <div style={{ position: 'absolute', bottom: '48px', color: '#6b7280', fontSize: '15px', fontStyle: 'italic', maxWidth: '600px', textAlign: 'center', padding: '0 24px', lineHeight: 1.6 }}>
        "{quote}"
      </div>
    </motion.div>
  );
}

export default function FocusTab() {
  const timer = useTimer();
  const { mode, timeLeft, totalSec, isRunning, pomodoroCount, selectedSubject, durations, activeSound, volume, toggle, reset, skip, switchMode, saveSettings, setSelectedSubject, playSound, stopSound, setVolume } = timer;
  
  const [activeDay, setActiveDay] = useState(6);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [todayFocusMin, setTodayFocusMin] = useState(0);
  const [isZenMode, setIsZenMode] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);

  const cfg = MODE_CONFIG[mode];
  const progress = ((totalSec - timeLeft) / totalSec) * 100;
  const dashOffset = CIRC - (CIRC * progress) / 100;
  const dailyGoalMin = 8 * 60;
  const dailyPct = Math.min(100, (todayFocusMin / dailyGoalMin) * 100);
  const dailyGoalCirc = 2 * Math.PI * 90;

  const playBeep = useCallback(() => {
    if (isMuted || typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch(e){}
  }, [isMuted]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = isRunning ? fmt(timeLeft) + ' — ' + cfg.label : 'YKS Yıldızı — Odak';
    }
    return () => { if (typeof document !== 'undefined') document.title = 'YKS Yıldızı'; };
  }, [isRunning, timeLeft, cfg.label]);

  const completedTasks = tasks.filter(t => t.done).length;
  const maxWeekly = Math.max(...WEEKLY_DATA.map(d => d.hours));

  const statusMsg = () => {
    const pct = dailyPct;
    if (pct >= 100) return { text: '🏆 Günlük Hedef Tamamlandı!', color: '#fcd34d' };
    if (pct >= 75)  return { text: '🔥 Harika Gidiyorsun!',       color: '#10b981' };
    if (pct >= 50)  return { text: '⚡ Yarı Yoldasın!',           color: '#38bdf8' };
    if (pct >= 25)  return { text: '💪 Devam Et!',                color: '#a78bfa' };
    return               { text: '🚀 Haydi Başlayalım!',          color: '#9ca3af' };
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return \`\${m.toString().padStart(2, '0')}:\${rs.toString().padStart(2, '0')}\`;
  };

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: 'clamp(16px, 3vw, 32px)', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      
      {/* Zen Mode Overlay */}
      <AnimatePresence>
        {isZenMode && (
          <ZenModeOverlay timeLeft={timeLeft} totalSec={totalSec} cfg={cfg} isRunning={isRunning} onToggle={toggle} onExit={() => setIsZenMode(false)} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Target size={28} style={{ color: '#8b5cf6' }}/>
            Odak Merkezi
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            Bugün <strong style={{ color: '#fff' }}>{todayFocusMin} dk</strong> çalıştın. {statusMsg().text}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Main Timer Card */}
        <div style={{ background: '#0f172a', border: \`1px solid \${cfg.glow}\`, borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden', boxShadow: \`0 10px 40px -10px \${cfg.glow}\` }}>
          
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '16px', marginBottom: '40px', gap: '4px' }}>
            {(['pomodoro','shortBreak','longBreak'] as Mode[]).map(m => (
              <button key={m} onClick={() => switchMode(m)}
                style={{
                  padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  background: mode === m ? MODE_CONFIG[m].color : 'transparent',
                  color: mode === m ? '#fff' : '#6b7280',
                  boxShadow: mode === m ? \`0 4px 12px \${MODE_CONFIG[m].glow}\` : 'none',
                }}>
                {MODE_CONFIG[m].label}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '240px', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 300 300" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
              <circle cx="150" cy="150" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12"/>
              <motion.circle cx="150" cy="150" r={R} fill="none" stroke={cfg.color} strokeWidth="12"
                strokeDasharray={CIRC} strokeDashoffset={dashOffset} strokeLinecap="round"
                transition={{ duration: 0.5 }}
                style={{ filter: \`drop-shadow(0 0 12px \${cfg.color})\` }}
              />
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
              <div style={{ fontSize: '56px', fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', lineHeight: 1, textShadow: \`0 0 20px \${cfg.glow}\` }}>
                {fmt(timeLeft)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '40px' }}>
            <button onClick={reset} style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
              <RotateCcw size={20}/>
            </button>
            <button onClick={toggle}
              style={{ width: '72px', height: '72px', borderRadius: '50%', background: \`linear-gradient(135deg, \${cfg.color}, \${cfg.color}dd)\`, border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: \`0 10px 25px \${cfg.glow}\`, transition: 'transform 0.2s' }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
              {isRunning ? <Pause size={32} fill="currentColor"/> : <Play size={32} fill="currentColor" style={{ marginLeft: '4px' }}/>}
            </button>
            <button onClick={skip} style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
              <SkipForward size={20}/>
            </button>
          </div>

          <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '8px' }}>
            <button onClick={() => setIsZenMode(true)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', cursor: 'pointer' }}>
              <Maximize size={16}/>
            </button>
            <button onClick={() => setShowSettings(true)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', cursor: 'pointer' }}>
              <Settings size={16}/>
            </button>
          </div>
        </div>

        {/* Right Side: Sounds & Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ background: '#131827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '16px', overflow: 'hidden' }}>
            <button onClick={() => setIsExpanded(e => !e)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: activeSound ? '#8b5cf620' : '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Music size={16} style={{ color: activeSound ? '#a78bfa' : '#6b7280' }}/>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>🎵 Ortam Sesleri</div>
                  <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>
                    {activeSound ? AMBIENT_SOUNDS.find(s => s.id === activeSound)?.label + ' çalıyor' : 'Kapalı'}
                  </div>
                </div>
              </div>
              <ChevronRight size={18} style={{ color: '#6b7280', transform: isExpanded ? 'rotate(90deg)' : 'none', transition: '0.2s' }}/>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '16px' }}>
                    {AMBIENT_SOUNDS.map(s => {
                      const isActive = activeSound === s.id;
                      return (
                        <button key={s.id} onClick={() => playSound(s.id, s.url)}
                          style={{
                            background: isActive ? s.color + '15' : 'rgba(255,255,255,0.03)',
                            border: \`1px solid \${isActive ? s.color + '40' : 'rgba(255,255,255,0.05)'}\`,
                            borderRadius: '12px', padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s'
                          }}>
                          <div style={{ color: isActive ? s.color : '#6b7280' }}>{s.icon}</div>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: isActive ? '#fff' : '#9ca3af' }}>{s.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {activeSound && (
                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px' }}>
                      <VolumeX size={16} color="#6b7280" cursor="pointer" onClick={() => setVolume(0)}/>
                      <input type="range" min="0" max="1" step="0.01" value={volume}
                        onChange={e => setVolume(parseFloat(e.target.value))}
                        style={{ flex: 1, accentColor: '#8b5cf6', height: '4px', cursor: 'pointer' }}
                      />
                      <Volume2 size={16} color="#6b7280"/>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSettings && <SettingsModal durations={durations} onSave={saveSettings} onClose={() => setShowSettings(false)}/>}
      </AnimatePresence>
    </motion.div>
  );
}
