const postgres = require('postgres');
const sql = postgres('postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres', { ssl: 'require', max: 1 });
async function test() {
  const users = await sql`SELECT id FROM users WHERE role = 'ogretmen' LIMIT 1`;
  console.log(users);
  sql.end();
}
test();
