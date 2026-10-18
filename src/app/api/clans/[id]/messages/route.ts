import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clanId } = await params;
    const userId = await getAuthenticatedUserId(req);

    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Tabloyu kontrol et / oluştur
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS clan_messages (
        id TEXT PRIMARY KEY,
        clan_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    // Üyelik kontrolü
    const membership = await db.prepare(
      'SELECT role FROM clan_members WHERE clan_id = ? AND user_id = ?'
    ).get(clanId, userId) as any;

    if (!membership) {
      return NextResponse.json({ error: 'Bu klanın mesajlarını görmek için üye olmalısınız' }, { status: 403 });
    }

    // Son 50 mesajı getir
    const messages = await db.prepare(`
      SELECT m.id, m.message, m.created_at, m.user_id, u.username, cm.role as member_role
      FROM clan_messages m
      JOIN users u ON m.user_id = u.id
      JOIN clan_members cm ON cm.clan_id = m.clan_id AND cm.user_id = m.user_id
      WHERE m.clan_id = ?
      ORDER BY m.created_at ASC
      LIMIT 50
    `).all(clanId) as any[];

    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      userId: msg.user_id,
      username: msg.username,
      message: msg.message,
      role: msg.member_role,
      isMe: msg.user_id === userId,
      createdAt: msg.created_at
    }));

    return NextResponse.json({
      success: true,
      messages: formattedMessages
    });
  } catch (error: any) {
    console.error('Clan Messages GET Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clanId } = await params;
    const userId = await getAuthenticatedUserId(req);

    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Üyelik kontrolü
    const membership = await db.prepare(
      'SELECT role FROM clan_members WHERE clan_id = ? AND user_id = ?'
    ).get(clanId, userId) as any;

    if (!membership) {
      return NextResponse.json({ error: 'Sadece klan üyeleri mesaj yazabilir' }, { status: 403 });
    }

    const body = await req.json();
    const message = body?.message?.trim();

    if (!message || message.length === 0) {
      return NextResponse.json({ error: 'Mesaj boş olamaz' }, { status: 400 });
    }

    if (message.length > 500) {
      return NextResponse.json({ error: 'Mesaj en fazla 500 karakter olabilir' }, { status: 400 });
    }

    const messageId = uuidv4();
    const user = await db.prepare('SELECT username FROM users WHERE id = ?').get(userId) as any;

    await db.prepare(`
      INSERT INTO clan_messages (id, clan_id, user_id, message)
      VALUES (?, ?, ?, ?)
    `).run(messageId, clanId, userId, message);

    return NextResponse.json({
      success: true,
      message: {
        id: messageId,
        userId,
        username: user?.username || 'Kullanıcı',
        message,
        role: membership.role,
        isMe: true,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Clan Messages POST Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
