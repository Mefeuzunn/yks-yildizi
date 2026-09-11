const postgres = require('postgres');
const connectionString = 'postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';
const sql = postgres(connectionString, { ssl: 'require' });

async function main() {
  try {
    await sql`SELECT date('now')`;
    console.log("date('now') works");
  } catch (e) {
    console.log("date('now') FAILED:", e.message);
  }

  try {
    const res = await sql`SELECT CURRENT_DATE as today`;
    console.log("CURRENT_DATE works:", res[0]);
  } catch (e) {
    console.log("CURRENT_DATE FAILED:", e.message);
  }
  process.exit(0);
}
main();
