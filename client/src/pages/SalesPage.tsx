import React, { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search as SearchIcon,
  Calendar,
  DollarSign,
  FileText,
  Download,
  Printer,
  CheckCircle,
  CreditCard,
  RefreshCcw,
  X,
  BarChart4,
  UserCircle,
  TrendingUp,
  CircleDollarSign,
  Tag,
  Receipt,
  ShoppingBag,
  Eye
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// Datos de ventas completadas únicamente
const ventas = [
  {
    id: 1,
    fecha: "2025-04-05T15:30:00",
    cliente: "Juan Pérez",
    total: 45.99,
    subtotal: 38.97,
    impuestos: 7.02,
    gananciaNeta: 15.88,
    margenPorcentual: 34.53,
    metodoPago: "Tarjeta",
    tipoVenta: "Presencial",
    origen: "POS",
    detalles: [
      { producto: "Hamburguesa Clásica", cantidad: 2, precio: 12.99, costo: 6.50 },
      { producto: "Bebida Gaseosa", cantidad: 2, precio: 1.99, costo: 0.75 },
      { producto: "Papas Fritas", cantidad: 1, precio: 3.99, costo: 1.20 }
    ]
  },
  {
    id: 2,
    fecha: "2025-04-05T14:15:00",
    cliente: "María González",
    total: 26.50,
    subtotal: 22.50,
    impuestos: 4.00,
    gananciaNeta: 10.60,
    margenPorcentual: 40.00,
    metodoPago: "Efectivo",
    tipoVenta: "Presencial",
    origen: "POS",
    detalles: [
      { producto: "Pizza Margarita", cantidad: 1, precio: 11.50, costo: 4.25 },
      { producto: "Bebida Gaseosa", cantidad: 1, precio: 1.99, costo: 0.75 },
      { producto: "Brownie de Chocolate", cantidad: 3, precio: 3.50, costo: 1.40 }
    ]
  },
  {
    id: 3,
    fecha: "2025-04-04T18:45:00",
    cliente: "Roberto Sánchez",
    total: 32.97,
    subtotal: 27.94,
    impuestos: 5.03,
    gananciaNeta: 13.19,
    margenPorcentual: 40.00,
    metodoPago: "Tarjeta",
    tipoVenta: "Presencial",
    origen: "POS",
    detalles: [
      { producto: "Pizza Pepperoni", cantidad: 1, precio: 12.99, costo: 5.20 },
      { producto: "Ensalada César", cantidad: 2, precio: 9.99, costo: 4.80 }
    ]
  },
  {
    id: 5,
    fecha: "2025-04-03T20:10:00",
    cliente: "Carlos Mendoza",
    total: 53.47,
    subtotal: 45.31,
    impuestos: 8.16,
    gananciaNeta: 20.51,
    margenPorcentual: 38.36,
    metodoPago: "Tarjeta",
    tipoVenta: "Presencial",
    origen: "Pedido Online",
    detalles: [
      { producto: "Pizza Familiar", cantidad: 1, precio: 25.99, costo: 10.40 },
      { producto: "Bebida Gaseosa 2L", cantidad: 1, precio: 3.50, costo: 1.40 },
      { producto: "Brownie de Chocolate", cantidad: 4, precio: 3.50, costo: 1.40 },
      { producto: "Palitos de Ajo", cantidad: 1, precio: 6.99, costo: 2.80 }
    ]
  },
  {
    id: 6,
    fecha: "2025-04-02T12:20:00",
    cliente: "Luisa Ramírez",
    total: 64.75,
    subtotal: 54.87,
    impuestos: 9.88,
    gananciaNeta: 25.99,
    margenPorcentual: 40.14,
    metodoPago: "Transferencia",
    tipoVenta: "Delivery",
    origen: "Pedido Online",
    detalles: [
      { producto: "Combo Familiar", cantidad: 1, precio: 39.99, costo: 16.00 },
      { producto: "Alitas BBQ", cantidad: 1, precio: 14.88, costo: 5.95 },
      { producto: "Bebida Gaseosa 2L", cantidad: 2, precio: 3.50, costo: 1.40 }
    ]
  }
];

// Función para formatear la fecha
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};

// Genera una referencia para la venta
const generarReferencia = (venta: any) => {
  const prefijo = venta.origen === "POS" ? "POS" : "ORD";
  return `${prefijo}-${(venta.id + 1000).toString().padStart(4, '0')}`;
};

