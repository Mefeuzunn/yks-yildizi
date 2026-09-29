import { NextResponse } from 'next/server';
import { getAuthenticatedTeacherId } from '@/lib/auth-utils';
import db from '@/lib/yks-db-async';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const teacherId = await getAuthenticatedTeacherId(req);
    if (!teacherId) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });

    const user = await db.prepare('SELECT id, role, username FROM users WHERE id = ?').get(teacherId) as any;
    if (!user || user.role !== 'ogretmen') return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });

    const body = await req.json();
    const { classId, title, durationMin = 40 } = body;

    if (!classId) return NextResponse.json({ error: 'Sınıf ID gerekli' }, { status: 400 });

    const cls = await db.prepare('SELECT id, class_name FROM teacher_classes WHERE id = ? AND teacher_id = ?').get(classId, teacherId) as any;
    if (!cls) return NextResponse.json({ error: 'Sınıf bulunamadı veya yetkiniz yok' }, { status: 404 });

    const etutTitle = title?.trim() || `${cls.class_name} Canlı Etüdü`;
    const annId = uuidv4();
    const annTitle = `🚀 Canlı Sınıf Etüdü Başladı: ${etutTitle}`;
    const annContent = `Öğretmeniniz ${user.username}, ${durationMin} dakikalık canlı odaklanma etüdü başlattı! Hemen çalışma odalarına veya Pomodoro moduna geçerek sınıf arkadaşlarınızla birlikte çalışmaya başlayın.`;

    // 1. Duyuru Oluştur
    await db.prepare(`
      INSERT INTO teacher_announcements (id, class_id, teacher_id, title, content, category, created_at)
      VALUES (?, ?, ?, ?, ?, 'Etkinlik', CURRENT_TIMESTAMP)
    `).run(annId, classId, teacherId, annTitle, annContent);

    // 2. Çalışma Odası (Study Room) Oluştur
    const roomId = uuidv4();
    try {
      await db.prepare(`
        INSERT INTO study_rooms (id, name, topic, max_participants, is_active)
        VALUES (?, ?, ?, 60, true)
      `).run(roomId, `${cls.class_name} Etüt Odası`, etutTitle);
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: `"${etutTitle}" (${durationMin} Dk) başarıyla başlatıldı ve sınıfa duyuruldu!`,
      roomId
    });
  } catch (error: any) {
    console.error('Canlı etüt başlatma hatası:', error);
    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}
