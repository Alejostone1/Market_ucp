"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Search, ArrowRight, Package, Zap, ShieldCheck, Users, Star, TrendingUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicationCard } from "@/components/marketplace/PublicationCard";

interface Publicacion {
  id: string; titulo: string; descripcion: string; tipo: string; estado: string;
  precio: number | null; tipoPrecio: string | null;
  categoria: { id: string; nombre: string; slug: string; color: string };
  autor: { id: string; nombre: string; correo: string; avatarUrl: string | null; telefono: string | null };
  medios: { id: string; url: string; tipo: string; orden: number; altText: string | null }[];
  etiquetas: { etiqueta: { nombre: string } }[];
  creadoEn: string; fechaEvento: string | null; ubicacionEvento: string | null;
  cupos: number | null; cuposOcupados: number | null; fechaLimite: string | null;
}
interface Categoria { id: string; nombre: string; slug: string; color: string; icono: string | null }

const TIPO_COLORS: Record<string, string> = {
  PRODUCTO: "bg-blue-100 text-blue-700",
  SERVICIO: "bg-green-100 text-green-700",
  EVENTO: "bg-purple-100 text-purple-700",
  CONVOCATORIA: "bg-orange-100 text-orange-700",
};
const TIPO_LABEL: Record<string, string> = { PRODUCTO: "Producto", SERVICIO: "Servicio", EVENTO: "Evento", CONVOCATORIA: "Convocatoria" };

function FloatingCard({ pub, className }: { pub: Publicacion; className?: string }) {
  const img = pub.medios?.[0]?.url || "https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=400";
  return (
    <div className={`bg-white rounded-2xl shadow-2xl p-3 w-52 ${className}`}>
      <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-gray-100">
        <img src={img} alt={pub.titulo} className="w-full h-full object-cover" />
      </div>
      <Badge className={`text-[10px] mb-1 rounded-full ${TIPO_COLORS[pub.tipo] || "bg-gray-100 text-gray-600"}`}>
        {TIPO_LABEL[pub.tipo] || pub.tipo}
      </Badge>
      <p className="text-xs font-semibold text-gray-900 line-clamp-1">{pub.titulo}</p>
      <p className="text-xs font-bold text-[#881a1d] mt-0.5">
        {pub.precio ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(pub.precio) : "Gratis"}
      </p>
    </div>
  );
}

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let start = 0;
      const step = Math.ceil(target / 60);
      const timer = setInterval(() => {
        start += step;
        if (start >= target) { setCount(target); clearInterval(timer); }
        else setCount(start);
      }, 16);
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const MARQUEE_ITEMS = ["Tecnología", "Libros", "Tutorías", "Servicios", "Eventos", "Convocatorias", "Electrónica", "Arte", "Deporte", "Gastronomía", "Música", "Fotografía"];

