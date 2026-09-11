const postgres = require('postgres');
const sql = postgres('postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres', { ssl: 'require' });

async function createTable() {
  try {
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS study_plans (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        day_of_week INTEGER NOT NULL, -- 0 (Pazar) - 6 (Cumartesi)
        start_time TEXT NOT NULL, -- '14:00'
        end_time TEXT NOT NULL, -- '15:30'
        subject TEXT NOT NULL,
        topic TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('Table created!');
  } catch(e) {
    console.error(e);
  } finally {
    await sql.end();
  }
}

createTable();
