"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, X, Camera, Package, DollarSign, FileText, Tag } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewPublicationPage() {
  const [formData, setFormData] = useState({
    titulo: "",
    tipo: "PRODUCTO",
    categoria: "",
    precio: "",
    descripcion: "",
    imagenes: [] as File[],
  });
  
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categorias, setCategorias] = useState<Array<{id: string, nombre: string}>>([]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch('/api/categorias');
        if (response.ok) {
          const data = await response.json();
          setCategorias(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategorias();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.slice(0, 5); // Limitar a 5 imágenes
    
    setFormData(prev => ({ ...prev, imagenes: validFiles }));
    
    // Crear vistas previas
    const previews = validFiles.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index)
    }));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('titulo', formData.titulo);
      formDataToSend.append('tipo', formData.tipo);
      formDataToSend.append('categoria', formData.categoria);
      formDataToSend.append('precio', formData.precio);
      formDataToSend.append('descripcion', formData.descripcion);
      
      formData.imagenes.forEach((imagen) => {
        formDataToSend.append('imagenes', imagen);
      });

      const response = await fetch('/api/publicaciones', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        toast.success('Publicación creada exitosamente');
        window.location.href = '/dashboard/student/publications';
      } else {
        toast.error('Error al crear la publicación');
      }
    } catch (error) {
      toast.error('Error al crear la publicación');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/student/publications">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear Nueva Publicación</h1>
              <p className="text-gray-600">
                Publica tu producto, servicio o evento en el marketplace UCP
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-ucp-rojo rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">Información Básica</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Imágenes</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">3</span>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Revisión</span>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-ucp-rojo to-red-700 text-white">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Package className="w-6 h-6" />
              Información de la Publicación
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="titulo" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Título de la Publicación *
                    </Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                      placeholder="Ej: Calculadora científica Casio"
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo" className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Tipo de Publicación *
                    </Label>
                    <select 
                      id="tipo"
                      value={formData.tipo}
                      onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-ucp-rojo h-12"
                      required
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="PRODUCTO">📦 Producto</option>
                      <option value="SERVICIO">🛠️ Servicio</option>
                      <option value="EVENTO">📅 Evento</option>
                      <option value="CONVOCATORIA">📢 Convocatoria</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="categoria" className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Categoría *
                    </Label>
                    <select 
                      id="categoria"
                      value={formData.categoria}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-ucp-rojo h-12 bg-white"
                      required
                    >
                      <option value="">Selecciona una categoría</option>
                      {categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="precio" className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Precio *
                    </Label>
                    <Input
                      id="precio"
                      type="number"
                      value={formData.precio}
                      onChange={(e) => setFormData(prev => ({ ...prev, precio: e.target.value }))}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Descripción Detallada *
                  </Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                    placeholder="Describe tu producto, servicio o evento con detalles importantes como características, estado, condiciones, etc..."
                    rows={6}
                    className="resize-none"
                    required
                  />
                </div>
              </div>

              {/* Images Section */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2 text-lg font-semibold">
                  <Camera className="w-5 h-5" />
                  Imágenes de la Publicación
                  <span className="text-sm font-normal text-gray-500">(Máximo 5 imágenes)</span>
                </Label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {previewImages.length > 0 ? (
                      previewImages.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-ucp-rojo transition-colors">
                          <Plus className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">Agregar Imagen</span>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-ucp-rojo hover:bg-red-700 text-white rounded-full px-8 py-3 text-lg font-semibold flex-1 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Publicando...
                    </div>
                  ) : (
                    <>
                      <Package className="w-5 h-5 mr-2" />
                      Publicar Ahora
                    </>
                  )}
                </Button>
                
                <Link href="/dashboard/student/publications">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full px-8 py-3 text-lg font-semibold flex-1"
                  >
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
