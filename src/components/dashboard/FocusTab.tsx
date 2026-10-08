'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Minimize, 
  Play, Pause, RotateCcw, Volume2, VolumeX, Plus, Minus,
  CheckCircle2, Circle, Target, TrendingUp,
  X, Flame, Trophy, Zap, BookOpen, ChevronRight, SkipForward,
  Maximize, Music, CloudRain, Wind, Waves, Coffee, TreePine,
  Clock
 } from 'lucide-react';
import { useTimer } from '@/context/TimerContext';
import SessionLogModal from '@/components/dashboard/SessionLogModal';
import { useFocusData } from '@/hooks/useFocusData';
import WeeklyFocusChart from '@/components/dashboard/WeeklyFocusChart';
import { triggerHaptic } from '@/lib/haptics';

type Mode = 'pomodoro' | 'shortBreak' | 'longBreak';

const MODE_CONFIG: Record<Mode, { label: string; color: string; glow: string; minutes: number }> = {
  pomodoro:   { label: 'Odak',      color: '#8b5cf6', glow: 'rgba(139,92,246,0.35)', minutes: 25 },
  shortBreak: { label: 'Kısa Ara',  color: '#38bdf8', glow: 'rgba(56,189,248,0.35)', minutes: 5  },
  longBreak:  { label: 'Uzun Ara',  color: '#10b981', glow: 'rgba(16,185,129,0.35)', minutes: 15 },
};

export interface FocusPreset {
  id: string;
  title: string;
  emoji: string;
  defaultMin: number;
  subject: string;
  topic: string;
  desc: string;
  badge: string;
  color: string;
}

export const FOCUS_PRESETS: FocusPreset[] = [
  {
    id: 'pomodoro',
    title: 'Standart Odak',
    emoji: '🍅',
    defaultMin: 25,
    subject: '',
    topic: '',
    desc: '25 dk odaklanma & 5 dk mola döngüsü',
    badge: 'Klasik',
    color: '#8b5cf6',
  },
  {
    id: 'paragraf',
    title: 'Paragraf Çözme',
    emoji: '📖',
    defaultMin: 25,
    subject: 'Paragraf',
    topic: 'Günlük 20 Paragraf Rutini',
    desc: '20-25 soru paragraf hız testi',
    badge: '20 Soru',
    color: '#ef4444',
  },
  {
    id: 'sosyal_deneme',
    title: 'Sosyal Deneme',
    emoji: '🏛️',
    defaultMin: 25,
    subject: 'Sosyal Bilimler',
    topic: 'TYT Sosyal Karma Branş Denemesi (20 Soru)',
    desc: 'Tarih, Coğ, Fel, Din 20 soruluk deneme',
    badge: '20 Soru',
    color: '#d97706',
  },
  {
    id: 'fen_deneme',
    title: 'Fen Denemesi',
    emoji: '🧪',
    defaultMin: 35,
    subject: 'Fen Bilimleri',
    topic: 'TYT Fen Karma Branş Denemesi (20 Soru)',
    desc: 'Fizik, Kimya, Biyo 20 soruluk deneme',
    badge: '20 Soru',
    color: '#06b6d4',
  },
  {
    id: 'mat_deneme',
    title: 'Matematik Deneme',
    emoji: '📐',
    defaultMin: 50,
    subject: 'Matematik',
    topic: 'TYT Matematik Branş Denemesi (40 Soru)',
    desc: '40 soruluk branş deneme simülasyonu',
    badge: '40 Soru',
    color: '#3b82f6',
  },
  {
    id: 'genel_deneme',
    title: 'Genel TYT Denemesi',
    emoji: '🏆',
    defaultMin: 165,
    subject: 'Genel Deneme',
    topic: 'TYT Genel Deneme Sınavı (120 Soru / 165 dk)',
    desc: '120 soru tam sınav simülasyonu',
    badge: '165 dk',
    color: '#10b981',
  },
];

