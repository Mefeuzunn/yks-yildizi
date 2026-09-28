"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Trophy, Crown, Medal, Flame, TrendingUp, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LEAGUE_COLORS: Record<string, { bg: string; color: string; border: string; icon: React.ReactNode }> = {
  Bronz: { bg: 'rgba(180, 83, 9, 0.1)', color: '#d97706', border: 'rgba(217, 119, 6, 0.2)', icon: <Medal size={16} /> },
  Gümüş: { bg: 'rgba(156, 163, 175, 0.1)', color: '#9ca3af', border: 'rgba(156, 163, 175, 0.2)', icon: <Medal size={16} /> },
  Altın: { bg: 'rgba(250, 204, 21, 0.1)', color: '#facc15', border: 'rgba(250, 204, 21, 0.2)', icon: <Trophy size={16} /> },
  Platin: { bg: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: 'rgba(56, 189, 248, 0.2)', icon: <Trophy size={16} /> },
  Şampiyon: { bg: 'rgba(167, 139, 250, 0.1)', color: '#a78bfa', border: 'rgba(167, 139, 250, 0.4)', icon: <Crown size={16} /> },
  Elmas: { bg: 'rgba(167, 139, 250, 0.1)', color: '#a78bfa', border: 'rgba(167, 139, 250, 0.4)', icon: <Crown size={16} /> },
};

const NEXT_LEAGUE_THRESHOLDS: Record<string, { next: string, xp: number }> = {
  'Bronz': { next: 'Gümüş', xp: 100 },
  'Gümüş': { next: 'Altın', xp: 500 },
  'Altın': { next: 'Platin', xp: 1000 },
  'Platin': { next: 'Şampiyon', xp: 3000 },
  'Şampiyon': { next: 'Maksimum', xp: 3000 },
  'Elmas': { next: 'Maksimum', xp: 3000 }
};

