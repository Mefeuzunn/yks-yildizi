"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, Flag, ChevronLeft, ChevronRight, X, Check, 
  Lightbulb, Edit3, Trash2, Award, Bookmark, RotateCcw, 
  HelpCircle, ArrowLeft, BarChart2, ShieldAlert, Sparkles, CheckCircle2 
} from 'lucide-react';
import Link from 'next/link';
import { haptics } from '@/lib/haptics';

interface TestOption {
  letter: string;
  text: string;
}

interface TestQuestion {
  id: string | number;
  subject: string;
  topic: string;
  text: string;
  options: Record<string, string>;
  optionsArray?: string[];
  correctOption: string;
  correctAnswer?: number;
  difficulty?: number;
  explanation?: string;
  hint?: string;
}

interface TestData {
  id: string;
  title: string;
  subject: string;
  examType: string;
  durationMinutes: number;
  questionCount: number;
  questions: TestQuestion[];
}

function TestCozContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const testId = searchParams.get('id');
  const customId = searchParams.get('customId');

  const [testData, setTestData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Runner States
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({}); // 0-indexed: 'A'|'B'|'C'|'D'|'E'
  const [eliminatedOptions, setEliminatedOptions] = useState<Record<string, boolean>>({}); // 'qIdx_A': true
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [showOpticDrawer, setShowOpticDrawer] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Timer States
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const endTimeRef = useRef<number>(0);

  // Finish & Result States
  const [isFinished, setIsFinished] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<{
    correctCount: number;
    wrongCount: number;
    blankCount: number;
    netScore: number;
    accuracy: number;
    spentMinutes: number;
    xpGained: number;
  } | null>(null);

  // Scratchpad Canvas States
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#38bdf8');

  // ── Load Test Data ────────────────────────────────────────────────────────
  useEffect(() => {
    const loadTest = async () => {
      setLoading(true);
      setError(null);

      // Check if custom test stored in sessionStorage
      if (customId) {
        const stored = sessionStorage.getItem(`custom_test_${customId}`);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setTestData(parsed);
            initTimer(parsed.durationMinutes || 20);
            setLoading(false);
            return;
          } catch (_) {}
        }
      }

      // Load curated suite from API
      try {
        const idToFetch = testId || 'osym-2024-tyt-deneme';
        const res = await fetch(`/api/tests?id=${encodeURIComponent(idToFetch)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.test) {
            setTestData(json.test);
            initTimer(json.test.durationMinutes || 25);
          } else {
            setError('Test bulunamadı.');
          }
        } else {
          setError('Sınav verisi yüklenirken hata oluştu.');
        }
      } catch (err: any) {
        setError(err.message || 'Bağlantı hatası');
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [testId, customId]);

  const initTimer = (minutes: number) => {
    const secs = minutes * 60;
    setTotalSeconds(secs);
    setSecondsLeft(secs);
    endTimeRef.current = Date.now() + secs * 1000;
  };

  // ── Countdown Timer Effect ────────────────────────────────────────────────
  useEffect(() => {
    if (loading || isFinished || secondsLeft <= 0) return;

    const interval = setInterval(() => {
      if (document.hidden) return;
      const rem = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
      setSecondsLeft(rem);
      if (rem === 0) {
        handleFinishTest();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, isFinished, secondsLeft]);

  // ── Scratchpad Canvas Logic ───────────────────────────────────────────────
  useEffect(() => {
    if (!showScratchpad) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = canvas.parentElement?.clientWidth || 360;
    canvas.height = 340;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = 3;
  }, [showScratchpad, brushColor]);

  const startDraw = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // ── Selection & Elimination Actions ───────────────────────────────────────
  const handleSelectOption = (letter: string) => {
    if (isFinished) return;
    haptics.selection();
    setAnswers(prev => ({
      ...prev,
      [currentIdx]: prev[currentIdx] === letter ? '' : letter
    }));
  };

  const handleToggleEliminate = (e: React.MouseEvent, letter: string) => {
    e.stopPropagation();
    haptics.impact('light');
    const key = `${currentIdx}_${letter}`;
    setEliminatedOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleFlagCurrent = () => {
    haptics.impact('light');
    setFlagged(prev => ({
      ...prev,
      [currentIdx]: !prev[currentIdx]
    }));
  };

  // ── Test Completion & Results Submission ──────────────────────────────────
  const handleFinishTest = async () => {
    if (!testData || submitting) return;
    haptics.notification('success');
    setSubmitting(true);
    setIsConfirmModalOpen(false);

    let correctCount = 0;
    let wrongCount = 0;
    let blankCount = 0;
    const wrongQuestions: any[] = [];

    testData.questions.forEach((q, idx) => {
      const studentAns = answers[idx];
      const correctLetter = q.correctOption?.toUpperCase() || 'A';

      if (!studentAns) {
        blankCount++;
      } else if (studentAns === correctLetter) {
        correctCount++;
      } else {
        wrongCount++;
        wrongQuestions.push({
          question: q,
          selected: studentAns,
          correct: correctLetter
        });
      }
    });

    const netScore = Math.max(0, +(correctCount - wrongCount * 0.25).toFixed(2));
    const totalAnswered = correctCount + wrongCount;
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
    const spentMinutes = Math.max(1, Math.round((totalSeconds - secondsLeft) / 60));
    const xpGained = (correctCount * 15) + (accuracy >= 80 ? 50 : 0);

    setResults({
      correctCount,
      wrongCount,
      blankCount,
      netScore,
      accuracy,
      spentMinutes,
      xpGained
    });

    setIsFinished(true);

    try {
      // 1. Submit to test_sessions
      await fetch('/api/user/tests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_type: testData.title,
          score: netScore,
          correct_count: correctCount,
          wrong_count: wrongCount,
          blank_count: blankCount,
          duration: spentMinutes,
          details: {
            subject: testData.subject,
            accuracy,
            answers
          }
        })
      });

      // 2. Automatically log wrong questions into student_mistakes (Leitner 1)
      for (const w of wrongQuestions) {
        const q = w.question;
        const optObj = q.options || {};
        const selText = optObj[w.selected] || w.selected;
        const corrText = optObj[w.correct] || w.correct;

        await fetch('/api/user/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: q.subject || testData.subject,
            topic: q.topic || 'Genel Soru',
            icerik: q.text,
            secenekler_json: JSON.stringify(Object.values(optObj)),
            dogru_cevap: `${w.correct}) ${corrText}`,
            secilen_cevap: `${w.selected}) ${selText}`,
            cozum: q.explanation || `${q.topic} sorusu açıklaması.`
          })
        });
      }
    } catch (err) {
      console.error('Test completion sync error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#080c14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', fontSize: '1.1rem', fontWeight: 700 }}>
        Sınav ortamı hazırlanıyor...
      </div>
    );
  }

  if (error || !testData || testData.questions.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#080c14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', padding: '2rem' }}>
        <ShieldAlert size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{error || 'Soru havuzu boş'}</h2>
        <Link href="/testler">
          <button style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}>
            Test Merkezine Dön
          </button>
        </Link>
      </div>
    );
  }

  const currentQ = testData.questions[currentIdx] || testData.questions[0];
  const qOptions = currentQ.options || {};
  const letters = ['A', 'B', 'C', 'D', 'E'];

  // Font size multiplier
  const textFontSize = fontSizeLevel === 'large' ? '1.15rem' : fontSizeLevel === 'xlarge' ? '1.3rem' : '1rem';

  return (
    <div style={{ minHeight: '100vh', background: '#070a12', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      
      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <header style={{ 
        height: '64px', 
        borderBottom: '1px solid rgba(255,255,255,0.08)', 
        background: 'rgba(10, 15, 26, 0.95)', 
        backdropFilter: 'blur(12px)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0 1.25rem',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        {/* Left: Exit & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => {
              if (isFinished || Object.keys(answers).length === 0) {
                router.push('/testler');
              } else {
                setIsConfirmModalOpen(true);
              }
            }}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 600 }}
          >
            <ArrowLeft size={18} /> {isFinished ? 'Testlere Dön' : 'Çıkış'}
          </button>
          
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '320px' }}>
              {testData.title}
            </h2>
            <div style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: 600 }}>
              {testData.subject} • Soru {currentIdx + 1} / {testData.questions.length}
            </div>
          </div>
        </div>

        {/* Center: Countdown Timer */}
        {!isFinished && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            padding: '0.4rem 0.85rem', 
            borderRadius: '20px', 
            background: secondsLeft < 180 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.05)', 
            border: `1px solid ${secondsLeft < 180 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255,255,255,0.1)'}`,
            color: secondsLeft < 180 ? '#fca5a5' : '#38bdf8',
            fontWeight: 800,
            fontSize: '0.95rem'
          }}>
            <Clock size={16} />
            <span>{formatTimer(secondsLeft)}</span>
          </div>
        )}

        {/* Right: Tools & Submit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Font Size Changer */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2px' }}>
            <button 
              onClick={() => setFontSizeLevel('normal')}
              style={{ padding: '4px 8px', background: fontSizeLevel === 'normal' ? 'rgba(255,255,255,0.15)' : 'none', border: 'none', color: '#cbd5e1', fontSize: '0.75rem', fontWeight: 700, borderRadius: '6px', cursor: 'pointer' }}
            >
              A
            </button>
            <button 
              onClick={() => setFontSizeLevel('large')}
              style={{ padding: '4px 8px', background: fontSizeLevel === 'large' ? 'rgba(255,255,255,0.15)' : 'none', border: 'none', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 700, borderRadius: '6px', cursor: 'pointer' }}
            >
              A+
            </button>
          </div>

          {/* Optic Form Drawer Toggle */}
          <button
            onClick={() => setShowOpticDrawer(!showOpticDrawer)}
            style={{ 
              padding: '0.45rem 0.85rem', 
              borderRadius: '8px', 
              background: showOpticDrawer ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              color: '#fff', 
              fontSize: '0.82rem', 
              fontWeight: 700, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            📋 Optik ({Object.values(answers).filter(Boolean).length}/{testData.questions.length})
          </button>

          {/* Submit Test Button */}
          {!isFinished && (
            <button
              onClick={() => setIsConfirmModalOpen(true)}
              className="btn-interactive"
              style={{
                padding: '0.5rem 1.15rem',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                color: '#fff',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Sınavı Bitir
            </button>
          )}
        </div>
      </header>

      {/* ── Main Testing Studio Workspace ─────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        
        {/* Soru İçerik Alanı */}
        <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
          <div style={{ maxWidth: '840px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Soru Üst Bilgi Barı */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8' }}>
                  SORU #{currentIdx + 1}
                </span>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                  {currentQ.topic || currentQ.subject}
                </span>
                {currentQ.isPastExam && (
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', fontWeight: 700 }}>
                    🏛️ {currentQ.examYear || ''} ÖSYM Çıkmış
                  </span>
                )}
                {currentQ.isPredicted && (
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.15)', color: '#d8b4fe', fontWeight: 700 }}>
                    🎯 2025-2026 Tahmin
                  </span>
                )}
              </div>

              {/* Action Buttons: Flag, Hint, Scratchpad */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => setShowScratchpad(!showScratchpad)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: showScratchpad ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.03)',
                    color: showScratchpad ? '#38bdf8' : '#94a3b8',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Edit3 size={14} /> Karala
                </button>

                {!isFinished && (
                  <button
                    onClick={() => setShowHintModal(true)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(245, 158, 11, 0.1)',
                      color: '#fbbf24',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Lightbulb size={14} /> İpucu
                  </button>
                )}

                <button
                  onClick={toggleFlagCurrent}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: flagged[currentIdx] ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.03)',
                    color: flagged[currentIdx] ? '#ef4444' : '#94a3b8',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Flag size={14} fill={flagged[currentIdx] ? '#ef4444' : 'none'} />
                  {flagged[currentIdx] ? 'Bayraklı' : 'Bayrakla'}
                </button>
              </div>
            </div>

            {/* Soru Karalama Canvas Çekmecesi */}
            {showScratchpad && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  background: '#090e1a',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '16px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {['#38bdf8', '#10b981', '#f59e0b', '#ef4444', '#ffffff'].map(c => (
                      <button
                        key={c}
                        onClick={() => setBrushColor(c)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: c,
                          border: brushColor === c ? '2px solid #fff' : 'none',
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </div>

                  <button
                    onClick={clearCanvas}
                    style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Trash2 size={13} /> Tuvali Temizle
                  </button>
                </div>

                <canvas
                  ref={canvasRef}
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={() => setIsDrawing(false)}
                  onMouseLeave={() => setIsDrawing(false)}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={() => setIsDrawing(false)}
                  style={{
                    background: '#060a12',
                    borderRadius: '10px',
                    width: '100%',
                    height: '240px',
                    cursor: 'crosshair',
                    touchAction: 'none'
                  }}
                />
              </motion.div>
            )}

            {/* Soru Metni Kartı */}
            <div className="premium-card" style={{ padding: '2rem', borderRadius: '18px', background: '#0e1526' }}>
              <div style={{ fontSize: textFontSize, lineHeight: 1.7, color: '#f1f5f9', whiteSpace: 'pre-line', fontWeight: 500 }}>
                {currentQ.text}
              </div>
            </div>

            {/* Seçenekler (Şıklar) Listesi */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {letters.map(letter => {
                const optText = qOptions[letter] || (currentQ.optionsArray && currentQ.optionsArray[letters.indexOf(letter)]) || '';
                if (!optText) return null;

                const isSelected = answers[currentIdx] === letter;
                const isEliminated = Boolean(eliminatedOptions[`${currentIdx}_${letter}`]);
                
                // Review mode colors
                let borderColor = 'rgba(255,255,255,0.08)';
                let bgColor = isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)';
                let textColor = isSelected ? '#818cf8' : '#cbd5e1';

                if (isFinished) {
                  const correctLetter = currentQ.correctOption?.toUpperCase();
                  if (letter === correctLetter) {
                    borderColor = '#10b981';
                    bgColor = 'rgba(16, 185, 129, 0.2)';
                    textColor = '#6ee7b7';
                  } else if (isSelected && letter !== correctLetter) {
                    borderColor = '#ef4444';
                    bgColor = 'rgba(239, 68, 68, 0.2)';
                    textColor = '#fca5a5';
                  }
                }

                return (
                  <div
                    key={letter}
                    onClick={() => !isEliminated && handleSelectOption(letter)}
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: '14px',
                      border: `1.5px solid ${isSelected ? '#6366f1' : borderColor}`,
                      background: bgColor,
                      color: textColor,
                      opacity: isEliminated ? 0.35 : 1,
                      cursor: isFinished ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: isSelected ? '7px solid #6366f1' : '2px solid rgba(255,255,255,0.2)',
                        background: 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {!isSelected && <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8' }}>{letter}</span>}
                      </div>

                      <span style={{ 
                        fontSize: textFontSize, 
                        textDecoration: isEliminated ? 'line-through' : 'none',
                        color: isSelected ? '#fff' : '#cbd5e1'
                      }}>
                        {optText}
                      </span>
                    </div>

                    {/* Strikethrough (Şık Eleme) Butonu */}
                    {!isFinished && (
                      <button
                        type="button"
                        onClick={(e) => handleToggleEliminate(e, letter)}
                        title={isEliminated ? 'Elemeyi Kaldır' : 'Şıkkı Ele'}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: isEliminated ? '#38bdf8' : '#64748b',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: '4px 8px',
                          borderRadius: '6px'
                        }}
                      >
                        {isEliminated ? 'Geri Al' : 'Ele ✕'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Test Tamamlandıysa: Çözüm ve Açıklama Paneli */}
            {isFinished && currentQ.explanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '1.25rem',
                  borderRadius: '14px',
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  marginTop: '0.5rem'
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#a5b4fc', marginBottom: '0.35rem' }}>
                  📖 Adım Adım Soru Çözümü & Açıklama
                </div>
                <div style={{ fontSize: '0.9rem', color: '#e0e7ff', lineHeight: 1.6 }}>
                  {currentQ.explanation}
                </div>
              </motion.div>
            )}

            {/* Navigasyon İleri/Geri Butonları */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
              <button
                onClick={() => {
                  haptics.selection();
                  setCurrentIdx(prev => Math.max(0, prev - 1));
                }}
                disabled={currentIdx === 0}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)',
                  color: currentIdx === 0 ? '#475569' : '#fff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: currentIdx === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <ChevronLeft size={16} /> Önceki Soru
              </button>

              <button
                onClick={() => {
                  haptics.selection();
                  setCurrentIdx(prev => Math.min(testData.questions.length - 1, prev + 1));
                }}
                disabled={currentIdx === testData.questions.length - 1}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)',
                  color: currentIdx === testData.questions.length - 1 ? '#475569' : '#fff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: currentIdx === testData.questions.length - 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                Sonraki Soru <ChevronRight size={16} />
              </button>
            </div>

          </div>
        </main>

        {/* ── Optik Form Drawer (Sağ Panel) ─────────────────────────────────── */}
        <AnimatePresence>
          {showOpticDrawer && (
            <motion.aside
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                width: '280px',
                borderLeft: '1px solid rgba(255,255,255,0.08)',
                background: '#090d18',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                zIndex: 90
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>Optik Form</h4>
                <button
                  onClick={() => setShowOpticDrawer(false)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Optik Durum Legend */}
              <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.72rem', color: '#94a3b8', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }} /> Cevaplandı
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} /> Bayraklı
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} /> Boş
                </span>
              </div>

              {/* Optik Soru Izgarası */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '8px',
                overflowY: 'auto',
                flex: 1,
                paddingRight: '4px'
              }}>
                {testData.questions.map((q, idx) => {
                  const isAnswered = Boolean(answers[idx]);
                  const isFlagged = Boolean(flagged[idx]);
                  const isCurrent = idx === currentIdx;

                  let cellBg = 'rgba(255,255,255,0.04)';
                  let cellColor = '#94a3b8';

                  if (isFinished) {
                    const isCorr = answers[idx] === q.correctOption?.toUpperCase();
                    if (isCorr) {
                      cellBg = '#10b981';
                      cellColor = '#fff';
                    } else if (isAnswered) {
                      cellBg = '#ef4444';
                      cellColor = '#fff';
                    }
                  } else {
                    if (isAnswered) {
                      cellBg = '#6366f1';
                      cellColor = '#fff';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        haptics.selection();
                        setCurrentIdx(idx);
                      }}
                      style={{
                        height: '42px',
                        borderRadius: '8px',
                        border: isCurrent ? '2px solid #38bdf8' : isFlagged ? '1.5px solid #ef4444' : '1px solid rgba(255,255,255,0.06)',
                        background: cellBg,
                        color: cellColor,
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{idx + 1}</span>
                      {answers[idx] && <span style={{ fontSize: '0.65rem', lineHeight: 1 }}>{answers[idx]}</span>}
                      {isFlagged && (
                        <span style={{ position: 'absolute', top: '2px', right: '2px', width: '5px', height: '5px', borderRadius: '50%', background: '#ef4444' }} />
                      )}
                    </button>
                  );
                })}
              </div>

              {!isFinished && (
                <button
                  onClick={() => setIsConfirmModalOpen(true)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Sınavı Tamamla
                </button>
              )}
            </motion.aside>
          )}
        </AnimatePresence>

      </div>

      {/* ── AstraTutor Spoiler-free Hint Modal ────────────────────────────── */}
      <AnimatePresence>
        {showHintModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                width: '100%',
                maxWidth: '460px',
                background: '#0d1322',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '18px',
                padding: '1.5rem',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#fbbf24' }}>
                <Lightbulb size={22} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>AstraTutor Sokratik İpucu</h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#fef3c7', lineHeight: 1.6, background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                {currentQ.hint || 'Soru kökündeki temel formülü hatırla ve verilen nicelikleri adım adım yerine koyarak sonuca ulaşmayı dene.'}
              </p>
              <button
                onClick={() => setShowHintModal(false)}
                style={{ marginTop: '1rem', width: '100%', padding: '0.65rem', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                Anladım, Çözüme Devam Et
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Sınavı Bitir Onay Modalı ────────────────────────────────────────── */}
      <AnimatePresence>
        {isConfirmModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                width: '100%',
                maxWidth: '440px',
                background: '#0e1526',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '18px',
                padding: '1.75rem',
                textAlign: 'center'
              }}
            >
              <CheckCircle2 size={44} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>Sınavı Tamamlamak İstiyor Musun?</h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 1.25rem 0' }}>
                Toplam <strong>{testData.questions.length}</strong> sorudan <strong>{Object.values(answers).filter(Boolean).length}</strong> tanesini işaretledin. 
                {testData.questions.length - Object.values(answers).filter(Boolean).length > 0 && (
                  <span style={{ color: '#f59e0b', display: 'block', marginTop: '4px' }}>
                    ⚠️ {testData.questions.length - Object.values(answers).filter(Boolean).length} boş soru bulunuyor.
                  </span>
                )}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  onClick={() => setIsConfirmModalOpen(false)}
                  style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#cbd5e1', fontWeight: 700, cursor: 'pointer' }}
                >
                  Testi İncelemeye Dön
                </button>
                <button
                  onClick={handleFinishTest}
                  disabled={submitting}
                  style={{ padding: '0.75rem', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                >
                  {submitting ? 'Kaydediliyor...' : 'Evet, Bitir'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Test Tamamlandı Sınav Karnesi Modalı ────────────────────────────── */}
      <AnimatePresence>
        {isFinished && results && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              style={{
                width: '100%',
                maxWidth: '540px',
                background: '#0e1526',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '22px',
                padding: '2rem',
                textAlign: 'center',
                boxShadow: '0 25px 70px rgba(0,0,0,0.8)'
              }}
            >
              <Award size={52} color="#10b981" style={{ margin: '0 auto 0.75rem auto' }} />
              <h2 style={{ margin: '0 0 0.35rem 0', fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>Sınav Karnesi & Başarı Özeti</h2>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 1.5rem 0' }}>{testData.title}</p>

              {/* Net Skor Vitrini */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.65rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.85rem 0.5rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{results.correctCount}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Doğru</div>
                </div>

                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.85rem 0.5rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4444' }}>{results.wrongCount}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Yanlış</div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.85rem 0.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#94a3b8' }}>{results.blankCount}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Boş</div>
                </div>

                <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '0.85rem 0.5rem', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>{results.netScore}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>YKS Neti</div>
                </div>
              </div>

              {/* Ek Başarı Rozeti */}
              <div style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '14px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.75rem', color: '#c7d2fe', fontWeight: 700 }}>Kazanılan Ödüller</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>+{results.xpGained} XP ve Lig Puanı</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#c7d2fe', fontWeight: 700 }}>İsabet Oranı</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>%{results.accuracy}</div>
                </div>
              </div>

              {results.wrongCount > 0 && (
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px', padding: '0.75rem', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#fca5a5' }}>
                  📕 <strong>{results.wrongCount} adet yanlış soru</strong> otomatik olarak <strong>Hata Defterine (Leitner 1. Kutu)</strong> aktarıldı.
                </div>
              )}

              {/* Aksiyon Butonları */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  onClick={() => setIsFinished(false)}
                  style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                >
                  <BarChart2 size={16} /> Soruları İncele
                </button>

                <Link href="/testler" style={{ textDecoration: 'none' }}>
                  <button
                    style={{ width: '100%', padding: '0.8rem', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    Test Merkezine Dön &rarr;
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function TestCozPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#070a12', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', fontSize: '1rem', fontWeight: 600 }}>
        Sınav ortamı yükleniyor...
      </div>
    }>
      <TestCozContent />
    </Suspense>
  );
}
