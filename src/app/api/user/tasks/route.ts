import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { v4 as uuidv4 } from 'uuid';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

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
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const currentMonday = getCurrentWeekMonday();

    // Önceki haftanın tamamlanmamış yapılacakları diğer haftaya geçmesin
    await db.prepare('DELETE FROM tasks WHERE user_id = ? AND date_str < ? AND completed = 0').run(userId, currentMonday);

    const tasks = await db.prepare(`
      SELECT id, user_id, title, subject, color, date_str, completed, created_at, time, duration,
             COALESCE(studied_minutes, 0) as studied_minutes,
             COALESCE(questions_solved, 0) as questions_solved
      FROM tasks 
      WHERE user_id = ? 
      ORDER BY time ASC, created_at ASC
    `).all(userId) as any[];

    // İstemcinin beklediği formata dönüştür (dateStr key, array value)
    const groupedTasks: Record<string, any[]> = {};
    tasks.forEach(t => {
      if (!groupedTasks[t.date_str]) {
        groupedTasks[t.date_str] = [];
      }
      groupedTasks[t.date_str].push({
        id: t.id,
        title: t.title,
        subject: t.subject,
        color: t.color,
        completed: t.completed === 1,
        date: t.date_str,
        time: t.time || '12:00',
        duration: t.duration || '2 Saat',
        studied_minutes: Number(t.studied_minutes) || 0,
        questions_solved: Number(t.questions_solved) || 0,
      });
    });

    return NextResponse.json(groupedTasks, { status: 200 });
  } catch (error) {
    console.error('Tasks GET Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const { action, task, id, date_str, sourceDate, targetDate, sourceIndex, targetIndex, studied_minutes, questions_solved } = body;

    if (action === 'create') {
      const newId = uuidv4();
      const stmt = await db.prepare(`
        INSERT INTO tasks (id, user_id, title, subject, color, date_str, time, duration, completed, studied_minutes, questions_solved) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0)
      `);
      await stmt.run(
        newId, 
        userId, 
        task.title, 
        task.subject || 'Genel', 
        task.color || '#38bdf8', 
        task.date || date_str, 
        task.time || '12:00', 
        task.duration || '2 Saat'
      );
      return NextResponse.json({ success: true, id: newId }, { status: 201 });
    } 
    else if (action === 'toggle') {
      await db.prepare(`
        UPDATE tasks 
        SET completed = CASE WHEN completed = 1 THEN 0 ELSE 1 END,
            studied_minutes = CASE WHEN completed = 0 THEN COALESCE(?, studied_minutes) ELSE studied_minutes END,
            questions_solved = CASE WHEN completed = 0 THEN COALESCE(?, questions_solved) ELSE questions_solved END
        WHERE id = ? AND user_id = ?
      `).run(
        studied_minutes !== undefined ? Number(studied_minutes) : null,
        questions_solved !== undefined ? Number(questions_solved) : null,
        id, 
        userId
      );
      return NextResponse.json({ success: true });
    }
    else if (action === 'update') {
      await db.prepare(`
        UPDATE tasks
        SET title = COALESCE(?, title),
            subject = COALESCE(?, subject),
            color = COALESCE(?, color),
            date_str = COALESCE(?, date_str),
            time = COALESCE(?, time),
            duration = COALESCE(?, duration),
            completed = CASE WHEN ? IS NOT NULL THEN ? ELSE completed END,
            studied_minutes = CASE WHEN ? IS NOT NULL THEN ? ELSE studied_minutes END,
            questions_solved = CASE WHEN ? IS NOT NULL THEN ? ELSE questions_solved END
        WHERE id = ? AND user_id = ?
      `).run(
        task?.title ?? null,
        task?.subject ?? null,
        task?.color ?? null,
        task?.date ?? null,
        task?.time ?? null,
        task?.duration ?? null,
        task?.completed !== undefined ? (task.completed ? 1 : 0) : null,
        task?.completed !== undefined ? (task.completed ? 1 : 0) : null,
        studied_minutes !== undefined ? Number(studied_minutes) : null,
        studied_minutes !== undefined ? Number(studied_minutes) : null,
        questions_solved !== undefined ? Number(questions_solved) : null,
        questions_solved !== undefined ? Number(questions_solved) : null,
        id, userId
      );
      return NextResponse.json({ success: true });
    }
    else if (action === 'delete') {
      await db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(id, userId);
      return NextResponse.json({ success: true });
    }
    else if (action === 'move') {
      await db.prepare('UPDATE tasks SET date_str = ? WHERE id = ? AND user_id = ?').run(targetDate, id, userId);
      return NextResponse.json({ success: true });
    }
    else if (action === 'clear_past_incomplete') {
      const currentMonday = getCurrentWeekMonday();
      await db.prepare('DELETE FROM tasks WHERE user_id = ? AND date_str < ? AND completed = 0').run(userId, currentMonday);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Geçersiz eylem' }, { status: 400 });
  } catch (error) {
    console.error('Tasks POST Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

