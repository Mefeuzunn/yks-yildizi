import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('yks_session')?.value || 'test-uuid-if-missing'; // fallback so it attempts
  
  let results: any = { userId };
  
  try {
    await db.prepare(`
      INSERT INTO focus_sessions (id, user_id, subject, topic, task_name, mode, duration_minutes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, now())
    `).run(uuidv4(), userId, 'test', 'test', null, 'pomodoro', 25);
    results['try1'] = 'success';
  } catch(e: any) {
    results['try1_error'] = e.message;
    try {
      await db.prepare(`
        INSERT INTO focus_sessions (id, user_id, subject, topic, task_name, mode, duration_min)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(uuidv4(), userId, 'test', 'test', null, 'pomodoro', 25);
      results['try2'] = 'success';
    } catch(e2: any) {
      results['try2_error'] = e2.message;
      try {
        await db.prepare(`
          INSERT INTO focus_sessions (id, user_id, subject, topic, duration_minutes, created_at)
          VALUES (?, ?, ?, ?, ?, now())
        `).run(uuidv4(), userId, 'test', 'test', 25);
        results['try3'] = 'success';
      } catch(e3: any) {
        results['try3_error'] = e3.message;
      }
    }
  }

  // Also test GET
  try {
    const data = await db.prepare('SELECT * FROM focus_sessions LIMIT 1').all();
    results['get'] = data;
  } catch(e: any) {
    results['get_error'] = e.message;
  }

  return NextResponse.json(results);
}
