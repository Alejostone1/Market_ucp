"use client";

import { useRef, useState, useCallback } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  /** URL actual del avatar (puede ser null) */
  currentUrl?: string | null;
  /** Nombre del usuario — para las iniciales del fallback */
  name: string;
  /** ID del usuario autenticado */
  usuarioId: string;
  /** Callback que se llama con la nueva URL al terminar la subida */
  onSuccess: (newUrl: string) => void;
  /** Tamaño del avatar: sm=20, md=28, lg=36 (en Tailwind units) */
  size?: "sm" | "md" | "lg";
  /** Deshabilitar interacción */
  disabled?: boolean;
}

const SIZE_MAP = {
  sm: { wrapper: "w-20 h-20", text: "text-xl",  icon: "w-5 h-5" },
  md: { wrapper: "w-28 h-28", text: "text-2xl", icon: "w-6 h-6" },
  lg: { wrapper: "w-36 h-36", text: "text-3xl", icon: "w-7 h-7" },
} as const;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB   = 2;

export function AvatarUpload({
  currentUrl,
  name,
  usuarioId,
  onSuccess,
  size     = "md",
  disabled = false,
}: AvatarUploadProps) {
  const inputRef   = useRef<HTMLInputElement>(null);
  const [preview,  setPreview]  = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const displayUrl = preview ?? currentUrl ?? undefined;
  const s          = SIZE_MAP[size];

  // ── Procesar archivo seleccionado ────────────────────────────────────────────
  const handleFile = useCallback(
    async (file: File) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error("Solo se permiten imágenes JPG, PNG o WebP");
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`La imagen no puede superar los ${MAX_SIZE_MB} MB`);
        return;
      }

      // Vista previa inmediata
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Subir al servidor
      setLoading(true);
      try {
        const form = new FormData();
        form.append("file",       file);
        form.append("usuarioId",  usuarioId);

        const res  = await fetch("/api/upload/avatar", { method: "POST", body: form });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error ?? "Error al subir la imagen");

        onSuccess(data.url);
        toast.success("Foto de perfil actualizada");
        // Limpiar URL de objeto (ya tenemos la URL del servidor)
        URL.revokeObjectURL(objectUrl);
        setPreview(null);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error al subir la imagen");
        setPreview(null);
        URL.revokeObjectURL(objectUrl);
      } finally {
        setLoading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [usuarioId, onSuccess]
  );

  // ── Drag & Drop ───────────────────────────────────────────────────────────────
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled || loading) return;
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [disabled, loading, handleFile]
  );

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar con overlay de cámara */}
      <div
        role={disabled || loading ? "img" : "button"}
        tabIndex={disabled || loading ? -1 : 0}
        aria-label="Cambiar foto de perfil"
        className={cn(
          "relative group cursor-pointer select-none rounded-full",
          s.wrapper,
          (disabled || loading) && "cursor-default opacity-80"
        )}
        onClick={() => !disabled && !loading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!disabled && !loading && (e.key === "Enter" || e.key === " ")) {
            inputRef.current?.click();
          }
        }}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
      >
        <Avatar className={cn("w-full h-full border-4 border-white shadow-lg", dragOver && "ring-2 ring-[#881a1d]")}>
          <AvatarImage src={displayUrl} alt={name} className="object-cover" />
          <AvatarFallback className={cn("bg-[#881a1d]/10 text-[#881a1d] font-bold", s.text)}>
            {initials || "?"}
          </AvatarFallback>
        </Avatar>

        {/* Overlay: cámara en hover o loader durante subida */}
        <div className={cn(
          "absolute inset-0 rounded-full flex items-center justify-center transition-all duration-200",
          loading
            ? "bg-black/40"
            : "bg-black/0 group-hover:bg-black/40"
        )}>
          {loading ? (
            <Loader2 className={cn(s.icon, "text-white animate-spin")} />
          ) : (
            <Camera className={cn(s.icon, "text-white opacity-0 group-hover:opacity-100 transition-opacity")} />
          )}
        </div>

        {/* Indicador de drag */}
        {dragOver && !loading && (
          <div className="absolute inset-0 rounded-full bg-[#881a1d]/20 flex items-center justify-center border-2 border-dashed border-[#881a1d]">
            <Camera className={cn(s.icon, "text-[#881a1d]")} />
          </div>
        )}
      </div>

      {/* Input file oculto */}
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        className="hidden"
        disabled={disabled || loading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {/* Texto de ayuda */}
      {!disabled && (
        <div className="text-center">
          <p className="text-xs text-gray-500">
            {loading ? "Subiendo imagen..." : "Haz clic o arrastra una imagen"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            JPG, PNG o WebP · Máx. {MAX_SIZE_MB} MB
          </p>
        </div>
      )}

      {/* Botón de eliminar (si hay foto y no está cargando) */}
      {currentUrl && !loading && !disabled && (
        <button
          type="button"
          onClick={async (e) => {
            e.stopPropagation();
            try {
              setLoading(true);
              await fetch(`/api/usuarios/${usuarioId}`, {
                method:  "PATCH",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ avatarUrl: null }),
              });
              onSuccess("");
              toast.success("Foto de perfil eliminada");
            } catch {
              toast.error("Error al eliminar la foto");
            } finally {
              setLoading(false);
            }
          }}
          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Eliminar foto
        </button>
      )}
    </div>
  );
}
