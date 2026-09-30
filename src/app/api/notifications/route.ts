import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

async function ensureNotificationTables() {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS user_notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      type TEXT DEFAULT 'general',
      icon TEXT DEFAULT '🔔',
      url TEXT DEFAULT '/dashboard',
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

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
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}

// GET: Fetch user's notifications and unread count
export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }

    await ensureNotificationTables();

    const notifications = await db.prepare(`
      SELECT id, title, body, type, icon, url, is_read, created_at
      FROM user_notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 40
    `).all(userId) as any[];

    const unreadCountRow = await db.prepare(`
      SELECT COUNT(*) as cnt
      FROM user_notifications
      WHERE user_id = ? AND is_read = false
    `).get(userId) as any;

    let settings = await db.prepare(`
      SELECT * FROM user_notification_settings WHERE user_id = ?
    `).get(userId) as any;

    if (!settings) {
      await db.prepare(`
        INSERT INTO user_notification_settings (user_id) VALUES (?)
        ON CONFLICT (user_id) DO NOTHING
      `).run(userId);
      settings = await db.prepare(`
        SELECT * FROM user_notification_settings WHERE user_id = ?
      `).get(userId) as any;
    }

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
      unreadCount: unreadCountRow?.cnt || 0,
      settings: settings || {},
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Add a new in-app notification for a user
export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }

    await ensureNotificationTables();

    const body = await req.json();
    const { title, body: msgBody, type, icon, url, targetUserId } = body;

    const recipientId = targetUserId || userId;
    const notifId = uuidv4();

    await db.prepare(`
      INSERT INTO user_notifications (id, user_id, title, body, type, icon, url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      notifId,
      recipientId,
      title || 'Yeni Bildirim',
      msgBody || '',
      type || 'general',
      icon || '🔔',
      url || '/dashboard'
    );

    return NextResponse.json({ success: true, id: notifId });
  } catch (error: any) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
