"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, Package, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicationCard } from "@/components/marketplace/PublicationCard";

interface Publicacion {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  estado: string;
  precio: number | null;
  tipoPrecio: string | null;
  categoria: { id: string; nombre: string; slug: string; color: string };
  autor: { id: string; nombre: string; correo: string; avatarUrl: string | null; telefono: string | null };
  medios: { id: string; url: string; tipo: string; orden: number; altText: string | null }[];
  etiquetas: { etiqueta: { nombre: string } }[];
  creadoEn: string;
  fechaEvento: string | null;
  ubicacionEvento: string | null;
  cupos: number | null;
  cuposOcupados: number | null;
  fechaLimite: string | null;
}

interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  color: string;
  icono: string | null;
}

export default function HomePage() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const fetchData = async () => {
      try {
        const [pubsRes, catsRes] = await Promise.all([
          fetch('/api/publicaciones'),
          fetch('/api/categorias'),
        ]);
        const pubsResult = await pubsRes.json();
        const catsData = await catsRes.json();
        setPublicaciones(pubsResult.data?.slice(0, 4) || []);
        setCategorias(catsData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [mounted]);

  return (
    <div suppressHydrationWarning>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white">
        {/* Fondo geométrico institucional */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Bloque rojo lateral derecho */}
          <div className="absolute right-0 top-0 h-full w-1/2 bg-ucp-rojo/5" />
          {/* Línea diagonal decorativa */}
          <div
            className="absolute right-[42%] top-0 h-full w-1 bg-ucp-rojo/20 rotate-6 origin-top"
          />
          {/* Círculo difuso */}
          <div className="absolute -right-24 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-ucp-rojo/8 blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4 py-16 sm:py-24 lg:py-32">
          <div className="max-w-3xl">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 bg-ucp-rojo/10 text-ucp-rojo rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              Plataforma exclusiva UCP
            </div>

            {/* Título */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-6">
              El marketplace de{" "}
              <span className="text-ucp-rojo">la comunidad</span>{" "}
              universitaria
            </h1>

            {/* Subtítulo */}
            <p className="text-lg sm:text-xl text-gray-500 mb-10 max-w-xl leading-relaxed">
              Compra, vende y conecta con estudiantes de la Universidad Católica de Pereira de forma segura.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-14">
              <Link href="/explore">
                <Button size="lg" className="bg-ucp-rojo hover:bg-red-700 text-white rounded-full px-8 font-semibold shadow-lg shadow-ucp-rojo/30 hover:shadow-ucp-rojo/50 transition-all">
                  <Search className="w-4 h-4 mr-2" />
                  Explorar productos
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="rounded-full px-8 border-gray-300 text-gray-700 hover:border-ucp-rojo hover:text-ucp-rojo font-semibold transition-all">
                  Iniciar sesión
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Stats en línea */}
            <div className="flex flex-wrap gap-8">
              {[
                { value: "500+", label: "Publicaciones" },
                { value: "1.2K+", label: "Estudiantes" },
                { value: "12", label: "Categorías" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-black text-gray-900">{s.value}</p>
                  <p className="text-sm text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PUBLICACIONES DESTACADAS ─────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-sm font-semibold text-ucp-rojo uppercase tracking-wider mb-1">Recién publicado</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Publicaciones destacadas</h2>
            </div>
            <Link href="/explore">
              <Button variant="ghost" className="text-ucp-rojo hover:bg-red-50 rounded-full font-semibold hidden sm:flex">
                Ver todas <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-72 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {publicaciones.map((p) => (
                <PublicationCard key={p.id} product={p} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link href="/explore">
              <Button variant="outline" className="rounded-full border-ucp-rojo text-ucp-rojo">
                Ver todas <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CATEGORÍAS ───────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-ucp-rojo uppercase tracking-wider mb-1">Explora</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Categorías disponibles</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {categorias.map((cat) => (
              <Link key={cat.id} href={`/explore?categoria=${cat.slug}`}>
                <div className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-100 hover:border-ucp-rojo hover:bg-red-50 transition-all duration-200 cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-ucp-rojo flex items-center justify-center transition-colors">
                    <Package className="w-6 h-6 text-gray-500 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-ucp-rojo text-center transition-colors">
                    {cat.nombre}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────── */}
      <section className="bg-ucp-rojo py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            ¿Listo para unirte?
          </h2>
          <p className="text-red-100 mb-8 max-w-xl mx-auto">
            Crea tu cuenta con tu correo institucional y empieza a comprar, vender y conectar.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-ucp-rojo hover:bg-gray-100 rounded-full px-8 font-bold">
                Crear cuenta
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 rounded-full px-8 font-semibold">
                Explorar sin registrarse
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
