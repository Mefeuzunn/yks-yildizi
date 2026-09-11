import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const limitResult = rateLimit(`astratutor_${ip}`, 15, 60 * 1000);
    if (!limitResult.success) {
      return NextResponse.json({ error: 'Çok fazla mesaj gönderdin. Lütfen biraz bekle.' }, { status: 429 });
    }

    const body = await req.json();
    const { questionContext, messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Geçersiz mesaj formatı.' }, { status: 400 });
    }

    const lastUserMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
    
    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    let reply = '';

    // Advanced Local Heuristics Engine (No API Key Required)
    const heuristics = [
      {
        keywords: ['limit', 'süreklilik', 'belirsizlik', 'l\'hopital'],
        response: "Bu bir limit sorusuna benziyor! Eğer belirsizlik (örn: $$\\frac{0}{0}$$) varsa L'Hôpital kuralını uygulamayı veya çarpanlarına ayırmayı denedin mi? Sence ilk adım ne olmalı?"
      },
      {
        keywords: ['türev', 'teğet', 'eğim', 'maksimum', 'minimum'],
        response: "Türev her zaman o noktadaki teğetin eğimini verir ($$f'(x) = m$$). Maksimum veya minimum değer isteniyorsa birinci türevi sıfıra eşitlemeyi ($$f'(x) = 0$$) düşündün mü?"
      },
      {
        keywords: ['integral', 'alan', 'hacim', 'belirli integral'],
        response: "İntegral genellikle eğri altında kalan alanı ifade eder: $$\\int_{a}^{b} f(x) dx$$. Verilen sınırları (a ve b) şekil üzerinden okuyabiliyor musun?"
      },
      {
        keywords: ['kuvvet', 'ivme', 'sürtünme', 'dinamik', 'newton'],
        response: "Newton'un hareket yasaları iş başında! Temel formülümüz $$F_{net} = m \\cdot a$$. Sistemdeki net kuvveti bulmak için sürtünme kuvvetini ($$f_s = \\mu \\cdot N$$) hesapladın mı?"
      },
      {
        keywords: ['enerji', 'kinetik', 'potansiyel', 'korunum'],
        response: "Enerjinin korunumu yasasını hatırlayalım: İlk enerji daima son enerjiye eşittir ($$E_{ilk} = E_{son}$$). Ortamda sürtünme yoksa mekanik enerji korunur, sürtünme varsa iş-enerji teoremini ($$W = \\Delta E$$) kullanabilir misin?"
      },
      {
        keywords: ['mol', 'avogadro', 'gaz', 'basınç', 'hacim', 'ideal gaz'],
        response: "Kimya hesaplamalarında İdeal Gaz Denklemi çok işimize yarar: $$P \\cdot V = n \\cdot R \\cdot T$$. Soruda verilen değerleri Kelvin cinsine (T = °C + 273) çevirmeyi unuttun mu?"
      },
      {
        keywords: ['fotosentez', 'solunum', 'mitokondri', 'kloroplast', 'atp'],
        response: "Biyoloji sorusu! Fotosentez için ışık enerjisinin kimyasal bağ enerjisine ($$ATP$$) dönüştüğünü hatırlayalım. Reaksiyona girenler ($$CO_2 + H_2O$$) ile çıkanları eşleştirebildin mi?"
      },
      {
        keywords: ['anlamadım', 'nasıl', 'yapamadım', 'çözüm', 'yardım'],
        response: "Hiç sorun değil, birlikte adım adım çözelim! Soruda sana verilen en belirgin değişken veya değer hangisi? Onu bana yazarsan formülü birlikte kurabiliriz."
      },
      {
        keywords: ['cevap ne', 'şık', 'a mı', 'b mi', 'c mi', 'd mi', 'e mi'],
        response: "Sana doğrudan cevabı vermek yerine, balık tutmayı öğretmek istiyorum! 😉 Çözüme ulaşman için sana ilk ipucunu vereyim: Verilen sorunun ana konusu (örneğin hareket, üçgenler) sence nedir?"
      }
    ];

    for (const rule of heuristics) {
      if (rule.keywords.some(kw => lastUserMessage.includes(kw))) {
        reply = rule.response;
        break;
      }
    }

    if (!reply) {
      // Fallback
      if (lastUserMessage.length > 50) {
        // If the user uploaded a long OCR text
        reply = "Gönderdiğin sorunun metnini okudum (OCR). Bu soruyu çözmek için, öncelikle hangi formülü veya kuralı kullanacağımıza karar verelim. Sen bu soruyu okuduğunda aklına ilk gelen çözüm yöntemi nedir?";
      } else {
        reply = "Anladım. İstersen sorunun fotoğrafını yükleyebilirsin (kamera ikonuna tıklayarak). Böylece metni okuyup sana daha iyi rehberlik edebilirim!";
      }
    }

    return NextResponse.json({
      success: true,
      reply
    }, { status: 200 });

  } catch (error) {
    console.error('AstraTutor API Error:', error);
    return NextResponse.json({ error: 'AstraTutor yanıt veremiyor.' }, { status: 500 });
  }
}
