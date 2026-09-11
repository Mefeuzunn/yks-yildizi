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

    // ── Sınıf bazlı ortalama başarı ──
    const classPerfRows = await db.prepare(`
      SELECT tc.id, tc.class_name,
             COUNT(DISTINCT cs.student_id) as student_count,
             ROUND(CAST(AVG(COALESCE(us.success_rate, 0)) AS NUMERIC), 1) as avg_success,
             ROUND(CAST(AVG(COALESCE(us.solved_questions, 0)) AS NUMERIC), 0) as avg_solved,
             SUM(COALESCE(us.streak_days, 0)) as total_streak
      FROM teacher_classes tc
      LEFT JOIN class_students cs ON tc.id = cs.class_id
      LEFT JOIN user_stats us ON cs.student_id = us.user_id
      WHERE tc.teacher_id = ?
      GROUP BY tc.id
      ORDER BY avg_success DESC
    `).all(teacherId) as any[];

    // ── Lig dağılımı ──
    const leagueRows = await db.prepare(`
      SELECT COALESCE(us.league, 'Bronz') as league, COUNT(*) as count
      FROM users u
      JOIN class_students cs ON u.id = cs.student_id
      JOIN teacher_classes tc ON cs.class_id = tc.id
      LEFT JOIN user_stats us ON u.id = us.user_id
      WHERE tc.teacher_id = ?
      GROUP BY league
    `).all(teacherId) as any[];

    // ── En iyi 5 öğrenci ──
    const topStudents = await db.prepare(`
      SELECT DISTINCT u.id, u.username, u.alan,
             COALESCE(us.solved_questions, 0) as solved_questions,
             COALESCE(us.success_rate, 0) as success_rate,
             COALESCE(us.league, 'Bronz') as league,
             COALESCE(us.streak_days, 0) as streak_days
      FROM users u
      JOIN class_students cs ON u.id = cs.student_id
      JOIN teacher_classes tc ON cs.class_id = tc.id
      LEFT JOIN user_stats us ON u.id = us.user_id
      WHERE tc.teacher_id = ?
      ORDER BY us.success_rate DESC NULLS LAST
      LIMIT 5
    `).all(teacherId) as any[];

    // ── Risk altındaki öğrenciler (başarı < 40 veya streak = 0) ──
    const atRiskStudents = await db.prepare(`
      SELECT DISTINCT u.id, u.username, u.alan,
             COALESCE(us.solved_questions, 0) as solved_questions,
             COALESCE(us.success_rate, 0) as success_rate,
             COALESCE(us.streak_days, 0) as streak_days
      FROM users u
      JOIN class_students cs ON u.id = cs.student_id
      JOIN teacher_classes tc ON cs.class_id = tc.id
      LEFT JOIN user_stats us ON u.id = us.user_id
      WHERE tc.teacher_id = ?
        AND (COALESCE(us.success_rate, 0) < 40 OR COALESCE(us.streak_days, 0) = 0)
      ORDER BY us.success_rate ASC NULLS FIRST
      LIMIT 5
    `).all(teacherId) as any[];

    // ── Alan dağılımı ──
    const alanDist = await db.prepare(`
      SELECT COALESCE(u.alan, 'Belirtilmemiş') as alan, COUNT(*) as count
      FROM users u
      JOIN class_students cs ON u.id = cs.student_id
      JOIN teacher_classes tc ON cs.class_id = tc.id
      WHERE tc.teacher_id = ?
      GROUP BY u.alan
    `).all(teacherId) as any[];

    // ── Son 7 günde atanan ödev sayısı ──
    const recentAssignments = await db.prepare(`
      SELECT COUNT(*) as count
      FROM assignments
      WHERE teacher_id = ?
        AND created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
    `).get(teacherId) as any;

    // ── Toplam teslim oranı ──
    const submissionStats = await db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status IN ('submitted','graded') THEN 1 ELSE 0 END) as submitted,
        SUM(CASE WHEN status = 'graded' THEN 1 ELSE 0 END) as graded
      FROM assignment_submissions asub
      JOIN assignments a ON asub.assignment_id = a.id
      WHERE a.teacher_id = ?
    `).get(teacherId) as any;

    // ── Sınıf başarı dağılımı (0-40, 40-70, 70-100) ──
    const successBands = await db.prepare(`
      SELECT 
        SUM(CASE WHEN COALESCE(us.success_rate, 0) < 40 THEN 1 ELSE 0 END) as low,
        SUM(CASE WHEN COALESCE(us.success_rate, 0) >= 40 AND COALESCE(us.success_rate, 0) < 70 THEN 1 ELSE 0 END) as mid,
        SUM(CASE WHEN COALESCE(us.success_rate, 0) >= 70 THEN 1 ELSE 0 END) as high
      FROM users u
      JOIN class_students cs ON u.id = cs.student_id
      JOIN teacher_classes tc ON cs.class_id = tc.id
      LEFT JOIN user_stats us ON u.id = us.user_id
      WHERE tc.teacher_id = ?
    `).get(teacherId) as any;

    // ── AI Insights (Faz 3) - Zayıf Konular ──
    const weakTopics = await db.prepare(`
      SELECT sm.subject, COUNT(*) as fail_count
      FROM student_mistakes sm
      JOIN class_students cs ON sm.user_id = cs.student_id
      JOIN teacher_classes tc ON cs.class_id = tc.id
      WHERE tc.teacher_id = ?
      GROUP BY sm.subject
      ORDER BY fail_count DESC
      LIMIT 1
    `).get(teacherId) as any;

    const topClass = await db.prepare(`
      SELECT tc.class_name, ROUND(CAST(AVG(COALESCE(us.success_rate, 0)) AS NUMERIC), 1) as avg_success
      FROM teacher_classes tc
      LEFT JOIN class_students cs ON tc.id = cs.class_id
      LEFT JOIN user_stats us ON cs.student_id = us.user_id
      WHERE tc.teacher_id = ?
      GROUP BY tc.id
      ORDER BY avg_success DESC
      LIMIT 1
    `).get(teacherId) as any;

    let aiInsightText = "Sınıflarınızın verileri henüz analiz ediliyor.";
    if (weakTopics && topClass) {
      aiInsightText = `AI Sınıf Asistanı: Öğrencilerinizin en çok zorlandığı ders "${weakTopics.subject}" (${weakTopics.fail_count} hata kaydedildi). Gelecek hafta bu derse ağırlık vermeniz önerilir. En başarılı sınıfınız ise %${topClass.avg_success} ortalama ile ${topClass.class_name}.`;
    }

    return NextResponse.json({
      aiInsight: aiInsightText,
      classPerformance: classPerfRows,
      leagueDistribution: leagueRows,
      topStudents,
      atRiskStudents,
      alanDistribution: alanDist,
      recentAssignments: recentAssignments?.count ?? 0,
      submissionStats: {
        total: submissionStats?.total ?? 0,
        submitted: submissionStats?.submitted ?? 0,
        graded: submissionStats?.graded ?? 0,
        rate: submissionStats?.total > 0
          ? Math.round((submissionStats.submitted / submissionStats.total) * 100)
          : 0,
      },
      successBands: {
        low: successBands?.low ?? 0,
        mid: successBands?.mid ?? 0,
        high: successBands?.high ?? 0,
      },
    });
  } catch (error) {
    console.error('Analytics hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
