import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { cookies } from 'next/headers';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: roomId } = await params;
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('yks_session')?.value;
    if (!sessionId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const body = await req.json();
    const { action } = body; // 'join', 'leave', or 'ping'

    if (action === 'join' || action === 'ping') {
      // Upsert participant
      await db.prepare(`
        INSERT INTO room_participants (room_id, user_id, joined_at, last_active)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(room_id, user_id) DO UPDATE SET last_active = CURRENT_TIMESTAMP
      `).run(roomId, sessionId);
    } else if (action === 'leave') {
      await db.prepare('DELETE FROM room_participants WHERE room_id = ? AND user_id = ?').run(roomId, sessionId);
    }

    // Return current participants
    const participants = await db.prepare(`
      SELECT p.user_id, u.name, u.avatar 
      FROM room_participants p
      JOIN users u ON p.user_id = u.id
      WHERE p.room_id = ?
    `).all(roomId);

    return NextResponse.json({ success: true, participants });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
