"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Check, X, ChevronDown, ChevronUp, Trash2, Zap, 
  ArrowRight, Award, HelpCircle, Layers, Calendar, Clock, 
  Trophy, Flame, RefreshCw, Sparkles, AlertCircle 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/context/ToastContext';

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
  imageData?: string;
  leitnerBox: number;
  nextReviewAt: string;
  reviewCount: number;
  isDue: boolean;
};

const LEITNER_BOX_INFO = [
  { box: 1, label: '1. Kutu', name: 'Taze Yanlış', interval: '1 Gün', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.25)' },
  { box: 2, label: '2. Kutu', name: 'Pekiştirme', interval: '3 Gün', color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)', border: 'rgba(249, 115, 22, 0.25)' },
  { box: 3, label: '3. Kutu', name: 'Gelişim', interval: '7 Gün', color: '#eab308', bg: 'rgba(234, 179, 8, 0.1)', border: 'rgba(234, 179, 8, 0.25)' },
  { box: 4, label: '4. Kutu', name: 'Kalıcı Hafıza', interval: '14 Gün', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.25)' },
  { box: 5, label: '5. Kutu', name: 'Sınav Ustası', interval: 'Kalıcı / 30 Gün', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.25)' },
];

export default function HataDefteriPage() {
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [filteredMistakes, setFilteredMistakes] = useState<Mistake[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('Tümü');
  const [boxFilter, setBoxFilter] = useState<'all' | 'due' | 1 | 2 | 3 | 4 | 5>('all');
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
  const [quizBoxFeedback, setQuizBoxFeedback] = useState<string | null>(null);

  const { checkAuth } = useAuth();

  useEffect(() => {
    fetchMistakes();
  }, []);

  const fetchMistakes = async () => {
    try {
      const res = await fetch('/api/user/errors');
      if (res.ok) {
        const data = await res.json();
        setMistakes(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    let result = [...mistakes];

    // Subject Filter
    if (activeFilter !== 'Tümü') {
      result = result.filter(m => m.subject === activeFilter);
    }

    // Leitner Box Filter
    if (boxFilter === 'due') {
      result = result.filter(m => m.isDue);
    } else if (boxFilter !== 'all') {
      result = result.filter(m => m.leitnerBox === boxFilter);
    }

    setFilteredMistakes(result);
  }, [activeFilter, boxFilter, mistakes]);

  // Unique subjects for filters
  const subjectsList = ['Tümü', ...Array.from(new Set(mistakes.map(m => m.subject)))];

  const dueCount = mistakes.filter(m => m.isDue).length;
  const masteredCount = mistakes.filter(m => m.leitnerBox === 5).length;
  const masteryPercentage = mistakes.length > 0 ? Math.round((masteredCount / mistakes.length) * 100) : 0;

  const deleteMistake = async (id: number) => {
    try {
      const res = await fetch(`/api/user/errors?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setMistakes(prev => prev.filter(m => m.id !== id));
        toast.success('Soru hata defterinden kaldırıldı.');
      }
    } catch (e) {
      console.error(e);
      toast.error('Silinirken hata oluştu.');
    }
  };

  // Start AI Exam from mistakes
  const startErrorQuiz = async (dueOnly = false) => {
    try {
      const res = await fetch('/api/questions/error-quiz');
      if (res.ok) {
        let data = await res.json();
        if (dueOnly) {
          const dueIds = new Set(mistakes.filter(m => m.isDue).map(m => m.id));
          const filtered = data.filter((q: any) => dueIds.has(q.originalId));
          if (filtered.length > 0) data = filtered;
        }

        setQuizQuestions(data);
        setCurrentQuizIdx(0);
        setQuizSelectedOption(null);
        setQuizIsAnswered(false);
        setQuizIsCorrect(false);
        setQuizScore(0);
        setQuizBoxFeedback(null);
        setIsQuizActive(true);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Quiz oluşturulamadı.');
      }
    } catch (e) {
      toast.error('Quiz başlatılırken bağlantı hatası oluştu.');
      console.error(e);
    }
  };

  // Handle Quiz Option Selection with Leitner Box updates
  const handleQuizAnswer = async (option: string) => {
    if (quizIsAnswered) return;
    setQuizSelectedOption(option);
    
    const currentQ = quizQuestions[currentQuizIdx];
    const isCorrect = option === currentQ.dogruCevap;
    setQuizIsCorrect(isCorrect);
    setQuizIsAnswered(true);

    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }

    // Call Leitner Update API
    try {
      const res = await fetch('/api/user/errors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentQ.originalId,
          isCorrect: isCorrect
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setQuizBoxFeedback(data.message);
      }
    } catch (err) {
      console.error('Leitner progress error:', err);
    }
  };

  const handleNextQuizQuestion = () => {
    if (currentQuizIdx + 1 < quizQuestions.length) {
      setCurrentQuizIdx(prev => prev + 1);
      setQuizSelectedOption(null);
      setQuizIsAnswered(false);
      setQuizIsCorrect(false);
      setQuizBoxFeedback(null);
    } else {
      // End of Quiz
      checkAuth();
      fetchMistakes();
      setCurrentQuizIdx(-1); // Triggers result view
    }
  };

  const formatDueText = (nextDateStr: string, isDue: boolean) => {
    if (isDue) return '🔔 Bugün Tekrar Zamanı!';
    try {
      const diffMs = new Date(nextDateStr).getTime() - new Date().getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return `⏳ ${diffDays > 0 ? diffDays : 1} gün sonra tekrar`;
    } catch {
      return 'Yakında';
    }
  };

  if (!isLoaded) return null;

  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(249,115,22,0.15))', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(239,68,68,0.2)' }}>
            <Layers size={26} color="#ef4444" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.85rem', color: '#fff', margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}>
              Leitner Akıllı Hata Defteri
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '4px 0 0' }}>
              Ebbinghaus unutma eğrisine karşı 5 aşamalı aralıklı tekrar algoritmasıyla eksiklerini kalıcı hafızaya al.
            </p>
          </div>
        </div>

        {mistakes.length > 0 && (
          <button 
            onClick={() => startErrorQuiz(false)}
            className="btn-interactive"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: '#fff', fontWeight: 700, borderRadius: '12px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.35)' }}
          >
            <Zap size={18} /> Tüm Hatalardan Sınav
          </button>
        )}
      </div>

      {/* ── LEITNER 5 KUTU BARI & GELİŞİM ÖZETİ ── */}
      {mistakes.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          
          {/* Due Alert Banner */}
          {dueCount > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '1.25rem 1.5rem',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.15)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Flame size={24} color="#f59e0b" />
                </div>
                <div>
                  <h3 style={{ color: '#fff', fontSize: '1.05rem', margin: 0, fontWeight: 700 }}>
                    Bugün Tekrar Zamanı Gelen {dueCount} Kritik Yanlış Soru Var!
                  </h3>
                  <p style={{ color: '#cbd5e1', fontSize: '0.825rem', margin: '3px 0 0' }}>
                    Beynin bilgiyi unutmadan hemen önce tekrar etmek kalıcı hafızaya aktarımı %300 artırır.
                  </p>
                </div>
              </div>

              <button
                onClick={() => startErrorQuiz(true)}
                style={{
                  padding: '0.7rem 1.4rem',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)'
                }}
              >
                <Zap size={16} /> Bugünkü Tekrarı Başlat ({dueCount} Soru)
              </button>
            </motion.div>
          )}

          {/* Leitner Box Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {LEITNER_BOX_INFO.map(b => {
              const count = mistakes.filter(m => m.leitnerBox === b.box).length;
              const isSelected = boxFilter === b.box;

              return (
                <div
                  key={b.box}
                  onClick={() => setBoxFilter(isSelected ? 'all' : (b.box as any))}
                  style={{
                    padding: '1.25rem 1rem',
                    borderRadius: '14px',
                    background: isSelected ? b.bg : 'rgba(255,255,255,0.02)',
                    border: isSelected ? `2px solid ${b.color}` : `1px solid rgba(255,255,255,0.06)`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: `${b.color}20`, color: b.color }}>
                      {b.label}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{b.interval}</span>
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: '0.2rem 0' }}>
                    {count} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Soru</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: b.color, fontWeight: 600 }}>{b.name}</div>
                </div>
              );
            })}
          </div>

          {/* Mastery Progress Bar */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trophy size={18} color="#10b981" />
              <span style={{ fontSize: '0.875rem', color: '#fff', fontWeight: 600 }}>Kalıcı Hafıza & Ustalık Oranı:</span>
              <span style={{ fontSize: '0.95rem', color: '#10b981', fontWeight: 800 }}>%{masteryPercentage}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({masteredCount} / {mistakes.length} soru ustalaşıldı)</span>
            </div>

            <div style={{ flex: '1 1 200px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${masteryPercentage}%`, background: 'linear-gradient(90deg, #3b82f6, #10b981)', borderRadius: '3px', transition: 'width 0.8s ease' }} />
            </div>
          </div>
        </div>
      )}

      {/* Filters & Empty State Check */}
      {mistakes.length === 0 ? (
        <div className="premium-card" style={{ textAlign: 'center', padding: '5rem 2rem', border: '1px dashed var(--border-strong)', boxShadow: 'none' }}>
          <HelpCircle size={48} color="var(--text-muted)" style={{ margin: '0 auto 1.5rem' }} />
          <h3 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Hata Defterin Tamamen Boş!</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            Harika gidiyorsun! Hiç yanlış sorun bulunmuyor. Soru Çöz sayfasından test çözmeye devam et, yanlışların otomatik olarak 1. Kutuya eklenir.
          </p>
        </div>
      ) : (
        <>
          {/* Filters Bar */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setActiveFilter('Tümü'); setBoxFilter('all'); }}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '99px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: activeFilter === 'Tümü' && boxFilter === 'all' ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                background: activeFilter === 'Tümü' && boxFilter === 'all' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
                color: activeFilter === 'Tümü' && boxFilter === 'all' ? '#c4b5fd' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              Tümü ({mistakes.length})
            </button>

            {dueCount > 0 && (
              <button
                onClick={() => setBoxFilter(boxFilter === 'due' ? 'all' : 'due')}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '99px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: boxFilter === 'due' ? '1px solid #f59e0b' : '1px solid rgba(245,158,11,0.3)',
                  background: boxFilter === 'due' ? 'rgba(245,158,11,0.25)' : 'rgba(245,158,11,0.1)',
                  color: '#fbbf24',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>🔔 Bugün Tekrar Edilecekler ({dueCount})</span>
              </button>
            )}

            {subjectsList.filter(s => s !== 'Tümü').map(subject => (
              <button
                key={subject}
                onClick={() => setActiveFilter(activeFilter === subject ? 'Tümü' : subject)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '99px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: activeFilter === subject ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                  background: activeFilter === subject ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.03)',
                  color: activeFilter === subject ? '#38bdf8' : 'var(--text-muted)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {subject} ({mistakes.filter(m => m.subject === subject).length})
              </button>
            ))}
          </div>

          {/* List of mistakes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredMistakes.map(mistake => {
              const isExpanded = expandedId === mistake.id;
              const boxInfo = LEITNER_BOX_INFO.find(b => b.box === mistake.leitnerBox) || LEITNER_BOX_INFO[0];
              
              return (
                <motion.div 
                  key={mistake.id}
                  layout
                  className="premium-card"
                  style={{ 
                    padding: '1.5rem', 
                    position: 'relative',
                    borderLeft: `4px solid ${boxInfo.color}`,
                    background: mistake.isDue ? 'rgba(245, 158, 11, 0.03)' : undefined
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', background: `${boxInfo.color}18`, border: `1px solid ${boxInfo.color}35`, fontSize: '0.75rem', color: boxInfo.color, fontWeight: 700 }}>
                        📦 {boxInfo.label} · {boxInfo.name}
                      </span>
                      <span style={{ display: 'inline-flex', padding: '0.2rem 0.6rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>
                        {mistake.subject}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', fontWeight: 500 }}>
                        {mistake.topic}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: mistake.isDue ? '#f59e0b' : 'var(--text-muted)', fontWeight: 600 }}>
                        {formatDueText(mistake.nextReviewAt, mistake.isDue)}
                      </span>

                      <button 
                        onClick={() => deleteMistake(mistake.id)}
                        aria-label="Defterden Kaldır"
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.04)', 
                          border: '1px solid rgba(255, 255, 255, 0.08)', 
                          color: 'var(--text-muted)', 
                          cursor: 'pointer', 
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        className="hover-red"
                        title="Defterden Kaldır"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <p style={{ color: 'var(--text-primary)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '1.25rem', fontWeight: 500 }}>
                    {mistake.icerik}
                  </p>

                  {/* Options with selection details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.45rem', maxWidth: '600px', marginBottom: '1.25rem' }}>
                    {mistake.secenekler.map((opt, i) => {
                      const isSelected = opt === mistake.secilenCevap;
                      const isCorrect = opt === mistake.dogruCevap;
                      
                      let bg = 'rgba(255,255,255,0.02)';
                      let border = '1px solid rgba(255,255,255,0.06)';
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
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.9rem', background: bg, border, borderRadius: '8px', color, fontSize: '0.875rem' }}>
                          <span>{opt}</span>
                          {isCorrect && <span style={{ fontSize: '0.72rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Check size={13} /> Doğru Cevap</span>}
                          {isSelected && !isCorrect && <span style={{ fontSize: '0.72rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><X size={13} /> Senin Seçimin</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Collapsible solution */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : mistake.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent)',
                        fontSize: '0.825rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: 0
                      }}
                    >
                      {isExpanded ? <><ChevronUp size={15} /> Çözümü Gizle</> : <><ChevronDown size={15} /> Çözümü Göster</>}
                    </button>

                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      Toplam Tekrar: {mistake.reviewCount || 0} kez
                    </span>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderLeft: '3px solid var(--accent)', borderRadius: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                          <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>Detaylı Soru Çözümü:</strong>
                          {mistake.cozum || 'Bu soru için henüz ek bir çözüm notu girilmemiş.'}
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

      {/* ── INTERACTIVE LEITNER AI QUIZ MODAL ── */}
      <AnimatePresence>
        {isQuizActive && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1rem' }}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="premium-card"
              style={{ width: '100%', maxWidth: '620px', overflow: 'hidden', padding: 0, background: '#0b101b', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              
              {/* Modal Header */}
              <div style={{ padding: '1.25rem 1.75rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Zap size={18} color="#a855f7" /> Leitner Aralıklı Tekrar Sınavı
                </h3>
                {currentQuizIdx >= 0 && (
                  <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    Soru: {currentQuizIdx + 1} / {quizQuestions.length}
                  </span>
                )}
              </div>

              {/* Modal Body */}
              <div style={{ padding: '1.75rem' }}>
                
                {/* Active Question View */}
                {currentQuizIdx >= 0 ? (
                  <div>
                    {/* Lesson Subject & Topic badge */}
                    <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ display: 'inline-flex', padding: '0.2rem 0.5rem', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '4px', fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 600 }}>
                        {quizQuestions[currentQuizIdx].subject}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {quizQuestions[currentQuizIdx].topic}
                      </span>
                    </div>

                    <p style={{ color: '#fff', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '1.75rem', fontWeight: 500 }}>
                      {quizQuestions[currentQuizIdx].metin}
                    </p>

                    {/* Interactive Choices */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {quizQuestions[currentQuizIdx].secenekler.map((opt: string, i: number) => {
                        const isSelected = opt === quizSelectedOption;
                        const isCorrect = opt === quizQuestions[currentQuizIdx].dogruCevap;
                        
                        let bg = 'rgba(255,255,255,0.03)';
                        let border = '1px solid rgba(255,255,255,0.08)';
                        let color = '#fff';

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
                            bg = 'rgba(255,255,255,0.01)';
                            color = 'var(--text-muted)';
                          }
                        } else if (isSelected) {
                          bg = 'rgba(99,102,241,0.25)';
                          border = '1px solid #6366f1';
                        }

                        return (
                          <button
                            key={i}
                            disabled={quizIsAnswered}
                            onClick={() => handleQuizAnswer(opt)}
                            style={{ padding: '0.85rem 1rem', background: bg, border, borderRadius: '10px', color, textAlign: 'left', fontSize: '0.9rem', cursor: quizIsAnswered ? 'default' : 'pointer', transition: 'all 0.15s' }}
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
                        style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: quizIsCorrect ? '#10b981' : '#ef4444', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.4rem' }}>
                          {quizIsCorrect ? <><Check size={18} /> Tebrikler! Doğru Çözdün.</> : <><X size={18} /> Yanlış Çözüm.</>}
                        </div>

                        {quizBoxFeedback && (
                          <div style={{ padding: '0.6rem 0.9rem', borderRadius: '8px', background: quizIsCorrect ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${quizIsCorrect ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, color: quizIsCorrect ? '#34d399' : '#fca5a5', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
                            {quizBoxFeedback}
                          </div>
                        )}

                        {!quizIsCorrect && quizQuestions[currentQuizIdx].cozum && (
                          <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderLeft: '2px solid rgba(255,255,255,0.2)', borderRadius: '4px', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1rem', maxHeight: '90px', overflowY: 'auto' }}>
                            <strong>Çözüm:</strong> {quizQuestions[currentQuizIdx].cozum}
                          </div>
                        )}
                        
                        <button
                          onClick={handleNextQuizQuestion}
                          className="btn-interactive"
                          style={{ width: '100%', padding: '0.8rem', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: '#fff', fontWeight: 700, borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                          {currentQuizIdx + 1 < quizQuestions.length ? 'Sıradaki Soru' : 'Sonuçları Gör'} <ArrowRight size={16} />
                        </button>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  
                  // Quiz Result View (currentQuizIdx === -1)
                  <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                      <Award size={36} color="#10b981" />
                    </div>
                    <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Tekrar Sınavı Tamamlandı!</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      {quizQuestions.length} sorudan <strong style={{ color: '#10b981' }}>{quizScore} tanesini</strong> doğru cevapladın ve Leitner kutularında seviye atlattın!
                    </p>
                    
                    {quizScore > 0 && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '8px', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 700, marginBottom: '2rem' }}>
                        ⚡ +{quizScore * 15} XP ve Hafıza Puanı Kazanıldı!
                      </div>
                    )}

                    <button
                      onClick={() => setIsQuizActive(false)}
                      className="btn-interactive"
                      style={{ width: '100%', padding: '0.8rem', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: '#fff', fontWeight: 700, borderRadius: '10px', cursor: 'pointer' }}
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
        .hover-red { transition: color 0.2s; }
        .hover-red:hover { color: #ef4444 !important; }
      `}</style>
    </div>
  );
}
