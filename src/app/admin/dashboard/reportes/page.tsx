"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  AlertTriangle, CheckCircle2, XCircle, ExternalLink,
  Clock, Flag, ShieldCheck, Trash2, Archive, AlertOctagon,
  ChevronDown, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// ── Tipos ──────────────────────────────────────────────────────────────────

interface Reporte {
  id: string;
  motivo: string;
  descripcion: string | null;
  estado: string;
  creadoEn: string;
  reportante: { id: string; nombre: string; correo: string };
  publicacion: {
    id: string;
    titulo: string;
    estado: string;
    tipo: string;
    medios: { url: string }[];
    autor: { id: string; nombre: string; correo: string };
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────

const MOTIVO_LABELS: Record<string, string> = {
  SPAM: "Spam",
  CONTENIDO_INAPROPIADO: "Contenido inapropiado",
  INFORMACION_FALSA: "Información falsa / Fraude",
  DUPLICADO: "Publicación duplicada",
  OTRO: "Otro motivo",
};

const ESTADO_TABS = [
  { value: "PENDIENTE", label: "Pendientes" },
  { value: "REVISADO", label: "Revisados" },
  { value: "DESCARTADO", label: "Descartados" },
  { value: "todos", label: "Todos" },
];

function EstadoBadge({ estado }: { estado: string }) {
  if (estado === "REVISADO")
    return <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Revisado</Badge>;
  if (estado === "DESCARTADO")
    return <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">Descartado</Badge>;
  return <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">Pendiente</Badge>;
}

function PubEstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    APROBADA: "bg-green-100 text-green-700",
    PENDIENTE: "bg-yellow-100 text-yellow-700",
    RECHAZADA: "bg-red-100 text-red-700",
    ARCHIVADA: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${map[estado] || "bg-gray-100 text-gray-500"}`}>
      {estado}
    </span>
  );
}

// ── Componente principal ───────────────────────────────────────────────────

export default function AdminReportesPage() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [filterEstado, setFilterEstado] = useState("PENDIENTE");
  const [loading, setLoading] = useState(true);

  // Dialog de resolución
  const [selected, setSelected] = useState<Reporte | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nota, setNota] = useState("");
  const [accion, setAccion] = useState<"ninguna" | "archivar" | "rechazar" | "eliminar">("ninguna");
  const [resolving, setResolving] = useState(false);

  const fetchReportes = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterEstado !== "todos" ? `?estado=${filterEstado}` : "";
      const res = await fetch(`/api/admin/reportes${params}`);
      if (res.ok) {
        const data = await res.json();
        setReportes(data.reportes ?? []);
        setPendingCount(data.pendingCount ?? 0);
      }
    } catch {
      toast.error("Error al cargar reportes");
    } finally {
      setLoading(false);
    }
  }, [filterEstado]);

  useEffect(() => { fetchReportes(); }, [fetchReportes]);

  const openDialog = (reporte: Reporte) => {
    setSelected(reporte);
    setNota("");
    setAccion("ninguna");
    setDialogOpen(true);
  };

  const handleResolve = async (estado: "REVISADO" | "DESCARTADO") => {
    if (!selected) return;
    setResolving(true);
    try {
      const res = await fetch("/api/admin/reportes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          estado,
          nota,
          accionPublicacion: estado === "DESCARTADO" ? "ninguna" : accion,
        }),
      });

      if (!res.ok) { toast.error("Error al resolver el reporte"); return; }

      toast.success(
        estado === "REVISADO"
          ? "Reporte resuelto y acciones aplicadas"
          : "Reporte descartado correctamente"
      );
      setReportes((prev) => prev.filter((r) => r.id !== selected.id));
      setDialogOpen(false);
    } catch {
      toast.error("Error de conexión");
    } finally {
      setResolving(false);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs} h`;
    const days = Math.floor(hrs / 24);
    return `hace ${days} día${days !== 1 ? "s" : ""}`;
  };

