import React, { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  BarChart2,
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown,
  Calendar,
  Download,
  Share2,
  Filter,
  RefreshCcw,
  ChevronUp,
  ChevronDown,
  ArrowUpRight,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  AlertCircle
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Datos de ventas mensuales (6 meses)
const ventasMensuales = [
  { mes: "Noviembre", ventas: 15620, pedidos: 124 },
  { mes: "Diciembre", ventas: 21450, pedidos: 185 },
  { mes: "Enero", ventas: 18320, pedidos: 150 },
  { mes: "Febrero", ventas: 19780, pedidos: 162 },
  { mes: "Marzo", ventas: 22340, pedidos: 178 },
  { mes: "Abril", ventas: 25120, pedidos: 198 },
];

// Datos de ventas por categoría
const ventasPorCategoria = [
  { categoria: "Hamburguesas", ventas: 8750, porcentaje: 35 },
  { categoria: "Pizzas", ventas: 6250, porcentaje: 25 },
  { categoria: "Bebidas", ventas: 3750, porcentaje: 15 },
  { categoria: "Postres", ventas: 2500, porcentaje: 10 },
  { categoria: "Ensaladas", ventas: 2250, porcentaje: 9 },
  { categoria: "Otros", ventas: 1500, porcentaje: 6 },
];

// Datos de productos más vendidos
const productosMasVendidos = [
  { id: 1, nombre: "Hamburguesa Clásica", ventas: 354, ingresos: 4596.46, crecimiento: 8.5 },
  { id: 2, nombre: "Pizza Margarita", ventas: 286, ingresos: 3289.00, crecimiento: 5.2 },
  { id: 3, nombre: "Refresco Cola", ventas: 412, ingresos: 823.88, crecimiento: 12.8 },
  { id: 4, nombre: "Agua Mineral", ventas: 325, ingresos: 646.75, crecimiento: 3.5 },
  { id: 5, nombre: "Brownie de Chocolate", ventas: 198, ingresos: 693.00, crecimiento: -2.1 },
];

// Datos de inventario con baja rotación
const inventarioBajaRotacion = [
  { id: 1, nombre: "Ensalada César", stock: 18, ultimaVenta: "2024-02-10", diasSinVenta: 58 },
  { id: 2, nombre: "Smoothie de Frutas", stock: 25, ultimaVenta: "2024-01-25", diasSinVenta: 74 },
  { id: 3, nombre: "Sándwich Vegano", stock: 12, ultimaVenta: "2024-02-28", diasSinVenta: 40 },
  { id: 4, nombre: "Té Chai", stock: 30, ultimaVenta: "2024-03-15", diasSinVenta: 24 },
];

// Datos de clientes más valiosos
const clientesValiosos = [
  { id: 1, nombre: "Juan Pérez", compras: 28, totalGastado: 1250.75, ultimaCompra: "2024-04-02" },
  { id: 2, nombre: "María Rodríguez", compras: 35, totalGastado: 1680.20, ultimaCompra: "2024-04-05" },
  { id: 3, nombre: "Carlos Sánchez", compras: 42, totalGastado: 2340.50, ultimaCompra: "2024-04-01" },
  { id: 4, nombre: "Ana García", compras: 22, totalGastado: 980.30, ultimaCompra: "2024-03-28" },
];

// Datos de resumen de ventas para dashboards
const resumenVentas = {
  ventasHoy: 1250.75,
  ventasAyer: 1180.50,
  crecimientoHoy: 5.9,
  ventasSemana: 8750.25,
  ventasSemanaPasada: 8250.80,
  crecimientoSemana: 6.1,
  ventasMes: 25120.00,
  ventasMesPasado: 22340.00,
  crecimientoMes: 12.4,
  ticketPromedio: 32.50,
  ticketPromedioAnterior: 30.80,
  crecimientoTicket: 5.5
};

// Datos de métricas para cuadro de mando
const kpis = [
  { nombre: "Ventas Totales", valor: 25120, anterior: 22340, unidad: "$", crecimiento: 12.4 },
  { nombre: "Pedidos", valor: 198, anterior: 178, unidad: "", crecimiento: 11.2 },
  { nombre: "Ticket Promedio", valor: 32.50, anterior: 30.80, unidad: "$", crecimiento: 5.5 },
  { nombre: "Clientes Nuevos", valor: 45, anterior: 38, unidad: "", crecimiento: 18.4 },
];

// Función para formatear moneda
const formatCurrency = (amount: number) => {
  return amount.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  });
};

