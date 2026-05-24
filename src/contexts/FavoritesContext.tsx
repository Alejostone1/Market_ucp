"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";

// ── Tipos ──────────────────────────────────────────────────────────────────

interface Publicacion {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  estado: string;
  precio: number | null;
  tipoPrecio: string | null;
  categoria: { id: string; nombre: string; slug: string; color: string };
  autor: {
    id: string;
    nombre: string;
    correo: string;
    avatarUrl: string | null;
    telefono: string | null;
  };
  medios: { id: string; url: string; tipo: string; orden: number; altText: string | null }[];
  etiquetas: { etiqueta: { nombre: string } }[];
  creadoEn: string;
  fechaEvento: string | null;
  ubicacionEvento: string | null;
  cupos: number | null;
  cuposOcupados: number | null;
  fechaLimite: string | null;
}

interface FavoritesContextType {
  /** IDs de publicaciones favoritas */
  favoriteIds: Set<string>;
  /** Caché de publicaciones favoritas (para mostrarlas sin más fetch) */
  favoritePubs: Map<string, Publicacion>;
  /** Comprobar si una publicación está en favoritos */
  isFavorite: (id: string) => boolean;
  /** Alternar favorito — recibe el objeto completo para cachear */
  toggleFavorite: (pub: Publicacion) => Promise<void>;
  /** Número de favoritos (para badge en header) */
  favoritesCount: number;
  /** Si el contexto ya cargó su estado inicial */
  loaded: boolean;
}

// ── Claves localStorage ────────────────────────────────────────────────────

const LS_IDS = "ucp_fav_ids";
const LS_PUBS = "ucp_fav_pubs";

// ── Context ────────────────────────────────────────────────────────────────

const FavoritesContext = createContext<FavoritesContextType>({
  favoriteIds: new Set(),
  favoritePubs: new Map(),
  isFavorite: () => false,
  toggleFavorite: async () => {},
  favoritesCount: 0,
  loaded: false,
});

export function useFavorites() {
  return useContext(FavoritesContext);
}

// ── Helpers localStorage ───────────────────────────────────────────────────

function readLocalIds(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_IDS);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function readLocalPubs(): Map<string, Publicacion> {
  try {
    const raw = localStorage.getItem(LS_PUBS);
    return raw ? new Map(Object.entries(JSON.parse(raw))) : new Map();
  } catch {
    return new Map();
  }
}

function saveLocalIds(ids: Set<string>) {
  try {
    localStorage.setItem(LS_IDS, JSON.stringify([...ids]));
  } catch {}
}

function saveLocalPubs(pubs: Map<string, Publicacion>) {
  try {
    const obj: Record<string, Publicacion> = {};
    pubs.forEach((p, k) => (obj[k] = p));
    localStorage.setItem(LS_PUBS, JSON.stringify(obj));
  } catch {}
}

// ── Provider ───────────────────────────────────────────────────────────────

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { usuario, isAuthenticated } = useAuth();

  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favoritePubs, setFavoritePubs] = useState<Map<string, Publicacion>>(new Map());
  const [loaded, setLoaded] = useState(false);

  // Evitar doble-carga en StrictMode
  const initDone = useRef(false);

  // ── Carga inicial ────────────────────────────────────────────────────────
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    // Siempre cargamos localStorage primero (fast path)
    const localIds = readLocalIds();
    const localPubs = readLocalPubs();
    setFavoriteIds(localIds);
    setFavoritePubs(localPubs);

    if (!isAuthenticated) {
      setLoaded(true);
      return;
    }

    // Si está logueado, sincronizamos con la DB
    (async () => {
      try {
        const res = await fetch("/api/favoritos");
        if (!res.ok) { setLoaded(true); return; }

        const pubs: Publicacion[] = await res.json();
        const dbIds = new Set<string>(pubs.map((p) => p.id));
        const dbPubs = new Map<string, Publicacion>(pubs.map((p) => [p.id, p]));

        // Subir favoritos de localStorage que no están en DB
        const toSync = [...localIds].filter((id) => !dbIds.has(id));
        await Promise.allSettled(
          toSync.map((id) =>
            fetch(`/api/publicaciones/${id}/favoritos`, { method: "POST" })
          )
        );
        toSync.forEach((id) => {
          dbIds.add(id);
          const cached = localPubs.get(id);
          if (cached) dbPubs.set(id, cached);
        });

        setFavoriteIds(new Set(dbIds));
        setFavoritePubs(new Map(dbPubs));

        // Reflejar en localStorage por coherencia
        saveLocalIds(dbIds);
        saveLocalPubs(dbPubs);
      } catch {
        // fallback: mantener localStorage
      } finally {
        setLoaded(true);
      }
    })();
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Toggle favorito ──────────────────────────────────────────────────────
  const toggleFavorite = useCallback(
    async (pub: Publicacion) => {
      const id = pub.id;
      const wasFav = favoriteIds.has(id);

      // Actualización optimista
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        wasFav ? next.delete(id) : next.add(id);
        return next;
      });
      setFavoritePubs((prev) => {
        const next = new Map(prev);
        wasFav ? next.delete(id) : next.set(id, pub);
        return next;
      });

      if (isAuthenticated) {
        // Sincronizar con DB
        try {
          await fetch(`/api/publicaciones/${id}/favoritos`, { method: "POST" });
        } catch {
          // Revertir si falla
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            wasFav ? next.add(id) : next.delete(id);
            return next;
          });
        }
      } else {
        // Persistir en localStorage
        const newIds = new Set(favoriteIds);
        wasFav ? newIds.delete(id) : newIds.add(id);
        const newPubs = new Map(favoritePubs);
        wasFav ? newPubs.delete(id) : newPubs.set(id, pub);

        saveLocalIds(newIds);
        saveLocalPubs(newPubs);
      }
    },
    [favoriteIds, favoritePubs, isAuthenticated]
  );

  const isFavorite = useCallback(
    (id: string) => favoriteIds.has(id),
    [favoriteIds]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        favoritePubs,
        isFavorite,
        toggleFavorite,
        favoritesCount: favoriteIds.size,
        loaded,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}
