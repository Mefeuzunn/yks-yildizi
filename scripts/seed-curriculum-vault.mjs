import crypto from 'node:crypto';
import postgres from '/Users/mugefe/Desktop/yksyildizi/node_modules/postgres/src/index.js';

const connectionString = 'postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';
const sql = postgres(connectionString, { ssl: 'require', max: 5 });

const CURRICULUM_VAULT_CARDS = [
  // ─── MATEMATİK ─────────────────────────────────────────────────────────────
  {
    subject: 'Matematik',
    topic: 'Trigonometri',
    category: 'AYT',
    front_text: 'Trigonometride Yarım Açı: $\\cos(2x)$ ifadesinin 3 farklı açılımı nedir?',
    back_text: '1. $\\cos^2(x) - \\sin^2(x)$\n2. $2\\cos^2(x) - 1$\n3. $1 - 2\\sin^2(x)$',
    tip: 'ÖSYM paydada $1 + \\cos(2x)$ verirse $1$ sayısını yok etmek için $2\\cos^2(x) - 1$ kullan!'
  },
  {
    subject: 'Matematik',
    topic: 'Trigonometri',
    category: 'AYT',
    front_text: 'Sinüs Teoremi formülü ve çevrel çember yarıçapı ($R$) ilişkisi nedir?',
    back_text: '$\\frac{a}{\\sin(A)} = \\frac{b}{\\sin(B)} = \\frac{c}{\\sin(C)} = 2R$',
    tip: 'Soruda çevrel çember yarıçapı $R$ geçiyorsa kesinlikle Sinüs Teoremi sorusudur.'
  },
  {
    subject: 'Matematik',
    topic: 'Türev',
    category: 'AYT',
    front_text: 'Bölümün Türevi: $\\left(\\frac{f(x)}{g(x)}\\right)\'$ formülü nedir?',
    back_text: '$\\frac{f\'(x) \\cdot g(x) - f(x) \\cdot g\'(x)}{[g(x)]^2}$',
    tip: 'Payın türevi çarpı payda EKSİ pay çarpı paydanın türevi, bölü paydanın karesi.'
  },
  {
    subject: 'Matematik',
    topic: 'Türev',
    category: 'AYT',
    front_text: 'Bir fonksiyonun yerel ekstremum (maksimum/minimum) noktası olması için türevi ne olmalıdır?',
    back_text: 'Türevinin o noktada $0$ olması ($f\'(x_0) = 0$) veya türevinin tanımsız olup işaret değiştirmesi gerekir.',
    tip: 'Çift katlı köklerde türev $0$ olsa bile işaret değişmediği için ekstremum noktası DEĞİLDİR!'
  },
  {
    subject: 'Matematik',
    topic: 'İntegral',
    category: 'AYT',
    front_text: 'Kısmi İntegrasyon Formülü (LAPTÜ Kuralı) nedir?',
    back_text: '$\\int u \\, dv = u \\cdot v - \\int v \\, du$',
    tip: 'LAPTÜ öncelik sırası: Logaritmik, Ark, Polinom, Trigonometrik, Üstel.'
  },
  {
    subject: 'Matematik',
    topic: 'İntegral',
    category: 'AYT',
    front_text: 'İki eğri $f(x)$ ve $g(x)$ arasında kalan alan integrali nasıl hesaplanır?',
    back_text: '$A = \\int_{a}^{b} (f(x) - g(x)) \\, dx$ (Burada $[a,b]$ aralığında $f(x) \\ge g(x)$ olmalıdır).',
    tip: 'Her zaman [Üstteki Fonksiyon - Alttaki Fonksiyon] entegre edilir, negatif alan çıkamaz!'
  },
  {
    subject: 'Matematik',
    topic: 'Logaritma',
    category: 'AYT',
    front_text: 'Taban Değiştirme Kuralı: $\\log_a(b)$ ifadesi $c$ tabanında nasıl yazılır?',
    back_text: '$\\log_a(b) = \\frac{\\log_c(b)}{\\log_c(a)}$ ve ayrıca $\\log_a(b) = \\frac{1}{\\log_b(a)}$',
    tip: '$\\ln(b) / \\ln(a)$ dönüşümü özellikle türev ve sadeleştirmede hayat kurtarır.'
  },
  {
    subject: 'Matematik',
    topic: 'Polinomlar',
    category: 'AYT',
    front_text: '$P(x)$ polinomunun $(ax - b)$ ile bölümünden kalan nasıl bulunur?',
    back_text: '$ax - b = 0 \\implies x = \\frac{b}{a}$ değeri doğrudan polinoma yazılır: Kalan $= P\\left(\\frac{b}{a}\\right)$.',
    tip: 'Polinomu bölmeye gerek yoktur; bölen ifadeyi sıfıra eşitleyip $x$ yerine yaz!'
  },
  {
    subject: 'Matematik',
    topic: 'Parabol',
    category: 'AYT',
    front_text: '$f(x) = ax^2 + bx + c$ parabolünün tepe noktası $T(r,k)$ koordinatları nasıldır?',
    back_text: '$r = -\\frac{b}{2a}$, \\quad $k = f(r) = \\frac{4ac - b^2}{4a}$',
    tip: '$r$ simetri eksenidir: $x = r$ doğrusu parabolü iki eşit simetrik parçaya böler.'
  },
  {
    subject: 'Matematik',
    topic: 'Permütasyon - Kombinasyon - Olasılık',
    category: 'TYT/AYT',
    front_text: 'Kombinasyon: $n$ elemanlı bir kümenin $r$ elemanlı alt küme sayısı $\\binom{n}{r}$ formülü nedir?',
    back_text: '$\\binom{n}{r} = \\frac{n!}{r! \\cdot (n - r)!}$',
    tip: 'Seçim yapılıyorsa Kombinasyon, dizilim ve sıralama yapılıyorsa Permütasyon!'
  },

  // ─── FİZİK ─────────────────────────────────────────────────────────────────
  {
    subject: 'Fizik',
    topic: 'Düzgün Elektrik Alan ve Sığaçlar (Kondansatör)',
    category: 'AYT',
    front_text: 'Bir sığacın (kondansatör) sığası nelere bağlıdır? Formülü nedir?',
    back_text: '$C = \\varepsilon \\cdot \\frac{A}{d}$ ($\\varepsilon$: Dielektrik katsayısı, $A$: Levha alanı, $d$: Levhalar arası uzaklık)',
    tip: 'Sığa $C$, uygulanan potansiyel farkına ($V$) veya yüke ($q$) BAĞLI DEĞİLDİR! Sadece geometrik ve ortama bağlıdır.'
  },
  {
    subject: 'Fizik',
    topic: 'Düzgün Elektrik Alan ve Sığaçlar (Kondansatör)',
    category: 'AYT',
    front_text: 'Pile bağlı bir sığacın levhaları birbirinden uzaklaştırılırsa ($d$ artarsa) $V, C, q$ nasıl değişir?',
    back_text: 'Pile bağlı olduğu için $V$ SABİTTİR. $d$ arttığı için $C$ AZALIR. $q = C \\cdot V$ olduğundan $q$ AZALIR.',
    tip: 'Altın Kural: Pile bağlıysa $V$ sabit, pilden ayrılmışsa yük $q$ sabittir!'
  },
  {
    subject: 'Fizik',
    topic: 'Fotoelektrik Olayı ve Fotonlar',
    category: 'AYT',
    front_text: 'Einstein Fotoelektrik Denklemi nedir?',
    back_text: '$E_{foton} = E_0 + E_{kinetik} \\implies h \\cdot \\nu = E_0 + \\frac{1}{2}m v_{max}^2$',
    tip: '$E_0$ (eşik enerjisi) SADECE metalin cinsine bağlıdır! Işığın şiddetine veya frekansına bağlı DEĞİLDİR.'
  },
  {
    subject: 'Fizik',
    topic: 'Manyetizma ve İndüksiyon (Faraday & Lenz)',
    category: 'AYT',
    front_text: 'Faraday İndüksiyon Kanunu ve Lenz Kuralı formülü nedir?',
    back_text: '$\\varepsilon = -\\frac{\\Delta \\Phi}{\\Delta t}$ ($\\Phi = B \\cdot A \\cdot \\cos\\theta$)',
    tip: 'Baştaki eksi ($-$) işareti Lenz Kuralıdır: İndüksiyon akımı kendini oluşturan nedene (akı değişimine) DAİMA karşı koyar!'
  },
  {
    subject: 'Fizik',
    topic: 'Alternatif Akım ve Transformatörler',
    category: 'AYT',
    front_text: 'İdeal bir transformatörde sarım sayısı ($N$), gerilim ($V$) ve akım ($I$) ilişkisi nedir?',
    back_text: '$\\frac{V_1}{V_2} = \\frac{N_1}{N_2} = \\frac{I_2}{I_1}$ ve $P_1 = P_2$',
    tip: 'Gerilim sarım sayısıyla doğru orantılı, akım ise ters orantılıdır. Transformatörler DC (Doğru Akım) ile ÇALIŞMAZ!'
  },
  {
    subject: 'Fizik',
    topic: 'Basit Harmonik Hareket',
    category: 'AYT',
    front_text: 'Yaylı sarkaç ve basit sarkacın periyot formülleri nelerdir?',
    back_text: 'Yaylı Sarkaç: $T = 2\\pi \\sqrt{\\frac{m}{k}}$ (TAM EK)\nBasit Sarkaç: $T = 2\\pi \\sqrt{\\frac{L}{g}}$ (TOLGA)',
    tip: 'Hafıza Şifresi: Yaylı sarkaç için TAM EK ($m/k$), basit ipli sarkaç için TOLGA ($L/g$).'
  },
  {
    subject: 'Fizik',
    topic: 'Dalga Mekaniği ve Doppler Olayı',
    category: 'AYT',
    front_text: 'Doppler Olayı nedir? Kaynak gözlemciye yaklaşırken algılanan frekans nasıl değişir?',
    back_text: 'Kaynak gözlemciye yaklaşırken dalga boyu sıkışır (küçülür), algılanan frekans artar ve ses daha TİZ duyulur.',
    tip: 'Sesin yayılma hızı DEĞİŞMEZ çünkü hız sadece ortama bağlıdır!'
  },

  // ─── KİMYA ─────────────────────────────────────────────────────────────────
  {
    subject: 'Kimya',
    topic: 'Kimyasal Denge ve Le Chatelier İlkesi',
    category: 'AYT',
    front_text: 'Denge tepkimesine katalizör eklenirse denge sabiti ($K_c$) ve denge yönü nasıl değişir?',
    back_text: 'Katalizör denge yönünü ve $K_c$ değerini DEĞİŞTİRMEZ! Sadece dengenin daha hızlı kurulmasını sağlar.',
    tip: 'ÖSYM Tuzağı: $K_c$ değerini değiştiren TEK ŞEY SICAKLIKTIR!'
  },
  {
    subject: 'Kimya',
    topic: 'Kimya ve Elektrik (Galvanik ve Elektrolitik Piller)',
    category: 'AYT',
    front_text: 'Galvanik pilde Anot ve Katot kutuplarında hangi olaylar gerçekleşir?',
    back_text: 'ANOT: Yükseltgenme gerçekleşir, elektrot kütlesi genellikle aşınır (azalır).\nKATOT: İndirgenme gerçekleşir, çözeltideki iyonlar indirgenir.',
    tip: 'Hafıza Şifresi: KİMYA $\\rightarrow$ Katotta İndirgenme, Mayot yok, Yükseltgenme Anotta!'
  },
  {
    subject: 'Kimya',
    topic: 'Maddenin Halleri ve Gaz Yasaları',
    category: 'TYT/AYT',
    front_text: 'Graham Gaz Difüzyon Yasası: İki gazın difüzyon hızları oranı ($v_1/v_2$) nelere bağlıdır?',
    back_text: '$\\frac{v_1}{v_2} = \\sqrt{\\frac{M_{A2}}{M_{A1}} \\cdot \\frac{T_1}{T_2}}$',
    tip: 'Hız, sıcaklığın kareköküyle doğru; mol kütlesinin kareköküyle TERS orantılıdır (Hafif gaz hızlı koşar).'
  },
  {
    subject: 'Kimya',
    topic: 'Organik Bileşikler: Hidrokarbonlar ve Fonksiyonel Gruplar',
    category: 'AYT',
    front_text: 'Markovnikov Kuralı nedir? Alkenlere asit (HX) katılmasında hidrojen nereye bağlanır?',
    back_text: 'Hidrojen, çift bağ karbonlarından hidrojeni ÇOK olan karbona bağlanır. Halojen ise hidrojeni az olana bağlanır.',
    tip: 'Hafıza Kuralı: "Zengine daha çok ver" $\\rightarrow$ Hidrojeni çok olana hidrojen gider.'
  },

  // ─── BİYOLOJİ ──────────────────────────────────────────────────────────────
  {
    subject: 'Biyoloji',
    topic: 'Fotosentez ve Kemosentez',
    category: 'TYT/AYT',
    front_text: 'Fotosentezin ışığa bağımlı ve ışıktan bağımsız (Calvin Döngüsü) evreleri nerede gerçekleşir?',
    back_text: 'Işığa Bağımlı Reaksiyonlar: Tilakoit Zar (Kloroplast)\nIşıktan Bağımsız (Calvin): Stroma (Kloroplast)',
    tip: 'Işıktan bağımsız reaksiyonlar da ışık varlığında (gündüz) gerçekleşir çünkü ATP ve NADPH ışık evresinden gelir!'
  },
  {
    subject: 'Biyoloji',
    topic: 'Hücresel Solunum (Glikoliz, Krebs, ETS)',
    category: 'AYT',
    front_text: 'Glikoliz evresinin tüm canlılarda ortak olmasının temel kanıtı nedir?',
    back_text: 'Glikolizde görev alan enzimlerin ve bu enzimleri şifreleyen genlerin tüm canlılarda aynı olması.',
    tip: 'Glikoliz sitoplazmada gerçekleşir, oksijen gerekmez, net 2 ATP ve 2 NADH üretilir.'
  },
  {
    subject: 'Biyoloji',
    topic: 'Kalıtım ve Mendel Yasaları',
    category: 'TYT/AYT',
    front_text: 'X\'e bağlı çekinik kalıtılan bir hastalık (Örn: Hemofili, Renk Körlüğü) için kilit kural nedir?',
    back_text: '1. Hasta bir kız çocuğunun babası KESİNLİKLE hastadır.\n2. Hasta bir annenin tüm erkek çocukları KESİNLİKLE hastadır.',
    tip: 'Erkek çocuk tek X kromozomunu anneden alır; annede varsa erkek çocukta kaçış yoktur!'
  },
  {
    subject: 'Biyoloji',
    topic: 'Sinir Sistemi ve Duyu Organları',
    category: 'AYT',
    front_text: 'Talamus hangi duyu hariç tüm duyuların toplandığı ve beyin kabuğuna iletildiği merkezdir?',
    back_text: 'KOKU DUYUSU HARİÇ. Koku duyusu talamusa uğramadan doğrudan beyin kabuğuna gider.',
    tip: 'ÖSYM\'nin en sevdiği klasik soru: "Koku duyusu Talamus\'a UĞRAMAZ!"'
  },

  // ─── TÜRKÇE & EDEBİYAT ─────────────────────────────────────────────────────
  {
    subject: 'Türkçe',
    topic: 'Yazım Kuralları (Büyük Harfler, De/Da, Ki)',
    category: 'TYT',
    front_text: 'Bağlaç olan "de/da" ile bulunma hal eki olan "-de/-da" nasıl ayırt edilir?',
    back_text: 'Cümleden çıkarıldığında anlam tamamen bozulmuyorsa bağlaçtır ve AYRI yazılır. Cümle tamamen anlamsızlaşıyorsa ektir ve BİTİŞİK yazılır.',
    tip: 'Bağlaç olan "de/da" asla "te/ta" şeklinde sertleşmez! "Gitti de" yazılır, "Gitti te" yazılamaz.'
  },
  {
    subject: 'Türk Dili ve Edebiyatı',
    topic: 'Divan Edebiyatı Nazım Şekilleri ve Şairleri',
    category: 'AYT',
    front_text: 'Gazelin ilk, son ve en güzel beytine ne ad verilir?',
    back_text: 'İlk Beyit: Matla (Doğuş)\nSon Beyit: Makta (Kesiliş - Şair mahlası geçer)\nEn Güzel Beyit: Beytü\'l-Gazel (Şah Beyit)',
    tip: 'Matla beyti kendi arasında uyaklıdır ($aa$), sonraki beyitler $ba, ca, da$ şeklinde devam eder.'
  },
  {
    subject: 'Türk Dili ve Edebiyatı',
    topic: 'Cumhuriyet Dönemi Şiir Akımları',
    category: 'AYT',
    front_text: 'Garip Akımı (I. Yeni) şairleri kimlerdir ve temel ilkeleri nedir?',
    back_text: 'O-M-H: Orhan Veli Kanık, Melih Cevdet Anday, Oktay Rifat Horozcu.\nİlkeleri: Ölçü, uyak ve edebi sanatları reddetmişler; sıradan insanı ve sokak dilini şiire taşımışlardır.',
    tip: 'Hafıza Şifresi: O-M-H (Orhan Veli, Melih Cevdet, Oktay Rifat) $\\rightarrow$ OMO gibi sadeleştirdiler!'
  },

  // ─── TARİH & COĞRAFYA ──────────────────────────────────────────────────────
  {
    subject: 'Tarih',
    topic: 'Milli Mücadele: Kongreler ve Genelgeler',
    category: 'TYT/AYT',
    front_text: 'Amasya Genelgesi\'nin (22 Haziran 1919) Kurtuluş Savaşı açısından en büyük önemi nedir?',
    back_text: 'Kurtuluş Savaşı\'nın AMAÇ, GEREKÇE ve YÖNTEMİ ilk kez burada belirtilmiştir.\n"Milletin bağımsızlığını yine milletin azim ve kararı kurtaracaktır."',
    tip: 'Milletin azim ve kararı ibaresi ile ilk defa MİLLİ EGEMENLİK ve CUMHURİYET sinyali verilmiştir.'
  },
  {
    subject: 'Coğrafya',
    topic: 'Harita Bilgisi ve İzohips Yöntemleri',
    category: 'TYT/AYT',
    front_text: 'İzohips (eş yükselti) haritalarında çizgilerin sıklaştığı yerlerde ne olur?',
    back_text: '1. Eğim artar.\n2. Akarsu akış hızı ve aşındırma gücü artar.\n3. Kıyıdaysa falez (yalıyar) oluşur ve kıta sahanlığı dardır.',
    tip: 'Çizgiler sıksa dağ diktir; çizgiler seyrekse arazi düzlüktür!'
  }
];

async function seed() {
  console.log('Seeding rich curriculum flashcards into PostgreSQL...');
  let inserted = 0;

  for (const card of CURRICULUM_VAULT_CARDS) {
    try {
      const existing = await sql`
        SELECT id FROM flashcards 
        WHERE subject = ${card.subject} AND topic = ${card.topic} AND front_text = ${card.front_text}
        LIMIT 1
      `;

      if (existing.length === 0) {
        const id = crypto.randomUUID();
        await sql`
          INSERT INTO flashcards (id, user_id, subject, topic, category, front_text, back_text, tip)
          VALUES (${id}, 'system', ${card.subject}, ${card.topic}, ${card.category}, ${card.front_text}, ${card.back_text}, ${card.tip})
        `;
        inserted++;
      }
    } catch (e) {
      console.error('Insert error:', e.message);
    }
  }

  const total = await sql`SELECT COUNT(*) FROM flashcards`;
  console.log(`DONE! Successfully seeded ${inserted} new high-yield cards. Total flashcards in DB: ${total[0].count}`);
  await sql.end();
}

seed().catch(console.error);
