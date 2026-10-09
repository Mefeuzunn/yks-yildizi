import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { broadcastRoomEvent } from '@/lib/room-events';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: roomId } = await params;
    let userId = await getAuthenticatedUserId(req);
    const body = await req.json().catch(() => ({ action: 'join' }));
    const { action = 'join', seatId, currentSubject, status, avatarConfig, userId: clientUserId } = body;

    // Resilient fallback for authenticated user in edge cases
    if (!userId && clientUserId) {
      try {
        const u = await db.prepare('SELECT id FROM users WHERE id = ?').get(clientUserId) as any;
        if (u) userId = u.id;
      } catch (_) {}
    }

    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }

    if (action === 'join' || action === 'ping') {
      // Upsert participant into room
      await db.prepare(`
        INSERT INTO room_participants (room_id, user_id, joined_at, last_active, seat_id, current_subject, status, avatar_config)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?, ?, ?)
        ON CONFLICT(room_id, user_id) DO UPDATE SET 
          last_active = CURRENT_TIMESTAMP,
          seat_id = COALESCE(EXCLUDED.seat_id, room_participants.seat_id),
          current_subject = COALESCE(EXCLUDED.current_subject, room_participants.current_subject),
          status = COALESCE(EXCLUDED.status, room_participants.status),
          avatar_config = COALESCE(EXCLUDED.avatar_config, room_participants.avatar_config)
      `).run(
        roomId, userId, 
        seatId || null, currentSubject || null, status || 'focusing', avatarConfig ? JSON.stringify(avatarConfig) : null
      );
    } else if (action === 'sit') {
      // Guaranteed upsert on sit
      await db.prepare(`
        INSERT INTO room_participants (room_id, user_id, joined_at, last_active, seat_id, current_subject, status, avatar_config)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?, ?, ?)
        ON CONFLICT(room_id, user_id) DO UPDATE SET 
          last_active = CURRENT_TIMESTAMP,
          seat_id = EXCLUDED.seat_id,
          current_subject = COALESCE(EXCLUDED.current_subject, room_participants.current_subject),
          status = COALESCE(EXCLUDED.status, room_participants.status),
          avatar_config = COALESCE(EXCLUDED.avatar_config, room_participants.avatar_config)
      `).run(
        roomId, userId, 
        seatId || null, currentSubject || null, status || 'focusing', avatarConfig ? JSON.stringify(avatarConfig) : null
      );
    } else if (action === 'stand') {
      await db.prepare(`
        UPDATE room_participants 
        SET seat_id = NULL, last_active = CURRENT_TIMESTAMP
        WHERE room_id = ? AND user_id = ?
      `).run(roomId, userId);
    } else if (action === 'leave') {
      await db.prepare('DELETE FROM room_participants WHERE room_id = ? AND user_id = ?').run(roomId, userId);
    }

    // Clean inactive participants (> 5 mins)
    await db.prepare(`DELETE FROM room_participants WHERE last_active < CURRENT_TIMESTAMP - INTERVAL '5 minutes'`).run();

    // Return current participants with full library details (LEFT JOIN to prevent dropping)
    const rawParticipants = await db.prepare(`
      SELECT p.user_id, COALESCE(u.username, 'Öğrenci') as username, COALESCE(u.hedef, 'YKS 2026') as hedef, 
             COALESCE(us.league, 'Bronz') as league,
             p.seat_id, p.current_subject, p.status, p.avatar_config,
             COALESCE(us.focus_minutes, 25) as focus_minutes
      FROM room_participants p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN user_stats us ON u.id = us.user_id
      WHERE p.room_id = ?
      ORDER BY p.joined_at ASC
    `).all(roomId) as any[];

    const participants = (rawParticipants || []).map(p => ({
      id: p.user_id,
      username: p.username || 'Öğrenci',
      league: p.league || 'Bronz',
      target: p.hedef || 'YKS 2026',
      seatId: p.seat_id || null,
      subject: p.current_subject || 'Genel Tekrar',
      status: p.status || 'focusing',
      focusMinutes: p.focus_minutes || 25,
      avatarConfig: typeof p.avatar_config === 'string' ? JSON.parse(p.avatar_config) : (p.avatar_config || null),
    }));

    // Broadcast updated participants list
    if (action === 'join' || action === 'leave' || action === 'sit' || action === 'stand') {
      broadcastRoomEvent(roomId, 'room-users', participants);
    }

    return NextResponse.json({ success: true, participants });

  } catch (err) {
    console.error('Room Join POST Error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
