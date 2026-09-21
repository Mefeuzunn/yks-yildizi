const fs = require('fs');
const p = 'src/components/MobileNav.tsx';
let content = fs.readFileSync(p, 'utf8');

content = content.replace(
  "{ emoji: '🏠', label: 'Ana Sayfa', href: '/dashboard' }",
  "{ emoji: '🏠', label: 'Ana Sayfa', href: '/dashboard?tab=home' }"
);

// We need to make sure the checkIsActive logic handles /dashboard?tab=home correctly
// It checks if (href === '/dashboard' && !tab && pathname === '/dashboard')
// We should update it to check tab === 'home' as well.
content = content.replace(
  "if (href === '/dashboard' && !tab && pathname === '/dashboard') {\n      return true;\n    }",
  "if ((href === '/dashboard' || href === '/dashboard?tab=home') && (!tab || tab === 'home') && pathname === '/dashboard') {\n      return true;\n    }"
);

fs.writeFileSync(p, content);
console.log("Nav fixed");
