const postgres = require('postgres');
const sql = postgres('postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres', { ssl: 'require' });

async function run() {
  await sql`DROP TABLE IF EXISTS study_plans CASCADE;`;
  await sql`
      CREATE TABLE study_plans (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        day_of_week INTEGER NOT NULL,
        start_time INTEGER NOT NULL,
        duration INTEGER NOT NULL,
        title TEXT NOT NULL,
        notes TEXT,
        color TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );
  `;
  console.log('Fixed');
  process.exit(0);
}
run();
