CREATE TABLE users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT CHECK(role IN ('ogrenci', 'ogretmen', 'admin')) NOT NULL DEFAULT 'ogrenci',
        alan TEXT CHECK(alan IN ('Sayisal', 'Esit Agirlik', 'Sozel', 'Dil', 'Yok')),
        sinif TEXT CHECK(sinif IN ('9', '10', '11', '12', 'Mezun')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    , parent_code TEXT, brans TEXT, kurum TEXT, target_university TEXT, target_department TEXT, email TEXT, reset_token TEXT);
CREATE TABLE dersler (
        id TEXT PRIMARY KEY,
        isim TEXT NOT NULL UNIQUE
    );
CREATE TABLE konular (
        id TEXT PRIMARY KEY,
        ders_id TEXT NOT NULL,
        isim TEXT NOT NULL,
        FOREIGN KEY(ders_id) REFERENCES dersler(id) ON DELETE CASCADE
    );
CREATE TABLE alt_konular (
        id TEXT PRIMARY KEY,
        konu_id TEXT NOT NULL,
        isim TEXT NOT NULL,
        FOREIGN KEY(konu_id) REFERENCES konular(id) ON DELETE CASCADE
    );
CREATE TABLE soru_sablonlari (
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
CREATE TABLE hata_defteri (
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
CREATE TABLE user_stats (
        user_id TEXT PRIMARY KEY,
        solved_questions INTEGER DEFAULT 0,
        success_rate REAL DEFAULT 0.0,
        league TEXT DEFAULT 'Bronz',
        league_points INTEGER DEFAULT 0,
        streak_days INTEGER DEFAULT 0, xp INTEGER DEFAULT 0, coins INTEGER DEFAULT 0, pofuduk_level INTEGER DEFAULT 1, pofuduk_energy INTEGER DEFAULT 100, pofuduk_happiness INTEGER DEFAULT 100,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
CREATE TABLE subject_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        completed_topics INTEGER DEFAULT 0,
        total_topics INTEGER DEFAULT 0, completed_list TEXT DEFAULT '[]',
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE error_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        topic TEXT NOT NULL,
        question_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
CREATE TABLE mock_exams (
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
CREATE TABLE study_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        day_of_week INTEGER CHECK(day_of_week BETWEEN 1 AND 7), -- 1: Pzt, 7: Paz
        subject TEXT NOT NULL,
        topic TEXT NOT NULL,
        is_completed INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
CREATE TABLE user_settings (
        user_id TEXT PRIMARY KEY,
        theme TEXT DEFAULT 'dark',
        accent_color TEXT DEFAULT '#38bdf8',
        avatar_seed TEXT DEFAULT 'Felix',
        email_notifications INTEGER DEFAULT 1,
        duel_requests INTEGER DEFAULT 1,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
CREATE TABLE tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        subject TEXT NOT NULL,
        color TEXT DEFAULT '#38bdf8',
        date_str TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP, time TEXT DEFAULT '12:00', duration TEXT DEFAULT '2 Saat',
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
CREATE TABLE flashcards_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        card_id INTEGER NOT NULL,
        status TEXT CHECK(status IN ('learned', 'learning', 'new')) DEFAULT 'new',
        last_reviewed DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
CREATE TABLE user_badges (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        badge_id TEXT,
        earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, badge_id)
    );
CREATE TABLE assignments (
        id TEXT PRIMARY KEY,
        teacher_id TEXT,
        title TEXT,
        description TEXT,
        target_sinif TEXT,
        target_alan TEXT,
        due_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP, questions_json TEXT,
        FOREIGN KEY(teacher_id) REFERENCES users(id) ON DELETE CASCADE
    );
CREATE TABLE assignment_submissions (
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
CREATE TABLE flashcards (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        front_text TEXT NOT NULL,
        back_text TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP, topic TEXT DEFAULT 'Genel',
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
CREATE TABLE forum_posts (
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
CREATE TABLE forum_likes (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(post_id, user_id)
    );
CREATE TABLE study_rooms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        theme TEXT DEFAULT 'library',
        max_capacity INTEGER DEFAULT 50,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
CREATE TABLE room_participants (
        room_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY(room_id, user_id),
        FOREIGN KEY(room_id) REFERENCES study_rooms(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
CREATE TABLE room_messages (
        id TEXT PRIMARY KEY,
        room_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(room_id) REFERENCES study_rooms(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
CREATE TABLE forum_comments (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
CREATE TABLE duels (
        id TEXT PRIMARY KEY,
        status TEXT DEFAULT 'waiting', -- 'waiting', 'starting', 'active', 'finished'
        current_round INTEGER DEFAULT 1,
        round_end_time DATETIME,
        questions_json TEXT, -- [{ id, metin, secenekler, dogruCevap }]
        winner_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
CREATE TABLE duel_participants (
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
CREATE TABLE teacher_classes (
    id TEXT PRIMARY KEY, teacher_id TEXT NOT NULL, class_name TEXT NOT NULL,
    class_code TEXT UNIQUE NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(teacher_id) REFERENCES users(id) ON DELETE CASCADE
  );
CREATE TABLE class_students (
    class_id TEXT NOT NULL, student_id TEXT NOT NULL, joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(class_id, student_id),
    FOREIGN KEY(class_id) REFERENCES teacher_classes(id) ON DELETE CASCADE,
    FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE
  );
CREATE TABLE teacher_announcements (
    id TEXT PRIMARY KEY, teacher_id TEXT NOT NULL, class_id TEXT,
    title TEXT NOT NULL, content TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(class_id) REFERENCES teacher_classes(id) ON DELETE SET NULL
  );
CREATE TABLE teacher_resources (
    id TEXT PRIMARY KEY, teacher_id TEXT NOT NULL, class_id TEXT,
    title TEXT NOT NULL, content TEXT, subject TEXT, topic TEXT,
    resource_type TEXT DEFAULT 'note', created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(class_id) REFERENCES teacher_classes(id) ON DELETE SET NULL
  );
CREATE TABLE student_mistakes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        topic TEXT NOT NULL,
        icerik TEXT NOT NULL,
        secenekler_json TEXT NOT NULL,
        dogru_cevap TEXT NOT NULL,
        secilen_cevap TEXT NOT NULL,
        cozum TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP, image_data TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
CREATE TABLE score_calculations (
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
CREATE TABLE questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject TEXT NOT NULL,
        topic TEXT NOT NULL,
        text TEXT NOT NULL,
        options_json TEXT NOT NULL,
        correct_option TEXT NOT NULL,
        difficulty INTEGER DEFAULT 2
    );
CREATE TABLE test_sessions (
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
CREATE TABLE universities (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT DEFAULT 'Devlet',
        city TEXT NOT NULL
    );
CREATE TABLE departments (
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
CREATE TABLE preference_lists (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT DEFAULT 'Tercih Listem',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
CREATE TABLE preference_items (
        id TEXT PRIMARY KEY,
        list_id TEXT NOT NULL,
        department_id TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        FOREIGN KEY(list_id) REFERENCES preference_lists(id) ON DELETE CASCADE,
        FOREIGN KEY(department_id) REFERENCES departments(id) ON DELETE CASCADE
    );
CREATE TABLE daily_quests (
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
CREATE TABLE user_inventory (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        item_id TEXT,
        item_type TEXT,
        is_equipped INTEGER DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
CREATE TABLE focus_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        subject TEXT,
        task_name TEXT,
        mode TEXT NOT NULL,
        duration_min INTEGER NOT NULL,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP, topic TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );
CREATE INDEX idx_focus_sessions_user_date ON focus_sessions(user_id, started_at);
CREATE INDEX idx_user_stats_league_points ON user_stats(league_points DESC);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_parent_code ON users(parent_code);
