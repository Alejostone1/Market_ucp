import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.endsWith("@ucp.edu.co")) {
      toast.error("Debes usar tu correo institucional (@ucp.edu.co)");
      return;
    }

    if (!password) {
      toast.error("Ingresa tu contraseña");
      return;
    }

    setIsLoading(true);
    
    // Simular login
    setTimeout(() => {
      toast.success("¡Bienvenido al UCP Marketplace!");
      router.push("/");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-white hidden lg:block">
          <div className="mb-8">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6">
              <span className="text-red-600 font-bold text-3xl">UCP</span>
            </div>
            <h1 className="text-5xl font-bold mb-4">
              UCP Marketplace
            </h1>
            <p className="text-2xl text-red-50 mb-8">
              La plataforma de compra y venta exclusiva para estudiantes UCP
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Seguro y Verificado</h3>
                <p className="text-red-50">Solo estudiantes con correo institucional pueden acceder</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Comunidad UCP</h3>
                <p className="text-red-50">Compra y vende dentro de tu universidad</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <Card className="border-0 shadow-2xl rounded-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-gray-900">
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-base">
              Ingresa con tu correo institucional UCP
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Correo Institucional</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu.nombre@ucp.edu.co"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    className="pl-10 rounded-lg"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Debes usar tu correo institucional (@ucp.edu.co)
                </p>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <a href="#" className="text-sm text-red-600 hover:text-red-700 font-medium">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    className="pl-10 rounded-lg"
                    required
                  />
                </div>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 rounded-lg text-lg h-12"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>Iniciando sesión...</span>
                ) : (
                  <>
                    Iniciar Sesión
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              {/* Sign Up */}
              <div className="text-center pt-4 border-t">
                <p className="text-gray-600">
                  ¿No tienes cuenta?{" "}
                  <a href="#" className="text-red-600 hover:text-red-700 font-semibold">
                    Regístrate aquí
                  </a>
                </p>
              </div>
            </form>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Requisitos para registrarse:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800">
                    <li>Ser estudiante activo de la UCP</li>
                    <li>Tener correo institucional válido</li>
                    <li>Completar verificación de identidad</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
