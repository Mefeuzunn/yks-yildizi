import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedTeacherId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ studentId: string }> }) {
  try {
    const teacherId = await getAuthenticatedTeacherId(req);
    if (!teacherId) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

    const { studentId } = await params;

    // 1. Yetki Kontrolü: Bu öğrenci öğretmenin herhangi bir sınıfında kayıtlı mı?
    const classAccess = await db.prepare(`
      SELECT tc.id as class_id, tc.class_name
      FROM class_students cs
      JOIN teacher_classes tc ON cs.class_id = tc.id
      WHERE cs.student_id = ? AND tc.teacher_id = ?
    `).all(studentId, teacherId) as any[];

    if (!classAccess || classAccess.length === 0) {
      return NextResponse.json({ error: 'Bu öğrenciye erişim yetkiniz yok.' }, { status: 403 });
    }

    const classNames = classAccess.map(c => c.class_name).join(', ');

    // 2. Öğrenci Temel Bilgileri
    const student = await db.prepare(`
      SELECT u.id, u.username, u.email, u.sinif, u.alan, u.target_university, u.target_department, u.created_at
      FROM users u WHERE u.id = ?
    `).get(studentId) as any;

    if (!student) return NextResponse.json({ error: 'Öğrenci bulunamadı' }, { status: 404 });

    // 3. Genel İstatistikler
    const stats = await db.prepare(`
      SELECT solved_questions, success_rate, streak_days, league, league_points, xp, last_active
      FROM user_stats WHERE user_id = ?
    `).get(studentId) as any;

    // 4. Canlı Odaklanma Durumu (active_focus_sessions)
    const activeSession = await db.prepare(`
      SELECT user_id, subject, topic, mode, duration_min, time_left_sec, started_at, last_heartbeat,
             GREATEST(1, ROUND(EXTRACT(EPOCH FROM (NOW() - started_at)) / 60))::int as elapsed_min
      FROM active_focus_sessions
      WHERE user_id = ? 
        AND last_heartbeat >= NOW() - INTERVAL '2 minutes' 
        AND mode = 'pomodoro'
    `).get(studentId) as any;

    const liveSession = activeSession ? {
      isLive: true,
      subject: activeSession.subject || 'Genel Çalışma',
      topic: activeSession.topic || '',
      mode: activeSession.mode,
      duration_min: Number(activeSession.duration_min) || 25,
      time_left_sec: Number(activeSession.time_left_sec) || 0,
      started_at: activeSession.started_at,
      elapsed_min: Number(activeSession.elapsed_min) || 1,
    } : { isLive: false };

    // 5. Odaklanma Oturumları Geçmişi (Tüm soru, doğru, yanlış, net detaylarıyla)
    const recentSessions = await db.prepare(`
      SELECT id, subject, topic, task_name, mode,
             COALESCE(duration_minutes, duration_min, 0)::int as duration_min,
             COALESCE(questions_solved, 0)::int as questions_solved,
             COALESCE(correct_count, 0)::int as correct_count,
             COALESCE(wrong_count, 0)::int as wrong_count,
             COALESCE(empty_count, 0)::int as empty_count,
             COALESCE(net_score, 0)::float as net_score,
             created_at
      FROM focus_sessions
      WHERE user_id = ? 
        AND (mode = 'pomodoro' OR mode IS NULL OR mode NOT IN ('shortBreak', 'longBreak'))
      ORDER BY created_at DESC
      LIMIT 50
    `).all(studentId) as any[];

    // 6. Ders Bazlı Toplam Çalışma & Soru Dağılımı
    const subjectBreakdown = await db.prepare(`
      SELECT 
        COALESCE(subject, 'Diğer') as subject,
        COALESCE(SUM(COALESCE(duration_minutes, duration_min, 0)), 0)::int as total_minutes,
        COALESCE(SUM(COALESCE(questions_solved, 0)), 0)::int as total_questions,
        COALESCE(SUM(COALESCE(correct_count, 0)), 0)::int as total_correct,
        COALESCE(SUM(COALESCE(wrong_count, 0)), 0)::int as total_wrong,
        COALESCE(SUM(COALESCE(net_score, 0)), 0)::float as total_net,
        COUNT(*)::int as session_count
      FROM focus_sessions
      WHERE user_id = ? 
        AND (mode = 'pomodoro' OR mode IS NULL OR mode NOT IN ('shortBreak', 'longBreak'))
      GROUP BY subject
      ORDER BY total_minutes DESC
    `).all(studentId) as any[];

    // 7. Son 14 Günlük Odaklanma ve Soru Çözüm Trendi
    const dailyActivity = await db.prepare(`
      SELECT 
        DATE(created_at) as day,
        COALESCE(SUM(COALESCE(duration_minutes, duration_min, 0)), 0)::int as total_minutes,
        COALESCE(SUM(COALESCE(questions_solved, 0)), 0)::int as total_questions,
        COALESCE(SUM(COALESCE(correct_count, 0)), 0)::int as total_correct,
        COALESCE(SUM(COALESCE(wrong_count, 0)), 0)::int as total_wrong
      FROM focus_sessions
      WHERE user_id = ? 
        AND (mode = 'pomodoro' OR mode IS NULL OR mode NOT IN ('shortBreak', 'longBreak'))
        AND created_at >= NOW() - INTERVAL '14 days'
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    `).all(studentId) as any[];

    // 8. Zayıf Konular (Error Log)
    const weaknesses = await db.prepare(`
      SELECT subject, topic, COUNT(*)::int as error_count
      FROM error_log
      WHERE user_id = ? AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY subject, topic
      ORDER BY error_count DESC
      LIMIT 15
    `).all(studentId) as any[];

    // 9. Deneme Sınavı Netleri (mock_exams)
    const mockExams = await db.prepare(`
      SELECT id, exam_type, exam_name, exam_date, total_net, details_json, created_at
      FROM mock_exams
      WHERE user_id = ?
      ORDER BY exam_date DESC
      LIMIT 15
    `).all(studentId) as any[];

    // 10. Bu Öğretmenin Öğrenciye Verdiği Ödevler (Gizlilik: Başka öğretmenlerin ödevleri gösterilmez)
    const assignments = await db.prepare(`
      SELECT a.id, a.title, a.due_date, a.created_at, asub.status, asub.score, asub.submitted_at
      FROM assignment_submissions asub
      JOIN assignments a ON asub.assignment_id = a.id
      WHERE asub.student_id = ? AND a.teacher_id = ?
      ORDER BY a.created_at DESC
      LIMIT 20
    `).all(studentId, teacherId) as any[];

    // 11. Toplam İstatistik Özetleri
    const totalFocusRow = await db.prepare(`
      SELECT 
        COALESCE(SUM(COALESCE(duration_minutes, duration_min, 0)), 0)::int as total_minutes,
        COALESCE(SUM(COALESCE(questions_solved, 0)), 0)::int as total_questions,
        COALESCE(SUM(COALESCE(correct_count, 0)), 0)::int as total_correct,
        COALESCE(SUM(COALESCE(wrong_count, 0)), 0)::int as total_wrong,
        COALESCE(SUM(COALESCE(net_score, 0)), 0)::float as total_net,
        COUNT(*)::int as total_sessions
      FROM focus_sessions
      WHERE user_id = ? 
        AND (mode = 'pomodoro' OR mode IS NULL OR mode NOT IN ('shortBreak', 'longBreak'))
    `).get(studentId) as any;

    return NextResponse.json({
      student,
      className: classNames,
      stats: stats || {},
      liveSession,
      totals: {
        totalMinutes: Number(totalFocusRow?.total_minutes) || 0,
        totalQuestions: Number(totalFocusRow?.total_questions) || 0,
        totalCorrect: Number(totalFocusRow?.total_correct) || 0,
        totalWrong: Number(totalFocusRow?.total_wrong) || 0,
        totalNet: Number(totalFocusRow?.total_net) || 0,
        totalSessions: Number(totalFocusRow?.total_sessions) || 0,
      },
      recentSessions: recentSessions || [],
      subjectBreakdown: subjectBreakdown || [],
      dailyActivity: (dailyActivity || []).map(d => ({
        day: typeof d.day === 'string' ? d.day : new Date(d.day).toISOString().split('T')[0],
        total_minutes: Number(d.total_minutes) || 0,
        total_questions: Number(d.total_questions) || 0,
      })),
      weaknesses: weaknesses || [],
      mockExams: mockExams || [],
      assignments: assignments || [],
    });
  } catch (e: any) {
    console.error('Student detail API error:', e);
    return NextResponse.json({ error: e.message || 'Sunucu hatası' }, { status: 500 });
  }
}
