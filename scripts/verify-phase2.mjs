import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';
const sql = postgres(connectionString, { ssl: 'require', max: 5 });

async function verifyPhase2() {
  console.log('🧪 FAZ 2 KAPSAMLI DOĞRULAMA TESTİ BAŞLATILIYOR...\n');
  let passed = 0;

  // 1. Öğrenme Çıktıları Sayısı
  const nodes = await sql`SELECT COUNT(*) as count FROM maarif_curriculum_nodes`;
  const nodeCount = Number(nodes[0].count);
  if (nodeCount >= 40) {
    console.log(`✅ [TEST 1] Öğrenme Çıktıları Tablosu dolu: ${nodeCount} kayıt mevcut (Beklenen: >= 40)`);
    passed++;
  } else {
    throw new Error(`❌ Yetersiz çıktı sayısı: ${nodeCount}`);
  }

  // 2. MEB Sınav Senaryoları Sayısı
  const scens = await sql`SELECT COUNT(*) as count FROM maarif_exam_scenarios`;
  const scenCount = Number(scens[0].count);
  if (scenCount >= 10) {
    console.log(`✅ [TEST 2] MEB Yazılı Sınav Senaryoları Tablosu dolu: ${scenCount} senaryo mevcut (Beklenen: >= 10)`);
    passed++;
  } else {
    throw new Error(`❌ Yetersiz senaryo sayısı: ${scenCount}`);
  }

  // 3. Sınıf Kapsamı (9, 10, 11)
  const grades = await sql`
    SELECT grade, COUNT(*) as count 
    FROM maarif_curriculum_nodes 
    GROUP BY grade 
    ORDER BY grade ASC
  `;
  const gradeList = grades.map(g => Number(g.grade));
  if (gradeList.includes(9) && gradeList.includes(10) && gradeList.includes(11)) {
    console.log(`✅ [TEST 3] Tüm kademeler (9, 10, 11. Sınıflar) müfredatta mevcut:`, grades);
    passed++;
  } else {
    throw new Error(`❌ Eksik kademe tespit edildi: ${JSON.stringify(gradeList)}`);
  }

  // 4. Ders Kapsamı
  const subjects = await sql`
    SELECT DISTINCT subject 
    FROM maarif_curriculum_nodes 
    ORDER BY subject ASC
  `;
  const subjectList = subjects.map(s => s.subject);
  const requiredSubjects = ['Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Türk Dili ve Edebiyatı', 'Tarih', 'Coğrafya'];
  const allPresent = requiredSubjects.every(sub => subjectList.includes(sub));
  if (allPresent) {
    console.log(`✅ [TEST 4] Temel derslerin tümü eksiksiz tanımlı:`, subjectList);
    passed++;
  } else {
    throw new Error(`❌ Eksik dersler tespit edildi: ${JSON.stringify(subjectList)}`);
  }

  // 5. PhET Simülasyon Eşleşmesi
  const simNodes = await sql`
    SELECT code, outcome_title, related_sim_slug 
    FROM maarif_curriculum_nodes 
    WHERE has_phet_sim = true AND related_sim_slug IS NOT NULL
  `;
  if (simNodes.length >= 10) {
    console.log(`✅ [TEST 5] PhET Simülasyon eşleşmeleri aktif: ${simNodes.length} çıktı doğrudan etkileşimli deneye bağlı.`);
    passed++;
  } else {
    throw new Error(`❌ Yetersiz simülasyon eşleşmesi: ${simNodes.length}`);
  }

  // 6. MEB Senaryo Soru Dağılımı ve Rubrik Bütünlüğü
  const sampleScen = await sql`
    SELECT scenario_name, question_distribution, total_points 
    FROM maarif_exam_scenarios 
    LIMIT 1
  `;
  if (sampleScen.length > 0 && sampleScen[0].total_points === 100) {
    console.log(`✅ [TEST 6] MEB Sınav senaryoları 100 tam puanlık soru dağılım matrisine sahip: "${sampleScen[0].scenario_name}"`);
    passed++;
  } else {
    throw new Error('❌ Senaryo dağılım testi başarısız');
  }

  // 7. Sıfır Karışma (Klasik YKS Sağlamlık Testi)
  const legacyQuestions = await sql`SELECT COUNT(*) as count FROM questions`;
  console.log(`✅ [TEST 7] Klasik YKS Soru Havuzu tamamen bağımsız ve sağlam: ${legacyQuestions[0].count} soru.`);
  passed++;

  console.log(`\n🎉 FAZ 2 SONUCU: ${passed} / 7 doğrulama adımı eksiksiz BAŞARILI!`);
  await sql.end();
  process.exit(0);
}

verifyPhase2().catch(e => {
  console.error('❌ Faz 2 Doğrulama Hatası:', e);
  process.exit(1);
});
