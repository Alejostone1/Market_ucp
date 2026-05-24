"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Heart, Share2, ShoppingCart, MapPin, Calendar, Shield, ArrowLeft, Flag, Users, Clock, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { PublicationCard } from "@/components/marketplace/PublicationCard";
import { ReportModal } from "@/components/marketplace/ReportModal";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
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
  const [showReport, setShowReport] = useState(false);
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { usuario } = useAuth();

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
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Link href="/explore">
            <Button variant="ghost" className="rounded-full -ml-2 text-sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Volver
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-12">
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
              <CardContent className="p-4 sm:p-6 lg:p-8">
                {/* Header: título + acciones */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <Badge className="mb-2 bg-blue-600 text-white rounded-full text-xs">
                      {product.tipo === "PRODUCTO" ? "Producto" : product.tipo === "SERVICIO" ? "Servicio" : product.tipo === "EVENTO" ? "Evento" : "Convocatoria"}
                    </Badge>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                      {product.titulo}
                    </h1>
                    <Badge variant="outline" className="rounded-full text-xs">
                      {product.categoria.nombre}
                    </Badge>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {product && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full w-9 h-9"
                        onClick={() => toggleFavorite(product)}
                      >
                        <Heart className={`w-4 h-4 ${isFavorite(product.id) ? 'fill-ucp-rojo text-ucp-rojo' : ''}`} />
                      </Button>
                    )}
                    <Button variant="outline" size="icon" className="rounded-full w-9 h-9">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    {/* Reportar — solo si no es publicación propia */}
                    {product && usuario?.id !== product.autor.id && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full w-9 h-9 text-gray-400 hover:text-[#881a1d] hover:border-[#881a1d]"
                        onClick={() => setShowReport(true)}
                        title="Reportar publicación"
                      >
                        <Flag className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Precio */}
                <div className="mb-5">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-ucp-rojo">
                    {product.precio ? formatPrice(product.precio) : "Gratis"}
                  </div>
                  {product.tipoPrecio === "POR_HORA" && <p className="text-sm text-gray-500">por hora</p>}
                  {product.tipoPrecio === "FIJO" && <p className="text-sm text-gray-500">precio fijo</p>}
                  {product.tipoPrecio === "NEGOCIABLE" && <p className="text-sm text-gray-500">negociable</p>}
                </div>

                <Separator className="my-4" />

                {/* Meta info */}
                <div className="space-y-2 mb-5 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>Publicado el {formatDate(product.creadoEn)}</span>
                  </div>
                  {product.autor.facultad && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span>{product.autor.facultad}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-ucp-verde">
                    <Shield className="w-4 h-4 shrink-0" />
                    <span className="font-medium">Vendedor verificado UCP</span>
                  </div>
                </div>

                {/* ── EVENTO / CONVOCATORIA specific details ────────────────── */}
                {product.tipo === "EVENTO" && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-3">
                      <h2 className="font-semibold text-gray-900">Detalles del evento</h2>

                      {product.fechaEvento && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Calendar className="w-4 h-4 shrink-0 text-ucp-rojo" />
                          <span>
                            <span className="font-medium">Fecha:</span>{" "}
                            {formatDate(product.fechaEvento)}
                          </span>
                        </div>
                      )}

                      {product.ubicacionEvento && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <MapPin className="w-4 h-4 shrink-0 text-ucp-rojo" />
                          <span>
                            <span className="font-medium">Lugar:</span>{" "}
                            {product.ubicacionEvento}
                          </span>
                        </div>
                      )}

                      {product.cupos !== null && product.cupos !== undefined && (
                        <div className="flex items-start gap-2 text-sm">
                          <Users className="w-4 h-4 shrink-0 mt-0.5 text-ucp-rojo" />
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="font-medium text-gray-700">Cupos disponibles</span>
                              <span className="font-semibold text-gray-900">
                                {Math.max(0, product.cupos - (product.cuposOcupados ?? 0))}{" "}
                                <span className="text-gray-400 font-normal">/ {product.cupos}</span>
                              </span>
                            </div>
                            {/* Capacity bar */}
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(100, ((product.cuposOcupados ?? 0) / product.cupos) * 100)}%`,
                                  backgroundColor:
                                    (product.cuposOcupados ?? 0) >= product.cupos
                                      ? "#dc2626"
                                      : (product.cuposOcupados ?? 0) / product.cupos > 0.8
                                      ? "#f59e0b"
                                      : "#16a34a",
                                }}
                              />
                            </div>
                            {(product.cuposOcupados ?? 0) >= product.cupos && (
                              <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                                <Ticket className="w-3 h-3" />
                                Evento sin cupos disponibles
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {product.tipo === "CONVOCATORIA" && product.fechaLimite && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <h2 className="font-semibold text-gray-900">Detalles de la convocatoria</h2>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Clock className="w-4 h-4 shrink-0 text-ucp-rojo" />
                        <span>
                          <span className="font-medium">Fecha límite:</span>{" "}
                          {formatDate(product.fechaLimite)}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <Separator className="my-4" />

                {/* Descripción */}
                <div className="mb-5">
                  <h2 className="font-semibold text-gray-900 mb-2">Descripción</h2>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    {product.descripcion || "Sin descripción"}
                  </p>
                </div>

                <Separator className="my-4" />

                {/* Vendedor */}
                <div className="mb-5">
                  <h2 className="font-semibold text-gray-900 mb-2">Vendedor</h2>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Avatar className="w-12 h-12 shrink-0">
                      <AvatarImage src={product.autor.avatarUrl || ""} />
                      <AvatarFallback>{product.autor.nombre[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{product.autor.nombre}</h3>
                      <p className="text-xs text-gray-500 truncate">{product.autor.correo}</p>
                    </div>
                  </div>
                </div>

                {/* Botones de acción — apilados en móvil */}
                <div className="flex flex-col gap-3">
                  <ContactButton
                    vendorId={product.autor.id}
                    vendorName={product.autor.nombre}
                    label="Contactar vendedor"
                    showIcon={true}
                    size="lg"
                    className="w-full justify-center"
                  />

                  {product.tipo !== "EVENTO" && product.tipo !== "CONVOCATORIA" && (
                    <Button
                      size="lg"
                      className="w-full bg-ucp-rojo text-white hover:bg-red-700 rounded-full"
                      onClick={async () => {
                        try {
                          const res = await fetch("/api/carrito", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ publicacionId: product.id, cantidad: 1 }),
                          });
                          if (res.ok) {
                            addToCart({
                              id: product.id,
                              title: product.titulo,
                              price: product.precio || 0,
                              image: product.medios?.[0]?.url || "",
                              category: product.tipo === "PRODUCTO" ? "product" : "service",
                              seller: { name: product.autor.nombre, faculty: product.autor.facultad || "", phone: product.autor.telefono || "" },
                              quantity: 1,
                            });
                          }
                        } catch { /* silent */ }
                      }}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {product.tipo === "PRODUCTO" ? "Agregar al carrito" : "Solicitar servicio"}
                    </Button>
                  )}

                  <Button
                    size="lg"
                    className="w-full bg-green-600 text-white hover:bg-green-700 rounded-full"
                    onClick={() => {
                      const message = `Hola! Me interesa "${product.titulo}" por ${product.precio ? formatPrice(product.precio) : "Gratis"}. ¿Está disponible?`;
                      const sellerPhone = product.autor.telefono || "573000000000";
                      window.open(`https://wa.me/${sellerPhone}?text=${encodeURIComponent(message)}`, '_blank');
                    }}
                  >
                    Contactar por WhatsApp
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

      {/* Modal de reporte */}
      {product && showReport && (
        <ReportModal
          publicacion={{
            id: product.id,
            titulo: product.titulo,
            autorNombre: product.autor.nombre,
            imagen: product.medios?.[0]?.url,
          }}
          open={showReport}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}
