import { NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import db from '@/lib/yks-db-async';

export const dynamic = 'force-dynamic';

function getCurrentWeekMonday(): string {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // 0 for Monday, 6 for Sunday
  const monday = new Date(d);
  monday.setDate(d.getDate() - day);
  return monday.toISOString().split('T')[0];
}

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const currentWeek = getCurrentWeekMonday();

    // Auto-reset completed plans if a new week has started
    await db.prepare(`
      UPDATE study_plans
      SET completed = 0,
          studied_minutes = 0,
          questions_solved = 0,
          last_completed_week = ?
      WHERE user_id = ? 
        AND completed = 1 
        AND (last_completed_week != ? OR last_completed_week IS NULL OR last_completed_week = '')
    `).run(currentWeek, userId, currentWeek);

    const plans = await db.prepare(`
      SELECT id, user_id, day_of_week, start_time, duration, title, notes, color, completed,
             COALESCE(studied_minutes, 0) as studied_minutes,
             COALESCE(questions_solved, 0) as questions_solved,
             COALESCE(last_completed_week, '') as last_completed_week
      FROM study_plans 
      WHERE user_id = ?
    `).all(userId);

    return NextResponse.json({ plans, currentWeek });
  } catch (error) {
    console.error('Calendar GET Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, id, day, time, duration, title, notes, color, completed, studied_minutes, questions_solved } = body;
    const currentWeek = getCurrentWeekMonday();

    if (action === 'add') {
      const result = await db.prepare(`
        INSERT INTO study_plans (
          user_id, day_of_week, start_time, duration, title, notes, color, completed, studied_minutes, questions_solved, last_completed_week
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, '') RETURNING id
      `).get(userId, day, time, duration, title, notes || '', color || '#3b82f6') as any;
      return NextResponse.json({ success: true, id: result.id });
    }
    
    if (action === 'update') {
      const isCompleted = completed === 1 || completed === true ? 1 : (completed === 0 || completed === false ? 0 : null);
      const weekStamp = isCompleted === 1 ? currentWeek : '';

      await db.prepare(`
        UPDATE study_plans 
        SET day_of_week = COALESCE(?, day_of_week),
            start_time = COALESCE(?, start_time),
            duration = COALESCE(?, duration),
            title = COALESCE(?, title),
            notes = COALESCE(?, notes),
            color = COALESCE(?, color),
            completed = CASE WHEN ? IS NOT NULL THEN ? ELSE completed END,
            studied_minutes = CASE WHEN ? IS NOT NULL THEN ? ELSE studied_minutes END,
            questions_solved = CASE WHEN ? IS NOT NULL THEN ? ELSE questions_solved END,
            last_completed_week = CASE WHEN ? = 1 THEN ? ELSE last_completed_week END
        WHERE id = ? AND user_id = ?
      `).run(
        day ?? null,
        time ?? null,
        duration ?? null,
        title ?? null,
        notes ?? null,
        color ?? null,
        isCompleted, isCompleted,
        studied_minutes !== undefined ? Number(studied_minutes) : null,
        studied_minutes !== undefined ? Number(studied_minutes) : null,
        questions_solved !== undefined ? Number(questions_solved) : null,
        questions_solved !== undefined ? Number(questions_solved) : null,
        isCompleted, weekStamp,
        id, userId
      );
      return NextResponse.json({ success: true });
    }

    if (action === 'reset_week') {
      // Manual reset for current week
      await db.prepare(`
        UPDATE study_plans
        SET completed = 0,
            studied_minutes = 0,
            questions_solved = 0,
            last_completed_week = ?
        WHERE user_id = ?
      `).run(currentWeek, userId);
      return NextResponse.json({ success: true, message: 'Haftalık program sıfırlandı' });
    }

    if (action === 'delete') {
      await db.prepare('DELETE FROM study_plans WHERE id = ? AND user_id = ?').run(id, userId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
  } catch (error) {
    console.error('Calendar POST Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

