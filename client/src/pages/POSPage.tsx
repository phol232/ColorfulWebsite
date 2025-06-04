import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Search as SearchIcon,
  Filter as FilterIcon,
  Package,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Receipt,
  DollarSign,
  FileText,
  ScanBarcode,
  PlusCircle,
  Table as TableIcon,
  QrCode,
  Heart,
  Edit2,
  Grid3X3,
  User,
  X,
  RefreshCcw
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/config";
import { useToast } from "@/hooks/use-toast";
import { useUserId } from "@/hooks/useUserId";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Interface para productos
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

interface Category {
  cat_id: string;
  cat_nombre: string;
  cat_descripcion?: string;
}

interface CartItem {
  prod_id: string;
  cantidad: number;
  precio_unitario: number;
}

interface Cliente {
  cli_id: string;
  cli_nombre: string;
  cli_email?: string;
  cli_telefono?: string;
}

const POSPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [activeOrderTab, setActiveOrderTab] = useState<string>("dineIn");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [clienteSearch, setClienteSearch] = useState("");
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [formaEntrega, setFormaEntrega] = useState("Mostrador");
  const [notas, setNotas] = useState("");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const { toast } = useToast();

  // Obtener ID del usuario logueado usando el hook
  const userId = useUserId();

  // Fetch products
  const { data: productos = [], isLoading: loadingProducts, refetch: refetchProducts } = useQuery<Producto[]>({
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
    refetchInterval: 30000,
    staleTime: 5000,
  });

  // Fetch categories
  const { data: categories = [], isLoading: loadingCategories, refetch: refetchCategories } = useQuery<Category[]>({
    queryKey: ['categorias'],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/categorias`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) throw new Error('Error fetching categories');
      const data = await response.json();
      return data.data || data;
    },
    refetchInterval: 60000,
    staleTime: 10000,
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

  // Filter products
  const filteredProducts = productos.filter(producto => {
    const nombre = producto.pro_nombre ?? "";
    const matchesSearch = nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !activeCategory || producto.categoria?.cat_nombre === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (producto: Producto) => {
    const existingItem = cart.find(item => item.prod_id === producto.pro_id);
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
      setCart(cart.map(item =>
          item.prod_id === producto.pro_id
              ? { ...item, cantidad: item.cantidad + 1 }
              : item
      ));
    } else {
      setCart([...cart, {
        prod_id: producto.pro_id,
        cantidad: 1,
        precio_unitario: producto.pro_precio_venta
      }]);
    }
  };

  const removeFromCart = (prod_id: string) => {
    setCart(cart.filter(item => item.prod_id !== prod_id));
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

    setCart(cart.map(item =>
        item.prod_id === prod_id
            ? { ...item, cantidad: newQuantity }
            : item
    ));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const handleCreateOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega productos al carrito antes de crear el pedido",
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

    setIsCreatingOrder(true);

    try {
      const token = localStorage.getItem("token");
      const orderData = {
        cliente_nombre: selectedCliente?.cli_nombre || clienteSearch.trim(),
        usr_id: userId,
        forma_entrega: formaEntrega,
        notas: notas.trim() || null,
        items: cart.map(item => ({
          prod_id: item.prod_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario
        }))
      };

      const response = await fetch(`${API_URL}/api/pedidos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el pedido');
      }

      const result = await response.json();

      toast({
        title: "Pedido creado exitosamente",
        description: `Pedido ${result.pedido_id} ha sido registrado correctamente`,
      });

      refetchProducts();

      setCart([]);
      setIsOrderDialogOpen(false);
      setSelectedCliente(null);
      setClienteSearch("");
      setNotas("");
      setFormaEntrega("Mostrador");

    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error al crear pedido",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  return (
      <MainLayout>
        <div className="flex h-[calc(100vh-64px)]">
          {/* Columna izquierda - Productos */}
          <div className="flex-1 overflow-auto bg-gray-50 p-4">
            {/* Barra superior con búsqueda */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                    type="text"
                    placeholder="Buscar productos..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      refetchProducts();
                      toast({
                        title: "Productos actualizados",
                        description: "La lista de productos se ha actualizado",
                      });
                    }}
                    className="flex items-center gap-1"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Actualizar
                </Button>
                <div className="bg-white rounded-full p-1 flex shadow-sm">
                  <button className="p-2 rounded-full bg-primary text-white">
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Categorías */}
            <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-2 mb-4">
              <Card
                  className={`cursor-pointer hover:bg-gray-100 transition-colors ${!activeCategory ? 'border-primary' : ''}`}
                  onClick={() => setActiveCategory("")}
              >
                <CardContent className="flex flex-col items-center justify-center p-2 text-center">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 mb-1">
                    <Grid3X3 className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="font-medium text-xs">Todos</div>
                  <div className="text-xs text-gray-500">{productos.length} items</div>
                </CardContent>
              </Card>

              {categories.map(cat => (
                  <Card
                      key={cat.cat_id}
                      className={`cursor-pointer hover:bg-gray-100 transition-colors ${activeCategory === cat.cat_nombre ? 'border-primary' : ''}`}
                      onClick={() => setActiveCategory(cat.cat_nombre)}
                  >
                    <CardContent className="flex flex-col items-center justify-center p-2 text-center">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 mb-1">
                        <Package className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="font-medium text-xs truncate w-full">{cat.cat_nombre}</div>
                      <div className="text-xs text-gray-500">
                        {productos.filter(p => p.categoria?.cat_nombre === cat.cat_nombre).length} items
                      </div>
                    </CardContent>
                  </Card>
              ))}
            </div>

            {/* Loading state */}
            {(loadingProducts || loadingCategories) && (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-gray-500">Cargando productos...</span>
                </div>
            )}

            {/* Productos en grid - 5x2 */}
            <div className="grid grid-cols-5 gap-3 max-h-[calc(100vh-300px)] overflow-y-auto"
                 style={{ gridTemplateRows: 'repeat(2, 1fr)' }}>
              {!loadingProducts && filteredProducts.slice(0, 10).map((producto) => {
                const cartItem = cart.find(item => item.prod_id === producto.pro_id);
                return (
                    <Card
                        key={producto.pro_id}
                        className="overflow-hidden hover:shadow-lg transition-all border border-gray-200 cursor-pointer hover:border-primary/30 flex flex-col"
                    >
                      <div className="flex flex-col items-center p-2">
                        <div className="relative mb-2">
                          <div className="w-[50px] h-[50px] overflow-hidden bg-gray-100 rounded-lg">
                            {producto.detalles?.prod_imagen ? (
                                <img
                                    src={producto.detalles.prod_imagen}
                                    alt={producto.pro_nombre}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                            )}
                          </div>
                          {(producto.pro_stock || 0) <= 5 && (producto.pro_stock || 0) > 0 && (
                              <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs px-1 py-0.5 rounded text-[10px] font-bold">
                                ¡Últimos!
                              </div>
                          )}
                          {(producto.pro_stock || 0) <= 0 && (
                              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded text-[10px] font-bold">
                                Agotado
                              </div>
                          )}
                        </div>

                        <div className="text-center w-full">
                          <h3 className="font-semibold text-xs line-clamp-2 leading-tight mb-1">{producto.pro_nombre}</h3>
                          <div className="text-primary font-bold text-sm mb-1">
                            {formatCurrency(producto.pro_precio_venta)}
                          </div>
                          <div className="text-xs text-gray-500 mb-2">
                            Stock: {producto.pro_stock || 0}
                          </div>
                        </div>

                        <div className="mt-2 w-full">
                          {cartItem ? (
                              <div className="flex items-center justify-center border rounded bg-primary bg-opacity-10 border-primary p-0.5">
                                <button
                                    className="p-1 text-primary hover:bg-primary hover:bg-opacity-20 rounded transition-colors"
                                    onClick={() => updateQuantity(producto.pro_id, cartItem.cantidad - 1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="px-2 py-1 text-xs font-bold min-w-[2rem] text-center">
                                  {cartItem.cantidad}
                                </span>
                                <button
                                    className="p-1 text-primary hover:bg-primary hover:bg-opacity-20 rounded transition-colors"
                                    disabled={(producto.pro_stock || 0) <= cartItem.cantidad}
                                    onClick={() => updateQuantity(producto.pro_id, cartItem.cantidad + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                          ) : (
                              <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full h-7 text-xs font-medium bg-green-100 hover:bg-green-200 text-green-700 hover:text-green-800 border-green-300 transition-all"
                                  disabled={(producto.pro_stock || 0) <= 0}
                                  onClick={() => addToCart(producto)}
                              >
                                {(producto.pro_stock || 0) <= 0 ? (
                                    <span className="flex items-center gap-1">
                                      <X className="h-3 w-3" />
                                      Sin Stock
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1">
                                      <Plus className="h-3 w-3" />
                                      Agregar
                                    </span>
                                )}
                              </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                );
              })}
            </div>

            {filteredProducts.length === 0 && !loadingProducts && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-gray-500">No se encontraron productos</p>
                  <p className="text-sm text-gray-400">Intenta cambiar los filtros de búsqueda</p>
                </div>
            )}
          </div>

          {/* Columna derecha - Carrito */}
          <div className="w-[480px] border-l border-gray-200 bg-white flex flex-col h-full">
            {/* Encabezado del ticket */}
            <div className="border-b border-gray-200 p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold">Punto de Venta</h2>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Activo
                </Badge>
              </div>

              {/* Pestañas de tipo de orden */}
              <div className="bg-gray-100 rounded-lg p-1 flex">
                <Button
                    variant={activeOrderTab === "dineIn" ? "default" : "ghost"}
                    className="flex-1 rounded-md text-xs"
                    onClick={() => {
                      setActiveOrderTab("dineIn");
                      setFormaEntrega("Mostrador");
                    }}
                >
                  Mostrador
                </Button>
                <Button
                    variant={activeOrderTab === "takeAway" ? "default" : "ghost"}
                    className="flex-1 rounded-md text-xs"
                    onClick={() => {
                      setActiveOrderTab("takeAway");
                      setFormaEntrega("Para Llevar");
                    }}
                >
                  Para Llevar
                </Button>
                <Button
                    variant={activeOrderTab === "delivery" ? "default" : "ghost"}
                    className="flex-1 rounded-md text-xs"
                    onClick={() => {
                      setActiveOrderTab("delivery");
                      setFormaEntrega("Domicilio");
                    }}
                >
                  Domicilio
                </Button>
              </div>
            </div>

            {/* Lista de productos en el carrito */}
            <div className="flex-1 overflow-auto p-4">
              {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-6 text-center">
                    <ShoppingBag className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">El carrito está vacío</p>
                    <p className="text-sm text-gray-400">Agrega productos para iniciar la venta</p>
                  </div>
              ) : (
                  <div className="space-y-3">
                    {cart.map((item) => {
                      const producto = productos.find(p => p.pro_id === item.prod_id);
                      return (
                          <div key={item.prod_id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              {producto?.detalles?.prod_imagen ? (
                                  <img
                                      src={producto.detalles.prod_imagen}
                                      alt={producto?.pro_nombre}
                                      className="w-full h-full object-cover rounded-lg"
                                  />
                              ) : (
                                  <Package className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <h3 className="font-medium text-sm line-clamp-1">{producto?.pro_nombre}</h3>
                                <button onClick={() => removeFromCart(item.prod_id)}>
                                  <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                                </button>
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <div className="text-primary font-bold text-sm">
                                  {formatCurrency(item.precio_unitario)}
                                </div>
                                <div className="flex items-center border rounded-md">
                                  <button
                                      className="px-2 py-1 text-gray-500"
                                      onClick={() => updateQuantity(item.prod_id, item.cantidad - 1)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <span className="px-2 py-1 text-sm font-medium">{item.cantidad}</span>
                                  <button
                                      className="px-2 py-1 text-gray-500"
                                      onClick={() => updateQuantity(item.prod_id, item.cantidad + 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                              <div className="text-right mt-1">
                          <span className="font-semibold text-sm">
                            {formatCurrency(item.precio_unitario * item.cantidad)}
                          </span>
                              </div>
                            </div>
                          </div>
                      );
                    })}
                  </div>
              )}
            </div>

            {/* Resumen y total */}
            <div className="p-4 border-t border-gray-200">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impuestos (18%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Botón de pedir */}
              <Button
                  className="w-full h-12 mt-4 bg-green-600 hover:bg-green-700 text-white font-bold"
                  onClick={() => setIsOrderDialogOpen(true)}
                  disabled={cart.length === 0}
              >
                <Receipt className="h-4 w-4 mr-2" />
                Crear Pedido
              </Button>
            </div>
          </div>
        </div>

        <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
          <DialogContent className="sm:max-w-5xl max-h-[95vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Crear Nuevo Pedido</DialogTitle>
              <DialogDescription className="text-sm">
                Gestiona la información del pedido y administra los productos del carrito
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-3 gap-4 h-[80vh]">
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
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Lista de productos encontrados */}
                    {searchTerm && (
                        <div className="mt-2 max-h-40 overflow-y-auto border rounded-md">
                          {filteredProducts.slice(0, 5).map((producto) => (
                              <div
                                  key={producto.pro_id}
                                  className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center gap-2"
                                  onClick={() => {
                                    addToCart(producto);
                                    setSearchTerm("");
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
                        {cart.length} {cart.length === 1 ? 'producto' : 'productos'}
                      </Badge>
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-32 py-6 text-center">
                              <ShoppingBag className="h-8 w-8 text-gray-300 mb-2" />
                              <p className="text-gray-500 font-medium text-sm">El carrito está vacío</p>
                              <p className="text-xs text-gray-400 mt-1">Busca productos arriba para agregarlos</p>
                            </div>
                        ) : (
                            cart.map((item) => {
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
                        <div className="text-xl font-bold text-primary">{cart.length}</div>
                        <div className="text-xs text-gray-600">Items</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border shadow-sm">
                        <div className="text-xl font-bold text-blue-600">{cart.reduce((sum, item) => sum + item.cantidad, 0)}</div>
                        <div className="text-xs text-gray-600">Unidades</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border shadow-sm">
                        <div className="text-sm font-bold text-orange-600">{formaEntrega}</div>
                        <div className="text-xs text-gray-600">Entrega</div>
                      </div>
                    </div>

                    {/* Totales */}
                    <div className="bg-white rounded-lg border p-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-semibold">{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Impuestos (18%):</span>
                        <span className="font-semibold">{formatCurrency(tax)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg p-2 bg-green-100 rounded border-green-300 border">
                        <span>Total:</span>
                        <span className="text-green-600">{formatCurrency(total)}</span>
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
                          <span className="font-semibold text-xs">{formaEntrega}</span>
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
                  <div className="p-4 border-t border-green-200 bg-white rounded-b-lg flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsOrderDialogOpen(false)}
                        className="h-9 text-sm flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                        onClick={handleCreateOrder}
                        disabled={isCreatingOrder || cart.length === 0}
                        className="h-11 text-sm bg-green-600 hover:bg-green-700 font-bold flex-1"
                    >
                      {isCreatingOrder ? "Procesando..." : "Confirmar Pedido"}
                    </Button>

                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </MainLayout>
  );
};

export default POSPage;