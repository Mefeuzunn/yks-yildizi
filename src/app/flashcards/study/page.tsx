"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Check, X, ArrowLeft, Loader2, Sparkles, Volume2, Lightbulb, RotateCw, Flame } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { haptics } from '@/lib/haptics';
import confetti from 'canvas-confetti';

function StudyContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const subject = searchParams.get('subject') || 'all';
  const topic = searchParams.get('topic');
  const mode = searchParams.get('mode') || 'due';
  const alanParam = searchParams.get('alan') || user?.alan || 'Sayisal';

  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, again: 0, hard: 0, good: 0, easy: 0, xp: 0 });

  useEffect(() => {
    fetchCards();
  }, [subject, topic, mode, alanParam, user]);

  // OFFLINE SYNC LOGIC
  useEffect(() => {
    const handleOnline = async () => {
      const queue = JSON.parse(localStorage.getItem('offline_sync_queue') || '[]');
      if (queue.length > 0) {
        for (const action of queue) {
          try {
            await fetch('/api/flashcards/review', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(action)
            });
          } catch(e) { console.error('Eşitleme hatası:', e); }
        }
        localStorage.removeItem('offline_sync_queue');
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const fetchCards = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    let url = `/api/flashcards/study?mode=${mode}&alan=${encodeURIComponent(alanParam)}`;
    if (subject && subject !== 'all' && subject !== 'Tümü') {
      url += `&subject=${encodeURIComponent(subject)}`;
    }
    if (topic && topic !== 'all' && topic !== 'Tümü') {
      url += `&topic=${encodeURIComponent(topic)}`;
    }

    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const loadedCards = Array.isArray(data) ? data : (data.cards || []);
        setCards(loadedCards);
      }
    } catch (e) {
      console.error('Flashcard verileri alınamadı:', e);
    } finally {
      setLoading(false);
    }
  };

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

  const handleReview = async (quality: number) => {
    if (cards.length === 0) return;
    if (quality === 0) haptics.impact('medium');
    else if (quality === 1) haptics.impact('light');
    else haptics.notification('success');

    const currentCard = cards[currentIndex];
    setIsFlipped(false);

    setSessionStats(prev => ({
      ...prev,
      reviewed: prev.reviewed + 1,
      xp: prev.xp + 5,
      again: quality === 0 ? prev.again + 1 : prev.again,
      hard: quality === 1 ? prev.hard + 1 : prev.hard,
      good: quality === 2 ? prev.good + 1 : prev.good,
      easy: quality >= 3 ? prev.easy + 1 : prev.easy,
    }));

    const payload = { cardId: currentCard.id || currentCard.card_id, quality };

    try {
      const res = await fetch('/api/flashcards/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Ağ hatası');
    } catch (e) {
      const queue = JSON.parse(localStorage.getItem('offline_sync_queue') || '[]');
      queue.push(payload);
      localStorage.setItem('offline_sync_queue', JSON.stringify(queue));
    }
    
    setTimeout(() => {
      if (currentIndex + 1 >= cards.length) {
        setCompleted(true);
        try {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } catch (_) {}
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    }, 200);
  };

  const handleFlip = () => {
    haptics.selection();
    setIsFlipped(!isFlipped);
  };

  // Keyboard shortcut listeners
  useEffect(() => {
    if (completed || cards.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (isFlipped) {
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
  }, [isFlipped, currentIndex, cards, completed]);

  if (!user) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: '#fff' }}>Lütfen giriş yapın.</div>;
  }

  const currentCard = cards[currentIndex];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem 1rem calc(85px + env(safe-area-inset-bottom, 20px)) 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <Link href="/flashcards" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>
          <ArrowLeft size={20} /> <span className="hidden sm:inline">Kütüphaneye Dön</span><span className="sm:hidden">Geri</span>
        </Link>
        <div style={{ textAlign: 'right' }}>
          <h1 style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>{subject === 'all' ? 'Tüm Dersler' : subject}</h1>
          {topic && <div style={{ color: '#38bdf8', fontSize: '0.9rem', fontWeight: 600 }}>{topic}</div>}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 className="spin" size={32} color="#38bdf8" /></div>
      ) : completed ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="premium-card" style={{ padding: '3rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', border: '1px solid rgba(16,185,129,0.3)', boxShadow: '0 0 40px rgba(16,185,129,0.1)' }}>
          <Sparkles size={56} color="#10b981" />
          <h2 style={{ fontSize: '1.75rem', color: '#fff', margin: '0.5rem 0' }}>Tebrikler! Seans Tamamlandı</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 460 }}>Aralıklı tekrar algoritması bilgilerini hafızanda tazeledi.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', width: '100%', maxWidth: '500px', margin: '1rem 0' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: 12 }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>{sessionStats.reviewed}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Kart</div>
            </div>
            <div style={{ background: 'rgba(239,68,68,0.1)', padding: '0.75rem', borderRadius: 12 }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ef4444' }}>{sessionStats.again}</div>
              <div style={{ fontSize: '0.75rem', color: '#fca5a5' }}>Tekrar</div>
            </div>
            <div style={{ background: 'rgba(16,185,129,0.1)', padding: '0.75rem', borderRadius: 12 }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981' }}>{sessionStats.good + sessionStats.easy}</div>
              <div style={{ fontSize: '0.75rem', color: '#86efac' }}>Bildiğin</div>
            </div>
            <div style={{ background: 'rgba(139,92,246,0.1)', padding: '0.75rem', borderRadius: 12 }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#a855f7' }}>+{sessionStats.xp}</div>
              <div style={{ fontSize: '0.75rem', color: '#d8b4fe' }}>XP</div>
            </div>
          </div>

          <Link href="/flashcards">
            <button className="btn-interactive" style={{ background: '#10b981', color: '#000', marginTop: '1rem', padding: '0.85rem 1.75rem', fontSize: '1rem', fontWeight: 800 }}>Kütüphaneye Dön</button>
          </Link>
        </motion.div>
      ) : cards.length === 0 ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="premium-card" style={{ padding: '3rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Check size={48} color="#10b981" />
          <h2 style={{ fontSize: '1.5rem', color: '#fff', margin: '0.5rem 0' }}>Tekrar Edilecek Kart Yok</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Bu filtrelere uygun kart bulunamadı veya tüm tekrarlarını zaten tamamladın.</p>
          <Link href="/flashcards">
            <button className="btn-interactive" style={{ background: 'rgba(255,255,255,0.1)', marginTop: '1rem', padding: '0.75rem 1.5rem' }}>Derslere Dön</button>
          </Link>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          
          {/* Progress Indicator */}
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${((currentIndex + 1) / cards.length) * 100}%`, background: '#38bdf8', transition: 'width 0.3s' }} />
            </div>
            <span style={{ fontWeight: 700, color: '#f1f5f9' }}>{currentIndex + 1} / {cards.length}</span>
          </div>

          {/* Swipeable & Flippable Card */}
          <motion.div 
            key={currentCard?.id || currentIndex}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.65}
            onDragEnd={(e, info) => {
              if (info.offset.x > 100 || info.velocity.x > 500) {
                // Swiped RIGHT -> İyi (Biliyorum)
                handleReview(2);
              } else if (info.offset.x < -100 || info.velocity.x < -500) {
                // Swiped LEFT -> Tekrar
                handleReview(0);
              }
            }}
            className="flashcard-flip-container"
            style={{ 
              perspective: '1200px', 
              width: '100%', 
              minHeight: '340px', 
              cursor: 'pointer',
              touchAction: 'pan-y',
            }}
            onClick={handleFlip}
          >
            <motion.div 
              style={{
                width: '100%', minHeight: '340px',
                position: 'relative',
                transformStyle: 'preserve-3d',
              }}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            >
              {/* FRONT */}
              <div 
                className="premium-card" 
                style={{ 
                  position: 'absolute', inset: 0,
                  backfaceVisibility: 'hidden',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  background: 'linear-gradient(145deg, #1e293b, #0f1015)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                  padding: '1.75rem',
                  borderRadius: 20
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8', background: 'rgba(56,189,248,0.1)', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      {currentCard.category || 'TYT/AYT'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {currentCard.subject} · {currentCard.topic}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => speak(currentCard.front_text, e)}
                    style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '6px', padding: '6px', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    <Volume2 size={16} />
                  </button>
                </div>

                <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                  <h2 style={{ fontSize: 'clamp(1.15rem, 3.5vw, 1.45rem)', color: '#fff', textAlign: 'center', padding: '0 0.5rem', lineHeight: 1.5, margin: 0 }}>
                    {currentCard.front_text}
                  </h2>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <BrainCircuit size={15} /> Boşluk (Space) veya tıkla: Cevabı Gör
                  </span>
                  <span style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <RotateCw size={14} /> Çevir
                  </span>
                </div>
              </div>

              {/* BACK */}
              <div 
                className="premium-card" 
                style={{ 
                  position: 'absolute', inset: 0,
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  background: 'linear-gradient(145deg, #0f1015, #1e293b)',
                  border: '1px solid rgba(56,189,248,0.3)',
                  boxShadow: '0 20px 40px rgba(56,189,248,0.15)',
                  padding: '1.75rem',
                  borderRadius: 20
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    ✓ Cevap & Çözüm
                  </span>
                  <button 
                    onClick={(e) => speak(currentCard.back_text, e)}
                    style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '6px', padding: '6px', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    <Volume2 size={16} />
                  </button>
                </div>

                <div style={{ margin: '1rem 0', maxHeight: '180px', overflowY: 'auto' }}>
                  <p style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', color: '#f1f5f9', textAlign: 'center', padding: '0 0.5rem', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-line' }}>
                    {currentCard.back_text}
                  </p>

                  {currentCard.tip && (
                    <div style={{ marginTop: '0.75rem', padding: '0.65rem 0.85rem', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start', textAlign: 'left' }}>
                      <Lightbulb size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '0.8rem', color: '#fde68a', lineHeight: 1.4 }}>
                        {currentCard.tip}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    🎯 1-4 tuşlarıyla puanla
                  </span>
                  <span style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600 }}>
                    SM-2 Algoritması
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <AnimatePresence>
            {isFlipped && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="study-actions-grid"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', width: '100%' }}
              >
                <button onClick={() => handleReview(0)} className="btn-interactive study-action-btn" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)', padding: '0.85rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', borderRadius: '14px' }}>
                  <X size={20} /> 
                  <span className="study-action-label" style={{ fontWeight: 800, fontSize: '0.9rem' }}>Tekrar (1)</span> 
                  <span className="study-action-desc" style={{ fontSize: '0.7rem', opacity: 0.8 }}>Yarın</span>
                </button>
                <button onClick={() => handleReview(1)} className="btn-interactive study-action-btn" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)', padding: '0.85rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', borderRadius: '14px' }}>
                  <BrainCircuit size={20} /> 
                  <span className="study-action-label" style={{ fontWeight: 800, fontSize: '0.9rem' }}>Zor (2)</span> 
                  <span className="study-action-desc" style={{ fontSize: '0.7rem', opacity: 0.8 }}>2 Gün</span>
                </button>
                <button onClick={() => handleReview(2)} className="btn-interactive study-action-btn" style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.25)', padding: '0.85rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', borderRadius: '14px' }}>
                  <Check size={20} /> 
                  <span className="study-action-label" style={{ fontWeight: 800, fontSize: '0.9rem' }}>İyi (3)</span> 
                  <span className="study-action-desc" style={{ fontSize: '0.7rem', opacity: 0.8 }}>4 Gün</span>
                </button>
                <button onClick={() => handleReview(3)} className="btn-interactive study-action-btn" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)', padding: '0.85rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', borderRadius: '14px' }}>
                  <Sparkles size={20} /> 
                  <span className="study-action-label" style={{ fontWeight: 800, fontSize: '0.9rem' }}>Kolay (4)</span> 
                  <span className="study-action-desc" style={{ fontSize: '0.7rem', opacity: 0.8 }}>7+ Gün</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      )}
      
      <style jsx>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .flashcard-flip-container {
            min-height: 300px !important;
          }
          .study-actions-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 0.6rem !important;
          }
          .study-action-btn {
            padding: 0.85rem 0.5rem !important;
            border-radius: 14px !important;
          }
          .study-action-label {
            font-size: 0.9rem !important;
          }
          .study-action-desc {
            font-size: 0.75rem !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function StudyPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 className="spin" size={32} color="#38bdf8" /></div>}>
      <StudyContent />
    </Suspense>
  );
}
