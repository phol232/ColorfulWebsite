import React, { useState } from "react";
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
  PlusCircle
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const categorias = [
  { id: 1, nombre: "Hamburguesas" },
  { id: 2, nombre: "Pizzas" },
  { id: 3, nombre: "Bebidas" },
  { id: 4, nombre: "Postres" },
  { id: 5, nombre: "Ensaladas" },
];

const productos = [
  { 
    id: 1, 
    nombre: "Hamburguesa Clásica", 
    sku: "BURG-001", 
    descripcion: "Hamburguesa con carne, lechuga, tomate y queso", 
    precioCompra: 8.50, 
    precioVenta: 12.99, 
    categoria: "Hamburguesas", 
    stock: 45, 
    stockMinimo: 20, 
    proveedor: "Carnes Premium S.A.",
    estado: "Activo",
    imagen: "/placeholder-burger.jpg" 
  },
  { 
    id: 2, 
    nombre: "Pizza Margarita", 
    sku: "PIZ-034", 
    descripcion: "Pizza con salsa de tomate, mozzarella y albahaca", 
    precioCompra: 7.25, 
    precioVenta: 11.50, 
    categoria: "Pizzas", 
    stock: 18, 
    stockMinimo: 15, 
    proveedor: "Insumos Italianos",
    estado: "Activo",
    imagen: "/placeholder-pizza.jpg" 
  },
  { 
    id: 3, 
    nombre: "Agua Mineral 500ml", 
    sku: "BEB-012", 
    descripcion: "Agua mineral sin gas en botella de 500ml", 
    precioCompra: 0.75, 
    precioVenta: 1.99, 
    categoria: "Bebidas", 
    stock: 120, 
    stockMinimo: 50, 
    proveedor: "Distribuidora de Bebidas",
    estado: "Activo",
    imagen: "/placeholder-water.jpg" 
  },
  { 
    id: 4, 
    nombre: "Brownie de Chocolate", 
    sku: "POS-008", 
    descripcion: "Brownie casero con trozos de chocolate", 
    precioCompra: 1.25, 
    precioVenta: 3.50, 
    categoria: "Postres", 
    stock: 8, 
    stockMinimo: 10, 
    proveedor: "Repostería Dulce Hogar",
    estado: "Activo",
    imagen: "/placeholder-brownie.jpg" 
  },
  { 
    id: 5, 
    nombre: "Ensalada César", 
    sku: "ENS-021", 
    descripcion: "Ensalada con lechuga, pollo, queso parmesano y aderezo césar", 
    precioCompra: 5.75, 
    precioVenta: 9.99, 
    categoria: "Ensaladas", 
    stock: 12, 
    stockMinimo: 8, 
    proveedor: "Productos Frescos S.L.",
    estado: "Activo",
    imagen: "/placeholder-salad.jpg" 
  },
];

interface CartItem {
  id: number;
  nombre: string;
  precioVenta: number;
  cantidad: number;
}

const POSPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  
  const filteredProducts = activeCategory 
    ? productos.filter(p => p.categoria === activeCategory)
    : productos;
    
  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, cantidad: item.cantidad + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { 
        id: product.id, 
        nombre: product.nombre, 
        precioVenta: product.precioVenta,
        cantidad: 1
      }]);
    }
  };
  
  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };
  
  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCart(cart.map(item => 
      item.id === id 
        ? { ...item, cantidad: newQuantity } 
        : item
    ));
  };
  
  const subtotal = cart.reduce((sum, item) => sum + (item.precioVenta * item.cantidad), 0);
  const tax = subtotal * 0.16; // 16% de impuesto
  const total = subtotal + tax;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Punto de Venta</h1>
          <p className="text-gray-500">Registra ventas, imprime facturas y gestiona el flujo de caja</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel izquierdo - Productos */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input type="text" placeholder="Buscar productos por nombre, código o descripción..." className="pl-9" />
              </div>
              <Button className="flex items-center gap-1">
                <ScanBarcode className="h-4 w-4" />
                <span>Escanear Código</span>
              </Button>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button 
                variant={activeCategory === "" ? "default" : "outline"} 
                className="whitespace-nowrap"
                onClick={() => setActiveCategory("")}
              >
                Todos
              </Button>
              {categorias.map(cat => (
                <Button 
                  key={cat.id} 
                  variant={activeCategory === cat.nombre ? "default" : "outline"} 
                  className="whitespace-nowrap"
                  onClick={() => setActiveCategory(cat.nombre)}
                >
                  {cat.nombre}
                </Button>
              ))}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map((producto) => (
                <div 
                  key={producto.id} 
                  className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => addToCart(producto)}
                >
                  {/* Imagen del producto */}
                  <div className="h-40 w-full bg-gray-100 relative flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-300" />
                    {producto.stock < producto.stockMinimo && (
                      <Badge 
                        variant={producto.stock < producto.stockMinimo / 2 ? "destructive" : "outline"}
                        className="absolute top-2 right-2"
                      >
                        {producto.stock < producto.stockMinimo / 2 ? "Stock Crítico" : "Stock Bajo"}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Detalles del producto */}
                  <div className="p-3">
                    <h3 className="font-medium truncate">{producto.nombre}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <p className="font-bold text-green-600">{formatCurrency(producto.precioVenta)}</p>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-400">
                        Stock: {producto.stock}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Panel derecho - Carrito */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Ticket Actual</h3>
              <p className="text-sm text-gray-500">Venta #4832</p>
            </div>
            
            {/* Lista de productos en el carrito */}
            <div className="p-4 flex-1 overflow-auto max-h-[calc(100vh-400px)]">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <ShoppingBag className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-gray-500">El carrito está vacío</p>
                  <p className="text-sm text-gray-400">Agrega productos para iniciar la venta</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 border-b">
                      <div className="flex-1">
                        <p className="font-medium">{item.nombre}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(item.precioVenta)} c/u</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border rounded">
                          <button 
                            className="p-1 text-gray-500 hover:text-gray-700"
                            onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-2 py-1 border-x">{item.cantidad}</span>
                          <button 
                            className="p-1 text-gray-500 hover:text-gray-700"
                            onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="font-semibold text-right min-w-[70px]">
                          {formatCurrency(item.precioVenta * item.cantidad)}
                        </p>
                        <button 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Resumen y totales */}
            <div className="p-4 bg-gray-50 border-t">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Impuestos (16%):</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-6">
                <Button variant="outline" className="w-full" disabled={cart.length === 0}>
                  <Receipt className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
                <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      disabled={cart.length === 0}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Cobrar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Finalizar Venta</DialogTitle>
                      <DialogDescription>
                        Selecciona el método de pago y completa la venta
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="flex flex-col items-center justify-center p-6 h-auto">
                          <CreditCard className="h-6 w-6 mb-2" />
                          <span>Tarjeta de Crédito/Débito</span>
                        </Button>
                        <Button variant="outline" className="flex flex-col items-center justify-center p-6 h-auto">
                          <DollarSign className="h-6 w-6 mb-2" />
                          <span>Efectivo</span>
                        </Button>
                      </div>
                      
                      <div className="space-y-3 pt-4">
                        <h4 className="font-medium">Resumen de la venta</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Productos:</span>
                            <span>{cart.reduce((sum, item) => sum + item.cantidad, 0)} items</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal:</span>
                            <span>{formatCurrency(subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Impuestos:</span>
                            <span>{formatCurrency(tax)}</span>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex justify-between font-bold">
                            <span>Total a cobrar:</span>
                            <span>{formatCurrency(total)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <Button variant="outline" className="w-full">
                          <FileText className="h-4 w-4 mr-2" />
                          Facturar
                        </Button>
                        <Button className="w-full">
                          <Receipt className="h-4 w-4 mr-2" />
                          Finalizar Venta
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="mt-4">
                <Button variant="outline" className="w-full text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setCart([])}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Cancelar Venta
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default POSPage;