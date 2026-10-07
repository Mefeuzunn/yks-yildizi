"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, CheckCircle2, XCircle, ArrowRight, Lightbulb, 
  RefreshCw, Star, MessageSquare, Timer, Edit3, Trash2, 
  ChevronRight, Sparkles, SlidersHorizontal, Check, X
} from 'lucide-react';
import AstraTutorChat from '@/components/AstraTutorChat';
import { useAuth } from '@/context/AuthContext';
import { BADGES } from '@/lib/badges';
import { haptics } from '@/lib/haptics';

// --- Scratchpad Sub-component ---
function Scratchpad() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#38bdf8');
  const [lineWidth, setLineWidth] = useState(4);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to match container width
    canvas.width = canvas.parentElement?.clientWidth || 360;
    canvas.height = 420;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.strokeStyle = color;
  }, [color]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.lineWidth = lineWidth;
  }, [lineWidth]);

  const getCoordinates = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Check for touch event
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    
    // Default to mouse event
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Prevent scrolling on touch screens
    if (e.cancelable) e.preventDefault();

    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['#38bdf8', '#a855f7', '#ef4444', '#10b981', '#f1f5f9'].map(c => (
            <button 
              key={c} 
              type="button"
              onClick={() => setColor(c)} 
              className="active:scale-95"
              style={{ 
                width: 30, height: 30, borderRadius: '50%', background: c, 
                border: color === c ? '2.5px solid #ffffff' : '2px solid rgba(255,255,255,0.15)', 
                boxShadow: color === c ? `0 0 10px ${c}88` : 'none',
                cursor: 'pointer', outline: 'none', transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)' 
              }} 
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select 
            value={lineWidth} 
            onChange={e => setLineWidth(Number(e.target.value))} 
            style={{ 
              background: 'rgba(15, 21, 35, 0.85)', color: '#f1f5f9', border: '1px solid rgba(255, 255, 255, 0.1)', 
              borderRadius: 8, padding: '5px 10px', fontSize: '0.8rem', outline: 'none' 
            }}
          >
            <option value={2}>İnce</option>
            <option value={4}>Orta</option>
            <option value={8}>Kalın</option>
          </select>
          <button 
            type="button"
            onClick={clearCanvas} 
            className="active:scale-95"
            style={{ 
              background: 'rgba(239, 68, 68, 0.14)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', 
              borderRadius: 8, padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700, 
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
              transition: 'all 0.15s'
            }}
          >
            <Trash2 size={12} />
            Temizle
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        style={{ 
          background: 'rgba(8, 12, 20, 0.95)', borderRadius: 16, border: '1px solid rgba(255, 255, 255, 0.08)', 
          cursor: 'crosshair', width: '100%', height: '420px', display: 'block',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
        }}
      />
    </div>
  );
}

