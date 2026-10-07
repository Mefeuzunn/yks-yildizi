"use client";

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '@/lib/haptics';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Award,
  Sparkles,
  ArrowLeft,
  Send,
  HelpCircle,
  Eye,
} from 'lucide-react';
import { MaarifOpenEndedQuestion, MaarifExamScenario } from '@/types/maarif';

const MATH_SYMBOLS = ['√', 'x²', 'x³', 'x₁', 'x₂', 'Δ', 'π', '≤', '≥', '≠', '±', '∞', '°'];

export default function MaarifExamSessionPage({ params }: { params: Promise<{ scenarioId: string }> }) {
  const { scenarioId } = use(params);
  const router = useRouter();

  const [scenario, setScenario] = useState<MaarifExamScenario | null>(null);
  const [questions, setQuestions] = useState<MaarifOpenEndedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Öğrenci Yanıtları: { [questionId]: string }
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Sınav Süresi: 40 dakika (2400 saniye)
  const [secondsLeft, setSecondsLeft] = useState(2400);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Yapay Zeka Rubrik Değerlendirme Durumları
  const [evaluations, setEvaluations] = useState<Record<string, any>>({});
  const [evaluatingQuestionId, setEvaluatingQuestionId] = useState<string | null>(null);
  const [isBulkEvaluating, setIsBulkEvaluating] = useState(false);

  const handleEvaluateAnswer = async (qId: string) => {
    setEvaluatingQuestionId(qId);
    triggerHaptic('light');
    try {
      const res = await fetch('/api/maarif/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: qId,
          studentAnswer: answers[qId] || '',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEvaluations(prev => ({
          ...prev,
          [qId]: data.evaluation,
        }));
        triggerHaptic('success');
      }
    } catch (e) {
      console.error('Eval error:', e);
    } finally {
      setEvaluatingQuestionId(null);
    }
  };

  const handleBulkEvaluate = async () => {
    setIsBulkEvaluating(true);
    triggerHaptic('light');
    for (const q of questions) {
      if (!evaluations[q.id]) {
        await handleEvaluateAnswer(q.id);
      }
    }
    setIsBulkEvaluating(false);
    triggerHaptic('success');
  };

  // Sınav Verilerini Çek
  useEffect(() => {
    let isMounted = true;
    fetch(`/api/maarif/exam/${scenarioId}`)
      .then(r => r.json())
      .then(d => {
        if (!isMounted) return;
        if (d.success) {
          setScenario(d.scenario);
          setQuestions(d.questions || []);
        }
        setLoading(false);
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [scenarioId]);

  // Sayaç Timer
  useEffect(() => {
    if (isFinished || loading) return;
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinished, loading]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleInsertSymbol = (sym: string) => {
    triggerHaptic('light');
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    const currentVal = answers[currentQ.id] || '';
    setAnswers({
      ...answers,
      [currentQ.id]: currentVal + sym,
    });
  };

  const handleSubmitExam = async () => {
    setIsSubmitting(true);
    triggerHaptic('success');

    try {
      await fetch('/api/maarif/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId,
          answers,
          timeSpentSeconds: 2400 - secondsLeft,
        }),
      });
    } catch (e) {
      console.error('Submit error:', e);
    }

    setIsSubmitting(false);
    setShowConfirmModal(false);
    setIsFinished(true);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#070a13', color: '#94a3b8' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
          <div style={{ fontWeight: 600 }}>MEB Yazılı Sınav Oturumu Hazırlanıyor...</div>
        </div>
      </div>
    );
  }

  if (!scenario || questions.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#070a13', color: '#f8fafc', padding: '1rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <AlertTriangle size={48} color="#f59e0b" style={{ margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Sınav Soruları Bulunamadı</h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '8px 0 16px' }}>Bu senaryo için soru havuzu henüz oluşturulmamış veya bakımda.</p>
          <Link href="/maarif" style={{ padding: '8px 18px', backgroundColor: '#10b981', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '13px' }}>
            Maarif Portalına Dön
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = questions.filter(q => (answers[q.id] || '').trim().length > 0).length;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#070a13',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── ÜST SABİT ÇUBUK (SINAV BİLGİSİ, SÜRE, BİTİR BUTONU) ── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: 'rgba(11, 15, 25, 0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '10px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <Link
            href="/maarif"
            onClick={() => triggerHaptic('light')}
            style={{
              color: '#94a3b8',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={18} />
          </Link>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {scenario.scenario_name}
            </div>
            <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>
              {scenario.grade}. Sınıf {scenario.subject} • 100 Tam Puan
            </div>
          </div>
        </div>

        {/* Canlı Kalan Süre Sayacı & Bitir */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          {!isFinished && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '10px',
                backgroundColor: secondsLeft < 300 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                border: secondsLeft < 300 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                color: secondsLeft < 300 ? '#fca5a5' : '#e2e8f0',
                fontSize: '13px',
                fontWeight: 800,
                fontFamily: 'monospace',
              }}
            >
              <Clock size={15} color={secondsLeft < 300 ? '#ef4444' : '#38bdf8'} />
              <span>{formatTime(secondsLeft)}</span>
            </div>
          )}

          {!isFinished ? (
            <button
              onClick={() => {
                triggerHaptic('medium');
                setShowConfirmModal(true);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                backgroundColor: '#10b981',
                color: '#fff',
                fontSize: '12.5px',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Sınavı Bitir
            </button>
          ) : (
            <Link
              href="/maarif"
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                fontSize: '12.5px',
                fontWeight: 800,
                textDecoration: 'none',
              }}
            >
              Portala Dön
            </Link>
          )}
        </div>
      </header>

      {/* ── SINAV GÖVDE ALANI ── */}
      {!isFinished ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%',
            padding: '1.25rem 1rem 5rem',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          {/* SOL: SORU ALANI (65% genişlik) */}
          <div style={{ flex: '1 1 600px', minWidth: 0 }}>
            {/* Soru Üst Başlığı */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    backgroundColor: '#10b981',
                    color: '#fff',
                    padding: '3px 10px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 800,
                  }}
                >
                  Soru {currentIndex + 1} / {questions.length}
                </span>

                <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontSize: '12px', fontWeight: 700 }}>
                  {currentQuestion.curriculum_node_code}
                </span>
              </div>

              <span
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#fbbf24',
                  padding: '3px 10px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 800,
                }}
              >
                ⭐ {currentQuestion.max_score} Puan
              </span>
            </div>

            {/* Gerçek Yaşam Bağlam / Senaryo Kutusu */}
            <div
              style={{
                backgroundColor: 'rgba(56, 189, 248, 0.05)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '14px',
                padding: '1rem 1.25rem',
                marginBottom: '1rem',
                fontSize: '13px',
                color: '#bae6fd',
                lineHeight: 1.6,
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                📋 Problem Senaryosu & Bağlam:
              </div>
              {currentQuestion.context_story}
            </div>

            {/* Soru Kökü */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.25rem',
                marginBottom: '1.25rem',
                fontSize: '14px',
                fontWeight: 600,
                lineHeight: 1.6,
                color: '#fff',
                whiteSpace: 'pre-line',
              }}
            >
              {currentQuestion.question_text}
            </div>

            {/* Matematiksel / Bilimsel Karakter Kısayolları */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, marginBottom: '6px' }}>
                Hızlı Sembol Ekle:
              </div>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {MATH_SYMBOLS.map(sym => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => handleInsertSymbol(sym)}
                    style={{
                      padding: '4px 10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#e2e8f0',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            {/* Öğrenci Çözüm & Yanıt Kutusu */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                Çözüm Adımlarınız ve Yanıtınız (Açık Uçlu):
              </label>
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={e => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                placeholder="Çözüm basamaklarınızı, formüllerinizi ve vardığınız sonucu adım adım yazınız..."
                rows={6}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: 'rgba(2, 6, 23, 0.8)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '14px',
                  fontFamily: 'sans-serif',
                  lineHeight: 1.6,
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* İleri / Geri Navigasyon Butonları */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
              <button
                disabled={currentIndex === 0}
                onClick={() => {
                  triggerHaptic('light');
                  setCurrentIndex(prev => Math.max(0, prev - 1));
                }}
                style={{
                  padding: '9px 16px',
                  borderRadius: '10px',
                  backgroundColor: currentIndex === 0 ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.08)',
                  color: currentIndex === 0 ? '#475569' : '#e2e8f0',
                  border: 'none',
                  cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                <ChevronLeft size={16} />
                <span>Önceki Soru</span>
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1));
                  }}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '10px',
                    backgroundColor: '#10b981',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: 800,
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <span>Sonraki Soru</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={() => {
                    triggerHaptic('medium');
                    setShowConfirmModal(true);
                  }}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '10px',
                    backgroundColor: '#059669',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: 800,
                  }}
                >
                  <span>Sınavı Bitir</span>
                  <Send size={15} />
                </button>
              )}
            </div>
          </div>

          {/* SAĞ: SORU PALETİ & ÖZET (35% genişlik) */}
          <div style={{ flex: '1 1 300px' }}>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                padding: '1.25rem',
                position: 'sticky',
                top: '75px',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>
                Soru Haritası
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '1.25rem' }}>
                {questions.map((q, idx) => {
                  const isAnswered = (answers[q.id] || '').trim().length > 0;
                  const isCurrent = currentIndex === idx;

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        triggerHaptic('light');
                        setCurrentIndex(idx);
                      }}
                      style={{
                        padding: '10px 0',
                        borderRadius: '10px',
                        border: isCurrent ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                        backgroundColor: isAnswered ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                        color: isAnswered ? '#6ee7b7' : isCurrent ? '#38bdf8' : '#94a3b8',
                        fontWeight: 800,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                      }}
                    >
                      <span>{idx + 1}</span>
                      <span style={{ fontSize: '9px', fontWeight: 600 }}>{q.max_score}P</span>
                    </button>
                  );
                })}
              </div>

              {/* İlerleme Bilgisi */}
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                  <span>Cevaplanan Sorular:</span>
                  <span style={{ fontWeight: 800, color: '#34d399' }}>{answeredCount} / {questions.length}</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${(answeredCount / questions.length) * 100}%`,
                      backgroundColor: '#10b981',
                      borderRadius: '3px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── SINAV BİTTİ: MEB RUBRİK İNCELEME VE DEĞERLENDİRME EKRANI ── */
        <div style={{ maxWidth: '900px', margin: '2rem auto', width: '100%', padding: '0 1rem 5rem' }}>
          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '20px',
              padding: '2rem',
              textAlign: 'center',
              marginBottom: '2rem',
            }}
          >
            <div style={{ fontSize: '42px', marginBottom: '8px' }}>🎉</div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>
              MEB Ortak Yazılı Sınav Provası Tamamlandı!
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 1.25rem' }}>
              Yanıtlarınız kaydedildi. Aşağıdan her sorunun MEB resmi dereceli puanlama anahtarını (rubrik) ve örnek çözüm adımlarını inceleyebilirsiniz.
            </p>

            <div style={{ display: 'inline-flex', gap: '2rem', backgroundColor: 'rgba(7, 10, 19, 0.6)', padding: '12px 24px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#34d399' }}>{answeredCount} / {questions.length}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>Cevaplanan Soru</div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.1)', paddingLeft: '2rem' }}>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#38bdf8' }}>{formatTime(2400 - secondsLeft)}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>Harcanan Süre</div>
              </div>
            </div>
          </div>

          {/* Soru Bazlı Rubrik ve Çözüm İnceleme */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Soru ve Rubrik Değerlendirme Analizi:
              </h3>

              <button
                type="button"
                onClick={handleBulkEvaluate}
                disabled={isBulkEvaluating}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 18px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  color: '#c084fc',
                  fontWeight: 800,
                  fontSize: '12.5px',
                  cursor: isBulkEvaluating ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Sparkles size={16} />
                <span>{isBulkEvaluating ? 'AstraTutor Değerlendiriyor...' : 'Tümünü AstraTutor ile Rubrikle Puanla'}</span>
              </button>
            </div>

            {questions.map((q, idx) => {
              const myAnswer = answers[q.id] || '';
              const evalData = evaluations[q.id];
              const isCurrentEvaluating = evaluatingQuestionId === q.id;

              return (
                <div
                  key={q.id}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '1.25rem 1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontWeight: 800, color: '#38bdf8', fontSize: '13px' }}>
                      Soru {idx + 1} • {q.curriculum_node_code}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {evalData && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: evalData.earned_score >= (q.max_score * 0.7) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                            color: evalData.earned_score >= (q.max_score * 0.7) ? '#34d399' : '#fbbf24',
                          }}
                        >
                          {evalData.mastery_level}
                        </span>
                      )}

                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#f59e0b' }}>
                        {evalData ? `${evalData.earned_score} / ${q.max_score} Puan` : `${q.max_score} Tam Puan`}
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: '13.5px', color: '#e2e8f0', margin: '0 0 1rem', lineHeight: 1.5 }}>
                    {q.question_text}
                  </p>

                  {/* Senin Yanıtın */}
                  <div style={{ backgroundColor: 'rgba(2, 6, 23, 0.6)', padding: '10px 12px', borderRadius: '10px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                      ✍️ Sizin Yazdığınız Cevap:
                    </div>
                    <div style={{ fontSize: '13px', color: myAnswer ? '#fff' : '#64748b', fontStyle: myAnswer ? 'normal' : 'italic' }}>
                      {myAnswer || 'Bu soru boş bırakıldı.'}
                    </div>
                  </div>

                  {/* AstraTutor Yapay Zeka Rubrik Değerlendirmesi */}
                  {evalData ? (
                    <div style={{ backgroundColor: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <Sparkles size={15} color="#c084fc" />
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#c084fc' }}>
                          AstraTutor MEB Rubrik Değerlendirmesi:
                        </span>
                      </div>

                      {/* Kriter Bazlı Sonuçlar */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                        {(evalData.rubric_breakdown || []).map((rb: any, rIdx: number) => (
                          <div
                            key={rIdx}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '11.5px',
                              backgroundColor: 'rgba(0, 0, 0, 0.2)',
                              padding: '6px 10px',
                              borderRadius: '8px',
                            }}
                          >
                            <span style={{ color: rb.achieved ? '#e2e8f0' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{rb.achieved ? '✅' : '⚠️'}</span>
                              <span>{rb.criteria}</span>
                            </span>
                            <span style={{ fontWeight: 800, color: rb.achieved ? '#34d399' : '#f87171' }}>
                              +{rb.earned_points} / {rb.max_points} P
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Pedagojik Dönüt */}
                      <p style={{ fontSize: '12px', color: '#e2e8f0', margin: '0 0 6px', lineHeight: 1.5 }}>
                        <strong>Dönüt:</strong> {evalData.ai_feedback}
                      </p>

                      {/* Sokratik İpucu */}
                      {evalData.socratic_hint && (
                        <div style={{ fontSize: '11.5px', color: '#93c5fd', fontStyle: 'italic' }}>
                          🤔 <strong>Düşünme İpucu:</strong> {evalData.socratic_hint}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ marginBottom: '12px' }}>
                      <button
                        type="button"
                        onClick={() => handleEvaluateAnswer(q.id)}
                        disabled={isCurrentEvaluating || !myAnswer.trim()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 14px',
                          borderRadius: '10px',
                          backgroundColor: myAnswer.trim() ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                          border: myAnswer.trim() ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                          color: myAnswer.trim() ? '#c084fc' : '#64748b',
                          fontWeight: 700,
                          fontSize: '12px',
                          cursor: myAnswer.trim() && !isCurrentEvaluating ? 'pointer' : 'not-allowed',
                        }}
                      >
                        <Sparkles size={14} />
                        <span>{isCurrentEvaluating ? 'AstraTutor Puanlıyor...' : '✨ AstraTutor ile Rubrik Puanla'}</span>
                      </button>
                    </div>
                  )}

                  {/* MEB Dereceli Puanlama Anahtarı (Rubrik) */}
                  <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '12px', marginBottom: '10px' }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#34d399', marginBottom: '6px' }}>
                      📋 MEB Dereceli Puanlama Anahtarı (Rubrik Kriterleri):
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {(q.rubric_criteria || []).map((rc: any, rIdx: number) => (
                        <div key={rIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#cbd5e1' }}>
                          <span>• {rc.criteria}</span>
                          <span style={{ fontWeight: 800, color: '#34d399', flexShrink: 0, marginLeft: '12px' }}>+{rc.points} P</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* MEB Örnek Çözüm Adımları */}
                  {q.sample_solutions && q.sample_solutions.length > 0 && (
                    <div style={{ backgroundColor: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '10px 12px', borderRadius: '10px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#c084fc', marginBottom: '4px' }}>
                        💡 MEB Örnek Çözümü:
                      </div>
                      <div style={{ fontSize: '12px', color: '#e2e8f0', lineHeight: 1.5 }}>
                        {q.sample_solutions.join(' ')}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── BİTİRME ONAY MODALI ── */}
      <AnimatePresence>
        {showConfirmModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '1rem',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '2rem',
                maxWidth: '420px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>❓</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
                Sınavı Bitirmek İstiyor musunuz?
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
                Toplam <strong>{questions.length}</strong> sorudan <strong>{answeredCount}</strong> tanesini yanıtladınız. Sınavı tamamladıktan sonra MEB resmi rubrik puanlama anahtarı açılacaktır.
              </p>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#e2e8f0',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Sınava Dön
                </button>

                <button
                  type="button"
                  onClick={handleSubmitExam}
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    backgroundColor: '#10b981',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSubmitting ? 'Kaydediliyor...' : 'Evet, Bitir'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
