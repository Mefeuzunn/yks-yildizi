import { EventEmitter } from 'events';

// Global singleton across HMR in development
const globalForRooms = global as unknown as { roomEmitter?: EventEmitter };
export const roomEmitter = globalForRooms.roomEmitter || new EventEmitter();
roomEmitter.setMaxListeners(300);

if (process.env.NODE_ENV !== 'production') {
  globalForRooms.roomEmitter = roomEmitter;
}

export interface RoomBroadcastEvent {
  type: 'new-message' | 'room-users' | 'update-timer' | 'library-interaction';
  data: any;
}

export function broadcastRoomEvent(roomId: string, type: RoomBroadcastEvent['type'], data: any) {
  roomEmitter.emit(`room:${roomId}`, { type, data });
}
