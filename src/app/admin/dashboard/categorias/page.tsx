"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus, Pencil, Trash2, Tag, Folder, Eye,
  ExternalLink, X, Loader2, Search, ImageOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  color: string;
  icono: string | null;
  descripcion: string | null;
  _count: { publicaciones: number };
}

interface Etiqueta {
  id: string;
  nombre: string;
  usoCount: number;
}

interface Publicacion {
  id: string;
  titulo: string;
  estado: string;
  tipo: string;
  precio: string | null;
  medios: { url: string }[];
  autor: { nombre: string };
}

// ─── Images mapping ────────────────────────────────────────────────────────────

const SLUG_IMAGES: Record<string, string> = {
  eventos:        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=700&q=75",
  libros:         "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=700&q=75",
  oportunidades:  "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=700&q=75",
  servicios:      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=700&q=75",
  tecnologia:     "https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=75",
  tutorias:       "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=700&q=75",
  productos:      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=700&q=75",
  convocatorias:  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&q=75",
  arte:           "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=700&q=75",
  deporte:        "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=700&q=75",
  comida:         "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&q=75",
  musica:         "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=700&q=75",
  viajes:         "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=700&q=75",
  moda:           "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=75",
  salud:          "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=700&q=75",
  educacion:      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=700&q=75",
};

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&q=75",
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=700&q=75",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=700&q=75",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&q=75",
];

function getCatImage(cat: Categoria): string {
  const slug = cat.slug.toLowerCase().replace(/[áéíóú]/g, (c) =>
    ({ á: "a", é: "e", í: "i", ó: "o", ú: "u" }[c] ?? c)
  );
  if (SLUG_IMAGES[slug]) return SLUG_IMAGES[slug];
  // Try partial match
  const key = Object.keys(SLUG_IMAGES).find((k) => slug.includes(k) || k.includes(slug));
  if (key) return SLUG_IMAGES[key];
  // Deterministic fallback based on first char
  return FALLBACK_IMAGES[cat.nombre.charCodeAt(0) % FALLBACK_IMAGES.length];
}

// ─── Estado badge ──────────────────────────────────────────────────────────────

function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    APROBADA:   "bg-green-100 text-green-700",
    PENDIENTE:  "bg-yellow-100 text-yellow-700",
    RECHAZADA:  "bg-red-100 text-red-700",
    ARCHIVADA:  "bg-gray-100 text-gray-500",
    SUSPENDIDA: "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${map[estado] ?? "bg-gray-100 text-gray-500"}`}>
      {estado}
    </span>
  );
}

// ─── Publications drawer ───────────────────────────────────────────────────────

