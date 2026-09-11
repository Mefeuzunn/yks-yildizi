const postgres = require('postgres');
const crypto = require('crypto');
const sql = postgres('postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres', { ssl: 'require', max: 1 });
async function run() {
  try {
    const teachers = await sql`SELECT id FROM users WHERE role = 'ogretmen' AND (invite_code IS NULL OR invite_code = '')`;
    for (const t of teachers) {
      const code = crypto.randomBytes(3).toString('hex').toUpperCase();
      await sql`UPDATE users SET invite_code = ${code} WHERE id = ${t.id}`;
    }
    console.log(`Generated codes for ${teachers.length} teachers`);
  } catch(e) {
    console.error(e);
  } finally {
    sql.end();
  }
}
run();
