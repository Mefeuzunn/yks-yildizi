import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { getShopItem } from '@/lib/shop-items';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const { itemId, price } = await req.json();

    if (!itemId || price === undefined) {
      return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
    }

    // Check user points
    const stats = await db.prepare('SELECT league_points FROM user_stats WHERE user_id = ?').get(userId) as any;
    if (!stats) return NextResponse.json({ error: 'İstatistik bulunamadı' }, { status: 404 });

    if (stats.league_points < price) {
      return NextResponse.json({ error: 'Yetersiz Yıldız Puanı (XP)' }, { status: 400 });
    }

    // Check if already owns
    const existing = await db.prepare('SELECT id FROM user_inventory WHERE user_id = ? AND item_id = ?').get(userId, itemId);
    if (existing) {
      return NextResponse.json({ error: 'Bu eşyaya zaten sahipsiniz' }, { status: 400 });
    }

    const itemDef = getShopItem(itemId);
    const itemType = itemDef?.category || 'avatars';
    const invId = uuidv4();

    // Transaction to deduct points and add item (is_equipped defaults to 0)
    await db.transaction(async () => {
      await db.prepare('UPDATE user_stats SET league_points = league_points - ? WHERE user_id = ?').run(price, userId);
      await db.prepare('INSERT INTO user_inventory (id, user_id, item_id, item_type, is_equipped) VALUES (?, ?, ?, ?, 0)')
        .run(invId, userId, itemId, itemType);
    })();

    return NextResponse.json({ success: true, newPoints: stats.league_points - price, itemId });
  } catch (error) {
    console.error('Buy Item POST Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
