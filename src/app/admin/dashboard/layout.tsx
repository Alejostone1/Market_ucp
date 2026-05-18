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
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarNavItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Publicaciones", href: "/admin/dashboard/publicaciones", icon: FileText },
  { title: "Usuarios", href: "/admin/dashboard/usuarios", icon: Users },
  { title: "Reportes", href: "/admin/dashboard/reportes", icon: AlertTriangle },
  { title: "Categorías", href: "/admin/dashboard/categorias", icon: Tag },
  { title: "Notificaciones", href: "/admin/dashboard/notificaciones", icon: Bell },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/admin/dashboard") return pathname === path;
    return pathname === path || pathname.startsWith(path + "/");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r min-h-screen p-6 hidden md:block shrink-0">
        <nav className="space-y-2">
          {sidebarNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive(item.href)
                    ? "bg-ucp-rojo text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.title}</span>
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
  );
}
