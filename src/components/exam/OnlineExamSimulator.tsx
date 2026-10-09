'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, Flag, CheckCircle2, XCircle, AlertTriangle, 
  ArrowLeft, ArrowRight, Check, X, RotateCcw, 
  Award, BarChart2, BookOpen, Sparkles, Loader2, Save
} from 'lucide-react';
import { toast } from '@/context/ToastContext';
import { triggerHaptic } from '@/lib/haptics';

export interface ExamQuestion {
  id: number;
  number: number;
  section: string;
  subject: string;
  topic: string;
  text: string;
  options: Record<string, string>;
  correctOption: string;
  difficulty: number;
  explanation: string;
}

interface OnlineExamSimulatorProps {
  examType: 'TYT' | 'AYT';
  alan?: string;
  onClose: () => void;
  onExamSaved?: () => void;
}

export default function OnlineExamSimulator({
  examType,
  alan = 'Sayisal',
  onClose,
  onExamSaved
}: OnlineExamSimulatorProps) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // User answers: { [questionNumber]: 'A' | 'B' | 'C' | 'D' | 'E' }
  const [answers, setAnswers] = useState<Record<number, string>>({});
  // Flagged questions for review
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});

  // Timer: seconds left
  const [secondsLeft, setSecondsLeft] = useState(examType === 'TYT' ? 165 * 60 : 180 * 60);
  const [isPaused, setIsPaused] = useState(false);

  // Submission / Review state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [confirmFinishOpen, setConfirmFinishOpen] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);
  const [recordSaved, setRecordSaved] = useState(false);

  // Filter in Optical Matrix
  const [activeSectionFilter, setActiveSectionFilter] = useState('all');

  // Fetch Exam Data
  useEffect(() => {
    async function fetchExam() {
      setLoading(true);
      try {
        const res = await fetch(`/api/exams/mock?type=${examType}&alan=${alan}`);
        const data = await res.json();
        if (data.success && data.questions?.length > 0) {
          setQuestions(data.questions);
          setSecondsLeft((data.durationMinutes || (examType === 'TYT' ? 165 : 180)) * 60);
        } else {
          toast.error(data.error || 'Deneme soruları yüklenemedi.');
          onClose();
        }
      } catch (err) {
        console.error(err);
        toast.error('Sınav simülatörüne bağlanırken hata oluştu.');
        onClose();
      } finally {
        setLoading(false);
      }
    }
    fetchExam();
  }, [examType, alan]);

  // Countdown timer
  useEffect(() => {
    if (loading || isFinished || isPaused) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, isFinished, isPaused]);

  // Format time: HH:MM:SS
  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentQ = questions[currentIndex];

  const handleSelectOption = (optKey: string) => {
    if (isFinished && !reviewMode) return;
    triggerHaptic('light');
    setAnswers((prev) => ({
      ...prev,
      [currentQ.number]: optKey
    }));
  };

  const handleClearOption = () => {
    triggerHaptic('light');
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQ.number];
      return copy;
    });
  };

  const handleToggleFlag = () => {
    triggerHaptic('selection');
    setFlagged((prev) => ({
      ...prev,
      [currentQ.number]: !prev[currentQ.number]
    }));
  };

  // Sections extraction
  const sections = useMemo(() => {
    const list: string[] = [];
    questions.forEach((q) => {
      if (q.section && !list.includes(q.section)) list.push(q.section);
    });
    return list;
  }, [questions]);

  // Result Calculation
  const examResults = useMemo(() => {
    if (!questions.length) return null;

    let correctCount = 0;
    let wrongCount = 0;
    let emptyCount = 0;

    const sectionBreakdown: Record<string, { correct: number; wrong: number; empty: number; net: number }> = {};

    questions.forEach((q) => {
      const userAns = answers[q.number];
      const sec = q.section || q.subject;

      if (!sectionBreakdown[sec]) {
        sectionBreakdown[sec] = { correct: 0, wrong: 0, empty: 0, net: 0 };
      }

      if (!userAns) {
        emptyCount++;
        sectionBreakdown[sec].empty++;
      } else if (userAns === q.correctOption) {
        correctCount++;
        sectionBreakdown[sec].correct++;
      } else {
        wrongCount++;
        sectionBreakdown[sec].wrong++;
      }
    });

    Object.keys(sectionBreakdown).forEach((sec) => {
      const s = sectionBreakdown[sec];
      s.net = parseFloat((s.correct - s.wrong / 4).toFixed(2));
    });

    const totalNet = parseFloat((correctCount - wrongCount / 4).toFixed(2));

    // Approximate Score Calculation
    let estimatedScore = 100;
    if (examType === 'TYT') {
      estimatedScore = Math.min(500, Math.max(100, Math.round(100 + totalNet * 3.33)));
    } else {
      estimatedScore = Math.min(500, Math.max(100, Math.round(100 + totalNet * 5.0)));
    }

    return {
      totalQuestions: questions.length,
      correctCount,
      wrongCount,
      emptyCount,
      totalNet,
      estimatedScore,
      sectionBreakdown
    };
  }, [questions, answers, examType]);

  const handleFinishExam = () => {
    setConfirmFinishOpen(false);
    setIsFinished(true);
    triggerHaptic('success');
    toast.success('Sınav tamamlandı! Sonuç analiziniz hazırlandı.');
  };

  const handleSaveToMockExams = async () => {
    if (!examResults || savingRecord) return;
    setSavingRecord(true);
    try {
      // Map breakdown to database columns
      let turkishNet = 0;
      let mathNet = 0;
      let socialNet = 0;
      let scienceNet = 0;

      Object.entries(examResults.sectionBreakdown).forEach(([sec, data]) => {
        const lower = sec.toLowerCase();
        if (lower.includes('türkçe') || lower.includes('edebiyat')) turkishNet += data.net;
        else if (lower.includes('matematik')) mathNet += data.net;
        else if (lower.includes('sosyal') || lower.includes('tarih')) socialNet += data.net;
        else if (lower.includes('fen')) scienceNet += data.net;
      });

      const res = await fetch('/api/user/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam_type: examType,
          exam_name: `Online ${examType} Simülatör Denemesi`,
          turkish_net: parseFloat(turkishNet.toFixed(2)),
          math_net: parseFloat(mathNet.toFixed(2)),
          social_net: parseFloat(socialNet.toFixed(2)),
          science_net: parseFloat(scienceNet.toFixed(2)),
          total_net: examResults.totalNet,
          exam_date: new Date().toISOString()
        })
      });

      if (res.ok) {
        setRecordSaved(true);
        toast.success('Deneme sınavı başarıyla profilinize kaydedildi!');
        onExamSaved?.();
      } else {
        toast.error('Kayıt kaydedilirken bir hata oluştu.');
      }
    } catch (e) {
      console.error(e);
      toast.error('Kaydedilemedi.');
    } finally {
      setSavingRecord(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#070b14',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        gap: '16px'
      }}>
        <Loader2 className="animate-spin text-emerald-400" size={48} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>ÖSYM Standartlarında {examType} Denemesi Hazırlanıyor...</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Soru kitapçığı ve optik form oluşturuluyor.</p>
      </div>
    );
  }

  // Answered stats
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#070b14',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      color: '#f8fafc'
    }}>
      {/* ── Top Header ── */}
      <header style={{
        height: '68px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(11, 16, 29, 0.95)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            padding: '6px 14px',
            borderRadius: '10px',
            fontWeight: 900,
            fontSize: '0.85rem',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Sparkles size={16} /> {examType} Sınav Modu
          </div>
          <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }} className="hidden sm:inline">
            {questions.length} Soru • {examType === 'TYT' ? '165' : '180'} Dakika
          </span>
        </div>

        {/* Timer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 16px',
          borderRadius: '12px',
          backgroundColor: secondsLeft < 900 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${secondsLeft < 900 ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}`
        }}>
          <Clock size={18} color={secondsLeft < 900 ? '#f87171' : '#38bdf8'} />
          <span style={{
            fontFamily: 'monospace',
            fontWeight: 800,
            fontSize: '1.2rem',
            color: secondsLeft < 900 ? '#f87171' : '#f1f5f9'
          }}>
            {formatTime(secondsLeft)}
          </span>
          {!isFinished && (
            <button
              onClick={() => setIsPaused(!isPaused)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '0.75rem',
                cursor: 'pointer',
                marginLeft: '6px'
              }}
            >
              {isPaused ? '▶ Devam' : '⏸ Duraklat'}
            </button>
          )}
        </div>

        {/* Action button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isFinished ? (
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Çıkış Yap
            </button>
          ) : (
            <button
              onClick={() => setConfirmFinishOpen(true)}
              style={{
                padding: '8px 18px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                border: 'none',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(239,68,68,0.35)'
              }}
            >
              Sınavı Bitir
            </button>
          )}
        </div>
      </header>

      {/* ── Main Body ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: Question View */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: '2rem 2.5rem',
          maxWidth: '900px',
          margin: '0 auto',
          width: '100%'
        }}>
          {currentQ && (
            <motion.div
              key={currentQ.number}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.18 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}
            >
              {/* Question Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                paddingBottom: '1rem',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontSize: '1.25rem',
                    fontWeight: 900,
                    color: '#38bdf8'
                  }}>
                    Soru {currentQ.number}
                  </span>
                  <span style={{
                    fontSize: '0.8rem',
                    padding: '3px 10px',
                    borderRadius: '8px',
                    background: 'rgba(56, 189, 248, 0.12)',
                    color: '#7dd3fc',
                    fontWeight: 700
                  }}>
                    {currentQ.section}
                  </span>
                  <span style={{ color: '#64748b', fontSize: '0.8rem' }}>• {currentQ.topic}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={handleToggleFlag}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: flagged[currentQ.number] ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${flagged[currentQ.number] ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255,255,255,0.1)'}`,
                      color: flagged[currentQ.number] ? '#fcd34d' : '#94a3b8',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Flag size={15} fill={flagged[currentQ.number] ? '#fcd34d' : 'none'} />
                    {flagged[currentQ.number] ? 'Bayraklı' : 'Bayrak Koy'}
                  </button>

                  {answers[currentQ.number] && !isFinished && (
                    <button
                      onClick={handleClearOption}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        color: '#fca5a5',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Temizle
                    </button>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div style={{
                fontSize: '1.08rem',
                lineHeight: 1.7,
                color: '#f1f5f9',
                whiteSpace: 'pre-wrap',
                fontWeight: 500,
                padding: '0.5rem 0'
              }}>
                {currentQ.text}
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '0.5rem' }}>
                {Object.entries(currentQ.options).map(([optKey, optText]) => {
                  const isSelected = answers[currentQ.number] === optKey;
                  const isCorrectAnswer = currentQ.correctOption === optKey;

                  let optBg = 'rgba(255,255,255,0.03)';
                  let optBorder = 'rgba(255,255,255,0.08)';
                  let optColor = '#f1f5f9';

                  if (isFinished || reviewMode) {
                    if (isCorrectAnswer) {
                      optBg = 'rgba(16, 185, 129, 0.15)';
                      optBorder = '#10b981';
                      optColor = '#34d399';
                    } else if (isSelected && !isCorrectAnswer) {
                      optBg = 'rgba(239, 68, 68, 0.15)';
                      optBorder = '#ef4444';
                      optColor = '#f87171';
                    }
                  } else if (isSelected) {
                    optBg = 'rgba(56, 189, 248, 0.15)';
                    optBorder = '#38bdf8';
                    optColor = '#38bdf8';
                  }

                  return (
                    <button
                      key={optKey}
                      onClick={() => handleSelectOption(optKey)}
                      disabled={isFinished && !reviewMode}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '12px 18px',
                        borderRadius: '12px',
                        background: optBg,
                        border: `1.5px solid ${optBorder}`,
                        color: optColor,
                        fontSize: '0.98rem',
                        textAlign: 'left',
                        cursor: isFinished ? 'default' : 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        flexShrink: 0,
                        background: isSelected ? optBorder : 'rgba(255,255,255,0.06)',
                        color: isSelected ? '#000' : '#fff'
                      }}>
                        {optKey}
                      </span>
                      <span style={{ flex: 1, lineHeight: 1.45 }}>{optText}</span>
                      {(isFinished || reviewMode) && isCorrectAnswer && (
                        <CheckCircle2 size={20} color="#10b981" />
                      )}
                      {(isFinished || reviewMode) && isSelected && !isCorrectAnswer && (
                        <XCircle size={20} color="#ef4444" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Solution in review mode */}
              {(isFinished || reviewMode) && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  color: '#bae6fd'
                }}>
                  <div style={{ fontWeight: 800, marginBottom: '6px', color: '#38bdf8', fontSize: '0.9rem' }}>
                    💡 Çözüm Açıklaması:
                  </div>
                  <div style={{ fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: '#f0f9ff' }}>
                    {currentQ.explanation}
                  </div>
                </div>
              )}

              {/* Bottom Nav Controls */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 'auto',
                paddingTop: '2rem'
              }}>
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: currentIndex === 0 ? '#475569' : '#fff',
                    cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}
                >
                  <ArrowLeft size={16} /> Önceki
                </button>

                <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>
                  {currentIndex + 1} / {questions.length}
                </div>

                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  disabled={currentIndex === questions.length - 1}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 22px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
                    border: 'none',
                    color: '#fff',
                    cursor: currentIndex === questions.length - 1 ? 'not-allowed' : 'pointer',
                    fontWeight: 800,
                    fontSize: '0.85rem'
                  }}
                >
                  Sonraki <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: Optical Sheet & Matrix (Desktop) */}
        <aside style={{
          width: '360px',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          backgroundColor: 'rgba(11, 16, 29, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0
        }} className="hidden md:flex">
          {/* Optical Header */}
          <div style={{
            padding: '1.25rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>Optik Cevap Formu</span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                <strong style={{ color: '#10b981' }}>{answeredCount}</strong> / {questions.length} Dolu
              </span>
            </div>

            {/* Section tabs */}
            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
              <button
                onClick={() => setActiveSectionFilter('all')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: activeSectionFilter === 'all' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.05)',
                  border: 'none',
                  color: activeSectionFilter === 'all' ? '#38bdf8' : '#94a3b8',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Tümü
              </button>
              {sections.map((sec) => (
                <button
                  key={sec}
                  onClick={() => setActiveSectionFilter(sec)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: activeSectionFilter === sec ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.05)',
                    border: 'none',
                    color: activeSectionFilter === sec ? '#38bdf8' : '#94a3b8',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {sec.replace(' Testi', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Matrix Grid */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px'
            }}>
              {questions
                .filter((q) => activeSectionFilter === 'all' || q.section === activeSectionFilter)
                .map((q) => {
                  const isCurrent = currentIndex === q.number - 1;
                  const ans = answers[q.number];
                  const isFlag = flagged[q.number];
                  const isCorrect = q.correctOption === ans;

                  let bg = 'rgba(255,255,255,0.03)';
                  let border = '1px solid rgba(255,255,255,0.08)';
                  let color = '#94a3b8';

                  if (isFinished || reviewMode) {
                    if (ans && isCorrect) {
                      bg = 'rgba(16, 185, 129, 0.2)';
                      border = '1px solid #10b981';
                      color = '#34d399';
                    } else if (ans && !isCorrect) {
                      bg = 'rgba(239, 68, 68, 0.2)';
                      border = '1px solid #ef4444';
                      color = '#f87171';
                    }
                  } else if (ans) {
                    bg = 'rgba(16, 185, 129, 0.2)';
                    border = '1px solid #10b981';
                    color = '#34d399';
                  }

                  if (isCurrent) {
                    border = '2px solid #38bdf8';
                  }

                  return (
                    <button
                      key={q.number}
                      onClick={() => setCurrentIndex(q.number - 1)}
                      style={{
                        padding: '8px 4px',
                        borderRadius: '8px',
                        background: bg,
                        border,
                        color,
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                        position: 'relative'
                      }}
                    >
                      <span>{q.number}</span>
                      <span style={{ fontSize: '0.7rem', color: ans ? '#fff' : '#64748b' }}>
                        {ans || '-'}
                      </span>
                      {isFlag && (
                        <div style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#f59e0b'
                        }} />
                      )}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Footer Legend */}
          <div style={{
            padding: '1rem',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            fontSize: '0.75rem',
            color: '#94a3b8',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#10b981' }} />
              Dolu: {answeredCount}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#f59e0b' }} />
              Bayrak: {flaggedCount}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(255,255,255,0.2)' }} />
              Boş: {questions.length - answeredCount}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Confirm Finish Modal ── */}
      <AnimatePresence>
        {confirmFinishOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '2rem',
                maxWidth: '460px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AlertTriangle size={24} color="#f59e0b" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#fff' }}>Sınavı Bitirmek İstiyor musun?</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0' }}>Cevaplarınız değerlendirilecek ve net karneniz oluşturulacak.</p>
                </div>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.03)',
                padding: '1rem',
                borderRadius: '12px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                textAlign: 'center',
                gap: '8px'
              }}>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{answeredCount}</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Cevaplanan</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#94a3b8' }}>{questions.length - answeredCount}</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Boş</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>{flaggedCount}</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Bayraklı</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                <button
                  onClick={() => setConfirmFinishOpen(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Sınava Dön
                </button>
                <button
                  onClick={handleFinishExam}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  Evet, Bitir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Exam Results Report Modal (Karne) ── */}
      <AnimatePresence>
        {isFinished && !reviewMode && examResults && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(16px)',
            zIndex: 9999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            overflowY: 'auto'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              style={{
                backgroundColor: '#0b1120',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '24px',
                padding: '2.5rem',
                maxWidth: '680px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.75rem',
                boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
              }}
            >
              {/* Header */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)'
                }}>
                  <Award size={36} color="#fff" />
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                  {examType} Deneme Karnesi
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
                  ÖSYM net hesaplama kuralına göre (4 Yanlış 1 Doğruyu Götürür) hesaplanmıştır.
                </p>
              </div>

              {/* Main Score Highlights */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                padding: '1.5rem',
                borderRadius: '18px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981' }}>{examResults.correctCount}</div>
                  <div style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 700 }}>DOĞRU</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ef4444' }}>{examResults.wrongCount}</div>
                  <div style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 700 }}>YANLIŞ</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#94a3b8' }}>{examResults.emptyCount}</div>
                  <div style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 700 }}>BOŞ</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#38bdf8' }}>{examResults.totalNet}</div>
                  <div style={{ color: '#38bdf8', fontSize: '0.78rem', fontWeight: 800 }}>TOPLAM NET</div>
                </div>
              </div>

              {/* Estimated Score Pill */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.5rem',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(99, 102, 241, 0.12))',
                border: '1px solid rgba(56, 189, 248, 0.3)'
              }}>
                <div>
                  <span style={{ color: '#bae6fd', fontWeight: 800, fontSize: '0.95rem' }}>Tahmini {examType} Ham Puanı:</span>
                  <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: 0 }}>ÖSYM 100-500 ölçek katsayı simülasyonu</p>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#38bdf8' }}>
                  {examResults.estimatedScore} Puan
                </div>
              </div>

              {/* Breakdown by Sections */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1' }}>Test Bazında Başarı Dağılımı:</span>
                {Object.entries(examResults.sectionBreakdown).map(([sec, data]) => (
                  <div
                    key={sec}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{sec}</span>
                    <div style={{ display: 'flex', gap: '16px', color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>
                      <span style={{ color: '#34d399' }}>{data.correct} D</span>
                      <span style={{ color: '#f87171' }}>{data.wrong} Y</span>
                      <span style={{ color: '#64748b' }}>{data.empty} B</span>
                      <span style={{ color: '#38bdf8', fontWeight: 800 }}>{data.net} Net</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                <button
                  onClick={() => setReviewMode(true)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <BookOpen size={18} /> Çözümleri İncele
                </button>

                <button
                  onClick={handleSaveToMockExams}
                  disabled={savingRecord || recordSaved}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    background: recordSaved ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #38bdf8, #0284c7)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: recordSaved ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px rgba(56, 189, 248, 0.4)'
                  }}
                >
                  {savingRecord ? <Loader2 size={18} className="animate-spin" /> : recordSaved ? <Check size={18} /> : <Save size={18} />}
                  {recordSaved ? 'Kaydedildi!' : 'Denemelerime Kaydet'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
