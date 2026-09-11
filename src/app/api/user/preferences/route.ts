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

    // Get user's first preference list
    const list = await db.prepare('SELECT * FROM preference_lists WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(userId) as any;
    
    if (!list) {
      return NextResponse.json({ success: true, list: { id: null, items: [] } }, { status: 200 });
    }

    // Get items with department and university details
    const query = `
      SELECT pi.id as item_id, pi.order_index, d.*, u.name as uni_name, u.city, u.type as uni_type
      FROM preference_items pi
      JOIN departments d ON pi.department_id = d.id
      JOIN universities u ON d.uni_id = u.id
      WHERE pi.list_id = ?
      ORDER BY pi.order_index ASC
    `;
    const items = await db.prepare(query).all(list.id) as any[];

    return NextResponse.json({ success: true, list: { id: list.id, title: list.title, items } }, { status: 200 });
  } catch (error) {
    console.error('Preferences GET Error:', error);
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
    const { departmentIds } = body; // Array of department IDs in order

    await db.transaction(async () => {
      // Find or create list
      const list = await db.prepare('SELECT id FROM preference_lists WHERE user_id = ? LIMIT 1').get(userId) as any;
      
      let listId = list?.id;
      if (!listId) {
        listId = uuidv4();
        await db.prepare('INSERT INTO preference_lists (id, user_id) VALUES (?, ?)').run(listId, userId);
      }

      // Clear old items
      await db.prepare('DELETE FROM preference_items WHERE list_id = ?').run(listId);

      // Insert new items
      const insertItem = await db.prepare('INSERT INTO preference_items (id, list_id, department_id, order_index) VALUES (?, ?, ?, ?)');
      departmentIds.forEach((depId: string, index: number) => {
        insertItem.run(uuidv4(), listId, depId, index + 1);
      });
    })();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Preferences POST Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
