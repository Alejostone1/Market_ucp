"use client";

import { useState, useEffect } from "react";
import { Send, Search, MoreVertical, Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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

export default function MessagesPage() {
  const { usuario } = useAuth();
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversacion | null>(null);
  const [chatMessages, setChatMessages] = useState<Mensaje[]>([]);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversaciones = async () => {
      if (!usuario?.id) return;

      try {
        const response = await fetch(`/api/usuarios/${usuario.id}/mensajes`);
        if (response.ok) {
          const data = await response.json();
          setConversaciones(data);
          if (data.length > 0) {
            setSelectedChat(data[0]);
            await fetchMensajes(data[0].id);
          }
        }
      } catch (error) {
        console.error('Error al cargar conversaciones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversaciones();
  }, [usuario?.id]);

  const fetchMensajes = async (conversacionId: string) => {
    try {
      const response = await fetch(`/api/conversaciones/${conversacionId}/mensajes`);
      if (response.ok) {
        const data = await response.json();
        setChatMessages(data);
      }
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    }
  };

  const filteredMessages = conversaciones.filter(conv =>
    conv.otherUser.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = async () => {
    if (!message.trim() || !selectedChat || !usuario?.id) return;

    try {
      const response = await fetch(`/api/usuarios/${usuario.id}/mensajes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destinatarioId: selectedChat.otherUser.id,
          contenido: message,
        }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        setChatMessages([...chatMessages, newMessage]);
        setMessage("");
        toast.success("Mensaje enviado");
      } else {
        toast.error("Error al enviar mensaje");
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      toast.error("Error al enviar mensaje");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Mensajes</h1>
      <p className="text-gray-600 mb-8">
        Conversa con compradores y vendedores
      </p>

      {loading ? (
        <div className="text-center py-16">
          <p className="text-gray-500">Cargando mensajes...</p>
        </div>
      ) : (
        <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
          <div className="grid md:grid-cols-12 h-[calc(100vh-16rem)]">
            {/* Conversations List */}
            <div className="md:col-span-4 border-r bg-white">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="search"
                    placeholder="Buscar conversaciones..."
                    className="pl-10 rounded-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <ScrollArea className="h-[calc(100%-5rem)]">
                {filteredMessages.length > 0 ? (
                  filteredMessages.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setSelectedChat(conv);
                        fetchMensajes(conv.id);
                      }}
                      className={`w-full p-4 flex items-start gap-3 border-b hover:bg-gray-50 transition-colors ${
                        selectedChat?.id === conv.id ? 'bg-red-50 border-l-4 border-l-ucp-rojo' : ''
                      }`}
                    >
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={conv.otherUser.avatarUrl || undefined} />
                          <AvatarFallback>{conv.otherUser.nombre[0]}</AvatarFallback>
                        </Avatar>
                        {conv.unread > 0 && (
                          <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-ucp-rojo text-white text-xs rounded-full">
                            {conv.unread}
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1 text-left overflow-hidden">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 truncate">{conv.otherUser.nombre}</h4>
                          <span className="text-xs text-gray-500 shrink-0">
                            {new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className={`text-sm truncate ${conv.unread > 0 ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                          {conv.lastMessage}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">No tienes conversaciones</p>
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="md:col-span-8 flex flex-col bg-gray-50">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 bg-white border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={selectedChat.otherUser.avatarUrl || undefined} />
                        <AvatarFallback>{selectedChat.otherUser.nombre[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedChat.otherUser.nombre}</h3>
                        <p className="text-sm text-ucp-verde">En línea</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <Phone className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <Video className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.emisorId === usuario?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${msg.emisorId === usuario?.id ? 'order-2' : 'order-1'}`}>
                            <div
                              className={`rounded-2xl px-4 py-2 ${
                                msg.emisorId === usuario?.id
                                  ? 'bg-ucp-rojo text-white'
                                  : 'bg-white text-gray-900 border'
                              }`}
                            >
                              <p>{msg.contenido}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 px-2">
                              {new Date(msg.creadoEn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 bg-white border-t">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Escribe un mensaje..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        className="flex-1 rounded-full"
                      />
                      <Button
                        onClick={handleSend}
                        className="bg-ucp-rojo hover:bg-red-700 rounded-full"
                        size="icon"
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-500">Selecciona una conversación para comenzar</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
