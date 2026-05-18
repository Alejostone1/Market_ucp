"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const correo = formData.get("email") as string;
    const contrasena = formData.get("password") as string;

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Error al iniciar sesión");
        return;
      }

      if (data.usuario.rol !== "ADMIN") {
        toast.error("Acceso denegado: esta sección es solo para administradores");
        return;
      }

      // Guardar sesión
      const usuarioString = JSON.stringify(data.usuario);
      localStorage.setItem("usuario", usuarioString);
      document.cookie = `usuario=${encodeURIComponent(usuarioString)}; path=/; max-age=604800`;

      toast.success("Bienvenido, administrador");
      router.push("/admin/dashboard");
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-ucp-rojo rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-2xl">UCP</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">UCP Marketplace</h1>
            <p className="text-xs text-gray-500">Panel de Administración</p>
          </div>
        </Link>

        <Card className="border-0 shadow-lg rounded-xl">
          <CardHeader>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-8 h-8 text-ucp-rojo" />
              <h1 className="text-2xl font-bold text-gray-900 text-center">Administrador</h1>
            </div>
            <p className="text-gray-600 text-center">
              Inicia sesión para gestionar el marketplace
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo administrativo</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@ucp.edu.co"
                  required
                  className="rounded-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    className="rounded-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-ucp-rojo hover:bg-red-700 rounded-full"
                disabled={isLoading}
              >
                {isLoading ? "Verificando..." : "Iniciar Sesión"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3 text-center text-sm text-gray-600">
            <p>
              ¿Eres estudiante o aliado?{" "}
              <Link href="/login" className="text-ucp-rojo hover:underline font-medium">
                Inicia sesión aquí
              </Link>
            </p>
            <Link href="/" className="text-ucp-rojo hover:underline text-sm">
              Volver al inicio
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
