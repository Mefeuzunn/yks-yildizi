import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: roomId } = await params;
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('yks_session')?.value;
    if (!sessionId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const messages = await db.prepare(`
      SELECT m.id, m.message, m.created_at, u.name, u.avatar, u.id as user_id
      FROM room_messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.room_id = ?
      ORDER BY m.created_at DESC
      LIMIT 50
    `).all(roomId);

    return NextResponse.json({ messages: messages.reverse() });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: roomId } = await params;
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('yks_session')?.value;
    if (!sessionId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const body = await req.json();
    if (!body.message || body.message.trim() === '') {
       return NextResponse.json({ error: 'Boş mesaj gönderilemez' }, { status: 400 });
    }

    const id = uuidv4();
    await db.prepare(`
      INSERT INTO room_messages (id, room_id, user_id, message)
      VALUES (?, ?, ?, ?)
    `).run(id, roomId, sessionId, body.message.trim());

    return NextResponse.json({ success: true, id });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
