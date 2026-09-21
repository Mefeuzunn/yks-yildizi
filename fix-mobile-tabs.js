const fs = require('fs');
const p = 'src/components/MobileNav.tsx';
let content = fs.readFileSync(p, 'utf8');

// Update MORE_TABS list to include missing items from AppSidebar
content = content.replace(
  "{ emoji: '🎯', label: 'Hedeflerim', href: '/dashboard?tab=hedef' },",
  "{ emoji: '🎯', label: 'Hedeflerim', href: '/dashboard?tab=hedef' },\n  { emoji: '🔬', label: 'Simülasyonlar', href: '/simulasyonlar' },\n  { emoji: '🛡️', label: 'Klanlar', href: '/klanlar' },\n  { emoji: '📋', label: 'Ödevlerim', href: '/odevlerim' },"
);

fs.writeFileSync(p, content);
console.log("MobileNav MORE_TABS fixed");
