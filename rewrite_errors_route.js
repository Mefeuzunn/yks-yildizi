const fs = require('fs');
let content = fs.readFileSync('src/app/api/user/errors/route.ts', 'utf8');

// POST
content = content.replace(
  /const \{ subject, topic, icerik, secenekler_json, dogru_cevap, secilen_cevap, cozum \} = body;/,
  "const { subject, topic, icerik, secenekler_json, dogru_cevap, secilen_cevap, cozum, image_data } = body;"
);

content = content.replace(
  /INSERT INTO student_mistakes \(user_id, subject, topic, icerik, secenekler_json, dogru_cevap, secilen_cevap, cozum\)\n        VALUES \(\?, \?, \?, \?, \?, \?, \?, \?\)/,
  `INSERT INTO student_mistakes (user_id, subject, topic, icerik, secenekler_json, dogru_cevap, secilen_cevap, cozum, image_data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

content = content.replace(
  /\.run\(sessionId, subject, topic, icerik, secenekler_json, dogru_cevap, secilen_cevap, cozum \|\| ''\);/,
  ".run(sessionId, subject, topic, icerik, secenekler_json, dogru_cevap, secilen_cevap, cozum || '', image_data || null);"
);

// GET
content = content.replace(
  /createdAt: m\.created_at\n    \}\)\);/,
  "createdAt: m.created_at,\n      imageData: m.image_data\n    }));"
);

fs.writeFileSync('src/app/api/user/errors/route.ts', content);
console.log("Rewrote errors route");
