import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('yks_session')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }

    const user = await db.prepare('SELECT id, role FROM users WHERE id = ?').get(sessionId) as any;
    if (!user || user.role !== 'ogrenci') {
      return NextResponse.json({ error: 'Sadece öğrenciler sınıfa katılabilir.' }, { status: 403 });
    }

    const body = await req.json();
    const { classCode } = body;

    if (!classCode || !classCode.trim()) {
      return NextResponse.json({ error: 'Sınıf kodu zorunludur.' }, { status: 400 });
    }

    // Sınıfı bul
    const teacherClass = await db.prepare('SELECT id FROM teacher_classes WHERE class_code = ?')
      .get(classCode.trim().toUpperCase()) as any;

    if (!teacherClass) {
      return NextResponse.json({ error: 'Geçersiz sınıf kodu. Lütfen tekrar kontrol edin.' }, { status: 404 });
    }

    // Sınıfa kaydet (Transaction kullanarak)
    await db.transaction(async () => {
      await db.prepare('INSERT OR IGNORE INTO class_students (class_id, student_id) VALUES (?, ?)')
        .run(teacherClass.id, sessionId);

      // Sınıfa ait mevcut ödevleri öğrenciye ata
      // (Ödev ataması `assignments` tablosunda target_sinif/target_alan yerine class_id barındırır)
      const classAssignments = await db.prepare('SELECT id FROM assignments WHERE class_id = ?').all(teacherClass.id) as any[];

      const insertSubmission = await db.prepare(`
        INSERT OR IGNORE INTO assignment_submissions (id, assignment_id, student_id, status, score)
        VALUES (?, ?, ?, 'pending', 0)
      `);

      classAssignments.forEach(asm => {
        insertSubmission.run(uuidv4(), asm.id, sessionId);
      });
    })();

    return NextResponse.json({ success: true, message: 'Sınıfa başarıyla katıldınız!' }, { status: 200 });

  } catch (error: any) {
    console.error('Join Class API Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
