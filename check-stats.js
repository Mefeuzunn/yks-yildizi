const postgres = require('postgres');
const sql = postgres('postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres', { ssl: 'require', max: 1 });
async function test() {
  try {
    const res = await sql`
      SELECT tc.id, tc.class_name, tc.class_code, tc.created_at,
             COUNT(cs.student_id) as student_count,
             ROUND(AVG(COALESCE(us.success_rate, 0)), 1) as avg_success
      FROM teacher_classes tc
      LEFT JOIN class_students cs ON tc.id = cs.class_id
      LEFT JOIN user_stats us ON cs.student_id = us.user_id
      WHERE tc.teacher_id = 'eec1986c-0a25-436b-ac0c-dfea85b12a32'
      GROUP BY tc.id
      ORDER BY tc.created_at DESC
    `;
    console.log("Result:", res);
  } catch(e) {
    console.error("Error:", e);
  } finally {
    sql.end();
  }
}
test();
