"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Check, X, ChevronDown, ChevronUp, Trash2, Zap, ArrowRight, Award, HelpCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type Mistake = {
  id: number;
  subject: string;
  topic: string;
  icerik: string;
  secenekler: string[];
  dogruCevap: string;
  secilenCevap: string;
  cozum: string;
  createdAt: string;
};

export default function HataDefteriPage() {
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [filteredMistakes, setFilteredMistakes] = useState<Mistake[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('Tümü');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Quiz Modal State
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<string | null>(null);
  const [quizIsAnswered, setQuizIsAnswered] = useState(false);
  const [quizIsCorrect, setQuizIsCorrect] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [clearedMistakeIds, setClearedMistakeIds] = useState<number[]>([]);

  const { user, checkAuth } = useAuth();

  useEffect(() => {
    fetchMistakes();
  }, []);

  const fetchMistakes = async () => {
    try {
      const res = await fetch('/api/user/errors');
      if (res.ok) {
        const data = await res.json();
        setMistakes(data);
        setFilteredMistakes(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    if (activeFilter === 'Tümü') {
      setFilteredMistakes(mistakes);
    } else {
      setFilteredMistakes(mistakes.filter(m => m.subject === activeFilter));
    }
  }, [activeFilter, mistakes]);

  // Unique subjects for filters
  const subjectsList = ['Tümü', ...Array.from(new Set(mistakes.map(m => m.subject)))];

  const deleteMistake = async (id: number) => {
    try {
      const res = await fetch(`/api/user/errors?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setMistakes(prev => prev.filter(m => m.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Start AI Exam from mistakes
  const startErrorQuiz = async () => {
    try {
      const res = await fetch('/api/questions/error-quiz');
      if (res.ok) {
        const data = await res.json();
        setQuizQuestions(data);
        setCurrentQuizIdx(0);
        setQuizSelectedOption(null);
        setQuizIsAnswered(false);
        setQuizIsCorrect(false);
        setQuizScore(0);
        setClearedMistakeIds([]);
        setIsQuizActive(true);
      } else {
        const err = await res.json();
        alert(err.error || 'Quiz oluşturulamadı.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Quiz Option Selection
  const handleQuizAnswer = async (option: string) => {
    if (quizIsAnswered) return;
    setQuizSelectedOption(option);
    
    const currentQ = quizQuestions[currentQuizIdx];
    const isCorrect = option === currentQ.dogruCevap;
    setQuizIsCorrect(isCorrect);
    setQuizIsAnswered(true);

    if (isCorrect) {
      setQuizScore(prev => prev + 1);
      setClearedMistakeIds(prev => [...prev, currentQ.originalId]);
      
      // Auto-delete from mistake book because they answered correctly!
      try {
        await fetch(`/api/user/errors?id=${currentQ.originalId}`, { method: 'DELETE' });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleNextQuizQuestion = () => {
    if (currentQuizIdx + 1 < quizQuestions.length) {
      setCurrentQuizIdx(prev => prev + 1);
      setQuizSelectedOption(null);
      setQuizIsAnswered(false);
      setQuizIsCorrect(false);
    } else {
      // End of Quiz
      // Add XP for clearing errors
      if (quizScore > 0) {
        fetch('/api/user/xp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add_xp', amount: quizScore * 15 })
        }).then(() => checkAuth());
      }
      // Refresh local mistake list
      fetchMistakes();
      setCurrentQuizIdx(-1); // Triggers result view
    }
  };

  if (!isLoaded) return null;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <BookOpen size={24} color="#ef4444" />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Hata Defterim</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Yanlış yaptığın YKS sorularını incele, çözümlerine bak ve eksiklerini kapat.</p>
          </div>
        </div>
      </div>

      {/* AI Quiz Hero Card */}
      {mistakes.length > 0 && (
        <motion.div 
          className="premium-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            marginBottom: '3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            borderLeft: '4px solid var(--accent)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
              <Zap size={16} /> Yapay Zeka Desteği
            </div>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: 700, marginBottom: '0.5rem' }}>Hatalarımdan AI Sınavı Üret</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', fontSize: '0.95rem' }}>
              Hata defterindeki sorulardan sana özel 10 soruluk bir test hazırlarız. Doğru çözdüğün sorular otomatik olarak defterden temizlenir!
            </p>
          </div>
          <button 
            onClick={startErrorQuiz}
            className="btn-interactive"
          >
            Sınavı Başlat <ArrowRight size={18} />
          </button>
        </motion.div>
      )}

      {/* Filters & Empty State Check */}
      {mistakes.length === 0 ? (
        <div className="premium-card" style={{ textAlign: 'center', padding: '5rem 2rem', border: '1px dashed var(--border-strong)', boxShadow: 'none' }}>
          <HelpCircle size={48} color="var(--text-muted)" style={{ margin: '0 auto 1.5rem' }} />
          <h3 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Hata Defterin Tamamen Boş!</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            Harika gidiyorsun! Hiç yanlış sorun bulunmuyor. Soru Çöz sayfasından test çözmeye devam et, yanlışların olursa burada görebilirsin.
          </p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {subjectsList.map(subject => (
              <button
                key={subject}
                onClick={() => setActiveFilter(subject)}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '99px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: '1px solid var(--border-strong)',
                  background: activeFilter === subject ? 'var(--secondary)' : 'var(--surface)',
                  color: activeFilter === subject ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                {subject}
              </button>
            ))}
          </div>

          {/* List of mistakes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredMistakes.map(mistake => {
              const isExpanded = expandedId === mistake.id;
              
              return (
                <motion.div 
                  key={mistake.id}
                  layout
                  className="premium-card"
                  style={{ padding: '1.75rem', position: 'relative' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <div>
                      <div style={{ display: 'inline-flex', padding: '0.25rem 0.75rem', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.75rem', color: '#ef4444', fontWeight: 600, marginRight: '0.5rem' }}>
                        {mistake.subject}
                      </div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>{mistake.topic}</span>
                    </div>
                    
                    <button 
                      onClick={() => deleteMistake(mistake.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
                      className="hover-red"
                      title="Defterden Kaldır"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <p style={{ color: 'var(--text-primary)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '1.5rem', fontWeight: 500 }}>
                    {mistake.icerik}
                  </p>

                  {/* Options with selection details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', maxWidth: '600px', marginBottom: '1.5rem' }}>
                    {mistake.secenekler.map((opt, i) => {
                      const isSelected = opt === mistake.secilenCevap;
                      const isCorrect = opt === mistake.dogruCevap;
                      
                      let bg = 'var(--surface)';
                      let border = '1px solid var(--border-strong)';
                      let color = 'var(--text-primary)';

                      if (isCorrect) {
                        bg = 'rgba(16, 185, 129, 0.1)';
                        border = '1px solid #10b981';
                        color = '#10b981';
                      } else if (isSelected) {
                        bg = 'rgba(239, 68, 68, 0.1)';
                        border = '1px solid #ef4444';
                        color = '#ef4444';
                      }

                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: bg, border, borderRadius: '8px', color, fontSize: '0.9rem' }}>
                          <span>{opt}</span>
                          {isCorrect && <span style={{ fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Check size={14} /> Doğru Cevap</span>}
                          {isSelected && !isCorrect && <span style={{ fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><X size={14} /> Senin Seçimin</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Collapsible solution */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : mistake.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: 0
                    }}
                  >
                    {isExpanded ? <><ChevronUp size={16} /> Çözümü Gizle</> : <><ChevronDown size={16} /> Çözümü Göster</>}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ marginTop: '1.25rem', padding: '1.25rem', background: 'var(--secondary)', borderLeft: '3px solid var(--accent)', borderRadius: '4px', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                          <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>AI Soru Çözümü:</strong>
                          {mistake.cozum}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* INTERACTIVE AI QUIZ MODAL */}
      <AnimatePresence>
        {isQuizActive && (
          <div style={{ position: 'fixed', inset: 0, background: 'var(--surface-overlay)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1rem' }}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="premium-card"
              style={{ width: '100%', maxWidth: '600px', overflow: 'hidden', padding: 0 }}
            >
              
              {/* Modal Header */}
              <div style={{ padding: '1.5rem 2rem', background: 'var(--surface)', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Zap size={20} color="var(--accent)" /> AI Hata Sınavı
                </h3>
                {currentQuizIdx >= 0 && (
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Soru: {currentQuizIdx + 1} / {quizQuestions.length}
                  </span>
                )}
              </div>

              {/* Modal Body */}
              <div style={{ padding: '2rem' }}>
                
                {/* Active Question View */}
                {currentQuizIdx >= 0 ? (
                  <div>
                    {/* Lesson Subject & Topic badge */}
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ display: 'inline-flex', padding: '0.25rem 0.5rem', background: 'var(--accent-glow)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, marginRight: '0.5rem' }}>
                        {quizQuestions[currentQuizIdx].subject}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {quizQuestions[currentQuizIdx].topic}
                      </span>
                    </div>

                    <p style={{ color: 'var(--text-primary)', fontSize: '1.15rem', lineHeight: 1.6, marginBottom: '2rem', fontWeight: 500 }}>
                      {quizQuestions[currentQuizIdx].metin}
                    </p>

                    {/* Interactive Choices */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {quizQuestions[currentQuizIdx].secenekler.map((opt: string, i: number) => {
                        const isSelected = opt === quizSelectedOption;
                        const isCorrect = opt === quizQuestions[currentQuizIdx].dogruCevap;
                        
                        let bg = 'var(--surface)';
                        let border = '1px solid var(--border-strong)';
                        let color = 'var(--text-primary)';

                        if (quizIsAnswered) {
                          if (isCorrect) {
                            bg = 'rgba(16, 185, 129, 0.15)';
                            border = '1px solid #10b981';
                            color = '#10b981';
                          } else if (isSelected) {
                            bg = 'rgba(239, 68, 68, 0.15)';
                            border = '1px solid #ef4444';
                            color = '#ef4444';
                          } else {
                            bg = 'var(--secondary)';
                            color = 'var(--text-muted)';
                          }
                        } else if (isSelected) {
                          bg = 'var(--accent-glow)';
                          border = '1px solid var(--accent)';
                        }

                        return (
                          <button
                            key={i}
                            disabled={quizIsAnswered}
                            onClick={() => handleQuizAnswer(opt)}
                            style={{ padding: '1rem', background: bg, border, borderRadius: '12px', color, textAlign: 'left', fontSize: '0.95rem', cursor: quizIsAnswered ? 'default' : 'pointer', transition: 'all 0.15s' }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback & Navigation */}
                    {quizIsAnswered && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ marginTop: '1.5rem' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: quizIsCorrect ? '#10b981' : '#ef4444', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                          {quizIsCorrect ? <><Check size={18} /> Tebrikler! Doğru Çözdün.</> : <><X size={18} /> Yanlış Çevap.</>}
                        </div>
                        {quizIsCorrect && (
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                            🎉 Bu soru hata defterinden silindi!
                          </p>
                        )}
                        {!quizIsCorrect && quizQuestions[currentQuizIdx].cozum && (
                          <div style={{ padding: '0.75rem 1rem', background: 'var(--secondary)', borderLeft: '2px solid var(--border-strong)', borderRadius: '4px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', maxHeight: '100px', overflowY: 'auto' }}>
                            <strong>Çözüm:</strong> {quizQuestions[currentQuizIdx].cozum}
                          </div>
                        )}
                        
                        <button
                          onClick={handleNextQuizQuestion}
                          className="btn-interactive"
                          style={{ width: '100%' }}
                        >
                          {currentQuizIdx + 1 < quizQuestions.length ? 'Sıradaki Soru' : 'Sonuçları Gör'} <ArrowRight size={18} />
                        </button>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  
                  // Quiz Result View (currentQuizIdx === -1)
                  <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                      <Award size={36} color="#10b981" />
                    </div>
                    <h3 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Sınav Tamamlandı!</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                      {quizQuestions.length} sorudan <strong style={{ color: '#10b981' }}>{quizScore} tanesini</strong> doğru cevapladın ve hata defterini temizledin!
                    </p>
                    
                    {quizScore > 0 && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px', color: '#f59e0b', fontSize: '0.875rem', fontWeight: 600, marginBottom: '2.5rem' }}>
                        ⚡ +{quizScore * 15} XP Kazanıldı!
                      </div>
                    )}

                    <button
                      onClick={() => setIsQuizActive(false)}
                      className="btn-interactive"
                      style={{ width: '100%' }}
                    >
                      Kapat ve Deftere Dön
                    </button>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .hover-scale { transition: transform 0.2s; }
        .hover-scale:hover { transform: scale(1.02); }
        .hover-red { transition: color 0.2s; }
        .hover-red:hover { color: #ef4444 !important; }
      `}</style>
    </div>
  );
}
