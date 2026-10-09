import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { v4 as uuidv4 } from 'uuid';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

// List forum posts with author badges & avatars
export async function GET(req: Request) {
  try {
    const posts = await db.prepare(`
      SELECT 
        f.*, 
        u.username as author,
        (SELECT ui.item_id FROM user_inventory ui WHERE ui.user_id = f.user_id AND ui.item_type = 'avatars' AND ui.is_equipped = 1 LIMIT 1) as equipped_avatar,
        (SELECT ui.item_id FROM user_inventory ui WHERE ui.user_id = f.user_id AND ui.item_type = 'badges' AND ui.is_equipped = 1 LIMIT 1) as equipped_badge
      FROM forum_posts f
      JOIN users u ON f.user_id = u.id
      ORDER BY f.created_at DESC
    `).all() as any[];

    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error('Forum GET Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// Create new post (supports title, content, tag, image_url)
export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const { title, content, tag, image_url } = await req.json();
    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Başlık zorunludur' }, { status: 400 });
    }

    const postId = uuidv4();
    await db.prepare(`
      INSERT INTO forum_posts (id, user_id, title, content, tag, image_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(postId, userId, title.trim(), content || '', tag || 'Genel', image_url || null);

    return NextResponse.json({ success: true, postId }, { status: 200 });
  } catch (error) {
    console.error('Forum POST Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
