"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Heart, Share2, ShoppingCart, MapPin, Calendar, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { PublicationCard } from "@/components/marketplace/PublicationCard";
import { useCart } from "@/contexts/CartContext";
import { ContactButton } from "@/components/chat/ContactButton";

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
    facultad: string | null;
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

export default function PublicationDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Publicacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/publicaciones/${id}`);

        if (!response.ok) {
          throw new Error('Publicación no encontrada');
        }

        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error al cargar publicación:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-lg">Cargando publicación...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Publicación no encontrada</h2>
        <Link href="/explore">
          <Button className="bg-ucp-rojo text-white hover:bg-red-700 rounded-full">
            Volver al Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  const relatedProducts: Publicacion[] = []; // TODO: Implementar productos relacionados desde backend

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/explore">
            <Button variant="ghost" className="rounded-full -ml-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Marketplace
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div>
            <div className="bg-white rounded-xl overflow-hidden mb-4 aspect-square">
              <img
                src={product.medios && product.medios.length > 0 ? product.medios[selectedImage].url : "https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=800"}
                alt={product.titulo}
                className="w-full h-full object-cover"
              />
            </div>
            {product.medios && product.medios.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.medios.map((medio, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-ucp-rojo' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={medio.url} alt={`${product.titulo} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <Card className="border-0 shadow-lg rounded-xl">
              <CardContent className="p-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <Badge className="mb-3 bg-blue-600 text-white rounded-full">
                      {product.tipo === "PRODUCTO" ? "Producto" : product.tipo === "SERVICIO" ? "Servicio" : product.tipo === "EVENTO" ? "Evento" : "Convocatoria"}
                    </Badge>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {product.titulo}
                    </h1>
                    <Badge variant="outline" className="rounded-full">
                      {product.categoria.nombre}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={() => setIsFavorite(!isFavorite)}
                    >
                      <Heart className={`w-5 h-5 ${isFavorite ? 'fill-ucp-rojo text-ucp-rojo' : ''}`} />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-4xl font-bold text-ucp-rojo mb-1">
                    {product.precio ? formatPrice(product.precio) : "Gratis"}
                  </div>
                  {product.tipoPrecio === "POR_HORA" && (
                    <p className="text-gray-500">por hora</p>
                  )}
                  {product.tipoPrecio === "FIJO" && (
                    <p className="text-gray-500">precio fijo</p>
                  )}
                  {product.tipoPrecio === "NEGOCIABLE" && (
                    <p className="text-gray-500">negociable</p>
                  )}
                </div>

                <Separator className="my-6" />

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-5 h-5" />
                    <span>Publicado el {formatDate(product.creadoEn)}</span>
                  </div>
                  {product.autor.facultad && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-5 h-5" />
                      <span>{product.autor.facultad}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-ucp-verde">
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">Vendedor verificado UCP</span>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="mb-6">
                  <h2 className="font-semibold text-gray-900 mb-3">Descripción</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {product.descripcion || "Sin descripción"}
                  </p>
                </div>

                <Separator className="my-6" />

                {/* Seller Info */}
                <div className="mb-6">
                  <h2 className="font-semibold text-gray-900 mb-3">Vendedor</h2>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={product.autor.avatarUrl || ""} />
                      <AvatarFallback>{product.autor.nombre[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{product.autor.nombre}</h3>
                      <p className="text-sm text-gray-600">{product.autor.correo}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <ContactButton
                      vendorId={product.autor.id}
                      vendorName={product.autor.nombre}
                      label="Contactar vendedor"
                      className="w-full"
                    />
                    <Button
                      className="flex-1 bg-ucp-rojo text-white hover:bg-red-700 rounded-full"
                      onClick={() => {
                        addToCart({
                          id: product.id,
                          title: product.titulo,
                          price: product.precio || 0,
                          image: product.medios && product.medios.length > 0 ? product.medios[0].url : "",
                          category: product.tipo === "PRODUCTO" ? "product" : "service",
                          seller: {
                            name: product.autor.nombre,
                            faculty: product.autor.facultad || "",
                            phone: product.autor.telefono || "",
                          },
                          quantity: 1,
                        });
                      }}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {product.tipo === "PRODUCTO" ? "Agregar al carrito" : "Solicitar servicio"}
                    </Button>
                  </div>
                  <Button
                    className="w-full bg-green-600 text-white hover:bg-green-700 rounded-full"
                    onClick={() => {
                      const message = `Hola! Me interesa comprar "${product.titulo}" por ${product.precio ? formatPrice(product.precio) : "Gratis"}. ¿Está disponible?`;
                      const sellerPhone = product.autor.telefono || "573000000000";
                      const whatsappUrl = `https://wa.me/${sellerPhone}?text=${encodeURIComponent(message)}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                  >
                    Comprar por WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Productos similares
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <PublicationCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
