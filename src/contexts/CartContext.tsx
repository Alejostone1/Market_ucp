"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  category: "product" | "service";
  seller: {
    name: string;
    faculty: string;
    phone?: string;
  };
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    fetch("/api/carrito")
      .then((r) => r.ok ? r.json() : [])
      .then((data: { publicacionId: string; cantidad: number; precioUnitario: number; publicacion?: { titulo: string; medios?: { url: string }[]; autor?: { nombre: string; telefono?: string | null } } }[]) => {
        if (!Array.isArray(data)) return;
        setItems(
          data.map((item) => ({
            id: item.publicacionId,
            title: item.publicacion?.titulo || "",
            price: Number(item.precioUnitario) || 0,
            image: item.publicacion?.medios?.[0]?.url || "",
            category: "product" as const,
            seller: { name: item.publicacion?.autor?.nombre || "", faculty: "UCP", phone: item.publicacion?.autor?.telefono ?? undefined },
            quantity: item.cantidad,
          }))
        );
      })
      .catch(() => {});
  }, []);

  const addToCart = (item: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        toast.success("Cantidad actualizada en el carrito");
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      toast.success("Producto agregado al carrito");
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    toast.success("Producto eliminado del carrito");
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    toast.success("Carrito vaciado");
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