function PublicacionesDrawer({
  categoria,
  onClose,
}: {
  categoria: Categoria;
  onClose: () => void;
}) {
  const [pubs, setPubs] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Use admin endpoint: returns all states, filters by categoriaId directly
    fetch(`/api/admin/publicaciones?categoria=${categoria.id}&limit=100`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.publicaciones ?? []);
        setPubs(list);
      })
      .catch(() => toast.error("Error al cargar publicaciones"))
      .finally(() => setLoading(false));
  }, [categoria.id]);

  const filtered = pubs.filter((p) =>
    p.titulo.toLowerCase().includes(search.toLowerCase())
  );

  const img = getCatImage(categoria);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-xl bg-white shadow-2xl flex flex-col">
        {/* Hero */}
        <div className="relative h-44 shrink-0">
          <img src={img} alt={categoria.nombre} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="absolute bottom-4 left-5 right-5">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-3 h-3 rounded-full shrink-0 border-2 border-white/50"
                style={{ background: categoria.color }}
              />
              <h2 className="text-white font-bold text-xl leading-tight">{categoria.nombre}</h2>
            </div>
            <p className="text-white/70 text-xs">{categoria._count.publicaciones} publicaciones en total</p>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar publicaciones…"
              className="pl-9 rounded-full h-9 text-sm bg-gray-50 border-0 focus-visible:ring-1"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400 mb-3" />
              <p className="text-sm text-gray-400">Cargando publicaciones…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <ImageOff className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                {search ? "Sin resultados" : "Sin publicaciones"}
              </p>
              <p className="text-xs text-gray-400">
                {search ? "Intenta otro término" : "Esta categoría no tiene publicaciones aún"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((pub) => {
                const thumb = pub.medios?.[0]?.url;
                return (
                  <div key={pub.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                    {/* Thumb */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                      {thumb ? (
                        <img src={thumb} alt={pub.titulo} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageOff className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate leading-tight mb-1">
                        {pub.titulo}
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <EstadoBadge estado={pub.estado} />
                        <span className="text-[9px] text-gray-400">{pub.tipo}</span>
                        {pub.precio && (
                          <span className="text-[9px] font-semibold text-[#881a1d]">
                            ${Number(pub.precio).toLocaleString("es-CO")}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5 truncate">por {pub.autor?.nombre}</p>
                    </div>
                    {/* Link */}
                    <Link
                      href={`/publication/${pub.id}`}
                      target="_blank"
                      className="shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#881a1d] hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="px-5 py-3 border-t bg-gray-50 shrink-0 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {loading ? "…" : `${filtered.length} ${filtered.length === 1 ? "resultado" : "resultados"}`}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-full text-xs h-7"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Category card ─────────────────────────────────────────────────────────────

function CategoriaCard({
  cat,
  onEdit,
  onDelete,
  onView,
}: {
  cat: Categoria;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}) {
  const img = getCatImage(cat);

  return (
    <div className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white border border-gray-100">
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={img}
          alt={cat.nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Color accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ background: cat.color }}
        />

        {/* Count badge top-right */}
        <div className="absolute top-3 right-3">
          <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
            {cat._count.publicaciones} pub.
          </span>
        </div>

        {/* Title on image */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="w-2.5 h-2.5 rounded-full border border-white/40 shrink-0"
              style={{ background: cat.color }}
            />
            <h3 className="text-white font-bold text-base leading-tight drop-shadow-sm">
              {cat.nombre}
            </h3>
          </div>
          <p className="text-white/60 text-[10px] font-mono">{cat.slug}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {cat.descripcion ? (
          <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
            {cat.descripcion}
          </p>
        ) : (
          <p className="text-xs text-gray-300 italic mb-4">Sin descripción</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Ver publicaciones — main action */}
          <Button
            onClick={onView}
            size="sm"
            className="flex-1 bg-[#881a1d] hover:bg-[#6d1416] text-white rounded-full h-8 text-xs gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            Ver publicaciones
          </Button>

          {/* Edit */}
          <button
            onClick={onEdit}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0"
            title="Editar"
          >
            <Pencil className="w-3.5 h-3.5 text-gray-600" />
          </button>

          {/* Delete */}
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-50 flex items-center justify-center transition-colors shrink-0"
            title="Eliminar"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function AdminCategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialogs
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [etqDialogOpen, setEtqDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Categoria | null>(null);
  const [editingEtq, setEditingEtq] = useState<Etiqueta | null>(null);

  // Publications drawer
  const [viewingCat, setViewingCat] = useState<Categoria | null>(null);

  const [catForm, setCatForm] = useState({
    nombre: "", slug: "", color: "#881a1d", icono: "", descripcion: "",
  });
  const [etqForm, setEtqForm] = useState({ nombre: "" });

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const refetchCats = async () => {
    const res = await fetch("/api/categorias");
    if (res.ok) setCategorias(await res.json());
  };

  const refetchEtqs = async () => {
    const res = await fetch("/api/etiquetas");
    if (res.ok) setEtiquetas(await res.json());
  };

  useEffect(() => {
    Promise.all([fetch("/api/categorias"), fetch("/api/etiquetas")])
      .then(async ([cRes, eRes]) => {
        if (cRes.ok) setCategorias(await cRes.json());
        if (eRes.ok) setEtiquetas(await eRes.json());
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Categoria CRUD ────────────────────────────────────────────────────────

  const openCatDialog = (cat?: Categoria) => {
    setEditingCat(cat ?? null);
    setCatForm(cat
      ? { nombre: cat.nombre, slug: cat.slug, color: cat.color, icono: cat.icono ?? "", descripcion: cat.descripcion ?? "" }
      : { nombre: "", slug: "", color: "#881a1d", icono: "", descripcion: "" }
    );
    setCatDialogOpen(true);
  };

  const handleSaveCat = async () => {
    try {
      let res: Response;
      if (editingCat) {
        // PATCH with id in body (existing API expects it in body)
        res = await fetch("/api/categorias", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingCat.id, ...catForm }),
        });
      } else {
        res = await fetch("/api/categorias", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(catForm),
        });
      }

      if (res.ok) {
        toast.success(editingCat ? "Categoría actualizada" : "Categoría creada");
        setCatDialogOpen(false);
        setEditingCat(null);
        await refetchCats();
      } else {
        const err = await res.json();
        toast.error(err.error ?? "Error al guardar");
      }
    } catch {
      toast.error("Error al guardar categoría");
    }
  };

  const handleDeleteCat = async (cat: Categoria) => {
    if (cat._count.publicaciones > 0) {
      toast.error(`No se puede eliminar: tiene ${cat._count.publicaciones} publicaciones`);
      return;
    }
    if (!confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) return;
    try {
      const res = await fetch(`/api/categorias?id=${cat.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Categoría eliminada");
        setCategorias((p) => p.filter((c) => c.id !== cat.id));
      } else {
        const err = await res.json();
        toast.error(err.error ?? "Error al eliminar");
      }
    } catch {
      toast.error("Error al eliminar categoría");
    }
  };

  // ── Etiqueta CRUD ─────────────────────────────────────────────────────────

  const openEtqDialog = (etq?: Etiqueta) => {
    setEditingEtq(etq ?? null);
    setEtqForm({ nombre: etq?.nombre ?? "" });
    setEtqDialogOpen(true);
  };

  const handleSaveEtq = async () => {
    try {
      const url = editingEtq ? `/api/etiquetas/${editingEtq.id}` : "/api/etiquetas";
      const method = editingEtq ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(etqForm),
      });
      if (res.ok) {
        toast.success(editingEtq ? "Etiqueta actualizada" : "Etiqueta creada");
        setEtqDialogOpen(false);
        setEditingEtq(null);
        await refetchEtqs();
      } else {
        toast.error("Error al guardar etiqueta");
      }
    } catch {
      toast.error("Error al guardar etiqueta");
    }
  };

  const handleDeleteEtq = async (etq: Etiqueta) => {
    if (!confirm(`¿Eliminar la etiqueta "${etq.nombre}"?`)) return;
    try {
      const res = await fetch(`/api/etiquetas/${etq.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Etiqueta eliminada");
        setEtiquetas((p) => p.filter((e) => e.id !== etq.id));
      } else {
        toast.error("Error al eliminar etiqueta");
      }
    } catch {
      toast.error("Error al eliminar etiqueta");
    }
  };

  // ── Auto-generate slug from nombre ───────────────────────────────────────

  const handleNombreChange = (v: string) => {
    const slug = v.toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    setCatForm((p) => ({ ...p, nombre: v, slug: p.slug || slug }));
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Categorías y Etiquetas</h1>
          <p className="text-gray-500 text-sm mt-1">
            Organiza y gestiona el contenido del marketplace
          </p>
        </div>
      </div>

      <Tabs defaultValue="categorias">
        <TabsList className="mb-6 bg-white border rounded-xl p-1 shadow-sm">
          <TabsTrigger value="categorias" className="rounded-lg gap-2">
            <Folder className="w-4 h-4" />
            Categorías
            <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {categorias.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="etiquetas" className="rounded-lg gap-2">
            <Tag className="w-4 h-4" />
            Etiquetas
            <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {etiquetas.length}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* ── Categorías tab ─────────────────────────────────────────────────── */}
        <TabsContent value="categorias">
          <div className="flex justify-end mb-5">
            <Button
              onClick={() => openCatDialog()}
              className="bg-[#881a1d] hover:bg-[#6d1416] text-white rounded-full gap-2"
            >
              <Plus className="w-4 h-4" />
              Nueva Categoría
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-2xl overflow-hidden shadow-md animate-pulse">
                  <div className="h-44 bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-8 bg-gray-200 rounded-full mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : categorias.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Folder className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-700 mb-1">Sin categorías</h3>
              <p className="text-gray-400 text-sm">Crea la primera para organizar el marketplace</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {categorias.map((cat) => (
                <CategoriaCard
                  key={cat.id}
                  cat={cat}
                  onEdit={() => openCatDialog(cat)}
                  onDelete={() => handleDeleteCat(cat)}
                  onView={() => setViewingCat(cat)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Etiquetas tab ───────────────────────────────────────────────────── */}
        <TabsContent value="etiquetas">
          <div className="flex justify-end mb-5">
            <Button
              onClick={() => openEtqDialog()}
              className="bg-[#881a1d] hover:bg-[#6d1416] text-white rounded-full gap-2"
            >
              <Plus className="w-4 h-4" />
              Nueva Etiqueta
            </Button>
          </div>

          {loading ? (
            <div className="flex flex-wrap gap-3">
              {[1,2,3,4,5,6,7,8].map((i) => (
                <div key={i} className="h-9 w-28 bg-gray-200 rounded-full animate-pulse" />
              ))}
            </div>
          ) : etiquetas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Tag className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-700 mb-1">Sin etiquetas</h3>
              <p className="text-gray-400 text-sm">Crea etiquetas para clasificar las publicaciones</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {etiquetas.map((etq) => (
                <div
                  key={etq.id}
                  className="group flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-[#881a1d] shrink-0" />
                    <span className="font-medium text-sm text-gray-800 truncate">{etq.nombre}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <span className="text-[10px] text-gray-400 font-medium">{etq.usoCount}x</span>
                    <button
                      onClick={() => openEtqDialog(etq)}
                      className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Pencil className="w-3 h-3 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteEtq(etq)}
                      className="w-7 h-7 rounded-full hover:bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Publications drawer ──────────────────────────────────────────────── */}
      {viewingCat && (
        <PublicacionesDrawer
          categoria={viewingCat}
          onClose={() => setViewingCat(null)}
        />
      )}

      {/* ── Categoría dialog ─────────────────────────────────────────────────── */}
      <Dialog open={catDialogOpen} onOpenChange={(v) => !v && setCatDialogOpen(false)}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-0 overflow-hidden">
          {/* Preview header */}
          {catForm.nombre && (
            <div className="relative h-28 overflow-hidden">
              <img
                src={getCatImage({ ...editingCat, nombre: catForm.nombre, slug: catForm.slug, color: catForm.color } as Categoria)}
                className="w-full h-full object-cover"
                alt=""
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border border-white/40" style={{ background: catForm.color }} />
                <span className="text-white font-bold text-base">{catForm.nombre}</span>
              </div>
            </div>
          )}

          <div className="px-6 pt-5 pb-2">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                {editingCat ? "Editar categoría" : "Nueva categoría"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Los cambios se reflejarán en todo el marketplace
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 space-y-4 pb-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold mb-1 block">Nombre *</Label>
                <Input
                  value={catForm.nombre}
                  onChange={(e) => handleNombreChange(e.target.value)}
                  placeholder="Ej: Libros"
                  className="rounded-xl h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold mb-1 block">Slug *</Label>
                <Input
                  value={catForm.slug}
                  onChange={(e) => setCatForm((p) => ({ ...p, slug: e.target.value }))}
                  placeholder="ej: libros"
                  className="rounded-xl h-9 text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold mb-1 block">Color de acento *</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={catForm.color}
                  onChange={(e) => setCatForm((p) => ({ ...p, color: e.target.value }))}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                />
                <span className="text-sm font-mono text-gray-500">{catForm.color}</span>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold mb-1 block">Descripción</Label>
              <Textarea
                value={catForm.descripcion}
                onChange={(e) => setCatForm((p) => ({ ...p, descripcion: e.target.value }))}
                placeholder="Breve descripción de la categoría…"
                rows={2}
                className="rounded-xl resize-none text-sm"
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setCatDialogOpen(false)}
              className="rounded-full flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveCat}
              className="rounded-full flex-1 bg-[#881a1d] hover:bg-[#6d1416] text-white"
            >
              {editingCat ? "Guardar cambios" : "Crear categoría"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Etiqueta dialog ──────────────────────────────────────────────────── */}
      <Dialog open={etqDialogOpen} onOpenChange={(v) => !v && setEtqDialogOpen(false)}>
        <DialogContent className="max-w-xs rounded-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingEtq ? "Editar etiqueta" : "Nueva etiqueta"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Las etiquetas ayudan a clasificar publicaciones dentro de una categoría
            </DialogDescription>
          </DialogHeader>

          <div>
            <Label className="text-xs font-semibold mb-1.5 block">Nombre *</Label>
            <Input
              value={etqForm.nombre}
              onChange={(e) => setEtqForm({ nombre: e.target.value })}
              placeholder="Ej: Matemáticas"
              className="rounded-xl"
              onKeyDown={(e) => e.key === "Enter" && handleSaveEtq()}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEtqDialogOpen(false)}
              className="rounded-full flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEtq}
              className="rounded-full flex-1 bg-[#881a1d] hover:bg-[#6d1416] text-white"
            >
              {editingEtq ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
