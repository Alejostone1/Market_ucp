"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  MessageCircle,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

// ── Types ────────────────────────────────────────────────────────────────────

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

interface VendorGroup {
  autor: CarritoItem["publicacion"]["autor"];
  items: CarritoItem[];
  subtotal: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatearPrecio(precio: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(precio);
}

function agruparPorVendedor(items: CarritoItem[]): VendorGroup[] {
  const map = new Map<string, VendorGroup>();
  for (const item of items) {
    const { autor } = item.publicacion;
    if (!map.has(autor.id)) {
      map.set(autor.id, { autor, items: [], subtotal: 0 });
    }
    const group = map.get(autor.id)!;
    group.items.push(item);
    group.subtotal += item.cantidad * Number(item.precioUnitario);
  }
  return Array.from(map.values());
}

// ── Checkout Dialog ───────────────────────────────────────────────────────────

interface CheckoutDialogProps {
  open: boolean;
  vendorGroups: VendorGroup[];
  total: number;
  onClose: () => void;
}

function CheckoutDialog({ open, vendorGroups, total, onClose }: CheckoutDialogProps) {
  const router = useRouter();
  const [contactando, setContactando] = useState<string | null>(null);

  const handleContactarVendedor = async (vendorId: string, vendorNombre: string) => {
    setContactando(vendorId);
    try {
      const res = await fetch("/api/conversaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId: vendorId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Error al iniciar conversación");
      }

      const { id: convId } = await res.json();
      toast.success(`Conversación con ${vendorNombre} abierta`);
      onClose();
      router.push(`/dashboard/student/messages?c=${convId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      toast.error(msg);
    } finally {
      setContactando(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-ucp-rojo" />
            Proceder al pago
          </DialogTitle>
          <DialogDescription>
            En el Marketplace UCP los pagos se coordinan directamente con cada
            vendedor. Contacta a cada uno por chat para acordar el método de pago
            y entrega.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {vendorGroups.map((group) => (
            <div
              key={group.autor.id}
              className="border rounded-xl p-4 flex items-start justify-between gap-4"
            >
              {/* Vendor info */}
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage src={group.autor.avatarUrl ?? undefined} />
                  <AvatarFallback className="text-sm font-semibold bg-ucp-rojo/10 text-ucp-rojo">
                    {group.autor.nombre[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    {group.autor.nombre}
                  </p>
                  <p className="text-xs text-gray-500">
                    {group.items.length} {group.items.length === 1 ? "artículo" : "artículos"} ·{" "}
                    {formatearPrecio(group.subtotal)}
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {group.items.map((it) => (
                      <li key={it.id} className="text-xs text-gray-400 truncate">
                        {it.publicacion.titulo} ×{it.cantidad}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Contact button */}
              <Button
                size="sm"
                className="bg-ucp-rojo text-white hover:bg-red-700 rounded-full flex-shrink-0 gap-1"
                disabled={contactando === group.autor.id}
                onClick={() => handleContactarVendedor(group.autor.id, group.autor.nombre)}
              >
                {contactando === group.autor.id ? (
                  <span className="text-xs">Abriendo...</span>
                ) : (
                  <>
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="text-xs">Contactar</span>
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t pt-4 mt-2 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Total estimado</span>
          <span className="text-lg font-bold text-ucp-rojo">{formatearPrecio(total)}</span>
        </div>

        <Button
          variant="outline"
          className="w-full rounded-full mt-2"
          onClick={onClose}
        >
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CartPage() {
  const { usuario } = useAuth();
  const [carritoItems, setCarritoItems] = useState<CarritoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const fetchCarrito = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/carrito");
      if (response.ok) {
        const data = await response.json();
        setCarritoItems(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error al cargar carrito:", error);
      toast.error("Error al cargar el carrito");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCarrito();
  }, [fetchCarrito]);

  const actualizarCantidad = async (itemId: string, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return;
    try {
      setUpdating(itemId);
      const response = await fetch(`/api/carrito/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cantidad: nuevaCantidad }),
      });
      if (response.ok) {
        await fetchCarrito();
        toast.success("Cantidad actualizada");
      } else {
        toast.error("Error al actualizar cantidad");
      }
    } catch {
      toast.error("Error al actualizar cantidad");
    } finally {
      setUpdating(null);
    }
  };

  const eliminarItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/carrito/${itemId}`, { method: "DELETE" });
      if (response.ok) {
        await fetchCarrito();
        toast.success("Producto eliminado del carrito");
      } else {
        toast.error("Error al eliminar producto");
      }
    } catch {
      toast.error("Error al eliminar producto");
    }
  };

  const calcularTotal = () =>
    carritoItems.reduce(
      (total, item) => total + item.cantidad * Number(item.precioUnitario),
      0,
    );

  // Filter out own publications (shouldn't reach here, but belt-and-suspenders)
  const itemsAjenos = usuario
    ? carritoItems.filter((i) => i.publicacion.autor.id !== usuario.id)
    : carritoItems;

  const vendorGroups = agruparPorVendedor(itemsAjenos);
  const total = calcularTotal();

  // ── Loading state ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Cargando carrito...</p>
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────────

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
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Tu carrito está vacío
          </h2>
          <p className="text-gray-600 mb-8">
            No tienes productos en tu carrito de compras
          </p>
          <Link href="/dashboard/student/marketplace">
            <Button className="bg-ucp-rojo text-white hover:bg-red-700 rounded-full">
              Explorar Marketplace
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // ── Main cart ────────────────────────────────────────────────────────────

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
          <p className="text-gray-600">
            {carritoItems.length}{" "}
            {carritoItems.length === 1 ? "producto" : "productos"} en tu carrito
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Product list */}
        <div className="lg:col-span-2 space-y-4">
          {carritoItems.map((item) => {
            const esPropio =
              usuario && item.publicacion.autor.id === usuario.id;

            return (
              <Card
                key={item.id}
                className={`border-0 shadow-lg rounded-xl p-6 ${esPropio ? "opacity-60 ring-2 ring-amber-400/50" : ""}`}
              >
                {esPropio && (
                  <div className="mb-3 flex items-center gap-2 text-amber-700 bg-amber-50 rounded-lg px-3 py-2 text-xs font-medium">
                    <span>⚠️</span>
                    <span>
                      Esta es tu propia publicación — no puede incluirse en el pago.
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-6 px-2 text-amber-700 hover:bg-amber-100"
                      onClick={() => eliminarItem(item.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                )}

                <div className="flex gap-4">
                  {/* Image */}
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

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {item.publicacion.titulo}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {item.publicacion.descripcion}
                        </p>
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
                        <AvatarImage
                          src={item.publicacion.autor.avatarUrl ?? undefined}
                        />
                        <AvatarFallback className="text-xs">
                          {item.publicacion.autor.nombre[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">
                        {item.publicacion.autor.nombre}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {item.publicacion.tipo}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-8 h-8 rounded-full"
                          onClick={() =>
                            actualizarCantidad(item.id, item.cantidad - 1)
                          }
                          disabled={
                            updating === item.id ||
                            item.cantidad <= 1 ||
                            !!esPropio
                          }
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {item.cantidad}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-8 h-8 rounded-full"
                          onClick={() =>
                            actualizarCantidad(item.id, item.cantidad + 1)
                          }
                          disabled={updating === item.id || !!esPropio}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-ucp-rojo">
                          {formatearPrecio(
                            item.cantidad * Number(item.precioUnitario),
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatearPrecio(Number(item.precioUnitario))} c/u
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-lg rounded-xl p-6 sticky top-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Resumen de compra
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>
                  Subtotal ({itemsAjenos.length}{" "}
                  {itemsAjenos.length === 1 ? "producto" : "productos"})
                </span>
                <span>{formatearPrecio(total)}</span>
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
                  <span className="text-ucp-rojo">{formatearPrecio(total)}</span>
                </div>
              </div>
            </div>

            {/* Vendors summary */}
            {vendorGroups.length > 0 && (
              <div className="mb-4 text-xs text-gray-500 space-y-1">
                <p className="font-medium text-gray-700 mb-1">Vendedores:</p>
                {vendorGroups.map((g) => (
                  <div key={g.autor.id} className="flex justify-between">
                    <span className="truncate">{g.autor.nombre}</span>
                    <span className="ml-2 flex-shrink-0">
                      {formatearPrecio(g.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <Button
              className="w-full bg-ucp-rojo text-white hover:bg-red-700 rounded-full mb-3 gap-2"
              disabled={itemsAjenos.length === 0}
              onClick={() => setCheckoutOpen(true)}
            >
              <MessageCircle className="w-4 h-4" />
              Proceder al pago
              <ChevronRight className="w-4 h-4" />
            </Button>

            {itemsAjenos.length === 0 && carritoItems.length > 0 && (
              <p className="text-xs text-amber-600 text-center mb-2">
                Elimina tus propias publicaciones para continuar.
              </p>
            )}

            <Link href="/dashboard/student/marketplace">
              <Button variant="outline" className="w-full rounded-full">
                Seguir comprando
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Checkout dialog */}
      <CheckoutDialog
        open={checkoutOpen}
        vendorGroups={vendorGroups}
        total={total}
        onClose={() => setCheckoutOpen(false)}
      />
    </div>
  );
}
