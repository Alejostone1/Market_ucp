"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  RefreshCw,
  Filter,
  Flag,
  Ban,
  AlertOctagon,
  AlertCircle,
  Copy,
  MoreHorizontal,
  Archive,
  Trash2,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  FileText,
  BarChart3,
  ShieldCheck,
  ShieldAlert,
  PauseCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Reporte {
  id: string;
  motivo: string;
  descripcion: string | null;
  estado: string;
  creadoEn: string;
  resolvidoEn: string | null;
  reportante: {
    id: string;
    nombre: string;
    correo: string;
    avatarUrl: string | null;
    rol: string;
  };
  publicacion: {
    id: string;
    titulo: string;
    descripcion: string;
    estado: string;
    tipo: string;
    medios: { url: string }[];
    autor: { id: string; nombre: string; correo: string; avatarUrl: string | null };
    _count: { reportes: number };
  } | null;
}

interface Stats {
  pendientes: number;
  revisados: number;
  descartados: number;
  total: number;
  suspendidas: number;
  topReportadas: Array<{
    publicacionId: string;
    count: number;
    publicacion: {
      id: string;
      titulo: string;
      estado: string;
      tipo: string;
      medios: { url: string }[];
      autor: { nombre: string };
    } | null;
  }>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ── Constantes ────────────────────────────────────────────────────────────────

const MOTIVO_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  SPAM:                  { label: "Spam",                    icon: <Ban className="w-3.5 h-3.5" />,          color: "bg-orange-100 text-orange-700 border-orange-200" },
  CONTENIDO_INAPROPIADO: { label: "Contenido inapropiado",   icon: <AlertOctagon className="w-3.5 h-3.5" />, color: "bg-red-100 text-red-700 border-red-200" },
  INFORMACION_FALSA:     { label: "Información falsa",       icon: <AlertCircle className="w-3.5 h-3.5" />,  color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  DUPLICADO:             { label: "Publicación duplicada",   icon: <Copy className="w-3.5 h-3.5" />,         color: "bg-blue-100 text-blue-700 border-blue-200" },
  OTRO:                  { label: "Otro motivo",             icon: <MoreHorizontal className="w-3.5 h-3.5" />,color: "bg-gray-100 text-gray-700 border-gray-200" },
};

const ESTADO_PUB_CONFIG: Record<string, { label: string; color: string }> = {
  APROBADA:   { label: "Aprobada",   color: "bg-green-100 text-green-700" },
  PENDIENTE:  { label: "Pendiente",  color: "bg-yellow-100 text-yellow-700" },
  RECHAZADA:  { label: "Rechazada",  color: "bg-red-100 text-red-700" },
  ARCHIVADA:  { label: "Archivada",  color: "bg-gray-100 text-gray-600" },
  SUSPENDIDA: { label: "Suspendida", color: "bg-purple-100 text-purple-700" },
};

const ROL_CONFIG: Record<string, string> = {
  ESTUDIANTE: "Estudiante",
  ALIADO:     "Aliado",
  ADMIN:      "Admin",
};

// ── Acciones disponibles sobre una publicación al resolver un reporte ─────────

const ACCIONES = [
  {
    value:       "ninguna",
    label:       "Sin acción",
    description: "Solo marcar el reporte como revisado/descartado",
    icon:        <ShieldCheck className="w-4 h-4" />,
    color:       "text-gray-600",
  },
  {
    value:       "suspender",
    label:       "Suspender publicación",
    description: "Ocultar temporalmente; el autor puede solicitarreactivación",
    icon:        <PauseCircle className="w-4 h-4" />,
    color:       "text-purple-600",
  },
  {
    value:       "archivar",
    label:       "Archivar publicación",
    description: "La publicación queda archivada, visible solo para el autor",
    icon:        <Archive className="w-4 h-4" />,
    color:       "text-blue-600",
  },
  {
    value:       "rechazar",
    label:       "Rechazar publicación",
    description: "Rechazo permanente; el autor recibe notificación",
    icon:        <XCircle className="w-4 h-4" />,
    color:       "text-orange-600",
  },
  {
    value:       "eliminar",
    label:       "Eliminar publicación",
    description: "Borrado definitivo e irreversible de la publicación",
    icon:        <Trash2 className="w-4 h-4" />,
    color:       "text-red-600",
  },
] as const;

type AccionValue = (typeof ACCIONES)[number]["value"];

// ── Componente principal ──────────────────────────────────────────────────────

export default function AdminReportesPage() {
  const { usuario } = useAuth();

  // ── Estado general ──
  const [reportes, setReportes]           = useState<Reporte[]>([]);
  const [stats, setStats]                 = useState<Stats | null>(null);
  const [pagination, setPagination]       = useState<Pagination | null>(null);
  const [loading, setLoading]             = useState(true);
  const [loadingStats, setLoadingStats]   = useState(true);
  const [refreshing, setRefreshing]       = useState(false);

  // ── Filtros ──
  const [tabEstado, setTabEstado]         = useState("PENDIENTE");
  const [filterMotivo, setFilterMotivo]   = useState("todos");
  const [buscar, setBuscar]               = useState("");
  const [buscarDebounced, setBuscarDeb]   = useState("");
  const [page, setPage]                   = useState(1);

  // ── Modal de resolución ──
  const [selectedReporte, setSelectedReporte] = useState<Reporte | null>(null);
  const [isDialogOpen, setIsDialogOpen]       = useState(false);
  const [nota, setNota]                       = useState("");
  const [accion, setAccion]                   = useState<AccionValue>("ninguna");
  const [submitting, setSubmitting]           = useState(false);

  // ── Debounce del buscador (400 ms) ──
  useEffect(() => {
    const t = setTimeout(() => { setBuscarDeb(buscar); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [buscar]);

  // ── Cargar stats ──
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/admin/reportes/stats");
      if (res.ok) setStats(await res.json());
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // ── Cargar reportes ──
  const fetchReportes = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const params = new URLSearchParams({ page: String(page), limit: "15" });
        if (tabEstado !== "todos") params.set("estado", tabEstado);
        if (filterMotivo !== "todos") params.set("motivo", filterMotivo);
        if (buscarDebounced) params.set("buscar", buscarDebounced);

        const res = await fetch(`/api/admin/reportes?${params}`);
        if (res.ok) {
          const data = await res.json();
          setReportes(data.reportes);
          setPagination(data.pagination);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [tabEstado, filterMotivo, buscarDebounced, page]
  );

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { setPage(1); }, [tabEstado, filterMotivo, buscarDebounced]);
  useEffect(() => { fetchReportes(); }, [fetchReportes]);

  // ── Resolver reporte ──
  const handleResolve = async (estadoReporte: "REVISADO" | "DESCARTADO") => {
    if (!selectedReporte) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/reportes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id:               selectedReporte.id,
          estado:           estadoReporte,
          nota:             nota.trim() || undefined,
          accionPublicacion: estadoReporte === "DESCARTADO" ? "ninguna" : accion,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Error al actualizar el reporte");
        return;
      }

      // Actualizar lista local
      setReportes((prev) => prev.filter((r) => r.id !== selectedReporte.id));
      closeDialog();
      await Promise.all([fetchStats(), fetchReportes(true)]);

      toast.success(
        estadoReporte === "REVISADO"
          ? "Reporte revisado y acciones aplicadas correctamente"
          : "Reporte descartado correctamente"
      );
    } catch {
      toast.error("Error de conexión. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const openDialog = (reporte: Reporte) => {
    setSelectedReporte(reporte);
    setNota("");
    setAccion("ninguna");
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedReporte(null);
    setNota("");
    setAccion("ninguna");
  };

  // ── Helpers visuales ──
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "REVISADO":   return <Badge className="bg-green-100 text-green-700 border border-green-200 text-xs font-medium">Revisado</Badge>;
      case "DESCARTADO": return <Badge className="bg-gray-100 text-gray-600 border border-gray-200 text-xs font-medium">Descartado</Badge>;
      default:           return <Badge className="bg-amber-100 text-amber-700 border border-amber-200 text-xs font-medium animate-pulse">Pendiente</Badge>;
    }
  };

  const getMotivoChip = (motivo: string) => {
    const cfg = MOTIVO_CONFIG[motivo] ?? MOTIVO_CONFIG["OTRO"];
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
        {cfg.icon} {cfg.label}
      </span>
    );
  };

