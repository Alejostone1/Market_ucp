"use client";

import { useState, useEffect } from "react";
import { Search, AlertTriangle, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";

interface Reporte {
  id: string;
  motivo: string;
  descripcion: string | null;
  estado: string;
  creadoEn: string;
  reportante: {
    id: string;
    nombre: string;
    correo: string;
  };
  publicacion: {
    id: string;
    titulo: string;
    estado: string;
    autor: {
      id: string;
      nombre: string;
    };
  };
}

export default function AdminReportesPage() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [selectedReporte, setSelectedReporte] = useState<Reporte | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [nota, setNota] = useState("");
  const [eliminarPublicacion, setEliminarPublicacion] = useState(false);
  const [filterEstado, setFilterEstado] = useState("PENDIENTE");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportes = async () => {
      try {
        const params = new URLSearchParams({
          ...(filterEstado !== "todos" && { estado: filterEstado }),
        });

        const response = await fetch(`/api/admin/reportes?${params}`);
        if (response.ok) {
          const data = await response.json();
          setReportes(data.reportes);
        }
      } catch (error) {
        console.error('Error al cargar reportes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportes();
  }, [filterEstado]);

  const handleResolve = async (estado: "REVISADO" | "DESCARTADO") => {
    if (!selectedReporte) return;

    try {
      const response = await fetch('/api/admin/reportes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedReporte.id,
          estado,
          nota,
          eliminarPublicacion,
        }),
      });

      if (response.ok) {
        setReportes(reportes.filter(r => r.id !== selectedReporte.id));
        setIsDialogOpen(false);
        setNota("");
        setEliminarPublicacion(false);
        setSelectedReporte(null);
        toast.success(`Reporte ${estado === 'REVISADO' ? 'revisado' : 'descartado'} exitosamente`);
      } else {
        toast.error("Error al actualizar reporte");
      }
    } catch (error) {
      toast.error("Error al actualizar reporte");
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "REVISADO":
        return <Badge className="bg-ucp-verde text-white">Revisado</Badge>;
      case "DESCARTADO":
        return <Badge className="bg-gray-500 text-white">Descartado</Badge>;
      default:
        return <Badge className="bg-yellow-500 text-white">Pendiente</Badge>;
    }
  };

  const getMotivoLabel = (motivo: string) => {
    switch (motivo) {
      case "SPAM":
        return "Spam";
      case "CONTENIDO_INAPROPIADO":
        return "Contenido Inapropiado";
      case "INFORMACION_FALSA":
        return "Información Falsa";
      case "DUPLICADO":
        return "Duplicado";
      default:
        return "Otro";
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Reportes</h1>
      <p className="text-gray-600 mb-8">
        Revisa y resuelve los reportes de contenido
      </p>

      {/* Filters */}
      <Card className="border-0 shadow-lg rounded-xl mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="search"
                placeholder="Buscar por motivo o reportante..."
                className="pl-10 rounded-full"
                disabled
              />
            </div>

            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDIENTE">Pendientes</SelectItem>
                <SelectItem value="REVISADO">Revisados</SelectItem>
                <SelectItem value="DESCARTADO">Descartados</SelectItem>
                <SelectItem value="todos">Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      {loading ? (
        <div className="text-center py-16">
          <p className="text-gray-500">Cargando reportes...</p>
        </div>
      ) : reportes.length > 0 ? (
        <div className="space-y-4">
          {reportes.map((reporte) => (
            <Card key={reporte.id} className="border-0 shadow-lg rounded-xl hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {getMotivoLabel(reporte.motivo)}
                          </h3>
                          {getEstadoBadge(reporte.estado)}
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3">
                          {reporte.descripcion || "Sin descripción"}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                          <span>•</span>
                          <span>Reportante: {reporte.reportante.nombre}</span>
                          <span>•</span>
                          <span>{reporte.reportante.correo}</span>
                          <span>•</span>
                          <span>{new Date(reporte.creadoEn).toLocaleDateString()}</span>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Publicación reportada:</p>
                          <p className="text-sm text-gray-900">{reporte.publicacion.titulo}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Autor: {reporte.publicacion.autor.nombre} • Estado: {reporte.publicacion.estado}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/publication/${reporte.publicacion.id}`} target="_blank">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Ver Publicación
                          </Button>
                        </Link>
                        {reporte.estado === "PENDIENTE" && (
                          <Button
                            onClick={() => {
                              setSelectedReporte(reporte);
                              setIsDialogOpen(true);
                            }}
                            className="bg-ucp-rojo hover:bg-red-700 rounded-full"
                            size="sm"
                          >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Revisar
                          </Button>
                        )}
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
              <AlertTriangle className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay reportes
            </h3>
            <p className="text-gray-600">
              No se encontraron reportes con los filtros actuales
            </p>
          </CardContent>
        </Card>
      )}

      {/* Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revisar Reporte</DialogTitle>
            <DialogDescription>
              Resuelve este reporte y toma las acciones necesarias
            </DialogDescription>
          </DialogHeader>

          {selectedReporte && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Reporte:</p>
                <p className="text-sm text-gray-900">{getMotivoLabel(selectedReporte.motivo)}</p>
                {selectedReporte.descripcion && (
                  <p className="text-sm text-gray-600 mt-2">{selectedReporte.descripcion}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Nota de resolución</label>
                <Textarea
                  placeholder="Describe tu resolución..."
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="eliminar"
                  checked={eliminarPublicacion}
                  onChange={(e) => setEliminarPublicacion(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="eliminar" className="text-sm text-gray-700">
                  Eliminar publicación reportada
                </label>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setNota("");
                setEliminarPublicacion(false);
                setSelectedReporte(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleResolve("DESCARTADO")}
              variant="outline"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Descartar
            </Button>
            <Button
              onClick={() => handleResolve("REVISADO")}
              className="bg-ucp-verde hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Revisar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
