'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, RotateCcw, Volume2, VolumeX, Plus, Minus,
  CheckCircle2, Circle, Target, TrendingUp,
  X, Flame, Trophy, Zap, BookOpen, ChevronRight, SkipForward,
  Maximize, Music, CloudRain, Wind, Waves, Coffee, TreePine,
  Clock
} from 'lucide-react';
import { useTimer } from '@/context/TimerContext';
import SessionLogModal from '@/components/dashboard/SessionLogModal';

type Mode = 'pomodoro' | 'shortBreak' | 'longBreak';

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
  { label: 'Felsefe',   emoji: '🤔', color: '#fb923c' },
  { label: 'Din Kültürü', emoji: '☪️', color: '#84cc16' },
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
  "Hayallerin, sınırların bittiği yerde başlar.",
  "Başarı tesadüf değil, alışkanlıktır.",
  "Düşüncelerini değiştir, hayatını değiştirirsin.",
];

const CIRC = 2 * Math.PI * 120;
const R = 120;

// ─── Settings Modal ────────────────────────────────────────────────────────────
function SettingsModal({ durations, onSave, onClose }: {
  durations: Record<Mode, number>;
  onSave: (d: Record<Mode, number>) => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState({ ...durations });
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000,
               display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 30 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        style={{ background: '#131827', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '24px',
                 padding: '40px', width: '420px', maxWidth: '95vw',
                 boxShadow: '0 20px 60px rgba(139,92,246,0.2)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={20} style={{ color: '#8b5cf6' }}/> Süre Ayarları
          </h3>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18}/></button>
        </div>
        <div style={{ marginBottom: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, marginBottom: '10px', letterSpacing: '0.05em' }}>HIZLI SEÇIM — ODAK SÜRESİ</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[25, 45, 60, 90, 120, 180].map(min => (
              <button key={min}
                onClick={() => setLocal(p => ({ ...p, pomodoro: min }))}
                style={{
                  padding: '7px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer',
                  background: local.pomodoro === min ? '#8b5cf6' : 'rgba(255,255,255,0.05)',
                  color: local.pomodoro === min ? '#fff' : '#9ca3af',
                  boxShadow: local.pomodoro === min ? '0 4px 12px rgba(139,92,246,0.4)' : 'none',
                  transition: 'all 0.15s'
                }}>
                {min >= 60 ? `${Math.floor(min/60)}s${min%60>0?` ${min%60}dk`:''}` : `${min}dk`}
              </button>
            ))}
          </div>
        </div>
        {(['pomodoro','shortBreak','longBreak'] as Mode[]).map(m => {
          const maxMin = m === 'pomodoro' ? 180 : m === 'longBreak' ? 60 : 30;
          const minMin = m === 'pomodoro' ? 25 : 1;
          const displayVal = local[m] >= 60
            ? `${Math.floor(local[m]/60)}s ${local[m]%60>0?local[m]%60+'dk':''}`
            : `${local[m]} dk`;
          return (
          <div key={m} style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <label style={{ color: '#d1d5db', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: MODE_CONFIG[m].color }}/>
                {MODE_CONFIG[m].label}
              </label>
              <span style={{ color: MODE_CONFIG[m].color, fontWeight: 800, fontSize: '16px' }}>{displayVal}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => setLocal(p => ({...p, [m]: Math.max(minMin, p[m] - (m==='pomodoro' && p[m]>60 ? 5 : 1))}))}
                style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#1e293b', border: '1px solid #374151',
                         color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Minus size={16}/>
              </button>
              <div style={{ flex: 1, background: '#0f172a', borderRadius: '12px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="range" min={minMin} max={maxMin}
                  step={m === 'pomodoro' ? 5 : 1}
                  value={local[m]}
                  onChange={e => setLocal(p => ({ ...p, [m]: parseInt(e.target.value) }))}
                  style={{ flex: 1, accentColor: MODE_CONFIG[m].color, cursor: 'pointer', height: '6px' }}
                />
              </div>
              <button onClick={() => setLocal(p => ({...p, [m]: Math.min(maxMin, p[m] + (m==='pomodoro' && p[m]>=60 ? 5 : 1))}))}
                style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#1e293b', border: '1px solid #374151',
                         color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Plus size={16}/>
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '10px', color: '#4b5563' }}>{minMin} dk</span>
              <span style={{ fontSize: '10px', color: '#4b5563' }}>{maxMin >= 60 ? `${Math.floor(maxMin/60)} saat` : `${maxMin} dk`}</span>
            </div>
          </div>
          );
        })}
        <button
          onClick={() => { onSave(local); onClose(); }}
          style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', border: 'none',
                   borderRadius: '14px', color: '#fff', fontWeight: 700, fontSize: '15px', cursor: 'pointer', marginTop: '8px',
                   boxShadow: '0 8px 20px rgba(139,92,246,0.3)' }}
        >
          Kaydet & Uygula
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Subject Picker Modal ──────────────────────────────────────────────────────
function SubjectPickerModal({ selected, onSelect, onClose }: {
  selected: string | null;
  onSelect: (s: string | null) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000,
               display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 30 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        style={{ background: '#131827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px',
                 padding: '36px', width: '460px', maxWidth: '95vw',
                 boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={20} style={{ color: '#38bdf8' }}/> Ders Seç
          </h3>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18}/></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          <button onClick={() => { onSelect(null); onClose(); }}
            style={{ padding: '14px 16px', borderRadius: '14px', border: `2px solid ${!selected ? '#8b5cf6' : 'rgba(255,255,255,0.06)'}`,
                     background: !selected ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.02)', cursor: 'pointer',
                     color: '#9ca3af', fontWeight: 600, fontSize: '14px', textAlign: 'left',
                     display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🎯</span> Serbest Çalışma
          </button>
          {SUBJECTS.map(s => (
            <button key={s.label} onClick={() => { onSelect(s.label); onClose(); }}
              style={{ padding: '14px 16px', borderRadius: '14px',
                       border: `2px solid ${selected === s.label ? s.color : 'rgba(255,255,255,0.06)'}`,
                       background: selected === s.label ? s.color + '15' : 'rgba(255,255,255,0.02)',
                       cursor: 'pointer', fontWeight: 600, fontSize: '14px', textAlign: 'left',
                       display: 'flex', alignItems: 'center', gap: '10px',
                       color: selected === s.label ? '#fff' : '#9ca3af', transition: 'all 0.15s' }}>
              <span style={{ fontSize: '20px' }}>{s.emoji}</span> {s.label}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Zen Mode Overlay ──────────────────────────────────────────────────────────
function ZenModeOverlay({ timeLeft, totalSec, cfg, isRunning, pomodoroCount, onToggle, onExit }: {
  timeLeft: number; totalSec: number; cfg: typeof MODE_CONFIG.pomodoro;
  isRunning: boolean; pomodoroCount: number; onToggle: () => void; onExit: () => void;
}) {
  const progress = ((totalSec - timeLeft) / totalSec) * 100;
  const dashOffset = CIRC - (CIRC * progress) / 100;
  const [quote] = useState(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  const fmt = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
      style={{ position: 'fixed', inset: 0, zIndex: 9000, background: `radial-gradient(ellipse at center, ${cfg.color}15 0%, #050810 70%)`,
               display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
    >
      <button onClick={onExit}
        style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.05)',
                 border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 20px',
                 color: '#6b7280', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                 display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Minimize size={16}/> Zen Modundan Çık
      </button>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '48px' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ width: '12px', height: '12px', borderRadius: '50%',
               background: i < pomodoroCount % 4 ? cfg.color : 'rgba(255,255,255,0.1)',
               boxShadow: i < pomodoroCount % 4 ? `0 0 8px ${cfg.color}` : 'none' }}/>
        ))}
      </div>
      <div style={{ position: 'relative', width: 'min(360px, 70vw)', height: 'min(360px, 70vw)', marginBottom: '48px' }}>
        <svg viewBox="0 0 300 300" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
          <circle cx="150" cy="150" r={R} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10"/>
          <motion.circle cx="150" cy="150" r={R} fill="none" stroke={cfg.color} strokeWidth="12"
            strokeDasharray={CIRC} strokeDashoffset={dashOffset} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 20px ${cfg.color})` }} transition={{ duration: 0.8, ease: 'linear' }}/>
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 'min(72px, 14vw)', fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {fmt(timeLeft)}
          </div>
          <div style={{ fontSize: '15px', color: cfg.color, fontWeight: 700, marginTop: '10px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            {cfg.label}
          </div>
        </div>
      </div>
      <button onClick={onToggle}
        style={{ width: '80px', height: '80px', borderRadius: '50%',
                 background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}bb)`,
                 border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                 cursor: 'pointer', boxShadow: `0 10px 30px ${cfg.glow}` }}>
        {isRunning ? <Pause size={32} fill="currentColor"/> : <Play size={32} fill="currentColor" style={{ marginLeft: '4px' }}/>}
      </button>
      <div style={{ position: 'absolute', bottom: '48px', color: '#4b5563', fontSize: '15px',
                    fontStyle: 'italic', maxWidth: '600px', textAlign: 'center', padding: '0 40px', lineHeight: 1.7 }}>
        "{quote}"
      </div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function FocusTab() {
  const timer = useTimer();
  const { mode, timeLeft, totalSec, isRunning, pomodoroCount, selectedSubject,
          durations, activeSound, volume, toggle, reset, skip, switchMode,
          saveSettings, setSelectedSubject, playSound, stopSound, setVolume } = timer;

  const [showSettings, setShowSettings] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [soundsExpanded, setSoundsExpanded] = useState(false);

  const [tasks, setTasks] = useState<{ id: string; text: string; done: boolean; subject?: string }[]>([]);
  const [newTask, setNewTask] = useState('');

  // Real focus stats from DB
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [allTimeCount, setAllTimeCount] = useState(0);
  const [weekData, setWeekData] = useState<{ day: string; total_min: number }[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);

  const cfg = MODE_CONFIG[mode];
  const progress = ((totalSec - timeLeft) / totalSec) * 100;
  const dashOffset = CIRC - (CIRC * progress) / 100;

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/user/focus');
      if (res.ok) {
        const data = await res.json();
        setTodayMinutes(data.todayMinutes ?? 0);
        setTodayCount(data.todayCount ?? 0);
        setAllTimeCount(data.allTimeCount ?? 0);
        setRecentSessions(data.recentSessions ?? []);
        // Build week array: last 7 days
        const days = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];
        const today = new Date();
        const weekArr = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(today);
          d.setDate(today.getDate() - (6 - i));
          const iso = d.toISOString().split('T')[0];
          const found = data.weekSessions?.find((s: { day: string; total_min: number }) => s.day === iso);
          const dayName = days[d.getDay() === 0 ? 6 : d.getDay() - 1];
          return { day: dayName, total_min: found?.total_min ?? 0, isToday: i === 6 };
        });
        setWeekData(weekArr as { day: string; total_min: number; isToday?: boolean }[]);
      }
    } catch (e) {}
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Refresh stats after each completed session (when modal is closed after saving)
  const { pendingSession } = useTimer();
  const prevPendingRef = React.useRef(pendingSession);
  useEffect(() => {
    if (prevPendingRef.current !== null && pendingSession === null) {
      fetchStats();
    }
    prevPendingRef.current = pendingSession;
  }, [pendingSession, fetchStats]);

  // Title update
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = isRunning ? `${fmt(timeLeft)} — ${cfg.label}` : 'YKS Yıldızı — Odak';
    }
    return () => { if (typeof document !== 'undefined') document.title = 'YKS Yıldızı'; };
  }, [isRunning, timeLeft, cfg.label]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks(p => [...p, { id: Date.now().toString(), text: newTask.trim(), done: false }]);
    setNewTask('');
  };
  const toggleTask = (id: string) => setTasks(p => p.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const removeTask = (id: string) => setTasks(p => p.filter(t => t.id !== id));

  const completedTasks = tasks.filter(t => t.done).length;
  const maxWeekly = Math.max(...weekData.map(d => d.total_min), 1);
  const dailyGoalMin = 4 * 60; // 4 hours daily goal
  const dailyPct = Math.min(100, (todayMinutes / dailyGoalMin) * 100);
  const selectedSubjectData = SUBJECTS.find(s => s.label === selectedSubject);

  const statusMsg = () => {
    if (dailyPct >= 100) return { text: '🏆 Günlük Hedefe Ulaştın!', color: '#fcd34d' };
    if (dailyPct >= 75)  return { text: '🔥 Harika Gidiyorsun!',     color: '#10b981' };
    if (dailyPct >= 50)  return { text: '⚡ Yarı Yoldasın!',         color: '#38bdf8' };
    if (dailyPct >= 25)  return { text: '💪 Devam Et!',              color: '#a78bfa' };
    return                     { text: '🚀 Haydi Başlayalım!',        color: '#9ca3af' };
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: 'clamp(16px,3vw,32px)',
               maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

      {/* Zen Mode */}
      <AnimatePresence>
        {isZenMode && (
          <ZenModeOverlay timeLeft={timeLeft} totalSec={totalSec} cfg={cfg}
            isRunning={isRunning} pomodoroCount={pomodoroCount}
            onToggle={toggle} onExit={() => setIsZenMode(false)} />
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showSubjectPicker && (
          <SubjectPickerModal selected={selectedSubject} onSelect={setSelectedSubject} onClose={() => setShowSubjectPicker(false)}/>
        )}
      </AnimatePresence>

      {/* Session Log Modal — shown after each Pomodoro completes */}
      <SessionLogModal />

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: 'clamp(22px,4vw,30px)', fontWeight: 800, color: '#fff', marginBottom: '6px',
                       display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Target size={26} style={{ color: '#8b5cf6' }}/> Odak Merkezi
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Bugün <strong style={{ color: '#fff' }}>{todayMinutes} dk</strong> çalıştın &nbsp;·&nbsp;
            <strong style={{ color: '#fff' }}>{todayCount}</strong> oturum
            &nbsp;·&nbsp; {statusMsg().text}
          </p>
        </div>
        {/* Stats pills */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[
            { icon: <Flame size={14}/>, label: 'Bugün', value: `${todayMinutes}dk`, color: '#f97316' },
            { icon: <Zap size={14}/>, label: 'Oturum', value: `${allTimeCount}`, color: '#8b5cf6' },
            { icon: <Trophy size={14}/>, label: 'Pomodoro', value: `${pomodoroCount}`, color: '#fcd34d' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#131827',
                 border: `1px solid ${s.color}30`, borderRadius: '12px', padding: '8px 14px' }}>
              <span style={{ color: s.color }}>{s.icon}</span>
              <span style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 500 }}>{s.label}:</span>
              <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px,460px) 1fr', gap: '24px', alignItems: 'start' }}>

        {/* ── Timer Card ── */}
        <div style={{ background: '#0f172a', border: `1px solid ${cfg.glow}`, borderRadius: '28px', padding: '32px',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative',
                      overflow: 'hidden', boxShadow: `0 10px 60px -10px ${cfg.glow}` }}>
          {/* Glow bg */}
          <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
                        width: '300px', height: '300px', borderRadius: '50%',
                        background: cfg.color, filter: 'blur(100px)', opacity: 0.05, pointerEvents: 'none' }}/>

          {/* Top actions - only zen mode */}
          <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '8px' }}>
            <button onClick={() => setIsZenMode(true)} title="Zen Modu"
              style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '10px',
                       width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                       color: '#9ca3af', cursor: 'pointer' }}>
              <Maximize size={15}/>
            </button>
          </div>

          {/* Mode selector */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '18px',
                        marginBottom: '32px', gap: '4px', width: '100%', justifyContent: 'center' }}>
            {(['pomodoro','shortBreak','longBreak'] as Mode[]).map(m => (
              <button key={m} onClick={() => switchMode(m)}
                style={{ flex: 1, padding: '9px 12px', borderRadius: '13px', fontSize: '12px', fontWeight: 700,
                         border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                         background: mode === m ? MODE_CONFIG[m].color : 'transparent',
                         color: mode === m ? '#fff' : '#6b7280',
                         boxShadow: mode === m ? `0 4px 14px ${MODE_CONFIG[m].glow}` : 'none' }}>
                {MODE_CONFIG[m].label}
              </button>
            ))}
          </div>

          {/* Pomodoro dots */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%',
                   background: i < pomodoroCount % 4 ? cfg.color : 'rgba(255,255,255,0.1)',
                   boxShadow: i < pomodoroCount % 4 ? `0 0 8px ${cfg.color}` : 'none',
                   transition: 'all 0.3s' }}/>
            ))}
          </div>

          {/* Timer Ring */}
          <div style={{ position: 'relative', width: '220px', height: '220px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
            <svg viewBox="0 0 300 300" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
              <circle cx="150" cy="150" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14"/>
              <motion.circle cx="150" cy="150" r={R} fill="none" stroke={cfg.color} strokeWidth="14"
                strokeDasharray={CIRC} strokeDashoffset={dashOffset} strokeLinecap="round"
                transition={{ duration: 0.5 }}
                style={{ filter: `drop-shadow(0 0 14px ${cfg.color})` }}
              />
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
              <div style={{ fontSize: '54px', fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums',
                            letterSpacing: '-0.03em', lineHeight: 1, textShadow: `0 0 30px ${cfg.glow}` }}>
                {fmt(timeLeft)}
              </div>
              <div style={{ fontSize: '12px', color: cfg.color, fontWeight: 700, marginTop: '6px',
                            letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {cfg.label}
              </div>
            </div>
          </div>

          {/* Selected Subject Badge */}
          <button onClick={() => setShowSubjectPicker(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px',
                     background: selectedSubjectData ? selectedSubjectData.color + '20' : 'rgba(255,255,255,0.05)',
                     border: `1px solid ${selectedSubjectData ? selectedSubjectData.color + '40' : 'rgba(255,255,255,0.1)'}`,
                     borderRadius: '100px', padding: '7px 16px', cursor: 'pointer', transition: 'all 0.2s' }}>
            <span style={{ fontSize: '16px' }}>{selectedSubjectData?.emoji ?? '🎯'}</span>
            <span style={{ fontSize: '13px', fontWeight: 600,
                           color: selectedSubjectData ? '#fff' : '#6b7280' }}>
              {selectedSubject ?? 'Ders Seç'}
            </span>
            <ChevronRight size={14} style={{ color: '#6b7280' }}/>
          </button>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={reset} title="Sıfırla"
              style={{ width: '50px', height: '50px', borderRadius: '50%',
                       background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                       color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <RotateCcw size={20}/>
            </button>
            <motion.button onClick={toggle} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ width: '76px', height: '76px', borderRadius: '50%',
                       background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)`,
                       border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                       cursor: 'pointer', boxShadow: `0 12px 30px ${cfg.glow}` }}>
              {isRunning ? <Pause size={34} fill="currentColor"/> : <Play size={34} fill="currentColor" style={{ marginLeft: '4px' }}/>}
            </motion.button>
            <button onClick={skip} title="Geç"
              style={{ width: '50px', height: '50px', borderRadius: '50%',
                       background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                       color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <SkipForward size={20}/>
            </button>
          </div>

          {/* ── Inline Duration Controls ── */}
          <div style={{ width: '100%', marginTop: '24px' }}>
            {/* Quick presets - only for current mode */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '10px', color: '#4b5563', fontWeight: 700, letterSpacing: '0.08em',
                            textTransform: 'uppercase', marginBottom: '8px', textAlign: 'center' }}>
                Hızlı Süre Seç
              </div>
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {(mode === 'pomodoro'
                  ? [25, 45, 60, 90, 120, 180]
                  : mode === 'shortBreak'
                  ? [5, 10, 15, 20]
                  : [15, 20, 30, 45]
                ).map(min => {
                  const isActive = durations[mode] === min;
                  const label = min >= 60 ? `${Math.floor(min/60)}s${min%60>0?` ${min%60}`:'' }` : `${min}dk`;
                  return (
                    <button key={min}
                      onClick={() => {
                        const newD = { ...durations, [mode]: min };
                        saveSettings(newD);
                      }}
                      style={{
                        padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
                        border: `1px solid ${isActive ? cfg.color : 'rgba(255,255,255,0.08)'}`,
                        background: isActive ? cfg.color + '20' : 'rgba(255,255,255,0.03)',
                        color: isActive ? cfg.color : '#6b7280',
                        cursor: 'pointer', transition: 'all 0.15s',
                        boxShadow: isActive ? `0 0 10px ${cfg.color}30` : 'none'
                      }}>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Daily Progress */}
          <div style={{ background: '#131827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={16} style={{ color: '#f97316' }}/> Günlük Hedef
              </h3>
              <span style={{ fontSize: '13px', color: '#9ca3af' }}>{todayMinutes} / {dailyGoalMin} dk</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '100px', height: '10px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${dailyPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ height: '100%', borderRadius: '100px',
                         background: dailyPct >= 100 ? 'linear-gradient(to right, #10b981, #34d399)' :
                                     dailyPct >= 50 ? 'linear-gradient(to right, #8b5cf6, #38bdf8)' :
                                     'linear-gradient(to right, #8b5cf6, #a78bfa)' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <span style={{ fontSize: '11px', color: '#6b7280' }}>%{Math.round(dailyPct)} tamamlandı</span>
              <span style={{ fontSize: '11px', color: '#6b7280' }}>{Math.max(0, dailyGoalMin - todayMinutes)} dk kaldı</span>
            </div>
          </div>

          {/* Ambient Sounds */}
          <div style={{ background: '#131827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '20px' }}>
            <button onClick={() => setSoundsExpanded(e => !e)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                       background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '10px',
                              background: activeSound ? '#8b5cf620' : '#1e293b',
                              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Music size={16} style={{ color: activeSound ? '#a78bfa' : '#6b7280' }}/>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0' }}>🎵 Ortam Sesleri</div>
                  <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500, marginTop: '1px' }}>
                    {activeSound ? AMBIENT_SOUNDS.find(s => s.id === activeSound)?.label + ' çalıyor ♪' : 'Kapalı'}
                  </div>
                </div>
              </div>
              <motion.div animate={{ rotate: soundsExpanded ? 90 : 0 }}>
                <ChevronRight size={18} style={{ color: '#6b7280' }}/>
              </motion.div>
            </button>
            <AnimatePresence>
              {soundsExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '16px' }}>
                    {AMBIENT_SOUNDS.map(s => {
                      const isActive = activeSound === s.id;
                      return (
                        <button key={s.id} onClick={() => playSound(s.id, s.url)}
                          style={{ background: isActive ? s.color + '15' : 'rgba(255,255,255,0.03)',
                                   border: `1px solid ${isActive ? s.color + '50' : 'rgba(255,255,255,0.05)'}`,
                                   borderRadius: '14px', padding: '14px 8px',
                                   display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                                   cursor: 'pointer', transition: 'all 0.2s' }}>
                          <span style={{ color: isActive ? s.color : '#6b7280' }}>{s.icon}</span>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: isActive ? '#fff' : '#9ca3af' }}>{s.label}</span>
                          {isActive && <div style={{ width: '16px', height: '3px', borderRadius: '2px', background: s.color,
                                                     boxShadow: `0 0 6px ${s.color}` }}/>}
                        </button>
                      );
                    })}
                  </div>
                  {activeSound && (
                    <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '12px',
                                  background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '14px' }}>
                      <VolumeX size={16} color="#6b7280" style={{ cursor: 'pointer' }} onClick={() => setVolume(0)}/>
                      <input type="range" min="0" max="1" step="0.01" value={volume}
                        onChange={e => setVolume(parseFloat(e.target.value))}
                        style={{ flex: 1, accentColor: '#8b5cf6', cursor: 'pointer' }}
                      />
                      <Volume2 size={16} color="#6b7280"/>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tasks */}
          <div style={{ background: '#131827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} style={{ color: '#10b981' }}/> Görev Listesi
              </h3>
              <span style={{ fontSize: '12px', color: '#6b7280', background: 'rgba(255,255,255,0.04)',
                             padding: '3px 10px', borderRadius: '100px' }}>
                {completedTasks}/{tasks.length}
              </span>
            </div>
            <form onSubmit={addTask} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <input value={newTask} onChange={e => setNewTask(e.target.value)}
                placeholder="Görev ekle (örn. 10 soru çöz)..."
                style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                         padding: '10px 14px', borderRadius: '12px', color: '#fff', fontSize: '13px',
                         outline: 'none', fontFamily: 'inherit' }}/>
              <button type="submit"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', border: 'none', borderRadius: '12px',
                         width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                         color: '#fff', cursor: 'pointer' }}>
                <Plus size={18}/>
              </button>
            </form>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {tasks.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#4b5563', fontSize: '13px', padding: '16px 0' }}>
                  Henüz görev yok. Başlamak için bir görev ekle!
                </div>
              ) : tasks.map(t => (
                <motion.div key={t.id} layout
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.02)',
                           padding: '11px 12px', borderRadius: '12px',
                           border: `1px solid ${t.done ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)'}` }}>
                  <button onClick={() => toggleTask(t.id)}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                             color: t.done ? '#10b981' : '#4b5563', display: 'flex', flexShrink: 0 }}>
                    {t.done ? <CheckCircle2 size={18}/> : <Circle size={18}/>}
                  </button>
                  <span style={{ flex: 1, fontSize: '13px', color: t.done ? '#6b7280' : '#e2e8f0',
                                 textDecoration: t.done ? 'line-through' : 'none', wordBreak: 'break-word' }}>
                    {t.text}
                  </span>
                  <button onClick={() => removeTask(t.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer',
                             padding: 0, opacity: 0.5, flexShrink: 0, display: 'flex' }}>
                    <X size={14}/>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Weekly Focus Chart */}
          <div style={{ background: '#131827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={16} style={{ color: '#38bdf8' }}/> Haftalık Odak
              </h3>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Son 7 gün</span>
            </div>
            {weekData.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100px' }}>
                {weekData.map((d: { day: string; total_min: number; isToday?: boolean }, i) => {
                  const heightPct = (d.total_min / maxWeekly) * 100;
                  const isToday = i === weekData.length - 1;
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '100%', height: '80px', display: 'flex', alignItems: 'flex-end' }}>
                        <div style={{ width: '100%', background: '#1e293b', borderRadius: '6px 6px 0 0', height: '100%', position: 'relative', overflow: 'hidden' }}>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(heightPct, d.total_min > 0 ? 8 : 0)}%` }}
                            transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
                            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, borderRadius: '6px 6px 0 0',
                                     background: isToday ? 'linear-gradient(to top, #8b5cf6, #38bdf8)' : '#374151',
                                     boxShadow: isToday ? '0 -4px 12px rgba(139,92,246,0.4)' : 'none' }}
                          />
                        </div>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: isToday ? '#a78bfa' : '#6b7280' }}>{d.day}</span>
                      {d.total_min > 0 && (
                        <span style={{ fontSize: '9px', color: isToday ? '#8b5cf6' : '#4b5563' }}>{Math.round(d.total_min)}dk</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#4b5563', fontSize: '13px', padding: '24px 0' }}>
                <Clock size={32} style={{ marginBottom: '8px', opacity: 0.3 }}/><br/>
                Henüz odak geçmişi yok. İlk oturumunu başlat!
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Recent Sessions ── */}
      <div style={{ marginTop: '24px', background: '#0f172a', border: `1px solid rgba(255,255,255,0.04)`, borderRadius: '24px', padding: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={18} style={{ color: '#8b5cf6' }}/> Son Çalışmalar
        </h3>
        {recentSessions.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {recentSessions.map((session: any) => (
              <div key={session.id} style={{
                background: '#131827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px',
                padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px',
                transition: 'all 0.2s', cursor: 'default'
              }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'}
                 onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {session.mode === 'pomodoro' ? (
                        <>
                          <span style={{ color: '#8b5cf6' }}>🎯</span>
                          {session.subject || 'Serbest Çalışma'}
                        </>
                      ) : session.mode === 'shortBreak' ? (
                        <>
                          <span style={{ color: '#38bdf8' }}>☕</span>
                          Kısa Ara
                        </>
                      ) : (
                        <>
                          <span style={{ color: '#10b981' }}>🌴</span>
                          Uzun Ara
                        </>
                      )}
                    </div>
                    {session.topic && (
                      <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#8b5cf6' }}/>
                        {session.topic}
                      </div>
                    )}
                  </div>
                  <div style={{
                    background: session.mode === 'pomodoro' ? 'rgba(139,92,246,0.15)' :
                                session.mode === 'shortBreak' ? 'rgba(56,189,248,0.15)' :
                                'rgba(16,185,129,0.15)',
                    color: session.mode === 'pomodoro' ? '#a78bfa' :
                           session.mode === 'shortBreak' ? '#7dd3fc' :
                           '#34d399',
                    fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '8px'
                  }}>
                    {session.duration_min} dk
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#6b7280' }}>
                  <Clock size={12}/>
                  {new Date(session.started_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  {' · '}
                  {new Date(session.started_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280', fontSize: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
            <BookOpen size={32} style={{ marginBottom: '12px', opacity: 0.3, display: 'inline-block' }}/><br/>
            Henüz detaylı kaydedilmiş bir oturum yok.
          </div>
        )}
      </div>

    </motion.div>
  );
}
