"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: "ESTUDIANTE" | "ALIADO" | "ADMIN";
  facultad?: string;
  semestre?: number;
  avatarUrl?: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  login: (correo: string, contrasena: string) => Promise<Usuario>;
  logout: () => void;
  isLoading: boolean;
  isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Cargar usuario desde localStorage al montar
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Primero intentar obtener de cookie
        const cookieUsuario = getCookie('usuario');
        let usuarioData = null;
        
        if (cookieUsuario) {
          usuarioData = JSON.parse(decodeURIComponent(cookieUsuario));
        } else {
          // Si no hay cookie, intentar localStorage
          const storedUsuario = localStorage.getItem("usuario");
          if (storedUsuario) {
            usuarioData = JSON.parse(storedUsuario);
            // Restaurar cookie
            document.cookie = `usuario=${encodeURIComponent(storedUsuario)}; path=/; max-age=604800`;
          }
        }
        
        if (usuarioData) {
          setUsuario(usuarioData);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Limpiar datos corruptos
        localStorage.removeItem("usuario");
        document.cookie = "usuario=; path=/; max-age=0";
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Sincronizar cambios de usuario con localStorage y cookie
  useEffect(() => {
    if (usuario) {
      const usuarioString = JSON.stringify(usuario);
      localStorage.setItem("usuario", usuarioString);
      document.cookie = `usuario=${encodeURIComponent(usuarioString)}; path=/; max-age=604800`;
    }
  }, [usuario]);

  // Helper function para obtener cookies
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift();
    }
    return null;
  };

  const login = async (correo: string, contrasena: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correo, contrasena }),
      });

      if (response.ok) {
        const data = await response.json();
        setUsuario(data.usuario);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        
        // Guardar en cookie para middleware
        document.cookie = `usuario=${encodeURIComponent(JSON.stringify(data.usuario))}; path=/; max-age=604800`;
        
        // Retornar el usuario para que el componente maneje la redirección
        toast.success("Inicio de sesión exitoso");
        return data.usuario;
      } else {
        const error = await response.json();
        toast.error(error.message || "Error al iniciar sesión");
        throw new Error(error.message);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    setIsLoggingOut(true);
    
    // Simular proceso de cierre de sesión
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Limpiar datos
    setUsuario(null);
    localStorage.removeItem("usuario");
    document.cookie = "usuario=; path=/; max-age=0";
    
    // Redirigir después de la animación
    setTimeout(() => {
      window.location.href = "/login";
    }, 500);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        isAuthenticated: !!usuario,
        login,
        logout,
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
