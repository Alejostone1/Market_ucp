import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;
let currentUserId: string | null = null;

const SOCKET_ENABLED = process.env.NEXT_PUBLIC_SOCKET_ENABLED === 'true';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || '';

export function getSocket(userId: string): Socket | null {
  if (!SOCKET_ENABLED || !SOCKET_URL) return null;

  if (socketInstance?.connected && currentUserId === userId) {
    return socketInstance;
  }

  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }

  currentUserId = userId;

  socketInstance = io(SOCKET_URL, {
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
