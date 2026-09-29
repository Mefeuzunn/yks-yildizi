import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code || !code.trim()) {
      return NextResponse.json({ error: 'Bağlantı kodu gereklidir.' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // 1. Find Student by parent code
    const student = await db.prepare(
      "SELECT id, username, alan, sinif FROM users WHERE UPPER(parent_code) = ? AND role = 'ogrenci'"
    ).get(cleanCode) as any;

    if (!student) {
      return NextResponse.json({ error: 'Öğrenci bulunamadı.' }, { status: 404 });
    }

    // 2. Fetch Exams
    let exams: any[] = [];
    try {
      exams = await db.prepare('SELECT total_net FROM mock_exams WHERE user_id = ?').all(student.id) as any[];
    } catch (_) {}
    const avgNet = exams && exams.length > 0 
      ? (exams.reduce((acc, e) => acc + (Number(e.total_net) || 0), 0) / exams.length).toFixed(1) 
      : '0';

    // 3. Fetch Solved Questions
    let stats = null;
    try {
      stats = await db.prepare('SELECT solved_questions, success_rate FROM user_stats WHERE user_id = ?').get(student.id) as any;
    } catch (_) {}
    const solvedCount = stats?.solved_questions || 0;
    const successRate = stats?.success_rate || 0;

    // 4. Fetch Top 3 Weaknesses
    let weaknesses: any[] = [];
    try {
      weaknesses = await db.prepare(`
        SELECT topic, COUNT(*) as c 
        FROM error_log 
        WHERE user_id = ? 
        GROUP BY topic 
        ORDER BY c DESC 
        LIMIT 3
      `).all(student.id) as any[];
    } catch (_) {
      try {
        weaknesses = await db.prepare(`
          SELECT topic, COUNT(*) as c 
          FROM student_mistakes 
          WHERE user_id = ? 
          GROUP BY topic 
          ORDER BY c DESC 
          LIMIT 3
        `).all(student.id) as any[];
      } catch (_) {}
    }
    
    const weaknessTopics = weaknesses && weaknesses.length > 0 
      ? weaknesses.map(w => w.topic).filter(Boolean).join(', ') 
      : '';

    // 5. Generate AI Letter
    const letter = `Sayın Velimiz,

Öğrencimiz ${student.username} son dönemde YKS hazırlık sürecinde oldukça kararlı bir performans göstermektedir. Sistemimizdeki güncel verilere göre kendisi toplamda ${solvedCount} adet soru çözmüş ve genel test başarı oranını %${successRate} seviyesine ulaştırmıştır. Çözdüğü TYT/AYT deneme sınavlarının net ortalaması ise şu an ${avgNet} net seviyesindedir.

Öğrencimizin konu analizlerini incelediğimizde; ${weaknessTopics ? `özellikle "${weaknessTopics}" konularında` : 'çeşitli konularda'} bazı ufak kazanım eksikleri veya işlem hataları yaptığını saptadık. Bu durum YKS sürecinde son derece doğaldır ve gelişim alanlarını göstermektedir. 

Öneri Aksiyon Planı:
1. Öğrencimizin bu hafta çözdüğü hatalı soruları (Hata Defterini) gözden geçirmesini teşvik edebilirsiniz.
2. Odaklanma sürelerini artırmak adına uyguladığımız Pomodoro seanslarını tamamladığında onu tebrik edebilirsiniz.

${student.username}'in bu disiplinli çalışmasını sürdürmesi halinde başarı grafiğinin giderek yükseleceğine inanıyoruz. Destekleriniz öğrencimizin motivasyonu için çok değerlidir.

Saygılarımızla,
YKS Yıldızı Yapay Zeka Eğitim Koçu`;

    return NextResponse.json({ success: true, letter });
  } catch (error) {
    console.error('AI Report Route Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
