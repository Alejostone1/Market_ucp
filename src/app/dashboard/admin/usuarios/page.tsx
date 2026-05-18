"use client";

import { useState, useEffect } from "react";
import { Search, Shield, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";

interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  facultad: string | null;
  avatarUrl: string | null;
  bloqueado: boolean;
  verificado: boolean;
  creadoEn: string;
  _count: {
    publicaciones: number;
  };
}

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRol, setFilterRol] = useState("todos");
  const [filterBloqueado, setFilterBloqueado] = useState("todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const params = new URLSearchParams({
          ...(filterRol !== "todos" && { rol: filterRol }),
          ...(filterBloqueado !== "todos" && { bloqueado: filterBloqueado }),
        });

        const response = await fetch(`/api/admin/usuarios?${params}`);
        if (response.ok) {
          const data = await response.json();
          setUsuarios(data.usuarios);
        }
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, [filterRol, filterBloqueado]);

  const filteredUsuarios = usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.correo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleBloqueado = async (id: string, bloqueado: boolean) => {
    try {
      const response = await fetch('/api/admin/usuarios', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, bloqueado: !bloqueado }),
      });

      if (response.ok) {
        setUsuarios(usuarios.map(u => 
          u.id === id ? { ...u, bloqueado: !bloqueado } : u
        ));
        toast.success(bloqueado ? "Usuario desbloqueado" : "Usuario bloqueado");
      } else {
        toast.error("Error al actualizar usuario");
      }
    } catch (error) {
      toast.error("Error al actualizar usuario");
    }
  };

  const getRolBadge = (rol: string) => {
    switch (rol) {
      case "ADMIN":
        return <Badge className="bg-purple-600 text-white">Admin</Badge>;
      case "ALIADO":
        return <Badge className="bg-blue-600 text-white">Aliado</Badge>;
      default:
        return <Badge className="bg-green-600 text-white">Estudiante</Badge>;
    }
  };

  const getEstadoBadge = (bloqueado: boolean, verificado: boolean) => {
    if (bloqueado) {
      return <Badge className="bg-red-600 text-white">Bloqueado</Badge>;
    }
    if (verificado) {
      return <Badge className="bg-ucp-verde text-white">Verificado</Badge>;
    }
    return <Badge variant="outline">No verificado</Badge>;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Usuarios</h1>
      <p className="text-gray-600 mb-8">
        Administra los usuarios del marketplace
      </p>

      {/* Filters */}
      <Card className="border-0 shadow-lg rounded-xl mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="search"
                placeholder="Buscar por nombre o correo..."
                className="pl-10 rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Select value={filterRol} onValueChange={setFilterRol}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ESTUDIANTE">Estudiantes</SelectItem>
                  <SelectItem value="ALIADO">Aliados</SelectItem>
                  <SelectItem value="ADMIN">Admins</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterBloqueado} onValueChange={setFilterBloqueado}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="false">Activos</SelectItem>
                  <SelectItem value="true">Bloqueados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      {loading ? (
        <div className="text-center py-16">
          <p className="text-gray-500">Cargando usuarios...</p>
        </div>
      ) : filteredUsuarios.length > 0 ? (
        <div className="space-y-4">
          {filteredUsuarios.map((usuario) => (
            <Card key={usuario.id} className="border-0 shadow-lg rounded-xl hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="w-14 h-14">
                      <AvatarImage src={usuario.avatarUrl || undefined} />
                      <AvatarFallback>{usuario.nombre[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-lg text-gray-900">{usuario.nombre}</h3>
                        {getRolBadge(usuario.rol)}
                        {getEstadoBadge(usuario.bloqueado, usuario.verificado)}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{usuario.correo}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span>•</span>
                        <span>{usuario.facultad || 'Sin facultad'}</span>
                        <span>•</span>
                        <span>{usuario._count.publicaciones} publicaciones</span>
                        <span>•</span>
                        <span>Registrado: {new Date(usuario.creadoEn).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/dashboard/student/profile?id=${usuario.id}`}>
                      <Button variant="outline" size="sm">
                        <Shield className="w-4 h-4 mr-2" />
                        Ver Perfil
                      </Button>
                    </Link>
                    <Button
                      onClick={() => handleToggleBloqueado(usuario.id, usuario.bloqueado)}
                      variant={usuario.bloqueado ? "outline" : "destructive"}
                      size="sm"
                    >
                      {usuario.bloqueado ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Desbloquear
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Bloquear
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-lg rounded-xl">
          <CardContent className="p-16 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay usuarios
            </h3>
            <p className="text-gray-600">
              No se encontraron usuarios con los filtros actuales
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
