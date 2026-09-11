import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'yks_yildizi.db');
const db = new Database(dbPath);

try {
  // Add email and reset_token columns to users
  db.exec("ALTER TABLE users ADD COLUMN email TEXT;");
  db.exec("ALTER TABLE users ADD COLUMN reset_token TEXT;");
  console.log("Kolonlar başarıyla eklendi.");
} catch (e: any) {
  if (e.message.includes("duplicate column name")) {
    console.log("Kolonlar zaten var.");
  } else {
    console.error("Hata:", e.message);
  }
} finally {
  db.close();
}
