'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, BookOpen, ChevronDown, Search, Trophy, Clock } from 'lucide-react';
import { useTimer, PendingSession } from '@/context/TimerContext';
import { subjectsData } from '@/lib/subjectData';

const SUBJECT_META: Record<string, { emoji: string; color: string }> = {
  'Türkçe (TYT)':         { emoji: '📖', color: '#ef4444' },
  'Tarih (TYT)':          { emoji: '🏺', color: '#d97706' },
  'Coğrafya (TYT)':       { emoji: '🌍', color: '#059669' },
  'Matematik (TYT)':      { emoji: '📐', color: '#3b82f6' },
  'Fizik (TYT)':          { emoji: '⚡', color: '#ec4899' },
  'Kimya (TYT)':          { emoji: '🧪', color: '#10b981' },
  'Biyoloji (TYT)':       { emoji: '🔬', color: '#a78bfa' },
  'Felsefe (TYT)':        { emoji: '🤔', color: '#fb923c' },
  'Din Kültürü (TYT)':    { emoji: '☪️', color: '#84cc16' },
  'Türk Dili ve Edebiyatı (AYT)': { emoji: '✍️', color: '#e879f9' },
  'Tarih (AYT)':          { emoji: '🏛️', color: '#f97316' },
  'Coğrafya (AYT)':       { emoji: '🗺️', color: '#14b8a6' },
  'Matematik (AYT)':      { emoji: '📊', color: '#6366f1' },
  'Fizik (AYT)':          { emoji: '⚛️', color: '#ec4899' },
  'Kimya (AYT)':          { emoji: '🔬', color: '#10b981' },
  'Biyoloji (AYT)':       { emoji: '🧬', color: '#22c55e' },
};

