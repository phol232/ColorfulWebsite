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
  User,
  UserPlus,
  Phone,
  Mail,
  CalendarClock,
  Package,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  CreditCard,
  BarChart2,
  Users,
  UserCheck,
  Filter,
  RefreshCcw
} from "lucide-react";

// Datos de muestra para clientes
const clientes = [
  { 
    id: 1, 
    nombre: "Juan Pérez González", 
    email: "juan.perez@example.com", 
    telefono: "555-1234-567", 
    direccion: "Calle Principal 123, Ciudad", 
    fechaRegistro: "2024-01-15", 
    segmento: "Frecuente",
    totalCompras: 12,
    montoTotal: 1580.75,
    ultimaCompra: "2024-03-28"
  },
  { 
    id: 2, 
    nombre: "María Rodríguez López", 
    email: "maria.rodriguez@example.com", 
    telefono: "555-9876-543", 
    direccion: "Av. Libertad 456, Ciudad", 
    fechaRegistro: "2023-11-10", 
    segmento: "Ocasional",
    totalCompras: 5,
    montoTotal: 430.20,
    ultimaCompra: "2024-02-15"
  },
  { 
    id: 3, 
    nombre: "Carlos Sánchez Martínez", 
    email: "carlos.sanchez@example.com", 
    telefono: "555-4567-890", 
    direccion: "Jr. Los Olivos 789, Ciudad", 
    fechaRegistro: "2023-09-05", 
    segmento: "VIP",
    totalCompras: 25,
    montoTotal: 3450.00,
    ultimaCompra: "2024-04-01"
  },
  { 
    id: 4, 
    nombre: "Ana García Ruiz", 
    email: "ana.garcia@example.com", 
    telefono: "555-2345-678", 
    direccion: "Calle Las Flores 234, Ciudad", 
    fechaRegistro: "2024-02-20", 
    segmento: "Nuevo",
    totalCompras: 2,
    montoTotal: 150.50,
    ultimaCompra: "2024-03-10"
  },
  { 
    id: 5, 
    nombre: "Roberto Torres Vega", 
    email: "roberto.torres@example.com", 
    telefono: "555-8765-432", 
    direccion: "Av. Central 567, Ciudad", 
    fechaRegistro: "2023-06-30", 
    segmento: "Inactivo",
    totalCompras: 8,
    montoTotal: 950.25,
    ultimaCompra: "2023-10-15"
  }
];

// Ejemplo de historial de compras para un cliente específico
const historialCompras = [
  { 
    id: "P-12345", 
    fecha: "2024-03-28", 
    productos: [
      { nombre: "Hamburguesa Clásica", cantidad: 2, precio: 12.99 },
      { nombre: "Refresco Grande", cantidad: 2, precio: 3.50 }
    ],
    total: 32.98,
    metodoPago: "Tarjeta de Crédito"
  },
  { 
    id: "P-12280", 
    fecha: "2024-02-12", 
    productos: [
      { nombre: "Pizza Familiar", cantidad: 1, precio: 18.99 },
      { nombre: "Alitas de Pollo", cantidad: 1, precio: 9.99 },
      { nombre: "Cerveza", cantidad: 2, precio: 4.50 }
    ],
    total: 37.98,
    metodoPago: "Efectivo"
  },
  { 
    id: "P-11987", 
    fecha: "2024-01-05", 
    productos: [
      { nombre: "Ensalada César", cantidad: 1, precio: 9.99 },
      { nombre: "Sandwich de Pollo", cantidad: 1, precio: 8.50 },
      { nombre: "Agua Mineral", cantidad: 1, precio: 1.99 }
    ],
    total: 20.48,
    metodoPago: "Tarjeta de Débito"
  }
];

// Datos para las estadísticas de cliente
const clientStats = {
  frecuenciaCompra: 8.5, // días entre compras en promedio
  ticketPromedio: 131.72,
  productosFavoritos: ["Hamburguesa Clásica", "Refresco Grande", "Pizza Familiar"],
  horaFavorita: "19:00 - 20:00",
  metodoPagoPreferido: "Tarjeta de Crédito"
};

