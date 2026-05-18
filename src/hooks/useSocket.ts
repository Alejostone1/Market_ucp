"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';

export function useSocket() {
  const { usuario, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !usuario?.id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    import('@/lib/socket-client').then(({ getSocket }) => {
      const sock = getSocket(usuario.id);
      if (!sock) return;

      socketRef.current = sock;

      const onConnect = () => setIsConnected(true);
      const onDisconnect = () => setIsConnected(false);

      sock.on('connect', onConnect);
      sock.on('disconnect', onDisconnect);

      if (sock.connected) setIsConnected(true);

      return () => {
        sock.off('connect', onConnect);
        sock.off('disconnect', onDisconnect);
      };
    });
  }, [isAuthenticated, usuario?.id]);

  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('conversation:join', conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('conversation:leave', conversationId);
  }, []);

  const startTyping = useCallback((conversationId: string) => {
    socketRef.current?.emit('typing:start', { conversationId });
  }, []);

  const stopTyping = useCallback((conversationId: string) => {
    socketRef.current?.emit('typing:stop', { conversationId });
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
  };
}