// Función para formatear fecha
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};

const ReportsPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState("ventas");
  const [currentPeriod, setCurrentPeriod] = useState("mes");
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Reportes y Analíticas</h1>
          <p className="text-gray-500">Visualiza el rendimiento de tu negocio con informes detallados</p>
        </div>
        
        {/* Filtros de tiempo y exportación */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={currentPeriod === "hoy" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPeriod("hoy")}
            >
              Hoy
            </Button>
            <Button 
              variant={currentPeriod === "semana" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPeriod("semana")}
            >
              Esta Semana
            </Button>
            <Button 
              variant={currentPeriod === "mes" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPeriod("mes")}
            >
              Este Mes
            </Button>
            <Button 
              variant={currentPeriod === "trimestre" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPeriod("trimestre")}
            >
              Trimestre
            </Button>
            <Button 
              variant={currentPeriod === "año" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPeriod("año")}
            >
              Año
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Personalizado</span>
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Share2 className="h-4 w-4" />
              <span>Compartir</span>
            </Button>
          </div>
        </div>
        
        {/* Pestañas de categorías de reportes */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="ventas" className="flex items-center gap-1">
              <BarChart2 className="h-4 w-4" />
              <span>Ventas</span>
            </TabsTrigger>
            <TabsTrigger value="productos" className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              <span>Productos</span>
            </TabsTrigger>
            <TabsTrigger value="inventario" className="flex items-center gap-1">
              <ShoppingCart className="h-4 w-4" />
              <span>Inventario</span>
            </TabsTrigger>
            <TabsTrigger value="clientes" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Clientes</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Contenido de pestaña Ventas */}
          <TabsContent value="ventas">
            {/* KPIs de Ventas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {kpis.map((kpi, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-500 text-sm">{kpi.nombre}</p>
                        <h3 className="text-3xl font-bold mt-1">
                          {kpi.unidad}{kpi.valor.toLocaleString()}
                        </h3>
                        <div className={`text-sm mt-1 flex items-center gap-1 ${kpi.crecimiento > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {kpi.crecimiento > 0 ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          <span>{Math.abs(kpi.crecimiento)}% vs periodo anterior</span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-full ${
                        index === 0 ? 'bg-blue-100' : 
                        index === 1 ? 'bg-purple-100' : 
                        index === 2 ? 'bg-green-100' : 
                        'bg-amber-100'
                      }`}>
                        {index === 0 ? <DollarSign className="h-6 w-6 text-blue-600" /> : 
                         index === 1 ? <ShoppingCart className="h-6 w-6 text-purple-600" /> : 
                         index === 2 ? <ArrowUp className="h-6 w-6 text-green-600" /> : 
                         <Users className="h-6 w-6 text-amber-600" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Gráficos de Ventas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium">Ventas por Periodo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-60 w-full flex items-center justify-center bg-gray-50 rounded border">
                    <div className="text-center">
                      <BarChart2 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Gráfico de Ventas Mensuales</p>
                      <p className="text-sm text-gray-400">Implementación pendiente</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {ventasMensuales.slice(3).map((mes, index) => (
                      <div key={index} className="text-center">
                        <p className="text-xs text-gray-500">{mes.mes}</p>
                        <p className="font-semibold">{formatCurrency(mes.ventas)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium">Distribución de Ventas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-60 w-full flex items-center justify-center bg-gray-50 rounded border">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Gráfico de Distribución por Categoría</p>
                      <p className="text-sm text-gray-400">Implementación pendiente</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {ventasPorCategoria.slice(0, 3).map((categoria, index) => (
                      <div key={index} className="text-center">
                        <p className="text-xs text-gray-500">{categoria.categoria}</p>
                        <p className="font-semibold">{categoria.porcentaje}%</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Tabla de Ventas por Día */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-base font-medium">Detalle de Ventas Diarias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pedidos</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ventas</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket Promedio</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% vs Día Anterior</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 7 }).map((_, index) => {
                        const date = new Date();
                        date.setDate(date.getDate() - index);
                        const isToday = index === 0;
                        const randomGrowth = Math.floor(Math.random() * 20) - 10;
                        const randomSales = Math.floor(800 + Math.random() * 500);
                        const randomOrders = Math.floor(20 + Math.random() * 15);
                        
                        return (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">
                              <div className="font-medium">
                                {date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
                                {isToday && <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-300">Hoy</Badge>}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right text-sm">{randomOrders}</td>
                            <td className="px-4 py-3 text-right text-sm font-medium">{formatCurrency(randomSales)}</td>
                            <td className="px-4 py-3 text-right text-sm">{formatCurrency(randomSales / randomOrders)}</td>
                            <td className="px-4 py-3 text-right text-sm">
                              <div className={`inline-flex items-center gap-1 ${randomGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {randomGrowth > 0 ? (
                                  <ArrowUp className="h-3 w-3" />
                                ) : (
                                  <ArrowDown className="h-3 w-3" />
                                )}
                                <span>{Math.abs(randomGrowth)}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Contenido de pestaña Productos */}
          <TabsContent value="productos">
            {/* Resumen de productos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-sm">Productos Activos</p>
                      <h3 className="text-3xl font-bold mt-1">152</h3>
                      <p className="text-sm text-green-600 mt-1">+5 este mes</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-sm">Más Vendido</p>
                      <h3 className="text-xl font-bold mt-1">Hamburguesa Clásica</h3>
                      <p className="text-sm text-green-600 mt-1">354 unidades este mes</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-sm">Margen Promedio</p>
                      <h3 className="text-3xl font-bold mt-1">62.8%</h3>
                      <p className="text-sm text-green-600 mt-1">+2.3% vs mes anterior</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <DollarSign className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Productos más vendidos */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-base font-medium">Productos Más Vendidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unidades</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ingresos</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Crecimiento</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tendencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosMasVendidos.map((producto, index) => (
                        <tr key={producto.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium">{producto.nombre}</td>
                          <td className="px-4 py-3 text-right text-sm">{producto.ventas}</td>
                          <td className="px-4 py-3 text-right text-sm font-medium">{formatCurrency(producto.ingresos)}</td>
                          <td className="px-4 py-3 text-right text-sm">
                            <div className={`inline-flex items-center gap-1 ${producto.crecimiento > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {producto.crecimiento > 0 ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : (
                                <ArrowDown className="h-3 w-3" />
                              )}
                              <span>{Math.abs(producto.crecimiento)}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="inline-flex items-center gap-1">
                              {producto.crecimiento > 5 ? (
                                <Badge className="bg-green-100 text-green-800 border-green-300">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  <span>Alto</span>
                                </Badge>
                              ) : producto.crecimiento > 0 ? (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                                  <ArrowUp className="h-3 w-3 mr-1" />
                                  <span>Estable</span>
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800 border-red-300">
                                  <TrendingDown className="h-3 w-3 mr-1" />
                                  <span>Bajando</span>
                                </Badge>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            {/* Distribución de ventas por categoría */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-base font-medium">Ventas por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-60 w-full flex items-center justify-center bg-gray-50 rounded border">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Gráfico de Distribución por Categoría</p>
                      <p className="text-sm text-gray-400">Implementación pendiente</p>
                    </div>
                  </div>
                  
                  <div>
                    {ventasPorCategoria.map((categoria, index) => (
                      <div key={index} className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{categoria.categoria}</span>
                          <span className="text-sm text-gray-500">{formatCurrency(categoria.ventas)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              index === 0 ? 'bg-blue-500' :
                              index === 1 ? 'bg-green-500' :
                              index === 2 ? 'bg-purple-500' :
                              index === 3 ? 'bg-yellow-500' :
                              index === 4 ? 'bg-rose-500' :
                              'bg-gray-500'
                            }`}
                            style={{ width: `${categoria.porcentaje}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Contenido de pestaña Inventario */}
          <TabsContent value="inventario">
            {/* Resumen de inventario */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-sm">Valor del Inventario</p>
                      <h3 className="text-3xl font-bold mt-1">{formatCurrency(28560.50)}</h3>
                      <p className="text-sm text-green-600 mt-1">+5.2% vs mes anterior</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-sm">Rotación de Stock</p>
                      <h3 className="text-3xl font-bold mt-1">6.8</h3>
                      <p className="text-sm text-green-600 mt-1">Rotación saludable</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <RefreshCcw className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-sm">Productos con Stock Crítico</p>
                      <h3 className="text-3xl font-bold mt-1">8</h3>
                      <p className="text-sm text-amber-600 mt-1">Requieren reposición</p>
                    </div>
                    <div className="bg-amber-100 p-3 rounded-full">
                      <AlertCircle className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Productos con baja rotación */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-base font-medium">Productos con Baja Rotación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Actual</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Última Venta</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Días sin Venta</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventarioBajaRotacion.map((producto) => (
                        <tr key={producto.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium">{producto.nombre}</td>
                          <td className="px-4 py-3 text-center text-sm">{producto.stock}</td>
                          <td className="px-4 py-3 text-center text-sm">{formatDate(producto.ultimaVenta)}</td>
                          <td className="px-4 py-3 text-center text-sm">{producto.diasSinVenta}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge 
                              className={
                                producto.diasSinVenta > 60 ? "bg-red-100 text-red-800 border-red-300" :
                                producto.diasSinVenta > 30 ? "bg-amber-100 text-amber-800 border-amber-300" :
                                "bg-blue-100 text-blue-800 border-blue-300"
                              }
                            >
                              {producto.diasSinVenta > 60 ? "Crítico" : 
                               producto.diasSinVenta > 30 ? "Preocupante" : 
                               "Atención"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            {/* Valor del inventario por categoría */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-base font-medium">Valor de Inventario por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-60 w-full flex items-center justify-center bg-gray-50 rounded border">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Distribución del valor del inventario</p>
                      <p className="text-sm text-gray-400">Implementación pendiente</p>
                    </div>
                  </div>
                  
                  <div>
                    {ventasPorCategoria.map((categoria, index) => (
                      <div key={index} className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{categoria.categoria}</span>
                          <span className="text-sm text-gray-500">{formatCurrency(categoria.ventas * 0.65)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              index === 0 ? 'bg-blue-500' :
                              index === 1 ? 'bg-green-500' :
                              index === 2 ? 'bg-purple-500' :
                              index === 3 ? 'bg-yellow-500' :
                              index === 4 ? 'bg-rose-500' :
                              'bg-gray-500'
                            }`}
                            style={{ width: `${categoria.porcentaje}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Contenido de pestaña Clientes */}
          <TabsContent value="clientes">
            {/* Resumen de clientes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                      <p className="text-gray-500 text-sm">Tasa de Retención</p>
                      <h3 className="text-3xl font-bold mt-1">92.5%</h3>
                      <p className="text-sm text-green-600 mt-1">+1.2% vs mes anterior</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-sm">Valor Cliente Promedio</p>
                      <h3 className="text-3xl font-bold mt-1">{formatCurrency(325.80)}</h3>
                      <p className="text-sm text-green-600 mt-1">+8.3% este trimestre</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <DollarSign className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Clientes más valiosos */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-base font-medium">Clientes Más Valiosos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Compras</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Gastado</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Última Compra</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientesValiosos.map((cliente) => (
                        <tr key={cliente.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium">{cliente.nombre}</td>
                          <td className="px-4 py-3 text-center text-sm">{cliente.compras}</td>
                          <td className="px-4 py-3 text-right text-sm font-medium">{formatCurrency(cliente.totalGastado)}</td>
                          <td className="px-4 py-3 text-center text-sm">{formatDate(cliente.ultimaCompra)}</td>
                          <td className="px-4 py-3 text-center">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
            
            {/* Distribución de clientes por frecuencia */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-base font-medium">Segmentación de Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-60 w-full flex items-center justify-center bg-gray-50 rounded border">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Distribución por tipo de cliente</p>
                      <p className="text-sm text-gray-400">Implementación pendiente</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 border rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">Clientes VIP</h3>
                        <Badge className="bg-purple-100 text-purple-800 border-purple-300">12% de clientes</Badge>
                      </div>
                      <p className="text-sm text-gray-500">Clientes con más de 15 compras y ticket promedio alto</p>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-sm">18 clientes</span>
                        <span className="text-sm font-medium">{formatCurrency(12500.25)} en compras</span>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">Clientes Frecuentes</h3>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300">30% de clientes</Badge>
                      </div>
                      <p className="text-sm text-gray-500">Clientes con 5-15 compras en los últimos 3 meses</p>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-sm">45 clientes</span>
                        <span className="text-sm font-medium">{formatCurrency(18750.50)} en compras</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ReportsPage;