import React from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import {
  CalendarIcon,
  Package2Icon,
  TrendingUpIcon,
  WalletIcon,
  Users,
  ShoppingCart,
  ClipboardList,
  PlusIcon,
  UserPlus,
  Eye,
  AlertCircle,
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

const ultimosPedidos = [
  { id: "PED-4721", cliente: "Juan Pérez", fecha: "07 Abr 2025", total: 156.99, estado: "Entregado", items: 5 },
  { id: "PED-4720", cliente: "María López", fecha: "07 Abr 2025", total: 89.50, estado: "En proceso", items: 3 },
  { id: "PED-4719", cliente: "Carlos González", fecha: "06 Abr 2025", total: 210.75, estado: "Pendiente", items: 8 },
  { id: "PED-4718", cliente: "Ana Martínez", fecha: "06 Abr 2025", total: 45.25, estado: "Cancelado", items: 2 },
  { id: "PED-4717", cliente: "Roberto Sánchez", fecha: "05 Abr 2025", total: 125.40, estado: "Entregado", items: 4 },
];

const DashboardPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Panel de Control</h1>
          <p className="text-gray-500">Administra tu negocio, analiza métricas y toma decisiones estratégicas</p>
        </div>

        {/* Título de Vista General */}
        <div className="mb-6 pb-3 border-b">
          <h2 className="text-xl font-semibold">Vista General</h2>
        </div>

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
                    {productosMasVendidos.map((producto) => (
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
      </div>
    </MainLayout>
  );
};

export default DashboardPage;