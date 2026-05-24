"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  AlertTriangle,
  Tag,
  Bell,
  LogOut,
  Home,
  Shield,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { redirect } from "next/navigation";
import { PendingReportsBadge } from "@/components/admin/PendingReportsBadge";
import { UnreadMessagesBadge } from "@/components/admin/UnreadMessagesBadge";
import { toast } from "sonner";

type SidebarItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  BadgeComp?: React.ComponentType;
};

const sidebarNavItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Publicaciones",
    href: "/dashboard/admin/publicaciones",
    icon: FileText,
  },
  {
    title: "Usuarios",
    href: "/dashboard/admin/usuarios",
    icon: Users,
  },
  {
    title: "Reportes",
    href: "/dashboard/admin/reportes",
    icon: AlertTriangle,
    BadgeComp: PendingReportsBadge,
  },
  {
    title: "Categorías",
    href: "/dashboard/admin/categorias",
    icon: Tag,
  },
  {
    title: "Notificaciones",
    href: "/dashboard/admin/notificaciones",
    icon: Bell,
  },
  {
    title: "Mensajes",
    href: "/dashboard/admin/messages",
    icon: MessageSquare,
    BadgeComp: UnreadMessagesBadge,
  },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { usuario, logout } = useAuth();

  // Redirigir si no es admin
  if (usuario?.rol !== "ADMIN") {
    redirect("/dashboard/student");
  }

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Link href="/dashboard/admin" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-ucp-rojo rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-lg font-bold text-gray-900">UCP Admin</h1>
                <p className="text-xs text-gray-500">Panel de Administración</p>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={usuario?.avatarUrl || undefined} />
                  <AvatarFallback>{usuario?.nombre?.[0] || 'A'}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{usuario?.nombre}</p>
                  <p className="text-xs text-gray-500">Administrador</p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  toast("¿Cerrar sesión?", {
                    description: "Se cerrará tu sesión de administrador.",
                    action: {
                      label: "Cerrar sesión",
                      onClick: () => {
                        logout();
                        window.location.href = "/login";
                      },
                    },
                    cancel: {
                      label: "Cancelar",
                      onClick: () => {},
                    },
                    duration: 8000,
                  });
                }}
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-screen p-6 hidden md:block">
          <nav className="space-y-1">
            {sidebarNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const BadgeComp = item.BadgeComp;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors",
                    active
                      ? "bg-ucp-rojo text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="font-medium flex-1">{item.title}</span>
                  {BadgeComp && (
                    <span className={active ? "text-white" : ""}>
                      <BadgeComp />
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 pt-8 border-t">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Ir al Marketplace</span>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
