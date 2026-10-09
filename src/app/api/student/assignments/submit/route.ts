import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { assignment_id, score } = await req.json();

    const earnedXp = Math.max(50, Math.round(Number(score || 0)));
    const earnedCoins = Math.round(earnedXp * 0.4);

    await db.prepare(`
      UPDATE assignment_submissions 
      SET status = 'graded', score = ?, submitted_at = CURRENT_TIMESTAMP
      WHERE assignment_id = ? AND student_id = ?
    `).run(score, assignment_id, userId);

    // Award XP and coins in user_stats
    try {
      await db.prepare(`
        UPDATE user_stats 
        SET xp = COALESCE(xp, 0) + ?, 
            coins = COALESCE(coins, 0) + ?,
            league_points = COALESCE(league_points, 0) + ?,
            solved_questions = COALESCE(solved_questions, 0) + 5
        WHERE user_id = ?
      `).run(earnedXp, earnedCoins, Math.round(earnedXp * 0.5), userId);
    } catch (_) {}

    return NextResponse.json({ 
      success: true, 
      earnedXp, 
      earnedCoins 
    });
  } catch (error) {
    console.error('Ödev gönderilirken hata:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