const SUBJECTS = [
  { label: 'Paragraf', emoji: '📖', color: '#ef4444' },
  { label: 'Sosyal Bilimler', emoji: '🏛️', color: '#d97706' },
  { label: 'Fen Bilimleri', emoji: '🧪', color: '#06b6d4' },
  { label: 'Genel Deneme', emoji: '🏆', color: '#10b981' },
  { label: 'Matematik', emoji: '📐', color: '#3b82f6' },
  { label: 'Geometri', emoji: '📏', color: '#6366f1' },
  { label: 'Türkçe', emoji: '📚', color: '#f43f5e' },
  { label: 'Edebiyat', emoji: '✍️', color: '#ec4899' },
  { label: 'Fizik', emoji: '⚡', color: '#0ea5e9' },
  { label: 'Kimya', emoji: '🧪', color: '#14b8a6' },
  { label: 'Biyoloji', emoji: '🔬', color: '#8b5cf6' },
  { label: 'Tarih', emoji: '🏺', color: '#f59e0b' },
  { label: 'Coğrafya', emoji: '🌍', color: '#059669' },
  { label: 'Felsefe', emoji: '🤔', color: '#fb923c' },
  { label: 'Din Kültürü', emoji: '🕌', color: '#0891b2' },
  { label: 'İngilizce (YDT)', emoji: '🇬🇧', color: '#a855f7' },
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
      className="modal-overlay-mobile"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000,
               display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 30 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        style={{ background: '#131827', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '24px',
                 padding: 'clamp(20px, 4vw, 36px)', width: '440px', maxWidth: '95vw', maxHeight: '85dvh', overflowY: 'auto',
                 boxShadow: '0 20px 60px rgba(139,92,246,0.2)' }}
      >
        <div className="modal-drag-handle" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={20} style={{ color: '#8b5cf6' }}/> Süre Ayarları
          </h3>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18}/></button>
        </div>
        <div style={{ marginBottom: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, marginBottom: '10px', letterSpacing: '0.05em' }}>HIZLI SEÇİM — ODAK SÜRESİ</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[25, 45, 60, 90, 120, 180].map(min => (
              <button key={min}
                onClick={() => {
                  triggerHaptic('light');
                  setLocal(p => ({ ...p, pomodoro: min }));
                }}
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
          <div key={m} style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label style={{ color: '#d1d5db', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: MODE_CONFIG[m].color }}/>
                {MODE_CONFIG[m].label}
              </label>
              <span style={{ color: MODE_CONFIG[m].color, fontWeight: 800, fontSize: '16px' }}>{displayVal}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => {
                triggerHaptic('light');
                setLocal(p => ({...p, [m]: Math.max(minMin, p[m] - (m==='pomodoro' && p[m]>60 ? 5 : 1))}));
              }}
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
              <button onClick={() => {
                triggerHaptic('light');
                setLocal(p => ({...p, [m]: Math.min(maxMin, p[m] + (m==='pomodoro' && p[m]>=60 ? 5 : 1))}));
              }}
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
          onClick={() => {
            triggerHaptic('success');
            onSave(local);
            onClose();
          }}
          style={{ width: '100%', minHeight: '48px', padding: '14px', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', border: 'none',
                   borderRadius: '14px', color: '#fff', fontWeight: 700, fontSize: '15px', cursor: 'pointer', marginTop: '8px',
                   boxShadow: '0 8px 20px rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
      className="modal-overlay-mobile"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000,
               display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 30 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        style={{ background: '#131827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px',
                 padding: 'clamp(20px, 4vw, 32px)', width: '460px', maxWidth: '95vw', maxHeight: '85dvh', overflowY: 'auto',
                 boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
      >
        <div className="modal-drag-handle" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={20} style={{ color: '#38bdf8' }}/> Ders Seç
          </h3>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18}/></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          <button onClick={() => {
            triggerHaptic('light');
            onSelect(null);
            onClose();
          }}
            style={{ padding: '12px 14px', minHeight: '44px', borderRadius: '14px', border: `2px solid ${!selected ? '#8b5cf6' : 'rgba(255,255,255,0.06)'}`,
                     background: !selected ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.02)', cursor: 'pointer',
                     color: '#9ca3af', fontWeight: 600, fontSize: '13px', textAlign: 'left',
                     display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🎯</span> Serbest Çalışma
          </button>
          {SUBJECTS.map(s => (
            <button key={s.label} onClick={() => {
              triggerHaptic('light');
              onSelect(s.label);
              onClose();
            }}
              style={{ padding: '12px 14px', minHeight: '44px', borderRadius: '14px',
                       border: `2px solid ${selected === s.label ? s.color : 'rgba(255,255,255,0.06)'}`,
                       background: selected === s.label ? s.color + '15' : 'rgba(255,255,255,0.02)',
                       cursor: 'pointer', fontWeight: 600, fontSize: '13px', textAlign: 'left',
                       display: 'flex', alignItems: 'center', gap: '8px',
                       color: selected === s.label ? '#fff' : '#9ca3af', transition: 'all 0.15s' }}>
              <span style={{ fontSize: '18px' }}>{s.emoji}</span> {s.label}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Edit Session Questions Modal ──────────────────────────────────────────────
function EditSessionModal({
  session,
  onSave,
  onClose,
}: {
  session: any;
  onSave: (params: {
    sessionId: string;
    questionsSolved: number;
    correctCount: number;
    wrongCount: number;
    emptyCount: number;
    netScore?: number;
    subject?: string | null;
    topic?: string | null;
  }) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}) {
  const [questionsCount, setQuestionsCount] = useState(
    session.questions_solved ? session.questions_solved.toString() : ''
  );
  const [correctCount, setCorrectCount] = useState(
    session.correct_count !== undefined && session.correct_count !== null
      ? session.correct_count.toString()
      : ''
  );
  const [wrongCount, setWrongCount] = useState(
    session.wrong_count !== undefined && session.wrong_count !== null
      ? session.wrong_count.toString()
      : ''
  );
  const [subject, setSubject] = useState(session.subject || '');
  const [topic, setTopic] = useState(session.topic || '');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalQ = Math.max(0, parseInt(questionsCount) || 0);
  const correctQ = Math.max(0, parseInt(correctCount) || 0);
  const wrongQ = Math.max(0, parseInt(wrongCount) || 0);
  const emptyQ = Math.max(0, totalQ - (correctQ + wrongQ));
  const netQ = Math.max(0, correctQ - wrongQ * 0.25);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setErrorMessage(null);

    const res = await onSave({
      sessionId: session.id,
      questionsSolved: totalQ,
      correctCount: correctQ,
      wrongCount: wrongQ,
      emptyCount: emptyQ,
      netScore: parseFloat(netQ.toFixed(2)),
      subject: subject.trim() || session.subject || null,
      topic: topic.trim() || session.topic || null,
    });

    setIsSaving(false);
    if (res.success) {
      triggerHaptic('success');
      onClose();
    } else {
      setErrorMessage(res.error || 'Güncelleme kaydedilemedi');
      triggerHaptic('error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay-mobile"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.9, y: 25 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 25 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0f172a',
          border: '1px solid rgba(139,92,246,0.3)',
          borderRadius: '24px',
          padding: 'clamp(20px, 4vw, 32px)',
          width: '480px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
        }}
      >
        <div className="modal-drag-handle" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📝</span> Soru & Net Bilgilerini Düzenle
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '12px', margin: '4px 0 0 0' }}>
              {session.duration_minutes} dk · {session.subject || 'Serbest Çalışma'}
              {session.topic ? ` - ${session.topic}` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#9ca3af',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Hızlı Soru Çipleri */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, marginBottom: '6px' }}>HIZLI SEÇİM:</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[10, 15, 20, 25, 30, 40, 80, 120].map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setQuestionsCount(cnt.toString());
                  if (!correctCount && !wrongCount) {
                    setCorrectCount(cnt.toString());
                    setWrongCount('0');
                  }
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: `1px solid ${totalQ === cnt ? '#8b5cf6' : 'rgba(255,255,255,0.08)'}`,
                  background: totalQ === cnt ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.03)',
                  color: totalQ === cnt ? '#c4b5fd' : '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                {cnt} Soru
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', fontWeight: 700, marginBottom: '4px' }}>TOPLAM SORU</label>
              <input
                type="number"
                min={0}
                value={questionsCount}
                onChange={(e) => setQuestionsCount(e.target.value)}
                placeholder="Örn: 20"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 700,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#4ade80', fontWeight: 700, marginBottom: '4px' }}>DOĞRU (D)</label>
              <input
                type="number"
                min={0}
                value={correctCount}
                onChange={(e) => setCorrectCount(e.target.value)}
                placeholder="0"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '10px',
                  background: 'rgba(34,197,94,0.08)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  color: '#4ade80',
                  fontSize: '14px',
                  fontWeight: 700,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#f87171', fontWeight: 700, marginBottom: '4px' }}>YANLIŞ (Y)</label>
              <input
                type="number"
                min={0}
                value={wrongCount}
                onChange={(e) => setWrongCount(e.target.value)}
                placeholder="0"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '10px',
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#f87171',
                  fontSize: '14px',
                  fontWeight: 700,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Canlı Net Önizleme Kartı */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(139,92,246,0.12)',
              border: '1px solid rgba(139,92,246,0.25)',
              borderRadius: '12px',
              padding: '12px 16px',
            }}
          >
            <div>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Hesaplanan Net:</span>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#c4b5fd' }}>
                {netQ.toFixed(2)} Net
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                Boş: <strong style={{ color: '#fff' }}>{emptyQ}</strong>
              </div>
              <div style={{ fontSize: '12px', color: '#4ade80', fontWeight: 600 }}>
                Başarı: %{totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 0}
              </div>
            </div>
          </div>

          {/* Ders & Konu Alanı */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', fontWeight: 700, marginBottom: '4px' }}>DERS</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Örn: Paragraf / Matematik"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', fontWeight: 700, marginBottom: '4px' }}>KONU</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Örn: 20 Soru Rutini"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {errorMessage && (
            <div style={{ color: '#ef4444', fontSize: '12px', background: 'rgba(239,68,68,0.1)', padding: '8px 12px', borderRadius: '8px' }}>
              ⚠️ {errorMessage}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#9ca3af',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                flex: 2,
                padding: '12px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(139,92,246,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              {isSaving ? 'Kaydediliyor...' : '✓ Soru Sayısını Kaydet'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function FocusTab() {
  const router = useRouter();
  const timer = useTimer();
  const { mode, timeLeft, totalSec, isRunning, pomodoroCount, selectedSubject,
          durations, activeSound, volume, toggle, reset, skip, switchMode,
          saveSettings, setSelectedSubject, playSound, stopSound, setVolume, finishSession,
          selectedTopic, setSelectedTopic } = timer;

  const [showSettings, setShowSettings] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [soundsExpanded, setSoundsExpanded] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('pomodoro');
  const [editingSession, setEditingSession] = useState<any | null>(null);

  const [tasks, setTasks] = useState<{ id: string; text: string; done: boolean; subject?: string }[]>([]);
  const [newTask, setNewTask] = useState('');

  // Use the new Supabase hook for real data
  const { sessions: recentSessions, stats, loading: loadingSessions, refresh, updateSessionQuestions } = useFocusData();

  const handleSelectPreset = (preset: FocusPreset) => {
    triggerHaptic('medium');
    setSelectedPreset(preset.id);
    if (preset.id === 'pomodoro') {
      setSelectedSubject(null);
      setSelectedTopic(null);
      saveSettings({ ...durations, pomodoro: 25 });
    } else {
      setSelectedSubject(preset.subject);
      setSelectedTopic(preset.topic);
      saveSettings({ ...durations, pomodoro: preset.defaultMin });
    }
  };

  const todayMinutes = stats.todayTotalMin;
  const todayCount = stats.todaySessions;
  const allTimeCount = stats.allTimeCount;

  const cfg = MODE_CONFIG[mode];
  const progress = ((totalSec - timeLeft) / totalSec) * 100;
  const dashOffset = CIRC - (CIRC * progress) / 100;

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const { pendingSession } = useTimer();
  const prevPendingRef = React.useRef(pendingSession);

  useEffect(() => {
    if (prevPendingRef.current !== null && pendingSession === null) {
      refresh();
      router.refresh(); // Tell Next.js to refresh server components and clear cache
    }
    prevPendingRef.current = pendingSession;
  }, [pendingSession, refresh, router]);

  // Document title and live lock screen state are centralized in TimerContext

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks(p => [...p, { id: Date.now().toString(), text: newTask.trim(), done: false }]);
    setNewTask('');
  };
  const toggleTask = (id: string) => setTasks(p => p.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const removeTask = (id: string) => setTasks(p => p.filter(t => t.id !== id));

  const completedTasks = tasks.filter(t => t.done).length;
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
      style={{ display: 'flex', flexDirection: 'column', gap: '24px',
               maxWidth: '1280px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

      {/* Modals */}
      <AnimatePresence>
        {showSettings && (
          <SettingsModal durations={durations} onSave={saveSettings} onClose={() => setShowSettings(false)}/>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showSubjectPicker && (
          <SubjectPickerModal selected={selectedSubject} onSelect={setSelectedSubject} onClose={() => setShowSubjectPicker(false)}/>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {editingSession && (
          <EditSessionModal
            session={editingSession}
            onSave={updateSessionQuestions}
            onClose={() => setEditingSession(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontSize: 'clamp(20px, 3.5vw, 28px)', fontWeight: 800, color: '#fff', margin: '0 0 6px 0',
                       display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Target size={26} style={{ color: '#8b5cf6' }}/> Odak Merkezi
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '13.5px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            Bugün <strong style={{ color: '#fff' }}>{todayMinutes} dk</strong> çalıştın &nbsp;·&nbsp;
            <strong style={{ color: '#fff' }}>{todayCount}</strong> oturum
            &nbsp;·&nbsp; {statusMsg().text}
          </p>
        </div>
        {/* Stats pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { icon: <Flame size={14}/>, label: 'Bugün', value: `${todayMinutes}dk`, color: '#f97316' },
            { icon: <Zap size={14}/>, label: 'Oturum', value: `${allTimeCount}`, color: '#8b5cf6' },
            { icon: <Trophy size={14}/>, label: 'Pomodoro', value: `${pomodoroCount}`, color: '#fcd34d' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#131827',
                 border: `1px solid ${s.color}30`, borderRadius: '12px', padding: '6px 12px', whiteSpace: 'nowrap' }}>
              <span style={{ color: s.color, display: 'flex' }}>{s.icon}</span>
              <span style={{ color: '#9ca3af', fontSize: '11px', fontWeight: 500 }}>{s.label}:</span>
              <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="focus-main-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.28fr) minmax(0, 1fr)',
        gap: '20px',
        alignItems: 'start',
        width: '100%',
        boxSizing: 'border-box',
      }}>

        {/* ── Timer Card ── */}
        <div style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', background: '#0f172a', border: `1px solid ${cfg.glow}`, borderRadius: '28px', padding: 'clamp(20px, 3.5vw, 32px)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative',
                      overflow: 'hidden', boxShadow: `0 10px 60px -10px ${cfg.glow}` }}>
          {/* Glow bg */}
          <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
                        width: '100%', maxWidth: '300px', aspectRatio: '1/1', borderRadius: '50%',
                        background: cfg.color, filter: 'blur(100px)', opacity: 0.05, pointerEvents: 'none' }}/>

          {/* Top actions */}
          <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px', zIndex: 10 }}>
            <button onClick={() => { triggerHaptic('light'); setShowSettings(true); }} title="Süre Ayarları"
              style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '10px',
                       width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                       color: '#9ca3af', cursor: 'pointer' }}>
              <Settings size={16}/>
            </button>
            <button onClick={() => {
              triggerHaptic('medium');
              router.push('/odak');
            }} title="Tam Ekran Odak Modu"
              style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '10px',
                       width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                       color: '#9ca3af', cursor: 'pointer' }}>
              <Maximize size={16}/>
            </button>
          </div>

          {/* Mode selector */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '5px', borderRadius: '16px',
                        marginBottom: '28px', gap: '4px', width: '100%', maxWidth: '360px', justifyContent: 'center' }}>
            {(['pomodoro','shortBreak','longBreak'] as Mode[]).map(m => (
              <button key={m} onClick={() => { triggerHaptic('light'); switchMode(m); }}
                style={{ flex: 1, padding: 'clamp(7px, 2vw, 9px) clamp(8px, 2.5vw, 12px)', borderRadius: '12px', fontSize: 'clamp(11px, 2.8vw, 12px)', fontWeight: 700,
                         border: 'none', cursor: 'pointer', transition: 'all 0.2s', minWidth: 0, whiteSpace: 'nowrap',
                         background: mode === m ? MODE_CONFIG[m].color : 'transparent',
                         color: mode === m ? '#fff' : '#6b7280',
                         boxShadow: mode === m ? `0 4px 14px ${MODE_CONFIG[m].glow}` : 'none' }}>
                {MODE_CONFIG[m].label}
              </button>
            ))}
          </div>

          {/* Pomodoro dots */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
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
              <div style={{ fontSize: 'clamp(44px, 12vw, 54px)', fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums',
                            letterSpacing: '-0.03em', lineHeight: 1, textShadow: `0 0 30px ${cfg.glow}` }}>
                {fmt(timeLeft)}
              </div>
              <div style={{ fontSize: '12px', color: cfg.color, fontWeight: 700, marginTop: '6px',
                            letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {cfg.label}
              </div>
            </div>
          </div>

          {/* Active Preset Indicator */}
          {selectedPreset !== 'pomodoro' && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '5px 14px', borderRadius: '12px', marginBottom: '14px',
              background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
              color: '#c4b5fd', fontSize: '12px', fontWeight: 700
            }}>
              <span>⚡ Seçili Mod:</span>
              <span style={{ color: '#fff' }}>
                {FOCUS_PRESETS.find(p => p.id === selectedPreset)?.emoji}{' '}
                {FOCUS_PRESETS.find(p => p.id === selectedPreset)?.title}
              </span>
            </div>
          )}

          {/* Selected Subject Badge */}
          <button onClick={() => { triggerHaptic('light'); setShowSubjectPicker(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px',
                     background: selectedSubjectData ? selectedSubjectData.color + '20' : 'rgba(255,255,255,0.05)',
                     border: `1px solid ${selectedSubjectData ? selectedSubjectData.color + '40' : 'rgba(255,255,255,0.1)'}`,
                     borderRadius: '100px', padding: '7px 16px', minHeight: '38px', cursor: 'pointer', transition: 'all 0.2s' }}>
            <span style={{ fontSize: '16px' }}>{selectedSubjectData?.emoji ?? '🎯'}</span>
            <span style={{ fontSize: '13px', fontWeight: 600,
                           color: selectedSubjectData ? '#fff' : '#6b7280' }}>
              {selectedSubject ?? 'Ders Seç'}
            </span>
            <ChevronRight size={14} style={{ color: '#6b7280' }}/>
          </button>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => { triggerHaptic('warning'); reset(); }} title="Sıfırla"
              style={{ width: '50px', height: '50px', borderRadius: '50%',
                       background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                       color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', touchAction: 'manipulation' }}>
              <RotateCcw size={20}/>
            </button>
            <motion.button onClick={() => { triggerHaptic('medium'); toggle(); }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ width: '76px', height: '76px', borderRadius: '50%',
                       background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)`,
                       border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                       cursor: 'pointer', boxShadow: `0 12px 30px ${cfg.glow}`, touchAction: 'manipulation' }}>
              {isRunning ? <Pause size={34} fill="currentColor"/> : <Play size={34} fill="currentColor" style={{ marginLeft: '4px' }}/>}
            </motion.button>
            {mode === 'pomodoro' ? (
              <button onClick={() => { triggerHaptic('success'); finishSession(); }} title="Oturumu Bitir & Ders/Konu Kaydet"
                style={{ width: '50px', height: '50px', borderRadius: '50%',
                         background: 'rgba(16, 185, 129, 0.12)', border: '1.5px solid rgba(16, 185, 129, 0.45)',
                         color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                         transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(16,185,129,0.2)', touchAction: 'manipulation' }}>
                <CheckCircle2 size={22}/>
              </button>
            ) : (
              <button onClick={() => { triggerHaptic('light'); skip(); }} title="Geç"
                style={{ width: '50px', height: '50px', borderRadius: '50%',
                         background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                         color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', touchAction: 'manipulation' }}>
                <SkipForward size={20}/>
              </button>
            )}
          </div>

          {/* Dedicated Finish Button */}
          {mode === 'pomodoro' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { triggerHaptic('success'); finishSession(); }}
              style={{
                marginTop: '16px',
                width: '100%',
                maxWidth: '320px',
                minHeight: '48px',
                padding: '12px 18px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(5, 150, 105, 0.28))',
                border: '1.5px solid rgba(16, 185, 129, 0.5)',
                color: '#34d399',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(16, 185, 129, 0.2)',
                transition: 'all 0.2s',
                touchAction: 'manipulation'
              }}
            >
              <CheckCircle2 size={18} />
              Oturumu Bitir & Ders/Konu Kaydet
            </motion.button>
          )}

          {/* Tam Ekran Odak Modu Butonu */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              triggerHaptic('medium');
              router.push('/odak');
            }}
            style={{
              marginTop: '12px',
              width: '100%',
              maxWidth: '320px',
              minHeight: '44px',
              padding: '10px 18px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.16), rgba(56, 189, 248, 0.12))',
              border: '1.5px solid rgba(139, 92, 246, 0.4)',
              color: '#c4b5fd',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(139, 92, 246, 0.15)',
              transition: 'all 0.2s',
              touchAction: 'manipulation'
            }}
          >
            <Maximize size={16} />
            Tam Ekran Odak Modu
          </motion.button>

          {/* ── Entegre Hızlı Çalışma & Deneme Durumları ── */}
          {mode === 'pomodoro' ? (
            <div style={{
              width: '100%',
              marginTop: '22px',
              paddingTop: '18px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', padding: '0 2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '15px' }}>⚡</span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '0.04em' }}>
                    HIZLI ÇALIŞMA & DENEME DURUMLARI
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Tek tıkla hazır süre ve branş
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
                width: '100%'
              }}>
                {FOCUS_PRESETS.map((preset) => {
                  const isSelected = selectedPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '14px',
                        textAlign: 'left',
                        background: isSelected ? `${preset.color}22` : 'rgba(255,255,255,0.025)',
                        border: `1.5px solid ${isSelected ? preset.color : 'rgba(255,255,255,0.07)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: isSelected ? `0 4px 16px ${preset.color}35` : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '74px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '18px' }}>{preset.emoji}</span>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '6px',
                          background: isSelected ? preset.color : 'rgba(255,255,255,0.07)',
                          color: isSelected ? '#fff' : '#9ca3af'
                        }}>
                          {preset.badge}
                        </span>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? '#fff' : '#f1f5f9', lineHeight: 1.25 }}>
                          {preset.title}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                          {preset.defaultMin} dakika
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Manuel Süre Seç (Serbest Çalışma) */}
              <div style={{ marginTop: '4px' }}>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, letterSpacing: '0.08em',
                              textTransform: 'uppercase', marginBottom: '6px', textAlign: 'center' }}>
                  Manuel Süre Seç (Serbest)
                </div>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {[25, 45, 60, 90, 120, 180].map(min => {
                    const isActive = durations.pomodoro === min && selectedPreset === 'pomodoro';
                    const label = min >= 60 ? `${Math.floor(min/60)}s${min%60>0?` ${min%60}dk`:''}` : `${min}dk`;
                    return (
                      <button key={min}
                        onClick={() => {
                          triggerHaptic('light');
                          setSelectedPreset('pomodoro');
                          saveSettings({ ...durations, pomodoro: min });
                        }}
                        style={{
                          padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
                          border: `1px solid ${isActive ? cfg.color : 'rgba(255,255,255,0.08)'}`,
                          background: isActive ? cfg.color + '20' : 'rgba(255,255,255,0.03)',
                          color: isActive ? cfg.color : '#6b7280',
                          cursor: 'pointer', transition: 'all 0.15s',
                          boxShadow: isActive ? `0 0 10px ${cfg.color}30` : 'none',
                          touchAction: 'manipulation'
                        }}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Break Duration Controls */
            <div style={{ width: '100%', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, letterSpacing: '0.08em',
                            textTransform: 'uppercase', marginBottom: '8px', textAlign: 'center' }}>
                Mola Süresi Seç
              </div>
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {(mode === 'shortBreak' ? [5, 10, 15, 20] : [15, 20, 30, 45]).map(min => {
                  const isActive = durations[mode] === min;
                  return (
                    <button key={min}
                      onClick={() => {
                        triggerHaptic('light');
                        saveSettings({ ...durations, [mode]: min });
                      }}
                      style={{
                        padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                        border: `1px solid ${isActive ? cfg.color : 'rgba(255,255,255,0.08)'}`,
                        background: isActive ? cfg.color + '20' : 'rgba(255,255,255,0.03)',
                        color: isActive ? cfg.color : '#6b7280',
                        cursor: 'pointer', transition: 'all 0.15s',
                        boxShadow: isActive ? `0 0 10px ${cfg.color}30` : 'none',
                        touchAction: 'manipulation'
                      }}>
                      {min} dk
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Right Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', minWidth: 0, boxSizing: 'border-box' }}>

          {/* Daily Progress */}
          <div style={{ background: '#131827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: 'clamp(18px, 4vw, 24px)' }}>
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
          <div style={{ background: '#131827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: 'clamp(16px, 4vw, 20px)' }}>
            <button onClick={() => { triggerHaptic('light'); setSoundsExpanded(e => !e); }}
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 82px), 1fr))', gap: '8px', marginTop: '16px' }}>
                    {AMBIENT_SOUNDS.map(s => {
                      const isActive = activeSound === s.id;
                      return (
                        <button key={s.id} onClick={() => { triggerHaptic('light'); playSound(s.id, s.url); }}
                          style={{ background: isActive ? s.color + '15' : 'rgba(255,255,255,0.03)',
                                   border: `1px solid ${isActive ? s.color + '50' : 'rgba(255,255,255,0.05)'}`,
                                   borderRadius: '14px', padding: '12px 6px', minHeight: '68px',
                                   display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                   cursor: 'pointer', transition: 'all 0.2s', touchAction: 'manipulation' }}>
                          <span style={{ color: isActive ? s.color : '#6b7280', display: 'flex' }}>{s.icon}</span>
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
          <div style={{ background: '#131827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: 'clamp(18px, 4vw, 24px)' }}>
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
                         color: '#fff', cursor: 'pointer', flexShrink: 0, touchAction: 'manipulation' }}>
                <Plus size={18}/>
              </button>
            </form>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
              {tasks.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#4b5563', fontSize: '13px', padding: '16px 0' }}>
                  Henüz görev yok. Başlamak için bir görev ekle!
                </div>
              ) : tasks.map(t => (
                <motion.div key={t.id} layout
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.02)',
                           padding: '10px 12px', minHeight: '44px', borderRadius: '12px',
                           border: `1px solid ${t.done ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)'}` }}>
                  <button onClick={() => { triggerHaptic('light'); toggleTask(t.id); }}
                    style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer',
                             color: t.done ? '#10b981' : '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', minHeight: '32px', flexShrink: 0 }}>
                    {t.done ? <CheckCircle2 size={20}/> : <Circle size={20}/>}
                  </button>
                  <span style={{ flex: 1, fontSize: '13px', color: t.done ? '#6b7280' : '#e2e8f0',
                                 textDecoration: t.done ? 'line-through' : 'none', wordBreak: 'break-word' }}>
                    {t.text}
                  </span>
                  <button onClick={() => { triggerHaptic('light'); removeTask(t.id); }}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer',
                             padding: '4px', opacity: 0.6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', minHeight: '32px' }}>
                    <X size={16}/>
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
            
            <WeeklyFocusChart weekData={stats.weekData} />
            
          </div>

        </div>
      </div>

      {/* ── Recent Sessions ── */}
      <div style={{ marginTop: '24px', background: '#0f172a', border: `1px solid rgba(255,255,255,0.04)`, borderRadius: '24px', padding: 'clamp(18px, 4vw, 32px)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={18} style={{ color: '#8b5cf6' }}/> Son Çalışmalar
        </h3>
        {recentSessions.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
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
                          <span>{SUBJECTS.find(s => s.label.toLowerCase() === (session.subject || '').toLowerCase())?.emoji || '🎯'}</span>
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
                    {session.questions_solved && session.questions_solved > 0 ? (
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ color: '#38bdf8', fontWeight: 600 }}>📝 {session.questions_solved} Soru</span>
                        <span>•</span>
                        <span style={{ color: '#4ade80', fontWeight: 600 }}>{session.correct_count}D</span>
                        <span style={{ color: '#f87171', fontWeight: 600 }}>{session.wrong_count}Y</span>
                        <span>•</span>
                        <span style={{ color: '#c4b5fd', fontWeight: 700 }}>{session.net_score} Net</span>
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            setEditingSession(session);
                          }}
                          style={{
                            marginLeft: '4px',
                            padding: '2px 8px',
                            background: 'rgba(139,92,246,0.15)',
                            border: '1px solid rgba(139,92,246,0.3)',
                            borderRadius: '6px',
                            color: '#c4b5fd',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          ✏️ Düzenle
                        </button>
                      </div>
                    ) : session.mode === 'pomodoro' ? (
                      <div style={{ marginTop: '6px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            setEditingSession(session);
                          }}
                          style={{
                            padding: '3px 10px',
                            background: 'rgba(139,92,246,0.12)',
                            border: '1px dashed rgba(139,92,246,0.4)',
                            borderRadius: '8px',
                            color: '#c4b5fd',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(139,92,246,0.22)';
                            e.currentTarget.style.borderColor = 'rgba(139,92,246,0.7)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(139,92,246,0.12)';
                            e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)';
                          }}
                        >
                          <span>➕</span> Soru / Net Ekle
                        </button>
                      </div>
                    ) : null}
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
                    {session.duration_minutes} dk
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#6b7280' }}>
                  <Clock size={12}/>
                  {new Date(session.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  {' · '}
                  {new Date(session.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
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
      <style jsx>{`
        @media (max-width: 960px) {
          .focus-main-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </motion.div>
  );
}
