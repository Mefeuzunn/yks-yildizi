const Database = require('better-sqlite3');
const postgres = require('postgres');

const sqlite = new Database('yks_yildizi.db');
const sql = postgres('postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres', { ssl: 'require' });

async function migrateData() {
  const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
  
  for (const t of tables) {
    const tableName = t.name;
    const rows = sqlite.prepare(`SELECT * FROM ${tableName}`).all();
    
    if (rows.length > 0) {
      console.log(`Migrating ${rows.length} rows to ${tableName}...`);
      try {
        // chunking inserts to avoid max parameter limits
        const chunkSize = 100;
        for (let i = 0; i < rows.length; i += chunkSize) {
          const chunk = rows.slice(i, i + chunkSize);
          await sql`INSERT INTO ${sql(tableName)} ${sql(chunk)}`;
        }
      } catch (e) {
        console.error(`Error inserting into ${tableName}:`, e.message);
      }
    }
  }
  console.log('Data migration complete!');
  await sql.end();
}

migrateData();
