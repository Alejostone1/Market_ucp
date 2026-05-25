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
  }, [searchQuery, selectedCategoria, selectedTipo, sortBy, minPrecio, maxPrecio]);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
          <p className="text-gray-600">Descubre productos y servicios de la comunidad UCP</p>
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

      {/* Filtros y búsqueda */}
      <Card className="border-0 shadow-lg rounded-xl p-6 mb-8">
        <div className="grid md:grid-cols-12 gap-4">
          {/* Búsqueda */}
          <div className="md:col-span-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="search"
                placeholder="Buscar productos, servicios..."
                className="pl-10 rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Categoría */}
          <div className="md:col-span-2">
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ucp-rojo text-sm"
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo */}
          <div className="md:col-span-2">
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ucp-rojo text-sm"
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
            >
              <option value="">Todos los tipos</option>
              <option value="PRODUCTO">Productos</option>
              <option value="SERVICIO">Servicios</option>
              <option value="EVENTO">Eventos</option>
              <option value="CONVOCATORIA">Convocatorias</option>
            </select>
          </div>

          {/* Ordenar */}
          <div className="md:col-span-2">
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ucp-rojo text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recientes">Más recientes</option>
              <option value="precio-asc">Precio: Menor a mayor</option>
              <option value="precio-desc">Precio: Mayor a menor</option>
              <option value="populares">Más populares</option>
            </select>
          </div>

          {/* Rango de precio */}
          <div className="md:col-span-2 flex items-center gap-1">
            <Input
              type="number"
              placeholder="Min $"
              min={0}
              className="rounded-lg text-sm h-[38px] px-2"
              value={minPrecio}
              onChange={(e) => setMinPrecio(e.target.value)}
            />
            <span className="text-gray-400 text-xs shrink-0">—</span>
            <Input
              type="number"
              placeholder="Max $"
              min={0}
              className="rounded-lg text-sm h-[38px] px-2"
              value={maxPrecio}
              onChange={(e) => setMaxPrecio(e.target.value)}
            />
          </div>
        </div>

        {/* Limpiar filtros */}
        {(searchQuery || selectedCategoria || selectedTipo || sortBy !== "recientes" || minPrecio || maxPrecio) && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategoria("");
                setSelectedTipo("");
                setSortBy("recientes");
                setMinPrecio("");
                setMaxPrecio("");
              }}
              className="text-xs text-ucp-rojo hover:underline"
            >
              Limpiar todos los filtros
            </button>
          </div>
        )}
      </Card>

      {/* Resultados */}
      {publicaciones.length === 0 ? (
        <Card className="border-0 shadow-lg rounded-xl p-16 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No se encontraron publicaciones</h2>
          <p className="text-gray-600 mb-8">Intenta ajustar los filtros de búsqueda</p>
          <Button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategoria("");
              setSelectedTipo("");
              setSortBy("recientes");
              setMinPrecio("");
              setMaxPrecio("");
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
                <div className="p-6">
                  <div className="flex gap-4">
                    <Link href={`/publication/${publicacion.id}`} className="flex-shrink-0">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden cursor-pointer">
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

                        <div className="text-right ml-4">
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

                          <div className="flex gap-2 mt-2">
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
