import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }

    // Ensure teacher_student_notes table exists
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS teacher_student_notes (
        id SERIAL PRIMARY KEY,
        teacher_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        note TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'genel',
        is_shared_with_parent BOOLEAN DEFAULT true,
        parent_read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run().catch(() => {});

    // Fetch notes written for this student
    const notes = await db.prepare(`
      SELECT 
        tsn.id,
        tsn.teacher_id,
        tsn.student_id,
        tsn.note,
        tsn.category,
        tsn.created_at,
        u.username as teacher_name,
        COALESCE(u.brans, 'Öğretmen') as teacher_brans
      FROM teacher_student_notes tsn
      JOIN users u ON tsn.teacher_id = u.id
      WHERE tsn.student_id = ?
      ORDER BY tsn.created_at DESC
    `).all(userId) as any[];

    return NextResponse.json({
      success: true,
      notes: notes || []
    });
  } catch (error: any) {
    console.error('Öğrenci öğretmen notları çekme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
