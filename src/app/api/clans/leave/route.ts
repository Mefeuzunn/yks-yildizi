import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);

    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const membership = await db.prepare('SELECT clan_id, role FROM clan_members WHERE user_id = ?').get(userId) as any;
    if (!membership) {
      return NextResponse.json({ error: 'Herhangi bir klanda bulunmuyorsunuz' }, { status: 400 });
    }

    const clanId = membership.clan_id;
    const isLeader = membership.role === 'leader';

    if (isLeader) {
      // Find the next leader
      const nextLeader = await db.prepare(`
        SELECT user_id FROM clan_members 
        WHERE clan_id = ? AND user_id != ? 
        ORDER BY weekly_contribution DESC, joined_at ASC 
        LIMIT 1
      `).get(clanId, userId) as any;

      if (nextLeader) {
        // Transfer leadership
        await db.prepare('UPDATE clan_members SET role = ? WHERE user_id = ?').run('leader', nextLeader.user_id);
        await db.prepare('DELETE FROM clan_members WHERE user_id = ?').run(userId);
      } else {
        // Delete clan if no other members
        await db.prepare('DELETE FROM clan_weekly_log WHERE clan_id = ?').run(clanId);
        await db.prepare('DELETE FROM clan_members WHERE clan_id = ?').run(clanId);
        await db.prepare('DELETE FROM clans WHERE id = ?').run(clanId);
      }
    } else {
      // Just leave
      await db.prepare('DELETE FROM clan_members WHERE user_id = ?').run(userId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clan Leave Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
