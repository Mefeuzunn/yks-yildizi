"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Check, X, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { haptics } from '@/lib/haptics';

function StudyContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const subject = searchParams.get('subject');
  const topic = searchParams.get('topic');

  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!subject) {
      router.push('/flashcards');
      return;
    }
    fetchCards();
  }, [subject, topic, user]);

  // OFFLINE SYNC LOGIC
  useEffect(() => {
    const handleOnline = async () => {
      console.log('Bağlantı geldi, çevrimdışı veriler eşitleniyor...');
      const queue = JSON.parse(localStorage.getItem('offline_sync_queue') || '[]');
      if (queue.length > 0) {
        for (const action of queue) {
          try {
            await fetch('/api/flashcards/review', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(action)
            });
          } catch(e) { console.error('Eşitleme hatası:', e); }
        }
        localStorage.removeItem('offline_sync_queue');
        console.log('Eşitleme tamamlandı.');
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
    
    let url = `/api/flashcards/study?subject=${encodeURIComponent(subject || '')}`;
    if (topic) url += `&topic=${encodeURIComponent(topic)}`;
    const cacheKey = `flashcards_cache_${subject}_${topic || 'all'}`;

    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCards(data.cards || []);
        // Save to cache for offline use
        localStorage.setItem(cacheKey, JSON.stringify(data.cards || []));
      }
    } catch (e) {
      console.log('Çevrimdışı mod, önbellekten yükleniyor...');
      // Fallback to cache if offline
      const cached = localStorage.getItem(cacheKey);
      if (cached) setCards(JSON.parse(cached));
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (quality: number) => {
    if (cards.length === 0) return;
    if (quality === 0) haptics.impact('medium');
    else if (quality === 1) haptics.impact('light');
    else haptics.notification('success');

    const currentCard = cards[currentIndex];
    setIsFlipped(false);

    const payload = { cardId: currentCard.id || currentCard.card_id, quality };

    try {
      const res = await fetch('/api/flashcards/review', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Ağ hatası');
    } catch (e) {
      console.log('Çevrimdışı kayıt, bağlantı geldiğinde eşitlenecek.');
      // Push to offline queue
      const queue = JSON.parse(localStorage.getItem('offline_sync_queue') || '[]');
      queue.push(payload);
      localStorage.setItem('offline_sync_queue', JSON.stringify(queue));
    }
    
    if (currentIndex + 1 >= cards.length) {
      setCompleted(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleFlip = () => {
    haptics.selection();
    setIsFlipped(!isFlipped);
  };

  if (!user) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: '#fff' }}>Lütfen giriş yapın.</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem 1rem calc(85px + env(safe-area-inset-bottom, 20px)) 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
         <Link href="/flashcards" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>
            <ArrowLeft size={20} /> <span className="hidden sm:inline">Kütüphaneye Dön</span><span className="sm:hidden">Geri</span>
         </Link>
         <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>{subject}</h1>
            {topic && <div style={{ color: '#38bdf8', fontSize: '0.9rem', fontWeight: 600 }}>{topic}</div>}
         </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 className="spin" size={32} color="#38bdf8" /></div>
      ) : completed || cards.length === 0 ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="premium-card" style={{ padding: '3rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', border: '1px solid rgba(16,185,129,0.3)', boxShadow: '0 0 40px rgba(16,185,129,0.1)' }}>
          <Sparkles size={56} color="#10b981" />
          <h2 style={{ fontSize: '1.75rem', color: '#fff', margin: '1rem 0 0.5rem' }}>Harika İş!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Bu {topic ? 'konudaki' : 'dersteki'} tekrarlarını başarıyla tamamladın.</p>
          <Link href="/flashcards">
             <button className="btn-interactive" style={{ background: '#10b981', color: '#000', marginTop: '1.5rem', padding: '0.85rem 1.75rem', fontSize: '1rem', fontWeight: 800 }}>Derslere Dön</button>
          </Link>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          
          {/* Progress Indicator */}
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
             <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${((currentIndex) / cards.length) * 100}%`, background: '#38bdf8', transition: 'width 0.3s' }}></div>
             </div>
             <span style={{ fontWeight: 600 }}>{currentIndex + 1} / {cards.length}</span>
          </div>

          <div 
            className="flashcard-flip-container"
            style={{ 
              perspective: '1000px', 
              width: '100%', 
              height: '320px', 
              cursor: 'pointer' 
            }}
            onClick={handleFlip}
          >
            <motion.div 
              style={{
                width: '100%', height: '100%',
                position: 'relative',
                transformStyle: 'preserve-3d',
              }}
              animate={{ rotateX: isFlipped ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              {/* Front */}
              <div 
                className="premium-card" 
                style={{ 
                  position: 'absolute', width: '100%', height: '100%', 
                  backfaceVisibility: 'hidden',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(145deg, #1e293b, #0f1015)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                  padding: '1.5rem'
                }}
              >
                <div style={{ position: 'absolute', top: '1rem', left: '1rem', fontSize: '0.75rem', color: '#38bdf8', background: 'rgba(56,189,248,0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                  Soru / Terim
                </div>
                <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.75rem)', color: '#fff', textAlign: 'center', padding: '0 1rem', lineHeight: 1.4, margin: 0 }}>
                  {cards[currentIndex].front_text}
                </h2>
                <div style={{ position: 'absolute', bottom: '1.25rem', color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                   <BrainCircuit size={15} /> Cevabı görmek için dokun
                </div>
              </div>

              {/* Back */}
              <div 
                className="premium-card" 
                style={{ 
                  position: 'absolute', width: '100%', height: '100%', 
                  backfaceVisibility: 'hidden',
                  transform: 'rotateX(180deg)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(145deg, #0f1015, #1e293b)',
                  border: '1px solid rgba(56,189,248,0.3)',
                  boxShadow: '0 20px 40px rgba(56,189,248,0.15)',
                  padding: '1.5rem'
                }}
              >
                <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', fontSize: '0.75rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '4px 8px', borderRadius: '4px', transform: 'rotateX(180deg)' }}>
                  Cevap / Tanım
                </div>
                <h2 style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.5rem)', color: '#38bdf8', textAlign: 'center', padding: '0 1rem', lineHeight: 1.5, margin: 0 }}>
                  {cards[currentIndex].back_text}
                </h2>
              </div>
            </motion.div>
          </div>

          <AnimatePresence>
            {isFlipped && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="study-actions-grid"
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', width: '100%' }}
              >
                <button onClick={() => handleReview(0)} className="btn-interactive study-action-btn" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '1.25rem 0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', borderRadius: '16px' }}>
                  <X size={22} /> 
                  <span className="study-action-label" style={{ fontWeight: 700, fontSize: '0.95rem' }}>Unuttum</span> 
                  <span className="study-action-desc" style={{ fontSize: '0.75rem', opacity: 0.7 }}>Tekrar sorulacak</span>
                </button>
                <button onClick={() => handleReview(1)} className="btn-interactive study-action-btn" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)', padding: '1.25rem 0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', borderRadius: '16px' }}>
                  <BrainCircuit size={22} /> 
                  <span className="study-action-label" style={{ fontWeight: 700, fontSize: '0.95rem' }}>Zorlandım</span> 
                  <span className="study-action-desc" style={{ fontSize: '0.75rem', opacity: 0.7 }}>Yakında tekrarla</span>
                </button>
                <button onClick={() => handleReview(2)} className="btn-interactive study-action-btn" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', padding: '1.25rem 0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', borderRadius: '16px' }}>
                  <Check size={22} /> 
                  <span className="study-action-label" style={{ fontWeight: 700, fontSize: '0.95rem' }}>Bildim</span> 
                  <span className="study-action-desc" style={{ fontSize: '0.75rem', opacity: 0.7 }}>Daha sonra tekrarla</span>
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
            height: min(290px, 42vh) !important;
          }
          .study-actions-grid {
            gap: 0.5rem !important;
          }
          .study-action-btn {
            padding: 0.85rem 0.4rem !important;
            border-radius: 12px !important;
            min-height: 48px;
          }
          .study-action-desc {
            display: none !important;
          }
          .study-action-label {
            font-size: 0.82rem !important;
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
