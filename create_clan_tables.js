const postgres = require('postgres');
const sql = postgres('postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres', { ssl: 'require' });

async function create() {
  try {
    // Clan (Klan) tables
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS clans (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        icon TEXT DEFAULT '⚔️',
        color TEXT DEFAULT '#8b5cf6',
        leader_id TEXT NOT NULL,
        weekly_xp INTEGER DEFAULT 0,
        total_xp INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(leader_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS clan_members (
        clan_id TEXT NOT NULL,
        user_id TEXT NOT NULL UNIQUE,
        role TEXT DEFAULT 'member',
        weekly_contribution INTEGER DEFAULT 0,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY(clan_id, user_id),
        FOREIGN KEY(clan_id) REFERENCES clans(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    
    await sql.unsafe(`
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
    `);

    // Easter Eggs
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        achievement_id TEXT NOT NULL,
        achievement_name TEXT NOT NULL,
        achievement_icon TEXT NOT NULL,
        achievement_desc TEXT NOT NULL,
        unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, achievement_id),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    console.log('All clan + achievement tables created!');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
create();
