import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Giriş yapmanız gerekli' }, { status: 401 });

    const body = await req.json();
    const rawCode = body.code || body.classCode;
    if (!rawCode || typeof rawCode !== 'string' || !rawCode.trim()) {
      return NextResponse.json({ error: 'Sınıf veya davet kodu gerekli' }, { status: 400 });
    }

    const cleanCode = rawCode.trim().toUpperCase();

    // 1. Önce doğrudan `teacher_classes.class_code` ile ara
    let targetClass = await db.prepare(`
      SELECT tc.id, tc.class_name, tc.teacher_id, u.username as teacher_name
      FROM teacher_classes tc
      JOIN users u ON tc.teacher_id = u.id
      WHERE UPPER(tc.class_code) = ?
    `).get(cleanCode) as any;

    let inviteRecord: any = null;

    // 2. Bulunamadıysa `class_invite_codes` ile ara
    if (!targetClass) {
      try {
        inviteRecord = await db.prepare(`
          SELECT * FROM class_invite_codes
          WHERE UPPER(code) = ? AND is_active = true
        `).get(cleanCode) as any;

        if (inviteRecord) {
          if (inviteRecord.expires_at && new Date(inviteRecord.expires_at) < new Date()) {
            return NextResponse.json({ error: 'Bu davet kodunun süresi dolmuş' }, { status: 410 });
          }

          targetClass = await db.prepare(`
            SELECT tc.id, tc.class_name, tc.teacher_id, u.username as teacher_name
            FROM teacher_classes tc
            JOIN users u ON tc.teacher_id = u.id
            WHERE tc.id = ?
          `).get(inviteRecord.class_id) as any;
        }
      } catch (_) {}
    }

    if (!targetClass) {
      return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş sınıf/davet kodu' }, { status: 404 });
    }

    const classId = targetClass.id;

    // 3. Check if already in class
    const existing = await db.prepare(
      'SELECT class_id FROM class_students WHERE class_id = ? AND student_id = ?'
    ).get(classId, userId) as any;

    if (existing) {
      return NextResponse.json({ 
        success: true,
        alreadyJoined: true,
        className: targetClass.class_name,
        message: `Zaten "${targetClass.class_name}" sınıfına kayıtlısınız!` 
      }, { status: 200 });
    }

    // 4. Join the class
    try {
      await db.prepare('INSERT INTO class_students (class_id, student_id) VALUES (?, ?)').run(classId, userId);
    } catch (insertErr: any) {
      if (insertErr.message?.includes('id') || insertErr.message?.includes('violates not-null')) {
        await db.prepare('INSERT INTO class_students (id, class_id, student_id) VALUES (?, ?, ?)').run(uuidv4(), classId, userId);
      } else {
        throw insertErr;
      }
    }

    // 5. Increment invite use count if applicable
    if (inviteRecord?.id) {
      try {
        await db.prepare('UPDATE class_invite_codes SET use_count = use_count + 1 WHERE id = ?').run(inviteRecord.id);
      } catch (_) {}
    }

    // 6. Sınıf ödevlerini öğrenciye sağla
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
    } catch (e) {
      console.error('Provision assignments error:', e);
    }

    return NextResponse.json({
      success: true,
      className: targetClass.class_name,
      teacherName: targetClass.teacher_name,
      message: `${targetClass.class_name} sınıfına başarıyla katıldınız!`,
    });
  } catch (e: any) {
    console.error('Sinif katil error:', e);
    return NextResponse.json({ error: e.message || 'Sunucu hatası' }, { status: 500 });
  }
}
