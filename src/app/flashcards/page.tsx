"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Plus, BookOpen, Loader2, X, ChevronRight, BrainCircuit, Sparkles, Filter } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { haptics } from '@/lib/haptics';

export default function FlashcardsDashboard() {
  const { user } = useAuth();
  const [groupedCards, setGroupedCards] = useState<Record<string, Record<string, { total: number; due: number }>>>({});
  const [loading, setLoading] = useState(true);
  const [alanMode, setAlanMode] = useState<'field' | 'all'>('field');
  
  // New card modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCard, setNewCard] = useState({ subject: 'Matematik', topic: '', front: '', back: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userAlan = user?.alan || 'Sayisal';

  useEffect(() => {
    fetchCards();
  }, [user, alanMode]);

  const fetchCards = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const effectiveAlan = alanMode === 'field' ? encodeURIComponent(userAlan) : 'all';
    const cacheKey = `flashcards_dashboard_cache_${effectiveAlan}`;
    try {
      setLoading(true);
      const res = await fetch(`/api/flashcards?alan=${effectiveAlan}`);
      if (res.ok) {
        const data = await res.json();
        setGroupedCards(data.grouped || {});
        try {
          localStorage.setItem(cacheKey, JSON.stringify(data.grouped || {}));
        } catch (_) {}
      }
    } catch (e) {
      console.log('Çevrimdışı mod: Önbellekten yükleniyor...');
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) setGroupedCards(JSON.parse(cached));
      } catch (_) {}
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.front.trim() || !newCard.back.trim() || !user) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCard)
      });
      if (res.ok) {
        haptics.notification('success');
        setIsModalOpen(false);
        setNewCard({ subject: 'Matematik', topic: '', front: '', back: '' });
        fetchCards();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
        Flashcard sistemini kullanmak için giriş yapmalısınız.
      </div>
    );
  }

  const subjects = Object.keys(groupedCards);
  let totalCards = 0;
  let totalDue = 0;
  
  subjects.forEach(sub => {
     Object.values(groupedCards[sub]).forEach(topicData => {
         totalCards += topicData.total;
         totalDue += topicData.due;
     });
  });

  const availableSubjectsForNew = (alanMode === 'field' && (userAlan.toLowerCase().includes('say') || userAlan.toLowerCase().includes('mf')))
    ? ['Matematik', 'Geometri', 'Fizik', 'Kimya', 'Biyoloji', 'Türkçe', 'Tarih', 'Coğrafya', 'Felsefe & Din']
    : ['Matematik', 'Geometri', 'Fizik', 'Kimya', 'Biyoloji', 'Türkçe', 'Türk Dili ve Edebiyatı', 'Tarih', 'Coğrafya', 'Felsefe & Din'];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem 1rem calc(85px + env(safe-area-inset-bottom, 20px)) 1rem' }}>
      
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(2, 132, 199, 0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(56, 189, 248, 0.3)', boxShadow: '0 8px 24px rgba(56, 189, 248, 0.2)' }}>
            <Layers size={26} color="#38bdf8" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', color: '#fff', marginBottom: '0.25rem', fontWeight: 900, letterSpacing: '-0.02em' }}>Flashcard Kütüphanesi</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Aralıklı tekrar sistemi (Spaced Repetition) ile kalıcı hafıza.</p>
          </div>
        </div>
        <button 
          onClick={() => {
            haptics.selection();
            setIsModalOpen(true);
          }}
          className="btn-interactive active:scale-[0.98]" 
          style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', minHeight: '44px', borderRadius: '12px', border: 'none', color: '#fff', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(56, 189, 248, 0.35)' }}
        >
          <Plus size={20} /> Yeni Kart Ekle
        </button>
      </div>

      {/* ── ALAN MÜFREDAT FİLTRESİ (Sayısal / Eşit Ağırlık / Tüm Dersler) ── */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: '0.75rem', 
          marginBottom: '1.5rem', 
          backgroundColor: '#0f1523', 
          border: '1px solid rgba(255,255,255,0.08)', 
          borderRadius: '16px', 
          padding: '8px 14px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={14} color="#38bdf8" /> Müfredat Modu:
          </span>
          <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '3px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              onClick={() => { haptics.selection(); setAlanMode('field'); }}
              className="active:scale-[0.98] transition-all"
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: alanMode === 'field' ? 800 : 600,
                background: alanMode === 'field' ? 'linear-gradient(135deg, #38bdf8, #0284c7)' : 'transparent',
                color: alanMode === 'field' ? '#fff' : '#94a3b8',
                cursor: 'pointer',
                border: 'none',
                boxShadow: alanMode === 'field' ? '0 2px 10px rgba(56,189,248,0.35)' : 'none'
              }}
            >
              🎯 Alanıma Özel ({userAlan === 'Sayisal' ? 'Sayısal' : userAlan === 'Sozel' ? 'Sözel' : userAlan === 'EsitAgirlik' ? 'Eşit Ağırlık' : userAlan})
            </button>
            <button
              onClick={() => { haptics.selection(); setAlanMode('all'); }}
              className="active:scale-[0.98] transition-all"
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: alanMode === 'all' ? 800 : 600,
                background: alanMode === 'all' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
                color: alanMode === 'all' ? '#fff' : '#94a3b8',
                cursor: 'pointer',
                border: 'none',
                boxShadow: alanMode === 'all' ? '0 2px 10px rgba(99,102,241,0.35)' : 'none'
              }}
            >
              📚 Tüm Dersler (Genel)
            </button>
          </div>
        </div>

        {alanMode === 'field' && (
          <div style={{ fontSize: '11.5px', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span>✓ {userAlan} alanı aktif: İlgisiz dersler (Edebiyat vb.) otomatik elendi.</span>
          </div>
        )}
      </div>

      {/* ── İSTATİSTİK KARTLARI ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="premium-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#0f1523', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
          <div style={{ background: 'rgba(56,189,248,0.12)', padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(56,189,248,0.25)' }}>
            <Layers size={22} color="#38bdf8" />
          </div>
          <div>
             <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{totalCards}</div>
             <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Aktif Kart Sayısı</div>
          </div>
        </div>
        <div className="premium-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#0f1523', border: totalDue > 0 ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
          <div style={{ background: 'rgba(16,185,129,0.12)', padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.25)' }}>
            <BrainCircuit size={22} color="#10b981" />
          </div>
          <div>
             <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981', fontVariantNumeric: 'tabular-nums' }}>{totalDue}</div>
             <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Bugün Tekrar Edilecek</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 className="spin" size={32} color="#38bdf8" /></div>
      ) : subjects.length === 0 ? (
        <div className="premium-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', backgroundColor: '#0f1523', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
           <BookOpen size={48} color="rgba(255,255,255,0.2)" />
           <h2 style={{ fontSize: '1.35rem', color: '#fff', fontWeight: 800 }}>Bu alanda henüz kart bulunmuyor</h2>
           <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Öğrenmek istediğin kavramlar için hemen yeni bir flashcard oluşturabilirsin.</p>
           <button onClick={() => { haptics.selection(); setIsModalOpen(true); }} className="btn-interactive" style={{ background: 'linear-gradient(135deg, #38bdf8, #0284c7)', marginTop: '0.5rem', minHeight: '44px', padding: '0.75rem 1.5rem', borderRadius: '12px', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer' }}>Kart Eklemeye Başla</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {subjects.map(subject => {
            const topics = Object.keys(groupedCards[subject]);
            const studyUrl = `/flashcards/study?subject=${encodeURIComponent(subject)}&alan=${alanMode === 'field' ? encodeURIComponent(userAlan) : 'all'}`;
            return (
              <div key={subject} className="premium-card" style={{ padding: '1.5rem', backgroundColor: '#0f1523', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.85rem', marginBottom: '1.15rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <h2 style={{ fontSize: '1.3rem', color: '#fff', fontWeight: 800, margin: 0 }}>{subject}</h2>
                   </div>
                   <Link href={studyUrl}>
                     <span style={{ color: '#38bdf8', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>Tüm Dersi Çalış <ChevronRight size={16} /></span>
                   </Link>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.85rem' }}>
                  {topics.map(topic => {
                    const data = groupedCards[subject][topic];
                    const hasDue = data.due > 0;
                    const topicUrl = `/flashcards/study?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topic)}&alan=${alanMode === 'field' ? encodeURIComponent(userAlan) : 'all'}`;
                    return (
                      <Link key={topic} href={topicUrl}>
                        <div style={{ 
                          background: 'rgba(255,255,255,0.025)', borderRadius: '14px', padding: '1.1rem', 
                          border: hasDue ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(255,255,255,0.06)',
                          cursor: 'pointer', transition: 'all 0.2s',
                          display: 'flex', flexDirection: 'column', gap: '0.5rem',
                          boxShadow: hasDue ? '0 4px 16px rgba(16,185,129,0.1)' : 'none'
                        }} className="hover-lift">
                          <h3 style={{ fontSize: '1.05rem', color: '#fff', fontWeight: 700, margin: 0 }}>{topic}</h3>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginTop: 4 }}>
                            <span style={{ color: '#94a3b8', fontWeight: 600 }}>{data.total} Kart</span>
                            {hasDue ? (
                              <span style={{ color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <div style={{width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981'}}></div> {data.due} Bekleyen
                              </span>
                            ) : (
                              <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>Tamamlandı ✓</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Card Modal (Desktop centered, Mobile bottom-sheet) */}
      <AnimatePresence>
        {isModalOpen && (
          <div 
            className="flashcard-modal-overlay"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5,7,14,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(16px)' }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="flashcard-modal-box"
              style={{ backgroundColor: '#0f1523', padding: '2rem', borderRadius: '24px', width: '100%', maxWidth: '520px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle for mobile */}
              <div className="mobile-only modal-drag-handle" style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '-0.5rem auto 1rem' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.35rem', color: '#fff', margin: 0, fontWeight: 800 }}>Yeni Kart Ekle</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}><X size={22} /></button>
              </div>
              
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>Ders</label>
                    <select 
                      value={newCard.subject}
                      onChange={e => setNewCard({...newCard, subject: e.target.value})}
                      className="premium-input modal-input-touch"
                      style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', padding: '0.65rem 0.85rem', width: '100%' }}
                    >
                      {availableSubjectsForNew.map(t => <option key={t} value={t} style={{background: '#0f1523', color: '#fff'}}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>Konu</label>
                    <input 
                      type="text" 
                      value={newCard.topic}
                      onChange={e => setNewCard({...newCard, topic: e.target.value})}
                      className="premium-input modal-input-touch" 
                      placeholder="Örn: Limit & Türev"
                      style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', padding: '0.65rem 0.85rem', width: '100%' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>Ön Yüz (Soru / Formül / Terim)</label>
                  <input 
                    type="text" 
                    value={newCard.front}
                    onChange={e => setNewCard({...newCard, front: e.target.value})}
                    className="premium-input modal-input-touch" 
                    placeholder="Örn: Sinüs Teoremi bağıntısı nedir?"
                    required
                    style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', padding: '0.65rem 0.85rem', width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>Arka Yüz (Cevap / Tanım / Çözüm)</label>
                  <textarea 
                    value={newCard.back}
                    onChange={e => setNewCard({...newCard, back: e.target.value})}
                    className="premium-input modal-input-touch" 
                    style={{ minHeight: '90px', resize: 'vertical', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', padding: '0.65rem 0.85rem', width: '100%' }}
                    placeholder="a / sin(A) = b / sin(B) = c / sin(C) = 2R"
                    required
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
                  <button type="submit" className="btn-interactive active:scale-[0.98]" disabled={isSubmitting} style={{ background: 'linear-gradient(135deg, #38bdf8, #0284c7)', color: '#fff', border: 'none', minHeight: '44px', padding: '0.75rem 1.5rem', fontWeight: 800, borderRadius: '12px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(56, 189, 248, 0.35)' }}>
                    {isSubmitting ? <Loader2 className="spin" size={20} /> : 'Kartı Kaydet'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .spin { animation: spin 1s linear infinite; }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(0,0,0,0.4); border-color: rgba(56,189,248,0.4) !important; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .flashcard-modal-overlay {
            align-items: flex-end !important;
            padding: 0 !important;
          }
          .flashcard-modal-box {
            border-bottom-left-radius: 0 !important;
            border-bottom-right-radius: 0 !important;
            border-top-left-radius: 24px !important;
            border-top-right-radius: 24px !important;
            max-height: 90vh !important;
            overflow-y: auto !important;
            padding: 1.25rem !important;
          }
          .modal-input-touch {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
