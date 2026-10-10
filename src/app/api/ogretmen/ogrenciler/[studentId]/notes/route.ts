import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedTeacherId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

async function ensureNotesTable() {
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS teacher_student_notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        teacher_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        note TEXT NOT NULL,
        category TEXT DEFAULT 'genel',
        is_shared_with_parent BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    try {
      await db.prepare("ALTER TABLE teacher_student_notes ADD COLUMN IF NOT EXISTS is_shared_with_parent BOOLEAN DEFAULT true").run();
    } catch (_) {}
  } catch (e) {
    console.error('Error ensuring teacher_student_notes table:', e);
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ studentId: string }> | { studentId: string } }
) {
  try {
    const teacherId = await getAuthenticatedTeacherId(req);
    if (!teacherId) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

    const user = await db.prepare('SELECT id, role FROM users WHERE id = ?').get(teacherId) as any;
    if (!user || user.role !== 'ogretmen') return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });

    const resolvedParams = await Promise.resolve(params);
    const studentId = resolvedParams.studentId;
    if (!studentId) return NextResponse.json({ error: 'Öğrenci ID gerekli' }, { status: 400 });

    await ensureNotesTable();

    const notes = await db.prepare(`
      SELECT id, teacher_id, student_id, note, category, is_shared_with_parent, created_at, updated_at
      FROM teacher_student_notes
      WHERE teacher_id = ? AND student_id = ?
      ORDER BY created_at DESC
    `).all(teacherId, studentId) as any[];

    return NextResponse.json({ success: true, notes: notes || [] });
  } catch (e: any) {
    console.error('Get student notes error:', e);
    return NextResponse.json({ error: e.message || 'Sunucu hatası' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ studentId: string }> | { studentId: string } }
) {
  try {
    const teacherId = await getAuthenticatedTeacherId(req);
    if (!teacherId) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

    const user = await db.prepare('SELECT id, role FROM users WHERE id = ?').get(teacherId) as any;
    if (!user || user.role !== 'ogretmen') return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });

    const resolvedParams = await Promise.resolve(params);
    const studentId = resolvedParams.studentId;
    if (!studentId) return NextResponse.json({ error: 'Öğrenci ID gerekli' }, { status: 400 });

    const body = await req.json();
    const { note, category = 'genel', isSharedWithParent = true } = body;

    if (!note || !note.trim()) {
      return NextResponse.json({ error: 'Not içeriği boş olamaz' }, { status: 400 });
    }

    await ensureNotesTable();

    const createdNote = await db.prepare(`
      INSERT INTO teacher_student_notes (teacher_id, student_id, note, category, is_shared_with_parent)
      VALUES (?, ?, ?, ?, ?)
      RETURNING id, teacher_id, student_id, note, category, is_shared_with_parent, created_at, updated_at
    `).get(teacherId, studentId, note.trim(), category || 'genel', isSharedWithParent !== false);

    return NextResponse.json({ success: true, note: createdNote }, { status: 201 });
  } catch (e: any) {
    console.error('Create student note error:', e);
    return NextResponse.json({ error: e.message || 'Sunucu hatası' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ studentId: string }> | { studentId: string } }
) {
  try {
    const teacherId = await getAuthenticatedTeacherId(req);
    if (!teacherId) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

    const user = await db.prepare('SELECT id, role FROM users WHERE id = ?').get(teacherId) as any;
    if (!user || user.role !== 'ogretmen') return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const noteId = searchParams.get('noteId');

    if (!noteId) {
      return NextResponse.json({ error: 'Silinecek not ID gerekli' }, { status: 400 });
    }

    await ensureNotesTable();

    await db.prepare(`
      DELETE FROM teacher_student_notes
      WHERE id = ? AND teacher_id = ?
    `).run(noteId, teacherId);

    return NextResponse.json({ success: true, message: 'Not silindi' });
  } catch (e: any) {
    console.error('Delete student note error:', e);
    return NextResponse.json({ error: e.message || 'Sunucu hatası' }, { status: 500 });
  }
}
