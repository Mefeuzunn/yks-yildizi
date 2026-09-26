import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

    const { endpoint } = await req.json();
    if (!endpoint) return NextResponse.json({ error: 'endpoint gerekli' }, { status: 400 });

    await db.prepare(
      'DELETE FROM user_push_subscriptions WHERE user_id = ? AND endpoint = ?'
    ).run(userId, endpoint);

    return NextResponse.json({ success: true, message: 'Bildirim aboneliği kaldırıldı.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
