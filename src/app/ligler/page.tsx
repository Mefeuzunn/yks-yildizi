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
    <div className="custom-scrollbar" style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh', paddingBottom: '100px' }}>
      
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN — Current User Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ backgroundColor: '#131827', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '32px', position: 'relative', overflow: 'hidden' }}>
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

        {/* RIGHT COLUMN — Global Ranking Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ backgroundColor: '#131827', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', overflow: 'hidden' }}>
          
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

        </motion.div>
      </div>
    </div>
  );
}
