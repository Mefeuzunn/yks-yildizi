import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { MASCOTS, getEquippedMascot, getUnlockedMascots, getNextMascot, getMascotById } from '@/lib/mascots';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }

    const stats = await db.prepare(
      'SELECT xp, pofuduk_level, pofuduk_energy, pofuduk_happiness, active_mascot FROM user_stats WHERE user_id = ?'
    ).get(userId) as any;

    const currentXp = stats?.xp || 0;
    const activeMascotId = stats?.active_mascot;
    const equipped = getEquippedMascot(activeMascotId, currentXp);
    const unlocked = getUnlockedMascots(currentXp);
    const nextMascot = getNextMascot(currentXp);

    return NextResponse.json({
      success: true,
      currentXp,
      equippedMascot: equipped,
      unlockedMascots: unlocked,
      allMascots: MASCOTS,
      nextMascot,
      happiness: stats?.pofuduk_happiness ?? 85,
      energy: stats?.pofuduk_energy ?? 70,
      level: stats?.pofuduk_level ?? equipped.level
    });
  } catch (error: any) {
    console.error('Mascot GET Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }

    const body = await req.json();
    const { mascotId } = body;

    if (!mascotId) {
      return NextResponse.json({ error: 'Maskot ID gereklidir' }, { status: 400 });
    }

    const mascot = getMascotById(mascotId);
    if (!mascot) {
      return NextResponse.json({ error: 'Geçersiz maskot' }, { status: 404 });
    }

    const stats = await db.prepare(
      'SELECT xp FROM user_stats WHERE user_id = ?'
    ).get(userId) as any;

    const currentXp = stats?.xp || 0;
    if (currentXp < mascot.requiredXp) {
      return NextResponse.json({
        error: `Bu maskot için ${mascot.requiredXp} XP gereklidir (Mevcut XP: ${currentXp})`,
        requiredXp: mascot.requiredXp,
        currentXp
      }, { status: 403 });
    }

    // Update active_mascot in user_stats
    await db.prepare(
      'UPDATE user_stats SET active_mascot = ? WHERE user_id = ?'
    ).run(mascot.id, userId);

    return NextResponse.json({
      success: true,
      message: `${mascot.name} (${mascot.nickname}) aktif çalışma dostun olarak seçildi!`,
      equippedMascot: mascot
    });
  } catch (error: any) {
    console.error('Mascot POST Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
