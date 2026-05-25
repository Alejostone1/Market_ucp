"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Star, MapPin, Calendar, Shield, ArrowLeft, Edit, Save, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicationCard } from "@/components/marketplace/PublicationCard";
import { useAuth } from "@/contexts/AuthContext";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Publicacion {
  id:          string;
  titulo:      string;
  descripcion: string;
  tipo:        string;
  estado:      string;
  precio:      number | null;
  tipoPrecio:  string | null;
  categoria: { id: string; nombre: string; slug: string; color: string };
  autor: {
    id:       string;
    nombre:   string;
    correo:   string;
    avatarUrl: string | null;
    telefono:  string | null;
    facultad:  string;
  };
  medios: { id: string; url: string; tipo: string; orden: number; altText: string | null }[];
  etiquetas: { etiqueta: { nombre: string } }[];
  creadoEn:        string;
  fechaEvento:     string | null;
  ubicacionEvento: string | null;
  cupos:           number | null;
  cuposOcupados:   number | null;
  fechaLimite:     string | null;
}

export default function ProfilePage() {
  const { usuario, updateUsuario } = useAuth();
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [editing,       setEditing]       = useState(false);
  const [saving,        setSaving]        = useState(false);

  const [formData, setFormData] = useState({
    nombre:   "",
    telefono: "",
    facultad: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!usuario?.id) return;
      try {
        const response = await fetch(`/api/usuarios/${usuario.id}/publicaciones`);
        const result   = await response.json();
        setPublicaciones(result.data || []);
        setFormData({
          nombre:   usuario.nombre            ?? "",
          telefono: (usuario.telefono as string | null) ?? "",
          facultad: usuario.facultad          ?? "",
        });
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.id]);

  // ── Guardar perfil ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!usuario?.id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/usuarios/${usuario.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          nombre:   formData.nombre.trim()   || undefined,
          telefono: formData.telefono.trim() || null,
          facultad: formData.facultad.trim() || null,
        }),
      });

      if (!res.ok) throw new Error();

      // Propagar cambios al AuthContext
      updateUsuario({
        nombre:   formData.nombre.trim()   || usuario.nombre,
        telefono: formData.telefono.trim() || null,
        facultad: formData.facultad.trim() || null,
      });

      toast.success("Perfil actualizado");
      setEditing(false);
    } catch {
      toast.error("Error al actualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  const activeProducts = publicaciones.filter(
    (p) => p.autor.id === usuario?.id && p.estado === "APROBADA"
  );

  const memberSince = "—";

  if (loading) {
    return <div className="text-center py-16"><p className="text-gray-500">Cargando perfil...</p></div>;
  }

  if (!usuario) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Perfil no encontrado</h2>
        <Link href="/explore">
          <Button className="bg-ucp-rojo hover:bg-red-700 rounded-full">Volver al Marketplace</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard/student">
          <Button variant="ghost" className="rounded-full -ml-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
      </div>

      {/* ── Profile Header ─────────────────────────────────────────────────────── */}
      <Card className="border-0 shadow-lg rounded-xl mb-6">
        <CardContent className="p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">

            {/* Avatar con upload */}
            <div className="self-start">
              <AvatarUpload
                currentUrl={usuario.avatarUrl}
                name={usuario.nombre}
                usuarioId={usuario.id}
                size="lg"
                onSuccess={(newUrl) => updateUsuario({ avatarUrl: newUrl || null })}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 truncate">
                    {usuario.nombre}
                  </h1>
                  {usuario.facultad && (
                    <div className="flex items-center gap-2 text-gray-600 mb-1.5 text-sm">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span className="truncate">{usuario.facultad}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-ucp-verde text-sm">
                    <Shield className="w-4 h-4 shrink-0" />
                    <span className="font-medium">
                      {usuario.rol === "ALIADO" ? "Aliado verificado UCP" : "Estudiante verificado UCP"}
                    </span>
                  </div>
                  {usuario.verificado && (
                    <Badge className="mt-2 bg-green-100 text-green-700 border-green-200 border font-medium text-xs">
                      Cuenta verificada
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2 shrink-0">
                  {editing ? (
                    <>
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-ucp-rojo hover:bg-red-700 rounded-full text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? "Guardando..." : "Guardar"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditing(false)}
                        disabled={saving}
                        className="rounded-full"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setEditing(true)}
                      className="bg-ucp-rojo hover:bg-red-700 rounded-full text-white"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar perfil
                    </Button>
                  )}
                </div>
              </div>

              {/* ── Formulario de edición ────────────────────────────────────────── */}
              {editing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="nombre">Nombre completo</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      placeholder="+57 300 000 0000"
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="facultad">Facultad / Programa</Label>
                    <Input
                      id="facultad"
                      value={formData.facultad}
                      onChange={(e) => setFormData({ ...formData, facultad: e.target.value })}
                      placeholder="Ej: Ingeniería de Sistemas"
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                /* ── Stats ──────────────────────────────────────────────────────── */
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6">
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Calificación</div>
                    <div className="text-sm font-semibold text-gray-900 mt-0.5">Sin reseñas</div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-ucp-rojo mb-0.5">
                      {activeProducts.length}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Publicaciones</div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center col-span-2 md:col-span-1">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Miembro desde</div>
                    <div className="text-xs sm:text-sm font-medium text-gray-900 mt-0.5">{memberSince}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Publicaciones ─────────────────────────────────────────────────────── */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="bg-white border rounded-lg p-1">
          <TabsTrigger value="active" className="rounded-md text-xs sm:text-sm">
            Publicaciones activas ({activeProducts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {activeProducts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {activeProducts.map((product) => (
                <PublicationCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-lg rounded-xl">
              <CardContent className="p-8 sm:p-14 text-center">
                <p className="text-gray-500 text-sm">No tienes publicaciones activas</p>
                <Link href="/dashboard/student/publications/new" className="mt-4 inline-block">
                  <Button className="bg-ucp-rojo hover:bg-red-700 rounded-full text-white">
                    Crear publicación
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
