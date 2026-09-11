const postgres = require('postgres');
const sql = postgres('postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres', { ssl: 'require' });
async function run() {
  try {
    // Clan invite table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS clan_invites (
        id TEXT PRIMARY KEY,
        clan_id TEXT NOT NULL,
        invited_by TEXT NOT NULL,
        invited_user_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(clan_id, invited_user_id),
        FOREIGN KEY(clan_id) REFERENCES clans(id) ON DELETE CASCADE,
        FOREIGN KEY(invited_by) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(invited_user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('clan_invites table created!');
    process.exit(0);
  } catch(e) { console.error(e); process.exit(1); }
}
run();
