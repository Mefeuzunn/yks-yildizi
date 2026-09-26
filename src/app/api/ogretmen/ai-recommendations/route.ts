import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedTeacherId } from '@/lib/auth-utils';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const teacherId = await getAuthenticatedTeacherId(req);
    if (!teacherId) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

    const teacher = await db.prepare('SELECT id, role FROM users WHERE id = ?').get(teacherId) as any;
    if (!teacher || teacher.role !== 'ogretmen') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    if (!classId) return NextResponse.json({ error: 'classId gerekli' }, { status: 400 });

    // Öğretmenin bu sınıfa yetkisi var mı
    const teacherClass = await db.prepare(
      'SELECT id, class_name FROM teacher_classes WHERE id = ? AND teacher_id = ?'
    ).get(classId, teacherId) as any;
    if (!teacherClass) return NextResponse.json({ error: 'Sınıf bulunamadı' }, { status: 403 });

    // Son 30 gün hata analizi
    const weakTopics = await db.prepare(`
      SELECT el.subject, el.topic,
             COUNT(*) as error_count,
             COUNT(DISTINCT el.user_id) as affected_students
      FROM error_log el
      JOIN class_students cs ON el.user_id = cs.student_id
      WHERE cs.class_id = ?
        AND el.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY el.subject, el.topic
      ORDER BY error_count DESC
      LIMIT 5
    `).all(classId) as any[];

    // Son 2 haftada atanan ödevler (tekrar öneri yapmamak için)
    const recentAssignments = await db.prepare(`
      SELECT subject, topic FROM assignments
      WHERE class_id = ?
        AND created_at >= NOW() - INTERVAL '14 days'
    `).all(classId) as any[];
    const recentTopics = new Set(recentAssignments.map((a: any) => `${a.subject}:${a.topic}`));

    // Her konu için severity ve alreadyAssigned hesapla
    const enrichedTopics = weakTopics.map((t: any) => {
      const severity =
        t.affected_students >= 5 || t.error_count >= 30 ? 'high'
        : t.affected_students >= 3 || t.error_count >= 15 ? 'medium'
        : 'low';
      const alreadyAssigned = recentTopics.has(`${t.subject}:${t.topic}`);
      return {
        subject: t.subject,
        topic: t.topic,
        errorCount: t.error_count,
        affectedStudents: t.affected_students,
        severity,
        alreadyAssigned,
        recommendation: alreadyAssigned
          ? 'Bu konu için yakın zamanda ödev atandı'
          : `Ödev önerilir — ${t.affected_students} öğrenci etkileniyor`
      };
    });

    // Hızlı aksiyon butonları (zaten atanmamış yüksek öncelikli konular)
    const quickActions = enrichedTopics
      .filter((t: any) => !t.alreadyAssigned && (t.severity === 'high' || t.severity === 'medium'))
      .slice(0, 3)
      .map((t: any) => ({
        id: uuidv4(),
        label: `${teacherClass.class_name}'a ${t.topic} Ödevi Ata`,
        subject: t.subject,
        topic: t.topic,
        type: 'odev'
      }));

    // Özet metin
    let summaryText = '';
    if (enrichedTopics.length === 0) {
      summaryText = `${teacherClass.class_name} sınıfında son 30 günde yeterli hata verisi birikmemiş. Öğrenciler aktif soru çözdükçe AI önerileri burada görünecek.`;
    } else {
      const top = enrichedTopics[0];
      summaryText = `${teacherClass.class_name} sınıfında son 30 günün analizi tamamlandı. En kritik alan: ${top.subject} - ${top.topic} (${top.affectedStudents} öğrenci, ${top.errorCount} hata). ${quickActions.length > 0 ? `${quickActions.length} hızlı aksiyon öneriniz var.` : ''}`;
    }

    return NextResponse.json({
      success: true,
      className: teacherClass.class_name,
      analysisDate: new Date().toISOString().split('T')[0],
      weakTopics: enrichedTopics,
      quickActions,
      summaryText
    });

  } catch (error: any) {
    console.error('AI Recommendations Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
