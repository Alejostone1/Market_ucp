"use client";

import { useState, useEffect, useCallback } from "react";
import {
  History,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Bot,
  UserCheck,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────────────────────────

type EstadoPublicacion = "PENDIENTE" | "APROBADA" | "RECHAZADA" | "SUSPENDIDA" | "ARCHIVADA";

interface Admin {
  id: string;
  nombre: string;
}

interface HistorialRegistro {
  id: string;
  publicacionId: string;
  publicacion: {
    id: string;
    titulo: string;
    tipo: string;
  };
  estadoAnterior: EstadoPublicacion;
  estadoNuevo: EstadoPublicacion;
  nota: string | null;
  adminId: string | null;
  admin: {
    id: string;
    nombre: string;
    correo: string;
    avatarUrl: string | null;
  } | null;
  esAutomatico: boolean;
  creadoEn: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ── Color maps ────────────────────────────────────────────────────────────────

const ESTADO_COLORS: Record<EstadoPublicacion, string> = {
  PENDIENTE:  "bg-yellow-100 text-yellow-800 border-yellow-200",
  APROBADA:   "bg-green-100 text-green-800 border-green-200",
  RECHAZADA:  "bg-red-100 text-red-800 border-red-200",
  SUSPENDIDA: "bg-orange-100 text-orange-800 border-orange-200",
  ARCHIVADA:  "bg-gray-100 text-gray-600 border-gray-200",
};

const ESTADO_LABELS: Record<EstadoPublicacion, string> = {
  PENDIENTE:  "Pendiente",
  APROBADA:   "Aprobada",
  RECHAZADA:  "Rechazada",
  SUSPENDIDA: "Suspendida",
  ARCHIVADA:  "Archivada",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatFecha(iso: string) {
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatFechaCSV(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function escapeCsv(val: string | null | undefined) {
  if (val == null) return "";
  const s = String(val).replace(/"/g, '""');
  return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s}"` : s;
}

function exportarCSV(registros: HistorialRegistro[]) {
  const headers = [
    "Fecha",
    "Publicación",
    "Tipo",
    "Estado anterior",
    "Estado nuevo",
    "Responsable",
    "Automático",
    "Nota",
  ];

  const rows = registros.map((r) => [
    formatFechaCSV(r.creadoEn),
    r.publicacion.titulo,
    r.publicacion.tipo,
    ESTADO_LABELS[r.estadoAnterior],
    ESTADO_LABELS[r.estadoNuevo],
    r.esAutomatico ? "Sistema" : (r.admin?.nombre ?? "Desconocido"),
    r.esAutomatico ? "Sí" : "No",
    r.nota ?? "",
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `historial_moderacion_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Estado badge ──────────────────────────────────────────────────────────────

function EstadoBadge({ estado }: { estado: EstadoPublicacion }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${ESTADO_COLORS[estado]}`}
    >
      {ESTADO_LABELS[estado]}
    </span>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function HistorialPage() {
  const [registros, setRegistros]     = useState<HistorialRegistro[]>([]);
  const [admins, setAdmins]           = useState<Admin[]>([]);
  const [pagination, setPagination]   = useState<Pagination | null>(null);
  const [loading, setLoading]         = useState(true);
  const [exporting, setExporting]     = useState(false);

  // Filters
  const [buscar,   setBuscar]   = useState("");
  const [adminId,  setAdminId]  = useState("");
  const [accion,   setAccion]   = useState("");
  const [desde,    setDesde]    = useState("");
  const [hasta,    setHasta]    = useState("");
  const [page,     setPage]     = useState(1);

  const buildParams = useCallback(
    (overridePage?: number) => {
      const p = new URLSearchParams();
      if (buscar)  p.set("buscar", buscar);
      if (adminId) p.set("adminId", adminId);
      if (accion)  p.set("accion", accion);
      if (desde)   p.set("desde", desde);
      if (hasta)   p.set("hasta", hasta);
      p.set("page",  String(overridePage ?? page));
      p.set("limit", "25");
      return p;
    },
    [buscar, adminId, accion, desde, hasta, page],
  );

  const fetchHistorial = useCallback(
    async (overridePage?: number) => {
      setLoading(true);
      try {
        const res  = await fetch(`/api/admin/historial?${buildParams(overridePage)}`);
        const data = await res.json();
        setRegistros(data.registros ?? []);
        setPagination(data.pagination ?? null);
        if (data.admins?.length) setAdmins(data.admins);
      } catch {
        toast.error("Error al cargar el historial");
      } finally {
        setLoading(false);
      }
    },
    [buildParams],
  );

  // Re-fetch when filters change (reset page)
  useEffect(() => {
    setPage(1);
    fetchHistorial(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buscar, adminId, accion, desde, hasta]);

  // Re-fetch when page changes
  useEffect(() => {
    fetchHistorial(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Fetch all records (no pagination)
      const params = buildParams(1);
      params.set("limit", "1000");
      params.set("page", "1");
      const res  = await fetch(`/api/admin/historial?${params}`);
      const data = await res.json();
      exportarCSV(data.registros ?? []);
      toast.success("CSV exportado correctamente");
    } catch {
      toast.error("Error al exportar");
    } finally {
      setExporting(false);
    }
  };

  const limpiarFiltros = () => {
    setBuscar("");
    setAdminId("");
    setAccion("");
    setDesde("");
    setHasta("");
  };

  const hayFiltros = buscar || adminId || accion || desde || hasta;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <History className="w-6 h-6 sm:w-8 sm:h-8 text-[#881a1d] shrink-0" />
            Historial de Moderación
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            Registro completo de cambios de estado en publicaciones
          </p>
        </div>
        <Button
          onClick={handleExport}
          disabled={exporting}
          className="bg-[#881a1d] hover:bg-red-800 text-white rounded-full gap-2 w-full sm:w-auto"
        >
          <Download className="w-4 h-4" />
          {exporting ? "Exportando..." : "Exportar CSV"}
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-700">
          <Filter className="w-4 h-4" />
          Filtros
          {hayFiltros && (
            <button
              onClick={limpiarFiltros}
              className="ml-auto text-xs text-[#881a1d] hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar publicación..."
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              className="pl-9 rounded-lg text-sm"
            />
          </div>

          {/* Admin filter */}
          <select
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#881a1d]"
          >
            <option value="">Todos los responsables</option>
            <option value="sistema">Sistema (automático)</option>
            {admins.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>

          {/* Action/estado nuevo filter */}
          <select
            value={accion}
            onChange={(e) => setAccion(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#881a1d]"
          >
            <option value="">Todas las acciones</option>
            <option value="APROBADA">→ Aprobada</option>
            <option value="RECHAZADA">→ Rechazada</option>
            <option value="SUSPENDIDA">→ Suspendida</option>
            <option value="ARCHIVADA">→ Archivada</option>
            <option value="PENDIENTE">→ Pendiente</option>
          </select>

          {/* Date range */}
          <div className="flex flex-col xs:flex-row gap-2 sm:col-span-2 lg:col-span-1">
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#881a1d]"
              title="Desde"
            />
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#881a1d]"
              title="Hasta"
            />
          </div>
        </div>
      </Card>

      {/* Summary */}
      {pagination && (
        <p className="text-sm text-gray-500 mb-3">
          {pagination.total === 0
            ? "Sin resultados"
            : `${pagination.total} ${pagination.total === 1 ? "registro" : "registros"}`}
          {hayFiltros ? " (filtrado)" : ""}
        </p>
      )}

      {/* Table / Cards */}
      <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-500">Cargando historial...</div>
        ) : registros.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No hay registros que coincidan con los filtros</p>
          </div>
        ) : (
          <>
            {/* ── Desktop table ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">Fecha</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Publicación</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">Cambio de estado</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Responsable</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Nota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {registros.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs">
                        {formatFecha(r.creadoEn)}
                      </td>
                      <td className="px-4 py-3 max-w-[220px]">
                        <p className="font-medium text-gray-900 truncate" title={r.publicacion.titulo}>
                          {r.publicacion.titulo}
                        </p>
                        <Badge variant="secondary" className="text-[10px] mt-0.5">
                          {r.publicacion.tipo}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <EstadoBadge estado={r.estadoAnterior} />
                          <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" />
                          <EstadoBadge estado={r.estadoNuevo} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {r.esAutomatico ? (
                          <div className="flex items-center gap-2 text-gray-500">
                            <Bot className="w-4 h-4 text-blue-500 shrink-0" />
                            <span className="text-xs">Sistema</span>
                          </div>
                        ) : r.admin ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={r.admin.avatarUrl ?? undefined} />
                              <AvatarFallback className="text-[10px] bg-[#881a1d]/10 text-[#881a1d]">
                                {r.admin.nombre[0]}
                              </AvatarFallback>
                            </Avatar>
                            <p className="text-xs font-medium text-gray-900 truncate max-w-[120px]">
                              {r.admin.nombre}
                            </p>
                            <UserCheck className="w-3 h-3 text-green-500 shrink-0" />
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-[240px]">
                        {r.nota ? (
                          <p className="text-xs text-gray-600 line-clamp-2" title={r.nota}>
                            {r.nota}
                          </p>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile cards ── */}
            <div className="md:hidden divide-y divide-gray-100">
              {registros.map((r) => (
                <div key={r.id} className="p-4 space-y-3">
                  {/* Publicación + tipo */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
                        {r.publicacion.titulo}
                      </p>
                      <Badge variant="secondary" className="text-[10px] mt-1">
                        {r.publicacion.tipo}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-gray-400 shrink-0 whitespace-nowrap mt-0.5">
                      {formatFecha(r.creadoEn)}
                    </p>
                  </div>

                  {/* Cambio de estado */}
                  <div className="flex items-center gap-2">
                    <EstadoBadge estado={r.estadoAnterior} />
                    <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" />
                    <EstadoBadge estado={r.estadoNuevo} />
                  </div>

                  {/* Responsable + nota */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {r.esAutomatico ? (
                        <>
                          <Bot className="w-4 h-4 text-blue-500 shrink-0" />
                          <span>Sistema</span>
                        </>
                      ) : r.admin ? (
                        <>
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={r.admin.avatarUrl ?? undefined} />
                            <AvatarFallback className="text-[8px] bg-[#881a1d]/10 text-[#881a1d]">
                              {r.admin.nombre[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate max-w-[100px]">{r.admin.nombre}</span>
                          <UserCheck className="w-3 h-3 text-green-500 shrink-0" />
                        </>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </div>
                    {r.nota && (
                      <p className="text-[10px] text-gray-500 italic line-clamp-1 text-right max-w-[140px]">
                        {r.nota}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">
            Página {pagination.page} de {pagination.totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 rounded-lg"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 rounded-lg"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Page number buttons — show ±2 around current */}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((n) => Math.abs(n - page) <= 2)
              .map((n) => (
                <Button
                  key={n}
                  variant={n === page ? "default" : "outline"}
                  size="icon"
                  className={`w-8 h-8 rounded-lg ${n === page ? "bg-[#881a1d] text-white hover:bg-red-800" : ""}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </Button>
              ))}

            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 rounded-lg"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 rounded-lg"
              onClick={() => setPage(pagination.totalPages)}
              disabled={page === pagination.totalPages}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