  return (
    <div>
      {/* Cabecera */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Gestión de Reportes</h1>
          <p className="text-gray-500 text-sm mt-1">
            Revisa, valida y toma acciones sobre las publicaciones reportadas por la comunidad.
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-bold text-amber-700">
              {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Tabs de estado */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {ESTADO_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterEstado(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              filterEstado === tab.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {tab.value === "PENDIENTE" && pendingCount > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 text-[#881a1d] animate-spin" />
          <p className="text-gray-400 text-sm">Cargando reportes…</p>
        </div>
      ) : reportes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <ShieldCheck className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-1">Sin reportes</h3>
          <p className="text-gray-400 text-sm">No hay reportes {filterEstado !== "todos" ? `en estado ${filterEstado.toLowerCase()}` : ""}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reportes.map((reporte) => {
            const thumb = reporte.publicacion.medios?.[0]?.url;
            return (
              <div
                key={reporte.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="flex gap-0">
                  {/* Thumbnail de la publicación */}
                  <div className="w-28 h-28 shrink-0 bg-gray-100">
                    {thumb ? (
                      <img src={thumb} alt={reporte.publicacion.titulo} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Flag className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 p-4 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        {/* Motivo + estado */}
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-bold text-gray-900">
                            {MOTIVO_LABELS[reporte.motivo] ?? reporte.motivo}
                          </span>
                          <EstadoBadge estado={reporte.estado} />
                        </div>

                        {/* Publicación */}
                        <p className="text-sm text-gray-600 truncate font-medium">
                          {reporte.publicacion.titulo}{" "}
                          <PubEstadoBadge estado={reporte.publicacion.estado} />
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Autor: {reporte.publicacion.autor.nombre}
                        </p>
                      </div>

                      {/* Acciones rápidas */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Link href={`/publication/${reporte.publicacion.id}`} target="_blank">
                          <Button variant="outline" size="sm" className="rounded-lg h-8 text-xs gap-1">
                            <ExternalLink className="w-3 h-3" />
                            Ver
                          </Button>
                        </Link>
                        {reporte.estado === "PENDIENTE" && (
                          <Button
                            size="sm"
                            onClick={() => openDialog(reporte)}
                            className="bg-[#881a1d] hover:bg-[#6d1416] text-white rounded-lg h-8 text-xs gap-1"
                          >
                            <AlertOctagon className="w-3 h-3" />
                            Resolver
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Descripción del reporte */}
                    {reporte.descripcion && (
                      <p className="text-xs text-gray-500 italic bg-gray-50 rounded-lg px-3 py-2 mb-2 line-clamp-2">
                        "{reporte.descripcion}"
                      </p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo(reporte.creadoEn)}
                      </span>
                      <span>·</span>
                      <span>Reportado por {reporte.reportante.nombre}</span>
                      <span className="hidden sm:inline">·</span>
                      <span className="hidden sm:inline text-gray-300">{reporte.reportante.correo}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Dialog de resolución ── */}
      <Dialog open={dialogOpen} onOpenChange={(v) => !v && setDialogOpen(false)}>
        <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden bg-white dark:bg-zinc-900">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Resolver reporte
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              Elige qué acción tomar sobre esta publicación reportada.
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="px-6 pb-6 pt-4 space-y-5">
              {/* Resumen del reporte */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-3">
                  {selected.publicacion.medios?.[0]?.url ? (
                    <img
                      src={selected.publicacion.medios[0].url}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                      alt=""
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-200 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {selected.publicacion.titulo}
                    </p>
                    <p className="text-xs text-gray-500">
                      {MOTIVO_LABELS[selected.motivo]} · por {selected.reportante.nombre}
                    </p>
                  </div>
                </div>
                {selected.descripcion && (
                  <p className="text-xs text-gray-600 italic border-t pt-2">
                    "{selected.descripcion}"
                  </p>
                )}
              </div>

              {/* Acción sobre la publicación */}
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  Acción sobre la publicación
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "ninguna", label: "Sin cambios", icon: <ShieldCheck className="w-4 h-4" />, desc: "Solo resolver el reporte" },
                    { value: "archivar", label: "Archivar", icon: <Archive className="w-4 h-4" />, desc: "Ocultar sin eliminar" },
                    { value: "rechazar", label: "Rechazar", icon: <XCircle className="w-4 h-4" />, desc: "Marcar como rechazada" },
                    { value: "eliminar", label: "Eliminar", icon: <Trash2 className="w-4 h-4" />, desc: "Borrar permanentemente" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setAccion(opt.value as typeof accion)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        accion === opt.value
                          ? opt.value === "eliminar"
                            ? "border-red-500 bg-red-50"
                            : "border-[#881a1d] bg-[#881a1d]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className={`flex items-center gap-1.5 mb-0.5 font-semibold text-sm ${
                        accion === opt.value
                          ? opt.value === "eliminar" ? "text-red-600" : "text-[#881a1d]"
                          : "text-gray-700"
                      }`}>
                        {opt.icon}
                        {opt.label}
                      </div>
                      <p className="text-xs text-gray-500">{opt.desc}</p>
                    </button>
                  ))}
                </div>

                {accion === "eliminar" && (
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Esta acción es irreversible.
                  </p>
                )}
              </div>

              {/* Nota del admin */}
              <div>
                <label className="text-sm font-semibold text-gray-800 mb-1.5 block">
                  Nota interna{" "}
                  <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <Textarea
                  placeholder="Razón de la decisión, observaciones internas…"
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  rows={3}
                  className="rounded-xl resize-none text-sm"
                />
              </div>
            </div>
          )}

          <DialogFooter className="px-6 pb-6 gap-2 flex-col sm:flex-row">
            <Button
              variant="outline"
              className="rounded-xl flex-1"
              disabled={resolving}
              onClick={() => setDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              className="rounded-xl flex-1 text-gray-600 border-gray-300 hover:bg-gray-50"
              disabled={resolving}
              onClick={() => handleResolve("DESCARTADO")}
            >
              {resolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-1" />}
              Descartar reporte
            </Button>
            <Button
              className="rounded-xl flex-1 bg-[#881a1d] hover:bg-[#6d1416] text-white"
              disabled={resolving}
              onClick={() => handleResolve("REVISADO")}
            >
              {resolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
              Confirmar acción
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
