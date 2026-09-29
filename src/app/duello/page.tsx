"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Swords, Trophy, Loader2, CheckCircle2, XCircle, Clock, 
  Activity, Volume2, VolumeX, Sparkles, Flame 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { haptics } from '@/lib/haptics';

type DuelState = 'idle' | 'waiting' | 'starting' | 'active' | 'finished';

// ─── Web Audio Synthesizer for E-Sports SFX (0 cost, instant latency) ───────
class ArenaAudioEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.muted = localStorage.getItem('arena_sound_muted') === 'true';
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public isMuted() { return this.muted; }
  public setMuted(m: boolean) {
    this.muted = m;
    if (typeof window !== 'undefined') {
      localStorage.setItem('arena_sound_muted', m ? 'true' : 'false');
    }
  }

  public playTick(isLast = false) {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      const now = this.ctx.currentTime;
      osc.type = isLast ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(isLast ? 880 : 520, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isLast ? 0.25 : 0.08));

      osc.start(now);
      osc.stop(now + (isLast ? 0.26 : 0.09));
    } catch (_) {}
  }

  public playMatchFound() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        const now = this.ctx!.currentTime + (i * 0.07);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
        osc.start(now);
        osc.stop(now + 0.33);
      });
    } catch (_) {}
  }

  public playCorrect() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        const now = this.ctx!.currentTime + (i * 0.06);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.3);
      });
    } catch (_) {}
  }

  public playWrong() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      const now = this.ctx.currentTime;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(65, now + 0.25);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (_) {}
  }

  public playVictory() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        const now = this.ctx!.currentTime + (i * 0.09);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.48);
      });
    } catch (_) {}
  }

  public playDefeat() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const notes = [440, 415.3, 392, 349.23];
      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        const now = this.ctx!.currentTime + (i * 0.12);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        osc.start(now);
        osc.stop(now + 0.4);
      });
    } catch (_) {}
  }
}

const arenaAudio = new ArenaAudioEngine();

