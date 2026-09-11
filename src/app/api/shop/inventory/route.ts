import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('yks_session')?.value;
    if (!sessionId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const inventory = await db.prepare('SELECT item_id FROM user_inventory WHERE user_id = ?').all(sessionId) as { item_id: string }[];
    const purchasedIds = inventory.map(item => item.item_id);

    return NextResponse.json({ purchased: purchasedIds });
  } catch (error) {
    console.error('Inventory GET Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
