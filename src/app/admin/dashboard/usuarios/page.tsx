"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search, Plus, Users, UserCheck, UserX, Building2,
  GraduationCap, Pencil, Lock, Unlock, Eye,
  Loader2, AlertCircle, ChevronLeft, ChevronRight,
  Shield, Phone, BookOpen, X,
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

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

interface FormState {
  nombre: string;
  correo: string;
  contrasena: string;
  rol: "ESTUDIANTE" | "ALIADO";
  facultad: string;
  semestre: string;
  telefono: string;
  verificado: boolean;
  bloqueado: boolean;
}

const EMPTY_FORM: FormState = {
  nombre: "",
  correo: "",
  contrasena: "",
  rol: "ESTUDIANTE",
  facultad: "",
  semestre: "",
  telefono: "",
  verificado: false,
  bloqueado: false,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function RolBadge({ rol }: { rol: Rol }) {
  if (rol === "ADMIN")
    return <Badge className="bg-purple-100 text-purple-800 border-purple-200 border font-medium text-xs">Admin</Badge>;
  if (rol === "ALIADO")
    return <Badge className="bg-blue-100 text-blue-800 border-blue-200 border font-medium text-xs">Aliado</Badge>;
  return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 border font-medium text-xs">Estudiante</Badge>;
}

function EstadoBadge({ bloqueado, verificado }: { bloqueado: boolean; verificado: boolean }) {
  if (bloqueado)
    return <Badge className="bg-red-100 text-red-700 border-red-200 border font-medium text-xs">Bloqueado</Badge>;
  if (verificado)
    return <Badge className="bg-green-100 text-green-700 border-green-200 border font-medium text-xs">Verificado</Badge>;
  return <Badge className="bg-gray-100 text-gray-600 border-gray-200 border font-medium text-xs">Sin verificar</Badge>;
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
          <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Modal Crear / Editar ──────────────────────────────────────────────────────

interface UsuarioModalProps {
  mode: "create" | "edit";
  usuario?: UsuarioItem | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (u: UsuarioItem) => void;
}

function UsuarioModal({ mode, usuario, open, onClose, onSuccess }: UsuarioModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  // Pre-rellenar en modo edición
  useEffect(() => {
    if (mode === "edit" && usuario) {
      setForm({
        nombre: usuario.nombre,
        correo: usuario.correo,
        contrasena: "",
        rol: usuario.rol === "ADMIN" ? "ESTUDIANTE" : (usuario.rol as "ESTUDIANTE" | "ALIADO"),
        facultad: usuario.facultad ?? "",
        semestre: usuario.semestre?.toString() ?? "",
        telefono: usuario.telefono ?? "",
        verificado: usuario.verificado,
        bloqueado: usuario.bloqueado,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [mode, usuario, open]);

  const set = (k: keyof FormState) => (v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.nombre.trim() || form.nombre.trim().length < 2)
      e.nombre = "El nombre debe tener al menos 2 caracteres";
    if (!form.correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo))
      e.correo = "Ingresa un correo electrónico válido";
    if (mode === "create" && form.contrasena.length < 6)
      e.contrasena = "La contraseña debe tener al menos 6 caracteres";
    if (form.semestre && (isNaN(Number(form.semestre)) || Number(form.semestre) < 1 || Number(form.semestre) > 12))
      e.semestre = "Semestre entre 1 y 12";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        nombre: form.nombre.trim(),
        correo: form.correo.toLowerCase().trim(),
        rol: form.rol,
        facultad: form.facultad.trim() || null,
        semestre: form.semestre ? parseInt(form.semestre) : null,
        telefono: form.telefono.trim() || null,
        verificado: form.verificado,
      };

      if (mode === "create") {
        payload.contrasena = form.contrasena;
      } else {
        payload.id = usuario!.id;
        payload.bloqueado = form.bloqueado;
      }

      const url =
        mode === "create" ? "/api/admin/usuarios" : "/api/admin/usuarios";
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setErrors({ correo: data.error });
        } else if (data.details) {
          const newErrors: Partial<Record<keyof FormState, string>> = {};
          for (const [k, v] of Object.entries(data.details)) {
            newErrors[k as keyof FormState] = (v as string[])[0];
          }
          setErrors(newErrors);
        } else {
          toast.error(data.error ?? "Error inesperado");
        }
        return;
      }

      onSuccess(data as UsuarioItem);
      toast.success(
        mode === "create"
          ? `Usuario "${data.nombre}" creado correctamente`
          : `Usuario "${data.nombre}" actualizado correctamente`
      );
      onClose();
    } catch {
      toast.error("Error de conexión. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg rounded-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {mode === "create" ? "Crear nuevo usuario" : `Editar: ${usuario?.nombre}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="nombre" className="text-sm font-medium text-gray-700">
              Nombre completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre"
              placeholder="Ej. Sebastian Patino"
              value={form.nombre}
              onChange={(e) => set("nombre")(e.target.value)}
              className={errors.nombre ? "border-red-400" : ""}
            />
            {errors.nombre && <p className="text-xs text-red-500">{errors.nombre}</p>}
          </div>

          {/* Correo */}
          <div className="space-y-1.5">
            <Label htmlFor="correo" className="text-sm font-medium text-gray-700">
              Correo electrónico <span className="text-red-500">*</span>
            </Label>
            <Input
              id="correo"
              type="email"
              placeholder="usuario@ucp.edu.co"
              value={form.correo}
              onChange={(e) => set("correo")(e.target.value)}
              className={errors.correo ? "border-red-400" : ""}
            />
            {errors.correo && <p className="text-xs text-red-500">{errors.correo}</p>}
          </div>

          {/* Contraseña (solo crear) */}
          {mode === "create" && (
            <div className="space-y-1.5">
              <Label htmlFor="contrasena" className="text-sm font-medium text-gray-700">
                Contraseña <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contrasena"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={form.contrasena}
                onChange={(e) => set("contrasena")(e.target.value)}
                className={errors.contrasena ? "border-red-400" : ""}
              />
              {errors.contrasena && (
                <p className="text-xs text-red-500">{errors.contrasena}</p>
              )}
            </div>
          )}

          {/* Rol + Semestre */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Rol <span className="text-red-500">*</span>
              </Label>
              <Select value={form.rol} onValueChange={(v) => set("rol")(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ESTUDIANTE">Estudiante</SelectItem>
                  <SelectItem value="ALIADO">Aliado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="semestre" className="text-sm font-medium text-gray-700">
                Semestre
              </Label>
              <Input
                id="semestre"
                type="number"
                min={1}
                max={12}
                placeholder="1 – 12"
                value={form.semestre}
                onChange={(e) => set("semestre")(e.target.value)}
                className={errors.semestre ? "border-red-400" : ""}
              />
              {errors.semestre && <p className="text-xs text-red-500">{errors.semestre}</p>}
            </div>
          </div>

          {/* Facultad + Teléfono */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="facultad" className="text-sm font-medium text-gray-700">
                Facultad / Programa
              </Label>
              <Input
                id="facultad"
                placeholder="Ej. Ingeniería de Sistemas"
                value={form.facultad}
                onChange={(e) => set("facultad")(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="telefono" className="text-sm font-medium text-gray-700">
                Teléfono
              </Label>
              <Input
                id="telefono"
                placeholder="57 300 000 0000"
                value={form.telefono}
                onChange={(e) => set("telefono")(e.target.value)}
              />
            </div>
          </div>

          {/* Switches */}
          <div className={`grid gap-3 pt-1 ${mode === "edit" ? "grid-cols-2" : "grid-cols-1"}`}>
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">Verificado</p>
                <p className="text-xs text-gray-500">Cuenta confirmada</p>
              </div>
              <Switch
                checked={form.verificado}
                onCheckedChange={(v) => set("verificado")(v)}
              />
            </div>

            {mode === "edit" && (
              <div className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-red-800">Bloqueado</p>
                  <p className="text-xs text-red-500">Sin acceso al sistema</p>
                </div>
                <Switch
                  checked={form.bloqueado}
                  onCheckedChange={(v) => set("bloqueado")(v)}
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#881a1d] hover:bg-[#6d1517] text-white"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === "create" ? "Creando..." : "Guardando..."}
                </>
              ) : mode === "create" ? (
                "Crear usuario"
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, bloqueados: 0, verificados: 0, estudiantes: 0, aliados: 0 });
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [filterRol, setFilterRol] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("todos");

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UsuarioItem | null>(null);

  // ── Fetch ───────────────────────────────────────────────────────────────────

  const fetchUsuarios = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (filterRol !== "todos") params.set("rol", filterRol);
      if (filterEstado === "verificado") params.set("verificado", "true");
      else if (filterEstado === "sin-verificar") params.set("verificado", "false");
      else if (filterEstado === "bloqueado") params.set("bloqueado", "true");
      if (search.trim()) params.set("buscar", search.trim());

      const res = await fetch(`/api/admin/usuarios?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsuarios(data.usuarios ?? []);
      setStats(data.stats ?? stats);
      setPagination(data.pagination ?? pagination);
    } catch {
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterRol, filterEstado, search]);

  useEffect(() => {
    const t = setTimeout(() => fetchUsuarios(1), search ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchUsuarios, search]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  function confirmToggleBloqueo(u: UsuarioItem) {
    const accion = u.bloqueado ? "desbloquear" : "bloquear";
    const label = u.bloqueado ? "Desbloquear" : "Bloquear";
    toast(`¿${label} a ${u.nombre}?`, {
      description: u.bloqueado
        ? "El usuario recuperará acceso al marketplace."
        : "El usuario perderá acceso al marketplace.",
      action: {
        label,
        onClick: () => doToggleBloqueo(u),
      },
      cancel: { label: "Cancelar", onClick: () => {} },
      duration: 8000,
    });
  }

  async function doToggleBloqueo(u: UsuarioItem) {
    setActionLoading(u.id);
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: u.id, bloqueado: !u.bloqueado }),
      });
      if (!res.ok) throw new Error();
      const updated: UsuarioItem = await res.json();
      setUsuarios((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      toast.success(updated.bloqueado ? "Usuario bloqueado" : "Usuario desbloqueado");
    } catch {
      toast.error("Error al actualizar el usuario");
    } finally {
      setActionLoading(null);
    }
  }

  function handleCreateSuccess(u: UsuarioItem) {
    setUsuarios((prev) => [u, ...prev]);
    setStats((s) => ({ ...s, total: s.total + 1, estudiantes: u.rol === "ESTUDIANTE" ? s.estudiantes + 1 : s.estudiantes, aliados: u.rol === "ALIADO" ? s.aliados + 1 : s.aliados }));
  }

  function handleEditSuccess(u: UsuarioItem) {
    setUsuarios((prev) => prev.map((x) => (x.id === u.id ? u : x)));
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Administra cuentas, roles y estados del marketplace
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-[#881a1d] hover:bg-[#6d1517] text-white rounded-xl gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Crear usuario
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard icon={Users}        label="Total usuarios"  value={stats.total}       color="bg-slate-100 text-slate-600" />
        <StatCard icon={GraduationCap} label="Estudiantes"    value={stats.estudiantes} color="bg-emerald-100 text-emerald-600" />
        <StatCard icon={Building2}    label="Aliados"         value={stats.aliados}     color="bg-blue-100 text-blue-600" />
        <StatCard icon={UserCheck}    label="Verificados"     value={stats.verificados} color="bg-violet-100 text-violet-600" />
        <StatCard icon={UserX}        label="Bloqueados"      value={stats.bloqueados}  color="bg-red-100 text-red-600" />
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
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

            {/* Rol filter */}
            <Select value={filterRol} onValueChange={setFilterRol}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los roles</SelectItem>
                <SelectItem value="ESTUDIANTE">Estudiante</SelectItem>
                <SelectItem value="ALIADO">Aliado</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>

            {/* Estado filter */}
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

      {/* Results header */}
      {!loading && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            {pagination.total} usuario{pagination.total !== 1 ? "s" : ""} encontrado{pagination.total !== 1 ? "s" : ""}
            {search && ` para "${search}"`}
          </span>
          {pagination.totalPages > 1 && (
            <span>Página {pagination.page} de {pagination.totalPages}</span>
          )}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#881a1d]" />
        </div>
      ) : usuarios.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Sin resultados</h3>
            <p className="text-sm text-gray-500">No se encontraron usuarios con los filtros actuales</p>
            {(search || filterRol !== "todos" || filterEstado !== "todos") && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
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
            <Card key={u.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <Avatar className="w-12 h-12 shrink-0">
                    <AvatarImage src={u.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-[#881a1d]/10 text-[#881a1d] font-semibold">
                      {u.nombre.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-semibold text-gray-900 text-sm">{u.nombre}</span>
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
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/admin/dashboard/usuarios/${u.id}`}>
                      <Button variant="outline" size="sm" className="rounded-lg gap-1.5 text-xs h-8">
                        <Eye className="w-3.5 h-3.5" />
                        Ver perfil
                      </Button>
                    </Link>

                    {u.rol !== "ADMIN" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg gap-1.5 text-xs h-8"
                        onClick={() => setEditTarget(u)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Editar
                      </Button>
                    )}

                    {u.rol !== "ADMIN" && (
                      <Button
                        variant={u.bloqueado ? "outline" : "destructive"}
                        size="sm"
                        className={`rounded-lg gap-1.5 text-xs h-8 ${
                          u.bloqueado
                            ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                            : ""
                        }`}
                        onClick={() => confirmToggleBloqueo(u)}
                        disabled={actionLoading === u.id}
                      >
                        {actionLoading === u.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : u.bloqueado ? (
                          <>
                            <Unlock className="w-3.5 h-3.5" />
                            Desbloquear
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            Bloquear
                          </>
                        )}
                      </Button>
                    )}

                    {u.rol === "ADMIN" && (
                      <div className="flex items-center gap-1.5 text-xs text-purple-600 bg-purple-50 rounded-lg px-3 py-1.5 border border-purple-100">
                        <Shield className="w-3.5 h-3.5" />
                        Administrador
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            disabled={pagination.page <= 1 || loading}
            onClick={() => fetchUsuarios(pagination.page - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => fetchUsuarios(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    p === pagination.page
                      ? "bg-[#881a1d] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            {pagination.totalPages > 5 && (
              <span className="text-gray-400 px-1">...</span>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            disabled={pagination.page >= pagination.totalPages || loading}
            onClick={() => fetchUsuarios(pagination.page + 1)}
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Create Modal */}
      <UsuarioModal
        mode="create"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Modal */}
      <UsuarioModal
        mode="edit"
        usuario={editTarget}
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