  const getEstadoPubBadge = (estado: string) => {
    const cfg = ESTADO_PUB_CONFIG[estado] ?? { label: estado, color: "bg-gray-100 text-gray-600" };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span>;
  };

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Encabezado ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-[#881a1d]" />
            Gestión de Reportes
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Revisa, modera y gestiona los reportes de contenido del marketplace
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => fetchReportes(true)}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* ── KPIs / Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Pendientes",
            value: stats?.pendientes ?? "—",
            icon: <AlertTriangle className="w-5 h-5" />,
            color: "text-amber-600",
            bg:    "bg-amber-50 border-amber-100",
          },
          {
            label: "Revisados",
            value: stats?.revisados ?? "—",
            icon: <CheckCircle className="w-5 h-5" />,
            color: "text-green-600",
            bg:    "bg-green-50 border-green-100",
          },
          {
            label: "Descartados",
            value: stats?.descartados ?? "—",
            icon: <XCircle className="w-5 h-5" />,
            color: "text-gray-500",
            bg:    "bg-gray-50 border-gray-100",
          },
          {
            label: "Suspendidas",
            value: stats?.suspendidas ?? "—",
            icon: <EyeOff className="w-5 h-5" />,
            color: "text-purple-600",
            bg:    "bg-purple-50 border-purple-100",
          },
        ].map((kpi) => (
          <Card key={kpi.label} className={`border shadow-sm ${kpi.bg}`}>
            <CardContent className="p-4">
              <div className={`${kpi.color} mb-2`}>{kpi.icon}</div>
              <p className="text-2xl font-bold text-gray-900">{loadingStats ? "…" : kpi.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Top reportadas ── */}
      {stats && stats.topReportadas.length > 0 && (
        <Card className="border shadow-sm">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#881a1d]" />
              Publicaciones más reportadas (pendientes)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="space-y-2">
              {stats.topReportadas.map((item, i) => (
                <div key={item.publicacionId} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <span className="text-lg font-bold text-gray-300 w-5 text-center">{i + 1}</span>
                  {item.publicacion?.medios?.[0]?.url ? (
                    <img
                      src={item.publicacion.medios[0].url}
                      alt={item.publicacion.titulo}
                      className="w-10 h-10 rounded-lg object-cover shrink-0 border border-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {item.publicacion?.titulo ?? "Publicación eliminada"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.publicacion?.autor?.nombre} · {getEstadoPubBadge(item.publicacion?.estado ?? "PENDIENTE")}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-[#881a1d] bg-red-50 px-2.5 py-1 rounded-full shrink-0">
                    {item.count} reps
                  </span>
                  {item.publicacion && (
                    <Link href={`/publication/${item.publicacionId}`} target="_blank">
                      <Button variant="ghost" size="icon" className="w-7 h-7 shrink-0">
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Filtros y búsqueda ── */}
      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Buscador */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="search"
                placeholder="Buscar por publicación, reportante o correo…"
                className="pl-9 rounded-full text-sm"
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
              />
            </div>
            {/* Filtro motivo */}
            <Select value={filterMotivo} onValueChange={(v) => { setFilterMotivo(v); setPage(1); }}>
              <SelectTrigger className="w-52 text-sm">
                <Filter className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                <SelectValue placeholder="Motivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los motivos</SelectItem>
                <SelectItem value="SPAM">Spam</SelectItem>
                <SelectItem value="CONTENIDO_INAPROPIADO">Contenido inapropiado</SelectItem>
                <SelectItem value="INFORMACION_FALSA">Información falsa</SelectItem>
                <SelectItem value="DUPLICADO">Duplicado</SelectItem>
                <SelectItem value="OTRO">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ── Tabs de estado ── */}
      <Tabs
        value={tabEstado}
        onValueChange={(v) => { setTabEstado(v); setPage(1); }}
      >
        <TabsList className="bg-white border shadow-sm rounded-xl h-auto p-1 gap-1">
          {[
            { value: "PENDIENTE",  label: "Pendientes",  count: stats?.pendientes },
            { value: "REVISADO",   label: "Revisados",   count: stats?.revisados },
            { value: "DESCARTADO", label: "Descartados", count: stats?.descartados },
            { value: "todos",      label: "Todos",       count: stats?.total },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-[#881a1d] data-[state=active]:text-white"
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  tabEstado === tab.value
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {tab.count}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* ── Lista de reportes ── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border shadow-sm animate-pulse">
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reportes.length > 0 ? (
        <div className="space-y-3">
          {reportes.map((reporte) => (
            <Card
              key={reporte.id}
              className="border shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-5">
                <div className="flex gap-4">
                  {/* Thumbnail publicación */}
                  {reporte.publicacion?.medios?.[0]?.url ? (
                    <img
                      src={reporte.publicacion.medios[0].url}
                      alt={reporte.publicacion.titulo}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                      <Flag className="w-6 h-6 text-gray-300" />
                    </div>
                  )}

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {getMotivoChip(reporte.motivo)}
                        {getEstadoBadge(reporte.estado)}
                        {reporte.publicacion && (
                          getEstadoPubBadge(reporte.publicacion.estado)
                        )}
                      </div>
                      <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        {formatDate(reporte.creadoEn)}
                      </span>
                    </div>

                    {/* Publicación reportada */}
                    {reporte.publicacion ? (
                      <div className="mb-2">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {reporte.publicacion.titulo}
                        </p>
                        <p className="text-xs text-gray-500">
                          Autor: <span className="font-medium text-gray-700">{reporte.publicacion.autor.nombre}</span>
                          {" · "}
                          {reporte.publicacion._count.reportes} reporte{reporte.publicacion._count.reportes !== 1 ? "s" : ""} total
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic mb-2">Publicación eliminada</p>
                    )}

                    {/* Descripción del reporte */}
                    {reporte.descripcion && (
                      <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2.5 mb-2 border border-gray-100 line-clamp-2">
                        "{reporte.descripcion}"
                      </p>
                    )}

                    {/* Reportante */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={reporte.reportante.avatarUrl ?? undefined} />
                          <AvatarFallback className="text-[10px]">{reporte.reportante.nombre[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-600">
                          <span className="font-medium">{reporte.reportante.nombre}</span>
                          {" "}
                          <span className="text-gray-400">({ROL_CONFIG[reporte.reportante.rol] ?? reporte.reportante.rol})</span>
                        </span>
                      </div>

                      {/* Acciones */}
                      <div className="ml-auto flex items-center gap-2 shrink-0">
                        {reporte.publicacion && (
                          <Link href={`/publication/${reporte.publicacion.id}`} target="_blank">
                            <Button variant="outline" size="sm" className="h-7 text-xs rounded-full gap-1.5">
                              <ExternalLink className="w-3 h-3" />
                              Ver pub.
                            </Button>
                          </Link>
                        )}
                        {reporte.publicacion && (
                          <Link href={`/dashboard/admin/publicaciones/${reporte.publicacion.id}`} target="_blank">
                            <Button variant="outline" size="sm" className="h-7 text-xs rounded-full gap-1.5">
                              <FileText className="w-3 h-3" />
                              Detalle
                            </Button>
                          </Link>
                        )}
                        {reporte.estado === "PENDIENTE" && (
                          <Button
                            size="sm"
                            className="h-7 text-xs rounded-full bg-[#881a1d] hover:bg-[#6d1416] text-white gap-1.5"
                            onClick={() => openDialog(reporte)}
                          >
                            <AlertTriangle className="w-3 h-3" />
                            Resolver
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border shadow-sm">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              {tabEstado === "PENDIENTE"
                ? "No hay reportes pendientes"
                : "No se encontraron reportes"}
            </h3>
            <p className="text-gray-500 text-sm">
              {tabEstado === "PENDIENTE"
                ? "¡El marketplace está limpio! No hay reportes pendientes de revisión."
                : "Prueba ajustando los filtros de búsqueda."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Paginación ── */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
            {pagination.total} reportes
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-600 font-medium px-2">
              {page} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Modal de resolución ── */}
      <Dialog open={isDialogOpen} onOpenChange={(v) => !v && closeDialog()}>
        <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
              <AlertTriangle className="w-5 h-5 text-[#881a1d]" />
              Resolver reporte
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-0.5">
              Revisa el reporte y decide qué acción tomar sobre la publicación
            </DialogDescription>
          </DialogHeader>

          {selectedReporte && (
            <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

              {/* ── Datos del reporte ── */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Motivo</p>
                  {getMotivoChip(selectedReporte.motivo)}
                </div>

                {selectedReporte.descripcion && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Descripción del reportante</p>
                      <p className="text-sm text-gray-700 italic leading-relaxed">
                        "{selectedReporte.descripcion}"
                      </p>
                    </div>
                  </>
                )}

                <Separator />

                {/* Reportante */}
                <div className="flex items-center gap-2">
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={selectedReporte.reportante.avatarUrl ?? undefined} />
                    <AvatarFallback className="text-xs">{selectedReporte.reportante.nombre[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">{selectedReporte.reportante.nombre}</p>
                    <p className="text-xs text-gray-400">{selectedReporte.reportante.correo}</p>
                  </div>
                </div>
              </div>

              {/* ── Publicación afectada ── */}
              {selectedReporte.publicacion && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Publicación reportada</p>
                  <div className="flex items-center gap-3">
                    {selectedReporte.publicacion.medios?.[0]?.url ? (
                      <img
                        src={selectedReporte.publicacion.medios[0].url}
                        alt={selectedReporte.publicacion.titulo}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{selectedReporte.publicacion.titulo}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-500">
                          <User className="w-3 h-3 inline mr-0.5" />
                          {selectedReporte.publicacion.autor.nombre}
                        </p>
                        {getEstadoPubBadge(selectedReporte.publicacion.estado)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* ── Selector de acción ── */}
              <div>
                <p className="text-sm font-bold text-gray-800 mb-2.5">
                  Acción sobre la publicación
                </p>
                <div className="space-y-2">
                  {ACCIONES.map((a) => (
                    <label
                      key={a.value}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        accion === a.value
                          ? "border-[#881a1d] bg-[#881a1d]/5"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="accion"
                        value={a.value}
                        checked={accion === a.value}
                        onChange={() => setAccion(a.value)}
                        className="mt-0.5 accent-[#881a1d] shrink-0"
                      />
                      <span className={`mt-0.5 ${accion === a.value ? "text-[#881a1d]" : a.color} shrink-0`}>
                        {a.icon}
                      </span>
                      <div>
                        <p className={`text-sm font-semibold ${accion === a.value ? "text-[#881a1d]" : "text-gray-800"}`}>
                          {a.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{a.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* ── Nota interna ── */}
              <div>
                <label className="text-sm font-bold text-gray-800 mb-1.5 block">
                  Nota interna{" "}
                  <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <Textarea
                  placeholder="Observación del administrador para el historial de moderación…"
                  value={nota}
                  onChange={(e) => setNota(e.target.value.slice(0, 500))}
                  rows={3}
                  className="resize-none text-sm rounded-xl"
                />
                <p className="text-xs text-gray-400 text-right mt-1">{nota.length}/500</p>
              </div>

              {/* Aviso eliminación irreversible */}
              {accion === "eliminar" && (
                <div className="flex items-start gap-2.5 bg-red-50 rounded-xl p-3.5 border border-red-100">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 leading-relaxed">
                    <strong>Acción irreversible.</strong> La publicación y todos sus datos asociados
                    (medios, reportes, historial) serán eliminados permanentemente de la base de datos.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Footer ── */}
          <DialogFooter className="px-6 py-4 border-t bg-gray-50 gap-2 flex-col sm:flex-row">
            <Button
              variant="outline"
              onClick={closeDialog}
              disabled={submitting}
              className="rounded-xl flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              onClick={() => handleResolve("DESCARTADO")}
              disabled={submitting}
              className="rounded-xl text-gray-600 flex-1 sm:flex-none"
            >
              <XCircle className="w-4 h-4 mr-1.5" />
              Descartar reporte
            </Button>
            <Button
              onClick={() => handleResolve("REVISADO")}
              disabled={submitting}
              className={`rounded-xl text-white flex-1 sm:flex-none ${
                accion === "eliminar"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-[#881a1d] hover:bg-[#6d1416]"
              }`}
            >
              {submitting ? (
                <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-1.5" />
              )}
              {accion === "eliminar" ? "Eliminar y resolver" : "Confirmar resolución"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
