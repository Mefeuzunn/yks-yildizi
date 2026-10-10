import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { evaluateQuestionSpeed, getSubjectBenchmark } from '@/lib/speed-benchmarks';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

let tableInitialized = false;

async function ensureTable() {
  if (tableInitialized) return;
  try {
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
    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_qspeed_user ON question_speed_logs (user_id)
    `).run();
    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_qspeed_user_subj ON question_speed_logs (user_id, subject)
    `).run();
    tableInitialized = true;
  } catch (err) {
    console.error('Error creating question_speed_logs table:', err);
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    await ensureTable();

    const body = await req.json();
    const { 
      question_id, 
      subject = 'Matematik', 
      topic = 'Genel', 
      duration_seconds = 0, 
      is_correct = false 
    } = body;

    const parsedSeconds = Math.max(1, Math.min(3600, Number(duration_seconds) || 0));
    const benchmark = getSubjectBenchmark(subject);
    const evaluation = evaluateQuestionSpeed(subject, parsedSeconds);
    const logId = uuidv4();

    await db.prepare(`
      INSERT INTO question_speed_logs (
        id, user_id, question_id, subject, topic, 
        duration_seconds, is_correct, speed_rating, target_seconds
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      logId,
      userId,
      question_id || null,
      subject,
      topic,
      parsedSeconds,
      Boolean(is_correct),
      evaluation.rating,
      benchmark.targetSeconds
    );

    return NextResponse.json({
      success: true,
      logId,
      evaluation: {
        rating: evaluation.rating,
        label: evaluation.label,
        badgeText: evaluation.badgeText,
        color: evaluation.color,
        differenceSeconds: evaluation.differenceSeconds,
        targetSeconds: benchmark.targetSeconds,
        durationSeconds: parsedSeconds,
        advice: evaluation.advice,
      }
    });
  } catch (err: any) {
    console.error('speed-log POST error:', err);
    return NextResponse.json({ error: err.message || 'Kayıt başarısız' }, { status: 500 });
  }
}
