import React, { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search as SearchIcon,
  Filter as FilterIcon,
  Calendar,
  User,
  DollarSign,
  ChevronDown,
  FileText,
  ShoppingBag,
  Eye,
  Download,
  Printer,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  ArrowUpDown,
  RefreshCcw,
  X
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const ventas = [
  {
    id: 1,
    fecha: "2025-04-05T15:30:00",
    cliente: "Juan Pérez",
    total: 45.99,
    metodoPago: "Tarjeta",
    estado: "Completada",
    tipoVenta: "Presencial",
    detalles: [
      { producto: "Hamburguesa Clásica", cantidad: 2, precio: 12.99 },
      { producto: "Bebida Gaseosa", cantidad: 2, precio: 1.99 },
      { producto: "Papas Fritas", cantidad: 1, precio: 3.99 }
    ]
  },
  {
    id: 2,
    fecha: "2025-04-05T14:15:00",
    cliente: "María González",
    total: 26.50,
    metodoPago: "Efectivo",
    estado: "Completada",
    tipoVenta: "Presencial",
    detalles: [
      { producto: "Pizza Margarita", cantidad: 1, precio: 11.50 },
      { producto: "Bebida Gaseosa", cantidad: 1, precio: 1.99 },
      { producto: "Brownie de Chocolate", cantidad: 3, precio: 3.50 }
    ]
  },
  {
    id: 3,
    fecha: "2025-04-04T18:45:00",
    cliente: "Roberto Sánchez",
    total: 32.97,
    metodoPago: "Tarjeta",
    estado: "Completada",
    tipoVenta: "Presencial",
    detalles: [
      { producto: "Pizza Pepperoni", cantidad: 1, precio: 12.99 },
      { producto: "Ensalada César", cantidad: 2, precio: 9.99 }
    ]
  },
  {
    id: 4,
    fecha: "2025-04-04T11:20:00",
    cliente: "Ana Torres",
    total: 17.97,
    metodoPago: "Efectivo",
    estado: "Anulada",
    tipoVenta: "Presencial",
    detalles: [
      { producto: "Hamburguesa Doble", cantidad: 1, precio: 15.99 },
      { producto: "Agua Mineral", cantidad: 1, precio: 1.99 }
    ]
  },
  {
    id: 5,
    fecha: "2025-04-03T20:10:00",
    cliente: "Carlos Mendoza",
    total: 53.47,
    metodoPago: "Tarjeta",
    estado: "Completada",
    tipoVenta: "Presencial",
    detalles: [
      { producto: "Pizza Familiar", cantidad: 1, precio: 25.99 },
      { producto: "Bebida Gaseosa 2L", cantidad: 1, precio: 3.50 },
      { producto: "Brownie de Chocolate", cantidad: 4, precio: 3.50 },
      { producto: "Palitos de Ajo", cantidad: 1, precio: 6.99 }
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

// Estado de color para los badges
const getEstadoColor = (estado: string) => {
  switch (estado) {
    case 'Completada':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'Pendiente':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'Anulada':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

// Función para generar códigos de referencia aleatorios
const generarReferencia = (venta: any) => {
  const prefijos = {
    'Completada': 'OC',
    'Pendiente': 'PED',
    'Anulada': 'AJ'
  };
  const prefijo = prefijos[venta.estado as keyof typeof prefijos] || 'REF';
  return `${prefijo}-${Math.floor(1000 + Math.random() * 9000)}`;
};

// Función para generar SKUs
const generarSKU = (venta: any) => {
  const productos = {
    'Hamburguesa Clásica': 'BURG',
    'Pizza Margarita': 'PIZ',
    'Pizza Pepperoni': 'PIZ',
    'Hamburguesa Doble': 'BURG',
    'Pizza Familiar': 'PIZ',
    'Brownie de Chocolate': 'POS'
  };
  
  const producto = venta.detalles[0].producto;
  const prefijo = (productos as any)[producto] || 'PROD';
  return `${prefijo}-${(venta.id + 100).toString().padStart(3, '0')}`;
};

const SalesPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [detailsOpen, setDetailsOpen] = useState<number | null>(null);
  const { toast } = useToast();
  
  // Filtrar ventas según los criterios actuales
  const filteredVentas = ventas.filter(venta => {
    // Filtro por estado (tab)
    if (currentTab !== "todas" && venta.estado.toLowerCase() !== currentTab) {
      return false;
    }
    
    // Filtro por búsqueda
    if (searchQuery && !venta.cliente.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filtro por método de pago
    if (paymentFilter && venta.metodoPago !== paymentFilter) {
      return false;
    }
    
    // Filtro por fecha se implementaría aquí
    
    return true;
  });

  // Función para anular venta
  const handleAnular = (id: number) => {
    toast({
      title: "Venta anulada",
      description: `La venta #${id} ha sido anulada correctamente.`,
      variant: "destructive"
    });
  };
  
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Ventas</h1>
          <p className="text-gray-500">Registro y historial completo de ventas realizadas</p>
        </div>
        
        {/* Pestañas de estado */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="completada">Completadas</TabsTrigger>
            <TabsTrigger value="pendiente">Pendientes</TabsTrigger>
            <TabsTrigger value="anulada">Anuladas</TabsTrigger>
          </TabsList>
        </Tabs>
        
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
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Fecha</span>
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2" onClick={() => {
              setSearchQuery("");
              setDateFilter("");
              setPaymentFilter("");
            }}>
              <RefreshCcw className="h-4 w-4" />
              <span>Limpiar</span>
            </Button>
          </div>
        </div>
        
        {/* Tarjetas de ventas - Estilo similar a la imagen proporcionada */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVentas.map((venta) => {
            const fechaParts = formatDate(venta.fecha).split(',');
            const fechaDia = fechaParts[0];
            const fechaHora = fechaParts[1];
            const sku = generarSKU(venta);
            const referencia = generarReferencia(venta);
            
            // Mapeo de estados a tipos de movimiento para la UI
            const tipoMovimiento = venta.estado === "Completada" ? "Entrada" : 
                                venta.estado === "Anulada" ? "Salida" : "Ajuste";
            
            // Notas según el tipo de movimiento
            const nota = tipoMovimiento === "Entrada" ? "Recepción de pedido semanal" : 
                        tipoMovimiento === "Salida" ? "Venta a cliente" : 
                        "Merma por caducidad";
                        
            return (
              <Card key={venta.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 border-b flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-8 rounded-full ${
                        tipoMovimiento === 'Entrada' ? 'bg-green-500' : 
                        tipoMovimiento === 'Salida' ? 'bg-red-500' : 
                        'bg-blue-500'
                      }`}></div>
                      <div>
                        <div className="text-sm text-gray-500">
                          {fechaDia}
                        </div>
                        <div className="font-semibold text-base">
                          {fechaHora}
                        </div>
                      </div>
                    </div>
                    
                    <Badge variant="outline" className={
                      tipoMovimiento === 'Entrada' ? 'bg-green-100 text-green-800 border-green-300' :
                      tipoMovimiento === 'Salida' ? 'bg-red-100 text-red-800 border-red-300' :
                      'bg-blue-100 text-blue-800 border-blue-300'
                    }>
                      {tipoMovimiento}
                    </Badge>
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold">
                        {venta.detalles[0].producto}
                      </h3>
                      <div className="text-sm text-gray-500">
                        SKU: {sku}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500">Cantidad</div>
                        <div className={`flex items-center gap-1 font-semibold 
                          ${tipoMovimiento === 'Entrada' ? 'text-green-600' : 
                            tipoMovimiento === 'Salida' ? 'text-red-600' : 
                            'text-blue-600'}`
                        }>
                          {tipoMovimiento === 'Entrada' ? '↑' : 
                           tipoMovimiento === 'Salida' ? '↓' : ''} 
                          {venta.detalles[0].cantidad}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-500">Usuario</div>
                        <div className="font-semibold">
                          {venta.cliente}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-sm text-gray-500">Referencia</div>
                      <div className="font-semibold">
                        {referencia}
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="text-sm text-gray-500">Nota:</div>
                      <div className="text-sm">
                        {nota}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border-t flex justify-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-orange-500 hover:text-orange-600"
                      onClick={() => setDetailsOpen(detailsOpen === venta.id ? null : venta.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" /> Ver detalles
                    </Button>
                  </div>
                </CardContent>
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
            <Button variant="outline" size="sm" className="rounded-none border-r-0">
              3
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
                  <Badge variant="outline" className={getEstadoColor(venta.estado)}>
                    {venta.estado}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Tipo de Venta</div>
                  <div className="font-medium">{venta.tipoVenta}</div>
                </div>
              </div>
              
              {/* Detalles de productos */}
              <div>
                <h3 className="text-sm font-medium mb-2">Productos</h3>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 p-2 text-xs font-medium text-gray-500 border-b">
                    <div className="col-span-6">Producto</div>
                    <div className="col-span-2 text-right">Precio</div>
                    <div className="col-span-2 text-center">Cantidad</div>
                    <div className="col-span-2 text-right">Subtotal</div>
                  </div>
                  {venta.detalles.map((detalle, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 p-2 text-sm border-b last:border-0">
                      <div className="col-span-6 font-medium">{detalle.producto}</div>
                      <div className="col-span-2 text-right">{formatCurrency(detalle.precio)}</div>
                      <div className="col-span-2 text-center">{detalle.cantidad}</div>
                      <div className="col-span-2 text-right font-medium">{formatCurrency(detalle.precio * detalle.cantidad)}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Total */}
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(venta.total)}</span>
              </div>
              
              {/* Botones de acción */}
              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-1"
                  onClick={() => handleReimprimir(venta.id)}
                >
                  <Printer className="h-4 w-4" />
                  <span>Imprimir</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-1"
                  onClick={() => handleDescargar(venta.id)}
                >
                  <Download className="h-4 w-4" />
                  <span>Descargar</span>
                </Button>
                {venta.estado !== "Anulada" && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="gap-1"
                    onClick={() => {
                      handleAnular(venta.id);
                      setDetailsOpen(null);
                    }}
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Anular</span>
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </MainLayout>
  );
};

export default SalesPage;