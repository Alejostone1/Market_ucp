"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, FileText, Users, AlertTriangle,
  Tag, Bell, Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pendingReportes, setPendingReportes] = useState(0);

  // Cargar conteo de reportes pendientes
  useEffect(() => {
    fetch("/api/admin/reportes?estado=PENDIENTE&limit=1")
      .then((r) => r.json())
      .then((d) => setPendingReportes(d.pendingCount ?? 0))
      .catch(() => {});
  }, [pathname]); // re-fetch al navegar

  const isActive = (path: string) => {
    if (path === "/admin/dashboard") return pathname === path;
    return pathname === path || pathname.startsWith(path + "/");
  };

  const NAV = [
    { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, badge: 0 },
    { title: "Publicaciones", href: "/admin/dashboard/publicaciones", icon: FileText, badge: 0 },
    { title: "Usuarios", href: "/admin/dashboard/usuarios", icon: Users, badge: 0 },
    { title: "Reportes", href: "/admin/dashboard/reportes", icon: AlertTriangle, badge: pendingReportes },
    { title: "Categorías", href: "/admin/dashboard/categorias", icon: Tag, badge: 0 },
    { title: "Notificaciones", href: "/admin/dashboard/notificaciones", icon: Bell, badge: 0 },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r min-h-screen p-6 hidden md:block shrink-0">
        <nav className="space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                  active ? "bg-[#881a1d] text-white" : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="font-medium flex-1">{item.title}</span>
                {item.badge > 0 && (
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
                    active ? "bg-white text-[#881a1d]" : "bg-amber-500 text-white"
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 pt-8 border-t">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Ir al Marketplace</span>
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}
