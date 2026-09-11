const postgres = require('postgres');
const sql = postgres('postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres', { ssl: 'require' });

async function run() {
  try {
    await sql.unsafe(`
      INSERT INTO simulations (title, description, source_url, category, subject, topic, difficulty_level, related_yks_topics)
      VALUES
        -- FİZİK
        ('Yay Sabiti ve Hooke Yasası', 'Yayların uzama miktarını kuvvetle ilişkilendir. Hooke yasasını test et.', 'https://phet.colorado.edu/sims/html/hookes-law/latest/hookes-law_tr.html', 'AYT', 'Fizik', 'Kuvvet ve Hareket', 3, ARRAY['Hooke Yasası', 'Yay Sabiti', 'Esneklik']),
        ('Sarkaç Laboratuvarı', 'Basit sarkacın periyodunu etkileyen değişkenleri incele.', 'https://phet.colorado.edu/sims/html/pendulum-lab/latest/pendulum-lab_tr.html', 'AYT', 'Fizik', 'Basit Harmonik Hareket', 3, ARRAY['Basit Sarkaç', 'Periyot', 'Yerçekimi İvmesi']),
        ('Çarpışma Laboratuvarı', '1D ve 2D esnek ve esnek olmayan çarpışmalarda momentum korunumunu test et.', 'https://phet.colorado.edu/sims/html/collision-lab/latest/collision-lab_tr.html', 'AYT', 'Fizik', 'İtme ve Momentum', 4, ARRAY['Momentum', 'Esnek Çarpışma', 'Kinetik Enerji']),
        ('Kapasitör Laboratuvarı', 'Sığaçların (Kondansatör) yük depolama özelliklerini, dielektrik katsayısını değiştirerek incele.', 'https://phet.colorado.edu/sims/html/capacitor-lab-basics/latest/capacitor-lab-basics_tr.html', 'AYT', 'Fizik', 'Elektrik', 4, ARRAY['Kondansatör', 'Sığa', 'Dielektrik']),
        ('Işığın Kırılması', 'Farklı ortamlarda (su, cam, hava) ışığın kırılma indeksini ve Snell yasasını incele.', 'https://phet.colorado.edu/sims/html/bending-light/latest/bending-light_tr.html', 'TYT', 'Fizik', 'Optik', 3, ARRAY['Kırılma', 'Snell Yasası', 'Tam Yansıma']),
        ('İp Üzerinde Dalgalar', 'Dalga boyu, frekans ve genlik ayarları ile periyodik dalgalar ve atma oluştur.', 'https://phet.colorado.edu/sims/html/wave-on-a-string/latest/wave-on-a-string_tr.html', 'TYT', 'Fizik', 'Dalgalar', 2, ARRAY['Dalga Boyu', 'Frekans', 'Atma']),
        ('Renk Görmesi', 'Işık renklerinin birleşimini ve gözün bu renkleri nasıl algıladığını test et.', 'https://phet.colorado.edu/sims/html/color-vision/latest/color-vision_tr.html', 'TYT', 'Fizik', 'Optik', 1, ARRAY['Renkler', 'Işık', 'Filtreler']),

        -- KİMYA
        ('Atom İnşa Et', 'Proton, nötron ve elektronları kullanarak element atomları oluştur ve izotopları keşfet.', 'https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_tr.html', 'TYT', 'Kimya', 'Atom', 2, ARRAY['Atom Altı Tanecikler', 'İzotop', 'İyon']),
        ('Tepkime Denkleştirme', 'Terazi kullanarak kimyasal tepkimeleri denkleştirmeyi öğren.', 'https://phet.colorado.edu/sims/html/balancing-chemical-equations/latest/balancing-chemical-equations_tr.html', 'TYT', 'Kimya', 'Kimyasal Tepkimeler', 2, ARRAY['Denklem Denkleştirme', 'Kütlenin Korunumu']),
        ('Molarite', 'Çözünen madde miktarı ve çözücü hacmini değiştirerek çözelti derişimini hesapla.', 'https://phet.colorado.edu/sims/html/molarity/latest/molarity_tr.html', 'AYT', 'Kimya', 'Sıvı Çözeltiler', 3, ARRAY['Molarite', 'Derişim', 'Çözelti']),
        ('Maddenin Halleri', 'Katı, sıvı ve gaz fazlarındaki tanecik hareketlerini ve hal değişimlerini izle.', 'https://phet.colorado.edu/sims/html/states-of-matter-basics/latest/states-of-matter-basics_tr.html', 'TYT', 'Kimya', 'Maddenin Halleri', 1, ARRAY['Hal Değişimi', 'Katı-Sıvı-Gaz']),
        ('İzotoplar ve Atom Kütlesi', 'Elementlerin doğada bulunma yüzdelerine göre ortalama atom kütlelerini hesapla.', 'https://phet.colorado.edu/sims/html/isotopes-and-atomic-mass/latest/isotopes-and-atomic-mass_tr.html', 'TYT', 'Kimya', 'Kimya Kanunları', 3, ARRAY['İzotop', 'Ortalama Atom Kütlesi']),

        -- MATEMATİK (PhET formatında Matematik)
        ('Trigonometri Turu', 'Birim çember üzerinde sinüs, kosinüs ve tanjant fonksiyonlarının değişimini incele.', 'https://phet.colorado.edu/sims/html/trig-tour/latest/trig-tour_tr.html', 'AYT', 'Genel', 'Trigonometri', 4, ARRAY['Birim Çember', 'Sinüs', 'Kosinüs']),
        ('Türev ve İntegral Çizici', 'Verilen bir fonksiyonun türevini ve integralini grafik üzerinde eşzamanlı olarak gör.', 'https://phet.colorado.edu/sims/html/calculus-grapher/latest/calculus-grapher_tr.html', 'AYT', 'Genel', 'Türev - İntegral', 5, ARRAY['Türev', 'İntegral', 'Eğim']),
        ('İkinci Dereceden Denklemler', 'Parabolün katsayılarını (a, b, c) değiştirerek tepe noktası ve kökler üzerindeki etkisini incele.', 'https://phet.colorado.edu/sims/html/graphing-quadratics/latest/graphing-quadratics_tr.html', 'AYT', 'Genel', 'Parabol', 3, ARRAY['Parabol', 'Tepe Noktası', 'Kökler']),
        ('Doğru Grafikleri', 'y = mx + n formatındaki doğrusal fonksiyonların eğim (m) ve y-kesen (n) değerlerini değiştir.', 'https://phet.colorado.edu/sims/html/graphing-lines/latest/graphing-lines_tr.html', 'TYT', 'Genel', 'Fonksiyonlar', 2, ARRAY['Eğim', 'Doğrusal Fonksiyon'])
    `);
    console.log('✅ 16 adet yeni MATEMATİK, FİZİK ve KİMYA simülasyonu eklendi!');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
run();
