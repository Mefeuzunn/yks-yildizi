import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedTeacherId } from '@/lib/auth-utils';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const teacherId = await getAuthenticatedTeacherId(req);
    if (!teacherId) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

    const teacher = await db.prepare('SELECT id, role FROM users WHERE id = ?').get(teacherId) as any;
    if (!teacher || teacher.role !== 'ogretmen') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { classId, subject, topic, title, dueDate } = await req.json();
    if (!classId || !title) {
      return NextResponse.json({ error: 'classId ve title gerekli' }, { status: 400 });
    }

    // Sınıf yetkisi
    const teacherClass = await db.prepare(
      'SELECT id, class_name FROM teacher_classes WHERE id = ? AND teacher_id = ?'
    ).get(classId, teacherId) as any;
    if (!teacherClass) return NextResponse.json({ error: 'Sınıf bulunamadı' }, { status: 403 });

    // assignments tablosunu oluştur (yoksa)
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS assignments (
        id TEXT PRIMARY KEY,
        teacher_id TEXT NOT NULL,
        class_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        subject TEXT,
        topic TEXT,
        due_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS assignment_submissions (
        id TEXT PRIMARY KEY,
        assignment_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        score INTEGER,
        submitted_at TIMESTAMP,
        UNIQUE(assignment_id, student_id)
      )
    `).run();

    // Ödevi oluştur
    const assignmentId = uuidv4();
    await db.prepare(`
      INSERT INTO assignments (id, teacher_id, class_id, title, subject, topic, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(assignmentId, teacherId, classId, title, subject || null, topic || null, dueDate || null);

    // Sınıftaki öğrencilere submission kaydı oluştur
    const students = await db.prepare(
      'SELECT student_id FROM class_students WHERE class_id = ?'
    ).all(classId) as any[];

    for (const s of students) {
      await db.prepare(`
        INSERT INTO assignment_submissions (id, assignment_id, student_id)
        VALUES (?, ?, ?)
        ON CONFLICT (assignment_id, student_id) DO NOTHING
      `).run(uuidv4(), assignmentId, s.student_id);
    }

    return NextResponse.json({
      success: true,
      assignmentId,
      title,
      assignedTo: students.length,
      className: teacherClass.class_name
    });

  } catch (error: any) {
    console.error('Quick Assign Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
