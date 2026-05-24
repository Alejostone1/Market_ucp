"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, MoreVertical, X, Grid, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Publicacion {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  estado: string;
  precio: number | null;
  tipoPrecio: string | null;
  vistas: number;
  categoria: {
    nombre: string;
  };
  medios: {
    url: string;
  }[];
  creadoEn: string;
}

export default function MyPublicationsPage() {
  const { usuario } = useAuth();
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPublicacion, setSelectedPublicacion] = useState<Publicacion | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "cards">("grid");

  useEffect(() => {
    const fetchPublicaciones = async () => {
      if (!usuario?.id) return;

      try {
        const response = await fetch(`/api/usuarios/${usuario.id}/publicaciones`);
        if (response.ok) {
          const data = await response.json();
          setPublicaciones(data);
        }
      } catch (error) {
        console.error('Error al cargar publicaciones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicaciones();
  }, [usuario?.id]);

  const approvedProducts = publicaciones.filter(p => p.estado === "APROBADA");
  const pendingProducts = publicaciones.filter(p => p.estado === "PENDIENTE");
  const rejectedProducts = publicaciones.filter(p => p.estado === "RECHAZADA");

  const formatPrice = (price: number | null) => {
    if (!price) return "Gratis";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleDelete = async (id: string) => {
    if (!usuario?.id) return;

    try {
      const response = await fetch(`/api/usuarios/${usuario.id}/publicaciones`, {
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

  const ProductCard = ({ product }: { product: Publicacion }) => (
  <Card className="border-0 shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow">
    {/* Imagen principal */}
    <div className="relative h-48 bg-gray-100">
      {product.medios && product.medios.length > 0 ? (
        <>
          <img
            src={product.medios[0].url}
            alt={product.titulo}
            className="w-full h-full object-cover"
          />
          {/* Badge de múltiples imágenes */}
          {product.medios.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/70 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              +{product.medios.length - 1}
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-gray-400 text-xl">📷</span>
            </div>
            <p className="text-gray-500 text-sm">Sin imágenes</p>
          </div>
        </div>
      )}
    </div>

    <CardContent className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{product.titulo}</h3>
          <div className="flex items-center gap-2 mb-3">
            <Badge 
              className={
                product.estado === "APROBADA" 
                  ? "bg-ucp-verde text-white" 
                  : product.estado === "PENDIENTE"
                  ? "bg-yellow-500 text-white"
                  : "bg-ucp-rojo text-white"
              }
            >
              {product.estado}
            </Badge>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              ID: {product.id.slice(-8)}
            </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setSelectedPublicacion(product);
                setIsDetailsDialogOpen(true);
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver detalles
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/student/publications/edit/${product.id}`} className="cursor-pointer">
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => handleDelete(product.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Descripción */}
      <p className="text-gray-700 mb-4 line-clamp-3 leading-relaxed text-sm">
        {product.descripcion || "Sin descripción"}
      </p>

      {/* Grid de información */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 text-sm">Precio</h4>
          <p className="text-2xl font-bold text-ucp-rojo">
            {formatPrice(product.precio)}
          </p>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 text-sm">Categoría</h4>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
              {product.categoria?.nombre || "General"}
            </span>
          </div>
        </div>
      </div>

      {/* Metadatos adicionales */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Tipo:</span>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
            {product.tipo}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Creado:</span>
          <span className="text-gray-900 font-medium">
            {new Date(product.creadoEn).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Vistas:</span>
          <span className="text-ucp-rojo font-bold">{product.vistas || 0}</span>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-2 pt-4 border-t">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            setSelectedPublicacion(product);
            setIsDetailsDialogOpen(true);
          }}
          className="flex-1"
        >
          <Eye className="w-4 h-4 mr-2" />
          Ver detalles completos
        </Button>
        <Button 
          size="sm"
          asChild
          className="flex-1"
        >
          <Link href={`/dashboard/student/publications/edit/${product.id}`} className="flex items-center justify-center">
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Link>
        </Button>
      </div>
    </CardContent>
  </Card>
);

const ProductRow = ({ product }: { product: Publicacion }) => (
    <Card className="hover:shadow-lg transition-shadow rounded-xl">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Imágenes */}
          <div className="w-full md:w-48">
            {product.medios && product.medios.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                {product.medios.slice(0, 4).map((medio, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={medio.url}
                      alt={`${product.titulo} ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg transition-transform group-hover:scale-105"
                    />
                    {/* Badge de número de imagen */}
                    {product.medios.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                        +{product.medios.length - 1}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full md:w-48 aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-gray-400 text-2xl">📷</span>
                  </div>
                  <p className="text-gray-500 text-sm">Sin imágenes</p>
                </div>
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="flex-1 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{product.titulo}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <Badge 
                    className={
                      product.estado === "APROBADA" 
                        ? "bg-ucp-verde text-white" 
                        : product.estado === "PENDIENTE"
                        ? "bg-yellow-500 text-white"
                        : "bg-ucp-rojo text-white"
                    }
                  >
                    {product.estado}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    ID: {product.id.slice(-8)}
                  </span>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedPublicacion(product);
                      setIsDetailsDialogOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver detalles
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/student/publications/edit/${product.id}`} className="cursor-pointer">
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Descripción */}
            <p className="text-gray-700 mb-4 line-clamp-3 leading-relaxed">
              {product.descripcion || "Sin descripción"}
            </p>

            {/* Precio */}
            <div className="mb-4">
              <p className="text-2xl font-bold text-ucp-rojo">
                {formatPrice(product.precio)}
              </p>
            </div>

            {/* Metadatos */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="font-medium">Creado:</span>
                <span>{new Date(product.creadoEn).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Vistas:</span>
                <span className="font-semibold text-ucp-rojo">{product.vistas || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Categoría:</span>
                <span>{product.categoria?.nombre || "General"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Tipo:</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {product.tipo}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <Card className="border-0 shadow-lg rounded-xl">
      <CardContent className="p-16 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {message}
        </h3>
        <p className="text-gray-600 mb-6">
          Crea tu primera publicación para comenzar a vender
        </p>
        <Link href="/dashboard/student/publications/new">
          <Button className="bg-ucp-rojo hover:bg-red-700 rounded-full text-white">
            <Plus className="w-5 h-5 mr-2" />
            Nueva Publicación
          </Button>
        </Link>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Mis Publicaciones
          </h1>
          <p className="text-gray-600">
            Administra tus productos y servicios publicados
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-ucp-rojo text-white" : "text-gray-600"}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("cards")}
              className={viewMode === "cards" ? "bg-ucp-rojo text-white" : "text-gray-600"}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
          <Link href="/dashboard/student/publications/new">
            <Button className="bg-ucp-rojo hover:bg-red-700 rounded-full text-white">
              <Plus className="w-5 h-5 mr-2" />
              Nueva Publicación
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <p className="text-gray-500">Cargando publicaciones...</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-0 shadow-lg rounded-xl">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-ucp-rojo mb-1">{publicaciones.length}</div>
                <div className="text-gray-600">Total publicaciones</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg rounded-xl">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-ucp-verde mb-1">{approvedProducts.length}</div>
                <div className="text-gray-600">Publicadas</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg rounded-xl">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-1">{pendingProducts.length}</div>
                <div className="text-gray-600">Pendientes</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg rounded-xl">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-gray-600 mb-1">125</div>
                <div className="text-gray-600">Vistas totales</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6 bg-white border rounded-lg p-1">
              <TabsTrigger value="all" className="rounded-md">
                Todas ({publicaciones.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="rounded-md">
                Publicadas ({approvedProducts.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="rounded-md">
                Pendientes ({pendingProducts.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="rounded-md">
                Rechazadas ({rejectedProducts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className={viewMode === "grid" ? "space-y-4" : "grid sm:grid-cols-2 lg:grid-cols-3 gap-6"}>
                {publicaciones.length > 0 ? (
                  publicaciones.map((product) => 
                    viewMode === "grid" ? 
                      <ProductRow key={product.id} product={product} /> :
                      <ProductCard key={product.id} product={product} />
                  )
                ) : (
                  <EmptyState message="No tienes publicaciones" />
                )}
              </div>
            </TabsContent>

            <TabsContent value="approved">
              <div className={viewMode === "grid" ? "space-y-4" : "grid sm:grid-cols-2 lg:grid-cols-3 gap-6"}>
                {approvedProducts.length > 0 ? (
                  approvedProducts.map((product) => 
                    viewMode === "grid" ? 
                      <ProductRow key={product.id} product={product} /> :
                      <ProductCard key={product.id} product={product} />
                  )
                ) : (
                  <EmptyState message="No tienes publicaciones aprobadas" />
                )}
              </div>
            </TabsContent>

            <TabsContent value="pending">
              <div className={viewMode === "grid" ? "space-y-4" : "grid sm:grid-cols-2 lg:grid-cols-3 gap-6"}>
                {pendingProducts.length > 0 ? (
                  pendingProducts.map((product) => 
                    viewMode === "grid" ? 
                      <ProductRow key={product.id} product={product} /> :
                      <ProductCard key={product.id} product={product} />
                  )
                ) : (
                  <Card className="border-0 shadow-lg rounded-xl">
                    <CardContent className="p-16 text-center">
                      <p className="text-gray-500">No tienes publicaciones pendientes de revisión</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="rejected">
              <div className={viewMode === "grid" ? "space-y-4" : "grid sm:grid-cols-2 lg:grid-cols-3 gap-6"}>
                {rejectedProducts.length > 0 ? (
                  rejectedProducts.map((product) => 
                    viewMode === "grid" ? 
                      <ProductRow key={product.id} product={product} /> :
                      <ProductCard key={product.id} product={product} />
                  )
                ) : (
                  <Card className="border-0 shadow-lg rounded-xl">
                    <CardContent className="p-16 text-center">
                      <p className="text-gray-500">No tienes publicaciones rechazadas</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Details Dialog - Custom Modal */}
      {isDetailsDialogOpen && selectedPublicacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsDetailsDialogOpen(false)} />
          <div className="relative w-full max-w-4xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="border-b px-6 py-4 flex items-center justify-between bg-white">
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{selectedPublicacion.titulo}</h2>
                <p className="text-gray-600 mt-1">Detalles completos de tu publicación</p>
              </div>
              <Badge 
                className={
                  selectedPublicacion.estado === "APROBADA" 
                    ? "bg-ucp-verde text-white" 
                    : selectedPublicacion.estado === "PENDIENTE"
                    ? "bg-yellow-500 text-white"
                    : "bg-ucp-rojo text-white"
                }
              >
                {selectedPublicacion.estado}
              </Badge>
              <button
                onClick={() => setIsDetailsDialogOpen(false)}
                className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6 max-w-4xl mx-auto">
                {/* Imágenes */}
                {selectedPublicacion.medios.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
                    {selectedPublicacion.medios.map((medio, index) => (
                      <div key={index} className="relative group w-full max-w-sm">
                        <img
                          src={medio.url}
                          alt={`${selectedPublicacion.titulo} ${index + 1}`}
                          className="w-full aspect-square object-cover rounded-xl shadow-md transition-transform group-hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Descripción */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-3">
                    <span className="w-10 h-10 bg-ucp-rojo rounded-lg flex items-center justify-center">
                      <Eye className="w-5 h-5 text-white" />
                    </span>
                    Descripción
                  </h4>
                  <p className="text-gray-700 leading-relaxed text-lg">{selectedPublicacion.descripcion}</p>
                </div>

                {/* Información detallada */}
                <div className="grid grid-cols-1 gap-6">
                  <Card className="border border-gray-200 shadow-lg bg-white">
                    <CardHeader className="pb-3 bg-gray-50 border-b">
                      <CardTitle className="text-xl font-bold flex items-center gap-3">
                        <span className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Edit className="w-5 h-5 text-white" />
                        </span>
                        Información de la publicación
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 bg-white pt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-white border border-gray-200 rounded-lg">
                          <span className="text-gray-600 font-medium block mb-2">Precio</span>
                          <span className="text-2xl font-bold text-ucp-rojo">{formatPrice(selectedPublicacion.precio)}</span>
                        </div>
                        <div className="p-4 bg-white border border-gray-200 rounded-lg">
                          <span className="text-gray-600 font-medium block mb-2">Tipo</span>
                          <Badge className="bg-purple-600 text-white text-base px-4 py-1">{selectedPublicacion.tipo}</Badge>
                        </div>
                        <div className="p-4 bg-white border border-gray-200 rounded-lg">
                          <span className="text-gray-600 font-medium block mb-2">Categoría</span>
                          <Badge variant="outline" className="text-base px-4 py-1">{selectedPublicacion.categoria.nombre}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200 shadow-lg bg-white">
                    <CardHeader className="pb-3 bg-gray-50 border-b">
                      <CardTitle className="text-xl font-bold flex items-center gap-3">
                        <span className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                          <Edit className="w-5 h-5 text-white" />
                        </span>
                        Estado y fechas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 bg-white pt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-white border border-gray-200 rounded-lg">
                          <span className="text-gray-600 font-medium block mb-2">Estado actual</span>
                          <Badge 
                            className={
                              selectedPublicacion.estado === "APROBADA" 
                                ? "bg-ucp-verde text-white" 
                                : selectedPublicacion.estado === "PENDIENTE"
                                ? "bg-yellow-500 text-white"
                                : "bg-ucp-rojo text-white"
                            }
                          >
                            {selectedPublicacion.estado}
                          </Badge>
                        </div>
                        <div className="p-4 bg-white border border-gray-200 rounded-lg">
                          <span className="text-gray-600 font-medium block mb-2">Fecha de publicación</span>
                          <p className="text-base text-gray-900 font-medium">
                            {new Date(selectedPublicacion.creadoEn).toLocaleDateString('es-CO', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Acciones rápidas */}
                <div className="flex gap-4 pt-4 border-t">
                  <Link href={`/dashboard/student/publications/edit/${selectedPublicacion.id}`} className="flex-1">
                    <Button className="w-full bg-ucp-rojo hover:bg-red-700 rounded-full text-lg py-6 text-white">
                      <Edit className="w-6 h-6 mr-3" />
                      Editar publicación
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
