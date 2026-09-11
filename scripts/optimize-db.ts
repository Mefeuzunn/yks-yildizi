import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'yks_yildizi.db');
const db = new Database(dbPath);

console.log('Veritabanı optimizasyonları (Indexler) oluşturuluyor...');

try {
  // Focus sessions için index
  db.exec('CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_date ON focus_sessions(user_id, started_at);');
  
  // Lig tablosu sıralaması için index
  db.exec('CREATE INDEX IF NOT EXISTS idx_user_stats_league_points ON user_stats(league_points DESC);');
  
  // Kullanıcı giriş işlemleri için username index'i
  db.exec('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);');

  // Veli bağlantı kodu için index
  db.exec('CREATE INDEX IF NOT EXISTS idx_users_parent_code ON users(parent_code);');

  console.log('Optimizasyonlar başarıyla tamamlandı!');
} catch (error) {
  console.error('Hata:', error);
} finally {
  db.close();
}
