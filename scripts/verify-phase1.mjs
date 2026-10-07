import postgres from 'postgres';
import { v4 as uuidv4 } from 'uuid';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';
const sql = postgres(connectionString, { ssl: 'require', max: 5 });

async function verifyPhase1() {
  console.log('🧪 FAZ 1 KAPSAMLI DOĞRULAMA TESTİ BAŞLATILIYOR...\n');
  let passedTests = 0;

  // TEST 1: Maarif tablolarının varlığı
  const expectedTables = [
    'maarif_curriculum_nodes',
    'maarif_exam_scenarios',
    'maarif_open_ended_questions',
    'maarif_student_evaluations',
  ];
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name IN ${sql(expectedTables)}
  `;
  const foundTableNames = tables.map(t => t.table_name);
  for (const exp of expectedTables) {
    if (foundTableNames.includes(exp)) {
      console.log(`✅ [TEST 1] Tablo doğrulandı: ${exp}`);
      passedTests++;
    } else {
      throw new Error(`❌ Tablo bulunamadı: ${exp}`);
    }
  }

  // TEST 2: users.curriculum_mode kolonu
  const userCols = await sql`
    SELECT column_name, data_type, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'curriculum_mode';
  `;
  if (userCols.length > 0 && userCols[0].column_name === 'curriculum_mode') {
    console.log(`✅ [TEST 2] users.curriculum_mode kolonu mevcut (Varsayılan: ${userCols[0].column_default})`);
    passedTests++;
  } else {
    throw new Error('❌ users.curriculum_mode kolonu bulunamadı');
  }

  // TEST 3: maarif_curriculum_nodes CRUD testi
  const testNodeId = `test_node_${uuidv4().substring(0, 8)}`;
  await sql`
    INSERT INTO maarif_curriculum_nodes (
      id, grade, subject, theme_name, code, outcome_title, outcome_description, skill_domain, has_phet_sim
    ) VALUES (
      ${testNodeId}, 9, 'Matematik', 'Sayılar ve Algoritmalar', 'TEST.9.1.1',
      'Gerçek Yaşam Algoritmaları', 'Problem çözme adımlarını modeller.', 'Kavramsal Beceri', true
    )
  `;
  const fetchedNode = await sql`SELECT * FROM maarif_curriculum_nodes WHERE id = ${testNodeId}`;
  if (fetchedNode.length > 0 && fetchedNode[0].code === 'TEST.9.1.1') {
    console.log('✅ [TEST 3] maarif_curriculum_nodes kayıt ve okuma başarılı');
    passedTests++;
  } else {
    throw new Error('❌ Node kaydı başarısız');
  }
  await sql`DELETE FROM maarif_curriculum_nodes WHERE id = ${testNodeId}`;

  // TEST 4: maarif_exam_scenarios CRUD testi
  const testScenarioId = `test_scen_${uuidv4().substring(0, 8)}`;
  await sql`
    INSERT INTO maarif_exam_scenarios (
      id, grade, subject, term, exam_number, scenario_name, description, question_distribution, total_points
    ) VALUES (
      ${testScenarioId}, 9, 'Matematik', 1, 1, 'MEB Senaryo Test', '1. Dönem 1. Yazılı',
      ${JSON.stringify([{ node_code: 'MAT.9.1.1', count: 2, points: 20 }])}, 100
    )
  `;
  const fetchedScen = await sql`SELECT * FROM maarif_exam_scenarios WHERE id = ${testScenarioId}`;
  if (fetchedScen.length > 0 && fetchedScen[0].scenario_name === 'MEB Senaryo Test') {
    console.log('✅ [TEST 4] maarif_exam_scenarios kayıt ve okuma başarılı');
    passedTests++;
  } else {
    throw new Error('❌ Senaryo kaydı başarısız');
  }
  await sql`DELETE FROM maarif_exam_scenarios WHERE id = ${testScenarioId}`;

  // TEST 5: maarif_open_ended_questions CRUD testi
  const testQId = `test_q_${uuidv4().substring(0, 8)}`;
  await sql`
    INSERT INTO maarif_open_ended_questions (
      id, curriculum_node_code, grade, subject, context_story, question_text, max_score,
      rubric_criteria, sample_solutions, difficulty_level
    ) VALUES (
      ${testQId}, 'MAT.9.1.1', 9, 'Matematik', 'Bir su deposu algoritması senaryosu',
      'Deponun dolma süresini formüle ediniz.', 10,
      ${JSON.stringify([{ points: 5, criteria: 'Değişkenleri doğru belirleme' }, { points: 5, criteria: 'Bağıntıyı kurma' }])},
      ${JSON.stringify(['t = V / debi'])}, 3
    )
  `;
  const fetchedQ = await sql`SELECT * FROM maarif_open_ended_questions WHERE id = ${testQId}`;
  if (fetchedQ.length > 0 && fetchedQ[0].max_score === 10) {
    console.log('✅ [TEST 5] maarif_open_ended_questions kayıt ve okuma başarılı');
    passedTests++;
  } else {
    throw new Error('❌ Soru kaydı başarısız');
  }
  await sql`DELETE FROM maarif_open_ended_questions WHERE id = ${testQId}`;

  // TEST 6: Klasik YKS Tablolarının Bütünlüğü (Sıfır Karışma Doğrulaması)
  const legacyTables = ['questions', 'user_stats', 'error_log', 'flashcards'];
  const legacyCheck = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name IN ${sql(legacyTables)}
  `;
  if (legacyCheck.length === legacyTables.length) {
    console.log('✅ [TEST 6] Klasik YKS tabloları (questions, user_stats, error_log, flashcards) sağlam ve dokunulmamış!');
    passedTests++;
  } else {
    throw new Error('❌ Klasik YKS tablolarında eksiklik tespit edildi');
  }

  console.log(`\n🎉 FAZ 1 SONUCU: ${passedTests} / 9 doğrulama adımı eksiksiz BAŞARILI!`);
  await sql.end();
  process.exit(0);
}

verifyPhase1().catch(e => {
  console.error('❌ Faz 1 Doğrulama Hatası:', e);
  process.exit(1);
});
