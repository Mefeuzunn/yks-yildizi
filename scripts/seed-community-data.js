const postgres = require('postgres');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';
const sql = postgres(connectionString, { ssl: 'require' });

async function seed() {
  console.log('Seeding Community & Academic Data (FAZ 4)...');

  // 1. Universities
  const unis = [
    { id: 'boun', name: 'Boğaziçi Üniversitesi', type: 'Devlet', city: 'İstanbul' },
    { id: 'odtu', name: 'Orta Doğu Teknik Üniversitesi', type: 'Devlet', city: 'Ankara' },
    { id: 'itu', name: 'İstanbul Teknik Üniversitesi', type: 'Devlet', city: 'İstanbul' },
    { id: 'koc', name: 'Koç Üniversitesi', type: 'Vakıf', city: 'İstanbul' },
    { id: 'bilkent', name: 'İhsan Doğramacı Bilkent Üniversitesi', type: 'Vakıf', city: 'Ankara' },
    { id: 'sabanci', name: 'Sabancı Üniversitesi', type: 'Vakıf', city: 'İstanbul' },
    { id: 'hacettepe', name: 'Hacettepe Üniversitesi', type: 'Devlet', city: 'Ankara' },
    { id: 'iu', name: 'İstanbul Üniversitesi', type: 'Devlet', city: 'İstanbul' },
    { id: 'au', name: 'Ankara Üniversitesi', type: 'Devlet', city: 'Ankara' },
    { id: 'ytu', name: 'Yıldız Teknik Üniversitesi', type: 'Devlet', city: 'İstanbul' },
    { id: 'ege', name: 'Ege Üniversitesi', type: 'Devlet', city: 'İzmir' },
    { id: 'gazi', name: 'Gazi Üniversitesi', type: 'Devlet', city: 'Ankara' },
    { id: 'marmara', name: 'Marmara Üniversitesi', type: 'Devlet', city: 'İstanbul' },
    { id: 'deu', name: 'Dokuz Eylül Üniversitesi', type: 'Devlet', city: 'İzmir' },
    { id: 'gtu', name: 'Gebze Teknik Üniversitesi', type: 'Devlet', city: 'Kocaeli' },
    { id: 'iuc', name: 'İstanbul Üniversitesi - Cerrahpaşa', type: 'Devlet', city: 'İstanbul' },
    { id: 'tau', name: 'Türk-Alman Üniversitesi', type: 'Devlet', city: 'İstanbul' },
    { id: 'gsau', name: 'Galatasaray Üniversitesi', type: 'Devlet', city: 'İstanbul' },
    { id: 'iyte', name: 'İzmir Yüksek Teknoloji Enstitüsü', type: 'Devlet', city: 'İzmir' },
    { id: 'medipol', name: 'İstanbul Medipol Üniversitesi', type: 'Vakıf', city: 'İstanbul' },
    { id: 'baskent', name: 'Başkent Üniversitesi', type: 'Vakıf', city: 'Ankara' },
    { id: 'yeditepe', name: 'Yeditepe Üniversitesi', type: 'Vakıf', city: 'İstanbul' },
    { id: 'tobb', name: 'TOBB Ekonomi ve Teknoloji Üniversitesi', type: 'Vakıf', city: 'Ankara' },
    { id: 'ozyegin', name: 'Özyeğin Üniversitesi', type: 'Vakıf', city: 'İstanbul' },
    { id: 'akdeniz', name: 'Akdeniz Üniversitesi', type: 'Devlet', city: 'Antalya' },
  ];

  for (const u of unis) {
    await sql`
      INSERT INTO universities (id, name, type, city)
      VALUES (${u.id}, ${u.name}, ${u.type}, ${u.city})
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, city = EXCLUDED.city
    `;
  }
  console.log(`✅ ${unis.length} üniversite güncellendi/eklendi.`);

  // 2. Departments
  const depts = [
    // Boğaziçi
    { id: 'boun-ceng', uni_id: 'boun', name: 'Bilgisayar Mühendisliği (İngilizce)', faculty: 'Mühendislik Fakültesi', score_type: 'SAY', base_score: 550.2, ranking: 280, quota: 90, year: '2025' },
    { id: 'boun-ee', uni_id: 'boun', name: 'Elektrik-Elektronik Mühendisliği (İngilizce)', faculty: 'Mühendislik Fakültesi', score_type: 'SAY', base_score: 546.8, ranking: 520, quota: 80, year: '2025' },
    { id: 'boun-ie', uni_id: 'boun', name: 'Endüstri Mühendisliği (İngilizce)', faculty: 'Mühendislik Fakültesi', score_type: 'SAY', base_score: 543.1, ranking: 850, quota: 75, year: '2025' },
    { id: 'boun-econ', uni_id: 'boun', name: 'İktisat (İngilizce)', faculty: 'İktisadi ve İdari Bilimler Fakültesi', score_type: 'EA', base_score: 532.5, ranking: 450, quota: 100, year: '2025' },
    { id: 'boun-ba', uni_id: 'boun', name: 'İşletme (İngilizce)', faculty: 'İktisadi ve İdari Bilimler Fakültesi', score_type: 'EA', base_score: 536.0, ranking: 320, quota: 95, year: '2025' },
    { id: 'boun-psy', uni_id: 'boun', name: 'Psikoloji (İngilizce)', faculty: 'Fen-Edebiyat Fakültesi', score_type: 'EA', base_score: 528.4, ranking: 980, quota: 60, year: '2025' },
    
    // ODTÜ
    { id: 'odtu-ceng', uni_id: 'odtu', name: 'Bilgisayar Mühendisliği (İngilizce)', faculty: 'Mühendislik Fakültesi', score_type: 'SAY', base_score: 547.5, ranking: 450, quota: 110, year: '2025' },
    { id: 'odtu-ee', uni_id: 'odtu', name: 'Elektrik-Elektronik Mühendisliği (İngilizce)', faculty: 'Mühendislik Fakültesi', score_type: 'SAY', base_score: 544.2, ranking: 710, quota: 190, year: '2025' },
    { id: 'odtu-me', uni_id: 'odtu', name: 'Makine Mühendisliği (İngilizce)', faculty: 'Mühendislik Fakültesi', score_type: 'SAY', base_score: 535.8, ranking: 2100, quota: 180, year: '2025' },
    { id: 'odtu-aero', uni_id: 'odtu', name: 'Havacılık ve Uzay Mühendisliği (İngilizce)', faculty: 'Mühendislik Fakültesi', score_type: 'SAY', base_score: 541.0, ranking: 1150, quota: 85, year: '2025' },
    { id: 'odtu-ba', uni_id: 'odtu', name: 'İşletme (İngilizce)', faculty: 'İktisadi ve İdari Bilimler Fakültesi', score_type: 'EA', base_score: 521.4, ranking: 1650, quota: 95, year: '2025' },
    
    // İTÜ
    { id: 'itu-ceng', uni_id: 'itu', name: 'Bilgisayar Mühendisliği (İngilizce)', faculty: 'Bilgisayar ve Bilişim Fakültesi', score_type: 'SAY', base_score: 544.0, ranking: 750, quota: 115, year: '2025' },
    { id: 'itu-ai', uni_id: 'itu', name: 'Yapay Zeka ve Veri Mühendisliği (İngilizce)', faculty: 'Bilgisayar ve Bilişim Fakültesi', score_type: 'SAY', base_score: 542.5, ranking: 950, quota: 50, year: '2025' },
    { id: 'itu-ee', uni_id: 'itu', name: 'Elektronik ve Haberleşme Mühendisliği (İngilizce)', faculty: 'Elektrik-Elektronik Fakültesi', score_type: 'SAY', base_score: 536.2, ranking: 2050, quota: 90, year: '2025' },
    { id: 'itu-arch', uni_id: 'itu', name: 'Mimarlık (İngilizce)', faculty: 'Mimarlık Fakültesi', score_type: 'SAY', base_score: 505.4, ranking: 11200, quota: 70, year: '2025' },

    // Hacettepe
    { id: 'hacettepe-tip', uni_id: 'hacettepe', name: 'Tıp (Türkçe)', faculty: 'Tıp Fakültesi', score_type: 'SAY', base_score: 541.9, ranking: 1050, quota: 250, year: '2025' },
    { id: 'hacettepe-tip-ing', uni_id: 'hacettepe', name: 'Tıp (İngilizce)', faculty: 'Tıp Fakültesi', score_type: 'SAY', base_score: 545.6, ranking: 580, quota: 150, year: '2025' },
    { id: 'hacettepe-dent', uni_id: 'hacettepe', name: 'Diş Hekimliği', faculty: 'Diş Hekimliği Fakültesi', score_type: 'SAY', base_score: 512.3, ranking: 8500, quota: 140, year: '2025' },
    { id: 'hacettepe-pharm', uni_id: 'hacettepe', name: 'Eczacılık', faculty: 'Eczacılık Fakültesi', score_type: 'SAY', base_score: 492.7, ranking: 21500, quota: 120, year: '2025' },

    // İstanbul Üniversitesi & Cerrahpaşa
    { id: 'iu-hukuk', uni_id: 'iu', name: 'Hukuk', faculty: 'Hukuk Fakültesi', score_type: 'EA', base_score: 478.5, ranking: 4200, quota: 500, year: '2025' },
    { id: 'iuc-tip', uni_id: 'iuc', name: 'Cerrahpaşa Tıp (Türkçe)', faculty: 'Cerrahpaşa Tıp Fakültesi', score_type: 'SAY', base_score: 539.8, ranking: 1450, quota: 260, year: '2025' },
    { id: 'iuc-tip-ing', uni_id: 'iuc', name: 'Cerrahpaşa Tıp (İngilizce)', faculty: 'Cerrahpaşa Tıp Fakültesi', score_type: 'SAY', base_score: 544.1, ranking: 720, quota: 70, year: '2025' },

    // Koç & Bilkent & Sabancı
    { id: 'koc-tip-burslu', uni_id: 'koc', name: 'Tıp (İngilizce) (Burslu)', faculty: 'Tıp Fakültesi', score_type: 'SAY', base_score: 554.8, ranking: 65, quota: 12, year: '2025' },
    { id: 'koc-ceng-burslu', uni_id: 'koc', name: 'Bilgisayar Mühendisliği (Burslu)', faculty: 'Mühendislik Fakültesi', score_type: 'SAY', base_score: 552.1, ranking: 140, quota: 15, year: '2025' },
    { id: 'koc-hukuk-burslu', uni_id: 'koc', name: 'Hukuk (Burslu)', faculty: 'Hukuk Fakültesi', score_type: 'EA', base_score: 545.3, ranking: 85, quota: 15, year: '2025' },
    { id: 'bilkent-ceng-burslu', uni_id: 'bilkent', name: 'Bilgisayar Mühendisliği (Burslu)', faculty: 'Mühendislik Fakültesi', score_type: 'SAY', base_score: 551.4, ranking: 190, quota: 35, year: '2025' },
    { id: 'sabanci-muh-burslu', uni_id: 'sabanci', name: 'Mühendislik ve Doğa Bilimleri (Burslu)', faculty: 'Mühendislik ve Doğa Bilimleri Fakültesi', score_type: 'SAY', base_score: 548.7, ranking: 380, quota: 55, year: '2025' },

    // Yıldız Teknik
    { id: 'ytu-ceng', uni_id: 'ytu', name: 'Bilgisayar Mühendisliği (İngilizce)', faculty: 'Elektrik-Elektronik Fakültesi', score_type: 'SAY', base_score: 535.1, ranking: 2300, quota: 95, year: '2025' },
    { id: 'ytu-ee', uni_id: 'ytu', name: 'Elektrik Mühendisliği', faculty: 'Elektrik-Elektronik Fakültesi', score_type: 'SAY', base_score: 508.2, ranking: 9800, quota: 120, year: '2025' },
    { id: 'ytu-me', uni_id: 'ytu', name: 'Makine Mühendisliği', faculty: 'Makine Fakültesi', score_type: 'SAY', base_score: 512.8, ranking: 8200, quota: 140, year: '2025' },

    // Ankara & Ege & Marmara
    { id: 'au-hukuk', uni_id: 'au', name: 'Hukuk', faculty: 'Hukuk Fakültesi', score_type: 'EA', base_score: 482.3, ranking: 3500, quota: 450, year: '2025' },
    { id: 'ege-tip', uni_id: 'ege', name: 'Tıp', faculty: 'Tıp Fakültesi', score_type: 'SAY', base_score: 533.4, ranking: 2750, quota: 320, year: '2025' },
    { id: 'marmara-tip', uni_id: 'marmara', name: 'Tıp (İngilizce)', faculty: 'Tıp Fakültesi', score_type: 'SAY', base_score: 535.9, ranking: 2150, quota: 170, year: '2025' },
    { id: 'marmara-hukuk', uni_id: 'marmara', name: 'Hukuk', faculty: 'Hukuk Fakültesi', score_type: 'EA', base_score: 472.1, ranking: 5800, quota: 400, year: '2025' },

    // Sözel & Dil Seçkin Bölümler
    { id: 'boun-trans', uni_id: 'boun', name: 'Çeviribilim (İngilizce)', faculty: 'Fen-Edebiyat Fakültesi', score_type: 'DİL', base_score: 524.6, ranking: 340, quota: 55, year: '2025' },
    { id: 'gsau-iletisim', uni_id: 'gsau', name: 'İletişim (Fransızca)', faculty: 'İletişim Fakültesi', score_type: 'SÖZ', base_score: 485.4, ranking: 450, quota: 40, year: '2025' },
    { id: 'itu-econ', uni_id: 'itu', name: 'Ekonomi (İngilizce)', faculty: 'İşletme Fakültesi', score_type: 'EA', base_score: 530.8, ranking: 820, quota: 60, year: '2025' }
  ];

  for (const d of depts) {
    await sql`
      INSERT INTO departments (id, uni_id, name, faculty, score_type, base_score, ranking, quota, year)
      VALUES (${d.id}, ${d.uni_id}, ${d.name}, ${d.faculty}, ${d.score_type}, ${d.base_score}, ${d.ranking}, ${d.quota}, ${d.year})
      ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name, 
        faculty = EXCLUDED.faculty, 
        score_type = EXCLUDED.score_type, 
        base_score = EXCLUDED.base_score, 
        ranking = EXCLUDED.ranking, 
        quota = EXCLUDED.quota, 
        year = EXCLUDED.year
    `;
  }
  console.log(`✅ ${depts.length} bölüm verisi güncellendi/eklendi.`);

  // 3. Forum Posts (Starter High-Value Content)
  const posts = [
    {
      id: 'forum_1',
      user_id: 'system',
      title: '🚀 YKS 2026/2027 Yol Haritası: Son Düzlükte Net Artırma Stratejileri',
      content: 'Merhaba YKS Yıldızları! Özellikle denemelerde 70-80 TYT bandına takılıp kalanlar için en kritik nokta branş denemesi analizleridir. Yapamadığınız soruları mutlaka Hata Defterine ekleyin ve 48 saat sonra tekrar çözün.',
      tag: 'Rehberlik',
      likes_count: 34,
      replies_count: 8
    },
    {
      id: 'forum_2',
      user_id: 'system',
      title: '⏱️ Pomodoro ve Derin Odaklanma Tekniği ile Günde 6 Saat Verimli Çalışma',
      content: 'Çalışma odalarımızda uyguladığımız 25/5 ve 50/10 döngüleri bilişsel yorgunluğu önler. Telefon bildirimlerinizi kapatın ve oda sayacını başlatın. Odak puanlarınız klanınıza da XP kazandıracaktır!',
      tag: 'Motivasyon',
      likes_count: 28,
      replies_count: 5
    },
    {
      id: 'forum_3',
      user_id: 'system',
      title: '📐 AYT Matematik Limit-Türev-İntegral Üçlüsünü Fullemek İçin İpuçları',
      content: 'LTİ konularının temeli fonksiyondur. Fonksiyon grafiği okuyamayan bir öğrenci türevin geometrik yorumunda zorlanır. 3D Simülasyonlar sayfamızdaki Türev ve Riemann simülasyonlarını incelemeyi unutmayın.',
      tag: 'Matematik',
      likes_count: 42,
      replies_count: 12
    },
    {
      id: 'forum_4',
      user_id: 'system',
      title: '📖 Paragraf Sorularında Hız Kazanma: 40 Soruyu 35 Dakikada Bitirmek',
      content: 'Metni okumadan önce mutlaka soru kökünü ve şıkların anahtar kelimelerini tarayın. Her gün sabah ilk iş olarak 20 paragraf sorusu çözmek ritminizi inanılmaz derecede hızlandırır.',
      tag: 'Türkçe',
      likes_count: 19,
      replies_count: 4
    },
    {
      id: 'forum_5',
      user_id: 'system',
      title: '⚛️ AYT Fizik Formül Ezberlemeden Nasıl Mantıkla Çözülür?',
      content: 'Fizik ezber dersi değildir! Newton hareket yasalarından manyetik indüksiyona kadar her şey enerji ve momentum korunumu üzerine kuruludur. PhET simülatörlerimizi kullanarak deneyi gözünüzde canlandırın.',
      tag: 'Fizik',
      likes_count: 23,
      replies_count: 6
    }
  ];

  for (const p of posts) {
    await sql`
      INSERT INTO forum_posts (id, user_id, title, content, tag, likes_count, replies_count, created_at)
      VALUES (${p.id}, ${p.user_id}, ${p.title}, ${p.content}, ${p.tag}, ${p.likes_count}, ${p.replies_count}, NOW() - INTERVAL '2 days')
      ON CONFLICT (id) DO UPDATE SET 
        title = EXCLUDED.title, 
        content = EXCLUDED.content, 
        tag = EXCLUDED.tag, 
        likes_count = EXCLUDED.likes_count, 
        replies_count = EXCLUDED.replies_count
    `;
  }
  console.log(`✅ ${posts.length} forum konusu eklendi.`);

  // 4. Clans
  const clans = [
    {
      id: 'clan_1',
      name: 'Kozmik Mühendisler',
      description: 'Hedefi İTÜ, ODTÜ ve Boğaziçi Mühendislik olan azimli YKS öğrencileri.',
      icon: '🚀',
      color: '#38bdf8',
      leader_id: 'system',
      weekly_xp: 14500,
      total_xp: 86400
    },
    {
      id: 'clan_2',
      name: 'Hacettepe Tıp Yolcuları',
      description: 'Beyaz önlük hayaliyle AYT Fen ve Matematik sorularını fethettiğimiz tıp kulübü.',
      icon: '🩺',
      color: '#10b981',
      leader_id: '988419ac-8c32-441f-b40f-32e973ee7d8b',
      weekly_xp: 18200,
      total_xp: 94200
    },
    {
      id: 'clan_3',
      name: 'Hukuk Kartalları',
      description: 'Eşit Ağırlıkta ilk 1000 hedefleyen, Türkçe ve Matematik net canavarları.',
      icon: '⚖️',
      color: '#f59e0b',
      leader_id: '50cff5a9-ab1e-4459-b066-c9592a00a71d',
      weekly_xp: 11200,
      total_xp: 63000
    },
    {
      id: 'clan_4',
      name: 'YKS Gece Kuşları',
      description: 'Gece 02:00\'ye kadar çalışma odalarında odaklanan, disiplinli derece grubu.',
      icon: '🌙',
      color: '#8b5cf6',
      leader_id: '7f2a20e6-e3cf-4aae-922a-c784710f9278',
      weekly_xp: 21500,
      total_xp: 118000
    },
    {
      id: 'clan_5',
      name: 'Kozmik Efsaneler',
      description: 'Her hafta lig zirvesini zorlayan, 25.000+ XP sahibi şampiyonlar birliği.',
      icon: '👑',
      color: '#ec4899',
      leader_id: '2e1efa73-4828-4162-ae4a-c53148f99c1c',
      weekly_xp: 29800,
      total_xp: 154000
    }
  ];

  for (const c of clans) {
    await sql`
      INSERT INTO clans (id, name, description, icon, color, leader_id, weekly_xp, total_xp, created_at)
      VALUES (${c.id}, ${c.name}, ${c.description}, ${c.icon}, ${c.color}, ${c.leader_id}, ${c.weekly_xp}, ${c.total_xp}, NOW() - INTERVAL '7 days')
      ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name, 
        description = EXCLUDED.description, 
        icon = EXCLUDED.icon, 
        color = EXCLUDED.color, 
        leader_id = EXCLUDED.leader_id,
        weekly_xp = EXCLUDED.weekly_xp, 
        total_xp = EXCLUDED.total_xp
    `;
    
    // Add leader as clan member
    await sql`
      INSERT INTO clan_members (clan_id, user_id, role, joined_at)
      VALUES (${c.id}, ${c.leader_id}, 'leader', NOW() - INTERVAL '7 days')
      ON CONFLICT (user_id) DO NOTHING
    `;
  }
  console.log(`✅ ${clans.length} klan eklendi.`);

  await sql.end();
  console.log('🎉 FAZ 4 TOHUMLAMA BAŞARIYLA TAMAMLANDI!');
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
