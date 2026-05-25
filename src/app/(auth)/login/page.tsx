"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, Mail, Lock, ArrowRight,
  ShieldCheck, Zap, Package, ShieldX,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

function getRolRedirect(rol: string): string {
  if (rol === "ADMIN") return "/admin/dashboard";
  return "/dashboard/student";
}

const BENEFITS = [
  { icon: <ShieldCheck className="w-4 h-4" />, text: "Solo estudiantes verificados UCP" },
  { icon: <Zap className="w-4 h-4" />, text: "Chat directo con vendedores" },
  { icon: <Package className="w-4 h-4" />, text: "Compra y vende sin comisiones" },
];

const STATS = [
  { value: "500+", label: "Publicaciones" },
  { value: "1.2k+", label: "Estudiantes" },
  { value: "4.8★", label: "Calificación" },
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [blockedError, setBlockedError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setBlockedError(null);
    try {
      const usuarioLogueado = await login(email, password);
      router.push(getRolRedirect(usuarioLogueado?.rol));
    } catch (err: unknown) {
      const status = (err as Error & { status?: number })?.status;
      if (status === 403) {
        setBlockedError((err as Error).message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ══════════════ PANEL IZQUIERDO — Marca (solo desktop) ══════════════ */}
      <motion.div
        className="hidden lg:flex flex-col w-[56%] relative overflow-hidden"
        style={{ background: "linear-gradient(140deg, #881a1d 0%, #9e2124 45%, #c55f23 100%)" }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55 }}
      >
        {/* Decoraciones de fondo */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-white/5 rounded-full -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-black/10 rounded-full translate-y-1/3 -translate-x-1/3" />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col h-full p-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
              <span className="text-[#881a1d] font-black text-sm leading-none">UCP</span>
            </div>
            <div>
              <p className="text-white font-bold leading-tight">UCP Marketplace</p>
              <p className="text-white/55 text-xs">Universidad Católica de Pereira</p>
            </div>
          </Link>

          <div className="flex-1 flex flex-col justify-center">
            <motion.h2
              className="text-5xl font-black text-white leading-[1.1] mb-5"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Tu comunidad<br />
              universitaria<br />
              <span className="text-[#f4c222]">en un solo lugar</span>
            </motion.h2>

            <motion.p
              className="text-white/75 text-base leading-relaxed mb-10 max-w-sm"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Conecta con estudiantes, encuentra lo que necesitas y dale vida a tus ideas dentro del campus.
            </motion.p>

            <motion.div
              className="space-y-3 mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {BENEFITS.map((b, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-[#f4c222] shrink-0">
                    {b.icon}
                  </div>
                  <p className="text-white/80 text-sm">{b.text}</p>
                </div>
              ))}
            </motion.div>

            <motion.div
              className="grid grid-cols-3 gap-3 mb-8"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              {STATS.map((s) => (
                <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
                  <p className="text-white font-black text-xl">{s.value}</p>
                  <p className="text-white/55 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </motion.div>

            <motion.blockquote
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65, duration: 0.6 }}
            >
              <p className="text-white/80 text-sm italic leading-relaxed mb-3">
                "Vendí mi portátil en menos de 24 horas y encontré los apuntes de Cálculo que necesitaba. Lo que le faltaba al campus."
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#f4c222] flex items-center justify-center text-[#881a1d] font-black text-sm shrink-0">
                  V
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">Valentina G.</p>
                  <p className="text-white/50 text-[11px]">Derecho · Semestre 6 · 2026</p>
                </div>
              </div>
            </motion.blockquote>
          </div>
        </div>
      </motion.div>

      {/* ══════════════ PANEL DERECHO — Formulario ══════════════ */}
      <div className="flex-1 flex flex-col bg-white overflow-y-auto">

        {/* ── Banner de marca SOLO MÓVIL ─────────────────────────────────── */}
        <div
          className="lg:hidden relative overflow-hidden flex-shrink-0"
          style={{ background: "linear-gradient(140deg, #881a1d 0%, #9e2124 50%, #c55f23 100%)" }}
        >
          {/* Puntos decorativos */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />

          <div className="relative z-10 px-6 pt-10 pb-16 flex flex-col items-center text-center">
            <Link href="/" className="flex flex-col items-center gap-2 mb-5">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-[#881a1d] font-black text-base leading-none">UCP</span>
              </div>
              <div>
                <p className="text-white font-black text-lg leading-tight">UCP Marketplace</p>
                <p className="text-white/60 text-xs">Universidad Católica de Pereira</p>
              </div>
            </Link>

            {/* Stats chips */}
            <div className="flex items-center justify-center gap-2">
              {STATS.map((s) => (
                <div key={s.label} className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-white/10">
                  <p className="text-white font-black text-sm leading-tight">{s.value}</p>
                  <p className="text-white/60 text-[10px]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tarjeta del formulario ──────────────────────────────────────── */}
        <div className="flex-1 flex flex-col items-center px-4 sm:px-8 lg:px-10 lg:justify-center">
          <motion.div
            className="w-full max-w-[400px] bg-white rounded-2xl lg:rounded-none shadow-xl lg:shadow-none p-6 sm:p-7 lg:p-0 -mt-8 lg:mt-0 relative"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Mascota animada */}
            <div className="flex flex-col items-center mb-5">
              <motion.div
                className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl shadow-lg mb-1.5 flex items-center justify-center text-3xl cursor-default select-none"
                style={{ background: "linear-gradient(135deg, #881a1d, #c55f23)" }}
                animate={{
                  scale: passwordFocused ? 1.1 : 1,
                  rotate: passwordFocused ? -6 : 0,
                }}
                transition={{ type: "spring", stiffness: 380, damping: 20 }}
              >
                <AnimatePresence mode="wait">
                  {passwordFocused ? (
                    <motion.span
                      key="hiding"
                      initial={{ scale: 0, rotate: -25 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.22 }}
                    >
                      🙈
                    </motion.span>
                  ) : (
                    <motion.span
                      key="open"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      🎓
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>

              <AnimatePresence>
                {passwordFocused && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs text-gray-400"
                  >
                    ¡No miro nada! 🤫
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 text-center mb-1">
              Bienvenido de vuelta
            </h1>
            <p className="text-gray-500 text-sm text-center mb-6">
              Ingresa con tu cuenta institucional UCP
            </p>

            {/* Banner cuenta bloqueada / no verificada */}
            <AnimatePresence>
              {blockedError && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.25 }}
                  className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 flex gap-3"
                >
                  <div className="shrink-0 w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                    <ShieldX className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-800 leading-tight mb-0.5">
                      Acceso restringido
                    </p>
                    <p className="text-xs text-red-700 leading-relaxed">
                      {blockedError}
                    </p>
                    <p className="text-xs text-red-600 mt-1.5 font-medium">
                      ¿Necesitas ayuda? Escríbenos a{" "}
                      <a
                        href="mailto:admin@ucp.edu.co"
                        className="underline underline-offset-2 hover:text-red-800"
                      >
                        admin@ucp.edu.co
                      </a>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Correo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Correo institucional
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setBlockedError(null); }}
                    placeholder="nombre@ucp.edu.co"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#881a1d] focus:ring-2 focus:ring-[#881a1d]/10 transition-all text-sm bg-gray-50 hover:bg-white focus:bg-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#881a1d] focus:ring-2 focus:ring-[#881a1d]/10 transition-all text-sm bg-gray-50 hover:bg-white focus:bg-white placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Botón */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#881a1d] hover:bg-[#6d1416] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#881a1d]/20 mt-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Ingresando...
                  </>
                ) : (
                  <>
                    Iniciar sesión
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-5 text-center space-y-3">
              <p className="text-sm text-gray-600">
                ¿Primera vez aquí?{" "}
                <Link href="/register" className="text-[#881a1d] font-bold hover:underline">
                  Crea tu cuenta gratis
                </Link>
              </p>
              <div className="pt-3 border-t">
                <p className="text-xs text-gray-400">
                  Roles: Estudiante · Aliado · Administrador
                </p>
              </div>
            </div>
          </motion.div>

          {/* Beneficios — solo móvil, debajo de la tarjeta */}
          <div className="lg:hidden w-full max-w-[400px] mt-5 mb-8 space-y-2.5 px-1">
            {BENEFITS.map((b, i) => (
              <div key={i} className="flex items-center gap-3 text-gray-500">
                <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-[#881a1d] shrink-0">
                  {b.icon}
                </div>
                <p className="text-xs">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
