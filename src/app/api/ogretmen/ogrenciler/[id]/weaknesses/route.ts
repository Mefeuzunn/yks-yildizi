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

    const teacher = await db.prepare('SELECT id, role FROM users WHERE id = ?').get(teacherId) as any;
    if (!teacher || teacher.role !== 'ogretmen') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { id: studentId } = await params;

    // Verify student is in one of this teacher's classes
    const isStudentOfTeacher = await db.prepare(`
      SELECT 1 FROM class_students cs
      JOIN teacher_classes tc ON cs.class_id = tc.id
      WHERE cs.student_id = ? AND tc.teacher_id = ?
    `).get(studentId, teacher.id);

    if (!isStudentOfTeacher) {
      return NextResponse.json({ error: 'Bu öğrenci sizin sınıflarınızda bulunmuyor.' }, { status: 403 });
    }

    // Query top 5 weaknesses from error_log
    const weaknesses = await db.prepare(`
      SELECT subject, topic, COUNT(*) as error_count
      FROM error_log
      WHERE user_id = ?
      GROUP BY subject, topic
      ORDER BY error_count DESC
      LIMIT 5
    `).all(studentId) as any[];

    // Map and inject active mistakes from student_mistakes
    const detailedWeaknesses = await Promise.all(weaknesses.map(async (w) => {
      const activeCountRow = await db.prepare(`
        SELECT COUNT(*) as active_count
        FROM student_mistakes
        WHERE user_id = ? AND subject = ? AND topic = ?
      `).get(studentId, w.subject, w.topic) as any;

      return {
        subject: w.subject,
        topic: w.topic,
        errorCount: w.error_count,
        activeCount: activeCountRow?.active_count || 0
      };
    }));

    return NextResponse.json({
      success: true,
      weaknesses: detailedWeaknesses
    });

  } catch (error: any) {
    console.error('Student Weaknesses API Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
