const postgres = require('postgres');
const connectionString = 'postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';
const sql = postgres(connectionString, { ssl: 'require' });

async function main() {
  const userId = '19643620-5182-405c-a35d-81f028f0e7f3';
  try {
    const weekSessions = await sql`
      SELECT DATE(started_at) as day, subject, topic, SUM(duration_min) as total_min, COUNT(*) as session_count
      FROM focus_sessions
      WHERE user_id = ${userId} AND started_at >= CURRENT_DATE - INTERVAL '7 days' AND mode = 'pomodoro'
      GROUP BY day, subject, topic ORDER BY day ASC
    `;
    console.log('weekSessions', weekSessions);

    const todayRow = await sql`
      SELECT COALESCE(SUM(duration_min), 0) as total_min, COUNT(*) as count
      FROM focus_sessions
      WHERE user_id = ${userId} AND DATE(started_at) = CURRENT_DATE AND mode = 'pomodoro'
    `;
    console.log('todayRow', todayRow);

  } catch(e) {
    console.error("ERROR IN SQL:", e.message);
  }
  process.exit(0);
}
main();
