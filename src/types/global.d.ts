import type { Server } from 'socket.io';

declare global {
  var io: Server | undefined;
  var onlineUsers: Map<string, { socketId: string; lastSeen: Date }> | undefined;
}

export {};
