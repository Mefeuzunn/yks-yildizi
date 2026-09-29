import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { generateCounselorResponse } from '@/lib/ai/nlpEngine';

export const dynamic = 'force-dynamic';

// Subject & formula specific heuristics
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

    // 1. Get authenticated user context if logged in
    const userId = await getAuthenticatedUserId(req);
    let userContext: any = null;
    let weakTopics: any[] = [];
    let userStats: any = null;

    if (userId) {
      try {
        const u = await db.prepare('SELECT id, username, alan, sinif FROM users WHERE id = ?').get(userId) as any;
        if (u) {
          userContext = u;
          // Top 3 error topics
          weakTopics = await db.prepare(`
            SELECT subject, topic, COUNT(*) as cnt 
            FROM error_log 
            WHERE user_id = ? 
            GROUP BY subject, topic 
            ORDER BY cnt DESC 
            LIMIT 3
          `).all(userId) as any[];

          userStats = await db.prepare(`
            SELECT solved_questions, streak_days, league, league_points 
            FROM user_stats 
            WHERE user_id = ?
          `).get(userId) as any;
        }
      } catch (err) {
        console.error('Error fetching user context for AstraTutor:', err);
      }
    }

    // Natural typing delay (500ms - 900ms)
    await new Promise(r => setTimeout(r, 600 + Math.random() * 300));

    // 2. Check if student is asking about their own weaknesses, mistakes or stats
    if (lower.includes('eksiğim') || lower.includes('eksiklerim') || lower.includes('zayıf') || lower.includes('yanlışlarım') || lower.includes('durumum') || lower.includes('hata')) {
      if (userContext && weakTopics.length > 0) {
        const listStr = weakTopics.map((w, idx) => `${idx + 1}. ${w.subject} - ${w.topic} (${w.cnt} hata)`).join('\n');
        const reply = `Merhaba ${userContext.username}! Veritabanındaki soru çözüm geçmişine baktığımda, özellikle şu konularda tekrar yapman gerektiğini görüyorum:\n\n${listStr}\n\nBu konuları Hata Defteri'nden tekrar çözmeni ve üzerine odaklanma seansı başlatmanı öneririm.`;
        return NextResponse.json({
          reply,
          actions: [
            { label: '❌ Yanlışlarımı İncele', url: '/dashboard?tab=mistakes' },
            { label: '🍅 Odaklanma Başlat', url: '/dashboard?tab=focus' }
          ]
        });
      }
    }

    // 3. Check for specific subject / formula inquiries
    for (const item of SUBJECT_KNOWLEDGE) {
      if (item.keywords.some(k => lower.includes(k))) {
        return NextResponse.json({
          reply: item.reply,
          actions: item.action ? [item.action, { label: '📝 Soru Çöz', url: '/soru-coz' }] : undefined
        });
      }
    }

    // 4. Use advanced NLP Engine for guidance, motivation, net analysis, exam anxiety
    const nlpResponse = generateCounselorResponse([{ role: 'user', content: rawMessage }]);
    let replyText = nlpResponse.text;

    // Personalize with username if available
    if (userContext?.username && (replyText.startsWith('Merhaba') || replyText.startsWith('Selam'))) {
      replyText = replyText.replace(/^(Merhaba|Selam)!?/, `$1 ${userContext.username}!`);
    }

    // Dynamic actions based on NLP intent
    const actions: { label: string; url: string }[] = nlpResponse.actions || [];
    if (lower.includes('deneme') || lower.includes('net')) {
      if (!actions.some(a => a.url === '/denemeler')) {
        actions.unshift({ label: '📈 Denemelerime Git', url: '/denemeler' });
      }
    } else if (lower.includes('odak') || lower.includes('pomodoro') || lower.includes('dikkat')) {
      if (!actions.some(a => a.url.includes('focus'))) {
        actions.unshift({ label: '🍅 Odaklanmayı Başlat', url: '/dashboard?tab=focus' });
      }
    }

    return NextResponse.json({
      reply: replyText,
      actions: actions.length > 0 ? actions : undefined,
      report: nlpResponse.report
    });

  } catch (error: any) {
    console.error('AstraTutor API Error:', error);
    return NextResponse.json({ 
      reply: "Şu an bağlantıda ufak bir gecikme oldu. Ancak hedeflerinden asla şaşma! Sorunu tekrar iletebilir misin?" 
    }, { status: 200 });
  }
}
