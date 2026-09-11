const https = require('https');
const fs = require('fs');
const path = require('path');

const options = {
  headers: {
    'User-Agent': 'YKSYildiziApp/1.0 (mefeuzunn@gmail.com) Node.js'
  }
};

const universities = [
  { id: "bogazici", name: "BOĞAZİÇİ", title: "Boğaziçi_Üniversitesi", yokatlas: "1022" },
  { id: "odtu", name: "ODTÜ", title: "Orta_Doğu_Teknik_Üniversitesi", yokatlas: "1084" },
  { id: "itu", name: "İTÜ", title: "İstanbul_Teknik_Üniversitesi", yokatlas: "1055" },
  { id: "koc", name: "KOÇ", title: "Koç_Üniversitesi", yokatlas: "2039" },
  { id: "sabanci", name: "SABANCI", title: "Sabancı_Üniversitesi", yokatlas: "2054" },
  { id: "bilkent", name: "BİLKENT", title: "Bilkent_Üniversitesi", yokatlas: "2021" },
  { id: "hacettepe", name: "HACETTEPE", title: "Hacettepe_Üniversitesi", yokatlas: "1048" },
  { id: "ankara", name: "ANKARA", title: "Ankara_Üniversitesi", yokatlas: "1011" },
  { id: "gazi", name: "GAZİ", title: "Gazi_Üniversitesi", yokatlas: "1041" },
  { id: "ege", name: "EGE", title: "Ege_Üniversitesi", yokatlas: "1034" },
  { id: "deu", name: "DOKUZ EYLÜL", title: "Dokuz_Eylül_Üniversitesi", yokatlas: "1031" },
  { id: "ytu", name: "YILDIZ TEKNİK", title: "Yıldız_Teknik_Üniversitesi", yokatlas: "1101" },
  { id: "istanbul", name: "İSTANBUL", title: "İstanbul_Üniversitesi", yokatlas: "1056" },
  { id: "marmara", name: "MARMARA", title: "Marmara_Üniversitesi", yokatlas: "1072" },
  { id: "galatasaray", name: "GALATASARAY", title: "Galatasaray_Üniversitesi", yokatlas: "1040" }
];

const downloadImage = (url, dest) => {
  return new Promise((resolve, reject) => {
    https.get(url, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, dest).then(resolve).catch(reject);
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

const getPageImageUrl = (title) => {
  return new Promise((resolve, reject) => {
    const url = `https://tr.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(title)}&pithumbsize=500&format=json`;
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const pages = parsed.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pages[pageId] && pages[pageId].thumbnail && pages[pageId].thumbnail.source) {
            resolve(pages[pageId].thumbnail.source);
          } else {
            resolve(null);
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
};

const main = async () => {
  const dir = path.join(__dirname, 'public', 'logos');
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }

  const results = [];

  for (const uni of universities) {
    console.log(`Processing ${uni.title}...`);
    try {
      let imgUrl = await getPageImageUrl(uni.title);
      if (!imgUrl) {
        console.log(`  -> No image found for ${uni.title}, falling back to clearbit`);
        imgUrl = `https://logo.clearbit.com/${uni.id}.edu.tr`; // Basic fallback
      }
      const ext = imgUrl.includes('.png') ? '.png' : (imgUrl.includes('.svg') ? '.svg' : '.jpg');
      const dest = path.join(dir, `${uni.id}${ext}`);
      
      console.log(`  -> Downloading ${imgUrl}`);
      await downloadImage(imgUrl, dest);
      
      results.push({
        name: uni.name,
        yokatlas: uni.yokatlas,
        image: `/logos/${uni.id}${ext}`
      });
    } catch (e) {
      console.error(`  -> Error processing ${uni.title}: ${e.message}`);
    }
  }

  fs.writeFileSync(path.join(__dirname, 'src', 'components', 'universities.json'), JSON.stringify(results, null, 2));
  console.log('Done!');
};

main();
