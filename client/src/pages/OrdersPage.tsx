import React, { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search as SearchIcon,
  Filter as FilterIcon,
  Package,
  ShoppingBag,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Info,
  FileText,
  Eye,
  AlertCircle,
  ShoppingCart,
  ArrowRightCircle,
  User,
  Calendar,
  RefreshCcw,
  Edit,
  Trash2,
  Receipt,
  Download,
  Printer,
  CreditCard,
  Plus,
  Minus,
  X
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "@/config";
import { useToast } from "@/hooks/use-toast";

// Interface basada en el controlador de pedidos
interface Pedido {
  ped_id: string;
  cli_id: string;
  cli_nombre: string;
  usr_id: string;
  usr_nombre: string;
  ped_fecha: string;
  ped_estado: string;
  ped_tipo: string;
  ped_forma_entrega: string;
  ped_notas?: string;
  ped_subtotal: number;
  ped_impuestos: number;
  ped_descuento: number;
  ped_total: number;
  detalles: Array<{
    det_id: string;
    prod_id: string;
    det_nota?: string;
    det_cantidad: number;
    det_impuesto: number;
    det_subtotal: number;
    det_descuento: number;
    det_precio_unitario: number;
    producto?: {
      pro_nombre: string;
      pro_descripcion: string;
      detalles?: {
        prod_imagen?: string;
      };
    };
  }>;
}

interface Producto {
  pro_id: string;
  pro_nombre: string;
  pro_descripcion: string;
  pro_precio_venta: number;
  pro_stock: number;
  categoria: {
    cat_id: string;
    cat_nombre: string;
  };
  detalles: {
    prod_imagen?: string;
  };
  proveedores: Array<{
    prov_id: string;
    prov_nombre: string;
  }>;
}

interface Cliente {
  cli_id: string;
  cli_nombre: string;
  cli_email?: string;
  cli_telefono?: string;
}

interface MetodoPago {
  met_id: string;
  met_nombre: string;
  met_descripcion?: string;
  met_estado: string;
  met_tipo?: string;
  met_banco?: string;
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

const OrdersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Pedido | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [deleteOpen, setDeleteOpen] = useState<string | null>(null);

  // Estados para edición
  const [clienteSearch, setClienteSearch] = useState("");
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [formaEntrega, setFormaEntrega] = useState("");
  const [notas, setNotas] = useState("");

  // Estados para pago
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [tipoComprobante, setTipoComprobante] = useState<string>("boleta");
  const [boletaNumero, setBoletaNumero] = useState<string>("");
  const [boletaNotas, setBoletaNotas] = useState<string>("");
  const [pagosMetodos, setPagosMetodos] = useState<Array<{
    met_id: string;
    monto: number;
    fecha_pago: string;
    nota_pago: string;
  }>>([]);
  const [montoActual, setMontoActual] = useState<number>(0);
  const [notaActual, setNotaActual] = useState<string>("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pedidos desde el backend
  const { data: pedidos = [], isLoading, refetch } = useQuery<Pedido[]>({
    queryKey: ['/api/pedidos'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/pedidos`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) throw new Error('Error fetching orders');
      const data = await response.json();
      return data;
    }
  });

  // Fetch productos para búsqueda
  const { data: productos = [] } = useQuery<Producto[]>({
    queryKey: ['productos'],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/productos`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) throw new Error('Error fetching products');
      const data = await response.json();
      return data.data || data;
    },
  });

  // Search clients
  const { data: clientes = [] } = useQuery<Cliente[]>({
    queryKey: ['/api/clientes', clienteSearch],
    queryFn: async () => {
      if (!clienteSearch.trim()) return [];
      const response = await fetch(`${API_URL}/api/clientes?search=${encodeURIComponent(clienteSearch)}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.data || data;
    },
    enabled: clienteSearch.trim().length > 0
  });

  // Fetch métodos de pago
  const { data: metodosPago = [] } = useQuery<MetodoPago[]>({
    queryKey: ['/api/metodos-pago'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/metodos-pago`);
      if (!response.ok) throw new Error('Error fetching payment methods');
      const data = await response.json();
      return data.filter((m: MetodoPago) => m.met_estado === 'Activo');
    }
  });

  // Filter products
  const filteredProducts = productos.filter(producto => {
    const nombre = producto.pro_nombre ?? "";
    return nombre.toLowerCase().includes(productSearch.toLowerCase());
  });

  // Mutation para actualizar pedido
  const updatePedidoMutation = useMutation({
    mutationFn: async ({ pedidoId, updateData }: { pedidoId: string; updateData: any }) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/pedidos/${pedidoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(updateData)
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
      setIsEditDialogOpen(false);
      setIsStatusUpdateOpen(false);
      setSelectedOrder(null);
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
          'Authorization': token ? `Bearer ${token}` : ''
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

  // Filtrar pedidos según el tab activo y búsqueda
  const filteredOrders = pedidos.filter(pedido => {
    const matchesSearch = !searchQuery ||
        pedido.ped_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pedido.cli_nombre.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = activeTab === "all" || pedido.ped_estado.toLowerCase() === activeTab.toLowerCase();

    return matchesSearch && matchesTab;
  });

  // Calcular estadísticas
  const estadisticas = {
    total: pedidos.length,
    pendientes: pedidos.filter(p => p.ped_estado.toLowerCase() === "pendiente").length,
    procesando: pedidos.filter(p => p.ped_estado.toLowerCase() === "procesando").length,
    enviados: pedidos.filter(p => p.ped_estado.toLowerCase() === "enviado").length,
    completados: pedidos.filter(p => p.ped_estado.toLowerCase() === "completado").length,
  };

  const resetEditForm = () => {
    setClienteSearch("");
    setSelectedCliente(null);
    setProductSearch("");
    setCartItems([]);
    setFormaEntrega("");
    setNotas("");
  };

  const openEditDialog = (pedido: Pedido) => {
    setSelectedOrder(pedido);
    setClienteSearch(pedido.cli_nombre);
    setSelectedCliente({
      cli_id: pedido.cli_id,
      cli_nombre: pedido.cli_nombre
    });
    setFormaEntrega(pedido.ped_forma_entrega);
    setNotas(pedido.ped_notas || "");
    setCartItems(pedido.detalles?.map(d => ({
      prod_id: d.prod_id,
      cantidad: d.det_cantidad,
      precio_unitario: d.det_precio_unitario
    })) || []);
    setIsEditDialogOpen(true);
  };

  const addToCart = (producto: Producto) => {
    const existingItem = cartItems.find(item => item.prod_id === producto.pro_id);
    const stockActual = producto.pro_stock || 0;

    if (stockActual <= 0) {
      toast({
        title: "Sin stock",
        description: "Este producto no tiene stock disponible",
        variant: "destructive",
      });
      return;
    }

    if (existingItem) {
      if (existingItem.cantidad >= stockActual) {
        toast({
          title: "Stock insuficiente",
          description: `Solo hay ${stockActual} unidades disponibles`,
          variant: "destructive",
        });
        return;
      }
      setCartItems(cartItems.map(item =>
          item.prod_id === producto.pro_id
              ? { ...item, cantidad: item.cantidad + 1 }
              : item
      ));
    } else {
      setCartItems([...cartItems, {
        prod_id: producto.pro_id,
        cantidad: 1,
        precio_unitario: producto.pro_precio_venta
      }]);
    }
    setProductSearch("");
  };

  const removeFromCart = (prod_id: string) => {
    setCartItems(cartItems.filter(item => item.prod_id !== prod_id));
  };

  const updateQuantity = (prod_id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(prod_id);
      return;
    }

    const producto = productos.find(p => p.pro_id === prod_id);
    const stockActual = producto?.pro_stock || 0;

    if (newQuantity > stockActual) {
      toast({
        title: "Stock insuficiente",
        description: `Solo hay ${stockActual} unidades disponibles`,
        variant: "destructive",
      });
      return;
    }

    setCartItems(cartItems.map(item =>
        item.prod_id === prod_id
            ? { ...item, cantidad: newQuantity }
            : item
    ));
  };

  const handleUpdatePedido = () => {
    if (!selectedOrder || cartItems.length === 0) {
      toast({
        title: "Error",
        description: "Debe tener al menos un producto en el carrito",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCliente && !clienteSearch.trim()) {
      toast({
        title: "Cliente requerido",
        description: "Selecciona o escribe el nombre del cliente",
        variant: "destructive",
      });
      return;
    }

    const updateData = {
      cliente_nombre: selectedCliente?.cli_nombre || clienteSearch.trim(),
      usr_id: selectedOrder.usr_id,
      forma_entrega: formaEntrega,
      notas: notas.trim() || null,
      estado: selectedOrder.ped_estado,
      items: cartItems.map(item => ({
        prod_id: item.prod_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario
      }))
    };

    updatePedidoMutation.mutate({
      pedidoId: selectedOrder.ped_id,
      updateData
    });
  };

  const subtotalEdit = cartItems.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);
  const taxEdit = subtotalEdit * 0.18;
  const totalEdit = subtotalEdit + taxEdit;

  const viewOrderDetails = (order: Pedido) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

  const updateOrderStatus = (order: Pedido) => {
    setSelectedOrder(order);
    setNewStatus(order.ped_estado);
    setIsStatusUpdateOpen(true);
  };

  const openPaymentDialog = (order: Pedido) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(false);
    setIsPaymentDialogOpen(true);

    // Generar número de boleta automático
    const now = new Date();
    const timestamp = now.getTime().toString().slice(-6);
    setBoletaNumero(`001-${timestamp}`);

    // Limpiar pagos anteriores
    setPagosMetodos([]);
    setMontoActual(0);
    setNotaActual("");
    setBoletaNotas("");
    setSelectedPaymentMethod("");
  };

  // Mutation para crear boleta
  const createBoletaMutation = useMutation({
    mutationFn: async (boletaData: any) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/boletas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(boletaData)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error creating boleta');
      }
      return response.json();
    },
    onSuccess: async (data) => {
      // Actualizar el estado del pedido a "Completado" después de crear la boleta
      if (selectedOrder) {
        try {
          await updatePedidoMutation.mutateAsync({
            pedidoId: selectedOrder.ped_id,
            updateData: {
              cliente_nombre: selectedOrder.cli_nombre,
              usr_id: selectedOrder.usr_id,
              forma_entrega: selectedOrder.ped_forma_entrega,
              notas: selectedOrder.ped_notas,
              estado: "Completado",
              items: selectedOrder.detalles?.map(d => ({
                prod_id: d.prod_id,
                cantidad: d.det_cantidad,
                precio_unitario: d.det_precio_unitario
              })) || []
            }
          });
        } catch (error) {
          console.error('Error updating order status:', error);
        }
      }

      toast({
        title: "Pago completado",
        description: `Se ha generado la boleta ${data.boleta_id} y el pedido se marcó como completado`
      });
      setIsPaymentDialogOpen(false);
      setSelectedOrder(null);
      resetPaymentForm();
      queryClient.invalidateQueries({ queryKey: ['/api/pedidos'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al crear la boleta",
        variant: "destructive"
      });
    }
  });

  const resetPaymentForm = () => {
    setSelectedPaymentMethod("");
    setTipoComprobante("boleta");
    setBoletaNumero("");
    setBoletaNotas("");
    setPagosMetodos([]);
    setMontoActual(0);
    setNotaActual("");
  };

  const agregarMetodoPago = () => {
    if (!selectedPaymentMethod || montoActual <= 0) {
      toast({
        title: "Error",
        description: "Selecciona un método de pago y un monto válido",
        variant: "destructive",
      });
      return;
    }

    const metodoSeleccionado = metodosPago.find(m => m.met_id === selectedPaymentMethod);
    if (!metodoSeleccionado) return;

    const totalPagos = pagosMetodos.reduce((sum, pago) => sum + pago.monto, 0);
    const totalPedido = selectedOrder ? Number(selectedOrder.ped_total) : 0;

    if (totalPagos + montoActual > totalPedido) {
      toast({
        title: "Error",
        description: "El monto total de pagos no puede exceder el total del pedido",
        variant: "destructive",
      });
      return;
    }

    const nuevoPago = {
      met_id: selectedPaymentMethod,
      monto: montoActual,
      fecha_pago: new Date().toISOString().split('T')[0],
      nota_pago: notaActual || `Pago con ${metodoSeleccionado.met_nombre}`
    };

    setPagosMetodos([...pagosMetodos, nuevoPago]);
    setMontoActual(0);
    setNotaActual("");
    setSelectedPaymentMethod("");
  };

  const eliminarMetodoPago = (index: number) => {
    setPagosMetodos(pagosMetodos.filter((_, i) => i !== index));
  };

  const handlePayment = () => {
    if (!selectedOrder) return;

    if (!boletaNumero.trim()) {
      toast({
        title: "Error",
        description: "El número de boleta es requerido",
        variant: "destructive",
      });
      return;
    }

    if (pagosMetodos.length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos un método de pago",
        variant: "destructive",
      });
      return;
    }

    const totalPagos = pagosMetodos.reduce((sum, pago) => sum + pago.monto, 0);
    const totalPedido = Number(selectedOrder.ped_total);

    if (Math.abs(totalPagos - totalPedido) > 0.01) {
      toast({
        title: "Error",
        description: "El total de pagos debe ser igual al total del pedido",
        variant: "destructive",
      });
      return;
    }

    const boletaData = {
      ped_id: selectedOrder.ped_id,
      boleta_numero: boletaNumero,
      boleta_notas: boletaNotas || null,
      pagos: pagosMetodos
    };

    createBoletaMutation.mutate(boletaData);
  };

  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case "pendiente":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-400">Pendiente</Badge>;
      case "procesando":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-400">Procesando</Badge>;
      case "enviado":
        return <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-400">Enviado</Badge>;
      case "completado":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-400">Completado</Badge>;
      case "cancelado":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-400">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status.toLowerCase()) {
      case "pendiente":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "procesando":
        return <ShoppingBag className="h-5 w-5 text-blue-500" />;
      case "enviado":
        return <Truck className="h-5 w-5 text-indigo-500" />;
      case "completado":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "cancelado":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const handleUpdateStatus = () => {
    if (!selectedOrder || !newStatus) return;

    updatePedidoMutation.mutate({
      pedidoId: selectedOrder.ped_id,
      updateData: {
        cliente_nombre: selectedOrder.cli_nombre,
        usr_id: selectedOrder.usr_id,
        forma_entrega: selectedOrder.ped_forma_entrega,
        notas: selectedOrder.ped_notas,
        estado: newStatus,
        items: selectedOrder.detalles?.map(d => ({
          prod_id: d.prod_id,
          cantidad: d.det_cantidad,
          precio_unitario: d.det_precio_unitario
        })) || []
      }
    });
  };

  const handleDeletePedido = (pedidoId: string) => {
    deletePedidoMutation.mutate(pedidoId);
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
              <p className="text-sm text-gray-500">Administra todos los pedidos del sistema</p>
            </div>

            {/* Dashboard de métricas horizontal */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 md:mt-0">
              <div className="bg-background border rounded-md p-2 shadow-sm">
                <div className="text-xs text-muted-foreground mb-1">Total</div>
                <div className="text-base font-semibold">{estadisticas.total}</div>
                <div className="flex items-center text-xs text-gray-600 mt-1">
                  <span>Todos los pedidos</span>
                </div>
              </div>

              <div className="bg-background border rounded-md p-2 shadow-sm">
                <div className="text-xs text-muted-foreground mb-1">Pendientes</div>
                <div className="text-base font-semibold">{estadisticas.pendientes}</div>
                <div className="flex items-center text-xs text-yellow-600 mt-1">
                  <span>Requieren atención</span>
                </div>
              </div>

              <div className="bg-background border rounded-md p-2 shadow-sm">
                <div className="text-xs text-muted-foreground mb-1">Procesando</div>
                <div className="text-base font-semibold">{estadisticas.procesando}</div>
                <div className="flex items-center text-xs text-blue-600 mt-1">
                  <span>En preparación</span>
                </div>
              </div>

              <div className="bg-background border rounded-md p-2 shadow-sm">
                <div className="text-xs text-muted-foreground mb-1">Enviados</div>
                <div className="text-base font-semibold">{estadisticas.enviados}</div>
                <div className="flex items-center text-xs text-indigo-600 mt-1">
                  <span>En camino</span>
                </div>
              </div>

              <div className="bg-background border rounded-md p-2 shadow-sm">
                <div className="text-xs text-muted-foreground mb-1">Completados</div>
                <div className="text-base font-semibold">{estadisticas.completados}</div>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <span>Finalizados</span>
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
                  placeholder="Buscar por ID de pedido, cliente..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2" onClick={() => {
                setSearchQuery("");
                setActiveTab("all");
                refetch();
              }}>
                <RefreshCcw className="h-4 w-4" />
                <span>Actualizar</span>
              </Button>
            </div>
          </div>

          {/* Lista de Pedidos */}
          <div className="bg-white rounded-lg border shadow-sm mb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex w-full rounded-none border-b bg-transparent p-0">
                <TabsTrigger
                    value="all"
                    className="flex-1 rounded-none border-b-2 border-transparent px-3 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Todos ({estadisticas.total})
                </TabsTrigger>
                <TabsTrigger
                    value="pendiente"
                    className="flex-1 rounded-none border-b-2 border-transparent px-3 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Pendientes ({estadisticas.pendientes})
                </TabsTrigger>
                <TabsTrigger
                    value="procesando"
                    className="flex-1 rounded-none border-b-2 border-transparent px-3 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Procesando ({estadisticas.procesando})
                </TabsTrigger>
                <TabsTrigger
                    value="enviado"
                    className="flex-1 rounded-none border-b-2 border-transparent px-3 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Enviados ({estadisticas.enviados})
                </TabsTrigger>
                <TabsTrigger
                    value="completado"
                    className="flex-1 rounded-none border-b-2 border-transparent px-3 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Completados ({estadisticas.completados})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="p-0 space-y-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {filteredOrders.map((pedido) => (
                      <Card key={pedido.ped_id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                          <div className="space-y-1">
                            <CardTitle className="text-base">{pedido.ped_id}</CardTitle>
                            <CardDescription>
                              {formatDate(pedido.ped_fecha)}
                            </CardDescription>
                          </div>
                          {getStatusIcon(pedido.ped_estado)}
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium">{pedido.cli_nombre}</p>
                              <p className="text-sm text-muted-foreground">{pedido.ped_forma_entrega}</p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-muted-foreground">Total</p>
                              <p className="font-bold text-lg">{formatCurrency(Number(pedido.ped_total))}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Items</p>
                              <p className="font-medium">{pedido.detalles?.length || 0}</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Subtotal:</span>
                              <span>{formatCurrency(Number(pedido.ped_subtotal))}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Impuestos:</span>
                              <span>{formatCurrency(Number(pedido.ped_impuestos))}</span>
                            </div>
                            {Number(pedido.ped_descuento) > 0 && (
                                <div className="flex justify-between text-sm text-red-600">
                                  <span>Descuento:</span>
                                  <span>-{formatCurrency(Number(pedido.ped_descuento))}</span>
                                </div>
                            )}
                          </div>

                          {pedido.ped_notas && (
                              <div className="text-sm">
                                <span className="text-gray-500">Notas: </span>
                                <span>{pedido.ped_notas}</span>
                              </div>
                          )}

                          <div className="flex justify-between items-center pt-2">
                            <div>
                              {getStatusBadge(pedido.ped_estado)}
                            </div>
                          </div>
                        </CardContent>

                        <CardFooter className="pt-2 border-t">
                          <div className="w-full flex justify-between">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-orange-500 hover:text-orange-600"
                                onClick={() => viewOrderDetails(pedido)}
                            >
                              <Eye className="h-4 w-4 mr-2" /> Ver detalles
                            </Button>
                            <div className="flex gap-2">
                              <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => openEditDialog(pedido)}
                                  className="text-blue-600 hover:text-blue-700"
                                  disabled={pedido.ped_estado.toLowerCase() === "completado" || pedido.ped_estado.toLowerCase() === "cancelado"}
                                  title={pedido.ped_estado.toLowerCase() === "completado" || pedido.ped_estado.toLowerCase() === "cancelado" ? "No se puede editar un pedido completado o cancelado" : "Editar pedido"}
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
                            </div>
                          </div>
                        </CardFooter>
                      </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {filteredOrders.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Receipt className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-gray-500">No se encontraron pedidos</p>
                  <p className="text-sm text-gray-400">Los pedidos aparecerán aquí cuando se creen desde el POS</p>
                </div>
            )}
          </div>
        </div>

        {/* Modal de Detalles del Pedido */}
        {selectedOrder && (
            <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
              <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Detalles del Pedido</DialogTitle>
                  <DialogDescription>
                    Información completa del pedido {selectedOrder.ped_id}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Información General</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">ID de Pedido:</span>
                          <span className="font-medium">{selectedOrder.ped_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fecha:</span>
                          <span>{formatDate(selectedOrder.ped_fecha)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estado:</span>
                          <span>{getStatusBadge(selectedOrder.ped_estado)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tipo:</span>
                          <span>{selectedOrder.ped_tipo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Forma de Entrega:</span>
                          <span>{selectedOrder.ped_forma_entrega}</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Cliente y Usuario</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cliente:</span>
                          <span>{selectedOrder.cli_nombre}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Usuario:</span>
                          <span>{selectedOrder.usr_nombre}</span>
                        </div>
                      </div>
                    </div>

                    {selectedOrder.ped_notas && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="text-lg font-semibold mb-2">Notas</h3>
                            <p className="text-sm bg-gray-50 p-2 rounded">{selectedOrder.ped_notas}</p>
                          </div>
                        </>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-2">Productos</h3>
                    <div className="border rounded-md divide-y max-h-64 overflow-y-auto">
                      {selectedOrder.detalles?.map((detalle, index) => {
                        const producto = productos.find(p => p.pro_id === detalle.prod_id);
                        return (
                            <div key={index} className="p-3 flex items-center gap-3">
                              {/* Imagen del producto */}
                              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                                {producto?.detalles?.prod_imagen ? (
                                    <img
                                        src={producto.detalles.prod_imagen}
                                        alt={producto?.pro_nombre || `Producto ${detalle.prod_id}`}
                                        className="w-full h-full object-cover rounded"
                                    />
                                ) : (
                                    <Package className="h-6 w-6 text-gray-400" />
                                )}
                              </div>

                              {/* Información del producto */}
                              <div className="flex-1">
                                <p className="font-medium text-sm line-clamp-1">
                                  {producto?.pro_nombre || `Producto ${detalle.prod_id}`}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-sm text-gray-500">
                                    {formatCurrency(detalle.det_precio_unitario)} c/u
                                  </p>
                                  {producto && (
                                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                Stock: {producto.pro_stock || 0}
                              </span>
                                  )}
                                </div>
                              </div>

                              {/* Precio y cantidad */}
                              <div className="text-right">
                                <p className="font-medium">{formatCurrency(detalle.det_subtotal)}</p>
                                <p className="text-sm text-gray-500">Cant: {detalle.det_cantidad}</p>
                              </div>
                            </div>
                        );
                      }) || <div className="p-3 text-center text-gray-500">No hay productos</div>}
                    </div>

                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal:</span>
                          <span>{formatCurrency(Number(selectedOrder.ped_subtotal))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Impuestos:</span>
                          <span>{formatCurrency(Number(selectedOrder.ped_impuestos))}</span>
                        </div>
                        {Number(selectedOrder.ped_descuento) > 0 && (
                            <div className="flex justify-between text-red-600">
                              <span>Descuento:</span>
                              <span>-{formatCurrency(Number(selectedOrder.ped_descuento))}</span>
                            </div>
                        )}
                        <Separator className="my-2" />
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span>{formatCurrency(Number(selectedOrder.ped_total))}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex gap-2">
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Imprimir
                  </Button>
                  <Button
                      variant="outline"
                      className={selectedOrder.ped_estado.toLowerCase() === "completado" || selectedOrder.ped_estado.toLowerCase() === "cancelado"
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700"}
                      onClick={() => openPaymentDialog(selectedOrder)}
                      disabled={selectedOrder.ped_estado.toLowerCase() === "completado" || selectedOrder.ped_estado.toLowerCase() === "cancelado"}
                      title={selectedOrder.ped_estado.toLowerCase() === "completado" ? "El pedido ya fue pagado" : selectedOrder.ped_estado.toLowerCase() === "cancelado" ? "No se puede pagar un pedido cancelado" : "Procesar pago"}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {selectedOrder.ped_estado.toLowerCase() === "completado" ? "PAGADO" : "PAGAR"}
                  </Button>
                  <Button
                      variant={selectedOrder.ped_estado.toLowerCase() === "cancelado" || selectedOrder.ped_estado.toLowerCase() === "completado" ? "outline" : "default"}
                      onClick={() => {
                        setIsOrderDetailsOpen(false);
                        updateOrderStatus(selectedOrder);
                      }}
                      disabled={selectedOrder.ped_estado.toLowerCase() === "cancelado" || selectedOrder.ped_estado.toLowerCase() === "completado"}
                      title={selectedOrder.ped_estado.toLowerCase() === "completado" || selectedOrder.ped_estado.toLowerCase() === "cancelado" ? "No se puede cambiar el estado de un pedido completado o cancelado" : "Actualizar estado del pedido"}
                  >
                    <ArrowRightCircle className="h-4 w-4 mr-2" />
                    {selectedOrder.ped_estado.toLowerCase() === "completado" || selectedOrder.ped_estado.toLowerCase() === "cancelado" ? "Estado Final" : "Actualizar Estado"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        )}

        {/* Modal de Edición de Pedido */}
        {selectedOrder && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-6xl max-h-[95vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle>Editar Pedido</DialogTitle>
                  <DialogDescription>
                    Modifica la información del pedido {selectedOrder.ped_id}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-4 h-[75vh]">
                  {/* Primera columna - Información del cliente y notas */}
                  <div className="flex flex-col space-y-4">
                    {/* Información del cliente */}
                    <div className="bg-white border rounded-lg p-4 shadow-sm">
                      <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Información del Cliente
                      </h4>

                      <div className="space-y-3">
                        <div className="relative">
                          <Label htmlFor="cliente" className="text-sm font-medium">Cliente *</Label>
                          <div className="relative mt-1">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                id="cliente"
                                placeholder="Buscar cliente..."
                                value={selectedCliente ? selectedCliente.cli_nombre : clienteSearch}
                                onChange={(e) => {
                                  setClienteSearch(e.target.value);
                                  setSelectedCliente(null);
                                }}
                                className="pl-10 h-10 text-sm"
                            />
                          </div>

                          {/* Dropdown de clientes */}
                          {clientes.length > 0 && !selectedCliente && clienteSearch.trim() && (
                              <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setClienteSearch("")}
                                />
                                <div className="absolute z-50 mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto w-full">
                                  <div className="p-2 bg-gray-50 border-b">
                                    <div className="text-sm text-gray-600 font-medium">Clientes encontrados:</div>
                                  </div>
                                  {clientes.map((cliente) => (
                                      <button
                                          key={cliente.cli_id}
                                          className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b last:border-b-0 flex items-center gap-3"
                                          onClick={() => {
                                            setSelectedCliente(cliente);
                                            setClienteSearch(cliente.cli_nombre);
                                          }}
                                      >
                                        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                                          {cliente.cli_nombre.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                          <div className="font-medium text-sm">{cliente.cli_nombre}</div>
                                          {cliente.cli_email && (
                                              <div className="text-sm text-gray-500">{cliente.cli_email}</div>
                                          )}
                                        </div>
                                      </button>
                                  ))}
                                </div>
                              </>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="forma-entrega" className="text-sm font-medium">Forma de Entrega</Label>
                          <Select value={formaEntrega} onValueChange={setFormaEntrega}>
                            <SelectTrigger className="h-10 text-sm mt-1">
                              <SelectValue placeholder="Seleccionar forma de entrega" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Mostrador">Mostrador</SelectItem>
                              <SelectItem value="Para Llevar">Para Llevar</SelectItem>
                              <SelectItem value="Domicilio">Domicilio</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Notas */}
                    <div className="bg-white border rounded-lg p-4 shadow-sm flex-1">
                      <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Notas del Pedido
                      </h4>
                      <div>
                        <Label htmlFor="notas" className="text-sm font-medium">Notas (opcional)</Label>
                        <Textarea
                            id="notas"
                            placeholder="Instrucciones especiales para el pedido..."
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                            rows={8}
                            className="text-sm mt-1 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Segunda columna - Productos del carrito */}
                  <div className="flex flex-col">
                    <div className="bg-white border rounded-lg shadow-sm h-full flex flex-col">
                      {/* Buscador de productos */}
                      <div className="p-3 border-b">
                        <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                          <SearchIcon className="h-5 w-5 text-primary" />
                          Buscar Productos
                        </h4>
                        <div className="relative">
                          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                              type="text"
                              placeholder="Buscar productos para agregar..."
                              className="pl-9 text-sm"
                              value={productSearch}
                              onChange={(e) => setProductSearch(e.target.value)}
                          />
                        </div>

                        {/* Lista de productos encontrados */}
                        {productSearch && (
                            <div className="mt-2 max-h-40 overflow-y-auto border rounded-md">
                              {filteredProducts.slice(0, 5).map((producto) => (
                                  <div
                                      key={producto.pro_id}
                                      className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center gap-2"
                                      onClick={() => {
                                        addToCart(producto);
                                        setProductSearch("");
                                      }}
                                  >
                                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                      {producto.detalles?.prod_imagen ? (
                                          <img
                                              src={producto.detalles.prod_imagen}
                                              alt={producto.pro_nombre}
                                              className="w-full h-full object-cover rounded"
                                          />
                                      ) : (
                                          <Package className="h-4 w-4 text-gray-400" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-sm font-medium">{producto.pro_nombre}</div>
                                      <div className="text-xs text-green-600 font-bold">
                                        {formatCurrency(producto.pro_precio_venta)}
                                      </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Stock: {producto.pro_stock || 0}
                                    </div>
                                  </div>
                              ))}
                              {filteredProducts.length === 0 && (
                                  <div className="p-3 text-center text-gray-500 text-sm">
                                    No se encontraron productos
                                  </div>
                              )}
                            </div>
                        )}
                      </div>

                      {/* Lista de productos en el carrito */}
                      <div className="flex-1 flex flex-col p-3">
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="font-medium text-sm text-gray-700">Productos en el Carrito</h5>
                          <Badge variant="outline" className="bg-primary text-white px-2 py-1 text-xs">
                            {cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'}
                          </Badge>
                        </div>

                        <div className="flex-1 overflow-hidden">
                          <div className="max-h-[240px] overflow-y-auto space-y-2 pr-1">
                            {cartItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-32 py-6 text-center">
                                  <ShoppingBag className="h-8 w-8 text-gray-300 mb-2" />
                                  <p className="text-gray-500 font-medium text-sm">El carrito está vacío</p>
                                  <p className="text-xs text-gray-400 mt-1">Busca productos arriba para agregarlos</p>
                                </div>
                            ) : (
                                cartItems.map((item) => {
                                  const producto = productos.find(p => p.pro_id === item.prod_id);
                                  return (
                                      <div key={item.prod_id} className="flex items-center gap-3 bg-gray-50 border rounded-lg p-3 hover:shadow-sm transition-shadow">
                                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                                          {producto?.detalles?.prod_imagen ? (
                                              <img
                                                  src={producto.detalles.prod_imagen}
                                                  alt={producto?.pro_nombre}
                                                  className="w-full h-full object-cover rounded"
                                              />
                                          ) : (
                                              <Package className="h-6 w-6 text-gray-400" />
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex justify-between items-start">
                                            <h3 className="font-medium text-sm line-clamp-1 flex-1">{producto?.pro_nombre}</h3>
                                            <button
                                                onClick={() => removeFromCart(item.prod_id)}
                                                className="text-red-500 hover:text-red-700 ml-2 p-1 flex-shrink-0"
                                            >
                                              <X className="h-4 w-4" />
                                            </button>
                                          </div>
                                          <div className="flex justify-between items-center mt-2">
                                            <div className="text-primary font-bold text-sm">
                                              {formatCurrency(item.precio_unitario)}
                                            </div>
                                            <div className="flex items-center border rounded">
                                              <button
                                                  className="px-2 py-1 text-gray-500 hover:bg-gray-100 transition-colors"
                                                  onClick={() => updateQuantity(item.prod_id, item.cantidad - 1)}
                                              >
                                                <Minus className="h-3 w-3" />
                                              </button>
                                              <span className="px-3 py-1 font-medium text-sm min-w-[40px] text-center">{item.cantidad}</span>
                                              <button
                                                  className="px-2 py-1 text-gray-500 hover:bg-gray-100 transition-colors"
                                                  onClick={() => updateQuantity(item.prod_id, item.cantidad + 1)}
                                              >
                                                <Plus className="h-3 w-3" />
                                              </button>
                                            </div>
                                          </div>
                                          <div className="text-right mt-1">
                                <span className="font-semibold text-sm text-green-600">
                                  {formatCurrency(item.precio_unitario * item.cantidad)}
                                </span>
                                          </div>
                                        </div>
                                      </div>
                                  );
                                })
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tercera columna - Resumen del pedido */}
                  <div className="flex flex-col h-full">
                    <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg shadow-sm flex-1 flex flex-col">
                      <div className="p-4 border-b border-green-200">
                        <h4 className="font-semibold text-base flex items-center gap-2">
                          <Receipt className="h-5 w-5 text-green-600" />
                          Resumen del Pedido
                        </h4>
                      </div>

                      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                        {/* Estadísticas rápidas */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center p-2 bg-white rounded border shadow-sm">
                            <div className="text-xl font-bold text-primary">{cartItems.length}</div>
                            <div className="text-xs text-gray-600">Items</div>
                          </div>
                          <div className="text-center p-2 bg-white rounded border shadow-sm">
                            <div className="text-xl font-bold text-blue-600">{cartItems.reduce((sum, item) => sum + item.cantidad, 0)}</div>
                            <div className="text-xs text-gray-600">Unidades</div>
                          </div>
                          <div className="text-center p-2 bg-white rounded border shadow-sm">
                            <div className="text-sm font-bold text-orange-600">{formaEntrega || "No definido"}</div>
                            <div className="text-xs text-gray-600">Entrega</div>
                          </div>
                        </div>

                        {/* Totales */}
                        <div className="bg-white rounded-lg border p-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-semibold">{formatCurrency(subtotalEdit)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Impuestos (18%):</span>
                            <span className="font-semibold">{formatCurrency(taxEdit)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-bold text-lg p-2 bg-green-100 rounded border-green-300 border">
                            <span>Total:</span>
                            <span className="text-green-600">{formatCurrency(totalEdit)}</span>
                          </div>
                        </div>

                        {/* Información del pedido */}
                        <div className="bg-white rounded-lg border p-3">
                          <div className="text-sm space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600 font-medium">Cliente:</span>
                              <span className="font-semibold text-xs">{selectedCliente?.cli_nombre || clienteSearch || 'No seleccionado'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 font-medium">Entrega:</span>
                              <span className="font-semibold text-xs">{formaEntrega || "No definido"}</span>
                            </div>
                            {notas && (
                                <div className="pt-2 border-t">
                                  <span className="text-gray-600 font-medium text-xs">Notas:</span>
                                  <p className="text-xs mt-1 bg-gray-50 p-2 rounded italic line-clamp-2">{notas}</p>
                                </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Botones de acción - Fijos en la parte inferior */}
                      <div className="p-4 border-t border-green-200 bg-white rounded-b-lg space-y-2">
                        <Button
                            onClick={handleUpdatePedido}
                            disabled={updatePedidoMutation.isPending || cartItems.length === 0}
                            className="w-full h-11 text-sm bg-green-600 hover:bg-green-700 font-bold"
                        >
                          {updatePedidoMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                              setIsEditDialogOpen(false);
                              resetEditForm();
                            }}
                            className="w-full h-9 text-sm"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
        )}

        {/* Modal para Actualizar Estado */}
        {selectedOrder && (
            <Dialog open={isStatusUpdateOpen} onOpenChange={setIsStatusUpdateOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Actualizar Estado del Pedido</DialogTitle>
                  <DialogDescription>
                    Cambia el estado del pedido {selectedOrder.ped_id}
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded-md">
                    <span className="mr-3">{getStatusIcon(selectedOrder.ped_estado)}</span>
                    <div>
                      <p className="font-medium">Estado Actual</p>
                      <div className="mt-1">{getStatusBadge(selectedOrder.ped_estado)}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nuevo-estado">Selecciona el nuevo estado</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger id="nuevo-estado">
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                        <SelectItem value="Procesando">Procesando</SelectItem>
                        <SelectItem value="Enviado">Enviado</SelectItem>
                        <SelectItem value="Completado">Completado</SelectItem>
                        <SelectItem value="Cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsStatusUpdateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                      onClick={handleUpdateStatus}
                      disabled={updatePedidoMutation.isPending || !newStatus}
                  >
                    {updatePedidoMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        )}

        {/* Modal de Pago/Comprobantes */}
        {selectedOrder && (
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Procesar Pago</DialogTitle>
                  <DialogDescription>
                    Genera el comprobante de pago para el pedido {selectedOrder.ped_id}
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto">
                  {/* Información de la boleta */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Receipt className="h-5 w-5 text-blue-600" />
                      Información de la Boleta
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="boleta-numero" className="text-sm font-medium">Número de Boleta *</Label>
                        <Input
                            id="boleta-numero"
                            value={boletaNumero}
                            onChange={(e) => setBoletaNumero(e.target.value)}
                            placeholder="001-000001"
                            className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Cliente</Label>
                        <p className="mt-1 p-2 bg-gray-100 rounded text-sm">{selectedOrder.cli_nombre}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Label htmlFor="boleta-notas" className="text-sm font-medium">Notas (opcional)</Label>
                      <Textarea
                          id="boleta-notas"
                          value={boletaNotas}
                          onChange={(e) => setBoletaNotas(e.target.value)}
                          placeholder="Observaciones adicionales..."
                          rows={2}
                          className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Resumen del pedido - No editable */}
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="font-semibold mb-3">Resumen del Pedido (No Editable)</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">{formatCurrency(Number(selectedOrder.ped_subtotal))}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Impuestos (18%):</span>
                        <span className="font-medium">{formatCurrency(Number(selectedOrder.ped_impuestos))}</span>
                      </div>
                      {Number(selectedOrder.ped_descuento) > 0 && (
                          <div className="flex justify-between text-sm text-red-600">
                            <span>Descuento:</span>
                            <span>-{formatCurrency(Number(selectedOrder.ped_descuento))}</span>
                          </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total a Pagar:</span>
                        <span className="text-green-600">{formatCurrency(Number(selectedOrder.ped_total))}</span>
                      </div>
                    </div>
                  </div>

                  {/* Agregar método de pago */}
                  <div className="border p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Agregar Método de Pago</h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <Label className="text-sm font-medium">Método de Pago</Label>
                        <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Seleccionar método" />
                          </SelectTrigger>
                          <SelectContent>
                            {metodosPago.map((metodo) => (
                                <SelectItem key={metodo.met_id} value={metodo.met_id}>
                                  <div className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    <div>
                                      <span className="font-medium">{metodo.met_nombre}</span>
                                      {metodo.met_banco && (
                                          <span className="text-xs text-gray-500 ml-1">({metodo.met_banco})</span>
                                      )}
                                    </div>
                                  </div>
                                </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Monto</Label>
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={montoActual || ""}
                            onChange={(e) => setMontoActual(Number(e.target.value))}
                            placeholder="0.00"
                            className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <Label className="text-sm font-medium">Nota del Pago (opcional)</Label>
                      <Input
                          value={notaActual}
                          onChange={(e) => setNotaActual(e.target.value)}
                          placeholder="Detalles del pago..."
                          className="mt-1"
                      />
                    </div>
                    <Button onClick={agregarMetodoPago} className="w-full" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Método de Pago
                    </Button>
                  </div>

                  {/* Lista de métodos de pago agregados */}
                  {pagosMetodos.length > 0 && (
                      <div className="border p-4 rounded-lg">
                        <h3 className="font-semibold mb-3">Métodos de Pago Agregados</h3>
                        <div className="space-y-2">
                          {pagosMetodos.map((pago, index) => {
                            const metodo = metodosPago.find(m => m.met_id === pago.met_id);
                            return (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                                  <div className="flex items-center gap-3">
                                    <CreditCard className="h-4 w-4 text-gray-500" />
                                    <div>
                                      <p className="font-medium text-sm">{metodo?.met_nombre}</p>
                                      <p className="text-xs text-gray-500">{pago.nota_pago}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-green-600">{formatCurrency(pago.monto)}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => eliminarMetodoPago(index)}
                                        className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                            );
                          })}
                        </div>
                        <Separator className="my-3" />
                        <div className="flex justify-between font-bold">
                          <span>Total Pagos:</span>
                          <span className="text-blue-600">
                      {formatCurrency(pagosMetodos.reduce((sum, pago) => sum + pago.monto, 0))}
                    </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mt-1">
                          <span>Pendiente:</span>
                          <span>
                      {formatCurrency(Number(selectedOrder.ped_total) - pagosMetodos.reduce((sum, pago) => sum + pago.monto, 0))}
                    </span>
                        </div>
                      </div>
                  )}

                  {metodosPago.length === 0 && (
                      <div className="text-center py-6 text-gray-500 border rounded-lg">
                        <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p>No hay métodos de pago disponibles</p>
                        <p className="text-sm">Configúrelos en la página de métodos de pago</p>
                      </div>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setIsPaymentDialogOpen(false);
                    resetPaymentForm();
                  }}>
                    Cancelar
                  </Button>
                  <Button
                      onClick={handlePayment}
                      disabled={createBoletaMutation.isPending || pagosMetodos.length === 0 || !boletaNumero.trim()}
                      className="bg-green-600 hover:bg-green-700"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {createBoletaMutation.isPending ? "Procesando..." : "Generar Boleta"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        )}

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
};

export default OrdersPage;