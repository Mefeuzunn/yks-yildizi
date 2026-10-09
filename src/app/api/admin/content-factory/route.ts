import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { 
  YKS_CURRICULUM_TAXONOMY, 
  generateFlashcardsBatch, 
  saveFlashcardsToDB 
} from '@/lib/content-factory';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Total counts
    const totalCards = await db.prepare('SELECT COUNT(*) as count FROM flashcards').get() as any;
    const totalQuestions = await db.prepare('SELECT COUNT(*) as count FROM questions').get() as any;

    // 2. Counts grouped by subject
    const subjectStats = await db.prepare(`
      SELECT subject, COUNT(*) as count 
      FROM flashcards 
      GROUP BY subject 
      ORDER BY count DESC
    `).all() as any[];

    // 3. Taxonomy stats
    const taxonomySummary: Record<string, { totalTopics: number; coveredTopics: number; cardCount: number }> = {};
    
    for (const [subj, data] of Object.entries(YKS_CURRICULUM_TAXONOMY)) {
      const dbTopics = await db.prepare(
        'SELECT DISTINCT topic FROM flashcards WHERE subject = ?'
      ).all(subj) as any[];

      const countRow = subjectStats.find(s => s.subject === subj);

      taxonomySummary[subj] = {
        totalTopics: data.topics.length,
        coveredTopics: dbTopics.length,
        cardCount: Number(countRow?.count || 0),
      };
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalFlashcards: Number(totalCards?.count || 0),
        totalQuestions: Number(totalQuestions?.count || 0),
      },
      taxonomySummary,
    });
  } catch (error: any) {
    console.error('Content Factory GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subject, topic, count = 10, autoNext = false } = body;

    let targetSubject = subject;
    let targetTopic = topic;

    // If autoNext is requested, find the topic with the lowest number of cards
    if (autoNext || !targetSubject || !targetTopic) {
      let lowestCount = Infinity;
      let lowestSubj = 'Matematik';
      let lowestTop = YKS_CURRICULUM_TAXONOMY['Matematik'].topics[0];

      for (const [subj, data] of Object.entries(YKS_CURRICULUM_TAXONOMY)) {
        for (const top of data.topics) {
          const row = await db.prepare(
            'SELECT COUNT(*) as cnt FROM flashcards WHERE subject = ? AND topic = ?'
          ).get(subj, top) as any;
          const currentCount = Number(row?.cnt || 0);

          if (currentCount < lowestCount) {
            lowestCount = currentCount;
            lowestSubj = subj;
            lowestTop = top;
          }
        }
      }

      targetSubject = lowestSubj;
      targetTopic = lowestTop;
    }

    console.log(`[Content Factory] Generating ${count} cards for ${targetSubject} -> ${targetTopic}...`);
    const generated = await generateFlashcardsBatch(targetSubject, targetTopic, count);
    const savedCount = await saveFlashcardsToDB(generated);

    return NextResponse.json({
      success: true,
      message: `${savedCount} yeni bilgi kartı başarıyla üretildi ve veritabanına eklendi!`,
      subject: targetSubject,
      topic: targetTopic,
      generatedCount: generated.length,
      savedCount,
      sample: generated.slice(0, 2),
    });
  } catch (error: any) {
    console.error('Content Factory POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
