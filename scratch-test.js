require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL || 'postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres', { ssl: 'require' });

async function run() {
  try {
    const sessions = await sql`SELECT * FROM focus_sessions LIMIT 5`;
    console.log("SESSIONS:", sessions);

    const weekSessions = await sql`
      SELECT date(started_at) as day, subject, topic, SUM(duration_min) as total_min, COUNT(*) as session_count
      FROM focus_sessions
      WHERE started_at >= CURRENT_DATE - INTERVAL '7 days' AND mode = 'pomodoro'
      GROUP BY day, subject ORDER BY day ASC
    `;
    console.log("WEEK SESSIONS:", weekSessions);
  } catch(e) {
    console.error("DB Error:", e);
  } finally {
    process.exit(0);
  }
}
run();
