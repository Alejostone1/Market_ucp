"use client";

import { useState, useEffect } from "react";
import { Check, X, Eye, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  categoria: {
    id: string;
    nombre: string;
  };
  autor: {
    id: string;
    nombre: string;
    correo: string;
    facultad: string;
  };
  medios: {
    id: string;
    url: string;
  }[];
  creadoEn: string;
}

export default function AdminPublicacionesPage() {
  const { usuario } = useAuth();
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [selectedPublicacion, setSelectedPublicacion] = useState<Publicacion | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("PENDIENTE");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicaciones = async () => {
      try {
        const params = new URLSearchParams({
          estado: filterEstado,
          ...(filterTipo !== "todos" && { tipo: filterTipo }),
        });

        const response = await fetch(`/api/admin/publicaciones?${params}`);
        if (response.ok) {
          const data = await response.json();
          setPublicaciones(data.publicaciones);
        }
      } catch (error) {
        console.error('Error al cargar publicaciones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicaciones();
  }, [filterEstado, filterTipo]);

  const filteredPublicaciones = publicaciones.filter(
    (p) =>
      p.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.autor.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch('/api/admin/publicaciones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          estado: 'APROBADA',
          adminId: usuario?.id,
        }),
      });

      if (response.ok) {
        setPublicaciones(publicaciones.filter(p => p.id !== id));
        toast.success("Publicación aprobada exitosamente");
      } else {
        toast.error("Error al aprobar publicación");
      }
    } catch (error) {
      toast.error("Error al aprobar publicación");
    }
  };

  const handleReject = async () => {
    if (!selectedPublicacion || !rejectionReason.trim()) {
      toast.error("Debes proporcionar una razón de rechazo");
      return;
    }

    try {
      const response = await fetch('/api/admin/publicaciones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedPublicacion.id,
          estado: 'RECHAZADA',
          notaRechazo: rejectionReason,
          adminId: usuario?.id,
        }),
      });

      if (response.ok) {
        setPublicaciones(publicaciones.filter(p => p.id !== selectedPublicacion.id));
        setIsDialogOpen(false);
        setRejectionReason("");
        setSelectedPublicacion(null);
        toast.success("Publicación rechazada");
      } else {
        toast.error("Error al rechazar publicación");
      }
    } catch (error) {
      toast.error("Error al rechazar publicación");
    }
  };

  const handleArchive = async (id: string) => {
    try {
      const response = await fetch('/api/admin/publicaciones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          estado: 'ARCHIVADA',
          adminId: usuario?.id,
        }),
      });

      if (response.ok) {
        setPublicaciones(publicaciones.filter(p => p.id !== id));
        toast.success("Publicación archivada");
      } else {
        toast.error("Error al archivar publicación");
      }
    } catch (error) {
      toast.error("Error al archivar publicación");
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return "Gratis";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(Number(price));
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "APROBADA":
        return <Badge className="bg-ucp-verde text-white">Aprobada</Badge>;
      case "RECHAZADA":
        return <Badge className="bg-ucp-rojo text-white">Rechazada</Badge>;
      case "ARCHIVADA":
        return <Badge className="bg-gray-500 text-white">Archivada</Badge>;
      default:
        return <Badge className="bg-yellow-500 text-white">Pendiente</Badge>;
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Publicaciones</h1>
      <p className="text-gray-600 mb-8">
        Modera y gestiona las publicaciones del marketplace
      </p>

      {/* Filters */}
      <Card className="border-0 shadow-lg rounded-xl mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="search"
                placeholder="Buscar por título o vendedor..."
                className="pl-10 rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDIENTE">Pendientes</SelectItem>
                  <SelectItem value="APROBADA">Aprobadas</SelectItem>
                  <SelectItem value="RECHAZADA">Rechazadas</SelectItem>
                  <SelectItem value="ARCHIVADA">Archivadas</SelectItem>
                  <SelectItem value="todos">Todas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="PRODUCTO">Producto</SelectItem>
                  <SelectItem value="SERVICIO">Servicio</SelectItem>
                  <SelectItem value="EVENTO">Evento</SelectItem>
                  <SelectItem value="CONVOCATORIA">Convocatoria</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Publications List */}
      {loading ? (
        <div className="text-center py-16">
          <p className="text-gray-500">Cargando publicaciones...</p>
        </div>
      ) : filteredPublicaciones.length > 0 ? (
        <div className="space-y-4">
          {filteredPublicaciones.map((publicacion) => (
            <Card key={publicacion.id} className="border-0 shadow-lg rounded-xl hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <img
                      src={publicacion.medios[0]?.url || "/placeholder.jpg"}
                      alt={publicacion.titulo}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">{publicacion.titulo}</h3>
                          {getEstadoBadge(publicacion.estado)}
                          <Badge variant="outline">{publicacion.tipo}</Badge>
                        </div>
                        
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{publicacion.descripcion}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="font-medium text-ucp-rojo">{formatPrice(publicacion.precio)}</span>
                          <span>•</span>
                          <span>{publicacion.categoria.nombre}</span>
                          <span>•</span>
                          <span>Vendedor: {publicacion.autor.nombre}</span>
                          <span>•</span>
                          <span>{publicacion.autor.facultad}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {publicacion.estado === "PENDIENTE" && (
                          <>
                            <Button
                              onClick={() => handleApprove(publicacion.id)}
                              className="bg-ucp-verde hover:bg-green-700 rounded-full"
                              size="sm"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Aprobar
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedPublicacion(publicacion);
                                setIsDialogOpen(true);
                              }}
                              variant="destructive"
                              className="rounded-full"
                              size="sm"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Rechazar
                            </Button>
                          </>
                        )}
                        {publicacion.estado === "APROBADA" && (
                          <Button
                            onClick={() => handleArchive(publicacion.id)}
                            variant="outline"
                            className="rounded-full"
                            size="sm"
                          >
                            Archivar
                          </Button>
                        )}
                        <Button
                          onClick={() => setSelectedPublicacion(publicacion)}
                          variant="ghost"
                          size="sm"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-lg rounded-xl">
          <CardContent className="p-16 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay publicaciones
            </h3>
            <p className="text-gray-600">
              No se encontraron publicaciones con los filtros actuales
            </p>
          </CardContent>
        </Card>
      )}

      {/* Rejection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Publicación</DialogTitle>
            <DialogDescription>
              Proporciona una razón para el rechazo de esta publicación.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Razón del rechazo</label>
              <Textarea
                placeholder="Describe por qué estás rechazando esta publicación..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setRejectionReason("");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReject}
              variant="destructive"
              disabled={!rejectionReason.trim()}
            >
              Rechazar Publicación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={!!selectedPublicacion && !isDialogOpen} onOpenChange={() => setSelectedPublicacion(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedPublicacion && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedPublicacion.titulo}</DialogTitle>
                <DialogDescription>
                  Detalles completos de la publicación
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex gap-2">
                  {selectedPublicacion.medios.map((medio, index) => (
                    <img
                      key={index}
                      src={medio.url}
                      alt={`${selectedPublicacion.titulo} ${index + 1}`}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Descripción</h4>
                  <p className="text-gray-700">{selectedPublicacion.descripcion}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Información</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Precio:</span>
                        <span className="font-medium">{formatPrice(selectedPublicacion.precio)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Categoría:</span>
                        <span className="font-medium">{selectedPublicacion.categoria.nombre}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo:</span>
                        <span className="font-medium">{selectedPublicacion.tipo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <span className="font-medium">{selectedPublicacion.estado}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Vendedor</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nombre:</span>
                        <span className="font-medium">{selectedPublicacion.autor.nombre}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Correo:</span>
                        <span className="font-medium">{selectedPublicacion.autor.correo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Facultad:</span>
                        <span className="font-medium">{selectedPublicacion.autor.facultad}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSelectedPublicacion(null)}
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
