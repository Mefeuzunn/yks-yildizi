import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedTeacherId } from '@/lib/auth-utils';
import { sendPushNotification, type PushPayload } from '@/lib/push-notifications';

export const dynamic = 'force-dynamic';

// Belirli kullanıcılara veya tüm sınıfa bildirim gönder
// Body: { userIds?: string[], classId?: string, title, body, url?, tag? }
export async function POST(req: Request) {
  try {
    // İç servis veya öğretmen çağırabilir
    const authHeader = req.headers.get('authorization');
    const isCronCall = authHeader === `Bearer ${process.env.CRON_SECRET}`;

    let callerId: string | null = null;
    if (!isCronCall) {
      callerId = await getAuthenticatedTeacherId(req);
      if (!callerId) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const { userIds, classId, title, body: msgBody, url, tag } = body;

    if (!title || !msgBody) {
      return NextResponse.json({ error: 'title ve body gerekli' }, { status: 400 });
    }

    // Hedef kullanıcıları belirle
    let targetUserIds: string[] = userIds || [];

    if (classId && targetUserIds.length === 0) {
      const classStudents = await db.prepare(
        'SELECT student_id FROM class_students WHERE class_id = ?'
      ).all(classId) as any[];
      targetUserIds = classStudents.map((s: any) => s.student_id);
    }

    if (targetUserIds.length === 0) {
      return NextResponse.json({ error: 'Hedef kullanıcı bulunamadı' }, { status: 400 });
    }

    // Bu kullanıcıların push subscription'larını çek
    const placeholders = targetUserIds.map(() => '?').join(',');
    const subscriptions = await db.prepare(
      `SELECT user_id, endpoint, p256dh, auth FROM user_push_subscriptions WHERE user_id IN (${placeholders})`
    ).all(...targetUserIds) as any[];

    if (subscriptions.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'Bildirim abonesi bulunamadı' });
    }

    const payload: PushPayload = {
      title,
      body: msgBody,
      icon: '/icons/icon-192x192.png',
      url: url || '/dashboard',
      tag: tag || 'yks-yildizi',
    };

    // Paralel gönderim
    const results = await Promise.allSettled(
      subscriptions.map(async (sub: any) => {
        const pushSub = {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth }
        };
        const ok = await sendPushNotification(pushSub, payload);

        // Geçersiz subscription'ı temizle
        if (!ok) {
          await db.prepare(
            'DELETE FROM user_push_subscriptions WHERE endpoint = ?'
          ).run(sub.endpoint).catch(() => {});
        }
        return ok;
      })
    );

    const sentCount = results.filter(r => r.status === 'fulfilled' && r.value === true).length;

    return NextResponse.json({
      success: true,
      sent: sentCount,
      total: subscriptions.length,
      message: `${sentCount}/${subscriptions.length} bildirim gönderildi`
    });

  } catch (error: any) {
    console.error('Push Send Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
