"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, CheckCircle2, Clock, Calendar, BrainCircuit, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OdevlerimPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAssignment, setActiveAssignment] = useState<any>(null);
  const [solvingState, setSolvingState] = useState<'idle' | 'solving' | 'result'>('idle');
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetch('/api/student/assignments')
      .then(r => r.json())
      .then(d => { if (d.success) setAssignments(d.assignments); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const openAssignment = (a: any) => {
    setActiveAssignment(a);
    if (a.questions_json && a.status === 'pending') {
      setSolvingState('solving');
      setCurrentQ(0);
      setScore(0);
    } else {
      setSolvingState('result');
    }
  };

  const handleAnswer = (opt: string) => {
    const qList = JSON.parse(activeAssignment.questions_json);
    const q = qList[currentQ];
    
    if (opt === q.correctAnswer) {
      setScore(s => s + 1);
    }
    
    if (currentQ < qList.length - 1) {
      setCurrentQ(c => c + 1);
    } else {
      finishAssignment(score + (opt === q.correctAnswer ? 1 : 0), qList.length);
    }
  };

  const finishAssignment = async (finalScore: number, totalQ: number) => {
    setSolvingState('result');
    const finalPercent = Math.round((finalScore / totalQ) * 100);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    
    try {
      await fetch('/api/student/assignments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignment_id: activeAssignment.id, score: finalPercent })
      });
      // Update local state
      setAssignments(prev => prev.map(a => a.id === activeAssignment.id ? { ...a, status: 'graded', score: finalPercent } : a));
      setActiveAssignment({ ...activeAssignment, status: 'graded', score: finalPercent });
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff' }}>Yükleniyor...</div>;

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 40px)', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', color: '#fff', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <ClipboardList size={32} color="#8b5cf6" /> Ödevlerim
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {assignments.length > 0 ? assignments.map(a => (
          <motion.div key={a.id} whileHover={{ y: -5 }} style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Öğretmen: {a.teacher_name}</div>
              {a.status === 'pending' ? (
                <div style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={14} /> Bekliyor
                </div>
              ) : (
                <div style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={14} /> Tamamlandı
                </div>
              )}
            </div>
            
            <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 700 }}>{a.title}</h3>
            {a.description && <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '1rem', flex: 1 }}>{a.description}</p>}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {a.due_date && (
                <div style={{ color: '#6b7280', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={14} /> Teslim: {a.due_date}
                </div>
              )}
              {a.questions_json && (
                <div style={{ color: '#8b5cf6', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <BrainCircuit size={14} /> AI Testi
                </div>
              )}
            </div>
            
            <button 
              onClick={() => openAssignment(a)}
              style={{
                width: '100%', padding: '0.75rem', marginTop: '1.25rem', borderRadius: '12px', border: 'none',
                background: a.status === 'pending' ? '#8b5cf6' : 'rgba(255,255,255,0.05)',
                color: '#fff', fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {a.status === 'pending' ? 'Hemen Çöz' : 'Sonucu Gör'}
            </button>
          </motion.div>
        )) : (
          <div style={{ color: '#9ca3af', gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>Şu an atanmış bir ödeviniz bulunmuyor.</div>
        )}
      </div>

      {/* Solving Modal */}
      <AnimatePresence>
        {activeAssignment && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              style={{ background: '#0f1015', width: '100%', maxWidth: '800px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
              
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{activeAssignment.title}</h3>
                <button onClick={() => setActiveAssignment(null)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X size={24} /></button>
              </div>
              
              <div style={{ padding: '2rem', overflowY: 'auto' }}>
                {solvingState === 'solving' ? (
                  (() => {
                    const qList = JSON.parse(activeAssignment.questions_json);
                    const q = qList[currentQ];
                    return (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af', marginBottom: '1.5rem', fontWeight: 600 }}>
                          <span>Soru {currentQ + 1} / {qList.length}</span>
                        </div>
                        <div style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '2rem', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: q.questionText.replace(/\n/g, '<br/>') }} />
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {q.options.map((opt: string, i: number) => (
                            <button key={i} onClick={() => handleAnswer(opt)} style={{
                              padding: '1.25rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                              color: '#fff', textAlign: 'left', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', gap: '1rem'
                            }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                              <span style={{ color: '#8b5cf6', fontWeight: 700 }}>{['A', 'B', 'C', 'D', 'E'][i]})</span> {opt}
                            </button>
                          ))}
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
                    <p style={{ color: '#9ca3af', fontSize: '1.1rem', marginBottom: '2rem' }}>Başarı Oranın: <span style={{ color: '#10b981', fontWeight: 800 }}>%{activeAssignment.score}</span></p>
                    <button onClick={() => setActiveAssignment(null)} style={{ padding: '0.75rem 2rem', background: '#3b82f6', color: '#fff', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>Panoya Dön</button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
