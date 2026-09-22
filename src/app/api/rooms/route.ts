import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    // Clean up old participants (inactive for more than 5 minutes)
    await db.prepare(`DELETE FROM room_participants WHERE last_active < CURRENT_TIMESTAMP - INTERVAL '5 minutes'`).run();

    // Get rooms and their participant counts
    const rooms = await db.prepare(`
      SELECT r.*, COUNT(p.user_id) as current_participants 
      FROM study_rooms r
      LEFT JOIN room_participants p ON r.id = p.room_id
      GROUP BY r.id
    `).all();

    return NextResponse.json({ rooms });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
