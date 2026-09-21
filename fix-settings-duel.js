const fs = require('fs');
let p = 'src/app/ayarlar/page.tsx';
if (fs.existsSync(p)) {
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(
    "display: 'flex', gap: '2rem'",
    "display: 'flex', flexWrap: 'wrap', gap: '2rem'"
  );
  content = content.replace(
    "width: '250px'",
    "flex: '1 1 250px', maxWidth: '300px'"
  );
  // Content column
  content = content.replace(
    "<div style={{ flex: 1, backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border-strong)', padding: '2rem' }}>",
    "<div style={{ flex: '999 1 300px', backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border-strong)', padding: '2rem', minWidth: 0 }}>"
  );
  fs.writeFileSync(p, content);
}

p = 'src/app/duello/page.tsx';
if (fs.existsSync(p)) {
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(
    "display: 'flex', gap: '2rem', marginBottom: '2rem'",
    "display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem', justifyContent: 'center'"
  );
  // Replace all 3 width: '200px'
  content = content.replace(
    /width: '200px'/g,
    "width: '100%', maxWidth: '200px'"
  );
  fs.writeFileSync(p, content);
}

console.log("Settings and Duel fixed");
