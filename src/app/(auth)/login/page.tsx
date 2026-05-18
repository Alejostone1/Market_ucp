"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, usuario } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const correo = formData.get("email") as string;
    const contrasena = formData.get("password") as string;

    try {
      const usuarioLogueado = await login(correo, contrasena);
      
      // Redirigir según el rol del usuario autenticado
      if (usuarioLogueado?.rol === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard/student");
      }
    } catch (error) {
      // El error ya se maneja en el contexto con toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg rounded-xl">
      <CardHeader>
        <div className="flex items-center justify-center gap-2 mb-2">
          <GraduationCap className="w-8 h-8 text-ucp-rojo" />
          <h1 className="text-2xl font-bold text-gray-900 text-center">UCP Marketplace</h1>
        </div>
        <p className="text-gray-600 text-center">
          Inicia sesión como estudiante
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo institucional</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="estudiante@ucp.edu.co"
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
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" />
              <span className="text-gray-600">Recordarme</span>
            </label>
            <Link href="#" className="text-ucp-rojo hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Button
            type="submit"
            className="w-full bg-ucp-rojo text-white hover:bg-red-700 rounded-full"
            disabled={isLoading}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 text-center">
        <div className="text-sm text-gray-600">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-ucp-rojo hover:underline font-medium">
            Regístrate
          </Link>
        </div>
        <div className="text-sm text-gray-600">
          ¿Eres administrador?{" "}
          <Link href="/admin/login" className="text-ucp-rojo hover:underline font-medium">
            Inicia sesión aquí
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
