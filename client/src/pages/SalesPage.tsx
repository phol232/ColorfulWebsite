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
  RefreshCcw
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

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
    
    // TODO: Implementar filtro por fecha
    
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
        
        {/* Tabla de ventas */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1 cursor-pointer">
                      <span>ID Venta</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1 cursor-pointer">
                      <span>Fecha</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1 cursor-pointer">
                      <span>Total</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método de pago
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVentas.map((venta) => {
                  return (
                    <React.Fragment key={venta.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{venta.id.toString().padStart(4, '0')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            {formatDate(venta.fecha)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            {venta.cliente}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-green-500" />
                            {formatCurrency(venta.total)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            {venta.metodoPago === "Tarjeta" ? 
                              <CreditCard className="h-4 w-4 text-blue-500" /> : 
                              <DollarSign className="h-4 w-4 text-green-500" />
                            }
                            {venta.metodoPago}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline" className={getEstadoColor(venta.estado)}>
                            {venta.estado === "Completada" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {venta.estado === "Pendiente" && <AlertCircle className="h-3 w-3 mr-1" />}
                            {venta.estado === "Anulada" && <XCircle className="h-3 w-3 mr-1" />}
                            {venta.estado}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-gray-500"
                              onClick={() => setDetailsOpen(detailsOpen === venta.id ? null : venta.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-blue-500"
                              onClick={() => handleReimprimir(venta.id)}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-green-500"
                              onClick={() => handleDescargar(venta.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            {venta.estado !== "Anulada" && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 px-2 text-red-500"
                                onClick={() => handleAnular(venta.id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                      
                      {/* Detalles de la venta */}
                      {detailsOpen === venta.id && (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 bg-gray-50">
                            <div className="border-t border-b border-gray-200 py-3">
                              <h4 className="font-medium mb-2">Detalles de la venta #{venta.id.toString().padStart(4, '0')}</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                                <div>
                                  <div className="text-xs text-gray-500">Tipo de Venta</div>
                                  <div className="font-medium">{venta.tipoVenta}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Cliente</div>
                                  <div className="font-medium">{venta.cliente}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Método de Pago</div>
                                  <div className="font-medium">{venta.metodoPago}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Estado</div>
                                  <Badge variant="outline" className={getEstadoColor(venta.estado)}>
                                    {venta.estado}
                                  </Badge>
                                </div>
                              </div>
                              
                              <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Producto
                                    </th>
                                    <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Cantidad
                                    </th>
                                    <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Precio Unitario
                                    </th>
                                    <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Subtotal
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {venta.detalles.map((detalle, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                      <td className="px-4 py-2 whitespace-nowrap">{detalle.producto}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-center">{detalle.cantidad}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-right">{formatCurrency(detalle.precio)}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-right font-medium">{formatCurrency(detalle.precio * detalle.cantidad)}</td>
                                    </tr>
                                  ))}
                                  <tr className="bg-gray-50">
                                    <td colSpan={3} className="px-4 py-2 text-right font-medium">Total</td>
                                    <td className="px-4 py-2 text-right font-bold">{formatCurrency(venta.total)}</td>
                                  </tr>
                                </tbody>
                              </table>
                              
                              <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => handleReimprimir(venta.id)}>
                                  <Printer className="h-4 w-4" />
                                  <span>Imprimir Comprobante</span>
                                </Button>
                                {venta.estado !== "Anulada" && (
                                  <Button variant="outline" size="sm" className="flex items-center gap-2 text-red-500 border-red-200 hover:bg-red-50" onClick={() => handleAnular(venta.id)}>
                                    <XCircle className="h-4 w-4" />
                                    <span>Anular Venta</span>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
                
                {filteredVentas.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <ShoppingBag className="h-12 w-12 text-gray-300 mb-2" />
                        <p>No se encontraron ventas con los filtros aplicados</p>
                        <Button 
                          variant="link" 
                          className="mt-2"
                          onClick={() => {
                            setSearchQuery("");
                            setDateFilter("");
                            setPaymentFilter("");
                            setCurrentTab("todas");
                          }}
                        >
                          Limpiar filtros
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SalesPage;