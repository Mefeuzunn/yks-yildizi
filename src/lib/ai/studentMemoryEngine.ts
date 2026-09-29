import db from '@/lib/yks-db-async';
import { generateCounselorResponse } from '@/lib/ai/nlpEngine';
import { DEPARTMENT_NETS } from '@/app/api/user/target/route';

export interface StudentMemory {
  username: string;
  alan: string;
  sinif: string;
  targetUniversity: string | null;
  targetDepartment: string | null;
  daysToYKS: number;
  recentExams: {
    type: string;
    totalNet: number;
    turkishNet: number;
    mathNet: number;
    socialNet: number;
    scienceNet: number;
    date: string;
  }[];
  avgTytNet: number;
  avgAytNet: number;
  netTrend: 'artışta' | 'düşüşte' | 'dengeli' | 'veri_yok';
  weakTopics: { subject: string; topic: string; errorCount: number }[];
  weeklyFocusMinutes: number;
  solvedQuestions: number;
  streakDays: number;
  league: string;
  leaguePoints: number;
}

// 2026 YKS Tarihi (20 Haziran 2026)
const YKS_2026_DATE = new Date('2026-06-20T10:15:00+03:00');

export function calculateDaysToYKS(): number {
  const now = new Date();
  const diffTime = YKS_2026_DATE.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

export async function getStudentMemory(userId: string): Promise<StudentMemory | null> {
  try {
    const user = await db.prepare(
      'SELECT username, alan, sinif, target_university, target_department FROM users WHERE id = ?'
    ).get(userId) as any;

    if (!user) return null;

    // 1. Son denemeler (Son 5)
    const exams = await db.prepare(
      'SELECT exam_type, total_net, turkish_net, math_net, social_net, science_net, exam_date FROM mock_exams WHERE user_id = ? ORDER BY exam_date DESC LIMIT 5'
    ).all(userId) as any[];

    const mappedExams = exams.map(e => ({
      type: e.exam_type || 'TYT',
      totalNet: Number(e.total_net) || 0,
      turkishNet: Number(e.turkish_net) || 0,
      mathNet: Number(e.math_net) || 0,
      socialNet: Number(e.social_net) || 0,
      scienceNet: Number(e.science_net) || 0,
      date: e.exam_date ? new Date(e.exam_date).toISOString().split('T')[0] : ''
    }));

    const tytExams = mappedExams.filter(e => e.type === 'TYT');
    const aytExams = mappedExams.filter(e => e.type === 'AYT');

    const avgTytNet = tytExams.length > 0 
      ? Number((tytExams.reduce((s, e) => s + e.totalNet, 0) / tytExams.length).toFixed(1))
      : 0;

    const avgAytNet = aytExams.length > 0 
      ? Number((aytExams.reduce((s, e) => s + e.totalNet, 0) / aytExams.length).toFixed(1))
      : 0;

    let netTrend: 'artışta' | 'düşüşte' | 'dengeli' | 'veri_yok' = 'veri_yok';
    if (mappedExams.length >= 2) {
      const latest = mappedExams[0].totalNet;
      const previous = mappedExams[1].totalNet;
      if (latest - previous >= 2) netTrend = 'artışta';
      else if (previous - latest >= 2) netTrend = 'düşüşte';
      else netTrend = 'dengeli';
    }

    // 2. Hata Defteri (Top 5 zayıf konu)
    const errors = await db.prepare(`
      SELECT subject, topic, COUNT(*) as cnt 
      FROM error_log 
      WHERE user_id = ? 
      GROUP BY subject, topic 
      ORDER BY cnt DESC 
      LIMIT 5
    `).all(userId) as any[];

    const weakTopics = errors.map(e => ({
      subject: e.subject || 'Genel',
      topic: e.topic || 'Genel',
      errorCount: Number(e.cnt) || 0
    }));

    // 3. Haftalık Odaklanma
    const focusData = await db.prepare(`
      SELECT COALESCE(SUM(duration_min), 0) as total_min 
      FROM focus_sessions 
      WHERE user_id = ? AND created_at >= NOW() - INTERVAL '7 days'
    `).get(userId) as any;

    const weeklyFocusMinutes = Number(focusData?.total_min) || 0;

    // 4. İstatistikler
    const stats = await db.prepare(
      'SELECT solved_questions, streak_days, league, league_points FROM user_stats WHERE user_id = ?'
    ).get(userId) as any;

    return {
      username: user.username || 'Öğrenci',
      alan: user.alan || 'Sayısal',
      sinif: user.sinif || '12. Sınıf',
      targetUniversity: user.target_university || null,
      targetDepartment: user.target_department || null,
      daysToYKS: calculateDaysToYKS(),
      recentExams: mappedExams,
      avgTytNet,
      avgAytNet,
      netTrend,
      weakTopics,
      weeklyFocusMinutes,
      solvedQuestions: Number(stats?.solved_questions) || 0,
      streakDays: Number(stats?.streak_days) || 0,
      league: stats?.league || 'Bronz',
      leaguePoints: Number(stats?.league_points) || 0
    };
  } catch (err) {
    console.error('getStudentMemory error:', err);
    return null;
  }
}

export function generateHyperPersonalizedResponse(
  memory: StudentMemory | null,
  rawMessage: string
): { reply: string; actions?: { label: string; url: string }[] } {
  const lower = rawMessage.toLowerCase();

  // Öğrenci verisi yoksa veya anonimse genel koçluk üret
  if (!memory) {
    const fallbackNlp = generateCounselorResponse([{ role: 'user', content: rawMessage }]);
    return { reply: fallbackNlp.text, actions: fallbackNlp.actions };
  }

  const {
    username, alan, targetUniversity, targetDepartment, daysToYKS,
    avgTytNet, avgAytNet, netTrend, weakTopics, weeklyFocusMinutes, streakDays
  } = memory;

  const targetStr = (targetUniversity && targetDepartment) 
    ? `${targetUniversity} ${targetDepartment}` 
    : 'Hedef Üniversite';

  // 1. REÇETE / BUGÜN NE YAPMALIYIM?
  if (
    lower.includes('reçete') || 
    lower.includes('recete') || 
    lower.includes('bugün ne') || 
    lower.includes('bugun ne') || 
    lower.includes('günlük plan') || 
    lower.includes('bana bir plan') ||
    lower.includes('ne çalışmalıyım') ||
    lower.includes('ne calismaliyim')
  ) {
    const focusHours = (weeklyFocusMinutes / 60).toFixed(1);
    const topWeak1 = weakTopics[0] ? `${weakTopics[0].subject} (${weakTopics[0].topic})` : `${alan} temel konu tekrarı`;
    const topWeak2 = weakTopics[1] ? `${weakTopics[1].subject} (${weakTopics[1].topic})` : `Problem & Paragraf branş denemesi`;

    const reply = `🎯 **${username}, Bugün İçin Kişisel Başarı Reçeten Hazır!**
*(YKS'ye Kalan: ${daysToYKS} Gün | Son 7 Günlük Odak: ${focusHours} Saat | Seri: ${streakDays} Gün)*

Veritabanındaki son deneme ve soru çözüm verilerini inceledim. Bugün maksimum verim almak için şu 3 adımı tamamlamanı öneriyorum:

1. **🔥 Zayıf Halka Tamiri (35 Dakika):**
   Hata defterinde en çok takıldığın **${topWeak1}** konusundan 15 yapamadığın soruyu incele ve analiz et.
2. **🍅 Derin Odaklanma Seansı (50 Dakika):**
   **${topWeak2}** konusunda zaman tutarak (Pomodoro ile) 25 özgün soru çöz.
3. **⚡ Gün Sonu Net Sağlamlaştırma (25 Dakika):**
   1 adet Paragraf veya Geometri mini branş denemesi ile zihnini hızlandır.

> *"Şampiyonlar yorulduklarında değil, o günkü hedeflerini tamamladıklarında dinlenirler."* Hadi ilk adımla başlayalım!`;

    return {
      reply,
      actions: [
        { label: '❌ Hata Defterini Aç', url: '/dashboard?tab=mistakes' },
        { label: '🍅 50 Dk Odak Başlat', url: '/dashboard?tab=focus' },
        { label: '📝 Soru Çöz', url: '/soru-coz' }
      ]
    };
  }

  // 2. DURUMUM NASIL / GELİŞİM ANALİZİ
  if (
    lower.includes('durumum') || 
    lower.includes('nasıl gidiyorum') || 
    lower.includes('analiz et') || 
    lower.includes('durum raporu') ||
    lower.includes('performansım')
  ) {
    let trendText = 'Netlerin son denemelerde dengeli seyrediyor.';
    if (netTrend === 'artışta') trendText = '🚀 Harika haber: Son denemelerinde belirgin bir yükseliş trendindesin!';
    else if (netTrend === 'düşüşte') trendText = '⚠️ Son denemede hafif bir dalgalanma olmuş, ancak panik yok; eksik analiziyle hızla toparlayacağız.';

    let examSummary = 'Sistemde henüz yeterli deneme kaydın bulunmuyor.';
    if (avgTytNet > 0 || avgAytNet > 0) {
      examSummary = `Ortalama TYT Netin: **${avgTytNet}**, Ortalama AYT Netin: **${avgAytNet}**.`;
    }

    const weakList = weakTopics.length > 0
      ? weakTopics.slice(0, 3).map((w, i) => `${i + 1}. **${w.subject} - ${w.topic}** (${w.errorCount} hata)`).join('\n')
      : 'Hata defterinde birikmiş kritik bir zayıf konu bulunmuyor.';

    const reply = `📊 **${username}, Kişisel Performans Karnen:**

- **Alan:** ${alan} (${memory.sinif})
- **Hedef:** ${targetStr}
- **Sınav Durumu:** ${examSummary}
- **Trend:** ${trendText}
- **YKS Geri Sayım:** ${daysToYKS} Gün Kaldı.

**🎯 En Çok Dikkat Etmen Gereken Konular:**
${weakList}

Bu zayıf konuları kapattığında netlerinin doğrudan **+5 ila +8 net** sıçrayacağını öngörüyorum.`;

    return {
      reply,
      actions: [
        { label: '📈 Denemelerime Git', url: '/denemeler' },
        { label: '🎯 Hedef Net Tablosu', url: '/dashboard?tab=hedef' },
        { label: '❌ Yanlışlarımı Çöz', url: '/dashboard?tab=mistakes' }
      ]
    };
  }

  // 3. HEDEFİME NE KADAR VAR / YÖK ATLAS HEDEF KARŞILAŞTIRMASI
  if (
    lower.includes('hedef') || 
    lower.includes('hedefime') || 
    lower.includes('kazanabilir miyim') || 
    lower.includes('yeter mi') ||
    lower.includes('üniversite')
  ) {
    const targetKey = `${targetUniversity} - ${targetDepartment}`;
    const required = DEPARTMENT_NETS[targetKey];

    let targetAdvice = '';
    if (required) {
      const reqTyt = (required.tyt_turkce || 0) + (required.tyt_mat || 0) + (required.tyt_sosyal || 0) + (required.tyt_fen || 0);
      const reqAyt = (required.ayt_mat || 0) + (required.ayt_fizik || 0) + (required.ayt_kimya || 0) + (required.ayt_biyoloji || 0) + (required.ayt_edebiyat || 0);
      
      const tytFark = Number((reqTyt - avgTytNet).toFixed(1));
      const aytFark = Number((reqAyt - avgAytNet).toFixed(1));

      targetAdvice = `\n\n**${targetStr}** için geçmiş YÖK Atlas ortalamaları:
- Gerekli TYT Neti: **~${reqTyt.toFixed(1)}** (Şu anki fark: ${tytFark > 0 ? `+${tytFark} net lazım` : 'Hedefe ulaştın! 🎉'})
- Gerekli AYT Neti: **~${reqAyt.toFixed(1)}** (Şu anki fark: ${aytFark > 0 ? `+${aytFark} net lazım` : 'Hedefe ulaştın! 🎉'})`;
    }

    const reply = `🎓 **${username}, Hedef Yolculuğun:**

Hedefin: **${targetStr}**
${targetAdvice}

Kalan **${daysToYKS} gün** boyunca günde ortalama 2-3 saatlik kaliteli odaklanmayla bu farkı rahatlıkla kapatabilirsin. Özellikle katsayısı yüksek olan branş denemelerine ağırlık vermelisin.`;

    return {
      reply,
      actions: [
        { label: '🎓 Tercih Robotunu Aç', url: '/dashboard?tab=tercih_robotu' },
        { label: '🧮 Puan Hesapla', url: '/puan-hesaplama' },
        { label: '📈 Denemelerime Git', url: '/denemeler' }
      ]
    };
  }

  // 4. NETLERİM NASIL ARTAR / NET PLATO ANALİZİ
  if (
    lower.includes('netlerim artmıyor') || 
    lower.includes('netler nasıl') || 
    lower.includes('net artı') || 
    lower.includes('plato') ||
    lower.includes('tıkandım')
  ) {
    const reply = `💡 **${username}, Net Sıçraması İçin 3 Altın Kural:**

Şu anki ortalaman TYT'de **${avgTytNet || 0}**, AYT'de **${avgAytNet || 0}** net civarında. Netlerin bir noktada duraksaması beyninin bilgileri sindirdiği 'Plato Evresi'dir. Buradan sıçramak için:

1. **Konu Çalışmayı Azalt, Deneme Analizini 2 Katına Çıkar:**
   Sadece soru çözmek yetmez; yanlış yaptığın her sorunun doğru çözümünü öğrenmeden o soruyu geçme.
2. **Süre Yönetimi (Turlama Tekniği):**
   İlk turda sadece 1 dakikadan az sürecek kesin bildiğin soruları çöz. Zor soruların yanına işaret koyup 2. tura bırak.
3. **Zayıf Branş Odaklanması:**
   ${weakTopics.length > 0 ? `Veritabanındaki hataların en çok **${weakTopics[0].subject}** dersinde yoğunlaşıyor. Buraya haftada ekstra 2 saat ayırmak sana net sıçraması yaptıracaktır.` : 'Günde en az 1 odaklanmış branş denemesi çöz.'}`;

    return {
      reply,
      actions: [
        { label: '📈 Deneme Kaydet', url: '/denemeler' },
        { label: '❌ Yanlışlarımı İncele', url: '/dashboard?tab=mistakes' }
      ]
    };
  }

  // 5. Diğer Genel Rehberlik / NLP Fallback
  const nlpResponse = generateCounselorResponse([{ role: 'user', content: rawMessage }]);
  let replyText = nlpResponse.text;

  if (replyText.startsWith('Merhaba') || replyText.startsWith('Selam')) {
    replyText = replyText.replace(/^(Merhaba|Selam)!?/, `$1 ${username}!`);
  }

  return {
    reply: replyText,
    actions: nlpResponse.actions
  };
}
