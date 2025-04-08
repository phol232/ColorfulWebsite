import React, { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search,
  Truck,
  Building,
  Phone,
  Mail,
  CalendarClock,
  Package,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  FileText,
  ShoppingCart,
  Clock,
  Filter,
  RefreshCcw,
  PlusCircle,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Datos de muestra para proveedores
const proveedores = [
  { 
    id: 1, 
    nombre: "Distribuidora de Alimentos S.A.", 
    contacto: "José Martínez",
    email: "jmartinez@distribuidora.com", 
    telefono: "555-7890-123", 
    direccion: "Av. Industrial 456, Ciudad", 
    fechaAlta: "2023-02-10", 
    categoria: "Alimentos",
    estado: "Activo",
    totalPedidos: 28,
    montoTotal: 12580.30,
    ultimaOrden: "2024-03-15",
    productos: [
      { id: 1, nombre: "Carne de Res", sku: "CR-001", precio: 12.50, categoria: "Carnes" },
      { id: 2, nombre: "Pollo Entero", sku: "PO-003", precio: 8.75, categoria: "Carnes" },
      { id: 3, nombre: "Queso Mozzarella", sku: "QU-012", precio: 5.99, categoria: "Lácteos" }
    ]
  },
  { 
    id: 2, 
    nombre: "Bebidas Internacionales", 
    contacto: "Carmen López",
    email: "clopez@bebidas.com", 
    telefono: "555-4567-890", 
    direccion: "Calle Comercio 789, Ciudad", 
    fechaAlta: "2022-11-05", 
    categoria: "Bebidas",
    estado: "Activo",
    totalPedidos: 35,
    montoTotal: 18950.75,
    ultimaOrden: "2024-04-02",
    productos: [
      { id: 4, nombre: "Refresco Cola", sku: "RC-005", precio: 1.50, categoria: "Refrescos" },
      { id: 5, nombre: "Agua Mineral", sku: "AM-002", precio: 0.99, categoria: "Aguas" },
      { id: 6, nombre: "Jugo de Naranja", sku: "JN-008", precio: 2.25, categoria: "Jugos" }
    ]
  },
  { 
    id: 3, 
    nombre: "Productos Frescos S.L.", 
    contacto: "Antonio Ruiz",
    email: "aruiz@frescos.com", 
    telefono: "555-2345-678", 
    direccion: "Jr. Los Pinos 234, Ciudad", 
    fechaAlta: "2023-05-20", 
    categoria: "Vegetales",
    estado: "Inactivo",
    totalPedidos: 12,
    montoTotal: 4320.50,
    ultimaOrden: "2023-10-15",
    productos: [
      { id: 7, nombre: "Lechuga", sku: "VE-010", precio: 1.25, categoria: "Vegetales" },
      { id: 8, nombre: "Tomate", sku: "VE-015", precio: 1.75, categoria: "Vegetales" },
      { id: 9, nombre: "Cebolla", sku: "VE-020", precio: 1.10, categoria: "Vegetales" }
    ]
  },
  { 
    id: 4, 
    nombre: "Empaques y Desechables", 
    contacto: "Luis Torres",
    email: "ltorres@empaques.com", 
    telefono: "555-8765-432", 
    direccion: "Av. Central 567, Ciudad", 
    fechaAlta: "2022-08-15", 
    categoria: "Empaques",
    estado: "Activo",
    totalPedidos: 20,
    montoTotal: 7850.25,
    ultimaOrden: "2024-03-25",
    productos: [
      { id: 10, nombre: "Contenedor Hamburguesa", sku: "EM-025", precio: 0.30, categoria: "Empaques" },
      { id: 11, nombre: "Vaso 16oz", sku: "EM-030", precio: 0.15, categoria: "Empaques" },
      { id: 12, nombre: "Bolsa Papel", sku: "EM-035", precio: 0.10, categoria: "Empaques" }
    ]
  },
  { 
    id: 5, 
    nombre: "Condimentos Gourmet", 
    contacto: "María García",
    email: "mgarcia@condimentos.com", 
    telefono: "555-1234-567", 
    direccion: "Calle Las Flores 123, Ciudad", 
    fechaAlta: "2023-09-10", 
    categoria: "Condimentos",
    estado: "Activo",
    totalPedidos: 15,
    montoTotal: 5250.80,
    ultimaOrden: "2024-02-10",
    productos: [
      { id: 13, nombre: "Pimienta Negra", sku: "CO-040", precio: 3.99, categoria: "Condimentos" },
      { id: 14, nombre: "Sal de Mar", sku: "CO-045", precio: 2.50, categoria: "Condimentos" },
      { id: 15, nombre: "Orégano", sku: "CO-050", precio: 1.99, categoria: "Condimentos" }
    ]
  }
];

// Ejemplo de órdenes de compra para un proveedor específico
const ordenesCompra = [
  { 
    id: "OC-12345", 
    fecha: "2024-03-15", 
    productos: [
      { nombre: "Carne de Res", sku: "CR-001", cantidad: 50, precio: 12.50 },
      { nombre: "Pollo Entero", sku: "PO-003", cantidad: 30, precio: 8.75 }
    ],
    total: 887.50,
    estado: "Entregado",
    fechaEntrega: "2024-03-20"
  },
  { 
    id: "OC-12280", 
    fecha: "2024-02-12", 
    productos: [
      { nombre: "Carne de Res", sku: "CR-001", cantidad: 40, precio: 12.50 },
      { nombre: "Queso Mozzarella", sku: "QU-012", cantidad: 20, precio: 5.99 }
    ],
    total: 619.80,
    estado: "Entregado",
    fechaEntrega: "2024-02-16"
  },
  { 
    id: "OC-12150", 
    fecha: "2024-01-05", 
    productos: [
      { nombre: "Pollo Entero", sku: "PO-003", cantidad: 45, precio: 8.75 },
      { nombre: "Queso Mozzarella", sku: "QU-012", cantidad: 25, precio: 5.99 }
    ],
    total: 543.50,
    estado: "Entregado",
    fechaEntrega: "2024-01-10"
  }
];

// Datos para estadísticas del proveedor
const proveedorStats = {
  tiempoEntrega: 4.2, // días promedio
  cumplimiento: 98.5, // porcentaje
  calidad: "Excelente",
  formaPagoPreferida: "Transferencia Bancaria"
};

// Categorías de proveedores
const categorias = [
  { id: 1, nombre: "Alimentos", color: "bg-blue-100 text-blue-800 border-blue-400", proveedores: 8 },
  { id: 2, nombre: "Bebidas", color: "bg-green-100 text-green-800 border-green-400", proveedores: 6 },
  { id: 3, nombre: "Empaques", color: "bg-amber-100 text-amber-800 border-amber-400", proveedores: 4 },
  { id: 4, nombre: "Vegetales", color: "bg-purple-100 text-purple-800 border-purple-400", proveedores: 5 },
  { id: 5, nombre: "Condimentos", color: "bg-rose-100 text-rose-800 border-rose-400", proveedores: 3 }
];

// Función para formatear fechas
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};

