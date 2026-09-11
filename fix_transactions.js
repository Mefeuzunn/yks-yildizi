const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/api/**/*.ts');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('db.transaction(() => {')) {
    content = content.replace(/db\.transaction\(\(\) => \{/g, "db.transaction(async () => {");
    fs.writeFileSync(file, content);
    console.log('Fixed transaction in', file);
  }
});
