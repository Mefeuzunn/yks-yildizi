import webpush from 'web-push';
import db from '@/lib/yks-db-async';
import { v4 as uuidv4 } from 'uuid';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:support@yksyildizi.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  } catch (e) {
    console.warn('VAPID initialization warning:', e);
  }
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  actions?: { action: string; title: string }[];
  data?: any;
}

export interface SmartPushOptions {
  category?: 'focus' | 'homework' | 'lesson' | 'daily_reminder' | 'streak_warning' | 'duel' | 'general';
  isAutomated?: boolean;
  type?: string;
  icon?: string;
  url?: string;
}

export interface CanSendResult {
  allowed: boolean;
  reason?: 'category_disabled' | 'quiet_hours' | 'daily_quota_reached' | 'ok';
}

/**
 * Check if the given time falls within the user's Quiet Hours (Do Not Disturb)
 * Default: 23:00 to 08:00 (Turkey Time UTC+3)
 */
export function isWithinQuietHours(
  startTime: string = '23:00',
  endTime: string = '08:00',
  date: Date = new Date()
): boolean {
  // Turkey Time (UTC+3)
  const trHour = (date.getUTCHours() + 3) % 24;
  const trMinute = date.getUTCMinutes();
  const currentMins = trHour * 60 + trMinute;

  const [startH, startM] = (startTime || '23:00').split(':').map(Number);
  const [endH, endM] = (endTime || '08:00').split(':').map(Number);
  const startMins = (isNaN(startH) ? 23 : startH) * 60 + (isNaN(startM) ? 0 : startM);
  const endMins = (isNaN(endH) ? 8 : endH) * 60 + (isNaN(endM) ? 0 : endM);

  if (startMins > endMins) {
    // Spans across midnight (e.g., 23:00 to 08:00)
    return currentMins >= startMins || currentMins < endMins;
  } else {
    // Within the same day (e.g., 01:00 to 07:00)
    return currentMins >= startMins && currentMins < endMins;
  }
}

/**
 * Validates whether an automated or manual push notification should be dispatched to the user.
 * Enforces Quiet Hours and Strict Spam Prevention Limit (max 2 automated notifs per day).
 */
export async function canSendPushToUser(
  userId: string,
  category: string = 'general',
  isAutomated: boolean = true
): Promise<CanSendResult> {
  try {
    const settings = await db.prepare(
      'SELECT * FROM user_notification_settings WHERE user_id = ?'
    ).get(userId) as any;

    if (settings) {
      // 1. Kategori bazlı kullanıcı tercihi kontrolü
      if (category === 'focus' && settings.notif_focus === false) {
        return { allowed: false, reason: 'category_disabled' };
      }
      if (category === 'homework' && settings.notif_homework === false) {
        return { allowed: false, reason: 'category_disabled' };
      }
      if (category === 'lesson' && settings.notif_lessons === false) {
        return { allowed: false, reason: 'category_disabled' };
      }
      if (category === 'daily_reminder' && settings.notif_daily_reminder === false) {
        return { allowed: false, reason: 'category_disabled' };
      }
      if (category === 'streak_warning' && settings.notif_streak_warning === false) {
        return { allowed: false, reason: 'category_disabled' };
      }
      if (category === 'duel' && settings.notif_duel === false) {
        return { allowed: false, reason: 'category_disabled' };
      }

      // 2. Otomatik sistem bildirimleri için ek akıllı korumalar
      if (isAutomated) {
        // a) Sessiz Saatler (Quiet Hours) koruması
        if (settings.quiet_hours_enabled !== false) {
          const isQuiet = isWithinQuietHours(
            settings.quiet_hours_start || '23:00',
            settings.quiet_hours_end || '08:00'
          );
          if (isQuiet) {
            return { allowed: false, reason: 'quiet_hours' };
          }
        }

        // b) Günlük Spam Önleme Kotası (Varsayılan max 2 otomatik bildirim)
        const frequencyLimit = settings.frequency_limit || 'smart';
        if (frequencyLimit !== 'all') {
          const maxAllowed = frequencyLimit === 'minimal' ? 1 : (settings.max_daily_notifs || 2);

          const todayCountRow = await db.prepare(`
            SELECT COUNT(*)::int as count 
            FROM user_notifications 
            WHERE user_id = ? 
              AND is_automated = true 
              AND created_at::date = CURRENT_DATE
          `).get(userId) as any;

          if ((todayCountRow?.count || 0) >= maxAllowed) {
            return { allowed: false, reason: 'daily_quota_reached' };
          }
        }
      }
    }

    return { allowed: true, reason: 'ok' };
  } catch (err) {
    console.error('Error in canSendPushToUser:', err);
    return { allowed: true, reason: 'ok' };
  }
}

