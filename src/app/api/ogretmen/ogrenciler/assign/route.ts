import { NextResponse } from 'next/server';
import { getAuthenticatedTeacherId } from '@/lib/auth-utils';
import db from '@/lib/yks-db-async';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const teacherId = await getAuthenticatedTeacherId(request);
    if (!teacherId) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });

    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(teacherId) as any;
    if (!user || user.role !== 'ogretmen') return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });

    const { student_id, class_id } = await request.json();
    if (!student_id) return NextResponse.json({ error: 'Öğrenci ID gerekli' }, { status: 400 });

    // Verify student belongs to this teacher (either via teacher_students or class_students)
    const isMyStudent = await db.prepare(`
      SELECT 1 FROM class_students cs 
      JOIN teacher_classes tc ON cs.class_id = tc.id 
      WHERE tc.teacher_id = ? AND cs.student_id = ?
      UNION
      SELECT 1 FROM teacher_students 
      WHERE teacher_id = ? AND student_id = ?
    `).get(user.id, student_id, user.id, student_id);

    if (!isMyStudent) return NextResponse.json({ error: 'Bu öğrenci size bağlı değil' }, { status: 403 });

    // Remove student from any existing classes owned by this teacher
    const teacherClasses = await db.prepare('SELECT id FROM teacher_classes WHERE teacher_id = ?').all(user.id) as any[];
    if (teacherClasses.length > 0) {
      const placeholders = teacherClasses.map(() => '?').join(',');
      const classIds = teacherClasses.map(c => c.id);
      const query = `DELETE FROM class_students WHERE student_id = ? AND class_id IN (${placeholders})`;
      await db.prepare(query).run(student_id, ...classIds);
    }

    if (class_id) {
      // Assign to the new class
      const isValidClass = await db.prepare('SELECT 1 FROM teacher_classes WHERE id = ? AND teacher_id = ?').get(class_id, user.id);
      if (!isValidClass) return NextResponse.json({ error: 'Geçersiz sınıf' }, { status: 400 });
      
      await db.prepare('INSERT INTO class_students (class_id, student_id) VALUES (?, ?) ON CONFLICT DO NOTHING').run(class_id, student_id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Öğrenci atama hatası:', error);
    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}
