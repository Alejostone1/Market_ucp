"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface Notificacion {
  id: string;
  tipo: string;
  mensaje: string;
  referenciaId: string | null;
  leida: boolean;
  creadoEn: string;
  usuario: {
    id: string;
    nombre: string;
    avatarUrl: string | null;
  };
}

export default function AdminNotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterLeida, setFilterLeida] = useState("todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotificaciones = async () => {
      try {
        const response = await fetch('/api/notificaciones');
        if (response.ok) {
          const data = await response.json();
          setNotificaciones(Array.isArray(data) ? data : (data.notificaciones ?? []));
        }
      } catch (error) {
        console.error('Error al cargar notificaciones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotificaciones();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notificaciones/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leida: true }),
      });

      if (response.ok) {
        setNotificaciones(notificaciones.map(n => 
          n.id === id ? { ...n, leida: true } : n
        ));
        toast.success("Notificación marcada como leída");
      } else {
        toast.error("Error al actualizar notificación");
      }
    } catch (error) {
      toast.error("Error al actualizar notificación");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notificaciones.filter(n => !n.leida).map(n => n.id);
      
      for (const id of unreadIds) {
        await fetch(`/api/notificaciones/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leida: true }),
        });
      }

      setNotificaciones(notificaciones.map(n => ({ ...n, leida: true })));
      toast.success("Todas las notificaciones marcadas como leídas");
    } catch (error) {
      toast.error("Error al marcar notificaciones");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta notificación?')) return;

    try {
      const response = await fetch(`/api/notificaciones/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotificaciones(notificaciones.filter(n => n.id !== id));
        toast.success("Notificación eliminada");
      } else {
        toast.error("Error al eliminar notificación");
      }
    } catch (error) {
      toast.error("Error al eliminar notificación");
    }
  };

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case "PUBLICACION_APROBADA":
        return <Badge className="bg-ucp-verde text-white">Aprobada</Badge>;
      case "PUBLICACION_RECHAZADA":
        return <Badge className="bg-ucp-rojo text-white">Rechazada</Badge>;
      case "MENSAJE_NUEVO":
        return <Badge className="bg-blue-600 text-white">Mensaje</Badge>;
      case "FAVORITO_NUEVO":
        return <Badge className="bg-purple-600 text-white">Favorito</Badge>;
      case "REPORTE_RESUELTO":
        return <Badge className="bg-orange-600 text-white">Reporte</Badge>;
      default:
        return <Badge variant="outline">{tipo}</Badge>;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "PUBLICACION_APROBADA":
        return "Publicación Aprobada";
      case "PUBLICACION_RECHAZADA":
        return "Publicación Rechazada";
      case "MENSAJE_NUEVO":
        return "Nuevo Mensaje";
      case "FAVORITO_NUEVO":
        return "Nuevo Favorito";
      case "REPORTE_RESUELTO":
        return "Reporte Resuelto";
      default:
        return tipo;
    }
  };

  const filteredNotificaciones = notificaciones.filter((n) => {
    if (filterTipo !== "todos" && n.tipo !== filterTipo) return false;
    if (filterLeida !== "todos" && n.leida.toString() !== filterLeida) return false;
    return true;
  });

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Notificaciones</h1>
      <p className="text-gray-600 mb-6 text-sm">
        Gestiona las notificaciones del sistema
      </p>

      {/* Filters */}
      <Card className="border-0 shadow-lg rounded-xl mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="flex-1 min-w-[140px] sm:w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="PUBLICACION_APROBADA">Aprobadas</SelectItem>
                  <SelectItem value="PUBLICACION_RECHAZADA">Rechazadas</SelectItem>
                  <SelectItem value="MENSAJE_NUEVO">Mensajes</SelectItem>
                  <SelectItem value="FAVORITO_NUEVO">Favoritos</SelectItem>
                  <SelectItem value="REPORTE_RESUELTO">Reportes</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterLeida} onValueChange={setFilterLeida}>
                <SelectTrigger className="flex-1 min-w-[120px] sm:w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="false">No leídas</SelectItem>
                  <SelectItem value="true">Leídas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {notificaciones.some(n => !n.leida) && (
              <Button
                onClick={handleMarkAllAsRead}
                variant="outline"
                className="rounded-full w-full sm:w-auto"
              >
                <Check className="w-4 h-4 mr-2" />
                Marcar todas como leídas
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      {loading ? (
        <div className="text-center py-16">
          <p className="text-gray-500">Cargando notificaciones...</p>
        </div>
      ) : filteredNotificaciones.length > 0 ? (
        <div className="space-y-4">
          {filteredNotificaciones.map((notificacion) => (
            <Card
              key={notificacion.id}
              className={`border-0 shadow-lg rounded-xl hover:shadow-lg transition-shadow ${
                !notificacion.leida ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10 shrink-0">
                    <AvatarImage src={notificacion.usuario.avatarUrl || undefined} />
                    <AvatarFallback>{notificacion.usuario.nombre[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {notificacion.usuario.nombre}
                          </h3>
                          {getTipoBadge(notificacion.tipo)}
                          {!notificacion.leida && (
                            <Badge className="bg-blue-600 text-white text-[10px]">Nueva</Badge>
                          )}
                        </div>
                        <p className="text-gray-700 text-sm">{notificacion.mensaje}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notificacion.creadoEn).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        {!notificacion.leida && (
                          <Button
                            onClick={() => handleMarkAsRead(notificacion.id)}
                            variant="outline"
                            size="sm"
                            className="text-xs h-8"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            <span className="hidden xs:inline">Marcar leída</span>
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDelete(notificacion.id)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-lg rounded-xl">
          <CardContent className="p-16 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay notificaciones
            </h3>
            <p className="text-gray-600">
              No se encontraron notificaciones con los filtros actuales
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
