const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// 1. Update lucide-react imports
content = content.replace(
  "import { Menu, X } from 'lucide-react';", 
  "import { Menu, X, Landmark } from 'lucide-react';"
);

// 2. Replace the Social Proof section
const oldSection = `          {/* Sosyal Kanıt Bölümü */}
          <div className="pt-8 mt-8 border-t border-gray-200">
            <div className="flex gap-6 text-text-muted font-heading font-bold text-lg tracking-wider opacity-70">
              <span>BOĞAZİÇİ</span>
              <span>ODTÜ</span>
              <span>İTÜ</span>
            </div>
            <p className="text-sm text-text-muted mt-2">
              En iyi üniversitelere yerleşen öğrencilerin tercihi.
            </p>
          </div>`;

const universities = [
  "BOĞAZİÇİ", "ODTÜ", "İTÜ", "KOÇ", "BİLKENT", 
  "SABANCI", "GALATASARAY", "HACETTEPE", "ANKARA", "İSTANBUL", 
  "EGE", "YTÜ", "DEÜ", "GAZİ", "MARMARA"
];

const mappedItems = universities.map((uni, idx) => 
  `                <span key={${idx}} className="whitespace-nowrap flex items-center gap-2">
                  <Landmark size={20} /> ${uni}
                </span>`
).join('\n');

const mappedItemsDup = universities.map((uni, idx) => 
  `                <span key={\`dup-\${${idx}}\`} className="whitespace-nowrap flex items-center gap-2">
                  <Landmark size={20} /> ${uni}
                </span>`
).join('\n');

const newSection = `          {/* Sosyal Kanıt Bölümü (Marquee) */}
          <div className="pt-8 mt-8 border-t border-gray-200 w-full overflow-hidden relative max-w-[100vw]">
            {/* Maske (Kenarlarda yumuşak geçiş için) */}
            <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: 'linear-gradient(90deg, #F8FAFC 0%, transparent 10%, transparent 90%, #F8FAFC 100%)' }}></div>
            
            <p className="text-sm text-text-muted mb-5 font-medium">
              Türkiye'nin en iyi üniversitelerine yerleşenlerin tercihi
            </p>
            
            <div className="flex w-max animate-marquee gap-12 text-text-muted font-heading font-extrabold text-xl tracking-wider opacity-60">
${mappedItems}
${mappedItemsDup}
            </div>
          </div>`;

content = content.replace(oldSection, newSection);
fs.writeFileSync('src/app/page.tsx', content);
console.log("Updated page.tsx");
