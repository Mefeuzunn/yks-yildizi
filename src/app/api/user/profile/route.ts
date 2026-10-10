import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const user = await db.prepare(`
      SELECT id, username, email, role, alan, sinif, brans, kurum,
             target_university, target_department, parent_code, created_at, curriculum_mode
      FROM users WHERE id = ?
    `).get(userId) as any;

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    const settings = await db.prepare(`
      SELECT theme, accent_color, avatar_seed, email_notifications, duel_requests
      FROM user_settings WHERE user_id = ?
    `).get(userId) as any;

    return NextResponse.json({
      success: true,
      user,
      settings: settings || {
        theme: 'dark',
        accent_color: '#38bdf8',
        avatar_seed: 'Felix',
        email_notifications: 1,
        duel_requests: 1
      }
    });
  } catch (error: any) {
    console.error('Profile GET Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const {
      alan,
      sinif,
      target_university,
      target_department,
      email,
      brans,
      kurum
    } = body;

    // Alan ve sınıf kontrolleri
    const validAlans = ['Sayisal', 'Esit Agirlik', 'Sozel', 'Dil', 'Yok'];
    const validSinifs = ['9', '10', '11', '12', 'Mezun'];

    // Mevcut kullanıcıyı çek
    const currentUser = await db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    if (!currentUser) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    const newAlan = alan && validAlans.includes(alan) ? alan : currentUser.alan;
    const newSinif = sinif && validSinifs.includes(sinif) ? sinif : currentUser.sinif;
    const newTargetUni = target_university !== undefined ? target_university : currentUser.target_university;
    const newTargetDept = target_department !== undefined ? target_department : currentUser.target_department;
    const newEmail = email !== undefined ? (email ? email.trim() : null) : currentUser.email;
    const newBrans = brans !== undefined ? brans : currentUser.brans;
    const newKurum = kurum !== undefined ? kurum : currentUser.kurum;

    // Maarif Modeli / YKS Modu Otomatik Belirleme
    const newCurriculumMode = (newSinif === '9' || newSinif === '10' || newSinif === '11')
      ? 'maarif_v1'
      : 'legacy_yks';

    await db.prepare(`
      UPDATE users 
      SET alan = ?, sinif = ?, target_university = ?, target_department = ?,
          email = ?, brans = ?, kurum = ?, curriculum_mode = ?
      WHERE id = ?
    `).run(newAlan, newSinif, newTargetUni, newTargetDept, newEmail, newBrans, newKurum, newCurriculumMode, userId);

    return NextResponse.json({
      success: true,
      message: 'Profil bilgileri başarıyla güncellendi.',
      user: {
        id: userId,
        username: currentUser.username,
        email: newEmail,
        role: currentUser.role,
        alan: newAlan,
        sinif: newSinif,
        target_university: newTargetUni,
        target_department: newTargetDept,
        curriculum_mode: newCurriculumMode,
        brans: newBrans,
        kurum: newKurum,
        parent_code: currentUser.parent_code
      }
    });
  } catch (error: any) {
    console.error('Profile PUT Error:', error);
    return NextResponse.json({ error: 'Profil güncellenirken hata oluştu' }, { status: 500 });
  }
}
