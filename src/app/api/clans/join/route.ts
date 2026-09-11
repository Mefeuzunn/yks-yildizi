import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/yks-db-async';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    let userId = cookieStore.get('yks_session')?.value;
    
    if (!userId) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        userId = authHeader.substring(7);
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const { clanId } = body;

    if (!clanId) {
      return NextResponse.json({ error: 'Klan ID zorunludur' }, { status: 400 });
    }

    // Check if user already has a clan
    const existingMembership = await db.prepare('SELECT clan_id FROM clan_members WHERE user_id = ?').get(userId);
    if (existingMembership) {
      return NextResponse.json({ error: 'Zaten bir klanda bulunuyorsunuz' }, { status: 400 });
    }

    // Check if clan exists
    const clan = await db.prepare('SELECT id FROM clans WHERE id = ?').get(clanId);
    if (!clan) {
      return NextResponse.json({ error: 'Klan bulunamadı' }, { status: 404 });
    }

    const memberId = uuidv4();
    await db.prepare(`
      INSERT INTO clan_members (id, clan_id, user_id, role, weekly_contribution) 
      VALUES (?, ?, ?, 'member', 0)
    `).run(memberId, clanId, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clan Join Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
