"use client";

import Link from "next/link";
import { Heart, MapPin, Calendar, Clock, Users, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
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

interface ProductCardProps {
  product: Publicacion;
}

export function PublicationCard({ product }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.tipo === "EVENTO" || product.tipo === "CONVOCATORIA") {
      toast.error("No puedes agregar eventos o convocatorias al carrito");
      return;
    }

    setIsAddingToCart(true);
    try {
      const res = await fetch("/api/carrito", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicacionId: product.id, cantidad: 1 }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Error al agregar al carrito");
        return;
      }
      addToCart({
        id: product.id,
        title: product.titulo,
        price: product.precio || 0,
        image: product.medios?.[0]?.url || "",
        category: product.tipo === "SERVICIO" ? "service" : "product",
        seller: {
          name: product.autor?.nombre || "Vendedor",
          faculty: "UCP",
          phone: product.autor?.telefono || undefined,
        },
        quantity: 1,
      });
    } catch {
      toast.error("Error al agregar al carrito");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return "Gratis";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case "PRODUCTO": return "bg-blue-600 text-white";
      case "SERVICIO": return "bg-green-600 text-white";
      case "EVENTO": return "bg-purple-600 text-white";
      case "CONVOCATORIA": return "bg-orange-600 text-white";
      default: return "bg-gray-600 text-white";
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "PRODUCTO": return "Producto";
      case "SERVICIO": return "Servicio";
      case "EVENTO": return "Evento";
      case "CONVOCATORIA": return "Convocatoria";
      default: return tipo;
    }
  };

  const mainImage = product.medios?.[0]?.url || "https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=800";
  const sellerAvatar = product.autor?.avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200";
  const sellerName = product.autor?.nombre || "Usuario";
  const categoryName = product.categoria?.nombre || "General";
  const tipo = product.tipo || "PRODUCTO";

  return (
    <Link href={`/publication/${product.id}`} className="block">
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300 rounded-xl border-gray-200 h-full cursor-pointer">
        {/* Imagen */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={mainImage}
            alt={product.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <Badge className={`absolute top-3 left-3 ${getTipoBadgeColor(tipo)} rounded-full`}>
            {getTipoLabel(tipo)}
          </Badge>
          {/* Favorito — en la imagen para no estorbar el footer en móvil */}
          <button
            className="absolute top-2 right-2 w-9 h-9 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full shadow-sm active:scale-95 transition-transform"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsFavorite(!isFavorite); }}
            aria-label="Guardar en favoritos"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-600 text-red-600" : "text-gray-500"}`} />
          </button>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-ucp-rojo transition-colors mb-1">
            {product.titulo || "Sin título"}
          </h3>

          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {product.descripcion || "Sin descripción"}
          </p>

          <div className="flex items-center gap-2 mb-3">
            <img
              src={sellerAvatar}
              alt={sellerName}
              className="w-7 h-7 rounded-full object-cover shrink-0"
            />
            <p className="text-sm font-medium text-gray-900 truncate">{sellerName}</p>
          </div>

          {tipo === "EVENTO" && product.fechaEvento && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
              <Calendar className="w-3 h-3 shrink-0" />
              <span>{formatDate(product.fechaEvento)}</span>
              {product.ubicacionEvento && (
                <>
                  <MapPin className="w-3 h-3 ml-1 shrink-0" />
                  <span className="truncate">{product.ubicacionEvento}</span>
                </>
              )}
            </div>
          )}

          {tipo === "EVENTO" && product.cupos && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
              <Users className="w-3 h-3 shrink-0" />
              <span>{product.cuposOcupados || 0}/{product.cupos} cupos</span>
            </div>
          )}

          {tipo === "CONVOCATORIA" && product.fechaLimite && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
              <Clock className="w-3 h-3 shrink-0" />
              <span>Límite: {formatDate(product.fechaLimite)}</span>
            </div>
          )}

          <Badge variant="outline" className="rounded-full text-xs mt-1">
            {categoryName}
          </Badge>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xl font-bold text-ucp-rojo truncate">
              {formatPrice(product.precio)}
            </p>
            {product.tipoPrecio === "POR_HORA" && <p className="text-xs text-gray-500">por hora</p>}
            {product.tipoPrecio === "NEGOCIABLE" && <p className="text-xs text-gray-500">negociable</p>}
          </div>

          {/* Botones de acción — detienen propagación para no navegar */}
          <div
            className="flex items-center gap-2 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {product.autor?.id && (
              <ContactButton
                vendorId={product.autor.id}
                vendorName={product.autor.nombre ?? "Usuario"}
                label=""
                showIcon={true}
                size="icon"
                className="shrink-0"
              />
            )}
            {product.tipo !== "EVENTO" && product.tipo !== "CONVOCATORIA" && (
              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="bg-ucp-rojo text-white hover:bg-red-700 rounded-full w-10 h-10 p-0 shrink-0"
                aria-label="Agregar al carrito"
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
