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

    // 1. Son 7 günün günlük toplam odak dakikaları (SADECE odak/çalışma oturumları)
    const weekSessions = await db.prepare(`
      SELECT 
        DATE(created_at) as day, 
        COALESCE(SUM(COALESCE(duration_minutes, duration_min, 0)), 0)::int as total_min,
        COUNT(*)::int as session_count
      FROM focus_sessions
      WHERE user_id = ? 
        AND created_at >= CURRENT_DATE - INTERVAL '7 days'
        AND (mode = 'pomodoro' OR mode IS NULL OR mode NOT IN ('shortBreak', 'longBreak'))
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    `).all(userId) as any[];

    // 2. Bugünün toplamı (SADECE odak/çalışma oturumları)
    const todayRow = await db.prepare(`
      SELECT 
        COALESCE(SUM(COALESCE(duration_minutes, duration_min, 0)), 0)::int as total_min, 
        COUNT(*)::int as count
      FROM focus_sessions
      WHERE user_id = ? 
        AND DATE(created_at) = CURRENT_DATE
        AND (mode = 'pomodoro' OR mode IS NULL OR mode NOT IN ('shortBreak', 'longBreak'))
    `).get(userId) as any;

    // 3. Tüm zamanların toplamı (SADECE odak/çalışma oturumları)
    const allTimeRow = await db.prepare(`
      SELECT 
        COALESCE(SUM(COALESCE(duration_minutes, duration_min, 0)), 0)::int as total_min, 
        COUNT(*)::int as count
      FROM focus_sessions 
      WHERE user_id = ?
        AND (mode = 'pomodoro' OR mode IS NULL OR mode NOT IN ('shortBreak', 'longBreak'))
    `).get(userId) as any;

    // 4. Son 10 çalışma oturumu (SADECE odak/çalışma oturumları)
    const recentSessions = await db.prepare(`
      SELECT 
        id, subject, topic, task_name, mode, 
        COALESCE(duration_minutes, duration_min, 0)::int as duration_min,
        COALESCE(duration_minutes, duration_min, 0)::int as duration_minutes,
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
        session_count: Number(w.session_count) || 0
      })),
      todayTotalMin: Number(todayRow?.total_min) || 0,
      todaySessions: Number(todayRow?.count) || 0,
      allTimeTotalMin: Number(allTimeRow?.total_min) || 0,
      allTimeCount: Number(allTimeRow?.count) || 0,
      recentSessions: (recentSessions || []).map(s => ({
        ...s,
        duration_min: Number(s.duration_min) || 0,
        duration_minutes: Number(s.duration_minutes) || 0
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
    const { subject, topic, taskName, mode = 'pomodoro', durationMin = 25 } = body;

    // Mola oturumları (shortBreak, longBreak) ASLA odak süresine eklenmez ve kaydedilmez
    if (mode === 'shortBreak' || mode === 'longBreak') {
      return NextResponse.json({ 
        success: true, 
        ignored: true, 
        message: 'Mola oturumları odak süresine dahil edilmez.' 
      });
    }

    const dur = Number(durationMin) || 25;
    const id = uuidv4();

    // 1. Gerçek odak oturumunu kaydet
    await db.prepare(`
      INSERT INTO focus_sessions (id, user_id, subject, topic, task_name, mode, duration_minutes, duration_min, created_at, started_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `).run(id, userId, subject || null, topic || null, taskName || null, mode, dur, dur);

    // 2. XP ve Lig Puanı ekle (Garanti UPSERT)
    if (mode === 'pomodoro') {
      try {
        await db.prepare(`
          INSERT INTO user_stats (user_id, xp, league_points, streak_days, solved_questions, success_rate, league)
          VALUES (?, 25, 25, 1, 0, 0, 'Bronz')
          ON CONFLICT (user_id) DO UPDATE SET
            xp = COALESCE(user_stats.xp, 0) + 25,
            league_points = COALESCE(user_stats.league_points, 0) + 25
        `).run(userId);

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
