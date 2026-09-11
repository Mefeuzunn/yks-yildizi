import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/yks-db-async';
import { v4 as uuidv4 } from 'uuid';

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('yks_session')?.value ?? null;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const weekSessions = await db.prepare(`
      SELECT date(started_at) as day, subject, topic, SUM(duration_min) as total_min, COUNT(*) as session_count
      FROM focus_sessions
      WHERE user_id = ? AND started_at >= datetime('now', '-7 days') AND mode = 'pomodoro'
      GROUP BY day, subject ORDER BY day ASC
    `).all(userId);

    const todayRow = await db.prepare(`
      SELECT COALESCE(SUM(duration_min), 0) as total_min, COUNT(*) as count
      FROM focus_sessions
      WHERE user_id = ? AND date(started_at) = date('now') AND mode = 'pomodoro'
    `).get(userId) as any;

    const allTimeRow = await db.prepare(`
      SELECT COALESCE(SUM(duration_min), 0) as total_min, COUNT(*) as count
      FROM focus_sessions WHERE user_id = ? AND mode = 'pomodoro'
    `).get(userId) as any;

    const recentSessions = await db.prepare(`
      SELECT subject, topic, duration_min, started_at, mode
      FROM focus_sessions
      WHERE user_id = ? AND date(started_at) = date('now') 
      ORDER BY started_at DESC LIMIT 5
    `).all(userId);

    return NextResponse.json({
      weekData: weekSessions,
      todayTotalMin: todayRow?.total_min || 0,
      todaySessions: todayRow?.count || 0,
      allTimeTotalMin: allTimeRow?.total_min || 0,
      recentSessions
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { subject, topic, taskName, mode, durationMin } = await req.json();
    if (!mode || !durationMin) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    await db.prepare(`
      INSERT INTO focus_sessions (id, user_id, subject, topic, task_name, mode, duration_min)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(uuidv4(), userId, subject ?? null, topic ?? null, taskName ?? null, mode, durationMin);

    if (mode === 'pomodoro') {
      try {
        await db.prepare(`
          UPDATE user_stats SET
            xp = COALESCE(xp, 0) + 25,
            league_points = COALESCE(league_points, 0) + 25
          WHERE user_id = ?
        `).run(userId);
        
        // Update daily quests
        await db.prepare(`
          UPDATE daily_quests 
          SET current_value = current_value + ? 
          WHERE user_id = ? AND date = date('now') AND quest_type = 'focus' AND is_completed = 0
        `).run(durationMin, userId);

      } catch(e) {
        // ignore if user_stats row doesn't exist yet
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
