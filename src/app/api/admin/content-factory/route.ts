import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { 
  YKS_CURRICULUM_TAXONOMY, 
  generateFlashcardsBatch, 
  saveFlashcardsToDB,
  generateQuestionsBatch,
  saveQuestionsToDB
} from '@/lib/content-factory';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Total counts
    const totalCards = await db.prepare('SELECT COUNT(*) as count FROM flashcards').get() as any;
    const totalQuestions = await db.prepare('SELECT COUNT(*) as count FROM questions').get() as any;

    // 2. Counts grouped by subject for flashcards
    const flashcardSubjectStats = await db.prepare(`
      SELECT subject, COUNT(*) as count 
      FROM flashcards 
      GROUP BY subject 
      ORDER BY count DESC
    `).all() as any[];

    // 3. Counts grouped by subject for questions
    const questionSubjectStats = await db.prepare(`
      SELECT subject, COUNT(*) as count 
      FROM questions 
      GROUP BY subject 
      ORDER BY count DESC
    `).all() as any[];

    // 4. Taxonomy coverage summary
    const taxonomySummary: Record<string, { totalTopics: number; coveredCardTopics: number; cardCount: number; questionCount: number }> = {};
    
    for (const [subj, data] of Object.entries(YKS_CURRICULUM_TAXONOMY)) {
      const dbTopics = await db.prepare(
        'SELECT DISTINCT topic FROM flashcards WHERE subject = ?'
      ).all(subj) as any[];

      const cardCountRow = flashcardSubjectStats.find(s => s.subject === subj);
      const questionCountRow = questionSubjectStats.find(s => s.subject === subj);

      taxonomySummary[subj] = {
        totalTopics: data.topics.length,
        coveredCardTopics: dbTopics.length,
        cardCount: Number(cardCountRow?.count || 0),
        questionCount: Number(questionCountRow?.count || 0),
      };
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalFlashcards: Number(totalCards?.count || 0),
        totalQuestions: Number(totalQuestions?.count || 0),
      },
      flashcardSubjectStats,
      questionSubjectStats,
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
    const { 
      type = 'flashcards', // 'flashcards' | 'questions'
      subject, 
      topic, 
      count = 5, 
      autoNext = false 
    } = body;

    let targetSubject = subject;
    let targetTopic = topic;

    // If autoNext is requested, find the topic with the lowest count in that content type
    if (autoNext || !targetSubject || !targetTopic) {
      let lowestCount = Infinity;
      let lowestSubj = 'Matematik';
      let lowestTop = YKS_CURRICULUM_TAXONOMY['Matematik'].topics[0];

      const tableName = type === 'questions' ? 'questions' : 'flashcards';

      for (const [subj, data] of Object.entries(YKS_CURRICULUM_TAXONOMY)) {
        for (const top of data.topics) {
          const row = await db.prepare(
            `SELECT COUNT(*) as cnt FROM ${tableName} WHERE subject = ? AND topic = ?`
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

    if (type === 'questions') {
      console.log(`[Content Factory] Generating ${count} questions for ${targetSubject} -> ${targetTopic}...`);
      const generated = await generateQuestionsBatch(targetSubject, targetTopic, count);
      const savedCount = await saveQuestionsToDB(generated);

      return NextResponse.json({
        success: true,
        type: 'questions',
        message: `${savedCount} yeni ÖSYM standartlarında soru başarıyla üretildi ve veritabanına eklendi!`,
        subject: targetSubject,
        topic: targetTopic,
        generatedCount: generated.length,
        savedCount,
        sample: generated.slice(0, 1),
      });
    } else {
      console.log(`[Content Factory] Generating ${count} flashcards for ${targetSubject} -> ${targetTopic}...`);
      const generated = await generateFlashcardsBatch(targetSubject, targetTopic, count);
      const savedCount = await saveFlashcardsToDB(generated);

      return NextResponse.json({
        success: true,
        type: 'flashcards',
        message: `${savedCount} yeni bilgi kartı başarıyla üretildi ve veritabanına eklendi!`,
        subject: targetSubject,
        topic: targetTopic,
        generatedCount: generated.length,
        savedCount,
        sample: generated.slice(0, 2),
      });
    }

  } catch (error: any) {
    console.error('Content Factory POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
