const fs = require('fs');
const pCss = 'src/app/globals.css';
let css = fs.readFileSync(pCss, 'utf8');

// Add .mobile-flex base hiding if not present
if (!css.includes('.mobile-flex {\n  display: none !important;\n}')) {
  css = css.replace(
    '.mobile-only {\n  display: none !important;\n}',
    '.mobile-only {\n  display: none !important;\n}\n\n.mobile-flex {\n  display: none !important;\n}'
  );
  fs.writeFileSync(pCss, css);
}

const pNav = 'src/components/MobileNav.tsx';
let nav = fs.readFileSync(pNav, 'utf8');
// Change mobile-only to mobile-flex for flex containers
nav = nav.replace(/className="mobile-only"/g, 'className="mobile-flex"');
// Wait, the backdrop and drawer are also .mobile-only, and they use flex?
// The drawer uses:
// display is not specified inline! Wait, if the drawer is motion.div and uses block, mobile-flex will force flex.
// But Drawer might not want flex.
// Only replace the <nav> className:
nav = nav.replace(/<nav\s+className="mobile-only"/, '<nav className="mobile-flex"');
fs.writeFileSync(pNav, nav);
console.log("Fixed MobileNav display flex bug");
