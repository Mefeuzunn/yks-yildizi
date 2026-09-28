'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, BookOpen, Search, Trophy, Clock, Sparkles, Check, ChevronRight, RotateCcw } from 'lucide-react';
import { useTimer } from '@/context/TimerContext';
import { subjectsData } from '@/lib/subjectData';

export const FOCUS_SUBJECTS = [
  { label: 'Matematik', emoji: '📐', color: '#3b82f6', desc: 'TYT & AYT' },
  { label: 'Geometri',  emoji: '📐', color: '#6366f1', desc: 'TYT & AYT' },
  { label: 'Türkçe',    emoji: '📖', color: '#ef4444', desc: 'TYT' },
  { label: 'Edebiyat',  emoji: '✍️', color: '#ec4899', desc: 'AYT' },
  { label: 'Fizik',     emoji: '⚡', color: '#06b6d4', desc: 'TYT & AYT' },
  { label: 'Kimya',     emoji: '🧪', color: '#10b981', desc: 'TYT & AYT' },
  { label: 'Biyoloji',  emoji: '🔬', color: '#8b5cf6', desc: 'TYT & AYT' },
  { label: 'Tarih',     emoji: '🏛️', color: '#f59e0b', desc: 'TYT & AYT' },
  { label: 'Coğrafya',  emoji: '🌍', color: '#14b8a6', desc: 'TYT & AYT' },
  { label: 'Felsefe',   emoji: '🤔', color: '#fb923c', desc: 'TYT & AYT' },
  { label: 'Din Kültürü', emoji: '☪️', color: '#84cc16', desc: 'TYT' },
];

export function getTopicsForSubject(subjectName: string | null): { name: string; tag?: string }[] {
  if (!subjectName) return [];
  const clean = subjectName.toLowerCase().trim();

  const matched = subjectsData.filter(s => {
    const sName = s.name.toLowerCase();
    if (sName === clean) return true;
    if (sName.startsWith(clean)) return true;
    if (clean.includes('matematik') && sName.includes('matematik')) return true;
    if (clean.includes('fizik') && sName.includes('fizik')) return true;
    if (clean.includes('kimya') && sName.includes('kimya')) return true;
    if (clean.includes('biyoloji') && sName.includes('biyoloji')) return true;
    if (clean.includes('geometri') && sName.includes('geometri')) return true;
    if (clean.includes('türkçe') && sName.includes('türkçe')) return true;
    if ((clean.includes('edebiyat') || clean.includes('türk dili')) && (sName.includes('edebiyat') || sName.includes('türk dili'))) return true;
    if (clean.includes('tarih') && sName.includes('tarih')) return true;
    if (clean.includes('coğrafya') && sName.includes('coğrafya')) return true;
    if (clean.includes('felsefe') && sName.includes('felsefe')) return true;
    if (clean.includes('din') && sName.includes('din')) return true;
    if ((clean.includes('dil') || clean.includes('ingilizce') || clean.includes('ydt')) && sName.includes('dil')) return true;
    return false;
  });

  const topics: { name: string; tag?: string }[] = [];
  const seen = new Set<string>();

  for (const s of matched) {
    const tag = s.name.includes('TYT') ? 'TYT' : s.name.includes('AYT') ? 'AYT' : undefined;
    for (const t of s.topics) {
      if (!seen.has(t.name)) {
        seen.add(t.name);
        topics.push({ name: t.name, tag });
      }
    }
  }

  return topics;
}

