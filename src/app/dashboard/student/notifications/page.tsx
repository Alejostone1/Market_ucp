"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  BellOff,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Package,
  MessageSquare,
  Heart,
  ShieldAlert,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Notificacion {
  id: string;
  tipo: string;
  mensaje: string;
  leida: boolean;
  referenciaId: string | null;
  creadoEn: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ── Config de tipos de notificación ───────────────────────────────────────────

const TIPO_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  PUBLICACION_APROBADA: {
    label: "Publicación aprobada",
    icon: <Package className="w-4 h-4" />,
    color: "text-green-600",
    bg: "bg-green-50 border-green-100",
  },
  PUBLICACION_RECHAZADA: {
    label: "Publicación rechazada",
    icon: <ShieldAlert className="w-4 h-4" />,
    color: "text-red-600",
    bg: "bg-red-50 border-red-100",
  },
  PUBLICACION_SUSPENDIDA: {
    label: "Publicación suspendida",
    icon: <ShieldAlert className="w-4 h-4" />,
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-100",
  },
  MENSAJE_NUEVO: {
    label: "Mensaje nuevo",
    icon: <MessageSquare className="w-4 h-4" />,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-100",
  },
  FAVORITO_NUEVO: {
    label: "Nuevo favorito",
    icon: <Heart className="w-4 h-4" />,
    color: "text-pink-600",
    bg: "bg-pink-50 border-pink-100",
  },
};

const DEFAULT_CONFIG = {
  label: "Notificación",
  icon: <Info className="w-4 h-4" />,
  color: "text-gray-600",
  bg: "bg-gray-50 border-gray-100",
};

// ── Componente principal ───────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotificaciones = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notificaciones?page=${p}&limit=20`);
      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Inicia sesión para ver tus notificaciones");
          return;
        }
        throw new Error("Error al cargar notificaciones");
      }
      const data = await res.json();
      setNotificaciones(data.notificaciones);
      setUnreadCount(data.unreadCount);
      setPagination(data.pagination);
    } catch {
      toast.error("Error al cargar notificaciones");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchNotificaciones(page);
  }, [page]);

  const markAsRead = async (ids?: string[]) => {
    try {
      const body = ids ? { ids } : {};
      const res = await fetch("/api/notificaciones", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const { updated } = await res.json();
        if (updated > 0) {
          await fetchNotificaciones(page);
          toast.success(
            ids
              ? "Notificación marcada como leída"
              : `${updated} notificación(es) marcadas como leídas`
          );
        }
      }
    } catch {
      toast.error("Error al marcar notificaciones");
    }
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    await markAsRead();
    setMarkingAll(false);
  };

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-ucp-rojo" />
            Notificaciones
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">
              Tienes{" "}
              <span className="font-semibold text-ucp-rojo">{unreadCount}</span>{" "}
              sin leer
            </p>
          )}
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full gap-1.5"
            onClick={markAllAsRead}
            disabled={markingAll}
          >
            <CheckCheck className="w-4 h-4" />
            {markingAll ? "Marcando…" : "Marcar todas como leídas"}
          </Button>
        )}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : notificaciones.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <BellOff className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No tienes notificaciones aún</p>
            <p className="text-gray-400 text-sm max-w-xs">
              Te avisaremos cuando una publicación sea aprobada, rechazada o
              recibas un mensaje.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notificaciones.map((n) => {
            const cfg = TIPO_CONFIG[n.tipo] ?? DEFAULT_CONFIG;
            return (
              <Card
                key={n.id}
                className={cn(
                  "border shadow-sm transition-all",
                  !n.leida ? cfg.bg : "bg-white border-gray-100"
                )}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  {/* Indicador no leída */}
                  <div className="mt-1 shrink-0">
                    {!n.leida ? (
                      <span
                        className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-full",
                          cfg.bg,
                          cfg.color
                        )}
                      >
                        {cfg.icon}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-400">
                        {cfg.icon}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] font-medium border", cfg.color)}
                      >
                        {cfg.label}
                      </Badge>
                      {!n.leida && (
                        <span className="inline-block w-2 h-2 bg-ucp-rojo rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-gray-800 mt-1 leading-snug">
                      {n.mensaje}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatFecha(n.creadoEn)}
                    </p>
                  </div>

                  {!n.leida && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-xs text-gray-500 hover:text-gray-800"
                      onClick={() => markAsRead([n.id])}
                    >
                      ✓ Leída
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8 rounded-full"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600">
            {page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8 rounded-full"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
