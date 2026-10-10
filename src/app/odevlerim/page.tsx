"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, CheckCircle2, Clock, Calendar, BrainCircuit, X, 
  MessageSquare, User, Sparkles, BookOpen, Check, Award, ArrowRight,
  Send, HelpCircle, Heart, Star
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OdevlerimPage() {
  const [activeTab, setActiveTab] = useState<'odevler' | 'notlar'>('odevler');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  
  const [assignments, setAssignments] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeAssignment, setActiveAssignment] = useState<any>(null);
  const [solvingState, setSolvingState] = useState<'idle' | 'solving' | 'result'>('idle');
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [rewardInfo, setRewardInfo] = useState<{ xp: number; coins: number } | null>(null);
  const [submittingManual, setSubmittingManual] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    // Check if ?tab=notlar is in URL
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('tab') === 'notlar') {
        setActiveTab('notlar');
      }
    }

    Promise.all([
      fetch('/api/student/assignments').then(r => r.json()).catch(() => ({})),
      fetch('/api/student/notes').then(r => r.json()).catch(() => ({}))
    ]).then(([assignData, notesData]) => {
      if (assignData?.success) setAssignments(assignData.assignments || []);
      if (notesData?.success) setNotes(notesData.notes || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const parseQuestions = (json: any) => {
    if (!json) return [];
    if (Array.isArray(json)) return json;
    try {
      const parsed = typeof json === 'string' ? JSON.parse(json) : json;
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  };

  const openAssignment = (a: any) => {
    setActiveAssignment(a);
    setSelectedOption(null);
    setIsChecking(false);
    setRewardInfo(null);

    const qList = parseQuestions(a.questions_json);
    if (qList.length > 0 && a.status === 'pending') {
      setSolvingState('solving');
      setCurrentQ(0);
      setScore(0);
    } else {
      setSolvingState('result');
    }
  };

  const handleManualComplete = async (assignment: any) => {
    setSubmittingManual(true);
    try {
      const res = await fetch('/api/student/assignments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          assignment_id: assignment.id, 
          status: 'completed',
          score: 100 
        })
      });
      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 90, spread: 65, origin: { y: 0.6 } });
        setAssignments(prev => prev.map(item => item.id === assignment.id ? { ...item, status: 'completed', score: 100 } : item));
        if (activeAssignment?.id === assignment.id) {
          setActiveAssignment({ ...activeAssignment, status: 'completed', score: 100 });
        }
        showToast('🎉 Ödev başarıyla tamamlandı ve öğretmeninize bildirildi! (+75 XP)');
      }
    } catch (e) {
      console.error(e);
      showToast('❌ Ödev teslim edilirken bir hata oluştu.');
    } finally {
      setSubmittingManual(false);
    }
  };

  const handleAnswer = (opt: string) => {
    if (isChecking) return;
    setSelectedOption(opt);
    setIsChecking(true);

    const qList = parseQuestions(activeAssignment?.questions_json);
    const q = qList[currentQ];
    const isCorrect = opt === q?.correctAnswer;
    const newScore = score + (isCorrect ? 1 : 0);
    if (isCorrect) setScore(newScore);

    setTimeout(() => {
      setIsChecking(false);
      setSelectedOption(null);
      if (currentQ < qList.length - 1) {
        setCurrentQ(c => c + 1);
      } else {
        finishQuizAssignment(newScore, qList.length);
      }
    }, 400);
  };

  const finishQuizAssignment = async (finalScore: number, totalQ: number) => {
    setSolvingState('result');
    const finalPercent = totalQ > 0 ? Math.round((finalScore / totalQ) * 100) : 100;
    confetti({ particleCount: 110, spread: 75, origin: { y: 0.6 } });
    
    try {
      const res = await fetch('/api/student/assignments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignment_id: activeAssignment.id, score: finalPercent })
      });
      const data = await res.json();
      if (data.earnedXp) {
        setRewardInfo({ xp: data.earnedXp, coins: data.earnedCoins });
      }

      setAssignments(prev => prev.map(a => a.id === activeAssignment.id ? { ...a, status: 'graded', score: finalPercent } : a));
      setActiveAssignment({ ...activeAssignment, status: 'graded', score: finalPercent });
      showToast(`🎯 Test tamamlandı! Başarı: %${finalPercent}`);
    } catch (e) {
      console.error(e);
    }
  };

  const pendingCount = assignments.filter(a => a.status === 'pending').length;
  const completedCount = assignments.filter(a => a.status === 'completed' || a.status === 'graded' || a.status === 'submitted').length;

  const filteredAssignments = assignments.filter(a => {
    if (statusFilter === 'pending') return a.status === 'pending';
    if (statusFilter === 'completed') return a.status === 'completed' || a.status === 'graded' || a.status === 'submitted';
    return true;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: '#94a3b8', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(139,92,246,0.2)', borderTopColor: '#8b5cf6', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: '0.9rem' }}>Ödevler ve öğretmen notları yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="odevlerim-page-wrap" style={{ padding: 'clamp(16px, 4vw, 40px)', maxWidth: 1200, margin: '0 auto' }}>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: 24,
              right: 24,
              zIndex: 9999,
              background: 'linear-gradient(135deg, #1e1b4b, #0f172a)',
              border: '1px solid #8b5cf6',
              borderRadius: 12,
              padding: '12px 20px',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: 600,
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(139,92,246,0.15)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.3)' }}>
              ÖĞRENCİ AKADEMİK PANELİ
            </span>
            {pendingCount > 0 && (
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(245,158,11,0.15)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.3)' }}>
                {pendingCount} Bekleyen Görev
              </span>
            )}
          </div>
          <h1 style={{ fontSize: '2rem', color: '#fff', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ClipboardList size={32} color="#8b5cf6" /> Ödevlerim & Öğretmen Notları
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '6px 0 0' }}>
            Öğretmenlerinizin atadığı ödevler, çözümlü testler ve sizin için paylaştıkları rehberlik görüşleri
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', padding: 4, borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => setActiveTab('odevler')}
            style={{
              padding: '8px 18px',
              borderRadius: 10,
              border: 'none',
              background: activeTab === 'odevler' ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'transparent',
              color: activeTab === 'odevler' ? '#fff' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s'
            }}
          >
            <ClipboardList size={16} /> Ödevlerim ({assignments.length})
          </button>
          <button
            onClick={() => setActiveTab('notlar')}
            style={{
              padding: '8px 18px',
              borderRadius: 10,
              border: 'none',
              background: activeTab === 'notlar' ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'transparent',
              color: activeTab === 'notlar' ? '#fff' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s'
            }}
          >
            <MessageSquare size={16} /> Öğretmen Notları ({notes.length})
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          TAB 1: ÖDEVLERİM & GÖREVLERİM
      ══════════════════════════════════════════ */}
      {activeTab === 'odevler' && (
        <div>
          {/* Status Filter Bar */}
          <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setStatusFilter('all')}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: statusFilter === 'all' ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)',
                color: statusFilter === 'all' ? '#c4b5fd' : '#94a3b8',
                border: statusFilter === 'all' ? '1px solid #8b5cf6' : '1px solid rgba(255,255,255,0.08)'
              }}
            >
              Tümü ({assignments.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: statusFilter === 'pending' ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.03)',
                color: statusFilter === 'pending' ? '#fcd34d' : '#94a3b8',
                border: statusFilter === 'pending' ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)'
              }}
            >
              Bekleyenler ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: statusFilter === 'completed' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.03)',
                color: statusFilter === 'completed' ? '#6ee7b7' : '#94a3b8',
                border: statusFilter === 'completed' ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)'
              }}
            >
              Tamamlananlar ({completedCount})
            </button>
          </div>

          {/* Assignments Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '1.25rem' }}>
            {filteredAssignments.length > 0 ? filteredAssignments.map(a => {
              const isGraded = a.status === 'graded';
              const isCompleted = a.status === 'completed' || a.status === 'submitted' || isGraded;
              const hasQuiz = parseQuestions(a.questions_json).length > 0;
              const hasFeedback = a.teacher_feedback && a.teacher_feedback.trim().length > 0;

              return (
                <motion.div 
                  key={a.id} 
                  whileHover={{ y: -4 }} 
                  style={{
                    background: 'rgba(255,255,255,0.03)', 
                    border: isCompleted ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.08)',
                    borderLeft: isCompleted ? '4px solid #10b981' : '4px solid #f59e0b',
                    borderRadius: '16px', 
                    padding: '1.4rem', 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                  }}
                >
                  <div>
                    {/* Top Meta: Teacher & Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: 8, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#fff', fontWeight: 700 }}>
                          {a.teacher_name?.charAt(0)?.toUpperCase() || 'Ö'}
                        </div>
                        <div>
                          <div style={{ color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 700 }}>{a.teacher_name}</div>
                          <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{a.teacher_brans || 'Öğretmen'}</div>
                        </div>
                      </div>

                      {isCompleted ? (
                        <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle2 size={13} /> {isGraded && a.score != null ? `Puan: ${a.score}/100` : 'Tamamlandı'}
                        </div>
                      ) : (
                        <div style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24', padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={13} /> Bekliyor
                        </div>
                      )}
                    </div>

                    {/* Subject & Category Tags */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '0.65rem' }}>
                      {a.subject && (
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 6, background: 'rgba(139,92,246,0.15)', color: '#c4b5fd', fontWeight: 600 }}>
                          {a.subject}{a.topic ? ` · ${a.topic}` : ''}
                        </span>
                      )}
                      {hasQuiz && (
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 6, background: 'rgba(56,189,248,0.15)', color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <BrainCircuit size={11} /> İnteraktif Test
                        </span>
                      )}
                      {a.category && a.category !== 'Genel' && (
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                          {a.category}
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <h3 style={{ color: '#fff', fontSize: '1.15rem', marginBottom: '0.45rem', fontWeight: 700, lineHeight: 1.4 }}>
                      {a.title}
                    </h3>
                    {a.description && (
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                        {a.description}
                      </p>
                    )}

                    {/* Teacher Feedback Quote Box if present */}
                    {hasFeedback && (
                      <div style={{
                        marginTop: '0.6rem',
                        padding: '10px 12px',
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
                        border: '1px solid rgba(139,92,246,0.3)',
                        borderRadius: 10,
                        fontSize: '0.8rem',
                        color: '#c4b5fd'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700, marginBottom: 3, color: '#a5b4fc', fontSize: '0.75rem' }}>
                          <MessageSquare size={12} /> Öğretmen Geri Bildirimi:
                        </div>
                        <div style={{ fontStyle: 'italic', lineHeight: 1.4 }}>
                          "{a.teacher_feedback}"
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Meta & Action Button */}
                  <div>
                    {a.due_date && (
                      <div style={{ color: '#64748b', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 5, marginBottom: '0.75rem' }}>
                        <Calendar size={13} /> Son Teslim: {new Date(a.due_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8 }}>
                      {hasQuiz ? (
                        <button 
                          onClick={() => openAssignment(a)}
                          style={{
                            flex: 1, padding: '0.65rem', borderRadius: '10px', border: 'none',
                            background: !isCompleted ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'rgba(255,255,255,0.06)',
                            color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            transition: 'all 0.2s'
                          }}
                        >
                          <BrainCircuit size={15} /> {!isCompleted ? 'Testi Çöz' : 'Sonucu Gör'}
                        </button>
                      ) : !isCompleted ? (
                        <button
                          onClick={() => handleManualComplete(a)}
                          disabled={submittingManual}
                          style={{
                            flex: 1, padding: '0.65rem', borderRadius: '10px', border: 'none',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            transition: 'all 0.2s'
                          }}
                        >
                          <CheckCircle2 size={15} /> Ödevi Tamamladım
                        </button>
                      ) : (
                        <div style={{ flex: 1, padding: '0.55rem', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399', textAlign: 'center', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                          <CheckCircle2 size={14} /> Teslim Edildi ✓
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            }) : (
              <div style={{ color: '#9ca3af', gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                <ClipboardList size={44} color="rgba(255,255,255,0.2)" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
                <h3 style={{ color: '#e2e8f0', fontSize: '1.1rem', margin: 0 }}>Bu filtrede ödev bulunamadı</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 4 }}>Şu an atanmış aktif ödeviniz bulunmuyor.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB 2: ÖĞRETMEN NOTLARI & REHBERLİK
      ══════════════════════════════════════════ */}
      {activeTab === 'notlar' && (
        <div>
          <div style={{ marginBottom: '1.25rem', padding: '14px 18px', background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(99,102,241,0.05))', borderRadius: 12, border: '1px solid rgba(139,92,246,0.25)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={20} color="#a78bfa" />
            <p style={{ color: '#c4b5fd', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
              Öğretmenleriniz burada sizin ders çalışma temponuz, deneme netleriniz ve motivasyonunuz hakkında özel gelişim notları paylaşır. Bu notlar aynı zamanda veli portalınızda da paylaşılabilmektedir.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))', gap: '1.25rem' }}>
            {notes.length > 0 ? notes.map(n => {
              const categoryBadge = 
                n.category === 'rehberlik' ? { label: '🎯 Rehberlik & Strateji', color: '#38bdf8', bg: 'rgba(56,189,248,0.15)' } :
                n.category === 'akademik' ? { label: '📈 Akademik Gelişim', color: '#10b981', bg: 'rgba(16,185,129,0.15)' } :
                n.category === 'motivasyon' ? { label: '🔥 Moral & Motivasyon', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' } :
                { label: '📌 Genel Tavsiye', color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' };

              return (
                <motion.div
                  key={n.id}
                  whileHover={{ y: -3 }}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16,
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
                  }}
                >
                  <div>
                    {/* Header: Teacher Avatar + Name + Category */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: 8, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.9rem' }}>
                          {n.teacher_name?.charAt(0)?.toUpperCase() || 'Ö'}
                        </div>
                        <div>
                          <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>{n.teacher_name}</div>
                          <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{n.teacher_brans}</div>
                        </div>
                      </div>

                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: categoryBadge.bg, color: categoryBadge.color, border: `1px solid ${categoryBadge.color}40` }}>
                        {categoryBadge.label}
                      </span>
                    </div>

                    {/* Note Content */}
                    <div style={{
                      padding: '14px 16px',
                      background: 'rgba(0,0,0,0.25)',
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.05)',
                      color: '#f1f5f9',
                      fontSize: '0.88rem',
                      lineHeight: 1.6,
                      fontStyle: 'normal'
                    }}>
                      "{n.note}"
                    </div>
                  </div>

                  {/* Footer: Date & Reaction */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> {new Date(n.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>

                    <button
                      onClick={() => showToast('❤️ Öğretmeninize teşekkür iletildi!')}
                      style={{
                        background: 'rgba(236,72,153,0.1)',
                        border: '1px solid rgba(236,72,153,0.3)',
                        borderRadius: 20,
                        padding: '4px 12px',
                        color: '#f472b6',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        transition: 'all 0.2s'
                      }}
                    >
                      <Heart size={12} /> Anladım / Teşekkürler
                    </button>
                  </div>
                </motion.div>
              );
            }) : (
              <div style={{ color: '#9ca3af', gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                <MessageSquare size={44} color="rgba(255,255,255,0.2)" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
                <h3 style={{ color: '#e2e8f0', fontSize: '1.1rem', margin: 0 }}>Henüz öğretmen notu bulunmuyor</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 4 }}>Öğretmenleriniz sizin için tavsiye yazdığında burada listelenecektir.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Solving / Quiz Modal */}
      <AnimatePresence>
        {activeAssignment && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              style={{ background: '#0f1015', width: '100%', maxWidth: '800px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
              
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{activeAssignment.title}</h3>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: 3 }}>Öğretmen: {activeAssignment.teacher_name} ({activeAssignment.teacher_brans || 'Branş'})</div>
                </div>
                <button onClick={() => setActiveAssignment(null)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X size={24} /></button>
              </div>
              
              <div style={{ padding: '2rem', overflowY: 'auto' }}>
                {solvingState === 'solving' ? (
                  (() => {
                    const qList = parseQuestions(activeAssignment.questions_json);
                    const q = qList[currentQ];
                    if (!q) {
                      return (
                        <div style={{ textAlign: 'center', padding: '2rem 0', color: '#9ca3af' }}>
                          Soru formatı ayrıştırılamadı.
                        </div>
                      );
                    }
                    return (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af', marginBottom: '1.5rem', fontWeight: 600 }}>
                          <span>Soru {currentQ + 1} / {qList.length}</span>
                        </div>
                        <div style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '2rem', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: (q.questionText || q.question || '').replace(/\n/g, '<br/>') }} />
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {(q.options || []).map((opt: string, i: number) => {
                            const isSelected = selectedOption === opt;
                            return (
                              <button 
                                key={i} 
                                onClick={() => handleAnswer(opt)} 
                                disabled={isChecking}
                                style={{
                                  padding: '1.25rem', borderRadius: '12px', 
                                  background: isSelected ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.03)', 
                                  border: isSelected ? '1px solid #8b5cf6' : '1px solid rgba(255,255,255,0.08)',
                                  color: '#fff', textAlign: 'left', fontSize: '1rem', cursor: isChecking ? 'default' : 'pointer', 
                                  transition: 'all 0.2s', display: 'flex', gap: '1rem'
                                }} 
                                onMouseEnter={e => { if (!isSelected && !isChecking) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }} 
                                onMouseLeave={e => { if (!isSelected && !isChecking) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                              >
                                <span style={{ color: '#8b5cf6', fontWeight: 700 }}>{['A', 'B', 'C', 'D', 'E'][i]})</span> {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                      <CheckCircle2 size={50} color="#10b981" />
                    </div>
                    <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '0.5rem' }}>Ödev Tamamlandı!</h2>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: rewardInfo ? '1rem' : '2rem' }}>
                      {activeAssignment.score != null ? (
                        <>Başarı Oranın: <span style={{ color: '#10b981', fontWeight: 800 }}>%{activeAssignment.score}</span></>
                      ) : (
                        <span style={{ color: '#10b981', fontWeight: 700 }}>Öğretmeninize teslim edildi!</span>
                      )}
                    </p>

                    {activeAssignment.teacher_feedback && (
                      <div style={{ maxWidth: 500, margin: '0 auto 1.5rem', padding: '14px 18px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, textAlign: 'left', color: '#c4b5fd', fontSize: '0.88rem' }}>
                        <div style={{ fontWeight: 700, color: '#a5b4fc', marginBottom: 4 }}>💬 Öğretmeninizin Notu:</div>
                        <div>"{activeAssignment.teacher_feedback}"</div>
                      </div>
                    )}

                    {rewardInfo && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '20px', color: '#fbbf24', fontSize: '0.9rem', fontWeight: 700, marginBottom: '2rem' }}>
                        <span>🎉 +{rewardInfo.xp} XP</span>
                        <span>·</span>
                        <span>🪙 +{rewardInfo.coins} Coin</span>
                      </div>
                    )}
                    <div>
                      <button onClick={() => setActiveAssignment(null)} style={{ padding: '0.75rem 2rem', background: '#3b82f6', color: '#fff', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>Panoya Dön</button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .odevlerim-page-wrap {
            padding-bottom: calc(85px + env(safe-area-inset-bottom, 20px)) !important;
            padding-top: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
