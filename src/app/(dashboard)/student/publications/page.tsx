"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockProducts } from "@/app/mockData";
import { toast } from "sonner";

export default function MyPublicationsPage() {
  const [products, setProducts] = useState(mockProducts.filter(p => p.seller.id === "1"));

  const approvedProducts = products.filter(p => p.status === "approved");
  const pendingProducts = products.filter(p => p.status === "pending");
  const rejectedProducts = products.filter(p => p.status === "rejected");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    toast.success("Publicación eliminada exitosamente");
  };

  const ProductRow = ({ product }: { product: typeof products[0] }) => (
    <Card className="hover:shadow-lg transition-shadow rounded-xl">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full md:w-32 h-32 object-cover rounded-lg"
          />
          
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg text-gray-900">{product.title}</h3>
                  {product.status === "approved" && (
                    <Badge className="bg-ucp-verde text-white rounded-full">Publicado</Badge>
                  )}
                  {product.status === "pending" && (
                    <Badge className="bg-yellow-600 text-white rounded-full">Pendiente</Badge>
                  )}
                  {product.status === "rejected" && (
                    <Badge className="bg-ucp-rojo text-white rounded-full">Rechazado</Badge>
                  )}
                </div>
                <p className="text-gray-600 text-sm line-clamp-2 mb-2">{product.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <Badge variant="outline" className="rounded-full">{product.subcategory}</Badge>
                  <span>Publicado el {product.createdAt.toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right mr-4">
                  <p className="text-2xl font-bold text-ucp-rojo">{formatPrice(product.price)}</p>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/publication/${product.id}`} className="cursor-pointer">
                        <Eye className="w-4 h-4 mr-2" />
                        Ver publicación
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <Card className="border-0 shadow-lg rounded-xl">
      <CardContent className="p-16 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {message}
        </h3>
        <p className="text-gray-600 mb-6">
          Crea tu primera publicación para comenzar a vender
        </p>
        <Link href="/dashboard/student/publications/new">
          <Button className="bg-ucp-rojo hover:bg-red-700 rounded-full">
            <Plus className="w-5 h-5 mr-2" />
            Nueva Publicación
          </Button>
        </Link>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Mis Publicaciones
          </h1>
          <p className="text-gray-600">
            Administra tus productos y servicios publicados
          </p>
        </div>
        <Link href="/dashboard/student/publications/new">
          <Button className="bg-ucp-rojo hover:bg-red-700 rounded-full">
            <Plus className="w-5 h-5 mr-2" />
            Nueva Publicación
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 shadow-lg rounded-xl">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-ucp-rojo mb-1">{products.length}</div>
            <div className="text-gray-600">Total publicaciones</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg rounded-xl">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-ucp-verde mb-1">{approvedProducts.length}</div>
            <div className="text-gray-600">Publicadas</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg rounded-xl">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-1">{pendingProducts.length}</div>
            <div className="text-gray-600">Pendientes</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg rounded-xl">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-gray-600 mb-1">125</div>
            <div className="text-gray-600">Vistas totales</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6 bg-white border rounded-lg p-1">
          <TabsTrigger value="all" className="rounded-md">
            Todas ({products.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="rounded-md">
            Publicadas ({approvedProducts.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="rounded-md">
            Pendientes ({pendingProducts.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="rounded-md">
            Rechazadas ({rejectedProducts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-4">
            {products.length > 0 ? (
              products.map((product) => <ProductRow key={product.id} product={product} />)
            ) : (
              <EmptyState message="No tienes publicaciones" />
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved">
          <div className="space-y-4">
            {approvedProducts.length > 0 ? (
              approvedProducts.map((product) => <ProductRow key={product.id} product={product} />)
            ) : (
              <EmptyState message="No tienes publicaciones aprobadas" />
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="space-y-4">
            {pendingProducts.length > 0 ? (
              pendingProducts.map((product) => <ProductRow key={product.id} product={product} />)
            ) : (
              <Card className="border-0 shadow-lg rounded-xl">
                <CardContent className="p-16 text-center">
                  <p className="text-gray-500">No tienes publicaciones pendientes de revisión</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rejected">
          <div className="space-y-4">
            {rejectedProducts.length > 0 ? (
              rejectedProducts.map((product) => <ProductRow key={product.id} product={product} />)
            ) : (
              <Card className="border-0 shadow-lg rounded-xl">
                <CardContent className="p-16 text-center">
                  <p className="text-gray-500">No tienes publicaciones rechazadas</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
