const postgres = require('postgres');
const sql = postgres('postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres', { ssl: 'require' });

async function check() {
  const tables = await sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`;
  console.log('Tables:', tables.map(t => t.tablename).join(', '));
  process.exit(0);
}
check();
