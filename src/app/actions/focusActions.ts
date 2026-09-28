'use server';

import { revalidatePath } from 'next/cache';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { v4 as uuidv4 } from 'uuid';

export async function saveFocusSession(data: {
  subject: string | null;
  topic: string | null;
  taskName: string | null;
  mode: string;
  durationMin: number;
}) {
  const userId = await getAuthenticatedUserId();
  
  if (!userId) {
    return { success: false, error: 'Oturum bulunamadı' };
  }

  if (data.mode === 'shortBreak' || data.mode === 'longBreak') {
    return { success: true, ignored: true };
  }

  const dur = Number(data.durationMin) || 25;
  const id = uuidv4();

  try {
    // 1. Oturumu kaydet
    await db.prepare(`
      INSERT INTO focus_sessions (id, user_id, subject, topic, task_name, mode, duration_minutes, duration_min, created_at, started_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `).run(id, userId, data.subject || null, data.topic || null, data.taskName || null, data.mode || 'pomodoro', dur, dur);

    // 2. XP ve Lig puanı güncelle (Garanti UPSERT)
    if (data.mode === 'pomodoro') {
      try {
        await db.prepare(`
          INSERT INTO user_stats (user_id, xp, league_points, streak_days, solved_questions, success_rate, league)
          VALUES (?, 25, 25, 1, 0, 0, 'Bronz')
          ON CONFLICT (user_id) DO UPDATE SET
            xp = COALESCE(user_stats.xp, 0) + 25,
            league_points = COALESCE(user_stats.league_points, 0) + 25
        `).run(userId);
      } catch (statsErr) {
        console.warn('Stats upsert warning:', statsErr);
      }
    }

    // Cache Invalidation
    revalidatePath('/dashboard');
    return { success: true, id };
  } catch (err: any) {
    console.error('saveFocusSession error:', err);
    return { success: false, error: err.message || 'Kayıt başarısız' };
  }
}
