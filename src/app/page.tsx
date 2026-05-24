"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Search, ArrowRight, Package, Zap,
  Users, Star, TrendingUp, ChevronRight,
} from "lucide-react";
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

// ── Imágenes para categorías (Unsplash) ───────────────────────────────────────

const CAT_IMAGES: Record<string, string> = {
  eventos:       "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=700&q=80",
  libros:        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=700&q=80",
  oportunidades: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=700&q=80",
  servicios:     "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=700&q=80",
  tecnologia:    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=80",
  tutorias:      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=700&q=80",
  musica:        "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=700&q=80",
  arte:          "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=700&q=80",
  deporte:       "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=700&q=80",
  gastronomia:   "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&q=80",
  electronica:   "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=700&q=80",
  fotografia:    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=700&q=80",
};

const DEFAULT_CAT_IMAGE = "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=700&q=80";

function getCatImage(nombre: string): string {
  const key = nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "");
  return CAT_IMAGES[key] ?? DEFAULT_CAT_IMAGE;
}

// ── Componentes helpers ───────────────────────────────────────────────────────

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
        {pub.precio
          ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(pub.precio)
          : "Gratis"}
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

const MARQUEE_ITEMS = [
  "Tecnología", "Libros", "Tutorías", "Servicios", "Eventos",
  "Convocatorias", "Electrónica", "Arte", "Deporte", "Gastronomía", "Música", "Fotografía",
];

