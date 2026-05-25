"use client";

import { useState, useEffect } from "react";
import { Search, Filter, ShoppingBag, Heart, Star, Eye, Grid, List, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Link from "next/link";
import { ContactButton } from "@/components/chat/ContactButton";

interface Publicacion {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  estado: string;
  precio?: number;
  tipoPrecio?: string;
  vistas: number;
  creadoEn: string;
  autor: {
    id: string;
    nombre: string;
    avatarUrl: string | null;
  };
  categoria: {
    id: string;
    nombre: string;
    slug: string;
    color: string;
    icono?: string;
  };
  medios: {
    id: string;
    url: string;
    tipo: string;
    orden: number;
  }[];
  favoritos: {
    id: string;
  }[];
  _count: {
    favoritos: number;
  };
}

interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  color: string;
  icono?: string;
}

export default function MarketplacePage() {
  const { usuario } = useAuth();
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState<string>("");
  const [selectedTipo, setSelectedTipo] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("recientes");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  // Precio: borrador (mientras el usuario escribe) vs aplicado (lo que va a la API)
  const [draftMin, setDraftMin] = useState<string>("");
  const [draftMax, setDraftMax] = useState<string>("");
  const [minPrecio, setMinPrecio] = useState<string>("");
  const [maxPrecio, setMaxPrecio] = useState<string>("");

  useEffect(() => {
    fetchPublicaciones();
    fetchCategorias();
  }, []);

  useEffect(() => {
    // Reset a página 1 cuando cambian los filtros
    setCurrentPage(1);

    const delayedSearch = setTimeout(() => {
      fetchPublicaciones();
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, selectedCategoria, selectedTipo, sortBy, minPrecio, maxPrecio]); // minPrecio/maxPrecio solo cambian al hacer clic en "Aplicar"

  useEffect(() => {
    fetchPublicaciones();
  }, [currentPage]);

  const fetchPublicaciones = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        estado: "APROBADA",
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategoria && { categoria: selectedCategoria }),
        ...(selectedTipo && { tipo: selectedTipo }),
        ...(sortBy && { sort: sortBy }),
        ...(minPrecio && { minPrecio }),
        ...(maxPrecio && { maxPrecio }),
        page: currentPage.toString(),
        limit: '6',
      });

      const response = await fetch(`/api/publicaciones?${params}`);
      if (response.ok) {
        const result = await response.json();
        setPublicaciones(result.data || []);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Error al cargar publicaciones:', error);
      toast.error("Error al cargar publicaciones");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await fetch('/api/categorias');
      if (response.ok) {
        const data = await response.json();
        setCategorias(data);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const toggleFavorito = async (publicacionId: string) => {
    if (!usuario?.id) {
      toast.error("Debes iniciar sesión para agregar favoritos");
      return;
    }

    try {
      const response = await fetch(`/api/publicaciones/${publicacionId}/favoritos`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchPublicaciones();
        toast.success("Agregado a favoritos");
      } else {
        toast.error("Error al agregar a favoritos");
      }
    } catch (error) {
      console.error('Error al toggle favorito:', error);
      toast.error("Error al agregar a favoritos");
    }
  };

  const agregarAlCarrito = async (publicacionId: string, precio: number) => {
    if (!usuario?.id) {
      toast.error("Debes iniciar sesión para agregar al carrito");
      return;
    }

    try {
      const response = await fetch('/api/carrito', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicacionId,
          cantidad: 1,
          precioUnitario: precio,
        }),
      });

      if (response.ok) {
        toast.success("Agregado al carrito");
      } else {
        const error = await response.json();
        toast.error(error.message || "Error al agregar al carrito");
      }
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      toast.error("Error al agregar al carrito");
    }
  };

  const handleDelete = async (id: string) => {
    if (!usuario?.id) return;

    try {
      const response = await fetch(`/api/publicaciones/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicationId: id }),
      });

      if (response.ok) {
        setPublicaciones(publicaciones.filter(p => p.id !== id));
        toast.success("Publicación eliminada exitosamente");
      } else {
        toast.error("Error al eliminar publicación");
      }
    } catch (error) {
      console.error('Error al eliminar publicación:', error);
      toast.error("Error al eliminar publicación");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination && currentPage < pagination.pages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleLastPage = () => {
    if (pagination) {
      setCurrentPage(pagination.pages);
    }
  };

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(precio);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading && publicaciones.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Cargando marketplace...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Marketplace</h1>
          <p className="text-gray-600 text-sm sm:text-base">Descubre productos y servicios de la comunidad UCP</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
            className="rounded-full"
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
            className="rounded-full"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ── Filtros y búsqueda ── */}
      <Card className="border-0 shadow-lg rounded-xl p-5 mb-8">

        {/* Fila 1: búsqueda + ordenar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="search"
              placeholder="Buscar productos, servicios, eventos…"
              className="pl-10 rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ucp-rojo text-sm bg-white shrink-0"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recientes">Más recientes</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
            <option value="populares">Más populares</option>
          </select>
        </div>

        {/* Fila 2: categoría + tipo + precio */}
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          {/* Categoría */}
          <div className="flex-1 min-w-0">
            <label className="text-xs text-gray-500 mb-1 block font-medium">Categoría</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ucp-rojo text-sm bg-white"
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </div>

          {/* Tipo */}
          <div className="flex-1 min-w-0">
            <label className="text-xs text-gray-500 mb-1 block font-medium">Tipo</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ucp-rojo text-sm bg-white"
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
            >
              <option value="">Todos los tipos</option>
              <option value="PRODUCTO">Producto</option>
              <option value="SERVICIO">Servicio</option>
              <option value="EVENTO">Evento</option>
              <option value="CONVOCATORIA">Convocatoria</option>
            </select>
          </div>

          {/* Rango de precio */}
          <div className="flex-1 min-w-0">
            <label className="text-xs text-gray-500 mb-1 block font-medium">
              Precio
              {(minPrecio || maxPrecio) && (
                <span className="ml-1 text-ucp-rojo font-semibold">
                  (aplicado:{" "}
                  {minPrecio ? `$${Number(minPrecio).toLocaleString("es-CO")}` : "$0"}
                  {" — "}
                  {maxPrecio ? `$${Number(maxPrecio).toLocaleString("es-CO")}` : "sin límite"})
                </span>
              )}
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Mín $"
                min={0}
                className="h-9 text-sm px-2 w-full"
                value={draftMin}
                onChange={(e) => setDraftMin(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setMinPrecio(draftMin);
                    setMaxPrecio(draftMax);
                    setCurrentPage(1);
                  }
                }}
              />
              <span className="text-gray-400 shrink-0 text-sm">—</span>
              <Input
                type="number"
                placeholder="Máx $"
                min={0}
                className="h-9 text-sm px-2 w-full"
                value={draftMax}
                onChange={(e) => setDraftMax(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setMinPrecio(draftMin);
                    setMaxPrecio(draftMax);
                    setCurrentPage(1);
                  }
                }}
              />
            </div>
          </div>

          {/* Botón Aplicar precio */}
          <div className="shrink-0">
            <label className="text-xs text-transparent mb-1 block select-none">.</label>
            <Button
              size="sm"
              className="bg-ucp-rojo hover:bg-red-700 text-white rounded-lg h-9 px-4 whitespace-nowrap"
              onClick={() => {
                setMinPrecio(draftMin);
                setMaxPrecio(draftMax);
                setCurrentPage(1);
              }}
            >
              Aplicar precio
            </Button>
          </div>
        </div>

        {/* Limpiar filtros */}
        {(searchQuery || selectedCategoria || selectedTipo || sortBy !== "recientes" || minPrecio || maxPrecio) && (
          <div className="mt-3 pt-3 border-t flex justify-between items-center">
            <span className="text-xs text-gray-400">
              Filtros activos
            </span>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategoria("");
                setSelectedTipo("");
                setSortBy("recientes");
                setDraftMin("");
                setDraftMax("");
                setMinPrecio("");
                setMaxPrecio("");
                setCurrentPage(1);
              }}
              className="text-xs text-ucp-rojo hover:underline font-medium"
            >
              Limpiar todos los filtros
            </button>
          </div>
        )}
      </Card>

      {/* Resultados */}
      {publicaciones.length === 0 ? (
        <Card className="border-0 shadow-lg rounded-xl p-8 sm:p-16 text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">No se encontraron publicaciones</h2>
          <p className="text-gray-600 mb-8">Intenta ajustar los filtros de búsqueda</p>
          <Button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategoria("");
              setSelectedTipo("");
              setSortBy("recientes");
              setDraftMin("");
              setDraftMax("");
              setMinPrecio("");
              setMaxPrecio("");
              setCurrentPage(1);
            }}
            className="bg-ucp-rojo text-white hover:bg-red-700 rounded-full"
          >
            Limpiar filtros
          </Button>
        </Card>
      ) : (
        <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {publicaciones.map((publicacion) => (
            <Card key={publicacion.id} className="border-0 shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow">
              {viewMode === "grid" ? (
                /* Vista Grid */
                <div>
                  {/* Imagen clickable */}
                  <Link href={`/publication/${publicacion.id}`}>
                  <div className="relative h-48 bg-gray-100 cursor-pointer">
                    {publicacion.medios.length > 0 ? (
                      <img
                        src={publicacion.medios[0].url}
                        alt={publicacion.titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge 
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ backgroundColor: publicacion.categoria.color }}
                      >
                        {publicacion.categoria.nombre}
                      </Badge>
                      <Badge variant="secondary" className="text-xs px-2 py-1 rounded-full">
                        {publicacion.tipo}
                      </Badge>
                    </div>

                    {/* Favoritos */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white"
                      onClick={(e) => { e.preventDefault(); toggleFavorito(publicacion.id); }}
                    >
                      <Heart
                        className={`w-4 h-4 ${(publicacion.favoritos?.length || 0) > 0 ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                      />
                    </Button>
                  </div>
                  </Link>

                  {/* Contenido */}
                  <div className="p-6">
                    <Link href={`/publication/${publicacion.id}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-ucp-rojo cursor-pointer">{publicacion.titulo}</h3>
                    </Link>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{publicacion.descripcion}</p>

                    {/* Autor */}
                    <div className="flex items-center gap-2 mb-4">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={publicacion.autor.avatarUrl || undefined} />
                        <AvatarFallback className="text-xs">{publicacion.autor.nombre[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">{publicacion.autor.nombre}</span>
                    </div>

                    {/* Precio y acciones */}
                    <div className="flex items-center justify-between">
                      <div>
                        {publicacion.precio ? (
                          <div>
                            <p className="text-lg font-bold text-ucp-rojo">
                              {formatearPrecio(publicacion.precio)}
                            </p>
                            {publicacion.tipoPrecio && publicacion.tipoPrecio !== 'FIJO' && (
                              <p className="text-xs text-gray-500">{publicacion.tipoPrecio}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-lg font-bold text-green-600">Gratis</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/publication/${publicacion.id}`}>
                          <Button size="icon" variant="outline" className="rounded-full" title="Ver detalles">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <ContactButton
                          vendorId={publicacion.autor.id}
                          vendorName={publicacion.autor.nombre}
                          label=""
                          showIcon={true}
                          size="icon"
                          variant="ghost"
                        />
                        {publicacion.precio && (
                          <Button
                            size="icon"
                            className="bg-ucp-rojo text-white hover:bg-red-700 rounded-full"
                            onClick={() => agregarAlCarrito(publicacion.id, publicacion.precio!)}
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Estadísticas */}
                    <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {publicacion.vistas}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {publicacion._count?.favoritos || 0}
                      </span>
                      <span>{formatearFecha(publicacion.creadoEn)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Vista Lista */
                <div className="p-4 sm:p-6">
                  <div className="flex gap-3 sm:gap-4">
                    <Link href={`/publication/${publicacion.id}`} className="flex-shrink-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg overflow-hidden cursor-pointer">
                        {publicacion.medios.length > 0 ? (
                          <img
                            src={publicacion.medios[0].url}
                            alt={publicacion.titulo}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <Link href={`/publication/${publicacion.id}`}>
                            <h3 className="font-semibold text-gray-900 mb-1 hover:text-ucp-rojo cursor-pointer">{publicacion.titulo}</h3>
                          </Link>
                          <p className="text-sm text-gray-600 mb-2">{publicacion.descripcion}</p>
                          
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Avatar className="w-5 h-5">
                                <AvatarImage src={publicacion.autor.avatarUrl || undefined} />
                                <AvatarFallback className="text-xs">{publicacion.autor.nombre[0]}</AvatarFallback>
                              </Avatar>
                              {publicacion.autor.nombre}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {publicacion.vistas}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {publicacion._count?.favoritos || 0}
                            </span>
                            <span>{formatearFecha(publicacion.creadoEn)}</span>
                          </div>
                        </div>

                        <div className="text-right ml-2 sm:ml-4 shrink-0">
                          {publicacion.precio ? (
                            <div>
                              <p className="text-base sm:text-lg font-bold text-ucp-rojo">
                                {formatearPrecio(publicacion.precio)}
                              </p>
                              {publicacion.tipoPrecio && publicacion.tipoPrecio !== 'FIJO' && (
                                <p className="text-xs text-gray-500">{publicacion.tipoPrecio}</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-base sm:text-lg font-bold text-green-600">Gratis</p>
                          )}

                          <div className="flex gap-1 sm:gap-2 mt-2 justify-end">
                            <Link href={`/publication/${publicacion.id}`}>
                              <Button variant="outline" size="icon" className="rounded-full" title="Ver detalles">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full"
                              onClick={() => toggleFavorito(publicacion.id)}
                            >
                              <Heart
                                className={`w-4 h-4 ${(publicacion.favoritos?.length || 0) > 0 ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                              />
                            </Button>
                            <ContactButton
                              vendorId={publicacion.autor.id}
                              vendorName={publicacion.autor.nombre}
                              label=""
                              showIcon={true}
                              size="icon"
                              variant="ghost"
                            />
                            {publicacion.precio && (
                              <Button
                                size="icon"
                                className="bg-ucp-rojo text-white hover:bg-red-700 rounded-full"
                                onClick={() => agregarAlCarrito(publicacion.id, publicacion.precio!)}
                              >
                                <ShoppingBag className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Paginación */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center mt-8 space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFirstPage}
            disabled={currentPage === 1}
            className="hidden sm:flex"
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center space-x-2 px-4 py-2 bg-white border rounded-lg">
            <span className="text-sm text-gray-600">
              Página <span className="font-bold text-ucp-rojo">{currentPage}</span> de {pagination.pages}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === pagination.pages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLastPage}
            disabled={currentPage === pagination.pages}
            className="hidden sm:flex"
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Paginación móvil */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center mt-6 sm:hidden space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="flex-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === pagination.pages}
            className="flex-1"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
