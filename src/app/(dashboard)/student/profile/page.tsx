"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Star, MapPin, Calendar, MessageCircle, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicationCard } from "@/components/marketplace/PublicationCard";

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
    facultad: string;
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

export default function ProfilePage() {
  const { id } = useParams();
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicaciones = async () => {
      try {
        const response = await fetch('/api/publicaciones');
        const data = await response.json();
        setPublicaciones(data);
      } catch (error) {
        console.error('Error al cargar publicaciones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicaciones();
  }, []);

  const sellerProducts = publicaciones.filter(p => p.autor.id === id);
  const seller = sellerProducts[0]?.autor;

  if (!seller) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Perfil no encontrado</h2>
        <Link href="/explore">
          <Button className="bg-ucp-rojo hover:bg-red-700 rounded-full">
            Volver al Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  const activeProducts = sellerProducts.filter(p => p.estado === "APROBADA");
  const totalSales = 47;
  const memberSince = "Enero 2024";
  const rating = 4.8;

  return (
    <div>
      <div className="mb-6">
        <Link href="/explore">
          <Button variant="ghost" className="rounded-full -ml-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
      </div>

      {/* Profile Header */}
      <Card className="border-0 shadow-lg rounded-xl mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
              <AvatarImage src={seller.avatarUrl || undefined} />
              <AvatarFallback className="text-3xl">{seller.nombre[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {seller.nombre}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <MapPin className="w-5 h-5" />
                    <span>{seller.facultad}</span>
                  </div>
                  <div className="flex items-center gap-2 text-ucp-verde">
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">Estudiante verificado UCP</span>
                  </div>
                </div>

                <Link href="/dashboard/student/messages">
                  <Button className="bg-ucp-rojo hover:bg-red-700 rounded-full">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Enviar mensaje
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-ucp-rojo mb-1">{rating}</div>
                  <div className="text-sm text-gray-600">Calificación</div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.floor(rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-ucp-rojo mb-1">{totalSales}</div>
                  <div className="text-sm text-gray-600">Ventas</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-ucp-rojo mb-1">{activeProducts.length}</div>
                  <div className="text-sm text-gray-600">Publicaciones</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="text-sm text-gray-600">Miembro desde</div>
                  <div className="text-sm font-medium text-gray-900">{memberSince}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-6 bg-white border rounded-lg p-1">
          <TabsTrigger value="active" className="rounded-md">
            Publicaciones Activas ({activeProducts.length})
          </TabsTrigger>
          <TabsTrigger value="reviews" className="rounded-md">
            Reseñas (45)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {activeProducts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {activeProducts.map((product) => (
                <PublicationCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-lg rounded-xl">
              <CardContent className="p-16 text-center">
                <p className="text-gray-500">Este vendedor no tiene publicaciones activas</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reviews">
          <Card className="border-0 shadow-lg rounded-xl">
            <CardContent className="p-8">
              <div className="space-y-6">
                {[
                  {
                    id: 1,
                    author: "Ana García",
                    rating: 5,
                    comment: "Excelente vendedor, muy responsable. El producto llegó en perfectas condiciones.",
                    date: "Hace 2 días",
                  },
                  {
                    id: 2,
                    author: "Luis Martínez",
                    rating: 5,
                    comment: "Muy buen servicio de tutoría. Explica muy bien y es muy paciente.",
                    date: "Hace 1 semana",
                  },
                  {
                    id: 3,
                    author: "Sofia Ramírez",
                    rating: 4,
                    comment: "Buena atención, entregas a tiempo. Recomendado.",
                    date: "Hace 2 semanas",
                  },
                ].map((review) => (
                  <div key={review.id} className="border-b pb-6 last:border-b-0">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarFallback>{review.author[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{review.author}</h4>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
