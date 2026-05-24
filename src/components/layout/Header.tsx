"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingCart, Heart, MessageCircle, User, PlusCircle, Menu, LogOut, LayoutDashboard, Home, Package, Settings, HelpCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages } from "@/contexts/MessageContext";
import { useFavorites } from "@/contexts/FavoritesContext";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { usuario, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const { unreadCount: messageCount } = useMessages();
  const { favoritesCount } = useFavorites();

  const isActive = (path: string) => pathname === path;

  // Check if user is in dashboard
  const isInDashboard = pathname.startsWith('/dashboard');

  const PublicNavLinks = () => (
    <>
      <Link href="/" className={`text-sm font-medium transition-colors hover:text-ucp-rojo ${isActive('/') ? 'text-ucp-rojo' : 'text-gray-700'}`}>
        Inicio
      </Link>
      <Link href="/explore" className={`text-sm font-medium transition-colors hover:text-ucp-rojo ${isActive('/explore') ? 'text-ucp-rojo' : 'text-gray-700'}`}>
        Marketplace
      </Link>
    </>
  );

  const AuthNavLinks = () => (
    <>
      <Link href="/" className={`text-sm font-medium transition-colors hover:text-ucp-rojo ${isActive('/') ? 'text-ucp-rojo' : 'text-gray-700'}`}>
        Inicio
      </Link>
      <Link href="/explore" className={`text-sm font-medium transition-colors hover:text-ucp-rojo ${isActive('/explore') ? 'text-ucp-rojo' : 'text-gray-700'}`}>
        Marketplace
      </Link>
      {usuario?.rol === "ESTUDIANTE" && (
        <>
          <Link href="/dashboard/student/publications" className={`text-sm font-medium transition-colors hover:text-ucp-rojo ${isActive('/dashboard/student/publications') ? 'text-ucp-rojo' : 'text-gray-700'}`}>
            Mis Publicaciones
          </Link>
        </>
      )}
      {usuario?.rol === "ADMIN" && (
        <>
          <Link href="/admin/dashboard" className={`text-sm font-medium transition-colors hover:text-ucp-rojo ${isActive('/admin/dashboard') ? 'text-ucp-rojo' : 'text-gray-700'}`}>
            <LayoutDashboard className="w-4 h-4 inline mr-1" />
            Admin
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href={isAuthenticated ?
            (usuario?.rol === "ADMIN" ? "/admin/dashboard" : "/dashboard/student") : "/"}
            className="flex items-center gap-2 shrink-0">
            <img
              src="/logo_ucp.png"
              alt="UCP Logo"
              className="h-10 w-auto object-contain"
            />
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-gray-900">UCP Marketplace</h1>
              <p className="text-xs text-gray-500">Universidad Católica de Pereira</p>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="search"
                placeholder="Buscar productos, servicios, vendedores..."
                className="pl-10 pr-4 w-full rounded-full border-gray-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {!isInDashboard && (isAuthenticated ? <AuthNavLinks /> : <PublicNavLinks />)}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {usuario?.rol === "ESTUDIANTE" && (
                  <>
                    <Link href="/dashboard/student/publications/new">
                      <Button className="bg-ucp-rojo text-white hover:bg-red-700 rounded-full hidden md:flex">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Publicar
                      </Button>
                    </Link>

                    <Link href="/dashboard/student/messages">
                      <Button variant="ghost" size="icon" className="relative rounded-full">
                        <MessageCircle className="w-5 h-5" />
                        {messageCount > 0 && (
                          <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-ucp-rojo text-white text-xs rounded-full">
                            {messageCount}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  </>
                )}

                {/* Favoritos — visible para todos */}
                <Link href="/favorites">
                  <Button variant="ghost" size="icon" className="relative rounded-full">
                    <Heart className="w-5 h-5" />
                    {favoritesCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-ucp-rojo text-white text-xs rounded-full">
                        {favoritesCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                <Link href={isAuthenticated ? "/dashboard/student/cart" : "/cart"}>
                  <Button variant="ghost" size="icon" className="relative rounded-full">
                    <ShoppingCart className="w-5 h-5" />
                    {totalItems > 0 && (
                      <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-ucp-rojo text-white text-xs rounded-full">
                        {totalItems}
                      </Badge>
                    )}
                  </Button>
                </Link>

                <Link href="/dashboard/student/profile">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="w-5 h-5" />
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/favorites">
                  <Button variant="ghost" size="icon" className="relative rounded-full">
                    <Heart className="w-5 h-5" />
                    {favoritesCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-ucp-rojo text-white text-xs rounded-full">
                        {favoritesCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <Link href="/cart">
                  <Button variant="ghost" size="icon" className="relative rounded-full">
                    <ShoppingCart className="w-5 h-5" />
                    {totalItems > 0 && (
                      <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-ucp-rojo text-white text-xs rounded-full">
                        {totalItems}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="ghost" className="rounded-full">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-ucp-rojo text-white hover:bg-red-700 rounded-full">
                    Registrarse
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-white p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Menú de navegación</SheetTitle>
                  <SheetDescription>Navegación móvil del sitio</SheetDescription>
                </SheetHeader>
                
                {/* User Info Section */}
                {isAuthenticated && (
                  <div className="bg-gradient-to-r from-ucp-rojo to-red-700 p-6 text-white">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <User className="w-7 h-7" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{usuario?.nombre}</p>
                        <p className="text-sm text-white/80">{usuario?.correo}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-6 space-y-6">
                  {/* Main Navigation */}
                  {!isInDashboard && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Navegación</h3>
                      <div className="space-y-1">
                        <Link
                          href="/"
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive('/') 
                              ? 'bg-ucp-rojo/10 text-ucp-rojo font-medium' 
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <Home className="w-5 h-5" />
                          <span>Inicio</span>
                        </Link>
                        <Link
                          href="/explore"
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive('/explore') 
                              ? 'bg-ucp-rojo/10 text-ucp-rojo font-medium' 
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <Package className="w-5 h-5" />
                          <span>Marketplace</span>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions for Authenticated Users */}
                  {isAuthenticated && usuario?.rol === "ESTUDIANTE" && (
                    <>
                      <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Mis Publicaciones</h3>
                        <div className="space-y-1">
                          <Link
                            href="/dashboard/student/publications"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                              isActive('/dashboard/student/publications') 
                                ? 'bg-ucp-rojo/10 text-ucp-rojo font-medium' 
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            <Package className="w-5 h-5" />
                            <span>Mis Publicaciones</span>
                          </Link>
                          <Link
                            href="/dashboard/student/publications/new"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                          >
                            <PlusCircle className="w-5 h-5" />
                            <span>Crear Publicación</span>
                          </Link>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Acciones Rápidas</h3>
                        <div className="space-y-1">
                          <Link
                            href={isAuthenticated ? "/dashboard/student/cart" : "/cart"}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                          >
                            <ShoppingCart className="w-5 h-5" />
                            <span>Carrito</span>
                            {totalItems > 0 && (
                              <Badge className="ml-auto bg-ucp-rojo text-white">{totalItems}</Badge>
                            )}
                          </Link>
                          <Link
                            href="/dashboard/student/messages"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                          >
                            <MessageCircle className="w-5 h-5" />
                            <span>Mensajes</span>
                            {messageCount > 0 && (
                              <Badge className="ml-auto bg-ucp-rojo text-white">{messageCount}</Badge>
                            )}
                          </Link>
                          <Link
                            href="/favorites"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                          >
                            <Heart className="w-5 h-5" />
                            <span>Favoritos</span>
                            {favoritesCount > 0 && (
                              <Badge className="ml-auto bg-ucp-rojo text-white">{favoritesCount}</Badge>
                            )}
                          </Link>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Admin Section */}
                  {isAuthenticated && usuario?.rol === "ADMIN" && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Administración</h3>
                      <div className="space-y-1">
                        <Link
                          href="/admin/dashboard"
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive('/admin/dashboard') 
                              ? 'bg-ucp-rojo/10 text-ucp-rojo font-medium' 
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <LayoutDashboard className="w-5 h-5" />
                          <span>Panel de Admin</span>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Account Section */}
                  {isAuthenticated && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Cuenta</h3>
                      <div className="space-y-1">
                        <Link
                          href="/dashboard/student/profile"
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                        >
                          <User className="w-5 h-5" />
                          <span>Mi Perfil</span>
                        </Link>
                        <Link
                          href="/dashboard/student/settings"
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                        >
                          <Settings className="w-5 h-5" />
                          <span>Configuración</span>
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            router.push("/");
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Help Section */}
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Ayuda</h3>
                    <div className="space-y-1">
                      <Link
                        href="/help"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                      >
                        <HelpCircle className="w-5 h-5" />
                        <span>Centro de Ayuda</span>
                      </Link>
                      <Link
                        href="/about"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                      >
                        <Star className="w-5 h-5" />
                        <span>Sobre Nosotros</span>
                      </Link>
                    </div>
                  </div>

                  {/* Auth Buttons for Non-Authenticated Users */}
                  {!isAuthenticated && (
                    <div className="space-y-3 pt-4 border-t">
                      <Link href="/login" className="block">
                        <Button variant="outline" className="w-full justify-start gap-3">
                          <User className="w-4 h-4" />
                          Iniciar Sesión
                        </Button>
                      </Link>
                      <Link href="/register" className="block">
                        <Button className="w-full bg-ucp-rojo text-white hover:bg-red-700 gap-3">
                          <PlusCircle className="w-4 h-4" />
                          Registrarse
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="mt-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="pl-10 pr-4 w-full rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
