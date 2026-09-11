// Basit In-Memory Rate Limiter (Redis olmayan ortamlar için)
// Not: Vercel serverless ortamında global değişkenler her istekte sıfırlanabilir.
// Gerçek Prodüksiyon için Upstash Redis veya KV kullanılması önerilir.

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

export function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  
  // Clean up expired entries occasionally to prevent memory leaks
  if (Math.random() < 0.05) {
    for (const key in store) {
      if (store[key].resetAt < now) {
        delete store[key];
      }
    }
  }

  const record = store[identifier];

  if (!record || record.resetAt < now) {
    store[identifier] = {
      count: 1,
      resetAt: now + windowMs,
    };
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: store[identifier].resetAt,
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: record.resetAt,
    };
  }

  record.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - record.count,
    reset: record.resetAt,
  };
}
