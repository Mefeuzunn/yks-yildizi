import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/yks-db-async';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('yks_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(sessionId) as any;
    if (!user || user.role !== 'ogretmen') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const teacherId = user.id;

    const studentCount = await db.prepare(`
      SELECT COUNT(DISTINCT cs.student_id) as total
      FROM class_students cs
      JOIN teacher_classes tc ON cs.class_id = tc.id
      WHERE tc.teacher_id = ?
    `).get(teacherId) as any;

    const classCount = await db.prepare(`
      SELECT COUNT(*) as total FROM teacher_classes WHERE teacher_id = ?
    `).get(teacherId) as any;

    const assignmentCount = await db.prepare(`
      SELECT COUNT(*) as total FROM assignments
      WHERE teacher_id = ?
        AND (due_date IS NULL OR due_date >= CURRENT_TIMESTAMP)
    `).get(teacherId) as any;

    const avgSuccess = await db.prepare(`
      SELECT AVG(us.success_rate) as avg_rate
      FROM user_stats us
      JOIN class_students cs ON us.user_id = cs.student_id
      JOIN teacher_classes tc ON cs.class_id = tc.id
      WHERE tc.teacher_id = ?
    `).get(teacherId) as any;

    // Son 5 duyuru
    const recentAnnouncements = await db.prepare(`
      SELECT id, title, content, created_at,
             (SELECT tc.class_name FROM teacher_classes tc WHERE tc.id = teacher_announcements.class_id) as class_name
      FROM teacher_announcements
      WHERE teacher_id = ?
      ORDER BY created_at DESC LIMIT 5
    `).all(teacherId) as any[];

    // Süresi yaklaşan ödevler (7 gün içinde)
    const upcomingDeadlines = await db.prepare(`
      SELECT a.id, a.title, a.due_date,
             COUNT(asub.id) as total_assigned,
             SUM(CASE WHEN asub.status IN ('submitted','graded') THEN 1 ELSE 0 END) as submitted_count
      FROM assignments a
      LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id
      WHERE a.teacher_id = ?
        AND a.due_date IS NOT NULL
        AND a.due_date >= CURRENT_TIMESTAMP
        AND a.due_date <= CURRENT_TIMESTAMP + INTERVAL '7 days'
      GROUP BY a.id
      ORDER BY a.due_date ASC
      LIMIT 5
    `).all(teacherId) as any[];

    // En aktif öğrenci (en yüksek streak)
    const mostActiveStudent = await db.prepare(`
      SELECT DISTINCT u.username, COALESCE(us.streak_days, 0) as streak_days
      FROM users u
      JOIN class_students cs ON u.id = cs.student_id
      JOIN teacher_classes tc ON cs.class_id = tc.id
      LEFT JOIN user_stats us ON u.id = us.user_id
      WHERE tc.teacher_id = ?
      ORDER BY streak_days DESC LIMIT 1
    `).get(teacherId) as any;

    return NextResponse.json({
      totalStudents: studentCount?.total ?? 0,
      classCount: classCount?.total ?? 0,
      activeAssignments: assignmentCount?.total ?? 0,
      avgSuccess: Math.round((avgSuccess?.avg_rate ?? 0) * 100) / 100,
      recentAnnouncements,
      upcomingDeadlines,
      mostActiveStudent,
    });
  } catch (error) {
    console.error('Dashboard hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
