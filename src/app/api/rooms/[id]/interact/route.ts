import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { broadcastRoomEvent } from '@/lib/room-events';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: roomId } = await params;
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const body = await req.json();
    const { receiverId, actionType = 'coffee' } = body;

    if (!receiverId) {
      return NextResponse.json({ error: 'Alıcı kullanıcı belirtilmedi' }, { status: 400 });
    }

    const sender = await db.prepare('SELECT username FROM users WHERE id = ?').get(userId) as any;
    const receiver = await db.prepare('SELECT username FROM users WHERE id = ?').get(receiverId) as any;

    const senderName = sender?.username || 'Bir öğrenci';
    const receiverName = receiver?.username || 'arkadaşına';

    // Log interaction
    await db.prepare(`
      INSERT INTO library_interactions (room_id, sender_id, sender_username, receiver_id, action_type)
      VALUES (?, ?, ?, ?, ?)
    `).run(roomId, userId, senderName, receiverId, actionType);

    // Format quiet library announcement in chat
    let text = '';
    if (actionType === 'coffee') {
      text = `☕ ${senderName}, ${receiverName}'e sıcak bir odak kahvesi bıraktı!`;
    } else if (actionType === 'wave') {
      text = `👋 ${senderName}, ${receiverName}'e sessizce selam verdi.`;
    } else if (actionType === 'energy') {
      text = `⚡ ${senderName}, ${receiverName}'e +100 odak enerjisi gönderdi!`;
    } else if (actionType === 'fire') {
      text = `🔥 ${senderName}, ${receiverName}'e yüksek odak alevi gönderdi!`;
    } else if (actionType === 'brain') {
      text = `🧠 ${senderName}, ${receiverName}'e zihin açıklığı ve başarı diledi!`;
    } else if (actionType === 'star') {
      text = `⭐ ${senderName}, ${receiverName}'e masa yıldızı rozeti takdim etti!`;
    } else {
      text = `✨ ${senderName}, ${receiverName}'e masa desteği gönderdi.`;
    }

    const msgId = uuidv4();
    await db.prepare(`
      INSERT INTO room_messages (id, room_id, user_id, message)
      VALUES (?, ?, ?, ?)
    `).run(msgId, roomId, userId, text);

    const messageObj = {
      id: msgId,
      sender: 'Kütüphane Görevlisi',
      text,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    };

    // Broadcast interaction & chat update
    broadcastRoomEvent(roomId, 'library-interaction', {
      senderId: userId,
      senderName,
      receiverId,
      actionType,
    });
    broadcastRoomEvent(roomId, 'new-message', messageObj);

    return NextResponse.json({ success: true, message: messageObj });
  } catch (err: any) {
    console.error('Room interact POST error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
