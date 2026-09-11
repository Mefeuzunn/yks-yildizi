const https = require('https');

const files = [
  "Boğaziçi_Üniversitesi_Logo.png",
  "ODTÜ_Amblemi.png",
  "İTÜ_logo.png",
  "Koç_University_logo.svg",
  "Sabancı_University_logo.svg",
  "Bilkent_University_logo.svg",
  "Hacettepe_University_logo.svg",
  "Ankara_University_logo.svg",
  "Gazi_University_logo.svg",
  "Ege_University_logo.svg",
  "Dokuz_Eylül_University_logo.svg",
  "Yıldız_Technical_University_logo.svg",
  "İstanbul_Üniversitesi_Logo.svg",
  "Marmara_Üniversitesi_Logo.png",
  "Galatasaray_University_logo.svg"
];

const check = (filename) => {
  const url = `https://tr.wikipedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}`;
  https.request(url, { method: 'HEAD', headers: { 'User-Agent': 'YKSYildiziApp/1.0' } }, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      console.log(`✅ ${filename}`);
    } else {
      console.log(`❌ ${filename} -> Status: ${res.statusCode}`);
    }
  }).end();
};

files.forEach(check);
