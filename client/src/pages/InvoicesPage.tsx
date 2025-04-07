import React, { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search as SearchIcon,
  Calendar,
  User,
  DollarSign,
  FileText,
  ShoppingBag,
  Eye,
  Download,
  Printer,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpDown,
  RefreshCcw,
  Filter,
  Mail
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const facturas = [
  {
    id: "F-00241",
    correlativo: "B001-00241",
    fecha: "2025-04-05T14:30:00",
    cliente: "Empresa XYZ S.A.",
    ruc: "20123456789",
    direccion: "Av. Principal 123, Lima",
    total: 590.50,
    estado: "Emitida",
    enviado: true,
    venta: {
      id: 125,
      detalles: [
        { producto: "Servicio de catering", cantidad: 1, precio: 500.00 },
        { producto: "Transporte", cantidad: 1, precio: 90.50 }
      ]
    }
  },
  {
    id: "F-00240",
    correlativo: "B001-00240",
    fecha: "2025-04-04T16:45:00",
    cliente: "Comercial ABC",
    ruc: "20987654321",
    direccion: "Jr. Los Pinos 456, Lima",
    total: 236.80,
    estado: "Emitida",
    enviado: true,
    venta: {
      id: 124,
      detalles: [
        { producto: "Servicio de consultoría", cantidad: 2, precio: 118.40 }
      ]
    }
  },
  {
    id: "F-00239",
    correlativo: "B001-00239",
    fecha: "2025-04-03T09:15:00",
    cliente: "Distribuidora Norte",
    ruc: "20555666777",
    direccion: "Av. Industrial 789, Lima",
    total: 1520.75,
    estado: "Anulada",
    enviado: true,
    venta: {
      id: 123,
      detalles: [
        { producto: "Servicio de entrega", cantidad: 1, precio: 150.75 },
        { producto: "Productos varios", cantidad: 1, precio: 1370.00 }
      ]
    }
  },
  {
    id: "F-00238",
    correlativo: "B001-00238",
    fecha: "2025-04-02T13:20:00",
    cliente: "Inversiones Sur",
    ruc: "20111222333",
    direccion: "Jr. Los Olivos 234, Lima",
    total: 349.99,
    estado: "Emitida",
    enviado: false,
    venta: {
      id: 122,
      detalles: [
        { producto: "Mantenimiento equipos", cantidad: 1, precio: 349.99 }
      ]
    }
  },
  {
    id: "F-00237",
    correlativo: "B001-00237",
    fecha: "2025-04-01T10:05:00",
    cliente: "Grupo Empresarial Este",
    ruc: "20444555666",
    direccion: "Av. Central 567, Lima",
    total: 875.30,
    estado: "Pendiente",
    enviado: false,
    venta: {
      id: 121,
      detalles: [
        { producto: "Desarrollo web", cantidad: 1, precio: 750.00 },
        { producto: "Hosting anual", cantidad: 1, precio: 125.30 }
      ]
    }
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
    case 'Emitida':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'Pendiente':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'Anulada':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const InvoicesPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { toast } = useToast();
  
  // Filtrar facturas según los criterios actuales
  const filteredFacturas = facturas.filter(factura => {
    // Filtro por estado (tab)
    if (currentTab !== "todas" && factura.estado.toLowerCase() !== currentTab.toLowerCase()) {
      return false;
    }
    
    // Filtro por búsqueda (cliente o número de factura)
    if (searchQuery && !factura.cliente.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !factura.correlativo.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !factura.ruc.includes(searchQuery)) {
      return false;
    }
    
    // Filtro por estado específico
    if (statusFilter && factura.estado !== statusFilter) {
      return false;
    }
    
    // TODO: Implementar filtro por fecha
    
    return true;
  });
  
  // Función para anular factura
  const handleAnular = (id: string) => {
    toast({
      title: "Factura anulada",
      description: `La factura ${id} ha sido anulada correctamente.`,
      variant: "destructive"
    });
  };
  
  // Función para reimprimir factura
  const handleReimprimir = (id: string) => {
    toast({
      title: "Reimprimiendo factura",
      description: `La factura ${id} se está imprimiendo.`
    });
  };
  
  // Función para descargar factura
  const handleDescargar = (id: string) => {
    toast({
      title: "Descargando factura",
      description: `La factura ${id} se está descargando.`
    });
  };
  
  // Función para enviar factura
  const handleEnviar = (id: string) => {
    toast({
      title: "Enviando factura",
      description: `La factura ${id} ha sido enviada por correo electrónico.`
    });
  };
  
  // Función para vista previa
  const handleVistaPrevia = (factura: any) => {
    setSelectedInvoice(factura);
    setIsPreviewOpen(true);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Facturas</h1>
          <p className="text-gray-500">Gestión de facturas electrónicas y comprobantes fiscales</p>
        </div>
        
        {/* Pestañas de estado */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="emitida">Emitidas</TabsTrigger>
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
              placeholder="Buscar por cliente, RUC o número..." 
              className="pl-9" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {statusFilter || "Estado"}
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Emitida">Emitida</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Anulada">Anulada</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Fecha</span>
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2" onClick={() => {
              setSearchQuery("");
              setDateFilter("");
              setStatusFilter("");
            }}>
              <RefreshCcw className="h-4 w-4" />
              <span>Limpiar</span>
            </Button>
          </div>
        </div>
        
        {/* Tabla de facturas */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1 cursor-pointer">
                      <span>Número</span>
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
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enviado
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFacturas.map((factura) => (
                  <tr key={factura.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        {factura.correlativo}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {formatDate(factura.fecha)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{factura.cliente}</div>
                        <div className="text-xs text-gray-500">RUC: {factura.ruc}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        {formatCurrency(factura.total)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className={getEstadoColor(factura.estado)}>
                        {factura.estado === "Emitida" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {factura.estado === "Pendiente" && <AlertCircle className="h-3 w-3 mr-1" />}
                        {factura.estado === "Anulada" && <XCircle className="h-3 w-3 mr-1" />}
                        {factura.estado}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Badge variant={factura.enviado ? "default" : "outline"} className={
                        factura.enviado ? "bg-blue-100 text-blue-800 border-blue-300" : "bg-gray-100 text-gray-800"
                      }>
                        {factura.enviado ? "Enviado" : "Pendiente"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-gray-500"
                          onClick={() => handleVistaPrevia(factura)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-blue-500"
                          onClick={() => handleReimprimir(factura.id)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-green-500"
                          onClick={() => handleDescargar(factura.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {!factura.enviado && factura.estado !== "Anulada" && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2 text-indigo-500"
                            onClick={() => handleEnviar(factura.id)}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
                        {factura.estado !== "Anulada" && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2 text-red-500"
                            onClick={() => handleAnular(factura.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredFacturas.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <FileText className="h-12 w-12 text-gray-300 mb-2" />
                        <p>No se encontraron facturas con los filtros aplicados</p>
                        <Button 
                          variant="link" 
                          className="mt-2"
                          onClick={() => {
                            setSearchQuery("");
                            setDateFilter("");
                            setStatusFilter("");
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
        
        {/* Modal de vista previa de factura */}
        {selectedInvoice && (
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Vista Previa de Factura</DialogTitle>
                <DialogDescription>
                  Detalles de la factura {selectedInvoice.correlativo}
                </DialogDescription>
              </DialogHeader>
              
              <div className="p-4 border rounded-md bg-white">
                <div className="flex justify-between items-start border-b pb-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-blue-700">FACTURA ELECTRÓNICA</h3>
                    <p className="text-lg font-bold">{selectedInvoice.correlativo}</p>
                    <p className="text-sm text-gray-500">Fecha de emisión: {formatDate(selectedInvoice.fecha)}</p>
                  </div>
                  <div className="text-right">
                    <h3 className="font-bold">EMPRESA S.A.C.</h3>
                    <p className="text-sm">RUC: 20123456789</p>
                    <p className="text-sm">Av. Principal 123, Lima</p>
                    <p className="text-sm">Teléfono: (01) 123-4567</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Datos del Cliente:</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p><span className="font-medium">Razón Social:</span> {selectedInvoice.cliente}</p>
                      <p><span className="font-medium">RUC:</span> {selectedInvoice.ruc}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">Dirección:</span> {selectedInvoice.direccion}</p>
                      <p><span className="font-medium">Venta Ref:</span> #{selectedInvoice.venta.id}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Detalle:</h4>
                  <table className="min-w-full divide-y divide-gray-200 border">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedInvoice.venta.detalles.map((detalle: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2">{detalle.producto}</td>
                          <td className="px-4 py-2 text-center">{detalle.cantidad}</td>
                          <td className="px-4 py-2 text-right">{formatCurrency(detalle.precio)}</td>
                          <td className="px-4 py-2 text-right">{formatCurrency(detalle.precio * detalle.cantidad)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={2} className="px-4 py-2"></td>
                        <td className="px-4 py-2 text-right font-medium">Subtotal:</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(selectedInvoice.total / 1.18)}</td>
                      </tr>
                      <tr>
                        <td colSpan={2} className="px-4 py-2"></td>
                        <td className="px-4 py-2 text-right font-medium">IGV (18%):</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(selectedInvoice.total - (selectedInvoice.total / 1.18))}</td>
                      </tr>
                      <tr>
                        <td colSpan={2} className="px-4 py-2"></td>
                        <td className="px-4 py-2 text-right font-bold">TOTAL:</td>
                        <td className="px-4 py-2 text-right font-bold">{formatCurrency(selectedInvoice.total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <div>
                    <Badge variant="outline" className={getEstadoColor(selectedInvoice.estado)}>
                      {selectedInvoice.estado}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2"
                      onClick={() => handleReimprimir(selectedInvoice.id)}
                    >
                      <Printer className="h-4 w-4" />
                      <span>Imprimir</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2"
                      onClick={() => handleDescargar(selectedInvoice.id)}
                    >
                      <Download className="h-4 w-4" />
                      <span>Descargar PDF</span>
                    </Button>
                    {!selectedInvoice.enviado && selectedInvoice.estado !== "Anulada" && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-2"
                        onClick={() => handleEnviar(selectedInvoice.id)}
                      >
                        <Mail className="h-4 w-4" />
                        <span>Enviar por Email</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
};

export default InvoicesPage;