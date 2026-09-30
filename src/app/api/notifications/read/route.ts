import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }

    const { id, markAll } = await req.json().catch(() => ({}));

    if (markAll) {
      await db.prepare(`
        UPDATE user_notifications
        SET is_read = true
        WHERE user_id = ? AND is_read = false
      `).run(userId);
    } else if (id) {
      await db.prepare(`
        UPDATE user_notifications
        SET is_read = true
        WHERE id = ? AND user_id = ?
      `).run(id, userId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
