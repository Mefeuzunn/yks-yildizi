import { NextResponse } from 'next/server';
import { getAuthenticatedTeacherId } from '@/lib/auth-utils';
import db from '@/lib/yks-db-async';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const teacherId = await getAuthenticatedTeacherId(request);

    if (!teacherId) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(teacherId) as any;
    if (!user || user.role !== 'ogretmen') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { id } = await params;

    // Verify assignment belongs to this teacher
    const assignment = await db.prepare(
      'SELECT * FROM assignments WHERE id = ? AND teacher_id = ?'
    ).get(id, user.id) as any;

    if (!assignment) {
      return NextResponse.json({ error: 'Ödev bulunamadı' }, { status: 404 });
    }

    // Get all submissions with student info
    const submissions = await db.prepare(`
      SELECT asub.id as submission_id, asub.status, asub.score, asub.submitted_at,
             u.id as student_id, u.username
      FROM assignment_submissions asub
      JOIN users u ON asub.student_id = u.id
      WHERE asub.assignment_id = ?
      ORDER BY u.username ASC
    `).all(id) as any[];

    return NextResponse.json({ assignment, submissions });
  } catch (error) {
    console.error('Ödev detay hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const teacherId = await getAuthenticatedTeacherId(request);

    if (!teacherId) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(teacherId) as any;
    if (!user || user.role !== 'ogretmen') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { id } = await params;

    // Verify assignment belongs to this teacher
    const assignment = await db.prepare(
      'SELECT * FROM assignments WHERE id = ? AND teacher_id = ?'
    ).get(id, user.id) as any;

    if (!assignment) {
      return NextResponse.json({ error: 'Ödev bulunamadı' }, { status: 404 });
    }

    const body = await request.json();
    const { studentId, score } = body;

    if (!studentId) {
      return NextResponse.json({ error: 'Öğrenci ID gerekli' }, { status: 400 });
    }

    if (score === undefined || score === null) {
      return NextResponse.json({ error: 'Puan gerekli' }, { status: 400 });
    }

    const result = await db.prepare(`
      UPDATE assignment_submissions
      SET status = 'graded', score = ?
      WHERE assignment_id = ? AND student_id = ?
    `).run(score, id, studentId);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Gönderim bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Not verildi' });
  } catch (error) {
    console.error('Ödev puanlama hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
