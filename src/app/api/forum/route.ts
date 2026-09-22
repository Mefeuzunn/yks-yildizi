import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { v4 as uuidv4 } from 'uuid';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

// List forum posts
export async function GET(req: Request) {
  try {
    const posts = await db.prepare(`
      SELECT f.*, u.username as author
      FROM forum_posts f
      JOIN users u ON f.user_id = u.id
      ORDER BY f.created_at DESC
    `).all() as any[];

    // Calculate 'time ago' in UI, but we just return raw created_at
    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error('Forum GET Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// Create new post
export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const { title, content, tag } = await req.json();
    if (!title) return NextResponse.json({ error: 'Başlık zorunludur' }, { status: 400 });

    const postId = uuidv4();
    await db.prepare(`
      INSERT INTO forum_posts (id, user_id, title, content, tag)
      VALUES (?, ?, ?, ?, ?)
    `).run(postId, userId, title, content || '', tag || 'Genel');

    return NextResponse.json({ success: true, postId }, { status: 200 });
  } catch (error) {
    console.error('Forum POST Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
