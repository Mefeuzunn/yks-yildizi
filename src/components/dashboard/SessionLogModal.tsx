'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, BookOpen, Search, Trophy, Clock, Sparkles, Check, ChevronRight, RotateCcw } from 'lucide-react';
import { useTimer } from '@/context/TimerContext';
import { subjectsData } from '@/lib/subjectData';

export const FOCUS_SUBJECTS = [
  // ── Hızlı Odak ve Deneme Durumları ──
  { label: 'Paragraf', emoji: '📖', color: '#ef4444', desc: 'TYT Paragraf Rutini' },
  { label: 'Sosyal Bilimler', emoji: '🏛️', color: '#d97706', desc: 'TYT Sosyal Denemesi' },
  { label: 'Fen Bilimleri', emoji: '🧪', color: '#06b6d4', desc: 'TYT Fen Denemesi' },
  { label: 'Genel Deneme', emoji: '🏆', color: '#10b981', desc: 'TYT & AYT Tam Deneme' },

  // ── Temel YKS Dersleri ──
  { label: 'Türkçe', emoji: '📚', color: '#f43f5e', desc: 'TYT Dil Bilgisi & Anlam' },
  { label: 'Matematik', emoji: '📐', color: '#3b82f6', desc: 'TYT & AYT Matematik' },
  { label: 'Geometri', emoji: '📏', color: '#6366f1', desc: 'TYT & AYT Geometri' },
  { label: 'Fizik', emoji: '⚡', color: '#0ea5e9', desc: 'TYT & AYT Fizik' },
  { label: 'Kimya', emoji: '🧪', color: '#14b8a6', desc: 'TYT & AYT Kimya' },
  { label: 'Biyoloji', emoji: '🔬', color: '#8b5cf6', desc: 'TYT & AYT Biyoloji' },
  { label: 'Edebiyat', emoji: '✍️', color: '#ec4899', desc: 'AYT Edebiyat' },
  { label: 'Tarih', emoji: '🏺', color: '#f59e0b', desc: 'TYT & AYT Tarih' },
  { label: 'Coğrafya', emoji: '🌍', color: '#059669', desc: 'TYT & AYT Coğrafya' },
  { label: 'Felsefe', emoji: '🤔', color: '#fb923c', desc: 'TYT Felsefe & Mantık' },
  { label: 'Din Kültürü', emoji: '🕌', color: '#0891b2', desc: 'TYT Din Kültürü' },
  { label: 'İngilizce (YDT)', emoji: '🇬🇧', color: '#a855f7', desc: 'Yabancı Dil Testi' },
];

