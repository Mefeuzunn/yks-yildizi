import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { v4 as uuidv4 } from 'uuid';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');
    
    if (!postId) return NextResponse.json({ error: 'Post ID zorunludur' }, { status: 400 });

    const comments = await db.prepare(`
      SELECT c.*, u.username as author 
      FROM forum_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `).all(postId);

    return NextResponse.json(comments, { status: 200 });
  } catch (error) {
    console.error('Forum Comment GET Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const { postId, content } = await req.json();
    if (!postId || !content) return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });

    const commentId = uuidv4();
    
    await db.transaction(async () => {
      await db.prepare('INSERT INTO forum_comments (id, post_id, user_id, content) VALUES (?, ?, ?, ?)')
        .run(commentId, postId, userId, content);
        
      await db.prepare('UPDATE forum_posts SET replies_count = replies_count + 1 WHERE id = ?')
        .run(postId);
    })();

    return NextResponse.json({ success: true, commentId }, { status: 200 });
  } catch (error) {
    console.error('Forum Comment POST Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
