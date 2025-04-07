import React, { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import {
  CalendarIcon,
  Package2Icon,
  TrendingUpIcon,
  WalletIcon,
  Users,
  ShoppingCart,
  BarChart2,
  ClipboardList,
  PlusIcon,
  SearchIcon,
  FilterIcon,
  Eye,
  Download,
  Printer,
  CheckSquare,
  Truck,
  AlertCircle,
  RefreshCw,
  Clock,
  Settings,
  UserPlus,
  ShoppingBag,
  Edit,
  Trash2,
  Tag,
  Save,
  X,
  Image as ImageIcon,
  Upload,
  ChevronRight,
  Bookmark,
  FileText,
  Box,
  DollarSign,
  Percent,
  Copy,
} from "lucide-react";

// Datos simulados para los gráficos
const ventasPorSemana = [
  { nombre: 'Semana 1', ventas: 4000 },
  { nombre: 'Semana 2', ventas: 3000 },
  { nombre: 'Semana 3', ventas: 5000 },
  { nombre: 'Semana 4', ventas: 8000 },
  { nombre: 'Semana 5', ventas: 6000 },
];

const gananciasPorMes = [
  { mes: 'Ene', ganancias: 12400 },
  { mes: 'Feb', ganancias: 15600 },
  { mes: 'Mar', ganancias: 18000 },
  { mes: 'Abr', ganancias: 16500 },
  { mes: 'May', ganancias: 20100 },
  { mes: 'Jun', ganancias: 22000 },
  { mes: 'Jul', ganancias: 26500 },
];

const ventasPorCategoria = [
  { name: "Hamburguesas", value: 35 },
  { name: "Pizzas", value: 25 },
  { name: "Bebidas", value: 15 },
  { name: "Postres", value: 10 },
  { name: "Otros", value: 15 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const productosMasVendidos = [
  { id: 1, nombre: "Hamburguesa Clásica", ventas: 156, ingreso: 3120, imagen: "/placeholder-burger.jpg", stock: 45, sku: "BURG-001" },
  { id: 2, nombre: "Tacos de Pollo", ventas: 142, ingreso: 2840, imagen: "/placeholder-tacos.jpg", stock: 32, sku: "TAC-025" },
  { id: 3, nombre: "Jugo de Naranja", ventas: 98, ingreso: 1176, imagen: "/placeholder-juice.jpg", stock: 64, sku: "BEB-103" },
  { id: 4, nombre: "Sushi Mixto", ventas: 87, ingreso: 1740, imagen: "/placeholder-sushi.jpg", stock: 21, sku: "SUS-042" },
  { id: 5, nombre: "Ensalada Vegetariana", ventas: 76, ingreso: 1140, imagen: "/placeholder-salad.jpg", stock: 39, sku: "ENS-017" },
];

const inventarioBajo = [
  { id: 1, nombre: "Pan de hamburguesa", actual: 24, minimo: 50, sku: "MP-001" },
  { id: 2, nombre: "Tortillas", actual: 35, minimo: 60, sku: "MP-032" },
  { id: 3, nombre: "Pechuga de pollo", actual: 8, minimo: 20, sku: "MP-015" },
  { id: 4, nombre: "Aguacate", actual: 12, minimo: 25, sku: "MP-108" },
];

const proveedores = [
  { id: 1, nombre: "Distribuidora Alimentos JR", direccion: "Av. Principal 123", telefono: "555-1234", email: "contacto@alimentosjr.com" },
  { id: 2, nombre: "Productos Frescos SL", direccion: "Calle Comercial 45", telefono: "555-5678", email: "ventas@productosfrescos.com" },
  { id: 3, nombre: "Carnes y Embutidos del Valle", direccion: "Boulevard Central 78", telefono: "555-8901", email: "pedidos@carnesvalle.com" },
];

const ultimosPedidos = [
  { id: "PED-4721", cliente: "Juan Pérez", fecha: "07 Abr 2025", total: 156.99, estado: "Entregado", items: 5 },
  { id: "PED-4720", cliente: "María López", fecha: "07 Abr 2025", total: 89.50, estado: "En proceso", items: 3 },
  { id: "PED-4719", cliente: "Carlos González", fecha: "06 Abr 2025", total: 210.75, estado: "Pendiente", items: 8 },
  { id: "PED-4718", cliente: "Ana Martínez", fecha: "06 Abr 2025", total: 45.25, estado: "Cancelado", items: 2 },
  { id: "PED-4717", cliente: "Roberto Sánchez", fecha: "05 Abr 2025", total: 125.40, estado: "Entregado", items: 4 },
];

// Categorías de productos
const categorias = [
  { id: 1, nombre: "Hamburguesas" },
  { id: 2, nombre: "Pizzas" },
  { id: 3, nombre: "Bebidas" },
  { id: 4, nombre: "Postres" },
  { id: 5, nombre: "Ensaladas" },
  { id: 6, nombre: "Tacos" },
  { id: 7, nombre: "Sushi" },
  { id: 8, nombre: "Materias Primas" },
];

// Lista completa de productos
const productos = [
  { 
    id: 1, 
    nombre: "Hamburguesa Clásica", 
    descripcion: "Hamburguesa con lechuga, tomate, cebolla y queso cheddar", 
    sku: "BURG-001", 
    precio_costo: 8.50, 
    precio_venta: 15.99, 
    stock_actual: 45, 
    stock_minimo: 20, 
    categoria_id: 1, 
    proveedor_id: 1, 
    etiquetas: ["Popular", "Carne", "Clásico"], 
    estado: "activo",
    variantes: [
      { id: 1, nombre: "Regular", precio: 15.99, stock: 30 },
      { id: 2, nombre: "Grande", precio: 18.99, stock: 15 }
    ]
  },
  { 
    id: 2, 
    nombre: "Pizza Margarita", 
    descripcion: "Pizza tradicional italiana con tomate, mozzarella y albahaca", 
    sku: "PIZ-042", 
    precio_costo: 7.20, 
    precio_venta: 14.50, 
    stock_actual: 38, 
    stock_minimo: 15, 
    categoria_id: 2, 
    proveedor_id: 2, 
    etiquetas: ["Vegetariano", "Italiano"], 
    estado: "activo",
    variantes: [
      { id: 3, nombre: "Mediana", precio: 14.50, stock: 20 },
      { id: 4, nombre: "Familiar", precio: 22.99, stock: 18 }
    ]
  },
  { 
    id: 3, 
    nombre: "Jugo de Naranja", 
    descripcion: "Jugo de naranja natural recién exprimido", 
    sku: "BEB-103", 
    precio_costo: 2.30, 
    precio_venta: 5.99, 
    stock_actual: 64, 
    stock_minimo: 25, 
    categoria_id: 3, 
    proveedor_id: 2, 
    etiquetas: ["Natural", "Sin azúcar"], 
    estado: "activo",
    variantes: [
      { id: 5, nombre: "Regular (350ml)", precio: 5.99, stock: 40 },
      { id: 6, nombre: "Grande (500ml)", precio: 7.99, stock: 24 }
    ]
  },
  { 
    id: 4, 
    nombre: "Taco de Carnitas", 
    descripcion: "Taco tradicional mexicano con carnitas, cebolla y cilantro", 
    sku: "TAC-025", 
    precio_costo: 3.80, 
    precio_venta: 8.50, 
    stock_actual: 32, 
    stock_minimo: 20, 
    categoria_id: 6, 
    proveedor_id: 3, 
    etiquetas: ["Mexicano", "Picante"], 
    estado: "activo",
    variantes: []
  },
  { 
    id: 5, 
    nombre: "Pastel de Chocolate", 
    descripcion: "Delicioso pastel de chocolate con ganache", 
    sku: "POS-078", 
    precio_costo: 12.50, 
    precio_venta: 24.99, 
    stock_actual: 15, 
    stock_minimo: 10, 
    categoria_id: 4, 
    proveedor_id: 2, 
    etiquetas: ["Postre", "Dulce"], 
    estado: "activo",
    variantes: [
      { id: 7, nombre: "Individual", precio: 6.99, stock: 8 },
      { id: 8, nombre: "Entero", precio: 24.99, stock: 7 }
    ]
  },
];

// Componente de gestión de productos
const ProductManagement = () => {
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | "">("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("nombre");
  const [showNewProductForm, setShowNewProductForm] = useState(false);

  // Filtrar productos según los criterios
  const filteredProducts = productos.filter((producto) => {
    const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           producto.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "" || producto.categoria_id === categoryFilter;
    const matchesStatus = statusFilter === "" || producto.estado === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case "nombre":
        return a.nombre.localeCompare(b.nombre);
      case "precio_asc":
        return a.precio_venta - b.precio_venta;
      case "precio_desc":
        return b.precio_venta - a.precio_venta;
      case "stock":
        return a.stock_actual - b.stock_actual;
      default:
        return 0;
    }
  });

  // Manejar la edición de un producto
  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setIsEditing(true);
    setShowNewProductForm(false);
  };

  // Manejar la creación de un producto nuevo
  const handleNewProduct = () => {
    setSelectedProduct(null);
    setIsEditing(false);
    setShowNewProductForm(true);
  };

  // Obtener categoría por ID
  const getCategoryName = (categoryId: number) => {
    const category = categorias.find(cat => cat.id === categoryId);
    return category ? category.nombre : "Sin categoría";
  };

  // Obtener proveedor por ID
  const getProviderName = (providerId: number) => {
    const provider = proveedores.find(prov => prov.id === providerId);
    return provider ? provider.nombre : "Sin proveedor";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión de Productos</h2>
        <Button onClick={handleNewProduct}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Sección de lista de productos o formulario nuevo/editar */}
      {!showNewProductForm && !isEditing ? (
        <>
          {/* Filtros y búsqueda */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Buscar por nombre, SKU o descripción..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <select 
                    className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value === "" ? "" : Number(e.target.value))}
                  >
                    <option value="">Todas las categorías</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                  </select>
                  <select 
                    className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Todos los estados</option>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="borrador">Borrador</option>
                  </select>
                  <select 
                    className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="nombre">Ordenar por nombre</option>
                    <option value="precio_asc">Precio: menor a mayor</option>
                    <option value="precio_desc">Precio: mayor a menor</option>
                    <option value="stock">Stock: menor a mayor</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de productos */}
          <Card>
            <CardHeader>
              <CardTitle>Catálogo de Productos</CardTitle>
              <CardDescription>
                Administra todos los productos disponibles en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium">Producto</th>
                      <th className="text-left py-3 px-2 font-medium">SKU</th>
                      <th className="text-left py-3 px-2 font-medium">Precio Costo</th>
                      <th className="text-left py-3 px-2 font-medium">Precio Venta</th>
                      <th className="text-left py-3 px-2 font-medium">Stock</th>
                      <th className="text-left py-3 px-2 font-medium">Categoría</th>
                      <th className="text-left py-3 px-2 font-medium">Estado</th>
                      <th className="text-left py-3 px-2 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((producto) => (
                      <tr key={producto.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-md bg-gray-200 mr-3">
                              {/* Espacio para imagen */}
                            </div>
                            <div>
                              <div className="font-medium">{producto.nombre}</div>
                              <div className="text-xs text-muted-foreground line-clamp-1">{producto.descripcion}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">{producto.sku}</td>
                        <td className="py-3 px-2">{formatCurrency(producto.precio_costo)}</td>
                        <td className="py-3 px-2">{formatCurrency(producto.precio_venta)}</td>
                        <td className="py-3 px-2">
                          <Badge 
                            variant={
                              producto.stock_actual <= 0 ? "destructive" : 
                              producto.stock_actual < producto.stock_minimo ? "outline" : "default"
                            }
                            className={
                              producto.stock_actual < producto.stock_minimo && producto.stock_actual > 0 ? 
                              "bg-yellow-100 hover:bg-yellow-100 text-yellow-800 border-yellow-400" : ""
                            }
                          >
                            {producto.stock_actual}
                          </Badge>
                          <span className="text-xs text-muted-foreground ml-1">Min: {producto.stock_minimo}</span>
                        </td>
                        <td className="py-3 px-2">{getCategoryName(producto.categoria_id)}</td>
                        <td className="py-3 px-2">
                          <Badge
                            variant={producto.estado === "activo" ? "default" : "outline"}
                            className={
                              producto.estado === "inactivo" ? "bg-gray-100 hover:bg-gray-100 text-gray-800 border-gray-400" :
                              producto.estado === "borrador" ? "bg-blue-100 hover:bg-blue-100 text-blue-800 border-blue-400" : ""
                            }
                          >
                            {producto.estado.charAt(0).toUpperCase() + producto.estado.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEditProduct(producto)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredProducts.length === 0 && (
                <div className="text-center py-8">
                  <Box className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900">No se encontraron productos</h3>
                  <p className="text-gray-500 mt-1">
                    Prueba con diferentes filtros o crea un nuevo producto.
                  </p>
                  <Button onClick={handleNewProduct} className="mt-4">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Nuevo Producto
                  </Button>
                </div>
              )}
              {filteredProducts.length > 0 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    Mostrando {filteredProducts.length} de {productos.length} productos
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" disabled>Anterior</Button>
                    <Button variant="outline" size="sm">Siguiente</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        /* Formulario de producto (nuevo o edición) */
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{isEditing ? "Editar Producto" : "Nuevo Producto"}</CardTitle>
              <CardDescription>
                {isEditing 
                  ? `Editando: ${selectedProduct?.nombre}` 
                  : "Completa la información para crear un nuevo producto"}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => {
              setIsEditing(false);
              setShowNewProductForm(false);
              setSelectedProduct(null);
            }}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Columna 1: Información básica */}
              <div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Información Básica</h3>
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="nombre">Nombre del Producto *</Label>
                        <Input 
                          id="nombre" 
                          placeholder="Ej. Hamburguesa Clásica" 
                          defaultValue={selectedProduct?.nombre || ""} 
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="sku">SKU (Código único) *</Label>
                        <div className="flex">
                          <Input 
                            id="sku" 
                            placeholder="Ej. BURG-001" 
                            defaultValue={selectedProduct?.sku || ""} 
                          />
                          <Button variant="outline" className="ml-2">
                            Generar
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Código único para identificar este producto</p>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Textarea 
                          id="descripcion" 
                          placeholder="Describe el producto..." 
                          rows={4}
                          defaultValue={selectedProduct?.descripcion || ""} 
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-3">Estado y Categorización</h3>
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="categoria">Categoría *</Label>
                        <select 
                          id="categoria"
                          className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                          defaultValue={selectedProduct?.categoria_id || ""}
                        >
                          <option value="" disabled>Selecciona una categoría</option>
                          {categorias.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="estado">Estado *</Label>
                        <select 
                          id="estado"
                          className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                          defaultValue={selectedProduct?.estado || "activo"}
                        >
                          <option value="activo">Activo</option>
                          <option value="inactivo">Inactivo</option>
                          <option value="borrador">Borrador</option>
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="etiquetas">Etiquetas</Label>
                        <Input 
                          id="etiquetas" 
                          placeholder="Separa las etiquetas con comas" 
                          defaultValue={selectedProduct?.etiquetas?.join(", ") || ""} 
                        />
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(selectedProduct?.etiquetas || []).map((tag: string, index: number) => (
                            <Badge key={index} variant="outline" className="bg-primary/10 text-primary border-primary/20">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna 2: Precios e Inventario */}
              <div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Precios</h3>
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="precio_costo">Precio de Costo *</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input 
                            id="precio_costo" 
                            type="number" 
                            step="0.01" 
                            min="0" 
                            className="pl-9"
                            defaultValue={selectedProduct?.precio_costo || ""} 
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="precio_venta">Precio de Venta *</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input 
                            id="precio_venta" 
                            type="number" 
                            step="0.01" 
                            min="0" 
                            className="pl-9"
                            defaultValue={selectedProduct?.precio_venta || ""} 
                          />
                        </div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-md">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Costo:</span>
                          <span className="font-medium">{formatCurrency(selectedProduct?.precio_costo || 0)}</span>
                        </div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Precio de venta:</span>
                          <span className="font-medium">{formatCurrency(selectedProduct?.precio_venta || 0)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Margen de ganancia:</span>
                          <span className="font-medium text-green-600">
                            {selectedProduct ? (
                              <>{Math.round(((selectedProduct.precio_venta - selectedProduct.precio_costo) / selectedProduct.precio_venta) * 100)}%</>
                            ) : "0%"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-3">Inventario</h3>
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="stock_actual">Stock Actual *</Label>
                        <Input 
                          id="stock_actual" 
                          type="number" 
                          min="0" 
                          defaultValue={selectedProduct?.stock_actual || 0} 
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="stock_minimo">Stock Mínimo</Label>
                        <Input 
                          id="stock_minimo" 
                          type="number" 
                          min="0" 
                          defaultValue={selectedProduct?.stock_minimo || 0} 
                        />
                        <p className="text-xs text-muted-foreground">Nivel de stock en el que se generará una alerta</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="track_inventory" defaultChecked={true} />
                        <label htmlFor="track_inventory" className="text-sm">
                          Controlar inventario
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="allow_backorders" />
                        <label htmlFor="allow_backorders" className="text-sm">
                          Permitir pedidos con stock insuficiente
                        </label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-3">Proveedor</h3>
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="proveedor">Proveedor</Label>
                        <select 
                          id="proveedor"
                          className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                          defaultValue={selectedProduct?.proveedor_id || ""}
                        >
                          <option value="">Selecciona un proveedor</option>
                          {proveedores.map(prov => (
                            <option key={prov.id} value={prov.id}>{prov.nombre}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna 3: Imágenes y Variantes */}
              <div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Imágenes del Producto</h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <h4 className="text-sm font-medium">Arrastra y suelta imágenes aquí</h4>
                      <p className="text-xs text-gray-500 mb-3">O haz clic para seleccionar archivos</p>
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Subir Imágenes
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">PNG, JPG o WEBP hasta 5MB</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-medium">Variantes del Producto</h3>
                      <Button variant="outline" size="sm">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Añadir Variante
                      </Button>
                    </div>
                    {selectedProduct?.variantes && selectedProduct.variantes.length > 0 ? (
                      <div className="space-y-3">
                        {selectedProduct.variantes.map((variante: any) => (
                          <div key={variante.id} className="flex items-center justify-between p-3 border rounded-md">
                            <div>
                              <div className="font-medium">{variante.nombre}</div>
                              <div className="text-sm text-muted-foreground">{formatCurrency(variante.precio)} - Stock: {variante.stock}</div>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 border rounded-md">
                        <Tag className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Este producto no tiene variantes</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Añadir primera variante
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Las variantes te permiten ofrecer diferentes opciones como tamaño, color, etc.
                    </p>
                  </div>

                  <Separator />

                  <div className="pt-4">
                    <Button className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      {isEditing ? "Guardar Cambios" : "Crear Producto"}
                    </Button>
                    <Button variant="outline" className="w-full mt-2" onClick={() => {
                      setIsEditing(false);
                      setShowNewProductForm(false);
                      setSelectedProduct(null);
                    }}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Componente principal del Dashboard
const DashboardPage: React.FC = () => {
  const [activeTabMenu, setActiveTabMenu] = useState<string>("overview");
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-500">Administra tu negocio, analiza métricas y toma decisiones estratégicas</p>
        </div>

        {/* Navegación Principal */}
        <Tabs defaultValue="overview" value={activeTabMenu} onValueChange={setActiveTabMenu} className="mb-10">
          <div className="border-b mb-6">
            <TabsList className="mb-0 bg-transparent">
              <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent">
                Vista General
              </TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent">
                Productos
              </TabsTrigger>
              <TabsTrigger value="inventory" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent">
                Inventario
              </TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent">
                Pedidos
              </TabsTrigger>
              <TabsTrigger value="customers" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent">
                Clientes
              </TabsTrigger>
              <TabsTrigger value="suppliers" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent">
                Proveedores
              </TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent">
                Reportes
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent">
                Configuración
              </TabsTrigger>
            </TabsList>
          </div>

          {/* VISTA GENERAL */}
          <TabsContent value="overview">
            {/* Accesos Rápidos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Button className="h-auto py-6 flex flex-col gap-2" variant="outline">
                <PlusIcon className="h-6 w-6" />
                <span>Nuevo Producto</span>
              </Button>
              <Button className="h-auto py-6 flex flex-col gap-2" variant="outline">
                <ShoppingCart className="h-6 w-6" />
                <span>Registrar Venta</span>
              </Button>
              <Button className="h-auto py-6 flex flex-col gap-2" variant="outline">
                <ClipboardList className="h-6 w-6" />
                <span>Ver Pedidos</span>
              </Button>
              <Button className="h-auto py-6 flex flex-col gap-2" variant="outline">
                <UserPlus className="h-6 w-6" />
                <span>Nuevo Cliente</span>
              </Button>
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
                    <div className="text-2xl font-bold">{formatCurrency(86740)}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="text-green-500">↑ 12%</span> comparado con el mes pasado
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
                    <div className="text-2xl font-bold">724</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="text-green-500">↑ 8%</span> comparado con el mes pasado
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
                    <div className="text-2xl font-bold">{formatCurrency(119.8)}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="text-green-500">↑ 3%</span> comparado con el mes pasado
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
                    <div className="text-2xl font-bold">64%</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="text-red-500">↓ 2%</span> comparado con el mes pasado
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
                  <CardDescription>Ganancias mensuales del primer semestre</CardDescription>
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
                        {productosMasVendidos.map((producto, index) => (
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
                              <Badge variant={producto.stock < 30 ? "outline" : "default"} 
                                className={producto.stock < 30 ? "bg-yellow-100 hover:bg-yellow-100 text-yellow-800 border-yellow-400" : ""}>
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
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
                    <CardDescription>Últimos pedidos recibidos</CardDescription>
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
          </TabsContent>

          {/* PRODUCTOS */}
          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>

          {/* INVENTARIO */}
          <TabsContent value="inventory">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Gestión de Inventario</h2>
              <div className="flex gap-2">
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Ajuste de Stock
                </Button>
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Entrada de Stock
                </Button>
              </div>
            </div>

            {/* Métricas de Inventario */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Valor del Inventario</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <ShoppingBag className="mr-2 h-4 w-4 text-primary" />
                    <div className="text-2xl font-bold">{formatCurrency(128500)}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="text-green-500">↑ 5%</span> desde el último inventario
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total de Productos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Package2Icon className="mr-2 h-4 w-4 text-primary" />
                    <div className="text-2xl font-bold">245</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="text-muted-foreground">34</span> categorías diferentes
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Alertas de Stock</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                    <div className="text-2xl font-bold">12</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="text-red-500">4 críticos</span> y 8 niveles bajos
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Control de Inventario */}
            <Tabs defaultValue="current" className="mb-8">
              <TabsList className="mb-4">
                <TabsTrigger value="current">Inventario Actual</TabsTrigger>
                <TabsTrigger value="low">Stock Bajo</TabsTrigger>
                <TabsTrigger value="movements">Movimientos</TabsTrigger>
              </TabsList>
              
              {/* Inventario Actual */}
              <TabsContent value="current">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Estado del Inventario</CardTitle>
                      <CardDescription>
                        Revisa el stock actual de todos los productos
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimir
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                      <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          type="text"
                          placeholder="Buscar producto..."
                          className="pl-9"
                        />
                      </div>
                      <div className="flex gap-2">
                        <select className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm">
                          <option value="">Todas las categorías</option>
                          <option value="hamburgers">Hamburguesas</option>
                          <option value="pizzas">Pizzas</option>
                          <option value="drinks">Bebidas</option>
                        </select>
                        <select className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm">
                          <option value="">Todos los estados</option>
                          <option value="in-stock">En stock</option>
                          <option value="low-stock">Stock bajo</option>
                          <option value="out-of-stock">Sin stock</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2 font-medium">Producto</th>
                            <th className="text-left py-3 px-2 font-medium">SKU</th>
                            <th className="text-left py-3 px-2 font-medium">Categoría</th>
                            <th className="text-left py-3 px-2 font-medium">Stock</th>
                            <th className="text-left py-3 px-2 font-medium">Mínimo</th>
                            <th className="text-left py-3 px-2 font-medium">Costo Unitario</th>
                            <th className="text-left py-3 px-2 font-medium">Valor Total</th>
                            <th className="text-left py-3 px-2 font-medium">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Productos simulados */}
                          <tr className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-md bg-gray-200 mr-3"></div>
                                <span className="font-medium">Hamburguesa Clásica</span>
                              </div>
                            </td>
                            <td className="py-3 px-2">BURG-001</td>
                            <td className="py-3 px-2">Hamburguesas</td>
                            <td className="py-3 px-2">
                              <Badge variant="default">45</Badge>
                            </td>
                            <td className="py-3 px-2">20</td>
                            <td className="py-3 px-2">{formatCurrency(12.5)}</td>
                            <td className="py-3 px-2">{formatCurrency(562.5)}</td>
                            <td className="py-3 px-2">
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm">
                                  <PlusIcon className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                          <tr className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-md bg-gray-200 mr-3"></div>
                                <span className="font-medium">Pan de Hamburguesa</span>
                              </div>
                            </td>
                            <td className="py-3 px-2">MP-001</td>
                            <td className="py-3 px-2">Materias Primas</td>
                            <td className="py-3 px-2">
                              <Badge variant="outline" className="bg-yellow-100 hover:bg-yellow-100 text-yellow-800 border-yellow-400">
                                24
                              </Badge>
                            </td>
                            <td className="py-3 px-2">50</td>
                            <td className="py-3 px-2">{formatCurrency(0.8)}</td>
                            <td className="py-3 px-2">{formatCurrency(19.2)}</td>
                            <td className="py-3 px-2">
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm">
                                  <PlusIcon className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                          <tr className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-md bg-gray-200 mr-3"></div>
                                <span className="font-medium">Pechuga de Pollo</span>
                              </div>
                            </td>
                            <td className="py-3 px-2">MP-015</td>
                            <td className="py-3 px-2">Materias Primas</td>
                            <td className="py-3 px-2">
                              <Badge variant="destructive">
                                8
                              </Badge>
                            </td>
                            <td className="py-3 px-2">20</td>
                            <td className="py-3 px-2">{formatCurrency(3.5)}</td>
                            <td className="py-3 px-2">{formatCurrency(28)}</td>
                            <td className="py-3 px-2">
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm">
                                  <PlusIcon className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-gray-500">
                        Mostrando 1-3 de 245 productos
                      </div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" disabled>Anterior</Button>
                        <Button variant="outline" size="sm">Siguiente</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Stock Bajo */}
              <TabsContent value="low">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Productos con Stock Bajo</CardTitle>
                      <CardDescription>
                        Productos que requieren reabastecimiento inmediato
                      </CardDescription>
                    </div>
                    <Button>
                      Generar Orden de Compra
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2 font-medium">Producto</th>
                            <th className="text-left py-3 px-2 font-medium">SKU</th>
                            <th className="text-left py-3 px-2 font-medium">Stock Actual</th>
                            <th className="text-left py-3 px-2 font-medium">Stock Mínimo</th>
                            <th className="text-left py-3 px-2 font-medium">Proveedor</th>
                            <th className="text-left py-3 px-2 font-medium">Estado</th>
                            <th className="text-left py-3 px-2 font-medium">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventarioBajo.map((item) => (
                            <tr key={item.id} className="border-b hover:bg-muted/50">
                              <td className="py-3 px-2">
                                <div className="font-medium">{item.nombre}</div>
                              </td>
                              <td className="py-3 px-2">{item.sku}</td>
                              <td className="py-3 px-2">{item.actual}</td>
                              <td className="py-3 px-2">{item.minimo}</td>
                              <td className="py-3 px-2">Distribuidora Alimentos JR</td>
                              <td className="py-3 px-2">
                                <Badge variant={item.actual < item.minimo * 0.5 ? "destructive" : "outline"} 
                                  className={item.actual < item.minimo * 0.5 ? "" : "bg-yellow-100 hover:bg-yellow-100 text-yellow-800 border-yellow-400"}>
                                  {item.actual < item.minimo * 0.5 ? "Crítico" : "Bajo"}
                                </Badge>
                              </td>
                              <td className="py-3 px-2">
                                <Button variant="outline" size="sm">Reabastecer</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Movimientos de Inventario */}
              <TabsContent value="movements">
                <Card>
                  <CardHeader>
                    <CardTitle>Historial de Movimientos</CardTitle>
                    <CardDescription>
                      Registro de entradas, salidas y ajustes de inventario
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2 font-medium">Fecha</th>
                            <th className="text-left py-3 px-2 font-medium">Tipo</th>
                            <th className="text-left py-3 px-2 font-medium">Producto</th>
                            <th className="text-left py-3 px-2 font-medium">Cantidad</th>
                            <th className="text-left py-3 px-2 font-medium">Usuario</th>
                            <th className="text-left py-3 px-2 font-medium">Referencia</th>
                            <th className="text-left py-3 px-2 font-medium">Nota</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2">07 Abr 2025, 10:25 AM</td>
                            <td className="py-3 px-2">
                              <Badge className="bg-green-100 hover:bg-green-100 text-green-800 border-green-400">
                                Entrada
                              </Badge>
                            </td>
                            <td className="py-3 px-2">Pan de hamburguesa</td>
                            <td className="py-3 px-2">+50</td>
                            <td className="py-3 px-2">Carlos Ramírez</td>
                            <td className="py-3 px-2">OC-2025-042</td>
                            <td className="py-3 px-2">Reposición de stock</td>
                          </tr>
                          <tr className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2">06 Abr 2025, 5:18 PM</td>
                            <td className="py-3 px-2">
                              <Badge className="bg-red-100 hover:bg-red-100 text-red-800 border-red-400">
                                Salida
                              </Badge>
                            </td>
                            <td className="py-3 px-2">Pechuga de pollo</td>
                            <td className="py-3 px-2">-15</td>
                            <td className="py-3 px-2">María López</td>
                            <td className="py-3 px-2">PED-4720</td>
                            <td className="py-3 px-2">Venta a cliente</td>
                          </tr>
                          <tr className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2">05 Abr 2025, 2:45 PM</td>
                            <td className="py-3 px-2">
                              <Badge className="bg-blue-100 hover:bg-blue-100 text-blue-800 border-blue-400">
                                Ajuste
                              </Badge>
                            </td>
                            <td className="py-3 px-2">Aguacate</td>
                            <td className="py-3 px-2">-3</td>
                            <td className="py-3 px-2">Juan Pérez</td>
                            <td className="py-3 px-2">AJ-2025-015</td>
                            <td className="py-3 px-2">Producto en mal estado</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-gray-500">
                        Mostrando 1-3 de 156 movimientos
                      </div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" disabled>Anterior</Button>
                        <Button variant="outline" size="sm">Siguiente</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* PEDIDOS */}
          <TabsContent value="orders">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Gestión de Pedidos</h2>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Nuevo Pedido
                </Button>
              </div>
            </div>

            {/* Métricas de Pedidos */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total de Pedidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <ClipboardList className="mr-2 h-4 w-4 text-primary" />
                    <div className="text-2xl font-bold">724</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="text-green-500">↑ 12%</span> desde el mes pasado
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                    <div className="text-2xl font-bold">18</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="text-yellow-500">8 pedidos</span> de hoy
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">En Proceso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Truck className="mr-2 h-4 w-4 text-blue-500" />
                    <div className="text-2xl font-bold">24</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="text-blue-500">12 entregas</span> programadas hoy
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Completados (Hoy)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <CheckSquare className="mr-2 h-4 w-4 text-green-500" />
                    <div className="text-2xl font-bold">36</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="text-green-500">{formatCurrency(3865)}</span> en ventas de hoy
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filtros de Pedidos */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Buscar por ID, cliente, o productos..."
                      className="pl-9"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm">
                      <option value="">Todos los estados</option>
                      <option value="pending">Pendientes</option>
                      <option value="processing">En proceso</option>
                      <option value="delivered">Entregados</option>
                      <option value="cancelled">Cancelados</option>
                    </select>
                    <select className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm">
                      <option value="">Ordenar por</option>
                      <option value="date-desc">Fecha (reciente)</option>
                      <option value="date-asc">Fecha (antiguo)</option>
                      <option value="total-desc">Total (mayor)</option>
                      <option value="total-asc">Total (menor)</option>
                    </select>
                    <Input
                      type="date"
                      className="h-[38px]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Pedidos */}
            <Card>
              <CardHeader>
                <CardTitle>Pedidos</CardTitle>
                <CardDescription>
                  Lista de todos los pedidos recibidos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium">Pedido</th>
                        <th className="text-left py-3 px-2 font-medium">Cliente</th>
                        <th className="text-left py-3 px-2 font-medium">Fecha</th>
                        <th className="text-left py-3 px-2 font-medium">Total</th>
                        <th className="text-left py-3 px-2 font-medium">Estado</th>
                        <th className="text-left py-3 px-2 font-medium">Método de Pago</th>
                        <th className="text-left py-3 px-2 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ultimosPedidos.map((pedido) => (
                        <tr key={pedido.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-2">
                            <div className="font-medium">{pedido.id}</div>
                            <div className="text-xs text-muted-foreground">{pedido.items} productos</div>
                          </td>
                          <td className="py-3 px-2">{pedido.cliente}</td>
                          <td className="py-3 px-2">{pedido.fecha}</td>
                          <td className="py-3 px-2 font-medium">{formatCurrency(pedido.total)}</td>
                          <td className="py-3 px-2">
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
                          <td className="py-3 px-2">Tarjeta de crédito</td>
                          <td className="py-3 px-2">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Printer className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    Mostrando 1-5 de 724 pedidos
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" disabled>Anterior</Button>
                    <Button variant="outline" size="sm">Siguiente</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CLIENTES */}
          <TabsContent value="customers">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Gestión de Clientes</h2>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Nuevo Cliente
              </Button>
            </div>

            {/* Métricas de Clientes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total de Clientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-primary" />
                    <div className="text-2xl font-bold">1,248</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="text-green-500">↑ 15%</span> desde el mes pasado
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Clientes Nuevos (Mes)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <UserPlus className="mr-2 h-4 w-4 text-primary" />
                    <div className="text-2xl font-bold">85</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="text-green-500">↑ 24%</span> comparado con el mes pasado
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Valor Promedio por Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <WalletIcon className="mr-2 h-4 w-4 text-primary" />
                    <div className="text-2xl font-bold">{formatCurrency(485.50)}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="text-green-500">↑ 5%</span> comparado con el mes pasado
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Clientes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Directorio de Clientes</CardTitle>
                  <CardDescription>
                    Gestiona la información de tus clientes
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Buscar por nombre, email o teléfono..."
                      className="pl-9"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm">
                      <option value="">Todos los clientes</option>
                      <option value="active">Clientes activos</option>
                      <option value="inactive">Clientes inactivos</option>
                      <option value="new">Nuevos clientes</option>
                    </select>
                    <Button variant="outline" size="sm">
                      <FilterIcon className="h-4 w-4 mr-1" />
                      Filtrar
                    </Button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium">Cliente</th>
                        <th className="text-left py-3 px-2 font-medium">Email</th>
                        <th className="text-left py-3 px-2 font-medium">Teléfono</th>
                        <th className="text-left py-3 px-2 font-medium">Pedidos</th>
                        <th className="text-left py-3 px-2 font-medium">Total Gastado</th>
                        <th className="text-left py-3 px-2 font-medium">Última Compra</th>
                        <th className="text-left py-3 px-2 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                              JP
                            </div>
                            <div>
                              <div className="font-medium">Juan Pérez</div>
                              <div className="text-xs text-muted-foreground">Desde 10 Mar 2025</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">juan.perez@ejemplo.com</td>
                        <td className="py-3 px-2">555-1234</td>
                        <td className="py-3 px-2">8</td>
                        <td className="py-3 px-2">{formatCurrency(1850.75)}</td>
                        <td className="py-3 px-2">07 Abr 2025</td>
                        <td className="py-3 px-2">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <ShoppingCart className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                              ML
                            </div>
                            <div>
                              <div className="font-medium">María López</div>
                              <div className="text-xs text-muted-foreground">Desde 25 Feb 2025</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">maria.lopez@ejemplo.com</td>
                        <td className="py-3 px-2">555-5678</td>
                        <td className="py-3 px-2">12</td>
                        <td className="py-3 px-2">{formatCurrency(2450.30)}</td>
                        <td className="py-3 px-2">07 Abr 2025</td>
                        <td className="py-3 px-2">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <ShoppingCart className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                              CG
                            </div>
                            <div>
                              <div className="font-medium">Carlos González</div>
                              <div className="text-xs text-muted-foreground">Desde 15 Mar 2025</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">carlos.gonzalez@ejemplo.com</td>
                        <td className="py-3 px-2">555-8901</td>
                        <td className="py-3 px-2">5</td>
                        <td className="py-3 px-2">{formatCurrency(980.50)}</td>
                        <td className="py-3 px-2">06 Abr 2025</td>
                        <td className="py-3 px-2">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <ShoppingCart className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    Mostrando 1-3 de 1,248 clientes
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" disabled>Anterior</Button>
                    <Button variant="outline" size="sm">Siguiente</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Otros TabsContent para las demás pestañas */}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;