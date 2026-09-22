import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/yks-db-async';
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
  return token; // fallback for legacy sessions
}

export async function GET(req: Request, { params }: { params: { studentId: string } }) {
  try {
    const teacherId = await getTeacherId();
    if (!teacherId) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });

    const teacher = await db.prepare('SELECT id, role FROM users WHERE id = ?').get(teacherId) as any;
    if (!teacher || teacher.role !== 'ogretmen') return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });

    const studentId = params.studentId;

    // 1. Basic student info + stats
    const student = await db.prepare(`
      SELECT u.id, u.username, u.alan, u.sinif, u.target_university, u.target_department,
             COALESCE(us.solved_questions, 0) as solved_questions,
             COALESCE(us.success_rate, 0) as success_rate,
             COALESCE(us.xp, 0) as xp,
             COALESCE(us.league, 'Bronz') as league,
             COALESCE(us.league_points, 0) as league_points,
             COALESCE(us.streak_days, 0) as streak_days,
             COALESCE(us.total_study_minutes, 0) as total_study_minutes
      FROM users u
      LEFT JOIN user_stats us ON u.id = us.user_id
      WHERE u.id = ?
    `).get(studentId) as any;

    if (!student) return NextResponse.json({ error: 'Öğrenci bulunamadı' }, { status: 404 });

    // 2. Focus sessions - weekly breakdown (last 7 days)
    let weeklyFocus: any[] = [];
    try {
      weeklyFocus = await db.prepare(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as session_count,
          SUM(COALESCE(duration_minutes, duration_min, 0)) as total_minutes,
          STRING_AGG(DISTINCT subject, ', ') as subjects
        FROM focus_sessions
        WHERE user_id = ?
          AND created_at >= NOW() - INTERVAL '7 days'
          AND mode = 'pomodoro'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `).all(studentId) as any[];
    } catch (_) {}

    // 3. Focus sessions - subject breakdown (all time)
    let subjectBreakdown: any[] = [];
    try {
      subjectBreakdown = await db.prepare(`
        SELECT 
          COALESCE(subject, 'Belirtilmemiş') as subject,
          COUNT(*) as session_count,
          SUM(COALESCE(duration_minutes, duration_min, 0)) as total_minutes
        FROM focus_sessions
        WHERE user_id = ?
          AND mode = 'pomodoro'
        GROUP BY subject
        ORDER BY total_minutes DESC
        LIMIT 8
      `).all(studentId) as any[];
    } catch (_) {}

    // 4. Focus sessions - recent 5
    let recentSessions: any[] = [];
    try {
      recentSessions = await db.prepare(`
        SELECT id, subject, topic, mode, 
               COALESCE(duration_minutes, duration_min, 0) as duration_minutes,
               created_at
        FROM focus_sessions
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 5
      `).all(studentId) as any[];
    } catch (_) {}

    // 5. Hata defteri - en çok hata yapılan konular
    let weaknesses: any[] = [];
    try {
      weaknesses = await db.prepare(`
        SELECT subject, topic, COUNT(*) as mistake_count
        FROM hata_defteri
        WHERE user_id = ?
        GROUP BY subject, topic
        ORDER BY mistake_count DESC
        LIMIT 10
      `).all(studentId) as any[];
    } catch (_) {
      try {
        weaknesses = await db.prepare(`
          SELECT konu as topic, ders as subject, COUNT(*) as mistake_count
          FROM hata_defteri
          WHERE user_id = ?
          GROUP BY konu, ders
          ORDER BY mistake_count DESC
          LIMIT 10
        `).all(studentId) as any[];
      } catch (_2) {}
    }

    // 6. Mock exam results
    let examResults: any[] = [];
    try {
      examResults = await db.prepare(`
        SELECT id, exam_name, total_net, tyt_net, ayt_net, created_at
        FROM mock_exams
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 5
      `).all(studentId) as any[];
    } catch (_) {}

    // 7. Assigned tasks
    let assignments: any[] = [];
    try {
      assignments = await db.prepare(`
        SELECT a.id, a.title, a.due_date, asub.status, asub.submitted_at
        FROM assignments a
        JOIN assignment_submissions asub ON a.id = asub.assignment_id
        WHERE asub.student_id = ? AND a.teacher_id = ?
        ORDER BY a.created_at DESC
        LIMIT 5
      `).all(studentId, teacherId) as any[];
    } catch (_) {}

    // 8. Last login / activity
    let lastActivity: any = null;
    try {
      const lastFocus = await db.prepare(`
        SELECT created_at FROM focus_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
      `).get(studentId) as any;
      lastActivity = lastFocus?.created_at ?? null;
    } catch (_) {}

    // 9. Total focus time this week
    let weeklyTotalMinutes = 0;
    try {
      const wt = await db.prepare(`
        SELECT SUM(COALESCE(duration_minutes, duration_min, 0)) as total
        FROM focus_sessions
        WHERE user_id = ? AND created_at >= NOW() - INTERVAL '7 days' AND mode = 'pomodoro'
      `).get(studentId) as any;
      weeklyTotalMinutes = wt?.total ?? 0;
    } catch (_) {}

    // 10. Konu tamamlanma ilerlemesi (subject_progress)
    let subjectProgress: any[] = [];
    try {
      subjectProgress = await db.prepare(`
        SELECT subject, topic, completion_rate, last_studied_at
        FROM subject_progress
        WHERE user_id = ?
        ORDER BY completion_rate DESC, last_studied_at DESC
        LIMIT 15
      `).all(studentId) as any[];
    } catch (_) {}

    // 11. Test sonuçları (test_sessions) — soru bazlı
    let testSessions: any[] = [];
    try {
      testSessions = await db.prepare(`
        SELECT id, test_type, score, correct_count, wrong_count, blank_count, created_at
        FROM test_sessions
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 10
      `).all(studentId) as any[];
    } catch (_) {}

    // 12. Sınıf ortalaması karşılaştırması
    let classAvgFocusMinutes = 0;
    let classStudentCount = 0;
    try {
      const classInfo = await db.prepare(`
        SELECT cs.class_id
        FROM class_students cs
        JOIN teacher_classes tc ON cs.class_id = tc.id
        WHERE cs.student_id = ? AND tc.teacher_id = ?
        LIMIT 1
      `).get(studentId, teacherId) as any;

      if (classInfo?.class_id) {
        const classStats = await db.prepare(`
          SELECT 
            COUNT(DISTINCT cs.student_id) as student_count,
            COALESCE(SUM(COALESCE(fs.duration_minutes, fs.duration_min, 0)), 0) / NULLIF(COUNT(DISTINCT cs.student_id), 0) as avg_weekly_minutes
          FROM class_students cs
          LEFT JOIN focus_sessions fs ON cs.student_id = fs.user_id
            AND fs.created_at >= NOW() - INTERVAL '7 days'
          WHERE cs.class_id = ?
        `).get(classInfo.class_id) as any;

        classAvgFocusMinutes = classStats?.avg_weekly_minutes ?? 0;
        classStudentCount = classStats?.student_count ?? 0;
      }
    } catch (_) {}

    return NextResponse.json({
      success: true,
      student,
      weeklyFocus,
      subjectBreakdown,
      recentSessions,
      weaknesses,
      examResults,
      assignments,
      lastActivity,
      weeklyTotalMinutes,
      subjectProgress,
      testSessions,
      classAvgFocusMinutes,
      classStudentCount,
    });
  } catch (error: any) {
    console.error('Student detail error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
