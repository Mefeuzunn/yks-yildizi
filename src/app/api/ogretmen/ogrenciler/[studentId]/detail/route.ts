import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedTeacherId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ studentId: string }> }) {
  try {
    const teacherId = await getAuthenticatedTeacherId(req);
    if (!teacherId) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

    const teacher = await db.prepare('SELECT id, role FROM users WHERE id = ?').get(teacherId) as any;
    if (!teacher || teacher.role !== 'ogretmen') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { studentId } = await params;

    // 1. Öğrenci Temel Bilgileri
    const student = await db.prepare(`
      SELECT u.id, u.username, u.email, u.sinif, u.alan, u.target_university, u.target_department, u.created_at
      FROM users u WHERE u.id = ?
    `).get(studentId) as any;

    if (!student) return NextResponse.json({ error: 'Öğrenci bulunamadı' }, { status: 404 });

    // 2. Sınıf Bilgisi
    let classNames = 'Kayıtlı Öğrenci';
    try {
      const classAccess = await db.prepare(`
        SELECT tc.id as class_id, tc.class_name
        FROM class_students cs
        JOIN teacher_classes tc ON cs.class_id = tc.id
        WHERE cs.student_id = ? AND tc.teacher_id = ?
      `).all(studentId, teacherId) as any[];

      if (classAccess && classAccess.length > 0) {
        classNames = classAccess.map(c => c.class_name).filter(Boolean).join(', ');
      }
    } catch (_) {}

    // 3. Genel İstatistikler (user_stats)
    let stats: any = {};
    try {
      const statsRow = await db.prepare(`
        SELECT solved_questions, success_rate, streak_days, league, league_points, xp
        FROM user_stats WHERE user_id = ?
      `).get(studentId) as any;
      stats = statsRow || {};
    } catch (e) {
      console.error('Error fetching user_stats:', e);
    }

    // 4. Canlı Odaklanma Durumu (active_focus_sessions)
    let liveSession: any = { isLive: false };
    try {
      const activeSession = await db.prepare(`
        SELECT user_id, subject, topic, mode, duration_min, time_left_sec, started_at, last_heartbeat,
               GREATEST(1, ROUND(EXTRACT(EPOCH FROM (NOW() - started_at)) / 60))::int as elapsed_min
        FROM active_focus_sessions
        WHERE user_id = ? 
          AND last_heartbeat >= NOW() - INTERVAL '2 minutes' 
          AND mode = 'pomodoro'
      `).get(studentId) as any;

      if (activeSession) {
        liveSession = {
          isLive: true,
          subject: activeSession.subject || 'Genel Çalışma',
          topic: activeSession.topic || '',
          mode: activeSession.mode,
          duration_min: Number(activeSession.duration_min) || 25,
          time_left_sec: Number(activeSession.time_left_sec) || 0,
          started_at: activeSession.started_at,
          elapsed_min: Number(activeSession.elapsed_min) || 1,
        };
      }
    } catch (e) {
      console.error('Error fetching active_focus_sessions:', e);
    }

    // 5. Odaklanma Oturumları Geçmişi (Tüm soru, doğru, yanlış, net detaylarıyla)
    let recentSessions: any[] = [];
    try {
      recentSessions = (await db.prepare(`
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
      `).all(studentId) as any[]) || [];
    } catch (e) {
      console.error('Error fetching recent focus_sessions:', e);
    }

    // 6. Ders Bazlı Toplam Çalışma & Soru Dağılımı
    let subjectBreakdown: any[] = [];
    try {
      subjectBreakdown = (await db.prepare(`
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
      `).all(studentId) as any[]) || [];
    } catch (e) {
      console.error('Error fetching subject breakdown:', e);
    }

    // 7. Son 14 Günlük Odaklanma ve Soru Çözüm Trendi
    let dailyActivity: any[] = [];
    try {
      dailyActivity = (await db.prepare(`
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
      `).all(studentId) as any[]) || [];
    } catch (e) {
      console.error('Error fetching daily activity:', e);
    }

    // 8. Zayıf Konular (Error Log)
    let weaknesses: any[] = [];
    try {
      weaknesses = (await db.prepare(`
        SELECT subject, topic, COUNT(*)::int as error_count
        FROM error_log
        WHERE user_id = ? AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY subject, topic
        ORDER BY error_count DESC
        LIMIT 15
      `).all(studentId) as any[]) || [];
    } catch (e) {
      console.error('Error fetching weaknesses:', e);
    }

    // 9. Deneme Sınavı Netleri (mock_exams)
    let mockExams: any[] = [];
    try {
      mockExams = (await db.prepare(`
        SELECT id, exam_type, exam_name, exam_date, total_net, turkish_net, math_net, social_net, science_net
        FROM mock_exams
        WHERE user_id = ?
        ORDER BY exam_date DESC
        LIMIT 15
      `).all(studentId) as any[]) || [];
    } catch (e) {
      console.error('Error fetching mock_exams:', e);
    }

    // 10. Bu Öğretmenin Öğrenciye Verdiği Ödevler (Gizlilik)
    let assignments: any[] = [];
    try {
      assignments = (await db.prepare(`
        SELECT a.id, a.title, a.due_date, a.created_at, asub.status, asub.score, asub.submitted_at
        FROM assignment_submissions asub
        JOIN assignments a ON asub.assignment_id = a.id
        WHERE asub.student_id = ? AND a.teacher_id = ?
        ORDER BY a.created_at DESC
        LIMIT 20
      `).all(studentId, teacherId) as any[]) || [];
    } catch (e) {
      console.error('Error fetching assignments:', e);
    }

    // 11. Toplam İstatistik Özetleri
    let totalFocusRow: any = {};
    try {
      totalFocusRow = (await db.prepare(`
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
      `).get(studentId) as any) || {};
    } catch (e) {
      console.error('Error fetching total focus summary:', e);
    }

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
