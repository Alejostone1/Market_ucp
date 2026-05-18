"use client";

import { useState } from "react";
import { Check, X, Eye, MoreVertical, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { mockProducts } from "@/app/mockData";
import { toast } from "sonner";

export default function AdminPage() {
  const [products, setProducts] = useState(mockProducts);
  const [selectedProduct, setSelectedProduct] = useState<typeof mockProducts[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const pendingProducts = products.filter(p => p.status === "pending");
  const approvedProducts = products.filter(p => p.status === "approved");
  const rejectedProducts = products.filter(p => p.status === "rejected");

  const filteredProducts = (status: "pending" | "approved" | "rejected") => {
    return products
      .filter(p => p.status === status)
      .filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.seller.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleApprove = (id: string) => {
    setProducts(products.map(p =>
      p.id === id ? { ...p, status: "approved" as const } : p
    ));
    toast.success("Publicación aprobada exitosamente");
  };

  const handleReject = (id: string) => {
    setProducts(products.map(p =>
      p.id === id ? { ...p, status: "rejected" as const } : p
    ));
    toast.success("Publicación rechazada");
    setRejectionReason("");
  };

  const handleViewDetails = (product: typeof mockProducts[0]) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const ProductRow = ({ product }: { product: typeof products[0] }) => (
    <Card className="hover:shadow-lg transition-shadow rounded-xl">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full md:w-32 h-32 object-cover rounded-lg cursor-pointer"
            onClick={() => handleViewDetails(product)}
          />

          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg text-gray-900">{product.title}</h3>
                  {product.category === "service" ? (
                    <Badge className="bg-blue-600 text-white rounded-full">Servicio</Badge>
                  ) : (
                    <Badge className="bg-purple-600 text-white rounded-full">Producto</Badge>
                  )}
                </div>
                
                <p className="text-gray-600 text-sm line-clamp-2 mb-2">{product.description}</p>
                
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <Badge variant="outline" className="rounded-full">{product.subcategory}</Badge>
                  <span>Vendedor: {product.seller.name}</span>
                  <span>Facultad: {product.seller.faculty}</span>
                  <span>Fecha: {product.createdAt.toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="text-right mr-4">
                  <p className="text-2xl font-bold text-ucp-rojo">{formatPrice(product.price)}</p>
                </div>

                {product.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(product.id)}
                      className="bg-ucp-verde hover:bg-green-700 rounded-full"
                      size="sm"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Aprobar
                    </Button>
                    <Button
                      onClick={() => handleReject(product.id)}
                      variant="destructive"
                      className="rounded-full"
                      size="sm"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Rechazar
                    </Button>
                  </div>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewDetails(product)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Ver detalles
                    </DropdownMenuItem>
                    {product.status === "approved" && (
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleReject(product.id)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Desactivar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
      <p className="text-gray-600 mb-8">
        Gestiona y modera las publicaciones del marketplace
      </p>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 shadow-lg rounded-xl">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-ucp-rojo mb-1">{products.length}</div>
            <div className="text-gray-600">Total publicaciones</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg rounded-xl bg-yellow-50 border-yellow-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-1">{pendingProducts.length}</div>
            <div className="text-yellow-800 font-medium">Pendientes de revisión</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg rounded-xl">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-ucp-verde mb-1">{approvedProducts.length}</div>
            <div className="text-gray-600">Aprobadas</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg rounded-xl">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-gray-600 mb-1">{rejectedProducts.length}</div>
            <div className="text-gray-600">Rechazadas</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="search"
            placeholder="Buscar por título o vendedor..."
            className="pl-10 rounded-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-6 bg-white border rounded-lg p-1">
          <TabsTrigger value="pending" className="rounded-md">
            Pendientes ({pendingProducts.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="rounded-md">
            Aprobadas ({approvedProducts.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="rounded-md">
            Rechazadas ({rejectedProducts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="space-y-4">
            {filteredProducts("pending").length > 0 ? (
              filteredProducts("pending").map((product) => (
                <ProductRow key={product.id} product={product} />
              ))
            ) : (
              <Card className="border-0 shadow-lg rounded-xl">
                <CardContent className="p-16 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No hay publicaciones pendientes
                  </h3>
                  <p className="text-gray-600">
                    Todas las publicaciones han sido revisadas
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved">
          <div className="space-y-4">
            {filteredProducts("approved").map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rejected">
          <div className="space-y-4">
            {filteredProducts("rejected").length > 0 ? (
              filteredProducts("rejected").map((product) => (
                <ProductRow key={product.id} product={product} />
              ))
            ) : (
              <Card className="border-0 shadow-lg rounded-xl">
                <CardContent className="p-16 text-center">
                  <p className="text-gray-500">No hay publicaciones rechazadas</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Product Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedProduct.title}</DialogTitle>
                <DialogDescription>
                  Detalles completos de la publicación
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {selectedProduct.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${selectedProduct.title} ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  ))}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Descripción</h4>
                  <p className="text-gray-700">{selectedProduct.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Información del producto</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Precio:</span>
                        <span className="font-medium">{formatPrice(selectedProduct.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Categoría:</span>
                        <span className="font-medium">{selectedProduct.subcategory}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo:</span>
                        <span className="font-medium">
                          {selectedProduct.category === "product" ? "Producto" : "Servicio"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Información del vendedor</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nombre:</span>
                        <span className="font-medium">{selectedProduct.seller.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Facultad:</span>
                        <span className="font-medium">{selectedProduct.seller.faculty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Calificación:</span>
                        <span className="font-medium">{selectedProduct.seller.rating} ⭐</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedProduct.status === "pending" && (
                <DialogFooter className="gap-2">
                  <Button
                    onClick={() => {
                      handleReject(selectedProduct.id);
                      setIsDialogOpen(false);
                    }}
                    variant="destructive"
                    className="rounded-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Rechazar
                  </Button>
                  <Button
                    onClick={() => {
                      handleApprove(selectedProduct.id);
                      setIsDialogOpen(false);
                    }}
                    className="bg-ucp-verde hover:bg-green-700 rounded-full"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Aprobar Publicación
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
