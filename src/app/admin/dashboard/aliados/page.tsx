"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Building2, CheckCircle2, XCircle, Clock, Search,
  Loader2, AlertCircle, X, Mail, Phone, Calendar,
  RefreshCw, ExternalLink,
} from "lucide-react";
import { Button }                             from "@/components/ui/button";
import { Input }                              from "@/components/ui/input";
import { Card, CardContent }                  from "@/components/ui/card";
import { Badge }                              from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label }    from "@/components/ui/label";
import { toast }    from "sonner";
import Link         from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AliadoPendiente {
  id:        string;
  nombre:    string;
  correo:    string;
  telefono:  string | null;
  facultad:  string | null;
  avatarUrl: string | null;
  creadoEn:  string;
  bloqueado: boolean;
  verificado: boolean;
  _count: { publicaciones: number };
}

// ── Dialog de rechazo ─────────────────────────────────────────────────────────

interface RechazoDialogProps {
  aliado:    AliadoPendiente | null;
  loading:   boolean;
  onConfirm: (motivo: string) => void;
  onCancel:  () => void;
}

function RechazoDialog({ aliado, loading, onConfirm, onCancel }: RechazoDialogProps) {
  const [motivo, setMotivo]           = useState("");
  const [motivoError, setMotivoError] = useState("");

  useEffect(() => {
    setMotivo("");
    setMotivoError("");
  }, [aliado?.id]);

  if (!aliado) return null;

  const handleConfirm = () => {
    if (!motivo.trim()) {
      setMotivoError("Debes indicar el motivo del rechazo");
      return;
    }
    onConfirm(motivo.trim());
  };

  return (
    <Dialog open={!!aliado} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-md rounded-2xl bg-white"
        onInteractOutside={(e) => { if (loading) e.preventDefault(); }}
      >
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-3">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <DialogTitle className="text-center text-lg font-bold text-gray-900">
            Rechazar solicitud de {aliado.nombre}
          </DialogTitle>
          <p className="text-center text-sm text-gray-500 pt-1">
            La cuenta quedará bloqueada y el aliado no podrá acceder al sistema.
          </p>
        </DialogHeader>

        <div className="px-1 space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            Motivo del rechazo <span className="text-red-500">*</span>
          </Label>
          <Textarea
            placeholder="Explica brevemente por qué se rechaza esta solicitud..."
            value={motivo}
            onChange={(e) => { setMotivo(e.target.value); setMotivoError(""); }}
            rows={3}
            className={motivoError ? "border-red-400" : ""}
          />
          {motivoError && (
            <p className="text-xs text-red-500">{motivoError}</p>
          )}
        </div>

        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>El aliado recibirá una notificación con el motivo del rechazo.</span>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Rechazando...</>
              : <><XCircle className="w-4 h-4 mr-2" />Rechazar solicitud</>
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Componente de tarjeta de aliado ───────────────────────────────────────────

interface AliadoCardProps {
  aliado:      AliadoPendiente;
  aprobarLoading: boolean;
  onAprobar:   (a: AliadoPendiente) => void;
  onRechazar:  (a: AliadoPendiente) => void;
}

function AliadoCard({ aliado, aprobarLoading, onAprobar, onRechazar }: AliadoCardProps) {
  const diasEspera = Math.floor(
    (Date.now() - new Date(aliado.creadoEn).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row gap-4">

          {/* Info principal */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <Avatar className="w-12 h-12 shrink-0">
              <AvatarImage src={aliado.avatarUrl ?? undefined} />
              <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-lg">
                {aliado.nombre.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-semibold text-gray-900">{aliado.nombre}</span>
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 border text-xs font-medium">
                  Pendiente
                </Badge>
                {diasEspera > 1 && (
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200 border text-xs">
                    {diasEspera}d esperando
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{aliado.correo}</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                {aliado.telefono && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {aliado.telefono}
                  </span>
                )}
                {aliado.facultad && (
                  <span className="truncate max-w-[140px]">{aliado.facultad}</span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(aliado.creadoEn).toLocaleDateString("es-CO", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:justify-center shrink-0">
            <Link href={`/admin/dashboard/usuarios/${aliado.id}`} target="_blank">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg gap-1.5 text-xs h-8"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Ver perfil</span>
              </Button>
            </Link>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => onAprobar(aliado)}
                disabled={aprobarLoading}
                className="rounded-lg gap-1.5 text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold whitespace-nowrap"
              >
                {aprobarLoading
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <CheckCircle2 className="w-3.5 h-3.5" />
                }
                <span>Aprobar</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onRechazar(aliado)}
                className="rounded-lg gap-1.5 text-xs h-8 border-red-200 text-red-600 hover:bg-red-50 whitespace-nowrap"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Rechazar</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function AdminAliadosPage() {
  const [aliados,       setAliados]       = useState<AliadoPendiente[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search,        setSearch]        = useState("");
  const [rechazoTarget, setRechazoTarget] = useState<AliadoPendiente | null>(null);
  const [aprobarTarget, setAprobarTarget] = useState<string | null>(null); // id del que se está aprobando

  // ── Fetch aliados pendientes ───────────────────────────────────────────────

  const fetchAliados = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        rol:        "ALIADO",
        verificado: "false",
        bloqueado:  "false",
        limit:      "50",
      });
      if (search.trim()) params.set("buscar", search.trim());

      const res  = await fetch(`/api/admin/usuarios?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAliados(data.usuarios ?? []);
    } catch {
      toast.error("Error al cargar aliados pendientes");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => fetchAliados(), search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchAliados, search]);

  // ── Aprobar ────────────────────────────────────────────────────────────────

  async function doAprobar(aliado: AliadoPendiente) {
    setAprobarTarget(aliado.id);
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/usuarios", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          id:         aliado.id,
          verificado: true,
          motivo:     "Cuenta de aliado aprobada por el administrador.",
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Error");

      setAliados((prev) => prev.filter((a) => a.id !== aliado.id));
      toast.success(`✓ ${aliado.nombre} fue aprobado correctamente`);
    } catch (err) {
      toast.error((err as Error).message || "Error al aprobar");
    } finally {
      setActionLoading(false);
      setAprobarTarget(null);
    }
  }

  // ── Rechazar ───────────────────────────────────────────────────────────────

  async function doRechazar(motivo: string) {
    if (!rechazoTarget) return;
    const target = rechazoTarget;
    setRechazoTarget(null);
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/usuarios", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          id:       target.id,
          bloqueado: true,
          motivo,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Error");

      setAliados((prev) => prev.filter((a) => a.id !== target.id));
      toast.success(`Solicitud de ${target.nombre} rechazada`);
    } catch (err) {
      toast.error((err as Error).message || "Error al rechazar");
    } finally {
      setActionLoading(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#881a1d]" />
            Aliados Pendientes
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Revisa y aprueba (o rechaza) las solicitudes de aliados empresariales
          </p>
        </div>
        <Button
          onClick={() => fetchAliados()}
          variant="outline"
          className="gap-2 rounded-xl shrink-0"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{aliados.length}</p>
              <p className="text-xs text-gray-500">Pendientes de revisión</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {aliados.filter(a => {
                  const dias = Math.floor(
                    (Date.now() - new Date(a.creadoEn).getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return dias > 1;
                }).length}
              </p>
              <p className="text-xs text-gray-500">Con más de 1 día esperando</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {aliados.filter(a => {
                  const dias = Math.floor(
                    (Date.now() - new Date(a.creadoEn).getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return dias <= 1;
                }).length}
              </p>
              <p className="text-xs text-gray-500">Nuevos (último día)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Buscador */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-lg"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#881a1d]" />
        </div>
      ) : aliados.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-20 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              {search ? "Sin resultados" : "¡Sin pendientes!"}
            </h3>
            <p className="text-sm text-gray-500">
              {search
                ? `No se encontraron aliados para "${search}"`
                : "No hay solicitudes de aliados pendientes de aprobación."
              }
            </p>
            {search && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setSearch("")}
              >
                Limpiar búsqueda
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {!loading && (
            <p className="text-sm text-gray-500">
              {aliados.length} solicitud{aliados.length !== 1 ? "es" : ""} pendiente
              {aliados.length !== 1 ? "s" : ""}
              {search && ` para "${search}"`}
            </p>
          )}
          {aliados.map((aliado) => (
            <AliadoCard
              key={aliado.id}
              aliado={aliado}
              aprobarLoading={actionLoading && aprobarTarget === aliado.id}
              onAprobar={doAprobar}
              onRechazar={(a) => setRechazoTarget(a)}
            />
          ))}
        </div>
      )}

      {/* Dialog de rechazo */}
      <RechazoDialog
        aliado={rechazoTarget}
        loading={actionLoading}
        onConfirm={doRechazar}
        onCancel={() => setRechazoTarget(null)}
      />
    </div>
  );
}