// Función para formatear moneda
const formatCurrency = (amount: number) => {
  return amount.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  });
};

const SuppliersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentTab, setCurrentTab] = useState("todos");
  const [expandedSupplierId, setExpandedSupplierId] = useState<number | null>(null);
  const [newPurchaseOrder, setNewPurchaseOrder] = useState(false);
  
  // Filtrar proveedores según los criterios actuales
  const filteredProveedores = proveedores.filter(proveedor => {
    // Filtro por búsqueda
    if (searchQuery && !proveedor.nombre.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !proveedor.contacto.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !proveedor.email.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filtro por categoría
    if (categoryFilter && proveedor.categoria !== categoryFilter) {
      return false;
    }
    
    // Filtro por pestaña
    if (currentTab === "inactivos" && proveedor.estado !== "Inactivo") {
      return false;
    }
    
    return true;
  });
  
  const toggleExpandSupplier = (id: number) => {
    if (expandedSupplierId === id) {
      setExpandedSupplierId(null);
    } else {
      setExpandedSupplierId(id);
    }
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">PROVEEDORES</h1>
            <p className="text-sm text-gray-500">Administra tus proveedores y compras</p>
          </div>
          
          {/* Dashboard de métricas horizontal */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 md:mt-0">
            <div className="bg-background border rounded-md p-2 shadow-sm">
              <div className="text-xs text-muted-foreground mb-1">Proveedores</div>
              <div className="text-base font-semibold">26</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <span>+2 este mes</span>
              </div>
            </div>
            
            <div className="bg-background border rounded-md p-2 shadow-sm">
              <div className="text-xs text-muted-foreground mb-1">Pedidos Pendientes</div>
              <div className="text-base font-semibold">8</div>
              <div className="flex items-center text-xs text-yellow-600 mt-1">
                <span>Por recibir</span>
              </div>
            </div>
            
            <div className="bg-background border rounded-md p-2 shadow-sm">
              <div className="text-xs text-muted-foreground mb-1">Gasto Mensual</div>
              <div className="text-base font-semibold">$48,350</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <span>-5.2% vs mes anterior</span>
              </div>
            </div>
            
            <div className="bg-background border rounded-md p-2 shadow-sm">
              <div className="text-xs text-muted-foreground mb-1">Productos</div>
              <div className="text-base font-semibold">214</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <span>De 32 categorías</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Ya no necesitamos las tarjetas antiguas */}
        <div className="hidden">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Total de Proveedores</p>
                  <h3 className="text-3xl font-bold mt-1">26</h3>
                  <p className="text-sm text-green-600 mt-1">+2 este mes</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Proveedores Activos</p>
                  <h3 className="text-3xl font-bold mt-1">24</h3>
                  <p className="text-sm text-green-600 mt-1">92.3% del total</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Órdenes Pendientes</p>
                  <h3 className="text-3xl font-bold mt-1">8</h3>
                  <p className="text-sm text-amber-600 mt-1">Valor: $15,225.50</p>
                </div>
                <div className="bg-amber-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Compras del Mes</p>
                  <h3 className="text-3xl font-bold mt-1">12</h3>
                  <p className="text-sm text-green-600 mt-1">$36,840.75</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <ShoppingCart className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Pestañas y Filtros */}
        <div className="mb-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="todos">Todos los Proveedores</TabsTrigger>
              <TabsTrigger value="inactivos">Inactivos</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                type="text" 
                placeholder="Buscar proveedor por nombre, contacto o email..." 
                className="pl-9" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <select 
                className="px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">Todas las Categorías</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                ))}
              </select>
              
              <Button variant="outline" className="flex items-center gap-2" onClick={() => {
                setSearchQuery("");
                setCategoryFilter("");
                setCurrentTab("todos");
              }}>
                <RefreshCcw className="h-4 w-4" />
                <span>Limpiar</span>
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    <span>Nuevo Proveedor</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Añadir Nuevo Proveedor</DialogTitle>
                    <DialogDescription>
                      Introduce los datos del nuevo proveedor
                    </DialogDescription>
                  </DialogHeader>
                  
                  {/* Formulario para nuevo proveedor */}
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="name" className="text-right text-sm font-medium">
                        Nombre
                      </label>
                      <Input id="name" className="col-span-3" placeholder="Nombre de la empresa" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="contact" className="text-right text-sm font-medium">
                        Contacto
                      </label>
                      <Input id="contact" className="col-span-3" placeholder="Nombre del contacto" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="email" className="text-right text-sm font-medium">
                        Email
                      </label>
                      <Input id="email" className="col-span-3" placeholder="email@ejemplo.com" type="email" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="phone" className="text-right text-sm font-medium">
                        Teléfono
                      </label>
                      <Input id="phone" className="col-span-3" placeholder="Teléfono de contacto" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="address" className="text-right text-sm font-medium">
                        Dirección
                      </label>
                      <Input id="address" className="col-span-3" placeholder="Dirección completa" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="category" className="text-right text-sm font-medium">
                        Categoría
                      </label>
                      <select id="category" className="col-span-3 px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        {categorias.map(cat => (
                          <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button>Guardar Proveedor</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
        
        {/* Lista de proveedores */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Listado de Proveedores</h2>
            <Dialog open={newPurchaseOrder} onOpenChange={setNewPurchaseOrder}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Nueva Orden de Compra</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Crear Orden de Compra</DialogTitle>
                  <DialogDescription>
                    Completa los detalles para generar una nueva orden
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="supplier" className="text-right text-sm font-medium">
                      Proveedor
                    </label>
                    <select id="supplier" className="col-span-3 px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      {proveedores.filter(p => p.estado === "Activo").map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="deliveryDate" className="text-right text-sm font-medium">
                      Fecha Entrega
                    </label>
                    <Input id="deliveryDate" className="col-span-3" type="date" />
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <h4 className="font-medium">Productos</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {proveedores[0].productos.map((producto, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 border rounded-md">
                        <div>
                          <p className="font-medium">{producto.nombre}</p>
                          <p className="text-xs text-gray-500">SKU: {producto.sku}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20">
                            <Input type="number" min="1" placeholder="Cant." className="h-8 text-sm" />
                          </div>
                          <div className="w-24 text-right font-medium">
                            {formatCurrency(producto.precio)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button variant="outline" size="sm" className="flex items-center gap-1 mt-2">
                    <PlusCircle className="h-4 w-4" />
                    <span>Añadir Producto</span>
                  </Button>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Estimado:</span>
                    <span className="font-bold text-lg">{formatCurrency(0)}</span>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancelar</Button>
                  <Button>Generar Orden</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Tarjetas de proveedores */}
          {filteredProveedores.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-lg border border-gray-200">
              <Building className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No se encontraron proveedores con los filtros aplicados</p>
              <Button 
                variant="link" 
                className="mt-2"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("");
                  setCurrentTab("todos");
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProveedores.map(proveedor => {
                const tipoColor = proveedor.estado === "Activo" 
                  ? "bg-green-100 text-green-800 border-green-300" 
                  : "bg-red-100 text-red-800 border-red-300";
                  
                return (
                  <Card key={proveedor.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      {/* Cabecera de la tarjeta */}
                      <div className="p-4 border-b flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-8 rounded-full ${proveedor.estado === "Activo" ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <div>
                            <div className="text-sm text-gray-500">
                              ID: {proveedor.id}
                            </div>
                            <div className="font-semibold text-base truncate max-w-[200px]">
                              {proveedor.nombre}
                            </div>
                          </div>
                        </div>
                        
                        <Badge variant="outline" className={tipoColor}>
                          {proveedor.estado}
                        </Badge>
                      </div>
                      
                      {/* Información principal */}
                      <div className="p-4">
                        <div className="mb-3">
                          <h3 className="text-md font-semibold">{proveedor.contacto}</h3>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {proveedor.email}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Phone className="h-3 w-3" />
                            {proveedor.telefono}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-gray-500">Categoría</div>
                            <Badge variant="outline" className={
                              categorias.find(c => c.nombre === proveedor.categoria)?.color || "bg-gray-100 text-gray-800"
                            }>
                              {proveedor.categoria}
                            </Badge>
                          </div>
                          
                          <div>
                            <div className="text-sm text-gray-500">Últ. Orden</div>
                            <div className="font-semibold text-sm">
                              {formatDate(proveedor.ultimaOrden)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-gray-500">Total Pedidos</div>
                            <div className={`font-semibold ${proveedor.estado === "Activo" ? 'text-green-600' : 'text-red-600'}`}>
                              {proveedor.totalPedidos}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-gray-500">Monto Total</div>
                            <div className="font-semibold">
                              {formatCurrency(proveedor.montoTotal)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-2">
                          <div className="text-sm text-gray-500">Dirección:</div>
                          <div className="text-sm">
                            {proveedor.direccion}
                          </div>
                        </div>
                      </div>
                      
                      {/* Acciones */}
                      <div className="p-4 border-t flex justify-between">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-orange-500 hover:text-orange-600"
                          onClick={() => toggleExpandSupplier(proveedor.id)}
                        >
                          {expandedSupplierId === proveedor.id ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-2" /> Ocultar detalles
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-2" /> Ver detalles
                            </>
                          )}
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-primary"
                        >
                          <FileText className="h-4 w-4 mr-2" /> Órdenes
                        </Button>
                      </div>
                      
                      {/* Panel expandible con detalles del proveedor */}
                      {expandedSupplierId === proveedor.id && (
                        <div className="border-t p-4 bg-gray-50">
                          <h4 className="text-sm font-semibold mb-4">Productos Principales</h4>
                          <div className="space-y-2">
                            {proveedor.productos.map((producto, idx) => (
                              <div key={idx} className="flex justify-between items-center p-2 border rounded-md bg-white">
                                <div>
                                  <p className="font-medium">{producto.nombre}</p>
                                  <p className="text-xs text-gray-500">SKU: {producto.sku}</p>
                                </div>
                                <div className="font-semibold">
                                  {formatCurrency(producto.precio)}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <ShoppingCart className="h-4 w-4" />
                              <span>Nueva Compra</span>
                            </Button>
                            {proveedor.estado === "Activo" ? (
                              <Button variant="destructive" size="sm" className="flex items-center gap-1">
                                <XCircle className="h-4 w-4" />
                                <span>Desactivar</span>
                              </Button>
                            ) : (
                              <Button variant="default" size="sm" className="flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" />
                                <span>Activar</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </MainLayout>
  );
};

export default SuppliersPage;