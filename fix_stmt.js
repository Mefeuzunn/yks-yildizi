const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/api/**/*.ts');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('stmt.run(')) {
    content = content.replace(/stmt\.run\(/g, "await stmt.run(");
    fs.writeFileSync(file, content);
  }
  if (content.includes('insertSub.run(')) {
    content = content.replace(/insertSub\.run\(/g, "await insertSub.run(");
    fs.writeFileSync(file, content);
  }
});
