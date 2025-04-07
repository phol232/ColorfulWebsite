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
  Mail,
  Building
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

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

// Obtén el primer producto del detalle de la factura
const getPrimerProducto = (factura: any) => {
  if (factura.venta && factura.venta.detalles && factura.venta.detalles.length > 0) {
    return factura.venta.detalles[0].producto;
  }
  return "Producto no especificado";
};

// Genera un SKU para el producto
const generarSKU = (factura: any) => {
  const producto = getPrimerProducto(factura);
  let prefijo = "PROD";
  
  if (producto.includes("Servicio")) prefijo = "SERV";
  else if (producto.includes("Desarrollo")) prefijo = "DEV";
  else if (producto.includes("Mantenimiento")) prefijo = "MANT";
  else if (producto.includes("Hosting")) prefijo = "HOST";
  else if (producto.includes("Transporte")) prefijo = "TRANS";
  
  return `${prefijo}-${factura.id.split('-')[1].padStart(3, '0')}`;
};

// Genera una referencia para la factura
const generarReferencia = (factura: any) => {
  let prefijo = "FAC";
  if (factura.estado === "Anulada") prefijo = "AJ";
  else if (factura.estado === "Pendiente") prefijo = "PED";
  
  return `${prefijo}-${Math.floor(1000 + Math.random() * 9000)}`;
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
    
    // Filtro por fecha se implementaría aquí
    
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
        
        {/* Tarjetas de facturas - Estilo similar a la imagen proporcionada */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFacturas.map((factura) => {
            const fechaParts = formatDate(factura.fecha).split(',');
            const fechaDia = fechaParts[0];
            const fechaHora = fechaParts[1];
            const sku = generarSKU(factura);
            const referencia = generarReferencia(factura);
            
            // Mapeo de estados a tipos de movimiento para la UI
            const tipoMovimiento = factura.estado === "Emitida" ? "Entrada" : 
                                factura.estado === "Anulada" ? "Salida" : "Ajuste";
            
            // Notas según el tipo de movimiento
            const nota = tipoMovimiento === "Entrada" ? "Venta a cliente" : 
                        tipoMovimiento === "Salida" ? "Anulación de factura" : 
                        "Factura pendiente";
                        
            return (
              <Card key={factura.id} className="overflow-hidden">
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
                        {getPrimerProducto(factura)}
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
                          {factura.venta.detalles[0].cantidad}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-500">Usuario</div>
                        <div className="font-semibold">
                          {factura.cliente.split(' ')[0]}
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
                      onClick={() => handleVistaPrevia(factura)}
                    >
                      <Eye className="h-4 w-4 mr-2" /> Ver detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Diálogo de vista previa de factura */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Vista Previa de Factura</DialogTitle>
              <DialogDescription>
                {selectedInvoice && `Factura Electrónica ${selectedInvoice.correlativo}`}
              </DialogDescription>
            </DialogHeader>
            
            {selectedInvoice && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg">FACTURA ELECTRÓNICA</h3>
                    <p className="text-lg text-primary font-bold">{selectedInvoice.correlativo}</p>
                    <p className="text-sm text-gray-500">Fecha de emisión: {formatDate(selectedInvoice.fecha)}</p>
                  </div>
                  
                  <div className="text-right">
                    <h4 className="font-medium">Empresa Emisora S.A.</h4>
                    <p className="text-sm">RUC: 20555123456</p>
                    <p className="text-sm">Av. Principal 123, Lima</p>
                    <p className="text-sm">Teléfono: (01) 555-1234</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Cliente</h4>
                    <div className="space-y-1">
                      <p><span className="font-medium">Razón social:</span> {selectedInvoice.cliente}</p>
                      <p><span className="font-medium">RUC:</span> {selectedInvoice.ruc}</p>
                      <p><span className="font-medium">Dirección:</span> {selectedInvoice.direccion}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Detalles</h4>
                    <div className="space-y-1">
                      <p><span className="font-medium">Estado:</span> <Badge variant="outline" className={getEstadoColor(selectedInvoice.estado)}>{selectedInvoice.estado}</Badge></p>
                      <p><span className="font-medium">Venta Ref:</span> #{selectedInvoice.venta.id}</p>
                      <p><span className="font-medium">Enviado:</span> {selectedInvoice.enviado ? "Sí" : "No"}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Detalle de Productos/Servicios</h4>
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                          <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Cant.</th>
                          <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                          <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedInvoice.venta.detalles.map((detalle: any, index: number) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm">{detalle.producto}</td>
                            <td className="px-4 py-2 text-sm text-center">{detalle.cantidad}</td>
                            <td className="px-4 py-2 text-sm text-right">{formatCurrency(detalle.precio)}</td>
                            <td className="px-4 py-2 text-sm text-right font-medium">{formatCurrency(detalle.precio * detalle.cantidad)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50">
                          <td colSpan={3} className="px-4 py-2 text-sm font-medium text-right">Subtotal:</td>
                          <td className="px-4 py-2 text-sm text-right">{formatCurrency(selectedInvoice.total / 1.18)}</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td colSpan={3} className="px-4 py-2 text-sm font-medium text-right">IGV (18%):</td>
                          <td className="px-4 py-2 text-sm text-right">{formatCurrency(selectedInvoice.total - (selectedInvoice.total / 1.18))}</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td colSpan={3} className="px-4 py-2 text-sm font-medium text-right">Total:</td>
                          <td className="px-4 py-2 text-sm font-bold text-right">{formatCurrency(selectedInvoice.total)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleReimprimir(selectedInvoice.id)}>
                    <Printer className="h-4 w-4 mr-2" /> Imprimir
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDescargar(selectedInvoice.id)}>
                    <Download className="h-4 w-4 mr-2" /> Descargar PDF
                  </Button>
                  {!selectedInvoice.enviado && selectedInvoice.estado !== "Anulada" && (
                    <Button variant="outline" size="sm" onClick={() => handleEnviar(selectedInvoice.id)}>
                      <Mail className="h-4 w-4 mr-2" /> Enviar
                    </Button>
                  )}
                  {selectedInvoice.estado !== "Anulada" && (
                    <Button variant="destructive" size="sm" onClick={() => {
                      handleAnular(selectedInvoice.id);
                      setIsPreviewOpen(false);
                    }}>
                      <XCircle className="h-4 w-4 mr-2" /> Anular
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        
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
    </MainLayout>
  );
};

export default InvoicesPage;