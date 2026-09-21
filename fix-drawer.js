const fs = require('fs');
const pNav = 'src/components/MobileNav.tsx';
let nav = fs.readFileSync(pNav, 'utf8');

// Change backdrop back
nav = nav.replace(
  'className="mobile-flex"\n              style={{\n                position: \'fixed\',\n                inset: 0',
  'className="mobile-only"\n              style={{\n                position: \'fixed\',\n                inset: 0'
);

// Change drawer back
nav = nav.replace(
  'className="mobile-flex"\n              style={{\n                position: \'fixed\',\n                bottom: 0,\n                left: 0,\n                right: 0,\n                backgroundColor: \'#131827\'',
  'className="mobile-only"\n              style={{\n                position: \'fixed\',\n                bottom: 0,\n                left: 0,\n                right: 0,\n                backgroundColor: \'#131827\''
);

fs.writeFileSync(pNav, nav);