// --- Main Page Component ---
export default function SoruCozPage() {
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // Side Panel States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'tutor' | 'scratchpad'>('tutor');

  // Gamification States
  const [xpAnimation, setXpAnimation] = useState(false);
  const [unlockedBadges, setUnlockedBadges] = useState<any[]>([]);

  // Filters
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  // Timer
  const [timerSeconds, setTimerSeconds] = useState(0);

  const { user, checkAuth } = useAuth();

  const fetchQuestion = async () => {
    setLoading(true);
    setIsAnswered(false);
    setSelectedOption(null);
    setIsCorrect(false);
    setTimerSeconds(0);

    try {
      const res = await fetch(`/api/questions/generate?subject=${filterSubject}&zorluk=${filterDifficulty}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuestion(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, [filterSubject, filterDifficulty]);

  // Countup Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (!loading && !isAnswered && question) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading, isAnswered, question]);

  const handleAnswer = async (option: string) => {
    if (isAnswered) return;
    haptics.impact('light');
    setSelectedOption(option);
    const correct = option === question.dogruCevap;
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      haptics.notification('success');
    } else {
      haptics.notification('error');
    }

    if (correct && user) {
      setXpAnimation(true);
      setTimeout(() => setXpAnimation(false), 2000);

      try {
        const res = await fetch('/api/user/xp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add_xp', amount: 10 })
        });
        if (res.ok) {
          const data = await res.json();
          checkAuth();
          
          if (data.newBadges && data.newBadges.length > 0) {
            const earnedBadges = data.newBadges.map((id: string) => BADGES.find(b => b.id === id)).filter(Boolean);
            setUnlockedBadges(earnedBadges);
            setTimeout(() => setUnlockedBadges([]), 5000);
          }
        }
      } catch (e) {
        console.error('XP Eklenemedi:', e);
      }
    } else if (!correct) {
      try {
        await fetch('/api/user/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: question.subject || 'Matematik',
            topic: question.topic || 'Genel',
            icerik: question.icerik,
            secenekler_json: JSON.stringify(question.secenekler),
            dogru_cevap: question.dogruCevap,
            secilen_cevap: option,
            cozum: question.cozum || ''
          })
        });
      } catch (err) {
        console.error('Hata defterine kaydedilemedi:', err);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '1.5rem 1rem calc(85px + env(safe-area-inset-bottom, 20px)) 1rem',
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.15))',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)',
            }}
          >
            <Brain size={24} color="#818cf8" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '0.25rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
              Parametrik YKS Soru Çöz
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
              Dinamik, formülleri değişen adaptif YKS soru bankası
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(15, 21, 35, 0.8)',
              padding: '0.5rem 0.95rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              minHeight: '40px',
            }}
          >
            <Star size={16} color="#f59e0b" fill="#f59e0b" />
            <span style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
              {user?.league_points || 0} Puan
            </span>
          </div>

          <button 
            onClick={() => { 
              haptics.selection();
              setIsSidebarOpen(!isSidebarOpen); 
              setSidebarTab('tutor'); 
            }}
            className="active:scale-[0.97]"
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 6, 
              background: isSidebarOpen && sidebarTab === 'tutor'
                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(139, 92, 246, 0.2))'
                : 'rgba(15, 21, 35, 0.8)', 
              color: isSidebarOpen && sidebarTab === 'tutor' ? '#c4b5fd' : '#94a3b8',
              border: isSidebarOpen && sidebarTab === 'tutor'
                ? '1px solid rgba(99, 102, 241, 0.45)'
                : '1px solid rgba(255, 255, 255, 0.08)',
              padding: '0.5rem 0.95rem',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 700,
              minHeight: '40px',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: isSidebarOpen && sidebarTab === 'tutor' ? '0 2px 10px rgba(99, 102, 241, 0.25)' : 'none',
            }}
          >
            <MessageSquare size={16} color={isSidebarOpen && sidebarTab === 'tutor' ? '#c4b5fd' : '#818cf8'} /> 
            AstraTutor AI
          </button>

          <button 
            onClick={() => { 
              haptics.selection();
              setIsSidebarOpen(!isSidebarOpen); 
              setSidebarTab('scratchpad'); 
            }}
            className="active:scale-[0.97]"
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 6, 
              background: isSidebarOpen && sidebarTab === 'scratchpad'
                ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(6, 182, 212, 0.2))'
                : 'rgba(15, 21, 35, 0.8)', 
              color: isSidebarOpen && sidebarTab === 'scratchpad' ? '#7dd3fc' : '#94a3b8',
              border: isSidebarOpen && sidebarTab === 'scratchpad'
                ? '1px solid rgba(56, 189, 248, 0.45)'
                : '1px solid rgba(255, 255, 255, 0.08)',
              padding: '0.5rem 0.95rem',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 700,
              minHeight: '40px',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: isSidebarOpen && sidebarTab === 'scratchpad' ? '0 2px 10px rgba(56, 189, 248, 0.25)' : 'none',
            }}
          >
            <Edit3 size={16} color={isSidebarOpen && sidebarTab === 'scratchpad' ? '#7dd3fc' : '#38bdf8'} /> 
            Karalama Defteri
          </button>
        </div>
      </div>

      {/* Filter Options Bar */}
      <div
        style={{
          padding: '0.85rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.85rem',
          backgroundColor: 'rgba(15, 21, 35, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 700 }}>
          <SlidersHorizontal size={16} color="#818cf8" /> Hızlı Filtrele:
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Subject Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Ders:</span>
            <select 
              value={filterSubject}
              onChange={e => setFilterSubject(e.target.value)}
              style={{
                width: 'auto',
                padding: '0.4rem 1.8rem 0.4rem 0.75rem',
                fontSize: '14px',
                backgroundColor: 'rgba(8, 12, 20, 0.85)',
                color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">Tüm Dersler</option>
              <option value="Matematik">Matematik</option>
              <option value="Fizik">Fizik</option>
              <option value="Kimya">Kimya</option>
              <option value="Türkçe">Türkçe</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Zorluk:</span>
            <select 
              value={filterDifficulty}
              onChange={e => setFilterDifficulty(e.target.value)}
              style={{
                width: 'auto',
                padding: '0.4rem 1.8rem 0.4rem 0.75rem',
                fontSize: '14px',
                backgroundColor: 'rgba(8, 12, 20, 0.85)',
                color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">Tüm Seviyeler</option>
              <option value="2">Kolay</option>
              <option value="3">Orta</option>
              <option value="4">Zor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Workspace grid */}
      <div className="soru-workspace-grid" style={{ flex: 1, display: 'grid', gridTemplateColumns: isSidebarOpen ? '1fr 420px' : '1fr', gap: '1.5rem', transition: 'all 0.3s', alignItems: 'stretch' }}>
        
        {/* Left Side: Question Display */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '1rem', color: '#8b5cf6', padding: '6rem' }}>
              <RefreshCw size={36} className="spin" />
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>Eşsiz YKS Sorusu Üretiliyor...</span>
            </div>
          ) : !question ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '1rem', padding: '4rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 16, border: '1px solid rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              <XCircle size={32} />
              <span>Aradığınız filtrelere uygun soru şablonu bulunamadı. Lütfen filtreyi değiştirin!</span>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              key={question.template_id + JSON.stringify(question.parametreler)}
              style={{
                backgroundColor: 'rgba(15, 21, 35, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '22px',
                padding: 'clamp(1.25rem, 3vw, 2.25rem)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                flex: 1,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(16px)',
              }}
            >
              {/* Question metadata row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      color: question.subject === 'Matematik' ? '#60a5fa' : question.subject === 'Fizik' ? '#c084fc' : question.subject === 'Kimya' ? '#38bdf8' : '#fbbf24',
                      background: question.subject === 'Matematik' ? 'rgba(59, 130, 246, 0.15)' : question.subject === 'Fizik' ? 'rgba(139, 92, 246, 0.15)' : question.subject === 'Kimya' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      border: `1px solid ${question.subject === 'Matematik' ? 'rgba(59, 130, 246, 0.3)' : question.subject === 'Fizik' ? 'rgba(139, 92, 246, 0.3)' : question.subject === 'Kimya' ? 'rgba(6, 182, 212, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                      padding: '3px 10px',
                      borderRadius: '8px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {question.subject}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>
                    • {question.topic}
                  </span>
                </div>
                
                {/* Stopwatch indicator */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: isAnswered ? '#64748b' : '#38bdf8',
                    backgroundColor: 'rgba(8, 12, 20, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    padding: '4px 12px',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  <Timer size={15} />
                  <span>{formatTime(timerSeconds)}</span>
                </div>
              </div>

              {/* Question Content */}
              <div
                style={{
                  fontSize: 'clamp(1.05rem, 2vw, 1.22rem)',
                  color: '#ffffff',
                  lineHeight: 1.75,
                  fontWeight: 500,
                  textAlign: 'left',
                  minHeight: '80px',
                  letterSpacing: '-0.01em',
                }}
              >
                {question.icerik}
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                {question.secenekler.map((opt: string, index: number) => {
                  const labels = ['A', 'B', 'C', 'D', 'E'];
                  let bg = 'rgba(22, 32, 53, 0.45)';
                  let border = '1px solid rgba(255, 255, 255, 0.07)';
                  let textColor = '#f1f5f9';
                  let pillBg = 'rgba(255, 255, 255, 0.06)';
                  let pillBorder = '1px solid rgba(255, 255, 255, 0.1)';
                  let pillColor = '#94a3b8';

                  if (isAnswered) {
                    if (opt === question.dogruCevap) {
                      bg = 'rgba(16, 185, 129, 0.14)';
                      border = '1px solid rgba(16, 185, 129, 0.45)';
                      textColor = '#34d399';
                      pillBg = '#10b981';
                      pillBorder = '1px solid #10b981';
                      pillColor = '#ffffff';
                    } else if (opt === selectedOption) {
                      bg = 'rgba(239, 68, 68, 0.14)';
                      border = '1px solid rgba(239, 68, 68, 0.45)';
                      textColor = '#f87171';
                      pillBg = '#ef4444';
                      pillBorder = '1px solid #ef4444';
                      pillColor = '#ffffff';
                    } else {
                      bg = 'rgba(255, 255, 255, 0.02)';
                      border = '1px solid rgba(255, 255, 255, 0.04)';
                      textColor = '#64748b';
                      pillColor = '#64748b';
                    }
                  } else if (opt === selectedOption) {
                    bg = 'rgba(99, 102, 241, 0.18)';
                    border = '1px solid rgba(99, 102, 241, 0.45)';
                    pillBg = '#6366f1';
                    pillBorder = '1px solid #6366f1';
                    pillColor = '#ffffff';
                  }

                  return (
                    <motion.button
                      key={index}
                      whileHover={!isAnswered ? { scale: 1.006, backgroundColor: 'rgba(22, 32, 53, 0.7)' } : {}}
                      whileTap={!isAnswered ? { scale: 0.992 } : {}}
                      onClick={() => handleAnswer(opt)}
                      disabled={isAnswered}
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        padding: '1rem 1.25rem',
                        background: bg,
                        border,
                        borderRadius: '14px',
                        color: textColor,
                        cursor: isAnswered ? 'default' : 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        fontSize: '0.98rem',
                        textAlign: 'left',
                        width: '100%',
                        boxShadow: isAnswered && opt === question.dogruCevap ? '0 0 20px rgba(16, 185, 129, 0.2)' : 'none',
                      }}
                    >
                      <span
                        style={{ 
                          width: '32px',
                          height: '32px',
                          borderRadius: '9px', 
                          background: pillBg,
                          border: pillBorder,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '1rem',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          color: pillColor,
                          flexShrink: 0,
                          transition: 'all 0.2s',
                        }}
                      >
                        {labels[index]}
                      </span>
                      <span style={{ flex: 1, lineHeight: 1.5 }}>{opt}</span>
                      
                      {isAnswered && opt === question.dogruCevap && (
                        <CheckCircle2 size={20} color="#10b981" style={{ marginLeft: 'auto', flexShrink: 0 }} />
                      )}
                      {isAnswered && opt === selectedOption && !isCorrect && (
                        <XCircle size={20} color="#ef4444" style={{ marginLeft: 'auto', flexShrink: 0 }} />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Socratic Detailed Solution and Next button */}
              <AnimatePresence>
                {isAnswered && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '1rem',
                        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, rgba(15, 21, 35, 0.85) 100%)',
                        border: '1px solid rgba(56, 189, 248, 0.22)',
                        padding: '1.35rem',
                        borderRadius: '16px',
                        marginBottom: '1.5rem',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      <Lightbulb size={24} color="#38bdf8" style={{ flexShrink: 0, marginTop: 2 }} />
                      <div style={{ textAlign: 'left' }}>
                        <h3 style={{ fontSize: '0.98rem', color: '#38bdf8', marginBottom: '0.35rem', fontWeight: 800 }}>
                          AI Çözüm Açıklaması
                        </h3>
                        <p style={{ color: '#e0f2fe', lineHeight: 1.65, fontSize: '0.9rem', whiteSpace: 'pre-wrap', margin: 0 }}>
                          {question.cozum}
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={fetchQuestion}
                      className="active:scale-[0.98]"
                      style={{ 
                        width: '100%',
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        fontSize: '1rem',
                        fontWeight: 800,
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '14px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 18px rgba(99, 102, 241, 0.35)',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    >
                      <span>Sıradaki Soruya Geç</span>
                      <ArrowRight size={18} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Right Side: Interactive Sidebar Panel (Desktop Side, Mobile Bottom-Sheet) */}
        <AnimatePresence>
          {isSidebarOpen && question && (
            <>
              {/* Mobile Backdrop */}
              <div 
                className="mobile-only soru-sidebar-mobile-backdrop"
                onClick={() => setIsSidebarOpen(false)}
              />

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className="soru-sidebar-mobile-drawer"
                style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%', 
                  backgroundColor: 'rgba(15, 21, 35, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
                  backdropFilter: 'blur(20px)',
                  overflow: 'hidden',
                  padding: 0
                }}
              >
                {/* Drag Handle for mobile */}
                <div className="mobile-only modal-drag-handle" style={{ width: 44, height: 4, background: 'rgba(255,255,255,0.25)', borderRadius: 2, margin: '10px auto 6px' }} />

                {/* Tab Header Selector */}
                <div style={{ display: 'flex', background: 'rgba(8, 12, 20, 0.6)', borderBottom: '1px solid rgba(255,255,255,0.08)', alignItems: 'center' }}>
                  <button
                    onClick={() => { haptics.selection(); setSidebarTab('tutor'); }}
                    style={{
                      flex: 1, padding: '0.85rem', border: 'none', background: sidebarTab === 'tutor' ? 'rgba(168, 85, 247, 0.12)' : 'transparent',
                      color: sidebarTab === 'tutor' ? '#c084fc' : '#94a3b8', fontSize: '0.85rem', fontWeight: 800,
                      cursor: 'pointer', borderBottom: sidebarTab === 'tutor' ? '2px solid #a855f7' : '2px solid transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s'
                    }}
                  >
                    <Sparkles size={14} /> Sokratik AI Tutor
                  </button>
                  <button
                    onClick={() => { haptics.selection(); setSidebarTab('scratchpad'); }}
                    style={{
                      flex: 1, padding: '0.85rem', border: 'none', background: sidebarTab === 'scratchpad' ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                      color: sidebarTab === 'scratchpad' ? '#38bdf8' : '#94a3b8', fontSize: '0.85rem', fontWeight: 800,
                      cursor: 'pointer', borderBottom: sidebarTab === 'scratchpad' ? '2px solid #38bdf8' : '2px solid transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s'
                    }}
                  >
                    <Edit3 size={14} /> Karalama Defteri
                  </button>
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    style={{ padding: '0.75rem 1rem', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Tab Contents */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
                  {sidebarTab === 'tutor' ? (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <AstraTutorChat 
                        questionContext={question} 
                        onClose={() => setIsSidebarOpen(false)} 
                      />
                    </div>
                  ) : (
                    <Scratchpad />
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .soru-workspace-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          .soru-sidebar-mobile-drawer {
            position: fixed !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            height: 85vh !important;
            max-height: 85vh !important;
            padding-bottom: calc(16px + env(safe-area-inset-bottom, 20px)) !important;
            border-top-left-radius: 24px !important;
            border-top-right-radius: 24px !important;
            border-bottom-left-radius: 0 !important;
            border-bottom-right-radius: 0 !important;
            z-index: 100 !important;
            box-shadow: 0 -10px 40px rgba(0,0,0,0.7) !important;
          }
          .soru-sidebar-mobile-backdrop {
            position: fixed !important;
            inset: 0 !important;
            background: rgba(0,0,0,0.6) !important;
            z-index: 99 !important;
            backdrop-filter: blur(4px) !important;
          }
          .soru-badge-toast-container {
            right: 12px !important;
            left: 12px !important;
            top: calc(65px + env(safe-area-inset-top, 0px)) !important;
          }
          .soru-badge-toast-card {
            min-width: unset !important;
            width: 100% !important;
          }
        }
      `}</style>
      
      {/* Badge Unlock Notification */}
      <AnimatePresence>
        {unlockedBadges.length > 0 && (
          <div className="soru-badge-toast-container" style={{ position: 'fixed', top: '85px', right: '20px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {unlockedBadges.map((badge, idx) => (
              <motion.div
                key={idx}
                className="soru-badge-toast-card"
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, x: 50 }}
                style={{ 
                  background: badge.colorClass || 'linear-gradient(135deg, #f59e0b, #ea580c)',
                  border: `1px solid ${badge.borderColor || '#f59e0b'}`,
                  padding: '1rem 1.5rem', borderRadius: '14px', color: '#fff',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)', minWidth: '320px'
                }}
              >
                <div style={{ fontSize: '2.5rem' }}>{badge.icon}</div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.8)' }}>
                    Yeni Rozet Kazandın!
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.25rem 0' }}>{badge.title}</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{badge.description}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
