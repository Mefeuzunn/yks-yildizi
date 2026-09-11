"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Plus, BookOpen, Loader2, X, ChevronRight, BrainCircuit } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function FlashcardsDashboard() {
  const { user } = useAuth();
  const [groupedCards, setGroupedCards] = useState<Record<string, Record<string, { total: number; due: number }>>>({});
  const [loading, setLoading] = useState(true);
  
  // New card modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCard, setNewCard] = useState({ subject: 'Biyoloji', topic: '', front: '', back: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCards();
  }, [user]);

  const fetchCards = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const cacheKey = 'flashcards_dashboard_cache';
    try {
      const res = await fetch('/api/flashcards');
      if (res.ok) {
        const data = await res.json();
        setGroupedCards(data.grouped || {});
        localStorage.setItem(cacheKey, JSON.stringify(data.grouped || {}));
      }
    } catch (e) {
      console.log('Çevrimdışı mod: Önbellekten yükleniyor...');
      const cached = localStorage.getItem(cacheKey);
      if (cached) setGroupedCards(JSON.parse(cached));
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
        setIsModalOpen(false);
        setNewCard({ subject: 'Biyoloji', topic: '', front: '', back: '' });
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

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(2, 132, 199, 0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            <Layers size={28} color="#38bdf8" />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.25rem' }}>Flashcard Kütüphanesi</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Ders ve konu bazlı aralıklı tekrar sistemi.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-interactive" style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
        >
          <Plus size={20} /> Kart Ekle
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
        <div className="premium-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(56,189,248,0.1)', padding: '1rem', borderRadius: '12px' }}><Layers size={24} color="#38bdf8" /></div>
          <div>
             <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{totalCards}</div>
             <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Toplam Kart</div>
          </div>
        </div>
        <div className="premium-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: totalDue > 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '' }}>
          <div style={{ background: 'rgba(16,185,129,0.1)', padding: '1rem', borderRadius: '12px' }}><BrainCircuit size={24} color="#10b981" /></div>
          <div>
             <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{totalDue}</div>
             <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Bugün Tekrar Edilecek</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 className="spin" size={32} color="#38bdf8" /></div>
      ) : subjects.length === 0 ? (
        <div className="premium-card" style={{ padding: '4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
           <BookOpen size={48} color="rgba(255,255,255,0.2)" />
           <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>Henüz kart eklenmemiş</h2>
           <p style={{ color: 'var(--text-secondary)' }}>Öğrenmek istediğin kavramlar için hemen yeni flashcard'lar oluştur.</p>
           <button onClick={() => setIsModalOpen(true)} className="btn-interactive" style={{ background: 'rgba(255,255,255,0.1)', marginTop: '1rem' }}>Kart Eklemeye Başla</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {subjects.map(subject => {
            const topics = Object.keys(groupedCards[subject]);
            return (
              <div key={subject} className="premium-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                   <h2 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 700 }}>{subject}</h2>
                   <Link href={`/flashcards/study?subject=${encodeURIComponent(subject)}`}>
                     <span style={{ color: '#38bdf8', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>Tüm Dersi Çalış <ChevronRight size={16} /></span>
                   </Link>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {topics.map(topic => {
                    const data = groupedCards[subject][topic];
                    const hasDue = data.due > 0;
                    return (
                      <Link key={topic} href={`/flashcards/study?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topic)}`}>
                        <div style={{ 
                          background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1rem', 
                          border: hasDue ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                          cursor: 'pointer', transition: 'all 0.2s',
                          display: 'flex', flexDirection: 'column', gap: '0.5rem'
                        }} className="hover-lift">
                          <h3 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 600 }}>{topic}</h3>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{data.total} Kart</span>
                            {hasDue ? (
                              <span style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{width: 8, height: 8, borderRadius: '50%', background: '#10b981'}}></div> {data.due} Bekleyen
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>Tamamlandı</span>
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

      {/* New Card Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(5px)' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ background: '#0f1015', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '500px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>Yeni Kart Ekle</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
              </div>
              
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Ders</label>
                    <select 
                      value={newCard.subject}
                      onChange={e => setNewCard({...newCard, subject: e.target.value})}
                      className="premium-input"
                    >
                      {['Biyoloji', 'Tarih', 'Coğrafya', 'Kimya', 'Fizik', 'Edebiyat', 'Matematik'].map(t => <option key={t} value={t} style={{background: '#0f1015'}}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Konu</label>
                    <input 
                      type="text" 
                      value={newCard.topic}
                      onChange={e => setNewCard({...newCard, topic: e.target.value})}
                      className="premium-input" 
                      placeholder="Örn: Hücre"
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Ön Yüz (Soru / Terim)</label>
                  <input 
                    type="text" 
                    value={newCard.front}
                    onChange={e => setNewCard({...newCard, front: e.target.value})}
                    className="premium-input" 
                    placeholder="Mitokondri ne işe yarar?"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Arka Yüz (Cevap / Tanım)</label>
                  <textarea 
                    value={newCard.back}
                    onChange={e => setNewCard({...newCard, back: e.target.value})}
                    className="premium-input" 
                    style={{ minHeight: '100px', resize: 'vertical' }}
                    placeholder="Hücrenin enerji santralidir."
                    required
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="submit" className="btn-interactive" disabled={isSubmitting} style={{ background: 'linear-gradient(135deg, #38bdf8, #0284c7)', color: '#fff', border: 'none' }}>
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
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.3); border-color: rgba(56,189,248,0.4) !important; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
