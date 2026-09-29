import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });

    const user = await db.prepare('SELECT id, role, username FROM users WHERE id = ?').get(userId) as any;
    if (!user || user.role !== 'ogrenci') return NextResponse.json({ error: 'Sadece öğrenciler katılabilir' }, { status: 403 });

    const body = await request.json();
    const code = (body.invite_code || body.code || body.classCode || '').toString().trim().toUpperCase();
    if (!code) return NextResponse.json({ error: 'Davet veya sınıf kodu gerekli' }, { status: 400 });

    let teacherId: string | null = null;
    let classId: string | null = null;
    let className: string = '';

    // 1. Sınıf kodu ile ara (teacher_classes.class_code)
    const cls = await db.prepare(`
      SELECT tc.id, tc.teacher_id, tc.class_name 
      FROM teacher_classes tc 
      WHERE UPPER(tc.class_code) = ?
    `).get(code) as any;

    if (cls) {
      teacherId = cls.teacher_id;
      classId = cls.id;
      className = cls.class_name;
    }

    // 2. Davet kodu ile ara (class_invite_codes.code)
    if (!classId) {
      try {
        const invite = await db.prepare(`
          SELECT cic.class_id, cic.teacher_id, tc.class_name, cic.expires_at, cic.is_active 
          FROM class_invite_codes cic
          JOIN teacher_classes tc ON cic.class_id = tc.id
          WHERE UPPER(cic.code) = ?
        `).get(code) as any;

        if (invite) {
          if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
            return NextResponse.json({ error: 'Bu davet kodunun süresi dolmuş.' }, { status: 410 });
          }
          teacherId = invite.teacher_id;
          classId = invite.class_id;
          className = invite.class_name;
        }
      } catch (_) {}
    }

    // 3. Öğretmen kişisel davet kodu (users.invite_code)
    if (!teacherId) {
      const teacher = await db.prepare(
        "SELECT id FROM users WHERE role = 'ogretmen' AND UPPER(invite_code) = ?"
      ).get(code) as any;

      if (teacher) {
        teacherId = teacher.id;
        // Öğretmenin ilk sınıfını bul
        const firstClass = await db.prepare('SELECT id, class_name FROM teacher_classes WHERE teacher_id = ? LIMIT 1').get(teacher.id) as any;
        if (firstClass) {
          classId = firstClass.id;
          className = firstClass.class_name;
        }
      }
    }

    if (!teacherId) {
      return NextResponse.json({ error: 'Geçersiz sınıf veya davet kodu. Lütfen kontrol edip tekrar deneyin.' }, { status: 404 });
    }

    // teacher_students tablosuna ekle
    try {
      const existingTS = await db.prepare('SELECT 1 FROM teacher_students WHERE teacher_id = ? AND student_id = ?').get(teacherId, userId);
      if (!existingTS) {
        await db.prepare('INSERT INTO teacher_students (teacher_id, student_id) VALUES (?, ?)').run(teacherId, userId);
      }
    } catch (_) {}

    // class_students tablosuna ekle
    if (classId) {
      const existingCS = await db.prepare('SELECT 1 FROM class_students WHERE class_id = ? AND student_id = ?').get(classId, userId);
      if (!existingCS) {
        try {
          await db.prepare('INSERT INTO class_students (class_id, student_id) VALUES (?, ?)').run(classId, userId);
        } catch (e: any) {
          if (e.message?.includes('id') || e.message?.includes('violates not-null')) {
            await db.prepare('INSERT INTO class_students (id, class_id, student_id) VALUES (?, ?, ?)').run(uuidv4(), classId, userId);
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: className ? `"${className}" sınıfına başarıyla katıldınız!` : 'Öğretmeninize başarıyla bağlandınız!' 
    });
  } catch (error: any) {
    console.error('Öğretmen ekleme hatası:', error);
    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}