export default function SessionLogModal() {
  const { pendingSession, saveSession, dismissSession } = useTimer();

  const [step, setStep] = useState<'subject' | 'topic'>('subject');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [topicSearch, setTopicSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Soru / Test Takibi State
  const [solvedTest, setSolvedTest] = useState(false);
  const [questionsCount, setQuestionsCount] = useState('');
  const [correctCount, setCorrectCount] = useState('');
  const [wrongCount, setWrongCount] = useState('');

  const totalQ = Math.max(0, parseInt(questionsCount) || 0);
  const correctQ = Math.max(0, parseInt(correctCount) || 0);
  const wrongQ = Math.max(0, parseInt(wrongCount) || 0);
  const emptyQ = Math.max(0, totalQ - (correctQ + wrongQ));
  const netQ = Math.max(0, correctQ - (wrongQ * 0.25));
  const paceSec = totalQ > 0 ? Math.round(((pendingSession?.durationMin || 25) * 60) / totalQ) : 0;

  // Modal açıldığında state sıfırlama
  useEffect(() => {
    if (pendingSession) {
      const pref = pendingSession.prefilledSubject;
      setSelectedSubject(pref ?? null);
      setSelectedTopic(pendingSession.prefilledTopic ?? null);
      setTopicSearch('');
      setSolvedTest(false);
      setQuestionsCount('');
      setCorrectCount('');
      setWrongCount('');
      // Always start on 'subject' so the user directly sees the lesson picker!
      setStep('subject');
    }
  }, [pendingSession]);

  const topics = useMemo(() => {
    return getTopicsForSubject(selectedSubject);
  }, [selectedSubject]);

  const filteredTopics = useMemo(() => {
    if (!topicSearch.trim()) return topics;
    const q = topicSearch.toLowerCase().trim();
    return topics.filter(t => t.name.toLowerCase().includes(q));
  }, [topics, topicSearch]);

  if (!pendingSession) return null;

  const fmt = (min: number) => min >= 60
    ? `${Math.floor(min / 60)} saat${min % 60 > 0 ? ` ${min % 60} dk` : ''}`
    : `${min} dakika`;

  const handleSave = async (overrideSubject?: string | null, overrideTopic?: string | null) => {
    if (isSaving) return;
    setIsSaving(true);
    const sub = overrideSubject !== undefined ? overrideSubject : selectedSubject;
    const top = overrideTopic !== undefined ? overrideTopic : selectedTopic;
    try {
      await saveSession(sub, top, null, solvedTest && totalQ > 0 ? {
        questionsSolved: totalQ,
        correctCount: correctQ,
        wrongCount: wrongQ,
        emptyCount: emptyQ,
        netScore: parseFloat(netQ.toFixed(2)),
      } : undefined);
    } catch (e) {
      console.error('Session save error:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const currentSubjectObj = FOCUS_SUBJECTS.find(s => s.label === selectedSubject);

  return (
    <AnimatePresence>
      {pendingSession && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
            zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(12px)', padding: '20px',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            style={{
              background: '#0f172a',
              border: '1px solid rgba(139,92,246,0.4)',
              borderRadius: '24px',
              padding: '28px',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 70px rgba(0,0,0,0.7), 0 0 50px rgba(139,92,246,0.25)',
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
                boxShadow: '0 8px 24px rgba(139,92,246,0.4)',
              }}>
                <Trophy size={30} color="#fff" />
              </div>

              <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 800, margin: 0 }}>
                🎉 Odak Oturumu Tamamlandı!
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '6px' }}>
                <Clock size={15} color="#a78bfa" />
                <span style={{ color: '#c4b5fd', fontSize: '14px', fontWeight: 700 }}>
                  {fmt(pendingSession.durationMin)} çalıştın · +25 XP kazandın!
                </span>
              </div>

              <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '6px', marginBottom: 0 }}>
                Çalışmanı ders ve konuya bağlayarak analiz ve öğretmen paneline kaydet.
              </p>
            </div>

            {/* Clickable Step Tabs */}
            <div style={{
              display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.04)',
              padding: '6px', borderRadius: '14px', marginBottom: '20px'
            }}>
              <button
                type="button"
                onClick={() => setStep('subject')}
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  background: step === 'subject' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'transparent',
                  color: step === 'subject' ? '#fff' : '#94a3b8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  boxShadow: step === 'subject' ? '0 4px 12px rgba(139,92,246,0.3)' : 'none'
                }}
              >
                <span>1. 📚 Ders Seçimi</span>
                {selectedSubject && <Check size={14} color={step === 'subject' ? '#fff' : '#10b981'} />}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (selectedSubject) setStep('topic');
                }}
                disabled={!selectedSubject}
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                  border: 'none', cursor: selectedSubject ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
                  background: step === 'topic' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'transparent',
                  color: step === 'topic' ? '#fff' : selectedSubject ? '#cbd5e1' : '#475569',
                  opacity: selectedSubject ? 1 : 0.6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  boxShadow: step === 'topic' ? '0 4px 12px rgba(139,92,246,0.3)' : 'none'
                }}
              >
                <span>2. 📝 Konu & Test</span>
                {selectedTopic && <Check size={14} color="#10b981" />}
              </button>
            </div>

            {/* ─── ADIM 1: DERS SEÇİMİ ─── */}
            <AnimatePresence mode="wait">
              {step === 'subject' && (
                <motion.div key="subject" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Çalıştığın Dersi Seç
                    </span>
                    {selectedSubject && (
                      <span style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 600 }}>
                        Seçili: <strong>{selectedSubject}</strong>
                      </span>
                    )}
                  </div>

                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px',
                    maxHeight: '300px', overflowY: 'auto', paddingRight: '4px'
                  }}>
                    {/* Serbest Çalışma Seçeneği */}
                    <button
                      type="button"
                      onClick={() => handleSave(null, null)}
                      disabled={isSaving}
                      style={{
                        padding: '12px 14px', borderRadius: '14px', cursor: 'pointer', textAlign: 'left',
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(255,255,255,0.03)',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        transition: 'all 0.15s'
                      }}
                    >
                      <span style={{ fontSize: '22px' }}>🎯</span>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>Serbest Çalışma</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Ders seçmeden kaydet</div>
                      </div>
                    </button>

                    {FOCUS_SUBJECTS.map(s => {
                      const isSelected = selectedSubject === s.label;
                      return (
                        <button
                          key={s.label}
                          type="button"
                          onClick={() => {
                            setSelectedSubject(s.label);
                            setStep('topic');
                          }}
                          style={{
                            padding: '12px 14px', borderRadius: '14px', cursor: 'pointer', textAlign: 'left',
                            border: `2px solid ${isSelected ? s.color : 'rgba(255,255,255,0.06)'}`,
                            background: isSelected ? `${s.color}22` : 'rgba(255,255,255,0.02)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            transition: 'all 0.15s',
                            boxShadow: isSelected ? `0 0 16px ${s.color}33` : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '22px' }}>{s.emoji}</span>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#fff' : '#f1f5f9' }}>
                                {s.label}
                              </div>
                              <div style={{ fontSize: '10px', color: s.color, fontWeight: 600 }}>{s.desc}</div>
                            </div>
                          </div>
                          {isSelected && <Check size={18} color={s.color} />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Devam et veya kapat butonları */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
                    <button
                      type="button"
                      onClick={dismissSession}
                      style={{
                        padding: '12px 16px', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        color: '#94a3b8', cursor: 'pointer', fontSize: '13px', fontWeight: 600
                      }}
                    >
                      Kayıt Etmeden Kapat
                    </button>

                    {selectedSubject && (
                      <button
                        type="button"
                        onClick={() => setStep('topic')}
                        style={{
                          flex: 1, padding: '12px', borderRadius: '12px',
                          background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                          border: 'none', color: '#fff', cursor: 'pointer',
                          fontSize: '13px', fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          boxShadow: '0 4px 14px rgba(139,92,246,0.3)'
                        }}
                      >
                        <span>{selectedSubject} Konusunu Seç</span>
                        <ChevronRight size={16} />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ─── ADIM 2: KONU & TEST SEÇİMİ ─── */}
              {step === 'topic' && (
                <motion.div key="topic" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
                  {/* Dersi Değiştir Çubuğu */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', borderRadius: '12px',
                    background: currentSubjectObj ? `${currentSubjectObj.color}15` : 'rgba(139,92,246,0.1)',
                    border: `1px solid ${currentSubjectObj ? `${currentSubjectObj.color}35` : 'rgba(139,92,246,0.2)'}`,
                    marginBottom: '14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>{currentSubjectObj?.emoji ?? '📚'}</span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                        {selectedSubject}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep('subject')}
                      style={{
                        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '8px', color: '#c4b5fd', cursor: 'pointer',
                        fontSize: '12px', fontWeight: 700, padding: '5px 12px',
                        display: 'flex', alignItems: 'center', gap: '5px'
                      }}
                    >
                      <RotateCcw size={13} />
                      Dersi Değiştir
                    </button>
                  </div>

                  <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Hangi konuyu çalıştın?
                  </div>

                  {/* Arama Kutusu */}
                  <div style={{ position: 'relative', marginBottom: '10px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      value={topicSearch}
                      onChange={e => setTopicSearch(e.target.value)}
                      placeholder={`${selectedSubject} konularında ara...`}
                      style={{
                        width: '100%', padding: '9px 14px 9px 36px', borderRadius: '10px',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
                      }}
                      autoFocus
                    />
                  </div>

                  {/* Konu Listesi */}
                  <div style={{
                    display: 'flex', flexDirection: 'column', gap: '6px',
                    maxHeight: '220px', overflowY: 'auto', paddingRight: '4px', marginBottom: '14px'
                  }}>
                    {/* Genel Çalışma Seçeneği */}
                    <button
                      type="button"
                      onClick={() => setSelectedTopic(null)}
                      style={{
                        padding: '10px 14px', borderRadius: '10px', textAlign: 'left',
                        border: `1px solid ${selectedTopic === null ? '#8b5cf6' : 'rgba(255,255,255,0.05)'}`,
                        background: selectedTopic === null ? 'rgba(139,92,246,0.18)' : 'rgba(255,255,255,0.02)',
                        color: selectedTopic === null ? '#c4b5fd' : '#94a3b8',
                        cursor: 'pointer', fontSize: '13px', fontWeight: selectedTopic === null ? 700 : 500,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <span>🎯 Genel {selectedSubject} Çalışması (Konu Belirtme)</span>
                      {selectedTopic === null && <Check size={16} color="#8b5cf6" />}
                    </button>

                    {filteredTopics.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                        "{topicSearch}" ile eşleşen konu bulunamadı.
                        <button
                          type="button"
                          onClick={() => setSelectedTopic(topicSearch.trim())}
                          style={{
                            display: 'block', margin: '8px auto 0', background: 'rgba(139,92,246,0.15)',
                            border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd', borderRadius: '8px',
                            padding: '6px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: 600
                          }}
                        >
                          "{topicSearch}" Olarak Kaydet
                        </button>
                      </div>
                    ) : (
                      filteredTopics.map(t => {
                        const isChosen = selectedTopic === t.name;
                        return (
                          <button
                            key={t.name}
                            type="button"
                            onClick={() => setSelectedTopic(t.name)}
                            style={{
                              padding: '9px 12px', borderRadius: '10px', textAlign: 'left',
                              border: `1px solid ${isChosen ? '#8b5cf6' : 'rgba(255,255,255,0.05)'}`,
                              background: isChosen ? 'rgba(139,92,246,0.18)' : 'rgba(255,255,255,0.02)',
                              color: isChosen ? '#c4b5fd' : '#e2e8f0',
                              cursor: 'pointer', fontSize: '13px', fontWeight: isChosen ? 700 : 500,
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}
                          >
                            <span>{t.name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {t.tag && (
                                <span style={{
                                  fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                                  background: 'rgba(255,255,255,0.07)', color: '#94a3b8', fontWeight: 600
                                }}>
                                  {t.tag}
                                </span>
                              )}
                              {isChosen && <Check size={16} color="#8b5cf6" />}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* ─── TEST / SORU ÇÖZÜMÜ BÖLÜMÜ ─── */}
                  <div style={{
                    marginBottom: '16px',
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${solvedTest ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: '16px', padding: '14px',
                    transition: 'all 0.2s'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>📝</span>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9' }}>Bu oturumda soru çözdün mü?</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Doğru ve yanlışlarını gir, netini analizine yansıt</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSolvedTest(!solvedTest)}
                        style={{
                          padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
                          background: solvedTest ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : 'rgba(255,255,255,0.06)',
                          color: solvedTest ? '#fff' : '#94a3b8',
                          border: `1px solid ${solvedTest ? '#8b5cf6' : 'rgba(255,255,255,0.1)'}`,
                          cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        {solvedTest ? '✓ Test Çözdüm' : '+ Soru Ekle'}
                      </button>
                    </div>

                    {solvedTest && (
                      <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '10px', color: '#94a3b8', fontWeight: 700, marginBottom: '4px' }}>🔢 TOPLAM SORU</label>
                            <input
                              type="number"
                              min={0}
                              placeholder="Örn: 20"
                              value={questionsCount}
                              onChange={e => setQuestionsCount(e.target.value)}
                              style={{
                                width: '100%', padding: '8px 10px', borderRadius: '8px',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                                color: '#fff', fontSize: '13px', fontWeight: 700, outline: 'none', boxSizing: 'border-box'
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '10px', color: '#4ade80', fontWeight: 700, marginBottom: '4px' }}>✅ DOĞRU (D)</label>
                            <input
                              type="number"
                              min={0}
                              placeholder="0"
                              value={correctCount}
                              onChange={e => setCorrectCount(e.target.value)}
                              style={{
                                width: '100%', padding: '8px 10px', borderRadius: '8px',
                                background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)',
                                color: '#4ade80', fontSize: '13px', fontWeight: 700, outline: 'none', boxSizing: 'border-box'
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '10px', color: '#f87171', fontWeight: 700, marginBottom: '4px' }}>❌ YANLIŞ (Y)</label>
                            <input
                              type="number"
                              min={0}
                              placeholder="0"
                              value={wrongCount}
                              onChange={e => setWrongCount(e.target.value)}
                              style={{
                                width: '100%', padding: '8px 10px', borderRadius: '8px',
                                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
                                color: '#f87171', fontSize: '13px', fontWeight: 700, outline: 'none', boxSizing: 'border-box'
                              }}
                            />
                          </div>
                        </div>

                        {totalQ > 0 && (
                          <div style={{
                            display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center',
                            background: 'rgba(139,92,246,0.1)', padding: '8px 12px', borderRadius: '10px',
                            border: '1px solid rgba(139,92,246,0.2)'
                          }}>
                            <span style={{ fontSize: '12px', color: '#c4b5fd', fontWeight: 700 }}>
                              🎯 Net: <strong style={{ color: '#fff' }}>{netQ.toFixed(2)}</strong>
                            </span>
                            <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                              Boş: <strong style={{ color: '#cbd5e1' }}>{emptyQ}</strong>
                            </span>
                            <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
                            <span style={{ fontSize: '12px', color: '#4ade80' }}>
                              Başarı: %{totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 0}
                            </span>
                            {paceSec > 0 && (
                              <>
                                <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
                                <span style={{ fontSize: '12px', color: '#38bdf8' }}>
                                  ⚡ {paceSec} sn/s
                                </span>
                              </>
                            )}
                            <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#fbbf24', fontWeight: 700 }}>
                              +{totalQ * 2 + correctQ * 3} XP
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Kaydet Butonu */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={dismissSession}
                      style={{
                        padding: '12px 16px', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        color: '#94a3b8', cursor: 'pointer', fontSize: '13px', fontWeight: 600
                      }}
                    >
                      Atla
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSave()}
                      disabled={isSaving}
                      style={{
                        flex: 1, padding: '12px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                        border: 'none', color: '#fff', cursor: 'pointer',
                        fontSize: '14px', fontWeight: 700,
                        boxShadow: '0 4px 16px rgba(139,92,246,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}
                    >
                      {isSaving ? 'Kaydediliyor...' : <><Sparkles size={16} /> Oturumu Kaydet</>}
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
