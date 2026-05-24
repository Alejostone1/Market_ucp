"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, Mail, Lock, User, ArrowRight,
  GraduationCap, Building2, Info, CheckCircle2, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

const isUcpEmail = (email: string) =>
  email.toLowerCase().trim().endsWith("@ucp.edu.co");

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rol, setRol] = useState<"ESTUDIANTE" | "ALIADO">("ESTUDIANTE");
  const [email, setEmail] = useState("");
  const router = useRouter();

  const emailTyped = email.includes("@");
  const ucpEmail = isUcpEmail(email);
  // Ambos roles requieren correo @ucp.edu.co
  const showEmailWarning = emailTyped && !ucpEmail;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validar dominio UCP para AMBOS roles
    if (!isUcpEmail(email)) {
      toast.error("Solo se permiten correos institucionales @ucp.edu.co");
      return;
    }

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const nombre = formData.get("nombre") as string;
    const correo = formData.get("email") as string;
    const contrasena = formData.get("password") as string;
    const confirmar = formData.get("confirmPassword") as string;

    if (contrasena !== confirmar) {
      toast.error("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, contrasena, rol }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Error al crear la cuenta");
        return;
      }

      const usuarioString = JSON.stringify(data.usuario);
      localStorage.setItem("usuario", usuarioString);
      document.cookie = `usuario=${encodeURIComponent(usuarioString)}; path=/; max-age=604800`;

      toast.success("¡Cuenta creada exitosamente!");
      router.push("/dashboard/student");
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ══════════════ PANEL IZQUIERDO — Marca ══════════════ */}
      <motion.div
        className="hidden lg:flex flex-col w-[44%] relative overflow-hidden"
        style={{ background: "linear-gradient(140deg, #881a1d 0%, #9e2124 50%, #c55f23 100%)" }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55 }}
      >
        {/* Decoraciones */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/3 -translate-x-1/3" />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-[#881a1d] font-black text-sm leading-none">UCP</span>
            </div>
            <div>
              <p className="text-white font-bold leading-tight">UCP Marketplace</p>
              <p className="text-white/55 text-xs">Universidad Católica de Pereira</p>
            </div>
          </Link>

          <div className="flex-1 flex flex-col justify-center">
            <motion.h2
              className="text-4xl font-black text-white leading-[1.15] mb-4"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Forma parte de<br />
              la comunidad<br />
              <span className="text-[#f4c222]">UCP</span>
            </motion.h2>

            <motion.p
              className="text-white/75 text-sm leading-relaxed mb-10 max-w-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Conecta con más de 1.200 estudiantes y empresas aliadas de la Universidad Católica de Pereira.
            </motion.p>

            {/* Roles */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <p className="text-white/50 text-xs uppercase font-semibold tracking-widest mb-3">
                Elige tu rol
              </p>

              <div
                className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                  rol === "ESTUDIANTE"
                    ? "bg-white/20 border-white/50 shadow-lg"
                    : "bg-white/5 border-white/15 hover:bg-white/10"
                }`}
                onClick={() => setRol("ESTUDIANTE")}
              >
                <div className="flex items-center gap-2.5 mb-1">
                  <GraduationCap className="w-4 h-4 text-[#f4c222]" />
                  <p className="text-white font-semibold text-sm">Estudiante UCP</p>
                  {rol === "ESTUDIANTE" && <CheckCircle2 className="w-4 h-4 text-[#f4c222] ml-auto" />}
                </div>
                <p className="text-white/60 text-xs leading-relaxed">
                  Compra, vende y conecta con toda la comunidad universitaria.
                </p>
              </div>

              <div
                className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                  rol === "ALIADO"
                    ? "bg-white/20 border-white/50 shadow-lg"
                    : "bg-white/5 border-white/15 hover:bg-white/10"
                }`}
                onClick={() => setRol("ALIADO")}
              >
                <div className="flex items-center gap-2.5 mb-1">
                  <Building2 className="w-4 h-4 text-[#f4c222]" />
                  <p className="text-white font-semibold text-sm">Aliado / Empresa</p>
                  {rol === "ALIADO" && <CheckCircle2 className="w-4 h-4 text-[#f4c222] ml-auto" />}
                </div>
                <p className="text-white/60 text-xs leading-relaxed">
                  Empresa o profesional que publica ofertas y servicios para la comunidad.
                </p>
              </div>
            </motion.div>

            {/* Info UCP email */}
            <motion.div
              className="mt-8 flex items-start gap-2.5 bg-white/10 rounded-xl p-4 border border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Info className="w-4 h-4 text-[#f4c222] shrink-0 mt-0.5" />
              <p className="text-white/65 text-xs leading-relaxed">
                Necesitas un correo <strong className="text-white/90">@ucp.edu.co</strong> para registrarte. Si eres aliado externo, escribe a{" "}
                <strong className="text-[#f4c222]">admin@ucp.edu.co</strong>.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ══════════════ PANEL DERECHO — Formulario ══════════════ */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-white overflow-y-auto">
        <motion.div
          className="w-full max-w-[420px] py-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Logo móvil */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 bg-[#881a1d] rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-sm">UCP</span>
              </div>
              <span className="font-bold text-gray-900 text-lg">UCP Marketplace</span>
            </Link>
          </div>

          {/* Selector de rol (móvil) */}
          <div className="lg:hidden mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-2">Tipo de cuenta</p>
            <div className="grid grid-cols-2 gap-2">
              {(["ESTUDIANTE", "ALIADO"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRol(r)}
                  className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    rol === r
                      ? "border-[#881a1d] bg-[#881a1d]/5 text-[#881a1d]"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {r === "ESTUDIANTE" ? "Estudiante" : "Aliado"}
                </button>
              ))}
            </div>
          </div>

          <h1 className="text-3xl font-black text-gray-900 mb-1">Crear cuenta</h1>
          <p className="text-gray-500 text-sm mb-6">
            {rol === "ALIADO"
              ? "Regístrate como aliado con tu correo @ucp.edu.co"
              : "Regístrate con tu correo institucional UCP"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nombre completo
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  name="nombre"
                  type="text"
                  placeholder="Juan Pérez"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#881a1d] focus:ring-2 focus:ring-[#881a1d]/10 transition-all text-sm bg-gray-50 hover:bg-white focus:bg-white placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Correo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Correo institucional
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@ucp.edu.co"
                  required
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border transition-all text-sm bg-gray-50 hover:bg-white focus:bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
                    emailTyped && ucpEmail
                      ? "border-green-400 focus:border-green-500 focus:ring-green-500/10"
                      : emailTyped && !ucpEmail
                      ? "border-amber-400 focus:border-amber-500 focus:ring-amber-500/10"
                      : "border-gray-200 focus:border-[#881a1d] focus:ring-[#881a1d]/10"
                  }`}
                />
                {emailTyped && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    {ucpEmail ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Alerta correo no UCP (aplica para ambos roles) */}
            <AnimatePresence>
              {showEmailWarning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-800 font-semibold text-sm mb-1">
                          Correo institucional requerido
                        </p>
                        <p className="text-red-700 text-xs leading-relaxed">
                          Solo se permiten correos <strong>@ucp.edu.co</strong>. Si no tienes correo institucional, escribe a{" "}
                          <a
                            href="mailto:admin@ucp.edu.co?subject=Solicitud%20de%20Acceso"
                            className="font-semibold underline"
                          >
                            admin@ucp.edu.co
                          </a>
                          .
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
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

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Repite tu contraseña"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#881a1d] focus:ring-2 focus:ring-[#881a1d]/10 transition-all text-sm bg-gray-50 hover:bg-white focus:bg-white placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Botón */}
            <motion.button
              type="submit"
              disabled={isLoading || showEmailWarning}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[#881a1d] hover:bg-[#6d1416] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#881a1d]/20 mt-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                <>
                  Crear cuenta gratis
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <p className="mt-5 text-sm text-gray-600 text-center">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-[#881a1d] font-bold hover:underline">
              Inicia sesión
            </Link>
          </p>

          <p className="mt-4 text-xs text-gray-400 text-center">
            Al registrarte aceptas los términos de uso de UCP Marketplace
          </p>
        </motion.div>
      </div>
    </div>
  );
}
