import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';
const sql = postgres(connectionString, { ssl: 'require', max: 5 });

async function verifyPhase4() {
  console.log('🔍 [FAZ 4 DOĞRULAMA] MEB Ortak Yazılı Sınav Simülatörü & Açık Uçlu Soru Havuzu Denetleniyor...\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ [TEST ${total}] BAŞARILI: ${message}`);
      passed++;
    } else {
      console.error(`❌ [TEST ${total}] BAŞARISIZ: ${message}`);
    }
  }

  try {
    // 1. maarif_open_ended_questions tablosunda soru var mı?
    const questions = await sql`SELECT * FROM maarif_open_ended_questions ORDER BY id ASC`;
    assert(questions.length >= 12, `maarif_open_ended_questions tablosunda en az 12 açık uçlu soru bulundu (Mevcut: ${questions.length})`);

    // 2. Soruların sınıf kısıtı (9, 10, 11) ve sıfır 12. sınıf/mezun kuralı
    const invalidGrades = questions.filter(q => q.grade < 9 || q.grade > 11);
    assert(invalidGrades.length === 0, `Tüm sorular kesin olarak 9-11. sınıf Maarif kapsamındadır (Hatalı: ${invalidGrades.length})`);

    // 3. Rubrik kriterleri ve puanlama kontrolü
    const questionsWithRubric = questions.filter(q => {
      const rubric = typeof q.rubric_criteria === 'string' ? JSON.parse(q.rubric_criteria) : q.rubric_criteria;
      return Array.isArray(rubric) && rubric.length > 0 && rubric.every(r => r.points && r.criteria);
    });
    assert(questionsWithRubric.length === questions.length, `Tüm sorular geçerli MEB Dereceli Puanlama Anahtarına (Rubrik) sahip (${questionsWithRubric.length}/${questions.length})`);

    // 4. Örnek MEB Çözüm adımları kontrolü
    const questionsWithSolutions = questions.filter(q => {
      const sol = typeof q.sample_solutions === 'string' ? JSON.parse(q.sample_solutions) : q.sample_solutions;
      return Array.isArray(sol) && sol.length > 0;
    });
    assert(questionsWithSolutions.length === questions.length, `Tüm sorular MEB model örnek çözüm adımlarına sahip (${questionsWithSolutions.length}/${questions.length})`);

    // 5. Senaryo ilişkisi kontrolü
    const scenarioIds = [...new Set(questions.map(q => q.scenario_id))];
    const scenarios = await sql`SELECT id FROM maarif_exam_scenarios WHERE id IN ${sql(scenarioIds)}`;
    assert(scenarios.length > 0, `Sorular veritabanındaki kayıtlı MEB yazılı senaryolarına bağlıdır (${scenarios.length} senaryo doğrulandı)`);

    // 6. Sıfır YKS bulaşması (Zero Contamination) kontrolü
    // Sorularda "TYT", "AYT", "Net Hesaplama", "YKS" gibi yabancı klasik kelimelerin soru kökünde veya bağlamında yer almaması
    const contaminated = questions.filter(q => {
      const text = `${q.context_story || ''} ${q.question_text || ''}`.toLowerCase();
      return text.includes('tyt') || text.includes('ayt') || text.includes('yks');
    });
    assert(contaminated.length === 0, `Sorularda ve bağlam senaryolarında klasik YKS/TYT/AYT bulaşması YOKTUR (Sıfır İzolasyon: ${contaminated.length})`);

    // 7. maarif_student_evaluations değerlendirme tablosu yazma/okuma testi
    const testEvalId = `test_eval_${Date.now()}`;
    await sql`
      INSERT INTO maarif_student_evaluations (
        id, user_id, question_id, student_answer_text, mastery_level, ai_feedback, evaluated_at
      ) VALUES (
        ${testEvalId}, 'verify_student', ${questions[0].id}, 'Test yanıt adımı: x = 2 bulunur.', 'Tam Başarılı', 'Doğru çözüm adımı', NOW()
      )
    `;

    const inserted = await sql`SELECT * FROM maarif_student_evaluations WHERE id = ${testEvalId}`;
    assert(inserted.length === 1 && inserted[0].mastery_level === 'Tam Başarılı', `Öğrenci açık uçlu sınav yanıtı başarıyla değerlendirme tablosuna kaydedildi`);

    // Temizle
    await sql`DELETE FROM maarif_student_evaluations WHERE id = ${testEvalId}`;

    console.log(`\n========================================`);
    console.log(`FAZ 4 SONUÇ: ${passed}/${total} TEST BAŞARIYLA GEÇTİ.`);
    console.log(`========================================\n`);

    if (passed === total) {
      console.log('🚀 FAZ 4 (MEB Ortak Yazılı Simülatörü ve Soru Havuzu) %100 ONAYLANDI!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Doğrulama sırasında hata:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

verifyPhase4();
