"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, Mail, Lock, User, ArrowRight,
  GraduationCap, Building2, Info, CheckCircle2, AlertCircle, Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

// ── Helpers ───────────────────────────────────────────────────────────────────

const isUcpEmail   = (e: string) => e.toLowerCase().trim().endsWith("@ucp.edu.co");
const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

// ── Página ────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const [showPassword, setShowPassword]   = useState(false);
  const [isLoading,    setIsLoading]      = useState(false);
  const [rol,          setRol]            = useState<"ESTUDIANTE" | "ALIADO">("ESTUDIANTE");
  const [email,        setEmail]          = useState("");

  // Estado de verificación de correo duplicado
  const [emailExists,      setEmailExists]      = useState<boolean | null>(null);
  const [checkingEmail,    setCheckingEmail]    = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  // ── Derivaciones de estado ────────────────────────────────────────────────
  const emailTyped       = email.includes("@");
  const ucpEmail         = isUcpEmail(email);
  const showEmailWarning = rol === "ESTUDIANTE" && emailTyped && !ucpEmail;

  // ── Verificación de correo en tiempo real (debounced 600ms) ──────────────
  useEffect(() => {
    // Cancelar debounce anterior
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setEmailExists(null);

    // No verificar si aún no hay @
    if (!emailTyped) return;

    // Para ESTUDIANTE solo verificar existencia si ya es UCP (evitar ruido)
    if (rol === "ESTUDIANTE" && !ucpEmail) return;

    // Para ALIADO verificar solo si tiene formato válido
    if (rol === "ALIADO" && !isValidEmail(email)) return;

    debounceRef.current = setTimeout(async () => {
      setCheckingEmail(true);
      try {
        const res  = await fetch(
          `/api/auth/check-email?correo=${encodeURIComponent(email.toLowerCase().trim())}`
        );
        const data = await res.json();
        setEmailExists(data.exists ?? false);
      } catch {
        setEmailExists(null);
      } finally {
        setCheckingEmail(false);
      }
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, rol]);

  // ── Cambio de rol ─────────────────────────────────────────────────────────
  const handleRolChange = (nuevoRol: "ESTUDIANTE" | "ALIADO") => {
    setRol(nuevoRol);
    setEmail("");
    setEmailExists(null);
    setCheckingEmail(false);
  };

  // ── Clases del campo email ─────────────────────────────────────────────────
  const emailBorderClass = (() => {
    if (!emailTyped) return "border-gray-200 focus:border-[#881a1d] focus:ring-[#881a1d]/10";
    if (emailExists === true) return "border-red-400 focus:border-red-500 focus:ring-red-500/10";
    if (rol === "ESTUDIANTE") {
      return ucpEmail
        ? "border-green-400 focus:border-green-500 focus:ring-green-500/10"
        : "border-amber-400 focus:border-amber-500 focus:ring-amber-500/10";
    }
    // ALIADO — neutral hasta que se confirme
    return "border-gray-200 focus:border-[#881a1d] focus:ring-[#881a1d]/10";
  })();

  // ── Ícono dentro del campo email ──────────────────────────────────────────
  const EmailIcon = () => {
    if (!emailTyped) return null;
    if (checkingEmail) {
      return (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
        </div>
      );
    }
    if (emailExists === true) {
      return (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
          <AlertCircle className="w-4 h-4 text-red-500" />
        </div>
      );
    }
    if (rol === "ESTUDIANTE") {
      return (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
          {ucpEmail
            ? <CheckCircle2 className="w-4 h-4 text-green-500" />
            : <AlertCircle  className="w-4 h-4 text-amber-500" />
          }
        </div>
      );
    }
    return null;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Guardas frontend
    if (rol === "ESTUDIANTE" && !isUcpEmail(email)) {
      toast.error("Los estudiantes deben usar un correo institucional @ucp.edu.co");
      return;
    }
    if (rol === "ALIADO" && !isValidEmail(email)) {
      toast.error("Ingresa un correo electrónico válido");
      return;
    }
    if (emailExists === true) {
      toast.error("Este correo ya está registrado. Intenta iniciar sesión.");
      return;
    }

    setIsLoading(true);
    const formData   = new FormData(e.currentTarget);
    const nombre     = formData.get("nombre")          as string;
    const correo     = formData.get("email")           as string;
    const contrasena = formData.get("password")        as string;
    const confirmar  = formData.get("confirmPassword") as string;

    if (contrasena !== confirmar) {
      toast.error("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ nombre, correo, contrasena, rol }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 409 → correo duplicado — mostrar error inline además del toast
        if (response.status === 409) {
          setEmailExists(true);
          toast.error("Este correo ya está registrado.");
        } else {
          toast.error(data.message || "Error al crear la cuenta");
        }
        return;
      }

      // ── Post-registro según rol ──────────────────────────────────────────
      if (rol === "ALIADO") {
        toast.success("¡Solicitud enviada! Tu cuenta está pendiente de aprobación.", {
          duration: 5000,
        });
        router.push("/pending-approval");
        return;
      }

      // ESTUDIANTE — cuenta activa de inmediato
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

  // ── Textos dinámicos según rol ────────────────────────────────────────────
  const emailLabel       = rol === "ESTUDIANTE" ? "Correo institucional"        : "Correo electrónico";
  const emailPlaceholder = rol === "ESTUDIANTE" ? "nombre@ucp.edu.co"           : "tu@empresa.com";
  const subtitle         = rol === "ESTUDIANTE"
    ? "Regístrate con tu correo institucional @ucp.edu.co"
    : "Regístrate con cualquier correo electrónico válido";

  // Botón deshabilitado si hay advertencia de dominio o correo ya existe
  const submitDisabled = isLoading || showEmailWarning || emailExists === true || checkingEmail;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ══ PANEL IZQUIERDO — Marca (solo desktop) ══════════════════════════ */}
      <motion.div
        className="hidden lg:flex flex-col w-[44%] relative overflow-hidden"
        style={{ background: "linear-gradient(140deg, #881a1d 0%, #9e2124 50%, #c55f23 100%)" }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55 }}
      >
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
              Conecta con más de 1.200 estudiantes y empresas aliadas de la
              Universidad Católica de Pereira.
            </motion.p>

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
                onClick={() => handleRolChange("ESTUDIANTE")}
              >
                <div className="flex items-center gap-2.5 mb-1">
                  <GraduationCap className="w-4 h-4 text-[#f4c222]" />
                  <p className="text-white font-semibold text-sm">Estudiante UCP</p>
                  {rol === "ESTUDIANTE" && (
                    <CheckCircle2 className="w-4 h-4 text-[#f4c222] ml-auto" />
                  )}
                </div>
                <p className="text-white/60 text-xs leading-relaxed">
                  Compra, vende y conecta con la comunidad. Requiere correo{" "}
                  <strong className="text-white/80">@ucp.edu.co</strong>.
                </p>
              </div>

              <div
                className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                  rol === "ALIADO"
                    ? "bg-white/20 border-white/50 shadow-lg"
                    : "bg-white/5 border-white/15 hover:bg-white/10"
                }`}
                onClick={() => handleRolChange("ALIADO")}
              >
                <div className="flex items-center gap-2.5 mb-1">
                  <Building2 className="w-4 h-4 text-[#f4c222]" />
                  <p className="text-white font-semibold text-sm">Aliado / Empresa</p>
                  {rol === "ALIADO" && (
                    <CheckCircle2 className="w-4 h-4 text-[#f4c222] ml-auto" />
                  )}
                </div>
                <p className="text-white/60 text-xs leading-relaxed">
                  Publica servicios u ofertas para la comunidad. Cualquier correo
                  válido. Requiere{" "}
                  <strong className="text-white/80">aprobación del admin</strong>.
                </p>
              </div>
            </motion.div>

            {/* Info note condicional */}
            <AnimatePresence mode="wait">
              <motion.div
                key={rol}
                className={`mt-8 flex items-start gap-2.5 rounded-xl p-4 border ${
                  rol === "ESTUDIANTE"
                    ? "bg-white/10 border-white/10"
                    : "bg-[#f4c222]/10 border-[#f4c222]/20"
                }`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                {rol === "ESTUDIANTE" ? (
                  <>
                    <Info className="w-4 h-4 text-[#f4c222] shrink-0 mt-0.5" />
                    <p className="text-white/65 text-xs leading-relaxed">
                      Necesitas un correo{" "}
                      <strong className="text-white/90">@ucp.edu.co</strong> para
                      registrarte como estudiante.
                    </p>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 text-[#f4c222] shrink-0 mt-0.5" />
                    <p className="text-white/65 text-xs leading-relaxed">
                      Tu solicitud será revisada por el administrador. Recibirás
                      acceso una vez aprobada tu cuenta.
                    </p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* ══ PANEL DERECHO — Formulario ══════════════════════════════════════ */}
      <div className="flex-1 flex flex-col bg-white overflow-y-auto">

        {/* ── Banner móvil ────────────────────────────────────────────────── */}
        <div
          className="lg:hidden relative overflow-hidden flex-shrink-0"
          style={{ background: "linear-gradient(140deg, #881a1d 0%, #9e2124 50%, #c55f23 100%)" }}
        >
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

            <div className="flex gap-2">
              {(["ESTUDIANTE", "ALIADO"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRolChange(r)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    rol === r
                      ? "bg-white text-[#881a1d] shadow-lg"
                      : "bg-white/15 text-white/80 border border-white/20"
                  }`}
                >
                  {r === "ESTUDIANTE"
                    ? <><GraduationCap className="w-3.5 h-3.5" /> Estudiante</>
                    : <><Building2     className="w-3.5 h-3.5" /> Aliado</>
                  }
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tarjeta del formulario ──────────────────────────────────────── */}
        <div className="flex-1 flex flex-col items-center px-4 sm:px-8 lg:px-10 lg:justify-center">
          <motion.div
            className="w-full max-w-[420px] bg-white rounded-2xl lg:rounded-none shadow-xl lg:shadow-none p-6 sm:p-7 lg:p-0 -mt-8 lg:mt-0 relative"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">
              Crear cuenta
            </h1>
            <p className="text-gray-500 text-sm mb-5">{subtitle}</p>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* ── Nombre ──────────────────────────────────────────────── */}
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

              {/* ── Correo ──────────────────────────────────────────────── */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {emailLabel}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      // Reset inmediato del estado de existencia al cambiar el correo
                      if (emailExists !== null) setEmailExists(null);
                    }}
                    placeholder={emailPlaceholder}
                    required
                    className={`w-full pl-10 pr-10 py-3 rounded-xl border transition-all text-sm bg-gray-50 hover:bg-white focus:bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 ${emailBorderClass}`}
                  />
                  <EmailIcon />
                </div>
              </div>

              {/* ── Error: correo ya registrado ──────────────────────────── */}
              <AnimatePresence>
                {emailExists === true && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3.5">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-red-800 font-semibold text-sm mb-0.5">
                            Este correo ya está registrado
                          </p>
                          <p className="text-red-700 text-xs leading-relaxed">
                            Ya existe una cuenta con este correo electrónico.{" "}
                            <Link
                              href="/login"
                              className="font-bold underline hover:text-red-800"
                            >
                              ¿Quieres iniciar sesión?
                            </Link>
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Advertencia dominio UCP (solo ESTUDIANTE, solo si no hay error de existencia) */}
              <AnimatePresence>
                {showEmailWarning && emailExists !== true && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                      <div className="flex items-start gap-2.5">
                        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-amber-800 font-semibold text-sm mb-0.5">
                            Correo institucional requerido
                          </p>
                          <p className="text-amber-700 text-xs leading-relaxed">
                            Los estudiantes solo pueden usar correos{" "}
                            <strong>@ucp.edu.co</strong>.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Info aprobación aliado ───────────────────────────────── */}
              <AnimatePresence>
                {rol === "ALIADO" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                      <div className="flex items-start gap-2.5">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-amber-800 font-semibold text-sm mb-0.5">
                            Requiere aprobación
                          </p>
                          <p className="text-amber-700 text-xs leading-relaxed">
                            Tu solicitud será revisada por el administrador antes
                            de activar tu cuenta. Proceso: 1–2 días hábiles.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Contraseña ──────────────────────────────────────────── */}
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
                    {showPassword
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye    className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>

              {/* ── Confirmar contraseña ────────────────────────────────── */}
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

              {/* ── Botón submit ─────────────────────────────────────────── */}
              <motion.button
                type="submit"
                disabled={submitDisabled}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#881a1d] hover:bg-[#6d1416] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#881a1d]/20 mt-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    {rol === "ALIADO" ? "Enviando solicitud..." : "Creando cuenta..."}
                  </>
                ) : (
                  <>
                    {rol === "ALIADO" ? "Enviar solicitud" : "Crear cuenta gratis"}
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

            {/* Nota info móvil — condicional */}
            <AnimatePresence mode="wait">
              <motion.div
                key={rol}
                className="lg:hidden mt-5 flex items-start gap-2.5 rounded-xl p-3.5 border"
                style={{
                  backgroundColor: rol === "ESTUDIANTE" ? "#fef2f2" : "#fffbeb",
                  borderColor:     rol === "ESTUDIANTE" ? "#fecaca" : "#fde68a",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {rol === "ESTUDIANTE" ? (
                  <>
                    <Info className="w-4 h-4 text-[#881a1d] shrink-0 mt-0.5" />
                    <p className="text-gray-600 text-xs leading-relaxed">
                      Necesitas un correo{" "}
                      <strong className="text-gray-800">@ucp.edu.co</strong> para
                      registrarte como estudiante.
                    </p>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-gray-600 text-xs leading-relaxed">
                      Como aliado puedes usar{" "}
                      <strong className="text-gray-800">cualquier correo</strong>.
                      Tu cuenta requiere aprobación del administrador.
                    </p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <p className="mt-4 mb-6 text-xs text-gray-400 text-center">
              Al registrarte aceptas los términos de uso de UCP Marketplace
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
