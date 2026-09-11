const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.resolve(process.cwd(), 'yks_yildizi.db'));
try {
  db.prepare('ALTER TABLE assignments ADD COLUMN questions_json TEXT').run();
  console.log('Column added');
} catch(e) {
  console.log('Column already exists or error:', e.message);
}
