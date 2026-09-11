const fs = require('fs');
let content = fs.readFileSync('src/app/globals.css', 'utf8');

// Find the @import
const importLine = "@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');";

if (content.includes(importLine)) {
  content = content.replace(importLine + '\n', '');
  content = importLine + '\n\n' + content;
  fs.writeFileSync('src/app/globals.css', content);
  console.log("Fixed globals.css");
}
