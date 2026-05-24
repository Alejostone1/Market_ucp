"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
import { PublicationCard } from "@/components/marketplace/PublicationCard";
import { Button } from "@/components/ui/button";

export default function FavoritesPage() {
  const { isAuthenticated } = useAuth();
  const { favoritePubs, favoriteIds, loaded } = useFavorites();

  // Para usuarios logueados: refrescar desde DB para tener datos actualizados
  const [dbPubs, setDbPubs] = useState<typeof favoritePubs | null>(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    if (!isAuthenticated) {
      setDbPubs(null); // usa favoritePubs del contexto (localStorage)
      return;
    }

    setFetching(true);
    fetch("/api/favoritos")
      .then((r) => r.json())
      .then((data: Array<{
        id: string; titulo: string; descripcion: string; tipo: string; estado: string;
        precio: number | null; tipoPrecio: string | null;
        categoria: { id: string; nombre: string; slug: string; color: string };
        autor: { id: string; nombre: string; correo: string; avatarUrl: string | null; telefono: string | null };
        medios: { id: string; url: string; tipo: string; orden: number; altText: string | null }[];
        etiquetas: { etiqueta: { nombre: string } }[];
        creadoEn: string; fechaEvento: string | null; ubicacionEvento: string | null;
        cupos: number | null; cuposOcupados: number | null; fechaLimite: string | null;
      }>) => {
        if (Array.isArray(data)) {
          const map = new Map(data.map((p) => [p.id, p]));
          setDbPubs(map as typeof favoritePubs);
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [loaded, isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fuente de datos: DB para logueados, localStorage para invitados
  const publications = Array.from(
    (isAuthenticated && dbPubs !== null ? dbPubs : favoritePubs).values()
  );

  // Filtrar solo los que siguen en favoriteIds (para reflejar toggles optimistas)
  const visiblePubs = publications.filter((p) => favoriteIds.has(p.id));

  const isLoading = !loaded || fetching;

  return (
    <div className="min-h-[60vh] bg-gray-50">
      <div className="container mx-auto px-4 py-10 max-w-6xl">

        {/* Encabezado */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
            <Heart className="w-6 h-6 text-[#881a1d] fill-[#881a1d]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Mis favoritos</h1>
            <p className="text-sm text-gray-500">
              {isLoading
                ? "Cargando…"
                : visiblePubs.length === 0
                ? "Aún no tienes favoritos guardados"
                : `${visiblePubs.length} publicación${visiblePubs.length !== 1 ? "es" : ""} guardada${visiblePubs.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          {/* Aviso para invitados */}
          {!isAuthenticated && loaded && (
            <div className="ml-auto hidden sm:flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm">
              <span className="text-amber-700">
                Inicia sesión para guardar favoritos permanentemente
              </span>
              <Link href="/login">
                <Button size="sm" className="bg-[#881a1d] hover:bg-[#6d1416] text-white rounded-lg h-8 text-xs">
                  Iniciar sesión
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Banner invitado móvil */}
        {!isAuthenticated && loaded && (
          <div className="sm:hidden bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <span className="text-amber-700 text-sm flex-1">
              Inicia sesión para guardar tus favoritos de forma permanente
            </span>
            <Link href="/login">
              <Button size="sm" className="bg-[#881a1d] text-white rounded-lg h-8 text-xs shrink-0">
                Entrar
              </Button>
            </Link>
          </div>
        )}

        {/* Contenido */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-[#881a1d] animate-spin" />
            <p className="text-gray-400 text-sm">Cargando tus favoritos…</p>
          </div>
        ) : visiblePubs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              Todavía no guardaste nada
            </h2>
            <p className="text-gray-500 mb-8 max-w-sm">
              Explora el marketplace y toca el{" "}
              <Heart className="w-4 h-4 inline text-[#881a1d] fill-[#881a1d]" />{" "}
              en cualquier publicación para guardarla aquí.
            </p>
            <Link href="/explore">
              <Button className="bg-[#881a1d] hover:bg-[#6d1416] text-white rounded-xl px-8">
                Explorar marketplace
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              layout
            >
              {visiblePubs.map((pub, i) => (
                <motion.div
                  key={pub.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                >
                  <PublicationCard product={pub} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
