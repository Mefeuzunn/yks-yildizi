import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const { subject, topic, icerik, secenekler_json, dogru_cevap, secilen_cevap, cozum, image_data } = body;

    if (!subject || !topic || !icerik || !secenekler_json || !dogru_cevap || !secilen_cevap) {
      return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 });
    }

    await db.transaction(async () => {
      // 1. Log in student_mistakes with Leitner Box 1
      await db.prepare(`
        INSERT INTO student_mistakes (
          user_id, subject, topic, icerik, secenekler_json, dogru_cevap, secilen_cevap,
          cozum, image_data, leitner_box, next_review_at, review_count
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), 0)
      `).run(userId, subject, topic, icerik, secenekler_json, dogru_cevap, secilen_cevap, cozum || '', image_data || null);

      // 2. Sync to error_log (so study plan and coach weaknesses reflect this mistake)
      await db.prepare(`
        INSERT INTO error_log (user_id, subject, topic, question_id)
        VALUES (?, ?, ?, ?)
      `).run(userId, subject, topic, `user_error_${uuidv4().substring(0, 8)}`);
    })();

    return NextResponse.json({ success: true, message: 'Hata başarıyla Leitner 1. Kutusuna kaydedildi.' });
  } catch (error) {
    console.error('Errors POST Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const mistakes = await db.prepare(`
      SELECT * FROM student_mistakes 
      WHERE user_id = ? 
      ORDER BY leitner_box ASC, next_review_at ASC, created_at DESC
    `).all(userId) as any[];

    const now = new Date();

    // Parse options list and Leitner fields
    const mapped = mistakes.map(m => {
      const nextDate = m.next_review_at ? new Date(m.next_review_at) : null;
      const isDue = !nextDate || nextDate <= now;

      return {
        id: m.id,
        subject: m.subject,
        topic: m.topic,
        icerik: m.icerik,
        secenekler: JSON.parse(m.secenekler_json || '[]'),
        dogruCevap: m.dogru_cevap,
        secilenCevap: m.secilen_cevap,
        cozum: m.cozum,
        createdAt: m.created_at,
        imageData: m.image_data,
        leitnerBox: m.leitner_box || 1,
        nextReviewAt: m.next_review_at || m.created_at,
        reviewCount: m.review_count || 0,
        lastReviewedAt: m.last_reviewed_at,
        isDue: isDue
      };
    });

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Errors GET Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// PUT: Leitner Aralıklı Tekrar İlerlemesi (Review feedback)
export async function PUT(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const { id, isCorrect } = body;

    if (!id || typeof isCorrect !== 'boolean') {
      return NextResponse.json({ error: 'Geçersiz parametreler' }, { status: 400 });
    }

    const mistake = await db.prepare('SELECT * FROM student_mistakes WHERE id = ? AND user_id = ?').get(id, userId) as any;
    if (!mistake) {
      return NextResponse.json({ error: 'Soru bulunamadı' }, { status: 404 });
    }

    const currentBox = mistake.leitner_box || 1;
    let newBox = currentBox;
    let daysToAdd = 1;
    let xpEarned = 10;

    if (isCorrect) {
      newBox = Math.min(5, currentBox + 1);
      // Leitner aralıkları:
      // Kutu 2: 3 gün sonra
      // Kutu 3: 7 gün sonra
      // Kutu 4: 14 gün sonra
      // Kutu 5: 30 gün sonra (Kalıcı Hafıza)
      if (newBox === 2) daysToAdd = 3;
      else if (newBox === 3) daysToAdd = 7;
      else if (newBox === 4) daysToAdd = 14;
      else if (newBox === 5) {
        daysToAdd = 30;
        xpEarned = 50; // Mastered bonus
      }
    } else {
      // Yanlış yapıldıysa Kutu 1'e geri dön (1 gün sonra tekrar)
      newBox = 1;
      daysToAdd = 1;
      xpEarned = 2; // Katılım XP
    }

    await db.prepare(`
      UPDATE student_mistakes 
      SET leitner_box = ?, 
          next_review_at = NOW() + (INTERVAL '1 day' * ?),
          review_count = COALESCE(review_count, 0) + 1,
          last_reviewed_at = NOW()
      WHERE id = ? AND user_id = ?
    `).run(newBox, daysToAdd, id, userId);

    // XP ekle
    try {
      await db.prepare('UPDATE user_stats SET xp = COALESCE(xp, 0) + ? WHERE user_id = ?').run(xpEarned, userId);
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: isCorrect 
        ? (newBox === 5 ? 'Tebrikler! Soru Kalıcı Hafıza (5. Kutu) seviyesine ulaştı! +50 XP' : `Doğru cevap! Soru ${newBox}. Kutuya yükseldi. +${xpEarned} XP`)
        : 'Soru pekiştirilmek üzere 1. Kutuya alındı.',
      newBox,
      xpEarned
    });
  } catch (error: any) {
    console.error('Errors PUT Error:', error);
    return NextResponse.json({ error: 'Tekrar kaydedilirken sunucu hatası oluştu' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID parametresi eksik' }, { status: 400 });
    }

    await db.prepare('DELETE FROM student_mistakes WHERE id = ? AND user_id = ?').run(id, userId);
    return NextResponse.json({ success: true, message: 'Hata defterinden silindi.' });
  } catch (error) {
    console.error('Errors DELETE Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
