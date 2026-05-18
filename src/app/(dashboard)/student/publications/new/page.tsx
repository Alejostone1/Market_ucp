"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewPublicationPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/student/publications">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nueva Publicación</h1>
          <p className="text-gray-600">
            Crea una nueva publicación para el marketplace UCP
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-lg rounded-xl max-w-3xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">
            Información de la publicación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Ej: Calculadora científica Casio"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de publicación *</Label>
              <select className="w-full p-3 border rounded-lg" required>
                <option value="">Selecciona una opción</option>
                <option value="PRODUCT">Producto</option>
                <option value="SERVICE">Servicio</option>
                <option value="EVENT">Evento</option>
                <option value="CALL">Convocatoria</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Input
                id="category"
                placeholder="Ej: Tecnología"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Precio *</Label>
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                placeholder="Describe tu producto o servicio..."
                rows={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Imágenes</Label>
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
              />
              <p className="text-sm text-gray-500">
                Puedes subir hasta 5 imágenes
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="bg-ucp-rojo hover:bg-red-700 rounded-full flex-1">
                Publicar
              </Button>
              <Link href="/dashboard/student/publications">
                <Button variant="outline" className="rounded-full flex-1">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
