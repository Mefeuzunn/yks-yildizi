const postgres = require('postgres');
const sql = postgres('postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres', { ssl: 'require', max: 1 });
const crypto = require('crypto');
const uuid = require('uuid');

async function test() {
  try {
    const user = await sql`SELECT id FROM users WHERE role = 'ogretmen' LIMIT 1`;
    const id = uuid.v4();
    const classCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    console.log("Teacher ID:", user[0].id, "Class Code:", classCode);
    const res = await sql`INSERT INTO teacher_classes (id, teacher_id, class_name, class_code) VALUES (${id}, ${user[0].id}, 'Deneme', ${classCode})`;
    console.log("Result:", res);
  } catch(e) {
    console.error("Error:", e);
  } finally {
    sql.end();
  }
}
test();
