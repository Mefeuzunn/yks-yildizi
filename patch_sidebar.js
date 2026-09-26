const fs = require('fs');

function patch(filePath, isMobile) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('tercih_robotu')) {
    const insertAfter = "{ emoji: '🔬', label: 'Simülasyonlar', href: '/simulasyonlar' },";
    const injection = `
  { emoji: '🤖', label: 'AstraTutor AI', href: '/dashboard?tab=astratutor' },
  { emoji: '🎓', label: 'Tercih Robotu', href: '/dashboard?tab=tercih_robotu' },
  { emoji: '🧮', label: 'Puan Hesaplama', href: '/puan-hesaplama' },
  { emoji: '🏛️', label: 'YÖK Atlas', href: '/admin/yokatlas' },`;
    content = content.replace(insertAfter, insertAfter + injection);
    fs.writeFileSync(filePath, content);
    console.log('Patched', filePath);
  }
}

patch('src/components/AppSidebar.tsx', false);
patch('src/components/MobileNav.tsx', true);
