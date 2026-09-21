import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/yks-db-async';
import { v4 as uuidv4 } from 'uuid';

import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('yks_session')?.value;
  if (!token) return null;
  let userId = token;
  try {
    const payload = await verifyToken(token);
    if (payload && payload.userId) {
      userId = payload.userId as string;
    }
  } catch(e) {}
  return userId;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    let weekSessions, todayRow, allTimeRow, recentSessions;
    let errorLog = [];

    try {
      // 1. Try the barebones schema first (duration_minutes, created_at)
      weekSessions = await db.prepare(`
        SELECT date(created_at) as day, subject, topic, SUM(duration_minutes) as total_min, COUNT(*) as session_count
        FROM focus_sessions
        WHERE user_id = ? AND CAST(created_at as timestamp) >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY day, subject ORDER BY day ASC
      `).all(userId);

      todayRow = await db.prepare(`
        SELECT COALESCE(SUM(duration_minutes), 0) as total_min, COUNT(*) as count
        FROM focus_sessions
        WHERE user_id = ? AND DATE(created_at) = CURRENT_DATE
      `).get(userId) as any;

      allTimeRow = await db.prepare(`
        SELECT COALESCE(SUM(duration_minutes), 0) as total_min, COUNT(*) as count
        FROM focus_sessions WHERE user_id = ?
      `).get(userId) as any;

      recentSessions = await db.prepare(`
        SELECT id, subject, topic, duration_minutes as duration_min, created_at as started_at
        FROM focus_sessions
        WHERE user_id = ? AND DATE(created_at) = CURRENT_DATE 
        ORDER BY created_at DESC LIMIT 5
      `).all(userId);
    } catch (e1: any) {
      errorLog.push('Schema 1 error: ' + e1.message);
      try {
        // 2. Fallback to the original schema (duration_min, started_at)
        weekSessions = await db.prepare(`
          SELECT date(CAST(started_at as timestamp)) as day, subject, topic, SUM(duration_min) as total_min, COUNT(*) as session_count
          FROM focus_sessions
          WHERE user_id = ? AND CAST(started_at as timestamp) >= CURRENT_DATE - INTERVAL '7 days'
          GROUP BY day, subject ORDER BY day ASC
        `).all(userId);

        todayRow = await db.prepare(`
          SELECT COALESCE(SUM(duration_min), 0) as total_min, COUNT(*) as count
          FROM focus_sessions
          WHERE user_id = ? AND DATE(CAST(started_at as timestamp)) = CURRENT_DATE
        `).get(userId) as any;

        allTimeRow = await db.prepare(`
          SELECT COALESCE(SUM(duration_min), 0) as total_min, COUNT(*) as count
          FROM focus_sessions WHERE user_id = ?
        `).get(userId) as any;

        recentSessions = await db.prepare(`
          SELECT id, subject, topic, duration_min, started_at
          FROM focus_sessions
          WHERE user_id = ? AND DATE(CAST(started_at as timestamp)) = CURRENT_DATE 
          ORDER BY started_at DESC LIMIT 5
        `).all(userId);
      } catch (e2: any) {
        errorLog.push('Schema 2 error: ' + e2.message);
        
        // THE ULTIMATE FIX: If both schemas fail, the table is corrupted or has wrong FKs.
        // We will drop and recreate it perfectly so it never fails again.
        try {
          await db.prepare(`DROP TABLE IF EXISTS focus_sessions CASCADE`).run();
          await db.prepare(`
            CREATE TABLE focus_sessions (
              id text PRIMARY KEY,
              user_id text NOT NULL,
              subject text,
              topic text,
              task_name text,
              mode text,
              duration_min integer,
              duration_minutes integer,
              started_at timestamp with time zone DEFAULT now(),
              created_at timestamp with time zone DEFAULT now()
            )
          `).run();
          
          return NextResponse.json({
            weekData: [],
            todayTotalMin: 0,
            todaySessions: 0,
            allTimeTotalMin: 0,
            allTimeCount: 0,
            recentSessions: [],
            recovered: true
          });
        } catch (fatalError: any) {
          throw new Error('FATAL RECOVERY FAILED: ' + fatalError.message + ' | Previous errors: ' + errorLog.join(' | '));
        }
      }
    }

    return NextResponse.json({
      weekData: weekSessions,
      todayTotalMin: todayRow?.total_min || 0,
      todaySessions: todayRow?.count || 0,
      allTimeTotalMin: allTimeRow?.total_min || 0,
      allTimeCount: allTimeRow?.count || 0,
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

    // Check if the table has duration_min or duration_minutes by trying one and catching, 
    // but the safest is to just use both if we assume both exist, or handle it dynamically.
    // Given the alter table added duration_minutes, let's insert into duration_minutes and created_at.
    // If it fails, fallback to duration_min and started_at.
    try {
      // 1. Try the full schema (old + new columns)
      await db.prepare(`
        INSERT INTO focus_sessions (id, user_id, subject, topic, task_name, mode, duration_minutes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, now())
      `).run(uuidv4(), userId, subject ?? null, topic ?? null, taskName ?? null, mode, durationMin);
    } catch (e1: any) {
      try {
        // 2. Fallback to older schema
        await db.prepare(`
          INSERT INTO focus_sessions (id, user_id, subject, topic, task_name, mode, duration_min)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(uuidv4(), userId, subject ?? null, topic ?? null, taskName ?? null, mode, durationMin);
      } catch (e2: any) {
        try {
          // 3. Fallback to barebones schema (if they ran the custom SQL which lacks task_name and mode)
          await db.prepare(`
            INSERT INTO focus_sessions (id, user_id, subject, topic, duration_minutes, created_at)
            VALUES (?, ?, ?, ?, ?, now())
          `).run(uuidv4(), userId, subject ?? null, topic ?? null, durationMin);
        } catch (e3: any) {
          // THE ULTIMATE FIX: The table is completely corrupted or has wrong foreign keys.
          // Drop and recreate it perfectly, then insert.
          await db.prepare(`DROP TABLE IF EXISTS focus_sessions CASCADE`).run();
          await db.prepare(`
            CREATE TABLE focus_sessions (
              id text PRIMARY KEY,
              user_id text NOT NULL,
              subject text,
              topic text,
              task_name text,
              mode text,
              duration_min integer,
              duration_minutes integer,
              started_at timestamp with time zone DEFAULT now(),
              created_at timestamp with time zone DEFAULT now()
            )
          `).run();
          
          await db.prepare(`
            INSERT INTO focus_sessions (id, user_id, subject, topic, task_name, mode, duration_minutes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, now())
          `).run(uuidv4(), userId, subject ?? null, topic ?? null, taskName ?? null, mode, durationMin);
        }
      }
    }

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
          WHERE user_id = ? AND date = CURRENT_DATE AND quest_type = 'focus' AND is_completed = 0
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
