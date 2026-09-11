const fs = require('fs');
const path = require('path');
const postgres = require('postgres');
const connectionString = 'postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';
const sql = postgres(connectionString, { ssl: 'require' });

const dirs = fs.readdirSync(path.join(__dirname, 'src', 'app', 'simulasyonlar'), { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

function formatTitle(name) {
  return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

async function main() {
  let count = 0;
  for (const dir of dirs) {
    const title = formatTitle(dir);
    const source_url = `/simulasyonlar/${dir}`;
    
    const existing = await sql`SELECT id FROM simulations WHERE source_url = ${source_url}`;
    if (existing.length === 0) {
      await sql`
        INSERT INTO simulations (title, description, source_url, category, subject, topic, difficulty_level, is_active, related_yks_topics)
        VALUES (${title}, 'Özel YKS Yıldızı interaktif simülasyonu.', ${source_url}, 'AYT', 'Fizik', ${title}, 2, true, ARRAY['Özel Yapım']::text[])
      `;
      count++;
      console.log('Inserted:', title);
    }
  }
  console.log(`Inserted ${count} local simulations!`);
  process.exit(0);
}
main();
