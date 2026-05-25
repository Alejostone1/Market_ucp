"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, MessageSquare, User, LogOut, Search, ShoppingCart, Bell, Menu, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const BASE_NAV = [
  { title: "Inicio",            href: "/dashboard/student",               icon: Home },
  { title: "Mis Publicaciones", href: "/dashboard/student/publications",  icon: Package },
  { title: "Mensajes",          href: "/dashboard/student/messages",      icon: MessageSquare },
  { title: "Notificaciones",    href: "/dashboard/student/notifications", icon: Bell },
  { title: "Perfil",            href: "/dashboard/student/profile",       icon: User },
  { title: "Marketplace",       href: "/dashboard/student/marketplace",   icon: Search },
  { title: "Carrito",           href: "/dashboard/student/cart",          icon: ShoppingCart },
];

// Bottom nav items (most used 5)
const BOTTOM_NAV = [
  { title: "Inicio",      href: "/dashboard/student",               icon: Home },
  { title: "Publicar",   href: "/dashboard/student/publications",  icon: Package },
  { title: "Mensajes",   href: "/dashboard/student/messages",      icon: MessageSquare },
  { title: "Notifs",     href: "/dashboard/student/notifications", icon: Bell },
  { title: "Perfil",     href: "/dashboard/student/profile",       icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { usuario, logout, isLoading, isLoggingOut } = useAuth();
  const router = useRouter();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && usuario?.rol === "ADMIN") {
      router.push("/admin/dashboard");
    }
  }, [usuario, isLoading, router]);

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    const fetchUnread = () => {
      fetch("/api/notificaciones?limit=1", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => setUnreadNotifications(d.unreadCount ?? 0))
        .catch(() => {});
    };
    fetchUnread();
    const id = setInterval(fetchUnread, 60_000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = () => {
    toast("¿Cerrar sesión?", {
      description: "Se cerrará tu sesión en UCP Marketplace.",
      action: { label: "Cerrar sesión", onClick: () => logout() },
      cancel: { label: "Cancelar", onClick: () => {} },
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

  const isActive = (href: string) =>
    href === "/dashboard/student"
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/");

  const NavLinks = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <>
      <nav className="space-y-1">
        {BASE_NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const badge = item.href === "/dashboard/student/notifications" ? unreadNotifications : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                active ? "bg-ucp-rojo text-white" : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="font-medium flex-1">{item.title}</span>
              {badge > 0 && (
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
                  active ? "bg-white text-ucp-rojo" : "bg-ucp-rojo text-white"
                )}>
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 pt-8 border-t">
        <button
          onClick={() => { onLinkClick?.(); handleLogout(); }}
          disabled={isLoggingOut}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors w-full text-left disabled:opacity-50"
        >
          {isLoggingOut
            ? <Loader2 className="w-5 h-5 animate-spin" />
            : <LogOut className="w-5 h-5" />}
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-ucp-rojo to-red-600 text-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Mobile: hamburger + title */}
            <div className="flex items-center gap-3 md:hidden">
              <button
                onClick={() => setMobileOpen(true)}
                className="p-1.5 rounded-lg bg-white/20 text-white"
                aria-label="Menú"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-base font-bold leading-tight">
                  {usuario?.nombre?.split(" ")[0]} {isAliado ? "🤝" : "🎓"}
                </h1>
                <p className="text-red-200 text-xs">
                  {isAliado ? "Panel Aliado" : "Dashboard"}
                </p>
              </div>
            </div>
            {/* Desktop title */}
            <div className="hidden md:block">
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
            {/* Mobile: notification bell in banner */}
            <Link href="/dashboard/student/notifications" className="md:hidden relative">
              <Bell className="w-5 h-5 text-white" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-gray-900 rounded-full text-[9px] font-bold flex items-center justify-center">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div className={cn(
        "fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl transition-transform duration-300 md:hidden flex flex-col p-6",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard/student" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
            <div className="w-9 h-9 bg-ucp-rojo rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">UCP</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Marketplace</p>
              <p className="text-xs text-gray-500">{isAliado ? "Aliado" : "Estudiante"}</p>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavLinks onLinkClick={() => setMobileOpen(false)} />
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="w-64 bg-white border-r min-h-screen p-6 hidden md:block shrink-0">
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
          <NavLinks />
        </aside>

        {/* Main content — extra bottom padding on mobile for the bottom nav */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 min-w-0">{children}</main>
      </div>

      {/* ── Mobile Bottom Navigation ─────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t shadow-lg">
        <div className="flex items-center justify-around py-2 px-1">
          {BOTTOM_NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const badge = item.href === "/dashboard/student/notifications" ? unreadNotifications : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors min-w-[52px] relative",
                  active ? "text-ucp-rojo" : "text-gray-500"
                )}
              >
                <div className="relative">
                  <Icon className={cn("w-5 h-5", active ? "text-ucp-rojo" : "text-gray-500")} />
                  {badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-ucp-rojo text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </div>
                <span className={cn("text-[10px] font-medium", active ? "text-ucp-rojo" : "text-gray-500")}>
                  {item.title}
                </span>
                {active && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-ucp-rojo rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
