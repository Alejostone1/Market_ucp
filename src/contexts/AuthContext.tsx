"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { toast } from "sonner";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: "ESTUDIANTE" | "ALIADO" | "ADMIN";
  facultad?: string | null;
  semestre?: number | null;
  avatarUrl?: string | null;
  telefono?: string | null;
  bloqueado?: boolean;
  verificado?: boolean;
}

interface AuthContextType {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  login:          (correo: string, contrasena: string) => Promise<Usuario>;
  logout:         () => void;
  updateUsuario:  (data: Partial<Usuario>) => void;
  isLoading:      boolean;
  isLoggingOut:   boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Cookie helpers ────────────────────────────────────────────────────────────

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null;
  return null;
}

function setSessionCookie(usuario: Usuario) {
  const str = JSON.stringify(usuario);
  localStorage.setItem("usuario", str);
  document.cookie = `usuario=${encodeURIComponent(str)}; path=/; max-age=604800; SameSite=Lax`;
}

function clearSession() {
  localStorage.removeItem("usuario");
  document.cookie = "usuario=; path=/; max-age=0";
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario,      setUsuario]      = useState<Usuario | null>(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // ── Actualizar usuario en estado + persistencia ──────────────────────────────
  const updateUsuario = useCallback((data: Partial<Usuario>) => {
    setUsuario((prev) => {
      if (!prev) return null;
      const updated: Usuario = { ...prev, ...data };
      setSessionCookie(updated);
      return updated;
    });
  }, []);

  // ── Inicialización y verificación desde DB ────────────────────────────────────
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Leer de cookie primero, luego localStorage
        let usuarioData: Usuario | null = null;
        const cookieStr = getCookie("usuario");

        if (cookieStr) {
          usuarioData = JSON.parse(decodeURIComponent(cookieStr));
        } else {
          const stored = localStorage.getItem("usuario");
          if (stored) {
            usuarioData = JSON.parse(stored);
            // Restaurar cookie
            document.cookie = `usuario=${encodeURIComponent(stored)}; path=/; max-age=604800; SameSite=Lax`;
          }
        }

        if (!usuarioData) {
          setIsLoading(false);
          return;
        }

        // Setear desde caché de inmediato (UX rápida)
        setUsuario(usuarioData);

        // ── Verificar estado fresco desde DB ────────────────────────────────────
        try {
          const res = await fetch("/api/auth/me", { cache: "no-store" });

          if (res.status === 401 || res.status === 404) {
            // Sesión inválida o usuario eliminado → limpiar
            clearSession();
            setUsuario(null);
            setIsLoading(false);
            return;
          }

          if (res.ok) {
            const fresh = await res.json();

            if (fresh.bloqueado) {
              // Usuario bloqueado → forzar cierre de sesión
              clearSession();
              setUsuario(null);
              setIsLoading(false);
              // Redirigir a login con flag
              window.location.href = "/login";
              return;
            }

            // Actualizar con datos frescos (avatar, nombre, etc. pueden haber cambiado)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { motivoBloqueo: _, ...safeData } = fresh;
            setSessionCookie(safeData);
            setUsuario(safeData);
          }
        } catch {
          // Error de red — conservar datos del caché, no desloguear
        }
      } catch (error) {
        console.error("Error al inicializar auth:", error);
        clearSession();
        setUsuario(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────────
  const login = async (correo: string, contrasena: string): Promise<Usuario> => {
    const response = await fetch("/api/auth/login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ correo, contrasena }),
    });

    if (response.ok) {
      const data = await response.json();
      setUsuario(data.usuario);
      setSessionCookie(data.usuario);
      toast.success("Inicio de sesión exitoso");
      return data.usuario;
    }

    const errorData = await response.json();
    const message   = errorData.message || "Error al iniciar sesión";

    if (response.status !== 403) {
      toast.error(message);
    }

    const err = new Error(message) as Error & { status: number };
    err.status = response.status;
    throw err;
  };

  // ── Logout ────────────────────────────────────────────────────────────────────
  const logout = async () => {
    setIsLoggingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 1800));
    setUsuario(null);
    clearSession();
    setTimeout(() => {
      window.location.href = "/login";
    }, 300);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        isAuthenticated: !!usuario,
        login,
        logout,
        updateUsuario,
        isLoading,
        isLoggingOut,
      }}
    >
      <LoadingOverlay show={isLoggingOut} message="Cerrando sesión..." />
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
