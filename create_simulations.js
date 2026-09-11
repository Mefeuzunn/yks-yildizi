const postgres = require('postgres');
const sql = postgres('postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres', { ssl: 'require' });

async function run() {
  try {
    // 1. simulations tablosu
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS simulations (
        id            SERIAL PRIMARY KEY,
        title         TEXT NOT NULL,
        description   TEXT,
        source_url    TEXT NOT NULL,
        category      TEXT NOT NULL CHECK (category IN ('TYT', 'AYT')),
        subject       TEXT NOT NULL CHECK (subject IN ('Fizik', 'Kimya', 'Biyoloji', 'Genel')),
        topic         TEXT NOT NULL,
        difficulty_level INTEGER NOT NULL DEFAULT 2 CHECK (difficulty_level BETWEEN 1 AND 5),
        related_yks_topics TEXT[] DEFAULT '{}',
        thumbnail_url TEXT,
        is_active     BOOLEAN DEFAULT TRUE,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ simulations tablosu oluşturuldu');

    // 2. user_simulation_progress tablosu
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS user_simulation_progress (
        id                  SERIAL PRIMARY KEY,
        user_id             TEXT NOT NULL,
        simulation_id       INTEGER NOT NULL,
        time_spent_seconds  INTEGER DEFAULT 0,
        last_accessed       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_completed        BOOLEAN DEFAULT FALSE,
        UNIQUE(user_id, simulation_id),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(simulation_id) REFERENCES simulations(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ user_simulation_progress tablosu oluşturuldu');

    // 3. İndeksler (performans için)
    await sql.unsafe(`CREATE INDEX IF NOT EXISTS idx_simulations_subject ON simulations(subject);`);
    await sql.unsafe(`CREATE INDEX IF NOT EXISTS idx_simulations_category ON simulations(category);`);
    await sql.unsafe(`CREATE INDEX IF NOT EXISTS idx_sim_progress_user ON user_simulation_progress(user_id);`);
    console.log('✅ İndeksler oluşturuldu');

    // 4. Örnek JavaLab simülasyonları
    await sql.unsafe(`
      INSERT INTO simulations (title, description, source_url, category, subject, topic, difficulty_level, related_yks_topics, thumbnail_url)
      VALUES
        ('Newton''un Hareket Yasaları', 'Kuvvet, kütle ve ivme ilişkisini interaktif olarak keşfet.', 'https://javalab.org/en/newtons_first_law_of_motion_en/', 'TYT', 'Fizik', 'Kuvvet ve Hareket', 2, ARRAY['Newton Yasaları', 'İvme', 'Kuvvet'], NULL),
        ('Elektrik Devreleri', 'Seri ve paralel devrelerde akım ve gerilimi ölç.', 'https://javalab.org/en/electric_circuit_en/', 'AYT', 'Fizik', 'Elektrik', 3, ARRAY['Ohm Yasası', 'Direnç', 'Akım'], NULL),
        ('Dalga Hareketi', 'Ses ve ışık dalgalarının özelliklerini simüle et.', 'https://javalab.org/en/waves_en/', 'AYT', 'Fizik', 'Dalgalar', 3, ARRAY['Dalga boyu', 'Frekans', 'Genlik'], NULL),
        ('Asit-Baz Tepkimeleri', 'pH ölçümü ve nötralleşme tepkimelerini gözlemle.', 'https://javalab.org/en/acid_and_base_en/', 'TYT', 'Kimya', 'Asit Baz', 2, ARRAY['pH', 'Nötralleşme', 'İndikatör'], NULL),
        ('Hücre Bölünmesi (Mitoz)', 'Mitoz bölünmenin evrelerini adım adım izle.', 'https://javalab.org/en/mitosis_en/', 'AYT', 'Biyoloji', 'Hücre Bölünmesi', 3, ARRAY['Mitoz', 'Interfaz', 'Kromozom'], NULL),
        ('Optik Mercekler', 'Yakınsak ve ıraksak merceklerde ışığın kırılmasını gözlemle.', 'https://javalab.org/en/convex_lens_en/', 'AYT', 'Fizik', 'Optik', 4, ARRAY['Mercek', 'Odak noktası', 'Kırılma'], NULL),
        ('Periyodik Tablo', 'Elementlerin periyodik özelliklerini keşfet.', 'https://javalab.org/en/periodic_table_en/', 'TYT', 'Kimya', 'Periyodik Tablo', 1, ARRAY['Element', 'Periyot', 'Grup'], NULL),
        ('DNA Replikasyonu', 'DNA''nın kopyalanma sürecini 3D olarak izle.', 'https://javalab.org/en/dna_en/', 'AYT', 'Biyoloji', 'Genetik', 4, ARRAY['DNA', 'Nükleotid', 'Replikasyon'], NULL)
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ 8 örnek simülasyon eklendi');

    process.exit(0);
  } catch(e) {
    console.error('❌ Hata:', e.message);
    process.exit(1);
  }
}
run();
