import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request) {
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

    const tasks = await db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY time ASC, created_at ASC').all(userId) as any[];

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
        duration: t.duration || '2 Saat'
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
    const { action, task, id, date_str, sourceDate, targetDate, sourceIndex, targetIndex } = body;

    if (action === 'create') {
      const newId = uuidv4();
      const stmt = await db.prepare('INSERT INTO tasks (id, user_id, title, subject, color, date_str, time, duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      await stmt.run(newId, userId, task.title, task.subject || 'Genel', task.color || '#38bdf8', task.date || date_str, task.time || '12:00', task.duration || '2 Saat');
      return NextResponse.json({ success: true, id: newId }, { status: 201 });
    } 
    else if (action === 'toggle') {
      await db.prepare('UPDATE tasks SET completed = CASE WHEN completed = 1 THEN 0 ELSE 1 END WHERE id = ? AND user_id = ?').run(id, userId);
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

    return NextResponse.json({ error: 'Geçersiz eylem' }, { status: 400 });
  } catch (error) {
    console.error('Tasks POST Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
