import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, ThumbsUp, ThumbsDown, Plus, Loader2, BookOpen, Brain, X, Check } from 'lucide-react';

interface FlashCard {
  id: string;
  front_text: string;
  back_text: string;
  subject: string;
  topic: string;
  status?: string;
  ease_factor?: number;
  interval?: number;
}

interface SubjectGroup {
  [topic: string]: { total: number; due: number };
}

export default function CardsTab() {
  const [flipped, setFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [studying, setStudying] = useState(false);
  const [grouped, setGrouped] = useState<Record<string, SubjectGroup>>({});
  const [studyCards, setStudyCards] = useState<FlashCard[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create form
  const [newSubject, setNewSubject] = useState('Matematik');
  const [newTopic, setNewTopic] = useState('');
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [creating, setCreating] = useState(false);

  const subjects = ['Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Türkçe', 'Tarih', 'Coğrafya', 'Felsefe', 'Geometri', 'Edebiyat'];

  const fetchGrouped = useCallback(async () => {
    try {
      const res = await fetch('/api/flashcards');
      if (res.ok) {
        const data = await res.json();
        setGrouped(data.grouped || {});
      }
    } catch (_) {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGrouped(); }, [fetchGrouped]);

  const startStudy = async (subject: string, topic?: string) => {
    setStudying(true);
    setCurrentIndex(0);
    setFlipped(false);
    try {
      let url = `/api/flashcards/study?subject=${encodeURIComponent(subject)}`;
      if (topic) url += `&topic=${encodeURIComponent(topic)}`;
      const res = await fetch(url);
      if (res.ok) {
        const cards = await res.json();
        setStudyCards(cards);
        setSelectedSubject(subject);
      }
    } catch (_) {}
  };

  const handleReview = async (quality: number) => {
    const card = studyCards[currentIndex];
    if (!card) return;
    try {
      await fetch('/api/flashcards/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: card.id, quality })
      });
    } catch (_) {}
    setFlipped(false);
    setTimeout(() => {
      if (currentIndex < studyCards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setStudying(false);
        setStudyCards([]);
        fetchGrouped();
      }
    }, 200);
  };

  const handleCreate = async () => {
    if (!newFront.trim() || !newBack.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: newSubject, topic: newTopic || 'Genel', front: newFront, back: newBack })
      });
      if (res.ok) {
        setNewFront(''); setNewBack(''); setNewTopic('');
        setShowCreateModal(false);
        fetchGrouped();
      }
    } catch (_) {} finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}><Loader2 className="animate-spin" size={32} color="#a855f7" /></div>;
  }

  // ── Study Mode ──
  if (studying && studyCards.length > 0) {
    const currentCard = studyCards[currentIndex];
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', padding: '1rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: 500, alignItems: 'center' }}>
          <button onClick={() => { setStudying(false); setStudyCards([]); }} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 14 }}>← Geri</button>
          <span style={{ color: '#a855f7', fontWeight: 700, fontSize: 14 }}>{currentIndex + 1} / {studyCards.length}</span>
          <span style={{ fontSize: 12, color: '#6b7280' }}>{selectedSubject}</span>
        </div>

        <div style={{ width: '100%', maxWidth: '500px', perspective: '1000px' }}>
          <motion.div
            style={{ width: '100%', height: '300px', position: 'relative', transformStyle: 'preserve-3d', cursor: 'pointer' }}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
            onClick={() => setFlipped(!flipped)}
          >
            {/* Front */}
            <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', backgroundColor: '#a855f7', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', boxShadow: '0 8px 32px rgba(168, 85, 247, 0.3)' }}>
              <Brain size={24} color="rgba(255,255,255,0.4)" style={{ marginBottom: '1rem' }} />
              <p style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 600, lineHeight: 1.6 }}>{currentCard.front_text}</p>
              <span style={{ marginTop: 'auto', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Cevabı görmek için tıkla</span>
            </div>
            {/* Back */}
            <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', backgroundColor: '#0f172a', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', border: '2px solid #a855f7', boxShadow: '0 8px 32px rgba(168, 85, 247, 0.2)' }}>
              <Check size={24} color="#22c55e" style={{ marginBottom: '1rem' }} />
              <p style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 500, lineHeight: 1.6 }}>{currentCard.back_text}</p>
            </div>
          </motion.div>
        </div>

        {flipped && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => handleReview(1)} style={{ padding: '12px 24px', borderRadius: 12, border: 'none', backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
              <ThumbsDown size={18} /> Bilmiyorum
            </button>
            <button onClick={() => handleReview(3)} style={{ padding: '12px 24px', borderRadius: 12, border: 'none', backgroundColor: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
              <RefreshCcw size={18} /> Zor
            </button>
            <button onClick={() => handleReview(5)} style={{ padding: '12px 24px', borderRadius: 12, border: 'none', backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
              <ThumbsUp size={18} /> Biliyorum
            </button>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // ── No study cards found ──
  if (studying && studyCards.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <p style={{ color: '#9ca3af', fontSize: 16 }}>Bu konuda tekrar edilecek kart bulunamadı.</p>
        <button onClick={() => { setStudying(false); }} style={{ marginTop: 16, padding: '10px 20px', borderRadius: 10, border: 'none', background: 'rgba(168,85,247,0.15)', color: '#a855f7', fontWeight: 600, cursor: 'pointer' }}>← Geri Dön</button>
      </motion.div>
    );
  }

  // ── Main Dashboard ──
  const totalCards = Object.values(grouped).reduce((sum, topics) => sum + Object.values(topics).reduce((s, t) => s + t.total, 0), 0);
  const totalDue = Object.values(grouped).reduce((sum, topics) => sum + Object.values(topics).reduce((s, t) => s + t.due, 0), 0);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            🎴 Aralıklı Tekrar Kartları
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>Bilgiyi hafızaya kazı. Yapay zeka ile tam zamanında tekrar et.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} style={{ padding: '12px 20px', backgroundColor: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <Plus size={20} /> Kart Oluştur
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#0f172a', borderTop: '2px solid #a855f7', borderRadius: 12, padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>{totalCards}</div>
          <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Toplam Kart</div>
        </div>
        <div style={{ backgroundColor: '#0f172a', borderTop: '2px solid #f59e0b', borderRadius: 12, padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: totalDue > 0 ? '#f59e0b' : '#22c55e' }}>{totalDue}</div>
          <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Tekrar Bekleyen</div>
        </div>
        <div style={{ backgroundColor: '#0f172a', borderTop: '2px solid #22c55e', borderRadius: 12, padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>{Object.keys(grouped).length}</div>
          <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Ders Sayısı</div>
        </div>
      </div>

      {/* Subject Cards */}
      {Object.keys(grouped).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: '#0f172a', borderRadius: 16, border: '1px solid #1e293b' }}>
          <BookOpen size={48} color="#374151" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: '#6b7280', fontSize: 15, marginBottom: 8 }}>Henüz hiç kart oluşturmadın.</p>
          <p style={{ color: '#4b5563', fontSize: 13 }}>Yukarıdaki "Kart Oluştur" butonuyla başla!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {Object.entries(grouped).map(([subject, topics]) => {
            const total = Object.values(topics).reduce((s, t) => s + t.total, 0);
            const due = Object.values(topics).reduce((s, t) => s + t.due, 0);
            return (
              <div key={subject} onClick={() => startStudy(subject)} style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s' }} className="hover:border-purple-500/30">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: 0 }}>{subject}</h3>
                  {due > 0 && <span style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{due} tekrar</span>}
                </div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{total} kart · {Object.keys(topics).length} konu</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 10 }}>
                  {Object.keys(topics).slice(0, 3).map(t => (
                    <span key={t} style={{ fontSize: 11, padding: '2px 8px', background: 'rgba(255,255,255,0.05)', color: '#9ca3af', borderRadius: 6 }}>{t}</span>
                  ))}
                  {Object.keys(topics).length > 3 && <span style={{ fontSize: 11, color: '#4b5563' }}>+{Object.keys(topics).length - 3}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Card Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }} onClick={() => setShowCreateModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()}
              style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 480 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0 }}>Yeni Kart Oluştur</h3>
                <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 6, fontWeight: 600 }}>Ders</label>
                  <select value={newSubject} onChange={e => setNewSubject(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #374151', background: '#1e293b', color: '#fff', fontSize: 14 }}>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 6, fontWeight: 600 }}>Konu (İsteğe Bağlı)</label>
                  <input value={newTopic} onChange={e => setNewTopic(e.target.value)} placeholder="Ör: Türev, Dolaşım Sistemi..." style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #374151', background: '#1e293b', color: '#fff', fontSize: 14, outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 6, fontWeight: 600 }}>Soru (Ön Yüz)</label>
                  <textarea value={newFront} onChange={e => setNewFront(e.target.value)} placeholder="Bilgiyi sorgulayan soru..." rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #374151', background: '#1e293b', color: '#fff', fontSize: 14, resize: 'vertical', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 6, fontWeight: 600 }}>Cevap (Arka Yüz)</label>
                  <textarea value={newBack} onChange={e => setNewBack(e.target.value)} placeholder="Doğru cevap ve açıklama..." rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #374151', background: '#1e293b', color: '#fff', fontSize: 14, resize: 'vertical', outline: 'none' }} />
                </div>
                <button onClick={handleCreate} disabled={creating || !newFront.trim() || !newBack.trim()} style={{ padding: '12px', borderRadius: 12, border: 'none', background: creating ? '#374151' : 'linear-gradient(135deg, #a855f7, #7c3aed)', color: '#fff', fontWeight: 700, cursor: creating ? 'not-allowed' : 'pointer', fontSize: 15 }}>
                  {creating ? 'Kaydediliyor...' : '✨ Kartı Kaydet'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
