"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Send,
  Search,
  MoreVertical,
  ArrowLeft,
  MessageSquare,
  Loader2,
  Check,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/hooks/useSocket";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";

// ─── Types ───────────────────────────────────────────────────────────────────

interface OtherUser {
  id: string;
  nombre: string;
  correo: string;
  avatarUrl: string | null;
  rol: string;
}

interface Conversation {
  id: string;
  otherUser: OtherUser;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageIsOwn: boolean;
  unread: number;
}

interface Message {
  id: string;
  contenido: string;
  emisorId: string;
  conversacionId?: string;
  leido: boolean;
  leidoEn: string | null;
  creadoEn: string;
  emisor: { id: string; nombre: string; avatarUrl: string | null };
  optimistic?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatMsgTime(iso: string): string {
  const date = new Date(iso);
  if (isToday(date)) return format(date, "HH:mm");
  if (isYesterday(date)) return "Ayer";
  return format(date, "dd/MM/yy");
}

function formatConvTime(iso: string): string {
  const date = new Date(iso);
  if (isToday(date)) return format(date, "HH:mm");
  if (isYesterday(date)) return "Ayer";
  return format(date, "dd/MM");
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function ConversationSkeleton() {
  return (
    <div className="space-y-1 p-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
          <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MessageSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
          <div className="max-w-[60%] space-y-1">
            <div className="h-10 bg-gray-200 rounded-2xl animate-pulse w-48" />
            <div className="h-3 bg-gray-100 rounded w-16 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyChat() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <MessageSquare className="w-10 h-10 text-ucp-rojo" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Selecciona una conversación
      </h3>
      <p className="text-sm text-gray-500 max-w-xs">
        Elige una conversación de la lista o inicia una nueva desde una publicación.
      </p>
    </div>
  );
}

// ─── Typing indicator ────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex justify-start px-4 pb-2">
      <div className="bg-white border rounded-2xl px-4 py-3 flex items-center gap-1.5 shadow-sm">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function MessagesContent() {
  const { usuario } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { socket, isConnected, joinConversation, leaveConversation, startTyping, stopTyping } =
    useSocket();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const selectedConversation = conversations.find((c) => c.id === selectedConvId) ?? null;

  // ── Fetch conversations ─────────────────────────────────────────────────

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversaciones");
      if (res.ok) {
        const data: Conversation[] = await res.json();
        setConversations(data);
      }
    } catch {
      // silent
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // ── Auto-select from URL ─────────────────────────────────────────────────

  useEffect(() => {
    const c = searchParams.get("c");
    if (c && c !== selectedConvId) {
      selectConversation(c);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch messages ───────────────────────────────────────────────────────

  const fetchMessages = useCallback(
    async (convId: string, cursor?: string) => {
      if (!cursor) setLoadingMessages(true);
      else setLoadingMore(true);

      try {
        const url = `/api/conversaciones/${convId}/mensajes${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (cursor) {
            setMessages((prev) => [...(data.mensajes as Message[]), ...prev]);
          } else {
            setMessages(data.mensajes as Message[]);
          }
          setHasMore(data.hasMore);
          setNextCursor(data.nextCursor);
        }
      } finally {
        setLoadingMessages(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  // ── Mark as read ─────────────────────────────────────────────────────────

  const markAsRead = useCallback(async (convId: string) => {
    try {
      await fetch(`/api/conversaciones/${convId}/leer`, { method: "POST" });
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unread: 0 } : c)),
      );
    } catch {
      // silent
    }
  }, []);

  // ── Select conversation ──────────────────────────────────────────────────

  const selectConversation = useCallback(
    (convId: string) => {
      if (selectedConvId === convId) return;

      if (selectedConvId) leaveConversation(selectedConvId);

      setSelectedConvId(convId);
      setMessages([]);
      setHasMore(false);
      setNextCursor(null);
      setTypingUsers(new Set());
      setMobileView("chat");

      fetchMessages(convId);
      markAsRead(convId);
      joinConversation(convId);

      // Sync URL without navigation
      router.replace(`/dashboard/student/messages?c=${convId}`, { scroll: false });
    },
    [selectedConvId, fetchMessages, markAsRead, joinConversation, leaveConversation, router],
  );

  // ── Auto-scroll al fondo ─────────────────────────────────────────────────

  useEffect(() => {
    if (!loadingMessages && messages.length > 0) {
      const el = scrollAreaRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [messages, loadingMessages]);

  // ── Load more on scroll to top ───────────────────────────────────────────

  const handleScrollTop = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (e.currentTarget.scrollTop < 60 && hasMore && !loadingMore && nextCursor && selectedConvId) {
        fetchMessages(selectedConvId, nextCursor);
      }
    },
    [hasMore, loadingMore, nextCursor, selectedConvId, fetchMessages],
  );

  // ── Socket events ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (msg: Message) => {
      if (msg.emisor.id === usuario?.id) return; // we already added it optimistically

      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });

      setConversations((prev) =>
        prev
          .map((c) =>
            c.id === msg.conversacionId
              ? {
                  ...c,
                  lastMessage: msg.contenido,
                  lastMessageTime: msg.creadoEn,
                  lastMessageIsOwn: false,
                  unread: selectedConvId === msg.conversacionId ? 0 : c.unread + 1,
                }
              : c,
          )
          .sort(
            (a, b) =>
              new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime(),
          ),
      );

      // If this conversation is open, mark as read immediately
      if (msg.conversacionId === selectedConvId) {
        markAsRead(msg.conversacionId as string);
      }
    };

    const onMessageRead = ({ conversationId, readBy }: { conversationId: string; readBy: string }) => {
      if (readBy === usuario?.id) return;
      setMessages((prev) =>
        prev.map((m) => (m.conversacionId === conversationId ? { ...m, leido: true } : m)),
      );
    };

    const onTypingStart = ({ userId: uid, conversationId }: { userId: string; conversationId: string }) => {
      if (conversationId === selectedConvId && uid !== usuario?.id) {
        setTypingUsers((prev) => new Set([...prev, uid]));
      }
    };

    const onTypingStop = ({ userId: uid, conversationId }: { userId: string; conversationId: string }) => {
      if (conversationId === selectedConvId) {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          next.delete(uid);
          return next;
        });
      }
    };

    const onUserStatus = ({ userId: uid, online }: { userId: string; online: boolean }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (online) next.add(uid);
        else next.delete(uid);
        return next;
      });
    };

    const onConversationUpdated = () => {
      fetchConversations();
    };

    socket.on("message:new", onNewMessage);
    socket.on("message:read", onMessageRead);
    socket.on("typing:start", onTypingStart);
    socket.on("typing:stop", onTypingStop);
    socket.on("user:status", onUserStatus);
    socket.on("conversation:updated", onConversationUpdated);

    return () => {
      socket.off("message:new", onNewMessage);
      socket.off("message:read", onMessageRead);
      socket.off("typing:start", onTypingStart);
      socket.off("typing:stop", onTypingStop);
      socket.off("user:status", onUserStatus);
      socket.off("conversation:updated", onConversationUpdated);
    };
  }, [socket, selectedConvId, usuario?.id, fetchConversations, markAsRead]);

  // ── Polling fallback when socket is unavailable (Vercel / serverless) ────────

  useEffect(() => {
    if (isConnected) return; // socket is working, no need to poll

    // Poll active conversation messages every 5 seconds
    if (!selectedConvId) return;

    const pollMessages = async () => {
      try {
        const res = await fetch(`/api/conversaciones/${selectedConvId}/mensajes`);
        if (!res.ok) return;
        const data = await res.json();
        const incoming = data.mensajes as Message[];
        setMessages((prev) => {
          const existingIds = new Set(prev.filter((m) => !m.optimistic).map((m) => m.id));
          const newOnes = incoming.filter((m) => !existingIds.has(m.id));
          if (newOnes.length === 0) return prev;
          return [...prev.filter((m) => !m.optimistic), ...incoming];
        });
      } catch {
        // silent
      }
    };

    const msgInterval = setInterval(pollMessages, 5000);

    // Poll conversation list every 15 seconds for unread badges
    const convInterval = setInterval(fetchConversations, 15000);

    return () => {
      clearInterval(msgInterval);
      clearInterval(convInterval);
    };
  }, [isConnected, selectedConvId, fetchConversations]);

  // ── Typing indicator handler ─────────────────────────────────────────────

  const handleInputChange = (value: string) => {
    setMessageInput(value);

    if (!selectedConvId) return;

    startTyping(selectedConvId);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(selectedConvId!);
    }, 1200);
  };

  // ── Send message ─────────────────────────────────────────────────────────

  const handleSend = async () => {
    const text = messageInput.trim();
    if (!text || !selectedConvId || sending || !usuario) return;

    setMessageInput("");
    setSending(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    stopTyping(selectedConvId);

    // Optimistic message
    const optimisticId = `opt-${Date.now()}`;
    const optimistic: Message = {
      id: optimisticId,
      contenido: text,
      emisorId: usuario.id,
      leido: false,
      leidoEn: null,
      creadoEn: new Date().toISOString(),
      emisor: { id: usuario.id, nombre: usuario.nombre, avatarUrl: usuario.avatarUrl ?? null },
      optimistic: true,
    };

    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch(`/api/conversaciones/${selectedConvId}/mensajes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenido: text }),
      });

      if (res.ok) {
        const saved: Message = await res.json();
        // Replace optimistic with real message
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticId ? { ...saved, optimistic: false } : m)),
        );

        setConversations((prev) =>
          prev
            .map((c) =>
              c.id === selectedConvId
                ? {
                    ...c,
                    lastMessage: text,
                    lastMessageTime: saved.creadoEn,
                    lastMessageIsOwn: true,
                  }
                : c,
            )
            .sort(
              (a, b) =>
                new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime(),
            ),
        );
      } else {
        // Rollback on error
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        setMessageInput(text);
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setMessageInput(text);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Filtered conversations ────────────────────────────────────────────────

  const filteredConversations = conversations.filter((c) =>
    c.otherUser.nombre.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Page header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mensajes</h1>
          <p className="text-sm text-gray-500">
            {isConnected ? (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                Conectado
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
                Conectando…
              </span>
            )}
          </p>
        </div>
        {totalUnread > 0 && (
          <Badge className="bg-ucp-rojo text-white">
            {totalUnread} sin leer
          </Badge>
        )}
      </div>

      {/* Two-panel layout */}
      <div className="flex-1 overflow-hidden rounded-xl border shadow-lg bg-white flex">

        {/* ── Left: Conversation list ─────────────────────────────────────── */}
        <div
          className={`
            flex flex-col border-r bg-white
            w-full md:w-80 lg:w-96 shrink-0
            ${mobileView === "chat" ? "hidden md:flex" : "flex"}
          `}
        >
          {/* Search */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar conversaciones…"
                className="pl-9 rounded-full h-9 text-sm bg-gray-50 border-0 focus-visible:ring-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* List */}
          <ScrollArea className="flex-1">
            {loadingConversations ? (
              <ConversationSkeleton />
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <MessageSquare className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">
                  {searchQuery ? "Sin resultados" : "No tienes conversaciones aún"}
                </p>
                {!searchQuery && (
                  <p className="text-xs text-gray-400 mt-1">
                    Contacta a un vendedor desde una publicación
                  </p>
                )}
              </div>
            ) : (
              <div className="py-1">
                {filteredConversations.map((conv) => {
                  const isOnline = onlineUsers.has(conv.otherUser.id);
                  const isSelected = conv.id === selectedConvId;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => selectConversation(conv.id)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-3 transition-colors text-left
                        ${isSelected
                          ? "bg-red-50 border-l-4 border-l-ucp-rojo"
                          : "hover:bg-gray-50 border-l-4 border-l-transparent"
                        }
                      `}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={conv.otherUser.avatarUrl ?? ""} />
                          <AvatarFallback className="bg-ucp-rojo text-white text-sm font-semibold">
                            {getInitials(conv.otherUser.nombre)}
                          </AvatarFallback>
                        </Avatar>
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="font-semibold text-sm text-gray-900 truncate">
                            {conv.otherUser.nombre}
                          </span>
                          <span className="text-xs text-gray-400 shrink-0">
                            {formatConvTime(conv.lastMessageTime)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p
                            className={`text-xs truncate ${
                              conv.unread > 0
                                ? "font-semibold text-gray-800"
                                : "text-gray-500"
                            }`}
                          >
                            {conv.lastMessageIsOwn && (
                              <span className="text-gray-400 mr-1">Tú:</span>
                            )}
                            {conv.lastMessage || "Nueva conversación"}
                          </p>
                          {conv.unread > 0 && (
                            <Badge className="shrink-0 bg-ucp-rojo text-white text-xs w-5 h-5 flex items-center justify-center p-0 rounded-full">
                              {conv.unread > 9 ? "9+" : conv.unread}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* ── Right: Chat panel ────────────────────────────────────────────── */}
        <div
          className={`
            flex-1 flex flex-col bg-gray-50 min-w-0 min-h-0 overflow-hidden
            ${mobileView === "list" ? "hidden md:flex" : "flex"}
          `}
        >
          {!selectedConversation ? (
            <EmptyChat />
          ) : (
            <>
              {/* Chat header */}
              <div className="px-4 py-3 bg-white border-b flex items-center gap-3 shrink-0">
                {/* Back button (mobile) */}
                <button
                  className="md:hidden -ml-1 p-1 rounded-full hover:bg-gray-100"
                  onClick={() => setMobileView("list")}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="relative shrink-0">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedConversation.otherUser.avatarUrl ?? ""} />
                    <AvatarFallback className="bg-ucp-rojo text-white text-sm font-semibold">
                      {getInitials(selectedConversation.otherUser.nombre)}
                    </AvatarFallback>
                  </Avatar>
                  {onlineUsers.has(selectedConversation.otherUser.id) && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {selectedConversation.otherUser.nombre}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {typingUsers.size > 0
                      ? "Escribiendo…"
                      : onlineUsers.has(selectedConversation.otherUser.id)
                      ? "En línea"
                      : "Desconectado"}
                  </p>
                </div>

                <Button variant="ghost" size="icon" className="rounded-full shrink-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>

              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto"
                onScroll={handleScrollTop}
                ref={scrollAreaRef}
              >
                {loadingMore && (
                  <div className="flex justify-center py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  </div>
                )}

                {loadingMessages ? (
                  <MessageSkeleton />
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <p className="text-sm text-gray-400">
                      Di hola a {selectedConversation.otherUser.nombre.split(" ")[0]} 👋
                    </p>
                  </div>
                ) : (
                  <div className="px-4 py-4 space-y-1">
                    {messages.map((msg, idx) => {
                      const isMine = msg.emisorId === usuario?.id;
                      const prevMsg = messages[idx - 1];
                      const showDate =
                        !prevMsg ||
                        new Date(msg.creadoEn).toDateString() !==
                          new Date(prevMsg.creadoEn).toDateString();

                      return (
                        <div key={msg.id}>
                          {/* Date separator */}
                          {showDate && (
                            <div className="flex items-center gap-3 my-4">
                              <div className="flex-1 h-px bg-gray-200" />
                              <span className="text-xs text-gray-400 px-2 bg-gray-50 rounded-full">
                                {isToday(new Date(msg.creadoEn))
                                  ? "Hoy"
                                  : isYesterday(new Date(msg.creadoEn))
                                  ? "Ayer"
                                  : format(new Date(msg.creadoEn), "d 'de' MMMM", { locale: es })}
                              </span>
                              <div className="flex-1 h-px bg-gray-200" />
                            </div>
                          )}

                          <div
                            className={`flex ${isMine ? "justify-end" : "justify-start"} mb-1`}
                          >
                            <div className={`max-w-[72%] ${isMine ? "items-end" : "items-start"} flex flex-col`}>
                              <div
                                className={`
                                  px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                                  ${isMine
                                    ? `bg-ucp-rojo text-white rounded-br-sm ${msg.optimistic ? "opacity-70" : ""}`
                                    : "bg-white text-gray-900 border shadow-sm rounded-bl-sm"
                                  }
                                `}
                              >
                                {msg.contenido}
                              </div>
                              <div className={`flex items-center gap-1 mt-0.5 ${isMine ? "flex-row-reverse" : ""}`}>
                                <span className="text-xs text-gray-400">
                                  {formatMsgTime(msg.creadoEn)}
                                </span>
                                {isMine && !msg.optimistic && (
                                  msg.leido
                                    ? <CheckCheck className="w-3 h-3 text-blue-400" />
                                    : <Check className="w-3 h-3 text-gray-400" />
                                )}
                                {isMine && msg.optimistic && (
                                  <Loader2 className="w-3 h-3 text-gray-300 animate-spin" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {typingUsers.size > 0 && <TypingIndicator />}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="px-4 py-3 bg-white border-t shrink-0">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={`Mensaje a ${selectedConversation.otherUser.nombre.split(" ")[0]}…`}
                    value={messageInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 rounded-full bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-ucp-rojo"
                    disabled={sending}
                    maxLength={2000}
                  />
                  <Button
                    onClick={handleSend}
                    size="icon"
                    disabled={!messageInput.trim() || sending}
                    className="rounded-full bg-ucp-rojo hover:bg-red-700 text-white shrink-0"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {messageInput.length > 1800 && (
                  <p className="text-xs text-gray-400 text-right mt-1">
                    {messageInput.length}/2000
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Wrap with Suspense because useSearchParams needs it
export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-ucp-rojo" />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
