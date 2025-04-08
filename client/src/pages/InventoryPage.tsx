import React, { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import {
  Search as SearchIcon,
  Filter as FilterIcon,
  Package,
  ShoppingBag,
  RefreshCw,
  PlusCircle,
  Download,
  Printer,
  Clock,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  Boxes,
  Pencil,
  Truck,
  FileText,
  CalendarDays,
} from "lucide-react";

// Datos de ejemplo para la interfaz
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

const movimientosInventario = [
  { 
    id: 1, 
    fecha: "07 Abr 2025, 10:30 AM", 
    tipo: "Entrada", 
    producto: "Hamburguesa Clásica", 
    sku: "BURG-001", 
    cantidad: 50, 
    usuario: "Carlos Martínez", 
    referencia: "OC-2025-042", 
    nota: "Recepción de pedido semanal" 
  },
  { 
    id: 2, 
    fecha: "06 Abr 2025, 6:15 PM", 
    tipo: "Salida", 
    producto: "Pizza Margarita", 
    sku: "PIZ-034", 
    cantidad: 12, 
    usuario: "Ana López", 
    referencia: "PED-4720", 
    nota: "Venta a cliente" 
  },
  { 
    id: 3, 
    fecha: "06 Abr 2025, 3:45 PM", 
    tipo: "Ajuste", 
    producto: "Brownie de Chocolate", 
    sku: "POS-008", 
    cantidad: -3, 
    usuario: "Juan Pérez", 
    referencia: "AJ-2025-018", 
    nota: "Merma por caducidad" 
  },
  { 
    id: 4, 
    fecha: "05 Abr 2025, 11:20 AM", 
    tipo: "Transferencia", 
    producto: "Agua Mineral 500ml", 
    sku: "BEB-012", 
    cantidad: 24, 
    usuario: "María González", 
    referencia: "TR-2025-007", 
    nota: "Transferencia a sucursal Norte" 
  },
];

const categorias = [
  { id: 1, nombre: "Hamburguesas" },
  { id: 2, nombre: "Pizzas" },
  { id: 3, nombre: "Bebidas" },
  { id: 4, nombre: "Postres" },
  { id: 5, nombre: "Ensaladas" },
];

const proveedores = [
  { id: 1, nombre: "Carnes Premium S.A." },
  { id: 2, nombre: "Insumos Italianos" },
  { id: 3, nombre: "Distribuidora de Bebidas" },
  { id: 4, nombre: "Repostería Dulce Hogar" },
  { id: 5, nombre: "Productos Frescos S.L." },
];

const InventoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("products");
  const [isCreateProductDialogOpen, setIsCreateProductDialogOpen] = useState(false);
  const [isAdjustStockDialogOpen, setIsAdjustStockDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isEditProductDialogOpen, setIsEditProductDialogOpen] = useState(false);

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setIsEditProductDialogOpen(true);
  };

  const handleAdjustStock = (product: any) => {
    setSelectedProduct(product);
    setIsAdjustStockDialogOpen(true);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Inventario</h1>
            <p className="text-sm text-gray-500">Administra tus productos y stock</p>
          </div>
          
          {/* Dashboard de métricas horizontal */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 md:mt-0">
            <div className="bg-background border rounded-md p-2 shadow-sm">
              <div className="text-xs text-muted-foreground mb-1">Total Productos</div>
              <div className="text-base font-semibold">125</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <span>↑ 8 este mes</span>
              </div>
            </div>
            
            <div className="bg-background border rounded-md p-2 shadow-sm">
              <div className="text-xs text-muted-foreground mb-1">Valor Inventario</div>
              <div className="text-base font-semibold">{formatCurrency(75980.50)}</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <span>↑ 12% vs mes anterior</span>
              </div>
            </div>
            
            <div className="bg-background border rounded-md p-2 shadow-sm">
              <div className="text-xs text-muted-foreground mb-1">Stock Bajo</div>
              <div className="text-base font-semibold">8</div>
              <div className="flex items-center text-xs text-red-600 mt-1">
                <span>3 críticos</span>
              </div>
            </div>
            
            <div className="bg-background border rounded-md p-2 shadow-sm">
              <div className="text-xs text-muted-foreground mb-1">Movimientos</div>
              <div className="text-base font-semibold">42</div>
              <div className="flex items-center text-xs text-blue-600 mt-1">
                <span>Últimos 30 días</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Ya no necesitamos las tarjetas antiguas */}
        <div className="hidden">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Package className="mr-2 h-4 w-4 text-primary" />
                <div className="text-2xl font-bold">125</div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="text-green-500">↑ 8</span> nuevos productos este mes
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Valor del Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ShoppingBag className="mr-2 h-4 w-4 text-primary" />
                <div className="text-2xl font-bold">{formatCurrency(75980.50)}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="text-green-500">↑ 12%</span> comparado con el mes pasado
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Productos con Stock Bajo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
                <div className="text-2xl font-bold">8</div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="text-red-500">3 críticos</span> requieren atención inmediata
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Movimientos Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-primary" />
                <div className="text-2xl font-bold">42</div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="text-blue-500">12 entradas</span>, <span className="text-orange-500">24 salidas</span>, <span className="text-purple-500">6 ajustes</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Principales */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6 space-y-4">
          <TabsList className="flex gap-2 w-full border-b pb-1">
            <TabsTrigger value="products" className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none">
              Listado de Productos
            </TabsTrigger>
            <TabsTrigger value="movements" className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none">
              Movimientos de Inventario
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none">
              Alertas de Stock
            </TabsTrigger>
          </TabsList>

          {/* PRODUCTOS */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input type="text" placeholder="Buscar por nombre, SKU o descripción..." className="pl-9" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <FilterIcon className="h-4 w-4" />
                  <span>Filtrar</span>
                </Button>
                <select className="h-9 px-3 py-1 bg-white border border-gray-200 rounded-md text-sm">
                  <option value="">Todas las categorías</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
                <select className="h-9 px-3 py-1 bg-white border border-gray-200 rounded-md text-sm">
                  <option value="">Todos los estados</option>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="draft">Borrador</option>
                </select>
                <select className="h-9 px-3 py-1 bg-white border border-gray-200 rounded-md text-sm">
                  <option value="">Stock</option>
                  <option value="in_stock">En stock</option>
                  <option value="low_stock">Stock bajo</option>
                  <option value="out_of_stock">Sin stock</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Catálogo de Productos</h2>
                <p className="text-gray-500 text-sm">Gestiona todos los productos de tu inventario</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  <span>Exportar</span>
                </Button>
                <Dialog open={isCreateProductDialogOpen} onOpenChange={setIsCreateProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-1">
                      <PlusCircle className="h-4 w-4" />
                      <span>Nuevo Producto</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Crear Nuevo Producto</DialogTitle>
                      <DialogDescription>
                        Completa la información para agregar un nuevo producto al inventario
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="nombre">Nombre del Producto *</Label>
                          <Input id="nombre" placeholder="Ej: Hamburguesa Clásica" />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="sku">SKU (Código único) *</Label>
                          <Input id="sku" placeholder="Ej: PROD-001" />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="categoria">Categoría *</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar categoría" />
                            </SelectTrigger>
                            <SelectContent>
                              {categorias.map(cat => (
                                <SelectItem key={cat.id} value={cat.id.toString()}>{cat.nombre}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="descripcion">Descripción</Label>
                          <textarea 
                            id="descripcion"
                            className="min-h-[120px] px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Descripción detallada del producto"
                          ></textarea>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="estado">Estado *</Label>
                          <Select defaultValue="active">
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Activo</SelectItem>
                              <SelectItem value="inactive">Inactivo</SelectItem>
                              <SelectItem value="draft">Borrador</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="precioCosto">Precio de Costo *</Label>
                            <Input id="precioCosto" type="number" min="0" step="0.01" placeholder="0.00" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="precioVenta">Precio de Venta *</Label>
                            <Input id="precioVenta" type="number" min="0" step="0.01" placeholder="0.00" />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="stockActual">Stock Inicial *</Label>
                            <Input id="stockActual" type="number" min="0" placeholder="0" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="stockMinimo">Stock Mínimo *</Label>
                            <Input id="stockMinimo" type="number" min="0" placeholder="10" />
                          </div>
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="proveedor">Proveedor</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar proveedor" />
                            </SelectTrigger>
                            <SelectContent>
                              {proveedores.map(prov => (
                                <SelectItem key={prov.id} value={prov.id.toString()}>{prov.nombre}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid gap-2">
                          <Label>Imagen del Producto</Label>
                          <div className="border-2 border-dashed border-gray-200 rounded-md p-6 text-center">
                            <div className="flex flex-col items-center">
                              <Package className="h-8 w-8 text-gray-400" />
                              <p className="mt-2 text-sm text-gray-500">Haz clic para seleccionar o arrastra una imagen aquí</p>
                            </div>
                            <input type="file" className="hidden" />
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="etiquetas">Etiquetas</Label>
                          <Input id="etiquetas" placeholder="Separadas por comas (ej: popular, oferta, nuevo)" />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                      </DialogClose>
                      <Button type="submit">Crear Producto</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Vista de Tarjetas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...productos, ...productos, ...productos].map((producto, index) => (
                <div 
                  key={`product-card-${producto.id}-${index}`} 
                  className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Badge de descuento/oferta en esquina superior izquierda - solo para productos con descuento */}
                  {producto.id === 2 && (
                    <div className="absolute top-2 left-2 z-10">
                      <div className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                        20% OFF
                      </div>
                    </div>
                  )}
                  
                  {/* Imagen del producto */}
                  <div className="h-36 w-full bg-gray-100 relative flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-300" />
                  </div>
                  
                  {/* Detalles del producto */}
                  <div className="p-3">
                    {/* Título y categoría */}
                    <div className="mb-1.5">
                      <h3 className="font-medium text-sm truncate">{producto.nombre}</h3>
                      <p className="text-xs text-gray-500">{producto.categoria}</p>
                    </div>
                    
                    {/* Precio y badge */}
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-bold text-sm text-green-600">{formatCurrency(producto.precioVenta)}</p>
                        {producto.precioVenta < producto.precioCompra * 1.3 && (
                          <p className="text-xs text-gray-400 line-through">{formatCurrency(producto.precioCompra * 1.5)}</p>
                        )}
                      </div>
                      <div>
                        <Badge 
                          variant={producto.categoria === "Hamburguesas" ? "outline" : "default"}
                          className={`text-xs px-1.5 py-0.5 ${producto.categoria === "Hamburguesas" ? "bg-red-100 hover:bg-red-100 text-red-800 border-red-400" : ""}`}
                        >
                          {producto.categoria === "Hamburguesas" ? "Non-Veg" : "Veg"}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Controles y botones */}
                    <div className="flex items-center justify-between mt-2">
                      {/* Selector de cantidad */}
                      <div className="flex items-center border rounded-md text-sm">
                        <button className="px-1 py-0.5 text-primary">-</button>
                        <span className="px-2 py-0.5 border-x text-xs">1</span>
                        <button className="px-1 py-0.5 text-primary">+</button>
                      </div>
                      
                      {/* Botones de acción */}
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-white bg-primary hover:bg-primary/90 border-primary rounded-md"
                          onClick={() => handleEditProduct(producto)}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-white bg-red-500 hover:bg-red-600 border-red-500 rounded-md"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-500">
                Mostrando 1-5 de 125 productos
              </div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled>Anterior</Button>
                <Button variant="outline" size="sm">Siguiente</Button>
              </div>
            </div>

          </TabsContent>

          {/* MOVIMIENTOS DE INVENTARIO */}
          <TabsContent value="movements" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold">Movimientos de Inventario</h2>
                <p className="text-gray-500 text-sm">Historial de entradas, salidas y ajustes de stock</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-1">
                  <RefreshCw className="h-4 w-4" />
                  <span>Actualizar</span>
                </Button>
                <Button className="flex items-center gap-1">
                  <PlusCircle className="h-4 w-4" />
                  <span>Nuevo Movimiento</span>
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle>Registros de Movimientos</CardTitle>
                  <CardDescription>
                    Todas las transacciones realizadas en tu inventario
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Printer className="h-4 w-4" />
                    <span>Imprimir</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    <span>Exportar</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4">
                  <div className="flex-1 relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input type="text" placeholder="Buscar por producto, referencia o usuario..." className="pl-9" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select className="h-9 px-3 py-1 bg-white border border-gray-200 rounded-md text-sm">
                      <option value="">Todos los tipos</option>
                      <option value="entrada">Entradas</option>
                      <option value="salida">Salidas</option>
                      <option value="ajuste">Ajustes</option>
                      <option value="transferencia">Transferencias</option>
                    </select>
                    <Input type="date" className="h-9 w-auto" />
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {movimientosInventario.map((movimiento) => (
                      <div key={movimiento.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        {/* Cabecera con fecha y tipo */}
                        <div className="p-3 border-b flex justify-between items-center">
                          <div className="text-sm text-gray-500">
                            <CalendarDays className="h-4 w-4 inline-block mr-1" /> 
                            {movimiento.fecha}
                          </div>
                          <Badge 
                            variant="outline" 
                            className={
                              movimiento.tipo === "Entrada" ? "bg-green-100 hover:bg-green-100 text-green-800 border-green-400" :
                              movimiento.tipo === "Salida" ? "bg-red-100 hover:bg-red-100 text-red-800 border-red-400" :
                              movimiento.tipo === "Ajuste" ? "bg-blue-100 hover:bg-blue-100 text-blue-800 border-blue-400" :
                              "bg-purple-100 hover:bg-purple-100 text-purple-800 border-purple-400"
                            }
                          >
                            {movimiento.tipo}
                          </Badge>
                        </div>
                        
                        {/* Contenido */}
                        <div className="p-4">
                          <div className="mb-3">
                            <h3 className="font-medium truncate">{movimiento.producto}</h3>
                            <p className="text-xs text-gray-500">SKU: {movimiento.sku}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div>
                              <p className="text-xs text-gray-500">Cantidad</p>
                              <div className="flex items-center font-medium">
                                {movimiento.tipo === "Entrada" || (movimiento.tipo === "Ajuste" && movimiento.cantidad > 0) ? (
                                  <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                                ) : (
                                  <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                                )}
                                {Math.abs(movimiento.cantidad)}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Usuario</p>
                              <p className="font-medium">{movimiento.usuario}</p>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <p className="text-xs text-gray-500">Referencia</p>
                            <p className="text-sm">{movimiento.referencia}</p>
                          </div>
                          
                          {movimiento.nota && (
                            <div className="bg-gray-50 p-2 rounded-md text-sm">
                              <p className="text-xs text-gray-500 mb-1">Nota:</p>
                              <p className="text-xs">{movimiento.nota}</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Footer con acciones */}
                        <div className="p-3 border-t flex justify-end">
                          <Button variant="ghost" size="sm" className="text-primary">
                            <FileText className="h-4 w-4 mr-1" />
                            Ver detalles
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center p-4">
                  <div className="text-sm text-gray-500">
                    Mostrando 1-4 de 42 movimientos
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" disabled>Anterior</Button>
                    <Button variant="outline" size="sm">Siguiente</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ALERTAS DE STOCK */}
          <TabsContent value="alerts" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold">Alertas de Stock</h2>
                <p className="text-gray-500 text-sm">Productos que requieren reabastecimiento</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  <span>Exportar Lista</span>
                </Button>
                <Button className="flex items-center gap-1">
                  <Truck className="h-4 w-4" />
                  <span>Generar Orden de Compra</span>
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="p-4 border-b">
                  <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 p-3 rounded-md">
                    <AlertTriangle className="h-5 w-5" />
                    <div>
                      <span className="font-medium">Atención:</span> Los siguientes productos están por debajo del nivel mínimo de stock recomendado.
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {productos.filter(p => p.stock < p.stockMinimo).map((producto) => (
                      <div key={producto.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        {/* Header con nivel de alerta */}
                        <div className={`p-2 flex justify-between items-center ${producto.stock < producto.stockMinimo / 2 ? 'bg-red-50' : 'bg-yellow-50'}`}>
                          <Badge 
                            variant={producto.stock < producto.stockMinimo / 2 ? "destructive" : "outline"} 
                            className={producto.stock >= producto.stockMinimo / 2 ? "bg-yellow-100 hover:bg-yellow-100 text-yellow-800 border-yellow-400" : ""}
                          >
                            {producto.stock < producto.stockMinimo / 2 ? "Crítico" : "Bajo"}
                          </Badge>
                          {producto.stock < producto.stockMinimo / 2 && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        
                        {/* Imagen del producto */}
                        <div className="h-36 w-full bg-gray-100 relative flex items-center justify-center">
                          <Package className="h-12 w-12 text-gray-300" />
                        </div>
                        
                        {/* Detalles del producto */}
                        <div className="p-4">
                          <div className="mb-3">
                            <h3 className="font-medium truncate">{producto.nombre}</h3>
                            <p className="text-xs text-gray-500">SKU: {producto.sku}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-500">Stock Actual</p>
                              <p className={`font-bold ${producto.stock < producto.stockMinimo / 2 ? 'text-red-600' : 'text-yellow-600'}`}>{producto.stock}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Stock Mínimo</p>
                              <p className="font-medium">{producto.stockMinimo}</p>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <p className="text-xs text-gray-500">Proveedor</p>
                            <p className="text-sm font-medium">{producto.proveedor}</p>
                          </div>
                          
                          <div className="mb-4">
                            <p className="text-xs text-gray-500">Última Compra</p>
                            <p className="text-sm">05 Abr 2025</p>
                          </div>
                          
                          {/* Botones de acción */}
                          <div className="flex gap-2">
                            <Button variant="outline" className="flex-1 flex items-center justify-center gap-1">
                              <Truck className="h-4 w-4" />
                              <span>Reabastecer</span>
                            </Button>
                            <Button variant="ghost" className="p-2">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal para Editar Producto */}
      <Dialog open={isEditProductDialogOpen} onOpenChange={setIsEditProductDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>
              Modifica la información del producto seleccionado
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-nombre">Nombre del Producto *</Label>
                  <Input id="edit-nombre" defaultValue={selectedProduct.nombre} />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-sku">SKU (Código único) *</Label>
                  <Input id="edit-sku" defaultValue={selectedProduct.sku} />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-categoria">Categoría *</Label>
                  <Select defaultValue={selectedProduct.categoria}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(cat => (
                        <SelectItem key={cat.id} value={cat.nombre}>{cat.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-descripcion">Descripción</Label>
                  <textarea 
                    id="edit-descripcion"
                    className="min-h-[120px] px-3 py-2 border border-gray-300 rounded-md"
                    defaultValue={selectedProduct.descripcion}
                  ></textarea>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-estado">Estado *</Label>
                  <Select defaultValue={selectedProduct.estado.toLowerCase()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                      <SelectItem value="borrador">Borrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-precioCosto">Precio de Costo *</Label>
                    <Input id="edit-precioCosto" type="number" min="0" step="0.01" defaultValue={selectedProduct.precioCompra} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-precioVenta">Precio de Venta *</Label>
                    <Input id="edit-precioVenta" type="number" min="0" step="0.01" defaultValue={selectedProduct.precioVenta} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-stockActual">Stock Actual *</Label>
                    <Input id="edit-stockActual" type="number" min="0" defaultValue={selectedProduct.stock} disabled />
                    <p className="text-xs text-gray-500">Para ajustar el stock, use la opción de Ajuste de Stock</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-stockMinimo">Stock Mínimo *</Label>
                    <Input id="edit-stockMinimo" type="number" min="0" defaultValue={selectedProduct.stockMinimo} />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-proveedor">Proveedor</Label>
                  <Select defaultValue={selectedProduct.proveedor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {proveedores.map(prov => (
                        <SelectItem key={prov.id} value={prov.nombre}>{prov.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label>Imagen del Producto</Label>
                  <div className="border-2 border-dashed border-gray-200 rounded-md p-6 text-center">
                    <div className="flex flex-col items-center">
                      <Package className="h-8 w-8 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">Haz clic para cambiar o arrastra una imagen aquí</p>
                    </div>
                    <input type="file" className="hidden" />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-etiquetas">Etiquetas</Label>
                  <Input id="edit-etiquetas" placeholder="Separadas por comas (ej: popular, oferta, nuevo)" />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit">Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Ajuste de Stock */}
      <Dialog open={isAdjustStockDialogOpen} onOpenChange={setIsAdjustStockDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajuste de Stock</DialogTitle>
            <DialogDescription>
              Registrar entrada, salida o ajuste de inventario
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <div className="font-medium">{selectedProduct.nombre}</div>
                  <div className="text-xs text-muted-foreground">SKU: {selectedProduct.sku} | Stock Actual: {selectedProduct.stock}</div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="movimiento-tipo">Tipo de Movimiento *</Label>
                <Select defaultValue="entrada">
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada de Stock</SelectItem>
                    <SelectItem value="salida">Salida de Stock</SelectItem>
                    <SelectItem value="ajuste">Ajuste de Inventario</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="movimiento-cantidad">Cantidad *</Label>
                <Input id="movimiento-cantidad" type="number" min="1" placeholder="0" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="movimiento-referencia">Referencia</Label>
                <Input id="movimiento-referencia" placeholder="Ej: OC-2025-042, PED-4720, etc." />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="movimiento-nota">Nota / Motivo</Label>
                <textarea 
                  id="movimiento-nota"
                  className="min-h-[80px] px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Descripción del motivo del ajuste"
                ></textarea>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit">Registrar Movimiento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default InventoryPage;