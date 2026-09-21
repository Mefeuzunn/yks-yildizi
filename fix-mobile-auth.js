const fs = require('fs');
const p = 'src/components/MobileNav.tsx';
let content = fs.readFileSync(p, 'utf8');

// Insert useAuth
if (!content.includes('useAuth')) {
  content = content.replace(
    "import { usePathname, useSearchParams } from 'next/navigation';",
    "import { usePathname, useSearchParams } from 'next/navigation';\nimport { useAuth } from '@/context/AuthContext';"
  );
}

// Inside MobileNavContent
content = content.replace(
  "const searchParams = useSearchParams();",
  "const searchParams = useSearchParams();\n  const { user } = useAuth();"
);

// We define teacher tabs
const teacherTabs = `
  const TEACHER_MAIN_TABS = [
    { emoji: '🏠', label: 'Genel Bakış', href: '/ogretmen/dashboard' },
    { emoji: '🏫', label: 'Sınıflarım', href: '/ogretmen/dashboard?tab=siniflar' },
    { emoji: '👥', label: 'Öğrenciler', href: '/ogretmen/dashboard?tab=ogrenciler' },
    { emoji: '📋', label: 'Ödevler', href: '/ogretmen/dashboard?tab=odevler' },
  ];
  
  const TEACHER_MORE_TABS = [
    { emoji: '📊', label: 'Sınıf Analizi', href: '/ogretmen/dashboard?tab=analiz' },
    { emoji: '📚', label: 'Kaynaklar', href: '/ogretmen/dashboard?tab=kaynaklar' },
    { emoji: '📢', label: 'Duyurular', href: '/ogretmen/dashboard?tab=duyurular' },
    { emoji: '👤', label: 'Profilim', href: '/ogretmen/dashboard?tab=profile' },
  ];
  
  const currentMainTabs = user?.role === 'ogretmen' ? TEACHER_MAIN_TABS : MAIN_TABS;
  const currentMoreTabs = user?.role === 'ogretmen' ? TEACHER_MORE_TABS : MORE_TABS;
`;

content = content.replace(
  "  const searchParams = useSearchParams();\n  const { user } = useAuth();",
  "  const searchParams = useSearchParams();\n  const { user } = useAuth();\n" + teacherTabs
);

content = content.replace(
  "{MAIN_TABS.map((tab) => {",
  "{currentMainTabs.map((tab) => {"
);
content = content.replace(
  "{MORE_TABS.map((tab) => {",
  "{currentMoreTabs.map((tab) => {"
);

fs.writeFileSync(p, content);
console.log("MobileNav auth fixed");
