import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedTeacherId, getAuthenticatedUser } from '@/lib/auth-utils';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const teacherId = await getAuthenticatedTeacherId(req);
    if (!teacherId) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const teacher = await getAuthenticatedUser(req);
    if (!teacher || teacher.role !== 'ogretmen') {
      return NextResponse.json({ error: 'Bu alana yalnızca öğretmenler erişebilir' }, { status: 403 });
    }

    // Öğretmenin sınıflarındaki şu an canlı (son 2 dakika kalp atışı olan) odaklanan öğrencileri çek
    let activeStudents: any[] = [];
    try {
      activeStudents = await db.prepare(`
        SELECT DISTINCT ON (afs.user_id)
          afs.user_id as student_id,
          afs.subject,
          afs.topic,
          afs.started_at,
          afs.last_heartbeat,
          GREATEST(1, ROUND(EXTRACT(EPOCH FROM (NOW() - afs.started_at)) / 60))::INTEGER as elapsed_minutes,
          u.username,
          u.sinif,
          u.alan,
          tc.id as class_id,
          tc.class_name
        FROM active_focus_sessions afs
        JOIN users u ON afs.user_id = u.id
        JOIN class_students cs ON cs.student_id = u.id
        JOIN teacher_classes tc ON cs.class_id = tc.id
        WHERE tc.teacher_id = ?
          AND afs.last_heartbeat >= NOW() - INTERVAL '2 minutes'
        ORDER BY afs.user_id, afs.started_at DESC
      `).all(teacherId) as any[];
    } catch (e: any) {
      console.warn('Live pulse query error:', e?.message);
    }

    // Toplam sınıf öğrenci sayısı
    let totalEnrolled = 0;
    try {
      const row = await db.prepare(`
        SELECT COUNT(DISTINCT cs.student_id) as count
        FROM class_students cs
        JOIN teacher_classes tc ON cs.class_id = tc.id
        WHERE tc.teacher_id = ?
      `).get(teacherId) as any;
      totalEnrolled = Number(row?.count || 0);
    } catch (_) {}

    return NextResponse.json({
      success: true,
      activeStudents: activeStudents || [],
      activeCount: activeStudents?.length || 0,
      totalEnrolled,
      pulseRate: totalEnrolled > 0 ? Math.round(((activeStudents?.length || 0) / totalEnrolled) * 100) : 0,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Teacher Live Pulse GET Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const teacherId = await getAuthenticatedTeacherId(req);
    if (!teacherId) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const teacher = await getAuthenticatedUser(req);
    if (!teacher || teacher.role !== 'ogretmen') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const body = await req.json();
    const { studentId, message, cheerType } = body;

    if (!studentId) {
      return NextResponse.json({ error: 'Öğrenci ID gereklidir.' }, { status: 400 });
    }

    // Öğretmenin bu öğrenciye erişimi olup olmadığını doğrula
    const isStudentInClass = await db.prepare(`
      SELECT cs.id FROM class_students cs
      JOIN teacher_classes tc ON cs.class_id = tc.id
      WHERE tc.teacher_id = ? AND cs.student_id = ?
      LIMIT 1
    `).get(teacherId, studentId) as any;

    if (!isStudentInClass) {
      return NextResponse.json({ error: 'Bu öğrenci sınıflarınızda bulunmuyor.' }, { status: 403 });
    }

    const icons: Record<string, string> = {
      clap: '👏',
      fire: '🔥',
      star: '⭐',
      bulb: '💡',
      heart: '❤️',
      rocket: '🚀'
    };
    const icon = icons[cheerType] || '👨‍🏫';

    const teacherName = teacher.username || 'Öğretmeniniz';
    const title = `${icon} ${teacherName}'den Canlı Destek Notu!`;
    const finalBody = message?.trim() ? message.trim() : `Öğretmeniniz ${teacherName} şu anki odaklanmanızı görüp sizi tebrik etti! Böyle devam et.`;

    const notifId = uuidv4();
    await db.prepare(`
      INSERT INTO user_notifications (id, user_id, title, body, type, icon, url, is_read, created_at)
      VALUES (?, ?, ?, ?, 'teacher_cheer', ?, '/dashboard', false, NOW())
    `).run(notifId, studentId, title, finalBody, icon);

    return NextResponse.json({
      success: true,
      message: 'Öğrencinize canlı motivasyon notu başarıyla iletildi!'
    });
  } catch (error: any) {
    console.error('Teacher Live Pulse POST Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
