"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ShoppingBag, User, Minus, Plus, Trash2, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  const handleWhatsAppCheckout = () => {
    const message = `Hola! Me gustaría comprar los productos que tengo en mi carrito del Marketplace UCP:\n\n${items.map(item => `- ${item.title} (${item.quantity}x): $${item.price * item.quantity}`).join('\n')}\n\nTotal: $${totalPrice}\n\n¿Podemos coordinar el pago y la entrega?`;
    // Usar el teléfono del primer vendedor o número por defecto
    const sellerPhone = items.length > 0 ? (items[0].seller.phone || "573000000000") : "573000000000";
    const whatsappUrl = `https://wa.me/${sellerPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Carrito de Compras
            </h1>
            <p className="text-gray-600 text-lg">
              Revisa tus productos antes de realizar tu compra
            </p>
          </div>

          <Card className="border-0 shadow-xl rounded-2xl">
            <CardContent className="p-16 text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Tu carrito está vacío
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                Agrega productos del marketplace para comenzar a comprar
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href="/explore" className="flex-1">
                  <Button className="w-full bg-ucp-rojo text-white hover:bg-red-700 rounded-full text-lg py-6 shadow-lg hover:shadow-xl transition-all">
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Explorar Marketplace
                  </Button>
                </Link>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-4 font-medium">
                  ¿Aún no tienes cuenta en UCP Marketplace?
                </p>
                <div className="flex gap-3 justify-center">
                  <Link href="/login">
                    <Button variant="outline" className="rounded-full border-ucp-rojo text-ucp-rojo hover:bg-red-50">
                      <User className="w-5 h-5 mr-2" />
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="bg-ucp-rojo text-white hover:bg-red-700 rounded-full">
                      Registrarse
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer Info */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-ucp-rojo rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">UCP Marketplace</span>
            </div>
            <p className="text-gray-600 mb-6">
              Plataforma exclusiva para estudiantes de la Universidad Católica de Pereira
            </p>
            <div className="flex justify-center gap-6 text-sm text-gray-600">
              <Link href="/explore" className="hover:text-ucp-rojo transition-colors">
                Marketplace
              </Link>
              <Link href="/login" className="hover:text-ucp-rojo transition-colors">
                Iniciar Sesión
              </Link>
              <Link href="/register" className="hover:text-ucp-rojo transition-colors">
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Carrito de Compras</h1>
      <p className="text-gray-600 mb-8">
        {items.length} {items.length === 1 ? 'producto' : 'productos'} en tu carrito
      </p>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="border-0 shadow-lg rounded-xl">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {item.category === "product" ? "Producto" : "Servicio"} • {item.seller.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="text-xl font-bold text-ucp-rojo">
                          {formatPrice(item.price)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-8 h-8 rounded-full"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-8 h-8 rounded-full"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-lg rounded-xl sticky top-24">
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Envío</span>
                <span className="font-medium text-ucp-verde">Gratis</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-ucp-rojo">{formatPrice(totalPrice)}</span>
                </div>
              </div>
              
              <div className="space-y-3 pt-4">
                <Button
                  className="w-full bg-ucp-rojo text-white hover:bg-red-700 rounded-full"
                  onClick={handleWhatsAppCheckout}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Comprar por WhatsApp
                </Button>

                <Button
                  variant="outline"
                  className="w-full rounded-full border-ucp-rojo text-ucp-rojo hover:bg-red-50"
                  onClick={clearCart}
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Vaciar Carrito
                </Button>
              </div>

              <div className="pt-4 border-t text-center text-sm text-gray-600">
                <p className="mb-2">¿Prefieres contactar directamente?</p>
                <Link href="/explore" className="text-ucp-rojo hover:underline">
                  Explorar más productos
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
