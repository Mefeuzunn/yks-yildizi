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
import { useAuth } from '@/context/AuthContext';

const MATH_SYMBOLS = ['√', 'x²', 'x³', 'x₁', 'x₂', 'Δ', 'π', '≤', '≥', '≠', '±', '∞', '°'];

export default function MaarifExamSessionPage({ params }: { params: Promise<{ scenarioId: string }> }) {
  const { scenarioId } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  // Güvenlik & İzolasyon: 12. Sınıf ve Mezun öğrenciler klasik YKS'ye yönlendirilir
  useEffect(() => {
    if (user && (user.role === 'ogrenci' || !user.role)) {
      if (user.curriculum_mode === 'legacy_yks' || ['12', 'Mezun'].includes(user.sinif)) {
        window.location.href = '/dashboard';
      }
    }
  }, [user]);

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
        backgroundColor: '#080c14',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* ── ÜST SABİT ÇUBUK (SINAV BİLGİSİ, SÜRE, BİTİR BUTONU) ── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: 'rgba(15, 21, 35, 0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '12px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <Link
            href="/maarif"
            onClick={() => triggerHaptic('light')}
            className="active:scale-95"
            style={{
              color: '#94a3b8',
              padding: '6px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              transition: 'all 0.15s',
            }}
          >
            <ArrowLeft size={18} />
          </Link>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.01em' }}>
              {scenario.scenario_name}
            </div>
            <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 700 }}>
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
                padding: '6px 14px',
                borderRadius: '11px',
                backgroundColor: secondsLeft < 300 ? 'rgba(239, 68, 68, 0.18)' : 'rgba(8, 12, 20, 0.75)',
                border: secondsLeft < 300 ? '1px solid rgba(239, 68, 68, 0.45)' : '1px solid rgba(255, 255, 255, 0.08)',
                color: secondsLeft < 300 ? '#fca5a5' : '#38bdf8',
                fontSize: '13px',
                fontWeight: 800,
                fontVariantNumeric: 'tabular-nums',
                boxShadow: secondsLeft < 300 ? '0 0 12px rgba(239, 68, 68, 0.3)' : 'none',
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
              className="active:scale-[0.98]"
              style={{
                padding: '8px 18px',
                borderRadius: '11px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                fontSize: '12.5px',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              Sınavı Bitir
            </button>
          ) : (
            <Link
              href="/maarif"
              className="active:scale-[0.98]"
              style={{
                padding: '8px 18px',
                borderRadius: '11px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                fontSize: '12.5px',
                fontWeight: 800,
                textDecoration: 'none',
                transition: 'all 0.2s',
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
                backgroundColor: 'rgba(15, 21, 35, 0.75)',
                border: '1px solid rgba(56, 189, 248, 0.22)',
                borderRadius: '16px',
                padding: '1.15rem 1.35rem',
                marginBottom: '1rem',
                fontSize: '13px',
                color: '#bae6fd',
                lineHeight: 1.65,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(16px)',
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
                backgroundColor: 'rgba(15, 21, 35, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                padding: '1.35rem',
                marginBottom: '1.25rem',
                fontSize: '14.5px',
                fontWeight: 600,
                lineHeight: 1.65,
                color: '#ffffff',
                whiteSpace: 'pre-line',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
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
                    className="active:scale-95"
                    style={{
                      padding: '4px 10px',
                      backgroundColor: 'rgba(22, 32, 53, 0.65)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      color: '#e2e8f0',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
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
                  padding: '14px 16px',
                  backgroundColor: 'rgba(8, 12, 20, 0.85)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  borderRadius: '14px',
                  color: '#ffffff',
                  fontSize: '14.5px',
                  fontFamily: 'inherit',
                  lineHeight: 1.6,
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box',
                  boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.4)',
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
                className={currentIndex === 0 ? '' : 'active:scale-[0.98]'}
                style={{
                  padding: '9px 18px',
                  borderRadius: '11px',
                  backgroundColor: currentIndex === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.06)',
                  color: currentIndex === 0 ? '#475569' : '#e2e8f0',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  transition: 'all 0.15s',
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
                  className="active:scale-[0.98]"
                  style={{
                    padding: '9px 22px',
                    borderRadius: '11px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: 800,
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
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
                  className="active:scale-[0.98]"
                  style={{
                    padding: '9px 22px',
                    borderRadius: '11px',
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: 800,
                    boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
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
                backgroundColor: 'rgba(15, 21, 35, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '1.35rem',
                position: 'sticky',
                top: '80px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: '0 0 12px', letterSpacing: '-0.01em' }}>
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
                      className="active:scale-95"
                      style={{
                        padding: '10px 0',
                        borderRadius: '11px',
                        border: isCurrent
                          ? '2px solid #38bdf8'
                          : isAnswered
                          ? '1px solid rgba(16, 185, 129, 0.4)'
                          : '1px solid rgba(255, 255, 255, 0.08)',
                        backgroundColor: isCurrent
                          ? 'rgba(56, 189, 248, 0.15)'
                          : isAnswered
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'rgba(255, 255, 255, 0.03)',
                        color: isCurrent ? '#38bdf8' : isAnswered ? '#6ee7b7' : '#94a3b8',
                        fontWeight: 800,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                        boxShadow: isCurrent ? '0 0 12px rgba(56, 189, 248, 0.25)' : 'none',
                        transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
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
                  <span style={{ fontWeight: 800, color: '#34d399', fontVariantNumeric: 'tabular-nums' }}>{answeredCount} / {questions.length}</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${(answeredCount / questions.length) * 100}%`,
                      background: 'linear-gradient(90deg, #10b981, #34d399)',
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
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 21, 35, 0.95) 50%, rgba(6, 182, 212, 0.08) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '22px',
              padding: '2.25rem 2rem',
              textAlign: 'center',
              marginBottom: '2rem',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div style={{ fontSize: '42px', marginBottom: '8px' }}>🎉</div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              MEB Ortak Yazılı Sınav Provası Tamamlandı!
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 1.35rem', lineHeight: 1.55 }}>
              Yanıtlarınız kaydedildi. Aşağıdan her sorunun MEB resmi dereceli puanlama anahtarını (rubrik) ve örnek çözüm adımlarını inceleyebilirsiniz.
            </p>

            <div style={{ display: 'inline-flex', gap: '2rem', backgroundColor: 'rgba(8, 12, 20, 0.75)', padding: '12px 28px', borderRadius: '15px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#34d399', fontVariantNumeric: 'tabular-nums' }}>{answeredCount} / {questions.length}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, marginTop: '2px' }}>Cevaplanan Soru</div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.08)', paddingLeft: '2rem' }}>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#38bdf8', fontVariantNumeric: 'tabular-nums' }}>{formatTime(2400 - secondsLeft)}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, marginTop: '2px' }}>Harcanan Süre</div>
              </div>
            </div>
          </div>

          {/* Soru Bazlı Rubrik ve Çözüm İnceleme */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
                Soru ve Rubrik Değerlendirme Analizi:
              </h3>

              <button
                type="button"
                onClick={handleBulkEvaluate}
                disabled={isBulkEvaluating}
                className="active:scale-[0.98]"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 18px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(99, 102, 241, 0.2))',
                  border: '1px solid rgba(139, 92, 246, 0.45)',
                  color: '#c084fc',
                  fontWeight: 800,
                  fontSize: '12.5px',
                  cursor: isBulkEvaluating ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(139, 92, 246, 0.25)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
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
                    backgroundColor: 'rgba(15, 21, 35, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '18px',
                    padding: '1.35rem 1.6rem',
                    boxShadow: '0 6px 24px rgba(0, 0, 0, 0.25)',
                    backdropFilter: 'blur(16px)',
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
                backgroundColor: '#0f1523',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '2.25rem 2rem',
                maxWidth: '420px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
              }}
            >
              <div style={{ fontSize: '38px', marginBottom: '12px' }}>❓</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
                Sınavı Bitirmek İstiyor musunuz?
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 1.5rem', lineHeight: 1.55 }}>
                Toplam <strong>{questions.length}</strong> sorudan <strong>{answeredCount}</strong> tanesini yanıtladınız. Sınavı tamamladıktan sonra MEB resmi rubrik puanlama anahtarı açılacaktır.
              </p>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="active:scale-95"
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#e2e8f0',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  Sınava Dön
                </button>

                <button
                  type="button"
                  onClick={handleSubmitExam}
                  disabled={isSubmitting}
                  className="active:scale-95"
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                    transition: 'all 0.15s',
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
