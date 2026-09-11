import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { generateQuestionFromTemplate, QuestionTemplate } from '@/lib/engine';
import { v4 as uuidv4 } from 'uuid';

// Seed some initial templates if none exist
async function seedTemplates() {
  const countStmt = db.prepare(`SELECT COUNT(*) as count FROM soru_sablonlari`);
  const { count } = (await countStmt.get()) as any;

  if (count === 0) {
    // Seed subjects (dersler)
    await db.prepare(`INSERT OR IGNORE INTO dersler (id, isim) VALUES ('d1', 'Matematik'), ('d2', 'Fizik'), ('d3', 'Kimya'), ('d4', 'Türkçe')`).run();
    
    // Seed topics (konular)
    await db.prepare(`INSERT OR IGNORE INTO konular (id, ders_id, isim) VALUES 
      ('k1', 'd1', 'Türev'), 
      ('k2', 'd1', 'Temel Kavramlar'), 
      ('k3', 'd1', 'Trigonometri'), 
      ('k4', 'd1', 'Limit'),
      ('k5', 'd2', 'Vektörler'), 
      ('k6', 'd2', 'Eğik Atış'), 
      ('k7', 'd2', 'Fotoelektrik'), 
      ('k8', 'd2', 'Elektrik Devresi'),
      ('k9', 'd3', 'Gazlar'), 
      ('k10', 'd3', 'Piller'), 
      ('k11', 'd3', 'Titrasyon'),
      ('k12', 'd4', 'Yazım Kuralları'), 
      ('k13', 'd4', 'Noktalama İşaretleri')
    `).run();

    const insertStmt = db.prepare(`
      INSERT INTO soru_sablonlari (id, ders_id, konu_id, zorluk_derecesi, sablon_kodu, icerik_sablonu, cozum_sablonu)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // --- MATEMATİK ŞABLONLARI ---

    // 1. Matematik - Türev Eğim (Zorluk: 4)
    await insertStmt.run(
      uuidv4(), 'd1', 'k1', 4,
      `
      const a = Math.floor(Math.random() * 5) + 1;
      const b = Math.floor(Math.random() * 10) - 5;
      const x0 = Math.floor(Math.random() * 4) + 1;
      const egim = 2 * a * x0; 
      const y0 = a * x0 * x0 + b;
      const yanlislar = [egim + 1, egim - 1, egim + 2 * a, -egim];
      return { a, b, x0, y0, cevap: egim, yanlislar };
      `,
      "f(x) = {{a}}x² {{b > 0 ? '+' : ''}}{{b === 0 ? '' : b}} parabolüne x = {{x0}} noktasından çizilen teğetin eğimi kaçtır?",
      "f(x)'in türevi f'(x) = 2 * {{a}} * x. x yerine {{x0}} yazarsak: 2 * {{a}} * {{x0}} = {{cevap}} olur."
    );

    // 2. Matematik - Temel Kavramlar (Zorluk: 2)
    await insertStmt.run(
      uuidv4(), 'd1', 'k2', 2,
      `
      const n = 5;
      const start = Math.floor(Math.random() * 10) + 1; // 1-10
      const sum = 5 * start + 20; // start + (start+2) + (start+4) + (start+6) + (start+8) = 5*start + 20
      const enBuyuk = start + 8;
      const yanlislar = [enBuyuk + 2, enBuyuk - 2, enBuyuk + 4, enBuyuk - 4];
      return { sum, cevap: enBuyuk, yanlislar };
      `,
      "Ardışık 5 çift tam sayının toplamı {{sum}} olduğuna göre, bu sayıların en büyüğü kaçtır?",
      "Sayılar x, x+2, x+4, x+6, x+8 olsun. Toplamları 5x + 20 = {{sum}} -> 5x = {{sum - 20}} -> x = {{(sum-20)/5}}. En büyük sayı x+8 = {{cevap}} bulunur."
    );

    // 3. Matematik - Trigonometri (Zorluk: 3)
    await insertStmt.run(
      uuidv4(), 'd1', 'k3', 3,
      `
      const x = -0.8;
      const y = 0.6; // 3/5 ve 4/5 uyumu
      const yanlislar = ["3/5", "4/5", "0.8", "-3/5"];
      return { cevap: "-4/5", yanlislar };
      `,
      "Birim çember üzerinde bulunan A(x, 3/5) noktası koordinat düzleminin II. bölgesinde olduğuna göre x koordinatı kaçtır?",
      "Birim çember denklemi x² + y² = 1'dir. y = 3/5 için x² + 9/25 = 1 -> x² = 16/25. II. bölgede x negatif olacağından x = -4/5 ({{cevap}}) bulunur."
    );

    // 4. Matematik - Limit (Zorluk: 3)
    await insertStmt.run(
      uuidv4(), 'd1', 'k4', 3,
      `
      const c = Math.floor(Math.random() * 5) + 2; // 2-6
      const limitVal = 2 * c;
      const yanlislar = [c, c * c, limitVal + 2, 0];
      return { c, cevap: limitVal, yanlislar };
      `,
      "lim(x -> {{c}}) (x² - {{c*c}}) / (x - {{c}}) limitinin değeri kaçtır?",
      "Belirsizliği gidermek için çarpanlara ayırma yaparız: (x-{{c}})(x+{{c}}) / (x-{{c}}) = x+{{c}}. x yerine {{c}} yazarsak {{c}} + {{c}} = {{cevap}} olur."
    );

    // --- FİZİK ŞABLONLARI ---

    // 5. Fizik - Vektörler (Zorluk: 2)
    await insertStmt.run(
      uuidv4(), 'd2', 'k5', 2,
      `
      const f = Math.floor(Math.random() * 5 + 2) * 5; // 10,15,20,25...
      const yanlislar = [2 * f, f * 1.73, 0, f / 2];
      return { f, cevap: f, yanlislar };
      `,
      "Aralarında 120° açı bulunan eşit {{f}} N büyüklüğündeki iki kuvvetin bileşkesinin şiddeti kaç N'dur?",
      "Aralarında 120° açı bulunan eşit iki vektörün bileşkesi, vektörlerden birinin büyüklüğüne eşittir. Dolayısıyla bileşke {{cevap}} N olur."
    );

    // 6. Fizik - Eğik Atış (Zorluk: 3)
    await insertStmt.run(
      uuidv4(), 'd2', 'k6', 3,
      `
      const v = Math.floor(Math.random() * 3 + 2) * 20; // 40,60,80
      const hmax = (v * 0.5) * (v * 0.5) / 20;
      const yanlislar = [hmax * 2, hmax / 2, hmax + 10, v * 2];
      return { v, cevap: hmax, yanlislar };
      `,
      "Yatay düzlemle düşey açısı 30° olacak şekilde (sin 30° = 0.5) {{v}} m/s hızla eğik atılan bir cismin çıkabileceği maksimum yükseklik kaç metredir? (g = 10 m/s²)",
      "Düşey hız bileşeni Vy = V * sin(30) = {{v}} * 0.5 = {{v*0.5}} m/s. Hmax = Vy² / 2g = {{v*0.5 * v*0.5}} / 20 = {{cevap}} m bulunur."
    );

    // 7. Fizik - Fotoelektrik (Zorluk: 4)
    await insertStmt.run(
      uuidv4(), 'd2', 'k7', 4,
      `
      const e_fot = Math.floor(Math.random() * 4) + 6; // 6-9
      const e_bag = Math.floor(Math.random() * 3) + 2; // 2-4
      const e_kin = e_fot - e_bag;
      const yanlislar = [e_fot + e_bag, e_bag, 0, e_kin + 1];
      return { e_fot, e_bag, cevap: e_kin, yanlislar };
      `,
      "Bağlanma enerjisi {{e_bag}} eV olan bir metale {{e_fot}} eV enerjili fotonlar düşürülüyor. Metalden sökülen fotoelektronların maksimum kinetik enerjisi kaç eV'dir?",
      "Einstein fotoelektrik denklemine göre: Efoton = Ebağlanma + Ekinetik. {{e_fot}} = {{e_bag}} + Ekinetik -> Ekinetik = {{cevap}} eV."
    );

    // 8. Fizik - Elektrik Devresi (Zorluk: 2)
    await insertStmt.run(
      uuidv4(), 'd2', 'k8', 2,
      `
      const r_par = 4; // 12 ve 6 paralel
      const r_seri = Math.floor(Math.random() * 5) + 3; // 3-7
      const total = r_par + r_seri;
      const yanlislar = [18 + r_seri, 2 + r_seri, total + 1, total - 2];
      return { r_seri, cevap: total, yanlislar };
      `,
      "Bir elektrik devresinde 12 Ω ve 6 Ω'luk iki direnç birbirine paralel bağlanmış, bu gruba ise {{r_seri}} Ω'luk bir direnç seri olarak eklenmiştir. Devrenin eşdeğer direnci kaç Ω'dur?",
      "Paralel dirençlerin eşdeğeri Rp = (12 * 6) / (12 + 6) = 72 / 18 = 4 Ω. Toplam eşdeğer direnç seri direnç eklenerek bulunur: Reş = Rp + Rseri = 4 + {{r_seri}} = {{cevap}} Ω."
    );

    // --- KİMYA ŞABLONLARI ---

    // 9. Kimya - Gazlar (Zorluk: 3)
    await insertStmt.run(
      uuidv4(), 'd3', 'k9', 3,
      `
      const n = Math.floor(Math.random() * 3) + 1; // 1-3 mol
      const p = n * 3; // n * R * T / V -> 300K, 8.2L -> R*T/V = 0.082*300/8.2 = 3.
      const yanlislar = [p + 1, p * 2, p / 2, 22.4];
      return { n, cevap: p, yanlislar };
      `,
      "8.2 L hacimli kapalı bir kapta 300 K sıcaklıkta bulunan {{n}} mol ideal gazın basıncı kaç atm'dir? (R = 0.082 L.atm/mol.K)",
      "İdeal gaz denklemi P.V = n.R.T -> P = n.R.T / V. P = {{n}} * 0.082 * 300 / 8.2 = {{cevap}} atm."
    );

    // 10. Kimya - Piller (Zorluk: 3)
    await insertStmt.run(
      uuidv4(), 'd3', 'k10', 3,
      `
      const e_anot = 0.76;
      const e_katot = 0.34;
      const e_pil = 1.10;
      const yanlislar = ["0.42", "1.50", "-0.42", "0.76"];
      return { cevap: "1.1", yanlislar };
      `,
      "Zn/Zn²⁺ (E°anot = 0.76 V) ve Cu/Cu²⁺ (E°katot = 0.34 V) standart yarı pilleri kullanılarak oluşturulan elektrokimyasal hücrenin standart pil potansiyeli (E°pil) kaç V'tur?",
      "Standart pil potansiyeli yükseltgenme (anot) ve indirgenme (katot) yarı tepkimeleri potansiyellerinin toplamıdır: E°pil = E°anot + E°katot = 0.76 + 0.34 = 1.10 V."
    );

    // 11. Kimya - Titrasyon (Zorluk: 3)
    await insertStmt.run(
      uuidv4(), 'd3', 'k11', 3,
      `
      const v_asit = Math.floor(Math.random() * 3 + 2) * 100; // 200, 300, 400
      const v_baz = v_asit / 2;
      const yanlislar = [v_asit, v_asit * 2, v_baz + 50, 100];
      return { v_asit, cevap: v_baz, yanlislar };
      `,
      "0.1 M {{v_asit}} mL HCl sulu çözeltisini oda sıcaklığında tamamen nötrleştirmek için 0.2 M NaOH sulu çözeltisinden kaç mL eklenmelidir?",
      "Tam nötrleşme anında H⁺ iyonunun molü OH⁻ iyonunun molüne eşittir: Masit * Vasit * tesir = Mbaz * Vbaz * tesir -> 0.1 * {{v_asit}} = 0.2 * Vbaz -> Vbaz = {{cevap}} mL."
    );

    // --- TÜRKÇE ŞABLONLARI ---

    // 12. Türkçe - Yazım Kuralları (Zorluk: 2)
    await insertStmt.run(
      uuidv4(), 'd4', 'k12', 2,
      `
      const dogru = "Mademki gelecektin önceden haber verseydin.";
      const yanlis = "Öyle bir dünyaki sorma gitsin.";
      const yanlislar = [
        "Aramızdaki sorunları tatlıya bağladık.",
        "Sen de bizimle sinemaya gelecek misin?",
        "Oysaki her şey ne kadar da güzel başlamıştı."
      ];
      return { cevap: yanlis, yanlislar };
      `,
      "Aşağıdaki cümlelerin hangisinde 'ki' bağlacının yazımıyla ilgili bir yanlışlık yapılmıştır?",
      "'Öyle bir dünyaki sorma gitsin' cümlesindeki 'ki' bağlaçtır ve ayrı yazılmalıdır ('dünya ki'). Som Bahçemi (Sanki, Oysaki, Mademki, Belki, Haliyle, Çünki, Hâlbuki, İllaki) kelimelerindekiler ise kalıplaştığı için bitişik yazılır."
    );
  }
}

export async function GET(req: Request) {
  try {
    await seedTemplates();

    const { searchParams } = new URL(req.url);
    const zorluk = searchParams.get('zorluk');
    const subject = searchParams.get('subject');

    let query = `SELECT ss.* FROM soru_sablonlari ss JOIN dersler d ON ss.ders_id = d.id`;
    const conditions: string[] = [];
    const params: any[] = [];

    if (zorluk && zorluk !== 'all') {
      conditions.push('ss.zorluk_derecesi = ?');
      params.push(parseInt(zorluk));
    }

    if (subject && subject !== 'all') {
      conditions.push('d.isim = ?');
      params.push(subject);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY RANDOM() LIMIT 1`;

    const stmt = await db.prepare(query);
    const templateRow = stmt.get(...params) as QuestionTemplate;

    if (!templateRow) {
      return NextResponse.json({ error: 'Filtrelere uygun soru şablonu bulunamadı.' }, { status: 404 });
    }

    // AI Motoru: Şablondan eşsiz parametrelerle yeni soru üret
    const generatedQuestion = generateQuestionFromTemplate(templateRow);

    if (!generatedQuestion) {
      return NextResponse.json({ error: 'Soru üretilirken hata oluştu.' }, { status: 500 });
    }

    const subjectRow = await db.prepare('SELECT isim FROM dersler WHERE id = ?').get(templateRow.ders_id) as any;
    const topicRow = await db.prepare('SELECT isim FROM konular WHERE id = ?').get(templateRow.konu_id) as any;

    return NextResponse.json({
      ...generatedQuestion,
      subject: subjectRow?.isim || 'Matematik',
      topic: topicRow?.isim || 'Genel'
    });

  } catch (error: any) {
    console.error('Question Generate API Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
