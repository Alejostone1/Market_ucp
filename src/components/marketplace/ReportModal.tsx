"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Ban,
  AlertOctagon,
  AlertCircle,
  Copy,
  MoreHorizontal,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Flag,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

// ── Tipos ──────────────────────────────────────────────────────────────────

interface PublicacionRef {
  id: string;
  titulo: string;
  autorNombre: string;
  imagen?: string;
}

interface ReportModalProps {
  publicacion: PublicacionRef;
  open: boolean;
  onClose: () => void;
}

// ── Motivos ────────────────────────────────────────────────────────────────

const MOTIVOS = [
  {
    value: "SPAM",
    label: "Spam o publicidad no deseada",
    desc: "Contenido repetitivo, cadenas o publicidad engañosa.",
    icon: <Ban className="w-4 h-4" />,
  },
  {
    value: "CONTENIDO_INAPROPIADO",
    label: "Contenido inapropiado",
    desc: "Imágenes, lenguaje ofensivo o material para adultos.",
    icon: <AlertOctagon className="w-4 h-4" />,
  },
  {
    value: "INFORMACION_FALSA",
    label: "Información falsa o fraude",
    desc: "Datos engañosos, precios falsos o suplantación de identidad.",
    icon: <AlertCircle className="w-4 h-4" />,
  },
  {
    value: "DUPLICADO",
    label: "Publicación duplicada",
    desc: "El mismo producto o servicio publicado varias veces.",
    icon: <Copy className="w-4 h-4" />,
  },
  {
    value: "OTRO",
    label: "Otro motivo",
    desc: "No encaja en las categorías anteriores.",
    icon: <MoreHorizontal className="w-4 h-4" />,
  },
] as const;

type MotivoValue = (typeof MOTIVOS)[number]["value"];

// ── Componente ─────────────────────────────────────────────────────────────

