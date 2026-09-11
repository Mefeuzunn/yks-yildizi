import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/yks-db-async';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json({ error: 'Sınıf ID gereklidir.' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('yks_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    // Verify teacher owns the class
    const teacherClass = await db.prepare('SELECT id, class_name FROM teacher_classes WHERE id = ? AND teacher_id = ?')
      .get(classId, sessionId) as any;

    if (!teacherClass) {
      return NextResponse.json({ error: 'Sınıf bulunamadı veya yetkisiz erişim.' }, { status: 403 });
    }

    // Query top 3 hardest topics collectively for this class
    const commonWeaknesses = await db.prepare(`
      SELECT el.subject, el.topic, COUNT(*) as collective_errors
      FROM error_log el
      JOIN class_students cs ON el.user_id = cs.student_id
      WHERE cs.class_id = ?
      GROUP BY el.subject, el.topic
      ORDER BY collective_errors DESC
      LIMIT 3
    `).all(classId) as any[];

    // Generate AI Suggestion based on findings
    let aiInsight = '';
    if (commonWeaknesses.length > 0) {
      const topTopic = commonWeaknesses[0].topic;
      const topSubject = commonWeaknesses[0].subject;
      const errorCount = commonWeaknesses[0].collective_errors;

      aiInsight = `Sınıf genelindeki hata analizlerine göre öğrencilerin en çok zorlandığı konu **${topSubject} - ${topTopic}** olarak öne çıkmaktadır (Toplam ${errorCount} hata). 
      
      **Eğitmen Tavsiyeleri:**
      1. Bir sonraki canlı dersimizde bu konunun kilit formüllerini ve soru tiplerini hızlıca tekrar etmenizi öneririz.
      2. Bu sınıfa özel olarak "Kaynaklar" sekmesinden **${topTopic}** ders notunu/videosunu paylaşabilirsiniz.
      3. Sınıf genelindeki başarıyı artırmak için bu hafta **${topTopic}** konusundan 15 soruluk bir ödev tanımlamak faydalı olacaktır.`;
    } else {
      aiInsight = `Sınıf genelinde henüz yeterli hata verisi birikmemiştir. Öğrencileriniz aktif olarak soru çözmeye devam ettikçe, yapay zeka analiz motorumuz sınıfa özel zayıf yön analizlerini burada paylaşacaktır.
      
      **Öneri:** Öğrencilerinizi "Soru Çöz" ve "Deneme Gir" sekmelerini aktif kullanmaya teşvik edin.`;
    }

    return NextResponse.json({
      success: true,
      className: teacherClass.class_name,
      weaknesses: commonWeaknesses,
      aiInsight
    });

  } catch (error: any) {
    console.error('Class Insights API Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
