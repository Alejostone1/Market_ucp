"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PublicationCard } from "@/components/marketplace/PublicationCard";
import { Heart } from "lucide-react";

interface Publicacion {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  estado: string;
  precio: number | null;
  tipoPrecio: string | null;
  categoria: { id: string; nombre: string; slug: string; color: string };
  autor: { id: string; nombre: string; avatarUrl: string | null; telefono: string | null; correo: string };
  medios: { id: string; url: string; tipo: string; orden: number; altText: string | null }[];
  etiquetas: { etiqueta: { nombre: string } }[];
  creadoEn: string;
  fechaEvento: string | null;
  ubicacionEvento: string | null;
  cupos: number | null;
  cuposOcupados: number | null;
  fechaLimite: string | null;
}

export default function FavoritesPage() {
  const { usuario } = useAuth();
  const [favoritos, setFavoritos] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario?.id) return;
    fetch(`/api/usuarios/${usuario.id}/favoritos`)
      .then((r) => r.json())
      .then((data) => setFavoritos(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [usuario?.id]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-7 h-7 text-ucp-rojo" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Favoritos</h1>
          <p className="text-gray-500 text-sm">Publicaciones que guardaste</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-ucp-rojo border-t-transparent rounded-full animate-spin" />
        </div>
      ) : favoritos.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No tienes favoritos aún</h2>
          <p className="text-gray-500">Explora el marketplace y guarda las publicaciones que te interesen.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoritos.map((pub) => (
            <PublicationCard key={pub.id} publicacion={pub} />
          ))}
        </div>
      )}
    </div>
  );
}
