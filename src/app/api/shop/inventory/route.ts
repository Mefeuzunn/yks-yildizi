import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const rows = await db.prepare(
      'SELECT item_id, item_type, is_equipped FROM user_inventory WHERE user_id = ?'
    ).all(userId) as any[];

    const purchasedIds = (rows || []).map(r => r.item_id);
    const equippedIds = (rows || []).filter(r => Number(r.is_equipped) === 1).map(r => r.item_id);

    return NextResponse.json({
      success: true,
      inventory: purchasedIds,
      purchased: purchasedIds,
      equipped: equippedIds,
    });
  } catch (error) {
    console.error('Inventory GET Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
