const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/api/**/*.ts');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('yks-sqlite') && !content.includes('db.prepare')) return;
  
  // Replace import
  content = content.replace(/import db from ['"].*yks-sqlite['"];?/g, "import db from '@/lib/yks-db-async';");

  // Add await to db.prepare calls
  // Search for `db.prepare(` or `db.prepare('` or `db.prepare("`
  // Replace `db.prepare` with `await db.prepare`
  // Wait, db.transaction is also used.
  
  content = content.replace(/db\.prepare\(/g, "await db.prepare(");
  content = content.replace(/db\.transaction\(/g, "await db.transaction(");
  
  // If the function is not async, we might have syntax errors, but all Next.js route handlers are `export async function GET()` etc.
  // Wait, db.transaction(() => { ... })() -> the execution `()` also needs await?
  // We can just refactor the `db` wrapper to handle this.
  
  fs.writeFileSync(file, content);
  console.log('Migrated', file);
});
