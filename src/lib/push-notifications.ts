import webpush from 'web-push';
import db from '@/lib/yks-db-async';

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
 * Send push notification to all students in a class
 */
export async function sendPushToClass(classId: string, payload: PushPayload): Promise<number> {
  try {
    const students = await db.prepare(
      'SELECT student_id FROM class_students WHERE class_id = ?'
    ).all(classId) as any[];

    if (!students || students.length === 0) return 0;
    const uids = students.map((s: any) => s.student_id);
    return await sendPushToUsers(uids, payload);
  } catch (err) {
    console.error(`Error sending push to class ${classId}:`, err);
    return 0;
  }
}

export { webpush };
