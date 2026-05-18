"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, Package, MessageCircle, Shield, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

export default function HomePage() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicaciones = async () => {
      try {
        const response = await fetch('/api/publicaciones?limit=4');
        const result = await response.json();
        setPublicaciones(result.data || []);
      } catch (error) {
        console.error('Error al cargar publicaciones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicaciones();
  }, []);

  const featuredProducts = publicaciones.filter(p => p.estado === "APROBADA").slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-ucp-rojo to-red-700 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Marketplace Universitario UCP
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-red-50">
              Compra, vende y ofrece servicios dentro de nuestra comunidad estudiantil
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/explore">
                <Button size="lg" className="bg-white text-ucp-rojo hover:bg-gray-100 rounded-full text-lg px-8">
                  <Search className="w-5 h-5 mr-2" />
                  Explorar Productos
                </Button>
              </Link>
              <Link href="/dashboard/student/publications/new">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-red-800 rounded-full text-lg px-8">
                  <Package className="w-5 h-5 mr-2" />
                  Publicar Ahora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-ucp-rojo mb-2">500+</div>
              <div className="text-gray-600">Productos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-ucp-rojo mb-2">1,200+</div>
              <div className="text-gray-600">Estudiantes</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-ucp-rojo mb-2">300+</div>
              <div className="text-gray-600">Servicios</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-ucp-rojo mb-2">4.8</div>
              <div className="text-gray-600">Calificación</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            ¿Por qué usar UCP Marketplace?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-0 shadow-lg rounded-xl">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-ucp-rojo" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Seguro y Confiable</h3>
                <p className="text-gray-600">
                  Solo estudiantes UCP verificados con correo institucional pueden participar
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg rounded-xl">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-ucp-rojo" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Comunicación Directa</h3>
                <p className="text-gray-600">
                  Chatea directamente con vendedores y compradores de forma segura
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg rounded-xl">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-ucp-rojo" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Comunidad UCP</h3>
                <p className="text-gray-600">
                  Apoya a tus compañeros estudiantes y fortalece la economía universitaria
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Publicaciones Destacadas
            </h2>
            <Link href="/explore">
              <Button variant="outline" className="rounded-full border-ucp-rojo text-ucp-rojo hover:bg-red-50">
                Ver todas
              </Button>
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">Cargando publicaciones...</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <PublicationCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Categorías Populares
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
            {["Tecnología", "Tutorías", "Comida", "Libros", "Diseño", "Deportes"].map((category) => (
              <Link key={category} href="/explore">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-0 rounded-xl">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Package className="w-6 h-6 text-ucp-rojo" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{category}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-ucp-rojo to-red-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Tienes algo para vender u ofrecer?
          </h2>
          <p className="text-xl text-red-50 mb-8 max-w-2xl mx-auto">
            Publica tus productos o servicios en minutos y llega a toda la comunidad UCP
          </p>
          <Link href="/dashboard/student/publications/new">
            <Button size="lg" className="bg-white text-ucp-rojo hover:bg-gray-100 rounded-full text-lg px-8">
              <TrendingUp className="w-5 h-5 mr-2" />
              Comenzar a Vender
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
