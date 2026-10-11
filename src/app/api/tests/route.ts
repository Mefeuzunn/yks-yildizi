import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { CURATED_TEST_SUITES, CURATED_EXAM_QUESTIONS } from '@/lib/data/exam-questions-catalog';
import { generateQuestionFromTemplate, QuestionTemplate } from '@/lib/engine';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url, 'http://localhost');
    const testId = searchParams.get('id');
    const category = searchParams.get('category');
    const examType = searchParams.get('examType');
    const subject = searchParams.get('subject');

    // ── Single Test Question Loading ─────────────────────────────────────────
    if (testId) {
      const suite = CURATED_TEST_SUITES.find(s => s.id === testId);

      let questions: any[] = [];

      if (suite?.category === 'procedural') {
        // Procedural Infinite Generator: Generate from templates
        const templates = await db.prepare('SELECT * FROM soru_sablonlari ORDER BY RANDOM() LIMIT 10').all() as any[];
        
        for (const t of templates) {
          const gen = generateQuestionFromTemplate(t as QuestionTemplate);
          if (gen) {
            questions.push({
              id: `proc_${Math.random().toString(36).substring(2, 9)}`,
              subject: suite.subject || 'Matematik',
              topic: 'Parametrik Üretim',
              text: gen.icerik,
              options: gen.secenekler.reduce((acc: any, curr: string, i: number) => {
                const letter = String.fromCharCode(65 + i);
                acc[letter] = curr;
                return acc;
              }, {}),
              optionsArray: gen.secenekler,
              correctOption: String.fromCharCode(65 + gen.secenekler.indexOf(gen.dogruCevap)),
              correctAnswer: Math.max(0, gen.secenekler.indexOf(gen.dogruCevap)),
              difficulty: 3,
              explanation: gen.cozum,
              hint: 'Adımları dikkatlice takip et ve formüldeki değişkenleri yerine koy.'
            });
          }
        }
      } else if (suite?.category === 'past_exam' && suite.year) {
        // Fetch past exam questions for that year, examType and subject
        let query = 'SELECT * FROM questions WHERE is_past_exam = true AND exam_year = ?';
        const params: any[] = [suite.year];

        if (suite.examType && suite.examType !== 'TYT/AYT') {
          query += ' AND exam_type = ?';
          params.push(suite.examType);
        }

        if (suite.subject && suite.subject !== 'Tüm Dersler' && !suite.subject.includes('&')) {
          query += ' AND LOWER(subject) = LOWER(?)';
          params.push(suite.subject);
        }

        query += ' ORDER BY id ASC LIMIT ?';
        params.push(suite.questionCount || 20);

        let dbRows = await db.prepare(query).all(...params) as any[];

        // If not enough year-specific rows, supplement from catalog or general DB
        if (dbRows.length < (suite.questionCount || 10)) {
          const supplement = await db.prepare('SELECT * FROM questions ORDER BY RANDOM() LIMIT ?').all(suite.questionCount - dbRows.length) as any[];
          dbRows = [...dbRows, ...supplement];
        }

        questions = formatDbQuestions(dbRows);
      } else if (suite?.category === 'predicted') {
        // Fetch predicted questions (support year and examType filtering)
        let query = 'SELECT * FROM questions WHERE is_predicted = true';
        const params: any[] = [];

        if (suite.year) {
          query += ' AND exam_year = ?';
          params.push(suite.year);
        }

        if (suite.examType && suite.examType !== 'TYT/AYT') {
          query += ' AND exam_type = ?';
          params.push(suite.examType);
        }

        if (suite.subject && suite.subject !== 'Tüm Dersler' && !suite.subject.includes('&')) {
          query += ' AND LOWER(subject) = LOWER(?)';
          params.push(suite.subject);
        }

        query += ' ORDER BY id ASC LIMIT ?';
        params.push(suite.questionCount || 15);

        let dbRows = await db.prepare(query).all(...params) as any[];

        // If needed supplement with predicted questions
        if (dbRows.length < (suite.questionCount || 10)) {
          const supp = await db.prepare('SELECT * FROM questions WHERE is_predicted = true ORDER BY RANDOM() LIMIT ?').all(suite.questionCount - dbRows.length) as any[];
          dbRows = [...dbRows, ...supp];
        }

        questions = formatDbQuestions(dbRows);
      } else if (suite) {
        // General or MEB Kazanim test
        let query = 'SELECT * FROM questions';
        const params: any[] = [];
        if (suite.subject && suite.subject !== 'Tüm Dersler') {
          query += ' WHERE (LOWER(subject) = LOWER(?) OR LOWER(subject) LIKE ?)';
          params.push(suite.subject, `%${suite.subject.toLowerCase()}%`);
        }
        query += ' ORDER BY RANDOM() LIMIT ?';
        params.push(suite.questionCount || 15);

        const dbRows = await db.prepare(query).all(...params) as any[];
        questions = formatDbQuestions(dbRows);
      } else {
        // Custom or direct ID search in questions table
        const dbRows = await db.prepare('SELECT * FROM questions ORDER BY RANDOM() LIMIT 15').all() as any[];
        questions = formatDbQuestions(dbRows);
      }

      return NextResponse.json({
        success: true,
        test: {
          id: testId,
          title: suite?.title || 'YKS Deneme Testi',
          subject: suite?.subject || 'Karma',
          examType: suite?.examType || 'TYT',
          durationMinutes: suite?.durationMinutes || 25,
          questionCount: questions.length,
          questions
        }
      });
    }

    // ── List Test Suites & Global Pool Statistics ────────────────────────────
    const yearParam = searchParams.get('year');
    let filteredSuites = [...CURATED_TEST_SUITES];

    if (category && category !== 'all') {
      filteredSuites = filteredSuites.filter(s => s.category === category);
    }
    if (examType && examType !== 'all') {
      filteredSuites = filteredSuites.filter(s => s.examType === examType || s.examType === 'TYT/AYT');
    }
    if (subject && subject !== 'all') {
      filteredSuites = filteredSuites.filter(s => s.subject.toLowerCase().includes(subject.toLowerCase()));
    }
    if (yearParam && yearParam !== 'all') {
      const numericYear = parseInt(yearParam);
      if (!isNaN(numericYear)) {
        filteredSuites = filteredSuites.filter(s => s.year === numericYear);
      }
    }

    // Fetch database question pool counts
    const totalCountRow = await db.prepare('SELECT count(*) as total FROM questions').get() as any;
    const pastExamCountRow = await db.prepare('SELECT count(*) as total FROM questions WHERE is_past_exam = true').get() as any;
    const predictedCountRow = await db.prepare('SELECT count(*) as total FROM questions WHERE is_predicted = true').get() as any;
    const yearCounts = await db.prepare('SELECT exam_year, count(*) as count FROM questions WHERE exam_year IS NOT NULL GROUP BY exam_year ORDER BY exam_year DESC').all() as any[];

    return NextResponse.json({
      success: true,
      stats: {
        totalPoolSize: Number(totalCountRow?.total || 8895),
        pastExamQuestions: Number(pastExamCountRow?.total || 70),
        predictedQuestions: Number(predictedCountRow?.total || 20),
        testSuitesCount: CURATED_TEST_SUITES.length,
        yearDistribution: yearCounts.reduce((acc: any, curr: any) => {
          acc[curr.exam_year] = Number(curr.count);
          return acc;
        }, {})
      },
      testSuites: filteredSuites
    });

  } catch (error: any) {
    console.error('Tests API Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// ── Custom Test Builder POST Endpoint ───────────────────────────────────────
export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      subject, 
      topic, 
      examType = 'TYT', 
      questionCount = 10, 
      durationMinutes = 15, 
      difficulty = 'all', 
      includePastExams = true, 
      includePredicted = true 
    } = body;

    const count = Math.min(Math.max(Number(questionCount) || 10, 5), 40);
    const duration = Math.min(Math.max(Number(durationMinutes) || 15, 5), 180);

    let query = 'SELECT * FROM questions WHERE 1=1';
    const params: any[] = [];

    if (subject && subject !== 'all') {
      query += ' AND (LOWER(subject) = LOWER(?) OR LOWER(subject) LIKE ?)';
      params.push(subject, `%${subject.toLowerCase()}%`);
    }

    if (topic && topic !== 'all') {
      query += ' AND (LOWER(topic) = LOWER(?) OR LOWER(topic) LIKE ?)';
      params.push(topic, `%${topic.toLowerCase()}%`);
    }

    if (examType && examType !== 'all') {
      query += ' AND (exam_type = ? OR exam_type = \'TYT/AYT\')';
      params.push(examType);
    }

    if (difficulty && difficulty !== 'all') {
      query += ' AND difficulty = ?';
      params.push(parseInt(difficulty));
    }

    query += ' ORDER BY RANDOM() LIMIT ?';
    params.push(count);

    let rows = await db.prepare(query).all(...params) as any[];

    // Fallback if no exact topic rows
    if (rows.length === 0 && subject && subject !== 'all') {
      rows = await db.prepare('SELECT * FROM questions WHERE LOWER(subject) = LOWER(?) ORDER BY RANDOM() LIMIT ?').all(subject, count) as any[];
    }
    if (rows.length === 0) {
      rows = await db.prepare('SELECT * FROM questions ORDER BY RANDOM() LIMIT ?').all(count) as any[];
    }

    const formattedQuestions = formatDbQuestions(rows);

    const customTestId = `custom_${Date.now()}`;
    const testTitle = topic && topic !== 'all' 
      ? `Özel ${subject} - ${topic} Testi` 
      : (subject && subject !== 'all' ? `Özel ${subject} Karma Testi` : `Özel ${examType} Genel Testi`);

    return NextResponse.json({
      success: true,
      test: {
        id: customTestId,
        title: testTitle,
        subject: subject || 'Karma',
        examType,
        durationMinutes: duration,
        questionCount: formattedQuestions.length,
        questions: formattedQuestions
      }
    });

  } catch (error: any) {
    console.error('Custom Test API Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// Helper to normalize DB rows into standard test question format
function formatDbQuestions(rows: any[]): any[] {
  return rows.map((q, idx) => {
    let optionsObj: Record<string, string> = {};
    try {
      optionsObj = typeof q.options_json === 'string' ? JSON.parse(q.options_json) : (q.options_json || {});
    } catch (_) {}

    const letters = ['A', 'B', 'C', 'D', 'E'];
    const optionsArray = Object.keys(optionsObj).length > 0
      ? letters.map(l => optionsObj[l] || '').filter(Boolean)
      : (Array.isArray(q.options_json) ? q.options_json : ['A', 'B', 'C', 'D', 'E']);

    const correctLetter = (q.correct_option || 'A').toUpperCase();
    const correctIdx = letters.indexOf(correctLetter) >= 0 ? letters.indexOf(correctLetter) : 0;

    let tagObj: any = {};
    try {
      tagObj = typeof q.tags === 'string' ? JSON.parse(q.tags) : (q.tags || {});
    } catch (_) {}

    return {
      id: q.id || `q_${idx}`,
      subject: q.subject,
      topic: q.topic,
      text: q.text,
      options: optionsObj,
      optionsArray,
      correctOption: correctLetter,
      correctAnswer: correctIdx,
      difficulty: q.difficulty || 3,
      isPastExam: Boolean(q.is_past_exam),
      examYear: q.exam_year || null,
      isPredicted: Boolean(q.is_predicted),
      explanation: q.explanation || `${q.subject || ''} - ${q.topic || ''} sorusunun pedagojik açıklaması.`,
      hint: tagObj.hint || 'Soru kökündeki anahtar kavramları ve soru tipinin temel kuralını hatırla.'
    };
  });
}