export default function SessionLogModal() {
  const { pendingSession, saveSession, dismissSession } = useTimer();

  const [step, setStep] = useState<'subject' | 'topic'>('subject');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [topicSearch, setTopicSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Reset when modal opens
  useEffect(() => {
    if (pendingSession) {
      setStep('subject');
      setSelectedSubject(pendingSession.prefilledSubject ?? null);
      setSelectedTopic(null);
      setTopicSearch('');
      // If subject already selected, go straight to topic
      if (pendingSession.prefilledSubject) {
        setStep('topic');
      }
    }
  }, [pendingSession]);

  if (!pendingSession) return null;

  const fmt = (min: number) => min >= 60
    ? `${Math.floor(min / 60)} saat${min % 60 > 0 ? ` ${min % 60} dk` : ''}`
    : `${min} dakika`;

  const currentSubjectData = subjectsData.find(s => s.name === selectedSubject);
  const filteredTopics = (currentSubjectData?.topics ?? [])
    .filter(t => t.name.toLowerCase().includes(topicSearch.toLowerCase()));

  const handleSave = async () => {
    setIsSaving(true);
    await saveSession(selectedSubject, selectedTopic, null);
    setIsSaving(false);
  };

  return (
    <AnimatePresence>
      {pendingSession && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(12px)', padding: '20px',
          }}
        >
          <motion.div
            initial={{ scale: 0.85, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 40 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            style={{
              background: '#0f172a',
              border: '1px solid rgba(139,92,246,0.4)',
              borderRadius: '28px',
              padding: '36px',
              width: '100%',
              maxWidth: '520px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 30px 80px rgba(139,92,246,0.25)',
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 8px 24px rgba(139,92,246,0.4)',
                }}
              >
                <Trophy size={32} style={{ color: '#fff' }} />
              </motion.div>
              <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 800, margin: 0 }}>
                🎉 Oturum Tamamlandı!
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
                <Clock size={14} style={{ color: '#8b5cf6' }} />
                <span style={{ color: '#a78bfa', fontSize: '14px', fontWeight: 600 }}>
                  {fmt(pendingSession.durationMin)} odaklandın · +25 XP kazandın!
                </span>
              </div>
              <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '8px' }}>
                Ne üzerine çalıştığını kaydet ve istatistiklerini takip et
              </p>
            </div>

            {/* Step indicator */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              {['subject', 'topic'].map((s, i) => (
                <div key={s} style={{ flex: 1, height: '4px', borderRadius: '100px',
                  background: step === s || (step === 'topic' && i === 0) ? '#8b5cf6' : 'rgba(255,255,255,0.1)',
                  transition: 'all 0.3s' }} />
              ))}
            </div>

            {/* Step 1: Subject */}
            <AnimatePresence mode="wait">
              {step === 'subject' && (
                <motion.div key="subject"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                >
                  <div style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 600,
                                marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Hangi dersi çalıştın?
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', maxHeight: '340px', overflowY: 'auto' }}>
                    {/* Free study option */}
                    <button
                      onClick={() => { setSelectedSubject(null); setSelectedTopic(null); }}
                      style={{
                        padding: '14px', borderRadius: '14px', cursor: 'pointer', textAlign: 'left',
                        border: `2px solid ${selectedSubject === null ? '#8b5cf6' : 'rgba(255,255,255,0.06)'}`,
                        background: selectedSubject === null ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.02)',
                        transition: 'all 0.15s',
                        display: 'flex', alignItems: 'center', gap: '10px',
                      }}
                    >
                      <span style={{ fontSize: '22px' }}>🎯</span>
                      <span style={{ fontSize: '13px', fontWeight: 600,
                                     color: selectedSubject === null ? '#a78bfa' : '#6b7280' }}>
                        Serbest
                      </span>
                    </button>
                    {subjectsData.map(s => {
                      const meta = SUBJECT_META[s.name] ?? { emoji: '📚', color: '#6b7280' };
                      const isSelected = selectedSubject === s.name;
                      return (
                        <button key={s.name}
                          onClick={() => setSelectedSubject(s.name)}
                          style={{
                            padding: '14px', borderRadius: '14px', cursor: 'pointer', textAlign: 'left',
                            border: `2px solid ${isSelected ? meta.color : 'rgba(255,255,255,0.06)'}`,
                            background: isSelected ? meta.color + '15' : 'rgba(255,255,255,0.02)',
                            transition: 'all 0.15s',
                            display: 'flex', alignItems: 'center', gap: '10px',
                          }}
                        >
                          <span style={{ fontSize: '20px' }}>{meta.emoji}</span>
                          <span style={{ fontSize: '12px', fontWeight: 600,
                                         color: isSelected ? '#fff' : '#6b7280', lineHeight: 1.3 }}>
                            {s.name.replace(' (TYT)', '').replace(' (AYT)', '')}
                            <span style={{ display: 'block', fontSize: '10px', color: '#4b5563', fontWeight: 500 }}>
                              {s.name.includes('TYT') ? 'TYT' : 'AYT'}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button onClick={dismissSession}
                      style={{ flex: 1, padding: '12px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)',
                               border: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af', cursor: 'pointer',
                               fontSize: '13px', fontWeight: 600 }}>
                      Atla
                    </button>
                    <button
                      onClick={() => {
                        if (selectedSubject === null) { handleSave(); return; }
                        setStep('topic');
                      }}
                      style={{ flex: 2, padding: '12px', borderRadius: '14px',
                               background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                               border: 'none', color: '#fff', cursor: 'pointer',
                               fontSize: '13px', fontWeight: 700,
                               boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}>
                      {selectedSubject ? 'Konu Seç →' : 'Kaydet'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Topic */}
              {step === 'topic' && (
                <motion.div key="topic"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                >
                  <button onClick={() => setStep('subject')}
                    style={{ background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer',
                             fontSize: '13px', fontWeight: 600, marginBottom: '16px', padding: 0,
                             display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ← {selectedSubject}
                  </button>

                  <div style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 600,
                                marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Hangi konuyu çalıştın?
                  </div>

                  {/* Search */}
                  <div style={{ position: 'relative', marginBottom: '14px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%',
                                               transform: 'translateY(-50%)', color: '#6b7280' }} />
                    <input value={topicSearch} onChange={e => setTopicSearch(e.target.value)}
                      placeholder="Konu ara..."
                      style={{ width: '100%', padding: '10px 12px 10px 34px', borderRadius: '12px',
                               background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                               color: '#fff', fontSize: '13px', outline: 'none', fontFamily: 'inherit',
                               boxSizing: 'border-box' }} />
                  </div>

                  {/* "None" option */}
                  <button onClick={() => setSelectedTopic(null)}
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: '12px', textAlign: 'left',
                      border: `1px solid ${selectedTopic === null ? '#8b5cf6' : 'rgba(255,255,255,0.06)'}`,
                      background: selectedTopic === null ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.02)',
                      color: selectedTopic === null ? '#a78bfa' : '#6b7280',
                      cursor: 'pointer', fontSize: '13px', fontWeight: 600, marginBottom: '8px'
                    }}>
                    🎯 Genel / Belirtmek istemiyorum
                  </button>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '260px', overflowY: 'auto' }}>
                    {filteredTopics.map((t, i) => {
                      const meta = SUBJECT_META[selectedSubject ?? ''] ?? { color: '#8b5cf6' };
                      const isSelected = selectedTopic === t.name;
                      return (
                        <motion.button key={t.name}
                          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.02 }}
                          onClick={() => setSelectedTopic(t.name)}
                          style={{
                            padding: '11px 14px', borderRadius: '12px', textAlign: 'left',
                            border: `1px solid ${isSelected ? meta.color : 'rgba(255,255,255,0.06)'}`,
                            background: isSelected ? meta.color + '15' : 'rgba(255,255,255,0.02)',
                            color: isSelected ? '#fff' : '#9ca3af',
                            cursor: 'pointer', fontSize: '13px', fontWeight: isSelected ? 700 : 500,
                            display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.15s',
                          }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                                         background: t.status === 'completed' ? '#10b981' :
                                                     t.status === 'in-progress' ? meta.color : '#374151' }} />
                          {t.name}
                          {t.status === 'completed' && (
                            <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#10b981', fontWeight: 700 }}>✓</span>
                          )}
                        </motion.button>
                      );
                    })}
                    {filteredTopics.length === 0 && (
                      <div style={{ textAlign: 'center', color: '#4b5563', fontSize: '13px', padding: '20px' }}>
                        Konu bulunamadı
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button onClick={() => setStep('subject')}
                      style={{ flex: 1, padding: '12px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)',
                               border: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af', cursor: 'pointer',
                               fontSize: '13px', fontWeight: 600 }}>
                      ← Geri
                    </button>
                    <button onClick={handleSave} disabled={isSaving}
                      style={{ flex: 2, padding: '12px', borderRadius: '14px',
                               background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                               border: 'none', color: '#fff', cursor: isSaving ? 'not-allowed' : 'pointer',
                               fontSize: '13px', fontWeight: 700, opacity: isSaving ? 0.7 : 1,
                               boxShadow: '0 4px 16px rgba(139,92,246,0.3)',
                               display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <CheckCircle size={16} />
                      {isSaving ? 'Kaydediliyor...' : 'Kaydet ve Bitir'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
