
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
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/config";
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const DashboardPage: React.FC = () => {
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

  // Fetch productos
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

  // Fetch pedidos
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

  // Calcular métricas principales
  const calculateMetrics = () => {
    const boletasEmitidas = boletas.filter(b => b.boleta_estado === 'Emitido');
    const totalVentas = boletasEmitidas.reduce((sum, b) => sum + parseFloat(b.boleta_total || 0), 0);
    const ordenesCompletadas = boletasEmitidas.length;
    const ticketPromedio = ordenesCompletadas > 0 ? totalVentas / ordenesCompletadas : 0;

    // Calcular clientes únicos
    const clientesUnicos = new Set(
        boletasEmitidas
            .filter(b => b.pedido?.cli_id)
            .map(b => b.pedido.cli_id)
    ).size;

    // Calcular clientes recurrentes (más de 1 compra)
    const clientesContador = new Map();
    boletasEmitidas.forEach(b => {
      if (b.pedido?.cli_id) {
        const count = clientesContador.get(b.pedido.cli_id) || 0;
        clientesContador.set(b.pedido.cli_id, count + 1);
      }
    });

    const clientesRecurrentes = Array.from(clientesContador.values()).filter(count => count > 1).length;
    const porcentajeRecurrentes = clientesUnicos > 0 ? (clientesRecurrentes / clientesUnicos) * 100 : 0;

    return {
      ventasTotales: totalVentas,
      ordenesCompletadas,
      ticketPromedio,
      clientesRecurrentes: porcentajeRecurrentes
    };
  };

  // Generar datos de ventas por semana (últimas 5 semanas)
  const getVentasPorSemana = () => {
    const semanas = [];
    const ahora = new Date();

    for (let i = 4; i >= 0; i--) {
      const inicioSemana = new Date(ahora);
      inicioSemana.setDate(ahora.getDate() - (i * 7));
      const finSemana = new Date(inicioSemana);
      finSemana.setDate(inicioSemana.getDate() + 6);

      const ventasSemana = boletas
          .filter(b => {
            if (b.boleta_estado !== 'Emitido') return false;
            const fechaBoleta = new Date(b.boleta_fecha);
            return fechaBoleta >= inicioSemana && fechaBoleta <= finSemana;
          })
          .reduce((sum, b) => sum + parseFloat(b.boleta_total || 0), 0);

      semanas.push({
        nombre: `Semana ${5 - i}`,
        ventas: Math.round(ventasSemana)
      });
    }

    return semanas;
  };

  // Generar datos de ganancias por mes (últimos 7 meses)
  const getGananciasPorMes = () => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const ganancias = [];
    const ahora = new Date();

    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const mes = fecha.getMonth();
      const año = fecha.getFullYear();

      const gananciasMes = boletas
          .filter(b => {
            if (b.boleta_estado !== 'Emitido') return false;
            const fechaBoleta = new Date(b.boleta_fecha);
            return fechaBoleta.getMonth() === mes && fechaBoleta.getFullYear() === año;
          })
          .reduce((sum, b) => sum + parseFloat(b.boleta_total || 0), 0);

      ganancias.push({
        mes: meses[mes],
        ganancias: Math.round(gananciasMes)
      });
    }

    return ganancias;
  };

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
        .map(([name, ventas]) => ({
          name,
          value: totalVentas > 0 ? Math.round((ventas / totalVentas) * 100) : 0
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
  };

  // Calcular productos más vendidos
  const getProductosMasVendidos = () => {
    const productosConVentas = productos.map(producto => {
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
        ingreso: ingresos,
        stock: parseFloat(producto.pro_stock || 0),
        sku: producto.prod_id
      };
    })
        .filter(p => p.ventas > 0)
        .sort((a, b) => b.ventas - a.ventas)
        .slice(0, 5);

    return productosConVentas;
  };

  // Calcular inventario bajo
  const getInventarioBajo = () => {
    return productos
        .filter(p => {
          const stock = parseFloat(p.pro_stock || 0);
          return stock > 0 && stock < 20; // Consideramos bajo stock menos de 20 unidades
        })
        .map(p => ({
          id: p.prod_id,
          nombre: p.pro_nombre,
          actual: parseFloat(p.pro_stock || 0),
          minimo: 20, // Valor de referencia
          sku: p.prod_id
        }))
        .sort((a, b) => a.actual - b.actual)
        .slice(0, 4);
  };

  // Calcular últimos pedidos
  const getUltimosPedidos = () => {
    return boletas
        .filter(b => b.pedido)
        .sort((a, b) => new Date(b.boleta_fecha).getTime() - new Date(a.boleta_fecha).getTime())
        .slice(0, 5)
        .map(boleta => ({
          id: boleta.boleta_numero,
          cliente: boleta.pedido.cli_nombre || `Cliente ${boleta.pedido.cli_id}`,
          fecha: new Date(boleta.boleta_fecha).toLocaleDateString('es-ES'),
          total: parseFloat(boleta.boleta_total || 0),
          estado: boleta.boleta_estado === 'Emitido' ? 'Entregado' :
              boleta.boleta_estado === 'Anulado' ? 'Cancelado' :
                  boleta.boleta_estado,
          items: boleta.pedido.detalles ? boleta.pedido.detalles.length : 0
        }));
  };

  const metrics = calculateMetrics();
  const ventasPorSemana = getVentasPorSemana();
  const gananciasPorMes = getGananciasPorMes();
  const ventasPorCategoria = getVentasPorCategoria();
  const productosMasVendidos = getProductosMasVendidos();
  const inventarioBajo = getInventarioBajo();
  const ultimosPedidos = getUltimosPedidos();

  if (boletasLoading || productosLoading || pedidosLoading) {
    return (
        <MainLayout>
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-500">Cargando dashboard...</p>
              </div>
            </div>
          </div>
        </MainLayout>
    );
  }

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

          {/* Resumen de Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ventas Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <WalletIcon className="mr-2 h-4 w-4 text-primary" />
                  <div className="text-2xl font-bold">{formatCurrency(metrics.ventasTotales)}</div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  <span className="text-green-500">↑ Total</span> de todas las boletas emitidas
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
                  <div className="text-2xl font-bold">{metrics.ordenesCompletadas}</div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  <span className="text-green-500">↑ Total</span> de boletas emitidas
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
                  <div className="text-2xl font-bold">{formatCurrency(metrics.ticketPromedio)}</div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  <span className="text-blue-500">→ Promedio</span> por venta realizada
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
                  <div className="text-2xl font-bold">{metrics.clientesRecurrentes.toFixed(1)}%</div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  <span className="text-purple-500">→ Porcentaje</span> de clientes que repiten
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
                <CardDescription>Ganancias mensuales de los últimos meses</CardDescription>
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
                            <Badge variant={producto.stock < 10 ? "outline" : "default"}
                                   className={producto.stock < 10 ? "bg-yellow-100 hover:bg-yellow-100 text-yellow-800 border-yellow-400" : ""}>
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
                          label={({ name, value }) => `${name}: ${value}%`}
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
                  <CardDescription>Últimas boletas emitidas</CardDescription>
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
