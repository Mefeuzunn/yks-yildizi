import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { v4 as uuidv4 } from 'uuid';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { broadcastRoomEvent } from '@/lib/room-events';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: roomId } = await params;
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const rawMessages = await db.prepare(`
      SELECT m.id, m.message as text, m.created_at, u.username as sender, u.id as user_id
      FROM room_messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.room_id = ?
      ORDER BY m.created_at DESC
      LIMIT 50
    `).all(roomId) as any[];

    const messages = (rawMessages || []).reverse().map(m => ({
      id: m.id,
      sender: m.sender || 'Öğrenci',
      text: m.text,
      time: new Date(m.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      isSystem: false
    }));

    return NextResponse.json({ messages });

  } catch (err) {
    console.error('Room Chat GET Error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: roomId } = await params;
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const body = await req.json();
    if (!body.message || body.message.trim() === '') {
      return NextResponse.json({ error: 'Boş mesaj gönderilemez' }, { status: 400 });
    }

    const user = await db.prepare('SELECT username FROM users WHERE id = ?').get(userId) as any;
    const id = uuidv4();
    const text = body.message.trim();

    await db.prepare(`
      INSERT INTO room_messages (id, room_id, user_id, message)
      VALUES (?, ?, ?, ?)
    `).run(id, roomId, userId, text);

    const msgObj = {
      id,
      sender: user?.username || 'Öğrenci',
      text,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      isSystem: false
    };

    // Broadcast in real-time to active SSE listeners
    broadcastRoomEvent(roomId, 'new-message', msgObj);

    return NextResponse.json({ success: true, message: msgObj });

  } catch (err) {
    console.error('Room Chat POST Error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
