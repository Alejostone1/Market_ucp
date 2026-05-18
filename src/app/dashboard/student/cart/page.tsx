"use client";

import { useState, useEffect } from "react";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Link from "next/link";

interface CarritoItem {
  id: string;
  cantidad: number;
  precioUnitario: number;
  creadoEn: string;
  publicacion: {
    id: string;
    titulo: string;
    descripcion: string;
    tipo: string;
    estado: string;
    precio?: number;
    tipoPrecio?: string;
    autor: {
      id: string;
      nombre: string;
      avatarUrl: string | null;
    };
    medios: {
      id: string;
      url: string;
      tipo: string;
      orden: number;
    }[];
  };
}

export default function CartPage() {
  const { usuario } = useAuth();
  const [carritoItems, setCarritoItems] = useState<CarritoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchCarrito();
  }, [usuario?.id]);

  const fetchCarrito = async () => {
    if (!usuario?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/usuarios/${usuario.id}/carrito`);
      if (response.ok) {
        const data = await response.json();
        setCarritoItems(data);
      }
    } catch (error) {
      console.error('Error al cargar carrito:', error);
      toast.error("Error al cargar el carrito");
    } finally {
      setLoading(false);
    }
  };

  const actualizarCantidad = async (itemId: string, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return;

    try {
      setUpdating(itemId);
      const response = await fetch(`/api/carrito/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cantidad: nuevaCantidad }),
      });

      if (response.ok) {
        await fetchCarrito();
        toast.success("Cantidad actualizada");
      } else {
        toast.error("Error al actualizar cantidad");
      }
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      toast.error("Error al actualizar cantidad");
    } finally {
      setUpdating(null);
    }
  };

  const eliminarItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/carrito/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCarrito();
        toast.success("Producto eliminado del carrito");
      } else {
        toast.error("Error al eliminar producto");
      }
    } catch (error) {
      console.error('Error al eliminar item:', error);
      toast.error("Error al eliminar producto");
    }
  };

  const calcularTotal = () => {
    return carritoItems.reduce((total, item) => {
      return total + (item.cantidad * Number(item.precioUnitario));
    }, 0);
  };

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(precio);
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Cargando carrito...</p>
      </div>
    );
  }

  if (carritoItems.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/student">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Carrito</h1>
            <p className="text-gray-600">Gestiona tus productos seleccionados</p>
          </div>
        </div>

        <Card className="border-0 shadow-lg rounded-xl p-16 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-600 mb-8">No tienes productos en tu carrito de compras</p>
          <Link href="/dashboard/student/marketplace">
            <Button className="bg-ucp-rojo text-white hover:bg-red-700 rounded-full">
              Explorar Marketplace
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/student">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Carrito</h1>
          <p className="text-gray-600">{carritoItems.length} {carritoItems.length === 1 ? 'producto' : 'productos'} en tu carrito</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Lista de productos */}
        <div className="lg:col-span-2 space-y-4">
          {carritoItems.map((item) => (
            <Card key={item.id} className="border-0 shadow-lg rounded-xl p-6">
              <div className="flex gap-4">
                {/* Imagen del producto */}
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.publicacion.medios.length > 0 ? (
                    <img
                      src={item.publicacion.medios[0].url}
                      alt={item.publicacion.titulo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Información del producto */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.publicacion.titulo}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{item.publicacion.descripcion}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => eliminarItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={item.publicacion.autor.avatarUrl || undefined} />
                      <AvatarFallback className="text-xs">{item.publicacion.autor.nombre[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600">{item.publicacion.autor.nombre}</span>
                    <Badge variant="secondary" className="text-xs">
                      {item.publicacion.tipo}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    {/* Controles de cantidad */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-8 h-8 rounded-full"
                        onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                        disabled={updating === item.id || item.cantidad <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.cantidad}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-8 h-8 rounded-full"
                        onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                        disabled={updating === item.id}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Precio */}
                    <div className="text-right">
                      <p className="text-lg font-bold text-ucp-rojo">
                        {formatearPrecio(item.cantidad * Number(item.precioUnitario))}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatearPrecio(Number(item.precioUnitario))} c/u
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Resumen de compra */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-lg rounded-xl p-6 sticky top-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen de compra</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({carritoItems.length} productos)</span>
                <span>{formatearPrecio(calcularTotal())}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                <span>Por calcular</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Impuestos</span>
                <span>Incluidos</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-ucp-rojo">{formatearPrecio(calcularTotal())}</span>
                </div>
              </div>
            </div>

            <Button className="w-full bg-ucp-rojo text-white hover:bg-red-700 rounded-full mb-3">
              Proceder al pago
            </Button>
            
            <Link href="/dashboard/student/marketplace">
              <Button variant="outline" className="w-full rounded-full">
                Seguir comprando
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
