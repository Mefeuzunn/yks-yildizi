import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('yks_session')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }

    // Kullanıcı rolünü doğrula
    const user = await db.prepare('SELECT id, role FROM users WHERE id = ?').get(sessionId) as any;
    if (!user || user.role !== 'ogrenci') {
      return NextResponse.json({ error: 'Sadece öğrenciler bu verilere erişebilir.' }, { status: 403 });
    }

    // Sınıf kaydını bul
    const studentClassRelation = await db.prepare('SELECT class_id FROM class_students WHERE student_id = ?').get(sessionId) as any;

    if (!studentClassRelation) {
      return NextResponse.json({ joined: false, message: 'Herhangi bir sınıfa kayıtlı değilsiniz.' }, { status: 200 });
    }

    const classId = studentClassRelation.class_id;

    // Sınıf ve Öğretmen Bilgisi
    const classDetails = await db.prepare(`
      SELECT tc.id, tc.class_name, tc.class_code, tc.created_at,
             u.username as teacher_name, u.brans as teacher_brans, u.kurum as teacher_kurum
      FROM teacher_classes tc
      JOIN users u ON tc.teacher_id = u.id
      WHERE tc.id = ?
    `).get(classId) as any;

    // Sınıf Arkadaşları
    const classmates = await db.prepare(`
      SELECT u.id, u.username, u.alan, u.sinif, s.league, s.league_points
      FROM class_students cs
      JOIN users u ON cs.student_id = u.id
      LEFT JOIN user_stats s ON u.id = s.user_id
      WHERE cs.class_id = ?
      ORDER BY s.league_points DESC NULLS LAST
    `).all(classId) as any[];

    // Sınıf Duyuruları (Tarihe göre sıralı)
    const announcements = await db.prepare(`
      SELECT ta.id, ta.title, ta.content, ta.created_at, u.username as teacher_name
      FROM teacher_announcements ta
      JOIN users u ON ta.teacher_id = u.id
      WHERE ta.class_id = ? OR ta.class_id IS NULL
      ORDER BY ta.created_at DESC
    `).all(classId) as any[];

    // Sınıf Kaynakları
    const resources = await db.prepare(`
      SELECT tr.id, tr.title, tr.content, tr.subject, tr.topic, tr.resource_type, tr.created_at, u.username as teacher_name
      FROM teacher_resources tr
      JOIN users u ON tr.teacher_id = u.id
      WHERE tr.class_id = ? OR tr.class_id IS NULL
      ORDER BY tr.created_at DESC
    `).all(classId) as any[];

    return NextResponse.json({
      joined: true,
      classDetails,
      classmates,
      announcements,
      resources
    }, { status: 200 });

  } catch (error: any) {
    console.error('Student Class API Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
