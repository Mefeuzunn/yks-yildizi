import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { getShopItem } from '@/lib/shop-items';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    
    // Join users and user_stats with equipped avatar & badge from user_inventory
    const leaderboard = await db.prepare(`
      SELECT u.id, u.username, s.league, s.league_points, s.solved_questions,
             (SELECT item_id FROM user_inventory WHERE user_id = u.id AND item_type = 'avatars' AND is_equipped = 1 LIMIT 1) as equipped_avatar,
             (SELECT item_id FROM user_inventory WHERE user_id = u.id AND item_type = 'badges' AND is_equipped = 1 LIMIT 1) as equipped_badge
      FROM users u
      LEFT JOIN user_stats s ON u.id = s.user_id
      WHERE u.role = 'ogrenci'
      ORDER BY s.league_points DESC NULLS LAST
      LIMIT 50
    `).all() as any[];

    // Add rank and resolve equipped vanity items
    const formattedBoard = leaderboard.map((user, index) => {
      let color = '#94a3b8'; // Bronz/Gümüş default
      if (user.league === 'Altın') color = '#fbbf24';
      if (user.league === 'Platin') color = '#e2e8f0';
      if (user.league === 'Şampiyon') color = '#f59e0b';

      const avatarItem = user.equipped_avatar ? getShopItem(user.equipped_avatar) : null;
      const badgeItem = user.equipped_badge ? getShopItem(user.equipped_badge) : null;
      
      return {
        rank: index + 1,
        id: `user-${index}`, // Mask UUID leak
        name: user.username,
        score: user.league_points || 0,
        tier: user.league || 'Bronz',
        color,
        isCurrentUser: user.id === userId,
        avatarEmoji: avatarItem?.emoji || null,
        avatarColor: avatarItem?.color || null,
        badgeName: badgeItem?.name || null,
        badgeEmoji: badgeItem?.emoji || null,
      };
    });

    let currentUserStats = null;
    if (userId) {
      currentUserStats = await db.prepare('SELECT league, league_points FROM user_stats WHERE user_id = ?').get(userId) as any;
    }

    return NextResponse.json({
      success: true,
      leaderboard: formattedBoard,
      currentUserStats: currentUserStats || { league: 'Bronz', league_points: 0 }
    }, { status: 200 });

  } catch (error) {
    console.error('Leaderboard API Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
