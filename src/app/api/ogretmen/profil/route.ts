import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedTeacherId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const teacherId = await getAuthenticatedTeacherId(req);
    if (!teacherId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const user = await db.prepare('SELECT * FROM users WHERE id = ? AND role = ?').get(teacherId, 'ogretmen') as any;
    if (!user) return NextResponse.json({ error: 'Öğretmen bulunamadı' }, { status: 404 });

    // Ensure teacher_profiles table exists
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS teacher_profiles (
        user_id TEXT PRIMARY KEY,
        brans TEXT DEFAULT '',
        bio TEXT DEFAULT '',
        phone TEXT DEFAULT '',
        email TEXT DEFAULT '',
        website TEXT DEFAULT '',
        avatar_url TEXT DEFAULT '',
        social_twitter TEXT DEFAULT '',
        social_linkedin TEXT DEFAULT '',
        experience_years INTEGER DEFAULT 0,
        specialties JSONB DEFAULT '[]',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    let profile = await db.prepare('SELECT * FROM teacher_profiles WHERE user_id = ?').get(teacherId) as any;
    if (!profile) {
      await db.prepare(`INSERT INTO teacher_profiles (user_id, email) VALUES (?, ?)`).run(teacherId, user.email || '');
      profile = await db.prepare('SELECT * FROM teacher_profiles WHERE user_id = ?').get(teacherId) as any;
    }

    // Stats
    const classCount = await db.prepare('SELECT COUNT(*) as cnt FROM teacher_classes WHERE teacher_id = ?').get(teacherId) as any;
    const studentCount = await db.prepare(`
      SELECT COUNT(DISTINCT cs.student_id) as cnt
      FROM class_students cs
      JOIN teacher_classes tc ON cs.class_id = tc.id
      WHERE tc.teacher_id = ?
    `).get(teacherId) as any;

    return NextResponse.json({
      username: user.username,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      profile: profile || {},
      stats: {
        classCount: classCount?.cnt || 0,
        studentCount: studentCount?.cnt || 0,
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const teacherId = await getAuthenticatedTeacherId(req);
    if (!teacherId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const body = await req.json();
    const { brans, bio, phone, email, website, social_twitter, social_linkedin, experience_years, specialties } = body;

    await db.prepare(`
      INSERT INTO teacher_profiles (user_id, brans, bio, phone, email, website, social_twitter, social_linkedin, experience_years, specialties)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (user_id) DO UPDATE SET
        brans = EXCLUDED.brans,
        bio = EXCLUDED.bio,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        website = EXCLUDED.website,
        social_twitter = EXCLUDED.social_twitter,
        social_linkedin = EXCLUDED.social_linkedin,
        experience_years = EXCLUDED.experience_years,
        specialties = EXCLUDED.specialties,
        updated_at = NOW()
    `).run(
      teacherId,
      brans || '', bio || '', phone || '', email || '',
      website || '', social_twitter || '', social_linkedin || '',
      experience_years || 0, JSON.stringify(specialties || [])
    );

    // Also update brans on users table
    if (brans) {
      await db.prepare('UPDATE users SET brans = ? WHERE id = ?').run(brans, teacherId);
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
