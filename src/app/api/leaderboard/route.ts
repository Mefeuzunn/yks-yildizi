import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    
    // Join users and user_stats
    const leaderboard = await db.prepare(`
      SELECT u.id, u.username, s.league, s.league_points, s.solved_questions
      FROM users u
      LEFT JOIN user_stats s ON u.id = s.user_id
      WHERE u.role = 'ogrenci'
      ORDER BY s.league_points DESC NULLS LAST
      LIMIT 50
    `).all() as any[];

    // Add rank
    const formattedBoard = leaderboard.map((user, index) => {
      let color = '#94a3b8'; // Bronz/Gümüş default
      if (user.league === 'Altın') color = '#fbbf24';
      if (user.league === 'Platin') color = '#e2e8f0';
      if (user.league === 'Şampiyon') color = '#f59e0b';
      
      return {
        rank: index + 1,
        id: `user-${index}`, // Mask UUID leak
        name: user.username,
        score: user.league_points || 0,
        tier: user.league || 'Bronz',
        color,
        isCurrentUser: user.id === userId
      };
    });

    let currentUserStats = null;
    if (userId) {
      currentUserStats = await db.prepare('SELECT league, league_points FROM user_stats WHERE user_id = ?').get(userId) as any;
    }

    return NextResponse.json({
      success: true,
      leaderboard: formattedBoard,
      currentUserStats: currentUserStats || { league: 'Bronz', league_points: 0 }
    }, { status: 200 });

  } catch (error) {
    console.error('Leaderboard API Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
