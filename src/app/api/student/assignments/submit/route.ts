import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { assignment_id, score, status = 'completed' } = await req.json();

    if (!assignment_id) {
      return NextResponse.json({ error: 'Ödev ID gerekli' }, { status: 400 });
    }

    const hasScore = score !== undefined && score !== null && !isNaN(Number(score));
    const finalScore = hasScore ? Math.round(Number(score)) : null;
    const finalStatus = hasScore ? 'graded' : (status || 'completed');

    const earnedXp = hasScore ? Math.max(50, Math.round(Number(score))) : 75;
    const earnedCoins = Math.round(earnedXp * 0.4);

    // Update assignment submission
    await db.prepare(`
      INSERT INTO assignment_submissions (id, assignment_id, student_id, status, score, submitted_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT (assignment_id, student_id) DO UPDATE SET
        status = EXCLUDED.status,
        score = COALESCE(EXCLUDED.score, assignment_submissions.score),
        submitted_at = CURRENT_TIMESTAMP
    `).run(crypto.randomUUID(), assignment_id, userId, finalStatus, finalScore);

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

    // Notify the teacher
    try {
      const assignmentInfo = await db.prepare(`
        SELECT a.teacher_id, a.title, u.username as student_name
        FROM assignments a
        CROSS JOIN users u
        WHERE a.id = ? AND u.id = ?
      `).get(assignment_id, userId) as any;

      if (assignmentInfo && assignmentInfo.teacher_id) {
        const notifId = crypto.randomUUID();
        const scoreSuffix = hasScore ? ` (Puan: %${finalScore})` : '';
        await db.prepare(`
          INSERT INTO user_notifications (id, user_id, title, body, type, icon, url, is_read, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, false, NOW())
        `).run(
          notifId,
          assignmentInfo.teacher_id,
          '📝 Yeni Ödev Teslimi!',
          `${assignmentInfo.student_name || 'Öğrenciniz'} "${assignmentInfo.title}" ödevini tamamladı${scoreSuffix}.`,
          'assignment_submission',
          '📋',
          '/ogretmen/dashboard?tab=odevler'
        );
      }
    } catch (notifError) {
      console.error('Öğretmene bildirim gönderilemedi:', notifError);
    }

    return NextResponse.json({ 
      success: true, 
      earnedXp, 
      earnedCoins,
      status: finalStatus,
      score: finalScore
    });
  } catch (error) {
    console.error('Ödev gönderilirken hata:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
