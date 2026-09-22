import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUserId(req);

    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const clan = await db.prepare('SELECT * FROM clans WHERE id = ?').get(id);
    if (!clan) {
      return NextResponse.json({ error: 'Klan bulunamadı' }, { status: 404 });
    }

    const members = await db.prepare(`
      SELECT cm.user_id, cm.role, cm.weekly_contribution, u.username, s.league 
      FROM clan_members cm
      JOIN users u ON cm.user_id = u.id
      LEFT JOIN user_stats s ON cm.user_id = s.user_id
      WHERE cm.clan_id = ?
      ORDER BY cm.weekly_contribution DESC
    `).all(id);

    const logs = await db.prepare(`
      SELECT * FROM clan_weekly_log 
      WHERE clan_id = ? 
      ORDER BY created_at DESC 
      LIMIT 20
    `).all(id);

    return NextResponse.json({ clan, members, logs });
  } catch (error) {
    console.error('Clan Detail GET Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUserId(req);

    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const membership = await db.prepare('SELECT role FROM clan_members WHERE clan_id = ? AND user_id = ?').get(id, userId) as any;
    if (!membership || membership.role !== 'leader') {
      return NextResponse.json({ error: 'Sadece lider klanı silebilir' }, { status: 403 });
    }

    await db.prepare('DELETE FROM clan_weekly_log WHERE clan_id = ?').run(id);
    await db.prepare('DELETE FROM clan_members WHERE clan_id = ?').run(id);
    await db.prepare('DELETE FROM clans WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clan DELETE Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
