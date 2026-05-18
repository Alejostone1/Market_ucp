import { Card, CardContent } from "@/components/ui/card";
import { LayoutDashboard, Package, MessageSquare, User, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function StudentDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido, Juan</h1>
      <p className="text-gray-600 mb-8">
        Resumen de tu actividad en UCP Marketplace
      </p>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="border-0 shadow-lg rounded-xl hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-ucp-rojo" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">12</div>
                <div className="text-gray-600">Publicaciones</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg rounded-xl hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">8</div>
                <div className="text-gray-600">Mensajes</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg rounded-xl hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-ucp-verde" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">4.8</div>
                <div className="text-gray-600">Calificación</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg rounded-xl mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones rápidas</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/dashboard/student/publications/new">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-ucp-rojo" />
                  <span className="font-medium text-gray-900">Nueva publicación</span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>
            <Link href="/dashboard/student/messages">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Ver mensajes</span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>
            <Link href="/dashboard/student/publications">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-5 h-5 text-ucp-verde" />
                  <span className="font-medium text-gray-900">Mis publicaciones</span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>
            <Link href="/dashboard/student/profile">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-gray-900">Editar perfil</span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-0 shadow-lg rounded-xl">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Actividad reciente</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-ucp-verde rounded-full" />
              <span className="text-gray-700">Tu publicación "Libros de ingeniería" fue aprobada</span>
              <span className="text-gray-500 ml-auto">Hace 2 horas</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-blue-600 rounded-full" />
              <span className="text-gray-700">Tienes 3 mensajes nuevos</span>
              <span className="text-gray-500 ml-auto">Hace 4 horas</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-ucp-rojo rounded-full" />
              <span className="text-gray-700">Tu publicación "Servicio de tutoría" tiene 5 vistas</span>
              <span className="text-gray-500 ml-auto">Hace 6 horas</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
