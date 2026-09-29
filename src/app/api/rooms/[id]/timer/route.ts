import { NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { broadcastRoomEvent } from '@/lib/room-events';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: roomId } = await params;
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const body = await req.json();
    const { timerState, timeLeft } = body;

    // Broadcast timer state change to other participants in this room
    broadcastRoomEvent(roomId, 'update-timer', {
      timerState,
      timeLeft,
      updatedBy: userId,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Room Timer POST Error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