export function ReportModal({ publicacion, open, onClose }: ReportModalProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [motivo, setMotivo] = useState<MotivoValue | "">("");
  const [descripcion, setDescripcion] = useState("");
  const [step, setStep] = useState<"form" | "loading" | "success" | "duplicate">("form");

  const charsLeft = 500 - descripcion.length;

  const resetAndClose = () => {
    setMotivo("");
    setDescripcion("");
    setStep("form");
    onClose();
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para reportar");
      router.push("/login");
      return;
    }

    if (!motivo) {
      toast.error("Selecciona un motivo para el reporte");
      return;
    }

    setStep("loading");

    try {
      const res = await fetch(`/api/publicaciones/${publicacion.id}/reportar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivo, descripcion: descripcion.trim() }),
      });

      const data = await res.json();

      if (res.status === 409) {
        setStep("duplicate");
        return;
      }

      if (!res.ok) {
        toast.error(data.error || "Error al enviar el reporte");
        setStep("form");
        return;
      }

      setStep("success");
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.");
      setStep("form");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && resetAndClose()}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] md:w-full p-0 overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[90vh]">
        <AnimatePresence mode="wait">
          {/* ── No autenticado (Auth Gate) ── */}
          {!isAuthenticated ? (
            <motion.div
              key="auth-gate"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center p-8 gap-5 min-h-[320px] justify-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 flex items-center justify-center">
                <ShieldAlert className="w-8 h-8 text-[#881a1d] dark:text-red-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                  Inicia sesión para reportar
                </h3>
                <p className="text-gray-500 dark:text-zinc-400 text-sm max-w-xs leading-relaxed">
                  Para mantener nuestro marketplace seguro y evitar reportes falsos, necesitas tener una cuenta activa e iniciar sesión.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs mt-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800/50 font-bold"
                  onClick={resetAndClose}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    resetAndClose();
                    router.push("/login");
                  }}
                  className="flex-1 bg-[#881a1d] hover:bg-[#6d1416] dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-xl shadow-sm font-bold animate-pulse"
                >
                  Iniciar sesión
                </Button>
              </div>
            </motion.div>
          ) : (
            <>
              {/* ── Formulario ── */}
              {step === "form" && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col flex-1 overflow-hidden"
                >
                  <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-zinc-800/80 shrink-0">
                    <DialogTitle className="flex items-center gap-2.5 text-lg font-bold text-gray-900 dark:text-zinc-100">
                      <Flag className="w-5 h-5 text-[#881a1d] dark:text-red-500" />
                      Reportar publicación
                    </DialogTitle>
                  </DialogHeader>

                  {/* Scrollable Body */}
                  <div className="px-6 py-5 overflow-y-auto flex-1 space-y-5 custom-scrollbar">
                    {/* Thumbnail de la publicación */}
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-800/40 rounded-xl p-3 border border-gray-100 dark:border-zinc-800/60">
                      {publicacion.imagen ? (
                        <img
                          src={publicacion.imagen}
                          alt={publicacion.titulo}
                          className="w-14 h-14 rounded-lg object-cover shrink-0 border border-gray-100 dark:border-zinc-700/50"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-zinc-850 flex items-center justify-center shrink-0 border border-gray-200/50 dark:border-zinc-700/50">
                          <Flag className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold tracking-wider uppercase text-gray-400 dark:text-zinc-500 mb-0.5">
                          Publicación reportada
                        </p>
                        <p className="text-sm font-bold text-gray-850 dark:text-zinc-200 line-clamp-1 leading-snug">
                          {publicacion.titulo}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                          por <span className="font-semibold text-gray-750 dark:text-zinc-300">{publicacion.autorNombre}</span>
                        </p>
                      </div>
                    </div>

                    {/* Motivos */}
                    <div>
                      <p className="text-sm font-bold text-gray-800 dark:text-zinc-300 mb-2.5">
                        ¿Cuál es el problema? <span className="text-red-500">*</span>
                      </p>
                      <div className="space-y-2">
                        {MOTIVOS.map((m) => (
                          <label
                            key={m.value}
                            className={`flex items-start gap-3.5 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                              motivo === m.value
                                ? "border-[#881a1d] bg-[#881a1d]/5 dark:bg-[#881a1d]/10 dark:border-[#a82528] shadow-sm"
                                : "border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/50 hover:bg-gray-50 dark:hover:bg-zinc-800/40"
                            }`}
                          >
                            <input
                              type="radio"
                              name="motivo"
                              value={m.value}
                              checked={motivo === m.value}
                              onChange={() => setMotivo(m.value)}
                              className="mt-1 accent-[#881a1d] dark:accent-red-500 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`p-1 rounded-md transition-colors ${
                                    motivo === m.value
                                      ? "bg-[#881a1d]/10 dark:bg-red-500/10 text-[#881a1d] dark:text-red-400"
                                      : "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400"
                                  }`}
                                >
                                  {m.icon}
                                </span>
                                <p
                                  className={`text-sm font-bold leading-none ${
                                    motivo === m.value ? "text-[#881a1d] dark:text-red-400" : "text-gray-800 dark:text-zinc-200"
                                  }`}
                                >
                                  {m.label}
                                </p>
                              </div>
                              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1.5 leading-normal">
                                {m.desc}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Descripción */}
                    <div>
                      <p className="text-sm font-bold text-gray-800 dark:text-zinc-300 mb-1.5">
                        Detalles adicionales{" "}
                        <span className="text-gray-400 dark:text-zinc-500 font-normal">(opcional)</span>
                      </p>
                      <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value.slice(0, 500))}
                        placeholder="Describe con más detalle por qué estás reportando esta publicación…"
                        rows={3}
                        className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 focus:border-[#881a1d] dark:focus:border-red-500 focus:ring-2 focus:ring-[#881a1d]/10 dark:focus:ring-red-500/20 focus:outline-none resize-none text-sm p-3 bg-gray-50 dark:bg-zinc-800/35 focus:bg-white dark:focus:bg-zinc-900 transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-500 text-gray-850 dark:text-zinc-200"
                      />
                      <p
                        className={`text-xs text-right mt-1 font-medium ${
                          charsLeft < 50 ? "text-amber-500" : "text-gray-400 dark:text-zinc-500"
                        }`}
                      >
                        {descripcion.length}/500
                      </p>
                    </div>

                    {/* Aviso legal */}
                    <div className="flex items-start gap-2.5 bg-sky-50 dark:bg-sky-950/20 rounded-xl p-3.5 border border-sky-100 dark:border-sky-900/30">
                      <ShieldCheck className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-sky-900 dark:text-sky-300 leading-relaxed">
                        <strong className="font-bold text-sky-955 dark:text-sky-200">Tu identidad es confidencial.</strong> El usuario reportado no sabrá que fuiste tú. El equipo de moderación revisará el reporte de forma independiente.
                      </p>
                    </div>
                  </div>

                  {/* Fixed Footer Buttons */}
                  <div className="px-6 py-4 bg-gray-55 dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800/80 flex gap-3 shrink-0">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800/50"
                      onClick={resetAndClose}
                    >
                      Cancelar
                    </Button>
                    <Button
                      disabled={!motivo}
                      onClick={handleSubmit}
                      className="flex-1 bg-[#881a1d] hover:bg-[#6d1416] dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-xl disabled:opacity-50 font-bold transition-colors shadow-sm"
                    >
                      <Flag className="w-4 h-4 mr-1.5 shrink-0" />
                      Enviar reporte
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ── Cargando ── */}
              {step === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center p-12 min-h-[320px] gap-4"
                >
                  <Loader2 className="w-10 h-10 text-[#881a1d] dark:text-red-500 animate-spin" />
                  <p className="text-gray-500 dark:text-zinc-400 text-sm font-medium">Enviando reporte…</p>
                </motion.div>
              )}

              {/* ── Éxito ── */}
              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center text-center p-8 gap-5 min-h-[320px] justify-center"
                >
                  <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                      Reporte enviado
                    </h3>
                    <p className="text-gray-500 dark:text-zinc-400 text-sm max-w-xs leading-relaxed">
                      El equipo de moderación revisará el reporte. Te notificaremos cuando
                      se tome una decisión. Gracias por mantener el marketplace seguro.
                    </p>
                  </div>
                  <Button
                    onClick={resetAndClose}
                    className="bg-[#881a1d] hover:bg-[#6d1416] dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-xl px-10 shadow-sm font-bold"
                  >
                    Entendido
                  </Button>
                </motion.div>
              )}

              {/* ── Ya reportado ── */}
              {step === "duplicate" && (
                <motion.div
                  key="duplicate"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center text-center p-8 gap-5 min-h-[320px] justify-center"
                >
                  <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                      Ya reportaste esto
                    </h3>
                    <p className="text-gray-500 dark:text-zinc-400 text-sm max-w-xs leading-relaxed">
                      Ya enviaste un reporte para esta publicación anteriormente. El equipo
                      de moderación lo está revisando.
                    </p>
                  </div>
                  <Button
                    onClick={resetAndClose}
                    variant="outline"
                    className="rounded-xl border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 px-10 hover:bg-gray-100 dark:hover:bg-zinc-800/50 font-bold"
                  >
                    Cerrar
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
