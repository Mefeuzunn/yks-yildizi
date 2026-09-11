const fs = require('fs');
const p = 'src/app/api/user/focus/route.ts';
let content = fs.readFileSync(p, 'utf8');

// Fix SQLite datetime function
content = content.replace(
  "started_at >= datetime('now', '-7 days')",
  "started_at >= CURRENT_DATE - INTERVAL '7 days'"
);

// Fix date('now') to CURRENT_DATE just to be safe and clean
content = content.replace(
  "date(started_at) = date('now')",
  "DATE(started_at) = CURRENT_DATE"
);
content = content.replace(
  "date(started_at) = date('now')",
  "DATE(started_at) = CURRENT_DATE"
);

// Fix daily quests date('now')
content = content.replace(
  "date = date('now')",
  "date = CURRENT_DATE"
);

fs.writeFileSync(p, content);
console.log("Fixed Postgres datetime syntax");
