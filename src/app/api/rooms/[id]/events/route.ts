import { NextRequest } from 'next/server';
import { roomEmitter, RoomBroadcastEvent } from '@/lib/room-events';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: roomId } = await params;

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // Helper to send formatted SSE message
  const sendEvent = async (event: RoomBroadcastEvent | { type: string; data?: any }) => {
    try {
      const payload = `data: ${JSON.stringify(event)}\n\n`;
      await writer.write(encoder.encode(payload));
    } catch (_) {
      // Writer might be closed
    }
  };

  // Event listener for room broadcasts
  const listener = (event: RoomBroadcastEvent) => {
    sendEvent(event);
  };

  roomEmitter.on(`room:${roomId}`, listener);

  // Send initial connection event
  sendEvent({ type: 'connected', data: { roomId, timestamp: Date.now() } });

  // Keep-alive heartbeat every 15 seconds
  const heartbeat = setInterval(() => {
    try {
      writer.write(encoder.encode(': ping\n\n'));
    } catch (_) {
      clearInterval(heartbeat);
    }
  }, 15000);

  // Clean up when client disconnects
  req.signal.addEventListener('abort', () => {
    clearInterval(heartbeat);
    roomEmitter.off(`room:${roomId}`, listener);
    try {
      writer.close();
    } catch (_) {}
  });

  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // For Nginx / proxy environments
    },
  });
}
