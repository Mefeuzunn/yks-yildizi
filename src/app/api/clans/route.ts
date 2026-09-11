import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/yks-db-async';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request) {
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

    const clans = await db.prepare(`
      SELECT c.id, c.name, c.description, c.icon, c.color, c.leader_id, 
             c.weekly_xp, c.total_xp, c.created_at,
             COUNT(cm.user_id) as member_count 
      FROM clans c
      LEFT JOIN clan_members cm ON c.id = cm.clan_id
      GROUP BY c.id, c.name, c.description, c.icon, c.color, c.leader_id, c.weekly_xp, c.total_xp, c.created_at
      ORDER BY c.weekly_xp DESC
    `).all() as any[];

    const userClan = await db.prepare('SELECT clan_id FROM clan_members WHERE user_id = ?').get(userId) as any;

    return NextResponse.json({ clans, userClanId: userClan?.clan_id || null });
  } catch (error) {
    console.error('Clans GET Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

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
    const { name, description, icon, color } = body;

    if (!name || !description) {
      return NextResponse.json({ error: 'Ad ve açıklama zorunludur' }, { status: 400 });
    }

    const existingClan = await db.prepare('SELECT clan_id FROM clan_members WHERE user_id = ?').get(userId);
    if (existingClan) {
      return NextResponse.json({ error: 'Kullanıcının zaten bir klanı var' }, { status: 400 });
    }

    // Seviye Kontrolü: Klan kurmak için en az 1000 XP (Seviye 5) gereklidir
    const CLAN_CREATE_MIN_XP = 1000;
    const userStats = await db.prepare('SELECT xp FROM user_stats WHERE user_id = ?').get(userId) as any;
    const userXp = userStats?.xp || 0;
    if (userXp < CLAN_CREATE_MIN_XP) {
      return NextResponse.json({
        error: `Klan kurmak için en az ${CLAN_CREATE_MIN_XP} XP (Seviye 5) gereklidir. Şu anki XP'in: ${userXp}`,
        required_xp: CLAN_CREATE_MIN_XP,
        current_xp: userXp,
      }, { status: 403 });
    }

    const clanId = uuidv4();
    await db.prepare(`
      INSERT INTO clans (id, name, description, icon, color, weekly_xp, total_xp) 
      VALUES (?, ?, ?, ?, ?, 0, 0)
    `).run(clanId, name, description, icon || 'shield', color || '#3b82f6');

    await db.prepare(`
      INSERT INTO clan_members (clan_id, user_id, role, weekly_contribution) 
      VALUES (?, ?, 'leader', 0)
    `).run(clanId, userId);

    return NextResponse.json({ success: true, clanId });
  } catch (error) {
    console.error('Clans POST Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