const EASE_OUT = [0.25, 0.1, 0.25, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: EASE_OUT },
  }),
};

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {children}
    </motion.section>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function HomePage() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    (async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          fetch("/api/publicaciones"),
          fetch("/api/categorias"),
        ]);
        const pData = await pRes.json();
        const cData = await cRes.json();
        setPublicaciones(pData.data || []);
        setCategorias(cData);
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, [mounted]);

  const floatingCards  = publicaciones.slice(0, 3);
  const featuredCards  = publicaciones.slice(0, 8);

  const displayCats = categorias.length > 0
    ? categorias
    : MARQUEE_ITEMS.slice(0, 6).map((n, i) => ({
        id: String(i), nombre: n,
        slug: n.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""),
        color: "#881a1d", icono: null,
      }));

  // Imagen del panel derecho de categorías
  const activeCatImage = hoveredCat
    ? getCatImage(hoveredCat)
    : getCatImage(displayCats[0]?.nombre ?? "");

  return (
    <div suppressHydrationWarning className="overflow-x-hidden">

      {/* ══════════════ HERO ══════════════ */}
      <section
        className="relative min-h-[92vh] flex items-center overflow-hidden"
        style={{ background: "linear-gradient(140deg, #881a1d 0%, #9a1f22 40%, #c55f23 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/15 rounded-full -translate-x-1/4 translate-y-1/3" />
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-[#f4c222]/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "36px 36px",
            }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.h1
              className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] text-white mb-6"
              variants={fadeUp} initial="hidden" animate="visible" custom={0}
            >
              Compra, vende<br />
              <span className="text-[#f4c222]">conecta</span>{" "}en la UCP
            </motion.h1>

            <motion.p
              className="text-lg text-white/70 mb-10 max-w-lg leading-relaxed"
              variants={fadeUp} initial="hidden" animate="visible" custom={1}
            >
              La plataforma exclusiva para la comunidad de la Universidad Católica de Pereira. Productos, servicios, eventos y oportunidades — todo en un lugar.
            </motion.p>

            <motion.div className="relative mb-8" variants={fadeUp} initial="hidden" animate="visible" custom={2}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="Buscar productos, servicios, eventos…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim())
                    window.location.href = "/explore?q=" + encodeURIComponent(searchQuery.trim());
                }}
                className="w-full pl-12 pr-36 py-4 rounded-2xl bg-white/15 backdrop-blur border border-white/25 text-white placeholder-white/45 focus:outline-none focus:border-white/60 focus:bg-white/20 transition-all text-sm"
              />
              <button
                onClick={() => {
                  if (searchQuery.trim())
                    window.location.href = "/explore?q=" + encodeURIComponent(searchQuery.trim());
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-[#881a1d] hover:bg-white/90 text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
              >
                Buscar
              </button>
            </motion.div>

            <motion.div className="flex flex-wrap gap-3 mb-12" variants={fadeUp} initial="hidden" animate="visible" custom={3}>
              <Link href="/explore">
                <button className="flex items-center gap-2 bg-white text-[#881a1d] font-bold px-7 py-3.5 rounded-2xl transition-all hover:scale-105 shadow-xl hover:shadow-2xl">
                  <Package className="w-4 h-4" />Explorar todo
                </button>
              </Link>
              <Link href="/register">
                <button className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold px-7 py-3.5 rounded-2xl border border-white/30 transition-all hover:scale-105 backdrop-blur">
                  Crear cuenta gratis<ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </motion.div>

            <motion.div className="flex gap-8" variants={fadeUp} initial="hidden" animate="visible" custom={4}>
              {[
                { value: 500, suffix: "+", label: "Publicaciones" },
                { value: 1200, suffix: "+", label: "Estudiantes" },
                { value: 12, suffix: "", label: "Categorías" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-black text-white">
                    <AnimatedCounter target={s.value} suffix={s.suffix} />
                  </p>
                  <p className="text-xs text-white/45 mt-0.5">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            className="relative hidden lg:flex items-center justify-center h-[520px]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {floatingCards[0] && (
              <div className="absolute top-8 left-16 rotate-[-6deg] animate-float z-30">
                <FloatingCard pub={floatingCards[0]} />
              </div>
            )}
            {floatingCards[1] && (
              <div className="absolute top-28 right-4 rotate-[5deg] animate-float z-20" style={{ animationDelay: "0.8s" }}>
                <FloatingCard pub={floatingCards[1]} />
              </div>
            )}
            {floatingCards[2] && (
              <div className="absolute bottom-16 left-24 rotate-[3deg] animate-float z-10" style={{ animationDelay: "1.6s" }}>
                <FloatingCard pub={floatingCards[2]} />
              </div>
            )}
            <div className="w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          </motion.div>
        </div>

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
              <span className="w-1.5 h-1.5 rounded-full bg-[#881a1d]" />{item}
            </span>
          ))}
        </div>
      </section>

      {/* ══════════════ STATS BAR ══════════════ */}
      <section className="bg-[#881a1d] py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: <Package className="w-6 h-6" />, value: 500,  suffix: "+",    label: "Productos activos" },
              { icon: <Users   className="w-6 h-6" />, value: 1200, suffix: "+",    label: "Usuarios registrados" },
              { icon: <Zap     className="w-6 h-6" />, value: 12,   suffix: "",     label: "Categorías" },
              { icon: <Star    className="w-6 h-6" />, value: 48,   suffix: "/5.0", label: "Calificación promedio" },
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

      {/* ══════════════ PUBLICACIONES RECIENTES ══════════════ */}
      <Section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div className="flex items-end justify-between mb-10" variants={fadeUp} custom={0}>
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
          </motion.div>

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
      </Section>

      {/* ══════════════════════════════════════════════════════════════════
          ¿POR QUÉ UCP MARKETPLACE? — Bento magazine con fotos reales
      ══════════════════════════════════════════════════════════════════ */}
      <Section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">

          {/* Encabezado */}
          <motion.div className="text-center mb-14" variants={fadeUp} custom={0}>
            <span className="text-sm font-bold text-[#881a1d] uppercase tracking-widest">¿Por qué elegirnos?</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2">
              Hecho para la comunidad UCP
            </h2>
          </motion.div>

          {/* ── Bento grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 md:auto-rows-[300px] gap-4 max-w-6xl mx-auto">

            {/* Card 1 — Grande, 2 columnas × 2 filas */}
            <motion.div
              className="md:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden group min-h-[320px] cursor-pointer"
              variants={fadeUp}
              custom={1}
            >
              <img
                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1000&q=80"
                alt="Comunidad UCP verificada"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Gradiente oscuro */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />

              {/* Número decorativo */}
              <span className="absolute top-7 left-8 text-[7rem] font-black text-white/10 leading-none select-none">
                01
              </span>

              {/* Texto */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <span className="inline-block text-[#f4c222] text-xs font-bold uppercase tracking-widest mb-3">
                  Comunidad
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 leading-tight">
                  Comunidad verificada
                </h3>
                <p className="text-white/65 text-sm sm:text-base leading-relaxed max-w-md">
                  Solo estudiantes y aliados de la UCP. Tu seguridad y confianza importan desde el primer clic.
                </p>
              </div>
            </motion.div>

            {/* Card 2 — Pequeña, columna derecha fila 1 */}
            <motion.div
              className="relative rounded-3xl overflow-hidden group min-h-[260px] cursor-pointer"
              variants={fadeUp}
              custom={2}
            >
              <img
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=700&q=80"
                alt="Contacto directo"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#881a1d]/90 via-[#881a1d]/30 to-transparent" />

              <span className="absolute top-5 left-6 text-[5.5rem] font-black text-white/10 leading-none select-none">
                02
              </span>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="inline-block text-white/60 text-[10px] font-bold uppercase tracking-widest mb-2">
                  Conexión
                </span>
                <h3 className="text-xl font-black text-white mb-1.5 leading-snug">
                  Contacto directo
                </h3>
                <p className="text-white/65 text-sm leading-relaxed">
                  Sin intermediarios. Chat o WhatsApp al instante.
                </p>
              </div>
            </motion.div>

            {/* Card 3 — Pequeña, columna derecha fila 2 */}
            <motion.div
              className="relative rounded-3xl overflow-hidden group min-h-[260px] cursor-pointer"
              variants={fadeUp}
              custom={3}
            >
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&q=80"
                alt="Crece dentro del campus"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/35 to-transparent" />

              <span className="absolute top-5 left-6 text-[5.5rem] font-black text-white/10 leading-none select-none">
                03
              </span>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="inline-block text-[#f4c222]/80 text-[10px] font-bold uppercase tracking-widest mb-2">
                  Crecimiento
                </span>
                <h3 className="text-xl font-black text-white mb-1.5 leading-snug">
                  Crece en el campus
                </h3>
                <p className="text-white/65 text-sm leading-relaxed">
                  Llega a más de 1.200 personas del campus.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════════
          CATEGORÍAS — Split screen interactivo + Grid móvil
      ══════════════════════════════════════════════════════════════════ */}
      <Section className="py-24 bg-white">
        <div className="container mx-auto px-4">

          {/* Encabezado */}
          <motion.div className="text-center mb-12" variants={fadeUp} custom={0}>
            <span className="text-sm font-bold text-[#881a1d] uppercase tracking-widest">Explora</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2">Categorías</h2>
          </motion.div>

          {/* ── Desktop: split screen ── */}
          <div className="hidden md:flex max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl h-[500px]"
               style={{ boxShadow: "0 25px 60px -10px rgba(136,26,29,0.35)" }}>

            {/* Panel izquierdo — rojo institucional UCP */}
            <div
              className="w-[42%] flex flex-col shrink-0 relative overflow-hidden"
              style={{ background: "linear-gradient(160deg, #6b1215 0%, #881a1d 55%, #a02224 100%)" }}
            >
              {/* Patrón de puntos decorativo */}
              <div
                className="absolute inset-0 opacity-[0.07] pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                  backgroundSize: "20px 20px",
                }}
              />

              {/* Header */}
              <div className="relative px-8 pt-8 pb-5 border-b border-white/10">
                <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">
                  Navegar por
                </p>
                <p className="text-white text-xl font-black tracking-tight">
                  Todas las categorías
                </p>
              </div>

              {/* Lista */}
              <div className="relative flex-1 overflow-y-auto">
                {displayCats.map((cat, i) => {
                  const active = hoveredCat === cat.nombre;
                  return (
                    <motion.div key={cat.id} variants={fadeUp} custom={i * 0.25}>
                      <Link href={`/explore?categoria=${cat.slug}`}>
                        <div
                          onMouseEnter={() => setHoveredCat(cat.nombre)}
                          onMouseLeave={() => setHoveredCat(null)}
                          className={`flex items-center gap-4 px-8 py-[14px] border-b border-white/[0.07] cursor-pointer transition-all duration-200 ${
                            active ? "bg-white/15 pl-10" : "hover:bg-white/8"
                          }`}
                        >
                          {/* Número */}
                          <span className={`text-xs font-bold w-5 shrink-0 tabular-nums transition-colors duration-200 ${
                            active ? "text-[#f4c222]/70" : "text-white/25"
                          }`}>
                            {String(i + 1).padStart(2, "0")}
                          </span>

                          {/* Nombre */}
                          <span className={`text-[15px] font-black transition-all duration-200 leading-none tracking-tight ${
                            active ? "text-[#f4c222]" : "text-white/85 hover:text-white"
                          }`}>
                            {cat.nombre}
                          </span>

                          {/* Flecha animada */}
                          <ChevronRight className={`w-4 h-4 ml-auto transition-all duration-200 shrink-0 ${
                            active
                              ? "text-[#f4c222] opacity-100 translate-x-0"
                              : "text-white/0 -translate-x-2"
                          }`} />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Degradado bottom para indicar scroll */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#6b1215]/80 to-transparent pointer-events-none" />
            </div>

            {/* Panel derecho — foto que cambia */}
            <div className="flex-1 relative overflow-hidden bg-[#3a0a0c]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeCatImage}
                  src={activeCatImage}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                />
              </AnimatePresence>

              {/* Overlay con tinte institucional en el borde izquierdo */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(to right, rgba(107,18,21,0.45) 0%, transparent 50%)",
                }}
              />

              {/* Etiqueta de categoría activa */}
              <AnimatePresence mode="wait">
                {hoveredCat ? (
                  <motion.div
                    key={hoveredCat}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="absolute bottom-8 right-8 text-right pointer-events-none"
                  >
                    <p className="text-[#f4c222]/70 text-[10px] font-bold uppercase tracking-[0.18em] mb-1">
                      Categoría
                    </p>
                    <p className="text-white text-3xl font-black drop-shadow-lg tracking-tight">{hoveredCat}</p>
                    <span className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-[#881a1d] bg-[#f4c222] px-3.5 py-1.5 rounded-full shadow-md">
                      Ver publicaciones <ChevronRight className="w-3 h-3" />
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-end justify-end p-8 pointer-events-none"
                  >
                    <span className="inline-flex items-center gap-2 text-white/30 text-xs font-semibold bg-black/20 backdrop-blur-sm px-3 py-2 rounded-full border border-white/10">
                      Pasa el cursor para explorar
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Móvil: grid de fotos ── */}
          <div className="md:hidden grid grid-cols-2 gap-3">
            {displayCats.map((cat, i) => (
              <motion.div key={cat.id} variants={fadeUp} custom={i * 0.2}>
                <Link href={`/explore?categoria=${cat.slug}`}>
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] group cursor-pointer">
                    {/* Foto */}
                    <img
                      src={getCatImage(cat.nombre)}
                      alt={cat.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Gradiente permanente desde abajo */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#881a1d]/95 via-[#881a1d]/10 to-transparent" />
                    {/* Overlay rojo institucional en hover */}
                    <div className="absolute inset-0 bg-[#881a1d]/0 group-hover:bg-[#881a1d]/50 transition-colors duration-300" />
                    {/* Nombre */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <span className="text-white font-black text-sm leading-tight tracking-tight">{cat.nombre}</span>
                    </div>
                    {/* Número decorativo */}
                    <span className="absolute top-2.5 right-3 text-white/20 text-[10px] font-black tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

        </div>
      </Section>

      {/* ══════════════ CTA FINAL ══════════════ */}
      <Section className="relative py-24 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, #881a1d 0%, #9a1f22 50%, #c55f23 100%)" }}
        />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#f4c222]/10 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.h2
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 max-w-3xl mx-auto leading-tight"
            variants={fadeUp} custom={0}
          >
            Haz parte del<br />
            <span className="text-[#f4c222]">marketplace UCP</span>
          </motion.h2>

          <motion.p className="text-white/65 text-lg mb-10 max-w-lg mx-auto" variants={fadeUp} custom={1}>
            Crea tu cuenta con tu correo institucional y empieza a comprar, vender y conectar con toda tu comunidad.
          </motion.p>

          <motion.div className="flex flex-wrap gap-4 justify-center" variants={fadeUp} custom={2}>
            <Link href="/register">
              <button className="bg-white text-[#881a1d] font-bold px-10 py-4 rounded-2xl transition-all hover:scale-105 shadow-xl text-lg hover:shadow-2xl">
                Crear cuenta gratis
              </button>
            </Link>
            <Link href="/explore">
              <button className="bg-white/15 hover:bg-white/25 text-white font-semibold px-10 py-4 rounded-2xl border border-white/30 transition-all hover:scale-105 backdrop-blur text-lg">
                Explorar primero
              </button>
            </Link>
          </motion.div>
        </div>
      </Section>

    </div>
  );
}
