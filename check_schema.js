const postgres = require('postgres');
const sql = postgres('postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres', { ssl: 'require' });
async function run() {
  const r = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'user_stats' ORDER BY ordinal_position`;
  console.log('user_stats columns:', r.map(c => c.column_name).join(', '));
  const r2 = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'clans' ORDER BY ordinal_position`;
  console.log('clans columns:', r2.map(c => c.column_name).join(', '));
  const r3 = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'clan_members' ORDER BY ordinal_position`;
  console.log('clan_members columns:', r3.map(c => c.column_name).join(', '));
  process.exit(0);
}
run();
