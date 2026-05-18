"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PublicationCard } from "@/components/marketplace/PublicationCard";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  categoria: {
    id: string;
    nombre: string;
    slug: string;
    color: string;
  };
  autor: {
    id: string;
    nombre: string;
    correo: string;
    avatarUrl: string | null;
    telefono: string | null;
  };
  medios: {
    id: string;
    url: string;
    tipo: string;
    orden: number;
    altText: string | null;
  }[];
  etiquetas: {
    etiqueta: {
      nombre: string;
    };
  }[];
  creadoEn: string;
  fechaEvento: string | null;
  ubicacionEvento: string | null;
  cupos: number | null;
  cuposOcupados: number | null;
  fechaLimite: string | null;
}

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000000 });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedPriceTypes, setSelectedPriceTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("recent");
  const [showFilters, setShowFilters] = useState(false);
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    types: true,
    categories: true,
    price: true,
  });

  useEffect(() => {
    const fetchPublicaciones = async () => {
      try {
        const params = new URLSearchParams({
          limit: '12',
          ...(searchQuery && { search: searchQuery }),
          ...(selectedTypes.length > 0 && { tipo: selectedTypes.join(',') }),
          ...(selectedCategories.length > 0 && { categoria: selectedCategories.join(',') }),
          ...(sortBy && { sort: sortBy === 'recent' ? 'recientes' : sortBy }),
        });
        
        const response = await fetch(`/api/publicaciones?${params}`);
        const result = await response.json();
        setPublicaciones(result.data || []);
      } catch (error) {
        console.error('Error al cargar publicaciones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicaciones();
  }, [searchQuery, selectedTypes, selectedCategories, sortBy]);

  const categories = [
    "Tecnología",
    "Libros",
    "Ropa",
    "Deportes",
    "Comida",
    "Tutorías",
    "Diseño",
    "Programación",
    "Música",
    "Fotografía",
    "Artesanías",
  ];

  const publicationTypes = [
    { id: "PRODUCTO", label: "Producto" },
    { id: "SERVICIO", label: "Servicio" },
    { id: "EVENTO", label: "Evento" },
    { id: "CONVOCATORIA", label: "Convocatoria" },
  ];

  const priceTypes = [
    { id: "FIJO", label: "Precio fijo" },
    { id: "POR_HORA", label: "Por hora" },
    { id: "GRATIS", label: "Gratis" },
    { id: "NEGOCIABLE", label: "Negociable" },
  ];

  // Ya no se necesita filtrado en frontend, se hace en backend

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const togglePriceType = (priceType: string) => {
    setSelectedPriceTypes(prev =>
      prev.includes(priceType)
        ? prev.filter(t => t !== priceType)
        : [...prev, priceType]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setPriceRange({ min: 0, max: 10000000 });
    setSelectedCategories([]);
    setSelectedTypes([]);
    setSelectedPriceTypes([]);
    setSortBy("recent");
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const FiltersContent = () => (
    <div className="space-y-4">
      {/* Tipo de Publicación */}
      <Collapsible
        open={expandedSections.types}
        onOpenChange={() => toggleSection('types')}
      >
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-ucp-rojo" />
              Tipo de Publicación
              {selectedTypes.length > 0 && (
                <span className="bg-ucp-rojo text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {selectedTypes.length}
                </span>
              )}
            </h3>
            {expandedSections.types ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-2">
          {publicationTypes.map((type) => (
            <div key={type.id} className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-md transition-colors">
              <Checkbox
                id={`type-${type.id}`}
                checked={selectedTypes.includes(type.id)}
                onCheckedChange={() => toggleType(type.id)}
                className="border-ucp-rojo text-ucp-rojo"
              />
              <Label
                htmlFor={`type-${type.id}`}
                className="cursor-pointer text-sm text-gray-700 font-medium"
              >
                {type.label}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Categorías */}
      <Collapsible
        open={expandedSections.categories}
        onOpenChange={() => toggleSection('categories')}
      >
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-2 bg-ucp-rojo rounded-full"></span>
              Categorías
              {selectedCategories.length > 0 && (
                <span className="bg-ucp-rojo text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {selectedCategories.length}
                </span>
              )}
            </h3>
            {expandedSections.categories ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-md transition-colors">
              <Checkbox
                id={`category-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
                className="border-ucp-rojo text-ucp-rojo"
              />
              <Label
                htmlFor={`category-${category}`}
                className="cursor-pointer text-sm text-gray-700 font-medium"
              >
                {category}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Precio */}
      <Collapsible
        open={expandedSections.price}
        onOpenChange={() => toggleSection('price')}
      >
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-2 bg-ucp-rojo rounded-full"></span>
              Precio
              {(priceRange.min > 0 || priceRange.max < 10000000) && (
                <span className="bg-ucp-rojo text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  !
                </span>
              )}
            </h3>
            {expandedSections.price ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-2">
          <div className="bg-white rounded-lg p-3">
            <div className="flex justify-between text-sm mb-2">
              <Label className="text-gray-600">Mínimo</Label>
              <span className="font-semibold text-ucp-rojo">${priceRange.min.toLocaleString()}</span>
            </div>
            <Input
              type="range"
              min="0"
              max="10000000"
              step="100000"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
              className="w-full accent-ucp-rojo"
            />
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="flex justify-between text-sm mb-2">
              <Label className="text-gray-600">Máximo</Label>
              <span className="font-semibold text-ucp-rojo">${priceRange.max.toLocaleString()}</span>
            </div>
            <Input
              type="range"
              min="0"
              max="10000000"
              step="100000"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
              className="w-full accent-ucp-rojo"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Limpiar filtros */}
      <Button
        variant="outline"
        className="w-full border-ucp-rojo text-ucp-rojo hover:bg-ucp-rojo hover:text-white transition-colors"
        onClick={clearFilters}
      >
        Limpiar filtros
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Explorar Marketplace
        </h1>
        <p className="text-gray-600">
          Descubre productos y servicios de la comunidad UCP
        </p>
      </div>

      {/* Search and Sort */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-center">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="search"
            placeholder="Buscar productos, servicios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 w-full rounded-full border-gray-300"
          />
        </div>
        <div className="flex gap-2 justify-center">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="recent">Más recientes</option>
            <option value="price-low">Precio: Menor a mayor</option>
            <option value="price-high">Precio: Mayor a menor</option>
          </select>
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filtros</span>
                {(selectedCategories.length > 0 || selectedTypes.length > 0 || priceRange.min > 0 || priceRange.max < 10000000) && (
                  <span className="bg-ucp-rojo text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {selectedCategories.length + selectedTypes.length + (priceRange.min > 0 || priceRange.max < 10000000 ? 1 : 0)}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 overflow-y-auto bg-white">
              <SheetHeader className="mb-6 pb-4 border-b">
                <SheetTitle className="text-ucp-rojo text-2xl">Filtros de búsqueda</SheetTitle>
                <SheetDescription>
                  Filtra productos y servicios por tipo, categoría y precio
                </SheetDescription>
              </SheetHeader>
              <FiltersContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="flex gap-6">
        {/* Desktop Filters - Left Side */}
        <div className="hidden lg:block w-80 shrink-0">
          <div className="bg-white border rounded-lg p-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <FiltersContent />
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Active Filters */}
          {(selectedCategories.length > 0 || selectedTypes.length > 0 || priceRange.min > 0 || priceRange.max < 10000000) && (
            <div className="mb-6 flex flex-wrap gap-2">
              {selectedTypes.map((type) => {
                const typeLabel = publicationTypes.find(t => t.id === type)?.label || type;
                return (
                  <Button
                    key={type}
                    variant="secondary"
                    size="sm"
                    className="gap-1"
                    onClick={() => toggleType(type)}
                  >
                    {typeLabel}
                    <X className="w-3 h-3" />
                  </Button>
                );
              })}
              {selectedCategories.map((category) => (
                <Button
                  key={category}
                  variant="secondary"
                  size="sm"
                  className="gap-1"
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                  <X className="w-3 h-3" />
                </Button>
              ))}
              {(priceRange.min > 0 || priceRange.max < 10000000) && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1"
                  onClick={() => setPriceRange({ min: 0, max: 10000000 })}
                >
                  ${priceRange.min.toLocaleString()} - ${priceRange.max.toLocaleString()}
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}

          {/* Results Count */}
          <div className="mb-4 text-sm text-gray-600">
            {publicaciones.length} {publicaciones.length === 1 ? 'resultado' : 'resultados'}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">Cargando publicaciones...</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {publicaciones.map((product: Publicacion) => (
                <PublicationCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {publicaciones.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg mb-4">
                No se encontraron resultados
              </p>
              <Button
                onClick={clearFilters}
                className="bg-ucp-rojo hover:bg-red-700 rounded-full"
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
