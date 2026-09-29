import { NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { getStudentMemory } from '@/lib/ai/studentMemoryEngine';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const memory = await getStudentMemory(userId);
    if (!memory) {
      return NextResponse.json({ success: false, memory: null }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      memory: {
        username: memory.username,
        alan: memory.alan,
        sinif: memory.sinif,
        targetUniversity: memory.targetUniversity,
        targetDepartment: memory.targetDepartment,
        daysToYKS: memory.daysToYKS,
        avgTytNet: memory.avgTytNet,
        avgAytNet: memory.avgAytNet,
        netTrend: memory.netTrend,
        weakCount: memory.weakTopics.length,
        topWeak: memory.weakTopics[0] || null,
        weeklyFocusMinutes: memory.weeklyFocusMinutes,
        streakDays: memory.streakDays,
        league: memory.league
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('AstraTutor Memory GET Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
