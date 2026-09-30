import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    let settings = await db.prepare(
      'SELECT * FROM user_notification_settings WHERE user_id = ?'
    ).get(userId) as any;

    if (!settings) {
      await db.prepare('INSERT INTO user_notification_settings (user_id) VALUES (?) ON CONFLICT DO NOTHING').run(userId);
      settings = await db.prepare('SELECT * FROM user_notification_settings WHERE user_id = ?').get(userId);
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const body = await req.json();
    const {
      notif_focus,
      notif_homework,
      notif_lessons,
      notif_daily_reminder,
      notif_reminder_time,
      notif_streak_warning,
      notif_streak_time,
      notif_duel,
      notif_sound,
    } = body;

    await db.prepare(`
      INSERT INTO user_notification_settings (
        user_id, notif_focus, notif_homework, notif_lessons,
        notif_daily_reminder, notif_reminder_time, notif_streak_warning,
        notif_streak_time, notif_duel, notif_sound, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        notif_focus = EXCLUDED.notif_focus,
        notif_homework = EXCLUDED.notif_homework,
        notif_lessons = EXCLUDED.notif_lessons,
        notif_daily_reminder = EXCLUDED.notif_daily_reminder,
        notif_reminder_time = EXCLUDED.notif_reminder_time,
        notif_streak_warning = EXCLUDED.notif_streak_warning,
        notif_streak_time = EXCLUDED.notif_streak_time,
        notif_duel = EXCLUDED.notif_duel,
        notif_sound = EXCLUDED.notif_sound,
        updated_at = NOW()
    `).run(
      userId,
      notif_focus ?? true,
      notif_homework ?? true,
      notif_lessons ?? true,
      notif_daily_reminder ?? true,
      notif_reminder_time || '08:30',
      notif_streak_warning ?? true,
      notif_streak_time || '20:30',
      notif_duel ?? true,
      notif_sound ?? true
    );

    return NextResponse.json({ success: true, message: 'Bildirim tercihleri güncellendi!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
