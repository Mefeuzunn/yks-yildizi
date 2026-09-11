const postgres = require('postgres');
const sql = postgres('postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres', { ssl: 'require' });

async function run() {
  try {
    // Önce eski çalışmayan simülasyonları silelim
    await sql.unsafe(`TRUNCATE TABLE simulations CASCADE;`);
    console.log('✅ Eski simülasyonlar temizlendi.');

    // PhET HTML5 Embed Linkleri ile yeni verileri ekleyelim
    // PhET resmi olarak iframe kullanıma izin verir ve ?html parametresiyle saf HTML5 yükler.
    await sql.unsafe(`
      INSERT INTO simulations (title, description, source_url, category, subject, topic, difficulty_level, related_yks_topics)
      VALUES
        ('Kuvvet ve Hareket', 'Net kuvvet, sürtünme ve ivme kavramlarını interaktif olarak keşfet. Newton yasalarını test et.', 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_tr.html', 'TYT', 'Fizik', 'Kuvvet ve Hareket', 2, ARRAY['Newton Yasaları', 'İvme', 'Sürtünme Kuvveti']),
        
        ('Devre Yapım Seti', 'DC devreler kur. Ampermetre ve voltmetre kullanarak Ohm yasasını ispatla.', 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_tr.html', 'TYT', 'Fizik', 'Elektrik', 3, ARRAY['Ohm Yasası', 'Direnç', 'Akım', 'Potansiyel Fark']),
        
        ('Enerji Parkı', 'Paten kayan bir çocuk üzerinden kinetik, potansiyel ve termal enerji dönüşümlerini izle.', 'https://phet.colorado.edu/sims/html/energy-skate-park/latest/energy-skate-park_tr.html', 'TYT', 'Fizik', 'İş, Güç, Enerji', 2, ARRAY['Kinetik Enerji', 'Potansiyel Enerji', 'Mekanik Enerji Korunumu']),
        
        ('Asit-Baz Çözeltileri', 'pH ölçümü yap, asit ve bazların kuvvetlerini moleküler düzeyde incele.', 'https://phet.colorado.edu/sims/html/acid-base-solutions/latest/acid-base-solutions_tr.html', 'AYT', 'Kimya', 'Asit Baz', 3, ARRAY['pH', 'İyonlaşma', 'Kuvvetli Asit/Baz']),
        
        ('Molekül Geometrisi', 'VSEPR teorisine göre 3 boyutlu moleküller inşa et ve bağ açılarını ölç.', 'https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes_tr.html', 'AYT', 'Kimya', 'Kimyasal Türler Arası Etkileşimler', 4, ARRAY['VSEPR', 'Bağ Açısı', 'Molekül Geometrisi']),
        
        ('Doğal Seçilim', 'Mutasyonlar ve çevre şartlarının tavşan popülasyonu üzerindeki etkisini gözlemle.', 'https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection_tr.html', 'AYT', 'Biyoloji', 'Evrim ve Populasyon Genetiği', 3, ARRAY['Doğal Seçilim', 'Mutasyon', 'Adaptasyon']),
        
        ('Gazların Özellikleri', 'Kapalı kapta ideal gaz yasalarını (PV=nRT) partikül düzeyinde test et.', 'https://phet.colorado.edu/sims/html/gas-properties/latest/gas-properties_tr.html', 'AYT', 'Kimya', 'Gazlar', 4, ARRAY['İdeal Gaz', 'Basınç', 'Hacim', 'Kinetik Teori']),
        
        ('Kütleçekim Kuvveti', 'Gezegenler arası kütleçekim kuvvetini Newton''un Evrensel Çekim Yasası ile hesapla.', 'https://phet.colorado.edu/sims/html/gravity-force-lab/latest/gravity-force-lab_tr.html', 'AYT', 'Fizik', 'Kütleçekim', 3, ARRAY['Kütleçekim Kuvveti', 'Newton', 'Gezegenler']),
        
        ('Eğik Atış Laboratuvarı', 'Açı, hız ve kütle ayarlayarak atış hareketlerini analiz et. Hava direncini test et.', 'https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_tr.html', 'AYT', 'Fizik', 'Atışlar', 4, ARRAY['Eğik Atış', 'Maksimum Yükseklik', 'Menzil']),
        
        ('Faraday Yasası', 'Mıknatısı bobine yaklaştırarak indüksiyon akımının nasıl oluştuğunu gör.', 'https://phet.colorado.edu/sims/html/faradays-law/latest/faradays-law_tr.html', 'AYT', 'Fizik', 'Manyetizma', 3, ARRAY['İndüksiyon Akımı', 'Manyetik Akı', 'Faraday'])
      ;
    `);
    console.log('✅ 10 adet Türkçe destekli PhET simülasyonu eklendi.');

    process.exit(0);
  } catch(e) {
    console.error('❌ Hata:', e.message);
    process.exit(1);
  }
}
run();
