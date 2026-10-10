import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { SPEED_BENCHMARKS, getSubjectBenchmark, evaluateQuestionSpeed } from '@/lib/speed-benchmarks';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Ensure table exists
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS question_speed_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        question_id TEXT,
        subject TEXT NOT NULL,
        topic TEXT,
        duration_seconds INTEGER NOT NULL,
        is_correct BOOLEAN NOT NULL,
        speed_rating TEXT,
        target_seconds INTEGER DEFAULT 75,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // 1. Overall count and metrics
    const overallQuery = await db.prepare(`
      SELECT 
        COUNT(*) as total_count,
        COALESCE(AVG(duration_seconds), 0) as avg_duration,
        COALESCE(SUM(duration_seconds), 0) as total_seconds,
        SUM(CASE WHEN is_correct = true THEN 1 ELSE 0 END) as correct_count,
        SUM(CASE WHEN speed_rating IN ('fast', 'ideal') THEN 1 ELSE 0 END) as ideal_count,
        SUM(CASE WHEN speed_rating = 'fast' THEN 1 ELSE 0 END) as fast_count,
        SUM(CASE WHEN speed_rating = 'ideal' THEN 1 ELSE 0 END) as exactly_ideal_count,
        SUM(CASE WHEN speed_rating = 'normal' THEN 1 ELSE 0 END) as normal_count,
        SUM(CASE WHEN speed_rating = 'slow' THEN 1 ELSE 0 END) as slow_count
      FROM question_speed_logs
      WHERE user_id = ?
    `).get(userId) as any;

    const totalQuestions = Number(overallQuery?.total_count || 0);

    // 2. Accuracy by speed category
    const speedAccuracyQuery = await db.prepare(`
      SELECT 
        speed_rating,
        COUNT(*) as total,
        SUM(CASE WHEN is_correct = true THEN 1 ELSE 0 END) as correct
      FROM question_speed_logs
      WHERE user_id = ?
      GROUP BY speed_rating
    `).all(userId) as any[];

    const speedAccMap: Record<string, { total: number; correct: number; rate: number }> = {
      fast: { total: 0, correct: 0, rate: 0 },
      ideal: { total: 0, correct: 0, rate: 0 },
      normal: { total: 0, correct: 0, rate: 0 },
      slow: { total: 0, correct: 0, rate: 0 },
    };

    (speedAccuracyQuery || []).forEach(row => {
      const rating = row.speed_rating || 'normal';
      const tot = Number(row.total || 0);
      const cor = Number(row.correct || 0);
      const rate = tot > 0 ? Math.round((cor / tot) * 100) : 0;
      if (speedAccMap[rating]) {
        speedAccMap[rating] = { total: tot, correct: cor, rate };
      }
    });

    // 3. Subject-level Breakdown
    const subjectStatsQuery = await db.prepare(`
      SELECT 
        subject,
        COUNT(*) as count,
        ROUND(AVG(duration_seconds)) as avg_duration,
        SUM(CASE WHEN is_correct = true THEN 1 ELSE 0 END) as correct_count
      FROM question_speed_logs
      WHERE user_id = ?
      GROUP BY subject
      ORDER BY count DESC
    `).all(userId) as any[];

    // Map all primary YKS subjects
    const subjectKeys = Object.keys(SPEED_BENCHMARKS);
    const subjectBreakdown = subjectKeys.map(key => {
      const benchmark = SPEED_BENCHMARKS[key];
      const found = (subjectStatsQuery || []).find(
        (s: any) => s.subject?.toLowerCase() === key.toLowerCase() ||
                    s.subject?.toLowerCase().includes(key.toLowerCase())
      );

      if (found) {
        const count = Number(found.count);
        const avgSec = Number(found.avg_duration);
        const correct = Number(found.correct_count);
        const acc = count > 0 ? Math.round((correct / count) * 100) : 0;
        const evalResult = evaluateQuestionSpeed(key, avgSec);

        return {
          subject: key,
          nameTr: benchmark.nameTr,
          icon: benchmark.icon,
          category: benchmark.category,
          questionCount: count,
          avgSeconds: avgSec,
          targetSeconds: benchmark.targetSeconds,
          differenceSeconds: avgSec - benchmark.targetSeconds,
          rating: evalResult.rating,
          badgeText: evalResult.badgeText,
          color: evalResult.color,
          accuracy: acc,
          hasData: true,
        };
      }

      // Default baseline when user has not solved that subject yet
      return {
        subject: key,
        nameTr: benchmark.nameTr,
        icon: benchmark.icon,
        category: benchmark.category,
        questionCount: 0,
        avgSeconds: benchmark.targetSeconds,
        targetSeconds: benchmark.targetSeconds,
        differenceSeconds: 0,
        rating: 'ideal' as const,
        badgeText: 'Hedef',
        color: '#38bdf8',
        accuracy: 0,
        hasData: false,
      };
    });

    // 4. Topic-level Bottlenecks (Zaman Tuzakları - Slowest Topics)
    const topicBottlenecksQuery = await db.prepare(`
      SELECT 
        subject,
        topic,
        COUNT(*) as count,
        ROUND(AVG(duration_seconds)) as avg_duration,
        ROUND(AVG(target_seconds)) as avg_target,
        SUM(CASE WHEN is_correct = true THEN 1 ELSE 0 END) as correct_count
      FROM question_speed_logs
      WHERE user_id = ?
      GROUP BY subject, topic
      HAVING COUNT(*) >= 1
      ORDER BY (AVG(duration_seconds) - AVG(target_seconds)) DESC
      LIMIT 8
    `).all(userId) as any[];

    const topicBottlenecks = (topicBottlenecksQuery || []).map(t => {
      const count = Number(t.count);
      const avgDur = Number(t.avg_duration);
      const avgTgt = Number(t.avg_target || 75);
      const diff = avgDur - avgTgt;
      const acc = count > 0 ? Math.round((Number(t.correct_count) / count) * 100) : 0;

      return {
        subject: t.subject,
        topic: t.topic || 'Genel Konu',
        count,
        avgDuration: avgDur,
        targetSeconds: avgTgt,
        differenceSeconds: diff,
        isSlowerThanTarget: diff > 0,
        accuracy: acc,
      };
    });

    // 5. Calculate AI insights & recommendations
    const avgDuration = Math.round(Number(overallQuery?.avg_duration || 0));
    const totalCorrect = Number(overallQuery?.correct_count || 0);
    const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const idealRate = totalQuestions > 0 ? Math.round((Number(overallQuery?.ideal_count || 0) / totalQuestions) * 100) : 100;

    const recommendations: string[] = [];
    if (totalQuestions === 0) {
      recommendations.push(
        'Henüz zaman analizi verisi kaydedilmedi. "Parametrik Soru Çöz" sayfasından soru çözerek ÖSYM hız profilini oluşturmaya başla!'
      );
      recommendations.push(
        'ÖSYM sınavında Türkçe paragraf soruları için ideal süre 60-65 saniyedir. Hızınızı bu hedefe sabitleyin.'
      );
      recommendations.push(
        'Matematikte yeni nesil sorular için soru başına 95-105 saniye ideal aralıktır.'
      );
    } else {
      if (idealRate >= 75) {
        recommendations.push(
          `Tebrikler! Sorularının %${idealRate}'sini ÖSYM ideal/tempolu süresinde çözüyorsun. Bu tempo sana gerçek sınavda 15+ dakika fazladan kontrol zamanı kazandırır.`
        );
      } else {
        recommendations.push(
          `Soru çözümlerinin %${100 - idealRate}'i hedef sürenin üzerinde kalıyor. Soru köküne odaklanıp turlama taktiğini devreye alarak 10-15 saniye hız kazanabilirsin.`
        );
      }

      if (speedAccMap.fast.total >= 3 && speedAccMap.fast.rate < 60) {
        recommendations.push(
          `Hızlı çözdüğün sorularda başarı oranın %${speedAccMap.fast.rate} seviyesinde. Hızlanırken soru köklerindeki olumsuz ifadeleri (yoktur, değildir) atlamamaya özen göster.`
        );
      }

      const slowestSubject = subjectBreakdown.filter(s => s.hasData).sort((a, b) => b.differenceSeconds - a.differenceSeconds)[0];
      if (slowestSubject && slowestSubject.differenceSeconds > 10) {
        recommendations.push(
          `${slowestSubject.nameTr} dersinde ortalama ${slowestSubject.avgSeconds} sn harcıyorsun (Hedef: ${slowestSubject.targetSeconds} sn). Bu derse özel pratik soru turları yapmalısın.`
        );
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalQuestions,
        avgDuration,
        totalTimeSpentMinutes: Math.round(Number(overallQuery?.total_seconds || 0) / 60),
        overallAccuracy,
        idealRate,
        distribution: {
          fast: Number(overallQuery?.fast_count || 0),
          ideal: Number(overallQuery?.exactly_ideal_count || 0),
          normal: Number(overallQuery?.normal_count || 0),
          slow: Number(overallQuery?.slow_count || 0),
        },
        speedAccuracy: speedAccMap,
      },
      subjectBreakdown,
      topicBottlenecks,
      recommendations,
    });
  } catch (err: any) {
    console.error('speed-stats GET error:', err);
    return NextResponse.json({ error: err.message || 'İstatistikler alınamadı' }, { status: 500 });
  }
}
