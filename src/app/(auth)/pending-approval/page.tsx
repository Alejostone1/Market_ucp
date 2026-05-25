"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, Mail, ArrowRight, Building2, Home } from "lucide-react";

const STEPS = [
  {
    icon: CheckCircle2,
    color: "text-green-500",
    bg:    "bg-green-50",
    title: "Solicitud enviada",
    desc:  "Tu información ha sido registrada correctamente en el sistema.",
  },
  {
    icon: Clock,
    color: "text-amber-500",
    bg:    "bg-amber-50",
    title: "En revisión",
    desc:  "El equipo administrativo de UCP Marketplace está revisando tu solicitud.",
  },
  {
    icon: Mail,
    color: "text-blue-500",
    bg:    "bg-blue-50",
    title: "Notificación por correo",
    desc:  "Recibirás un correo cuando tu cuenta sea aprobada y puedas iniciar sesión.",
  },
];

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Tarjeta principal */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          {/* Header con gradiente UCP */}
          <div
            className="relative px-8 pt-12 pb-10 text-center overflow-hidden"
            style={{ background: "linear-gradient(140deg, #881a1d 0%, #9e2124 55%, #c55f23 100%)" }}
          >
            {/* Decoración */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/3" />

            <div className="relative z-10">
              {/* Ícono central */}
              <motion.div
                className="w-20 h-20 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-5 border border-white/20"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              >
                <Building2 className="w-10 h-10 text-white" />
              </motion.div>

              <motion.h1
                className="text-2xl font-black text-white mb-2"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Solicitud en revisión
              </motion.h1>
              <motion.p
                className="text-white/75 text-sm max-w-xs mx-auto leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Tu cuenta de aliado está pendiente de aprobación por el equipo
                administrativo de UCP Marketplace.
              </motion.p>
            </div>
          </div>

          {/* Cuerpo */}
          <div className="px-8 py-8">

            {/* Pasos del proceso */}
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-5">
              Estado de tu solicitud
            </h2>

            <div className="space-y-4 mb-8">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                const isActive = i === 1; // "En revisión" es el estado actual
                return (
                  <motion.div
                    key={step.title}
                    className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                      isActive
                        ? "border-amber-200 bg-amber-50/60"
                        : "border-gray-100 bg-gray-50/50"
                    }`}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${step.bg}`}>
                      <Icon className={`w-4.5 h-4.5 ${step.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold ${isActive ? "text-amber-800" : "text-gray-700"}`}>
                          {step.title}
                        </p>
                        {i === 0 && (
                          <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            ✓ Completado
                          </span>
                        )}
                        {i === 1 && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full animate-pulse">
                            En proceso
                          </span>
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 leading-relaxed ${isActive ? "text-amber-700" : "text-gray-500"}`}>
                        {step.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Tiempo estimado */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-blue-600" />
                <p className="text-sm font-semibold text-blue-800">Tiempo estimado</p>
              </div>
              <p className="text-xs text-blue-700 leading-relaxed">
                El proceso de revisión toma entre{" "}
                <strong>1 y 2 días hábiles</strong>. Si tienes urgencia, escríbenos a{" "}
                <a
                  href="mailto:admin@ucp.edu.co?subject=Aprobación%20de%20aliado"
                  className="font-semibold underline"
                >
                  admin@ucp.edu.co
                </a>
                .
              </p>
            </div>

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/" className="flex-1">
                <button className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold transition-colors">
                  <Home className="w-4 h-4" />
                  Ir al inicio
                </button>
              </Link>
              <Link href="/login" className="flex-1">
                <button className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#881a1d] hover:bg-[#6d1416] text-white text-sm font-bold transition-colors">
                  Iniciar sesión
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Logo footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          UCP Marketplace · Universidad Católica de Pereira
        </p>
      </motion.div>
    </div>
  );
}
