import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);

    // Fetch all clans ordered by weekly XP
    const clans = await db.prepare(`
      SELECT c.id, c.name, c.description, c.icon, c.color, c.leader_id, 
             c.weekly_xp, c.total_xp, c.created_at,
             COUNT(cm.user_id) as member_count 
      FROM clans c
      LEFT JOIN clan_members cm ON c.id = cm.clan_id
      GROUP BY c.id, c.name, c.description, c.icon, c.color, c.leader_id, c.weekly_xp, c.total_xp, c.created_at
      ORDER BY c.weekly_xp DESC
    `).all() as any[];

    // User's clan if logged in
    let userClanId: string | null = null;
    if (userId) {
      const userClan = await db.prepare('SELECT clan_id FROM clan_members WHERE user_id = ?').get(userId) as any;
      userClanId = userClan?.clan_id || null;
    }

    // Calculate weekly season timing (Resets every Sunday 23:59:59 TR)
    const now = new Date();
    // TR is UTC+3
    const trNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const dayOfWeek = trNow.getUTCDay(); // 0 is Sunday
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    
    const endOfWeek = new Date(trNow);
    endOfWeek.setUTCDate(trNow.getUTCDate() + daysUntilSunday);
    endOfWeek.setUTCHours(23, 59, 59, 999);
    // Convert back to UTC for standard ISO
    const seasonEndUtc = new Date(endOfWeek.getTime() - 3 * 60 * 60 * 1000);

    const msLeft = Math.max(0, seasonEndUtc.getTime() - now.getTime());
    const daysLeft = Math.floor(msLeft / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));

    // Generate Head-to-Head Matchups
    const matchups: any[] = [];
    const tierTitles = [
      { title: '👑 Şampiyonluk & Efsane Finali', reward: '+1.000 XP / Üye & Altın Klan Sandığı', badge: '1. LİG FİNALİ' },
      { title: '🥉 Elmas Lig Sıralama Mücadelesi', reward: '+500 XP / Üye & Gümüş Sandık', badge: 'ELMAS LİG' },
      { title: '⚔️ Altın Lig Çekişmesi', reward: '+250 XP / Üye & Bronz Sandık', badge: 'ALTIN LİG' },
      { title: '🛡️ Klasman Kapışması', reward: '+100 XP / Üye & Demir Sandık', badge: 'KLASMAN' }
    ];

    for (let i = 0; i < clans.length; i += 2) {
      const clan1 = clans[i];
      const clan2 = clans[i + 1] || null;

      const tierIndex = Math.min(Math.floor(i / 2), tierTitles.length - 1);
      const tier = tierTitles[tierIndex];

      const xp1 = Number(clan1.weekly_xp) || 0;
      const xp2 = clan2 ? Number(clan2.weekly_xp) || 0 : 0;
      const totalXp = xp1 + xp2;
      const ratio1 = totalXp > 0 ? Math.round((xp1 / totalXp) * 100) : 50;
      const ratio2 = 100 - ratio1;

      const leadDifference = Math.abs(xp1 - xp2);
      const leadingClanId = xp1 > xp2 ? clan1.id : clan2 ? clan2.id : clan1.id;

      matchups.push({
        id: `match_${clan1.id}_${clan2 ? clan2.id : 'solo'}`,
        tier: tier.title,
        badge: tier.badge,
        reward: tier.reward,
        clan1: {
          id: clan1.id,
          name: clan1.name,
          icon: clan1.icon,
          color: clan1.color,
          weekly_xp: xp1,
          member_count: clan1.member_count,
          ratio: ratio1,
          isUserClan: userClanId === clan1.id
        },
        clan2: clan2 ? {
          id: clan2.id,
          name: clan2.name,
          icon: clan2.icon,
          color: clan2.color,
          weekly_xp: xp2,
          member_count: clan2.member_count,
          ratio: ratio2,
          isUserClan: userClanId === clan2.id
        } : null,
        leadingClanId,
        leadDifference
      });
    }

    // User's specific war matchup
    let myWarMatchup: any = null;
    if (userClanId) {
      myWarMatchup = matchups.find(m => m.clan1.id === userClanId || m.clan2?.id === userClanId) || null;
    }

    return NextResponse.json({
      success: true,
      season: {
        seasonNumber: 12,
        title: '2026 Klan Arenası - 12. Hafta Turnuvası',
        endsAt: seasonEndUtc.toISOString(),
        daysLeft,
        hoursLeft,
        minutesLeft,
      },
      userClanId,
      myWarMatchup,
      matchups
    });
  } catch (error: any) {
    console.error('Clans Wars API Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
