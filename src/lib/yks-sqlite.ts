import Database from 'better-sqlite3';
import path from 'path';

// Veritabanı dosyası proje kökünde (veya istenen bir klasörde) oluşturulacak.
const dbPath = path.resolve(process.cwd(), 'yks_yildizi.db');

const db = new Database(dbPath, {
  verbose: console.log, // Geliştirme aşamasında sorguları görmek için (prod'da kapatılabilir)
});

// Veritabanı performans ayarları (Write-Ahead Logging vs)
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON'); // Yabancı anahtar kontrolünü aktifleştirir

export const initializeDatabase = () => {
  // Veritabanı tablolarının kurulumu
  const createTables = `
    -- 1. KULLANICILAR TABLOSU
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT CHECK(role IN ('ogrenci', 'ogretmen', 'admin')) NOT NULL DEFAULT 'ogrenci',
        alan TEXT CHECK(alan IN ('Sayisal', 'Esit Agirlik', 'Sozel', 'Dil', 'Yok')),
        sinif TEXT CHECK(sinif IN ('9', '10', '11', '12', 'Mezun')),
        brans TEXT,
        kurum TEXT,
        parent_code TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_stats (
        user_id TEXT PRIMARY KEY,
        solved_questions INTEGER DEFAULT 0,
        success_rate REAL DEFAULT 0.0,
        league TEXT DEFAULT 'Bronz',
        league_points INTEGER DEFAULT 0,
        streak_days INTEGER DEFAULT 0,
        xp INTEGER DEFAULT 0,
        coins INTEGER DEFAULT 0,
        pofuduk_level INTEGER DEFAULT 1,
        pofuduk_energy INTEGER DEFAULT 100,
        pofuduk_happiness INTEGER DEFAULT 100,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_badges (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        badge_id TEXT,
        earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, badge_id)
    );

    CREATE TABLE IF NOT EXISTS assignments (
        id TEXT PRIMARY KEY,
        teacher_id TEXT,
        title TEXT,
        description TEXT,
        target_sinif TEXT,
        target_alan TEXT,
        due_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(teacher_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assignment_submissions (
        id TEXT PRIMARY KEY,
        assignment_id TEXT,
        student_id TEXT,
        status TEXT DEFAULT 'pending', -- 'pending', 'submitted', 'graded'
        score INTEGER,
        submitted_at DATETIME,
        FOREIGN KEY(assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
        FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(assignment_id, student_id)
    );

    CREATE TABLE IF NOT EXISTS duels (
        id TEXT PRIMARY KEY,
        status TEXT DEFAULT 'waiting', -- 'waiting', 'starting', 'active', 'finished'
        current_round INTEGER DEFAULT 1,
        round_end_time DATETIME,
        questions_json TEXT, -- [{ id, metin, secenekler, dogruCevap }]
        winner_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS duel_participants (
        id TEXT PRIMARY KEY,
        duel_id TEXT,
        user_id TEXT,
        score INTEGER DEFAULT 0,
        answers_json TEXT DEFAULT '[]', -- [{"round": 1, "isCorrect": true, "score": 850}]
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(duel_id) REFERENCES duels(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(duel_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS subject_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        completed_topics INTEGER DEFAULT 0,
        total_topics INTEGER DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS error_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        topic TEXT NOT NULL,
        question_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS mock_exams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        exam_type TEXT CHECK(exam_type IN ('TYT', 'AYT')) NOT NULL,
        exam_name TEXT,
        turkish_net REAL DEFAULT 0.0,
        math_net REAL DEFAULT 0.0,
        social_net REAL DEFAULT 0.0,
        science_net REAL DEFAULT 0.0,
        total_net REAL DEFAULT 0.0,
        exam_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS score_calculations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT DEFAULT 'Hesaplama',
        obp REAL DEFAULT 0.0,
        tyt_json TEXT NOT NULL,
        ayt_json TEXT,
        tyt_score REAL DEFAULT 0.0,
        say_score REAL DEFAULT 0.0,
        ea_score REAL DEFAULT 0.0,
        soz_score REAL DEFAULT 0.0,
        dil_score REAL DEFAULT 0.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS student_mistakes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        topic TEXT NOT NULL,
        icerik TEXT NOT NULL,
        secenekler_json TEXT NOT NULL,
        dogru_cevap TEXT NOT NULL,
        secilen_cevap TEXT NOT NULL,
        cozum TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS study_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        day_of_week INTEGER CHECK(day_of_week BETWEEN 1 AND 7), -- 1: Pzt, 7: Paz
        subject TEXT NOT NULL,
        topic TEXT NOT NULL,
        is_completed INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 2. DERSLER VE KONULAR HİYERARŞİSİ
    CREATE TABLE IF NOT EXISTS dersler (
        id TEXT PRIMARY KEY,
        isim TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS konular (
        id TEXT PRIMARY KEY,
        ders_id TEXT NOT NULL,
        isim TEXT NOT NULL,
        FOREIGN KEY(ders_id) REFERENCES dersler(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS alt_konular (
        id TEXT PRIMARY KEY,
        konu_id TEXT NOT NULL,
        isim TEXT NOT NULL,
        FOREIGN KEY(konu_id) REFERENCES konular(id) ON DELETE CASCADE
    );

    -- 3. SORULAR (Parametrik Motor İçin Şablonlar)
    CREATE TABLE IF NOT EXISTS soru_sablonlari (
        id TEXT PRIMARY KEY,
        ders_id TEXT NOT NULL,
        konu_id TEXT NOT NULL,
        alt_konu_id TEXT,
        zorluk_derecesi INTEGER CHECK(zorluk_derecesi BETWEEN 1 AND 5),
        sablon_kodu TEXT NOT NULL, -- Parametrik değerleri hesaplayan fonksiyon adı veya JSON
        icerik_sablonu TEXT NOT NULL, -- Soru metninin {{degisken1}} içeren hali
        cozum_sablonu TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(ders_id) REFERENCES dersler(id) ON DELETE CASCADE,
        FOREIGN KEY(konu_id) REFERENCES konular(id) ON DELETE CASCADE,
        FOREIGN KEY(alt_konu_id) REFERENCES alt_konular(id) ON DELETE SET NULL
    );

    -- 4. TEST GEÇMİŞİ VE YANLIŞLARIM DEFTERİ
    CREATE TABLE IF NOT EXISTS hata_defteri (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        soru_sablon_id TEXT NOT NULL,
        uretilen_parametreler TEXT NOT NULL, -- Çözülen sorunun spesifik durumu (JSON)
        ogrenci_cevabi TEXT NOT NULL,
        dogru_cevap TEXT NOT NULL,
        dogru_cozuldu INTEGER DEFAULT 0, -- 1 ise yanlışlar sayfasından gizlenir
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(soru_sablon_id) REFERENCES soru_sablonlari(id) ON DELETE CASCADE
    );

    -- 5. DÜELLO (REAL-TIME YARIŞMA) SİSTEMİ (Yukarıda duels ve duel_participants olarak güncellendi)

    -- 5b. ÖĞRETMEN MODÜLÜ TABLOLARI
    CREATE TABLE IF NOT EXISTS teacher_classes (
        id TEXT PRIMARY KEY,
        teacher_id TEXT NOT NULL,
        class_name TEXT NOT NULL,
        class_code TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(teacher_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS class_students (
        class_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY(class_id, student_id),
        FOREIGN KEY(class_id) REFERENCES teacher_classes(id) ON DELETE CASCADE,
        FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS teacher_announcements (
        id TEXT PRIMARY KEY,
        teacher_id TEXT NOT NULL,
        class_id TEXT,
        title TEXT NOT NULL,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(teacher_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(class_id) REFERENCES teacher_classes(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS teacher_resources (
        id TEXT PRIMARY KEY,
        teacher_id TEXT NOT NULL,
        class_id TEXT,
        title TEXT NOT NULL,
        content TEXT,
        subject TEXT,
        topic TEXT,
        resource_type TEXT DEFAULT 'note',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(teacher_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(class_id) REFERENCES teacher_classes(id) ON DELETE SET NULL
    );
    -- 6. MULTI-USER YENI TABLOLAR
    CREATE TABLE IF NOT EXISTS user_settings (
        user_id TEXT PRIMARY KEY,
        theme TEXT DEFAULT 'dark',
        accent_color TEXT DEFAULT '#38bdf8',
        avatar_seed TEXT DEFAULT 'Felix',
        email_notifications INTEGER DEFAULT 1,
        duel_requests INTEGER DEFAULT 1,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        subject TEXT NOT NULL,
        color TEXT DEFAULT '#38bdf8',
        date_str TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS flashcards (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        topic TEXT DEFAULT 'Genel',
        front_text TEXT NOT NULL,
        back_text TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS flashcards_progress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        card_id TEXT NOT NULL,
        status TEXT CHECK(status IN ('learned', 'learning', 'new')) DEFAULT 'new',
        next_review_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        interval INTEGER DEFAULT 0,
        ease_factor REAL DEFAULT 2.5,
        last_reviewed DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(card_id) REFERENCES flashcards(id) ON DELETE CASCADE,
        UNIQUE(user_id, card_id)
    );

    -- 6.5. TEST MODÜLLERİ (QUESTIONS & SESSIONS)
    CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject TEXT NOT NULL,
        topic TEXT NOT NULL,
        text TEXT NOT NULL,
        options_json TEXT NOT NULL,
        correct_option TEXT NOT NULL,
        difficulty INTEGER DEFAULT 2
    );

    CREATE TABLE IF NOT EXISTS test_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        test_type TEXT NOT NULL,
        score REAL DEFAULT 0,
        correct_count INTEGER DEFAULT 0,
        wrong_count INTEGER DEFAULT 0,
        blank_count INTEGER DEFAULT 0,
        duration INTEGER DEFAULT 0,
        details_json TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 7. YÖK ATLAS & TERCİH ROBOTU
    CREATE TABLE IF NOT EXISTS universities (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT DEFAULT 'Devlet',
        city TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS departments (
        id TEXT PRIMARY KEY,
        uni_id TEXT NOT NULL,
        name TEXT NOT NULL,
        faculty TEXT,
        score_type TEXT NOT NULL,
        base_score REAL DEFAULT 0.0,
        ranking INTEGER DEFAULT 0,
        quota INTEGER DEFAULT 0,
        year TEXT DEFAULT '2026',
        FOREIGN KEY(uni_id) REFERENCES universities(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS preference_lists (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT DEFAULT 'Tercih Listem',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS preference_items (
        id TEXT PRIMARY KEY,
        list_id TEXT NOT NULL,
        department_id TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        FOREIGN KEY(list_id) REFERENCES preference_lists(id) ON DELETE CASCADE,
        FOREIGN KEY(department_id) REFERENCES departments(id) ON DELETE CASCADE
    );

    -- 8. FORUM & TOPLULUK SİSTEMİ
    CREATE TABLE IF NOT EXISTS forum_posts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        tag TEXT DEFAULT 'Genel',
        likes_count INTEGER DEFAULT 0,
        replies_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS forum_likes (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(post_id, user_id)
    );

    -- 8. SANAL ÇALIŞMA ODALARI (STUDY WITH ME)
    CREATE TABLE IF NOT EXISTS study_rooms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        theme TEXT DEFAULT 'library',
        max_capacity INTEGER DEFAULT 50,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS room_participants (
        room_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY(room_id, user_id),
        FOREIGN KEY(room_id) REFERENCES study_rooms(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS room_messages (
        id TEXT PRIMARY KEY,
        room_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(room_id) REFERENCES study_rooms(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS daily_quests (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        title TEXT,
        target INTEGER,
        progress INTEGER DEFAULT 0,
        xp_reward INTEGER,
        is_completed INTEGER DEFAULT 0,
        created_date TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_inventory (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        item_id TEXT,
        item_type TEXT,
        is_equipped INTEGER DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS forum_comments (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  // \`exec\` birden fazla sorguyu tek seferde çalıştırmak için kullanılır
  db.exec(createTables);
  try {
    db.exec("ALTER TABLE users ADD COLUMN target_university TEXT;");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE users ADD COLUMN target_department TEXT;");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE tasks ADD COLUMN time TEXT DEFAULT '12:00';");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE tasks ADD COLUMN duration TEXT DEFAULT '2 Saat';");
  } catch (e) {}

  // Gamification columns
  try { db.exec("ALTER TABLE user_stats ADD COLUMN xp INTEGER DEFAULT 0;"); } catch (e) {}
  try { db.exec("ALTER TABLE user_stats ADD COLUMN coins INTEGER DEFAULT 0;"); } catch (e) {}
  try { db.exec("ALTER TABLE user_stats ADD COLUMN pofuduk_level INTEGER DEFAULT 1;"); } catch (e) {}
  try { db.exec("ALTER TABLE user_stats ADD COLUMN pofuduk_energy INTEGER DEFAULT 100;"); } catch (e) {}
  try { db.exec("ALTER TABLE user_stats ADD COLUMN pofuduk_happiness INTEGER DEFAULT 100;"); } catch (e) {}

  // Image support for student mistakes
  try { db.exec("ALTER TABLE student_mistakes ADD COLUMN image_data TEXT;"); } catch (e) {}

  // List support for subject progress (non-linear progression)
  try { db.exec("ALTER TABLE subject_progress ADD COLUMN completed_list TEXT DEFAULT '[]';"); } catch (e) {}

  // Focus sessions table for detailed session tracking
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS focus_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        subject TEXT,
        topic TEXT,
        task_name TEXT,
        mode TEXT NOT NULL,
        duration_min INTEGER NOT NULL,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
  } catch (e) {}
  // Add topic column to existing tables (migration)
  try { db.exec("ALTER TABLE focus_sessions ADD COLUMN topic TEXT;"); } catch (e) {}

  console.log('Veritabanı tabloları başarıyla oluşturuldu veya zaten mevcut.');


};

// Initialize immediately on import
initializeDatabase();

// Singleton olarak db'yi dışa aktar
const defaultRooms = [
    { id: 'room-1', name: 'Sessiz Kütüphane', theme: 'library' },
    { id: 'room-2', name: 'Lofi Cafe', theme: 'lofi' },
    { id: 'room-3', name: 'Yağmurlu Geceler', theme: 'rain' },
    { id: 'room-4', name: 'Sayısalcılar Zirvesi', theme: 'tech' }
];

const checkRoom = db.prepare('SELECT count(*) as count FROM study_rooms').get() as {count: number};
if (checkRoom.count === 0) {
    const insertRoom = db.prepare('INSERT INTO study_rooms (id, name, theme) VALUES (?, ?, ?)');
    db.transaction(() => {
        defaultRooms.forEach(room => insertRoom.run(room.id, room.name, room.theme));
    })();
}

const checkQuestions = db.prepare('SELECT count(*) as count FROM questions').get() as {count: number};
if (checkQuestions.count === 0) {
    const mockQuestions = [
      { subject: 'Matematik', topic: 'Türev', text: 'f(x) = x³ - 3x² + 2 fonksiyonunun yerel minimum noktası apsisi kaçtır?', options_json: JSON.stringify({ A: '-2', B: '0', C: '1', D: '2', E: '3' }), correct_option: 'D', difficulty: 3 },
      { subject: 'Fizik', topic: 'Dinamik', text: 'Sürtünmesiz yatay düzlemde duran 2 kg kütleli cisme 10 N kuvvet etki etmektedir. İvmesi?', options_json: JSON.stringify({ A: '2', B: '5', C: '10', D: '20', E: '0.2' }), correct_option: 'B', difficulty: 2 },
      { subject: 'Türkçe', topic: 'Paragrafta Anlam', text: 'Hangisinde yazar yorumunu katmıştır?', options_json: JSON.stringify({ A: 'Yarın yağmur yağacakmış.', B: 'Kitabın kapağı kırmızıydı.', C: 'Bence muhteşem bir filmdi.', D: 'Film 120 dakika sürdü.', E: 'Okul 8 de açılıyor.' }), correct_option: 'C', difficulty: 1 },
      { subject: 'Kimya', topic: 'Gazlar', text: 'Normal şartlar altında 1 mol gaz kaç litre hacim kaplar?', options_json: JSON.stringify({ A: '11.2', B: '22.4', C: '24.5', D: '33.6', E: '44.8' }), correct_option: 'B', difficulty: 1 },
      { subject: 'Matematik', topic: 'İntegral', text: '∫(2x)dx integralinin sonucu nedir?', options_json: JSON.stringify({ A: 'x + c', B: 'x² + c', C: '2x² + c', D: 'x³/3 + c', E: '2x + c' }), correct_option: 'B', difficulty: 2 },
    ];
    const insertQ = db.prepare('INSERT INTO questions (subject, topic, text, options_json, correct_option, difficulty) VALUES (?, ?, ?, ?, ?, ?)');
    db.transaction(() => {
        mockQuestions.forEach(q => insertQ.run(q.subject, q.topic, q.text, q.options_json, q.correct_option, q.difficulty));
    })();
}

const checkUni = db.prepare('SELECT count(*) as count FROM universities').get() as {count: number};
if (checkUni.count === 0) {
    const unis = [
      { id: 'boun', name: 'Boğaziçi Üniversitesi', type: 'Devlet', city: 'İstanbul' },
      { id: 'odtu', name: 'Orta Doğu Teknik Üniversitesi', type: 'Devlet', city: 'Ankara' },
      { id: 'itu', name: 'İstanbul Teknik Üniversitesi', type: 'Devlet', city: 'İstanbul' },
      { id: 'bilkent', name: 'İhsan Doğramacı Bilkent Üniversitesi', type: 'Vakıf', city: 'Ankara' },
      { id: 'koc', name: 'Koç Üniversitesi', type: 'Vakıf', city: 'İstanbul' },
      { id: 'hacettepe', name: 'Hacettepe Üniversitesi', type: 'Devlet', city: 'Ankara' }
    ];
    const insertU = db.prepare('INSERT INTO universities (id, name, type, city) VALUES (?, ?, ?, ?)');
    
    const deps = [
      { id: 'b1', uni_id: 'boun', name: 'Bilgisayar Mühendisliği (İngilizce)', faculty: 'Mühendislik', score_type: 'SAY', score: 545.12, rank: 350, quota: 90, year: '2026' },
      { id: 'b2', uni_id: 'boun', name: 'Endüstri Mühendisliği (İngilizce)', faculty: 'Mühendislik', score_type: 'SAY', score: 535.80, rank: 980, quota: 80, year: '2026' },
      { id: 'o1', uni_id: 'odtu', name: 'Makine Mühendisliği (İngilizce)', faculty: 'Mühendislik', score_type: 'SAY', score: 512.45, rank: 4500, quota: 150, year: '2026' },
      { id: 'o2', uni_id: 'odtu', name: 'Bilgisayar Mühendisliği (İngilizce)', faculty: 'Mühendislik', score_type: 'SAY', score: 540.50, rank: 700, quota: 120, year: '2026' },
      { id: 'i1', uni_id: 'itu', name: 'Yapay Zeka ve Veri Mühendisliği', faculty: 'Bilgisayar ve Bilişim', score_type: 'SAY', score: 530.12, rank: 1400, quota: 60, year: '2026' },
      { id: 'i2', uni_id: 'itu', name: 'Mimarlık', faculty: 'Mimarlık', score_type: 'SAY', score: 480.00, rank: 15000, quota: 100, year: '2026' },
      { id: 'k1', uni_id: 'koc', name: 'Tıp (Burslu)', faculty: 'Tıp', score_type: 'SAY', score: 555.00, rank: 50, quota: 15, year: '2026' },
      { id: 'k2', uni_id: 'koc', name: 'Hukuk (Burslu)', faculty: 'Hukuk', score_type: 'EA', score: 520.40, rank: 120, quota: 20, year: '2026' },
      { id: 'h1', uni_id: 'hacettepe', name: 'Tıp', faculty: 'Tıp', score_type: 'SAY', score: 525.10, rank: 2500, quota: 250, year: '2026' },
      { id: 'h2', uni_id: 'hacettepe', name: 'Psikoloji', faculty: 'Edebiyat', score_type: 'EA', score: 460.50, rank: 8000, quota: 90, year: '2026' },
      { id: 'bi1', uni_id: 'bilkent', name: 'İşletme (Burslu)', faculty: 'İşletme', score_type: 'EA', score: 510.15, rank: 350, quota: 25, year: '2026' },
      { id: 'bi2', uni_id: 'bilkent', name: 'İşletme (Burslu)', faculty: 'İşletme', score_type: 'EA', score: 505.10, rank: 400, quota: 25, year: '2025' }
    ];
    const insertD = db.prepare('INSERT INTO departments (id, uni_id, name, faculty, score_type, base_score, ranking, quota, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    
    db.transaction(() => {
        unis.forEach(u => insertU.run(u.id, u.name, u.type, u.city));
        deps.forEach(d => insertD.run(d.id, d.uni_id, d.name, d.faculty, d.score_type, d.score, d.rank, d.quota, d.year));
    })();
}

export default db;

// Add topic column to focus_sessions
