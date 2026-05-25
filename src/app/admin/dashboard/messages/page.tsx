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
  ArrowLeft,
  MessageSquare,
  Loader2,
  Check,
  CheckCheck,
  UserPlus,
  Users,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/hooks/useSocket";
import { format, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────────────────────

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

interface UserResult {
  id: string;
  nombre: string;
  correo: string;
  avatarUrl: string | null;
  rol: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatMsgTime(iso: string) {
  const d = new Date(iso);
  if (isToday(d)) return format(d, "HH:mm");
  if (isYesterday(d)) return "Ayer";
  return format(d, "dd/MM/yy");
}

function formatConvTime(iso: string) {
  const d = new Date(iso);
  if (isToday(d)) return format(d, "HH:mm");
  if (isYesterday(d)) return "Ayer";
  return format(d, "dd/MM");
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function RolChip({ rol }: { rol: string }) {
  if (rol === "ADMIN")
    return (
      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 shrink-0">
        <ShieldCheck className="w-2.5 h-2.5" />
        Admin
      </span>
    );
  if (rol === "ALIADO")
    return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 shrink-0">Aliado</span>;
  return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 shrink-0">Estudiante</span>;
}

// ─── Typing indicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex justify-start px-4 pb-2">
      <div className="bg-white border rounded-2xl px-4 py-3 flex items-center gap-1.5 shadow-sm">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── User search panel ─────────────────────────────────────────────────────────

function UserSearchPanel({
  onSelect,
  onClose,
}: {
  onSelect: (userId: string) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/admin/usuarios?buscar=${encodeURIComponent(q.trim())}&limit=8`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.usuarios ?? []);
        }
      } finally {
        setSearching(false);
      }
    }, 350);
  }, [q]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b flex items-center gap-2 shrink-0">
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input
            autoFocus
            placeholder="Buscar por nombre o correo…"
            className="pl-8 rounded-full h-8 text-xs bg-gray-50 border-0 focus-visible:ring-1"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        {searching ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center py-12 px-6 text-center">
            <Users className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-xs text-gray-400">{q.trim() ? "Sin resultados" : "Escribe para buscar usuarios"}</p>
          </div>
        ) : (
          <div className="py-1">
            {results.map((u) => (
              <button
                key={u.id}
                onClick={() => onSelect(u.id)}
                className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <Avatar className="w-10 h-10 shrink-0">
                  <AvatarImage src={u.avatarUrl ?? ""} />
                  <AvatarFallback className="bg-[#881a1d] text-white text-sm font-semibold">
                    {initials(u.nombre)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-semibold text-sm text-gray-900 truncate">{u.nombre}</span>
                    <RolChip rol={u.rol} />
                  </div>
                  <p className="text-xs text-gray-400 truncate">{u.correo}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

function MessagesContent() {
  const { usuario } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { socket, isConnected, joinConversation, leaveConversation, startTyping, stopTyping } =
    useSocket();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [mobile, setMobile] = useState<"list" | "chat">("list");
  const [showSearch, setShowSearch] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);
  const msgsContainerRef = useRef<HTMLDivElement>(null);
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedConv = conversations.find((c) => c.id === selectedId) ?? null;

  // ── Fetch conversations ────────────────────────────────────────────────────

  const fetchConvs = useCallback(async () => {
    try {
      const res = await fetch("/api/conversaciones");
      if (res.ok) setConversations(await res.json());
    } catch { /**/ } finally {
      setLoadingConvs(false);
    }
  }, []);

  useEffect(() => { fetchConvs(); }, [fetchConvs]);

  // ── Auto-select from URL ───────────────────────────────────────────────────

  useEffect(() => {
    const c = searchParams.get("c");
    if (c && c !== selectedId) selectConversation(c);
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch messages ─────────────────────────────────────────────────────────

  const fetchMsgs = useCallback(async (convId: string, cur?: string) => {
    if (!cur) setLoadingMsgs(true); else setLoadingMore(true);
    try {
      const url = `/api/conversaciones/${convId}/mensajes${cur ? `?cursor=${encodeURIComponent(cur)}` : ""}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (cur) setMessages((p) => [...(data.mensajes as Message[]), ...p]);
        else setMessages(data.mensajes as Message[]);
        setHasMore(data.hasMore);
        setCursor(data.nextCursor);
      }
    } finally {
      setLoadingMsgs(false);
      setLoadingMore(false);
    }
  }, []);

  // ── Mark read ──────────────────────────────────────────────────────────────

  const markRead = useCallback(async (convId: string) => {
    try {
      await fetch(`/api/conversaciones/${convId}/leer`, { method: "POST" });
      setConversations((p) => p.map((c) => c.id === convId ? { ...c, unread: 0 } : c));
    } catch { /**/ }
  }, []);

  // ── Select conversation ────────────────────────────────────────────────────

  const selectConversation = useCallback((convId: string) => {
    if (selectedId === convId) return;
    if (selectedId) leaveConversation(selectedId);
    setSelectedId(convId);
    setMessages([]);
    setHasMore(false);
    setCursor(null);
    setTypingUsers(new Set());
    setMobile("chat");
    setShowSearch(false);
    fetchMsgs(convId);
    markRead(convId);
    joinConversation(convId);
    router.replace(`/admin/dashboard/messages?c=${convId}`, { scroll: false });
  }, [selectedId, fetchMsgs, markRead, joinConversation, leaveConversation, router]);

  // ── Auto-scroll al fondo ──────────────────────────────────────────────────

  useEffect(() => {
    if (!loadingMsgs && messages.length > 0) {
      const el = msgsContainerRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [messages, loadingMsgs]);

  // ── Load more on scroll top ────────────────────────────────────────────────

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop < 60 && hasMore && !loadingMore && cursor && selectedId)
      fetchMsgs(selectedId, cursor);
  }, [hasMore, loadingMore, cursor, selectedId, fetchMsgs]);

  // ── Socket ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!socket) return;

    const onNew = (msg: Message) => {
      if (msg.emisor.id === usuario?.id) return;
      setMessages((p) => p.some((m) => m.id === msg.id) ? p : [...p, msg]);
      setConversations((p) =>
        p.map((c) => c.id === msg.conversacionId
          ? { ...c, lastMessage: msg.contenido, lastMessageTime: msg.creadoEn, lastMessageIsOwn: false, unread: selectedId === msg.conversacionId ? 0 : c.unread + 1 }
          : c
        ).sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())
      );
      if (msg.conversacionId === selectedId) markRead(msg.conversacionId as string);
    };

    const onRead = ({ conversationId, readBy }: { conversationId: string; readBy: string }) => {
      if (readBy === usuario?.id) return;
      setMessages((p) => p.map((m) => m.conversacionId === conversationId ? { ...m, leido: true } : m));
    };

    const onTypingStart = ({ userId: uid, conversationId }: { userId: string; conversationId: string }) => {
      if (conversationId === selectedId && uid !== usuario?.id)
        setTypingUsers((p) => new Set([...p, uid]));
    };

    const onTypingStop = ({ userId: uid, conversationId }: { userId: string; conversationId: string }) => {
      if (conversationId === selectedId)
        setTypingUsers((p) => { const n = new Set(p); n.delete(uid); return n; });
    };

    const onStatus = ({ userId: uid, online }: { userId: string; online: boolean }) => {
      setOnlineUsers((p) => { const n = new Set(p); online ? n.add(uid) : n.delete(uid); return n; });
    };

    socket.on("message:new", onNew);
    socket.on("message:read", onRead);
    socket.on("typing:start", onTypingStart);
    socket.on("typing:stop", onTypingStop);
    socket.on("user:status", onStatus);
    socket.on("conversation:updated", fetchConvs);

    return () => {
      socket.off("message:new", onNew);
      socket.off("message:read", onRead);
      socket.off("typing:start", onTypingStart);
      socket.off("typing:stop", onTypingStop);
      socket.off("user:status", onStatus);
      socket.off("conversation:updated", fetchConvs);
    };
  }, [socket, selectedId, usuario?.id, fetchConvs, markRead]);

  // ── Polling fallback ───────────────────────────────────────────────────────

  useEffect(() => {
    if (isConnected || !selectedId) return;
    const poll = async () => {
      const res = await fetch(`/api/conversaciones/${selectedId}/mensajes`).catch(() => null);
      if (!res?.ok) return;
      const data = await res.json();
      setMessages((p) => {
        const ids = new Set(p.filter((m) => !m.optimistic).map((m) => m.id));
        const news = (data.mensajes as Message[]).filter((m) => !ids.has(m.id));
        return news.length === 0 ? p : [...p.filter((m) => !m.optimistic), ...data.mensajes];
      });
    };
    const a = setInterval(poll, 5000);
    const b = setInterval(fetchConvs, 15000);
    return () => { clearInterval(a); clearInterval(b); };
  }, [isConnected, selectedId, fetchConvs]);

  // ── Typing ─────────────────────────────────────────────────────────────────

  const onInputChange = (v: string) => {
    setInput(v);
    if (!selectedId) return;
    startTyping(selectedId);
    if (typingRef.current) clearTimeout(typingRef.current);
    typingRef.current = setTimeout(() => stopTyping(selectedId!), 1200);
  };

  // ── Send ───────────────────────────────────────────────────────────────────

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !selectedId || sending || !usuario) return;
    setInput("");
    setSending(true);
    if (typingRef.current) clearTimeout(typingRef.current);
    stopTyping(selectedId);

    const optId = `opt-${Date.now()}`;
    const opt: Message = {
      id: optId, contenido: text, emisorId: usuario.id, leido: false, leidoEn: null,
      creadoEn: new Date().toISOString(),
      emisor: { id: usuario.id, nombre: usuario.nombre, avatarUrl: usuario.avatarUrl ?? null },
      optimistic: true,
    };
    setMessages((p) => [...p, opt]);

    try {
      const res = await fetch(`/api/conversaciones/${selectedId}/mensajes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenido: text }),
      });
      if (res.ok) {
        const saved: Message = await res.json();
        setMessages((p) => p.map((m) => m.id === optId ? { ...saved, optimistic: false } : m));
        setConversations((p) =>
          p.map((c) => c.id === selectedId
            ? { ...c, lastMessage: text, lastMessageTime: saved.creadoEn, lastMessageIsOwn: true }
            : c
          ).sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())
        );
      } else {
        setMessages((p) => p.filter((m) => m.id !== optId));
        setInput(text);
      }
    } catch {
      setMessages((p) => p.filter((m) => m.id !== optId));
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  // ── Start new conversation ─────────────────────────────────────────────────

  const startConv = async (userId: string) => {
    try {
      const res = await fetch("/api/conversaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId: userId }),
      });
      if (!res.ok) { toast.error("Error al iniciar conversación"); return; }
      const data = await res.json();
      await fetchConvs();
      setShowSearch(false);
      selectConversation(data.id);
    } catch {
      toast.error("Error de conexión");
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────

  const filtered = conversations.filter((c) =>
    c.otherUser.nombre.toLowerCase().includes(search.toLowerCase())
  );
  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 5rem)" }}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mensajes</h1>
          <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
            <span className={`w-2 h-2 rounded-full inline-block ${isConnected ? "bg-green-500" : "bg-gray-400"}`} />
            {isConnected ? "Conectado en tiempo real" : "Conectando…"}
          </p>
        </div>
        {totalUnread > 0 && (
          <Badge className="bg-[#881a1d] text-white">{totalUnread} sin leer</Badge>
        )}
      </div>

      {/* Panel */}
      <div className="flex-1 overflow-hidden rounded-xl border shadow-lg bg-white flex min-h-0">

        {/* ── Left ── */}
        <div className={`flex flex-col border-r bg-white w-full md:w-80 lg:w-96 shrink-0 ${mobile === "chat" ? "hidden md:flex" : "flex"}`}>

          {showSearch ? (
            <UserSearchPanel onSelect={startConv} onClose={() => setShowSearch(false)} />
          ) : (
            <>
              <div className="p-3 border-b space-y-2 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar conversaciones…"
                    className="pl-9 rounded-full h-9 text-sm bg-gray-50 border-0 focus-visible:ring-1"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => setShowSearch(true)}
                  variant="outline"
                  size="sm"
                  className="w-full rounded-full border-[#881a1d] text-[#881a1d] hover:bg-red-50 text-xs h-8 gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Nueva conversación
                </Button>
              </div>

              <ScrollArea className="flex-1">
                {loadingConvs ? (
                  <div className="space-y-1 p-2">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                        <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center py-16 px-6 text-center">
                    <MessageSquare className="w-10 h-10 text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500">
                      {search ? "Sin resultados" : "No hay conversaciones aún"}
                    </p>
                  </div>
                ) : (
                  <div className="py-1">
                    {filtered.map((conv) => {
                      const online = onlineUsers.has(conv.otherUser.id);
                      const sel = conv.id === selectedId;
                      return (
                        <button
                          key={conv.id}
                          onClick={() => selectConversation(conv.id)}
                          className={`w-full flex items-center gap-3 px-3 py-3 transition-colors text-left border-l-4 ${sel ? "bg-red-50 border-l-[#881a1d]" : "hover:bg-gray-50 border-l-transparent"}`}
                        >
                          <div className="relative shrink-0">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={conv.otherUser.avatarUrl ?? ""} />
                              <AvatarFallback className="bg-[#881a1d] text-white text-sm font-semibold">
                                {initials(conv.otherUser.nombre)}
                              </AvatarFallback>
                            </Avatar>
                            {online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="font-semibold text-sm text-gray-900 truncate">{conv.otherUser.nombre}</span>
                                <RolChip rol={conv.otherUser.rol} />
                              </div>
                              <span className="text-xs text-gray-400 shrink-0">{formatConvTime(conv.lastMessageTime)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-1">
                              <p className={`text-xs truncate ${conv.unread > 0 ? "font-semibold text-gray-800" : "text-gray-500"}`}>
                                {conv.lastMessageIsOwn && <span className="text-gray-400 mr-1">Tú:</span>}
                                {conv.lastMessage || "Nueva conversación"}
                              </p>
                              {conv.unread > 0 && (
                                <Badge className="shrink-0 bg-[#881a1d] text-white text-xs w-5 h-5 flex items-center justify-center p-0 rounded-full">
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
            </>
          )}
        </div>

        {/* ── Right ── */}
        <div className={`flex-1 flex flex-col bg-gray-50 min-w-0 ${mobile === "list" ? "hidden md:flex" : "flex"}`}>
          {!selectedConv ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <MessageSquare className="w-10 h-10 text-[#881a1d]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Centro de mensajes</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Selecciona una conversación o inicia una nueva con cualquier usuario de la plataforma.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-4 py-3 bg-white border-b flex items-center gap-3 shrink-0">
                <button className="md:hidden -ml-1 p-1 rounded-full hover:bg-gray-100" onClick={() => setMobile("list")}>
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="relative shrink-0">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedConv.otherUser.avatarUrl ?? ""} />
                    <AvatarFallback className="bg-[#881a1d] text-white text-sm font-semibold">
                      {initials(selectedConv.otherUser.nombre)}
                    </AvatarFallback>
                  </Avatar>
                  {onlineUsers.has(selectedConv.otherUser.id) && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{selectedConv.otherUser.nombre}</h3>
                    <RolChip rol={selectedConv.otherUser.rol} />
                  </div>
                  <p className="text-xs text-gray-500">
                    {typingUsers.size > 0 ? "Escribiendo…" : onlineUsers.has(selectedConv.otherUser.id) ? "En línea" : "Desconectado"}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div ref={msgsContainerRef} className="flex-1 overflow-y-auto" onScroll={onScroll}>
                {loadingMore && <div className="flex justify-center py-3"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>}
                {loadingMsgs ? (
                  <div className="space-y-4 p-4">
                    {[1,2,3].map((i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                        <div className="h-10 bg-gray-200 rounded-2xl animate-pulse w-48" />
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-gray-400">Di hola a {selectedConv.otherUser.nombre.split(" ")[0]} 👋</p>
                  </div>
                ) : (
                  <div className="px-4 py-4 space-y-1">
                    {messages.map((msg, idx) => {
                      const mine = msg.emisorId === usuario?.id;
                      const prev = messages[idx - 1];
                      const showDate = !prev || new Date(msg.creadoEn).toDateString() !== new Date(prev.creadoEn).toDateString();

                      return (
                        <div key={msg.id}>
                          {showDate && (
                            <div className="flex items-center gap-3 my-4">
                              <div className="flex-1 h-px bg-gray-200" />
                              <span className="text-xs text-gray-400 px-2 bg-gray-50 rounded-full">
                                {isToday(new Date(msg.creadoEn)) ? "Hoy"
                                  : isYesterday(new Date(msg.creadoEn)) ? "Ayer"
                                  : format(new Date(msg.creadoEn), "d 'de' MMMM", { locale: es })}
                              </span>
                              <div className="flex-1 h-px bg-gray-200" />
                            </div>
                          )}
                          <div className={`flex ${mine ? "justify-end" : "justify-start"} mb-1`}>
                            <div className={`max-w-[72%] flex flex-col ${mine ? "items-end" : "items-start"}`}>
                              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${mine
                                ? `bg-[#881a1d] text-white rounded-br-sm ${msg.optimistic ? "opacity-70" : ""}`
                                : "bg-white text-gray-900 border shadow-sm rounded-bl-sm"
                              }`}>
                                {msg.contenido}
                              </div>
                              <div className={`flex items-center gap-1 mt-0.5 ${mine ? "flex-row-reverse" : ""}`}>
                                <span className="text-xs text-gray-400">{formatMsgTime(msg.creadoEn)}</span>
                                {mine && !msg.optimistic && (msg.leido
                                  ? <CheckCheck className="w-3 h-3 text-blue-400" />
                                  : <Check className="w-3 h-3 text-gray-400" />
                                )}
                                {mine && msg.optimistic && <Loader2 className="w-3 h-3 text-gray-300 animate-spin" />}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {typingUsers.size > 0 && <TypingIndicator />}
                    <div ref={endRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="px-4 py-3 bg-white border-t shrink-0">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={`Mensaje a ${selectedConv.otherUser.nombre.split(" ")[0]}…`}
                    value={input}
                    onChange={(e) => onInputChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                    className="flex-1 rounded-full bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-[#881a1d]"
                    disabled={sending}
                    maxLength={2000}
                  />
                  <Button
                    onClick={handleSend}
                    size="icon"
                    disabled={!input.trim() || sending}
                    className="rounded-full bg-[#881a1d] hover:bg-[#6d1416] text-white shrink-0"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
                {input.length > 1800 && (
                  <p className="text-xs text-gray-400 text-right mt-1">{input.length}/2000</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminMessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-[#881a1d]" />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
