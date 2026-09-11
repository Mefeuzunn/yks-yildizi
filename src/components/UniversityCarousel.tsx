"use client";
import React from 'react';

export default function UniversityCarousel() {
  const universities = [
    { name: "BOĞAZİÇİ", yokatlas: "1022", logo: "Boğaziçi_Üniversitesi_Logo.png" },
    { name: "ODTÜ", yokatlas: "1084", logo: "ODTÜ_Amblemi.png" },
    { name: "İTÜ", yokatlas: "1055", logo: "İTÜ_logo.png" },
    { name: "KOÇ", yokatlas: "2039", logo: "Koç_University_logo.svg" },
    { name: "SABANCI", yokatlas: "2054", logo: "Sabancı_University_logo.svg" },
    { name: "BİLKENT", yokatlas: "2021", logo: "Bilkent_University_logo.svg" },
    { name: "HACETTEPE", yokatlas: "1048", logo: "Hacettepe_University_logo.svg" },
    { name: "ANKARA", yokatlas: "1011", logo: "Ankara_University_logo.svg" },
    { name: "GAZİ", yokatlas: "1041", logo: "Gazi_University_logo.svg" },
    { name: "EGE", yokatlas: "1034", logo: "Ege_University_logo.svg" },
    { name: "DOKUZ EYLÜL", yokatlas: "1031", logo: "Dokuz_Eylül_University_logo.svg" },
    { name: "YILDIZ TEKNİK", yokatlas: "1101", logo: "Yıldız_Technical_University_logo.svg" },
    { name: "İSTANBUL", yokatlas: "1056", logo: "İstanbul_Üniversitesi_Logo.svg" },
    { name: "MARMARA", yokatlas: "1072", logo: "Marmara_Üniversitesi_Logo.png" },
    { name: "GALATASARAY", yokatlas: "1040", logo: "Galatasaray_University_logo.svg" }
  ];

  // Döngünün kesintisiz olması için diziyi kopyalıyoruz
  const duplicatedUniversities = [...universities, ...universities];

  return (
    <div className="w-full overflow-hidden relative py-8 mt-12 border-t border-gray-200 logo-mask">
      <div className="flex whitespace-nowrap animate-marquee w-max items-center">
        {duplicatedUniversities.map((uni, index) => (
          <a
            key={index}
            href={`https://yokatlas.yok.gov.tr/lisans-univ.php?u=${uni.yokatlas}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-12 flex items-center justify-center opacity-70 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-pointer"
            title={`${uni.name} - YÖKATLAS'ta Gör`}
          >
            <img 
              src={`https://tr.wikipedia.org/wiki/Special:FilePath/${encodeURIComponent(uni.logo)}`} 
              alt={`${uni.name} Logosu`} 
              className="h-16 w-16 md:h-20 md:w-20 object-contain drop-shadow-sm"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </a>
        ))}
      </div>
    </div>
  );
}