// Función para calcular estadísticas
const calcularEstadisticas = (ventas: any[]) => {
  // Total de ventas
  const totalVentas = ventas.reduce((acc, venta) => acc + venta.total, 0);
  
  // Ganancia neta total
  const gananciaTotal = ventas.reduce((acc, venta) => acc + venta.gananciaNeta, 0);
  
  // Margen promedio
  const margenPromedio = gananciaTotal / totalVentas * 100;
  
  // Ventas por método de pago
  const ventasPorMetodo: {[key: string]: number} = {};
  ventas.forEach(venta => {
    ventasPorMetodo[venta.metodoPago] = (ventasPorMetodo[venta.metodoPago] || 0) + venta.total;
  });
  
  // Ordenar métodos de pago por volumen
  const metodosPago = Object.entries(ventasPorMetodo)
    .sort((a, b) => b[1] - a[1])
    .map(([metodo, monto]) => ({ metodo, monto }));
  
  return {
    totalVentas,
    gananciaTotal,
    margenPromedio,
    metodosPago,
    totalTransacciones: ventas.length
  };
};

const SalesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("todos");
  const [detailsOpen, setDetailsOpen] = useState<number | null>(null);
  const { toast } = useToast();
  
  // Estadísticas de ventas
  const estadisticas = calcularEstadisticas(ventas);
  
  // Filtrar ventas según los criterios actuales
  const filteredVentas = ventas.filter(venta => {
    // Filtro por búsqueda
    if (searchQuery && !venta.cliente.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filtro por método de pago
    if (paymentFilter && paymentFilter !== "todos" && venta.metodoPago !== paymentFilter) {
      return false;
    }
    
    // Filtro por fecha se implementaría aquí
    
    return true;
  });
  
  // Función para reimprimir comprobante
  const handleReimprimir = (id: number) => {
    toast({
      title: "Reimprimiendo comprobante",
      description: `El comprobante de la venta #${id} se está imprimiendo.`
    });
  };
  
  // Función para descargar comprobante
  const handleDescargar = (id: number) => {
    toast({
      title: "Descargando comprobante",
      description: `El comprobante de la venta #${id} se está descargando.`
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Ventas Completadas</h1>
            <p className="text-gray-500">Registro financiero de todas las transacciones finalizadas</p>
          </div>
          
          {/* Dashboard de métricas horizontal */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 md:mt-0">
            <div className="bg-background border rounded-md p-2 shadow-sm">
              <div className="text-xs text-muted-foreground mb-1">Total Ventas</div>
              <div className="text-base font-semibold">{formatCurrency(estadisticas.totalVentas)}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <CircleDollarSign className="mr-1 h-3 w-3 text-primary" />
                <span>{estadisticas.totalTransacciones} transacciones</span>
              </div>
            </div>
            
            <div className="bg-background border rounded-md p-2 shadow-sm">
              <div className="text-xs text-muted-foreground mb-1">Ganancia Neta</div>
              <div className="text-base font-semibold text-green-600">{formatCurrency(estadisticas.gananciaTotal)}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                <span>Margen del {estadisticas.margenPromedio.toFixed(2)}%</span>
              </div>
            </div>
            
            <div className="bg-background border rounded-md p-2 shadow-sm">
              <div className="text-xs text-muted-foreground mb-1">Método Principal</div>
              <div className="text-base font-semibold">
                {estadisticas.metodosPago.length > 0 ? estadisticas.metodosPago[0].metodo : "N/A"}
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <CreditCard className="mr-1 h-3 w-3 text-primary" />
                <span>
                  {estadisticas.metodosPago.length > 0 
                    ? formatCurrency(estadisticas.metodosPago[0].monto)
                    : "Sin datos"}
                </span>
              </div>
            </div>
            
            <div className="bg-background border rounded-md p-2 shadow-sm">
              <div className="text-xs text-muted-foreground mb-1">Promedio por Venta</div>
              <div className="text-base font-semibold">
                {formatCurrency(estadisticas.totalVentas / Math.max(1, estadisticas.totalTransacciones))}
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Receipt className="mr-1 h-3 w-3 text-primary" />
                <span>Por transacción</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filtros y Buscador */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              type="text" 
              placeholder="Buscar por cliente..." 
              className="pl-9" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-[160px]">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  {paymentFilter || "Método de pago"}
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                <SelectItem value="Efectivo">Efectivo</SelectItem>
                <SelectItem value="Transferencia">Transferencia</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Fecha</span>
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2" onClick={() => {
              setSearchQuery("");
              setDateFilter("");
              setPaymentFilter("todos");
            }}>
              <RefreshCcw className="h-4 w-4" />
              <span>Limpiar</span>
            </Button>
          </div>
        </div>
        
        {/* Tarjetas de ventas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVentas.map((venta) => {
            const fechaFormateada = formatDate(venta.fecha);
            const referencia = generarReferencia(venta);
            
            return (
              <Card key={venta.id} className="overflow-hidden">
                <CardHeader className="pb-2 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-base">Venta #{venta.id}</CardTitle>
                      <CardDescription>{fechaFormateada}</CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      Completada
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium">{venta.cliente}</div>
                          <div className="text-xs text-gray-500">{venta.origen}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-primary">{formatCurrency(venta.total)}</div>
                        <div className="text-xs text-gray-500">{venta.metodoPago}</div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Subtotal</div>
                        <div className="font-medium">{formatCurrency(venta.subtotal)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Impuestos</div>
                        <div className="font-medium">{formatCurrency(venta.impuestos)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Ganancia</div>
                        <div className="font-medium text-green-600">{formatCurrency(venta.gananciaNeta)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Margen</div>
                        <div className="font-medium text-green-600">{venta.margenPorcentual.toFixed(2)}%</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500">Referencia</div>
                      <div className="font-medium">{referencia}</div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-2 pb-4 border-t">
                  <div className="w-full flex justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-orange-500 hover:text-orange-600"
                      onClick={() => setDetailsOpen(detailsOpen === venta.id ? null : venta.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" /> Ver detalles
                    </Button>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleReimprimir(venta.id)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleDescargar(venta.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
        
        {/* Paginación */}
        <div className="mt-6 flex justify-center">
          <nav className="inline-flex rounded-md shadow">
            <Button variant="outline" size="sm" className="rounded-l-md">
              Anterior
            </Button>
            <Button variant="outline" size="sm" className="rounded-none border-l-0 border-r-0 bg-primary text-primary-foreground">
              1
            </Button>
            <Button variant="outline" size="sm" className="rounded-none border-r-0">
              2
            </Button>
            <Button variant="outline" size="sm" className="rounded-r-md">
              Siguiente
            </Button>
          </nav>
        </div>
      </div>
      
      {/* Modal de Detalles */}
      {ventas.map((venta) => (
        <Dialog key={venta.id} open={detailsOpen === venta.id} onOpenChange={() => setDetailsOpen(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Detalles de Venta #{venta.id}</DialogTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={() => setDetailsOpen(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <DialogDescription>
                {formatDate(venta.fecha)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Información general */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Cliente</div>
                  <div className="font-medium">{venta.cliente}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Método de Pago</div>
                  <div className="font-medium">{venta.metodoPago}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Estado</div>
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    Completada
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Origen</div>
                  <div className="font-medium">{venta.origen}</div>
                </div>
              </div>
              
              {/* Productos */}
              <div>
                <h4 className="font-medium mb-2">Productos</h4>
                <div className="space-y-2">
                  {venta.detalles.map((detalle, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{detalle.producto}</div>
                        <div className="text-sm text-gray-500">
                          {detalle.cantidad} x {formatCurrency(detalle.precio)}
                        </div>
                      </div>
                      <div className="font-medium">
                        {formatCurrency(detalle.cantidad * detalle.precio)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Resumen financiero */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex justify-between items-center">
                  <div className="text-sm">Subtotal</div>
                  <div>{formatCurrency(venta.subtotal)}</div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm">Impuestos</div>
                  <div>{formatCurrency(venta.impuestos)}</div>
                </div>
                
                <div className="flex justify-between items-center font-bold border-t pt-2">
                  <div>Total</div>
                  <div>{formatCurrency(venta.total)}</div>
                </div>
                
                <div className="flex justify-between items-center text-green-600 pt-2">
                  <div className="text-sm">Ganancia</div>
                  <div>{formatCurrency(venta.gananciaNeta)} ({venta.margenPorcentual.toFixed(1)}%)</div>
                </div>
              </div>
              
              {/* Acciones */}
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    handleReimprimir(venta.id);
                  }}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
                
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => {
                    handleDescargar(venta.id);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </MainLayout>
  );
}

export default SalesPage;