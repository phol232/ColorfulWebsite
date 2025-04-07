import React, { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search as SearchIcon,
  Filter as FilterIcon,
  Package,
  ShoppingBag,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Info,
  FileText,
  Eye,
  AlertCircle,
  ShoppingCart,
  ArrowRightCircle
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Datos de ejemplo
const pedidos = [
  {
    id: "PED-2025-4832",
    fecha: "07 Abr 2025, 15:30",
    cliente: "María González",
    total: 245.80,
    estado: "pendiente",
    items: 5,
    direccion: "Av. Principal 123, Ciudad",
    metodoPago: "Tarjeta de Crédito",
    productos: [
      { id: 1, nombre: "Hamburguesa Clásica", cantidad: 2, precio: 12.99 },
      { id: 2, nombre: "Pizza Margarita", cantidad: 1, precio: 11.50 },
      { id: 3, nombre: "Agua Mineral 500ml", cantidad: 2, precio: 1.99 }
    ]
  },
  {
    id: "PED-2025-4831",
    fecha: "07 Abr 2025, 14:15",
    cliente: "Juan Pérez",
    total: 96.50,
    estado: "procesando",
    items: 3,
    direccion: "Calle Secundaria 456, Ciudad",
    metodoPago: "Efectivo",
    productos: [
      { id: 4, nombre: "Brownie de Chocolate", cantidad: 2, precio: 3.50 },
      { id: 5, nombre: "Ensalada César", cantidad: 3, precio: 9.99 },
      { id: 3, nombre: "Agua Mineral 500ml", cantidad: 4, precio: 1.99 }
    ]
  },
  {
    id: "PED-2025-4830",
    fecha: "07 Abr 2025, 12:45",
    cliente: "Ana López",
    total: 154.25,
    estado: "enviado",
    items: 4,
    direccion: "Plaza Mayor 789, Ciudad",
    metodoPago: "Transferencia Bancaria",
    productos: [
      { id: 1, nombre: "Hamburguesa Clásica", cantidad: 3, precio: 12.99 },
      { id: 2, nombre: "Pizza Margarita", cantidad: 2, precio: 11.50 },
      { id: 4, nombre: "Brownie de Chocolate", cantidad: 4, precio: 3.50 }
    ]
  },
  {
    id: "PED-2025-4829",
    fecha: "07 Abr 2025, 10:10",
    cliente: "Carlos Martínez",
    total: 89.95,
    estado: "entregado",
    items: 3,
    direccion: "Avenida Norte 321, Ciudad",
    metodoPago: "Tarjeta de Débito",
    productos: [
      { id: 5, nombre: "Ensalada César", cantidad: 2, precio: 9.99 },
      { id: 1, nombre: "Hamburguesa Clásica", cantidad: 3, precio: 12.99 },
      { id: 3, nombre: "Agua Mineral 500ml", cantidad: 10, precio: 1.99 }
    ]
  },
  {
    id: "PED-2025-4828",
    fecha: "06 Abr 2025, 18:20",
    cliente: "Laura Sánchez",
    total: 63.75,
    estado: "cancelado",
    items: 2,
    direccion: "Calle Sur 654, Ciudad",
    metodoPago: "Efectivo",
    productos: [
      { id: 2, nombre: "Pizza Margarita", cantidad: 5, precio: 11.50 },
      { id: 4, nombre: "Brownie de Chocolate", cantidad: 2, precio: 3.50 }
    ]
  }
];

const OrdersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false);
  
  // Filtrar pedidos según el tab activo
  const filteredOrders = activeTab === "all" 
    ? pedidos 
    : pedidos.filter(p => p.estado === activeTab);
  
  const viewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };
  
  const updateOrderStatus = (order: any) => {
    setSelectedOrder(order);
    setIsStatusUpdateOpen(true);
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "pendiente":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-400">Pendiente</Badge>;
      case "procesando":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-400">Procesando</Badge>;
      case "enviado":
        return <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-400">Enviado</Badge>;
      case "entregado":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-400">Entregado</Badge>;
      case "cancelado":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-400">Cancelado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case "pendiente":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "procesando":
        return <ShoppingBag className="h-5 w-5 text-blue-500" />;
      case "enviado":
        return <Truck className="h-5 w-5 text-indigo-500" />;
      case "entregado":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "cancelado":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gestión de Pedidos</h1>
          <p className="text-gray-500">Administra todos los pedidos y actualiza sus estados</p>
        </div>
        
        {/* Métricas de Pedidos */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ShoppingCart className="mr-2 h-4 w-4 text-primary" />
                <div className="text-2xl font-bold">42</div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="text-green-500">↑ 12%</span> este mes
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                <div className="text-2xl font-bold">8</div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Requieren atención pronto
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">En Proceso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ShoppingBag className="mr-2 h-4 w-4 text-blue-500" />
                <div className="text-2xl font-bold">5</div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Siendo preparados
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Enviados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Truck className="mr-2 h-4 w-4 text-indigo-500" />
                <div className="text-2xl font-bold">12</div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                En camino a destino
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                <div className="text-2xl font-bold">17</div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Entregados exitosamente
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Lista de Pedidos */}
        <div className="bg-white rounded-lg border shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-4 border-b">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input type="text" placeholder="Buscar por ID de pedido, cliente..." className="pl-9" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <FilterIcon className="h-4 w-4" />
                <span>Filtrar</span>
              </Button>
              <Select defaultValue="hoy">
                <SelectTrigger className="h-9 w-[150px]">
                  <SelectValue placeholder="Periodo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoy">Hoy</SelectItem>
                  <SelectItem value="ayer">Ayer</SelectItem>
                  <SelectItem value="semana">Esta Semana</SelectItem>
                  <SelectItem value="mes">Este Mes</SelectItem>
                  <SelectItem value="todos">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex w-full rounded-none border-b bg-transparent p-0">
              <TabsTrigger 
                value="all"
                className="flex-1 rounded-none border-b-2 border-transparent px-3 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Todos
              </TabsTrigger>
              <TabsTrigger 
                value="pendiente"
                className="flex-1 rounded-none border-b-2 border-transparent px-3 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Pendientes
              </TabsTrigger>
              <TabsTrigger 
                value="procesando"
                className="flex-1 rounded-none border-b-2 border-transparent px-3 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Procesando
              </TabsTrigger>
              <TabsTrigger 
                value="enviado"
                className="flex-1 rounded-none border-b-2 border-transparent px-3 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Enviados
              </TabsTrigger>
              <TabsTrigger 
                value="entregado"
                className="flex-1 rounded-none border-b-2 border-transparent px-3 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Entregados
              </TabsTrigger>
              <TabsTrigger 
                value="cancelado"
                className="flex-1 rounded-none border-b-2 border-transparent px-3 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Cancelados
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="p-0 space-y-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {filteredOrders.map((pedido) => (
                  <Card key={pedido.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{pedido.id}</CardTitle>
                        <CardDescription>
                          {pedido.fecha}
                        </CardDescription>
                      </div>
                      {getStatusIcon(pedido.estado)}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="font-medium">{pedido.cliente}</p>
                        <p className="text-sm text-muted-foreground truncate">{pedido.direccion}</p>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="font-bold text-lg">{formatCurrency(pedido.total)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Items</p>
                          <p className="font-medium">{pedido.items}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2">
                        <div>
                          {getStatusBadge(pedido.estado)}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1"
                            onClick={() => viewOrderDetails(pedido)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Ver</span>
                          </Button>
                          <Button 
                            variant={pedido.estado === "cancelado" || pedido.estado === "entregado" ? "outline" : "default"} 
                            size="sm" 
                            className="flex items-center gap-1"
                            onClick={() => updateOrderStatus(pedido)}
                            disabled={pedido.estado === "cancelado" || pedido.estado === "entregado"}
                          >
                            <ArrowRightCircle className="h-3.5 w-3.5" />
                            <span>Estado</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Modal de Detalles del Pedido */}
      {selectedOrder && (
        <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detalles del Pedido</DialogTitle>
              <DialogDescription>
                Información completa del pedido {selectedOrder.id}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Información General</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID de Pedido:</span>
                      <span className="font-medium">{selectedOrder.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha:</span>
                      <span>{selectedOrder.fecha}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado:</span>
                      <span>{getStatusBadge(selectedOrder.estado)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Método de Pago:</span>
                      <span>{selectedOrder.metodoPago}</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Cliente</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nombre:</span>
                      <span>{selectedOrder.cliente}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dirección:</span>
                      <span className="text-right">{selectedOrder.direccion}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-2">Productos</h3>
                <div className="border rounded-md divide-y">
                  {selectedOrder.productos.map((producto: any, index: number) => (
                    <div key={index} className="p-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{producto.nombre}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(producto.precio)} c/u</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(producto.precio * producto.cantidad)}</p>
                        <p className="text-sm text-gray-500">Cant: {producto.cantidad}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>{formatCurrency(selectedOrder.total * 0.84)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Impuestos (16%):</span>
                      <span>{formatCurrency(selectedOrder.total * 0.16)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex gap-2">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button 
                variant={selectedOrder.estado === "cancelado" || selectedOrder.estado === "entregado" ? "outline" : "default"}
                onClick={() => {
                  setIsOrderDetailsOpen(false);
                  updateOrderStatus(selectedOrder);
                }}
                disabled={selectedOrder.estado === "cancelado" || selectedOrder.estado === "entregado"}
              >
                <ArrowRightCircle className="h-4 w-4 mr-2" />
                Actualizar Estado
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Modal para Actualizar Estado */}
      {selectedOrder && (
        <Dialog open={isStatusUpdateOpen} onOpenChange={setIsStatusUpdateOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Actualizar Estado del Pedido</DialogTitle>
              <DialogDescription>
                Cambia el estado del pedido {selectedOrder.id}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <span className="mr-3">{getStatusIcon(selectedOrder.estado)}</span>
                <div>
                  <p className="font-medium">Estado Actual</p>
                  <div className="mt-1">{getStatusBadge(selectedOrder.estado)}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nuevo-estado">Selecciona el nuevo estado</Label>
                <Select defaultValue={selectedOrder.estado}>
                  <SelectTrigger id="nuevo-estado">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="procesando">Procesando</SelectItem>
                    <SelectItem value="enviado">Enviado</SelectItem>
                    <SelectItem value="entregado">Entregado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nota">Nota (opcional)</Label>
                <Input 
                  id="nota" 
                  placeholder="Añade una nota sobre este cambio de estado" 
                  className="w-full"
                />
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button>Guardar Cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </MainLayout>
  );
};

export default OrdersPage;