"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, Users, UserCheck, UserX, Building2, GraduationCap,
  Lock, Unlock, Eye, Loader2, AlertCircle, ChevronLeft,
  ChevronRight, AlertTriangle, X, BookOpen, Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────

type Rol = "ESTUDIANTE" | "ALIADO" | "ADMIN";

interface UsuarioItem {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  facultad: string | null;
  semestre: number | null;
  telefono: string | null;
  avatarUrl: string | null;
  bloqueado: boolean;
  verificado: boolean;
  creadoEn: string;
  _count: { publicaciones: number };
}

interface Stats {
  total: number;
  bloqueados: number;
  verificados: number;
  estudiantes: number;
  aliados: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ── Badges ────────────────────────────────────────────────────────────────────

function RolBadge({ rol }: { rol: Rol }) {
  if (rol === "ADMIN")
    return <Badge className="bg-purple-100 text-purple-800 border-purple-200 border text-xs">Admin</Badge>;
  if (rol === "ALIADO")
    return <Badge className="bg-blue-100 text-blue-800 border-blue-200 border text-xs">Aliado</Badge>;
  return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 border text-xs">Estudiante</Badge>;
}

function EstadoBadge({ bloqueado, verificado }: { bloqueado: boolean; verificado: boolean }) {
  if (bloqueado)
    return <Badge className="bg-red-100 text-red-700 border-red-200 border text-xs">🔒 Bloqueado</Badge>;
  if (verificado)
    return <Badge className="bg-green-100 text-green-700 border-green-200 border text-xs">✓ Verificado</Badge>;
  return <Badge className="bg-gray-100 text-gray-600 border-gray-200 border text-xs">Sin verificar</Badge>;
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, color,
}: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
          <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Bloqueo / Desbloqueo Dialog ───────────────────────────────────────────────

interface BloqueoDialogProps {
  usuario: UsuarioItem | null;
  loading: boolean;
  onConfirm: (motivo: string) => void;
  onCancel: () => void;
}

function BloqueoDialog({ usuario, loading, onConfirm, onCancel }: BloqueoDialogProps) {
  const [motivo, setMotivo] = useState("");
  const [motivoError, setMotivoError] = useState("");

  // Reset cuando cambia el usuario objetivo
  useEffect(() => {
    setMotivo("");
    setMotivoError("");
  }, [usuario?.id]);

  if (!usuario) return null;

  const esBloquear = !usuario.bloqueado;

  const handleConfirm = () => {
    if (esBloquear && !motivo.trim()) {
      setMotivoError("El motivo es obligatorio para bloquear una cuenta");
      return;
    }
    onConfirm(motivo.trim());
  };

  return (
    <Dialog open={!!usuario} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-md"
        onInteractOutside={(e) => { if (loading) e.preventDefault(); }}
      >
        <DialogHeader>
          {/* Ícono central */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 ${
            esBloquear ? "bg-red-100" : "bg-emerald-100"
          }`}>
            {esBloquear
              ? <Lock className="w-7 h-7 text-red-600" />
              : <Unlock className="w-7 h-7 text-emerald-600" />}
          </div>

          <DialogTitle className="text-center text-lg font-bold text-gray-900">
            {esBloquear ? "Bloquear cuenta" : "Desbloquear cuenta"}
          </DialogTitle>

          {/* Resumen del usuario */}
          <div className="flex items-center justify-center gap-3 pt-2 pb-1">
            <Avatar className="w-9 h-9">
              <AvatarImage src={usuario.avatarUrl ?? undefined} />
              <AvatarFallback className="text-sm font-semibold">
                {usuario.nombre[0]}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">{usuario.nombre}</p>
              <p className="text-xs text-gray-500">{usuario.correo}</p>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600 pt-1">
            {esBloquear
              ? "El usuario no podrá iniciar sesión ni acceder al marketplace."
              : "El usuario recuperará acceso completo al marketplace."}
          </p>
        </DialogHeader>

        {/* Motivo */}
        <div className="space-y-1.5 px-1">
          <Label className="text-sm font-medium text-gray-700">
            {esBloquear
              ? <><span>Motivo del bloqueo</span> <span className="text-red-500">*</span></>
              : "Observación (opcional)"
            }
          </Label>
          <Textarea
            placeholder={
              esBloquear
                ? "Ej: Comportamiento inapropiado, contenido fraudulento..."
                : "Ej: Revisado y aprobado, documentación completa..."
            }
            value={motivo}
            onChange={(e) => { setMotivo(e.target.value); setMotivoError(""); }}
            rows={3}
            className={motivoError ? "border-red-400 focus-visible:ring-red-300" : ""}
          />
          {motivoError && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {motivoError}
            </p>
          )}
        </div>

        {/* Aviso */}
        <div className={`rounded-xl px-4 py-3 text-xs flex items-start gap-2 ${
          esBloquear
            ? "bg-red-50 border border-red-100 text-red-700"
            : "bg-emerald-50 border border-emerald-100 text-emerald-700"
        }`}>
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            {esBloquear
              ? "Esta acción puede revertirse en cualquier momento. El usuario recibirá una notificación."
              : "El usuario podrá volver a publicar y enviar mensajes. Recibirá una notificación."}
          </span>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className={`rounded-xl text-white ${
              esBloquear
                ? "bg-red-600 hover:bg-red-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Procesando...</>
            ) : esBloquear ? (
              <><Lock className="w-4 h-4 mr-2" />Bloquear cuenta</>
            ) : (
              <><Unlock className="w-4 h-4 mr-2" />Desbloquear cuenta</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios]     = useState<UsuarioItem[]>([]);
  const [stats, setStats]           = useState<Stats>({ total: 0, bloqueados: 0, verificados: 0, estudiantes: 0, aliados: 0 });
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filtros
  const [search, setSearch]             = useState("");
  const [filterRol, setFilterRol]       = useState("todos");
  const [filterEstado, setFilterEstado] = useState("todos");

  // Diálogo de bloqueo
  const [bloqueoTarget, setBloqueoTarget] = useState<UsuarioItem | null>(null);

  // ── Fetch ───────────────────────────────────────────────────────────────────

  const fetchUsuarios = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (filterRol !== "todos") params.set("rol", filterRol);
      if (filterEstado === "verificado")    params.set("verificado", "true");
      if (filterEstado === "sin-verificar") params.set("verificado", "false");
      if (filterEstado === "bloqueado")     params.set("bloqueado", "true");
      if (search.trim()) params.set("buscar", search.trim());

      const res = await fetch(`/api/admin/usuarios?${params}`);
      if (!res.ok) throw new Error("Error al cargar");
      const data = await res.json();
      setUsuarios(data.usuarios ?? []);
      setStats(data.stats ?? stats);
      setPagination(data.pagination ?? pagination);
    } catch {
      toast.error("Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterRol, filterEstado, search]);

  useEffect(() => {
    const t = setTimeout(() => fetchUsuarios(1), search ? 350 : 0);
    return () => clearTimeout(t);
  }, [fetchUsuarios, search]);

  // ── Bloqueo / Desbloqueo ────────────────────────────────────────────────────

  async function doToggleBloqueo(motivo: string) {
    if (!bloqueoTarget) return;

    // Capturar valores antes de cerrar el diálogo
    const targetId     = bloqueoTarget.id;
    const targetNombre = bloqueoTarget.nombre;
    const nuevoBloqueo = !bloqueoTarget.bloqueado;

    setActionLoading(true);
    setBloqueoTarget(null); // cerrar inmediatamente

    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: targetId,
          bloqueado: nuevoBloqueo,
          ...(motivo && { motivo }),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Error al actualizar el usuario");
      }

      const updated: UsuarioItem = await res.json();

      // Actualizar lista en tiempo real sin refetch
      setUsuarios((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setStats((s) => ({
        ...s,
        bloqueados: updated.bloqueado
          ? s.bloqueados + 1
          : Math.max(0, s.bloqueados - 1),
      }));

      toast.success(
        updated.bloqueado
          ? `${targetNombre} fue bloqueado. No podrá iniciar sesión.`
          : `${targetNombre} fue desbloqueado correctamente.`,
      );
    } catch (err) {
      toast.error((err as Error).message ?? "Error inesperado");
    } finally {
      setActionLoading(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p className="text-gray-600 mt-1">
          Administra cuentas, roles y accesos del marketplace UCP
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard icon={Users}         label="Total"        value={stats.total}       color="bg-slate-100 text-slate-600" />
        <StatCard icon={GraduationCap} label="Estudiantes"  value={stats.estudiantes} color="bg-emerald-100 text-emerald-600" />
        <StatCard icon={Building2}     label="Aliados"      value={stats.aliados}     color="bg-blue-100 text-blue-600" />
        <StatCard icon={UserCheck}     label="Verificados"  value={stats.verificados} color="bg-violet-100 text-violet-600" />
        <StatCard icon={UserX}         label="Bloqueados"   value={stats.bloqueados}  color="bg-red-100 text-red-600" />
      </div>

      {/* Filtros */}
      <Card className="border-0 shadow-lg rounded-xl">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o correo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-full"
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

            {/* Rol */}
            <Select value={filterRol} onValueChange={setFilterRol}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los roles</SelectItem>
                <SelectItem value="ESTUDIANTE">Estudiante</SelectItem>
                <SelectItem value="ALIADO">Aliado</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>

            {/* Estado */}
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="verificado">Verificados</SelectItem>
                <SelectItem value="sin-verificar">Sin verificar</SelectItem>
                <SelectItem value="bloqueado">Bloqueados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Conteo */}
      {!loading && (
        <p className="text-sm text-gray-500">
          {pagination.total} usuario{pagination.total !== 1 ? "s" : ""}
          {search && ` para "${search}"`}
          {pagination.totalPages > 1 && ` — Página ${pagination.page} de ${pagination.totalPages}`}
        </p>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-ucp-rojo" />
        </div>
      ) : usuarios.length === 0 ? (
        <Card className="border-0 shadow-lg rounded-xl">
          <CardContent className="py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">Sin resultados</h3>
            <p className="text-gray-600">No se encontraron usuarios con los filtros actuales</p>
            {(search || filterRol !== "todos" || filterEstado !== "todos") && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 rounded-full"
                onClick={() => { setSearch(""); setFilterRol("todos"); setFilterEstado("todos"); }}
              >
                Limpiar filtros
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {usuarios.map((u) => (
            <Card
              key={u.id}
              className={`border-0 shadow-lg rounded-xl hover:shadow-xl transition-shadow ${
                u.bloqueado ? "border-l-4 border-l-red-400" : ""
              }`}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <Avatar className="w-14 h-14 shrink-0">
                    <AvatarImage src={u.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-ucp-rojo/10 text-ucp-rojo font-bold text-lg">
                      {u.nombre.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-900">{u.nombre}</span>
                      <RolBadge rol={u.rol} />
                      <EstadoBadge bloqueado={u.bloqueado} verificado={u.verificado} />
                    </div>

                    <p className="text-sm text-gray-500 truncate">{u.correo}</p>

                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 flex-wrap">
                      {u.facultad && (
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {u.facultad}
                          {u.semestre && ` · Sem. ${u.semestre}`}
                        </span>
                      )}
                      {u.telefono && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {u.telefono}
                        </span>
                      )}
                      <span>{u._count.publicaciones} publicación{u._count.publicaciones !== 1 ? "es" : ""}</span>
                      <span>Desde {new Date(u.creadoEn).toLocaleDateString("es-CO")}</span>
                    </div>

                    {/* Aviso visual cuando está bloqueado */}
                    {u.bloqueado && (
                      <p className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Este usuario no puede iniciar sesión
                      </p>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    <Link href={`/dashboard/student/profile?id=${u.id}`}>
                      <Button variant="outline" size="sm" className="rounded-lg gap-1.5 text-xs h-8">
                        <Eye className="w-3.5 h-3.5" />
                        Ver perfil
                      </Button>
                    </Link>

                    {u.rol !== "ADMIN" && (
                      <Button
                        size="sm"
                        disabled={actionLoading}
                        className={`rounded-lg gap-1.5 text-xs h-8 ${
                          u.bloqueado
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-red-600 hover:bg-red-700 text-white"
                        }`}
                        onClick={() => setBloqueoTarget(u)}
                      >
                        {u.bloqueado ? (
                          <><Unlock className="w-3.5 h-3.5" />Desbloquear</>
                        ) : (
                          <><Lock className="w-3.5 h-3.5" />Bloquear</>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg gap-1"
            disabled={pagination.page <= 1 || loading}
            onClick={() => fetchUsuarios(pagination.page - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => fetchUsuarios(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  p === pagination.page
                    ? "bg-ucp-rojo text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            ))}
            {pagination.totalPages > 5 && (
              <span className="text-gray-400 px-1 text-sm">...</span>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="rounded-lg gap-1"
            disabled={pagination.page >= pagination.totalPages || loading}
            onClick={() => fetchUsuarios(pagination.page + 1)}
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Diálogo de confirmación de bloqueo/desbloqueo */}
      <BloqueoDialog
        usuario={bloqueoTarget}
        loading={actionLoading}
        onConfirm={doToggleBloqueo}
        onCancel={() => setBloqueoTarget(null)}
      />
    </div>
  );
}
