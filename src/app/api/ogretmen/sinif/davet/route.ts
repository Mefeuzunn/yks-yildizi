import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedTeacherId } from '@/lib/auth-utils';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

// POST: Create an invite link for a class
export async function POST(req: Request) {
  try {
    const teacherId = await getAuthenticatedTeacherId(req);
    if (!teacherId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const user = await db.prepare('SELECT id, role FROM users WHERE id = ?').get(teacherId) as any;
    if (!user || user.role !== 'ogretmen') return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });

    const { classId } = await req.json();
    if (!classId) return NextResponse.json({ error: 'classId gerekli' }, { status: 400 });

    // Verify class belongs to teacher
    const cls = await db.prepare('SELECT * FROM teacher_classes WHERE id = ? AND teacher_id = ?').get(classId, teacherId) as any;
    if (!cls) return NextResponse.json({ error: 'Sınıf bulunamadı' }, { status: 404 });

    // Create invite_codes table if not exists
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS class_invite_codes (
        id TEXT PRIMARY KEY,
        class_id TEXT NOT NULL,
        teacher_id TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        max_uses INTEGER DEFAULT 0,
        use_count INTEGER DEFAULT 0,
        expires_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // Generate 6-char alphanumeric code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const id = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    await db.prepare(`
      INSERT INTO class_invite_codes (id, class_id, teacher_id, code, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, classId, teacherId, code, expiresAt);

    return NextResponse.json({
      success: true,
      code,
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://yks-yildizi.vercel.app'}/sinifa-katil?code=${code}`,
      expiresAt,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
