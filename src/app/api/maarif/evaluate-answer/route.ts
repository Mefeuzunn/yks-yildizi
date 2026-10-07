import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

interface RubricItem {
  points: number;
  criteria: string;
}

interface EvaluationResult {
  earned_score: number;
  max_score: number;
  mastery_level: 'Tam Başarılı' | 'Başarılı' | 'Kısmen Başarılı' | 'Geliştirilmeli';
  rubric_breakdown: Array<{
    criteria: string;
    max_points: number;
    earned_points: number;
    achieved: boolean;
    note: string;
  }>;
  ai_feedback: string;
  socratic_hint: string;
}

export async function POST(req: Request) {
  try {
    const userId = (await getAuthenticatedUserId(req)) || 'anonymous_student';
    const body = await req.json();
    const { questionId, studentAnswer = '' } = body;

    if (!questionId) {
      return NextResponse.json({ error: 'questionId parametresi gereklidir' }, { status: 400 });
    }

    // 1. Soruyu veritabanından çek
    const question = await db.prepare(
      'SELECT * FROM maarif_open_ended_questions WHERE id = ?'
    ).get(questionId) as any;

    if (!question) {
      return NextResponse.json({ error: 'Soru bulunamadı' }, { status: 404 });
    }

    const maxScore = question.max_score || 10;
    const rubricCriteria: RubricItem[] = typeof question.rubric_criteria === 'string'
      ? JSON.parse(question.rubric_criteria)
      : (question.rubric_criteria || []);
    
    const sampleSolutions: string[] = typeof question.sample_solutions === 'string'
      ? JSON.parse(question.sample_solutions)
      : (question.sample_solutions || []);

    const trimmedAnswer = studentAnswer.trim();

    // 2. Boş cevap durumu
    if (!trimmedAnswer) {
      const emptyResult: EvaluationResult = {
        earned_score: 0,
        max_score: maxScore,
        mastery_level: 'Geliştirilmeli',
        rubric_breakdown: rubricCriteria.map(rc => ({
          criteria: rc.criteria,
          max_points: rc.points,
          earned_points: 0,
          achieved: false,
          note: 'Herhangi bir çözüm adımı veya cevap girilmedi.',
        })),
        ai_feedback: 'Bu soru için bir çözüm veya cevap girilmemiştir. Soru kökündeki verileri adım adım yazarak çözüme başlayabilirsiniz.',
        socratic_hint: 'Soru metnindeki temel kavram ve formülleri hatırlayarak ilk adımı atabilir misin?',
      };

      // Kaydet
      const evalId = uuidv4();
      await db.prepare(`
        INSERT INTO maarif_student_evaluations (
          id, user_id, question_id, student_answer_text, ai_score, ai_feedback, rubric_breakdown, mastery_level, evaluated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `).run(
        evalId,
        userId,
        questionId,
        trimmedAnswer,
        0,
        emptyResult.ai_feedback,
        JSON.stringify(emptyResult.rubric_breakdown),
        emptyResult.mastery_level
      );

      return NextResponse.json({
        success: true,
        evaluationId: evalId,
        evaluation: emptyResult,
        provider: 'rule-empty',
      });
    }

    // 3. Gemini ile Yapay Zeka Rubrik Değerlendirmesi
    let evaluationResult: EvaluationResult | null = null;
    let provider = 'gemini';

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const prompt = `
Sen Türkiye Yüzyılı Maarif Modeli kapsamında 9, 10 ve 11. sınıf MEB Ortak Yazılı Sınavları için görevlendirilmiş resmi Ölçme ve Değerlendirme Uzmanısın.
Geleneksel test veya net odaklı YKS ezberciliği DEĞİL, MEB'in "süreç odaklı, beceri temelli ve dereceli puanlama anahtarı (rubrik)" ilkelerine harfiyen bağlı kalarak açık uçlu öğrenci cevabını değerlendireceksin.

DERS VE KAZANIM:
- Sınıf: ${question.grade}. Sınıf
- Ders: ${question.subject}
- Çıktı Kodu: ${question.curriculum_node_code}
- Bağlam Hikayesi: ${question.context_story}
- Soru Metni: ${question.question_text}
- Tam Puan: ${maxScore}

MEB RESMİ DERECELİ PUANLAMA ANAHTARI (RUBRİK KRİTERLERİ):
${rubricCriteria.map((rc, idx) => `${idx + 1}. [${rc.points} Puan]: ${rc.criteria}`).join('\n')}

MEB MODEL ÖRNEK ÇÖZÜM ADIMLARI:
${sampleSolutions.join('\n')}

ÖĞRENCİNİN YAZDIĞI CEVAP:
"""${trimmedAnswer}"""

GÖREVİN:
1. Öğrencinin yanıtını, her bir rubrik kriterine göre tek tek tarafsızca incele.
2. Her kriter için öğrencinin adımı sağlayıp sağlamadığını belirle ve hak ettiği puanı ver (kısmi başarıda ara puan verilebilir).
3. Toplam alınan puanı (0 ile ${maxScore} arasında) hesapla.
4. Başarı düzeyini belirle:
   - %85 ve üzeri: "Tam Başarılı"
   - %70-%84: "Başarılı"
   - %50-%69: "Kısmen Başarılı"
   - %0-%49: "Geliştirilmeli"
5. Yapıcı, cesaretlendirici, kavram yanılgısını nazikçe gösteren 2-3 cümlelik Türkçe pedagojik geri bildirim (ai_feedback) yaz.
6. Maarif modeline uygun, cevabı doğrudan vermeyen, öğrenciyi derin düşünmeye sevk eden Sokratik yönlendirme sorusu (socratic_hint) yaz.

AŞAĞIDAKİ GEÇERLİ JSON FORMATINDA YANIT VER (Başka hiçbir metin veya markdown etiket olmadan SADECE JSON objesi döndür):
{
  "earned_score": 12,
  "max_score": ${maxScore},
  "mastery_level": "Başarılı",
  "rubric_breakdown": [
    {
      "criteria": "kriter metni",
      "max_points": 5,
      "earned_points": 5,
      "achieved": true,
      "note": "Açıklama"
    }
  ],
  "ai_feedback": "Pedagojik dönüt",
  "socratic_hint": "Sokratik soru"
}
`;

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
                  temperature: 0.2,
                  maxOutputTokens: 1024,
                },
              }),
            }
          );

          if (apiRes.ok) {
            const resJson = await apiRes.json();
            const rawText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
              // Markdown kod bloklarını temizle
              const cleanedJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
              const parsed = JSON.parse(cleanedJson);
              if (parsed && typeof parsed.earned_score === 'number' && Array.isArray(parsed.rubric_breakdown)) {
                evaluationResult = {
                  earned_score: Math.min(maxScore, Math.max(0, Math.round(parsed.earned_score))),
                  max_score: maxScore,
                  mastery_level: parsed.mastery_level || 'Kısmen Başarılı',
                  rubric_breakdown: parsed.rubric_breakdown,
                  ai_feedback: parsed.ai_feedback || 'Çözüm adımlarınız MEB dereceli puanlama anahtarına göre değerlendirildi.',
                  socratic_hint: parsed.socratic_hint || 'Çözüm basamaklarını tekrar kontrol ederek çıkarımını pekiştirebilirsin.',
                };
                provider = model;
                break;
              }
            }
          }
        } catch (mErr) {
          console.warn(`Gemini evaluation with model ${model} failed:`, mErr);
        }
      }
    }

    // 4. Yedek Heuristik Kural Motoru (API hatası veya kotası durumunda sıfır kesinti)
    if (!evaluationResult) {
      provider = 'heuristic-rubric-engine';
      let totalEarned = 0;
      const lowerAnswer = trimmedAnswer.toLowerCase();

      const breakdown = rubricCriteria.map(rc => {
        const critWords = rc.criteria
          .toLowerCase()
          .replace(/[^\w\sğüşıöç]/g, ' ')
          .split(/\s+/)
          .filter(w => w.length >= 3);

        const matchCount = critWords.filter(w => lowerAnswer.includes(w)).length;
        const matchRatio = critWords.length > 0 ? matchCount / critWords.length : 0;

        let earned = 0;
        let achieved = false;
        let note = '';

        if (matchRatio >= 0.4 || lowerAnswer.length >= 25) {
          earned = rc.points;
          achieved = true;
          note = 'MEB rubrik adımı başarıyla sağlandı.';
        } else if (matchRatio >= 0.2 || lowerAnswer.length >= 10) {
          earned = Math.round(rc.points * 0.5);
          achieved = false;
          note = 'Kısmi çözüm adımı tespit edildi, kavramsal açıklama eksik.';
        } else {
          earned = 0;
          achieved = false;
          note = 'Gerekli çözüm adımı veya çıkarım cevabınızda bulunamadı.';
        }

        totalEarned += earned;
        return {
          criteria: rc.criteria,
          max_points: rc.points,
          earned_points: earned,
          achieved,
          note,
        };
      });

      totalEarned = Math.min(maxScore, totalEarned);
      const ratio = totalEarned / maxScore;
      let mastery: EvaluationResult['mastery_level'] = 'Geliştirilmeli';
      if (ratio >= 0.85) mastery = 'Tam Başarılı';
      else if (ratio >= 0.7) mastery = 'Başarılı';
      else if (ratio >= 0.5) mastery = 'Kısmen Başarılı';

      evaluationResult = {
        earned_score: totalEarned,
        max_score: maxScore,
        mastery_level: mastery,
        rubric_breakdown: breakdown,
        ai_feedback: ratio >= 0.7
          ? 'Tebrikler! MEB dereceli puanlama anahtarındaki ana kazanım basamaklarını ve kavramsal çıkarımları başarıyla tamamladınız.'
          : 'Çözümünüzde bazı doğru adımlar bulunmakla birlikte, matematiksel/bilimsel gerekçelendirme kısımlarını MEB rubrik ölçütlerine göre detaylandırmalısınız.',
        socratic_hint: 'Soru metnindeki veriler ile ulaştığın sonuç arasındaki mantıksal bağı kendi cümlelerinle nasıl ifade edersin?',
      };
    }

    // 5. Değerlendirmeyi veritabanına kaydet
    const evalId = uuidv4();
    await db.prepare(`
      INSERT INTO maarif_student_evaluations (
        id, user_id, question_id, student_answer_text, ai_score, ai_feedback, rubric_breakdown, mastery_level, evaluated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `).run(
      evalId,
      userId,
      questionId,
      trimmedAnswer,
      evaluationResult.earned_score,
      evaluationResult.ai_feedback,
      JSON.stringify(evaluationResult.rubric_breakdown),
      evaluationResult.mastery_level
    );

    return NextResponse.json({
      success: true,
      evaluationId: evalId,
      evaluation: evaluationResult,
      provider,
    });
  } catch (error: any) {
    console.error('Maarif AI Answer Evaluation Error:', error);
    return NextResponse.json({ error: 'Yapay zeka rubrik değerlendirmesi sırasında bir hata oluştu' }, { status: 500 });
  }
}
