import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { MessageProvider } from "@/contexts/MessageContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UCP Marketplace - Universidad Católica de Pereira",
  description: "Plataforma exclusiva para estudiantes de la Universidad Católica de Pereira",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <MessageProvider>
                <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full">
                  <Header />
                  <main className="overflow-x-hidden">{children}</main>
                  <Footer />
                </div>
                <Toaster position="bottom-right" richColors closeButton />
              </MessageProvider>
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
