import { NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import db from '@/lib/yks-db-async';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const plans = await db.prepare('SELECT * FROM study_plans WHERE user_id = ?').all(userId);
    return NextResponse.json({ plans });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, id, day, time, duration, title, notes, color, completed } = body;

    if (action === 'add') {
      const result = await db.prepare(
        'INSERT INTO study_plans (user_id, day_of_week, start_time, duration, title, notes, color, completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id'
      ).get(userId, day, time, duration, title, notes || '', color || '#3b82f6', 0) as any;
      return NextResponse.json({ success: true, id: result.id });
    }
    
    if (action === 'update') {
      await db.prepare(
        'UPDATE study_plans SET day_of_week = COALESCE(?, day_of_week), start_time = COALESCE(?, start_time), duration = COALESCE(?, duration), title = COALESCE(?, title), notes = COALESCE(?, notes), color = COALESCE(?, color), completed = COALESCE(?, completed) WHERE id = ? AND user_id = ?'
      ).run(day, time, duration, title, notes, color, completed, id, userId);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      await db.prepare('DELETE FROM study_plans WHERE id = ? AND user_id = ?').run(id, userId);
      return NextResponse.json({ success: true });
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
