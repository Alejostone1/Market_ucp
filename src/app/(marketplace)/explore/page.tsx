"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp, Filter, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PublicationCard } from "@/components/marketplace/PublicationCard";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Publicacion {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  estado: string;
  precio: number | null;
  tipoPrecio: string | null;
  categoria: { id: string; nombre: string; slug: string; color: string };
  autor: { id: string; nombre: string; correo: string; avatarUrl: string | null; telefono: string | null };
  medios: { id: string; url: string; tipo: string; orden: number; altText: string | null }[];
  etiquetas: { etiqueta: { nombre: string } }[];
  creadoEn: string;
  fechaEvento: string | null;
  ubicacionEvento: string | null;
  cupos: number | null;
  cuposOcupados: number | null;
  fechaLimite: string | null;
}

// ── Constantes ─────────────────────────────────────────────────────────────────

const PUBLICATION_TYPES = [
  { id: "PRODUCTO",     label: "Producto" },
  { id: "SERVICIO",     label: "Servicio" },
  { id: "EVENTO",       label: "Evento" },
  { id: "CONVOCATORIA", label: "Convocatoria" },
];

const PRICE_EMPTY = { min: "", max: "" };

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
}

// ── Componente principal ────────────────────────────────────────────────────────

export default function ExplorePage() {
  // Filtros activos (los que realmente se envían a la API)
  const [searchQuery,        setSearchQuery]        = useState("");
  const [selectedTypes,      setSelectedTypes]      = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy,             setSortBy]             = useState("recientes");

  // Precio: borrador (lo que el usuario está escribiendo)
  const [draftPrice, setDraftPrice] = useState(PRICE_EMPTY);
  // Precio: aplicado (lo que la API usa)
  const [appliedPrice, setAppliedPrice] = useState(PRICE_EMPTY);

  // UI
  const [showFilters, setShowFilters] = useState(false);
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{ id: string; nombre: string; slug: string }[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    types: true,
    categories: false,
    price: true,
  });

  // ── Cargar categorías desde API ─────────────────────────────────────────────

  useEffect(() => {
    fetch("/api/categorias")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : (data.categorias ?? [])))
      .catch(() => {});
  }, []);

  // ── Fetch publicaciones (depende de filtros APLICADOS) ──────────────────────

  const fetchPublicaciones = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "24", sort: sortBy });

      if (searchQuery.trim())         params.set("search",    searchQuery.trim());
      if (selectedTypes.length > 0)   params.set("tipo",      selectedTypes.join(","));
      if (selectedCategories.length > 0) params.set("categoria", selectedCategories.join(","));

      const minVal = parseFloat(appliedPrice.min);
      const maxVal = parseFloat(appliedPrice.max);
      if (!isNaN(minVal) && minVal > 0)        params.set("minPrecio", String(minVal));
      if (!isNaN(maxVal) && maxVal > 0)        params.set("maxPrecio", String(maxVal));

      const res = await fetch(`/api/publicaciones?${params}`);
      const data = await res.json();
      setPublicaciones(data.data ?? []);
    } catch {
      setPublicaciones([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedTypes, selectedCategories, sortBy, appliedPrice]);

  useEffect(() => {
    fetchPublicaciones();
  }, [fetchPublicaciones]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const toggleType = (id: string) =>
    setSelectedTypes((p) => p.includes(id) ? p.filter((t) => t !== id) : [...p, id]);

  const toggleCategory = (id: string) =>
    setSelectedCategories((p) => p.includes(id) ? p.filter((c) => c !== id) : [...p, id]);

  const applyPrice = () => setAppliedPrice({ ...draftPrice });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTypes([]);
    setSelectedCategories([]);
    setSortBy("recientes");
    setDraftPrice(PRICE_EMPTY);
    setAppliedPrice(PRICE_EMPTY);
  };

  const toggleSection = (s: keyof typeof expandedSections) =>
    setExpandedSections((p) => ({ ...p, [s]: !p[s] }));

  const priceIsActive =
    (appliedPrice.min !== "" && parseFloat(appliedPrice.min) > 0) ||
    (appliedPrice.max !== "" && parseFloat(appliedPrice.max) > 0);

  const activeCount =
    selectedTypes.length +
    selectedCategories.length +
    (priceIsActive ? 1 : 0);

  // ── FiltersContent (reutilizado en desktop sidebar y en Sheet móvil) ─────────

  const FiltersContent = ({ onApply }: { onApply?: () => void }) => (
    <div className="space-y-3">

      {/* ── Tipo de publicación ────────────────────────────────────────── */}
      <Collapsible
        open={expandedSections.types}
        onOpenChange={() => toggleSection("types")}
      >
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 hover:bg-gray-100 transition-colors">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
              <Filter className="w-4 h-4 text-ucp-rojo" />
              Tipo de publicación
              {selectedTypes.length > 0 && (
                <span className="bg-ucp-rojo text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {selectedTypes.length}
                </span>
              )}
            </h3>
            {expandedSections.types ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 mt-1 px-1">
          {PUBLICATION_TYPES.map((type) => (
            <label
              key={type.id}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <Checkbox
                id={`type-${type.id}`}
                checked={selectedTypes.includes(type.id)}
                onCheckedChange={() => toggleType(type.id)}
                className="border-ucp-rojo data-[state=checked]:bg-ucp-rojo data-[state=checked]:border-ucp-rojo"
              />
              <span className="text-sm text-gray-700 font-medium">{type.label}</span>
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* ── Categorías ────────────────────────────────────────────────── */}
      <Collapsible
        open={expandedSections.categories}
        onOpenChange={() => toggleSection("categories")}
      >
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 hover:bg-gray-100 transition-colors">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
              <span className="w-2 h-2 bg-ucp-rojo rounded-full" />
              Categorías
              {selectedCategories.length > 0 && (
                <span className="bg-ucp-rojo text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {selectedCategories.length}
                </span>
              )}
            </h3>
            {expandedSections.categories ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 mt-1 px-1 max-h-48 overflow-y-auto">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <Checkbox
                id={`cat-${cat.id}`}
                checked={selectedCategories.includes(cat.id)}
                onCheckedChange={() => toggleCategory(cat.id)}
                className="border-ucp-rojo data-[state=checked]:bg-ucp-rojo data-[state=checked]:border-ucp-rojo"
              />
              <span className="text-sm text-gray-700 font-medium">{cat.nombre}</span>
            </label>
          ))}
          {categories.length === 0 && (
            <p className="text-xs text-gray-400 px-3 py-2">Cargando categorías…</p>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* ── Rango de precio ───────────────────────────────────────────── */}
      <Collapsible
        open={expandedSections.price}
        onOpenChange={() => toggleSection("price")}
      >
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 hover:bg-gray-100 transition-colors">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
              <span className="w-2 h-2 bg-ucp-rojo rounded-full" />
              Rango de precio
              {priceIsActive && (
                <span className="bg-ucp-rojo text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  !
                </span>
              )}
            </h3>
            {expandedSections.price ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 px-1">
          <div className="bg-gray-50 rounded-lg p-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Precio mínimo ($)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={draftPrice.min}
                  onChange={(e) => setDraftPrice((p) => ({ ...p, min: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Precio máximo ($)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Sin límite"
                  value={draftPrice.max}
                  onChange={(e) => setDraftPrice((p) => ({ ...p, max: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {/* Precio aplicado actualmente */}
            {priceIsActive && (
              <p className="text-xs text-ucp-rojo font-medium">
                Aplicado:{" "}
                {appliedPrice.min ? formatCOP(parseFloat(appliedPrice.min)) : "$0"}{" "}
                —{" "}
                {appliedPrice.max ? formatCOP(parseFloat(appliedPrice.max)) : "sin límite"}
              </p>
            )}

            <Button
              size="sm"
              className="w-full bg-ucp-rojo hover:bg-red-700 text-white rounded-lg gap-2"
              onClick={() => {
                applyPrice();
                onApply?.(); // cierra el Sheet en móvil
              }}
            >
              <Check className="w-3.5 h-3.5" />
              Aplicar precio
            </Button>

            {priceIsActive && (
              <button
                className="text-xs text-gray-400 hover:text-gray-600 w-full text-center"
                onClick={() => {
                  setDraftPrice(PRICE_EMPTY);
                  setAppliedPrice(PRICE_EMPTY);
                }}
              >
                Quitar filtro de precio
              </button>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* ── Limpiar todo ──────────────────────────────────────────────── */}
      {activeCount > 0 && (
        <Button
          variant="outline"
          className="w-full border-gray-300 text-gray-600 hover:border-ucp-rojo hover:text-ucp-rojo transition-colors text-sm"
          onClick={clearFilters}
        >
          <X className="w-3.5 h-3.5 mr-1.5" />
          Limpiar todos los filtros
        </Button>
      )}
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Explorar Marketplace
        </h1>
        <p className="text-gray-600">
          Descubre productos y servicios de la comunidad UCP
        </p>
      </div>

      {/* Barra de búsqueda + ordenar + filtros móvil */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="search"
            placeholder="Buscar productos, servicios, eventos…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-full border-gray-300"
          />
        </div>

        <div className="flex gap-2 shrink-0">
          {/* Ordenar */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
          >
            <option value="recientes">Más recientes</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
            <option value="populares">Más populares</option>
          </select>

          {/* Botón filtros (solo móvil / tablet) */}
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filtros</span>
                {activeCount > 0 && (
                  <span className="bg-ucp-rojo text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {activeCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 overflow-y-auto bg-white">
              <SheetHeader className="mb-4 pb-4 border-b">
                <SheetTitle className="text-ucp-rojo text-xl">Filtros de búsqueda</SheetTitle>
                <SheetDescription>
                  Filtra por tipo, categoría y rango de precio
                </SheetDescription>
              </SheetHeader>
              <FiltersContent onApply={() => setShowFilters(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Layout: sidebar desktop + grid */}
      <div className="flex gap-6">

        {/* Sidebar de filtros — solo desktop */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="bg-white border rounded-xl p-5 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-ucp-rojo" />
                Filtros
                {activeCount > 0 && (
                  <span className="bg-ucp-rojo text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {activeCount}
                  </span>
                )}
              </h2>
            </div>
            <FiltersContent />
          </div>
        </aside>

        {/* Grid de publicaciones */}
        <div className="flex-1 min-w-0">

          {/* Chips de filtros activos */}
          {(selectedTypes.length > 0 || selectedCategories.length > 0 || priceIsActive) && (
            <div className="mb-4 flex flex-wrap gap-2">
              {selectedTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleType(t)}
                  className="inline-flex items-center gap-1.5 text-xs bg-red-50 text-ucp-rojo border border-red-200 rounded-full px-3 py-1 hover:bg-red-100 transition-colors"
                >
                  {PUBLICATION_TYPES.find((x) => x.id === t)?.label ?? t}
                  <X className="w-3 h-3" />
                </button>
              ))}
              {selectedCategories.map((cId) => {
                const cat = categories.find((c) => c.id === cId);
                return (
                  <button
                    key={cId}
                    onClick={() => toggleCategory(cId)}
                    className="inline-flex items-center gap-1.5 text-xs bg-red-50 text-ucp-rojo border border-red-200 rounded-full px-3 py-1 hover:bg-red-100 transition-colors"
                  >
                    {cat?.nombre ?? cId}
                    <X className="w-3 h-3" />
                  </button>
                );
              })}
              {priceIsActive && (
                <button
                  onClick={() => { setDraftPrice(PRICE_EMPTY); setAppliedPrice(PRICE_EMPTY); }}
                  className="inline-flex items-center gap-1.5 text-xs bg-red-50 text-ucp-rojo border border-red-200 rounded-full px-3 py-1 hover:bg-red-100 transition-colors"
                >
                  {appliedPrice.min ? formatCOP(parseFloat(appliedPrice.min)) : "$0"}
                  {" — "}
                  {appliedPrice.max ? formatCOP(parseFloat(appliedPrice.max)) : "sin límite"}
                  <X className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Limpiar todo
              </button>
            </div>
          )}

          {/* Conteo de resultados */}
          <div className="mb-4 text-sm text-gray-500">
            {loading ? "Buscando…" : `${publicaciones.length} resultado${publicaciones.length !== 1 ? "s" : ""}`}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : publicaciones.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg mb-4">No se encontraron resultados</p>
              {activeCount > 0 && (
                <Button
                  onClick={clearFilters}
                  className="bg-ucp-rojo hover:bg-red-700 text-white rounded-full"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {publicaciones.map((pub) => (
                <PublicationCard key={pub.id} product={pub} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
