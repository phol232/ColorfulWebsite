import React, { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import {
  CalendarIcon,
  Package2Icon,
  TrendingUpIcon,
  WalletIcon,
  Users,
  ShoppingCart,
  BarChart2,
  ClipboardList,
  PlusIcon,
  SearchIcon,
  FilterIcon,
  Eye,
  Download,
  Printer,
  CheckSquare,
  Truck,
  AlertCircle,
  RefreshCw,
  Clock,
  Settings,
  UserPlus,
  ShoppingBag,
  Edit,
  Trash2
} from "lucide-react";

// Datos simulados para los gráficos
const ventasPorSemana = [
  { nombre: 'Semana 1', ventas: 4000 },
  { nombre: 'Semana 2', ventas: 3000 },
  { nombre: 'Semana 3', ventas: 5000 },
  { nombre: 'Semana 4', ventas: 8000 },
  { nombre: 'Semana 5', ventas: 6000 },
];

const gananciasPorMes = [
  { mes: 'Ene', ganancias: 12400 },
  { mes: 'Feb', ganancias: 15600 },
  { mes: 'Mar', ganancias: 18000 },
  { mes: 'Abr', ganancias: 16500 },
  { mes: 'May', ganancias: 20100 },
  { mes: 'Jun', ganancias: 22000 },
  { mes: 'Jul', ganancias: 26500 },
];

const ventasPorCategoria = [
  { name: "Hamburguesas", value: 35 },
  { name: "Pizzas", value: 25 },
  { name: "Bebidas", value: 15 },
  { name: "Postres", value: 10 },
  { name: "Otros", value: 15 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const productosMasVendidos = [
  { id: 1, nombre: "Hamburguesa Clásica", ventas: 156, ingreso: 3120, imagen: "/placeholder-burger.jpg", stock: 45, sku: "BURG-001" },
  { id: 2, nombre: "Tacos de Pollo", ventas: 142, ingreso: 2840, imagen: "/placeholder-tacos.jpg", stock: 32, sku: "TAC-025" },
  { id: 3, nombre: "Jugo de Naranja", ventas: 98, ingreso: 1176, imagen: "/placeholder-juice.jpg", stock: 64, sku: "BEB-103" },
  { id: 4, nombre: "Sushi Mixto", ventas: 87, ingreso: 1740, imagen: "/placeholder-sushi.jpg", stock: 21, sku: "SUS-042" },
  { id: 5, nombre: "Ensalada Vegetariana", ventas: 76, ingreso: 1140, imagen: "/placeholder-salad.jpg", stock: 39, sku: "ENS-017" },
];

const inventarioBajo = [
  { id: 1, nombre: "Pan de hamburguesa", actual: 24, minimo: 50, sku: "MP-001" },
  { id: 2, nombre: "Tortillas", actual: 35, minimo: 60, sku: "MP-032" },
  { id: 3, nombre: "Pechuga de pollo", actual: 8, minimo: 20, sku: "MP-015" },
  { id: 4, nombre: "Aguacate", actual: 12, minimo: 25, sku: "MP-108" },
];

const proveedores = [
  { id: 1, nombre: "Distribuidora Alimentos JR", direccion: "Av. Principal 123", telefono: "555-1234", email: "contacto@alimentosjr.com" },
  { id: 2, nombre: "Productos Frescos SL", direccion: "Calle Comercial 45", telefono: "555-5678", email: "ventas@productosfrescos.com" },
  { id: 3, nombre: "Carnes y Embutidos del Valle", direccion: "Boulevard Central 78", telefono: "555-8901", email: "pedidos@carnesvalle.com" },
];

const ultimosPedidos = [
  { id: "PED-4721", cliente: "Juan Pérez", fecha: "07 Abr 2025", total: 156.99, estado: "Entregado", items: 5 },
  { id: "PED-4720", cliente: "María López", fecha: "07 Abr 2025", total: 89.50, estado: "En proceso", items: 3 },
  { id: "PED-4719", cliente: "Carlos González", fecha: "06 Abr 2025", total: 210.75, estado: "Pendiente", items: 8 },
  { id: "PED-4718", cliente: "Ana Martínez", fecha: "06 Abr 2025", total: 45.25, estado: "Cancelado", items: 2 },
  { id: "PED-4717", cliente: "Roberto Sánchez", fecha: "05 Abr 2025", total: 125.40, estado: "Entregado", items: 4 },
];

const DashboardPage: React.FC = () => {
  const [activeTabMenu, setActiveTabMenu] = useState<string>("overview");
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Panel de Control</h1>
          <p className="text-gray-500">Administra tu negocio, analiza métricas y toma decisiones estratégicas</p>
        </div>

        {/* Navegación Principal */}
        <Tabs defaultValue="overview" value={activeTabMenu} onValueChange={setActiveTabMenu} className="mb-10">
          <div className="border-b mb-6">
            <TabsList className="mb-0 bg-transparent">
              <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent">
                Vista General
              </TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent">
                Productos
              </TabsTrigger>
              <TabsTrigger value="inventory" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent">
                Inventario
              </TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent">
                Pedidos
              </TabsTrigger>
              <TabsTrigger value="customers" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent">
                Clientes
              </TabsTrigger>
              <TabsTrigger value="suppliers" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent">
                Proveedores
              </TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent">
                Reportes
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent">
                Configuración
              </TabsTrigger>
            </TabsList>
          </div>

          {/* VISTA GENERAL */}
          <TabsContent value="overview">
            {/* Accesos Rápidos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Button className="h-auto py-6 flex flex-col gap-2" variant="outline">
                <PlusIcon className="h-6 w-6" />
                <span>Nuevo Producto</span>
              </Button>
              <Button className="h-auto py-6 flex flex-col gap-2" variant="outline">
                <ShoppingCart className="h-6 w-6" />
                <span>Registrar Venta</span>
              </Button>
              <Button className="h-auto py-6 flex flex-col gap-2" variant="outline">
                <ClipboardList className="h-6 w-6" />
                <span>Ver Pedidos</span>
              </Button>
              <Button className="h-auto py-6 flex flex-col gap-2" variant="outline">
                <UserPlus className="h-6 w-6" />
                <span>Nuevo Cliente</span>
              </Button>
            </div>

            {/* Resumen de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Ventas Totales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <WalletIcon className="mr-2 h-4 w-4 text-primary" />
                    <div className="text-2xl font-bold">{formatCurrency(86740)}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="text-green-500">↑ 12%</span> comparado con el mes pasado
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Órdenes Completadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Package2Icon className="mr-2 h-4 w-4 text-primary" />
                    <div className="text-2xl font-bold">724</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="text-green-500">↑ 8%</span> comparado con el mes pasado
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Promedio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <TrendingUpIcon className="mr-2 h-4 w-4 text-primary" />
                    <div className="text-2xl font-bold">{formatCurrency(119.8)}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="text-green-500">↑ 3%</span> comparado con el mes pasado
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Clientes Recurrentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-primary" />
                    <div className="text-2xl font-bold">64%</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="text-red-500">↓ 2%</span> comparado con el mes pasado
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Gráficos y Análisis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Ventas por Semana</CardTitle>
                  <CardDescription>Resumen de ventas de las últimas 5 semanas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ventasPorSemana}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="nombre" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}`, 'Ventas']} />
                        <Legend />
                        <Bar dataKey="ventas" fill="#60A5FA" name="Ventas ($)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Tendencia de Ganancias</CardTitle>
                  <CardDescription>Ganancias mensuales del primer semestre</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={gananciasPorMes}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}`, 'Ganancias']} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="ganancias" 
                          stroke="#10B981" 
                          activeDot={{ r: 8 }} 
                          name="Ganancias ($)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Productos Más Vendidos */}
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Productos Más Vendidos</CardTitle>
                  <CardDescription>Top 5 productos con mayor cantidad de ventas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 font-medium">Producto</th>
                          <th className="text-left py-3 font-medium">Unidades Vendidas</th>
                          <th className="text-left py-3 font-medium">Ingresos</th>
                          <th className="text-left py-3 font-medium">Stock</th>
                          <th className="text-left py-3 font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productosMasVendidos.map((producto, index) => (
                          <tr key={producto.id} className="border-b hover:bg-muted/50">
                            <td className="py-3">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-md bg-gray-200 mr-3">
                                  {/* Espacio para imagen */}
                                </div>
                                <div>
                                  <div className="font-medium">{producto.nombre}</div>
                                  <div className="text-xs text-muted-foreground">SKU: {producto.sku}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3">{producto.ventas} unidades</td>
                            <td className="py-3">{formatCurrency(producto.ingreso)}</td>
                            <td className="py-3">
                              <Badge variant={producto.stock < 30 ? "outline" : "default"} 
                                className={producto.stock < 30 ? "bg-yellow-100 hover:bg-yellow-100 text-yellow-800 border-yellow-400" : ""}>
                                {producto.stock}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Distribución de Ventas por Categoría */}
              <Card>
                <CardHeader>
                  <CardTitle>Ventas por Categoría</CardTitle>
                  <CardDescription>Distribución de ventas por tipo de producto</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={ventasPorCategoria}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {ventasPorCategoria.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Porcentaje']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4">
                    <ul className="space-y-1">
                      {ventasPorCategoria.map((item, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <span className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                          {item.name}: {item.value}%
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Inventario y Pedidos Recientes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Inventario Bajo */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Inventario Bajo</CardTitle>
                    <CardDescription>Productos que necesitan reabastecimiento</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    Ver todos
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 font-medium">Producto</th>
                          <th className="text-left py-3 font-medium">Stock Actual</th>
                          <th className="text-left py-3 font-medium">Estado</th>
                          <th className="text-left py-3 font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventarioBajo.map((item) => (
                          <tr key={item.id} className="border-b hover:bg-muted/50">
                            <td className="py-3">
                              <div>
                                <div className="font-medium">{item.nombre}</div>
                                <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>
                              </div>
                            </td>
                            <td className="py-3">{item.actual} / {item.minimo}</td>
                            <td className="py-3">
                              <Badge variant={item.actual < item.minimo * 0.5 ? "destructive" : "outline"} 
                                className={item.actual < item.minimo * 0.5 ? "" : "bg-yellow-100 hover:bg-yellow-100 text-yellow-800 border-yellow-400"}>
                                {item.actual < item.minimo * 0.5 ? "Crítico" : "Bajo"}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <Button variant="outline" size="sm">Reabastecer</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Pedidos Recientes */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Pedidos Recientes</CardTitle>
                    <CardDescription>Últimos pedidos recibidos</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    Ver todos
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 font-medium">ID</th>
                          <th className="text-left py-3 font-medium">Cliente</th>
                          <th className="text-left py-3 font-medium">Fecha</th>
                          <th className="text-left py-3 font-medium">Estado</th>
                          <th className="text-left py-3 font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ultimosPedidos.map((pedido) => (
                          <tr key={pedido.id} className="border-b hover:bg-muted/50">
                            <td className="py-3">
                              <div className="font-medium">{pedido.id}</div>
                              <div className="text-xs text-muted-foreground">{pedido.items} items</div>
                            </td>
                            <td className="py-3">{pedido.cliente}</td>
                            <td className="py-3">{pedido.fecha}</td>
                            <td className="py-3">
                              <Badge
                                variant={
                                  pedido.estado === "Entregado" ? "default" :
                                  pedido.estado === "En proceso" ? "outline" :
                                  pedido.estado === "Pendiente" ? "secondary" : "destructive"
                                }
                                className={
                                  pedido.estado === "En proceso" ? "bg-blue-100 hover:bg-blue-100 text-blue-800 border-blue-400" :
                                  pedido.estado === "Pendiente" ? "bg-yellow-100 hover:bg-yellow-100 text-yellow-800 border-yellow-400" : ""
                                }
                              >
                                {pedido.estado}
                              </Badge>
                            </td>
                            <td className="py-3">{formatCurrency(pedido.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* PRODUCTOS */}
          <TabsContent value="products">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Gestión de Productos</h2>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Nuevo Producto
              </Button>
            </div>

            {/* Filtros y búsqueda */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Buscar productos por nombre, SKU, categoría..."
                      className="pl-9"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex items-center">
                      <FilterIcon className="h-4 w-4 mr-1" />
                      <span>Filtrar</span>
                    </Button>
                    <select className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm">
                      <option value="">Todos los productos</option>
                      <option value="active">Activos</option>
                      <option value="low-stock">Stock bajo</option>
                      <option value="out-of-stock">Sin stock</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de productos */}
            <Card>
              <CardHeader>
                <CardTitle>Catálogo de Productos</CardTitle>
                <CardDescription>
                  Administra todos los productos de tu inventario
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium">Producto</th>
                        <th className="text-left py-3 px-2 font-medium">SKU</th>
                        <th className="text-left py-3 px-2 font-medium">Precio</th>
                        <th className="text-left py-3 px-2 font-medium">Stock</th>
                        <th className="text-left py-3 px-2 font-medium">Categoría</th>
                        <th className="text-left py-3 px-2 font-medium">Estado</th>
                        <th className="text-left py-3 px-2 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosMasVendidos.map((producto) => (
                        <tr key={producto.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-2">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-md bg-gray-200 mr-3">
                                {/* Espacio para imagen */}
                              </div>
                              <span className="font-medium">{producto.nombre}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2">{producto.sku}</td>
                          <td className="py-3 px-2">{formatCurrency(producto.ingreso / producto.ventas)}</td>
                          <td className="py-3 px-2">
                            <Badge variant={producto.stock < 30 ? "outline" : "default"} 
                              className={producto.stock < 30 ? "bg-yellow-100 hover:bg-yellow-100 text-yellow-800 border-yellow-400" : ""}>
                              {producto.stock}
                            </Badge>
                          </td>
                          <td className="py-3 px-2">Hamburguesas</td>
                          <td className="py-3 px-2">
                            <Badge variant="outline" className="bg-green-100 hover:bg-green-100 text-green-800 border-green-400">
                              Activo
                            </Badge>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    Mostrando 1-5 de 120 productos
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" disabled>Anterior</Button>
                    <Button variant="outline" size="sm">Siguiente</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Formulario de Producto */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Detalles del Producto</CardTitle>
                <CardDescription>
                  Agrega o edita la información detallada del producto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Nombre del Producto</label>
                      <Input placeholder="Ej: Hamburguesa Clásica" />
                    </div>
                    
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">SKU (Código)</label>
                      <Input placeholder="Ej: PROD-001" />
                    </div>
                    
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Categoría</label>
                      <select className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm">
                        <option value="">Seleccionar categoría</option>
                        <option value="1">Hamburguesas</option>
                        <option value="2">Pizzas</option>
                        <option value="3">Bebidas</option>
                        <option value="4">Postres</option>
                      </select>
                    </div>
                    
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Descripción</label>
                      <textarea 
                        className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm min-h-[120px]" 
                        placeholder="Descripción detallada del producto"
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Precio de Costo</label>
                        <Input type="number" placeholder="0.00" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Precio de Venta</label>
                        <Input type="number" placeholder="0.00" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Stock Actual</label>
                        <Input type="number" placeholder="0" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Stock Mínimo</label>
                        <Input type="number" placeholder="10" />
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Proveedor</label>
                      <select className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm">
                        <option value="">Seleccionar proveedor</option>
                        <option value="1">Distribuidora Alimentos JR</option>
                        <option value="2">Productos Frescos SL</option>
                        <option value="3">Carnes y Embutidos del Valle</option>
                      </select>
                    </div>
                    
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Estado</label>
                      <select className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm">
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                        <option value="draft">Borrador</option>
                      </select>
                    </div>
                    
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Imagen del Producto</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                        <div className="flex flex-col items-center">
                          <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                          <p className="mt-2 text-sm text-gray-500">Haga clic para seleccionar o arrastre una imagen aquí</p>
                        </div>
                        <input type="file" className="hidden" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6 space-x-2">
                  <Button variant="outline">Cancelar</Button>
                  <Button>Guardar Producto</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* INVENTARIO */}
          <TabsContent value="inventory">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Gestión de Inventario</h2>
              <div className="flex gap-2">
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Ajuste de Stock
                </Button>
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Entrada de Stock
                </Button>
              </div>
            </div>

            {/* Métricas de Inventario */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Valor del Inventario</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <ShoppingBag className="mr-2 h-4 w-4 text-primary" />
                    <div className="text-2xl font-bold">{formatCurrency(128500)}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="text-green-500">↑ 5%</span> desde el último inventario
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total de Productos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Package2Icon className="mr-2 h-4 w-4 text-primary" />
                    <div className="text-2xl font-bold">245</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="text-muted-foreground">34</span> categorías diferentes
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Alertas de Stock</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                    <div className="text-2xl font-bold">12</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="text-red-500">4 críticos</span> y 8 niveles bajos
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Control de Inventario */}
            <Tabs defaultValue="current" className="mb-8">
              <TabsList className="mb-4">
                <TabsTrigger value="current">Inventario Actual</TabsTrigger>
                <TabsTrigger value="low">Stock Bajo</TabsTrigger>
                <TabsTrigger value="movements">Movimientos</TabsTrigger>
              </TabsList>
              
              {/* Inventario Actual */}
              <TabsContent value="current">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Estado del Inventario</CardTitle>
                      <CardDescription>
                        Revisa el stock actual de todos los productos
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimir
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                      <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          type="text"
                          placeholder="Buscar producto..."
                          className="pl-9"
                        />
                      </div>
                      <div className="flex gap-2">
                        <select className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm">
                          <option value="">Todas las categorías</option>
                          <option value="hamburgers">Hamburguesas</option>
                          <option value="pizzas">Pizzas</option>
                          <option value="drinks">Bebidas</option>
                        </select>
                        <select className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm">
                          <option value="">Todos los estados</option>
                          <option value="in-stock">En stock</option>
                          <option value="low-stock">Stock bajo</option>
                          <option value="out-of-stock">Sin stock</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2 font-medium">Producto</th>
                            <th className="text-left py-3 px-2 font-medium">SKU</th>
                            <th className="text-left py-3 px-2 font-medium">Categoría</th>
                            <th className="text-left py-3 px-2 font-medium">Stock</th>
                            <th className="text-left py-3 px-2 font-medium">Mínimo</th>
                            <th className="text-left py-3 px-2 font-medium">Costo Unitario</th>
                            <th className="text-left py-3 px-2 font-medium">Valor Total</th>
                            <th className="text-left py-3 px-2 font-medium">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Productos simulados */}
                          <tr className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-md bg-gray-200 mr-3"></div>
                                <span className="font-medium">Hamburguesa Clásica</span>
                              </div>
                            </td>
                            <td className="py-3 px-2">BURG-001</td>
                            <td className="py-3 px-2">Hamburguesas</td>
                            <td className="py-3 px-2">
                              <Badge variant="default">45</Badge>
                            </td>
                            <td className="py-3 px-2">20</td>
                            <td className="py-3 px-2">{formatCurrency(12.5)}</td>
                            <td className="py-3 px-2">{formatCurrency(562.5)}</td>
                            <td className="py-3 px-2">
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm">
                                  <PlusIcon className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                          <tr className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-md bg-gray-200 mr-3"></div>
                                <span className="font-medium">Pan de Hamburguesa</span>
                              </div>
                            </td>
                            <td className="py-3 px-2">MP-001</td>
                            <td className="py-3 px-2">Materias Primas</td>
                            <td className="py-3 px-2">
                              <Badge variant="outline" className="bg-yellow-100 hover:bg-yellow-100 text-yellow-800 border-yellow-400">
                                24
                              </Badge>
                            </td>
                            <td className="py-3 px-2">50</td>
                            <td className="py-3 px-2">{formatCurrency(0.8)}</td>
                            <td className="py-3 px-2">{formatCurrency(19.2)}</td>
                            <td className="py-3 px-2">
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm">
                                  <PlusIcon className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                          <tr className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-md bg-gray-200 mr-3"></div>
                                <span className="font-medium">Pechuga de Pollo</span>
                              </div>
                            </td>
                            <td className="py-3 px-2">MP-015</td>
                            <td className="py-3 px-2">Materias Primas</td>
                            <td className="py-3 px-2">
                              <Badge variant="destructive">
                                8
                              </Badge>
                            </td>
                            <td className="py-3 px-2">20</td>
                            <td className="py-3 px-2">{formatCurrency(3.5)}</td>
                            <td className="py-3 px-2">{formatCurrency(28)}</td>
                            <td className="py-3 px-2">
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm">
                                  <PlusIcon className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-gray-500">
                        Mostrando 1-3 de 245 productos
                      </div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" disabled>Anterior</Button>
                        <Button variant="outline" size="sm">Siguiente</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Stock Bajo */}
              <TabsContent value="low">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Productos con Stock Bajo</CardTitle>
                      <CardDescription>
                        Productos que requieren reabastecimiento inmediato
                      </CardDescription>
                    </div>
                    <Button>
                      Generar Orden de Compra
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2 font-medium">Producto</th>
                            <th className="text-left py-3 px-2 font-medium">SKU</th>
                            <th className="text-left py-3 px-2 font-medium">Stock Actual</th>
                            <th className="text-left py-3 px-2 font-medium">Stock Mínimo</th>
                            <th className="text-left py-3 px-2 font-medium">Proveedor</th>
                            <th className="text-left py-3 px-2 font-medium">Estado</th>
                            <th className="text-left py-3 px-2 font-medium">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventarioBajo.map((item) => (
                            <tr key={item.id} className="border-b hover:bg-muted/50">
                              <td className="py-3 px-2">
                                <div className="font-medium">{item.nombre}</div>
                              </td>
                              <td className="py-3 px-2">{item.sku}</td>
                              <td className="py-3 px-2">{item.actual}</td>
                              <td className="py-3 px-2">{item.minimo}</td>
                              <td className="py-3 px-2">Distribuidora Alimentos JR</td>
                              <td className="py-3 px-2">
                                <Badge variant={item.actual < item.minimo * 0.5 ? "destructive" : "outline"} 
                                  className={item.actual < item.minimo * 0.5 ? "" : "bg-yellow-100 hover:bg-yellow-100 text-yellow-800 border-yellow-400"}>
                                  {item.actual < item.minimo * 0.5 ? "Crítico" : "Bajo"}
                                </Badge>
                              </td>
                              <td className="py-3 px-2">
                                <Button variant="outline" size="sm">Reabastecer</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Movimientos de Inventario */}
              <TabsContent value="movements">
                <Card>
                  <CardHeader>
                    <CardTitle>Historial de Movimientos</CardTitle>
                    <CardDescription>
                      Registro de entradas, salidas y ajustes de inventario
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2 font-medium">Fecha</th>
                            <th className="text-left py-3 px-2 font-medium">Tipo</th>
                            <th className="text-left py-3 px-2 font-medium">Producto</th>
                            <th className="text-left py-3 px-2 font-medium">Cantidad</th>
                            <th className="text-left py-3 px-2 font-medium">Usuario</th>
                            <th className="text-left py-3 px-2 font-medium">Referencia</th>
                            <th className="text-left py-3 px-2 font-medium">Nota</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2">07 Abr 2025, 10:25 AM</td>
                            <td className="py-3 px-2">
                              <Badge className="bg-green-100 hover:bg-green-100 text-green-800 border-green-400">
                                Entrada
                              </Badge>
                            </td>
                            <td className="py-3 px-2">Pan de hamburguesa</td>
                            <td className="py-3 px-2">+50</td>
                            <td className="py-3 px-2">Carlos Ramírez</td>
                            <td className="py-3 px-2">OC-2025-042</td>
                            <td className="py-3 px-2">Reposición de stock</td>
                          </tr>
                          <tr className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2">06 Abr 2025, 5:18 PM</td>
                            <td className="py-3 px-2">
                              <Badge className="bg-red-100 hover:bg-red-100 text-red-800 border-red-400">
                                Salida
                              </Badge>
                            </td>
                            <td className="py-3 px-2">Pechuga de pollo</td>
                            <td className="py-3 px-2">-15</td>
                            <td className="py-3 px-2">María López</td>
                            <td className="py-3 px-2">PED-4720</td>
                            <td className="py-3 px-2">Venta a cliente</td>
                          </tr>
                          <tr className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2">05 Abr 2025, 2:45 PM</td>
                            <td className="py-3 px-2">
                              <Badge className="bg-blue-100 hover:bg-blue-100 text-blue-800 border-blue-400">
                                Ajuste
                              </Badge>
                            </td>
                            <td className="py-3 px-2">Aguacate</td>
                            <td className="py-3 px-2">-3</td>
                            <td className="py-3 px-2">Juan Pérez</td>
                            <td className="py-3 px-2">AJ-2025-015</td>
                            <td className="py-3 px-2">Producto en mal estado</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-gray-500">
                        Mostrando 1-3 de 156 movimientos
                      </div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" disabled>Anterior</Button>
                        <Button variant="outline" size="sm">Siguiente</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* PEDIDOS */}
          <TabsContent value="orders">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Gestión de Pedidos</h2>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Nuevo Pedido
                </Button>
              </div>
            </div>

            {/* Métricas de Pedidos */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total de Pedidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <ClipboardList className="mr-2 h-4 w-4 text-primary" />
                    <div className="text-2xl font-bold">724</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="text-green-500">↑ 12%</span> desde el mes pasado
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
                    <div className="text-2xl font-bold">18</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="text-yellow-500">8 pedidos</span> de hoy
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">En Proceso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Truck className="mr-2 h-4 w-4 text-blue-500" />
                    <div className="text-2xl font-bold">24</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="text-blue-500">12 entregas</span> programadas hoy
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Completados (Hoy)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <CheckSquare className="mr-2 h-4 w-4 text-green-500" />
                    <div className="text-2xl font-bold">36</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="text-green-500">{formatCurrency(3865)}</span> en ventas de hoy
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filtros de Pedidos */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Buscar por ID, cliente, o productos..."
                      className="pl-9"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm">
                      <option value="">Todos los estados</option>
                      <option value="pending">Pendientes</option>
                      <option value="processing">En proceso</option>
                      <option value="delivered">Entregados</option>
                      <option value="cancelled">Cancelados</option>
                    </select>
                    <select className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm">
                      <option value="">Ordenar por</option>
                      <option value="date-desc">Fecha (reciente)</option>
                      <option value="date-asc">Fecha (antiguo)</option>
                      <option value="total-desc">Total (mayor)</option>
                      <option value="total-asc">Total (menor)</option>
                    </select>
                    <Input
                      type="date"
                      className="h-[38px]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Pedidos */}
            <Card>
              <CardHeader>
                <CardTitle>Pedidos</CardTitle>
                <CardDescription>
                  Lista de todos los pedidos recibidos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium">Pedido</th>
                        <th className="text-left py-3 px-2 font-medium">Cliente</th>
                        <th className="text-left py-3 px-2 font-medium">Fecha</th>
                        <th className="text-left py-3 px-2 font-medium">Total</th>
                        <th className="text-left py-3 px-2 font-medium">Estado</th>
                        <th className="text-left py-3 px-2 font-medium">Método de Pago</th>
                        <th className="text-left py-3 px-2 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ultimosPedidos.map((pedido) => (
                        <tr key={pedido.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-2">
                            <div className="font-medium">{pedido.id}</div>
                            <div className="text-xs text-muted-foreground">{pedido.items} productos</div>
                          </td>
                          <td className="py-3 px-2">{pedido.cliente}</td>
                          <td className="py-3 px-2">{pedido.fecha}</td>
                          <td className="py-3 px-2 font-medium">{formatCurrency(pedido.total)}</td>
                          <td className="py-3 px-2">
                            <Badge
                              variant={
                                pedido.estado === "Entregado" ? "default" :
                                pedido.estado === "En proceso" ? "outline" :
                                pedido.estado === "Pendiente" ? "secondary" : "destructive"
                              }
                              className={
                                pedido.estado === "En proceso" ? "bg-blue-100 hover:bg-blue-100 text-blue-800 border-blue-400" :
                                pedido.estado === "Pendiente" ? "bg-yellow-100 hover:bg-yellow-100 text-yellow-800 border-yellow-400" : ""
                              }
                            >
                              {pedido.estado}
                            </Badge>
                          </td>
                          <td className="py-3 px-2">Tarjeta de crédito</td>
                          <td className="py-3 px-2">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Printer className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    Mostrando 1-5 de 724 pedidos
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" disabled>Anterior</Button>
                    <Button variant="outline" size="sm">Siguiente</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CLIENTES */}
          <TabsContent value="customers">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Gestión de Clientes</h2>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Nuevo Cliente
              </Button>
            </div>

            {/* Métricas de Clientes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total de Clientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-primary" />
                    <div className="text-2xl font-bold">1,248</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="text-green-500">↑ 15%</span> desde el mes pasado
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Clientes Nuevos (Mes)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <UserPlus className="mr-2 h-4 w-4 text-primary" />
                    <div className="text-2xl font-bold">85</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="text-green-500">↑ 24%</span> comparado con el mes pasado
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Valor Promedio por Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <WalletIcon className="mr-2 h-4 w-4 text-primary" />
                    <div className="text-2xl font-bold">{formatCurrency(485.50)}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="text-green-500">↑ 5%</span> comparado con el mes pasado
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Clientes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Directorio de Clientes</CardTitle>
                  <CardDescription>
                    Gestiona la información de tus clientes
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Buscar por nombre, email o teléfono..."
                      className="pl-9"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm">
                      <option value="">Todos los clientes</option>
                      <option value="active">Clientes activos</option>
                      <option value="inactive">Clientes inactivos</option>
                      <option value="new">Nuevos clientes</option>
                    </select>
                    <Button variant="outline" size="sm">
                      <FilterIcon className="h-4 w-4 mr-1" />
                      Filtrar
                    </Button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium">Cliente</th>
                        <th className="text-left py-3 px-2 font-medium">Email</th>
                        <th className="text-left py-3 px-2 font-medium">Teléfono</th>
                        <th className="text-left py-3 px-2 font-medium">Pedidos</th>
                        <th className="text-left py-3 px-2 font-medium">Total Gastado</th>
                        <th className="text-left py-3 px-2 font-medium">Última Compra</th>
                        <th className="text-left py-3 px-2 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                              JP
                            </div>
                            <div>
                              <div className="font-medium">Juan Pérez</div>
                              <div className="text-xs text-muted-foreground">Desde 10 Mar 2025</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">juan.perez@ejemplo.com</td>
                        <td className="py-3 px-2">555-1234</td>
                        <td className="py-3 px-2">8</td>
                        <td className="py-3 px-2">{formatCurrency(1850.75)}</td>
                        <td className="py-3 px-2">07 Abr 2025</td>
                        <td className="py-3 px-2">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <ShoppingCart className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                              ML
                            </div>
                            <div>
                              <div className="font-medium">María López</div>
                              <div className="text-xs text-muted-foreground">Desde 25 Feb 2025</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">maria.lopez@ejemplo.com</td>
                        <td className="py-3 px-2">555-5678</td>
                        <td className="py-3 px-2">12</td>
                        <td className="py-3 px-2">{formatCurrency(2450.30)}</td>
                        <td className="py-3 px-2">07 Abr 2025</td>
                        <td className="py-3 px-2">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <ShoppingCart className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                              CG
                            </div>
                            <div>
                              <div className="font-medium">Carlos González</div>
                              <div className="text-xs text-muted-foreground">Desde 15 Mar 2025</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">carlos.gonzalez@ejemplo.com</td>
                        <td className="py-3 px-2">555-8901</td>
                        <td className="py-3 px-2">5</td>
                        <td className="py-3 px-2">{formatCurrency(980.50)}</td>
                        <td className="py-3 px-2">06 Abr 2025</td>
                        <td className="py-3 px-2">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <ShoppingCart className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    Mostrando 1-3 de 1,248 clientes
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" disabled>Anterior</Button>
                    <Button variant="outline" size="sm">Siguiente</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PROVEEDORES */}
          <TabsContent value="suppliers">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Gestión de Proveedores</h2>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Nuevo Proveedor
              </Button>
            </div>

            {/* Lista de Proveedores */}
            <Card>
              <CardHeader>
                <CardTitle>Directorio de Proveedores</CardTitle>
                <CardDescription>
                  Administra la información de tus proveedores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Buscar proveedor..."
                      className="pl-9"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <FilterIcon className="h-4 w-4 mr-1" />
                      Filtrar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Exportar
                    </Button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium">Proveedor</th>
                        <th className="text-left py-3 px-2 font-medium">Contacto</th>
                        <th className="text-left py-3 px-2 font-medium">Teléfono</th>
                        <th className="text-left py-3 px-2 font-medium">Email</th>
                        <th className="text-left py-3 px-2 font-medium">Productos</th>
                        <th className="text-left py-3 px-2 font-medium">Última Compra</th>
                        <th className="text-left py-3 px-2 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proveedores.map((proveedor) => (
                        <tr key={proveedor.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-2">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                                {proveedor.nombre.charAt(0)}
                              </div>
                              <div className="font-medium">{proveedor.nombre}</div>
                            </div>
                          </td>
                          <td className="py-3 px-2">Juan Rodríguez</td>
                          <td className="py-3 px-2">{proveedor.telefono}</td>
                          <td className="py-3 px-2">{proveedor.email}</td>
                          <td className="py-3 px-2">24</td>
                          <td className="py-3 px-2">02 Abr 2025</td>
                          <td className="py-3 px-2">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <ClipboardList className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    Mostrando 1-3 de 18 proveedores
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" disabled>Anterior</Button>
                    <Button variant="outline" size="sm">Siguiente</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Órdenes de Compra */}
            <Card className="mt-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Órdenes de Compra</CardTitle>
                  <CardDescription>
                    Historial de órdenes de compra a proveedores
                  </CardDescription>
                </div>
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Nueva Orden
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium">Orden #</th>
                        <th className="text-left py-3 px-2 font-medium">Proveedor</th>
                        <th className="text-left py-3 px-2 font-medium">Fecha</th>
                        <th className="text-left py-3 px-2 font-medium">Total</th>
                        <th className="text-left py-3 px-2 font-medium">Estado</th>
                        <th className="text-left py-3 px-2 font-medium">Fecha Entrega</th>
                        <th className="text-left py-3 px-2 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2">OC-2025-042</td>
                        <td className="py-3 px-2">Distribuidora Alimentos JR</td>
                        <td className="py-3 px-2">05 Abr 2025</td>
                        <td className="py-3 px-2">{formatCurrency(2450.50)}</td>
                        <td className="py-3 px-2">
                          <Badge className="bg-green-100 hover:bg-green-100 text-green-800 border-green-400">
                            Recibida
                          </Badge>
                        </td>
                        <td className="py-3 px-2">07 Abr 2025</td>
                        <td className="py-3 px-2">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2">OC-2025-041</td>
                        <td className="py-3 px-2">Carnes y Embutidos del Valle</td>
                        <td className="py-3 px-2">01 Abr 2025</td>
                        <td className="py-3 px-2">{formatCurrency(1850.30)}</td>
                        <td className="py-3 px-2">
                          <Badge className="bg-blue-100 hover:bg-blue-100 text-blue-800 border-blue-400">
                            En tránsito
                          </Badge>
                        </td>
                        <td className="py-3 px-2">10 Abr 2025</td>
                        <td className="py-3 px-2">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2">OC-2025-040</td>
                        <td className="py-3 px-2">Productos Frescos SL</td>
                        <td className="py-3 px-2">28 Mar 2025</td>
                        <td className="py-3 px-2">{formatCurrency(985.75)}</td>
                        <td className="py-3 px-2">
                          <Badge className="bg-yellow-100 hover:bg-yellow-100 text-yellow-800 border-yellow-400">
                            Pendiente
                          </Badge>
                        </td>
                        <td className="py-3 px-2">09 Abr 2025</td>
                        <td className="py-3 px-2">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REPORTES */}
          <TabsContent value="reports">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Reportes y Análisis</h2>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
              </div>
            </div>

            {/* Tipos de Reportes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="hover:shadow-md cursor-pointer transition-shadow">
                <CardHeader>
                  <BarChart2 className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Ventas</CardTitle>
                  <CardDescription>
                    Análisis detallado de ventas por período, producto y categoría
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Ventas por período</li>
                    <li>Productos más vendidos</li>
                    <li>Ventas por categoría</li>
                    <li>Ventas por cliente</li>
                  </ul>
                  <Button variant="outline" className="w-full mt-4">
                    Ver Reportes
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md cursor-pointer transition-shadow">
                <CardHeader>
                  <Package2Icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Inventario</CardTitle>
                  <CardDescription>
                    Valoración e historial de inventario y movimientos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Valor del inventario</li>
                    <li>Rotación de stock</li>
                    <li>Productos sin movimiento</li>
                    <li>Historial de ajustes</li>
                  </ul>
                  <Button variant="outline" className="w-full mt-4">
                    Ver Reportes
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md cursor-pointer transition-shadow">
                <CardHeader>
                  <WalletIcon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Finanzas</CardTitle>
                  <CardDescription>
                    Reportes financieros de ingresos, costos y ganancias
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Ingresos y egresos</li>
                    <li>Margen de beneficio</li>
                    <li>Flujo de caja</li>
                    <li>Proyecciones</li>
                  </ul>
                  <Button variant="outline" className="w-full mt-4">
                    Ver Reportes
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Reporte de Ventas por Período */}
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Ventas por Período</CardTitle>
                  <CardDescription>
                    Comparativa de ventas por período seleccionado
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <select className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm">
                    <option value="daily">Diario</option>
                    <option value="weekly" selected>Semanal</option>
                    <option value="monthly">Mensual</option>
                    <option value="yearly">Anual</option>
                  </select>
                  <Input
                    type="date"
                    className="h-[38px]"
                    defaultValue="2025-04-07"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ventasPorSemana}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nombre" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Ventas']} />
                      <Legend />
                      <Bar dataKey="ventas" fill="#60A5FA" name="Ventas ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <Separator className="my-6" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Total</div>
                    <div className="text-2xl font-bold">{formatCurrency(26000)}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Promedio</div>
                    <div className="text-2xl font-bold">{formatCurrency(5200)}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Máximo</div>
                    <div className="text-2xl font-bold">{formatCurrency(8000)}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Mínimo</div>
                    <div className="text-2xl font-bold">{formatCurrency(3000)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CONFIGURACIÓN */}
          <TabsContent value="settings">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Configuración del Sistema</h2>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
            </div>

            {/* Secciones de Configuración */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Tabs defaultValue="store" className="w-full">
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="store">Tienda</TabsTrigger>
                    <TabsTrigger value="users">Usuarios</TabsTrigger>
                    <TabsTrigger value="system">Sistema</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="store" className="space-y-4 mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Datos de la Tienda</CardTitle>
                        <CardDescription>
                          Configura la información principal de tu negocio
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid gap-2">
                            <label className="text-sm font-medium">Nombre de la Tienda</label>
                            <Input defaultValue="Minimarket El Barrio" />
                          </div>
                          <div className="grid gap-2">
                            <label className="text-sm font-medium">Dirección</label>
                            <Input defaultValue="Av. Principal 123, Ciudad" />
                          </div>
                          <div className="grid gap-2">
                            <label className="text-sm font-medium">Teléfono</label>
                            <Input defaultValue="555-1234" />
                          </div>
                          <div className="grid gap-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input defaultValue="contacto@minimarketelbarrio.com" />
                          </div>
                          <div className="grid gap-2">
                            <label className="text-sm font-medium">Moneda</label>
                            <select className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm">
                              <option value="usd">USD ($)</option>
                              <option value="eur">EUR (€)</option>
                              <option value="gbp">GBP (£)</option>
                            </select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Preferencias y Opciones</CardTitle>
                    <CardDescription>
                      Configura las opciones principales del sistema según tus necesidades
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-full flex flex-col">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-3">Opciones de Inventario</h3>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="alertas" defaultChecked />
                              <label htmlFor="alertas" className="text-sm">
                                Activar alertas de stock bajo
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="negative" />
                              <label htmlFor="negative" className="text-sm">
                                Permitir stock negativo
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="lifo" defaultChecked />
                              <label htmlFor="lifo" className="text-sm">
                                Usar método FIFO (primero en entrar, primero en salir)
                              </label>
                            </div>
                            <div className="grid gap-2">
                              <label className="text-sm font-medium">Umbral de stock bajo predeterminado</label>
                              <Input type="number" defaultValue="10" />
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="text-lg font-medium mb-3">Opciones de Venta</h3>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="discount" defaultChecked />
                              <label htmlFor="discount" className="text-sm">
                                Permitir descuentos
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="invoice" defaultChecked />
                              <label htmlFor="invoice" className="text-sm">
                                Generar factura automáticamente
                              </label>
                            </div>
                            <div className="grid gap-2">
                              <label className="text-sm font-medium">Límite de crédito predeterminado</label>
                              <Input type="number" defaultValue="1000" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-3">Opciones de Visualización</h3>
                          <div className="space-y-4">
                            <div className="grid gap-2">
                              <label className="text-sm font-medium">Elementos por página</label>
                              <select className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm">
                                <option value="10">10</option>
                                <option value="25" selected>25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                              </select>
                            </div>
                            <div className="grid gap-2">
                              <label className="text-sm font-medium">Vista predeterminada de productos</label>
                              <select className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm">
                                <option value="grid" selected>Cuadrícula</option>
                                <option value="list">Lista</option>
                              </select>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="receipts" defaultChecked />
                              <label htmlFor="receipts" className="text-sm">
                                Mostrar recibos después de la venta
                              </label>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="text-lg font-medium mb-3">Gestión de Clientes</h3>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="loyalty" defaultChecked />
                              <label htmlFor="loyalty" className="text-sm">
                                Activar programa de fidelización
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="birthday" defaultChecked />
                              <label htmlFor="birthday" className="text-sm">
                                Enviar ofertas en cumpleaños
                              </label>
                            </div>
                            <div className="grid gap-2">
                              <label className="text-sm font-medium">Puntos por cada $100 gastados</label>
                              <Input type="number" defaultValue="5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline">Restablecer Valores</Button>
                        <Button>Guardar Cambios</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;