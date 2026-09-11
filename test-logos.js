const https = require('https');
const domains = [
  "boun.edu.tr", "metu.edu.tr", "itu.edu.tr", "ku.edu.tr", "sabanciuniv.edu",
  "bilkent.edu.tr", "hacettepe.edu.tr", "ankara.edu.tr", "gazi.edu.tr",
  "ege.edu.tr", "deu.edu.tr", "yildiz.edu.tr", "istanbul.edu.tr", "marmara.edu.tr", "gsu.edu.tr"
];

domains.forEach(domain => {
  https.get(`https://logo.clearbit.com/${domain}`, (res) => {
    console.log(`${domain}: ${res.statusCode}`);
  });
});
