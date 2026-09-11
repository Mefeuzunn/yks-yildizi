"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Search, Trophy, Loader2, CheckCircle2, XCircle, Clock, Zap, Activity } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import confetti from 'canvas-confetti';

type DuelState = 'idle' | 'waiting' | 'starting' | 'active' | 'finished';

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

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Timer update
  useEffect(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    timerIntervalRef.current = setInterval(() => {
      if (roundEndTime) {
        const diff = roundEndTime.getTime() - Date.now();
        if (phase === 'starting') {
           setStartCountdown(Math.ceil(diff / 1000));
        } else if (phase === 'active') {
           // We added 17s total (2s offset + 15s). Max visual is 15s.
           let ms = diff - 2000;
           if (ms > 15000) ms = 15000;
           if (ms < 0) ms = 0;
           setTimeLeft(ms);
        }
      }
    }, 100); // 100ms for smooth progress bar
  }, [roundEndTime, phase]);

  const startMatchmaking = async () => {
    setPhase('waiting');
    try {
      const res = await fetch('/api/arena/matchmake', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setDuelId(data.duelId);
        pollIntervalRef.current = setInterval(() => pollStatus(data.duelId), 1000); // Poll every 1s
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
        
        // Soru değiştiğinde veya yeni tura geçildiğinde
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
          checkAuth(); // refresh XP
          
          if (data.winner_id === user?.id) {
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.6 },
              colors: ['#f59e0b', '#10b981', '#3b82f6']
            });
            checkAchievements();
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAnswer = async (opt: string) => {
    if (selectedOption || phase !== 'active' || !duelId) return;
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
         // Anlık skoru görmek için poll tetikle
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

  // 15 saniye üzerinden yüzde
  const timeProgress = (timeLeft / 15000) * 100;
  const progressColor = timeProgress > 50 ? '#10b981' : timeProgress > 20 ? '#f59e0b' : '#ef4444';

  const subjects = ['Karisik', 'Matematik', 'Fen', 'Tarih', 'Turkce'];

  return (
    <div style={{ background: '#020617', minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', color: '#fff', padding: '2rem' }}>
      
      {phase !== 'idle' && (
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <Swords size={24} color="#ef4444" /> ARENA <Swords size={24} color="#ef4444" />
          </h1>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
        <AnimatePresence mode="wait">
          
          {phase === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} style={{ textAlign: 'center', width: '100%' }}>
              
              <motion.div 
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ display: 'inline-block', marginBottom: '1rem', filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.6))' }}
              >
                <span style={{ fontSize: '5rem' }}>⚔️</span>
              </motion.div>
              
              <h1 style={{ fontSize: '4rem', fontWeight: 900, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
                Bilgi Arennası
              </h1>
              <p style={{ fontSize: '1.25rem', color: '#9ca3af', marginBottom: '3rem' }}>
                Gerçek rakiplerle soru soru yarış!
              </p>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '3rem', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={32} color="#38bdf8" />
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>⏱ 15 Saniye/Soru</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity size={32} color="#f59e0b" />
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>⚔️ 10 Tur</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', boxShadow: '0 0 20px rgba(16, 185, 129, 0.1)' }}>
                  <Trophy size={32} color="#10b981" />
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>🏆 Kazanan XP Kazanır</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {subjects.map(sub => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubject(sub)}
                    style={{
                      background: selectedSubject === sub ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)',
                      border: selectedSubject === sub ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                      color: selectedSubject === sub ? '#ef4444' : '#9ca3af',
                      padding: '0.5rem 1.25rem',
                      borderRadius: '999px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {sub}
                  </button>
                ))}
              </div>

              <button 
                onClick={startMatchmaking}
                style={{ 
                  background: 'linear-gradient(135deg, #ef4444, #b91c1c)', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '999px', 
                  padding: '1.25rem 3rem', 
                  fontSize: '1.5rem', 
                  fontWeight: 900, 
                  cursor: 'pointer', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '1rem',
                  boxShadow: '0 0 30px rgba(239, 68, 68, 0.4)',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Swords size={28} /> Eşleştir!
              </button>
            </motion.div>
          )}

          {phase === 'waiting' && (
            <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', width: '250px', height: '250px', margin: '0 auto' }}>
                <div className="radar-circle" style={{ position: 'absolute', inset: 0, border: '2px solid rgba(239, 68, 68, 0.6)', borderRadius: '50%' }}></div>
                <div className="radar-circle" style={{ position: 'absolute', inset: '30px', border: '2px solid rgba(239, 68, 68, 0.4)', borderRadius: '50%', animationDelay: '0.6s' }}></div>
                <div className="radar-circle" style={{ position: 'absolute', inset: '60px', border: '2px solid rgba(239, 68, 68, 0.2)', borderRadius: '50%', animationDelay: '1.2s' }}></div>
                <Loader2 size={48} color="#ef4444" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} className="spin" />
              </div>
              <h2 style={{ color: '#fff', marginTop: '3rem', fontSize: '2rem', fontWeight: 800 }}>Rakip Aranıyor<span className="dots-anim">...</span></h2>
              <p style={{ color: '#9ca3af', fontSize: '1.1rem', marginTop: '0.5rem' }}>{selectedSubject} kategorisinde canlı bir rakip aranıyor.</p>
            </motion.div>
          )}

          {phase === 'starting' && (
            <motion.div key="starting" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.2, opacity: 0 }} style={{ textAlign: 'center' }}>
               <h2 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '3rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Hazır Ol!</h2>
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3rem', marginBottom: '4rem' }}>
                  <div style={{ textAlign: 'center' }}>
                     <div style={{ width: 100, height: 100, borderRadius: '24px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 900, color: '#fff', margin: '0 auto 1.5rem', boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)' }}>{me?.username?.substring(0,2).toUpperCase() || 'S'}</div>
                     <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.5rem' }}>{me?.username || 'Sen'}</div>
                  </div>
                  <div style={{ fontSize: '3rem', fontWeight: 900, color: '#ef4444', textShadow: '0 0 20px rgba(239, 68, 68, 0.5)' }}>VS</div>
                  <div style={{ textAlign: 'center' }}>
                     <div style={{ width: 100, height: 100, borderRadius: '24px', background: 'linear-gradient(135deg, #f59e0b, #b45309)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 900, color: '#fff', margin: '0 auto 1.5rem', boxShadow: '0 10px 30px rgba(245, 158, 11, 0.3)' }}>{opponent?.username?.substring(0,2).toUpperCase() || 'R'}</div>
                     <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.5rem' }}>{opponent?.username || 'Rakip'}</div>
                  </div>
               </div>
               <motion.div 
                 key={startCountdown}
                 initial={{ scale: 2, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                 style={{ fontSize: '8rem', fontWeight: 900, color: '#ef4444', textShadow: '0 0 40px rgba(239, 68, 68, 0.6)', lineHeight: 1 }}
               >
                 {startCountdown > 0 ? startCountdown : 'BAŞLA!'}
               </motion.div>
            </motion.div>
          )}

          {phase === 'active' && (
            <motion.div key="active" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%' }}>
              
              {/* Top Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1.5rem 2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                
                {/* Player 1 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '33%' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.25rem', fontWeight: 800 }}>
                    {me?.username?.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ color: '#9ca3af', fontWeight: 600, fontSize: '0.9rem' }}>{me?.username}</div>
                    <div style={{ color: '#fff', fontWeight: 900, fontSize: '1.5rem' }}>{me?.score || 0}</div>
                  </div>
                </div>

                {/* Center Status */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '33%' }}>
                  <div style={{ background: '#ef4444', color: '#fff', padding: '0.25rem 1rem', borderRadius: '999px', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>
                     Round {currentRound}/10
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${timeProgress}%`, background: progressColor, transition: 'width 0.1s linear, background-color 0.5s' }} />
                  </div>
                </div>

                {/* Player 2 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexDirection: 'row-reverse', width: '33%', textAlign: 'right' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.25rem', fontWeight: 800, position: 'relative' }}>
                    {opponent?.username ? opponent.username.substring(0,2).toUpperCase() : '?'}
                    {opponent?.answeredCurrentRound && (
                       <div style={{ position: 'absolute', top: -4, right: -4, background: '#10b981', borderRadius: '50%', padding: '2px', border: '2px solid #020617' }}>
                          <CheckCircle2 size={12} color="#fff" strokeWidth={3} />
                       </div>
                    )}
                  </div>
                  <div>
                    <div style={{ color: '#9ca3af', fontWeight: 600, fontSize: '0.9rem' }}>{opponent?.username || 'Rakip'}</div>
                    <div style={{ color: '#fff', fontWeight: 900, fontSize: '1.5rem' }}>{opponent?.score || 0}</div>
                  </div>
                </div>
              </div>

              {/* Question Area */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '3rem', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                {!question ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader2 size={48} className="spin" color="#ef4444" />
                  </div>
                ) : (
                  <>
                    <h3 style={{ fontSize: '1.5rem', color: '#f8fafc', lineHeight: 1.6, marginBottom: '3rem', textAlign: 'center', fontWeight: 600 }}>{question.metin}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: 'auto' }}>
                      {question.secenekler.map((opt: string, idx: number) => {
                        const labels = ['A', 'B', 'C', 'D', 'E'];
                        const isSelected = selectedOption === opt;
                        
                        let bg = 'rgba(255,255,255,0.05)';
                        let border = '2px solid rgba(255,255,255,0.0)';
                        let textColor = '#e2e8f0';

                        if (isSelected) {
                          if (isAnswerCorrect === true) {
                            bg = 'rgba(16, 185, 129, 0.15)';
                            border = '2px solid #10b981';
                            textColor = '#10b981';
                          } else if (isAnswerCorrect === false) {
                            bg = 'rgba(239, 68, 68, 0.15)';
                            border = '2px solid #ef4444';
                            textColor = '#ef4444';
                          } else {
                            bg = 'rgba(59, 130, 246, 0.15)';
                            border = '2px solid #3b82f6';
                            textColor = '#3b82f6';
                          }
                        }

                        if (selectedOption && opt === question.dogruCevap && !isAnswerCorrect) {
                           bg = 'rgba(16, 185, 129, 0.1)';
                           border = '2px dashed #10b981';
                           textColor = '#10b981';
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleAnswer(opt)}
                            disabled={!!selectedOption}
                            style={{
                              padding: '1.25rem', borderRadius: '16px', background: bg, border,
                              color: textColor, fontSize: '1.1rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem',
                              cursor: selectedOption ? 'default' : 'pointer', transition: 'all 0.2s',
                              gridColumn: idx === 4 ? 'span 2' : 'span 1',
                              fontWeight: 600
                            }}
                            onMouseOver={(e) => { if (!selectedOption) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                            onMouseOut={(e) => { if (!selectedOption) e.currentTarget.style.background = bg; }}
                          >
                            <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>{labels[idx]}</span>
                            {opt}
                            {isSelected && isAnswerCorrect === true && <CheckCircle2 size={24} color="#10b981" style={{ marginLeft: 'auto' }} />}
                            {isSelected && isAnswerCorrect === false && <XCircle size={24} color="#ef4444" style={{ marginLeft: 'auto' }} />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {phase === 'finished' && (
            <motion.div key="finished" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', width: '100%', maxWidth: '600px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '4rem', borderRadius: '32px', border: winnerId === user.id ? '2px solid #f59e0b' : winnerId === 'draw' ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)', boxShadow: winnerId === user.id ? '0 0 40px rgba(245, 158, 11, 0.2)' : 'none' }}>
                {winnerId === user.id ? (
                  <>
                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                      <Trophy size={96} color="#f59e0b" style={{ margin: '0 auto 2rem', filter: 'drop-shadow(0 0 20px rgba(245, 158, 11, 0.5))' }} />
                    </motion.div>
                    <h2 style={{ fontSize: '3rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>ZAFER!</h2>
                    <p style={{ color: '#10b981', fontSize: '1.25rem', fontWeight: 700 }}>+50 XP Kazandın</p>
                  </>
                ) : winnerId === 'draw' ? (
                  <>
                    <Swords size={96} color="#3b82f6" style={{ margin: '0 auto 2rem' }} />
                    <h2 style={{ fontSize: '3rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem' }}>BERABERLİK</h2>
                    <p style={{ color: '#9ca3af', fontSize: '1.25rem' }}>Mükemmel bir mücadeleydi!</p>
                  </>
                ) : (
                  <>
                    <XCircle size={96} color="#ef4444" style={{ margin: '0 auto 2rem' }} />
                    <h2 style={{ fontSize: '3rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem' }}>MAĞLUBİYET</h2>
                    <p style={{ color: '#9ca3af', fontSize: '1.25rem' }}>Bir dahaki sefere daha hızlı ol!</p>
                  </>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '3rem', background: 'rgba(0,0,0,0.3)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                   <div>
                      <div style={{ color: '#9ca3af', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 600 }}>Senin Puanın</div>
                      <div style={{ color: '#fff', fontSize: '3rem', fontWeight: 900 }}>{me?.score}</div>
                   </div>
                   <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                   <div>
                      <div style={{ color: '#9ca3af', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 600 }}>Rakibin Puanı</div>
                      <div style={{ color: '#fff', fontSize: '3rem', fontWeight: 900 }}>{opponent?.score || 0}</div>
                   </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '3rem' }}>
                  <Link href="/dashboard" style={{ flex: 1, textDecoration: 'none' }}>
                    <button 
                      onClick={() => { setPhase('idle'); setDuelId(null); setWinnerId(null); setParticipants([]); setCurrentRound(1); }}
                      style={{ width: '100%', padding: '1.25rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Ana Sayfa
                    </button>
                  </Link>
                  <button 
                    onClick={() => { setPhase('idle'); setDuelId(null); setWinnerId(null); setParticipants([]); setCurrentRound(1); setTimeout(startMatchmaking, 500); }}
                    style={{ flex: 1, padding: '1.25rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)' }}
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
        .radar-circle { animation: radar 2s infinite ease-out; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes radar { 0% { transform: scale(0.5); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }
        .dots-anim { animation: dots 1.5s infinite steps(4, end); display: inline-block; width: 24px; text-align: left; }
        @keyframes dots { 0% { content: ''; } 25% { content: '.'; } 50% { content: '..'; } 75% { content: '...'; } 100% { content: ''; } }
      `}</style>
    </div>
  );
}
