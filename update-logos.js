const fs = require('fs');

const content = `"use client";
import React from 'react';

export default function UniversityCarousel() {
  const universities = [
    { name: "BOĞAZİÇİ", domain: "boun.edu.tr" },
    { name: "ODTÜ", domain: "metu.edu.tr" },
    { name: "İTÜ", domain: "itu.edu.tr" },
    { name: "KOÇ", domain: "ku.edu.tr" },
    { name: "SABANCI", domain: "sabanciuniv.edu" },
    { name: "BİLKENT", domain: "bilkent.edu.tr" },
    { name: "HACETTEPE", domain: "hacettepe.edu.tr" },
    { name: "ANKARA", domain: "ankara.edu.tr" },
    { name: "GAZİ", domain: "gazi.edu.tr" },
    { name: "EGE", domain: "ege.edu.tr" },
    { name: "DOKUZ EYLÜL", domain: "deu.edu.tr" },
    { name: "YILDIZ TEKNİK", domain: "yildiz.edu.tr" },
    { name: "İSTANBUL", domain: "istanbul.edu.tr" },
    { name: "MARMARA", domain: "marmara.edu.tr" },
    { name: "GALATASARAY", domain: "gsu.edu.tr" }
  ];

  const duplicatedUniversities = [...universities, ...universities];

  return (
    <div className="w-full overflow-hidden relative py-8 mt-12 border-t border-gray-200 logo-mask">
      <div className="flex whitespace-nowrap animate-marquee w-max items-center">
        {duplicatedUniversities.map((uni, index) => (
          <div
            key={index}
            className="mx-12 flex items-center justify-center opacity-70 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-pointer"
            title={uni.name}
          >
            <img 
              src={\`https://www.google.com/s2/favicons?domain=\${uni.domain}&sz=256\`} 
              alt={\`\${uni.name} Logosu\`} 
              className="h-16 w-16 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/components/UniversityCarousel.tsx', content);
console.log("Updated UniversityCarousel.tsx");
