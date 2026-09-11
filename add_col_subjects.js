const fs = require('fs');

let content = fs.readFileSync('src/lib/yks-sqlite.ts', 'utf8');

const replacement = `  // Image support for student mistakes
  try { db.exec("ALTER TABLE student_mistakes ADD COLUMN image_data TEXT;"); } catch (e) {}

  // List support for subject progress (non-linear progression)
  try { db.exec("ALTER TABLE subject_progress ADD COLUMN completed_list TEXT DEFAULT '[]';"); } catch (e) {}

  console.log('Veritabanı tabloları başarıyla oluşturuldu veya zaten mevcut.');
`;

content = content.replace(/  \/\/ Image support for student mistakes\n  try \{ db\.exec\("ALTER TABLE student_mistakes ADD COLUMN image_data TEXT;"\); \} catch \(e\) \{\}\n\n  console\.log\('Veritabanı tabloları başarıyla oluşturuldu veya zaten mevcut\.'\);/, replacement);

fs.writeFileSync('src/lib/yks-sqlite.ts', content);
console.log("Added completed_list to sqlite schema");
