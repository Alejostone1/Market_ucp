"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, Package,
  Pencil, Lock, Unlock, UserCheck, UserX, Loader2,
  BookOpen, Shield, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────

type Rol = "ESTUDIANTE" | "ALIADO" | "ADMIN";

interface UsuarioDetalle {
  id:            string;
  nombre:        string;
  correo:        string;
  rol:           Rol;
  facultad:      string | null;
  semestre:      number | null;
  avatarUrl:     string | null;
  telefono:      string | null;
  bloqueado:     boolean;
  verificado:    boolean;
  motivoBloqueo: string | null;
  creadoEn:      string;
  _count: { publicaciones: number };
}

interface Publicacion {
  id:         string;
  titulo:     string;
  descripcion: string;
  tipo:        string;
  estado:      string;
  precio:      number | null;
  tipoPrecio:  string | null;
  categoria:   { id: string; nombre: string; color: string };
  medios:      { id: string; url: string }[];
  creadoEn:    string;
}

interface FormState {
  nombre:        string;
  correo:        string;
  rol:           "ESTUDIANTE" | "ALIADO";
  facultad:      string;
  semestre:      string;
  telefono:      string;
  verificado:    boolean;
  bloqueado:     boolean;
  motivoBloqueo: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function RolBadge({ rol }: { rol: Rol }) {
  if (rol === "ADMIN")
    return <Badge className="bg-purple-100 text-purple-800 border-purple-200 border font-medium">Administrador</Badge>;
  if (rol === "ALIADO")
    return <Badge className="bg-blue-100 text-blue-800 border-blue-200 border font-medium">Aliado</Badge>;
  return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 border font-medium">Estudiante</Badge>;
}

function EstadoBadge({ bloqueado, verificado }: { bloqueado: boolean; verificado: boolean }) {
  if (bloqueado)  return <Badge className="bg-red-100 text-red-700 border-red-200 border font-medium">Bloqueado</Badge>;
  if (verificado) return <Badge className="bg-green-100 text-green-700 border-green-200 border font-medium">Verificado</Badge>;
  return <Badge className="bg-gray-100 text-gray-600 border-gray-200 border font-medium">Sin verificar</Badge>;
}

function EstadoPubBadge({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    APROBADA:   "bg-green-100 text-green-800",
    PENDIENTE:  "bg-yellow-100 text-yellow-800",
    RECHAZADA:  "bg-red-100 text-red-800",
    ARCHIVADA:  "bg-gray-100 text-gray-700",
    SUSPENDIDA: "bg-orange-100 text-orange-800",
  };
  const labels: Record<string, string> = {
    APROBADA: "Aprobada", PENDIENTE: "Pendiente",
    RECHAZADA: "Rechazada", ARCHIVADA: "Archivada", SUSPENDIDA: "Suspendida",
  };
  return (
    <Badge className={`font-medium text-xs ${map[estado] ?? "bg-gray-100 text-gray-700"}`}>
      {labels[estado] ?? estado}
    </Badge>
  );
}

function formatPrice(p: number | null, tipo: string | null) {
  if (!p) return "Gratis";
  const f = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(Number(p));
  return tipo === "POR_HORA" ? `${f}/hora` : f;
}

// ── Edit Modal ────────────────────────────────────────────────────────────────

interface EditModalProps {
  usuario:   UsuarioDetalle;
  open:      boolean;
  onClose:   () => void;
  onSuccess: (u: UsuarioDetalle) => void;
}

function EditModal({ usuario, open, onClose, onSuccess }: EditModalProps) {
  const [form, setForm] = useState<FormState>({
    nombre:        usuario.nombre,
    correo:        usuario.correo,
    rol:           usuario.rol === "ADMIN" ? "ESTUDIANTE" : (usuario.rol as "ESTUDIANTE" | "ALIADO"),
    facultad:      usuario.facultad   ?? "",
    semestre:      usuario.semestre?.toString() ?? "",
    telefono:      usuario.telefono   ?? "",
    verificado:    usuario.verificado,
    bloqueado:     usuario.bloqueado,
    motivoBloqueo: usuario.motivoBloqueo ?? "",
  });
  const [errors,     setErrors]     = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        nombre:        usuario.nombre,
        correo:        usuario.correo,
        rol:           usuario.rol === "ADMIN" ? "ESTUDIANTE" : (usuario.rol as "ESTUDIANTE" | "ALIADO"),
        facultad:      usuario.facultad   ?? "",
        semestre:      usuario.semestre?.toString() ?? "",
        telefono:      usuario.telefono   ?? "",
        verificado:    usuario.verificado,
        bloqueado:     usuario.bloqueado,
        motivoBloqueo: usuario.motivoBloqueo ?? "",
      });
      setErrors({});
    }
  }, [open, usuario]);

  const set = (k: keyof FormState) => (v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  function validate() {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.nombre.trim() || form.nombre.trim().length < 2) e.nombre = "Mínimo 2 caracteres";
    if (!form.correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) e.correo = "Correo inválido";
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
        nombre:     form.nombre.trim(),
        correo:     form.correo.toLowerCase().trim(),
        rol:        form.rol,
        facultad:   form.facultad.trim() || null,
        semestre:   form.semestre ? parseInt(form.semestre) : null,
        telefono:   form.telefono.trim() || null,
        verificado: form.verificado,
        bloqueado:  form.bloqueado,
      };

      // Solo enviar motivoBloqueo si está bloqueando
      if (form.bloqueado) {
        payload.motivoBloqueo = form.motivoBloqueo.trim() || null;
      } else {
        payload.motivoBloqueo = null;
      }

      const res  = await fetch(`/api/admin/usuarios/${usuario.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) setErrors({ correo: data.error });
        else toast.error(data.error ?? "Error al actualizar");
        return;
      }
      onSuccess(data as UsuarioDetalle);
      toast.success(`${data.nombre} actualizado correctamente`);
      onClose();
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent aria-describedby={undefined} className="max-w-lg rounded-2xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Editar usuario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Nombre completo <span className="text-red-500">*</span></Label>
            <Input value={form.nombre} onChange={(e) => set("nombre")(e.target.value)} className={errors.nombre ? "border-red-400" : ""} />
            {errors.nombre && <p className="text-xs text-red-500">{errors.nombre}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Correo electrónico <span className="text-red-500">*</span></Label>
            <Input type="email" value={form.correo} onChange={(e) => set("correo")(e.target.value)} className={errors.correo ? "border-red-400" : ""} />
            {errors.correo && <p className="text-xs text-red-500">{errors.correo}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Rol</Label>
              <Select value={form.rol} onValueChange={(v) => set("rol")(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ESTUDIANTE">Estudiante</SelectItem>
                  <SelectItem value="ALIADO">Aliado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Semestre</Label>
              <Input
                type="number" min={1} max={12} placeholder="1 – 12"
                value={form.semestre}
                onChange={(e) => set("semestre")(e.target.value)}
                className={errors.semestre ? "border-red-400" : ""}
              />
              {errors.semestre && <p className="text-xs text-red-500">{errors.semestre}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Facultad / Programa</Label>
              <Input placeholder="Ej. Ingeniería de Sistemas" value={form.facultad} onChange={(e) => set("facultad")(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Teléfono</Label>
              <Input placeholder="57 300 000 0000" value={form.telefono} onChange={(e) => set("telefono")(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">Verificado</p>
                <p className="text-xs text-gray-500">Cuenta confirmada</p>
              </div>
              <Switch checked={form.verificado} onCheckedChange={(v) => set("verificado")(v)} />
            </div>
            <div className={`flex items-center justify-between rounded-xl px-4 py-3 ${form.bloqueado ? "bg-red-50" : "bg-gray-50"}`}>
              <div>
                <p className={`text-sm font-medium ${form.bloqueado ? "text-red-800" : "text-gray-800"}`}>Bloqueado</p>
                <p className={`text-xs ${form.bloqueado ? "text-red-500" : "text-gray-500"}`}>Sin acceso</p>
              </div>
              <Switch checked={form.bloqueado} onCheckedChange={(v) => set("bloqueado")(v)} />
            </div>
          </div>

          {/* Motivo de bloqueo — solo visible cuando se bloquea */}
          {form.bloqueado && (
            <div className="space-y-1.5 p-3 bg-red-50 rounded-xl border border-red-100">
              <Label className="text-sm font-medium text-red-800">
                Motivo del bloqueo
                <span className="ml-1 text-xs font-normal text-red-500">(opcional)</span>
              </Label>
              <Textarea
                placeholder="Describe el motivo del bloqueo..."
                value={form.motivoBloqueo}
                onChange={(e) => set("motivoBloqueo")(e.target.value)}
                maxLength={500}
                rows={3}
                className="resize-none border-red-200 focus:border-red-400 bg-white"
              />
              <p className="text-xs text-red-400 text-right">{form.motivoBloqueo.length}/500</p>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>Cancelar</Button>
            <Button type="submit" className="bg-[#881a1d] hover:bg-[#6d1517] text-white" disabled={submitting}>
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</> : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Block Dialog ──────────────────────────────────────────────────────────────

interface BlockDialogProps {
  nombre:    string;
  open:      boolean;
  onClose:   () => void;
  onConfirm: (motivo: string) => void;
  loading:   boolean;
}

function BlockDialog({ nombre, open, onClose, onConfirm, loading }: BlockDialogProps) {
  const [motivo, setMotivo] = useState("");

  useEffect(() => { if (open) setMotivo(""); }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent aria-describedby="block-desc" className="max-w-md rounded-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-600" />
            Bloquear usuario
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-1" id="block-desc">
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-700">
              <strong>{nombre}</strong> perderá acceso inmediato al marketplace.
              Si está activo en este momento, su sesión quedará inválida en el próximo acceso.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Motivo del bloqueo
              <span className="ml-1 text-xs font-normal text-gray-400">(opcional)</span>
            </Label>
            <Textarea
              placeholder="Describe el motivo del bloqueo..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              maxLength={500}
              rows={3}
              className="resize-none"
              disabled={loading}
            />
            <p className="text-xs text-gray-400 text-right">{motivo.length}/500</p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button
            variant="destructive"
            onClick={() => onConfirm(motivo.trim())}
            disabled={loading}
          >
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Bloqueando...</> : "Confirmar bloqueo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Publication Card ──────────────────────────────────────────────────────────

function PubCard({ pub }: { pub: Publicacion }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5">
        <div className="flex gap-4">
          <img
            src={pub.medios[0]?.url ?? "/placeholder.jpg"}
            alt={pub.titulo}
            className="w-16 h-16 object-cover rounded-xl shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm truncate">{pub.titulo}</h3>
                <p className="text-gray-500 text-xs line-clamp-2 mt-0.5">{pub.descripcion}</p>
                <div className="flex items-center gap-3 mt-2 text-xs flex-wrap">
                  <span className="font-semibold text-[#881a1d]">{formatPrice(pub.precio, pub.tipoPrecio)}</span>
                  <Badge
                    variant="outline"
                    style={{ borderColor: pub.categoria.color, color: pub.categoria.color }}
                    className="text-xs"
                  >
                    {pub.categoria.nombre}
                  </Badge>
                  <span className="text-gray-400">{new Date(pub.creadoEn).toLocaleDateString("es-CO")}</span>
                </div>
              </div>
              <EstadoPubBadge estado={pub.estado} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyPubs({ label }: { label: string }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="py-14 text-center">
        <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">{label}</p>
      </CardContent>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminUserProfilePage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();

  const [usuario,       setUsuario]       = useState<UsuarioDetalle | null>(null);
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [editOpen,      setEditOpen]      = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [uRes, pRes] = await Promise.all([
          fetch(`/api/admin/usuarios/${id}`),
          fetch(`/api/admin/usuarios/${id}/publicaciones`),
        ]);
        if (uRes.ok) setUsuario(await uRes.json());
        if (pRes.ok) setPublicaciones(await pRes.json());
      } catch {
        toast.error("Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ── Verificar / Quitar verificación ──────────────────────────────────────────
  async function toggleVerificado() {
    if (!usuario) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/usuarios/${usuario.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ verificado: !usuario.verificado }),
      });
      if (!res.ok) throw new Error();
      const updated: UsuarioDetalle = await res.json();
      setUsuario(updated);
      toast.success(updated.verificado ? "Usuario verificado" : "Verificación removida");
    } catch {
      toast.error("Error al actualizar el usuario");
    } finally {
      setActionLoading(false);
    }
  }

  // ── Bloquear con motivo ───────────────────────────────────────────────────────
  async function handleConfirmBlock(motivo: string) {
    if (!usuario) return;
    setBlockDialogOpen(false);
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/usuarios/${usuario.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          bloqueado:     true,
          motivoBloqueo: motivo || null,
        }),
      });
      if (!res.ok) throw new Error();
      const updated: UsuarioDetalle = await res.json();
      setUsuario(updated);
      toast.success("Usuario bloqueado correctamente");
    } catch {
      toast.error("Error al bloquear el usuario");
    } finally {
      setActionLoading(false);
    }
  }

  // ── Desbloquear con confirmación ──────────────────────────────────────────────
  function confirmDesbloquear() {
    if (!usuario) return;
    toast(`¿Desbloquear a ${usuario.nombre}?`, {
      description: "El usuario recuperará acceso completo al marketplace.",
      action:  { label: "Desbloquear", onClick: doDesbloquear },
      cancel:  { label: "Cancelar",   onClick: () => {} },
      duration: 8000,
    });
  }

  async function doDesbloquear() {
    if (!usuario) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/usuarios/${usuario.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ bloqueado: false, motivoBloqueo: null }),
      });
      if (!res.ok) throw new Error();
      const updated: UsuarioDetalle = await res.json();
      setUsuario(updated);
      toast.success("Usuario desbloqueado correctamente");
    } catch {
      toast.error("Error al desbloquear el usuario");
    } finally {
      setActionLoading(false);
    }
  }

  // ── Loading / Not found ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#881a1d]" />
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Usuario no encontrado</h2>
        <Button onClick={() => router.back()} variant="outline" className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver
        </Button>
      </div>
    );
  }

  const byEstado  = (estado: string) => publicaciones.filter((p) => p.estado === estado);
  const aprobadas = byEstado("APROBADA");
  const pendientes = byEstado("PENDIENTE");
  const rechazadas = byEstado("RECHAZADA");

  return (
    <div className="space-y-6">
      {/* Back */}
      <Button onClick={() => router.back()} variant="ghost" className="gap-2 -ml-2 rounded-xl">
        <ArrowLeft className="w-4 h-4" />
        Volver a usuarios
      </Button>

      {/* Profile Card */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <Avatar className="w-24 h-24 md:w-28 md:h-28 border-4 border-white shadow-md shrink-0">
              <AvatarImage src={usuario.avatarUrl ?? undefined} />
              <AvatarFallback className="text-3xl font-bold bg-[#881a1d]/10 text-[#881a1d]">
                {usuario.nombre.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">{usuario.nombre}</h1>
                    <RolBadge rol={usuario.rol} />
                    <EstadoBadge bloqueado={usuario.bloqueado} verificado={usuario.verificado} />
                  </div>

                  <div className="space-y-1.5 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {usuario.correo}
                    </div>
                    {usuario.telefono && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {usuario.telefono}
                      </div>
                    )}
                    {usuario.facultad && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-gray-400" />
                        {usuario.facultad}
                        {usuario.semestre && ` · Semestre ${usuario.semestre}`}
                      </div>
                    )}
                    {usuario.telefono && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {usuario.telefono}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      Miembro desde {new Date(usuario.creadoEn).toLocaleDateString("es-CO", {
                        year: "numeric", month: "long", day: "numeric",
                      })}
                    </div>
                  </div>

                  {/* Motivo de bloqueo */}
                  {usuario.bloqueado && usuario.motivoBloqueo && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 max-w-md">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-0.5">
                          Motivo del bloqueo
                        </p>
                        <p className="text-sm text-red-600">{usuario.motivoBloqueo}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                {usuario.rol !== "ADMIN" && (
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl gap-2"
                      onClick={() => setEditOpen(true)}
                    >
                      <Pencil className="w-4 h-4" />
                      Editar
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className={`rounded-xl gap-2 ${
                        usuario.verificado
                          ? "border-orange-300 text-orange-700 hover:bg-orange-50"
                          : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                      }`}
                      onClick={toggleVerificado}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : usuario.verificado ? (
                        <><UserX className="w-4 h-4" />Quitar verificación</>
                      ) : (
                        <><UserCheck className="w-4 h-4" />Verificar</>
                      )}
                    </Button>

                    {usuario.bloqueado ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                        onClick={confirmDesbloquear}
                        disabled={actionLoading}
                      >
                        {actionLoading
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <><Unlock className="w-4 h-4" />Desbloquear</>
                        }
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="rounded-xl gap-2"
                        onClick={() => setBlockDialogOpen(true)}
                        disabled={actionLoading}
                      >
                        {actionLoading
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <><Lock className="w-4 h-4" />Bloquear</>
                        }
                      </Button>
                    )}
                  </div>
                )}

                {usuario.rol === "ADMIN" && (
                  <div className="flex items-center gap-2 text-sm text-purple-700 bg-purple-50 border border-purple-100 rounded-xl px-4 py-2">
                    <Shield className="w-4 h-4" />
                    Cuenta de administrador protegida
                  </div>
                )}
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                {[
                  { label: "Total",     value: usuario._count.publicaciones, color: "text-[#881a1d]"  },
                  { label: "Aprobadas", value: aprobadas.length,             color: "text-green-600" },
                  { label: "Pendientes", value: pendientes.length,           color: "text-yellow-600" },
                  { label: "Rechazadas", value: rechazadas.length,           color: "text-red-600"   },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Publications Tabs */}
      <Tabs defaultValue="todas">
        <TabsList className="bg-white border rounded-xl p-1 gap-1 h-auto flex-wrap">
          {[
            { value: "todas",      label: "Todas",      count: publicaciones.length },
            { value: "aprobadas",  label: "Aprobadas",  count: aprobadas.length    },
            { value: "pendientes", label: "Pendientes", count: pendientes.length   },
            { value: "rechazadas", label: "Rechazadas", count: rechazadas.length   },
          ].map(({ value, label, count }) => (
            <TabsTrigger key={value} value={value} className="rounded-lg text-sm">
              {label} <span className="ml-1.5 text-xs opacity-70">({count})</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4 space-y-3">
          <TabsContent value="todas">
            {publicaciones.length > 0
              ? publicaciones.map((p) => <PubCard key={p.id} pub={p} />)
              : <EmptyPubs label="Este usuario no tiene publicaciones" />}
          </TabsContent>
          <TabsContent value="aprobadas">
            {aprobadas.length > 0
              ? aprobadas.map((p) => <PubCard key={p.id} pub={p} />)
              : <EmptyPubs label="Sin publicaciones aprobadas" />}
          </TabsContent>
          <TabsContent value="pendientes">
            {pendientes.length > 0
              ? pendientes.map((p) => <PubCard key={p.id} pub={p} />)
              : <EmptyPubs label="Sin publicaciones pendientes" />}
          </TabsContent>
          <TabsContent value="rechazadas">
            {rechazadas.length > 0
              ? rechazadas.map((p) => <PubCard key={p.id} pub={p} />)
              : <EmptyPubs label="Sin publicaciones rechazadas" />}
          </TabsContent>
        </div>
      </Tabs>

      {/* Edit Modal */}
      {editOpen && (
        <EditModal
          usuario={usuario}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSuccess={(u) => setUsuario(u)}
        />
      )}

      {/* Block Dialog */}
      <BlockDialog
        nombre={usuario.nombre}
        open={blockDialogOpen}
        onClose={() => setBlockDialogOpen(false)}
        onConfirm={handleConfirmBlock}
        loading={actionLoading}
      />
    </div>
  );
}
