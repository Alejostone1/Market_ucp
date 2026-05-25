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

  const approvedProducts  = publicaciones.filter(p => p.estado === "APROBADA");
  const pendingProducts   = publicaciones.filter(p => p.estado === "PENDIENTE");
  const rejectedProducts  = publicaciones.filter(p => p.estado === "RECHAZADA");

  const formatPrice = (price: number | null) => {
    if (!price) return "Gratis";
    return new Intl.NumberFormat("es-CO", {
      style: "currency", currency: "COP", minimumFractionDigits: 0,
    }).format(price);
  };

  const handleDelete = async (id: string) => {
    if (!usuario?.id) return;
    try {
      const response = await fetch(`/api/usuarios/${usuario.id}/publicaciones`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicationId: id }),
      });
      if (response.ok) {
        setPublicaciones(publicaciones.filter(p => p.id !== id));
        toast.success("Publicación eliminada exitosamente");
      } else {
        toast.error("Error al eliminar publicación");
      }
    } catch {
      toast.error("Error al eliminar publicación");
    }
  };

  // ── Badge de estado ─────────────────────────────────────────────────────────
  const estadoBadgeClass = (estado: string) =>
    estado === "APROBADA" ? "bg-ucp-verde text-white"
    : estado === "PENDIENTE" ? "bg-yellow-500 text-white"
    : "bg-ucp-rojo text-white";

  // ── Action menu reutilizable ────────────────────────────────────────────────
  const ActionMenu = ({ product }: { product: Publicacion }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 shrink-0">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => { setSelectedPublicacion(product); setIsDetailsDialogOpen(true); }}>
          <Eye className="w-4 h-4 mr-2" /> Ver detalles
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/student/publications/edit/${product.id}`} className="cursor-pointer">
            <Edit className="w-4 h-4 mr-2" /> Editar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(product.id)}>
          <Trash2 className="w-4 h-4 mr-2" /> Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // ── Tarjeta (vista cards) ───────────────────────────────────────────────────
  const ProductCard = ({ product }: { product: Publicacion }) => (
    <Card className="border-0 shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow">
      {/* Imagen */}
      <div className="relative h-44 sm:h-48 bg-gray-100">
        {product.medios?.length > 0 ? (
          <>
            <img src={product.medios[0].url} alt={product.titulo} className="w-full h-full object-cover" />
            {product.medios.length > 1 && (
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                +{product.medios.length - 1}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-gray-400 text-lg sm:text-xl">📷</span>
              </div>
              <p className="text-gray-500 text-xs sm:text-sm">Sin imágenes</p>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1.5 line-clamp-2">{product.titulo}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={estadoBadgeClass(product.estado)}>{product.estado}</Badge>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded truncate max-w-[100px]">
                #{product.id.slice(-6)}
              </span>
            </div>
          </div>
          <ActionMenu product={product} />
        </div>

        {/* Descripción */}
        <p className="text-gray-600 mb-3 line-clamp-2 text-sm leading-relaxed">
          {product.descripcion || "Sin descripción"}
        </p>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Precio</p>
            <p className="text-lg sm:text-xl font-bold text-ucp-rojo">{formatPrice(product.precio)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Categoría</p>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium inline-block">
              {product.categoria?.nombre || "General"}
            </span>
          </div>
        </div>

        {/* Metadatos */}
        <div className="bg-gray-50 px-3 py-2.5 rounded-lg space-y-1.5 text-xs mb-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Tipo</span>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full font-medium">{product.tipo}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Creado</span>
            <span className="text-gray-800 font-medium">
              {new Date(product.creadoEn).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Vistas</span>
            <span className="text-ucp-rojo font-bold">{product.vistas || 0}</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 pt-3 border-t">
          <Button
            variant="outline" size="sm"
            onClick={() => { setSelectedPublicacion(product); setIsDetailsDialogOpen(true); }}
            className="flex-1 text-xs"
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" /> Ver detalles
          </Button>
          <Button size="sm" asChild className="flex-1 text-xs">
            <Link href={`/dashboard/student/publications/edit/${product.id}`} className="flex items-center justify-center">
              <Edit className="w-3.5 h-3.5 mr-1.5" /> Editar
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // ── Fila (vista list) ───────────────────────────────────────────────────────
  const ProductRow = ({ product }: { product: Publicacion }) => (
    <Card className="hover:shadow-lg transition-shadow rounded-xl border-0 shadow-md">
      <CardContent className="p-4 sm:p-5">
        <div className="flex gap-3 sm:gap-4">
          {/* Imagen principal (solo 1 en móvil) */}
          <div className="w-20 h-20 sm:w-28 sm:h-28 shrink-0 rounded-lg overflow-hidden bg-gray-100">
            {product.medios?.length > 0 ? (
              <img
                src={product.medios[0].url}
                alt={product.titulo}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-400 text-xl">📷</span>
              </div>
            )}
          </div>

          {/* Información */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm sm:text-base text-gray-900 line-clamp-2 leading-snug">{product.titulo}</h3>
              </div>
              <ActionMenu product={product} />
            </div>

            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              <Badge className={`${estadoBadgeClass(product.estado)} text-[10px] px-1.5 py-0.5`}>
                {product.estado}
              </Badge>
              <span className="text-[10px] text-gray-500">#{product.id.slice(-6)}</span>
            </div>

            <p className="text-gray-500 text-xs line-clamp-2 mb-2 leading-relaxed hidden sm:block">
              {product.descripcion || "Sin descripción"}
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-base sm:text-lg font-bold text-ucp-rojo">
                {formatPrice(product.precio)}
              </span>
              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded-full text-[10px] font-medium">
                {product.tipo}
              </span>
              <span className="text-[10px] text-gray-500">
                {new Date(product.creadoEn).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
              </span>
              <span className="text-[10px] text-ucp-rojo font-semibold">{product.vistas || 0} vistas</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // ── Empty state ─────────────────────────────────────────────────────────────
  const EmptyState = ({ message }: { message: string }) => (
    <Card className="border-0 shadow-lg rounded-xl">
      <CardContent className="p-8 sm:p-14 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{message}</h3>
        <p className="text-gray-500 text-sm mb-5">Crea tu primera publicación para comenzar a vender</p>
        <Link href="/dashboard/student/publications/new">
          <Button className="bg-ucp-rojo hover:bg-red-700 rounded-full text-white">
            <Plus className="w-4 h-4 mr-2" /> Nueva Publicación
          </Button>
        </Link>
      </CardContent>
    </Card>
  );

  const TabGrid = ({ list }: { list: Publicacion[] }) =>
    list.length > 0 ? (
      <div className={viewMode === "grid" ? "space-y-3" : "grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"}>
        {list.map(p =>
          viewMode === "grid"
            ? <ProductRow key={p.id} product={p} />
            : <ProductCard key={p.id} product={p} />
        )}
      </div>
    ) : null;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-0.5">Mis Publicaciones</h1>
          <p className="text-gray-500 text-sm">Administra tus productos y servicios publicados</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle de vista */}
          <div className="flex items-center bg-white border rounded-lg p-1 shrink-0">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"} size="sm"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-ucp-rojo text-white h-7 w-7 p-0" : "text-gray-600 h-7 w-7 p-0"}
            >
              <Grid className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"} size="sm"
              onClick={() => setViewMode("cards")}
              className={viewMode === "cards" ? "bg-ucp-rojo text-white h-7 w-7 p-0" : "text-gray-600 h-7 w-7 p-0"}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </Button>
          </div>
          <Link href="/dashboard/student/publications/new" className="flex-1 sm:flex-none">
            <Button className="bg-ucp-rojo hover:bg-red-700 rounded-full text-white w-full sm:w-auto text-sm">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Nueva Publicación</span>
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-ucp-rojo border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats compactos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
              { val: publicaciones.length, label: "Total", color: "text-ucp-rojo" },
              { val: approvedProducts.length, label: "Publicadas", color: "text-ucp-verde" },
              { val: pendingProducts.length, label: "Pendientes", color: "text-yellow-600" },
              { val: 125, label: "Vistas", color: "text-gray-600" },
            ].map((s) => (
              <Card key={s.label} className="border-0 shadow-md rounded-xl">
                <CardContent className="p-3 sm:p-5 text-center">
                  <div className={`text-2xl sm:text-3xl font-bold ${s.color} mb-0.5`}>{s.val}</div>
                  <div className="text-gray-500 text-xs sm:text-sm">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs con scroll horizontal */}
          <Tabs defaultValue="all" className="w-full">
            <div className="overflow-x-auto mb-4 -mx-1 px-1">
              <TabsList className="bg-white border rounded-lg p-1 inline-flex w-max sm:w-auto">
                <TabsTrigger value="all" className="rounded-md text-xs sm:text-sm whitespace-nowrap">
                  Todas ({publicaciones.length})
                </TabsTrigger>
                <TabsTrigger value="approved" className="rounded-md text-xs sm:text-sm whitespace-nowrap">
                  Aprobadas ({approvedProducts.length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="rounded-md text-xs sm:text-sm whitespace-nowrap">
                  Pendientes ({pendingProducts.length})
                </TabsTrigger>
                <TabsTrigger value="rejected" className="rounded-md text-xs sm:text-sm whitespace-nowrap">
                  Rechazadas ({rejectedProducts.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all">
              {publicaciones.length > 0 ? <TabGrid list={publicaciones} /> : <EmptyState message="No tienes publicaciones" />}
            </TabsContent>

            <TabsContent value="approved">
              {approvedProducts.length > 0
                ? <TabGrid list={approvedProducts} />
                : <EmptyState message="No tienes publicaciones aprobadas" />}
            </TabsContent>

            <TabsContent value="pending">
              {pendingProducts.length > 0 ? (
                <TabGrid list={pendingProducts} />
              ) : (
                <Card className="border-0 shadow-md rounded-xl">
                  <CardContent className="p-8 sm:p-14 text-center">
                    <p className="text-gray-500 text-sm">No tienes publicaciones pendientes de revisión</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="rejected">
              {rejectedProducts.length > 0 ? (
                <TabGrid list={rejectedProducts} />
              ) : (
                <Card className="border-0 shadow-md rounded-xl">
                  <CardContent className="p-8 sm:p-14 text-center">
                    <p className="text-gray-500 text-sm">No tienes publicaciones rechazadas</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* ── Modal de detalles — 100% responsive ────────────────────────────── */}
      {isDetailsDialogOpen && selectedPublicacion && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsDetailsDialogOpen(false)} />

          {/* Panel — bottom sheet en móvil, modal centrado en sm+ */}
          <div className="relative w-full sm:max-w-3xl sm:max-h-[90vh] max-h-[92vh] bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col">

            {/* Handle bar (solo móvil) */}
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="border-b px-4 sm:px-6 py-3 flex items-start gap-3 bg-white shrink-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={estadoBadgeClass(selectedPublicacion.estado)}>
                    {selectedPublicacion.estado}
                  </Badge>
                  <span className="text-[10px] text-gray-400">#{selectedPublicacion.id.slice(-6)}</span>
                </div>
                <h2 className="text-base sm:text-xl font-bold text-gray-900 leading-snug line-clamp-2">
                  {selectedPublicacion.titulo}
                </h2>
                <p className="text-gray-500 text-xs mt-0.5 hidden sm:block">Detalles completos de tu publicación</p>
              </div>
              <button
                onClick={() => setIsDetailsDialogOpen(false)}
                className="shrink-0 p-1.5 hover:bg-gray-100 rounded-lg transition-colors mt-0.5"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content — scrollable */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
              <div className="space-y-4">
                {/* Imágenes */}
                {selectedPublicacion.medios.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedPublicacion.medios.map((medio, index) => (
                      <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                        <img
                          src={medio.url}
                          alt={`${selectedPublicacion.titulo} ${index + 1}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        {index === 0 && (
                          <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                            Principal
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Descripción */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">Descripción</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{selectedPublicacion.descripcion}</p>
                </div>

                {/* Info cards — 3 cols en sm, 1 col en móvil */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white border rounded-xl p-3.5">
                    <p className="text-xs text-gray-500 mb-1">Precio</p>
                    <p className="text-xl font-bold text-ucp-rojo">{formatPrice(selectedPublicacion.precio)}</p>
                  </div>
                  <div className="bg-white border rounded-xl p-3.5">
                    <p className="text-xs text-gray-500 mb-1">Tipo</p>
                    <Badge className="bg-purple-600 text-white">{selectedPublicacion.tipo}</Badge>
                  </div>
                  <div className="bg-white border rounded-xl p-3.5">
                    <p className="text-xs text-gray-500 mb-1">Categoría</p>
                    <Badge variant="outline">{selectedPublicacion.categoria.nombre}</Badge>
                  </div>
                </div>

                {/* Metadatos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white border rounded-xl p-3.5">
                    <p className="text-xs text-gray-500 mb-1">Estado actual</p>
                    <Badge className={estadoBadgeClass(selectedPublicacion.estado)}>
                      {selectedPublicacion.estado}
                    </Badge>
                  </div>
                  <div className="bg-white border rounded-xl p-3.5">
                    <p className="text-xs text-gray-500 mb-1">Fecha de publicación</p>
                    <p className="text-sm text-gray-900 font-medium">
                      {new Date(selectedPublicacion.creadoEn).toLocaleDateString('es-CO', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-ucp-rojo">{selectedPublicacion.vistas || 0}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Vistas</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedPublicacion.medios.length}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Imágenes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer fijo */}
            <div className="border-t px-4 sm:px-6 py-3 sm:py-4 bg-white shrink-0">
              <Link href={`/dashboard/student/publications/edit/${selectedPublicacion.id}`} className="block">
                <Button className="w-full bg-ucp-rojo hover:bg-red-700 rounded-xl text-white font-semibold">
                  <Edit className="w-4 h-4 mr-2" /> Editar publicación
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
