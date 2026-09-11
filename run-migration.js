const postgres = require('postgres');
const sql = postgres('postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres', { ssl: 'require', max: 1 });
async function migrate() {
  try {
    // Add invite_code to users if not exists
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE`;
    
    // Create teacher_students table
    await sql`
      CREATE TABLE IF NOT EXISTS teacher_students (
        teacher_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY(teacher_id, student_id),
        FOREIGN KEY(teacher_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    console.log("Migration successful");
  } catch(e) {
    console.error("Migration error:", e);
  } finally {
    sql.end();
  }
}
migrate();
