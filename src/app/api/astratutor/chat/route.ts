import { NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { getStudentMemory, generateHyperPersonalizedResponse } from '@/lib/ai/studentMemoryEngine';

export const dynamic = 'force-dynamic';

// Subject & formula specific heuristics (KaTeX enabled)
const SUBJECT_KNOWLEDGE: { keywords: string[]; title: string; reply: string; action?: { label: string; url: string } }[] = [
  {
    keywords: ['türev', 'turev', 'teğet', 'eğim', 'maksimum', 'minimum', 'ekstremum'],
    title: 'Matematik: Türev',
    reply: "Türev geometrik olarak bir fonksiyonun teğetinin eğimidir ($$f'(x) = m$$). Maksimum veya minimum değer istendiğinde birinci türevi sıfıra eşitlemelisin ($$f'(x) = 0$$). Fonksiyonun artan/azalan olduğu aralıklar için de türevin işaret tablosunu incelemeyi unutma!",
    action: { label: 'Türev Simülasyonunu Aç', url: '/simulasyonlar/turev' }
  },
  {
    keywords: ['integral', 'alan', 'hacim', 'belirli integral', 'riemann'],
    title: 'Matematik: İntegral',
    reply: "İntegral, bir eğrinin altında kalan net alanı hesaplar: $$\\int_{a}^{b} f(x) dx$$. Değişken değiştirme yönteminde ($$u = g(x)$$, $$du = g'(x)dx$$) sınırları da yeni değişkene ($$u$$) göre dönüştürmeyi sakın unutma!",
    action: { label: 'Riemann Simülasyonu', url: '/simulasyonlar/riemann' }
  },
  {
    keywords: ['limit', 'süreklilik', 'l\'hopital', 'belirsizlik', '0/0'],
    title: 'Matematik: Limit',
    reply: "Limit sorularında ilk adım her zaman değeri yerine yazmaktır! Eğer $$\\frac{0}{0}$$ belirsizliği çıkarsa iki yolun var: Ya pay ve paydayı çarpanlarına ayırıp sadeleştir ya da L'Hôpital kuralı uygulayarak payın ve paydanın ayrı ayrı türevini al.",
    action: { label: 'Limit Simülasyonu', url: '/simulasyonlar/limit' }
  },
  {
    keywords: ['trigonometri', 'sinüs', 'kosinüs', 'tanjant', 'birim çember', 'periyot'],
    title: 'Matematik: Trigonometri',
    reply: "Trigonometrinin kalbi birim çemberdir ($$\\sin^2(x) + \\cos^2(x) = 1$$). Dönüşüm formüllerinde açının hangi bölgeye düştüğüne ve o bölgede fonksiyonun işaretine (+/-) dikkat et!",
    action: { label: 'Birim Çember Simülasyonu', url: '/simulasyonlar/birim-cember' }
  },
  {
    keywords: ['optik', 'kırılma', 'yansıma', 'mercek', 'ayna', 'snell'],
    title: 'Fizik: Optik',
    reply: "Işığın kırılmasında Snell Yasası geçerlidir: $$n_1 \\cdot \\sin(\\theta_1) = n_2 \\cdot \\sin(\\theta_2)$$. Çok yoğun ortamdan az yoğun ortama geçerken ışık normalden uzaklaşır, sınır açısını aştığında ise tam yansıma yapar.",
    action: { label: 'Optik Simülasyonu', url: '/simulasyonlar/optik' }
  },
  {
    keywords: ['vektör', 'kuvvet', 'bileşke', 'denge', 'tork'],
    title: 'Fizik: Vektörler',
    reply: "Vektörlerde yön ve doğrultu esastır! İki boyutlu problemlerde bileşenlere ayırma yöntemini ($$F_x = F \\cdot \\cos(\\alpha)$$, $$F_y = F \\cdot \\sin(\\alpha)$$) kullanarak sistemi sadeleştirmek her zaman en garantili yoldur.",
    action: { label: 'Vektörler Simülasyonu', url: '/simulasyonlar/vektorler' }
  },
  {
    keywords: ['ideal gaz', 'gazlar', 'basınç', 'mol', 'kelvin'],
    title: 'Kimya: Gazlar',
    reply: "Kimyada gaz hesaplamalarının temel formülü: $$P \\cdot V = n \\cdot R \\cdot T$$. Sıcaklığı mutlaka Kelvin cinsine ($$T = t(^\\circ C) + 273$$) çevirmelisin. Hacim sabitken sıcaklık arttıkça basıncın da doğru orantılı arttığını unutma.",
    action: { label: 'İdeal Gaz Simülasyonu', url: '/simulasyonlar/ideal-gaz' }
  },
  {
    keywords: ['pil', 'elektrokimya', 'anot', 'katot', 'yükseltgenme', 'indirgenme'],
    title: 'Kimya: Piller',
    reply: "Kimyasal pillerde 'KİMYA' şifresini hatırla: Katotta İndirgenme, Anotta Yükseltgenme gerçekleşir ($$E_{pil} = E_{katot} - E_{anot}$$). Elektronlar dış devrede daima anottan katota doğru akar.",
    action: { label: 'Piller Simülasyonu', url: '/simulasyonlar/piller' }
  }
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawMessage = (body.message || body.content || '').trim();

    if (!rawMessage) {
      return NextResponse.json({ error: 'Mesaj metni zorunludur.' }, { status: 400 });
    }

    const lower = rawMessage.toLowerCase();

    // 1. Fetch authenticated student profile memory
    const userId = await getAuthenticatedUserId(req);
    const memory = userId ? await getStudentMemory(userId) : null;

    // Natural typing delay (400ms - 800ms)
    await new Promise(r => setTimeout(r, 450 + Math.random() * 300));

    // 2. Google Gemini 3.5 Flash Conversational Engine
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
    if (apiKey) {
      try {
        const studentContext = memory
          ? `Öğrenci: ${memory.username}, Alan: ${memory.alan}, Hedef Bölüm: ${memory.targetDepartment || 'Yüksek başarı'}, YKS'ye Kalan Gün: ${memory.daysToYKS}, Zayıf Konular: ${memory.topWeakTopics?.map(t => `${t.subject} (${t.topic})`).join(', ') || 'Belirtilmemiş'}, Son Deneme Ortalaması: ${memory.recentMockAverage || 'Henüz veri yok'}`
          : 'Giriş yapmamış öğrenci';

        const prompt = `Sen Türkiye YKS (TYT ve AYT) sınavına hazırlanan öğrenciler için samimi, cesaretlendirici, pedagojik ve alanında son derece bilgili bir Yapay Zeka Özel Ders Öğretmeni ve Eğitim Koçusun (Adın: AstraTutor).

ÖĞRENCİ BAĞLAMI:
${studentContext}

ÖĞRENCİNİN MESAJI:
"${rawMessage}"

GÖREVLERİN:
1. Öğrencinin sorusuna doğrudan, samimi, anlaşılır ve eğitici bir dille yanıt ver.
2. Matematik veya fen formülleri varsa bunları mutlaka KaTeX ($ veya $$) formatında yaz.
3. Asla kuru veya robotik konuşma; öğrenciyi cesaretlendir, çalışma hevesini artır.
4. Yanıtın sonuna öğrencinin aksiyon alabileceği motive edici 1 cümle ekle.`;

        const models = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
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
                    temperature: 0.35,
                    maxOutputTokens: 1024,
                  }
                })
              }
            );

            if (apiRes.ok) {
              const resJson = await apiRes.json();
              const candidate = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
              if (candidate) {
                // Determine relevant action chips
                const actions: Array<{ label: string; url: string }> = [];
                if (lower.includes('soru') || lower.includes('deneme')) {
                  actions.push({ label: '📝 Soru Çöz', url: '/soru-coz' });
                }
                if (lower.includes('hata') || lower.includes('yanlış')) {
                  actions.push({ label: '❌ Hata Defterim', url: '/hata-defteri' });
                }
                if (lower.includes('odak') || lower.includes('pomodoro') || lower.includes('çalış')) {
                  actions.push({ label: '🍅 Pomodoro Başlat', url: '/pomodoro' });
                }
                if (lower.includes('program') || lower.includes('plan')) {
                  actions.push({ label: '📅 Çalışma Programım', url: '/program' });
                }
                if (actions.length === 0) {
                  actions.push({ label: '📝 Soru Çöz', url: '/soru-coz' });
                  actions.push({ label: '🍅 Odaklanma Başlat', url: '/pomodoro' });
                }

                return NextResponse.json({
                  reply: candidate,
                  actions,
                  provider: model
                });
              }
            }
          } catch (modelErr) {
            console.warn(`AstraTutor chat model ${model} failed:`, modelErr);
          }
        }
      } catch (geminiErr) {
        console.warn('AstraTutor Gemini chat failed, using local template engine:', geminiErr);
      }
    }

    // 3. Fallback: Check for specific formula/scientific inquiries
    for (const item of SUBJECT_KNOWLEDGE) {
      if (item.keywords.some(k => lower.includes(k))) {
        return NextResponse.json({
          reply: item.reply,
          actions: item.action ? [item.action, { label: '📝 Soru Çöz', url: '/soru-coz' }] : undefined
        });
      }
    }

    // 4. Fallback: Generate hyper-personalized response with full database context
    const personalized = generateHyperPersonalizedResponse(memory, rawMessage);

    return NextResponse.json({
      reply: personalized.reply,
      actions: personalized.actions
    });

  } catch (error: any) {
    console.error('AstraTutor API Error:', error);
    return NextResponse.json({ 
      reply: "Şu an bağlantıda ufak bir gecikme oldu. Ancak hedeflerinden asla şaşma! Sorunu tekrar iletebilir misin?" 
    }, { status: 200 });
  }
}
