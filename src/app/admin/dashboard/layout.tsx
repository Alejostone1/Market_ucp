"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, FileText, Users, AlertTriangle,
  Tag, Bell, Home, MessageSquare, History, Menu, X,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = (
  pendingReportes:  number,
  unreadMessages:   number,
  pendingAliados:   number,
) => [
  { title: "Dashboard",          href: "/admin/dashboard",               icon: LayoutDashboard, badge: 0 },
  { title: "Publicaciones",      href: "/admin/dashboard/publicaciones", icon: FileText,        badge: 0 },
  { title: "Usuarios",           href: "/admin/dashboard/usuarios",      icon: Users,           badge: 0 },
  {
    title: "Aliados Pendientes",
    href:  "/admin/dashboard/aliados",
    icon:  Building2,
    badge: pendingAliados,
  },
  { title: "Reportes",           href: "/admin/dashboard/reportes",      icon: AlertTriangle,   badge: pendingReportes },
  { title: "Categorías",         href: "/admin/dashboard/categorias",    icon: Tag,             badge: 0 },
  { title: "Notificaciones",     href: "/admin/dashboard/notificaciones",icon: Bell,            badge: 0 },
  { title: "Mensajes",           href: "/admin/dashboard/messages",      icon: MessageSquare,   badge: unreadMessages },
  { title: "Historial",          href: "/admin/dashboard/historial",     icon: History,         badge: 0 },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pendingReportes, setPendingReportes] = useState(0);
  const [unreadMessages,  setUnreadMessages]  = useState(0);
  const [pendingAliados,  setPendingAliados]  = useState(0);
  const [mobileOpen,      setMobileOpen]      = useState(false);

  // Reportes pendientes
  useEffect(() => {
    fetch("/api/admin/reportes?estado=PENDIENTE&limit=1")
      .then((r) => r.json())
      .then((d) => setPendingReportes(d.pendingCount ?? 0))
      .catch(() => {});
  }, [pathname]);

  // Mensajes no leídos
  useEffect(() => {
    const fetchUnread = () => {
      fetch("/api/conversaciones", { cache: "no-store" })
        .then((r) => r.json())
        .then((data: { unread: number }[]) => {
          if (!Array.isArray(data)) return;
          setUnreadMessages(data.reduce((sum, c) => sum + (c.unread ?? 0), 0));
        })
        .catch(() => {});
    };
    fetchUnread();
    const id = setInterval(fetchUnread, 30_000);
    return () => clearInterval(id);
  }, []);

  // Aliados pendientes de aprobación
  useEffect(() => {
    const fetchPendingAliados = () => {
      fetch("/api/admin/usuarios?rol=ALIADO&verificado=false&bloqueado=false&limit=1")
        .then((r) => r.json())
        .then((d) => setPendingAliados(d.pagination?.total ?? 0))
        .catch(() => {});
    };
    fetchPendingAliados();
    // Revisar cada 2 minutos
    const id = setInterval(fetchPendingAliados, 120_000);
    return () => clearInterval(id);
  }, [pathname]);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isActive = (path: string) => {
    if (path === "/admin/dashboard") return pathname === path;
    return pathname === path || pathname.startsWith(path + "/");
  };

  const nav = NAV_ITEMS(pendingReportes, unreadMessages, pendingAliados);

  const NavLinks = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <>
      <nav className="space-y-1">
        {nav.map((item) => {
          const Icon   = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
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
          onClick={onLinkClick}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="font-medium">Ir al Marketplace</span>
        </Link>
      </div>
    </>
  );

  const totalBadges = pendingReportes + unreadMessages + pendingAliados;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ── Desktop Sidebar ────────────────────────────────────────────────── */}
      <aside className="w-64 bg-white border-r min-h-screen p-6 hidden md:block shrink-0">
        <NavLinks />
      </aside>

      {/* ── Mobile overlay ─────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile Drawer ──────────────────────────────────────────────────── */}
      <div className={cn(
        "fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl transition-transform duration-300 md:hidden flex flex-col p-6",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#881a1d] rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Admin Panel</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <NavLinks onLinkClick={() => setMobileOpen(false)} />
      </div>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-600"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-gray-900 text-sm">
              {nav.find((n) => isActive(n.href))?.title ?? "Admin Panel"}
            </span>
          </div>
          {/* Badges totales en la top bar */}
          {totalBadges > 0 && (
            <div className="flex items-center gap-1">
              {pendingAliados > 0 && (
                <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {pendingAliados}
                </span>
              )}
              {pendingReportes > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {pendingReportes}
                </span>
              )}
              {unreadMessages > 0 && (
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadMessages}
                </span>
              )}
            </div>
          )}
        </header>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
