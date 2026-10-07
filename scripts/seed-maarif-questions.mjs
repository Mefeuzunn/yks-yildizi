import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';
const sql = postgres(connectionString, { ssl: 'require', max: 5 });

const SAMPLE_QUESTIONS = [
  // ─── 9. Sınıf Matematik 1. Dönem 1. Yazılı Senaryo 1 (scen-mat-9-1-1) ───
  {
    id: 'q-mat-9-1-1-1',
    scenario_id: 'scen-mat-9-1-1',
    curriculum_node_code: 'MAT.9.1.1',
    grade: 9,
    subject: 'Matematik',
    context_story: 'Bir akıllı sulama sistemi, tarla sensörlerinden gelen nem verilerine göre su vanalarını algoritmik bir döngüyle açıp kapatmaktadır. Sensör değeri her saat başında x = 3a - 5 bağıntısına göre güncellenmekte olup a değeri rasyonel bir sayıdır.',
    question_text: 'a) a = 7/3 iken sensör değerinin gerçek sayılar kümesindeki alt kümesini (doğal, tam, rasyonel, irrasyonel) belirleyiniz.\nb) Sensör değerinin irrasyonel bir sayı olabilmesi için a değişkeninin hangi sayı kümesinden seçilmesi gerektiğini gerekçesiyle açıklayınız.',
    max_score: 15,
    rubric_criteria: [
      { points: 5, criteria: 'a = 7/3 değerini x = 3a - 5 bağıntısında yerine koyup x = 2 sonucunu bulma.' },
      { points: 5, criteria: '2 sayısının Doğal Sayılar (N), Tam Sayılar (Z) ve Rasyonel Sayılar (Q) kümesine ait olduğunu doğru sınıflandırma.' },
      { points: 5, criteria: 'x in irrasyonel olması için a nın irrasyonel sayılar kümesinden (I veya Q\') seçilmesi gerektiğini matematiksel gerekçeyle ifade etme.' }
    ],
    sample_solutions: [
      'x = 3*(7/3) - 5 = 7 - 5 = 2. 2 bir doğal sayı, tam sayı ve rasyonel sayıdır.',
      '3a - 5 ifadesinde 3 ve 5 rasyonel olduğundan, sonucun irrasyonel çıkması ancak a nın irrasyonel olmasıyla mümkündür.'
    ],
    difficulty_level: 2
  },
  {
    id: 'q-mat-9-1-1-2',
    scenario_id: 'scen-mat-9-1-1',
    curriculum_node_code: 'MAT.9.1.1',
    grade: 9,
    subject: 'Matematik',
    context_story: 'Bir kriptografi algoritmasında veriler sayı doğrusundaki mutlak değer uzaklık modelleriyle şifrelenmektedir. Bir A noktasının 4 birim sağındaki ve solundaki sayıların çarpımı şifre anahtarını vermektedir.',
    question_text: 'Sayı doğrusunda x sayısının -3 noktasına olan uzaklığı |x + 3| = 5 olduğuna göre, x in alabileceği değerler kümesini bulunuz ve bu değerlerin toplamını yazınız.',
    max_score: 15,
    rubric_criteria: [
      { points: 5, criteria: 'Mutlak değer tanımına göre x + 3 = 5 veya x + 3 = -5 eşitliklerini yazma.' },
      { points: 5, criteria: 'Kökleri x1 = 2 ve x2 = -8 olarak doğru hesaplama.' },
      { points: 5, criteria: 'Kökler toplamını (2 + (-8) = -6) eksiksiz bulma.' }
    ],
    sample_solutions: [
      '|x + 3| = 5 ise x + 3 = 5 => x = 2 veya x + 3 = -5 => x = -8.',
      'Değerler toplamı: 2 + (-8) = -6 dır.'
    ],
    difficulty_level: 2
  },
  {
    id: 'q-mat-9-1-1-3',
    scenario_id: 'scen-mat-9-1-1',
    curriculum_node_code: 'MAT.9.1.1',
    grade: 9,
    subject: 'Matematik',
    context_story: 'Bir bilgisayar algoritması iki gerçek sayı arasındaki uzaklığı hesaplayarak veri sıkıştırma oranı üretmektedir.',
    question_text: 'A = sqrt(18) ve B = sqrt(50) gerçek sayıları veriliyor. A ve B sayılarını a*sqrt(b) biçiminde yazarak A + B toplamının irrasyonel olup olmadığını işlem basamaklarıyla kanıtlayınız.',
    max_score: 15,
    rubric_criteria: [
      { points: 5, criteria: 'sqrt(18) = 3*sqrt(2) ve sqrt(50) = 5*sqrt(2) dönüşümlerini doğru yapma.' },
      { points: 5, criteria: 'Kök dereceleri ve içleri aynı olduğu için 3*sqrt(2) + 5*sqrt(2) = 8*sqrt(2) toplamını bulma.' },
      { points: 5, criteria: 'sqrt(2) irrasyonel olduğundan 8*sqrt(2) nin de irrasyonel olduğunu belirtme.' }
    ],
    sample_solutions: [
      'sqrt(18) = 3*sqrt(2), sqrt(50) = 5*sqrt(2).',
      'Toplam = 8*sqrt(2) olup irrasyonel bir gerçek sayıdır.'
    ],
    difficulty_level: 3
  },
  {
    id: 'q-mat-9-1-1-4',
    scenario_id: 'scen-mat-9-1-1',
    curriculum_node_code: 'MAT.9.1.2',
    grade: 9,
    subject: 'Matematik',
    context_story: 'Bir kargo dağıtım merkezinde paketler dört basamaklı 4A7B takip kodlarıyla etiketlenmektedir.',
    question_text: '4A7B sayısı hem 5 hem de 9 ile kalansız bölünebilen rakamları farklı bir sayı olduğuna göre, A nın alabileceği değeri işlem adımlarıyla bulunuz.',
    max_score: 15,
    rubric_criteria: [
      { points: 5, criteria: '5 ile bölünebilme kuralına göre B nin 0 veya 5 olabileceğini belirtme; rakamları farklı şartından B = 0 ı seçme.' },
      { points: 5, criteria: '4 + A + 7 + 0 = 11 + A toplamının 9 un katı olması şartını yazma.' },
      { points: 5, criteria: '11 + A = 18 => A = 7 olamayacağını (rakamlar farklı), dolayısıyla çelişkiyi ve çözüm kümesini doğru sonuçlandırma.' }
    ],
    sample_solutions: [
      '5 ile bölünebilmesi için B = 0 veya B = 5 olmalı. Sayıda 7 ve 4 var.',
      'B = 0 için: 4A70 rakamlar toplamı 11+A => A=7 (ancak 7 zaten var, olamaz).',
      'B = 5 için: 4A75 rakamlar toplamı 16+A => A=2. Rakamları farklıdır (4,2,7,5). Cevap: A = 2.'
    ],
    difficulty_level: 3
  },
  {
    id: 'q-mat-9-1-1-5',
    scenario_id: 'scen-mat-9-1-1',
    curriculum_node_code: 'MAT.9.1.2',
    grade: 9,
    subject: 'Matematik',
    context_story: 'Bir metro hattındaki sinyalizasyon lambalarından birincisi 12 dakikada bir, ikincisi 18 dakikada bir yeşil yanmaktadır.',
    question_text: 'Bu iki lamba ilk kez sabah 08.00 de birlikte yeşil yandığına göre, ikinci kez birlikte yeşil yandıkları saati EKOK yöntemini göstererek bulunuz.',
    max_score: 15,
    rubric_criteria: [
      { points: 5, criteria: '12 ve 18 sayılarının asal çarpanlarını ayırma (12 = 2^2 * 3, 18 = 2 * 3^2).' },
      { points: 5, criteria: 'EKOK(12, 18) = 36 dakika olarak doğru hesaplama.' },
      { points: 5, criteria: '08.00 + 36 dakika = 08.36 saatini doğru bulma.' }
    ],
    sample_solutions: [
      'EKOK(12, 18) = 36 dakikadır.',
      'İlk yanış 08.00 olduğuna göre ikinci kez 08.36 da birlikte yanarlar.'
    ],
    difficulty_level: 2
  },
  {
    id: 'q-mat-9-1-1-6',
    scenario_id: 'scen-mat-9-1-1',
    curriculum_node_code: 'MAT.9.2.1',
    grade: 9,
    subject: 'Matematik',
    context_story: 'Bir elektrikli araç şarj istasyonunda batarya doluluk oranı ile geçen süre arasında sabit doğrusal bir ilişki bulunmaktadır. Başlangıçta %20 dolu olan batarya, her 10 dakikalık şarjda %15 dolmaktadır.',
    question_text: 'a) Geçen süre (t dakika) ile batarya doluluk yüzdesi (y) arasındaki doğrusal fonksiyon bağıntısını yazınız.\nb) Bataryanın %80 doluluğa ulaşması için kaç dakika şarj edilmesi gerektiğini bulunuz.',
    max_score: 13,
    rubric_criteria: [
      { points: 6, criteria: 'Değişim oranını 15/10 = 1.5 %/dk olarak belirleyip y = 20 + 1.5t modelini kurma.' },
      { points: 7, criteria: 'y = 80 için 80 = 20 + 1.5t => 60 = 1.5t => t = 40 dakika sonucunu bulma.' }
    ],
    sample_solutions: [
      'y = 20 + 1.5*t',
      '80 = 20 + 1.5t => 1.5t = 60 => t = 40 dakika.'
    ],
    difficulty_level: 3
  },
  {
    id: 'q-mat-9-1-1-7',
    scenario_id: 'scen-mat-9-1-1',
    curriculum_node_code: 'MAT.9.2.1',
    grade: 9,
    subject: 'Matematik',
    context_story: 'Bir dağcılık ekibi tırmanış yaparken her 200 metre yükseklik artışında hava sıcaklığının sabit 1.2 °C düştüğünü gözlemlemiştir. Deniz seviyesinde (0 m) hava sıcaklığı 24 °C dir.',
    question_text: 'Zirvede hava sıcaklığı 6 °C ölçüldüğüne göre, dağın yüksekliğini doğrusal oran-orantı adımlarını göstererek hesaplayınız.',
    max_score: 12,
    rubric_criteria: [
      { points: 6, criteria: 'Toplam sıcaklık düşüşünü: 24 - 6 = 18 °C olarak bulma.' },
      { points: 6, criteria: '1.2 °C düşüş 200 m ise, 18 °C düşüş için (18 / 1.2) * 200 = 15 * 200 = 3000 metre yüksekliği bulma.' }
    ],
    sample_solutions: [
      'Sıcaklık farkı: 24 - 6 = 18 °C.',
      'Yükseklik: (18 / 1.2) * 200 = 15 * 200 = 3000 metredir.'
    ],
    difficulty_level: 3
  },

  // ─── 9. Sınıf Fizik 1. Dönem 1. Yazılı Senaryo 1 (scen-fiz-9-1-1) ───
  {
    id: 'q-fiz-9-1-1-1',
    scenario_id: 'scen-fiz-9-1-1',
    curriculum_node_code: 'FİZ.9.1.1',
    grade: 9,
    subject: 'Fizik',
    context_story: 'Laboratuvarda bir öğrenci deney yaparken kronometre ile süreyi, dinamometre ile kuvveti, ampermetre ile akımı ve dereceli silindir ile hacmi ölçmektedir.',
    question_text: 'Ölçülen bu 4 büyüklükten hangilerinin "temel büyüklük", hangilerinin "türetilmiş büyüklük" olduğunu SI birimleriyle birlikte tablo halinde yazınız.',
    max_score: 20,
    rubric_criteria: [
      { points: 10, criteria: 'Zaman (saniye) ve Akım Şiddeti (amper) nin temel büyüklük olduğunu doğru yazma.' },
      { points: 10, criteria: 'Kuvvet (Newton) ve Hacim (m^3 veya litre) nin türetilmiş büyüklük olduğunu doğru yazma.' }
    ],
    sample_solutions: [
      'Temel Büyüklükler: Zaman (saniye - s), Elektrik Akımı (Amper - A).',
      'Türetilmiş Büyüklükler: Kuvvet (Newton - N), Hacim (Metreküp - m^3).'
    ],
    difficulty_level: 1
  },
  {
    id: 'q-fiz-9-1-1-2',
    scenario_id: 'scen-fiz-9-1-1',
    curriculum_node_code: 'FİZ.9.1.1',
    grade: 9,
    subject: 'Fizik',
    context_story: 'Bir insansız hava aracı (İHA) 120 km/h süratle kuzey yönünde 2 saat uçtuktan sonra doğu yönüne dönerek 80 km/h süratle 1.5 saat uçmuştur.',
    question_text: 'a) İHA nın aldığı toplam yol kaç km dir?\nb) İHA nın yer değiştirmesinin büyüklüğünü pisagor bağıntısını göstererek hesaplayınız.',
    max_score: 20,
    rubric_criteria: [
      { points: 10, criteria: 'Yol 1 = 120*2 = 240 km, Yol 2 = 80*1.5 = 120 km. Toplam yol = 360 km.' },
      { points: 10, criteria: 'Kuzey 240 km ve Doğu 120 km vektörleri diktir. Yer değiştirme = sqrt(240^2 + 120^2) = 120*sqrt(5) km.' }
    ],
    sample_solutions: [
      'Toplam Alınan Yol: 240 + 120 = 360 km.',
      'Yer Değiştirme: sqrt(240^2 + 120^2) = 120*sqrt(5) km ≈ 268.3 km.'
    ],
    difficulty_level: 2
  },
  {
    id: 'q-fiz-9-1-1-3',
    scenario_id: 'scen-fiz-9-1-1',
    curriculum_node_code: 'FİZ.9.2.1',
    grade: 9,
    subject: 'Fizik',
    context_story: 'Sürtünmesiz yatay düzlemde durmakta olan 4 kg kütleli bir koliye F1 = 30 N sağa, F2 = 10 N sola doğru aynı anda uygulanmaktadır.',
    question_text: 'a) Koliye etki eden net kuvveti ve yönünü bulunuz.\nb) Newton un 2. Hareket Yasası (F = m*a) bağıntısını kullanarak kolinin ivmesini hesaplayınız.',
    max_score: 20,
    rubric_criteria: [
      { points: 10, criteria: 'Net Kuvvet F_net = 30 - 10 = 20 N (sağa doğru) olarak bulma.' },
      { points: 10, criteria: 'F_net = m*a => 20 = 4*a => a = 5 m/s^2 olarak ivmeyi hesaplama.' }
    ],
    sample_solutions: [
      'F_net = 30 - 10 = 20 N (Sağa doğru).',
      'a = F_net / m = 20 / 4 = 5 m/s^2.'
    ],
    difficulty_level: 2
  },
  {
    id: 'q-fiz-9-1-1-4',
    scenario_id: 'scen-fiz-9-1-1',
    curriculum_node_code: 'FİZ.9.2.1',
    grade: 9,
    subject: 'Fizik',
    context_story: 'Bir asansör kabini yukarı doğru 2 m/s^2 ivmeyle hızlanırken içerisindeki 60 kg kütleli bir yolcu baskül üzerine çıkmıştır. (g = 10 m/s^2)',
    question_text: 'Baskülün gösterdiği değeri (yolcunun hissettiği etkin ağırlık) serbest cisim diyagramı çizerek açıklayınız.',
    max_score: 20,
    rubric_criteria: [
      { points: 10, criteria: 'Yukarı hızlanırken N - G = m*a denklemini kurma.' },
      { points: 10, criteria: 'N = m(g + a) = 60*(10 + 2) = 720 N değerini doğru hesaplama.' }
    ],
    sample_solutions: [
      'Yukarı hızlanan asansörde N - mg = ma => N = m(g+a).',
      'N = 60 * 12 = 720 Newton gösterir.'
    ],
    difficulty_level: 3
  },
  {
    id: 'q-fiz-9-1-1-5',
    scenario_id: 'scen-fiz-9-1-1',
    curriculum_node_code: 'FİZ.9.2.1',
    grade: 9,
    subject: 'Fizik',
    context_story: 'Eylemsizlik ilkesine göre bir cisme etki eden net kuvvet sıfır ise cisim mevcut hareket durumunu korur.',
    question_text: 'Sabit 90 km/h hızla doğrusal otoyolda ilerleyen bir otobüs aniden frene bastığında ayaktaki yolcuların öne doğru savrulmasının nedenini eylemsizlik ilkesiyle açıklayınız.',
    max_score: 20,
    rubric_criteria: [
      { points: 10, criteria: 'Yolcuların frenden önce otobüsle aynı hıza (90 km/h) sahip olduğunu belirtme.' },
      { points: 10, criteria: 'Fren anında otobüs yavaşlarken yolcuların eylemsizlikleri gereği önceki hareket durumlarını koruma eğiliminde olduklarını ifade etme.' }
    ],
    sample_solutions: [
      'Yolcular 90 km/h hızla ilerlemekteydi. Otobüs fren yaptığında yolculara doğrudan net bir geriye kuvvet etki etmediği için vücutları eylemsizlik ilkesi gereği mevcut hızını korumak ister ve öne doğru hareket eğilimi gösterir.'
    ],
    difficulty_level: 2
  }
];

