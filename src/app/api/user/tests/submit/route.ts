import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/yks-db-async';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    let userId = cookieStore.get('yks_session')?.value;

    if (!userId) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        userId = authHeader.substring(7);
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const { test_type, score, correct_count, wrong_count, blank_count, duration, details } = body;
    const sessionId = uuidv4();

    await db.transaction(async () => {
      // 1. Save Test Session
      const insertSession = await db.prepare(`
        INSERT INTO test_sessions (id, user_id, test_type, score, correct_count, wrong_count, blank_count, duration, details_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertSession.run(sessionId, userId, test_type, score, correct_count, wrong_count, blank_count, duration, JSON.stringify(details || {}));

      // 2. Update user_stats (XP, Solved Questions, Success Rate)
      const xpGained = (correct_count * 10) + (score > 80 ? 50 : 0);
      const updateStats = await db.prepare(`
        UPDATE user_stats 
        SET 
          solved_questions = solved_questions + ?,
          league_points = league_points + ?,
          success_rate = ((success_rate * solved_questions) + (? * 100)) / (solved_questions + ?)
        WHERE user_id = ?
      `);
      
      const successPercent = (correct_count / (correct_count + wrong_count + blank_count || 1));
      updateStats.run(
        correct_count + wrong_count + blank_count, // added to solved_questions (total questions tried)
        xpGained, // added to league_points
        successPercent, // rate to merge
        correct_count + wrong_count + blank_count, // weight
        userId
      );
    })();

    return NextResponse.json({ success: true, sessionId }, { status: 201 });

  } catch (error) {
    console.error('Test Submission Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
