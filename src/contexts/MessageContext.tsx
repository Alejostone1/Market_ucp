"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

interface OtherUser {
  id: string;
  nombre: string;
  correo: string;
  avatarUrl: string | null;
}

interface Conversacion {
  id: string;
  otherUser: OtherUser;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
}

interface MessageContextType {
  unreadCount: number;
  conversaciones: Conversacion[];
  refreshMessages: () => Promise<void>;
  loading: boolean;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: ReactNode }) {
  const { usuario, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshMessages = useCallback(async () => {
    if (!usuario?.id) {
      setUnreadCount(0);
      setConversaciones([]);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/conversaciones");
      if (res.ok) {
        const data: Conversacion[] = await res.json();
        setConversaciones(data);
        const total = data.reduce((sum, c) => sum + c.unread, 0);
        setUnreadCount(total);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [usuario?.id]);

  // Initial load and refresh when user changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshMessages();
    } else {
      setUnreadCount(0);
      setConversaciones([]);
    }
  }, [isAuthenticated, refreshMessages]);

  // Subscribe to socket events to update unread count in real time
  useEffect(() => {
    if (!isAuthenticated || !usuario?.id) return;

    let cleanupFn: (() => void) | undefined;

    import("@/lib/socket-client").then(({ getSocket }) => {
      const socket = getSocket(usuario.id);
      if (!socket) return;

      const onConversationUpdated = () => {
        refreshMessages();
      };

      const onMessageNew = (msg: { emisorId: string }) => {
        if (msg.emisorId !== usuario.id) {
          setUnreadCount((prev) => prev + 1);
          refreshMessages();
        }
      };

      socket.on("conversation:updated", onConversationUpdated);
      socket.on("message:new", onMessageNew);

      cleanupFn = () => {
        socket.off("conversation:updated", onConversationUpdated);
        socket.off("message:new", onMessageNew);
      };
    });

    return () => {
      cleanupFn?.();
    };
  }, [isAuthenticated, usuario?.id, refreshMessages]);

  return (
    <MessageContext.Provider
      value={{ unreadCount, conversaciones, refreshMessages, loading }}
    >
      {children}
    </MessageContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessages debe usarse dentro de un MessageProvider");
  }
  return context;
}
