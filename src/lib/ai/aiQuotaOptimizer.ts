import crypto from 'crypto';
import db from '@/lib/yks-db-async';

// ── In-Memory Fast Cooldown & Daily Counter ──
interface UserUsage {
  lastRequestTime: number;
  dailyCounts: {
    chat: number;
    photo: number;
    exam: number;
    plan: number;
  };
  dayResetAt: number;
}

const userUsageStore = new Map<string, UserUsage>();

// Soft limits to guarantee free tier survival across all users
const DAILY_LIMITS = {
  chat: 40,   // Max 40 Gemini chats per user per day
  photo: 20,  // Max 20 photo solutions per user per day
  exam: 10,   // Max 10 exam analyses per user per day
  plan: 5     // Max 5 weekly plan generations per user per day
};

const COOLDOWN_MS = 3000; // 3-second cooldown between requests

let isTableInitialized = false;

export async function initAiCacheTable() {
  if (isTableInitialized) return;
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS ai_cache (
        id TEXT PRIMARY KEY,
        cache_type TEXT NOT NULL,
        prompt_hash TEXT,
        response_data JSONB NOT NULL,
        hit_count INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP
      )
    `).run();
    isTableInitialized = true;
  } catch (e) {
    console.error('Failed to initialize ai_cache table:', e);
  }
}

/**
 * Generate a deterministic hash for any string (prompt, image signature, exam id)
 */
export function hashString(str: string): string {
  return crypto.createHash('sha256').update(str.trim().toLowerCase()).digest('hex');
}

/**
 * Retrieve cached AI response from PostgreSQL
 */
export async function getCachedAiResponse<T = any>(cacheKey: string): Promise<T | null> {
  try {
    await initAiCacheTable();
    const row = await db.prepare(`
      SELECT response_data 
      FROM ai_cache 
      WHERE id = ? AND (expires_at IS NULL OR expires_at > NOW())
    `).get(cacheKey) as any;

    if (row && row.response_data) {
      // Asynchronously increment hit count
      db.prepare('UPDATE ai_cache SET hit_count = hit_count + 1 WHERE id = ?').run(cacheKey).catch(() => {});
      return typeof row.response_data === 'string' ? JSON.parse(row.response_data) : row.response_data;
    }
  } catch (e) {
    console.warn('Cache retrieval error (non-fatal):', e);
  }
  return null;
}

/**
 * Save an AI response to cache with optional TTL
 */
export async function setCachedAiResponse(
  cacheKey: string, 
  cacheType: 'chat' | 'solve_photo' | 'exam_analysis' | 'study_plan',
  responseData: any, 
  ttlDays: number = 14
): Promise<void> {
  try {
    await initAiCacheTable();
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000).toISOString();
    const jsonStr = JSON.stringify(responseData);

    await db.prepare(`
      INSERT INTO ai_cache (id, cache_type, prompt_hash, response_data, expires_at)
      VALUES (?, ?, ?, ?::jsonb, ?::timestamp)
      ON CONFLICT (id) DO UPDATE SET
        response_data = EXCLUDED.response_data,
        expires_at = EXCLUDED.expires_at,
        hit_count = ai_cache.hit_count + 1
    `).run(cacheKey, cacheType, cacheKey, jsonStr, expiresAt);
  } catch (e) {
    console.warn('Cache write error (non-fatal):', e);
  }
}

/**
 * Detect simple greetings, gratitude, and navigation prompts that should be handled 
 * 100% locally with zero Gemini tokens.
 */
export function isLocalHandledPrompt(rawPrompt: string): boolean {
  const p = rawPrompt.trim().toLowerCase();
  
  // Single word or very short greetings
  const greetings = ['selam', 'merhaba', 'merhabalar', 'selamlar', 'hey', 'günaydın', 'iyi günler', 'iyi akşamlar', 'naber', 'nasılsın', 'kimsin', 'adın ne'];
  if (greetings.includes(p)) return true;

  // Single word or short gratitude / confirmation
  const gratitude = ['sağol', 'sağ ol', 'teşekkürler', 'teşekkür ederim', 'eyvallah', 'tamam', 'anladım', 'harika', 'süper', 'peki', 'ok', 'anlaştık'];
  if (gratitude.includes(p)) return true;

  // Quick suggestion chips which have dedicated local hyper-personalized generators
  if (
    p.includes('bugünkü reçetem ne') ||
    p.includes('durumum nasıl') ||
    p.includes('hedefime ne kadar var') ||
    p.includes('netlerimi nasıl artırırım')
  ) {
    return true;
  }

  // System navigation inquiries (can be served by local knowledge base)
  if (
    p.includes('nasıl soru çözerim') ||
    p.includes('deneme nasıl eklenir') ||
    p.includes('pomodoro nedir') ||
    p.includes('hata defteri nerede')
  ) {
    return true;
  }

  return false;
}

/**
 * Check user fair-share usage limits to guarantee 100% free tier safety
 */
export function checkAiRateLimit(
  userId: string, 
  type: 'chat' | 'photo' | 'exam' | 'plan'
): { allowed: boolean; reason?: string } {
  const now = Date.now();
  const dayStart = new Date().setHours(0, 0, 0, 0);

  let usage = userUsageStore.get(userId);

  if (!usage || usage.dayResetAt < dayStart) {
    usage = {
      lastRequestTime: 0,
      dailyCounts: { chat: 0, photo: 0, exam: 0, plan: 0 },
      dayResetAt: dayStart + 24 * 60 * 60 * 1000
    };
    userUsageStore.set(userId, usage);
  }

  // Cooldown check (prevent burst double-clicks)
  if (now - usage.lastRequestTime < COOLDOWN_MS) {
    return {
      allowed: false,
      reason: 'Lütfen ardışık istekler arasında birkaç saniye bekleyin.'
    };
  }

  // Daily soft quota check
  const maxLimit = DAILY_LIMITS[type];
  if (usage.dailyCounts[type] >= maxLimit) {
    return {
      allowed: false,
      reason: `Bugün için ${type === 'photo' ? 'fotoğraflı soru çözme' : 'AI koçluk'} kotanıza ulaştınız (${maxLimit}/${maxLimit}). Yarın kotanız yenilenecektir.`
    };
  }

  // Register usage
  usage.lastRequestTime = now;
  usage.dailyCounts[type] += 1;

  return { allowed: true };
}
