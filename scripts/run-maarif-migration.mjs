import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';
const sql = postgres(connectionString, { ssl: 'require', max: 5 });

async function run() {
  console.log('🚀 Maarif Modeli DB Tabloları oluşturuluyor...');

  // 1. users tablosuna curriculum_mode
  console.log('1. users tablosu güncelleniyor...');
  await sql`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS curriculum_mode TEXT DEFAULT 'legacy_yks'
  `;

  // 9, 10, 11. sınıftaki kullanıcıları maarif_v1 yap
  const updateUsers = await sql`
    UPDATE users 
    SET curriculum_mode = 'maarif_v1' 
    WHERE (sinif = '9' OR sinif = '10' OR sinif = '11')
      AND (curriculum_mode IS NULL OR curriculum_mode = 'legacy_yks')
  `;
  console.log(`   ${updateUsers.count} adet 9-11. sınıf kullanıcısı maarif_v1 moduna geçirildi.`);

  // 2. maarif_curriculum_nodes
  console.log('2. maarif_curriculum_nodes tablosu oluşturuluyor...');
  await sql`
    CREATE TABLE IF NOT EXISTS maarif_curriculum_nodes (
      id TEXT PRIMARY KEY,
      grade INTEGER NOT NULL,
      subject TEXT NOT NULL,
      theme_name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      outcome_title TEXT NOT NULL,
      outcome_description TEXT NOT NULL,
      skill_domain TEXT NOT NULL,
      has_phet_sim BOOLEAN DEFAULT false,
      related_sim_slug TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_maarif_nodes_grade_subject ON maarif_curriculum_nodes (grade, subject)
  `;

  // 3. maarif_exam_scenarios
  console.log('3. maarif_exam_scenarios tablosu oluşturuluyor...');
  await sql`
    CREATE TABLE IF NOT EXISTS maarif_exam_scenarios (
      id TEXT PRIMARY KEY,
      grade INTEGER NOT NULL,
      subject TEXT NOT NULL,
      term INTEGER NOT NULL,
      exam_number INTEGER NOT NULL,
      scenario_name TEXT NOT NULL,
      description TEXT,
      question_distribution JSONB NOT NULL DEFAULT '[]',
      total_points INTEGER DEFAULT 100,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_maarif_scenarios_lookup ON maarif_exam_scenarios (grade, subject, term, exam_number)
  `;

  // 4. maarif_open_ended_questions
  console.log('4. maarif_open_ended_questions tablosu oluşturuluyor...');
  await sql`
    CREATE TABLE IF NOT EXISTS maarif_open_ended_questions (
      id TEXT PRIMARY KEY,
      curriculum_node_code TEXT NOT NULL,
      grade INTEGER NOT NULL,
      subject TEXT NOT NULL,
      scenario_id TEXT,
      context_story TEXT NOT NULL,
      image_url TEXT,
      question_text TEXT NOT NULL,
      max_score INTEGER NOT NULL DEFAULT 10,
      rubric_criteria JSONB NOT NULL DEFAULT '[]',
      sample_solutions JSONB NOT NULL DEFAULT '[]',
      difficulty_level INTEGER DEFAULT 3,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_maarif_questions_node ON maarif_open_ended_questions (curriculum_node_code)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_maarif_questions_grade_subject ON maarif_open_ended_questions (grade, subject)
  `;

  // 5. maarif_student_evaluations
  console.log('5. maarif_student_evaluations tablosu oluşturuluyor...');
  await sql`
    CREATE TABLE IF NOT EXISTS maarif_student_evaluations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      student_answer_text TEXT NOT NULL,
      ai_score INTEGER,
      ai_feedback TEXT,
      teacher_score INTEGER,
      teacher_feedback TEXT,
      rubric_breakdown JSONB DEFAULT '{}',
      mastery_level TEXT DEFAULT 'Geliştirilmeli',
      evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_maarif_evaluations_user ON maarif_student_evaluations (user_id)
  `;

  // Doğrulama sorgusu
  console.log('\n🔍 Tablolar doğrulanıyor:');
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name LIKE 'maarif_%'
    ORDER BY table_name;
  `;
  console.table(tables.map(t => ({ Tablo: t.table_name })));

  const columns = await sql`
    SELECT column_name, data_type, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'curriculum_mode';
  `;
  console.log('users.curriculum_mode kolonu:', columns[0]);

  console.log('\n✅ MAARİF DB MİGRASYONU %100 BAŞARIYLA TAMAMLANDI!');
  await sql.end();
  process.exit(0);
}

run().catch(e => {
  console.error('Hata:', e);
  process.exit(1);
});
