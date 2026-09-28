import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

// GET: Current user's live focus session status
export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

    const session = await db.prepare(`
      SELECT user_id, subject, topic, mode, duration_min, time_left_sec, started_at, last_heartbeat,
             ROUND(EXTRACT(EPOCH FROM (NOW() - started_at)) / 60)::int as elapsed_min
      FROM active_focus_sessions
      WHERE user_id = ? AND last_heartbeat >= NOW() - INTERVAL '2 minutes' AND mode = 'pomodoro'
    `).get(userId) as any;

    if (!session) {
      return NextResponse.json({ isLive: false });
    }

    return NextResponse.json({
      isLive: true,
      session: {
        ...session,
        elapsed_min: Math.max(1, Number(session.elapsed_min) || 1)
      }
    });
  } catch (error: any) {
    console.error('Live focus GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Heartbeat, start, or stop live focus session
export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action, subject, topic, mode = 'pomodoro', durationMin = 25, timeLeftSec = 0 } = body;

    if (action === 'stop' || mode !== 'pomodoro') {
      await db.prepare('DELETE FROM active_focus_sessions WHERE user_id = ?').run(userId);
      return NextResponse.json({ success: true, isLive: false });
    }

    // Upsert live session
    await db.prepare(`
      INSERT INTO active_focus_sessions (
        user_id, subject, topic, mode, duration_min, time_left_sec, started_at, last_heartbeat
      )
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        subject = COALESCE(EXCLUDED.subject, active_focus_sessions.subject),
        topic = COALESCE(EXCLUDED.topic, active_focus_sessions.topic),
        mode = EXCLUDED.mode,
        duration_min = EXCLUDED.duration_min,
        time_left_sec = EXCLUDED.time_left_sec,
        last_heartbeat = NOW(),
        started_at = CASE 
          WHEN active_focus_sessions.last_heartbeat < NOW() - INTERVAL '3 minutes' THEN NOW() 
          ELSE active_focus_sessions.started_at 
        END
    `).run(
      userId,
      subject || 'Genel Çalışma',
      topic || '',
      mode,
      durationMin,
      timeLeftSec
    );

    return NextResponse.json({ success: true, isLive: true });
  } catch (error: any) {
    console.error('Live focus POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
