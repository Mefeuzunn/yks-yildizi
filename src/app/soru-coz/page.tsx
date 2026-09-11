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
          {['#38bdf8', '#a855f7', '#ef4444', '#10b981', '#111827'].map(c => (
            <button 
              key={c} 
              type="button"
              onClick={() => setColor(c)} 
              style={{ 
                width: 22, height: 22, borderRadius: '50%', background: c, 
                border: color === c ? '2px solid #D1D5DB' : '2px solid transparent', 
                cursor: 'pointer', outline: 'none', transition: 'all 0.15s' 
              }} 
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select 
            value={lineWidth} 
            onChange={e => setLineWidth(Number(e.target.value))} 
            style={{ 
              background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border-strong)', 
              borderRadius: 6, padding: '4px 8px', fontSize: '0.75rem', outline: 'none' 
            }}
          >
            <option value={2}>İnce</option>
            <option value={4}>Orta</option>
            <option value={8}>Kalın</option>
          </select>
          <button 
            type="button"
            onClick={clearCanvas} 
            style={{ 
              background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'none', 
              borderRadius: 8, padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, 
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 
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
          background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border-light)', 
          cursor: 'crosshair', width: '100%', height: '420px', display: 'block' 
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
    setSelectedOption(option);
    const correct = option === question.dogruCevap;
    setIsCorrect(correct);
    setIsAnswered(true);

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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem', minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={24} color="var(--accent)" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', marginBottom: '0.25rem', fontWeight: 800 }}>Parametrik YKS Soru Çöz</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Dinamik, formülleri değişen adaptif YKS soru bankası</p>
          </div>
        </div>

        {/* Action controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--border-light)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Star size={16} color="#f59e0b" fill="#f59e0b" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700 }}>{user?.league_points || 0} Puan</span>
          </div>

          <button 
            onClick={() => { setIsSidebarOpen(!isSidebarOpen); setSidebarTab('tutor'); }}
            className="btn-interactive"
            style={{ 
              display: 'flex', alignItems: 'center', gap: 6, 
              background: isSidebarOpen && sidebarTab === 'tutor' ? 'var(--accent)' : 'var(--surface)', 
              color: isSidebarOpen && sidebarTab === 'tutor' ? '#fff' : 'var(--text-primary)', border: '1px solid var(--border-strong)', padding: '0.5rem 1rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600
            }}
          >
            <MessageSquare size={16} color={isSidebarOpen && sidebarTab === 'tutor' ? '#fff' : 'var(--accent)'} /> 
            AstraTutor AI
          </button>

          <button 
            onClick={() => { setIsSidebarOpen(!isSidebarOpen); setSidebarTab('scratchpad'); }}
            className="btn-interactive"
            style={{ 
              display: 'flex', alignItems: 'center', gap: 6, 
              background: isSidebarOpen && sidebarTab === 'scratchpad' ? 'var(--accent)' : 'var(--surface)', 
              color: isSidebarOpen && sidebarTab === 'scratchpad' ? '#fff' : 'var(--text-primary)', border: '1px solid var(--border-strong)', padding: '0.5rem 1rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600
            }}
          >
            <Edit3 size={16} color={isSidebarOpen && sidebarTab === 'scratchpad' ? '#fff' : 'var(--accent)'} /> 
            Karalama Defteri
          </button>
        </div>
      </div>

      {/* Filter Options Bar */}
      <div className="premium-card" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
          <SlidersHorizontal size={16} /> Hızlı Filtrele:
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Subject Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ders:</span>
            <select 
              value={filterSubject}
              onChange={e => setFilterSubject(e.target.value)}
              className="premium-input"
              style={{ width: 'auto', padding: '0.35rem 2rem 0.35rem 0.75rem', fontSize: '0.8rem' }}
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
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Zorluk:</span>
            <select 
              value={filterDifficulty}
              onChange={e => setFilterDifficulty(e.target.value)}
              className="premium-input"
              style={{ width: 'auto', padding: '0.35rem 2rem 0.35rem 0.75rem', fontSize: '0.8rem' }}
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
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: isSidebarOpen ? '1fr 420px' : '1fr', gap: '2rem', transition: 'all 0.3s', alignItems: 'stretch' }}>
        
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
              className="premium-card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              key={question.template_id + JSON.stringify(question.parametreler)}
              style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}
            >
              {/* Question metadata row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)', padding: '2px 8px', borderRadius: 6 }}>
                    {question.subject}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    • {question.topic}
                  </span>
                </div>
                
                {/* Stopwatch indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: isAnswered ? 'var(--text-muted)' : '#38bdf8', fontSize: '0.85rem', fontWeight: 700 }}>
                  <Timer size={16} />
                  <span>{formatTime(timerSeconds)}</span>
                </div>
              </div>

              {/* Question Content */}
              <div style={{ fontSize: '1.2rem', color: '#fff', lineHeight: 1.7, fontWeight: 500, textAlign: 'left', minHeight: '80px' }}>
                {question.icerik}
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                {question.secenekler.map((opt: string, index: number) => {
                  const labels = ['A', 'B', 'C', 'D', 'E'];
                  let bg = 'rgba(255,255,255,0.03)';
                  let border = '1px solid rgba(255,255,255,0.06)';
                  let textColor = '#fff';

                  if (isAnswered) {
                    if (opt === question.dogruCevap) {
                      bg = 'rgba(16, 185, 129, 0.1)';
                      border = '1px solid rgba(16, 185, 129, 0.3)';
                      textColor = '#10b981';
                    } else if (opt === selectedOption) {
                      bg = 'rgba(239, 68, 68, 0.1)';
                      border = '1px solid rgba(239, 68, 68, 0.3)';
                      textColor = '#ef4444';
                    } else {
                      bg = 'rgba(255,255,255,0.01)';
                      textColor = 'var(--text-muted)';
                    }
                  } else if (opt === selectedOption) {
                    bg = 'rgba(139, 92, 246, 0.15)';
                    border = '1px solid rgba(139, 92, 246, 0.4)';
                  }

                  return (
                    <motion.button
                      key={index}
                      whileHover={!isAnswered ? { scale: 1.005, backgroundColor: 'rgba(255,255,255,0.06)' } : {}}
                      whileTap={!isAnswered ? { scale: 0.995 } : {}}
                      onClick={() => handleAnswer(opt)}
                      disabled={isAnswered}
                      style={{ 
                        display: 'flex', alignItems: 'center', padding: '0.9rem 1.25rem',
                        background: bg, border, borderRadius: '12px',
                        color: textColor, cursor: isAnswered ? 'default' : 'pointer',
                        transition: 'all 0.2s', fontSize: '0.95rem', textAlign: 'left', width: '100%'
                      }}
                    >
                      <span style={{ 
                        width: '28px', height: '28px', borderRadius: '8px', 
                        background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginRight: '1rem', fontWeight: 800, fontSize: '0.8rem',
                        color: textColor, flexShrink: 0
                      }}>
                        {labels[index]}
                      </span>
                      <span style={{ flex: 1 }}>{opt}</span>
                      
                      {isAnswered && opt === question.dogruCevap && (
                        <CheckCircle2 size={18} color="#10b981" style={{ marginLeft: 'auto', flexShrink: 0 }} />
                      )}
                      {isAnswered && opt === selectedOption && !isCorrect && (
                        <XCircle size={18} color="#ef4444" style={{ marginLeft: 'auto', flexShrink: 0 }} />
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
                    style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.15)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                      <Lightbulb size={22} color="#38bdf8" style={{ flexShrink: 0, marginTop: 2 }} />
                      <div style={{ textAlign: 'left' }}>
                        <h3 style={{ fontSize: '0.95rem', color: '#38bdf8', marginBottom: '0.35rem', fontWeight: 700 }}>AI Çözüm Açıklaması</h3>
                        <p style={{ color: '#e0f2fe', lineHeight: 1.6, fontSize: '0.875rem', whiteSpace: 'pre-wrap', margin: 0 }}>
                          {question.cozum}
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={fetchQuestion}
                      className="btn-interactive"
                      style={{ 
                        width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700
                      }}
                    >
                      Sıradaki Soruya Geç <ArrowRight size={18} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Right Side: Interactive Sidebar Panel */}
        <AnimatePresence>
          {isSidebarOpen && question && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="premium-card"
              style={{ 
                display: 'flex', flexDirection: 'column', height: '100%', 
                border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', padding: 0
              }}
            >
              {/* Tab Header Selector */}
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <button
                  onClick={() => setSidebarTab('tutor')}
                  style={{
                    flex: 1, padding: '1rem', border: 'none', background: sidebarTab === 'tutor' ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
                    color: sidebarTab === 'tutor' ? '#c084fc' : 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700,
                    cursor: 'pointer', borderBottom: sidebarTab === 'tutor' ? '2px solid #a855f7' : '2px solid transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s'
                  }}
                >
                  <Sparkles size={14} /> Sokratik AI Tutor
                </button>
                <button
                  onClick={() => setSidebarTab('scratchpad')}
                  style={{
                    flex: 1, padding: '1rem', border: 'none', background: sidebarTab === 'scratchpad' ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                    color: sidebarTab === 'scratchpad' ? '#38bdf8' : 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700,
                    cursor: 'pointer', borderBottom: sidebarTab === 'scratchpad' ? '2px solid #38bdf8' : '2px solid transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s'
                  }}
                >
                  <Edit3 size={14} /> Karalama Defteri
                </button>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  style={{ padding: '0.75rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tab Contents */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
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
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
      
      {/* Badge Unlock Notification */}
      <AnimatePresence>
        {unlockedBadges.length > 0 && (
          <div style={{ position: 'fixed', top: '85px', right: '20px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {unlockedBadges.map((badge, idx) => (
              <motion.div
                key={idx}
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
