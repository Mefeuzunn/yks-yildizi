import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { getShopItem } from '@/lib/shop-items';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const body = await req.json();
    const { itemId, action = 'equip' } = body;

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID zorunludur' }, { status: 400 });
    }

    // Verify user owns this item
    const inventoryItem = await db.prepare(
      'SELECT id, item_id, item_type, is_equipped FROM user_inventory WHERE user_id = ? AND item_id = ?'
    ).get(userId, itemId) as any;

    if (!inventoryItem) {
      return NextResponse.json({ error: 'Bu eşyaya henüz sahip değilsiniz' }, { status: 403 });
    }

    const itemDef = getShopItem(itemId);
    const category = inventoryItem.item_type || itemDef?.category || 'avatars';

    if (action === 'unequip') {
      await db.prepare('UPDATE user_inventory SET is_equipped = 0 WHERE user_id = ? AND item_id = ?')
        .run(userId, itemId);

      return NextResponse.json({
        success: true,
        action: 'unequip',
        itemId,
        category,
      });
    }

    // Equip item: Unequip other items in same category, then equip this one (is_equipped is integer: 1 or 0)
    await db.transaction(async () => {
      await db.prepare('UPDATE user_inventory SET is_equipped = 0 WHERE user_id = ? AND item_type = ?')
        .run(userId, category);

      await db.prepare('UPDATE user_inventory SET is_equipped = 1, item_type = ? WHERE user_id = ? AND item_id = ?')
        .run(category, userId, itemId);
    });

    return NextResponse.json({
      success: true,
      action: 'equip',
      itemId,
      category,
    });

  } catch (error) {
    console.error('Equip POST Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
