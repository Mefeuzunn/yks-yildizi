const postgres = require('postgres');
const fs = require('fs');

const sql = postgres('postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres', { ssl: 'require' });

async function migrate() {
  const schema = fs.readFileSync('schema_pg.sql', 'utf8');
  
  try {
    const statements = schema.split(';').filter(s => s.trim().length > 0);
    for (const stmt of statements) {
      if(stmt.trim() === '') continue;
      console.log('Running:', stmt.trim().substring(0, 50) + '...');
      await sql.unsafe(stmt);
    }
    console.log('Migration to Supabase finished successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await sql.end();
  }
}

migrate();
