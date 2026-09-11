"use client";
import React from 'react';

export default function UniversityCarousel() {
  const universities = [
    "BOĞAZİÇİ", "ODTÜ", "İTÜ", "KOÇ", "SABANCI",
    "BİLKENT", "HACETTEPE", "ANKARA", "GAZİ", "EGE",
    "DOKUZ EYLÜL", "YILDIZ TEKNİK", "İSTANBUL", "MARMARA", "GALATASARAY"
  ];

  const duplicatedUniversities = [...universities, ...universities];

  return (
    <div className="w-full overflow-hidden relative py-8 mt-12 border-t border-gray-200 logo-mask">
      <div className="flex whitespace-nowrap animate-marquee w-max">
        {duplicatedUniversities.map((uni, index) => (
          <div
            key={index}
            className="mx-10 text-2xl font-heading font-extrabold text-text-muted opacity-50 hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
          >
            {uni}
          </div>
        ))}
      </div>
    </div>
  );
}
