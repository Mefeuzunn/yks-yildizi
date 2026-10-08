import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

import { getYksTargetDate, calculateYksCountdown } from '@/lib/yks-countdown';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MOTIVATIONAL_QUOTES = [
  'Bugün attığın her adım, yarınki sıralamanı belirleyecek.',
  'Zorluklar seni yıldırmasın; yıldızlar karanlıkta parlar. ✨',
  'Günde 50 kaliteli soru, 1 ayda 1500 netlik dev bir sıçramadır.',
  'Disiplin, ne istediğini şimdi ne istediğine feda etmemektir.',
  'Her yanlış soru, sınavda doğru yapacağın bir bilginin müjdesidir.',
  'Bugünün emeği, yarının üniversite kapısını aralayacak.',
  'Rakiplerin uyurken senin gösterdiğin çaba fark yaratır.',
  'Hedefine giden yol düz değildir; sabır ve süreklilik kazanır.',
  'Küçük adımların büyük gücüne inan. Masanın başına geç!',
  'YKS maratonunda en önemli rakibin dünkü sensin.',
  'Odaklan, nefes al ve bir soruyu daha bitir. Sen başarırsın! 🚀',
  'Hayalindeki bölüm seni bekliyor, çalışmaya devam et.',
  'Bugün çözdüğün her test, sınav sabahının özgüvenidir.',
  'Başarı tesadüf değildir; ter, emek ve kararlılık ister.'
];

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);

    let userSinif: string | null = null;
    let username = 'YKS Şampiyonu';
    let streak = 1;
    let currentLeague = 'Bronz';
    let todayQuestions = 0;
    let focusMinutesToday = 0;
    let dailyGoal = 50;

    if (userId) {
      // 1. Kullanıcı bilgisi & Sınıf düzeyi
      try {
        const userRow = await db.prepare('SELECT username, sinif FROM users WHERE id = ?').get(userId) as any;
        if (userRow?.username) username = userRow.username;
        if (userRow?.sinif) userSinif = userRow.sinif;
      } catch (_) {}

      // 2. İstatistikler & Seri
      try {
        const statsRow = await db.prepare(
          'SELECT streak_days, league, solved_questions FROM user_stats WHERE user_id = ?'
        ).get(userId) as any;
        if (statsRow) {
          streak = Math.max(1, statsRow.streak_days || 1);
          if (statsRow.league) currentLeague = statsRow.league;
        }
      } catch (_) {}
    }

    // Dinamik Hedef YKS Tarihi (Öğrencinin sınıfına göre 2026/2027)
    const targetDateObj = getYksTargetDate(userSinif);
    const countdown = calculateYksCountdown(targetDateObj);
    const daysRemaining = countdown.days;

    // Günün motivasyon sözü (günün indeksine göre döner)
    const now = Date.now();
    const dayOfYear = Math.floor((now - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const motivationalQuote = MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];

      // 3. Bugünün odak oturumu & soru sayısı
      try {
        const focusRow = await db.prepare(`
          SELECT 
            COALESCE(SUM(COALESCE(questions_solved, 0)), 0)::int as questions,
            COALESCE(SUM(COALESCE(duration_minutes, duration_min, 0)), 0)::int as total_min
          FROM focus_sessions
          WHERE user_id = ? 
            AND DATE(created_at) = CURRENT_DATE
        `).get(userId) as any;

        if (focusRow) {
          todayQuestions = focusRow.questions || 0;
          focusMinutesToday = focusRow.total_min || 0;
        }
      } catch (_) {}

      // 4. Eğer focus_sessions 0 ise, bugün çözülen hata kayıtlarından da kontrol et
      if (todayQuestions === 0) {
        try {
          const errorCountRow = await db.prepare(`
            SELECT COUNT(*)::int as count 
            FROM error_log 
            WHERE user_id = ? AND DATE(created_at) = CURRENT_DATE
          `).get(userId) as any;
          if (errorCountRow?.count) {
            todayQuestions = Math.max(todayQuestions, errorCountRow.count);
          }
        } catch (_) {}
      }
    }

    const progressPercent = Math.min(100, Math.round((todayQuestions / Math.max(1, dailyGoal)) * 100));

    const responseData = {
      daysRemaining,
      todayQuestions,
      dailyGoal,
      streak,
      currentLeague,
      motivationalQuote,
      username,
      focusMinutesToday,
      progressPercent,
      yksTargetDate: targetDateObj.toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'success'
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Widget Data API Error:', error);
    return NextResponse.json({
      daysRemaining: 257,
      todayQuestions: 0,
      dailyGoal: 50,
      streak: 1,
      currentLeague: 'Bronz',
      motivationalQuote: 'Disiplin, geleceğin anahtarıdır. Çalışmaya devam et!',
      username: 'YKS Şampiyonu',
      focusMinutesToday: 0,
      progressPercent: 0,
      error: 'Widget verisi alınamadı',
    }, { status: 200 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
