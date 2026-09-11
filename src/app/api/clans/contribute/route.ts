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
    const { amount, action } = body;

    if (!amount || typeof amount !== 'number' || !action) {
      return NextResponse.json({ error: 'Miktar ve eylem (action) zorunludur' }, { status: 400 });
    }

    const membership = await db.prepare('SELECT clan_id FROM clan_members WHERE user_id = ?').get(userId) as any;
    if (!membership) {
      return NextResponse.json({ error: 'Kullanıcı bir klanda değil' }, { status: 400 });
    }

    const clanId = membership.clan_id;

    // Update user's weekly contribution
    await db.prepare(`
      UPDATE clan_members 
      SET weekly_contribution = weekly_contribution + ? 
      WHERE user_id = ?
    `).run(amount, userId);

    // Update clan's weekly and total xp
    await db.prepare(`
      UPDATE clans 
      SET weekly_xp = weekly_xp + ?, total_xp = total_xp + ? 
      WHERE id = ?
    `).run(amount, amount, clanId);

    // Insert into weekly log
    const logId = uuidv4();
    await db.prepare(`
      INSERT INTO clan_weekly_log (id, clan_id, user_id, action, amount) 
      VALUES (?, ?, ?, ?, ?)
    `).run(logId, clanId, userId, action, amount);

    return NextResponse.json({ success: true, addedXp: amount });
  } catch (error) {
    console.error('Clan Contribute Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
