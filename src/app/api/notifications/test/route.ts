import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { sendPushToUser } from '@/lib/push-notifications';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const user = await db.prepare('SELECT username FROM users WHERE id = ?').get(userId) as any;
    const name = user?.username || 'Şampiyon';

    // 1. Create in-app notification record
    const notifId = uuidv4();
    await db.prepare(`
      INSERT INTO user_notifications (id, user_id, title, body, type, icon, url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      notifId,
      userId,
      '🎉 Bildirim Testi Başarılı!',
      `Tebrikler ${name}! YKS Yıldızı bildirim motoru cihazına başarıyla bağlandı. Tüm ders ve odak hatırlatıcıların aktif.`,
      'general',
      '✨',
      '/dashboard'
    );

    // 2. Send live web push notification
    const sentCount = await sendPushToUser(userId, {
      title: '🎉 Bildirim Testi Başarılı! ✨',
      body: `Harika ${name}! Cihazın artık YKS Yıldızı canlı hatırlatıcılarına ve ödev bildirimlerine tam bağlı.`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      url: '/dashboard',
      tag: 'test-notification',
      actions: [
        { action: 'open', title: '🚀 Panele Git' }
      ]
    });

    return NextResponse.json({
      success: true,
      pushSent: sentCount > 0,
      sentCount,
      message: sentCount > 0
        ? 'Test bildirimi cihazınıza başarıyla iletildi!'
        : 'Bildirim kaydedildi ancak cihazınızda anlık push izni henüz tanımlanmamış olabilir.'
    });
  } catch (error: any) {
    console.error('Error sending test notification:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
