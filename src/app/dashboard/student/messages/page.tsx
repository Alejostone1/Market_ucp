"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Search, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface Conversacion {
  id: string;
  otherUser: {
    id: string;
    nombre: string;
    correo: string;
    avatarUrl: string | null;
  };
  lastMessage: string;
  timestamp: string;
  unread: number;
}

interface Mensaje {
  id: string;
  contenido: string;
  emisorId: string;
  leido: boolean;
  creadoEn: string;
  emisor: {
    id: string;
    nombre: string;
    avatarUrl: string | null;
  };
}

function MessagesContent() {
  const { usuario } = useAuth();
  const searchParams = useSearchParams();
  const convIdParam = searchParams.get("c");

  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversacion | null>(null);
  const [chatMessages, setChatMessages] = useState<Mensaje[]>([]);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const msgsContainerRef = useRef<HTMLDivElement>(null);

  const fetchMensajes = async (conversacionId: string) => {
    try {
      const res = await fetch(`/api/conversaciones/${conversacionId}/mensajes`);
      if (res.ok) {
        const data = await res.json();
        // API returns { mensajes: [], hasMore, nextCursor }
        setChatMessages(Array.isArray(data) ? data : (data.mensajes ?? []));
      }
    } catch {
      toast.error("Error al cargar mensajes");
    }
  };

  useEffect(() => {
    if (!usuario?.id) return;

    const load = async () => {
      try {
        const res = await fetch(`/api/usuarios/${usuario.id}/mensajes`);
        if (!res.ok) return;
        const data: Conversacion[] = await res.json();
        const list = Array.isArray(data) ? data : [];
        setConversaciones(list);

        // Auto-select by URL param, otherwise first
        const target = convIdParam
          ? list.find((c) => c.id === convIdParam) ?? list[0]
          : list[0];

        if (target) {
          setSelectedChat(target);
          await fetchMensajes(target.id);
        }
      } catch {
        toast.error("Error al cargar conversaciones");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [usuario?.id, convIdParam]);

  // Scroll al fondo cuando cambian los mensajes
  useEffect(() => {
    const el = msgsContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chatMessages]);

  const handleSelectChat = async (conv: Conversacion) => {
    setSelectedChat(conv);
    setChatMessages([]);
    await fetchMensajes(conv.id);
  };

  const handleSend = async () => {
    if (!message.trim() || !selectedChat || !usuario?.id || sending) return;
    setSending(true);

    try {
      const res = await fetch(`/api/conversaciones/${selectedChat.id}/mensajes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenido: message.trim() }),
      });

      if (res.ok) {
        const newMsg: Mensaje = await res.json();
        setChatMessages((prev) => [...prev, newMsg]);
        setMessage("");
        // Update conversation last message in sidebar
        setConversaciones((prev) =>
          prev.map((c) =>
            c.id === selectedChat.id
              ? { ...c, lastMessage: newMsg.contenido, timestamp: newMsg.creadoEn }
              : c
          )
        );
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al enviar mensaje");
      }
    } catch {
      toast.error("Error al enviar mensaje");
    } finally {
      setSending(false);
    }
  };

  const filteredConversaciones = conversaciones.filter((conv) =>
    conv.otherUser.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Mensajes</h1>
      <p className="text-gray-600 mb-4">Conversa con compradores y vendedores</p>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-ucp-rojo border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
          <div className="grid md:grid-cols-12 h-[calc(100vh-16rem)]">
            {/* Lista de conversaciones */}
            <div className="md:col-span-4 border-r bg-white flex flex-col">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar conversaciones..."
                    className="pl-9 rounded-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <ScrollArea className="flex-1">
                {filteredConversaciones.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No tienes conversaciones</div>
                ) : (
                  filteredConversaciones.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectChat(conv)}
                      className={`w-full p-4 flex items-start gap-3 border-b hover:bg-gray-50 transition-colors text-left ${
                        selectedChat?.id === conv.id ? "bg-red-50 border-l-4 border-l-ucp-rojo" : ""
                      }`}
                    >
                      <div className="relative shrink-0">
                        <Avatar className="w-11 h-11">
                          <AvatarImage src={conv.otherUser.avatarUrl || undefined} />
                          <AvatarFallback>{conv.otherUser.nombre[0]}</AvatarFallback>
                        </Avatar>
                        {conv.unread > 0 && (
                          <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-ucp-rojo text-white text-xs rounded-full">
                            {conv.unread}
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="font-semibold text-gray-900 truncate text-sm">{conv.otherUser.nombre}</h4>
                          <span className="text-xs text-gray-400 shrink-0 ml-1">
                            {new Date(conv.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className={`text-xs truncate ${conv.unread > 0 ? "font-medium text-gray-900" : "text-gray-500"}`}>
                          {conv.lastMessage || "Sin mensajes"}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </ScrollArea>
            </div>

            {/* Área de chat */}
            <div className="md:col-span-8 flex flex-col bg-gray-50">
              {selectedChat ? (
                <>
                  {/* Header del chat */}
                  <div className="p-4 bg-white border-b flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={selectedChat.otherUser.avatarUrl || undefined} />
                        <AvatarFallback>{selectedChat.otherUser.nombre[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedChat.otherUser.nombre}</h3>
                        <p className="text-xs text-gray-500">{selectedChat.otherUser.correo}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Mensajes — div nativo para que scrollTop funcione correctamente */}
                  <div ref={msgsContainerRef} className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-3">
                      {chatMessages.map((msg) => {
                        const isMine = msg.emisorId === usuario?.id;
                        return (
                          <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[75%] ${isMine ? "items-end" : "items-start"} flex flex-col`}>
                              <div
                                className={`rounded-2xl px-4 py-2 text-sm ${
                                  isMine
                                    ? "bg-ucp-rojo text-white rounded-br-sm"
                                    : "bg-white text-gray-900 border rounded-bl-sm"
                                }`}
                              >
                                {msg.contenido}
                              </div>
                              <p className="text-xs text-gray-400 mt-1 px-1">
                                {new Date(msg.creadoEn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Input de mensaje */}
                  <div className="p-4 bg-white border-t shrink-0">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Escribe un mensaje..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                        className="flex-1 rounded-full"
                        disabled={sending}
                      />
                      <Button
                        onClick={handleSend}
                        disabled={!message.trim() || sending}
                        className="bg-ucp-rojo hover:bg-red-700 rounded-full shrink-0"
                        size="icon"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-400">Selecciona una conversación para comenzar</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-4 border-ucp-rojo border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
