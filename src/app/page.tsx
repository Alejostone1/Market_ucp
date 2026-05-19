"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, Package, MessageCircle, Shield, Users } from "lucide-react";
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

interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  color: string;
  icono: string | null;
  descripcion: string | null;
}

export default function HomePage() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const fetchData = async () => {
      try {
        const [pubsResponse, catsResponse] = await Promise.all([
          fetch('/api/publicaciones'),
          fetch('/api/categorias'),
        ]);

        const pubsResult = await pubsResponse.json();
        const catsData = await catsResponse.json();

        setPublicaciones(pubsResult.data?.slice(0, 4) || []); // Mostrar solo las primeras 4
        setCategorias(catsData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mounted]);

  return (
    <div suppressHydrationWarning>
      {/* Hero Section - Modern Design */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-ucp-rojo via-red-600 to-red-800"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-ucp-naranja/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-ucp-amarillo/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 animate-pulse delay-500"></div>
        </div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 pt-20 pb-16">
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <div className="flex justify-center mb-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-medium text-white/90">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Conectando a más de 1,200 estudiantes UCP</span>
              </div>
            </div>
            
            {/* Main Title */}
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
                <span className="block text-white drop-shadow-lg animate-fade-in-up">Marketplace</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-ucp-amarillo to-ucp-naranja drop-shadow-lg animate-fade-in-up delay-200">
                  Universitario UCP
                </span>
              </h1>
              
              {/* Subtitle with gradient text */}
              <p className="text-xl md:text-2xl lg:text-3xl font-light text-white/90 mb-4 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-300">
                Compra, vende y ofrece servicios dentro de nuestra comunidad estudiantil
              </p>
              
              {/* Enhanced description */}
              <p className="text-lg text-white/70 max-w-2xl mx-auto animate-fade-in-up delay-400">
                La plataforma segura y confiable donde los estudiantes de la UCP conectan, negocian y prosperan juntos
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-fade-in-up delay-500">
              <Link href="/explore">
                <Button size="lg" className="group relative bg-white text-ucp-rojo hover:bg-gray-50 rounded-full text-lg px-10 py-4 font-bold shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105 border-2 border-white/20">
                  <Search className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                  Explorar Productos
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </Button>
              </Link>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto animate-fade-in-up delay-600">
              <div className="text-center group">
                <div className="text-3xl md:text-4xl font-black text-white mb-2 group-hover:scale-110 transition-transform">500+</div>
                <div className="text-white/70 text-sm font-medium">Productos Activos</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl md:text-4xl font-black text-white mb-2 group-hover:scale-110 transition-transform">1.2K+</div>
                <div className="text-white/70 text-sm font-medium">Estudiantes</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl md:text-4xl font-black text-white mb-2 group-hover:scale-110 transition-transform">300+</div>
                <div className="text-white/70 text-sm font-medium">Servicios</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl md:text-4xl font-black text-white mb-2 group-hover:scale-110 transition-transform">4.8★</div>
                <div className="text-white/70 text-sm font-medium">Calificación</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-4 text-center py-16">
                <p className="text-gray-500 text-lg">Cargando publicaciones...</p>
              </div>
            ) : (
              publicaciones.map((product: Publicacion) => (
                <PublicationCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explora por Categoría
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Descubre productos, servicios, eventos y oportunidades en las diferentes áreas de nuestra comunidad universitaria
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
            {categorias.map((categoria, index) => (
              <Link
                key={categoria.id}
                href={`/explore?categoria=${categoria.slug}`}
                className="group"
              >
                <div
                  className="relative overflow-hidden rounded-2xl border-2 border-gray-100 hover:border-ucp-rojo transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white group-hover:from-ucp-rojo/5 group-hover:to-red-50 transition-all duration-300"
                  ></div>
                  <div className="relative p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-ucp-rojo group-hover:to-red-700 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg">
                      <Package
                        className="w-8 h-8 text-gray-600 group-hover:text-white transition-colors duration-300"
                      />
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-ucp-rojo transition-colors duration-300 text-lg">
                      {categoria.nombre}
                    </h3>
                    <div className="mt-3 h-1 w-0 group-hover:w-full bg-ucp-rojo transition-all duration-300 rounded-full"></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .delay-200 {
          animation-delay: 200ms;
        }
        
        .delay-300 {
          animation-delay: 300ms;
        }
        
        .delay-400 {
          animation-delay: 400ms;
        }
        
        .delay-500 {
          animation-delay: 500ms;
        }
        
        .delay-600 {
          animation-delay: 600ms;
        }
        
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-ucp-rojo via-red-600 to-red-700"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Únete a la comunidad estudiantil más activa de la UCP
            </h2>
            <p className="text-xl text-red-50 mb-8 leading-relaxed">
              Compra, vende y ofrece servicios dentro de nuestra comunidad. Conecta con compañeros estudiantes y aprovecha oportunidades exclusivas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="bg-white text-ucp-rojo hover:bg-gray-100 rounded-full text-lg px-10 py-6 font-semibold shadow-lg hover:shadow-xl transition-all">
                  Registrarse Ahora
                </Button>
              </Link>
              <Link href="/explore">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 rounded-full text-lg px-10 py-6 font-semibold transition-all">
                  Explorar Marketplace
                </Button>
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">12+</div>
                <div className="text-red-200 text-sm">Categorías</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">500+</div>
                <div className="text-red-200 text-sm">Usuarios</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">24/7</div>
                <div className="text-red-200 text-sm">Disponible</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
