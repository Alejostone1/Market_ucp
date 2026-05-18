"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Upload, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Categoria {
  id: string;
  nombre: string;
}

interface Publicacion {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  precio: number | null;
  tipoPrecio: string | null;
  categoriaId: string;
  medios: {
    id: string;
    url: string;
  }[];
}

export default function EditPublicationPage() {
  const router = useRouter();
  const params = useParams();
  const { usuario } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    tipo: "PRODUCTO",
    precio: "",
    tipoPrecio: "FIJO",
    categoriaId: "",
  });
  const [medios, setMedios] = useState<File[]>([]);
  const [mediosExistentes, setMediosExistentes] = useState<{ id: string; url: string }[]>([]);
  const [mediosAEliminar, setMediosAEliminar] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [publicacionRes, categoriasRes] = await Promise.all([
          fetch(`/api/publicaciones/${params.id}`),
          fetch('/api/categorias'),
        ]);

        if (publicacionRes.ok && categoriasRes.ok) {
          const publicacion = await publicacionRes.json();
          const categoriasData = await categoriasRes.json();

          setCategorias(categoriasData);
          setFormData({
            titulo: publicacion.titulo,
            descripcion: publicacion.descripcion,
            tipo: publicacion.tipo,
            precio: publicacion.precio?.toString() || "",
            tipoPrecio: publicacion.tipoPrecio || "FIJO",
            categoriaId: publicacion.categoriaId,
          });
          setMediosExistentes(publicacion.medios || []);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('Error al cargar la publicación');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMediosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setMedios(prev => [...prev, ...files]);
    }
  };

  const handleRemoveMedio = (index: number) => {
    setMedios(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveMedioExistente = (id: string) => {
    setMediosAEliminar(prev => [...prev, id]);
    setMediosExistentes(prev => prev.filter(m => m.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario?.id) return;

    setSaving(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('titulo', formData.titulo);
      formDataToSend.append('descripcion', formData.descripcion);
      formDataToSend.append('tipo', formData.tipo);
      formDataToSend.append('categoriaId', formData.categoriaId);
      
      if (formData.precio) {
        formDataToSend.append('precio', formData.precio);
        formDataToSend.append('tipoPrecio', formData.tipoPrecio);
      }

      medios.forEach((file, index) => {
        formDataToSend.append(`medios`, file);
      });

      formDataToSend.append('mediosAEliminar', JSON.stringify(mediosAEliminar));

      const response = await fetch(`/api/usuarios/${usuario.id}/publicaciones/${params.id}`, {
        method: 'PATCH',
        body: formDataToSend,
      });

      if (response.ok) {
        toast.success('Publicación actualizada exitosamente');
        router.push('/dashboard/student/publications');
      } else {
        toast.error('Error al actualizar la publicación');
      }
    } catch (error) {
      console.error('Error al actualizar:', error);
      toast.error('Error al actualizar la publicación');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Cargando publicación...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver
      </Button>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Editar Publicación</h1>
      <p className="text-gray-600 mb-8">
        Actualiza la información de tu publicación
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-0 shadow-lg rounded-xl">
          <CardContent className="p-6 space-y-6">
            {/* Título */}
            <div>
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                required
                placeholder="Ej: Tutorías de Cálculo Diferencial"
                className="mt-2"
              />
            </div>

            {/* Descripción */}
            <div>
              <Label htmlFor="descripcion">Descripción *</Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                required
                placeholder="Describe tu producto o servicio..."
                rows={5}
                className="mt-2"
              />
            </div>

            {/* Tipo */}
            <div>
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRODUCTO">Producto</SelectItem>
                  <SelectItem value="SERVICIO">Servicio</SelectItem>
                  <SelectItem value="EVENTO">Evento</SelectItem>
                  <SelectItem value="CONVOCATORIA">Convocatoria</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Categoría */}
            <div>
              <Label htmlFor="categoria">Categoría *</Label>
              <Select
                value={formData.categoriaId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoriaId: value }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecciona la categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Precio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="precio">Precio (COP) *</Label>
                <Input
                  id="precio"
                  name="precio"
                  type="number"
                  value={formData.precio}
                  onChange={handleInputChange}
                  required
                  placeholder="25000"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="tipoPrecio">Tipo de precio</Label>
                <Select
                  value={formData.tipoPrecio}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, tipoPrecio: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIJO">Fijo</SelectItem>
                    <SelectItem value="NEGOCIABLE">Negociable</SelectItem>
                    <SelectItem value="GRATIS">Gratis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Imágenes */}
            <div>
              <Label>Imágenes</Label>
              <div className="mt-4 space-y-4">
                {/* Imágenes existentes */}
                {mediosExistentes.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {mediosExistentes.map((medio) => (
                      <div key={medio.id} className="relative group">
                        <img
                          src={medio.url}
                          alt="Imagen existente"
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveMedioExistente(medio.id)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Nuevas imágenes */}
                {medios.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {medios.map((medio, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(medio)}
                          alt={`Nueva imagen ${index + 1}`}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveMedio(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Botón para agregar imágenes */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    id="medios"
                    multiple
                    accept="image/*"
                    onChange={handleMediosChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="medios"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-gray-600">Haz clic para agregar imágenes</span>
                    <span className="text-sm text-gray-400">PNG, JPG hasta 5MB</span>
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="flex-1 bg-ucp-rojo hover:bg-red-700"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </div>
  );
}
