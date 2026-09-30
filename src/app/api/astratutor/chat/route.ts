import { NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { getStudentMemory, generateHyperPersonalizedResponse } from '@/lib/ai/studentMemoryEngine';
import { 
  getCachedAiResponse, 
  setCachedAiResponse, 
  isLocalHandledPrompt, 
  checkAiRateLimit, 
  hashString 
} from '@/lib/ai/aiQuotaOptimizer';

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
    const mode = body.mode === 'rehberlik' ? 'rehberlik' : 'ders';

    if (!rawMessage) {
      return NextResponse.json({ error: 'Mesaj metni zorunludur.' }, { status: 400 });
    }

    const lower = rawMessage.toLowerCase();
    // 1. Fetch authenticated student profile memory
    let userId: string | null = null;
    let memory: any = null;
    try {
      userId = await getAuthenticatedUserId(req);
      if (userId) {
        memory = await getStudentMemory(userId);
      }
    } catch (authErr) {
      console.warn('Non-fatal auth/memory error in AstraTutor chat:', authErr);
    }
    const userIdentifier = userId || req.headers.get('x-forwarded-for') || 'guest';

    // ── KOTA TASARRUF KATMANI 1: Yerel Karar Kapısı (0 Token Harcama) ──
    // Selamlaşma, teşekkür, hızlı öneri çipleri veya sabit formülleri Gemini'ye göndermeden yerel çöz
    if (isLocalHandledPrompt(rawMessage)) {
      const localResponse = generateHyperPersonalizedResponse(memory, rawMessage);
      return NextResponse.json({
        reply: localResponse.reply,
        actions: localResponse.actions,
        provider: 'local-gatekeeper'
      });
    }

    // Doğrudan formül / kural sorguları (0 Token Harcama)
    for (const item of SUBJECT_KNOWLEDGE) {
      if (item.keywords.some(k => lower.includes(k))) {
        return NextResponse.json({
          reply: item.reply,
          actions: item.action ? [item.action, { label: '📝 Soru Çöz', url: '/soru-coz' }] : undefined,
          provider: 'local-knowledge-base'
        });
      }
    }

    // ── KOTA TASARRUF KATMANI 2: Akıllı Önbellek (Cache Hit = 0 Token) ──
    const cacheKey = `chat_${mode}_${hashString(rawMessage)}`;
    const cachedResponse = await getCachedAiResponse(cacheKey);
    if (cachedResponse) {
      return NextResponse.json({
        ...cachedResponse,
        provider: 'ai-cache'
      });
    }

    // ── KOTA TASARRUF KATMANI 3: Kullanıcı Başına Adil Limit Kontrolü ──
    const rateLimitCheck = checkAiRateLimit(userIdentifier, 'chat');
    if (!rateLimitCheck.allowed) {
      // Kotayı aşmışsa veya cooldown'daysa bile sistemi kilitleme, yerel motorla cevapla
      const fallback = generateHyperPersonalizedResponse(memory, rawMessage);
      return NextResponse.json({
        reply: `${fallback.reply}\n\n*(Not: ${rateLimitCheck.reason || 'Hızlı istek sınırına ulaşıldı, yanıt yerel koçluk motoruyla üretildi.'})*`,
        actions: fallback.actions,
        provider: 'local-rate-fallback'
      });
    }

    // ── KOTA TASARRUF KATMANI 4: Optimize Edilmiş Gemini 3.5 Flash Çağrısı ──
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
    if (apiKey) {
      try {
        const studentContext = memory
          ? `Öğrenci: ${memory.username}, Alan: ${memory.alan}, Hedef: ${memory.targetDepartment || 'Yüksek başarı'}, Kalan Gün: ${memory.daysToYKS}`
          : 'YKS Öğrencisi';

        const prompt = mode === 'rehberlik'
          ? `Sen Türkiye YKS (TYT ve AYT) sınavına hazırlanan öğrenciler için son derece anlayışlı, empati kurabilen, pedagojik ve bilimsel yöntemlerle rehberlik eden bir Uzman Psikolojik Danışman ve YKS Rehberlik Koçusun (Astra Rehberlik).
Öğrenci: ${studentContext}
Öğrencinin Durumu / Sorusu: "${rawMessage}"

GÖREVLERİN:
1. Öğrencinin sınav kaygısını, stresini, motivasyon düşüklüğünü veya strateji arayışını içtenlikle anla ve sakinleştirici, motive edici, uygulanabilir adımlar sun.
2. Somut ve net çalışma taktikleri (zaman yönetimi, mola stratejileri, odaklanma teknikleri) öner.
3. Yanıtın sonuna öğrenciyi harekete geçirecek ilham verici 1 cümle ekle.`
          : `Sen Türkiye YKS (TYT ve AYT) sınavına hazırlanan öğrenciler için samimi, cesaretlendirici ve alanında uzman bir Yapay Zeka Özel Ders Öğretmenisin (AstraTutor).
Öğrenci: ${studentContext}
Öğrenci Sorusu: "${rawMessage}"

Gerektiğinde matematik veya fen formüllerini KaTeX ($ veya $$) formatında yaz.
Öğrenciyi motive eden, anlaşılır ve eğitici bir dille kısa ve öz yanıt ver.`;

        // Start with lighter model (gemini-3.5-flash-lite) for maximum quota savings, then 3.5-flash, 3.8-flash, flash-latest
        const models = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest'];
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
                    temperature: 0.3,
                    maxOutputTokens: 550, // Sıkı tavan: gereksiz uzun token tüketimini engeller
                  }
                })
              }
            );

            if (!apiRes.ok) {
              const errBody = await apiRes.text().catch(() => '');
              console.warn(`AstraTutor Gemini model ${model} HTTP ${apiRes.status}:`, errBody.slice(0, 300));
            }
            if (apiRes.ok) {
              const resJson = await apiRes.json();
              const candidate = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
              if (candidate) {
                const actions: Array<{ label: string; url: string }> = [];
                if (mode === 'rehberlik') {
                  actions.push({ label: '🎯 Hedeflerim', url: '/dashboard?tab=hedef' });
                  actions.push({ label: '🍅 Pomodoro / Odak', url: '/dashboard?tab=focus' });
                  actions.push({ label: '📅 Çalışma Programım', url: '/dashboard?tab=schedule' });
                } else {
                  if (lower.includes('soru') || lower.includes('deneme')) {
                    actions.push({ label: '📝 Soru Çöz', url: '/soru-coz' });
                  }
                  if (lower.includes('hata') || lower.includes('yanlış')) {
                    actions.push({ label: '❌ Hata Defterim', url: '/hata-defteri' });
                  }
                  if (lower.includes('odak') || lower.includes('pomodoro') || lower.includes('çalış')) {
                    actions.push({ label: '🍅 Pomodoro Başlat', url: '/dashboard?tab=focus' });
                  }
                  if (actions.length === 0) {
                    actions.push({ label: '📝 Soru Çöz', url: '/soru-coz' });
                    actions.push({ label: '🍅 Odaklanma', url: '/dashboard?tab=focus' });
                  }
                }

                const result = {
                  reply: candidate,
                  actions,
                  provider: model
                };

                // Save to cache for future identical/similar questions (14 days TTL)
                setCachedAiResponse(cacheKey, 'chat', result, 14).catch(() => {});

                return NextResponse.json(result);
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

    // ── KOTA TASARRUF KATMANI 5: Kesintisiz Yerel Yedek ──
    const personalized = generateHyperPersonalizedResponse(memory, rawMessage);
    return NextResponse.json({
      reply: personalized.reply,
      actions: personalized.actions,
      provider: 'local-fallback'
    });

  } catch (error: any) {
    console.error('AstraTutor API Error:', error);
    return NextResponse.json({ 
      reply: "Şu an bağlantıda ufak bir gecikme oldu. Ancak hedeflerinden asla şaşma! Sorunu tekrar iletebilir misin?" 
    }, { status: 200 });
  }
}
