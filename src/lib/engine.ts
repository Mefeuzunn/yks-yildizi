// Parametrik Soru Üretim Motoru (AI Question Engine)
// Bu motor, soru şablonlarını alır ve içindeki "sablon_kodu" (JavaScript mantığı)
// kullanarak rastgele değişkenler üretir. Ardından bu değişkenleri soru metnine (icerik_sablonu) yerleştirir.

export interface QuestionTemplate {
  id: string;
  ders_id: string;
  konu_id: string;
  zorluk_derecesi: number;
  sablon_kodu: string; // "return { a: Math.floor(Math.random() * 10), b: Math.floor(Math.random() * 10) }" gibi
  icerik_sablonu: string; // "Ali'nin {{a}} elması, Ayşe'nin {{b}} elması var. Toplam kaç elma eder?"
  cozum_sablonu: string; // "{{a}} + {{b}} = {{cevap}}"
}

export interface GeneratedQuestion {
  template_id: string;
  icerik: string;
  cozum: string;
  secenekler: string[];
  dogruCevap: string;
  parametreler: any; // İleride hata defterinde aynı soruyu tekrar göstermek için
}

/**
 * Şablon kodunu çalıştırıp değişkenleri üretir.
 */
function generateVariables(sablon_kodu: string): any {
  try {
    // Güvenlik: Gerçek bir prod ortamında bu kod vm2 veya benzeri izole bir ortamda çalıştırılmalıdır.
    // Ancak bu MVP/Demo aşamasında Next.js server tarafında basit bir Function() kullanıyoruz.
    const fn = new Function(sablon_kodu);
    return fn();
  } catch (error) {
    console.error("Şablon kodu çalıştırılırken hata oluştu:", error);
    return null;
  }
}

/**
 * {{degisken}} formatındaki metinleri, üretilen değişkenlerle değiştirir.
 */
function replacePlaceholders(templateStr: string, variables: any): string {
  if (!templateStr) return "";
  return templateStr.replace(/\{\{([^}]+)\}\}/g, (match, p1) => {
    const key = p1.trim();
    return variables[key] !== undefined ? String(variables[key]) : match;
  });
}

/**
 * Ana üretim fonksiyonu.
 */
export function generateQuestionFromTemplate(template: QuestionTemplate): GeneratedQuestion | null {
  const vars = generateVariables(template.sablon_kodu);
  
  if (!vars) return null;

  // Varsayılan olarak "cevap" adında bir değişkenin hesaplandığını veya 
  // sablon kodunun seçenekleri döneceğini varsayıyoruz.
  // Örn: vars = { a: 5, b: 3, cevap: 8, yanlislar: [6,7,9,10] }

  const icerik = replacePlaceholders(template.icerik_sablonu, vars);
  const cozum = replacePlaceholders(template.cozum_sablonu, vars);
  
  const dogruCevap = String(vars.cevap);
  let secenekler: string[] = [];

  // Yanlış şıkları oluşturma veya varsa kullanma
  if (vars.yanlislar && Array.isArray(vars.yanlislar)) {
    secenekler = [...vars.yanlislar.map(String), dogruCevap];
  } else {
    // Fallback: Eğer şablon yanlış şık üretmediyse rastgele türet
    // (Sayısal bir cevap olduğunu varsayarak)
    const ansNum = parseFloat(dogruCevap);
    if (!isNaN(ansNum)) {
      secenekler = [
        dogruCevap,
        String(ansNum + 1),
        String(ansNum - 1),
        String(ansNum + 2),
        String(ansNum - 2)
      ];
    } else {
      secenekler = [dogruCevap, "A", "B", "C", "D"]; // dummy
    }
  }

  // Şıkları karıştır (Fisher-Yates)
  for (let i = secenekler.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [secenekler[i], secenekler[j]] = [secenekler[j], secenekler[i]];
  }

  // Maksimum 5 seçenek
  secenekler = secenekler.slice(0, 5);

  return {
    template_id: template.id,
    icerik,
    cozum,
    secenekler,
    dogruCevap,
    parametreler: vars
  };
}
