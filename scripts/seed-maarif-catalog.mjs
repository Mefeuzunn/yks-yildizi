import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';
const sql = postgres(connectionString, { ssl: 'require', max: 5 });

const dataFilePath = path.join(__dirname, '../src/lib/maarif-data.json');
const maarifData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));

async function seed() {
  console.log('🌱 MEB Maarif Modeli Müfredat Çıktıları ve Senaryoları Tohumlanıyor...\n');

  const { nodes, scenarios } = maarifData;

  // 1. maarif_curriculum_nodes tohumlama
  console.log(`📦 ${nodes.length} adet Maarif Öğrenme Çıktısı aktarılıyor...`);
  let nodeCount = 0;
  for (const node of nodes) {
    await sql`
      INSERT INTO maarif_curriculum_nodes (
        id, grade, subject, theme_name, code, outcome_title, outcome_description, skill_domain, has_phet_sim, related_sim_slug
      ) VALUES (
        ${node.id}, ${node.grade}, ${node.subject}, ${node.theme_name}, ${node.code},
        ${node.outcome_title}, ${node.outcome_description}, ${node.skill_domain},
        ${node.has_phet_sim}, ${node.related_sim_slug || null}
      )
      ON CONFLICT (code) DO UPDATE SET
        theme_name = EXCLUDED.theme_name,
        outcome_title = EXCLUDED.outcome_title,
        outcome_description = EXCLUDED.outcome_description,
        skill_domain = EXCLUDED.skill_domain,
        has_phet_sim = EXCLUDED.has_phet_sim,
        related_sim_slug = EXCLUDED.related_sim_slug
    `;
    nodeCount++;
  }
  console.log(`✅ ${nodeCount} adet müfredat çıktısı PostgreSQL'e kaydedildi.`);

  // 2. maarif_exam_scenarios tohumlama
  console.log(`\n📋 ${scenarios.length} adet MEB Yazılı Sınav Senaryosu aktarılıyor...`);
  let scenCount = 0;
  for (const scen of scenarios) {
    await sql`
      INSERT INTO maarif_exam_scenarios (
        id, grade, subject, term, exam_number, scenario_name, description, question_distribution, total_points
      ) VALUES (
        ${scen.id}, ${scen.grade}, ${scen.subject}, ${scen.term}, ${scen.exam_number},
        ${scen.scenario_name}, ${scen.description}, ${JSON.stringify(scen.question_distribution)}, ${scen.total_points}
      )
      ON CONFLICT (id) DO UPDATE SET
        scenario_name = EXCLUDED.scenario_name,
        description = EXCLUDED.description,
        question_distribution = EXCLUDED.question_distribution,
        total_points = EXCLUDED.total_points
    `;
    scenCount++;
  }
  console.log(`✅ ${scenCount} adet MEB sınav senaryosu PostgreSQL'e kaydedildi.`);

  // Doğrulama sorgusu
  const totalNodes = await sql`SELECT COUNT(*) as count FROM maarif_curriculum_nodes`;
  const totalScens = await sql`SELECT COUNT(*) as count FROM maarif_exam_scenarios`;
  console.log(`\n📊 Canlı Supabase Tablo İstatistikleri:`);
  console.log(`   - maarif_curriculum_nodes : ${totalNodes[0].count} kayıt`);
  console.log(`   - maarif_exam_scenarios   : ${totalScens[0].count} kayıt`);

  await sql.end();
  console.log('\n🎉 FAZ 2 DB TOHUMLAMA %100 BAŞARIYLA TAMAMLANDI!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Tohumlama hatası:', err);
  process.exit(1);
});
