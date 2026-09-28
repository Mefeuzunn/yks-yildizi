import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedTeacherId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const teacherId = await getAuthenticatedTeacherId();
    if (!teacherId) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    const user = await db.prepare('SELECT id, role FROM users WHERE id = ?').get(teacherId) as any;
    if (!user || user.role !== 'ogretmen') return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });

    // ── 1. Sınıf bazlı detaylı performans & Karşılaştırma ──
    const classPerfRows = await db.prepare(`
      SELECT tc.id, tc.class_name,
             COUNT(DISTINCT cs.student_id)::int as student_count,
             ROUND(COALESCE(AVG(us.success_rate), 0)::numeric, 1)::float as avg_success,
             ROUND(COALESCE(AVG(us.solved_questions), 0)::numeric, 0)::int as avg_solved,
             COALESCE(SUM(us.solved_questions), 0)::int as total_solved,
             ROUND(COALESCE(SUM(fs.duration_minutes), 0)::numeric / 60, 1)::float as total_focus_hours,
             ROUND(COALESCE(AVG(us.streak_days), 0)::numeric, 1)::float as avg_streak,
             COUNT(DISTINCT CASE WHEN (us.streak_days = 0 OR us.success_rate < 40) THEN cs.student_id END)::int as at_risk_count
      FROM teacher_classes tc
      LEFT JOIN class_students cs ON tc.id = cs.class_id
      LEFT JOIN user_stats us ON cs.student_id = us.user_id
      LEFT JOIN (
        SELECT user_id, SUM(COALESCE(duration_minutes, duration_min, 0)) as duration_minutes
        FROM focus_sessions
        WHERE (mode = 'pomodoro' OR mode IS NULL OR mode NOT IN ('shortBreak', 'longBreak'))
        GROUP BY user_id
      ) fs ON cs.student_id = fs.user_id
      WHERE tc.teacher_id = ?
      GROUP BY tc.id, tc.class_name
      ORDER BY avg_success DESC
    `).all(teacherId) as any[];

    // ── 2. Branş / Ders Bazlı Çalışma ve Soru Dağılımı ──
    const subjectDist = await db.prepare(`
      SELECT 
        COALESCE(fs.subject, 'Diğer') as subject,
        COALESCE(SUM(COALESCE(fs.duration_minutes, fs.duration_min, 0)), 0)::int as total_minutes,
        ROUND(COALESCE(SUM(COALESCE(fs.duration_minutes, fs.duration_min, 0)), 0)::numeric / 60, 1)::float as total_hours,
        COALESCE(SUM(COALESCE(fs.questions_solved, 0)), 0)::int as total_questions,
        COALESCE(SUM(COALESCE(fs.correct_count, 0)), 0)::int as total_correct,
        COALESCE(SUM(COALESCE(fs.wrong_count, 0)), 0)::int as total_wrong,
        ROUND(COALESCE(SUM(COALESCE(fs.net_score, 0)), 0)::numeric, 1)::float as total_net
      FROM focus_sessions fs
      JOIN class_students cs ON fs.user_id = cs.student_id
      JOIN teacher_classes tc ON cs.class_id = tc.id
      WHERE tc.teacher_id = ?
        AND (fs.mode = 'pomodoro' OR fs.mode IS NULL OR fs.mode NOT IN ('shortBreak', 'longBreak'))
      GROUP BY fs.subject
      ORDER BY total_minutes DESC
      LIMIT 12
    `).all(teacherId) as any[];

    // ── 3. Kurum Genelinde En Çok Hata Yapılan Kritik Konular (error_log) ──
    const topWeaknesses = await db.prepare(`
      SELECT el.subject, el.topic, 
             COUNT(*)::int as error_count, 
             COUNT(DISTINCT el.user_id)::int as affected_students
      FROM error_log el
      JOIN class_students cs ON el.user_id = cs.student_id
      JOIN teacher_classes tc ON cs.class_id = tc.id
      WHERE tc.teacher_id = ?
        AND el.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY el.subject, el.topic
      ORDER BY error_count DESC
      LIMIT 10
    `).all(teacherId) as any[];

    // ── 4. Son 14 Günlük Günlük Çalışma Trendi ──
    const dailyTrend = await db.prepare(`
      SELECT 
        DATE(fs.created_at) as day,
        COALESCE(SUM(COALESCE(fs.duration_minutes, fs.duration_min, 0)), 0)::int as total_minutes,
        COALESCE(SUM(COALESCE(fs.questions_solved, 0)), 0)::int as total_questions,
        COALESCE(SUM(COALESCE(fs.correct_count, 0)), 0)::int as total_correct
      FROM focus_sessions fs
      JOIN class_students cs ON fs.user_id = cs.student_id
      JOIN teacher_classes tc ON cs.class_id = tc.id
      WHERE tc.teacher_id = ?
        AND fs.created_at >= NOW() - INTERVAL '14 days'
        AND (fs.mode = 'pomodoro' OR fs.mode IS NULL OR fs.mode NOT IN ('shortBreak', 'longBreak'))
      GROUP BY DATE(fs.created_at)
      ORDER BY day ASC
    `).all(teacherId) as any[];

    // ── 5. En Başarılı 5 Öğrenci ──
    const topStudents = await db.prepare(`
      SELECT DISTINCT u.id, u.username, u.alan, u.sinif,
             COALESCE(us.solved_questions, 0)::int as solved_questions,
             COALESCE(us.success_rate, 0)::float as success_rate,
             COALESCE(us.league, 'Bronz') as league,
             COALESCE(us.streak_days, 0)::int as streak_days,
             COALESCE(us.league_points, 0)::int as league_points
      FROM users u
      JOIN class_students cs ON u.id = cs.student_id
      JOIN teacher_classes tc ON cs.class_id = tc.id
      LEFT JOIN user_stats us ON u.id = us.user_id
      WHERE tc.teacher_id = ?
      ORDER BY us.success_rate DESC NULLS LAST, us.solved_questions DESC NULLS LAST
      LIMIT 5
    `).all(teacherId) as any[];

    // ── 6. Dikkat Gerektiren Öğrenciler (Riskli / Takip) ──
    const atRiskStudents = await db.prepare(`
      SELECT DISTINCT u.id, u.username, u.alan, u.sinif,
             COALESCE(us.solved_questions, 0)::int as solved_questions,
             COALESCE(us.success_rate, 0)::float as success_rate,
             COALESCE(us.streak_days, 0)::int as streak_days
      FROM users u
      JOIN class_students cs ON u.id = cs.student_id
      JOIN teacher_classes tc ON cs.class_id = tc.id
      LEFT JOIN user_stats us ON u.id = us.user_id
      LEFT JOIN active_focus_sessions afs ON u.id = afs.user_id AND afs.last_heartbeat >= NOW() - INTERVAL '2 minutes'
      WHERE tc.teacher_id = ?
        AND afs.user_id IS NULL
        AND (COALESCE(us.success_rate, 0) < 40 OR COALESCE(us.streak_days, 0) = 0 OR COALESCE(us.solved_questions, 0) = 0)
      ORDER BY us.success_rate ASC NULLS FIRST, us.streak_days ASC NULLS FIRST
      LIMIT 8
    `).all(teacherId) as any[];

    // ── 7. Lig & Alan Dağılımı ──
    const leagueRows = await db.prepare(`
      SELECT COALESCE(us.league, 'Bronz') as league, COUNT(*)::int as count
      FROM users u
      JOIN class_students cs ON u.id = cs.student_id
      JOIN teacher_classes tc ON cs.class_id = tc.id
      LEFT JOIN user_stats us ON u.id = us.user_id
      WHERE tc.teacher_id = ?
      GROUP BY league
    `).all(teacherId) as any[];

    const alanDist = await db.prepare(`
      SELECT COALESCE(u.alan, 'Belirtilmemiş') as alan, COUNT(*)::int as count
      FROM users u
      JOIN class_students cs ON u.id = cs.student_id
      JOIN teacher_classes tc ON cs.class_id = tc.id
      WHERE tc.teacher_id = ?
      GROUP BY u.alan
    `).all(teacherId) as any[];

    // ── 8. Ödev & Teslim İstatistikleri ──
    const recentAssignments = await db.prepare(`
      SELECT COUNT(*)::int as count
      FROM assignments
      WHERE teacher_id = ?
        AND created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
    `).get(teacherId) as any;

    const submissionStats = await db.prepare(`
      SELECT 
        COUNT(*)::int as total,
        SUM(CASE WHEN status IN ('submitted','graded') THEN 1 ELSE 0 END)::int as submitted,
        SUM(CASE WHEN status = 'graded' THEN 1 ELSE 0 END)::int as graded
      FROM assignment_submissions asub
      JOIN assignments a ON asub.assignment_id = a.id
      WHERE a.teacher_id = ?
    `).get(teacherId) as any;

    // ── 9. Başarı Bantları ──
    const successBands = await db.prepare(`
      SELECT 
        SUM(CASE WHEN COALESCE(us.success_rate, 0) < 40 THEN 1 ELSE 0 END)::int as low,
        SUM(CASE WHEN COALESCE(us.success_rate, 0) >= 40 AND COALESCE(us.success_rate, 0) < 70 THEN 1 ELSE 0 END)::int as mid,
        SUM(CASE WHEN COALESCE(us.success_rate, 0) >= 70 THEN 1 ELSE 0 END)::int as high
      FROM users u
      JOIN class_students cs ON u.id = cs.student_id
      JOIN teacher_classes tc ON cs.class_id = tc.id
      LEFT JOIN user_stats us ON u.id = us.user_id
      WHERE tc.teacher_id = ?
    `).get(teacherId) as any;

    // ── 10. Kurumsal Genel Özet (Overview) ──
    const overviewStats = await db.prepare(`
      SELECT 
        COUNT(DISTINCT cs.student_id)::int as total_students,
        COUNT(DISTINCT tc.id)::int as total_classes,
        ROUND(COALESCE(AVG(us.success_rate), 0)::numeric, 1)::float as avg_success_rate,
        COALESCE(SUM(us.solved_questions), 0)::int as total_solved_questions
      FROM teacher_classes tc
      LEFT JOIN class_students cs ON tc.id = cs.class_id
      LEFT JOIN user_stats us ON cs.student_id = us.user_id
      WHERE tc.teacher_id = ?
    `).get(teacherId) as any;

    // Son 7 gün aktiflik oranı
    const activeStats = await db.prepare(`
      SELECT 
        COUNT(DISTINCT cs.student_id)::int as total_count,
        COUNT(DISTINCT CASE 
          WHEN fs.created_at >= NOW() - INTERVAL '7 days' OR el.created_at >= NOW() - INTERVAL '7 days' 
          THEN cs.student_id 
        END)::int as active_count
      FROM teacher_classes tc
      JOIN class_students cs ON tc.id = cs.class_id
      LEFT JOIN focus_sessions fs ON cs.student_id = fs.user_id AND fs.created_at >= NOW() - INTERVAL '7 days'
      LEFT JOIN error_log el ON cs.student_id = el.user_id AND el.created_at >= NOW() - INTERVAL '7 days'
      WHERE tc.teacher_id = ?
    `).get(teacherId) as any;

    // Toplam odak süresi
    const totalFocusMinutes = subjectDist.reduce((acc: number, cur: any) => acc + (cur.total_minutes || 0), 0);
    const totalFocusHours = Math.round((totalFocusMinutes / 60) * 10) / 10;

    const totalStudents = Number(overviewStats?.total_students) || 0;
    const activeRate = (activeStats?.total_count && activeStats.total_count > 0)
      ? Math.round((Number(activeStats.active_count) / Number(activeStats.total_count)) * 100)
      : (totalStudents > 0 ? 100 : 0);

    const subTotal = Number(submissionStats?.total) || 0;
    const subSubmitted = Number(submissionStats?.submitted) || 0;
    const subRate = subTotal > 0 ? Math.round((subSubmitted / subTotal) * 100) : 0;

    // ── 11. Dinamik AI Analiz Metni ──
    const topClass = classPerfRows[0] || null;
    const topWeak = topWeaknesses[0] || null;
    let aiInsightText = "Kurum sınıflarınızın çalışma verileri derleniyor.";

    if (topWeak && topClass) {
      aiInsightText = `Öğrencilerinizin en çok zorlandığı konu "${topWeak.subject} - ${topWeak.topic}" (${topWeak.error_count} hata, ${topWeak.affected_students} öğrenci). En yüksek başarı ortalaması %${topClass.avg_success} ile "${topClass.class_name}" sınıfında kaydedildi. Toplam ${totalFocusHours} saatlik odaklanma ve ${overviewStats?.total_solved_questions || 0} çözülen soru ile çalışma temposu devam ediyor.`;
    } else if (topClass) {
      aiInsightText = `En başarılı sınıfınız %${topClass.avg_success} ortalama ile "${topClass.class_name}". Toplam ${totalFocusHours} saatlik odaklanma süresine ulaşıldı. Düzenli soru çözümü ve deneme takibi önerilir.`;
    }

    return NextResponse.json({
      overview: {
        totalStudents,
        totalClasses: Number(overviewStats?.total_classes) || 0,
        avgSuccessRate: Number(overviewStats?.avg_success_rate) || 0,
        totalSolvedQuestions: Number(overviewStats?.total_solved_questions) || 0,
        totalFocusHours,
        activeStudentRate: activeRate,
        submissionRate: subRate,
      },
      aiInsight: aiInsightText,
      classPerformance: classPerfRows,
      subjectDistribution: subjectDist,
      topWeaknesses: topWeaknesses.map((w: any) => ({
        ...w,
        severity: w.affected_students >= 5 || w.error_count >= 15 ? 'high' : (w.error_count >= 5 ? 'medium' : 'low')
      })),
      dailyTrend: (dailyTrend || []).map((d: any) => ({
        day: typeof d.day === 'string' ? d.day : new Date(d.day).toISOString().split('T')[0],
        total_minutes: Number(d.total_minutes) || 0,
        total_questions: Number(d.total_questions) || 0,
        total_correct: Number(d.total_correct) || 0,
      })),
      leagueDistribution: leagueRows,
      topStudents,
      atRiskStudents,
      alanDistribution: alanDist,
      recentAssignments: recentAssignments?.count ?? 0,
      submissionStats: {
        total: subTotal,
        submitted: subSubmitted,
        graded: Number(submissionStats?.graded) || 0,
        rate: subRate,
      },
      successBands: {
        low: Number(successBands?.low) || 0,
        mid: Number(successBands?.mid) || 0,
        high: Number(successBands?.high) || 0,
      },
    });
  } catch (error: any) {
    console.error('Analytics hatası:', error);
    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}
