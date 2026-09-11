const fs = require('fs');

const replacements = [
  { file: 'src/app/api/ogretmen/dashboard/route.ts', from: "datetime('now')", to: "CURRENT_TIMESTAMP" },
  { file: 'src/app/api/ogretmen/dashboard/route.ts', from: "datetime('now')", to: "CURRENT_TIMESTAMP" },
  { file: 'src/app/api/ogretmen/dashboard/route.ts', from: "datetime('now', '+7 days')", to: "CURRENT_TIMESTAMP + INTERVAL '7 days'" },
  { file: 'src/app/api/ogretmen/analytics/route.ts', from: "datetime('now', '-7 days')", to: "CURRENT_TIMESTAMP - INTERVAL '7 days'" },
  { file: 'src/app/api/parent/student/route.ts', from: "datetime('now', '-7 days')", to: "CURRENT_TIMESTAMP - INTERVAL '7 days'" },
  { file: 'src/app/api/rooms/route.ts', from: "datetime('now', '-5 minutes')", to: "CURRENT_TIMESTAMP - INTERVAL '5 minutes'" },
];

replacements.forEach(r => {
  let content = fs.readFileSync(r.file, 'utf8');
  content = content.replace(r.from, r.to);
  // Re-run in case of multiple matches
  content = content.replace(r.from, r.to);
  content = content.replace(r.from, r.to);
  fs.writeFileSync(r.file, content);
});
console.log("All datetime functions fixed for Postgres.");
