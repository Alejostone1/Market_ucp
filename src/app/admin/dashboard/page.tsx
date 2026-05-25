"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Users,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Clock,
  Bell,
  MessageSquare,
  History,
  Tag,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DashboardStats {
  totalPublicaciones: number;
  publicacionesPendientes: number;
  usuariosActivos: number;
  reportesPendientes: number;
}

interface PublicacionPorTipo {
  tipo: string;
  count: number;
}

interface PublicacionPorEstado {
  estado: string;
  count: number;
}

interface ActividadReciente {
  id: string;
  accion: string;
  publicacionTitulo: string;
  adminNombre: string;
  fecha: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPublicaciones: 0,
    publicacionesPendientes: 0,
    usuariosActivos: 0,
    reportesPendientes: 0,
  });
  const [publicacionesPorTipo, setPublicacionesPorTipo] = useState<PublicacionPorTipo[]>([]);
  const [publicacionesPorEstado, setPublicacionesPorEstado] = useState<PublicacionPorEstado[]>([]);
  const [actividadReciente, setActividadReciente] = useState<ActividadReciente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
          setPublicacionesPorTipo(data.publicacionesPorTipo);
          setPublicacionesPorEstado(data.publicacionesPorEstado);
          setActividadReciente(data.actividadReciente);
        }
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Administrativo</h1>
      <p className="text-gray-600 mb-8">
        Resumen general del sistema UCP Marketplace
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 shadow-lg rounded-xl hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Publicaciones
            </CardTitle>
            <FileText className="w-5 h-5 text-ucp-rojo" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalPublicaciones}</div>
            <p className="text-xs text-gray-500 mt-1">En el sistema</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-xl bg-yellow-50 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">
              Pendientes de Revisión
            </CardTitle>
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.publicacionesPendientes}</div>
            <p className="text-xs text-yellow-700 mt-1">Requieren atención</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Usuarios Activos
            </CardTitle>
            <Users className="w-5 h-5 text-ucp-verde" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.usuariosActivos}</div>
            <p className="text-xs text-gray-500 mt-1">Registrados</p>
          </CardContent>
        </Card>

        <Link href="/admin/dashboard/reportes" className="block group">
          <Card className="border-0 shadow-lg rounded-xl bg-red-50 border-red-200 group-hover:shadow-xl transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-red-800">
                Reportes Pendientes
              </CardTitle>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.reportesPendientes}</div>
              <p className="text-xs text-red-700 mt-1 group-hover:underline">Ver reportes →</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="border-0 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Publicaciones por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {publicacionesPorTipo.map((item) => (
                <div key={item.tipo} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{item.tipo}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-ucp-rojo" 
                        style={{ width: `${(item.count / stats.totalPublicaciones) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Publicaciones por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {publicacionesPorEstado.map((item) => (
                <div key={item.estado} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{item.estado}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          item.estado === 'APROBADA' ? 'bg-ucp-verde' :
                          item.estado === 'PENDIENTE' ? 'bg-yellow-500' :
                          item.estado === 'RECHAZADA' ? 'bg-ucp-rojo' :
                          'bg-gray-400'
                        }`}
                        style={{ width: `${(item.count / stats.totalPublicaciones) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg rounded-xl md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {actividadReciente.length > 0 ? (
                actividadReciente.map((actividad) => (
                  <div key={actividad.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-ucp-rojo rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{actividad.accion}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {actividad.publicacionTitulo} - por {actividad.adminNombre}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(actividad.fecha).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No hay actividad reciente</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/dashboard/publicaciones">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2"><FileText className="w-4 h-4" />Revisar Publicaciones</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/admin/dashboard/reportes">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Ver Reportes</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/admin/dashboard/usuarios">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2"><Users className="w-4 h-4" />Gestionar Usuarios</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/admin/dashboard/categorias">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2"><Tag className="w-4 h-4" />Categorías</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/admin/dashboard/notificaciones">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2"><Bell className="w-4 h-4" />Notificaciones</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/admin/dashboard/messages">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2"><MessageSquare className="w-4 h-4" />Mensajes</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/admin/dashboard/historial">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2"><History className="w-4 h-4" />Historial</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
