import React from "react";
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
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { CalendarIcon, Package2Icon, TrendingUpIcon, WalletIcon } from "lucide-react";

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

const productosMasVendidos = [
  { id: 1, nombre: "Hamburguesa Clásica", ventas: 156, ingreso: 3120, imagen: "/placeholder-burger.jpg" },
  { id: 2, nombre: "Tacos de Pollo", ventas: 142, ingreso: 2840, imagen: "/placeholder-tacos.jpg" },
  { id: 3, nombre: "Jugo de Naranja", ventas: 98, ingreso: 1176, imagen: "/placeholder-juice.jpg" },
  { id: 4, nombre: "Sushi Mixto", ventas: 87, ingreso: 1740, imagen: "/placeholder-sushi.jpg" },
  { id: 5, nombre: "Ensalada Vegetariana", ventas: 76, ingreso: 1140, imagen: "/placeholder-salad.jpg" },
];

const inventarioBajo = [
  { id: 1, nombre: "Pan de hamburguesa", actual: 24, minimo: 50 },
  { id: 2, nombre: "Tortillas", actual: 35, minimo: 60 },
  { id: 3, nombre: "Pechuga de pollo", actual: 8, minimo: 20 },
  { id: 4, nombre: "Aguacate", actual: 12, minimo: 25 },
];

const DashboardPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
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
                <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                <div className="text-2xl font-bold">64%</div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="text-red-500">↓ 2%</span> comparado con el mes pasado
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs para diferentes secciones */}
        <Tabs defaultValue="ventas" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="ventas">Ventas</TabsTrigger>
            <TabsTrigger value="productos">Productos Populares</TabsTrigger>
            <TabsTrigger value="inventario">Inventario</TabsTrigger>
          </TabsList>
          
          {/* Contenido de Ventas */}
          <TabsContent value="ventas">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          </TabsContent>
          
          {/* Contenido de Productos Populares */}
          <TabsContent value="productos">
            <Card>
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
                        <th className="text-left py-3 font-medium">Ranking</th>
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
                              <span>{producto.nombre}</span>
                            </div>
                          </td>
                          <td className="py-3">{producto.ventas} unidades</td>
                          <td className="py-3">{formatCurrency(producto.ingreso)}</td>
                          <td className="py-3">
                            <Badge variant={index < 3 ? "default" : "outline"}>
                              #{index + 1}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Contenido de Inventario */}
          <TabsContent value="inventario">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Inventario Bajo</CardTitle>
                  <CardDescription>Productos que necesitan reabastecimiento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 font-medium">Producto</th>
                          <th className="text-left py-3 font-medium">Stock Actual</th>
                          <th className="text-left py-3 font-medium">Stock Mínimo</th>
                          <th className="text-left py-3 font-medium">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventarioBajo.map((item) => (
                          <tr key={item.id} className="border-b hover:bg-muted/50">
                            <td className="py-3">{item.nombre}</td>
                            <td className="py-3">{item.actual} unidades</td>
                            <td className="py-3">{item.minimo} unidades</td>
                            <td className="py-3">
                              <Badge variant={item.actual < item.minimo * 0.5 ? "destructive" : "outline"} 
                                className={item.actual < item.minimo * 0.5 ? "" : "bg-yellow-100 hover:bg-yellow-100 text-yellow-800 border-yellow-400"}>
                                {item.actual < item.minimo * 0.5 ? "Crítico" : "Bajo"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <button className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90">
                      Generar Reporte de Compras
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Sección de Facturación */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Facturación Reciente</CardTitle>
            <CardDescription>Últimas facturas generadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 font-medium">Factura #</th>
                    <th className="text-left py-3 font-medium">Cliente</th>
                    <th className="text-left py-3 font-medium">Fecha</th>
                    <th className="text-left py-3 font-medium">Monto</th>
                    <th className="text-left py-3 font-medium">Estado</th>
                    <th className="text-left py-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3">#INV-001</td>
                    <td className="py-3">Juan Pérez</td>
                    <td className="py-3">15 Mar 2025</td>
                    <td className="py-3">{formatCurrency(156.99)}</td>
                    <td className="py-3">
                      <Badge variant="outline" className="bg-green-100 hover:bg-green-100 text-green-800 border-green-400">Pagada</Badge>
                    </td>
                    <td className="py-3">
                      <button className="text-primary hover:underline text-sm">Ver</button>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3">#INV-002</td>
                    <td className="py-3">María López</td>
                    <td className="py-3">14 Mar 2025</td>
                    <td className="py-3">{formatCurrency(89.50)}</td>
                    <td className="py-3">
                      <Badge variant="outline" className="bg-green-100 hover:bg-green-100 text-green-800 border-green-400">Pagada</Badge>
                    </td>
                    <td className="py-3">
                      <button className="text-primary hover:underline text-sm">Ver</button>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3">#INV-003</td>
                    <td className="py-3">Carlos González</td>
                    <td className="py-3">13 Mar 2025</td>
                    <td className="py-3">{formatCurrency(210.75)}</td>
                    <td className="py-3">
                      <Badge variant="outline" className="bg-yellow-100 hover:bg-yellow-100 text-yellow-800 border-yellow-400">Pendiente</Badge>
                    </td>
                    <td className="py-3">
                      <button className="text-primary hover:underline text-sm">Ver</button>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3">#INV-004</td>
                    <td className="py-3">Ana Martínez</td>
                    <td className="py-3">12 Mar 2025</td>
                    <td className="py-3">{formatCurrency(45.25)}</td>
                    <td className="py-3">
                      <Badge variant="destructive">Cancelada</Badge>
                    </td>
                    <td className="py-3">
                      <button className="text-primary hover:underline text-sm">Ver</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;