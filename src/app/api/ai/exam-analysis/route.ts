import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { getStudentMemory } from '@/lib/ai/studentMemoryEngine';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const examType = body.type || 'TYT'; // 'TYT' or 'AYT'

    // 1. Fetch student's exams of this type
    const exams = await db.prepare(`
      SELECT * FROM mock_exams 
      WHERE user_id = ? AND exam_type = ? 
      ORDER BY exam_date DESC 
      LIMIT 5
    `).all(userId, examType) as any[];

    if (!exams || exams.length === 0) {
      return NextResponse.json({
        error: `Henüz kayıtlı ${examType} denemeniz bulunmuyor. Lütfen önce bir deneme sonucu ekleyin.`
      }, { status: 400 });
    }

    const latestExam = exams[0];
    const previousExams = exams.slice(1);

    // 2. Fetch student memory (weak topics, streak, target)
    const memory = await getStudentMemory(userId);

    // Calculate deltas
    let avgPrevTotal = 0;
    let avgPrevMath = 0;
    let avgPrevTurk = 0;
    let avgPrevSocial = 0;
    let avgPrevSci = 0;

    if (previousExams.length > 0) {
      avgPrevTotal = previousExams.reduce((acc, e) => acc + (e.total_net || 0), 0) / previousExams.length;
      avgPrevMath = previousExams.reduce((acc, e) => acc + (e.math_net || 0), 0) / previousExams.length;
      avgPrevTurk = previousExams.reduce((acc, e) => acc + (e.turkish_net || 0), 0) / previousExams.length;
      avgPrevSocial = previousExams.reduce((acc, e) => acc + (e.social_net || 0), 0) / previousExams.length;
      avgPrevSci = previousExams.reduce((acc, e) => acc + (e.science_net || 0), 0) / previousExams.length;
    }

    const totalDiff = previousExams.length > 0 ? (latestExam.total_net - avgPrevTotal) : 0;
    const mathDiff = previousExams.length > 0 ? (latestExam.math_net - avgPrevMath) : 0;
    const turkDiff = previousExams.length > 0 ? (latestExam.turkish_net - avgPrevTurk) : 0;

    const weakTopicsList = memory?.topWeakTopics?.map(t => `${t.subject} (${t.topic})`).join(', ') || 'Belirtilmemiş';

    // 3. Try Gemini 2.5 Flash Free Tier
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

    if (apiKey) {
      try {
        const prompt = `Sen Türkiye YKS (TYT-AYT) sınavında binlerce derece öğrencisi yetiştirmiş kıdemli bir YKS Başdanışmanı ve Pedagojik AI Koçusun.
Aşağıda bir öğrencinin son ${examType} deneme sınavı sonuçları ve çalışma geçmişi yer alıyor:

Öğrenci: ${memory?.username || 'Öğrenci'}, Alan: ${memory?.alan || 'Sayısal'}
Hedef: ${memory?.targetDepartment || 'Yüksek sıralama'}
Sınava Kalan: ${memory?.daysToYKS} gün

SON DENEME DETAYLARI:
- Sınav Adı: ${latestExam.exam_name || `${examType} Denemesi`}
- Toplam Net: ${latestExam.total_net} (Önceki deneme ortalamasına göre fark: ${totalDiff >= 0 ? '+' : ''}${totalDiff.toFixed(1)})
- ${examType === 'TYT' ? 'Türkçe' : 'Ders 1'}: ${latestExam.turkish_net} net
- Matematik: ${latestExam.math_net} net
- ${examType === 'TYT' ? 'Sosyal' : 'Ders 3'}: ${latestExam.social_net} net
- ${examType === 'TYT' ? 'Fen Bilimleri' : 'Ders 4'}: ${latestExam.science_net} net

HATA DEFTERİNDEKİ EN KRİTİK EKSİK KONULAR:
${weakTopicsList}

Lütfen bu verileri analiz ederek öğrenciye şu JSON formatında yanıt üret (yalnızca geçerli JSON döndür, markdown code block veya başka metin ekleme):
{
  "overallEvaluation": "Öğrencinin genel performansını, net artış/azalışını samimi ve uzman bir dille özetleyen 2-3 cümlelik değerlendirme.",
  "scoreDelta": "${totalDiff >= 0 ? '+' : ''}${totalDiff.toFixed(1)}",
  "keyStrengths": ["Öğrencinin güçlü kaldığı 1-2 nokta"],
  "criticalGaps": [
    {
      "subject": "Ders Adı",
      "topic": "Konu Adı",
      "netLoss": "Tahmini kayıp net (örn: 2.5 Net)",
      "potentialRankGain": "Bu net kazanılırsa tahmini sıralama sıçraması (örn: ~8.000 kişi)",
      "advice": "Konuyla ilgili nokta atışı çalışma tavsiyesi"
    }
  ],
  "studyPrescription": [
    {
      "day": "1. Gün",
      "focusSubject": "Ders",
      "topic": "Odaklanılacak konu",
      "targetQuestions": 40,
      "strategy": "Kısa taktik ve püf nokta"
    },
    {
      "day": "2. Gün",
      "focusSubject": "Ders",
      "topic": "Odaklanılacak konu",
      "targetQuestions": 50,
      "strategy": "Kısa taktik ve püf nokta"
    },
    {
      "day": "3. Gün",
      "focusSubject": "Ders",
      "topic": "Odaklanılacak konu",
      "targetQuestions": 45,
      "strategy": "Kısa taktik ve püf nokta"
    }
  ],
  "motivationalQuote": "Öğrenciyi harekete geçirecek samimi bir koçluk cümlesi."
}`;

        const apiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.3,
                response_mime_type: "application/json"
              }
            })
          }
        );

        if (apiRes.ok) {
          const resJson = await apiRes.json();
          const rawText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return NextResponse.json({
              success: true,
              provider: 'gemini-2.5-flash',
              latestExam,
              analysis: parsed
            });
          }
        }
      } catch (geminiError) {
        console.warn('Gemini exam analysis failed, using local rule engine:', geminiError);
      }
    }

    // 4. Local Rule Engine (100% Free, Zero Cost, Zero Dependency)
    const isPositive = totalDiff >= 0;
    
    // Determine biggest area for improvement
    let weakestSubject = 'Matematik';
    let weakestNet = latestExam.math_net;
    if (examType === 'TYT') {
      if (latestExam.science_net < weakestNet) {
        weakestSubject = 'Fen Bilimleri';
        weakestNet = latestExam.science_net;
      }
      if (latestExam.turkish_net < 25 && latestExam.turkish_net < weakestNet) {
        weakestSubject = 'Türkçe';
        weakestNet = latestExam.turkish_net;
      }
    }

    const firstWeakTopic = memory?.topWeakTopics?.[0]?.topic || (examType === 'TYT' ? 'Problemler' : 'Trigonometri');
    const secondWeakTopic = memory?.topWeakTopics?.[1]?.topic || (examType === 'TYT' ? 'Optik' : 'Türev');

    const localAnalysis = {
      overallEvaluation: isPositive 
        ? `Son ${examType} denemende toplam ${latestExam.total_net} nete ulaşarak önceki ortalamana göre +${totalDiff.toFixed(1)} netlik harika bir sıçrama yaptın! Bu ivmeyi korumak için kaçan netleri analiz edip doğru noktalara odaklanmalıyız.`
        : `Son ${examType} denemende ${latestExam.total_net} net yaptın. Önceki denemelerine göre ${Math.abs(totalDiff).toFixed(1)} netlik bir gerileme olsa da bu moral bozucu değil; hangi konularda açık verdiğini gösteren değerli bir harita!`,
      scoreDelta: `${totalDiff >= 0 ? '+' : ''}${totalDiff.toFixed(1)}`,
      keyStrengths: [
        latestExam.turkish_net >= 28 ? `Türkçe (${latestExam.turkish_net} net) sağlam bir omurga oluşturuyor.` : `Deneme disiplinini sürdürmen ve sonuçları kaydetmen gelişiminin anahtarı.`,
        latestExam.math_net >= 20 ? `Matematik netin (${latestExam.math_net}) hedefine emin adımlarla yaklaştığını gösteriyor.` : `Düzenli deneme çözümüyle sınav kondisyonun artıyor.`
      ],
      criticalGaps: [
        {
          subject: weakestSubject,
          topic: firstWeakTopic,
          netLoss: "2 - 3 Net Kayıp",
          potentialRankGain: "~12.000 - 18.000 Kişi",
          advice: `${firstWeakTopic} konusunda kaçan sorular genellikle kavram yanılgılarından kaynaklanır. Önce temel formül ve soru tiplerini 1 saat tekrar et.`
        },
        {
          subject: examType === 'TYT' ? 'Fen / Sosyal' : 'Matematik-2',
          topic: secondWeakTopic,
          netLoss: "1.5 - 2 Net Kayıp",
          potentialRankGain: "~7.500 Kişi",
          advice: `${secondWeakTopic} için günlük 25 hedef soru çözüp yanlışlarını anında Hata Defterine kaydetmelisin.`
        }
      ],
      studyPrescription: [
        {
          day: "1. Gün (Teşhis & Konu Tazeleme)",
          focusSubject: weakestSubject,
          topic: firstWeakTopic,
          targetQuestions: 35,
          strategy: "Denemede boş bıraktığın veya yanlış yaptığın soru tiplerini incele, konunun püf noktalarını not al."
        },
        {
          day: "2. Gün (Yoğun Soru Pratiği)",
          focusSubject: weakestSubject,
          topic: `${firstWeakTopic} & Karma Test`,
          targetQuestions: 45,
          strategy: "Süre tutarak 45 soru çöz. Takıldığın her soruda AstraTutor'a fotoğrafını yükleyip çözümünü incele."
        },
        {
          day: "3. Gün (Mini Deneme & Pekiştirme)",
          focusSubject: examType === 'TYT' ? 'Türkçe & Matematik' : 'Alan Dersi',
          topic: secondWeakTopic,
          targetQuestions: 40,
          strategy: "Branş denemesi şeklinde 1 test çöz ve hata analizini eksiksiz tamamla."
        }
      ],
      motivationalQuote: "Unutma: Başarı, girdiğin denemedeki net sayısıyla değil; o denemedeki yanlışlardan ne kadar ders çıkardığınla ölçülür!"
    };

    return NextResponse.json({
      success: true,
      provider: 'local-analytics-engine',
      latestExam,
      analysis: localAnalysis
    });

  } catch (error: any) {
    console.error('Exam Analysis API Error:', error);
    return NextResponse.json({
      error: 'Deneme analizi yapılırken bir sunucu hatası oluştu.'
    }, { status: 500 });
  }
}
