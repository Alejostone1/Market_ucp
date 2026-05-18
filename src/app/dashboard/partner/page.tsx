"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Package, MessageSquare, CheckCircle, ArrowRight, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface Publicacion {
  id: string;
  titulo: string;
  estado: string;
  tipo: string;
  creadoEn: string;
}

export default function PartnerDashboardPage() {
  const { usuario } = useAuth();
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [mensajesCount, setMensajesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario?.id) return;

    const fetchData = async () => {
      try {
        const [pubRes, msgRes] = await Promise.all([
          fetch(`/api/usuarios/${usuario.id}/publicaciones`),
          fetch(`/api/usuarios/${usuario.id}/mensajes`),
        ]);

        if (pubRes.ok) setPublicaciones(await pubRes.json());
        if (msgRes.ok) {
          const msgs = await msgRes.json();
          setMensajesCount(Array.isArray(msgs) ? msgs.length : 0);
        }
      } catch {
        // silenciar errores de red
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [usuario?.id]);

  const aprobadas = publicaciones.filter((p) => p.estado === "APROBADA").length;
  const pendientes = publicaciones.filter((p) => p.estado === "PENDIENTE").length;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Panel de Aliado</h1>
      <p className="text-gray-600 mb-8">Gestiona tus publicaciones y comunicaciones en UCP Marketplace</p>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-ucp-rojo border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-0 shadow-md rounded-xl">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-ucp-rojo" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{publicaciones.length}</div>
                  <div className="text-gray-600 text-sm">Total publicaciones</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md rounded-xl">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{aprobadas}</div>
                  <div className="text-gray-600 text-sm">Aprobadas / activas</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md rounded-xl">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{mensajesCount}</div>
                  <div className="text-gray-600 text-sm">Mensajes</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Acciones rápidas */}
          <Card className="border-0 shadow-md rounded-xl mb-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones rápidas</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/dashboard/student/publications/new">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <PlusCircle className="w-5 h-5 text-ucp-rojo" />
                      <span className="font-medium text-gray-900">Nueva publicación</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
                <Link href="/dashboard/student/publications">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-ucp-rojo" />
                      <span className="font-medium text-gray-900">Mis publicaciones</span>
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
                <Link href="/dashboard/student/marketplace">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-900">Explorar Marketplace</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Publicaciones recientes */}
          {publicaciones.length > 0 && (
            <Card className="border-0 shadow-md rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Mis publicaciones recientes</h2>
                  <Link href="/dashboard/student/publications" className="text-ucp-rojo text-sm font-medium hover:underline">
                    Ver todas
                  </Link>
                </div>
                <div className="space-y-3">
                  {publicaciones.slice(0, 5).map((pub) => (
                    <div key={pub.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{pub.titulo}</p>
                        <p className="text-xs text-gray-500 capitalize">{pub.tipo.toLowerCase()}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        pub.estado === "APROBADA" ? "bg-green-100 text-green-700" :
                        pub.estado === "PENDIENTE" ? "bg-yellow-100 text-yellow-700" :
                        pub.estado === "RECHAZADA" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {pub.estado === "APROBADA" ? "Aprobada" :
                         pub.estado === "PENDIENTE" ? "Pendiente" :
                         pub.estado === "RECHAZADA" ? "Rechazada" : pub.estado}
                      </span>
                    </div>
                  ))}
                </div>
                {pendientes > 0 && (
                  <p className="mt-4 text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg">
                    Tienes {pendientes} publicación{pendientes > 1 ? "es" : ""} en revisión por el administrador.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
