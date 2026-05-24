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
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <Flag className="w-5 h-5 text-[#881a1d]" />
            Reportar publicación
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 pt-4">
          <AnimatePresence mode="wait">

            {/* ── Formulario ── */}
            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Thumbnail de la publicación */}
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  {publicacion.imagen ? (
                    <img
                      src={publicacion.imagen}
                      alt={publicacion.titulo}
                      className="w-14 h-14 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                      <Flag className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-500 mb-0.5">Publicación reportada</p>
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                      {publicacion.titulo}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      por {publicacion.autorNombre}
                    </p>
                  </div>
                </div>

                {/* Motivo */}
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-2">
                    ¿Cuál es el problema? <span className="text-red-500">*</span>
                  </p>
                  <div className="space-y-2">
                    {MOTIVOS.map((m) => (
                      <label
                        key={m.value}
                        className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          motivo === m.value
                            ? "border-[#881a1d] bg-[#881a1d]/5"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="motivo"
                          value={m.value}
                          checked={motivo === m.value}
                          onChange={() => setMotivo(m.value)}
                          className="mt-0.5 accent-[#881a1d] shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`${motivo === m.value ? "text-[#881a1d]" : "text-gray-500"}`}
                            >
                              {m.icon}
                            </span>
                            <p
                              className={`text-sm font-semibold leading-snug ${
                                motivo === m.value ? "text-[#881a1d]" : "text-gray-800"
                              }`}
                            >
                              {m.label}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-1.5">
                    Detalles adicionales{" "}
                    <span className="text-gray-400 font-normal">(opcional)</span>
                  </p>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value.slice(0, 500))}
                    placeholder="Describe con más detalle por qué estás reportando esta publicación…"
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 focus:border-[#881a1d] focus:ring-2 focus:ring-[#881a1d]/10 focus:outline-none resize-none text-sm p-3 bg-gray-50 focus:bg-white transition-all placeholder:text-gray-400"
                  />
                  <p
                    className={`text-xs text-right mt-1 ${
                      charsLeft < 50 ? "text-amber-500" : "text-gray-400"
                    }`}
                  >
                    {descripcion.length}/500
                  </p>
                </div>

                {/* Aviso legal */}
                <div className="flex items-start gap-2.5 bg-blue-50 rounded-xl p-3.5 border border-blue-100">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    <strong>Tu identidad es confidencial.</strong> El usuario reportado no
                    sabrá que fuiste tú. El equipo de moderación revisará el reporte de
                    forma independiente.
                  </p>
                </div>

                {/* Botones */}
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={resetAndClose}
                  >
                    Cancelar
                  </Button>
                  <Button
                    disabled={!motivo}
                    onClick={handleSubmit}
                    className="flex-1 bg-[#881a1d] hover:bg-[#6d1416] text-white rounded-xl disabled:opacity-50"
                  >
                    <Flag className="w-4 h-4 mr-1.5" />
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
                className="flex flex-col items-center justify-center py-12 gap-4"
              >
                <Loader2 className="w-10 h-10 text-[#881a1d] animate-spin" />
                <p className="text-gray-500 text-sm">Enviando reporte…</p>
              </motion.div>
            )}

            {/* ── Éxito ── */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-8 gap-4"
              >
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Reporte enviado
                  </h3>
                  <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                    El equipo de moderación revisará el reporte. Te notificaremos cuando
                    se tome una decisión. Gracias por mantener el marketplace seguro.
                  </p>
                </div>
                <Button
                  onClick={resetAndClose}
                  className="bg-[#881a1d] hover:bg-[#6d1416] text-white rounded-xl px-8 mt-2"
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
                className="flex flex-col items-center text-center py-8 gap-4"
              >
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Ya reportaste esto
                  </h3>
                  <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                    Ya enviaste un reporte para esta publicación anteriormente. El equipo
                    de moderación lo está revisando.
                  </p>
                </div>
                <Button
                  onClick={resetAndClose}
                  variant="outline"
                  className="rounded-xl px-8"
                >
                  Cerrar
                </Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
