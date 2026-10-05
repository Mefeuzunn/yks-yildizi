import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCcw, 
  Plus, 
  Loader2, 
  BookOpen, 
  Brain, 
  X, 
  Check, 
  Volume2, 
  Sparkles, 
  Zap, 
  Flame, 
  Award,
  ChevronRight,
  RotateCw,
  Lightbulb,
  Layers,
  GraduationCap
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FlashCard {
  id: string;
  card_id?: string;
  front_text: string;
  back_text: string;
  subject: string;
  topic: string;
  category?: 'TYT' | 'AYT' | 'TYT/AYT';
  tip?: string;
  status?: string;
  ease_factor?: number;
  interval?: number;
  repetitions?: number;
  review_count?: number;
  next_review_date?: string;
}

interface TopicStats {
  total: number;
  due: number;
  mastered: number;
  learning: number;
}

interface SubjectGroup {
  [topic: string]: TopicStats;
}

const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  'Matematik': { bg: 'rgba(99, 102, 241, 0.12)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.3)', gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
  'Geometri': { bg: 'rgba(168, 85, 247, 0.12)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.3)', gradient: 'linear-gradient(135deg, #a855f7, #9333ea)' },
  'Fizik': { bg: 'rgba(6, 182, 212, 0.12)', text: '#22d3ee', border: 'rgba(6, 182, 212, 0.3)', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
  'Kimya': { bg: 'rgba(16, 185, 129, 0.12)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
  'Biyoloji': { bg: 'rgba(132, 204, 22, 0.12)', text: '#a3e635', border: 'rgba(132, 204, 22, 0.3)', gradient: 'linear-gradient(135deg, #84cc16, #65a30d)' },
  'Türkçe': { bg: 'rgba(245, 158, 11, 0.12)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  'Türk Dili ve Edebiyatı': { bg: 'rgba(236, 72, 153, 0.12)', text: '#f472b6', border: 'rgba(236, 72, 153, 0.3)', gradient: 'linear-gradient(135deg, #ec4899, #db2777)' },
  'Tarih': { bg: 'rgba(249, 115, 22, 0.12)', text: '#fb923c', border: 'rgba(249, 115, 22, 0.3)', gradient: 'linear-gradient(135deg, #f97316, #ea580c)' },
  'Coğrafya': { bg: 'rgba(20, 184, 166, 0.12)', text: '#2dd4bf', border: 'rgba(20, 184, 166, 0.3)', gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)' },
  'Felsefe & Din': { bg: 'rgba(192, 132, 252, 0.12)', text: '#d8b4fe', border: 'rgba(192, 132, 252, 0.3)', gradient: 'linear-gradient(135deg, #c084fc, #9333ea)' },
};

const DEFAULT_SUBJECT_COLOR = { bg: 'rgba(148, 163, 184, 0.12)', text: '#cbd5e1', border: 'rgba(148, 163, 184, 0.3)', gradient: 'linear-gradient(135deg, #64748b, #475569)' };

export default function CardsTab() {
  const [flipped, setFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [studying, setStudying] = useState(false);
  const [studyCards, setStudyCards] = useState<FlashCard[]>([]);
  const [activeSubject, setActiveSubject] = useState<string>('Tümü');
  const [activeFilter, setActiveFilter] = useState<'all' | 'due'>('all');
  const [grouped, setGrouped] = useState<Record<string, SubjectGroup>>({});
  const [stats, setStats] = useState({ totalCards: 0, totalDue: 0, totalMastered: 0, totalLearning: 0 });
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, easy: 0, good: 0, hard: 0, again: 0, xp: 0 });
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Card creation state
  const [newSubject, setNewSubject] = useState('Matematik');
  const [newTopic, setNewTopic] = useState('');
  const [newCategory, setNewCategory] = useState<'TYT' | 'AYT' | 'TYT/AYT'>('TYT/AYT');
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newTip, setNewTip] = useState('');
  const [creating, setCreating] = useState(false);

  const subjectsList = [
    'Matematik', 'Geometri', 'Fizik', 'Kimya', 'Biyoloji', 
    'Türkçe', 'Türk Dili ve Edebiyatı', 'Tarih', 'Coğrafya', 'Felsefe & Din'
  ];

  // Fetch flashcard library and stats
  const fetchFlashcards = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/flashcards');
      if (res.ok) {
        const data = await res.json();
        setGrouped(data.grouped || {});
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Flashcards yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  // Text to Speech
  const speak = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (_) {}
  };

  // Start study session
  const startStudy = async (subject: string, topic?: string, mode: 'due' | 'all' = 'due') => {
    setLoading(true);
    setCurrentIndex(0);
    setFlipped(false);
    setSessionCompleted(false);
    setSessionStats({ reviewed: 0, easy: 0, good: 0, hard: 0, again: 0, xp: 0 });

    try {
      let url = `/api/flashcards/study?mode=${mode}`;
      if (subject && subject !== 'Tümü') {
        url += `&subject=${encodeURIComponent(subject)}`;
      }
      if (topic && topic !== 'Tümü') {
        url += `&topic=${encodeURIComponent(topic)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const cards = Array.isArray(data) ? data : (data.cards || []);
        setStudyCards(cards);
        setStudying(true);
      }
    } catch (err) {
      console.error('Study cards yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  // SuperMemo SM-2 Review Handler
  const handleReview = async (quality: number) => {
    const card = studyCards[currentIndex];
    if (!card) return;

    const cardId = card.id || card.card_id;

    // Update session metrics
    setSessionStats(prev => ({
      ...prev,
      reviewed: prev.reviewed + 1,
      xp: prev.xp + 5,
      again: quality === 0 ? prev.again + 1 : prev.again,
      hard: quality === 1 ? prev.hard + 1 : prev.hard,
      good: quality === 2 ? prev.good + 1 : prev.good,
      easy: quality >= 3 ? prev.easy + 1 : prev.easy,
    }));

    try {
      await fetch('/api/flashcards/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, quality })
      });
    } catch (err) {
      console.error('Review kaydedilemedi:', err);
    }

    setFlipped(false);

    // Proceed to next card or finish session
    setTimeout(() => {
      if (currentIndex < studyCards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setSessionCompleted(true);
        try {
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        } catch (_) {}
      }
    }, 220);
  };

  // Keyboard shortcut listeners
  useEffect(() => {
    if (!studying || sessionCompleted || studyCards.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setFlipped(prev => !prev);
      } else if (flipped) {
        if (e.key === '1') {
          e.preventDefault();
          handleReview(0);
        } else if (e.key === '2') {
          e.preventDefault();
          handleReview(1);
        } else if (e.key === '3') {
          e.preventDefault();
          handleReview(2);
        } else if (e.key === '4') {
          e.preventDefault();
          handleReview(3);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [studying, flipped, currentIndex, studyCards, sessionCompleted]);

  // Create new user card
  const handleCreate = async () => {
    if (!newFront.trim() || !newBack.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: newSubject,
          topic: newTopic || 'Genel',
          category: newCategory,
          front: newFront.trim(),
          back: newBack.trim(),
          tip: newTip.trim()
        })
      });
      if (res.ok) {
        setNewFront('');
        setNewBack('');
        setNewTopic('');
        setNewTip('');
        setShowCreateModal(false);
        fetchFlashcards();
      }
    } catch (err) {
      console.error('Kart kaydedilemedi:', err);
    } finally {
      setCreating(false);
    }
  };

  if (loading && !studying) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '340px', gap: '1rem' }}>
        <Loader2 className="animate-spin" size={36} color="#8b5cf6" />
        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>MEB / ÖSYM Bilgi Kartları Yükleniyor...</span>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ── STUDY MODE (Interactive Spaced Repetition) ───────────────────────────
  // ════════════════════════════════════════════════════════════════════════════
  if (studying) {
    if (sessionCompleted) {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          style={{ maxWidth: '640px', margin: '2rem auto', textAlign: 'center', padding: '2.5rem 1.5rem', background: 'rgba(15, 23, 42, 0.85)', borderRadius: '24px', border: '1px solid rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(16px)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
        >
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)' }}>
            <Sparkles size={36} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Tebrikler, Tekrar Tamamlandı!</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2rem' }}>Aralıklı tekrar algoritması bilgilerini hafızana perçinledi.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem 0.5rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{sessionStats.reviewed}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Kart</div>
            </div>
            <div style={{ background: 'rgba(239,68,68,0.08)', padding: '1rem 0.5rem', borderRadius: '14px', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4444' }}>{sessionStats.again}</div>
              <div style={{ fontSize: '0.75rem', color: '#f87171' }}>Tekrar</div>
            </div>
            <div style={{ background: 'rgba(16,185,129,0.08)', padding: '1rem 0.5rem', borderRadius: '14px', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{sessionStats.good + sessionStats.easy}</div>
              <div style={{ fontSize: '0.75rem', color: '#34d399' }}>Öğrenildi</div>
            </div>
            <div style={{ background: 'rgba(139,92,246,0.08)', padding: '1rem 0.5rem', borderRadius: '14px', border: '1px solid rgba(139,92,246,0.2)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a855f7' }}>+{sessionStats.xp}</div>
              <div style={{ fontSize: '0.75rem', color: '#c084fc' }}>Kazanılan XP</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setStudying(false);
                setStudyCards([]);
                fetchFlashcards();
              }}
              style={{ padding: '0.85rem 1.75rem', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, fontSize: '0.95rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}
            >
              📚 Kütüphaneye Dön
            </button>
            <button
              onClick={() => startStudy('Tümü', undefined, 'due')}
              style={{ padding: '0.85rem 1.5rem', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontWeight: 600, fontSize: '0.95rem', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
            >
              ⚡ Başka Tekrara Geç
            </button>
          </div>
        </motion.div>
      );
    }

    if (studyCards.length === 0) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '4rem 1.5rem', maxWidth: 480, margin: '0 auto' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Check size={32} color="#10b981" />
          </div>
          <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Tekrar Bekleyen Kart Yok!</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Bu konu veya dersteki tüm kartları gününde tekrar ettin. Genel pratik için kütüphaneye dönebilirsin.</p>
          <button 
            onClick={() => { setStudying(false); fetchFlashcards(); }}
            style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: 'rgba(139,92,246,0.15)', color: '#c084fc', border: '1px solid rgba(139,92,246,0.3)', fontWeight: 600, cursor: 'pointer' }}
          >
            ← Kütüphaneye Dön
          </button>
        </motion.div>
      );
    }

    const currentCard = studyCards[currentIndex];
    const subTheme = SUBJECT_COLORS[currentCard.subject] || DEFAULT_SUBJECT_COLOR;

    return (
      <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            onClick={() => { setStudying(false); setStudyCards([]); fetchFlashcards(); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}
          >
            ← Kütüphaneye Dön
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', padding: '3px 10px', borderRadius: '20px', background: subTheme.bg, color: subTheme.text, border: `1px solid ${subTheme.border}`, fontWeight: 700 }}>
              {currentCard.subject}
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f1f5f9' }}>
              {currentIndex + 1} / {studyCards.length}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
          <div 
            style={{ 
              height: '100%', 
              width: `${((currentIndex + 1) / studyCards.length) * 100}%`, 
              background: 'linear-gradient(90deg, #8b5cf6, #38bdf8)', 
              transition: 'width 0.3s ease' 
            }} 
          />
        </div>

        {/* 3D Flip Card Container */}
        <div style={{ perspective: '1200px', width: '100%', minHeight: '360px' }}>
          <motion.div
            style={{ 
              width: '100%', 
              minHeight: '360px', 
              position: 'relative', 
              transformStyle: 'preserve-3d', 
              cursor: 'pointer' 
            }}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 220, damping: 22 }}
            onClick={() => setFlipped(!flipped)}
          >
            {/* FRONT FACE */}
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                backfaceVisibility: 'hidden',
                borderRadius: '24px',
                padding: '2rem 1.75rem',
                background: 'linear-gradient(145deg, #131b2e, #0b0f19)',
                border: '1px solid rgba(139, 92, 246, 0.25)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                    {currentCard.category || 'TYT/AYT'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {currentCard.topic}
                  </span>
                </div>
                <button 
                  onClick={(e) => speak(currentCard.front_text, e)}
                  title="Sesli Dinle"
                  style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', padding: '6px', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <Volume2 size={18} />
                </button>
              </div>

              <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                <p style={{ color: '#f8fafc', fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
                  {currentCard.front_text}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  💡 Boşluk (Space) veya tıkla: Cevabı Gör
                </span>
                <span style={{ fontSize: '0.75rem', color: '#a855f7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <RotateCw size={14} /> Çevir
                </span>
              </div>
            </div>

            {/* BACK FACE */}
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                borderRadius: '24px',
                padding: '2rem 1.75rem',
                background: 'linear-gradient(145deg, #0b1120, #020617)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                boxShadow: '0 20px 40px rgba(56, 189, 248, 0.1), inset 0 1px 0 rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}>
                  ✓ Çözüm / Doğru Cevap
                </span>
                <button 
                  onClick={(e) => speak(currentCard.back_text, e)}
                  title="Sesli Dinle"
                  style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', padding: '6px', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <Volume2 size={18} />
                </button>
              </div>

              <div style={{ margin: '1rem 0', maxHeight: '180px', overflowY: 'auto' }}>
                <p style={{ color: '#f1f5f9', fontSize: '1.05rem', fontWeight: 500, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
                  {currentCard.back_text}
                </p>

                {currentCard.tip && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <Lightbulb size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '0.85rem', color: '#fde68a', lineHeight: 1.5 }}>
                      {currentCard.tip}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  🎯 Alttaki butonlarla veya 1-4 tuşlarıyla puanla
                </span>
                <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>
                  SM-2 Aralıklı Tekrar
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Spaced Repetition Rating Buttons */}
        <AnimatePresence>
          {flipped && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 10 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}
            >
              {/* Rating 0: Tekrar */}
              <button
                onClick={() => handleReview(0)}
                style={{
                  padding: '1rem 0.5rem',
                  borderRadius: '16px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#ef4444',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>🔴 Tekrar</div>
                <div style={{ fontSize: '0.7rem', color: '#fca5a5' }}>Yarın (1 Tuşu)</div>
              </button>

              {/* Rating 1: Zor */}
              <button
                onClick={() => handleReview(1)}
                style={{
                  padding: '1rem 0.5rem',
                  borderRadius: '16px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  color: '#f59e0b',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>🟡 Zor</div>
                <div style={{ fontSize: '0.7rem', color: '#fcd34d' }}>2 Gün (2 Tuşu)</div>
              </button>

              {/* Rating 2: İyi */}
              <button
                onClick={() => handleReview(2)}
                style={{
                  padding: '1rem 0.5rem',
                  borderRadius: '16px',
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  color: '#38bdf8',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>🟢 İyi</div>
                <div style={{ fontSize: '0.7rem', color: '#7dd3fc' }}>4 Gün (3 Tuşu)</div>
              </button>

              {/* Rating 3: Kolay */}
              <button
                onClick={() => handleReview(3)}
                style={{
                  padding: '1rem 0.5rem',
                  borderRadius: '16px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  color: '#10b981',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>💎 Kolay</div>
                <div style={{ fontSize: '0.7rem', color: '#6ee7b7' }}>7+ Gün (4 Tuşu)</div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ── MAIN LIBRARY DASHBOARD ───────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════════════
  const subjectListEntries = Object.entries(grouped);
  const filteredEntries = activeSubject === 'Tümü' 
    ? subjectListEntries 
    : subjectListEntries.filter(([s]) => s === activeSubject);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.75rem' }}>🎴</span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              MEB & ÖSYM Bilgi Kartları
            </h2>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
            SuperMemo SM-2 Spaced Repetition (Aralıklı Tekrar) ile unutmayı tarihe göm.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {stats.totalDue > 0 && (
            <button
              onClick={() => startStudy('Tümü', undefined, 'due')}
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.88rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)',
              }}
            >
              <Flame size={18} /> {stats.totalDue} Tekrarı Başlat
            </button>
          )}

          <button 
            onClick={() => setShowCreateModal(true)} 
            style={{ 
              padding: '10px 18px', 
              backgroundColor: 'rgba(139, 92, 246, 0.15)', 
              color: '#c084fc', 
              border: '1px solid rgba(139, 92, 246, 0.3)', 
              borderRadius: '12px', 
              fontWeight: 600, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              cursor: 'pointer',
              fontSize: '0.88rem'
            }}
          >
            <Plus size={18} /> Kendi Kartını Ekle
          </button>
        </div>
      </div>

      {/* Spaced Repetition Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>{stats.totalCards}</div>
          <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginTop: 4 }}>Toplam Bilgi Kartı</div>
        </div>
        
        <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 16, padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: stats.totalDue > 0 ? '#f59e0b' : '#10b981' }}>{stats.totalDue}</div>
          <div style={{ fontSize: 12, color: '#fcd34d', fontWeight: 600, marginTop: 4 }}>Tekrar Bekleyen (Due)</div>
        </div>

        <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: 16, padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#38bdf8' }}>{stats.totalLearning}</div>
          <div style={{ fontSize: 12, color: '#7dd3fc', fontWeight: 600, marginTop: 4 }}>Öğrenilmekte Olan</div>
        </div>

        <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 16, padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#10b981' }}>{stats.totalMastered}</div>
          <div style={{ fontSize: 12, color: '#6ee7b7', fontWeight: 600, marginTop: 4 }}>Ustalaşılan (Mastered)</div>
        </div>
      </div>

      {/* Subject Filter Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px', WebkitOverflowScrolling: 'touch' }}>
        <button
          onClick={() => setActiveSubject('Tümü')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            border: activeSubject === 'Tümü' ? '1px solid #8b5cf6' : '1px solid rgba(255,255,255,0.08)',
            background: activeSubject === 'Tümü' ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'rgba(255,255,255,0.03)',
            color: activeSubject === 'Tümü' ? '#fff' : '#94a3b8',
            cursor: 'pointer'
          }}
        >
          🌟 Tüm Dersler ({stats.totalCards})
        </button>
        {subjectsList.map(sub => {
          const subCards = grouped[sub] ? Object.values(grouped[sub]).reduce((s, t) => s + t.total, 0) : 0;
          const subDue = grouped[sub] ? Object.values(grouped[sub]).reduce((s, t) => s + t.due, 0) : 0;
          const isSelected = activeSubject === sub;
          const theme = SUBJECT_COLORS[sub] || DEFAULT_SUBJECT_COLOR;

          return (
            <button
              key={sub}
              onClick={() => setActiveSubject(sub)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                border: isSelected ? `1px solid ${theme.text}` : '1px solid rgba(255,255,255,0.08)',
                background: isSelected ? theme.bg : 'rgba(255,255,255,0.03)',
                color: isSelected ? theme.text : '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {sub}
              <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>({subCards})</span>
              {subDue > 0 && (
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Decks Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.25rem' }}>
        {filteredEntries.map(([subject, topics]) => {
          const total = Object.values(topics).reduce((s, t) => s + t.total, 0);
          const due = Object.values(topics).reduce((s, t) => s + t.due, 0);
          const mastered = Object.values(topics).reduce((s, t) => s + t.mastered, 0);
          const theme = SUBJECT_COLORS[subject] || DEFAULT_SUBJECT_COLOR;
          const masteryPercent = total > 0 ? Math.round((mastered / total) * 100) : 0;

          return (
            <div 
              key={subject}
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 20,
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                backdropFilter: 'blur(8px)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: theme.gradient }} />

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                    {subject}
                  </h3>
                  {due > 0 ? (
                    <span style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: 20, border: '1px solid rgba(245,158,11,0.3)' }}>
                      {due} tekrar hazır
                    </span>
                  ) : (
                    <span style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                      ✓ Güncel
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                  {total} MEB Kartı · {Object.keys(topics).length} Alt Konu
                </div>

                {/* Mastery Progress Bar */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>
                    <span>Kalıcı Hafıza Başarısı</span>
                    <span style={{ fontWeight: 700, color: masteryPercent > 50 ? '#10b981' : '#94a3b8' }}>%{masteryPercent}</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${masteryPercent}%`, background: theme.gradient, borderRadius: 3, transition: 'width 0.5s ease' }} />
                  </div>
                </div>

                {/* Topics Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {Object.entries(topics).slice(0, 4).map(([tName, tStats]) => (
                    <span 
                      key={tName}
                      onClick={() => startStudy(subject, tName, 'all')}
                      title="Bu konuyu çalış"
                      style={{
                        fontSize: '0.75rem',
                        padding: '3px 8px',
                        background: 'rgba(255,255,255,0.04)',
                        color: '#94a3b8',
                        borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.06)',
                        cursor: 'pointer'
                      }}
                    >
                      {tName} {tStats.due > 0 && <span style={{ color: '#f59e0b' }}>•</span>}
                    </span>
                  ))}
                  {Object.keys(topics).length > 4 && (
                    <span style={{ fontSize: '0.75rem', color: '#64748b', padding: '3px 6px' }}>
                      +{Object.keys(topics).length - 4} konu
                    </span>
                  )}
                </div>
              </div>

              {/* Study Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem' }}>
                <button
                  onClick={() => startStudy(subject, undefined, 'due')}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: due > 0 ? theme.gradient : 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Zap size={16} /> {due > 0 ? 'Tekrara Başla' : 'Gözden Geçir'}
                </button>
                <button
                  onClick={() => startStudy(subject, undefined, 'all')}
                  title="Tüm kartları sırayla çalış"
                  style={{
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#cbd5e1',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Tümü ({total})
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Custom Card Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }} 
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              onClick={e => e.stopPropagation()}
              style={{ background: '#0f172a', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 24, padding: '2rem', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={20} color="#a855f7" />
                  <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Özel Tekrar Kartı Ekle</h3>
                </div>
                <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6, fontWeight: 700 }}>Ders</label>
                    <select 
                      value={newSubject} 
                      onChange={e => setNewSubject(e.target.value)} 
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #334155', background: '#1e293b', color: '#fff', fontSize: 14 }}
                    >
                      {subjectsList.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6, fontWeight: 700 }}>Kategori</label>
                    <select 
                      value={newCategory} 
                      onChange={e => setNewCategory(e.target.value as any)} 
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #334155', background: '#1e293b', color: '#fff', fontSize: 14 }}
                    >
                      <option value="TYT">TYT</option>
                      <option value="AYT">AYT</option>
                      <option value="TYT/AYT">TYT / AYT</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6, fontWeight: 700 }}>Konu Başlığı</label>
                  <input 
                    value={newTopic} 
                    onChange={e => setNewTopic(e.target.value)} 
                    placeholder="Örn: Türev, Fotosentez, Divan Edebiyatı..." 
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #334155', background: '#1e293b', color: '#fff', fontSize: 14, outline: 'none' }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6, fontWeight: 700 }}>Soru / Ön Yüz (Kavram, Formül veya Soru)</label>
                  <textarea 
                    value={newFront} 
                    onChange={e => setNewFront(e.target.value)} 
                    placeholder="Kartın ön yüzünde görünecek soru veya hatırlatıcı..." 
                    rows={3} 
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #334155', background: '#1e293b', color: '#fff', fontSize: 14, resize: 'vertical', outline: 'none' }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6, fontWeight: 700 }}>Cevap / Arka Yüz (Tanım, Çözüm veya Açıklama)</label>
                  <textarea 
                    value={newBack} 
                    onChange={e => setNewBack(e.target.value)} 
                    placeholder="Kartın arka yüzünde görünecek açıklayıcı tam cevap..." 
                    rows={3} 
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #334155', background: '#1e293b', color: '#fff', fontSize: 14, resize: 'vertical', outline: 'none' }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6, fontWeight: 700 }}>ÖSYM Tüyosu / Hafıza Çivisi (İsteğe Bağlı)</label>
                  <input 
                    value={newTip} 
                    onChange={e => setNewTip(e.target.value)} 
                    placeholder="Örn: 💡 'KİMYA' kodlamasıyla hatırla..." 
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #334155', background: '#1e293b', color: '#fff', fontSize: 14, outline: 'none' }} 
                  />
                </div>

                <button 
                  onClick={handleCreate} 
                  disabled={creating || !newFront.trim() || !newBack.trim()} 
                  style={{ 
                    marginTop: '0.5rem',
                    padding: '12px', 
                    borderRadius: 14, 
                    border: 'none', 
                    background: creating ? '#334155' : 'linear-gradient(135deg, #8b5cf6, #6366f1)', 
                    color: '#fff', 
                    fontWeight: 800, 
                    cursor: creating ? 'not-allowed' : 'pointer', 
                    fontSize: 15,
                    boxShadow: '0 4px 16px rgba(139,92,246,0.3)'
                  }}
                >
                  {creating ? 'Kaydediliyor...' : '✨ Kartı Sisteme Ekle'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
