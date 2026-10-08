CREATE TABLE users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT CHECK(role IN ('ogrenci', 'ogretmen', 'admin')) NOT NULL DEFAULT 'ogrenci',
        alan TEXT CHECK(alan IN ('Sayisal', 'Esit Agirlik', 'Sozel', 'Dil', 'Yok')),
        sinif TEXT CHECK(sinif IN ('9', '10', '11', '12', 'Mezun')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
        id SERIAL PRIMARY KEY ,
        user_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        completed_topics INTEGER DEFAULT 0,
        total_topics INTEGER DEFAULT 0, completed_list TEXT DEFAULT '[]',
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
CREATE TABLE error_log (
        id SERIAL PRIMARY KEY ,
        user_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        topic TEXT NOT NULL,
        question_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
CREATE TABLE mock_exams (
        id SERIAL PRIMARY KEY ,
        user_id TEXT NOT NULL,
        exam_type TEXT CHECK(exam_type IN ('TYT', 'AYT')) NOT NULL,
        exam_name TEXT,
        turkish_net REAL DEFAULT 0.0,
        math_net REAL DEFAULT 0.0,
        social_net REAL DEFAULT 0.0,
        science_net REAL DEFAULT 0.0,
        total_net REAL DEFAULT 0.0,
        exam_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
CREATE TABLE study_plans (
        id SERIAL PRIMARY KEY ,
        user_id TEXT NOT NULL,
        day_of_week INTEGER CHECK(day_of_week BETWEEN 1 AND 7), -- 1: Pzt, 7: Paz
        subject TEXT NOT NULL,
        topic TEXT NOT NULL,
        is_completed INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, time TEXT DEFAULT '12:00', duration TEXT DEFAULT '2 Saat',
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
CREATE TABLE flashcards_progress (
        id SERIAL PRIMARY KEY ,
        user_id TEXT NOT NULL,
        card_id INTEGER NOT NULL,
        status TEXT CHECK(status IN ('learned', 'learning', 'new')) DEFAULT 'new',
        last_reviewed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
CREATE TABLE user_badges (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        badge_id TEXT,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
        due_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, questions_json TEXT,
        FOREIGN KEY(teacher_id) REFERENCES users(id) ON DELETE CASCADE
    );
CREATE TABLE assignment_submissions (
        id TEXT PRIMARY KEY,
        assignment_id TEXT,
        student_id TEXT,
        status TEXT DEFAULT 'pending', -- 'pending', 'submitted', 'graded'
        score INTEGER,
        submitted_at TIMESTAMP,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, topic TEXT DEFAULT 'Genel',
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
CREATE TABLE forum_likes (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(post_id, user_id)
    );
CREATE TABLE study_rooms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        theme TEXT DEFAULT 'library',
        max_capacity INTEGER DEFAULT 50,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
CREATE TABLE room_participants (
        room_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY(room_id, user_id),
        FOREIGN KEY(room_id) REFERENCES study_rooms(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
CREATE TABLE room_messages (
        id TEXT PRIMARY KEY,
        room_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(room_id) REFERENCES study_rooms(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
CREATE TABLE forum_comments (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
CREATE TABLE duels (
        id TEXT PRIMARY KEY,
        status TEXT DEFAULT 'waiting', -- 'waiting', 'starting', 'active', 'finished'
        current_round INTEGER DEFAULT 1,
        round_end_time TIMESTAMP,
        questions_json TEXT, -- [{ id, metin, secenekler, dogruCevap }]
        winner_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
CREATE TABLE duel_participants (
        id TEXT PRIMARY KEY,
        duel_id TEXT,
        user_id TEXT,
        score INTEGER DEFAULT 0,
        answers_json TEXT DEFAULT '[]', -- [{"round": 1, "isCorrect": true, "score": 850}]
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(duel_id) REFERENCES duels(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(duel_id, user_id)
    );
CREATE TABLE teacher_classes (
    id TEXT PRIMARY KEY, teacher_id TEXT NOT NULL, class_name TEXT NOT NULL,
    class_code TEXT UNIQUE NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(teacher_id) REFERENCES users(id) ON DELETE CASCADE
  );
CREATE TABLE class_students (
    class_id TEXT NOT NULL, student_id TEXT NOT NULL, joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(class_id, student_id),
    FOREIGN KEY(class_id) REFERENCES teacher_classes(id) ON DELETE CASCADE,
    FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE
  );
CREATE TABLE teacher_announcements (
    id TEXT PRIMARY KEY, teacher_id TEXT NOT NULL, class_id TEXT,
    title TEXT NOT NULL, content TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(class_id) REFERENCES teacher_classes(id) ON DELETE SET NULL
  );
CREATE TABLE teacher_resources (
    id TEXT PRIMARY KEY, teacher_id TEXT NOT NULL, class_id TEXT,
    title TEXT NOT NULL, content TEXT, subject TEXT, topic TEXT,
    resource_type TEXT DEFAULT 'note', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(class_id) REFERENCES teacher_classes(id) ON DELETE SET NULL
  );
CREATE TABLE student_mistakes (
        id SERIAL PRIMARY KEY ,
        user_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        topic TEXT NOT NULL,
        icerik TEXT NOT NULL,
        secenekler_json TEXT NOT NULL,
        dogru_cevap TEXT NOT NULL,
        secilen_cevap TEXT NOT NULL,
        cozum TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, image_data TEXT,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
CREATE TABLE questions (
        id SERIAL PRIMARY KEY ,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, topic TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );
CREATE INDEX idx_focus_sessions_user_date ON focus_sessions(user_id, started_at);
CREATE INDEX idx_user_stats_league_points ON user_stats(league_points DESC);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_parent_code ON users(parent_code);

-- =========================================================================
-- KLANLAR (CLANS) SİSTEMİ
-- =========================================================================
CREATE TABLE IF NOT EXISTS clans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '⚔️',
    color TEXT DEFAULT '#8b5cf6',
    leader_id TEXT NOT NULL,
    weekly_xp INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(leader_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS clan_members (
    clan_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    weekly_contribution INTEGER DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(clan_id, user_id),
    FOREIGN KEY(clan_id) REFERENCES clans(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS clan_invites (
    id TEXT PRIMARY KEY,
    clan_id TEXT NOT NULL,
    invited_by TEXT NOT NULL,
    invited_user_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(clan_id) REFERENCES clans(id) ON DELETE CASCADE,
    FOREIGN KEY(invited_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(invited_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS clan_weekly_log (
    id SERIAL PRIMARY KEY,
    clan_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    xp_amount INTEGER NOT NULL,
    action TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(clan_id) REFERENCES clans(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================================================
-- PhET İNTERAKTİF SİMÜLASYONLAR
-- =========================================================================
CREATE TABLE IF NOT EXISTS simulations (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    source_url TEXT NOT NULL,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    difficulty_level INTEGER DEFAULT 2 NOT NULL,
    related_yks_topics TEXT[] DEFAULT '{}',
    thumbnail_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_simulation_progress (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    simulation_id INTEGER NOT NULL,
    time_spent_seconds INTEGER DEFAULT 0,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_completed BOOLEAN DEFAULT false,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(simulation_id) REFERENCES simulations(id) ON DELETE CASCADE
);

-- =========================================================================
-- ÖĞRETMEN PORTALI & SINIF DAVET SİSTEMİ
-- =========================================================================
CREATE TABLE IF NOT EXISTS class_invite_codes (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL,
    teacher_id TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    max_uses INTEGER DEFAULT 0,
    use_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS teacher_profiles (
    user_id TEXT PRIMARY KEY,
    brans TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    website TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    social_twitter TEXT DEFAULT '',
    social_linkedin TEXT DEFAULT '',
    experience_years INTEGER DEFAULT 0,
    specialties JSONB DEFAULT '[]',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS teacher_students (
    teacher_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(teacher_id, student_id),
    FOREIGN KEY(teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS teacher_student_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    note TEXT NOT NULL,
    category TEXT DEFAULT 'genel',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================================================
-- BİLDİRİMLER & PUSH SUBSCRIPTIONS
-- =========================================================================
CREATE TABLE IF NOT EXISTS user_notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT DEFAULT 'general',
    icon TEXT DEFAULT '🔔',
    url TEXT DEFAULT '/dashboard',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_automated BOOLEAN DEFAULT false,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_notification_settings (
    user_id TEXT PRIMARY KEY,
    notif_focus BOOLEAN DEFAULT true,
    notif_homework BOOLEAN DEFAULT true,
    notif_lessons BOOLEAN DEFAULT true,
    notif_daily_reminder BOOLEAN DEFAULT true,
    notif_reminder_time TEXT DEFAULT '08:30',
    notif_streak_warning BOOLEAN DEFAULT true,
    notif_streak_time TEXT DEFAULT '20:30',
    notif_duel BOOLEAN DEFAULT true,
    notif_sound BOOLEAN DEFAULT true,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    quiet_hours_enabled BOOLEAN DEFAULT true,
    quiet_hours_start TEXT DEFAULT '23:00',
    quiet_hours_end TEXT DEFAULT '08:00',
    max_daily_notifs INTEGER DEFAULT 2,
    frequency_limit TEXT DEFAULT 'smart',
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_push_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================================================
-- TÜRKİYE YÜZYILI MAARİF MODELİ
-- =========================================================================
CREATE TABLE IF NOT EXISTS maarif_curriculum_nodes (
    id TEXT PRIMARY KEY,
    grade INTEGER NOT NULL,
    subject TEXT NOT NULL,
    theme_name TEXT NOT NULL,
    code TEXT NOT NULL,
    outcome_title TEXT NOT NULL,
    outcome_description TEXT NOT NULL,
    skill_domain TEXT NOT NULL,
    has_phet_sim BOOLEAN DEFAULT false,
    related_sim_slug TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maarif_exam_scenarios (
    id TEXT PRIMARY KEY,
    grade INTEGER NOT NULL,
    subject TEXT NOT NULL,
    term INTEGER NOT NULL,
    exam_number INTEGER NOT NULL,
    scenario_name TEXT NOT NULL,
    description TEXT,
    question_distribution JSONB DEFAULT '[]' NOT NULL,
    total_points INTEGER DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maarif_open_ended_questions (
    id TEXT PRIMARY KEY,
    curriculum_node_code TEXT NOT NULL,
    grade INTEGER NOT NULL,
    subject TEXT NOT NULL,
    scenario_id TEXT,
    context_story TEXT NOT NULL,
    image_url TEXT,
    question_text TEXT NOT NULL,
    max_score INTEGER DEFAULT 10 NOT NULL,
    rubric_criteria JSONB DEFAULT '[]' NOT NULL,
    sample_solutions JSONB DEFAULT '[]' NOT NULL,
    difficulty_level INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================================================
-- SİSTEM, AI ÖNBELLEK & BAŞARIMLAR
-- =========================================================================
CREATE TABLE IF NOT EXISTS ai_cache (
    id TEXT PRIMARY KEY,
    cache_type TEXT NOT NULL,
    prompt_hash TEXT,
    response_data JSONB NOT NULL,
    hit_count INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    full_name TEXT,
    role TEXT,
    grade TEXT,
    field TEXT,
    class_code TEXT,
    branch TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS active_focus_sessions (
    user_id TEXT PRIMARY KEY,
    subject TEXT,
    topic TEXT,
    mode TEXT DEFAULT 'pomodoro',
    duration_min INTEGER DEFAULT 25,
    time_left_sec INTEGER,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR DEFAULT 'focusing',
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    achievement_name TEXT NOT NULL,
    achievement_icon TEXT NOT NULL,
    achievement_desc TEXT NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
