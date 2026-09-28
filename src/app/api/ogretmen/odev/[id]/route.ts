import { NextResponse } from 'next/server';
import { getAuthenticatedTeacherId } from '@/lib/auth-utils';
import db from '@/lib/yks-db-async';
import crypto from 'crypto';

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

    const user = await db.prepare('SELECT id, role FROM users WHERE id = ?').get(teacherId) as any;
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

    const user = await db.prepare('SELECT id, role FROM users WHERE id = ?').get(teacherId) as any;
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

    // 1. Ödev Bilgilerini Güncelleme (Başlık, açıklama, tarih, kategori, ders, konu)
    if (body.isAssignmentUpdate || (body.title !== undefined && !body.studentId)) {
      const { title, description, due_date, category, subject, topic } = body;
      if (!title || !title.trim()) {
        return NextResponse.json({ error: 'Ödev başlığı gerekli' }, { status: 400 });
      }

      await db.prepare(`
        UPDATE assignments
        SET title = ?, description = ?, due_date = ?, category = ?, subject = ?, topic = ?
        WHERE id = ? AND teacher_id = ?
      `).run(
        title.trim(),
        description || null,
        due_date ? new Date(due_date).toISOString() : null,
        category || 'Genel',
        subject || null,
        topic || null,
        id,
        user.id
      );

      const updatedAssignment = await db.prepare('SELECT * FROM assignments WHERE id = ?').get(id);
      return NextResponse.json({ success: true, message: 'Ödev başarıyla güncellendi', assignment: updatedAssignment });
    }

    // 2. Öğrenci Teslim Durumunu Güncelleme (Yaptı / Yapmadı / Not)
    const { studentId, status, score } = body;

    if (!studentId) {
      return NextResponse.json({ error: 'Öğrenci ID veya Ödev bilgileri gerekli' }, { status: 400 });
    }

    let newStatus = status;
    let newScore = score !== undefined && score !== null && score !== '' ? Number(score) : null;
    let submittedAt: string | null = null;

    if (newScore !== null && !isNaN(newScore)) {
      newStatus = 'graded';
      submittedAt = new Date().toISOString();
    } else if (status === 'completed' || status === 'submitted') {
      newStatus = 'completed';
      submittedAt = new Date().toISOString();
    } else if (status === 'not_completed') {
      newStatus = 'not_completed';
      submittedAt = null;
      newScore = null;
    } else if (status === 'pending') {
      newStatus = 'pending';
      submittedAt = null;
      newScore = null;
    }

    const subId = crypto.randomUUID();

    await db.prepare(`
      INSERT INTO assignment_submissions (id, assignment_id, student_id, status, score, submitted_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT (assignment_id, student_id) DO UPDATE SET
        status = EXCLUDED.status,
        score = EXCLUDED.score,
        submitted_at = EXCLUDED.submitted_at
    `).run(
      subId,
      id,
      studentId,
      newStatus || 'completed',
      newScore,
      submittedAt
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Ödev durumu güncellendi',
      status: newStatus,
      score: newScore
    });
  } catch (error) {
    console.error('Ödev durumu güncelleme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const teacherId = await getAuthenticatedTeacherId(request);

    if (!teacherId) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    const user = await db.prepare('SELECT id, role FROM users WHERE id = ?').get(teacherId) as any;
    if (!user || user.role !== 'ogretmen') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { id } = await params;

    await db.prepare('DELETE FROM assignment_submissions WHERE assignment_id = ?').run(id);
    await db.prepare('DELETE FROM assignments WHERE id = ? AND teacher_id = ?').run(id, user.id);

    return NextResponse.json({ success: true, message: 'Ödev silindi' });
  } catch (error) {
    console.error('Ödev silme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
