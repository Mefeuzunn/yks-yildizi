import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });

    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    if (!user || user.role !== 'ogrenci') return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });

    const { invite_code } = await request.json();
    if (!invite_code?.trim()) return NextResponse.json({ error: 'Davet kodu gerekli' }, { status: 400 });

    const teacher = await db.prepare('SELECT id FROM users WHERE role = ? AND invite_code = ?').get('ogretmen', invite_code.toUpperCase().trim()) as any;
    
    if (!teacher) {
      return NextResponse.json({ error: 'Geçersiz davet kodu' }, { status: 404 });
    }

    const existing = await db.prepare('SELECT * FROM teacher_students WHERE teacher_id = ? AND student_id = ?').get(teacher.id, user.id);
    if (existing) {
      return NextResponse.json({ error: 'Zaten bu öğretmene bağlısınız' }, { status: 400 });
    }

    await db.prepare('INSERT INTO teacher_students (teacher_id, student_id) VALUES (?, ?)').run(teacher.id, user.id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Öğretmen ekleme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
