import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import db from '@/lib/yks-db-async';

/**
 * Merkezi kimlik doğrulama yardımcısı.
 * JWT token'ı çözüp gerçek user ID'yi döndürür.
 * Hem öğrenci hem öğretmen API'lerinde kullanılabilir.
 */
export async function getAuthenticatedUserId(req?: Request): Promise<string | null> {
  // 1. Cookie'den token al
  const cookieStore = await cookies();
  let token = cookieStore.get('yks_session')?.value;

  // 2. Authorization header (mobil uygulama için fallback)
  if (!token && req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return null;

  // 3. JWT çöz → gerçek userId al
  try {
    const payload = await verifyToken(token);
    if (payload?.userId) return payload.userId as string;
  } catch (_) {}

  // 4. Legacy fallback: token zaten raw UUID ise direkt kullan
  // (UUID formatı: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
  if (/^[0-9a-f-]{36}$/.test(token)) return token;

  return null;
}

/**
 * Öğretmen kimlik doğrulaması.
 * Kullanıcı ID'sini döndürür. Rol kontrolü API içinde yapılmalı.
 */
export async function getAuthenticatedTeacherId(req?: Request): Promise<string | null> {
  return getAuthenticatedUserId(req);
}

/**
 * Tam kullanıcı objesini döndürür (rol kontrolü dahil).
 */
export async function getAuthenticatedUser(req?: Request): Promise<{ id: string; role: string; username: string } | null> {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return null;
  try {
    const user = await db.prepare('SELECT id, role, username FROM users WHERE id = ?').get(userId) as any;
    return user ?? null;
  } catch (_) {
    return null;
  }
}
