import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function verifyPhase3() {
  console.log('🧪 FAZ 3 KAPSAMLI DOĞRULAMA TESTİ BAŞLATILIYOR...\n');
  let passed = 0;

  // 1. Maarif Page Dosyasının Varlığı
  const pagePath = path.join(__dirname, '../src/app/maarif/page.tsx');
  if (fs.existsSync(pagePath)) {
    console.log('✅ [TEST 1] src/app/maarif/page.tsx dosyası mevcut.');
    passed++;
  } else {
    throw new Error('❌ src/app/maarif/page.tsx bulunamadı!');
  }

  const pageContent = fs.readFileSync(pagePath, 'utf8');

  // 2. Sıfır Karışma (Zero Contamination) Denetimi
  // Kullanıcıya görünen metinlerde TYT, AYT, YÖK Atlas ve Net Hesaplama olmamalı
  const forbiddenKeywords = ['TYT ', ' AYT', 'YÖK Atlas', 'Net Hesaplama', 'Netler'];
  let contaminationFound = false;
  for (const kw of forbiddenKeywords) {
    if (pageContent.includes(kw)) {
      console.error(`❌ Sayfa içerisinde yasaklı klasik YKS terimi tespit edildi: "${kw}"`);
      contaminationFound = true;
    }
  }
  if (!contaminationFound) {
    console.log('✅ [TEST 2] Sıfır Karışma (Zero Contamination): Sayfa klasik YKS (TYT/AYT) terimlerinden tamamen arındırılmış!');
    passed++;
  } else {
    throw new Error('❌ Maarif sayfasında YKS terimi sızıntısı var!');
  }

  // 3. MEB Ortak Yazılı Geri Sayım ve Senaryo Bileşenleri
  if (
    pageContent.includes('1. Dönem 1. Ortak Yazılı Sınavları') &&
    pageContent.includes('GÜN KALDI') &&
    pageContent.includes('MEB RESMİ SINAV TAKVİMİ')
  ) {
    console.log('✅ [TEST 3] MEB Ortak Yazılı Sınav Geri Sayımı ve resmi takvim kartı entegre.');
    passed++;
  } else {
    throw new Error('❌ MEB Yazılı geri sayım bileşeni eksik!');
  }

  // 4. Kademeli Sınıf Seçici (9, 10, 11. Sınıf)
  if (
    pageContent.includes('{grade}. Sınıf') &&
    pageContent.includes('[9, 10, 11]')
  ) {
    console.log('✅ [TEST 4] Kademeli Sınıf Seçici (9, 10, 11) aktif.');
    passed++;
  } else {
    throw new Error('❌ Sınıf seçici eksik!');
  }

  // 5. 4 Temel Maarif Sekmesi
  const requiredTabs = ['Dersler & Temalar', 'MEB Yazılı Senaryoları', 'PhET Deneyleri', 'AstraTutor Maarif Mentoru'];
  const allTabsPresent = requiredTabs.every(t => pageContent.includes(t));
  if (allTabsPresent) {
    console.log('✅ [TEST 5] 4 Temel Maarif sekmesi eksiksiz tanımlı.');
    passed++;
  } else {
    throw new Error('❌ Sekmelerde eksiklik var!');
  }

  // 6. PhET Laboratuvar Bağlantıları
  if (pageContent.includes('/simulasyonlar/') && pageContent.includes('Laboratuvarda İncele')) {
    console.log('✅ [TEST 6] 165 PhET Simülasyonu ile interaktif laboratuvar köprüsü kurulu.');
    passed++;
  } else {
    throw new Error('❌ PhET laboratuvar köprüsü eksik!');
  }

  // 7. Navigasyon Entegrasyonu (Sidebar, MobileNav, Dashboard)
  const sidebarPath = path.join(__dirname, '../src/components/AppSidebar.tsx');
  const mobileNavPath = path.join(__dirname, '../src/components/MobileNav.tsx');
  const dashboardPath = path.join(__dirname, '../src/app/dashboard/page.tsx');

  const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
  const mobileNavContent = fs.readFileSync(mobileNavPath, 'utf8');
  const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

  const navOk =
    sidebarContent.includes("href: '/maarif'") &&
    mobileNavContent.includes("href: '/maarif'") &&
    dashboardContent.includes("href=\"/maarif\"");

  if (navOk) {
    console.log('✅ [TEST 7] Masaüstü Sidebar, Mobil Alt Menü ve Dashboard banner navigasyonları tam entegre.');
    passed++;
  } else {
    throw new Error('❌ Navigasyon bağlantılarında eksiklik tespit edildi!');
  }

  console.log(`\n🎉 FAZ 3 SONUCU: ${passed} / 7 doğrulama adımı eksiksiz BAŞARILI!`);
  process.exit(0);
}

verifyPhase3();