export default function LeaderboardPage() {
  const { user } = useAuth();
  
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [currentUserStats, setCurrentUserStats] = useState<any>({ league: 'Bronz', league_points: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch('/api/leaderboard');
        const data = await res.json();
        if (data.success) {
          setLeaderboard(data.leaderboard);
          setCurrentUserStats(data.currentUserStats || { league: 'Bronz', league_points: 0 });
        }
      } catch (err) {
        console.error('Leaderboard error', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#FAFAFA' }}>
        <Loader2 className="animate-spin" size={48} color="#facc15" />
      </div>
    );
  }

  // Find user's rank
  const myRankIndex = leaderboard.findIndex(u => u.isCurrentUser);
  const myRank = myRankIndex !== -1 ? leaderboard[myRankIndex].rank : '-';

  const userLeague = currentUserStats.league || 'Bronz';
  const userScore = currentUserStats.league_points || 0;
  const nextTarget = NEXT_LEAGUE_THRESHOLDS[userLeague] || NEXT_LEAGUE_THRESHOLDS['Bronz'];
  const progressPercent = userLeague === 'Şampiyon' || userLeague === 'Elmas' ? 100 : Math.min(100, Math.max(0, (userScore / nextTarget.xp) * 100));

  return (
    <div className="custom-scrollbar" style={{ padding: 'clamp(16px, 4vw, 32px) clamp(12px, 3vw, 24px)', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh', paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 20px))' }}>
      
      <header style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(234, 179, 8, 0.3)' }}>
          <Trophy size={28} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', margin: '0 0 4px 0', letterSpacing: '-0.03em' }}>
            Şampiyonlar Ligi
          </h1>
          <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
            Diğer öğrencilerle yarış, puanları topla ve üst liglere tırman.
          </p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN — Current User Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ backgroundColor: '#131827', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: 'clamp(20px, 4vw, 32px)', position: 'relative', overflow: 'hidden' }}>
          {/* Background Glow */}
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'rgba(250, 204, 21, 0.15)', filter: 'blur(50px)', borderRadius: '50%' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', position: 'relative', zIndex: 10 }}>
            <div style={{ 
              width: '70px', height: '70px', borderRadius: '20px', 
              background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.2), rgba(250, 204, 21, 0.05))',
              border: '1px solid rgba(250, 204, 21, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              <Crown size={32} color="#facc15" />
            </div>
            <div>
              <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Mevcut Lig</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: LEAGUE_COLORS[userLeague]?.color || '#fff', textShadow: '0 0 20px rgba(250, 204, 21, 0.4)' }}>{userLeague} Lig</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <TrendingUp size={18} color="#38bdf8" />
                <span style={{ fontSize: '15px', color: '#9ca3af', fontWeight: 500 }}>Sıralama</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>#{myRank}</div>
            </div>
            
            <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Flame size={18} color="#ef4444" />
                <span style={{ fontSize: '15px', color: '#9ca3af', fontWeight: 500 }}>Puan</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>{userScore.toLocaleString('tr-TR')} <span style={{ fontSize: '14px', color: '#6b7280' }}>XP</span></div>
            </div>
          </div>

          <div style={{ marginTop: '40px', position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 600 }}>{nextTarget.next} Lig'e Yükselmeye Kalan</span>
              <span style={{ fontSize: '13px', color: '#facc15', fontWeight: 700 }}>{userScore.toLocaleString('tr-TR')} / {nextTarget.xp.toLocaleString('tr-TR')} XP</span>
            </div>
            <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', width: '100%', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1, ease: 'easeOut' }} style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', borderRadius: '4px', boxShadow: '0 0 10px rgba(59,130,246,0.5)' }} />
            </div>
          </div>

        </motion.div>

        {/* RIGHT COLUMN — Global Ranking Table (Desktop) & Podium/Cards (Mobile) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ backgroundColor: '#131827', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', overflow: 'hidden' }}>
          
          {/* DESKTOP TABLE */}
          <div className="desktop-only" style={{ width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <th style={{ padding: '16px 24px', width: '60px', fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>#</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>Öğrenci</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>Lig</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>XP Puanı</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 && (
                   <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>Henüz kimse puan kazanmamış.</td></tr>
                )}
                {leaderboard.map((userRow, idx) => {
                  const isCurrentUser = userRow.isCurrentUser;
                  
                  let rankDisplay: React.ReactNode = <span style={{ color: '#9ca3af' }}>{userRow.rank}</span>;
                  if (userRow.rank === 1) rankDisplay = <span style={{ fontSize: '20px' }}>🥇</span>;
                  if (userRow.rank === 2) rankDisplay = <span style={{ fontSize: '20px' }}>🥈</span>;
                  if (userRow.rank === 3) rankDisplay = <span style={{ fontSize: '20px' }}>🥉</span>;

                  return (
                    <tr 
                      key={userRow.rank} 
                      style={{ 
                        backgroundColor: isCurrentUser ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                        borderBottom: idx === leaderboard.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <td style={{ padding: '16px 24px', fontSize: '15px', fontWeight: userRow.rank <= 3 ? 800 : 600 }}>
                        {rankDisplay}
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '15px', fontWeight: isCurrentUser ? 700 : 500, color: isCurrentUser ? '#fff' : '#d1d5db', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #374151, #1f2937)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff', border: isCurrentUser ? '2px solid #6366f1' : 'none' }}>
                          {(userRow.name || 'U').substring(0,2).toUpperCase()}
                        </div>
                        {userRow.name}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '100px',
                          backgroundColor: LEAGUE_COLORS[userRow.tier]?.bg || LEAGUE_COLORS['Bronz'].bg,
                          color: LEAGUE_COLORS[userRow.tier]?.color || LEAGUE_COLORS['Bronz'].color,
                          border: `1px solid ${LEAGUE_COLORS[userRow.tier]?.border || LEAGUE_COLORS['Bronz'].border}`,
                        }}>
                          {LEAGUE_COLORS[userRow.tier]?.icon || <Medal size={16} />}
                          {userRow.tier}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '15px', fontWeight: 700, color: isCurrentUser ? '#6366f1' : '#f3f4f6', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        {userRow.score.toLocaleString('tr-TR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE VIEW — PODIUM + CARD LIST */}
          <div className="mobile-only" style={{ padding: '16px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Liderlik Sıralaması
              </span>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                {leaderboard.length} Öğrenci
              </span>
            </div>

            {leaderboard.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                Henüz kimse puan kazanmamış.
              </div>
            ) : (
              <>
                {/* Top 3 Podium (Shown if >= 3 users) */}
                {leaderboard.length >= 3 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '8px', marginBottom: '24px', paddingTop: '16px' }}>
                    {/* 2nd Place */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #9ca3af, #4b5563)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '14px', border: '2px solid #9ca3af', boxShadow: '0 4px 12px rgba(156, 163, 175, 0.3)', position: 'relative' }}>
                        {(leaderboard[1].name || 'U').substring(0,2).toUpperCase()}
                        <span style={{ position: 'absolute', top: -10, fontSize: '16px' }}>🥈</span>
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#e5e7eb', marginTop: '6px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '85px' }}>
                        {leaderboard[1].name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>
                        {leaderboard[1].score.toLocaleString('tr-TR')} XP
                      </div>
                      <div style={{ width: '100%', height: '52px', background: 'linear-gradient(180deg, rgba(156,163,175,0.2) 0%, rgba(156,163,175,0.05) 100%)', borderRadius: '8px 8px 0 0', marginTop: '6px', borderTop: '2px solid #9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontWeight: 800, fontSize: '16px' }}>
                        2
                      </div>
                    </div>

                    {/* 1st Place (Center, Elevated) */}
                    <div style={{ flex: 1.15, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'linear-gradient(135deg, #facc15, #ca8a04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 900, fontSize: '16px', border: '3px solid #facc15', boxShadow: '0 0 20px rgba(250, 204, 21, 0.5)', position: 'relative' }}>
                        {(leaderboard[0].name || 'U').substring(0,2).toUpperCase()}
                        <span style={{ position: 'absolute', top: -14, fontSize: '20px' }}>👑</span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#facc15', marginTop: '6px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px' }}>
                        {leaderboard[0].name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#fef08a', fontWeight: 700 }}>
                        {leaderboard[0].score.toLocaleString('tr-TR')} XP
                      </div>
                      <div style={{ width: '100%', height: '74px', background: 'linear-gradient(180deg, rgba(250,204,21,0.25) 0%, rgba(250,204,21,0.05) 100%)', borderRadius: '10px 10px 0 0', marginTop: '6px', borderTop: '3px solid #facc15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#facc15', fontWeight: 900, fontSize: '20px' }}>
                        1
                      </div>
                    </div>

                    {/* 3rd Place */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #d97706, #78350f)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '14px', border: '2px solid #d97706', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)', position: 'relative' }}>
                        {(leaderboard[2].name || 'U').substring(0,2).toUpperCase()}
                        <span style={{ position: 'absolute', top: -10, fontSize: '16px' }}>🥉</span>
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#e5e7eb', marginTop: '6px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '85px' }}>
                        {leaderboard[2].name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>
                        {leaderboard[2].score.toLocaleString('tr-TR')} XP
                      </div>
                      <div style={{ width: '100%', height: '40px', background: 'linear-gradient(180deg, rgba(217,119,6,0.2) 0%, rgba(217,119,6,0.05) 100%)', borderRadius: '8px 8px 0 0', marginTop: '6px', borderTop: '2px solid #d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', fontWeight: 800, fontSize: '16px' }}>
                        3
                      </div>
                    </div>
                  </div>
                )}

                {/* Card List of all users */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {leaderboard.map((userRow) => {
                    const isCurrentUser = userRow.isCurrentUser;
                    const tierInfo = LEAGUE_COLORS[userRow.tier] || LEAGUE_COLORS['Bronz'];

                    return (
                      <div
                        key={userRow.rank}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '12px 14px',
                          borderRadius: '14px',
                          backgroundColor: isCurrentUser ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.03)',
                          border: isCurrentUser ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(255,255,255,0.05)',
                          transition: 'transform 0.15s ease'
                        }}
                      >
                        {/* Rank */}
                        <div style={{ width: '28px', textAlign: 'center', fontSize: '13px', fontWeight: 800, color: userRow.rank === 1 ? '#facc15' : userRow.rank === 2 ? '#9ca3af' : userRow.rank === 3 ? '#d97706' : '#6b7280' }}>
                          {userRow.rank <= 3 ? (userRow.rank === 1 ? '🥇' : userRow.rank === 2 ? '🥈' : '🥉') : `#${userRow.rank}`}
                        </div>

                        {/* Avatar */}
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #374151, #1f2937)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff', border: isCurrentUser ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                          {(userRow.name || 'U').substring(0,2).toUpperCase()}
                        </div>

                        {/* Name & Tier */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: isCurrentUser ? 700 : 600, color: isCurrentUser ? '#fff' : '#e5e7eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {userRow.name} {isCurrentUser && <span style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 500 }}>(Sen)</span>}
                          </div>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '6px', backgroundColor: tierInfo.bg, color: tierInfo.color, marginTop: '2px' }}>
                            {userRow.tier}
                          </div>
                        </div>

                        {/* XP */}
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: isCurrentUser ? '#818cf8' : '#fff', fontVariantNumeric: 'tabular-nums' }}>
                            {userRow.score.toLocaleString('tr-TR')}
                          </div>
                          <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 600 }}>XP</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

        </motion.div>
      </div>
    </div>
  );
}
