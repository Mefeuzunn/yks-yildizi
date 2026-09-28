import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

    // 1. Son 7 günün günlük toplam odak dakikaları ve çözülen soru sayıları
    const weekSessions = await db.prepare(`
      SELECT 
        DATE(created_at) as day, 
        COALESCE(SUM(COALESCE(duration_minutes, duration_min, 0)), 0)::int as total_min,
        COALESCE(SUM(COALESCE(questions_solved, 0)), 0)::int as total_questions,
        COALESCE(SUM(COALESCE(correct_count, 0)), 0)::int as total_correct,
        COALESCE(SUM(COALESCE(wrong_count, 0)), 0)::int as total_wrong,
        COUNT(*)::int as session_count
      FROM focus_sessions
      WHERE user_id = ? 
        AND created_at >= CURRENT_DATE - INTERVAL '7 days'
        AND (mode = 'pomodoro' OR mode IS NULL OR mode NOT IN ('shortBreak', 'longBreak'))
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    `).all(userId) as any[];

    // 2. Bugünün toplamları
    const todayRow = await db.prepare(`
      SELECT 
        COALESCE(SUM(COALESCE(duration_minutes, duration_min, 0)), 0)::int as total_min, 
        COALESCE(SUM(COALESCE(questions_solved, 0)), 0)::int as total_questions,
        COALESCE(SUM(COALESCE(correct_count, 0)), 0)::int as total_correct,
        COALESCE(SUM(COALESCE(wrong_count, 0)), 0)::int as total_wrong,
        COUNT(*)::int as count
      FROM focus_sessions
      WHERE user_id = ? 
        AND DATE(created_at) = CURRENT_DATE
        AND (mode = 'pomodoro' OR mode IS NULL OR mode NOT IN ('shortBreak', 'longBreak'))
    `).get(userId) as any;

    // 3. Tüm zamanların toplamları
    const allTimeRow = await db.prepare(`
      SELECT 
        COALESCE(SUM(COALESCE(duration_minutes, duration_min, 0)), 0)::int as total_min, 
        COALESCE(SUM(COALESCE(questions_solved, 0)), 0)::int as total_questions,
        COALESCE(SUM(COALESCE(correct_count, 0)), 0)::int as total_correct,
        COALESCE(SUM(COALESCE(wrong_count, 0)), 0)::int as total_wrong,
        COUNT(*)::int as count
      FROM focus_sessions 
      WHERE user_id = ?
        AND (mode = 'pomodoro' OR mode IS NULL OR mode NOT IN ('shortBreak', 'longBreak'))
    `).get(userId) as any;

    // 4. Ders bazlı detaylı dağılım (Analizim sayfası için)
    const subjectBreakdown = await db.prepare(`
      SELECT 
        COALESCE(subject, 'Diğer') as subject,
        COALESCE(SUM(COALESCE(duration_minutes, duration_min, 0)), 0)::int as total_min,
        COALESCE(SUM(COALESCE(questions_solved, 0)), 0)::int as total_questions,
        COALESCE(SUM(COALESCE(correct_count, 0)), 0)::int as total_correct,
        COALESCE(SUM(COALESCE(wrong_count, 0)), 0)::int as total_wrong,
        COALESCE(SUM(COALESCE(net_score, 0)), 0)::float as total_net,
        COUNT(*)::int as session_count
      FROM focus_sessions
      WHERE user_id = ?
        AND subject IS NOT NULL
        AND (mode = 'pomodoro' OR mode IS NULL OR mode NOT IN ('shortBreak', 'longBreak'))
      GROUP BY subject
      ORDER BY total_min DESC
    `).all(userId) as any[];

    // 5. Son 10 çalışma oturumu (soru detayları dahil)
    const recentSessions = await db.prepare(`
      SELECT 
        id, subject, topic, task_name, mode, 
        COALESCE(duration_minutes, duration_min, 0)::int as duration_min,
        COALESCE(duration_minutes, duration_min, 0)::int as duration_minutes,
        COALESCE(questions_solved, 0)::int as questions_solved,
        COALESCE(correct_count, 0)::int as correct_count,
        COALESCE(wrong_count, 0)::int as wrong_count,
        COALESCE(empty_count, 0)::int as empty_count,
        COALESCE(net_score, 0)::float as net_score,
        created_at as started_at, created_at
      FROM focus_sessions
      WHERE user_id = ?
        AND (mode = 'pomodoro' OR mode IS NULL OR mode NOT IN ('shortBreak', 'longBreak'))
      ORDER BY created_at DESC 
      LIMIT 10
    `).all(userId) as any[];

    return NextResponse.json({
      weekData: (weekSessions || []).map(w => ({
        day: typeof w.day === 'string' ? w.day : new Date(w.day).toISOString().split('T')[0],
        total_min: Number(w.total_min) || 0,
        total_questions: Number(w.total_questions) || 0,
        total_correct: Number(w.total_correct) || 0,
        total_wrong: Number(w.total_wrong) || 0,
        session_count: Number(w.session_count) || 0
      })),
      todayTotalMin: Number(todayRow?.total_min) || 0,
      todaySessions: Number(todayRow?.count) || 0,
      todayQuestions: Number(todayRow?.total_questions) || 0,
      todayCorrect: Number(todayRow?.total_correct) || 0,
      todayWrong: Number(todayRow?.total_wrong) || 0,
      allTimeTotalMin: Number(allTimeRow?.total_min) || 0,
      allTimeCount: Number(allTimeRow?.count) || 0,
      allTimeQuestions: Number(allTimeRow?.total_questions) || 0,
      allTimeCorrect: Number(allTimeRow?.total_correct) || 0,
      allTimeWrong: Number(allTimeRow?.total_wrong) || 0,
      subjectBreakdown: (subjectBreakdown || []).map(s => ({
        subject: s.subject,
        total_min: Number(s.total_min) || 0,
        total_questions: Number(s.total_questions) || 0,
        total_correct: Number(s.total_correct) || 0,
        total_wrong: Number(s.total_wrong) || 0,
        total_net: Number(s.total_net) || 0,
        session_count: Number(s.session_count) || 0
      })),
      recentSessions: (recentSessions || []).map(s => ({
        ...s,
        duration_min: Number(s.duration_min) || 0,
        duration_minutes: Number(s.duration_minutes) || 0,
        questions_solved: Number(s.questions_solved) || 0,
        correct_count: Number(s.correct_count) || 0,
        wrong_count: Number(s.wrong_count) || 0,
        empty_count: Number(s.empty_count) || 0,
        net_score: Number(s.net_score) || 0
      }))
    });
  } catch (err: any) {
    console.error('Focus GET API Error:', err);
    return NextResponse.json({ error: err.message || 'Veriler alınamadı' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

    const body = await req.json();
    const { 
      subject, topic, taskName, mode = 'pomodoro', durationMin = 25,
      questionsSolved = 0, correctCount = 0, wrongCount = 0, emptyCount = 0, netScore = 0
    } = body;

    // Mola oturumları (shortBreak, longBreak) ASLA odak süresine eklenmez ve kaydedilmez
    if (mode === 'shortBreak' || mode === 'longBreak') {
      return NextResponse.json({ 
        success: true, 
        ignored: true, 
        message: 'Mola oturumları odak süresine dahil edilmez.' 
      });
    }

    const dur = Number(durationMin) || 25;
    const qSolved = Math.max(0, Number(questionsSolved) || 0);
    const cCount = Math.max(0, Number(correctCount) || 0);
    const wCount = Math.max(0, Number(wrongCount) || 0);
    const eCount = Math.max(0, Number(emptyCount) || 0);
    const calculatedNet = Math.max(0, cCount - (wCount * 0.25));
    const nScore = netScore !== undefined && netScore !== null ? Number(netScore) : calculatedNet;
    const id = uuidv4();

    // 1. Gerçek odak oturumunu soru sayıları ile kaydet
    await db.prepare(`
      INSERT INTO focus_sessions (
        id, user_id, subject, topic, task_name, mode, 
        duration_minutes, duration_min, questions_solved, correct_count, 
        wrong_count, empty_count, net_score, created_at, started_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `).run(
      id, userId, subject || null, topic || null, taskName || null, mode, 
      dur, dur, qSolved, cCount, wCount, eCount, nScore
    );

    // 2. XP, Lig Puanı ve Çözülen Soru Sayısı Güncelle (user_stats UPSERT)
    if (mode === 'pomodoro') {
      try {
        const bonusXp = 25 + (qSolved * 2) + (cCount * 3);
        await db.prepare(`
          INSERT INTO user_stats (user_id, xp, league_points, streak_days, solved_questions, success_rate, league)
          VALUES (?, ?, 25, 1, ?, 0, 'Bronz')
          ON CONFLICT (user_id) DO UPDATE SET
            xp = COALESCE(user_stats.xp, 0) + ?,
            league_points = COALESCE(user_stats.league_points, 0) + 25,
            solved_questions = COALESCE(user_stats.solved_questions, 0) + ?
        `).run(userId, bonusXp, qSolved, bonusXp, qSolved);

        // Günlük görev kontrolü
        await db.prepare(`
          UPDATE daily_quests 
          SET progress = COALESCE(progress, 0) + ? 
          WHERE user_id = ? AND created_date = CURRENT_DATE::text AND is_completed = 0
        `).run(dur, userId);
      } catch (statsErr) {
        console.warn('Stats update non-fatal error:', statsErr);
      }
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error('Focus POST API Error:', err);
    return NextResponse.json({ error: err.message || 'Kayıt başarısız' }, { status: 500 });
  }
}
