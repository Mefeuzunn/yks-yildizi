const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('src/app/api/**/*.ts');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('yks-sqlite')) return;
  
  // 1. Replace imports
  content = content.replace(/import db from ['"]@\/lib\/yks-sqlite['"];?/g, "import sql from '@/lib/yks-db';");
  content = content.replace(/import db from ['"]\.\.\/\.\.\/\.\.\/lib\/yks-sqlite['"];?/g, "import sql from '@/lib/yks-db';");

  // 2. Replace db.prepare('...').get(args) -> (await sql.unsafe('...', [args]))[0]
  // Because SQL strings can be multiline, regex is tricky.
  // We'll use a simple regex for the ones that match easily, but fallback to manual.
  
  // ACTUALLY, a much safer approach is to mock `db` to return promises, and just add `await`.
  // Let's create a proxy db in `src/lib/yks-db-proxy.ts`.
});
