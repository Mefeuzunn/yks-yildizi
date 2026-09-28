import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedTeacherId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ studentId: string }> }) {
  try {
    const teacherId = await getAuthenticatedTeacherId(req);
    if (!teacherId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const { studentId } = await params;

    // Verify teacher has access to this student (student is in one of teacher's classes)
    const access = await db.prepare(`
      SELECT cs.class_id, tc.class_name
      FROM class_students cs
      JOIN teacher_classes tc ON cs.class_id = tc.id
      WHERE cs.student_id = ? AND tc.teacher_id = ?
      LIMIT 1
    `).get(studentId, teacherId) as any;

    if (!access) return NextResponse.json({ error: 'Bu ogrenciye erisim yetkiniz yok' }, { status: 403 });

    // Get student info
    const student = await db.prepare(`
      SELECT u.id, u.username, u.email, u.sinif, u.alan, u.created_at
      FROM users u WHERE u.id = ?
    `).get(studentId) as any;

    if (!student) return NextResponse.json({ error: 'Ogrenci bulunamadi' }, { status: 404 });

    // Get stats
    const stats = await db.prepare(`
      SELECT solved_questions, success_rate, streak_days, league, league_points, xp, last_active
      FROM user_stats WHERE user_id = ?
    `).get(studentId) as any;

    // Get recent errors (last 30 days, grouped by subject+topic)
    const weaknesses = await db.prepare(`
      SELECT subject, topic, COUNT(*) as error_count
      FROM error_log
      WHERE user_id = ? AND created_at > NOW() - INTERVAL '30 days'
      GROUP BY subject, topic
      ORDER BY error_count DESC
      LIMIT 10
    `).all(studentId) as any[];

    // Get weekly activity (last 4 weeks)
    const weeklyActivity = await db.prepare(`
      SELECT
        DATE_TRUNC('week', created_at) as week_start,
        COUNT(*) as questions_solved
      FROM error_log
      WHERE user_id = ? AND created_at > NOW() - INTERVAL '28 days'
      GROUP BY DATE_TRUNC('week', created_at)
      ORDER BY week_start ASC
    `).all(studentId) as any[];

    // Get focus sessions (last 7 days)
    const focusSessions = await db.prepare(`
      SELECT SUM(duration_min) as total_minutes, COUNT(*) as session_count
      FROM focus_sessions
      WHERE user_id = ? AND created_at > NOW() - INTERVAL '7 days'
    `).get(studentId) as any;

    // Get assignment performance
    const assignments = await db.prepare(`
      SELECT a.title, asub.status, asub.score, a.due_date, asub.submitted_at
      FROM assignment_submissions asub
      JOIN assignments a ON asub.assignment_id = a.id
      WHERE asub.student_id = ?
      ORDER BY a.created_at DESC
      LIMIT 10
    `).all(studentId) as any[];

    return NextResponse.json({
      student,
      className: access.class_name,
      stats: stats || {},
      weaknesses: weaknesses || [],
      weeklyActivity: weeklyActivity || [],
      focusSessions: focusSessions || { total_minutes: 0, session_count: 0 },
      assignments: assignments || [],
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
