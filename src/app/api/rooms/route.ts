import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('yks_session')?.value;
    if (!sessionId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    // Clean up old participants (inactive for more than 5 minutes)
    await db.prepare(`DELETE FROM room_participants WHERE last_active < datetime('now', '-5 minutes')`).run();

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
