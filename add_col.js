const fs = require('fs');

let content = fs.readFileSync('src/lib/yks-sqlite.ts', 'utf8');

const replacement = `  try { db.exec("ALTER TABLE user_stats ADD COLUMN pofuduk_energy INTEGER DEFAULT 100;"); } catch (e) {}
  try { db.exec("ALTER TABLE user_stats ADD COLUMN pofuduk_happiness INTEGER DEFAULT 100;"); } catch (e) {}

  // Image support for student mistakes
  try { db.exec("ALTER TABLE student_mistakes ADD COLUMN image_data TEXT;"); } catch (e) {}

  console.log('Veritabanı tabloları başarıyla oluşturuldu veya zaten mevcut.');
`;

content = content.replace(/  try \{ db\.exec\("ALTER TABLE user_stats ADD COLUMN pofuduk_energy INTEGER DEFAULT 100;"\); \} catch \(e\) \{\}\n  try \{ db\.exec\("ALTER TABLE user_stats ADD COLUMN pofuduk_happiness INTEGER DEFAULT 100;"\); \} catch \(e\) \{\}\n\n  console\.log\('Veritabanı tabloları başarıyla oluşturuldu veya zaten mevcut\.'\);/, replacement);

fs.writeFileSync('src/lib/yks-sqlite.ts', content);
console.log("Added image_data to sqlite schema");
