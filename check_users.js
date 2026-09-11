const postgres = require('postgres');
const sql = postgres('postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres', { ssl: 'require' });

async function run() {
  try {
    const r = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position`;
    console.log('users columns:', r.map(c => c.column_name).join(', '));
    process.exit(0);
  } catch(e) { console.error(e); process.exit(1); }
}
run();
