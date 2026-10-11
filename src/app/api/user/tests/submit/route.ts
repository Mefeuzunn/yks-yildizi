import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { calculateLeague } from '@/lib/league-system';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);

    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      test_type, 
      score, 
      correct_count, 
      wrong_count, 
      blank_count, 
      duration, 
      turkish_net = 0,
      math_net = 0,
      social_net = 0,
      science_net = 0,
      details 
    } = body;
    const sessionId = uuidv4();

    await db.transaction(async () => {
      // 1. Save Test Session
      const insertSession = await db.prepare(`
        INSERT INTO test_sessions (id, user_id, test_type, score, correct_count, wrong_count, blank_count, duration, details_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertSession.run(sessionId, userId, test_type, score, correct_count, wrong_count, blank_count, duration, JSON.stringify(details || {}));

      // 2. Fetch current stats
      const currentStats = await db.prepare('SELECT league_points, solved_questions, success_rate, coins, xp FROM user_stats WHERE user_id = ?').get(userId) as any;
      const curPoints = Number(currentStats?.league_points || 0);
      const curSolved = Number(currentStats?.solved_questions || 0);
      const curRate = Number(currentStats?.success_rate || 0);

      const xpGained = (correct_count * 10) + (score > 80 ? 50 : 0);
      const newPoints = curPoints + xpGained;
      const newLeague = calculateLeague(newPoints);
      const addedQuestions = correct_count + wrong_count + blank_count;
      const newSolved = curSolved + addedQuestions;
      const testSuccessRate = addedQuestions > 0 ? (correct_count / addedQuestions) * 100 : 0;
      const newSuccessRate = newSolved > 0 ? Math.round(((curRate * curSolved) + (testSuccessRate * addedQuestions)) / newSolved) : 0;

      // 3. Update user_stats with new league tier and awarded coins
      await db.prepare(`
        UPDATE user_stats 
        SET 
          solved_questions = ?,
          league_points = ?,
          league = ?,
          xp = COALESCE(xp, 0) + ?,
          coins = COALESCE(coins, 0) + ?,
          success_rate = ?
        WHERE user_id = ?
      `).run(
        newSolved,
        newPoints,
        newLeague,
        xpGained,
        xpGained,
        newSuccessRate,
        userId
      );

      // 4. Sync to mock_exams for comprehensive performance graphs in /denemeler
      const upper = (test_type || '').toUpperCase();
      const isTYT = upper.includes('TYT');
      const isAYT = upper.includes('AYT');
      if (isTYT || isAYT) {
        const examType = isTYT ? 'TYT' : 'AYT';
        const d = details || {};
        const turkCol = isAYT && d.fizik !== undefined ? Number(d.fizik) : (Number(turkish_net) || 0);
        const mathCol = isAYT && d.aytMatematik !== undefined ? Number(d.aytMatematik) : (Number(math_net) || 0);
        const sciCol = isAYT && d.kimya !== undefined ? Number(d.kimya) : (Number(science_net) || 0);
        const socCol = isAYT && d.biyoloji !== undefined ? Number(d.biyoloji) : (Number(social_net) || 0);

        await db.prepare(`
          INSERT INTO mock_exams (user_id, exam_type, exam_name, turkish_net, math_net, social_net, science_net, total_net, exam_date, details)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
        `).run(
          userId,
          examType,
          test_type,
          turkCol,
          mathCol,
          socCol,
          sciCol,
          Number(score) || 0,
          JSON.stringify({
            sessionId,
            correct_count,
            wrong_count,
            blank_count,
            duration,
            ...d
          })
        );
      }
    })();

    return NextResponse.json({ success: true, sessionId }, { status: 201 });

  } catch (error) {
    console.error('Test Submission Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
