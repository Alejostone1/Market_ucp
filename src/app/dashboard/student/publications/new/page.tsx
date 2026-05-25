"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, Plus, X, Camera, Package, DollarSign,
  FileText, Tag, Loader2, AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Categoria {
  id: string;
  nombre: string;
}

const TIPO_PRECIO_OPTIONS = [
  { value: "FIJO",       label: "Precio fijo" },
  { value: "NEGOCIABLE", label: "Negociable" },
  { value: "POR_HORA",   label: "Por hora" },
  { value: "GRATIS",     label: "Gratis" },
];

export default function NewPublicationPage() {
  const router = useRouter();
  const { usuario } = useAuth();

  const [form, setForm] = useState({
    titulo:          "",
    tipo:            "PRODUCTO",
    categoriaId:     "",
    precio:          "",
    tipoPrecio:      "FIJO",
    descripcion:     "",
    // Campos EVENTO
    fechaEvento:     "",
    ubicacionEvento: "",
    cupos:           "",
    // Campo CONVOCATORIA
    fechaLimite:     "",
  });

  const [imagenes, setImagenes]       = useState<File[]>([]);
  const [previews, setPreviews]       = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categorias, setCategorias]   = useState<Categoria[]>([]);
  const [errors, setErrors]           = useState<Record<string, string>>({});

  // ── Fetch categories ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/categorias")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setCategorias(Array.isArray(data) ? data : []))
      .catch(() => setCategorias([]));
  }, []);

  // ── Image helpers ─────────────────────────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5 - imagenes.length);

    // Validate size (max 10 MB each) and type
    const valid: File[] = [];
    for (const f of files) {
      if (!f.type.startsWith("image/")) {
        toast.error(`"${f.name}" no es una imagen válida`);
        continue;
      }
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`"${f.name}" supera 10 MB`);
        continue;
      }
      valid.push(f);
    }

    setImagenes((prev) => [...prev, ...valid].slice(0, 5));
    setPreviews((prev) => [
      ...prev,
      ...valid.map((f) => URL.createObjectURL(f)),
    ].slice(0, 5));
    // Reset input value so same file can be re-added after removal
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImagenes((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Validation ────────────────────────────────────────────────────────────────
  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.titulo.trim() || form.titulo.trim().length < 3)
      e.titulo = "El título debe tener al menos 3 caracteres";
    if (form.titulo.trim().length > 120)
      e.titulo = "El título no puede superar 120 caracteres";
    if (!form.descripcion.trim() || form.descripcion.trim().length < 10)
      e.descripcion = "La descripción debe tener al menos 10 caracteres";
    if (form.descripcion.trim().length > 2000)
      e.descripcion = "La descripción no puede superar 2000 caracteres";
    if (!form.categoriaId)
      e.categoriaId = "Selecciona una categoría";
    if (form.tipoPrecio !== "GRATIS") {
      const p = parseFloat(form.precio);
      if (isNaN(p) || p < 0)
        e.precio = "Ingresa un precio válido (0 o mayor)";
    }
    if (form.tipo === "EVENTO" && !form.fechaEvento)
      e.fechaEvento = "Ingresa la fecha del evento";
    if (form.tipo === "CONVOCATORIA" && !form.fechaLimite)
      e.fechaLimite = "Ingresa la fecha límite";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!usuario?.id) {
      toast.error("Debes iniciar sesión para publicar");
      return;
    }

    setIsSubmitting(true);
    try {
      // ── Step 1: Create publication (JSON) ──────────────────────────────────
      const payload: Record<string, unknown> = {
        titulo:      form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        tipo:        form.tipo,
        categoriaId: form.categoriaId,
        autorId:     usuario.id,
        precio:      form.tipoPrecio === "GRATIS" ? null : (parseFloat(form.precio) || null),
        tipoPrecio:  form.tipoPrecio || null,
        estado:      "PENDIENTE",
      };

      if (form.tipo === "EVENTO") {
        payload.fechaEvento     = form.fechaEvento || null;
        payload.ubicacionEvento = form.ubicacionEvento.trim() || null;
        payload.cupos           = form.cupos ? parseInt(form.cupos) : null;
      }
      if (form.tipo === "CONVOCATORIA") {
        payload.fechaLimite = form.fechaLimite || null;
      }

      const res = await fetch("/api/publicaciones", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error al crear la publicación");
      }

      const publicacion = await res.json();

      // ── Step 2: Upload images if any (via multipart to user publications route) ──
      if (imagenes.length > 0) {
        const formData = new FormData();
        imagenes.forEach((img) => formData.append("imagenes", img));
        formData.append("publicacionId", publicacion.id);

        // Use the dedicated media upload endpoint
        await fetch(`/api/usuarios/${usuario.id}/publicaciones/${publicacion.id}`, {
          method: "PUT",
          body:   formData,
        }).catch(() => {
          // Images failed — publication was created, just warn
          toast.warning("Publicación creada, pero no se pudieron subir las imágenes.");
        });
      }

      toast.success("¡Publicación creada! Está en revisión por el administrador.");
      router.push("/dashboard/student/publications");
    } catch (err) {
      toast.error((err as Error).message || "Error al crear la publicación");
    } finally {
      setIsSubmitting(false);
    }
  };

  const set = (k: string) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/student/publications">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Nueva Publicación</h1>
            <p className="text-gray-600 text-sm mt-0.5">
              Publica tu producto, servicio o evento en el marketplace UCP
            </p>
          </div>
        </div>

        {/* Notice */}
        <div className="mb-6 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            Tu publicación quedará en estado <strong>Pendiente</strong> hasta que un
            administrador la revise y apruebe.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden mb-6">
            <CardHeader className="bg-gradient-to-r from-[#881a1d] to-red-700 text-white py-5 px-6">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="w-5 h-5" />
                Información de la publicación
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-5">

              {/* Título */}
              <div className="space-y-1.5">
                <Label htmlFor="titulo" className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="w-4 h-4" />
                  Título <span className="text-red-500">*</span>
                  <span className="ml-auto text-xs text-gray-400 font-normal">
                    {form.titulo.length}/120
                  </span>
                </Label>
                <Input
                  id="titulo"
                  value={form.titulo}
                  onChange={(e) => set("titulo")(e.target.value)}
                  placeholder="Ej: Calculadora científica Casio FX-991"
                  maxLength={120}
                  className={errors.titulo ? "border-red-400" : ""}
                />
                {errors.titulo && <p className="text-xs text-red-500">{errors.titulo}</p>}
              </div>

              {/* Tipo + Categoría */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Tag className="w-4 h-4" />
                    Tipo <span className="text-red-500">*</span>
                  </Label>
                  <Select value={form.tipo} onValueChange={set("tipo")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRODUCTO">📦 Producto</SelectItem>
                      <SelectItem value="SERVICIO">🛠️ Servicio</SelectItem>
                      <SelectItem value="EVENTO">📅 Evento</SelectItem>
                      <SelectItem value="CONVOCATORIA">📢 Convocatoria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Package className="w-4 h-4" />
                    Categoría <span className="text-red-500">*</span>
                  </Label>
                  <Select value={form.categoriaId} onValueChange={set("categoriaId")}>
                    <SelectTrigger className={errors.categoriaId ? "border-red-400" : ""}>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoriaId && (
                    <p className="text-xs text-red-500">{errors.categoriaId}</p>
                  )}
                </div>
              </div>

              {/* Precio + Tipo Precio */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <DollarSign className="w-4 h-4" />
                    Tipo de precio <span className="text-red-500">*</span>
                  </Label>
                  <Select value={form.tipoPrecio} onValueChange={set("tipoPrecio")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPO_PRECIO_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {form.tipoPrecio !== "GRATIS" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="precio" className="text-sm font-medium">
                      Precio (COP) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="precio"
                      type="number"
                      min="0"
                      step="100"
                      value={form.precio}
                      onChange={(e) => set("precio")(e.target.value)}
                      placeholder="0"
                      className={errors.precio ? "border-red-400" : ""}
                    />
                    {errors.precio && <p className="text-xs text-red-500">{errors.precio}</p>}
                  </div>
                )}
              </div>

              {/* Descripción */}
              <div className="space-y-1.5">
                <Label htmlFor="descripcion" className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="w-4 h-4" />
                  Descripción <span className="text-red-500">*</span>
                  <span className="ml-auto text-xs text-gray-400 font-normal">
                    {form.descripcion.length}/2000
                  </span>
                </Label>
                <Textarea
                  id="descripcion"
                  value={form.descripcion}
                  onChange={(e) => set("descripcion")(e.target.value)}
                  placeholder="Describe tu producto con detalles: estado, características, condiciones de entrega, etc."
                  rows={5}
                  maxLength={2000}
                  className={`resize-none ${errors.descripcion ? "border-red-400" : ""}`}
                />
                {errors.descripcion && <p className="text-xs text-red-500">{errors.descripcion}</p>}
              </div>

              {/* Campos EVENTO */}
              {form.tipo === "EVENTO" && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm font-semibold text-blue-900">Detalles del evento</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="fechaEvento" className="text-sm font-medium">
                        Fecha y hora <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="fechaEvento"
                        type="datetime-local"
                        value={form.fechaEvento}
                        onChange={(e) => set("fechaEvento")(e.target.value)}
                        className={errors.fechaEvento ? "border-red-400" : ""}
                      />
                      {errors.fechaEvento && (
                        <p className="text-xs text-red-500">{errors.fechaEvento}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cupos" className="text-sm font-medium">Cupos disponibles</Label>
                      <Input
                        id="cupos"
                        type="number"
                        min="1"
                        value={form.cupos}
                        onChange={(e) => set("cupos")(e.target.value)}
                        placeholder="Ilimitados si se deja vacío"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ubicacionEvento" className="text-sm font-medium">Ubicación</Label>
                    <Input
                      id="ubicacionEvento"
                      value={form.ubicacionEvento}
                      onChange={(e) => set("ubicacionEvento")(e.target.value)}
                      placeholder="Ej: Auditorio Principal, Campus UCP"
                    />
                  </div>
                </div>
              )}

              {/* Campos CONVOCATORIA */}
              {form.tipo === "CONVOCATORIA" && (
                <div className="space-y-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <p className="text-sm font-semibold text-emerald-900">Detalles de la convocatoria</p>
                  <div className="space-y-1.5">
                    <Label htmlFor="fechaLimite" className="text-sm font-medium">
                      Fecha límite <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fechaLimite"
                      type="datetime-local"
                      value={form.fechaLimite}
                      onChange={(e) => set("fechaLimite")(e.target.value)}
                      className={errors.fechaLimite ? "border-red-400" : ""}
                    />
                    {errors.fechaLimite && (
                      <p className="text-xs text-red-500">{errors.fechaLimite}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden mb-6">
            <CardHeader className="py-4 px-6 border-b">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
                <Camera className="w-5 h-5 text-gray-600" />
                Imágenes
                <span className="text-sm font-normal text-gray-500 ml-1">
                  ({imagenes.length}/5 — máx. 10 MB c/u)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {/* Existing previews */}
                {previews.map((src, i) => (
                  <div key={i} className="relative group aspect-square">
                    <img
                      src={src}
                      alt={`Preview ${i + 1}`}
                      className="w-full h-full object-cover rounded-xl border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md">
                        Principal
                      </span>
                    )}
                  </div>
                ))}

                {/* Add slot */}
                {imagenes.length < 5 && (
                  <label
                    htmlFor="image-upload"
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#881a1d] hover:bg-red-50 transition-colors"
                  >
                    <Plus className="w-7 h-7 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Agregar</span>
                    <input
                      id="image-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Link href="/dashboard/student/publications" className="w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl px-8 py-3 font-semibold"
              >
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting || !usuario?.id}
              className="flex-1 bg-[#881a1d] hover:bg-[#6d1416] text-white rounded-xl py-3 font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 mr-2" />
                  Crear publicación
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
