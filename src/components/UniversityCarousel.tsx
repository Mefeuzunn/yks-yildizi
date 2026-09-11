"use client";
import React from 'react';

export default function UniversityCarousel() {
  // Clearbit Logo API kullanarak üniversitelerin gerçek logolarını çekiyoruz.
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
            className="mx-10 flex items-center justify-center gap-4 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
          >
            <img 
              src={`https://logo.clearbit.com/${uni.domain}`} 
              alt={`${uni.name} Logosu`} 
              className="h-10 w-10 object-contain"
              onError={(e) => {
                // Eğer logo yüklenemezse resmi gizle
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-2xl font-heading font-extrabold text-text-muted">
              {uni.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
