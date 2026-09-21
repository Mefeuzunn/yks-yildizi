import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/yks-db-async';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

async function getTeacherId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('yks_session')?.value;
  if (!token) return null;
  try {
    const payload = await verifyToken(token);
    if (payload?.userId) return payload.userId as string;
  } catch (_) {}
  return token;
}

export async function GET() {
  try {
    const teacherId = await getTeacherId();
    if (!teacherId) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });

    const user = await db.prepare('SELECT id, role FROM users WHERE id = ?').get(teacherId) as any;
    if (!user || user.role !== 'ogretmen') return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });

    const classes = await db.prepare(`
      SELECT tc.id, tc.class_name, tc.class_code, tc.created_at,
             COUNT(cs.student_id) as student_count,
             ROUND(CAST(AVG(COALESCE(us.success_rate, 0)) AS NUMERIC), 1) as avg_success
      FROM teacher_classes tc
      LEFT JOIN class_students cs ON tc.id = cs.class_id
      LEFT JOIN user_stats us ON cs.student_id = us.user_id
      WHERE tc.teacher_id = ?
      GROUP BY tc.id
      ORDER BY tc.created_at DESC
    `).all(user.id) as any[];

    return NextResponse.json({ classes });
  } catch (error) {
    console.error('Sınıflar listeleme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const teacherId = await getTeacherId();
    if (!teacherId) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });

    const user = await db.prepare('SELECT id, role FROM users WHERE id = ?').get(teacherId) as any;
    if (!user || user.role !== 'ogretmen') return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });

    const body = await request.json();
    const { class_name } = body;
    if (!class_name?.trim()) return NextResponse.json({ error: 'Sınıf adı gerekli' }, { status: 400 });

    const id = uuidv4();
    const classCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    await db.prepare('INSERT INTO teacher_classes (id, teacher_id, class_name, class_code) VALUES (?, ?, ?, ?)')
      .run(id, user.id, class_name.trim(), classCode);

    const created = await db.prepare('SELECT * FROM teacher_classes WHERE id = ?').get(id);
    return NextResponse.json({ class: created }, { status: 201 });
  } catch (error) {
    console.error('Sınıf oluşturma hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('yks_session')?.value;
    if (!sessionId) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });

    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(sessionId) as any;
    if (!user || user.role !== 'ogretmen') return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('id');
    if (!classId) return NextResponse.json({ error: 'Sınıf ID gerekli' }, { status: 400 });

    const cls = await db.prepare('SELECT id FROM teacher_classes WHERE id = ? AND teacher_id = ?').get(classId, user.id);
    if (!cls) return NextResponse.json({ error: 'Sınıf bulunamadı' }, { status: 404 });

    await db.prepare('DELETE FROM teacher_classes WHERE id = ?').run(classId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sınıf silme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
