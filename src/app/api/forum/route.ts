import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

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
    const cookieStore = await cookies();
    let sessionId = cookieStore.get('yks_session')?.value;

    if (!sessionId) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        sessionId = authHeader.substring(7);
      }
    }

    if (!sessionId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const { title, content, tag } = await req.json();
    if (!title) return NextResponse.json({ error: 'Başlık zorunludur' }, { status: 400 });

    const postId = uuidv4();
    await db.prepare(`
      INSERT INTO forum_posts (id, user_id, title, content, tag)
      VALUES (?, ?, ?, ?, ?)
    `).run(postId, sessionId, title, content || '', tag || 'Genel');

    return NextResponse.json({ success: true, postId }, { status: 200 });
  } catch (error) {
    console.error('Forum POST Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
