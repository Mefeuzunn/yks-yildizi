const postgres = require('postgres');
const connectionString = 'postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';
const sql = postgres(connectionString, { ssl: 'require' });

async function main() {
  const sample = await sql`SELECT id, title, source_url FROM simulations`;
  console.log('Total simulations in DB:', sample.length);
  sample.forEach(s => console.log(s.title, s.source_url));
  process.exit(0);
}
main();
