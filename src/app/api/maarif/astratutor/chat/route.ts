import { NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

const MAARIF_HEURISTICS = [
  {
    keywords: ['algoritma', 'akış şeması', 'adım', 'kod', 'döngü'],
    reply: "Türkiye Yüzyılı Maarif Modeli 9. Sınıf Matematik programında algoritma, problemleri sonlu ve mantıksal işlem adımlarına bölme becerisidir. Bir problemi çözerken önce 'Girdi nedir?', 'İşlem nedir?' ve 'Çıktı nedir?' sorularını sormalısın. Sence bu problemin girdi verisi ne?",
    action: { label: 'Algoritmik Matematik Teması', url: '/maarif?tab=dersler&subject=matematik' }
  },
  {
    keywords: ['irrasyonel', 'sayı', 'kök', 'gerçek sayılar', 'rasyonel'],
    reply: "Gerçek sayılar kümesinde irrasyonel sayılar ($$Q'$$), iki tam sayının oranı biçiminde ($$\\frac{a}{b}$$) yazılamayan sayılardır. Örneğin $$\\sqrt{2}$$ veya $$\\pi$$ gibi sayılar virgülden sonra devretmeksizin sonsuza uzanır. Bir sayının irrasyonel olduğunu kanıtlamak için genellikle olmayana ergi (çelişki) yöntemini kullanırız.",
    action: { label: 'Sayılar Teması Öğrenme Çıktıları', url: '/maarif?tab=dersler&subject=matematik' }
  },
  {
    keywords: ['kuvvet', 'hareket', 'newton', 'ivme', 'net kuvvet'],
    reply: "9. Sınıf Fizik dersinde kuvvet ve hareket temasında en önemli ilke: Bir cisme etki eden net kuvvet sıfırsa cisim ya durur ya da sabit hızla hareketine devam eder ($$F_{net} = 0$$). Cisme net bir kuvvet uygulanırsa ivmelenir ($$F_{net} = m \\cdot a$$). Bunu PhET simülatöründe denemek ister misin?",
    action: { label: 'Kuvvet & Hareket PhET Simülasyonu', url: '/simulasyonlar/kuvvet-ve-hareket' }
  },
  {
    keywords: ['atom', 'molekül', 'dalton', 'thomson', 'rutherford', 'bohr'],
    reply: "Kimya temasında atom modellerinin tarihsel gelişimi bir düşünce serüvenidir. Bilim insanları yeni deneysel kanıtlar buldukça eski modelleri revize etmiştir. Dalton'un içi dolu küresinden Bohr'un yörüngeli modeline ve kuantum bulut modeline geçişi kavraman çok önemlidir.",
    action: { label: 'Atom Oluştur PhET Simülasyonu', url: '/simulasyonlar/atom-olustur' }
  },
  {
    keywords: ['hücre', 'zar', 'osmoz', 'difüzyon', 'organel'],
    reply: "Biyoloji temasında hücre zarı seçici geçirgen bir canlı bariyerdir. Madde geçişlerinde enerji harcanıp harcanmadığı (pasif taşıma vs aktif taşıma) ve derişim gradyanı (yoğundan az yoğuna) anahtar kavramlardır. Çözeltinin hipertonik mi yoksa hipotonik mi olduğunu incelemelisin.",
    action: { label: 'Hücre Zarı PhET Simülasyonu', url: '/simulasyonlar/hucre-zari' }
  },
  {
    keywords: ['yazılı', 'sınav', 'senaryo', 'rubrik', 'puan'],
    reply: "MEB Maarif Modelinde ortak yazılılar test usulü değil, açık uçlu ve dereceli puanlama anahtarı (rubrik) ile değerlendirilir! Bu yüzden yalnızca sonuca değil, çözüm adımlarına, kavramsal açıklamalara ve birimlere de puan verilir. Senaryo provalarını çözerek puan anahtarlarını inceleyebilirsin.",
    action: { label: 'MEB Yazılı Senaryoları', url: '/maarif?tab=senaryolar' }
  }
];

export async function POST(req: Request) {
  try {
    const userId = (await getAuthenticatedUserId(req)) || 'anonymous_student';
    const body = await req.json();
    const { message = '', grade = 9, subject = 'Genel' } = body;

    const trimmed = message.trim();
    if (!trimmed) {
      return NextResponse.json({
        reply: "Merhaba! Ben Türkiye Yüzyılı Maarif Modeli öğrenme mentorunum. Yeni müfredat derslerin, açık uçlu MEB ortak yazılı provaların veya PhET deneylerinle ilgili aklına takılan her şeyi sorabilirsin. Birlikte adım adım keşfedelim!",
        actions: [
          { label: '📝 MEB Yazılı Senaryoları', url: '/maarif?tab=senaryolar' },
          { label: '🔬 PhET Bilim Deneyleri', url: '/maarif?tab=phet' },
        ],
        provider: 'local-intro',
      });
    }

    const lower = trimmed.toLowerCase();

    // 1. Heuristik Hızlı Eşleşme
    const matched = MAARIF_HEURISTICS.find(h => h.keywords.some(k => lower.includes(k)));
    
    // 2. Gemini Yapay Zeka Yanıtı
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const systemPrompt = `
Sen "Türkiye Yüzyılı Maarif Modeli" kapsamında eğitim gören ${grade}. sınıf öğrencileri için özel olarak geliştirilmiş Sokratik Yapay Zeka Öğrenme Mentorusun (AstraTutor Maarif).

TEMEL İLKELERİN VE KURALLARIN:
1. ASLA ve KESİNLİKLE geleneksel YKS, TYT, AYT, test şıkları, eleme taktikleri veya net hesaplama terimleri KULLANMA.
2. MEB Maarif Modeli'nin süreç odaklı, beceri temelli, erdem-değer-eylem ve derinlemesine anlama felsefesine sadık kal.
3. Sorunun doğrudan cevabını hazır olarak vermek yerine Sokratik Yöntem uygula: Öğrenciye rehberlik eden, adım adım düşündüren, kavram yanılgısını fark ettiren yönlendirici sorular sor.
4. Gerektiğinde matematiksel formülleri KaTeX formatında ($ veya $$) ifade et.
5. Öğrenciyi merak etmeye, bilimsel gözlem yapmaya ve araştırmaya teşvik et.
6. Yanıtını sıcak, cesaretlendirici, Türkçe kurallarına uygun ve 3-4 paragrafı geçmeyecek şekilde öz tut.
`;

      const prompt = `${systemPrompt}\n\nÖğrenci Sınıfı: ${grade}. Sınıf\nİlgili Ders: ${subject}\nÖğrencinin Sorusu / Mesajı: "${trimmed}"`;

      const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.0-flash-lite'];
      for (const model of models) {
        try {
          const apiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: 0.6,
                  maxOutputTokens: 1024,
                },
              }),
            }
          );

          if (apiRes.ok) {
            const resJson = await apiRes.json();
            const candidate = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidate) {
              const actions = [];
              if (matched?.action) {
                actions.push(matched.action);
              } else {
                actions.push({ label: '📝 Yazılı Senaryoları', url: '/maarif?tab=senaryolar' });
                actions.push({ label: '🔬 PhET Simülasyonları', url: '/maarif?tab=phet' });
              }

              return NextResponse.json({
                reply: candidate,
                actions,
                provider: model,
              });
            }
          }
        } catch (mErr) {
          console.warn(`AstraTutor Maarif model ${model} error:`, mErr);
        }
      }
    }

    // 3. Yerel Güvenli Yedek
    if (matched) {
      return NextResponse.json({
        reply: matched.reply,
        actions: matched.action ? [matched.action] : [],
        provider: 'heuristic-maarif',
      });
    }

    return NextResponse.json({
      reply: `Harika bir soru! Maarif Modeli yaklaşımında bu konuyu adım adım ele alalım. Öncelikle problemde sana verilen bilinenleri ve senden istenen temel çıktıyı belirleyelim. Bu soruda elindeki ilk veri sence nedir ve bunu hangi kavramsal bağıntıyla ilişkilendirebilirsin?`,
      actions: [
        { label: '📝 MEB Yazılı Senaryoları', url: '/maarif?tab=senaryolar' },
        { label: '📂 Maarif Temaları', url: '/maarif?tab=dersler' }
      ],
      provider: 'local-fallback',
    });

  } catch (error: any) {
    console.error('AstraTutor Maarif Chat Route Error:', error);
    return NextResponse.json({
      reply: 'Maarif mentoruna bağlanırken geçici bir aksaklık oluştu. Sorunu biraz daha detaylandırabilir misin?',
      actions: [],
      provider: 'error-fallback',
    }, { status: 200 });
  }
}
