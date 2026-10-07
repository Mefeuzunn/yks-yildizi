import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { signToken } from '@/lib/jwt';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zncqndfghqkafuaswphq.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseAnonKey) {
      console.error('[Auth Callback] NEXT_PUBLIC_SUPABASE_ANON_KEY tanımlı değil.');
      return NextResponse.redirect(`${origin}/login?error=missing-supabase-key`);
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch {
              // Ignored if called from a read-only context
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.delete({ name, ...options });
            } catch {
              // Ignored if called from a read-only context
            }
          },
        },
      }
    );

    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && sessionData?.user) {
      const supaUser = sessionData.user;
      const email = supaUser.email || '';
      const meta = supaUser.user_metadata || {};
      const fullName = meta.full_name || meta.name || email.split('@')[0];

      // 1. Veritabanında kullanıcı var mı kontrol et (id veya email ile)
      let dbUser = await db.prepare('SELECT * FROM users WHERE id = ? OR LOWER(email) = LOWER(?)').get(supaUser.id, email) as any;

      const pendingGradeCookie = cookieStore.get('yks_pending_grade')?.value;
      const pendingRoleCookie = cookieStore.get('yks_pending_role')?.value;
      const pendingFieldCookie = cookieStore.get('yks_pending_field')?.value;

      const pendingGrade = pendingGradeCookie ? decodeURIComponent(pendingGradeCookie) : null;
      const pendingRole = pendingRoleCookie ? decodeURIComponent(pendingRoleCookie) : null;
      const pendingField = pendingFieldCookie ? decodeURIComponent(pendingFieldCookie) : null;

      const rawGrade = pendingGrade || meta.grade || '12. Sınıf';
      const sinifMap: Record<string, string> = {
        '9. Sınıf': '9', '10. Sınıf': '10', '11. Sınıf': '11', '12. Sınıf': '12', 'Mezun': 'Mezun',
        '9': '9', '10': '10', '11': '11', '12': '12'
      };
      const sinif = sinifMap[rawGrade] || (['9', '10', '11'].includes(meta.sinif) ? meta.sinif : '12');
      const alan = pendingField || ((sinif === '9' || sinif === '10') ? 'Yok' : (meta.field || meta.alan || 'Sayisal'));
      const role = pendingRole || (meta.role === 'teacher' || meta.role === 'ogretmen' ? 'ogretmen' : (meta.role === 'parent' || meta.role === 'veli' ? 'veli' : 'ogrenci'));
      const curriculumMode = (sinif === '9' || sinif === '10' || sinif === '11') ? 'maarif_v1' : 'legacy_yks';

      // Geçici seçim çerezlerini temizle
      cookieStore.delete('yks_pending_grade');
      cookieStore.delete('yks_pending_role');
      cookieStore.delete('yks_pending_field');

      if (!dbUser) {
        // Yeni Google Kullanıcısı oluştur
        let baseUsername = email.split('@')[0].trim().toLowerCase().replace(/[^a-z0-9_]/g, '') || 'ogrenci';
        const existingUsername = await db.prepare('SELECT id FROM users WHERE LOWER(username) = LOWER(?)').get(baseUsername);
        if (existingUsername) {
          baseUsername = `${baseUsername}_${Math.floor(100 + Math.random() * 900)}`;
        }

        const parentCode = crypto.randomBytes(4).toString('hex').toUpperCase();

        await db.prepare(`
          INSERT INTO users (id, username, password_hash, role, alan, sinif, email, parent_code, curriculum_mode)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          supaUser.id,
          baseUsername,
          'google_oauth_authenticated',
          role,
          alan,
          sinif,
          email,
          parentCode,
          curriculumMode
        );

        if (role === 'ogrenci') {
          await db.prepare(`
            INSERT INTO user_stats (user_id, solved_questions, success_rate, league, league_points, streak_days)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT (user_id) DO NOTHING
          `).run(supaUser.id, 0, 0, 'Bronz', 0, 0);
        }

        dbUser = {
          id: supaUser.id,
          username: baseUsername,
          role,
          sinif,
          alan,
          curriculum_mode: curriculumMode
        };
      } else {
        // Mevcut kullanıcı - curriculum_mode eksikse güncelle
        if (!dbUser.curriculum_mode) {
          const computedMode = (dbUser.sinif === '9' || dbUser.sinif === '10' || dbUser.sinif === '11') ? 'maarif_v1' : 'legacy_yks';
          await db.prepare('UPDATE users SET curriculum_mode = ? WHERE id = ?').run(computedMode, dbUser.id);
          dbUser.curriculum_mode = computedMode;
        }
      }

      // 2. YKS Yıldızı JWT Token oluştur ve çerezlere yaz
      const token = await signToken({ userId: dbUser.id, role: dbUser.role });
      const cookieOpts = {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 gün
        path: '/'
      };

      cookieStore.set('yks_session', token, { ...cookieOpts, httpOnly: true });
      cookieStore.set('yks_role', dbUser.role, { ...cookieOpts, httpOnly: false });
      cookieStore.set('yks_curriculum_mode', dbUser.curriculum_mode, { ...cookieOpts, httpOnly: false });
      cookieStore.set('yks_sinif', dbUser.sinif || '', { ...cookieOpts, httpOnly: false });

      // 3. Hedef Paneli Belirle (Maarif vs YKS vs Öğretmen vs Veli)
      let targetUrl = '/dashboard';
      if (dbUser.role === 'ogretmen') {
        targetUrl = '/ogretmen/dashboard';
      } else if (dbUser.role === 'veli') {
        targetUrl = '/veli';
      } else if (dbUser.curriculum_mode === 'maarif_v1' || ['9', '10', '11'].includes(dbUser.sinif)) {
        targetUrl = '/maarif';
      }

      return NextResponse.redirect(`${origin}${targetUrl}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}
