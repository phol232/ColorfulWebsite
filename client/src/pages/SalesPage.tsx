import React, { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search as SearchIcon,
  Calendar,
  DollarSign,
  FileText,
  Download,
  Printer,
  CheckCircle,
  CreditCard,
  RefreshCcw,
  X,
  BarChart4,
  UserCircle,
  TrendingUp,
  CircleDollarSign,
  Tag,
  Receipt,
  ShoppingBag,
  Eye,
  Package,
  Edit,
  Trash2,
  Plus,
  Minus,
  User
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Usa la constante recomendada para API_URL
export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
console.log("⚡️ API_URL =", API_URL);

interface Pedido {
  ped_id: string;
  ped_fecha: string;
  ped_estado: string;
  ped_tipo: string;
  ped_forma_entrega: string;
  ped_notas?: string;
  ped_subtotal: number;
  ped_impuestos: number;
  ped_descuento: number;
  ped_total: number;
  cliente?: {
    cli_id: string;
    cli_nombre: string;
    cli_email?: string;
  };
  usuario?: {
    id: number;
    name: string;
  };
  detalles?: Array<{
    det_id: string;
    det_cantidad: number;
    det_precio_unitario: number;
    det_subtotal: number;
    det_impuesto: number;
    det_descuento: number;
    producto?: {
      prod_id: string;
      prod_nombre: string;
      prod_descripcion?: string;
      prod_precio: number;
    };
  }>;
}

interface Cliente {
  cli_id: string;
  cli_nombre: string;
  cli_email?: string;
  cli_telefono?: string;
}

interface Product {
  prod_id: string;
  prod_nombre: string;
  prod_descripcion?: string;
  prod_precio: number;
  prod_stock_actual: number;
}

interface CartItem {
  prod_id: string;
  cantidad: number;
  precio_unitario: number;
}

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

// Genera una referencia para el pedido
const generarReferencia = (pedido: Pedido) => {
  const prefijo = pedido.ped_tipo === "Venta" ? "PED" : "ORD";
  return `${prefijo}-${pedido.ped_id.substring(0, 6)}`;
};

// Función para obtener el color del estado
const getStatusBadge = (estado: string) => {
  switch(estado.toLowerCase()) {
    case "pendiente":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pendiente</Badge>;
    case "procesando":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Procesando</Badge>;
    case "completado":
      return <Badge className="bg-green-100 text-green-800 border-green-300">Completado</Badge>;
    case "cancelado":
      return <Badge className="bg-red-100 text-red-800 border-red-300">Cancelado</Badge>;
    default:
      return <Badge variant="outline">{estado}</Badge>;
  }
};

// Función para calcular estadísticas
const calcularEstadisticas = (pedidos: Pedido[]) => {
  const totalVentas = pedidos.reduce((acc, pedido) => acc + pedido.ped_total, 0);
  const gananciaTotal = pedidos.reduce((acc, pedido) => {
    // Calculamos ganancia aproximada basada en un margen del 35%
    const margen = pedido.ped_subtotal * 0.35;
    return acc + margen;
  }, 0);
  const margenPromedio = totalVentas > 0 ? (gananciaTotal / totalVentas) * 100 : 0;

  // Ventas por forma de entrega
  const ventasPorForma: {[key: string]: number} = {};
  pedidos.forEach(pedido => {
    ventasPorForma[pedido.ped_forma_entrega] = (ventasPorForma[pedido.ped_forma_entrega] || 0) + pedido.ped_total;
  });

  const formasEntrega = Object.entries(ventasPorForma)
      .sort((a, b) => b[1] - a[1])
      .map(([forma, monto]) => ({ forma, monto }));

  return {
    totalVentas,
    gananciaTotal,
    margenPromedio,
    formasEntrega,
    totalTransacciones: pedidos.length
  };
};

const SalesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [detailsOpen, setDetailsOpen] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState<string | null>(null);

  // Estados para edición
  const [editingPedido, setEditingPedido] = useState<Pedido | null>(null);
  const [clienteSearch, setClienteSearch] = useState("");
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [formaEntrega, setFormaEntrega] = useState("");
  const [notas, setNotas] = useState("");
  const [estado, setEstado] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pedidos from backend
  const { data: pedidos = [], isLoading, refetch } = useQuery<Pedido[]>({
    queryKey: ['/api/pedidos'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/pedidos`);
      if (!response.ok) throw new Error('Error fetching orders');
      const data = await response.json();
      return data.data || data;
    }
  });

  // Fetch clientes
  const { data: clientes = [] } = useQuery<Cliente[]>({
    queryKey: ['/api/clientes', clienteSearch],
    queryFn: async () => {
      if (!clienteSearch || clienteSearch.length < 2) return [];
      const response = await fetch(`${API_URL}/api/clientes?search=${clienteSearch}`);
      if (!response.ok) throw new Error('Error fetching clients');
      const data = await response.json();
      return data.data || data;
    },
    enabled: clienteSearch.length >= 2
  });

  // Fetch productos
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/productos', productSearch],
    queryFn: async () => {
      if (!productSearch || productSearch.length < 2) return [];
      const response = await fetch(`${API_URL}/api/productos?search=${productSearch}`);
      if (!response.ok) throw new Error('Error fetching products');
      const data = await response.json();
      return data.data || data;
    },
    enabled: productSearch.length >= 2
  });

  // Mutation para actualizar pedido
  const updatePedidoMutation = useMutation({
    mutationFn: async ({ pedidoId, data }: { pedidoId: string; data: any }) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/pedidos/${pedidoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Error updating order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pedidos'] });
      toast({
        title: "Pedido actualizado",
        description: "El pedido se ha actualizado correctamente."
      });
      setEditOpen(null);
      resetEditForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar el pedido",
        variant: "destructive"
      });
    }
  });

  // Mutation para eliminar pedido
  const deletePedidoMutation = useMutation({
    mutationFn: async (pedidoId: string) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/pedidos/${pedidoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Error deleting order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pedidos'] });
      toast({
        title: "Pedido eliminado",
        description: "El pedido se ha eliminado correctamente."
      });
      setDeleteOpen(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar el pedido",
        variant: "destructive"
      });
    }
  });

  // Estadísticas de pedidos
  const estadisticas = calcularEstadisticas(pedidos);

  // Filtrar pedidos según los criterios actuales
  const filteredPedidos = pedidos.filter(pedido => {
    // Filtro por búsqueda
    if (searchQuery && !pedido.cliente?.cli_nombre.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Filtro por estado
    if (statusFilter && statusFilter !== "todos" && pedido.ped_estado !== statusFilter) {
      return false;
    }

    return true;
  });

  // Funciones para manejar la edición
  const openEditDialog = (pedido: Pedido) => {
    setEditingPedido(pedido);
    setSelectedCliente(pedido.cliente || null);
    setClienteSearch(pedido.cliente?.cli_nombre || "");
    setFormaEntrega(pedido.ped_forma_entrega);
    setNotas(pedido.ped_notas || "");
    setEstado(pedido.ped_estado);
    setCartItems(pedido.detalles?.map(d => ({
      prod_id: d.producto?.prod_id || '',
      cantidad: d.det_cantidad,
      precio_unitario: d.det_precio_unitario
    })) || []);
    setEditOpen(pedido.ped_id);
  };

  const resetEditForm = () => {
    setEditingPedido(null);
    setSelectedCliente(null);
    setClienteSearch("");
    setProductSearch("");
    setCartItems([]);
    setFormaEntrega("");
    setNotas("");
    setEstado("");
  };

  const addProductToCart = (product: Product) => {
    const existingItem = cartItems.find(item => item.prod_id === product.prod_id);

    if (existingItem) {
      setCartItems(cartItems.map(item =>
          item.prod_id === product.prod_id
              ? { ...item, cantidad: item.cantidad + 1 }
              : item
      ));
    } else {
      setCartItems([...cartItems, {
        prod_id: product.prod_id,
        cantidad: 1,
        precio_unitario: product.prod_precio
      }]);
    }
    setProductSearch("");
  };

  const updateCartItemQuantity = (prod_id: string, cantidad: number) => {
    if (cantidad <= 0) {
      setCartItems(cartItems.filter(item => item.prod_id !== prod_id));
    } else {
      setCartItems(cartItems.map(item =>
          item.prod_id === prod_id ? { ...item, cantidad } : item
      ));
    }
  };

  const removeCartItem = (prod_id: string) => {
    setCartItems(cartItems.filter(item => item.prod_id !== prod_id));
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((acc, item) => acc + (item.cantidad * item.precio_unitario), 0);
    const impuestos = subtotal * 0.16; // 16% de impuestos
    const total = subtotal + impuestos;
    return { subtotal, impuestos, total };
  };

  const handleUpdatePedido = () => {
    if (!editingPedido || !selectedCliente || cartItems.length === 0) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    const { subtotal, impuestos, total } = calculateTotal();

    const updateData = {
      cliente_nombre: selectedCliente.cli_nombre,
      forma_entrega: formaEntrega,
      notas: notas,
      estado: estado,
      subtotal: subtotal,
      impuestos: impuestos,
      total: total,
      items: cartItems.map(item => ({
        prod_id: item.prod_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario
      }))
    };

    updatePedidoMutation.mutate({
      pedidoId: editingPedido.ped_id,
      data: updateData
    });
  };

  const handleDeletePedido = (pedidoId: string) => {
    deletePedidoMutation.mutate(pedidoId);
  };

  // Función para reimprimir comprobante
  const handleReimprimir = (ped_id: string) => {
    toast({
      title: "Reimprimiendo comprobante",
      description: `El comprobante del pedido ${ped_id} se está imprimiendo.`
    });
  };

  // Función para descargar comprobante
  const handleDescargar = (ped_id: string) => {
    toast({
      title: "Descargando comprobante",
      description: `El comprobante del pedido ${ped_id} se está descargando.`
    });
  };

  if (isLoading) {
    return (
        <MainLayout>
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-500">Cargando pedidos...</p>
              </div>
            </div>
          </div>
        </MainLayout>
    );
  }

  return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">PEDIDOS</h1>
              <p className="text-gray-500">Registro de todos los pedidos del sistema</p>
            </div>

            {/* Dashboard de métricas horizontal */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 md:mt-0">
              <div className="bg-background border rounded-md p-2 shadow-sm">
                <div className="text-xs text-muted-foreground mb-1">Total Pedidos</div>
                <div className="text-base font-semibold">{formatCurrency(estadisticas.totalVentas)}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <CircleDollarSign className="mr-1 h-3 w-3 text-primary" />
                  <span>{estadisticas.totalTransacciones} pedidos</span>
                </div>
              </div>

              <div className="bg-background border rounded-md p-2 shadow-sm">
                <div className="text-xs text-muted-foreground mb-1">Ganancia Est.</div>
                <div className="text-base font-semibold text-green-600">{formatCurrency(estadisticas.gananciaTotal)}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span>Margen del {estadisticas.margenPromedio.toFixed(1)}%</span>
                </div>
              </div>

              <div className="bg-background border rounded-md p-2 shadow-sm">
                <div className="text-xs text-muted-foreground mb-1">Entrega Principal</div>
                <div className="text-base font-semibold">
                  {estadisticas.formasEntrega.length > 0 ? estadisticas.formasEntrega[0].forma : "N/A"}
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <ShoppingBag className="mr-1 h-3 w-3 text-primary" />
                  <span>
                  {estadisticas.formasEntrega.length > 0
                      ? formatCurrency(estadisticas.formasEntrega[0].monto)
                      : "Sin datos"}
                </span>
                </div>
              </div>

              <div className="bg-background border rounded-md p-2 shadow-sm">
                <div className="text-xs text-muted-foreground mb-1">Promedio por Pedido</div>
                <div className="text-base font-semibold">
                  {formatCurrency(estadisticas.totalVentas / Math.max(1, estadisticas.totalTransacciones))}
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Receipt className="mr-1 h-3 w-3 text-primary" />
                  <span>Por transacción</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros y Buscador */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                  type="text"
                  placeholder="Buscar por cliente..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    {statusFilter === "todos" ? "Estado" : statusFilter}
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Procesando">Procesando</SelectItem>
                  <SelectItem value="Completado">Completado</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Fecha</span>
              </Button>

              <Button variant="outline" className="flex items-center gap-2" onClick={() => {
                setSearchQuery("");
                setStatusFilter("todos");
                refetch();
              }}>
                <RefreshCcw className="h-4 w-4" />
                <span>Actualizar</span>
              </Button>
            </div>
          </div>

          {/* Tarjetas de pedidos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPedidos.map((pedido) => {
              const fechaFormateada = formatDate(pedido.ped_fecha);
              const referencia = generarReferencia(pedido);

              return (
                  <Card key={pedido.ped_id} className="overflow-hidden">
                    <CardHeader className="pb-2 border-b">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-base">{referencia}</CardTitle>
                          <CardDescription>{fechaFormateada}</CardDescription>
                        </div>
                        {getStatusBadge(pedido.ped_estado)}
                      </div>
                    </CardHeader>

                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <UserCircle className="h-5 w-5 text-gray-400" />
                            <div>
                              <div className="font-medium">{pedido.cliente?.cli_nombre || 'Cliente'}</div>
                              <div className="text-xs text-gray-500">{pedido.ped_forma_entrega}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-primary">{formatCurrency(pedido.ped_total)}</div>
                            <div className="text-xs text-gray-500">{pedido.ped_tipo}</div>
                          </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">Subtotal</div>
                            <div className="font-medium">{formatCurrency(pedido.ped_subtotal)}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Impuestos</div>
                            <div className="font-medium">{formatCurrency(pedido.ped_impuestos)}</div>
                          </div>
                          {pedido.ped_descuento > 0 && (
                              <>
                                <div>
                                  <div className="text-gray-500">Descuento</div>
                                  <div className="font-medium text-red-600">-{formatCurrency(pedido.ped_descuento)}</div>
                                </div>
                              </>
                          )}
                        </div>

                        {pedido.ped_notas && (
                            <div>
                              <div className="text-sm text-gray-500">Notas</div>
                              <div className="text-sm">{pedido.ped_notas}</div>
                            </div>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="pt-2 pb-4 border-t">
                      <div className="w-full flex justify-between">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-orange-500 hover:text-orange-600"
                            onClick={() => setDetailsOpen(detailsOpen === pedido.ped_id ? null : pedido.ped_id)}
                        >
                          <Eye className="h-4 w-4 mr-2" /> Ver detalles
                        </Button>
                        <div className="flex gap-2">
                          <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openEditDialog(pedido)}
                              className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setDeleteOpen(pedido.ped_id)}
                              className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleReimprimir(pedido.ped_id)}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDescargar(pedido.ped_id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
              );
            })}
          </div>

          {filteredPedidos.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Receipt className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500">No se encontraron pedidos</p>
                <p className="text-sm text-gray-400">Los pedidos aparecerán aquí cuando se creen desde el POS</p>
              </div>
          )}
        </div>

        {/* Modal de Detalles */}
        {pedidos.map((pedido) => (
            <Dialog key={`detail-${pedido.ped_id}`} open={detailsOpen === pedido.ped_id} onOpenChange={() => setDetailsOpen(null)}>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle>Detalles del Pedido {generarReferencia(pedido)}</DialogTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setDetailsOpen(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <DialogDescription>
                    {formatDate(pedido.ped_fecha)}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Información general */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Cliente</div>
                      <div className="font-medium">{pedido.cliente?.cli_nombre || 'Cliente'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Estado</div>
                      {getStatusBadge(pedido.ped_estado)}
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Forma de Entrega</div>
                      <div className="font-medium">{pedido.ped_forma_entrega}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Tipo</div>
                      <div className="font-medium">{pedido.ped_tipo}</div>
                    </div>
                  </div>

                  {/* Productos */}
                  {pedido.detalles && pedido.detalles.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Productos</h4>
                        <div className="space-y-2">
                          {pedido.detalles.map((detalle) => (
                              <div key={detalle.det_id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-gray-400" />
                                  <div>
                                    <div className="font-medium text-sm">{detalle.producto?.prod_nombre}</div>
                                    <div className="text-xs text-gray-500">
                                      {detalle.det_cantidad} x {formatCurrency(detalle.det_precio_unitario)}
                                    </div>
                                  </div>
                                </div>
                                <div className="font-medium">
                                  {formatCurrency(detalle.det_subtotal)}
                                </div>
                              </div>
                          ))}
                        </div>
                      </div>
                  )}

                  {/* Notas */}
                  {pedido.ped_notas && (
                      <div>
                        <div className="text-sm text-gray-500">Notas</div>
                        <div className="text-sm bg-gray-50 p-2 rounded">{pedido.ped_notas}</div>
                      </div>
                  )}

                  {/* Resumen financiero */}
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <div className="text-sm">Subtotal</div>
                      <div>{formatCurrency(pedido.ped_subtotal)}</div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm">Impuestos</div>
                      <div>{formatCurrency(pedido.ped_impuestos)}</div>
                    </div>

                    {pedido.ped_descuento > 0 && (
                        <div className="flex justify-between items-center text-red-600">
                          <div className="text-sm">Descuento</div>
                          <div>-{formatCurrency(pedido.ped_descuento)}</div>
                        </div>
                    )}

                    <div className="flex justify-between items-center font-bold border-t pt-2">
                      <div>Total</div>
                      <div>{formatCurrency(pedido.ped_total)}</div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReimprimir(pedido.ped_id)}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Imprimir
                    </Button>

                    <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleDescargar(pedido.ped_id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
        ))}

        {/* Modal de Edición */}
        <Dialog open={editOpen !== null} onOpenChange={() => setEditOpen(null)}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Pedido</DialogTitle>
              <DialogDescription>
                Modifica la información del pedido
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna izquierda - Información del pedido */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cliente">Cliente *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        id="cliente"
                        placeholder="Buscar cliente..."
                        value={selectedCliente ? selectedCliente.cli_nombre : clienteSearch}
                        onChange={(e) => {
                          setClienteSearch(e.target.value);
                          setSelectedCliente(null);
                        }}
                        className="pl-9"
                    />
                  </div>

                  {/* Lista de clientes encontrados */}
                  {clientes.length > 0 && !selectedCliente && (
                      <div className="mt-2 border rounded-md max-h-32 overflow-y-auto">
                        {clientes.map((cliente) => (
                            <button
                                key={cliente.cli_id}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b last:border-b-0"
                                onClick={() => {
                                  setSelectedCliente(cliente);
                                  setClienteSearch(cliente.cli_nombre);
                                }}
                            >
                              <div className="font-medium">{cliente.cli_nombre}</div>
                              {cliente.cli_email && (
                                  <div className="text-sm text-gray-500">{cliente.cli_email}</div>
                              )}
                            </button>
                        ))}
                      </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="forma-entrega">Forma de Entrega</Label>
                  <Select value={formaEntrega} onValueChange={setFormaEntrega}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar forma de entrega" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mostrador">Mostrador</SelectItem>
                      <SelectItem value="Para Llevar">Para Llevar</SelectItem>
                      <SelectItem value="Delivery">Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Select value={estado} onValueChange={setEstado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="Procesando">Procesando</SelectItem>
                      <SelectItem value="Completado">Completado</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notas">Notas</Label>
                  <Textarea
                      id="notas"
                      placeholder="Notas adicionales..."
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                  />
                </div>

                {/* Buscador de productos */}
                <div>
                  <Label htmlFor="producto">Agregar Producto</Label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        id="producto"
                        placeholder="Buscar producto..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="pl-9"
                    />
                  </div>

                  {/* Lista de productos encontrados */}
                  {products.length > 0 && (
                      <div className="mt-2 border rounded-md max-h-32 overflow-y-auto">
                        {products.map((product) => (
                            <button
                                key={product.prod_id}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b last:border-b-0"
                                onClick={() => addProductToCart(product)}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium">{product.prod_nombre}</div>
                                  <div className="text-sm text-gray-500">
                                    Stock: {product.prod_stock_actual} | {formatCurrency(product.prod_precio)}
                                  </div>
                                </div>
                                <Plus className="h-4 w-4 text-green-600" />
                              </div>
                            </button>
                        ))}
                      </div>
                  )}
                </div>
              </div>

              {/* Columna derecha - Productos en el carrito */}
              <div className="space-y-4">
                <h3 className="font-medium">Productos del Pedido</h3>

                {cartItems.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>No hay productos en el pedido</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {cartItems.map((item) => {
                        const product = products.find(p => p.prod_id === item.prod_id);
                        const productName = product?.prod_nombre || `Producto ${item.prod_id}`;

                        return (
                            <div key={item.prod_id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                              <div className="flex-1">
                                <div className="font-medium text-sm">{productName}</div>
                                <div className="text-xs text-gray-500">
                                  {formatCurrency(item.precio_unitario)} c/u
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => updateCartItemQuantity(item.prod_id, item.cantidad - 1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>

                                <span className="w-8 text-center text-sm">{item.cantidad}</span>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => updateCartItemQuantity(item.prod_id, item.cantidad + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>

                              <div className="text-sm font-medium min-w-[60px] text-right">
                                {formatCurrency(item.cantidad * item.precio_unitario)}
                              </div>

                              <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6 text-red-600 hover:text-red-700"
                                  onClick={() => removeCartItem(item.prod_id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                        );
                      })}
                    </div>
                )}

                {/* Resumen de totales */}
                {cartItems.length > 0 && (
                    <div className="space-y-2 pt-4 border-t">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(calculateTotal().subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Impuestos (16%):</span>
                        <span>{formatCurrency(calculateTotal().impuestos)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>{formatCurrency(calculateTotal().total)}</span>
                      </div>
                    </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(null)}>
                Cancelar
              </Button>
              <Button
                  onClick={handleUpdatePedido}
                  disabled={updatePedidoMutation.isPending || !selectedCliente || cartItems.length === 0}
              >
                {updatePedidoMutation.isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Confirmación de Eliminación */}
        <Dialog open={deleteOpen !== null} onOpenChange={() => setDeleteOpen(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmar Eliminación</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteOpen(null)}>
                Cancelar
              </Button>
              <Button
                  variant="destructive"
                  onClick={() => deleteOpen && handleDeletePedido(deleteOpen)}
                  disabled={deletePedidoMutation.isPending}
              >
                {deletePedidoMutation.isPending ? "Eliminando..." : "Eliminar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </MainLayout>
  );
}

export default SalesPage;