export function getTopicsForSubject(subjectName: string | null): { name: string; tag?: string }[] {
  if (!subjectName) return [];
  const clean = subjectName.toLowerCase().trim();

  // 1. Özel Paragraf Konuları
  if (clean.includes('paragraf')) {
    return [
      { name: 'Günlük 20 Paragraf Rutini', tag: 'TYT' },
      { name: 'Günlük 30 Paragraf Rutini', tag: 'TYT' },
      { name: 'Paragrafta Ana Düşünce (Ana Fikir)', tag: 'TYT' },
      { name: 'Paragrafta Yardımcı Düşünceler', tag: 'TYT' },
      { name: 'Paragraf Tamamlama & Boşluk Doldurma', tag: 'TYT' },
      { name: 'Paragrafı İkiye Bölme', tag: 'TYT' },
      { name: 'Akışı Bozan Cümleyi Bulma', tag: 'TYT' },
      { name: 'Cümlelerin Yerini Değiştirme', tag: 'TYT' },
      { name: 'Çoklu Paragraf Soruları', tag: 'TYT' },
      { name: 'Paragrafta Anlatım Biçimleri & Teknikleri', tag: 'TYT' },
      { name: 'Paragrafta Konu ve Başlık', tag: 'TYT' },
      { name: 'Söz Öbeklerinde Anlam & Deyimler', tag: 'TYT' },
      { name: 'Süreli Paragraf Hız Denemesi', tag: 'TYT' },
    ];
  }

  // 2. Sosyal Bilimler / TYT Sosyal Denemesi
  if (clean.includes('sosyal')) {
    return [
      { name: 'TYT Sosyal Karma Branş Denemesi (20 Soru)', tag: 'TYT' },
      { name: 'TYT Tarih Karma Deneme (5 Soru)', tag: 'TYT' },
      { name: 'TYT Coğrafya Karma Deneme (5 Soru)', tag: 'TYT' },
      { name: 'TYT Felsefe Karma Deneme (5 Soru)', tag: 'TYT' },
      { name: 'TYT Din Kültürü Karma Deneme (5 Soru)', tag: 'TYT' },
      { name: 'Tarih - İlk ve Orta Çağda Türk Dünyası', tag: 'TYT' },
      { name: 'Tarih - İslam Tarihi ve Osmanlı Devleti', tag: 'TYT' },
      { name: 'Tarih - Milli Mücadele ve Atatürk İnkılapları', tag: 'TYT' },
      { name: 'Coğrafya - Harita Bilgisi ve Dünyanın Şekli', tag: 'TYT' },
      { name: 'Coğrafya - İklim Bilgisi ve Türkiye İklimi', tag: 'TYT' },
      { name: 'Coğrafya - Nüfus, Yerleşmeler ve Doğal Afetler', tag: 'TYT' },
      { name: 'Felsefe - Bilgi, Varlık, Ahlak, Siyaset ve Din', tag: 'TYT' },
      { name: 'Din Kültürü - Bilgi, İnanç, İbadet ve Ahlak', tag: 'TYT' },
    ];
  }

  // 3. Fen Bilimleri / TYT Fen Denemesi
  if (clean.includes('fen')) {
    return [
      { name: 'TYT Fen Karma Branş Denemesi (20 Soru)', tag: 'TYT' },
      { name: 'TYT Fizik Denemesi (7 Soru)', tag: 'TYT' },
      { name: 'TYT Kimya Denemesi (7 Soru)', tag: 'TYT' },
      { name: 'TYT Biyoloji Denemesi (6 Soru)', tag: 'TYT' },
      { name: 'AYT Fen Karma Deneme (40 Soru)', tag: 'AYT' },
      { name: 'Fizik - Madde, Kuvvet, Enerji, Optik', tag: 'TYT' },
      { name: 'Kimya - Atom, Karışımlar, Asit-Baz-Tuz', tag: 'TYT' },
      { name: 'Biyoloji - Hücre, Canlılar Dünyası, Kalıtım', tag: 'TYT' },
    ];
  }

  // 4. Genel Deneme Sınavları
  if (clean.includes('genel deneme') || clean === 'deneme') {
    return [
      { name: 'TYT Genel Deneme Sınavı (120 Soru / 165 dk)', tag: 'TYT' },
      { name: 'AYT Sayısal Genel Deneme (80 Soru / 180 dk)', tag: 'AYT' },
      { name: 'AYT Eşit Ağırlık Genel Deneme (80 Soru / 180 dk)', tag: 'AYT' },
      { name: 'AYT Sözel Genel Deneme (80 Soru / 180 dk)', tag: 'AYT' },
      { name: 'YDT İngilizce Genel Deneme (80 Soru / 120 dk)', tag: 'YDT' },
      { name: 'Kurumsal TYT Denemesi (Özdebir / 3D / TÖDER vb.)', tag: 'TYT' },
      { name: 'Kurumsal AYT Denemesi', tag: 'AYT' },
      { name: 'ÖSYM Çıkmış YKS Sınavı Simülasyonu', tag: 'TYT' },
    ];
  }

  // 5. İngilizce / YDT
  if (clean.includes('ydt') || clean.includes('ingilizce') || clean.includes('dil')) {
    return [
      { name: 'YDT 80 Soru Branş Denemesi', tag: 'YDT' },
      { name: 'Vocabulary & Phrasal Verbs', tag: 'YDT' },
      { name: 'Grammar (Tenses, Modals, Passive & Reported)', tag: 'YDT' },
      { name: 'Cloze Test & Prepositions', tag: 'YDT' },
      { name: 'Sentence Completion (Cümle Tamamlama)', tag: 'YDT' },
      { name: 'Reading Comprehension (Paragraf Okuma)', tag: 'YDT' },
      { name: 'Translation (İngilizce - Türkçe Çeviri)', tag: 'YDT' },
      { name: 'Dialogue & Situation Questions', tag: 'YDT' },
      { name: 'Restatement (En Yakın Anlamı Bulma)', tag: 'YDT' },
      { name: 'Irrelevant Sentence (Akışı Bozan Cümle)', tag: 'YDT' },
    ];
  }

  // 6. Müfredat Dersleri (subjectsData üzerinden)
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
    return false;
  });

  const topics: { name: string; tag?: string }[] = [];
  const seen = new Set<string>();

  for (const s of matched) {
    const defaultTag = s.name.includes('TYT-AYT') ? undefined : s.name.includes('TYT') ? 'TYT' : s.name.includes('AYT') ? 'AYT' : undefined;
    for (const t of s.topics) {
      if (!seen.has(t.name)) {
        seen.add(t.name);
        // Otomatik etiket tahmini
        let tag = defaultTag;
        if (!tag) {
          const aytKeywords = ['türev', 'integral', 'limit', 'logaritma', 'diziler', 'trigonometri', 'polinom', 'parabol', 'karmaşık', 'modern fizik', 'atom', 'organik', 'elektrokimya', 'bitki', 'protein'];
          const lowerT = t.name.toLowerCase();
          if (aytKeywords.some(k => lowerT.includes(k))) {
            tag = 'AYT';
          } else {
            tag = 'TYT';
          }
        }
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
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [topicSearch, setTopicSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<'ALL' | 'TYT' | 'AYT' | 'YDT'>('ALL');
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
  const paceSec = totalQ > 0 ? Math.round(((durationMinutes || 25) * 60) / totalQ) : 0;
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsOffline(!navigator.onLine);

    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Modal açıldığında state sıfırlama ve akıllı ön-seçim
  useEffect(() => {
    if (pendingSession) {
      const pref = pendingSession.prefilledSubject;
      const prefTopic = pendingSession.prefilledTopic;
      setSelectedSubject(pref ?? null);
      setSelectedTopic(prefTopic ?? null);
      const initialDur = pendingSession.durationMin && pendingSession.durationMin > 0 ? pendingSession.durationMin : 25;
      setDurationMinutes(initialDur);
      setTopicSearch('');
      setTagFilter('ALL');
      setQuestionsCount('');
      setCorrectCount('');
      setWrongCount('');

      // Paragraf, Deneme, Sosyal vb. özel odak modları için testi otomatik aç ve doğrudan adım 2'ye geç
      const isTestPreset = pref && (
        pref.includes('Paragraf') || 
        pref.includes('Sosyal') || 
        pref.includes('Fen') || 
        pref.includes('Deneme')
      );

      if (isTestPreset) {
        setSolvedTest(true);
        setStep('topic');
      } else if (pref) {
        setSolvedTest(false);
        setStep('topic');
      } else {
        setSolvedTest(false);
        setStep('subject');
      }
    }
  }, [pendingSession]);

  const topics = useMemo(() => {
    return getTopicsForSubject(selectedSubject);
  }, [selectedSubject]);

  const hasMultipleTags = useMemo(() => {
    const tags = new Set(topics.map(t => t.tag).filter(Boolean));
    return tags.size > 1;
  }, [topics]);

  const filteredTopics = useMemo(() => {
    let list = topics;
    if (tagFilter !== 'ALL') {
      list = list.filter(t => t.tag === tagFilter);
    }
    if (!topicSearch.trim()) return list;
    const q = topicSearch.toLowerCase().trim();
    return list.filter(t => t.name.toLowerCase().includes(q));
  }, [topics, topicSearch, tagFilter]);

  if (!pendingSession) return null;

  const fmt = (min: number) => min >= 60
    ? `${Math.floor(min / 60)} saat${min % 60 > 0 ? ` ${min % 60} dk` : ''}`
    : `${min} dakika`;

  const handleSave = async (overrideSubject?: string | null, overrideTopic?: string | null) => {
    if (isSaving) return;
    setIsSaving(true);
    const sub = overrideSubject !== undefined ? overrideSubject : selectedSubject;
    const top = overrideTopic !== undefined ? overrideTopic : selectedTopic;
    const finalDur = Math.max(1, durationMinutes || 25);
    try {
      await saveSession(sub, top, null, solvedTest && totalQ > 0 ? {
        questionsSolved: totalQ,
        correctCount: correctQ,
        wrongCount: wrongQ,
        emptyCount: emptyQ,
        netScore: parseFloat(netQ.toFixed(2)),
      } : undefined, finalDur);
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
          className="modal-overlay-mobile"
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
            zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(12px)', padding: '20px',
          }}
        >
          <motion.div
            className="modal-content"
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
            {/* Mobile Drag Handle */}
            <div className="mobile-only modal-drag-handle" />

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
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
                  {fmt(durationMinutes)} çalıştın · +{Math.max(25, durationMinutes)} XP kazandın!
                </span>
              </div>

              <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '6px', marginBottom: 0 }}>
                Çalışmanı ders ve konuya bağlayarak analiz ve öğretmen paneline kaydet.
              </p>

              {isOffline && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  marginTop: '10px', padding: '5px 14px', borderRadius: '12px',
                  background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.35)',
                  color: '#fcd34d', fontSize: '11px', fontWeight: 700
                }}>
                  <span>📡 Çevrimdışı Mod</span>
                  <span style={{ fontWeight: 500, color: '#fef08a' }}>· Cihaza güvenle saklanacak, internet gelince aktarılacak</span>
                </div>
              )}
            </div>

            {/* ── SÜRE DÜZENLEME (Öğrenci Kendi Girebilir) ── */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(56,189,248,0.08), rgba(139,92,246,0.08))',
              border: '1.5px solid rgba(56,189,248,0.25)',
              borderRadius: '16px',
              padding: '12px 16px',
              marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} color="#38bdf8" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9' }}>
                    Çalışma Süresi:
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setDurationMinutes(d => Math.max(1, d - 5))}
                    title="-5 dakika"
                    style={{
                      width: '28px', height: '28px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.06)', color: '#fff', cursor: 'pointer', fontWeight: 800, fontSize: '14px'
                    }}
                  >-</button>
                  <input
                    type="number"
                    min={1}
                    max={600}
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(Math.max(1, parseInt(e.target.value) || 0))}
                    style={{
                      width: '64px', textAlign: 'center', padding: '5px 8px', borderRadius: '8px',
                      background: 'rgba(56,189,248,0.12)', border: '1.5px solid rgba(56,189,248,0.4)',
                      color: '#38bdf8', fontSize: '15px', fontWeight: 800, outline: 'none'
                    }}
                  />
                  <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>dk</span>
                  <button
                    type="button"
                    onClick={() => setDurationMinutes(d => Math.min(600, d + 5))}
                    title="+5 dakika"
                    style={{
                      width: '28px', height: '28px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.06)', color: '#fff', cursor: 'pointer', fontWeight: 800, fontSize: '14px'
                    }}
                  >+</button>
                </div>
              </div>

              {/* Hızlı Süre Seçim Butonları */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[15, 20, 25, 30, 40, 45, 60, 90, 120].map(min => (
                  <button
                    key={min}
                    type="button"
                    onClick={() => setDurationMinutes(min)}
                    style={{
                      padding: '4px 9px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      border: `1px solid ${durationMinutes === min ? '#38bdf8' : 'rgba(255,255,255,0.08)'}`,
                      background: durationMinutes === min ? 'rgba(56,189,248,0.22)' : 'rgba(255,255,255,0.03)',
                      color: durationMinutes === min ? '#38bdf8' : '#94a3b8',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {min} dk
                  </button>
                ))}
              </div>
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

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Hangi konuyu çalıştın?
                    </div>
                    {hasMultipleTags && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {(['ALL', 'TYT', 'AYT'] as const).map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setTagFilter(tag)}
                            style={{
                              padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                              border: `1px solid ${tagFilter === tag ? '#8b5cf6' : 'rgba(255,255,255,0.08)'}`,
                              background: tagFilter === tag ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.03)',
                              color: tagFilter === tag ? '#fff' : '#94a3b8', cursor: 'pointer',
                              transition: 'all 0.15s'
                            }}
                          >
                            {tag === 'ALL' ? 'Tümü' : tag}
                          </button>
                        ))}
                      </div>
                    )}
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
                        {/* Hızlı Soru Seçim Çipleri */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Hızlı Soru:</span>
                          {[10, 15, 20, 25, 30, 40, 80, 120].map(cnt => (
                            <button
                              key={cnt}
                              type="button"
                              onClick={() => {
                                setQuestionsCount(cnt.toString());
                                if (!correctCount && !wrongCount) {
                                  setCorrectCount(cnt.toString());
                                  setWrongCount('0');
                                }
                              }}
                              style={{
                                padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                                background: parseInt(questionsCount) === cnt ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${parseInt(questionsCount) === cnt ? '#8b5cf6' : 'rgba(255,255,255,0.08)'}`,
                                color: parseInt(questionsCount) === cnt ? '#c4b5fd' : '#94a3b8',
                                cursor: 'pointer', transition: 'all 0.15s'
                              }}
                            >
                              {cnt} Soru
                            </button>
                          ))}
                        </div>

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
                      {isSaving ? (
                        'Kaydediliyor...'
                      ) : isOffline ? (
                        <><Sparkles size={16} /> Çevrimdışı Kaydet</>
                      ) : (
                        <><Sparkles size={16} /> Oturumu Kaydet</>
                      )}
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
