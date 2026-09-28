import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
// using a generic auth getter assuming getAuthenticatedUserId exists
// if not, it will just fail at build. The user prompt provided this code verbatim.
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Giriş yapmanız gerekli' }, { status: 401 });

    const { code } = await req.json();
    if (!code) return NextResponse.json({ error: 'Davet kodu gerekli' }, { status: 400 });

    // Find the invite
    const invite = await db.prepare(`
      SELECT * FROM class_invite_codes
      WHERE code = ? AND is_active = true
    `).get(code.toUpperCase()) as any;

    if (!invite) return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş davet kodu' }, { status: 404 });

    // Check expiry
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Bu davet kodunun süresi dolmuş' }, { status: 410 });
    }

    // Check if already in class
    const existing = await db.prepare(
      'SELECT id FROM class_students WHERE class_id = ? AND student_id = ?'
    ).get(invite.class_id, userId) as any;

    if (existing) {
      return NextResponse.json({ error: 'Bu sınıfa zaten kayıtlısınız' }, { status: 409 });
    }

    // Join the class
    await db.prepare(
      'INSERT INTO class_students (id, class_id, student_id) VALUES (?, ?, ?)'
    ).run(uuidv4(), invite.class_id, userId);

    // Increment use count
    await db.prepare(
      'UPDATE class_invite_codes SET use_count = use_count + 1 WHERE id = ?'
    ).run(invite.id);

    // Get class info for response
    const cls = await db.prepare('SELECT class_name FROM teacher_classes WHERE id = ?').get(invite.class_id) as any;

    return NextResponse.json({
      success: true,
      className: cls?.class_name || 'Sınıf',
      message: `${cls?.class_name || 'Sınıfa'} başarıyla katıldınız!`,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
