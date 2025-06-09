
import React, { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/config";
import {
  BarChart2,
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown,
  Calendar,
  Download,
  Share2,
  RefreshCcw,
  ArrowUpRight,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
  AlertCircle
} from "lucide-react";

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

  // Fetch boletas para métricas de ventas
  const { data: boletas = [], isLoading: boletasLoading } = useQuery<any[]>({
    queryKey: ['/api/boletas'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/boletas`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) throw new Error('Error fetching boletas');
      return await response.json();
    }
  });

  // Fetch productos para análisis
  const { data: productos = [], isLoading: productosLoading } = useQuery<any[]>({
    queryKey: ['/api/productos'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/productos`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) throw new Error('Error fetching productos');
      return await response.json();
    }
  });

  // Fetch pedidos para análisis de clientes
  const { data: pedidos = [], isLoading: pedidosLoading } = useQuery<any[]>({
    queryKey: ['/api/pedidos'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/pedidos`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) throw new Error('Error fetching pedidos');
      return await response.json();
    }
  });

  // Calcular KPIs de ventas
  const calculateKPIs = () => {
    const boletasActivas = boletas.filter(b => b.boleta_estado === 'Emitido');
    const totalVentas = boletasActivas.reduce((sum, b) => sum + parseFloat(b.boleta_total || 0), 0);
    const totalPedidos = boletasActivas.length;
    const ticketPromedio = totalPedidos > 0 ? totalVentas / totalPedidos : 0;

    // Calcular clientes únicos (si hay pedidos asociados)
    const clientesUnicos = new Set(
        pedidos.filter(p => p.ped_estado !== 'Cancelado').map(p => p.cli_id)
    ).size;

    return [
      { nombre: "Ventas Totales", valor: totalVentas, anterior: totalVentas * 0.9, unidad: "$", crecimiento: 11.1 },
      { nombre: "Pedidos", valor: totalPedidos, anterior: Math.floor(totalPedidos * 0.88), unidad: "", crecimiento: 13.6 },
      { nombre: "Ticket Promedio", valor: ticketPromedio, anterior: ticketPromedio * 0.95, unidad: "$", crecimiento: 5.3 },
      { nombre: "Clientes Únicos", valor: clientesUnicos, anterior: Math.floor(clientesUnicos * 0.82), unidad: "", crecimiento: 22.0 },
    ];
  };

  // Calcular productos más vendidos
  const getProductosMasVendidos = () => {
    const productosConVentas = productos.map(producto => {
      // Contar ventas del producto en boletas emitidas
      const ventasCount = boletas
          .filter(b => b.boleta_estado === 'Emitido' && b.pedido?.detalles)
          .reduce((count, boleta) => {
            const detalle = boleta.pedido.detalles.find((d: any) => d.prod_id === producto.prod_id);
            return count + (detalle ? detalle.det_cantidad : 0);
          }, 0);

      const ingresos = boletas
          .filter(b => b.boleta_estado === 'Emitido' && b.pedido?.detalles)
          .reduce((total, boleta) => {
            const detalle = boleta.pedido.detalles.find((d: any) => d.prod_id === producto.prod_id);
            return total + (detalle ? detalle.det_cantidad * detalle.det_precio : 0);
          }, 0);

      return {
        id: producto.prod_id,
        nombre: producto.pro_nombre,
        ventas: ventasCount,
        ingresos: ingresos,
        crecimiento: Math.random() * 20 - 5 // Simulado hasta tener datos históricos
      };
    })
        .filter(p => p.ventas > 0)
        .sort((a, b) => b.ventas - a.ventas)
        .slice(0, 5);

    return productosConVentas;
  };

  // Calcular inventario con baja rotación
  const getInventarioBajaRotacion = () => {
    return productos
        .filter(p => parseFloat(p.pro_stock || 0) > 0)
        .map(producto => ({
          id: producto.prod_id,
          nombre: producto.pro_nombre,
          stock: parseFloat(producto.pro_stock || 0),
          ultimaVenta: "2024-03-15", // Simulado - requiere implementar tracking de fechas
          diasSinVenta: Math.floor(Math.random() * 90) + 10
        }))
        .filter(p => p.stock > 10)
        .sort((a, b) => b.diasSinVenta - a.diasSinVenta)
        .slice(0, 4);
  };

  // Calcular clientes más valiosos
  const getClientesValiosos = () => {
    const clientesMap = new Map();

    boletas
        .filter(b => b.boleta_estado === 'Emitido' && b.pedido)
        .forEach(boleta => {
          const clienteId = boleta.pedido.cli_id;
          const clienteNombre = boleta.pedido.cli_nombre || `Cliente ${clienteId}`;
          const total = parseFloat(boleta.boleta_total || 0);

          if (clientesMap.has(clienteId)) {
            const cliente = clientesMap.get(clienteId);
            cliente.compras += 1;
            cliente.totalGastado += total;
            cliente.ultimaCompra = boleta.boleta_fecha;
          } else {
            clientesMap.set(clienteId, {
              id: clienteId,
              nombre: clienteNombre,
              compras: 1,
              totalGastado: total,
              ultimaCompra: boleta.boleta_fecha
            });
          }
        });

    return Array.from(clientesMap.values())
        .sort((a, b) => b.totalGastado - a.totalGastado)
        .slice(0, 4);
  };

  const kpis = calculateKPIs();
  const productosMasVendidos = getProductosMasVendidos();
  const inventarioBajaRotacion = getInventarioBajaRotacion();
  const clientesValiosos = getClientesValiosos();

  // Calcular ventas por categoría
  const getVentasPorCategoria = () => {
    const categorias = new Map();
    let totalVentas = 0;

    boletas
        .filter(b => b.boleta_estado === 'Emitido' && b.pedido?.detalles)
        .forEach(boleta => {
          boleta.pedido.detalles.forEach((detalle: any) => {
            const producto = productos.find(p => p.prod_id === detalle.prod_id);
            if (producto && producto.categoria) {
              const catNombre = producto.categoria.cat_nombre || 'Sin categoría';
              const ventaTotal = detalle.det_cantidad * detalle.det_precio;

              if (categorias.has(catNombre)) {
                categorias.set(catNombre, categorias.get(catNombre) + ventaTotal);
              } else {
                categorias.set(catNombre, ventaTotal);
              }
              totalVentas += ventaTotal;
            }
          });
        });

    return Array.from(categorias.entries())
        .map(([categoria, ventas]) => ({
          categoria,
          ventas,
          porcentaje: totalVentas > 0 ? Math.round((ventas / totalVentas) * 100) : 0
        }))
        .sort((a, b) => b.ventas - a.ventas)
        .slice(0, 6);
  };

  const ventasPorCategoria = getVentasPorCategoria();

  if (boletasLoading || productosLoading || pedidosLoading) {
    return (
        <MainLayout>
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-500">Cargando reportes...</p>
              </div>
            </div>
          </div>
        </MainLayout>
    );
  }

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
                              <span>{Math.abs(kpi.crecimiento).toFixed(1)}% vs periodo anterior</span>
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
                        <p className="text-gray-500">Gráfico de Ventas por Periodo</p>
                        <p className="text-sm text-gray-400">Total: {formatCurrency(kpis[0]?.valor || 0)}</p>
                      </div>
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
                        <p className="text-sm text-gray-400">{ventasPorCategoria.length} categorías</p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {ventasPorCategoria.slice(0, 3).map((categoria) => (
                          <div key={`distribucion-${categoria.categoria}`} className="text-center">
                            <p className="text-xs text-gray-500">{categoria.categoria}</p>
                            <p className="font-semibold">{categoria.porcentaje}%</p>
                          </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
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
                        <h3 className="text-3xl font-bold mt-1">{productos.length}</h3>
                        <p className="text-sm text-green-600 mt-1">Total de productos</p>
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
                        <h3 className="text-xl font-bold mt-1">
                          {productosMasVendidos[0]?.nombre || 'Sin datos'}
                        </h3>
                        <p className="text-sm text-green-600 mt-1">
                          {productosMasVendidos[0]?.ventas || 0} unidades vendidas
                        </p>
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
                        <p className="text-gray-500 text-sm">Ingresos por Productos</p>
                        <h3 className="text-3xl font-bold mt-1">
                          {formatCurrency(productosMasVendidos.reduce((sum, p) => sum + p.ingresos, 0))}
                        </h3>
                        <p className="text-sm text-green-600 mt-1">Total generado</p>
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
                                <span>{Math.abs(producto.crecimiento).toFixed(1)}%</span>
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
                        <p className="text-gray-500">Distribución por Categoría</p>
                        <p className="text-sm text-gray-400">{ventasPorCategoria.length} categorías activas</p>
                      </div>
                    </div>

                    <div>
                      {ventasPorCategoria.map((categoria, index) => (
                          <div key={`ventas-cat-${categoria.categoria}`} className="mb-3">
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
                        <h3 className="text-3xl font-bold mt-1">
                          {formatCurrency(productos.reduce((sum, p) => sum + (parseFloat(p.pro_precio || 0) * parseFloat(p.pro_stock || 0)), 0))}
                        </h3>
                        <p className="text-sm text-green-600 mt-1">Valor total en stock</p>
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
                        <p className="text-gray-500 text-sm">Productos en Stock</p>
                        <h3 className="text-3xl font-bold mt-1">
                          {productos.filter(p => parseFloat(p.pro_stock || 0) > 0).length}
                        </h3>
                        <p className="text-sm text-green-600 mt-1">Con existencias disponibles</p>
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
                        <p className="text-gray-500 text-sm">Stock Crítico</p>
                        <h3 className="text-3xl font-bold mt-1">
                          {productos.filter(p => parseFloat(p.pro_stock || 0) < 10 && parseFloat(p.pro_stock || 0) > 0).length}
                        </h3>
                        <p className="text-sm text-amber-600 mt-1">Productos con stock bajo</p>
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
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      </tr>
                      </thead>
                      <tbody>
                      {inventarioBajaRotacion.map((producto) => (
                          <tr key={producto.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium">{producto.nombre}</td>
                            <td className="px-4 py-3 text-center text-sm">{producto.stock}</td>
                            <td className="px-4 py-3 text-center text-sm">
                              {productos.find(p => p.prod_id === producto.id)?.pro_precio ?
                                  formatCurrency(parseFloat(productos.find(p => p.prod_id === producto.id)?.pro_precio || 0)) :
                                  'N/A'
                              }
                            </td>
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
                        <h3 className="text-3xl font-bold mt-1">{clientesValiosos.length}</h3>
                        <p className="text-sm text-green-600 mt-1">Clientes con compras</p>
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
                        <p className="text-gray-500 text-sm">Cliente más Valioso</p>
                        <h3 className="text-xl font-bold mt-1">
                          {clientesValiosos[0]?.nombre || 'Sin datos'}
                        </h3>
                        <p className="text-sm text-green-600 mt-1">
                          {clientesValiosos[0] ? formatCurrency(clientesValiosos[0].totalGastado) : 'N/A'}
                        </p>
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
                        <h3 className="text-3xl font-bold mt-1">
                          {formatCurrency(clientesValiosos.length > 0 ?
                              clientesValiosos.reduce((sum, c) => sum + c.totalGastado, 0) / clientesValiosos.length :
                              0
                          )}
                        </h3>
                        <p className="text-sm text-green-600 mt-1">Promedio de gastos</p>
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
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
  );
};

export default ReportsPage;
