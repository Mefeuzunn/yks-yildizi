import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

    const subscription = await req.json();
    if (!subscription?.endpoint) {
      return NextResponse.json({ error: 'Geçersiz abonelik verisi' }, { status: 400 });
    }

    // Tabloyu oluştur (yoksa)
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS user_push_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        endpoint TEXT NOT NULL UNIQUE,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    const { endpoint, keys } = subscription;
    const { p256dh, auth } = keys || {};

    if (!p256dh || !auth) {
      return NextResponse.json({ error: 'Eksik anahtar verisi' }, { status: 400 });
    }

    // Upsert: varsa güncelle, yoksa ekle
    await db.prepare(`
      INSERT INTO user_push_subscriptions (user_id, endpoint, p256dh, auth)
      VALUES (?, ?, ?, ?)
      ON CONFLICT (endpoint) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        p256dh = EXCLUDED.p256dh,
        auth = EXCLUDED.auth,
        last_used = NOW()
    `).run(userId, endpoint, p256dh, auth);

    return NextResponse.json({ success: true, message: 'Bildirimler aktifleştirildi!' });
  } catch (error: any) {
    console.error('Subscribe Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
