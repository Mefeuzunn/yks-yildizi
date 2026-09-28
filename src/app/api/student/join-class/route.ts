import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor.' }, { status: 401 });
    }

    const user = await db.prepare('SELECT id, role, username FROM users WHERE id = ?').get(userId) as any;
    if (!user || user.role !== 'ogrenci') {
      return NextResponse.json({ error: 'Sadece öğrenciler sınıfa katılabilir.' }, { status: 403 });
    }

    const body = await req.json();
    const rawCode = body.classCode || body.code;

    if (!rawCode || typeof rawCode !== 'string' || !rawCode.trim()) {
      return NextResponse.json({ error: 'Lütfen 6 haneli sınıf kodunu girin.' }, { status: 400 });
    }

    const cleanCode = rawCode.trim().toUpperCase();

    // 1. Önce doğrudan `teacher_classes.class_code` ile ara
    let targetClass = await db.prepare(`
      SELECT tc.id, tc.class_name, tc.teacher_id, u.username as teacher_name, u.brans as teacher_brans
      FROM teacher_classes tc
      JOIN users u ON tc.teacher_id = u.id
      WHERE UPPER(tc.class_code) = ?
    `).get(cleanCode) as any;

    let inviteCodeRecord: any = null;

    // 2. Bulunamadıysa `class_invite_codes` tablosundan ara
    if (!targetClass) {
      try {
        inviteCodeRecord = await db.prepare(`
          SELECT * FROM class_invite_codes
          WHERE UPPER(code) = ? AND is_active = true
        `).get(cleanCode) as any;

        if (inviteCodeRecord) {
          if (inviteCodeRecord.expires_at && new Date(inviteCodeRecord.expires_at) < new Date()) {
            return NextResponse.json({ error: 'Bu davet kodunun süresi dolmuş. Lütfen öğretmeninizden güncel kod isteyin.' }, { status: 410 });
          }

          targetClass = await db.prepare(`
            SELECT tc.id, tc.class_name, tc.teacher_id, u.username as teacher_name, u.brans as teacher_brans
            FROM teacher_classes tc
            JOIN users u ON tc.teacher_id = u.id
            WHERE tc.id = ?
          `).get(inviteCodeRecord.class_id) as any;
        }
      } catch (_) {
        // class_invite_codes tablosu olmayabilir
      }
    }

    if (!targetClass) {
      return NextResponse.json({
        error: 'Geçersiz sınıf kodu. Lütfen öğretmeninizin panelindeki 6 haneli sınıf veya davet kodunu kontrol edin.'
      }, { status: 404 });
    }

    const classId = targetClass.id;

    // 3. Öğrenci zaten bu sınıfta mı?
    const existingEnrollment = await db.prepare(
      'SELECT class_id FROM class_students WHERE class_id = ? AND student_id = ?'
    ).get(classId, userId) as any;

    if (existingEnrollment) {
      return NextResponse.json({
        success: true,
        alreadyJoined: true,
        className: targetClass.class_name,
        teacherName: targetClass.teacher_name,
        message: `Zaten "${targetClass.class_name}" sınıfına kayıtlısınız!`
      }, { status: 200 });
    }

    // 4. Sınıfa ekle
    try {
      await db.prepare('INSERT INTO class_students (class_id, student_id) VALUES (?, ?)').run(classId, userId);
    } catch (insertErr: any) {
      // id sütunu zorunlu olan eski şemalar için fallback
      if (insertErr.message?.includes('id') || insertErr.message?.includes('violates not-null')) {
        await db.prepare('INSERT INTO class_students (id, class_id, student_id) VALUES (?, ?, ?)').run(uuidv4(), classId, userId);
      } else {
        throw insertErr;
      }
    }

    // 5. Davet kodu kullanıldıysa sayacı artır
    if (inviteCodeRecord?.id) {
      try {
        await db.prepare('UPDATE class_invite_codes SET use_count = use_count + 1 WHERE id = ?').run(inviteCodeRecord.id);
      } catch (_) {}
    }

    // 6. Sınıfa ait mevcut aktif ödevleri öğrenciye ata
    try {
      const classAssignments = await db.prepare('SELECT id FROM assignments WHERE class_id = ?').all(classId) as any[];
      if (classAssignments && classAssignments.length > 0) {
        for (const asm of classAssignments) {
          const subExists = await db.prepare(
            'SELECT 1 FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?'
          ).get(asm.id, userId);

          if (!subExists) {
            await db.prepare(`
              INSERT INTO assignment_submissions (id, assignment_id, student_id, status, score)
              VALUES (?, ?, ?, 'pending', 0)
            `).run(uuidv4(), asm.id, userId);
          }
        }
      }
    } catch (assignErr) {
      console.error('Assignments auto-assign error on join:', assignErr);
    }

    return NextResponse.json({
      success: true,
      className: targetClass.class_name,
      teacherName: targetClass.teacher_name,
      teacherBrans: targetClass.teacher_brans,
      message: `Tebrikler! "${targetClass.class_name}" sınıfına başarıyla katıldınız.`
    }, { status: 200 });

  } catch (error: any) {
    console.error('Join Class API Error:', error);
    return NextResponse.json({ error: error.message || 'Sınıfa katılırken bir hata oluştu.' }, { status: 500 });
  }
}
