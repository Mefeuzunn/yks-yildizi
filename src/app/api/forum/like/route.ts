import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('yks_session')?.value;
    if (!sessionId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const { postId } = await req.json();
    if (!postId) return NextResponse.json({ error: 'Post ID zorunludur' }, { status: 400 });

    // Check if like exists
    const existingLike = await db.prepare('SELECT id FROM forum_likes WHERE post_id = ? AND user_id = ?').get(postId, sessionId) as any;

    await db.transaction(async () => {
      if (existingLike) {
        // Remove like
        await db.prepare('DELETE FROM forum_likes WHERE id = ?').run(existingLike.id);
        await db.prepare('UPDATE forum_posts SET likes_count = likes_count - 1 WHERE id = ?').run(postId);
      } else {
        // Add like
        await db.prepare('INSERT INTO forum_likes (id, post_id, user_id) VALUES (?, ?, ?)')
          .run(uuidv4(), postId, sessionId);
        await db.prepare('UPDATE forum_posts SET likes_count = likes_count + 1 WHERE id = ?').run(postId);
      }
    })();

    const updatedPost = await db.prepare('SELECT likes_count FROM forum_posts WHERE id = ?').get(postId) as any;

    return NextResponse.json({ success: true, likes_count: updatedPost?.likes_count || 0, liked: !existingLike }, { status: 200 });
  } catch (error) {
    console.error('Forum Like Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
