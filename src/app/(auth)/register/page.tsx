"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { GraduationCap, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rol, setRol] = useState<"ESTUDIANTE" | "ALIADO">("ESTUDIANTE");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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

      // Auto-login: guardar sesión y redirigir
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
    <Card className="border-0 shadow-lg rounded-xl">
      <CardHeader>
        <div className="flex items-center justify-center gap-2 mb-2">
          <GraduationCap className="w-8 h-8 text-ucp-rojo" />
          <h1 className="text-2xl font-bold text-gray-900 text-center">Crear Cuenta</h1>
        </div>
        <p className="text-gray-600 text-center">
          Regístrate con tu correo institucional UCP
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre completo</Label>
            <Input id="nombre" name="nombre" type="text" placeholder="Juan Pérez" required className="rounded-full" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo institucional</Label>
            <Input id="email" name="email" type="email" placeholder="usuario@ucp.edu.co" required className="rounded-full" />
          </div>
          <div className="space-y-2">
            <Label>Tipo de cuenta</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRol("ESTUDIANTE")}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                  rol === "ESTUDIANTE"
                    ? "border-ucp-rojo bg-red-50 text-ucp-rojo"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                Estudiante
              </button>
              <button
                type="button"
                onClick={() => setRol("ALIADO")}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                  rol === "ALIADO"
                    ? "border-ucp-rojo bg-red-50 text-ucp-rojo"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                Aliado / Empresa
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
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
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Repite tu contraseña"
              required
              className="rounded-full"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-ucp-rojo text-white hover:bg-red-700 rounded-full"
            disabled={isLoading}
          >
            {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center">
        <p className="text-sm text-gray-600 w-full">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-ucp-rojo hover:underline font-medium">
            Inicia sesión
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