export default function DuelloPage() {
  const { user, checkAuth } = useAuth();
  
  const [phase, setPhase] = useState<DuelState>('idle');
  const [duelId, setDuelId] = useState<string | null>(null);
  
  const [participants, setParticipants] = useState<any[]>([]);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [question, setQuestion] = useState<any>(null);
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [roundEndTime, setRoundEndTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [startCountdown, setStartCountdown] = useState<number>(3);
  
  const [selectedSubject, setSelectedSubject] = useState<string>('Karisik');
  const [isMuted, setIsMuted] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isGlow, setIsGlow] = useState(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevCountdownRef = useRef<number>(3);
  const prevPhaseRef = useRef<DuelState>('idle');

  useEffect(() => {
    setIsMuted(arenaAudio.isMuted());
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    arenaAudio.setMuted(next);
  };

  // SFX on phase transition
  useEffect(() => {
    if (prevPhaseRef.current === 'waiting' && phase === 'starting') {
      arenaAudio.playMatchFound();
    }
    prevPhaseRef.current = phase;
  }, [phase]);

  // SFX on countdown tick
  useEffect(() => {
    if (phase === 'starting' && startCountdown !== prevCountdownRef.current) {
      if (startCountdown > 0) {
        arenaAudio.playTick(startCountdown === 1);
      } else if (startCountdown === 0) {
        arenaAudio.playTick(true);
      }
      prevCountdownRef.current = startCountdown;
    }
  }, [startCountdown, phase]);

  // Timer update
  useEffect(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    timerIntervalRef.current = setInterval(() => {
      if (roundEndTime) {
        const diff = roundEndTime.getTime() - Date.now();
        if (phase === 'starting') {
           setStartCountdown(Math.ceil(diff / 1000));
        } else if (phase === 'active') {
           let ms = diff - 2000;
           if (ms > 15000) ms = 15000;
           if (ms < 0) ms = 0;
           setTimeLeft(ms);
        }
      }
    }, 100);
  }, [roundEndTime, phase]);

  const startMatchmaking = async () => {
    setPhase('waiting');
    try {
      const res = await fetch('/api/arena/matchmake', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setDuelId(data.duelId);
        pollIntervalRef.current = setInterval(() => pollStatus(data.duelId), 1000);
      } else {
        setPhase('idle');
      }
    } catch (e) {
      console.error(e);
      setPhase('idle');
    }
  };

  const checkAchievements = async () => {
    try {
      await fetch('/api/achievements/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: 'duel_win' })
      });
    } catch (e) {
      console.error('Achievement check failed', e);
    }
  };

  const pollStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/arena/state?duelId=${id}`);
      if (res.ok) {
        const data = await res.json();
        
        setParticipants(data.participants || []);
        
        if (data.status) setPhase(data.status);
        if (data.round_end_time) setRoundEndTime(new Date(data.round_end_time));
        
        if (data.current_round && data.current_round !== currentRound) {
           setCurrentRound(data.current_round);
           setSelectedOption(null);
           setIsAnswerCorrect(null);
        }
        
        if (data.question) {
           setQuestion(data.question);
        }

        if (data.status === 'finished') {
          setWinnerId(data.winner_id);
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          checkAuth();
          
          if (data.winner_id === user?.id) {
            arenaAudio.playVictory();
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.6 },
              colors: ['#f59e0b', '#10b981', '#3b82f6']
            });
            checkAchievements();
          } else if (data.winner_id === 'draw') {
            arenaAudio.playMatchFound();
          } else {
            arenaAudio.playDefeat();
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAnswer = async (opt: string) => {
    if (selectedOption || phase !== 'active' || !duelId) return;
    haptics.selection();
    setSelectedOption(opt);
    
    try {
      const res = await fetch('/api/arena/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duelId, selectedOption: opt, round: currentRound })
      });
      const data = await res.json();
      if (res.ok) {
         setIsAnswerCorrect(data.isCorrect);
         if (data.isCorrect) {
           arenaAudio.playCorrect();
           setIsGlow(true);
           setTimeout(() => setIsGlow(false), 700);
           haptics.notification('success');
         } else {
           arenaAudio.playWrong();
           setIsShaking(true);
           setTimeout(() => setIsShaking(false), 500);
           haptics.notification('warning');
         }
         pollStatus(duelId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: '#fff' }}>Lütfen önce giriş yapın.</div>;
  }

  const me = participants.find(p => p.user_id === user.id);
  const opponent = participants.find(p => p.user_id !== user.id);

  const timeProgress = (timeLeft / 15000) * 100;
  const progressColor = timeProgress > 50 ? '#10b981' : timeProgress > 20 ? '#f59e0b' : '#ef4444';

  const subjects = ['Karisik', 'Matematik', 'Fen', 'Tarih', 'Turkce'];

  return (
    <div className="duel-container" style={{ background: '#080c14', minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', color: '#fff', padding: '2rem' }}>
      
      {/* Top Header Row with Sound Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1000px', margin: '0 auto 1.5rem auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(185,28,28,0.1))', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Swords size={20} color="#ef4444" />
          </div>
          <div>
            <span style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '0.05em', color: '#fff' }}>BİLGİ ARENASI</span>
            <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8' }}>1v1 Canlı Sınav Düellosu</span>
          </div>
        </div>

        <button
          onClick={toggleSound}
          title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          style={{
            background: isMuted ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.06)',
            border: isMuted ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.12)',
            color: isMuted ? '#f87171' : '#94a3b8',
            padding: '8px 14px',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 600,
            transition: 'all 0.2s ease'
          }}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          <span>{isMuted ? 'Ses Kapalı' : 'Ses Açık'}</span>
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
        <AnimatePresence mode="wait">
          
          {phase === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} style={{ textAlign: 'center', width: '100%' }}>
              
              <motion.div 
                animate={{ scale: [1, 1.08, 1], rotate: [0, 4, -4, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ display: 'inline-block', marginBottom: '1.25rem', filter: 'drop-shadow(0 0 25px rgba(239, 68, 68, 0.45))' }}
              >
                <div style={{ width: '96px', height: '96px', borderRadius: '28px', background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(185,28,28,0.08))', border: '1px solid rgba(239,68,68,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '3.5rem' }}>
                  ⚔️
                </div>
              </motion.div>
              
              <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: 900, letterSpacing: '-0.03em', background: 'linear-gradient(135deg, #ffffff 40%, #ef4444 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.75rem' }}>
                Bilgi Arenası
              </h1>
              <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: '#94a3b8', marginBottom: '2.5rem', maxWidth: '520px', margin: '0 auto 2.5rem auto', lineHeight: 1.5 }}>
                YKS rakiplerinle birebir eşleş, soru soru yarış ve lig puanlarını katla!
              </p>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '1.5rem', width: '100%', maxWidth: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', backdropFilter: 'blur(12px)' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(56,189,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={24} color="#38bdf8" />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f1f5f9' }}>15 Saniye/Soru</div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Hızlı karar ver</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '1.5rem', width: '100%', maxWidth: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', backdropFilter: 'blur(12px)' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Activity size={24} color="#f59e0b" />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f1f5f9' }}>10 Tur</div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>En yüksek puan kazanır</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '1.5rem', width: '100%', maxWidth: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', boxShadow: '0 0 30px rgba(16, 185, 129, 0.08)', backdropFilter: 'blur(12px)' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trophy size={24} color="#10b981" />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f1f5f9' }}>+50 XP & Lig Puanı</div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Liderlikte yüksel</span>
                </div>
              </div>

              {/* Subject selector */}
              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                {subjects.map(sub => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubject(sub)}
                    style={{
                      background: selectedSubject === sub ? 'linear-gradient(135deg, rgba(239,68,68,0.25), rgba(185,28,28,0.15))' : 'rgba(255,255,255,0.03)',
                      border: selectedSubject === sub ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.08)',
                      color: selectedSubject === sub ? '#fca5a5' : '#94a3b8',
                      padding: '0.6rem 1.4rem',
                      borderRadius: '999px',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: selectedSubject === sub ? '0 0 15px rgba(239,68,68,0.2)' : 'none'
                    }}
                  >
                    {sub}
                  </button>
                ))}
              </div>

              <motion.button 
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                onClick={startMatchmaking}
                style={{ 
                  background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '999px', 
                  padding: '1.25rem 3.5rem', 
                  fontSize: '1.35rem', 
                  fontWeight: 900, 
                  cursor: 'pointer', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '1rem',
                  boxShadow: '0 0 35px rgba(239, 68, 68, 0.45)',
                  letterSpacing: '0.02em'
                }}
              >
                <Swords size={28} /> Rakip Bul ve Başla!
              </motion.button>
            </motion.div>
          )}

          {phase === 'waiting' && (
            <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', width: '240px', height: '240px', margin: '0 auto' }}>
                <div className="radar-circle" style={{ position: 'absolute', inset: 0, border: '2px solid rgba(239, 68, 68, 0.6)', borderRadius: '50%' }}></div>
                <div className="radar-circle" style={{ position: 'absolute', inset: '30px', border: '2px solid rgba(239, 68, 68, 0.4)', borderRadius: '50%', animationDelay: '0.6s' }}></div>
                <div className="radar-circle" style={{ position: 'absolute', inset: '60px', border: '2px solid rgba(239, 68, 68, 0.2)', borderRadius: '50%', animationDelay: '1.2s' }}></div>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Loader2 size={48} color="#ef4444" className="spin" />
                  <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 800, marginTop: '8px', letterSpacing: '0.1em' }}>SCAN</span>
                </div>
              </div>
              <h2 style={{ color: '#fff', marginTop: '2.5rem', fontSize: '1.85rem', fontWeight: 800 }}>Rakip Aranıyor<span className="dots-anim">...</span></h2>
              <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '0.5rem' }}>{selectedSubject} kategorisinde çevrimiçi bir rakip aranıyor.</p>
            </motion.div>
          )}

          {phase === 'starting' && (
            <motion.div key="starting" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.15, opacity: 0 }} style={{ textAlign: 'center', width: '100%' }}>
               <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', padding: '6px 18px', borderRadius: '999px', color: '#fca5a5', fontWeight: 700, fontSize: '0.85rem', marginBottom: '2rem' }}>
                 <Sparkles size={16} /> RAKİP BULUNDU!
               </div>

               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(1.5rem, 5vw, 4rem)', marginBottom: '3.5rem' }}>
                  <div style={{ textAlign: 'center' }}>
                     <div style={{ width: 90, height: 90, borderRadius: '24px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 900, color: '#fff', margin: '0 auto 1rem', boxShadow: '0 10px 30px rgba(59, 130, 246, 0.35)', border: '2px solid rgba(255,255,255,0.2)' }}>
                       {me?.username?.substring(0,2).toUpperCase() || 'S'}
                     </div>
                     <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.25rem' }}>{me?.username || 'Sen'}</div>
                     <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>Meydan Okuyan</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ef4444', textShadow: '0 0 25px rgba(239, 68, 68, 0.6)' }}>VS</div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, letterSpacing: '0.1em' }}>1V1 DÜELLO</span>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                     <div style={{ width: 90, height: 90, borderRadius: '24px', background: 'linear-gradient(135deg, #f59e0b, #b45309)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 900, color: '#fff', margin: '0 auto 1rem', boxShadow: '0 10px 30px rgba(245, 158, 11, 0.35)', border: '2px solid rgba(255,255,255,0.2)' }}>
                       {opponent?.username?.substring(0,2).toUpperCase() || 'R'}
                     </div>
                     <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.25rem' }}>{opponent?.username || 'Rakip'}</div>
                     <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 600 }}>Rakip Oyuncu</span>
                  </div>
               </div>

               <motion.div 
                 key={startCountdown}
                 initial={{ scale: 2, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                 style={{ fontSize: 'clamp(5rem, 15vw, 8rem)', fontWeight: 900, color: '#ef4444', textShadow: '0 0 45px rgba(239, 68, 68, 0.7)', lineHeight: 1 }}
               >
                 {startCountdown > 0 ? startCountdown : 'BAŞLA!'}
               </motion.div>
            </motion.div>
          )}

          {phase === 'active' && (
            <motion.div key="active" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%' }}>
              
              {/* Top Bar */}
              <div className="duel-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1.25rem 2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)' }}>
                
                {/* Player 1 (Me) */}
                <div className="duel-player-me" style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '33%' }}>
                  <div className="duel-avatar" style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem', fontWeight: 800, border: '2px solid rgba(59,130,246,0.5)', boxShadow: '0 0 15px rgba(59,130,246,0.3)' }}>
                    {me?.username?.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <div className="duel-username" style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{me?.username}</div>
                    <div className="duel-score" style={{ color: '#fff', fontWeight: 900, fontSize: '1.6rem', lineHeight: 1 }}>{me?.score || 0}</div>
                  </div>
                </div>

                {/* Center Status & Progress */}
                <div className="duel-center-status" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '33%' }}>
                  <div className="duel-round-pill" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', padding: '0.3rem 1.1rem', borderRadius: '999px', fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem', letterSpacing: '0.08em', whiteSpace: 'nowrap', boxShadow: '0 0 15px rgba(239,68,68,0.35)' }}>
                     Tur {currentRound} / 10
                  </div>
                  <div style={{ width: '100%', height: '7px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${timeProgress}%`, background: progressColor, transition: 'width 0.1s linear, background-color 0.4s', borderRadius: '999px', boxShadow: `0 0 8px ${progressColor}` }} />
                  </div>
                </div>

                {/* Player 2 (Opponent) */}
                <div className="duel-player-opp" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexDirection: 'row-reverse', width: '33%', textAlign: 'right' }}>
                  <div className="duel-avatar" style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #f59e0b, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem', fontWeight: 800, position: 'relative', border: '2px solid rgba(245,158,11,0.5)', boxShadow: '0 0 15px rgba(245,158,11,0.3)' }}>
                    {opponent?.username ? opponent.username.substring(0,2).toUpperCase() : '?'}
                    {opponent?.answeredCurrentRound && (
                       <div style={{ position: 'absolute', top: -5, right: -5, background: '#10b981', borderRadius: '50%', padding: '2px', border: '2px solid #080c14' }}>
                          <CheckCircle2 size={13} color="#fff" strokeWidth={3} />
                       </div>
                    )}
                  </div>
                  <div>
                    <div className="duel-username" style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opponent?.username || 'Rakip'}</div>
                    <div className="duel-score" style={{ color: '#fff', fontWeight: 900, fontSize: '1.6rem', lineHeight: 1 }}>{opponent?.score || 0}</div>
                  </div>
                </div>
              </div>

              {/* Question Area with Screen Shake & Emerald Glow Animations */}
              <motion.div 
                animate={isShaking ? { x: [0, -9, 9, -7, 7, -4, 4, 0] } : isGlow ? { scale: [1, 1.01, 1] } : {}}
                transition={{ duration: 0.4 }}
                className="duel-question-area" 
                style={{ 
                  background: isGlow ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)', 
                  border: isGlow ? '1px solid rgba(16,185,129,0.4)' : isShaking ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.06)', 
                  boxShadow: isGlow ? '0 0 35px rgba(16,185,129,0.25)' : isShaking ? '0 0 35px rgba(239,68,68,0.25)' : 'none',
                  borderRadius: '24px', 
                  padding: '3rem', 
                  minHeight: '400px', 
                  display: 'flex', 
                  flexDirection: 'column',
                  backdropFilter: 'blur(16px)',
                  transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease'
                }}
              >
                {!question ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader2 size={48} className="spin" color="#ef4444" />
                  </div>
                ) : (
                  <>
                    <h3 className="duel-question-text" style={{ fontSize: '1.45rem', color: '#f8fafc', lineHeight: 1.6, marginBottom: '2.5rem', textAlign: 'center', fontWeight: 600 }}>
                      {question.metin}
                    </h3>
                    <div className="duel-options-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: 'auto' }}>
                      {question.secenekler.map((opt: string, idx: number) => {
                        const labels = ['A', 'B', 'C', 'D', 'E'];
                        const isSelected = selectedOption === opt;
                        
                        let bg = 'rgba(255,255,255,0.04)';
                        let border = '1px solid rgba(255,255,255,0.08)';
                        let textColor = '#e2e8f0';

                        if (isSelected) {
                          if (isAnswerCorrect === true) {
                            bg = 'rgba(16, 185, 129, 0.18)';
                            border = '2px solid #10b981';
                            textColor = '#10b981';
                          } else if (isAnswerCorrect === false) {
                            bg = 'rgba(239, 68, 68, 0.18)';
                            border = '2px solid #ef4444';
                            textColor = '#ef4444';
                          } else {
                            bg = 'rgba(59, 130, 246, 0.18)';
                            border = '2px solid #3b82f6';
                            textColor = '#3b82f6';
                          }
                        }

                        if (selectedOption && opt === question.dogruCevap && !isAnswerCorrect) {
                           bg = 'rgba(16, 185, 129, 0.12)';
                           border = '2px dashed #10b981';
                           textColor = '#10b981';
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleAnswer(opt)}
                            disabled={!!selectedOption}
                            className="duel-option-button"
                            style={{
                              padding: '1.25rem', 
                              borderRadius: '16px', 
                              background: bg, 
                              border,
                              color: textColor, 
                              fontSize: '1.05rem', 
                              textAlign: 'left', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '1rem',
                              cursor: selectedOption ? 'default' : 'pointer', 
                              transition: 'all 0.2s ease',
                              gridColumn: idx === 4 ? 'span 2' : 'span 1',
                              fontWeight: 600
                            }}
                            onMouseOver={(e) => { if (!selectedOption) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                            onMouseOut={(e) => { if (!selectedOption) e.currentTarget.style.background = bg; }}
                          >
                            <span className="duel-option-label" style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', flexShrink: 0, border: '1px solid rgba(255,255,255,0.08)' }}>
                              {labels[idx]}
                            </span>
                            <span style={{ flex: 1 }}>{opt}</span>
                            {isSelected && isAnswerCorrect === true && <CheckCircle2 size={24} color="#10b981" style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                            {isSelected && isAnswerCorrect === false && <XCircle size={24} color="#ef4444" style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}

          {phase === 'finished' && (
            <motion.div key="finished" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', width: '100%', maxWidth: '620px' }}>
              <div className="duel-finished-card" style={{ background: 'rgba(255,255,255,0.03)', padding: '3.5rem 3rem', borderRadius: '32px', border: winnerId === user.id ? '2px solid #f59e0b' : winnerId === 'draw' ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)', boxShadow: winnerId === user.id ? '0 0 50px rgba(245, 158, 11, 0.25)' : 'none', backdropFilter: 'blur(20px)' }}>
                {winnerId === user.id ? (
                  <>
                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2.2 }}>
                      <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(217,119,6,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '2px solid #f59e0b', boxShadow: '0 0 30px rgba(245,158,11,0.4)' }}>
                        <Trophy size={48} color="#f59e0b" />
                      </div>
                    </motion.div>
                    <h2 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fff', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>ZAFER!</h2>
                    <p style={{ color: '#10b981', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>+50 XP & Şampiyonlar Ligi Puanı</p>
                  </>
                ) : winnerId === 'draw' ? (
                  <>
                    <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '2px solid #3b82f6' }}>
                      <Swords size={48} color="#3b82f6" />
                    </div>
                    <h2 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fff', marginBottom: '0.4rem' }}>BERABERLİK</h2>
                    <p style={{ color: '#94a3b8', fontSize: '1.15rem', margin: 0 }}>Çok çekişmeli bir mücadele oldu!</p>
                  </>
                ) : (
                  <>
                    <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '2px solid #ef4444' }}>
                      <XCircle size={48} color="#ef4444" />
                    </div>
                    <h2 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fff', marginBottom: '0.4rem' }}>MAĞLUBİYET</h2>
                    <p style={{ color: '#94a3b8', fontSize: '1.15rem', margin: 0 }}>Bir dahaki sefere daha hızlı ol!</p>
                  </>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '2.5rem', background: 'rgba(0,0,0,0.35)', padding: '1.75rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                   <div>
                      <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.4rem', fontWeight: 600 }}>Senin Skorun</div>
                      <div style={{ color: '#fff', fontSize: '2.75rem', fontWeight: 900 }}>{me?.score || 0}</div>
                   </div>
                   <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                   <div>
                      <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.4rem', fontWeight: 600 }}>Rakibin Skoru</div>
                      <div style={{ color: '#fff', fontSize: '2.75rem', fontWeight: 900 }}>{opponent?.score || 0}</div>
                   </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                  <Link href="/dashboard" style={{ flex: 1, textDecoration: 'none' }}>
                    <button 
                      onClick={() => { setPhase('idle'); setDuelId(null); setWinnerId(null); setParticipants([]); setCurrentRound(1); }}
                      style={{ width: '100%', padding: '1.1rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      Ana Sayfa
                    </button>
                  </Link>
                  <button 
                    onClick={() => { setPhase('idle'); setDuelId(null); setWinnerId(null); setParticipants([]); setCurrentRound(1); setTimeout(startMatchmaking, 400); }}
                    style={{ flex: 1, padding: '1.1rem', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 0 25px rgba(239, 68, 68, 0.45)', transition: 'all 0.2s' }}
                  >
                    Tekrar Oyna
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <style jsx>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          :global(.duel-container) {
            padding: 12px 10px calc(80px + env(safe-area-inset-bottom, 20px)) 10px !important;
          }
          :global(.duel-top-bar) {
            padding: 10px 12px !important;
            border-radius: 16px !important;
            margin-bottom: 0.75rem !important;
          }
          :global(.duel-avatar) {
            width: 36px !important;
            height: 36px !important;
            font-size: 1rem !important;
            border-radius: 10px !important;
          }
          :global(.duel-username) {
            font-size: 0.75rem !important;
            max-width: 70px !important;
          }
          :global(.duel-score) {
            font-size: 1.15rem !important;
          }
          :global(.duel-round-pill) {
            font-size: 0.75rem !important;
            padding: 2px 8px !important;
            margin-bottom: 4px !important;
          }
          :global(.duel-player-me), :global(.duel-player-opp) {
            gap: 6px !important;
          }
          :global(.duel-question-area) {
            padding: 16px 12px !important;
            border-radius: 18px !important;
            min-height: auto !important;
          }
          :global(.duel-question-text) {
            font-size: 1.05rem !important;
            margin-bottom: 1.25rem !important;
            line-height: 1.5 !important;
          }
          :global(.duel-options-grid) {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
          :global(.duel-option-button) {
            grid-column: span 1 !important;
            padding: 12px 14px !important;
            font-size: 0.95rem !important;
            border-radius: 14px !important;
            min-height: 48px !important;
          }
          :global(.duel-option-label) {
            width: 30px !important;
            height: 30px !important;
            font-size: 0.9rem !important;
          }
          :global(.duel-finished-card) {
            padding: 24px 16px !important;
            border-radius: 20px !important;
          }
        }
        .radar-circle { animation: radar 2s infinite ease-out; }
        @keyframes radar { 0% { transform: scale(0.5); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }
        .dots-anim { animation: dots 1.5s infinite steps(4, end); display: inline-block; width: 24px; text-align: left; }
        @keyframes dots { 0% { content: ''; } 25% { content: '.'; } 50% { content: '..'; } 75% { content: '...'; } 100% { content: ''; } }
      `}</style>
    </div>
  );
}
