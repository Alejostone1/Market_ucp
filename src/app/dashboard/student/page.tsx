"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LayoutDashboard, Package, MessageSquare, User, ArrowRight, Search, Filter, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { PublicationCard } from "@/components/marketplace/PublicationCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    slug: string;
    color: string;
  };
  autor: {
    id: string;
    nombre: string;
    correo: string;
    avatarUrl: string | null;
    telefono: string | null;
  };
  medios: {
    id: string;
    url: string;
    tipo: string;
    orden: number;
    altText: string | null;
  }[];
  etiquetas: {
    etiqueta: {
      nombre: string;
    };
  }[];
  creadoEn: string;
  fechaEvento: string | null;
  ubicacionEvento: string | null;
  cupos: number | null;
  cuposOcupados: number | null;
  fechaLimite: string | null;
}

interface Mensaje {
  id: string;
  contenido: string;
  creadoEn: string;
  remitente: {
    nombre: string;
  };
}

export default function StudentDashboardPage() {
  const { usuario, logout, isLoggingOut } = useAuth();
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [marketplacePublicaciones, setMarketplacePublicaciones] = useState<Publicacion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!usuario?.id) return;

      try {
        // Obtener publicaciones del estudiante
        const pubResponse = await fetch(`/api/usuarios/${usuario.id}/publicaciones`);
        if (pubResponse.ok) {
          const pubData = await pubResponse.json();
          setPublicaciones(pubData);
        }

        // Obtener mensajes del estudiante
        const msgResponse = await fetch(`/api/usuarios/${usuario.id}/mensajes`);
        if (msgResponse.ok) {
          const msgData = await msgResponse.json();
          setMensajes(msgData);
        }

        // Obtener publicaciones del marketplace
        const marketplaceResponse = await fetch('/api/publicaciones?limit=8');
        if (marketplaceResponse.ok) {
          const marketplaceData = await marketplaceResponse.json();
          setMarketplacePublicaciones(marketplaceData.data || []);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [usuario?.id]);

  const publicacionesActivas = publicaciones.filter(p => p.estado === "APROBADA").length;
  const mensajesNuevos = mensajes.length;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Bienvenido, {usuario?.nombre || 'Estudiante'}
      </h1>
      <p className="text-gray-600 mb-8">
        Resumen de tu actividad en UCP Marketplace
      </p>

      {loading ? (
        <div className="text-center py-16">
          <p className="text-gray-500">Cargando datos...</p>
        </div>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-0 shadow-lg rounded-xl hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-ucp-rojo" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{publicaciones.length}</div>
                    <div className="text-gray-600">Publicaciones</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg rounded-xl hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{mensajesNuevos}</div>
                    <div className="text-gray-600">Mensajes</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg rounded-xl hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-ucp-verde" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{publicacionesActivas}</div>
                    <div className="text-gray-600">Activas</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg rounded-xl mb-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones rápidas</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/dashboard/student/publications/new">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-ucp-rojo" />
                      <span className="font-medium text-gray-900">Nueva publicación</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
                <Link href="/dashboard/student/messages">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900">Ver mensajes</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
                <Link href="/dashboard/student/publications">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <LayoutDashboard className="w-5 h-5 text-ucp-verde" />
                      <span className="font-medium text-gray-900">Mis publicaciones</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
                <button
                  onClick={logout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center justify-between p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    {isLoggingOut ? (
                      <>
                        <Loader2 className="w-5 h-5 text-red-600 animate-spin" />
                        <span className="font-medium text-red-900">Cerrando sesión...</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="w-5 h-5 text-red-600" />
                        <span className="font-medium text-red-900">Cerrar sesión</span>
                      </>
                    )}
                  </div>
                  <ArrowRight className="w-5 h-5 text-red-400" />
                </button>
                <Link href="/dashboard/student/profile">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium text-gray-900">Editar perfil</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-lg rounded-xl">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Actividad reciente</h2>
              {mensajes.length > 0 ? (
                <div className="space-y-3">
                  {mensajes.slice(0, 5).map((mensaje) => (
                    <div key={mensaje.id} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      <span className="text-gray-700">
                        Mensaje de {mensaje.remitente.nombre}: "{mensaje.contenido.substring(0, 50)}..."
                      </span>
                      <span className="text-gray-500 ml-auto">
                        {new Date(mensaje.creadoEn).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No hay actividad reciente</p>
              )}
            </CardContent>
          </Card>

          {/* Marketplace Section */}
          <Card className="border-0 shadow-lg rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Marketplace UCP</h2>
                <Link href="/dashboard/student/marketplace">
                  <Button variant="outline" className="rounded-full border-ucp-rojo text-ucp-rojo hover:bg-red-50">
                    Ver todos
                  </Button>
                </Link>
              </div>

              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="search"
                  placeholder="Buscar productos, servicios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 w-full rounded-full border-gray-300"
                />
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Cargando marketplace...</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {marketplacePublicaciones
                    .filter(p => 
                      p.estado === "APROBADA" && 
                      (p.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       p.descripcion.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .slice(0, 8)
                    .map((product) => (
                      <PublicationCard key={product.id} product={product} />
                    ))}
                </div>
              )}

              {marketplacePublicaciones.filter(p => 
                p.estado === "APROBADA" && 
                (p.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 p.descripcion.toLowerCase().includes(searchQuery.toLowerCase()))
              ).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    {searchQuery ? 'No se encontraron resultados para tu búsqueda' : 'No hay publicaciones en el marketplace'}
                  </p>
                  {searchQuery && (
                    <Button
                      onClick={() => setSearchQuery("")}
                      variant="outline"
                      className="rounded-full"
                    >
                      Limpiar búsqueda
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
