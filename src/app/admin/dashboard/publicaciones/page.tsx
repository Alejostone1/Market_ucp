"use client";

import { useState, useEffect } from "react";
import { Check, X, Eye, Search, Filter, Plus, Edit, Trash2, Package, Users, Calendar, Bell, MapPin, Grid, List } from "lucide-react";
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
    color: string;
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

interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  color: string;
}

export default function AdminPublicacionesPage() {
  const { usuario } = useAuth();
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [selectedPublicacion, setSelectedPublicacion] = useState<Publicacion | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isStateDialogOpen, setIsStateDialogOpen] = useState(false);
  const [newEstado, setNewEstado] = useState("");
  const [stateNotaRechazo, setStateNotaRechazo] = useState("");
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [uploadedImages, setUploadedImages] = useState<Array<{url: string, id?: string, file?: File}>>([]);
  const [newPublicacion, setNewPublicacion] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'PRODUCTO',
    categoriaId: '',
    precio: '',
    tipoPrecio: 'FIJO',
    facultad: '',
    fechaEvento: '',
    ubicacionEvento: '',
    cupos: '',
    fechaLimite: '',
  });
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch publicaciones
        const params = new URLSearchParams();
        if (filterEstado !== "todos") {
          params.append('estado', filterEstado);
        }
        if (filterTipo !== "todos") {
          params.append('tipo', filterTipo);
        }

        const [pubsResponse, catsResponse] = await Promise.all([
          fetch(`/api/admin/publicaciones?${params}`),
          fetch('/api/categorias'),
        ]);

        if (pubsResponse.ok) {
          const data = await pubsResponse.json();
          setPublicaciones(data.publicaciones || []);
        }

        if (catsResponse.ok) {
          const catsData = await catsResponse.json();
          setCategorias(catsData);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterEstado, filterTipo]);

  const filteredPublicaciones = publicaciones.filter(
    (p) =>
      p.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.autor.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredPublicaciones.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPublicaciones = filteredPublicaciones.slice(startIndex, endIndex);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterTipo, filterEstado]);

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

  const openStateDialog = (publicacion: Publicacion) => {
    setSelectedPublicacion(publicacion);
    setNewEstado(publicacion.estado);
    setStateNotaRechazo("");
    setIsStateDialogOpen(true);
  };

  const handleStateChange = async () => {
    if (!selectedPublicacion || !newEstado) {
      toast.error("Debes seleccionar un estado");
      return;
    }

    // Si el nuevo estado es RECHAZADA, la nota es OBLIGATORIA
    if (newEstado === 'RECHAZADA' && !stateNotaRechazo.trim()) {
      toast.error("Debes ingresar una nota justificativa para rechazar la publicación");
      return;
    }

    try {
      const response = await fetch('/api/admin/publicaciones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedPublicacion.id,
          estado: newEstado,
          adminId: usuario?.id,
          ...(stateNotaRechazo.trim() && { notaRechazo: stateNotaRechazo.trim() }),
        }),
      });

      if (response.ok) {
        setPublicaciones(publicaciones.map(p =>
          p.id === selectedPublicacion.id ? { ...p, estado: newEstado } : p
        ));
        setIsStateDialogOpen(false);
        setSelectedPublicacion(null);
        setNewEstado("");
        setStateNotaRechazo("");
        toast.success(`Estado cambiado a ${newEstado}`);
      } else {
        toast.error("Error al cambiar estado");
      }
    } catch (error) {
      toast.error("Error al cambiar estado");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/publicaciones', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setPublicaciones(publicaciones.filter(p => p.id !== id));
        toast.success("Publicación eliminada permanentemente");
      } else {
        toast.error("Error al eliminar publicación");
      }
    } catch (error) {
      toast.error("Error al eliminar publicación");
    }
  };

  const handleImageUpload = async (files: FileList) => {
    const newImages: Array<{url: string, id?: string, file?: File}> = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const preview = URL.createObjectURL(file);
      newImages.push({ url: preview, file });
    }
    
    setUploadedImages(prev => [...prev, ...newImages]);
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    if (wizardStep < 4) setWizardStep(wizardStep + 1);
  };

  const prevStep = () => {
    if (wizardStep > 1) setWizardStep(wizardStep - 1);
  };

  const resetWizard = () => {
    setWizardStep(1);
    setUploadedImages([]);
    setNewPublicacion({
      titulo: '',
      descripcion: '',
      tipo: 'PRODUCTO',
      categoriaId: '',
      precio: '',
      tipoPrecio: 'FIJO',
      facultad: '',
      fechaEvento: '',
      ubicacionEvento: '',
      cupos: '',
      fechaLimite: '',
    });
  };

  const handleCreatePublicacion = async () => {
    try {
      // Preparar datos según el modelo Prisma
      const publicationData = {
        titulo: newPublicacion.titulo,
        descripcion: newPublicacion.descripcion,
        tipo: newPublicacion.tipo,
        categoriaId: newPublicacion.categoriaId,
        autorId: usuario?.id,
        estado: 'APROBADA', // Las publicaciones del admin se aprueban automáticamente
        precio: newPublicacion.precio ? parseFloat(newPublicacion.precio) : null,
        tipoPrecio: newPublicacion.tipoPrecio || null,
        facultad: newPublicacion.facultad || null,
        // Campos opcionales según tipo
        ...(newPublicacion.tipo === 'EVENTO' && {
          fechaEvento: newPublicacion.fechaEvento ? new Date(newPublicacion.fechaEvento) : null,
          ubicacionEvento: newPublicacion.ubicacionEvento || null,
          cupos: newPublicacion.cupos ? parseInt(newPublicacion.cupos) : null,
        }),
        ...(newPublicacion.tipo === 'CONVOCATORIA' && {
          fechaLimite: newPublicacion.fechaLimite ? new Date(newPublicacion.fechaLimite) : null,
        }),
      };

      const response = await fetch('/api/publicaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(publicationData),
      });

      if (response.ok) {
        const newPub = await response.json();
        
        // Subir imágenes si existen
        if (uploadedImages.length > 0) {
          for (const image of uploadedImages) {
            if (image.file) {
              const formData = new FormData();
              formData.append('file', image.file);
              formData.append('publicacionId', newPub.id);
              formData.append('altText', newPub.titulo);
              
              await fetch('/api/upload', {
                method: 'POST',
                body: formData
              });
            }
          }
        }
        
        setPublicaciones([newPub, ...publicaciones]);
        setShowCreateModal(false);
        resetWizard();
        toast.success("Publicación creada exitosamente");
      } else {
        const error = await response.json();
        toast.error(error.error || "Error al crear publicación");
      }
    } catch (error) {
      console.error('Error al crear publicación:', error);
      toast.error("Error al crear publicación");
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Gestión de Publicaciones</h1>
          <p className="text-gray-600 text-sm">
            Modera y gestiona las publicaciones del marketplace
          </p>
        </div>
        <Button
          className="bg-ucp-rojo hover:bg-red-700 text-white rounded-full w-full sm:w-auto"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Publicación
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="border-0 shadow-lg rounded-xl">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-ucp-rojo mb-1">
              {publicaciones.filter(p => p.estado === 'PENDIENTE').length}
            </div>
            <div className="text-gray-600">Pendientes</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg rounded-xl bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-ucp-verde mb-1">
              {publicaciones.filter(p => p.estado === 'APROBADA').length}
            </div>
            <div className="text-green-800 font-medium">Aprobadas</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg rounded-xl bg-red-50 border-red-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-1">
              {publicaciones.filter(p => p.estado === 'RECHAZADA').length}
            </div>
            <div className="text-red-800 font-medium">Rechazadas</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg rounded-xl">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-gray-600 mb-1">
              {publicaciones.length}
            </div>
            <div className="text-gray-600">Total</div>
          </CardContent>
        </Card>
      </div>

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

            <div className="flex flex-wrap gap-2">
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="flex-1 min-w-[130px]">
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
                <SelectTrigger className="flex-1 min-w-[130px]">
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

      {/* View Mode Toggle and Pagination Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-white border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-md h-8 px-3"
            >
              <Grid className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Grid</span>
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-md h-8 px-3"
            >
              <List className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Lista</span>
            </Button>
          </div>
          <span className="text-sm text-gray-500">
            {filteredPublicaciones.length} publicaciones
          </span>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="text-sm font-medium px-2 whitespace-nowrap">
              {currentPage}/{totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>

      {/* Publications List */}
      {loading ? (
        <div className="text-center py-16">
          <p className="text-gray-500">Cargando publicaciones...</p>
        </div>
      ) : currentPublicaciones.length > 0 ? (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentPublicaciones.map((publicacion) => (
                <Card key={publicacion.id} className="border-0 shadow-lg rounded-xl hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <img
                        src={publicacion.medios[0]?.url || "/placeholder.jpg"}
                        alt={publicacion.titulo}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{publicacion.titulo}</h3>
                          {getEstadoBadge(publicacion.estado)}
                        </div>
                        
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{publicacion.descripcion}</p>
                        
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-3">
                          <span className="font-medium text-ucp-rojo">{formatPrice(publicacion.precio)}</span>
                          <Badge variant="outline">{publicacion.categoria.nombre}</Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <span>{publicacion.autor.nombre}</span>
                          <span>•</span>
                          <span>{new Date(publicacion.creadoEn).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setSelectedPublicacion(publicacion);
                              setIsDetailsDialogOpen(true);
                            }}
                            variant="ghost"
                            size="sm"
                            className="flex-1"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                          <Button
                            onClick={() => openStateDialog(publicacion)}
                            variant="outline"
                            className="flex-1"
                            size="sm"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Cambiar Estado
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {currentPublicaciones.map((publicacion) => (
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
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                          <span className="font-medium text-ucp-rojo">{formatPrice(publicacion.precio)}</span>
                          <span>•</span>
                          <Badge variant="outline">{publicacion.categoria.nombre}</Badge>
                          <span>•</span>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">{publicacion.autor.nombre[0]}</AvatarFallback>
                            </Avatar>
                            <span>{publicacion.autor.nombre}</span>
                          </div>
                          <span>•</span>
                          <span>{publicacion.autor.facultad}</span>
                          <span>•</span>
                          <span className="text-xs">{new Date(publicacion.creadoEn).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">ID: {publicacion.id.slice(-8)}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-400">{publicacion.autor.correo}</span>
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
                          onClick={() => {
                            setSelectedPublicacion(publicacion);
                            setIsDetailsDialogOpen(true);
                          }}
                          variant="ghost"
                          size="sm"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => openStateDialog(publicacion)}
                          variant="outline"
                          className="rounded-full"
                          size="sm"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Cambiar Estado
                        </Button>
                        <Button
                          onClick={() => handleDelete(publicacion.id)}
                          variant="outline"
                          className="rounded-full text-red-600 hover:text-red-700 hover:bg-red-50"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
            </div>
          )}
        </>
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
        <DialogContent className="bg-white">
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

      {/* State Change Dialog */}
      <Dialog open={isStateDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsStateDialogOpen(false);
          setSelectedPublicacion(null);
          setNewEstado("");
          setStateNotaRechazo("");
        }
      }}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar Estado de Publicación</DialogTitle>
            <DialogDescription>
              {selectedPublicacion?.titulo}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nuevo estado</label>
              <Select value={newEstado} onValueChange={(v) => {
                setNewEstado(v);
                if (v !== 'RECHAZADA') setStateNotaRechazo("");
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                  <SelectItem value="APROBADA">Aprobada</SelectItem>
                  <SelectItem value="RECHAZADA">Rechazada</SelectItem>
                  <SelectItem value="ARCHIVADA">Archivada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Nota — OBLIGATORIA si se rechaza, opcional en otros casos */}
            {newEstado === 'RECHAZADA' && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Nota de rechazo <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Explica el motivo del rechazo para que el autor pueda corregirlo..."
                  value={stateNotaRechazo}
                  onChange={(e) => setStateNotaRechazo(e.target.value)}
                  rows={4}
                  className={!stateNotaRechazo.trim() ? "border-red-300" : ""}
                />
                {!stateNotaRechazo.trim() && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    La nota de rechazo es obligatoria
                  </p>
                )}
              </div>
            )}

            {newEstado && newEstado !== 'RECHAZADA' && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Nota (opcional)
                </label>
                <Textarea
                  placeholder="Añade una nota informativa sobre este cambio de estado..."
                  value={stateNotaRechazo}
                  onChange={(e) => setStateNotaRechazo(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsStateDialogOpen(false);
                setSelectedPublicacion(null);
                setNewEstado("");
                setStateNotaRechazo("");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleStateChange}
              disabled={
                !newEstado ||
                newEstado === selectedPublicacion?.estado ||
                (newEstado === 'RECHAZADA' && !stateNotaRechazo.trim())
              }
            >
              Confirmar cambio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={() => {
        setIsDetailsDialogOpen(false);
        setSelectedPublicacion(null);
      }}>
        <DialogContent 
          className="max-h-[90vh] overflow-y-auto bg-white mx-auto"
          style={{ width: '95vw', maxWidth: '1400px' }}
        >
          {selectedPublicacion && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedPublicacion.titulo}</DialogTitle>
                <DialogDescription>
                  Detalles completos de la publicación
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-8 px-4">
                {/* Images Gallery */}
                {selectedPublicacion.medios.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-xl mb-4 text-center">Imágenes de la Publicación</h4>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 justify-center">
                      {selectedPublicacion.medios.map((medio, index) => (
                        <div key={index} className="group relative overflow-hidden rounded-xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200">
                          <img
                            src={medio.url}
                            alt={`${selectedPublicacion.titulo} ${index + 1}`}
                            className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="max-w-4xl mx-auto">
                  <h4 className="font-semibold text-xl mb-4 text-center">Descripción</h4>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 shadow-sm">
                    <p className="text-gray-700 leading-relaxed text-lg text-center">{selectedPublicacion.descripcion}</p>
                  </div>
                </div>

                {/* Information Cards */}
                <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                  {/* Publication Info */}
                  <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-6 shadow-lg">
                    <h4 className="font-semibold text-xl mb-6 flex items-center gap-3 text-center justify-center">
                      <Package className="w-6 h-6 text-ucp-rojo" />
                      Información de la Publicación
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-gray-300">
                        <span className="text-gray-700 font-medium">Precio:</span>
                        <span className="font-bold text-xl text-ucp-rojo">{formatPrice(selectedPublicacion.precio)}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-300">
                        <span className="text-gray-700 font-medium">Categoría:</span>
                        <Badge variant="outline" className="text-sm px-3 py-1" style={{ borderColor: selectedPublicacion.categoria.color, color: selectedPublicacion.categoria.color }}>
                          {selectedPublicacion.categoria.nombre}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-300">
                        <span className="text-gray-700 font-medium">Tipo:</span>
                        <Badge className="bg-gray-100 text-gray-800 text-sm px-3 py-1">{selectedPublicacion.tipo}</Badge>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-gray-700 font-medium">Estado:</span>
                        <Badge className={`${
                          selectedPublicacion.estado === "APROBADA" ? "bg-green-100 text-green-800" :
                          selectedPublicacion.estado === "PENDIENTE" ? "bg-yellow-100 text-yellow-800" :
                          selectedPublicacion.estado === "RECHAZADA" ? "bg-red-100 text-red-800" :
                          "bg-gray-100 text-gray-800"
                        } text-sm px-3 py-1`}>
                          {selectedPublicacion.estado}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Seller Info */}
                  <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-6 shadow-lg">
                    <h4 className="font-semibold text-xl mb-6 flex items-center gap-3 text-center justify-center">
                      <Users className="w-6 h-6 text-ucp-rojo" />
                      Información del Vendedor
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 pb-4 border-b border-gray-300">
                        <Avatar className="w-16 h-16 border-4 border-ucp-rojo">
                          <AvatarFallback className="bg-ucp-rojo text-white text-xl font-bold">
                            {selectedPublicacion.autor.nombre[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-lg">{selectedPublicacion.autor.nombre}</p>
                          <p className="text-sm text-gray-600">{selectedPublicacion.autor.correo}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-300">
                        <span className="text-gray-700 font-medium">Facultad:</span>
                        <span className="font-medium">{selectedPublicacion.autor.facultad || 'No especificada'}</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-gray-700 font-medium">Fecha de publicación:</span>
                        <span className="font-medium">{new Date(selectedPublicacion.creadoEn).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDetailsDialogOpen(false);
                    setSelectedPublicacion(null);
                  }}
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Publication Wizard Modal */}
      <Dialog open={showCreateModal} onOpenChange={(open) => {
        setShowCreateModal(open);
        if (!open) resetWizard();
      }}>
        <DialogContent className="max-w-4xl bg-white">
          <DialogHeader>
            <DialogTitle>Crear Nueva Publicación</DialogTitle>
            <DialogDescription>
              Las publicaciones de administradores se aprueban automáticamente
            </DialogDescription>
          </DialogHeader>
          
          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  wizardStep >= step ? 'bg-ucp-rojo text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-full h-1 mx-2 ${
                    wizardStep > step ? 'bg-ucp-rojo' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          {/* Step 1: Información Básica */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-4">Información Básica</h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <Input
                  placeholder="Título de la publicación"
                  value={newPublicacion.titulo}
                  onChange={(e) => setNewPublicacion({...newPublicacion, titulo: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                <Textarea
                  placeholder="Describe tu publicación..."
                  value={newPublicacion.descripcion}
                  onChange={(e) => setNewPublicacion({...newPublicacion, descripcion: e.target.value})}
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                  <Select value={newPublicacion.tipo} onValueChange={(value) => setNewPublicacion({...newPublicacion, tipo: value as any})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRODUCTO">Producto</SelectItem>
                      <SelectItem value="SERVICIO">Servicio</SelectItem>
                      <SelectItem value="EVENTO">Evento</SelectItem>
                      <SelectItem value="CONVOCATORIA">Convocatoria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                  <Select value={newPublicacion.categoriaId} onValueChange={(value) => setNewPublicacion({...newPublicacion, categoriaId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Detalles de Tipo */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-4">Detalles del Tipo</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                  <Input
                    type="number"
                    placeholder="0 = Gratis"
                    value={newPublicacion.precio}
                    onChange={(e) => setNewPublicacion({...newPublicacion, precio: e.target.value})}
                    disabled={newPublicacion.tipoPrecio === 'GRATIS'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Precio</label>
                  <Select value={newPublicacion.tipoPrecio} onValueChange={(value) => setNewPublicacion({...newPublicacion, tipoPrecio: value as any})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIJO">Fijo</SelectItem>
                      <SelectItem value="POR_HORA">Por Hora</SelectItem>
                      <SelectItem value="GRATIS">Gratis</SelectItem>
                      <SelectItem value="NEGOCIABLE">Negociable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Campos específicos para EVENTOS */}
              {newPublicacion.tipo === 'EVENTO' && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900">Campos específicos para Eventos</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del Evento *</label>
                      <Input
                        type="datetime-local"
                        value={newPublicacion.fechaEvento}
                        onChange={(e) => setNewPublicacion({...newPublicacion, fechaEvento: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cupos disponibles</label>
                      <Input
                        type="number"
                        placeholder="Número de cupos"
                        value={newPublicacion.cupos}
                        onChange={(e) => setNewPublicacion({...newPublicacion, cupos: e.target.value})}
                        min="1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación del Evento</label>
                    <Input
                      placeholder="Ej: Auditorio Principal, Campus Central"
                      value={newPublicacion.ubicacionEvento}
                      onChange={(e) => setNewPublicacion({...newPublicacion, ubicacionEvento: e.target.value})}
                    />
                  </div>
                </div>
              )}
              
              {/* Campos específicos para CONVOCATORIAS */}
              {newPublicacion.tipo === 'CONVOCATORIA' && (
                <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900">Campos específicos para Convocatorias</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Límite *</label>
                    <Input
                      type="datetime-local"
                      value={newPublicacion.fechaLimite}
                      onChange={(e) => setNewPublicacion({...newPublicacion, fechaLimite: e.target.value})}
                    />
                  </div>
                </div>
              )}
              
              {/* Campos específicos para PRODUCTOS/SERVICIOS */}
              {(newPublicacion.tipo === 'PRODUCTO' || newPublicacion.tipo === 'SERVICIO') && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900">Información de {newPublicacion.tipo === 'PRODUCTO' ? 'Producto' : 'Servicio'}</h4>
                  <div className="text-sm text-gray-600">
                    {newPublicacion.tipo === 'PRODUCTO' 
                      ? 'Para productos, puedes especificar precio y condiciones de venta.'
                      : 'Para servicios, puedes especificar precio por hora o tarifas fijas.'}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Step 3: Imágenes */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-4">Imágenes</h3>
                <p className="text-sm text-gray-600">Agrega imágenes para tu publicación (máximo 5 imágenes)</p>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Haz clic para subir o arrastra archivos
                      </span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        accept="image/*"
                        onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF hasta 5MB</p>
                  </div>
                </div>
              </div>
              
              {/* Preview de imágenes */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Step 4: Confirmación */}
          {wizardStep === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-4">Confirmar Publicación</h3>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Resumen de tu publicación:</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Título:</strong> {newPublicacion.titulo}</div>
                  <div><strong>Tipo:</strong> {newPublicacion.tipo}</div>
                  <div><strong>Descripción:</strong> {newPublicacion.descripcion}</div>
                  <div><strong>Precio:</strong> {newPublicacion.precio || 'Gratis'}</div>
                  {newPublicacion.tipo === 'EVENTO' && (
                    <>
                      <div><strong>Fecha Evento:</strong> {newPublicacion.fechaEvento}</div>
                      <div><strong>Ubicación:</strong> {newPublicacion.ubicacionEvento}</div>
                    </>
                  )}
                  {newPublicacion.tipo === 'CONVOCATORIA' && (
                    <div><strong>Fecha Límite:</strong> {newPublicacion.fechaLimite}</div>
                  )}
                  <div><strong>Imágenes:</strong> {uploadedImages.length} subidas</div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  Esta publicación será creada con estado <strong>APROBADA</strong> ya que eres administrador.
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            <div>
              {wizardStep > 1 && (
                <Button variant="outline" onClick={prevStep}>
                  Anterior
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                setShowCreateModal(false);
                resetWizard();
              }}>
                Cancelar
              </Button>
              
              {wizardStep < 4 ? (
                <Button
                  onClick={nextStep}
                  disabled={
                    (wizardStep === 1 && (!newPublicacion.titulo || !newPublicacion.descripcion || !newPublicacion.categoriaId)) ||
                    (wizardStep === 2 && newPublicacion.tipo === 'EVENTO' && !newPublicacion.fechaEvento) ||
                    (wizardStep === 2 && newPublicacion.tipo === 'CONVOCATORIA' && !newPublicacion.fechaLimite)
                  }
                  className="bg-ucp-rojo text-white hover:bg-red-600"
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  onClick={handleCreatePublicacion}
                  className="bg-ucp-rojo text-white hover:bg-red-600"
                >
                  Crear Publicación
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
