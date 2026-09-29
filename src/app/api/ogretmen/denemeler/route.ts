import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedTeacherId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const teacherId = await getAuthenticatedTeacherId(req);
    if (!teacherId) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });

    const user = await db.prepare('SELECT id, role FROM users WHERE id = ?').get(teacherId) as any;
    if (!user || user.role !== 'ogretmen') return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');

    // Sınıf filtresi varsa doğrula, yoksa öğretmenin tüm sınıflarını al
    let targetClassIds: string[] = [];
    if (classId && classId !== 'all') {
      const cls = await db.prepare('SELECT id FROM teacher_classes WHERE id = ? AND teacher_id = ?').get(classId, teacherId) as any;
      if (!cls) return NextResponse.json({ error: 'Sınıf bulunamadı veya yetkiniz yok' }, { status: 404 });
      targetClassIds = [classId];
    } else {
      const allClasses = await db.prepare('SELECT id FROM teacher_classes WHERE teacher_id = ?').all(teacherId) as any[];
      targetClassIds = allClasses.map(c => c.id);
    }

    if (targetClassIds.length === 0) {
      return NextResponse.json({
        success: true,
        tytAverages: null,
        aytAverages: null,
        recentExams: [],
        netAlerts: []
      });
    }

    const placeholders = targetClassIds.map(() => '?').join(',');

    // 1. Sınıftaki öğrencilerin tüm denemelerini çek
    const rawExams = await db.prepare(`
      SELECT me.id, me.user_id, u.username, me.exam_type, me.exam_name, me.exam_date,
             COALESCE(me.total_net, 0)::float as total_net,
             COALESCE(me.turkish_net, 0)::float as turkish_net,
             COALESCE(me.math_net, 0)::float as math_net,
             COALESCE(me.social_net, 0)::float as social_net,
             COALESCE(me.science_net, 0)::float as science_net,
             tc.class_name
      FROM mock_exams me
      JOIN class_students cs ON me.user_id = cs.student_id
      JOIN teacher_classes tc ON cs.class_id = tc.id
      JOIN users u ON me.user_id = u.id
      WHERE cs.class_id IN (${placeholders})
      ORDER BY me.exam_date DESC
    `).all(...targetClassIds) as any[];

    // 2. TYT İstatistiklerini Hesapla
    const tytExams = rawExams.filter(e => (e.exam_type || '').toUpperCase() === 'TYT');
    const tytAverages = tytExams.length > 0 ? {
      examCount: tytExams.length,
      totalNet: Math.round((tytExams.reduce((acc, e) => acc + e.total_net, 0) / tytExams.length) * 10) / 10,
      turkishNet: Math.round((tytExams.reduce((acc, e) => acc + e.turkish_net, 0) / tytExams.length) * 10) / 10,
      mathNet: Math.round((tytExams.reduce((acc, e) => acc + e.math_net, 0) / tytExams.length) * 10) / 10,
      socialNet: Math.round((tytExams.reduce((acc, e) => acc + e.social_net, 0) / tytExams.length) * 10) / 10,
      scienceNet: Math.round((tytExams.reduce((acc, e) => acc + e.science_net, 0) / tytExams.length) * 10) / 10,
    } : null;

    // 3. AYT İstatistiklerini Hesapla
    const aytExams = rawExams.filter(e => (e.exam_type || '').toUpperCase() === 'AYT');
    const aytAverages = aytExams.length > 0 ? {
      examCount: aytExams.length,
      totalNet: Math.round((aytExams.reduce((acc, e) => acc + e.total_net, 0) / aytExams.length) * 10) / 10,
      mathNet: Math.round((aytExams.reduce((acc, e) => acc + e.math_net, 0) / aytExams.length) * 10) / 10,
      scienceNet: Math.round((aytExams.reduce((acc, e) => acc + e.science_net, 0) / aytExams.length) * 10) / 10,
      socialNet: Math.round((aytExams.reduce((acc, e) => acc + e.social_net, 0) / aytExams.length) * 10) / 10,
    } : null;

    // 4. Net Bazlı Risk Uyarıları (Net Düşüşü & Matematik Riski)
    // Öğrenci bazında grupla
    const studentExamsMap: Record<string, { username: string; exams: any[] }> = {};
    rawExams.forEach(e => {
      if (!studentExamsMap[e.user_id]) {
        studentExamsMap[e.user_id] = { username: e.username, exams: [] };
      }
      studentExamsMap[e.user_id].exams.push(e);
    });

    const netAlerts: any[] = [];
    Object.entries(studentExamsMap).forEach(([studentId, data]) => {
      const exams = data.exams;
      if (exams.length === 0) return;

      // Kural 1: Matematik ortalaması < 10
      const mathSum = exams.reduce((acc, ex) => acc + ex.math_net, 0);
      const mathAvg = Math.round((mathSum / exams.length) * 10) / 10;
      if (mathAvg < 10) {
        netAlerts.push({
          studentId,
          username: data.username,
          type: 'low_math',
          message: `Matematik deneme ortalaması kritik seviyede: ${mathAvg} Net`,
          severity: 'warning',
          value: mathAvg
        });
      }

      // Kural 2: Son 2 denemede belirgin net düşüşü (>= 5 net)
      if (exams.length >= 2) {
        const latest = exams[0].total_net;
        const previous = exams[1].total_net;
        const diff = Math.round((latest - previous) * 10) / 10;
        if (diff <= -5) {
          netAlerts.push({
            studentId,
            username: data.username,
            type: 'net_drop',
            message: `Son denemede ${Math.abs(diff)} Net düşüş yaşandı (${previous} ➔ ${latest} Net)`,
            severity: 'critical',
            value: diff
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      tytAverages,
      aytAverages,
      recentExams: rawExams.slice(0, 15),
      netAlerts
    });
  } catch (error: any) {
    console.error('Sınıf deneme analizi hatası:', error);
    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}
