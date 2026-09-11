import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { countPerTopic = 20, subjects = [] } = body;

    const SUBJECT_MAP: Record<string, string[]> = {
      'Matematik': ['Türev', 'İntegral', 'Trigonometri', 'Logaritma', 'Polinomlar', 'Diziler', 'Limit', 'Fonksiyonlar', 'Problemler'],
      'Fizik': ['Vektörler', 'Dinamik', 'İş Güç Enerji', 'Tork ve Denge', 'Çembersel Hareket', 'Elektrik', 'Optik'],
      'Kimya': ['Gazlar', 'Sıvı Çözeltiler', 'Tepkime Hızları', 'Kimyasal Denge', 'Asit Baz Dengesi', 'Organik Kimya'],
      'Biyoloji': ['Hücre ve Organeller', 'Kalıtım', 'İnsan Fizyolojisi', 'Fotosentez', 'Hücresel Solunum', 'Bitki Biyolojisi'],
      'Türkçe': ['Sözcükte Anlam', 'Paragrafta Anlam', 'Yazım Kuralları', 'Noktalama İşaretleri', 'Ses Bilgisi']
    };

    const targetSubjects = subjects.length > 0 ? subjects : Object.keys(SUBJECT_MAP);

    const insertQuestion = await db.prepare(`
      INSERT INTO questions (subject, topic, text, options_json, correct_option, difficulty)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertFlashcard = await db.prepare(`
      INSERT INTO flashcards (id, user_id, subject, topic, front_text, back_text)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    let createdQuestions = 0;
    let createdFlashcards = 0;

    await db.transaction(async () => {
      targetSubjects.forEach((subject: string) => {
        const topics = SUBJECT_MAP[subject] || ['Genel'];
        topics.forEach((topic: string) => {
          for (let i = 1; i <= countPerTopic; i++) {
            const qText = `${subject} (${topic}) Otomatik YKS Sorusu #${i}: ÖSYM tarzı muhakeme sorusu.`;
            const options = {
              A: `Şık A (${i * 2})`,
              B: `Şık B (${i * 3})`,
              C: `Şık C (${i * 4})`,
              D: `Şık D (${i * 5})`,
              E: `Şık E (${i * 6})`
            };
            const correctOpts = ['A', 'B', 'C', 'D', 'E'];
            const correct = correctOpts[i % 5];
            const diff = (i % 3) + 1;

            insertQuestion.run(subject, topic, qText, JSON.stringify(options), correct, diff);
            createdQuestions++;

            const cardId = uuidv4();
            const front = `${subject} - ${topic}: Ezber Kartı #${i}`;
            const back = `${topic} konusunda bilinmesi gereken Kritik Not #${i}`;

            insertFlashcard.run(cardId, 'system', subject, topic, front, back);
            createdFlashcards++;
          }
        });
      });
    })();

    return NextResponse.json({
      success: true,
      message: `${createdQuestions} soru ve ${createdFlashcards} flashcard veritabanına eklendi!`,
      createdQuestions,
      createdFlashcards
    }, { status: 200 });

  } catch (error) {
    console.error('Bulk generate error:', error);
    return NextResponse.json({ error: 'Toplu veritabanı büyütme hatası' }, { status: 500 });
  }
}
