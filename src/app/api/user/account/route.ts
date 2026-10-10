import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function DELETE(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Kullanıcıyı veritabanından sil
    await db.prepare('DELETE FROM users WHERE id = ?').run(userId);

    // Çerezi temizle
    const cookieStore = await cookies();
    cookieStore.delete('yks_session');

    return NextResponse.json({
      success: true,
      message: 'Hesabınız ve tüm ilişkili veriler kalıcı olarak silindi.'
    });
  } catch (error: any) {
    console.error('Account delete error:', error);
    return NextResponse.json({ error: 'Hesap silinirken hata oluştu' }, { status: 500 });
  }
}
