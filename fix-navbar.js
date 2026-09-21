const fs = require('fs');
const p = 'src/components/Navbar.tsx';
let content = fs.readFileSync(p, 'utf8');

// Replace className="mobile-only" where it accompanies a display: 'flex' inline style.
// Specifically the drop down menu
content = content.replace(
  'className="mobile-only"\n          >',
  'className="mobile-flex"\n          >'
);

fs.writeFileSync(p, content);
console.log("Fixed Navbar mobile-only");
