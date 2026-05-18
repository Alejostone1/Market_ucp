"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Tag, Folder, BookOpen, Book, Laptop, Car, Home, Shirt, Package, Gamepad2, Music, Camera, Heart, Star, Coffee, Utensils, Dumbbell, Palette, GraduationCap, Briefcase, Plane, ShoppingBag, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  color: string;
  icono: string | null;
  descripcion: string | null;
  _count: {
    publicaciones: number;
  };
}

interface Etiqueta {
  id: string;
  nombre: string;
  usoCount: number;
}

export default function AdminCategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [isCategoriaDialogOpen, setIsCategoriaDialogOpen] = useState(false);
  const [isEtiquetaDialogOpen, setIsEtiquetaDialogOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [editingEtiqueta, setEditingEtiqueta] = useState<Etiqueta | null>(null);
  const [categoriaForm, setCategoriaForm] = useState({
    nombre: "",
    slug: "",
    color: "#EC4899",
    icono: "",
    descripcion: "",
  });
  const [etiquetaForm, setEtiquetaForm] = useState({
    nombre: "",
  });

  // Icon options for categories
  const iconOptions = [
    { name: "BookOpen", icon: BookOpen, label: "Libros" },
    { name: "Book", icon: Book, label: "Libro" },
    { name: "Laptop", icon: Laptop, label: "Tecnología" },
    { name: "Car", icon: Car, label: "Transporte" },
    { name: "Home", icon: Home, label: "Hogar" },
    { name: "Shirt", icon: Shirt, label: "Ropa" },
    { name: "Package", icon: Package, label: "Paquetes" },
    { name: "Gamepad2", icon: Gamepad2, label: "Juegos" },
    { name: "Music", icon: Music, label: "Música" },
    { name: "Camera", icon: Camera, label: "Fotografía" },
    { name: "Heart", icon: Heart, label: "Salud" },
    { name: "Star", icon: Star, label: "Estrellas" },
    { name: "Coffee", icon: Coffee, label: "Café" },
    { name: "Utensils", icon: Utensils, label: "Comida" },
    { name: "Dumbbell", icon: Dumbbell, label: "Deporte" },
    { name: "Palette", icon: Palette, label: "Arte" },
    { name: "GraduationCap", icon: GraduationCap, label: "Educación" },
    { name: "Briefcase", icon: Briefcase, label: "Trabajo" },
    { name: "Plane", icon: Plane, label: "Viajes" },
    { name: "ShoppingBag", icon: ShoppingBag, label: "Compras" },
    { name: "Smartphone", icon: Smartphone, label: "Celulares" },
  ];
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriasRes, etiquetasRes] = await Promise.all([
          fetch('/api/categorias'),
          fetch('/api/etiquetas'),
        ]);

        if (categoriasRes.ok) {
          const categoriasData = await categoriasRes.json();
          setCategorias(categoriasData);
        }

        if (etiquetasRes.ok) {
          const etiquetasData = await etiquetasRes.json();
          setEtiquetas(etiquetasData);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveCategoria = async () => {
    try {
      const url = editingCategoria ? `/api/categorias/${editingCategoria.id}` : '/api/categorias';
      const method = editingCategoria ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoriaForm),
      });

      if (response.ok) {
        toast.success(editingCategoria ? 'Categoría actualizada' : 'Categoría creada');
        setIsCategoriaDialogOpen(false);
        setCategoriaForm({ nombre: "", slug: "", color: "#EC4899", icono: "", descripcion: "" });
        setEditingCategoria(null);
        
        // Refetch categorias
        const categoriasRes = await fetch('/api/categorias');
        if (categoriasRes.ok) {
          setCategorias(await categoriasRes.json());
        }
      } else {
        toast.error('Error al guardar categoría');
      }
    } catch (error) {
      toast.error('Error al guardar categoría');
    }
  };

  const handleDeleteCategoria = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;

    try {
      const response = await fetch(`/api/categorias/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Categoría eliminada');
        setCategorias(categorias.filter(c => c.id !== id));
      } else {
        toast.error('Error al eliminar categoría');
      }
    } catch (error) {
      toast.error('Error al eliminar categoría');
    }
  };

  const handleSaveEtiqueta = async () => {
    try {
      const url = editingEtiqueta ? `/api/etiquetas/${editingEtiqueta.id}` : '/api/etiquetas';
      const method = editingEtiqueta ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(etiquetaForm),
      });

      if (response.ok) {
        toast.success(editingEtiqueta ? 'Etiqueta actualizada' : 'Etiqueta creada');
        setIsEtiquetaDialogOpen(false);
        setEtiquetaForm({ nombre: "" });
        setEditingEtiqueta(null);
        
        // Refetch etiquetas
        const etiquetasRes = await fetch('/api/etiquetas');
        if (etiquetasRes.ok) {
          setEtiquetas(await etiquetasRes.json());
        }
      } else {
        toast.error('Error al guardar etiqueta');
      }
    } catch (error) {
      toast.error('Error al guardar etiqueta');
    }
  };

  const handleDeleteEtiqueta = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta etiqueta?')) return;

    try {
      const response = await fetch(`/api/etiquetas/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Etiqueta eliminada');
        setEtiquetas(etiquetas.filter(e => e.id !== id));
      } else {
        toast.error('Error al eliminar etiqueta');
      }
    } catch (error) {
      toast.error('Error al eliminar etiqueta');
    }
  };

  const openCategoriaDialog = (categoria?: Categoria) => {
    if (categoria) {
      setEditingCategoria(categoria);
      setCategoriaForm({
        nombre: categoria.nombre,
        slug: categoria.slug,
        color: categoria.color,
        icono: categoria.icono || "",
        descripcion: categoria.descripcion || "",
      });
    } else {
      setEditingCategoria(null);
      setCategoriaForm({ nombre: "", slug: "", color: "#EC4899", icono: "", descripcion: "" });
    }
    setIsCategoriaDialogOpen(true);
  };

  const openEtiquetaDialog = (etiqueta?: Etiqueta) => {
    if (etiqueta) {
      setEditingEtiqueta(etiqueta);
      setEtiquetaForm({ nombre: etiqueta.nombre });
    } else {
      setEditingEtiqueta(null);
      setEtiquetaForm({ nombre: "" });
    }
    setIsEtiquetaDialogOpen(true);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Categorías y Etiquetas</h1>
      <p className="text-gray-600 mb-8">
        Gestiona las categorías y etiquetas del marketplace
      </p>

      <Tabs defaultValue="categorias" className="w-full">
        <TabsList className="mb-6 bg-white border rounded-lg p-1">
          <TabsTrigger value="categorias" className="rounded-md">
            <Folder className="w-4 h-4 mr-2" />
            Categorías ({categorias.length})
          </TabsTrigger>
          <TabsTrigger value="etiquetas" className="rounded-md">
            <Tag className="w-4 h-4 mr-2" />
            Etiquetas ({etiquetas.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categorias">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => openCategoriaDialog()}
              className="bg-ucp-rojo hover:bg-red-700 text-white rounded-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Categoría
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <p className="text-gray-500">Cargando categorías...</p>
            </div>
          ) : categorias.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorias.map((categoria) => (
                <Card key={categoria.id} className="border-0 shadow-lg rounded-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: categoria.color }}
                        >
                          <Folder className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{categoria.nombre}</CardTitle>
                          <p className="text-sm text-gray-500">{categoria.slug}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => openCategoriaDialog(categoria)}
                          variant="ghost"
                          size="icon"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteCategoria(categoria.id)}
                          variant="ghost"
                          size="icon"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {categoria.descripcion && (
                        <p className="text-sm text-gray-600">{categoria.descripcion}</p>
                      )}
                      <Badge variant="outline">
                        {categoria._count.publicaciones} publicaciones
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-lg rounded-xl">
              <CardContent className="p-16 text-center">
                <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hay categorías
                </h3>
                <p className="text-gray-600">
                  Crea la primera categoría para organizar las publicaciones
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="etiquetas">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => openEtiquetaDialog()}
              className="bg-ucp-rojo hover:bg-red-700 text-white rounded-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Etiqueta
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <p className="text-gray-500">Cargando etiquetas...</p>
            </div>
          ) : etiquetas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {etiquetas.map((etiqueta) => (
                <Card key={etiqueta.id} className="border-0 shadow-lg rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-ucp-rojo" />
                        <span className="font-medium">{etiqueta.nombre}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => openEtiquetaDialog(etiqueta)}
                          variant="ghost"
                          size="icon"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteEtiqueta(etiqueta.id)}
                          variant="ghost"
                          size="icon"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {etiqueta.usoCount} usos
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-lg rounded-xl">
              <CardContent className="p-16 text-center">
                <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hay etiquetas
                </h3>
                <p className="text-gray-600">
                  Crea la primera etiqueta para etiquetar las publicaciones
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Categoria Dialog */}
      <Dialog open={isCategoriaDialogOpen} onOpenChange={setIsCategoriaDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>
              {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
            </DialogTitle>
            <DialogDescription>
              {editingCategoria ? 'Edita los datos de la categoría' : 'Crea una nueva categoría'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={categoriaForm.nombre}
                onChange={(e) => setCategoriaForm({ ...categoriaForm, nombre: e.target.value })}
                placeholder="Ej: Libros"
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={categoriaForm.slug}
                onChange={(e) => setCategoriaForm({ ...categoriaForm, slug: e.target.value })}
                placeholder="Ej: libros"
              />
            </div>

            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                type="color"
                value={categoriaForm.color}
                onChange={(e) => setCategoriaForm({ ...categoriaForm, color: e.target.value })}
                className="h-10 w-full"
              />
            </div>

            <div>
              <Label>Selecciona un Icono</Label>
              <div className="grid grid-cols-6 gap-2 mt-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
                {iconOptions.map((option) => {
                  const IconComponent = option.icon;
                  const isSelected = categoriaForm.icono === option.name;
                  return (
                    <button
                      key={option.name}
                      type="button"
                      onClick={() => setCategoriaForm({ ...categoriaForm, icono: option.name })}
                      className={`p-3 rounded-lg border-2 transition-all hover:scale-110 ${
                        isSelected
                          ? 'border-ucp-rojo bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      title={option.label}
                    >
                      <IconComponent className={`w-5 h-5 ${isSelected ? 'text-ucp-rojo' : 'text-gray-600'}`} />
                    </button>
                  );
                })}
              </div>
              {categoriaForm.icono && (
                <p className="text-sm text-gray-600 mt-2">
                  Icono seleccionado: <span className="font-medium">{categoriaForm.icono}</span>
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción (opcional)</Label>
              <Textarea
                id="descripcion"
                value={categoriaForm.descripcion}
                onChange={(e) => setCategoriaForm({ ...categoriaForm, descripcion: e.target.value })}
                placeholder="Describe esta categoría..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCategoriaDialogOpen(false);
                setCategoriaForm({ nombre: "", slug: "", color: "#EC4899", icono: "", descripcion: "" });
                setEditingCategoria(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveCategoria}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Etiqueta Dialog */}
      <Dialog open={isEtiquetaDialogOpen} onOpenChange={setIsEtiquetaDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>
              {editingEtiqueta ? 'Editar Etiqueta' : 'Nueva Etiqueta'}
            </DialogTitle>
            <DialogDescription>
              {editingEtiqueta ? 'Edita el nombre de la etiqueta' : 'Crea una nueva etiqueta'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="etiqueta-nombre">Nombre</Label>
              <Input
                id="etiqueta-nombre"
                value={etiquetaForm.nombre}
                onChange={(e) => setEtiquetaForm({ nombre: e.target.value })}
                placeholder="Ej: Matemáticas"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEtiquetaDialogOpen(false);
                setEtiquetaForm({ nombre: "" });
                setEditingEtiqueta(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveEtiqueta}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