async function seedQuestions() {
  console.log('📝 MEB Maarif Modeli Açık Uçlu Soruları ve Rubrikleri Yükleniyor...\n');

  let count = 0;
  for (const q of SAMPLE_QUESTIONS) {
    await sql`
      INSERT INTO maarif_open_ended_questions (
        id, scenario_id, curriculum_node_code, grade, subject, context_story,
        question_text, max_score, rubric_criteria, sample_solutions, difficulty_level
      ) VALUES (
        ${q.id}, ${q.scenario_id}, ${q.curriculum_node_code}, ${q.grade}, ${q.subject},
        ${q.context_story}, ${q.question_text}, ${q.max_score},
        ${JSON.stringify(q.rubric_criteria)}, ${JSON.stringify(q.sample_solutions)}, ${q.difficulty_level}
      )
      ON CONFLICT (id) DO UPDATE SET
        context_story = EXCLUDED.context_story,
        question_text = EXCLUDED.question_text,
        max_score = EXCLUDED.max_score,
        rubric_criteria = EXCLUDED.rubric_criteria,
        sample_solutions = EXCLUDED.sample_solutions
    `;
    count++;
  }

  const total = await sql`SELECT COUNT(*) as count FROM maarif_open_ended_questions`;
  console.log(`✅ ${count} soru yüklendi/güncellendi. Toplam havuz: ${total[0].count} açık uçlu soru.`);

  await sql.end();
  process.exit(0);
}

seedQuestions().catch(e => {
  console.error('Hata:', e);
  process.exit(1);
});
