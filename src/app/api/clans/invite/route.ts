import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/yks-db-async';
import { v4 as uuidv4 } from 'uuid';

// GET - Gelen davetlerimi getir
export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('yks_session')?.value;
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    // Bu kullanıcıya gelen bekleyen davetler
    const invites = await db.prepare(`
      SELECT ci.id, ci.clan_id, ci.status, ci.created_at,
             c.name as clan_name, c.icon as clan_icon, c.color as clan_color,
             u.username as invited_by_username
      FROM clan_invites ci
      JOIN clans c ON ci.clan_id = c.id
      JOIN users u ON ci.invited_by = u.id
      WHERE ci.invited_user_id = ? AND ci.status = 'pending'
      ORDER BY ci.created_at DESC
    `).all(userId) as any[];

    return NextResponse.json({ invites });
  } catch (e) {
    console.error('Invite GET Error:', e);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// POST - Davet gönder (action: 'send') veya davete yanıt ver (action: 'accept'/'reject')
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('yks_session')?.value;
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const body = await req.json();
    const { action, inviteId, username } = body;

    // === DAVET GÖNDER ===
    if (action === 'send') {
      if (!username) return NextResponse.json({ error: 'Kullanıcı adı gerekli' }, { status: 400 });

      // Davet eden kişinin klanını bul (ve lider/üye olduğunu kontrol et)
      const myClan = await db.prepare(`
        SELECT cm.clan_id, cm.role, c.name FROM clan_members cm
        JOIN clans c ON cm.clan_id = c.id
        WHERE cm.user_id = ?
      `).get(userId) as any;

      if (!myClan) return NextResponse.json({ error: 'Önce bir klana üye olman gerekiyor' }, { status: 400 });

      // Davet edilecek kullanıcıyı bul
      const targetUser = await db.prepare('SELECT id FROM users WHERE username = ?').get(username) as any;
      if (!targetUser) return NextResponse.json({ error: `"${username}" adlı kullanıcı bulunamadı` }, { status: 404 });

      // Hedef kullanıcı zaten bir klana üye mi?
      const targetClan = await db.prepare('SELECT clan_id FROM clan_members WHERE user_id = ?').get(targetUser.id);
      if (targetClan) return NextResponse.json({ error: 'Bu kullanıcı zaten bir klana üye' }, { status: 400 });

      // Zaten bekleyen bir davet var mı?
      const existing = await db.prepare(
        "SELECT id FROM clan_invites WHERE clan_id = ? AND invited_user_id = ? AND status = 'pending'"
      ).get(myClan.clan_id, targetUser.id);
      if (existing) return NextResponse.json({ error: 'Bu kullanıcıya zaten davet gönderildi' }, { status: 400 });

      // Daveti oluştur
      const inviteId = uuidv4();
      await db.prepare(
        "INSERT INTO clan_invites (id, clan_id, invited_by, invited_user_id, status) VALUES (?, ?, ?, ?, 'pending')"
      ).run(inviteId, myClan.clan_id, userId, targetUser.id);

      return NextResponse.json({ success: true, message: `${username} adlı kullanıcıya ${myClan.name} klanına davet gönderildi!` });
    }

    // === DAVETE KABUL/RED ===
    if (action === 'accept' || action === 'reject') {
      if (!inviteId) return NextResponse.json({ error: 'Davet ID gerekli' }, { status: 400 });

      const invite = await db.prepare(
        "SELECT * FROM clan_invites WHERE id = ? AND invited_user_id = ? AND status = 'pending'"
      ).get(inviteId, userId) as any;
      if (!invite) return NextResponse.json({ error: 'Davet bulunamadı veya zaten yanıtlandı' }, { status: 404 });

      if (action === 'reject') {
        await db.prepare("UPDATE clan_invites SET status = 'rejected' WHERE id = ?").run(inviteId);
        return NextResponse.json({ success: true, message: 'Davet reddedildi' });
      }

      // KABUL ET: önce başka klana üye mi kontrol et
      const alreadyMember = await db.prepare('SELECT clan_id FROM clan_members WHERE user_id = ?').get(userId);
      if (alreadyMember) return NextResponse.json({ error: 'Zaten bir klana üyesin. Önce klanından ayrıl.' }, { status: 400 });

      // Klana ekle
      await db.prepare(
        "INSERT INTO clan_members (clan_id, user_id, role, weekly_contribution) VALUES (?, ?, 'member', 0)"
      ).run(invite.clan_id, userId);

      // Daveti güncelle
      await db.prepare("UPDATE clan_invites SET status = 'accepted' WHERE id = ?").run(inviteId);

      // Diğer bekleyen davetleri iptal et (kullanıcı artık bir klana sahip)
      await db.prepare("UPDATE clan_invites SET status = 'cancelled' WHERE invited_user_id = ? AND status = 'pending'").run(userId);

      return NextResponse.json({ success: true, message: 'Klana başarıyla katıldın! 🎉' });
    }

    return NextResponse.json({ error: 'Geçersiz aksiyon' }, { status: 400 });
  } catch (e) {
    console.error('Invite POST Error:', e);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