// Segmentos de clientes
const segmentos = [
  { id: 1, nombre: "VIP", color: "bg-purple-100 text-purple-800 border-purple-400", clientes: 12, porcentaje: 8 },
  { id: 2, nombre: "Frecuente", color: "bg-blue-100 text-blue-800 border-blue-400", clientes: 45, porcentaje: 30 },
  { id: 3, nombre: "Ocasional", color: "bg-green-100 text-green-800 border-green-400", clientes: 58, porcentaje: 39 },
  { id: 4, nombre: "Nuevo", color: "bg-yellow-100 text-yellow-800 border-yellow-400", clientes: 22, porcentaje: 15 },
  { id: 5, nombre: "Inactivo", color: "bg-gray-100 text-gray-800 border-gray-400", clientes: 12, porcentaje: 8 }
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

const CustomersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("");
  const [currentTab, setCurrentTab] = useState("todos");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [expandedCustomerId, setExpandedCustomerId] = useState<number | null>(null);
  
  // Filtrar clientes según los criterios actuales
  const filteredClientes = clientes.filter(cliente => {
    // Filtro por búsqueda
    if (searchQuery && !cliente.nombre.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !cliente.email.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filtro por segmento
    if (segmentFilter && cliente.segmento !== segmentFilter) {
      return false;
    }
    
    // Filtro por pestaña
    if (currentTab === "inactivos" && cliente.segmento !== "Inactivo") {
      return false;
    } else if (currentTab === "vip" && cliente.segmento !== "VIP") {
      return false;
    } else if (currentTab === "nuevos" && cliente.segmento !== "Nuevo") {
      return false;
    }
    
    return true;
  });
  
  const toggleExpandCustomer = (id: number) => {
    if (expandedCustomerId === id) {
      setExpandedCustomerId(null);
    } else {
      setExpandedCustomerId(id);
    }
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Gestión de Clientes</h1>
          <p className="text-gray-500">Administra la información de tus clientes y analiza sus historiales de compra</p>
        </div>
        
        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Total de Clientes</p>
                  <h3 className="text-3xl font-bold mt-1">149</h3>
                  <p className="text-sm text-green-600 mt-1">+12% este mes</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Clientes Activos</p>
                  <h3 className="text-3xl font-bold mt-1">137</h3>
                  <p className="text-sm text-green-600 mt-1">91.9% de retención</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Ticket Promedio</p>
                  <h3 className="text-3xl font-bold mt-1">$32.50</h3>
                  <p className="text-sm text-green-600 mt-1">+5.2% vs mes anterior</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Compras Mensuales</p>
                  <h3 className="text-3xl font-bold mt-1">215</h3>
                  <p className="text-sm text-green-600 mt-1">+8.7% este mes</p>
                </div>
                <div className="bg-amber-100 p-3 rounded-full">
                  <ShoppingBag className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Pestañas y Filtros */}
        <div className="mb-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="todos">Todos los Clientes</TabsTrigger>
              <TabsTrigger value="vip">VIP</TabsTrigger>
              <TabsTrigger value="nuevos">Nuevos</TabsTrigger>
              <TabsTrigger value="inactivos">Inactivos</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                type="text" 
                placeholder="Buscar cliente por nombre, email o teléfono..." 
                className="pl-9" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <select 
                className="px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={segmentFilter}
                onChange={(e) => setSegmentFilter(e.target.value)}
              >
                <option value="">Todos los Segmentos</option>
                <option value="VIP">VIP</option>
                <option value="Frecuente">Frecuente</option>
                <option value="Ocasional">Ocasional</option>
                <option value="Nuevo">Nuevo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
              
              <Button variant="outline" className="flex items-center gap-2" onClick={() => {
                setSearchQuery("");
                setSegmentFilter("");
                setCurrentTab("todos");
              }}>
                <RefreshCcw className="h-4 w-4" />
                <span>Limpiar</span>
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    <span>Nuevo Cliente</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Añadir Nuevo Cliente</DialogTitle>
                    <DialogDescription>
                      Introduce los datos del nuevo cliente
                    </DialogDescription>
                  </DialogHeader>
                  
                  {/* Formulario para nuevo cliente */}
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="name" className="text-right text-sm font-medium">
                        Nombre
                      </label>
                      <Input id="name" className="col-span-3" placeholder="Nombre completo" />
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
                      <label htmlFor="segment" className="text-right text-sm font-medium">
                        Segmento
                      </label>
                      <select id="segment" className="col-span-3 px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="Nuevo">Nuevo</option>
                        <option value="Ocasional">Ocasional</option>
                        <option value="Frecuente">Frecuente</option>
                        <option value="VIP">VIP</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button>Guardar Cliente</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
        
        {/* Segmentos de cliente */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Segmentación de Clientes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {segmentos.map(segmento => (
              <Card key={segmento.id} className="border-l-4" style={{ borderLeftColor: segmento.color.split(' ')[2].replace('border-', '') }}>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{segmento.nombre}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-2xl font-bold">{segmento.clientes}</p>
                    <Badge variant="outline" className={segmento.color}>
                      {segmento.porcentaje}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Lista de clientes */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Listado de Clientes</h2>
          <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
            {filteredClientes.length === 0 ? (
              <div className="p-8 text-center">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No se encontraron clientes con los filtros aplicados</p>
                <Button 
                  variant="link" 
                  className="mt-2"
                  onClick={() => {
                    setSearchQuery("");
                    setSegmentFilter("");
                    setCurrentTab("todos");
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 p-4">
                {filteredClientes.map(cliente => (
                  <Card key={cliente.id} className="overflow-hidden">
                    <div 
                      className="p-4 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleExpandCustomer(cliente.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-100 rounded-full p-2">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{cliente.nombre}</h3>
                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {cliente.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {cliente.telefono}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3 md:mt-0">
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Compras</div>
                          <div className="font-semibold">{cliente.totalCompras}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Total</div>
                          <div className="font-semibold">{formatCurrency(cliente.montoTotal)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Última compra</div>
                          <div className="font-semibold">{formatDate(cliente.ultimaCompra)}</div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={
                            cliente.segmento === "VIP" ? "bg-purple-100 text-purple-800 border-purple-400" :
                            cliente.segmento === "Frecuente" ? "bg-blue-100 text-blue-800 border-blue-400" :
                            cliente.segmento === "Ocasional" ? "bg-green-100 text-green-800 border-green-400" :
                            cliente.segmento === "Nuevo" ? "bg-yellow-100 text-yellow-800 border-yellow-400" :
                            "bg-gray-100 text-gray-800 border-gray-400"
                          }
                        >
                          {cliente.segmento}
                        </Badge>
                        <Button variant="ghost" size="sm" className="ml-2">
                          {expandedCustomerId === cliente.id ? 
                            <ChevronUp className="h-4 w-4" /> : 
                            <ChevronDown className="h-4 w-4" />
                          }
                        </Button>
                      </div>
                    </div>
                    
                    {/* Detalles expandidos */}
                    {expandedCustomerId === cliente.id && (
                      <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-3">Datos del Cliente</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex">
                                <div className="w-24 text-gray-500">Dirección:</div>
                                <div>{cliente.direccion}</div>
                              </div>
                              <div className="flex">
                                <div className="w-24 text-gray-500">Registro:</div>
                                <div>{formatDate(cliente.fechaRegistro)}</div>
                              </div>
                              <div className="flex">
                                <div className="w-24 text-gray-500">Segmento:</div>
                                <div>{cliente.segmento}</div>
                              </div>
                              <div className="flex">
                                <div className="w-24 text-gray-500">Total:</div>
                                <div>{formatCurrency(cliente.montoTotal)}</div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 mt-4">
                              <Button variant="outline" size="sm">Editar</Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm">Ver Historial</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-3xl">
                                  <DialogHeader>
                                    <DialogTitle>Historial de Compras</DialogTitle>
                                    <DialogDescription>
                                      Cliente: {cliente.nombre}
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  <div className="space-y-4">
                                    {historialCompras.map(compra => (
                                      <div key={compra.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-3">
                                          <div>
                                            <h4 className="font-semibold">Pedido #{compra.id}</h4>
                                            <p className="text-sm text-gray-500">{formatDate(compra.fecha)}</p>
                                          </div>
                                          <Badge>{compra.metodoPago}</Badge>
                                        </div>
                                        
                                        <div className="space-y-2">
                                          {compra.productos.map((prod, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                              <div>{prod.cantidad}x {prod.nombre}</div>
                                              <div>{formatCurrency(prod.precio * prod.cantidad)}</div>
                                            </div>
                                          ))}
                                        </div>
                                        
                                        <div className="flex justify-between font-semibold mt-3 pt-2 border-t">
                                          <div>Total</div>
                                          <div>{formatCurrency(compra.total)}</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-3">Estadísticas</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <Card className="bg-gray-50">
                                <CardContent className="p-3">
                                  <div className="text-xs text-gray-500">Frecuencia de Compra</div>
                                  <div className="text-lg font-semibold">{clientStats.frecuenciaCompra} días</div>
                                </CardContent>
                              </Card>
                              <Card className="bg-gray-50">
                                <CardContent className="p-3">
                                  <div className="text-xs text-gray-500">Ticket Promedio</div>
                                  <div className="text-lg font-semibold">{formatCurrency(clientStats.ticketPromedio)}</div>
                                </CardContent>
                              </Card>
                              <Card className="bg-gray-50">
                                <CardContent className="p-3">
                                  <div className="text-xs text-gray-500">Método Preferido</div>
                                  <div className="text-lg font-semibold">{clientStats.metodoPagoPreferido}</div>
                                </CardContent>
                              </Card>
                              <Card className="bg-gray-50">
                                <CardContent className="p-3">
                                  <div className="text-xs text-gray-500">Hora Frecuente</div>
                                  <div className="text-lg font-semibold">{clientStats.horaFavorita}</div>
                                </CardContent>
                              </Card>
                            </div>
                            
                            <h4 className="font-semibold mt-4 mb-2">Productos Favoritos</h4>
                            <div className="space-y-2">
                              {clientStats.productosFavoritos.map((prod, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-gray-400" />
                                  <span>{prod}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CustomersPage;