export default function HomePage() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    (async () => {
      try {
        const [pRes, cRes] = await Promise.all([fetch("/api/publicaciones"), fetch("/api/categorias")]);
        const pData = await pRes.json();
        const cData = await cRes.json();
        setPublicaciones(pData.data || []);
        setCategorias(cData);
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, [mounted]);

  const floatingCards = publicaciones.slice(0, 3);
  const featuredCards = publicaciones.slice(0, 8);

  return (
    <div suppressHydrationWarning className="overflow-x-hidden">

      {/* ══════════════ HERO ══════════════ */}
      <section className="relative min-h-[92vh] bg-[#0d0d0d] flex items-center overflow-hidden">

        {/* Mesh gradient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#881a1d]/30 rounded-full blur-[120px] -translate-x-1/3 -translate-y-1/3 animate-pulse" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#f4c222]/10 rounded-full blur-[100px] translate-x-1/4 translate-y-1/4 animate-pulse" />
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-[#c55f23]/15 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center">
          {/* ── Texto ── */}
          <div className="hero-text">
            {/* Badge animado */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-white rounded-full px-4 py-1.5 text-sm font-medium mb-8 animate-fade-in-up">
              <span className="w-2 h-2 bg-[#f4c222] rounded-full animate-ping inline-block" />
              Marketplace universitario · UCP Pereira
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] text-white mb-6 animate-fade-in-up">
              Compra, vende<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#881a1d] via-[#c55f23] to-[#f4c222]">
                conecta
              </span>{" "}
              en la UCP
            </h1>

            <p className="text-lg text-white/60 mb-10 max-w-lg leading-relaxed animate-fade-in-up">
              La plataforma exclusiva para estudiantes de la Universidad Católica de Pereira. Productos, servicios, eventos y más.
            </p>

            {/* Search bar */}
            <div className="relative mb-8 animate-fade-in-up">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos, servicios, eventos…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && searchQuery.trim()) window.location.href = "/explore?q=" + encodeURIComponent(searchQuery.trim()); }}
                className="w-full pl-12 pr-36 py-4 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#881a1d] focus:bg-white/15 transition-all text-sm"
              />
              <button
                onClick={() => { if (searchQuery.trim()) window.location.href = "/explore?q=" + encodeURIComponent(searchQuery.trim()); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#881a1d] hover:bg-[#6d1416] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Buscar
              </button>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-12 animate-fade-in-up">
              <Link href="/explore">
                <button className="flex items-center gap-2 bg-[#881a1d] hover:bg-[#6d1416] text-white font-bold px-7 py-3.5 rounded-2xl transition-all hover:scale-105 shadow-lg shadow-[#881a1d]/40">
                  <Package className="w-4 h-4" /> Explorar todo
                </button>
              </Link>
              <Link href="/register">
                <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-2xl border border-white/20 transition-all hover:scale-105 backdrop-blur">
                  Crear cuenta gratis <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 animate-fade-in-up">
              {[
                { value: 500, suffix: "+", label: "Publicaciones" },
                { value: 1200, suffix: "+", label: "Estudiantes" },
                { value: 12, suffix: "", label: "Categorías" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-black text-white">
                    <AnimatedCounter target={s.value} suffix={s.suffix} />
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Cards flotantes ── */}
          <div className="relative hidden lg:flex items-center justify-center h-[520px] animate-fade-in-up">
            {floatingCards[0] && (
              <div className="absolute top-8 left-16 rotate-[-6deg] animate-float z-30">
                <FloatingCard pub={floatingCards[0]} />
              </div>
            )}
            {floatingCards[1] && (
              <div className="absolute top-28 right-4 rotate-[5deg] animate-float z-20">
                <FloatingCard pub={floatingCards[1]} />
              </div>
            )}
            {floatingCards[2] && (
              <div className="absolute bottom-16 left-24 rotate-[3deg] animate-float z-10">
                <FloatingCard pub={floatingCards[2]} />
              </div>
            )}
            {/* Glow detrás de las cards */}
            <div className="w-64 h-64 bg-[#881a1d]/20 rounded-full blur-3xl" />
          </div>
        </div>

        {/* Separador ondulado */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 fill-white">
            <path d="M0,60 C360,0 1080,60 1440,20 L1440,60 Z" />
          </svg>
        </div>
      </section>

      {/* ══════════════ MARQUEE ══════════════ */}
      <section className="bg-white py-5 border-b border-gray-100 overflow-hidden">
        <div className="flex gap-6 animate-marquee whitespace-nowrap">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#881a1d]" />
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ══════════════ STATS BAR ══════════════ */}
      <section className="bg-[#881a1d] py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: <Package className="w-6 h-6" />, value: 500, suffix: "+", label: "Productos activos" },
              { icon: <Users className="w-6 h-6" />, value: 1200, suffix: "+", label: "Usuarios registrados" },
              { icon: <Zap className="w-6 h-6" />, value: 12, suffix: "", label: "Categorías" },
              { icon: <Star className="w-6 h-6" />, value: 48, suffix: "/5.0", label: "Calificación" },
            ].map((s, i) => (
              <div key={i} className="text-white">
                <div className="flex justify-center mb-2 text-[#f4c222]">{s.icon}</div>
                <p className="text-3xl font-black mb-1">
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </p>
                <p className="text-white/70 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ PUBLICACIONES ══════════════ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-[#881a1d]" />
                <span className="text-sm font-bold text-[#881a1d] uppercase tracking-widest">Destacados</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Lo más reciente</h2>
            </div>
            <Link href="/explore" className="hidden sm:flex items-center gap-1 text-sm font-bold text-[#881a1d] hover:underline">
              Ver todo <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-80" />
              ))}
            </div>
          ) : featuredCards.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredCards.map((p) => <PublicationCard key={p.id} product={p} />)}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-16">No hay publicaciones todavía</p>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link href="/explore">
              <Button variant="outline" className="rounded-full border-[#881a1d] text-[#881a1d]">
                Ver todo <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════ FEATURES ══════════════ */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-sm font-bold text-[#881a1d] uppercase tracking-widest">¿Por qué UCP Marketplace?</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2">Todo lo que necesitas</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: <ShieldCheck className="w-8 h-8" />, title: "100% verificado", desc: "Solo estudiantes UCP con correo institucional. Tu seguridad es prioridad.", color: "bg-blue-50 text-blue-600" },
              { icon: <Zap className="w-8 h-8" />, title: "Rápido y directo", desc: "Contacta al vendedor al instante con nuestro chat integrado o WhatsApp.", color: "bg-[#881a1d]/10 text-[#881a1d]" },
              { icon: <TrendingUp className="w-8 h-8" />, title: "Crece con nosotros", desc: "Publica tus productos y servicios, llega a toda la comunidad universitaria.", color: "bg-amber-50 text-amber-600" },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-lg transition-shadow group">
                <div className={`inline-flex p-3 rounded-2xl mb-5 ${f.color} group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CATEGORÍAS ══════════════ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-sm font-bold text-[#881a1d] uppercase tracking-widest">Explora</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2">Categorías</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {(categorias.length > 0 ? categorias : MARQUEE_ITEMS.slice(0, 6).map((n, i) => ({ id: String(i), nombre: n, slug: n.toLowerCase(), color: "#881a1d", icono: null }))).map((cat) => (
              <Link key={cat.id} href={`/explore?categoria=${cat.slug}`}>
                <div className="group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-transparent hover:border-[#881a1d] bg-gray-50 hover:bg-[#881a1d]/5 transition-all duration-200 cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm group-hover:bg-[#881a1d] flex items-center justify-center transition-colors shadow-sm">
                    <Package className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-sm font-bold text-gray-700 group-hover:text-[#881a1d] text-center transition-colors">
                    {cat.nombre}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA FINAL ══════════════ */}
      <section className="relative py-24 bg-[#0d0d0d] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#881a1d]/30 rounded-full blur-[100px]" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#f4c222]/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-[#f4c222]/20 text-[#f4c222] rounded-full px-4 py-1.5 text-sm font-bold mb-6">
            <Star className="w-4 h-4" /> Únete hoy
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 max-w-3xl mx-auto leading-tight">
            Haz parte del<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#881a1d] via-[#c55f23] to-[#f4c222]">
              marketplace UCP
            </span>
          </h2>
          <p className="text-white/50 text-lg mb-10 max-w-lg mx-auto">
            Crea tu cuenta con tu correo institucional y empieza a comprar, vender y conectar con tu comunidad.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register">
              <button className="bg-[#881a1d] hover:bg-[#6d1416] text-white font-bold px-10 py-4 rounded-2xl transition-all hover:scale-105 shadow-xl shadow-[#881a1d]/40 text-lg">
                Crear cuenta gratis
              </button>
            </Link>
            <Link href="/explore">
              <button className="bg-white/10 hover:bg-white/20 text-white font-semibold px-10 py-4 rounded-2xl border border-white/20 transition-all hover:scale-105 backdrop-blur text-lg">
                Explorar primero
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
