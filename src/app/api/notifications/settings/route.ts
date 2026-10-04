import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

async function ensureSettingsTable() {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS user_notification_settings (
      user_id TEXT PRIMARY KEY,
      notif_focus BOOLEAN DEFAULT true,
      notif_homework BOOLEAN DEFAULT true,
      notif_lessons BOOLEAN DEFAULT true,
      notif_daily_reminder BOOLEAN DEFAULT true,
      notif_reminder_time TEXT DEFAULT '08:30',
      notif_streak_warning BOOLEAN DEFAULT true,
      notif_streak_time TEXT DEFAULT '20:30',
      notif_duel BOOLEAN DEFAULT true,
      notif_sound BOOLEAN DEFAULT true,
      quiet_hours_enabled BOOLEAN DEFAULT true,
      quiet_hours_start TEXT DEFAULT '23:00',
      quiet_hours_end TEXT DEFAULT '08:00',
      max_daily_notifs INTEGER DEFAULT 2,
      frequency_limit TEXT DEFAULT 'smart',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await db.prepare('ALTER TABLE user_notification_settings ADD COLUMN IF NOT EXISTS quiet_hours_enabled BOOLEAN DEFAULT true').run().catch(() => {});
  await db.prepare('ALTER TABLE user_notification_settings ADD COLUMN IF NOT EXISTS quiet_hours_start TEXT DEFAULT \'23:00\'').run().catch(() => {});
  await db.prepare('ALTER TABLE user_notification_settings ADD COLUMN IF NOT EXISTS quiet_hours_end TEXT DEFAULT \'08:00\'').run().catch(() => {});
  await db.prepare('ALTER TABLE user_notification_settings ADD COLUMN IF NOT EXISTS max_daily_notifs INTEGER DEFAULT 2').run().catch(() => {});
  await db.prepare('ALTER TABLE user_notification_settings ADD COLUMN IF NOT EXISTS frequency_limit TEXT DEFAULT \'smart\'').run().catch(() => {});
}

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    await ensureSettingsTable();

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

    await ensureSettingsTable();

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
      quiet_hours_enabled,
      quiet_hours_start,
      quiet_hours_end,
      max_daily_notifs,
      frequency_limit,
    } = body;

    await db.prepare(`
      INSERT INTO user_notification_settings (
        user_id, notif_focus, notif_homework, notif_lessons,
        notif_daily_reminder, notif_reminder_time, notif_streak_warning,
        notif_streak_time, notif_duel, notif_sound,
        quiet_hours_enabled, quiet_hours_start, quiet_hours_end,
        max_daily_notifs, frequency_limit, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
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
        quiet_hours_enabled = EXCLUDED.quiet_hours_enabled,
        quiet_hours_start = EXCLUDED.quiet_hours_start,
        quiet_hours_end = EXCLUDED.quiet_hours_end,
        max_daily_notifs = EXCLUDED.max_daily_notifs,
        frequency_limit = EXCLUDED.frequency_limit,
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
      notif_sound ?? true,
      quiet_hours_enabled ?? true,
      quiet_hours_start || '23:00',
      quiet_hours_end || '08:00',
      max_daily_notifs || 2,
      frequency_limit || 'smart'
    );

    return NextResponse.json({ success: true, message: 'Bildirim tercihleri güncellendi!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
