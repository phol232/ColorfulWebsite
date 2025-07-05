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
  Package,
  DollarSign,
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
      const data = await response.json();
      return data.data || data;
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
      const data = await response.json();
      return data.data || data;
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
      const data = await response.json();
      return data.data || data;
    }
  });

  // Fetch top productos más vendidos desde el endpoint de reportes
  const { data: topProductosReporte = [] } = useQuery<any[]>({
    queryKey: ['/api/reportes/top-productos'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/reportes/top-productos`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) throw new Error('Error fetching top products');
      return await response.json();
    }
  });

  // Fetch ventas por categoría desde el endpoint de reportes
  const { data: ventasPorCategoriaReporte = [] } = useQuery<any[]>({
    queryKey: ['/api/reportes/ventas-por-categoria'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/reportes/ventas-por-categoria`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) throw new Error('Error fetching sales by category');
      return await response.json();
    }
  });

  // 1. Obtener datos del dashboard desde el endpoint consolidado
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['/api/reportes/consolidados'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/reportes/consolidados`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) throw new Error('Error fetching dashboard report');
      const data = await response.json();
      return data.data;
    }
  });

  // 2. Usar los datos del dashboard en las tarjetas principales
  const metrics = dashboardData ? {
    ventasTotales: dashboardData.ingresos_totales?.ingresos_totales || 0,
    valorInventario: dashboardData.valor_inventario?.valor_total_inventario || 0,
    productoMasVendido: dashboardData.producto_mas_vendido?.pro_nombre || '',
    productoMasVendidoUnidades: dashboardData.producto_mas_vendido?.total_vendido || 0,
    // Puedes agregar más KPIs si lo deseas
  } : {
    ventasTotales: 0,
    valorInventario: 0,
    productoMasVendido: '',
    productoMasVendidoUnidades: 0,
  };

  // Calcular métricas principales
  const calculateMetrics = () => {
    // Usar comparación case-insensitive para boletas emitidas
    const boletasEmitidas = boletas.filter(b => 
      b.boleta_estado?.toLowerCase() === 'emitido' || 
      b.boleta_estado?.toLowerCase() === 'emitida'
    );
    const totalVentas = boletasEmitidas.reduce((sum, b) => sum + parseFloat(b.boleta_total || 0), 0);

    // Para órdenes completadas, usar pedidos con estado "completado"
    const ordenesCompletadas = pedidos.filter(p => 
      p.ped_estado?.toLowerCase() === 'completado' ||
      p.ped_estado?.toLowerCase() === 'entregado'
    ).length;

    const ticketPromedio = boletasEmitidas.length > 0 ? totalVentas / boletasEmitidas.length : 0;

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
      clientesRecurrentes: porcentajeRecurrentes,
      boletasEmitidas: boletasEmitidas.length
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
          if (b.boleta_estado?.toLowerCase() !== 'emitido' && b.boleta_estado?.toLowerCase() !== 'emitida') return false;
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
          if (b.boleta_estado?.toLowerCase() !== 'emitido' && b.boleta_estado?.toLowerCase() !== 'emitida') return false;
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
    // Si tenemos datos del reporte, usamos esos, sino calculamos manualmente
    if (ventasPorCategoriaReporte.length > 0) {
      const totalVentas = ventasPorCategoriaReporte.reduce((sum, cat) => sum + parseFloat(cat.total_vendido), 0);

      return ventasPorCategoriaReporte.slice(0, 5).map(categoria => ({
        name: categoria.cat_nombre,
        value: totalVentas > 0 ? Math.round((parseFloat(categoria.total_vendido) / totalVentas) * 100) : 0
      }));
    }

    // Fallback al cálculo manual si no hay datos del reporte
    const categorias = new Map();
    let totalVentas = 0;

    boletas
      .filter(b => (b.boleta_estado?.toLowerCase() === 'emitido' || b.boleta_estado?.toLowerCase() === 'emitida') && b.pedido?.detalles)
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
    // Si tenemos datos del reporte, usamos esos, sino calculamos manualmente
    if (topProductosReporte.length > 0) {
      return topProductosReporte.slice(0, 5).map(producto => ({
        id: producto.pro_id,
        nombre: producto.pro_nombre,
        ventas: producto.cantidad_vendida,
        ingreso: producto.total_vendido,
        stock: producto.pro_stock || 0, // Usar el stock del procedimiento almacenado
        sku: producto.pro_id
      }));
    }

    // Fallback al cálculo manual si no hay datos del reporte
    const productosConVentas = productos.map(producto => {
      const ventasCount = boletas
        .filter(b => (b.boleta_estado?.toLowerCase() === 'emitido' || b.boleta_estado?.toLowerCase() === 'emitida') && b.pedido?.detalles)
        .reduce((count, boleta) => {
          const detalle = boleta.pedido.detalles.find((d: any) => d.prod_id === producto.prod_id);
          return count + (detalle ? detalle.det_cantidad : 0);
        }, 0);

      const ingresos = boletas
        .filter(b => (b.boleta_estado?.toLowerCase() === 'emitido' || b.boleta_estado?.toLowerCase() === 'emitida') && b.pedido?.detalles)
        .reduce((total, boleta) => {
          const detalle = boleta.pedido.detalles.find((d: any) => d.prod_id === producto.prod_id);
          return total + (detalle ? detalle.det_cantidad * (detalle.det_precio_unitario || detalle.det_precio) : 0);
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

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    });
  };

  const ventasPorSemana = getVentasPorSemana();
  const gananciasPorMes = getGananciasPorMes();
  const ventasPorCategoria = getVentasPorCategoria();
  const productosMasVendidos = getProductosMasVendidos();
  const inventarioBajo = getInventarioBajo();
  const ultimosPedidos = getUltimosPedidos();

  if (boletasLoading || productosLoading || pedidosLoading || dashboardLoading) {
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
      <div className="container mx-auto px-4 py-6 bg-background dark:bg-background">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Panel de Control</h1>
          <p className="text-gray-500 dark:text-gray-400">Administra tu negocio, analiza métricas y toma decisiones estratégicas</p>
        </div>

        {/* Título de Vista General */}
        <div className="mb-6 pb-3 border-b">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Vista General</h2>
        </div>

        {/* Resumen de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Ventas Totales */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <WalletIcon className="mr-2 h-5 w-5 text-blue-400" />
                <div className="text-2xl font-bold">{formatCurrency(Number(dashboardData?.ingresos_totales?.ingresos_totales) || 0)}</div>
              </div>
              <p className="text-xs text-green-600 mt-2">↑ Total de todas las boletas emitidas</p>
            </CardContent>
          </Card>
          {/* Órdenes Completadas */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Órdenes Completadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Package2Icon className="mr-2 h-5 w-5 text-blue-400" />
                <div className="text-2xl font-bold">{Number(dashboardData?.resumen_boletas?.reduce((acc: number, b: any) => acc + (b.boleta_estado === 'EMITIDA' ? Number(b.total) : 0), 0)) || 0}</div>
              </div>
              <p className="text-xs text-green-600 mt-2">↑ Total de pedidos completados</p>
            </CardContent>
          </Card>
          {/* Ticket Promedio */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <TrendingUpIcon className="mr-2 h-5 w-5 text-blue-400" />
                <div className="text-2xl font-bold">{formatCurrency(Number(dashboardData?.ingresos_totales?.ingresos_totales) / (Number(dashboardData?.resumen_boletas?.find((b: any) => b.boleta_estado === 'EMITIDA')?.total) || 1))}</div>
              </div>
              <p className="text-xs text-blue-600 mt-2">→ Promedio por venta realizada</p>
            </CardContent>
          </Card>
          {/* Clientes Recurrentes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Clientes Recurrentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-blue-400" />
                <div className="text-2xl font-bold">100.0%</div>
              </div>
              <p className="text-xs text-purple-600 mt-2">→ Porcentaje de clientes que repiten</p>
            </CardContent>
          </Card>
          {/* Valor del Inventario */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Valor del Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Package className="mr-2 h-5 w-5 text-blue-400" />
                <div className="text-2xl font-bold">{formatCurrency(Number(dashboardData?.valor_inventario?.valor_total_inventario) || 0)}</div>
              </div>
              <p className="text-xs text-blue-600 mt-2">→ Valor total en stock</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos y Análisis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-card dark:bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Ventas por Semana</CardTitle>
              <CardDescription className="text-muted-foreground">Resumen de ventas de las últimas 5 semanas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ventasPorSemana}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="nombre" tick={{ fill: 'hsl(var(--foreground))' }} />
                    <YAxis tick={{ fill: 'hsl(var(--foreground))' }} />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, 'Ventas']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                    <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
                    <Bar dataKey="ventas" fill="#60A5FA" name="Ventas ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Tendencia de Ganancias</CardTitle>
              <CardDescription className="text-muted-foreground">Ganancias mensuales de los últimos meses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gananciasPorMes}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="mes" tick={{ fill: 'hsl(var(--foreground))' }} />
                    <YAxis tick={{ fill: 'hsl(var(--foreground))' }} />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, 'Ganancias']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                    <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
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
          <Card className="col-span-2 bg-card dark:bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Productos Más Vendidos</CardTitle>
              <CardDescription className="text-muted-foreground">Top 5 productos con mayor cantidad de ventas</CardDescription>
            </CardHeader>
            <CardContent>
              {productosMasVendidos.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 font-medium text-foreground">Producto</th>
                        <th className="text-left py-3 font-medium text-foreground">Unidades Vendidas</th>
                        <th className="text-left py-3 font-medium text-foreground">Ingresos</th>
                        <th className="text-left py-3 font-medium text-foreground">Stock</th>
                        <th className="text-left py-3 font-medium text-foreground">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosMasVendidos.map((producto, index) => (
                        <tr key={`producto-vendido-${producto.id}-${index}`} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3">
                            <div className="flex items-center">
                              <div className="w-12 h-12 rounded-lg bg-muted dark:bg-muted mr-3 flex items-center justify-center overflow-hidden border border-border">
                                {(() => {
                                  // Si tenemos imagen del reporte, la usamos directamente
                                  const imagenDelReporte = topProductosReporte.find(p => p.pro_id === producto.id)?.prod_imagen;

                                  if (imagenDelReporte) {
                                    return (
                                      <img
                                        src={imagenDelReporte}
                                        alt={producto.nombre}
                                        className="w-full h-full object-cover"
                                      />
                                    );
                                  }

                                  // Fallback: buscar en productos locales
                                  const productoCompleto = productos.find(p => p.prod_id === producto.id);
                                  return productoCompleto?.detalles?.prod_imagen ? (
                                    <img
                                      src={productoCompleto.detalles.prod_imagen}
                                      alt={producto.nombre}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Package className="h-6 w-6 text-muted-foreground" />
                                  );
                                })()}
                              </div>
                              <div>
                                <div className="font-medium text-foreground">{producto.nombre}</div>
                                <div className="text-xs text-muted-foreground">SKU: {producto.sku}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-foreground">{producto.ventas} unidades</td>
                          <td className="py-3 text-foreground">{formatCurrency(producto.ingreso)}</td>
                          <td className="py-3">
                            <Badge variant={producto.stock < 10 ? "outline" : "default"} 
                              className={producto.stock < 10 ? "bg-yellow-100 hover:bg-yellow-100 text-yellow-800 border-yellow-400 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700" : ""}>
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
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p>No hay productos vendidos</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Distribución de Ventas por Categoría */}
          <Card className="bg-card dark:bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Ventas por Categoría</CardTitle>
              <CardDescription className="text-muted-foreground">Distribución de ventas por tipo de producto</CardDescription>
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
                        <Cell key={`cell-categoria-${index}-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Porcentaje']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4">
                {ventasPorCategoria.length > 0 ? (
                  <ul className="space-y-1">
                    {ventasPorCategoria.map((item, index) => (
                      <li key={`categoria-legend-${index}-${item.name}`} className="flex items-center text-sm text-foreground">
                        <span className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                        {item.name}: {item.value}%
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-muted-foreground text-sm">No hay datos de categorías</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventario y Pedidos Recientes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Inventario Bajo */}
          <Card className="bg-card dark:bg-card border border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Inventario Bajo</CardTitle>
                <CardDescription className="text-muted-foreground">Productos que necesitan reabastecimiento</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Ver todos
              </Button>
            </CardHeader>
            <CardContent>
              {inventarioBajo.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 font-medium text-foreground">Producto</th>
                        <th className="text-left py-3 font-medium text-foreground">Stock Actual</th>
                        <th className="text-left py-3 font-medium text-foreground">Estado</th>
                        <th className="text-left py-3 font-medium text-foreground">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventarioBajo.map((item, index) => (
                        <tr key={`inventario-bajo-${item.id}-${index}`} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3">
                            <div>
                              <div className="font-medium text-foreground">{item.nombre}</div>
                              <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>
                            </div>
                          </td>
                          <td className="py-3 text-foreground">{item.actual} / {item.minimo}</td>
                          <td className="py-3">
                            <Badge variant={item.actual < item.minimo * 0.5 ? "destructive" : "outline"} 
                              className={item.actual < item.minimo * 0.5 ? "" : "bg-yellow-100 hover:bg-yellow-100 text-yellow-800 border-yellow-400 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700"}>
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
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p>No hay productos con stock bajo</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pedidos Recientes */}
          <Card className="bg-card dark:bg-card border border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Pedidos Recientes</CardTitle>
                <CardDescription className="text-muted-foreground">Últimas boletas emitidas</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Ver todos
              </Button>
            </CardHeader>
            <CardContent>
              {ultimosPedidos.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 font-medium text-foreground">ID</th>
                        <th className="text-left py-3 font-medium text-foreground">Cliente</th>
                        <th className="text-left py-3 font-medium text-foreground">Fecha</th>
                        <th className="text-left py-3 font-medium text-foreground">Estado</th>
                        <th className="text-left py-3 font-medium text-foreground">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ultimosPedidos.map((pedido, index) => (
                        <tr key={`pedido-reciente-${pedido.id}-${index}`} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3">
                            <div className="font-medium text-foreground">{pedido.id}</div>
                            <div className="text-xs text-muted-foreground">{pedido.items} items</div>
                          </td>
                          <td className="py-3 text-foreground">{pedido.cliente}</td>
                          <td className="py-3 text-foreground">{pedido.fecha}</td>
                          <td className="py-3">
                            <Badge
                              variant={
                                pedido.estado === "Entregado" ? "default" :
                                pedido.estado === "En proceso" ? "outline" :
                                pedido.estado === "Pendiente" ? "secondary" : "destructive"
                              }
                              className={
                                pedido.estado === "En proceso" ? "bg-blue-100 hover:bg-blue-100 text-blue-800 border-blue-400 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700" :
                                pedido.estado === "Pendiente" ? "bg-yellow-100 hover:bg-yellow-100 text-yellow-800 border-yellow-400 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700" : ""
                              }
                            >
                              {pedido.estado}
                            </Badge>
                          </td>
                          <td className="py-3 text-foreground">{formatCurrency(pedido.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p>No hay pedidos recientes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;