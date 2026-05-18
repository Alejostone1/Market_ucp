"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  return (
    <Card className="border-0 shadow-lg rounded-xl">
      <CardHeader>
        <h1 className="text-2xl font-bold text-gray-900 text-center">Crear Cuenta</h1>
        <p className="text-gray-600 text-center">
          Regístrate con tu correo institucional UCP
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              type="text"
              placeholder="Juan Pérez"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo institucional</Label>
            <Input
              id="email"
              type="email"
              placeholder="estudiante@ucp.edu.co"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" className="w-full bg-ucp-rojo text-white hover:bg-red-700 rounded-full">
            Crear Cuenta
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 text-center">
        <p className="text-sm text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-ucp-rojo hover:underline font-medium">
            Inicia sesión
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
