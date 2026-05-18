import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;
let currentUserId: string | null = null;

export function getSocket(userId: string): Socket {
  if (socketInstance?.connected && currentUserId === userId) {
    return socketInstance;
  }

  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }

  currentUserId = userId;

  socketInstance = io({
    auth: { userId },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    reconnectionDelayMax: 5000,
  });

  return socketInstance;
}

export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
    currentUserId = null;
  }
}

export function getActiveSocket(): Socket | null {
  return socketInstance;
}
