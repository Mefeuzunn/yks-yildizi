const fs = require('fs');
let p = 'src/app/denemeler/page.tsx';
if (fs.existsSync(p)) {
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(
    "gridTemplateColumns: '1fr 1fr'",
    "gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))'"
  );
  fs.writeFileSync(p, content);
}
console.log("Denemeler input grid fixed");
