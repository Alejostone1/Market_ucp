"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Shield, MapPin, Calendar, Mail, Phone, Star, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  facultad: string | null;
  avatarUrl: string | null;
  telefono: string | null;
  bloqueado: boolean;
  verificado: boolean;
  creadoEn: string;
  _count: {
    publicaciones: number;
  };
}

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
  medios: {
    id: string;
    url: string;
  }[];
  creadoEn: string;
}

export default function AdminUserProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user details
        const userResponse = await fetch(`/api/admin/usuarios/${id}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUsuario(userData);
        }

        // Fetch user publications
        const pubsResponse = await fetch(`/api/admin/usuarios/${id}/publicaciones`);
        if (pubsResponse.ok) {
          const pubsData = await pubsResponse.json();
          setPublicaciones(pubsData);
        }
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Cargando perfil del usuario...</p>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Usuario no encontrado</h2>
        <Button onClick={() => router.back()} className="bg-ucp-rojo hover:bg-red-700 rounded-full">
          Volver
        </Button>
      </div>
    );
  }

  const getRolBadge = (rol: string) => {
    switch (rol) {
      case "ADMIN":
        return <Badge className="bg-purple-600 text-white">Admin</Badge>;
      case "ALIADO":
        return <Badge className="bg-blue-600 text-white">Aliado</Badge>;
      default:
        return <Badge className="bg-green-600 text-white">Estudiante</Badge>;
    }
  };

  const getEstadoBadge = (bloqueado: boolean, verificado: boolean) => {
    if (bloqueado) {
      return <Badge className="bg-red-600 text-white">Bloqueado</Badge>;
    }
    if (verificado) {
      return <Badge className="bg-ucp-verde text-white">Verificado</Badge>;
    }
    return <Badge variant="outline">No verificado</Badge>;
  };

  const formatPrice = (price: number | null) => {
    if (!price) return "Gratis";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(Number(price));
  };

  const activePublications = publicaciones.filter(p => p.estado === "APROBADA");
  const pendingPublications = publicaciones.filter(p => p.estado === "PENDIENTE");
  const rejectedPublications = publicaciones.filter(p => p.estado === "RECHAZADA");

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Button 
          onClick={() => router.back()} 
          variant="ghost" 
          className="rounded-full -ml-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Usuarios
        </Button>
      </div>

      {/* Profile Header */}
      <Card className="border-0 shadow-lg rounded-xl mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
              <AvatarImage src={usuario.avatarUrl || undefined} />
              <AvatarFallback className="text-3xl">{usuario.nombre[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {usuario.nombre}
                  </h1>
                  <div className="flex items-center gap-4 mb-2">
                    {getRolBadge(usuario.rol)}
                    {getEstadoBadge(usuario.bloqueado, usuario.verificado)}
                  </div>
                  
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{usuario.correo}</span>
                    </div>
                    {usuario.telefono && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{usuario.telefono}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{usuario.facultad || 'Sin facultad'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Miembro desde: {new Date(usuario.creadoEn).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-ucp-rojo mb-1">{usuario._count.publicaciones}</div>
                  <div className="text-sm text-gray-600">Total Publicaciones</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">{activePublications.length}</div>
                  <div className="text-sm text-gray-600">Activas</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">{pendingPublications.length}</div>
                  <div className="text-sm text-gray-600">Pendientes</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600 mb-1">{rejectedPublications.length}</div>
                  <div className="text-sm text-gray-600">Rechazadas</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Publications Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-6 bg-white border rounded-lg p-1">
          <TabsTrigger value="active" className="rounded-md">
            Activas ({activePublications.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="rounded-md">
            Pendientes ({pendingPublications.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="rounded-md">
            Rechazadas ({rejectedPublications.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="rounded-md">
            Todas ({publicaciones.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {activePublications.length > 0 ? (
            <div className="space-y-4">
              {activePublications.map((pub) => (
                <Card key={pub.id} className="border-0 shadow-lg rounded-xl">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img
                        src={pub.medios[0]?.url || "/placeholder.jpg"}
                        alt={pub.titulo}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">{pub.titulo}</h3>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-2">{pub.descripcion}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="font-medium text-ucp-rojo">{formatPrice(pub.precio)}</span>
                              <Badge variant="outline" style={{ borderColor: pub.categoria.color, color: pub.categoria.color }}>
                                {pub.categoria.nombre}
                              </Badge>
                              <span className="text-gray-500">{new Date(pub.creadoEn).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Activa</Badge>
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
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay publicaciones activas</h3>
                <p className="text-gray-600">Este usuario no tiene publicaciones activas actualmente.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pending">
          {pendingPublications.length > 0 ? (
            <div className="space-y-4">
              {pendingPublications.map((pub) => (
                <Card key={pub.id} className="border-0 shadow-lg rounded-xl">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img
                        src={pub.medios[0]?.url || "/placeholder.jpg"}
                        alt={pub.titulo}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">{pub.titulo}</h3>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-2">{pub.descripcion}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="font-medium text-ucp-rojo">{formatPrice(pub.precio)}</span>
                              <Badge variant="outline" style={{ borderColor: pub.categoria.color, color: pub.categoria.color }}>
                                {pub.categoria.nombre}
                              </Badge>
                              <span className="text-gray-500">{new Date(pub.creadoEn).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
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
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay publicaciones pendientes</h3>
                <p className="text-gray-600">Este usuario no tiene publicaciones pendientes de revisión.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rejected">
          {rejectedPublications.length > 0 ? (
            <div className="space-y-4">
              {rejectedPublications.map((pub) => (
                <Card key={pub.id} className="border-0 shadow-lg rounded-xl">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img
                        src={pub.medios[0]?.url || "/placeholder.jpg"}
                        alt={pub.titulo}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">{pub.titulo}</h3>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-2">{pub.descripcion}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="font-medium text-ucp-rojo">{formatPrice(pub.precio)}</span>
                              <Badge variant="outline" style={{ borderColor: pub.categoria.color, color: pub.categoria.color }}>
                                {pub.categoria.nombre}
                              </Badge>
                              <span className="text-gray-500">{new Date(pub.creadoEn).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Badge className="bg-red-100 text-red-800">Rechazada</Badge>
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
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay publicaciones rechazadas</h3>
                <p className="text-gray-600">Este usuario no tiene publicaciones rechazadas.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all">
          {publicaciones.length > 0 ? (
            <div className="space-y-4">
              {publicaciones.map((pub) => (
                <Card key={pub.id} className="border-0 shadow-lg rounded-xl">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img
                        src={pub.medios[0]?.url || "/placeholder.jpg"}
                        alt={pub.titulo}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">{pub.titulo}</h3>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-2">{pub.descripcion}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="font-medium text-ucp-rojo">{formatPrice(pub.precio)}</span>
                              <Badge variant="outline" style={{ borderColor: pub.categoria.color, color: pub.categoria.color }}>
                                {pub.categoria.nombre}
                              </Badge>
                              <span className="text-gray-500">{new Date(pub.creadoEn).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Badge className={
                            pub.estado === "APROBADA" ? "bg-green-100 text-green-800" :
                            pub.estado === "PENDIENTE" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }>
                            {pub.estado === "APROBADA" ? "Activa" :
                             pub.estado === "PENDIENTE" ? "Pendiente" : "Rechazada"}
                          </Badge>
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
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay publicaciones</h3>
                <p className="text-gray-600">Este usuario no tiene ninguna publicación.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
