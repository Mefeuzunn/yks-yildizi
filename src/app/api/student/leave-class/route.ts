import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { classId } = body;

    if (classId) {
      await db.prepare('DELETE FROM class_students WHERE class_id = ? AND student_id = ?').run(classId, userId);
    } else {
      await db.prepare('DELETE FROM class_students WHERE student_id = ?').run(userId);
    }

    return NextResponse.json({ success: true, message: 'Sınıftan başarıyla ayrıldınız.' }, { status: 200 });
  } catch (error: any) {
    console.error('Leave class error:', error);
    return NextResponse.json({ error: 'Sınıftan ayrılırken bir hata oluştu.' }, { status: 500 });
  }
}
