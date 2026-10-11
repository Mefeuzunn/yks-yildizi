import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { generateQuestionFromTemplate, QuestionTemplate } from '@/lib/engine';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Kullanıcının en çok hata yaptığı konuları bulalım (Maks 10 hata)
    const mistakes = await db.prepare(`
      SELECT * FROM student_mistakes 
      WHERE user_id = ? 
      ORDER BY RANDOM() 
      LIMIT 10
    `).all(userId) as any[];

    if (mistakes.length === 0) {
      return NextResponse.json({ error: 'Hata defterinde henüz kayıtlı soru yok. Test çözerek hata defterini doldurabilirsin!' }, { status: 400 });
    }

    const quizQuestions = [];

    // Adaptif Algoritma: %50 ihtimalle kullanıcının eski yanlışını sor, 
    // %50 ihtimalle aynı konudan YEPYENİ bir soru türet.
    for (const m of mistakes) {
      const shouldGenerateNew = Math.random() > 0.5;
      let addedNew = false;

      if (shouldGenerateNew) {
        // Konu isminden konu ID'sini bulmaya çalış (Hata tablosunda subject/topic isim olarak tutulmuş)
        const topicRow = await db.prepare('SELECT id, ders_id FROM konular WHERE isim = ?').get(m.topic) as any;
        
        if (topicRow) {
          // Bu konuya ait bir soru şablonu var mı?
          const template = await db.prepare('SELECT * FROM soru_sablonlari WHERE konu_id = ? ORDER BY RANDOM() LIMIT 1').get(topicRow.id) as unknown as QuestionTemplate;
          
          if (template) {
            const generated = generateQuestionFromTemplate(template);
            if (generated) {
              quizQuestions.push({
                id: m.id.toString(), // Hala orijinal hata id'sini dönüyoruz ki çözerse eski hatası silinsin
                originalId: m.id,
                subject: m.subject,
                topic: m.topic,
                metin: generated.icerik + "\n\n*(Bu soru yapay zeka tarafından eksiklerini kapatman için sana özel üretilmiştir)*",
                secenekler: generated.secenekler,
                dogruCevap: generated.dogruCevap,
                cozum: generated.cozum
              });
              addedNew = true;
            }
          }
        }

        // Eğer şablondan üretilemediyse, 12.000+ soruluk havuzdan aynı konu/branştan taze soru getir
        if (!addedNew && m.subject) {
          try {
            const altQ = await db.prepare(`
              SELECT * FROM questions 
              WHERE (LOWER(subject) = LOWER(?) OR LOWER(topic) = LOWER(?))
              ORDER BY RANDOM() 
              LIMIT 1
            `).get(m.subject, m.topic || m.subject) as any;

            if (altQ) {
              let optObj: Record<string, string> = {};
              try {
                optObj = typeof altQ.options_json === 'string' ? JSON.parse(altQ.options_json) : (altQ.options_json || {});
              } catch (_) {}
              const secenekler = Object.values(optObj) as string[];
              const correctLetter = altQ.correct_option || 'A';
              const dogruCevap = optObj[correctLetter] || secenekler[0] || 'A';

              quizQuestions.push({
                id: m.id.toString(),
                originalId: m.id,
                subject: altQ.subject || m.subject,
                topic: altQ.topic || m.topic,
                metin: altQ.text + "\n\n*(Bu soru eksiklerini pekiştirmen için soru havuzundan seçilmiştir)*",
                secenekler: secenekler.length > 0 ? secenekler : ['A', 'B', 'C', 'D', 'E'],
                dogruCevap,
                cozum: altQ.explanation || `Doğru Seçenek: ${correctLetter} (${dogruCevap}).`
              });
              addedNew = true;
            }
          } catch (_) {}
        }
      }

      // Eğer yeni soru üretilemediyse veya %50 şans tutmadıysa, orijinal yanlışını sor
      if (!addedNew) {
        quizQuestions.push({
          id: m.id.toString(),
          originalId: m.id,
          subject: m.subject,
          topic: m.topic,
          metin: m.icerik,
          secenekler: JSON.parse(m.secenekler_json || '[]'),
          dogruCevap: m.dogru_cevap,
          cozum: m.cozum
        });
      }
    }

    return NextResponse.json(quizQuestions);
  } catch (error) {
    console.error('Error Quiz GET Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
