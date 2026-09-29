import { NextResponse } from 'next/server';
import { getAuthenticatedTeacherId } from '@/lib/auth-utils';
import db from '@/lib/yks-db-async';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const teacherId = await getAuthenticatedTeacherId(request);
    if (!teacherId) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });

    const user = await db.prepare('SELECT id, role, username FROM users WHERE id = ?').get(teacherId) as any;
    if (!user || user.role !== 'ogretmen') return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });

    const { id } = await params;

    // Verify assignment belongs to this teacher
    const assignment = await db.prepare(
      'SELECT id, class_id, title, due_date FROM assignments WHERE id = ? AND teacher_id = ?'
    ).get(id, teacherId) as any;

    if (!assignment) {
      return NextResponse.json({ error: 'Ödev bulunamadı veya yetkiniz yok' }, { status: 404 });
    }

    // Teslim etmeyen veya bekleyen öğrencileri bul
    const pendingStudents = await db.prepare(`
      SELECT cs.student_id, u.username
      FROM class_students cs
      JOIN users u ON cs.student_id = u.id
      LEFT JOIN assignment_submissions asub ON asub.assignment_id = ? AND asub.student_id = cs.student_id
      WHERE cs.class_id = ?
        AND (asub.status IS NULL OR asub.status = 'pending' OR asub.status = 'not_completed')
    `).all(id, assignment.class_id) as any[];

    const count = pendingStudents.length;

    // Sınıf duyurusu oluştur
    const annId = uuidv4();
    const formattedDueDate = assignment.due_date 
      ? new Date(assignment.due_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
      : 'Yakında';

    const annTitle = `⚠️ Ödev Hatırlatması: ${assignment.title}`;
    const annContent = `Değerli öğrencilerimiz, "${assignment.title}" ödevinizin son teslim zamanı yaklaşıyor (${formattedDueDate}). Lütfen çalışmalarınızı eksiksiz tamamlayarak sisteme yükleyiniz.`;

    await db.prepare(`
      INSERT INTO teacher_announcements (id, class_id, teacher_id, title, content, category, created_at)
      VALUES (?, ?, ?, ?, ?, 'Ödev Hatırlatma', CURRENT_TIMESTAMP)
    `).run(annId, assignment.class_id, teacherId, annTitle, annContent);

    return NextResponse.json({
      success: true,
      remindedCount: count,
      message: `${count} öğrenciye ödev hatırlatması gönderildi ve sınıf duyurusu oluşturuldu!`
    });
  } catch (error: any) {
    console.error('Ödev hatırlatma hatası:', error);
    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}
