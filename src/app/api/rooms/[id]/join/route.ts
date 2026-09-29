import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { broadcastRoomEvent } from '@/lib/room-events';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: roomId } = await params;
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const body = await req.json().catch(() => ({ action: 'join' }));
    const { action = 'join' } = body; // 'join', 'leave', or 'ping'

    if (action === 'join' || action === 'ping') {
      // Upsert participant
      await db.prepare(`
        INSERT INTO room_participants (room_id, user_id, joined_at, last_active)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(room_id, user_id) DO UPDATE SET last_active = CURRENT_TIMESTAMP
      `).run(roomId, userId);
    } else if (action === 'leave') {
      await db.prepare('DELETE FROM room_participants WHERE room_id = ? AND user_id = ?').run(roomId, userId);
    }

    // Clean inactive participants (> 5 mins)
    await db.prepare(`DELETE FROM room_participants WHERE last_active < CURRENT_TIMESTAMP - INTERVAL '5 minutes'`).run();

    // Return current participants
    const rawParticipants = await db.prepare(`
      SELECT p.user_id, u.username, COALESCE(us.league, 'Bronz') as league
      FROM room_participants p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN user_stats us ON u.id = us.user_id
      WHERE p.room_id = ?
      ORDER BY p.joined_at ASC
    `).all(roomId) as any[];

    const participants = (rawParticipants || []).map(p => ({
      id: p.user_id,
      username: p.username || 'Öğrenci',
      league: p.league || 'Bronz'
    }));

    // Broadcast updated participants list
    if (action === 'join' || action === 'leave') {
      broadcastRoomEvent(roomId, 'room-users', participants);
    }

    return NextResponse.json({ success: true, participants });

  } catch (err) {
    console.error('Room Join POST Error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
