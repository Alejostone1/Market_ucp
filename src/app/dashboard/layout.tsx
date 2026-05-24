"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, MessageSquare, User, LogOut, Search, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const navItems = [
  { title: "Inicio", href: "/dashboard/student", icon: Home },
  { title: "Mis Publicaciones", href: "/dashboard/student/publications", icon: Package },
  { title: "Mensajes", href: "/dashboard/student/messages", icon: MessageSquare },
  { title: "Perfil", href: "/dashboard/student/profile", icon: User },
  { title: "Marketplace", href: "/dashboard/student/marketplace", icon: Search },
  { title: "Carrito", href: "/dashboard/student/cart", icon: ShoppingCart },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { usuario, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && usuario?.rol === "ADMIN") {
      router.push("/admin/dashboard");
    }
  }, [usuario, isLoading, router]);

  const handleLogout = () => {
    toast("¿Cerrar sesión?", {
      description: "Se cerrará tu sesión en UCP Marketplace.",
      action: {
        label: "Cerrar sesión",
        onClick: () => logout(),
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {},
      },
      duration: 8000,
    });
  };

  if (isLoading || usuario?.rol === "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-ucp-rojo border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const isAliado = usuario?.rol === "ALIADO";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-ucp-rojo to-red-600 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">
                ¡Bienvenido, {usuario?.nombre}! {isAliado ? "🤝" : "🎓"}
              </h1>
              <p className="text-red-100 text-sm">
                {isAliado ? "Panel de Aliado" : "Dashboard Estudiantil"} - UCP Marketplace
              </p>
            </div>
            <div className="hidden md:block">
              <p className="text-sm text-red-100">Conectado</p>
              <p className="text-lg font-semibold">{new Date().toLocaleDateString("es-CO")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-screen p-6 hidden md:block">
          <div className="mb-8">
            <Link href="/dashboard/student" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-ucp-rojo rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">UCP</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Marketplace</h1>
                <p className="text-xs text-gray-500">{isAliado ? "Aliado" : "Estudiante"}</p>
              </div>
            </Link>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive ? "bg-ucp-rojo text-white" : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 pt-8 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors w-full text-left"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
