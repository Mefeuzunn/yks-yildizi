import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // 1. Create table
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS simulations (
        id            SERIAL PRIMARY KEY,
        title         TEXT NOT NULL,
        description   TEXT,
        source_url    TEXT NOT NULL,
        category      TEXT NOT NULL CHECK (category IN ('TYT', 'AYT', 'Tümü')),
        subject       TEXT NOT NULL,
        topic         TEXT NOT NULL,
        difficulty_level INTEGER NOT NULL DEFAULT 2 CHECK (difficulty_level BETWEEN 1 AND 5),
        related_yks_topics TEXT[] DEFAULT '{}',
        thumbnail_url TEXT,
        is_active     BOOLEAN DEFAULT TRUE,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // 2. Create progress table
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS user_simulation_progress (
        id                  SERIAL PRIMARY KEY,
        user_id             UUID NOT NULL,
        simulation_id       INTEGER NOT NULL,
        time_spent_seconds  INTEGER DEFAULT 0,
        last_accessed       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_completed        BOOLEAN DEFAULT FALSE,
        UNIQUE(user_id, simulation_id),
        FOREIGN KEY(simulation_id) REFERENCES simulations(id) ON DELETE CASCADE
      )
    `).run();

    // 3. Indexes
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_simulations_subject ON simulations(subject)').run();
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_simulations_category ON simulations(category)').run();
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_sim_progress_user ON user_simulation_progress(user_id)').run();

    // 4. Seed basic javlab simulations + PhET
    const sims = [
      { t: "Newton'un Hareket Yasaları", d: "Kuvvet, kütle ve ivme ilişkisini keşfet.", u: "https://javalab.org/en/newtons_first_law_of_motion_en/", c: "TYT", s: "Fizik", tp: "Kuvvet ve Hareket" },
      { t: "Elektrik Devreleri", d: "Seri ve paralel devrelerde akım ve gerilimi ölç.", u: "https://javalab.org/en/electric_circuit_en/", c: "AYT", s: "Fizik", tp: "Elektrik" },
      { t: "Dalga Hareketi", d: "Ses ve ışık dalgalarının özelliklerini simüle et.", u: "https://javalab.org/en/waves_en/", c: "AYT", s: "Fizik", tp: "Dalgalar" },
      { t: "Asit-Baz Tepkimeleri", d: "pH ölçümü ve nötralleşme tepkimeleri.", u: "https://javalab.org/en/acid_and_base_en/", c: "TYT", s: "Kimya", tp: "Asit Baz" },
      { t: "Mitoz Bölünme", d: "Mitoz bölünmenin evrelerini adım adım izle.", u: "https://javalab.org/en/mitosis_en/", c: "AYT", s: "Biyoloji", tp: "Hücre" },
      { t: "Fotoelektrik Etki (PhET)", d: "Işığın metallerden elektron sökmesini simüle et.", u: "https://phet.colorado.edu/sims/cheerpj/photoelectric/latest/photoelectric.html?simulation=photoelectric&locale=tr", c: "AYT", s: "Fizik", tp: "Modern Fizik" },
      { t: "Enerji Parkı (PhET)", d: "Kinetik ve potansiyel enerjiyi kaykayla incele.", u: "https://phet.colorado.edu/sims/html/energy-skate-park/latest/energy-skate-park_tr.html", c: "TYT", s: "Fizik", tp: "Enerji" },
      { t: "Denge (PhET)", d: "Tork ve denge kurallarını interaktif öğren.", u: "https://phet.colorado.edu/sims/html/balancing-act/latest/balancing-act_tr.html", c: "AYT", s: "Fizik", tp: "Tork ve Denge" }
    ];

    for (const sim of sims) {
      // Sadece yoksa ekle
      const existing = await db.prepare('SELECT id FROM simulations WHERE title = ?').get(sim.t) as any;
      if (!existing) {
        await db.prepare(`
          INSERT INTO simulations (title, description, source_url, category, subject, topic)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(sim.t, sim.d, sim.u, sim.c, sim.s, sim.tp);
      }
    }

    return NextResponse.json({ success: true, message: 'Veritabanı başarıyla güncellendi ve simülasyonlar eklendi.' });
  } catch (error: any) {
    console.error('Seed Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