/**
 * Core web push notification sender using VAPID
 */
export async function sendPushNotification(
  subscription: webpush.PushSubscription,
  payload: PushPayload
): Promise<boolean> {
  try {
    await webpush.sendNotification(subscription, JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/icon-192x192.png',
      url: payload.url || '/dashboard',
      tag: payload.tag || 'yks-yildizi',
      actions: payload.actions || [
        { action: 'open', title: 'İncele' }
      ],
      data: payload.data || { url: payload.url || '/dashboard' }
    }));
    return true;
  } catch (err: any) {
    // 410 Gone / 404 Not Found = subscription expired or uninstalled
    if (err.statusCode === 410 || err.statusCode === 404) {
      return false;
    }
    console.error('Push notification error:', err.message);
    return false;
  }
}

/**
 * Send push notification to a specific user by userId
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<number> {
  try {
    const subs = await db.prepare(
      'SELECT endpoint, p256dh, auth FROM user_push_subscriptions WHERE user_id = ?'
    ).all(userId) as any[];

    if (!subs || subs.length === 0) return 0;

    let successCount = 0;
    for (const sub of subs) {
      const pushSub = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth }
      };
      const ok = await sendPushNotification(pushSub, payload);
      if (ok) {
        successCount++;
      } else {
        // Clean up dead subscription
        await db.prepare('DELETE FROM user_push_subscriptions WHERE endpoint = ?').run(sub.endpoint).catch(() => {});
      }
    }
    return successCount;
  } catch (err) {
    console.error(`Error sending push to user ${userId}:`, err);
    return 0;
  }
}

/**
 * Smart notification sender:
 * 1. Checks quiet hours & user spam quotas.
 * 2. Saves notification into user_notifications (in-app notification center).
 * 3. Dispatches Web Push if allowed and active push subscription exists.
 */
export async function sendSmartPushToUser(
  userId: string,
  payload: PushPayload,
  options: SmartPushOptions = {}
): Promise<{ success: boolean; notifId: string; pushSent: boolean; reason?: string }> {
  const notifId = uuidv4();
  const category = options.category || 'general';
  const isAutomated = options.isAutomated ?? true;

  // 1. İzin & Sessiz saatler & Spam kota kontrolü
  const check = await canSendPushToUser(userId, category, isAutomated);

  // 2. Kategori kullanıcı tarafından tamamen kapatılmışsa in-app da üretme
  if (check.reason === 'category_disabled') {
    return { success: false, notifId: '', pushSent: false, reason: 'category_disabled' };
  }

  // 3. Uygulama İçi Bildirim Merkezine (user_notifications) kaydet
  try {
    await db.prepare(`
      INSERT INTO user_notifications (id, user_id, title, body, type, icon, url, is_automated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      notifId,
      userId,
      payload.title,
      payload.body,
      options.type || category,
      options.icon || payload.icon || '🔔',
      options.url || payload.url || '/dashboard',
      isAutomated
    );
  } catch (dbErr) {
    console.warn('In-app notification insert warning:', dbErr);
  }

  // 4. Eğer sessiz saatler veya günlük kota dolduysa push iletme, sadece in-app bırak
  if (!check.allowed) {
    return { success: true, notifId, pushSent: false, reason: check.reason };
  }

  // 5. Cihaza Web Push ilet
  const sentCount = await sendPushToUser(userId, payload);
  return { success: true, notifId, pushSent: sentCount > 0, reason: 'sent' };
}

/**
 * Send push notification to multiple users
 */
export async function sendPushToUsers(userIds: string[], payload: PushPayload): Promise<number> {
  if (!userIds || userIds.length === 0) return 0;
  let totalSent = 0;
  for (const uid of userIds) {
    const sent = await sendPushToUser(uid, payload);
    totalSent += sent;
  }
  return totalSent;
}

/**
 * Send smart push notification to all students in a class
 * Saves in-app notification for each student and sends Web Push
 */
export async function sendPushToClass(
  classId: string,
  payload: PushPayload,
  options: SmartPushOptions = {}
): Promise<number> {
  try {
    const students = await db.prepare(
      'SELECT student_id FROM class_students WHERE class_id = ?'
    ).all(classId) as any[];

    if (!students || students.length === 0) return 0;
    let pushSentCount = 0;
    for (const s of students) {
      const res = await sendSmartPushToUser(s.student_id, payload, {
        category: 'homework',
        isAutomated: false,
        url: payload.url || '/odevlerim',
        icon: payload.icon || '📋',
        ...options,
      });
      if (res.pushSent) pushSentCount++;
    }
    return pushSentCount;
  } catch (err) {
    console.error(`Error sending push to class ${classId}:`, err);
    return 0;
  }
}

export { webpush };
