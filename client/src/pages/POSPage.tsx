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
  PlusCircle,
  Table as TableIcon,
  QrCode,
  Heart,
  Edit2,
  Grid3X3
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const categorias = [
  { id: 1, nombre: "Hamburguesas", icon: "🍔", items: 13 },
  { id: 2, nombre: "Pizzas", icon: "🍕", items: 9 },
  { id: 3, nombre: "Ensaladas", icon: "🥗", items: 6 },
  { id: 4, nombre: "Sopas", icon: "🍲", items: 8 },
  { id: 5, nombre: "Pasta", icon: "🍝", items: 12 },
  { id: 6, nombre: "Plato principal", icon: "🍽️", items: 24 },
  { id: 7, nombre: "Burgers", icon: "🍔", items: 13 },
];

const productos = [
  { 
    id: 1, 
    nombre: "Hamburguesa Clásica con Papas", 
    isVeg: false,
    descripcion: "Hamburguesa con carne, lechuga, tomate y queso",
    precioVenta: 12.99,
    descuento: 0,
    imagen: "https://placehold.co/400x300/e91e63/fff?text=Hamburguesa",
    favorito: false
  },
  { 
    id: 2, 
    nombre: "Ensalada Vegetariana Saludable", 
    isVeg: true,
    descripcion: "Ensalada veggie con ingredientes frescos",
    precioVenta: 7.99,
    descuento: 20,
    imagen: "https://placehold.co/400x300/4caf50/fff?text=Ensalada",
    favorito: true
  },
  { 
    id: 3, 
    nombre: "Pizza de Queso", 
    isVeg: true,
    descripcion: "Pizza Margarita con queso mozzarella",
    precioVenta: 14.99,
    descuento: 0,
    imagen: "https://placehold.co/400x300/ff9800/fff?text=Pizza",
    favorito: true
  },
  { 
    id: 4, 
    nombre: "Tacos Salsa con Pollo Grillado", 
    isVeg: false,
    descripcion: "Tacos de pollo con salsa especial",
    precioVenta: 14.99,
    descuento: 0,
    imagen: "https://placehold.co/400x300/ffc107/fff?text=Tacos",
    favorito: false
  },
  { 
    id: 5, 
    nombre: "Jugo de Naranja con Basil", 
    isVeg: true,
    descripcion: "Jugo de naranja fresco con hojas de albahaca",
    precioVenta: 12.99,
    descuento: 0,
    imagen: "https://placehold.co/400x300/ff5722/fff?text=Jugo",
    favorito: false
  },
  { 
    id: 6, 
    nombre: "Maki de Atún", 
    isVeg: false,
    descripcion: "Maki de sushi con atún fresco",
    precioVenta: 9.99,
    descuento: 0,
    imagen: "https://placehold.co/400x300/607d8b/fff?text=Sushi",
    favorito: false
  },
  { 
    id: 7, 
    nombre: "Hamburguesa con Papas Fritas", 
    isVeg: false,
    descripcion: "Hamburguesa premium con papas fritas",
    precioVenta: 30.99,
    descuento: 0,
    imagen: "https://placehold.co/400x300/e91e63/fff?text=Hamburguesa+Plus",
    favorito: false
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
  const [activeOrderTab, setActiveOrderTab] = useState<string>("dineIn");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("4");
  
  const filteredProducts = productos;
    
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
  const tax = subtotal * 0.05; // 5% de impuesto
  const total = subtotal + tax;

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-64px)]">
        {/* Columna izquierda - Productos (2/3 del ancho) */}
        <div className="flex-grow overflow-auto bg-gray-50 p-4">
          {/* Barra superior con búsqueda y layout */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input type="text" placeholder="Search Products here..." className="pl-9" />
            </div>
            <div className="flex items-center justify-end">
              <div className="bg-white rounded-full p-1 flex shadow-sm">
                <button className="p-2 rounded-full bg-primary text-white">
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button className="p-2 rounded-full text-gray-500">
                  <TableIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Categorías en formato card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 mb-6">
            <Card className="cursor-pointer hover:bg-gray-100 transition-colors">
              <CardContent className="flex flex-col items-center justify-center p-3 text-center">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 mb-2">
                  <Grid3X3 className="h-6 w-6 text-gray-600" />
                </div>
                <div className="font-medium">All</div>
                <div className="text-xs text-gray-500">250 items</div>
              </CardContent>
            </Card>
            
            {categorias.map(cat => (
              <Card 
                key={cat.id} 
                className={`cursor-pointer hover:bg-gray-100 transition-colors ${activeCategory === cat.nombre ? 'border-primary' : ''}`}
                onClick={() => setActiveCategory(cat.nombre)}
              >
                <CardContent className="flex flex-col items-center justify-center p-3 text-center">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 mb-2">
                    <span className="text-2xl">{cat.icon}</span>
                  </div>
                  <div className="font-medium truncate w-full">{cat.nombre}</div>
                  <div className="text-xs text-gray-500">{cat.items} items</div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Productos en grid, diseño similar a la imagen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProducts.map((producto) => (
              <Card 
                key={producto.id}
                className="overflow-hidden hover:shadow-md transition-all border border-gray-200"
              >
                <div className="relative">
                  {/* Imagen */}
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={producto.imagen} 
                      alt={producto.nombre}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Badges y botones flotantes */}
                  {producto.descuento > 0 && (
                    <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
                      {producto.descuento}% OFF
                    </div>
                  )}
                  
                  <button className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow hover:bg-gray-100">
                    <Heart className={`h-4 w-4 ${producto.favorito ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                  </button>
                </div>
                
                {/* Información del producto */}
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-sm mb-1 line-clamp-2">{producto.nombre}</h3>
                      <div className="text-xs text-gray-500 mb-2">{producto.isVeg ? 'Veg' : 'Non-Veg'}</div>
                      <div className="text-sm font-bold text-green-600">${producto.precioVenta.toFixed(2)}</div>
                    </div>
                    
                    {/* Botones de añadir o de cantidad */}
                    <div>
                      {cart.find(item => item.id === producto.id) ? (
                        <div className="flex items-center border rounded bg-primary bg-opacity-10 border-primary">
                          <button 
                            className="p-1 text-primary hover:bg-primary hover:bg-opacity-20"
                            onClick={(e) => {
                              e.stopPropagation();
                              const item = cart.find(i => i.id === producto.id);
                              if (item) updateQuantity(producto.id, item.cantidad - 1);
                            }}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-2 py-1 text-sm">
                            {cart.find(item => item.id === producto.id)?.cantidad || 0}
                          </span>
                          <button 
                            className="p-1 text-primary hover:bg-primary hover:bg-opacity-20"
                            onClick={(e) => {
                              e.stopPropagation();
                              const item = cart.find(i => i.id === producto.id);
                              if (item) updateQuantity(producto.id, item.cantidad + 1);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-gray-100 hover:bg-primary hover:text-white border-gray-200"
                          onClick={() => addToCart(producto)}
                        >
                          Add to Dish
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Columna derecha - Ticket (1/3 del ancho) */}
        <div className="w-96 border-l border-gray-200 bg-white flex flex-col h-full">
          {/* Encabezado del ticket */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold">Table {tableNumber}</h2>
              <Button variant="outline" size="sm">
                <Edit2 className="h-4 w-4 mr-1" /> 
                <span>Floyd Miles</span>
              </Button>
            </div>
            
            {/* Pestañas de tipo de orden */}
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <Button 
                variant={activeOrderTab === "dineIn" ? "default" : "ghost"} 
                className="flex-1 rounded-md"
                onClick={() => setActiveOrderTab("dineIn")}
              >
                Dine In
              </Button>
              <Button 
                variant={activeOrderTab === "takeAway" ? "default" : "ghost"} 
                className="flex-1 rounded-md"
                onClick={() => setActiveOrderTab("takeAway")}
              >
                Take Away
              </Button>
              <Button 
                variant={activeOrderTab === "delivery" ? "default" : "ghost"} 
                className="flex-1 rounded-md"
                onClick={() => setActiveOrderTab("delivery")}
              >
                Delivery
              </Button>
            </div>
          </div>
          
          {/* Lista de productos en el carrito */}
          <div className="flex-1 overflow-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-6 text-center">
                <ShoppingBag className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500">El carrito está vacío</p>
                <p className="text-sm text-gray-400">Agrega productos para iniciar la venta</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img 
                      src={productos.find(p => p.id === item.id)?.imagen || ""}
                      alt={item.nombre}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-sm line-clamp-2">{item.nombre}</h3>
                        <button onClick={() => removeFromCart(item.id)}>
                          <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-primary font-bold">${item.precioVenta.toFixed(2)}</div>
                        <div className="flex items-center border rounded-md">
                          <button 
                            className="px-2 py-1 text-gray-500"
                            onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 py-1 text-sm font-medium">{item.cantidad}x</span>
                          <button 
                            className="px-2 py-1 text-gray-500"
                            onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="font-semibold ml-2">${(item.precioVenta * item.cantidad).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Resumen y total */}
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Sub Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax 5%</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total Amount</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Opciones de pago */}
            <div className="grid grid-cols-3 gap-2 my-4">
              <Button variant="outline" size="sm" className="h-12 w-full flex flex-col items-center justify-center p-0">
                <DollarSign className="h-5 w-5" />
                <span className="text-xs">Cash</span>
              </Button>
              <Button variant="outline" size="sm" className="h-12 w-full flex flex-col items-center justify-center p-0">
                <CreditCard className="h-5 w-5" />
                <span className="text-xs">Credit / Debit Card</span>
              </Button>
              <Button variant="outline" size="sm" className="h-12 w-full flex flex-col items-center justify-center p-0">
                <QrCode className="h-5 w-5" />
                <span className="text-xs">QR Code</span>
              </Button>
            </div>
            
            {/* Botón de finalizar */}
            <Button className="w-full h-12 mt-2 bg-green-600 hover:bg-green-700 text-white font-bold">
              Place Order
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default POSPage;