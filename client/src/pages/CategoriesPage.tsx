import React, { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { 
  Search,
  Package,
  Pencil,
  Trash2,
  PlusCircle,
  Filter,
  RefreshCcw,
  Tags,
  ShoppingBag,
  Truck,
  Users,
  BarChart2
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Datos de muestra para categorías de productos
const categoriasProductos = [
  { 
    id: 1, 
    nombre: "Hamburguesas", 
    descripcion: "Hamburguesas de varios tipos y con diferentes ingredientes", 
    productos: 14,
    icono: "burger",
    creado: "2023-12-15",
    color: "bg-amber-100 text-amber-800 border-amber-400" 
  },
  { 
    id: 2, 
    nombre: "Pizzas", 
    descripcion: "Pizzas tradicionales y de especialidad en diferentes tamaños", 
    productos: 12,
    icono: "pizza",
    creado: "2023-12-15",
    color: "bg-red-100 text-red-800 border-red-400" 
  },
  { 
    id: 3, 
    nombre: "Bebidas", 
    descripcion: "Refrescos, aguas, café y bebidas especiales", 
    productos: 20,
    icono: "drink",
    creado: "2023-12-18",
    color: "bg-blue-100 text-blue-800 border-blue-400" 
  },
  { 
    id: 4, 
    nombre: "Postres", 
    descripcion: "Postres, pasteles y opciones dulces", 
    productos: 8,
    icono: "cake",
    creado: "2024-01-05",
    color: "bg-pink-100 text-pink-800 border-pink-400" 
  },
  { 
    id: 5, 
    nombre: "Ensaladas", 
    descripcion: "Ensaladas frescas y saludables", 
    productos: 6,
    icono: "salad",
    creado: "2024-01-10",
    color: "bg-green-100 text-green-800 border-green-400" 
  },
  { 
    id: 6, 
    nombre: "Complementos", 
    descripcion: "Acompañamientos y extras", 
    productos: 15,
    icono: "side",
    creado: "2024-01-12",
    color: "bg-orange-100 text-orange-800 border-orange-400" 
  },
  { 
    id: 7, 
    nombre: "Desayunos", 
    descripcion: "Platos y opciones para el desayuno", 
    productos: 10,
    icono: "breakfast",
    creado: "2024-01-20",
    color: "bg-yellow-100 text-yellow-800 border-yellow-400" 
  },
  { 
    id: 8, 
    nombre: "Combos", 
    descripcion: "Combinaciones y paquetes especiales", 
    productos: 7,
    icono: "combo",
    creado: "2024-02-05",
    color: "bg-purple-100 text-purple-800 border-purple-400" 
  },
];

// Datos de muestra para categorías de proveedores
const categoriasProveedores = [
  { 
    id: 1, 
    nombre: "Alimentos", 
    descripcion: "Proveedores de insumos alimenticios", 
    proveedores: 8,
    creado: "2023-11-10",
    color: "bg-blue-100 text-blue-800 border-blue-400" 
  },
  { 
    id: 2, 
    nombre: "Bebidas", 
    descripcion: "Proveedores de bebidas y refrescos", 
    proveedores: 6,
    creado: "2023-11-12",
    color: "bg-green-100 text-green-800 border-green-400" 
  },
  { 
    id: 3, 
    nombre: "Empaques", 
    descripcion: "Proveedores de material de empaque y desechables", 
    proveedores: 4,
    creado: "2023-11-20",
    color: "bg-amber-100 text-amber-800 border-amber-400" 
  },
  { 
    id: 4, 
    nombre: "Vegetales", 
    descripcion: "Proveedores de frutas y verduras frescas", 
    proveedores: 5,
    creado: "2023-12-05",
    color: "bg-purple-100 text-purple-800 border-purple-400" 
  },
  { 
    id: 5, 
    nombre: "Condimentos", 
    descripcion: "Proveedores de especias y condimentos", 
    proveedores: 3,
    creado: "2023-12-10",
    color: "bg-rose-100 text-rose-800 border-rose-400" 
  },
];

// Datos de muestra para categorías de clientes
const categoriasClientes = [
  { 
    id: 1, 
    nombre: "VIP", 
    descripcion: "Clientes frecuentes con alto volumen de compras", 
    clientes: 12,
    creado: "2023-10-15",
    color: "bg-purple-100 text-purple-800 border-purple-400" 
  },
  { 
    id: 2, 
    nombre: "Frecuente", 
    descripcion: "Clientes que compran regularmente", 
    clientes: 45,
    creado: "2023-10-18",
    color: "bg-blue-100 text-blue-800 border-blue-400" 
  },
  { 
    id: 3, 
    nombre: "Ocasional", 
    descripcion: "Clientes que compran de forma esporádica", 
    clientes: 58,
    creado: "2023-10-20",
    color: "bg-green-100 text-green-800 border-green-400" 
  },
  { 
    id: 4, 
    nombre: "Nuevo", 
    descripcion: "Clientes con menos de un mes de antigüedad", 
    clientes: 22,
    creado: "2023-11-01",
    color: "bg-yellow-100 text-yellow-800 border-yellow-400" 
  },
  { 
    id: 5, 
    nombre: "Inactivo", 
    descripcion: "Clientes sin compras recientes (>3 meses)", 
    clientes: 12,
    creado: "2023-11-05",
    color: "bg-gray-100 text-gray-800 border-gray-400" 
  },
];

const CategoriesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("productos");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [categoryType, setCategoryType] = useState("productos");
  
  // Filtrar categorías según la búsqueda y tipo actual
  const getCategoriesByType = () => {
    switch(activeTab) {
      case "productos":
        return categoriasProductos.filter(cat => 
          cat.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
        );
      case "proveedores":
        return categoriasProveedores.filter(cat => 
          cat.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
        );
      case "clientes":
        return categoriasClientes.filter(cat => 
          cat.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
        );
      default:
        return [];
    }
  };
  
  const filteredCategories = getCategoriesByType();
  
  // Mostrar diálogo para añadir nueva categoría
  const handleAddCategory = (type: string) => {
    setCategoryType(type);
    setIsAddCategoryDialogOpen(true);
  };
  
  // Formatear fecha
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };
  
  // Renderizar contenido según el tipo de categoría
  const renderCategoryDetailContent = (category: any) => {
    switch(activeTab) {
      case "productos":
        return (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">{category.productos} productos</span>
            </div>
            <Badge variant="outline" className={category.color}>Activa</Badge>
          </div>
        );
      case "proveedores":
        return (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">{category.proveedores} proveedores</span>
            </div>
            <Badge variant="outline" className={category.color}>Activa</Badge>
          </div>
        );
      case "clientes":
        return (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">{category.clientes} clientes</span>
            </div>
            <Badge variant="outline" className={category.color}>Activa</Badge>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Gestión de Categorías</h1>
          <p className="text-gray-500">Administra las categorías para productos, proveedores y clientes</p>
        </div>
        
        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Categorías de Productos</p>
                  <h3 className="text-3xl font-bold mt-1">{categoriasProductos.length}</h3>
                  <p className="text-sm text-green-600 mt-1">Productos organizados</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Categorías de Proveedores</p>
                  <h3 className="text-3xl font-bold mt-1">{categoriasProveedores.length}</h3>
                  <p className="text-sm text-green-600 mt-1">Proveedores clasificados</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Truck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Categorías de Clientes</p>
                  <h3 className="text-3xl font-bold mt-1">{categoriasClientes.length}</h3>
                  <p className="text-sm text-green-600 mt-1">Segmentos definidos</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs para diferentes tipos de categorías */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-gray-100 p-1">
            <TabsTrigger value="productos" className="rounded-md">Productos</TabsTrigger>
            <TabsTrigger value="proveedores" className="rounded-md">Proveedores</TabsTrigger>
            <TabsTrigger value="clientes" className="rounded-md">Clientes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="productos" className="mt-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  type="text" 
                  placeholder="Buscar categoría de productos..." 
                  className="pl-9" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => setSearchQuery("")}
                >
                  <RefreshCcw className="h-4 w-4" />
                  <span>Limpiar</span>
                </Button>
                
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => handleAddCategory("productos")}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Nueva Categoría</span>
                </Button>
              </div>
            </div>
            
            {/* Lista de categorías de productos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredCategories.map(categoria => (
                <Card key={categoria.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className={categoria.color}>
                          {categoria.nombre}
                        </Badge>
                        <span className="text-xs text-gray-500">{formatDate(categoria.creado)}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{categoria.descripcion}</p>
                    </div>
                    <div className="p-4">
                      {renderCategoryDetailContent(categoria)}
                    </div>
                    <div className="p-3 bg-gray-50 border-t flex justify-between">
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                        <Pencil className="h-4 w-4 mr-1" /> Editar
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="proveedores" className="mt-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  type="text" 
                  placeholder="Buscar categoría de proveedores..." 
                  className="pl-9" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => setSearchQuery("")}
                >
                  <RefreshCcw className="h-4 w-4" />
                  <span>Limpiar</span>
                </Button>
                
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => handleAddCategory("proveedores")}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Nueva Categoría</span>
                </Button>
              </div>
            </div>
            
            {/* Lista de categorías de proveedores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredCategories.map(categoria => (
                <Card key={categoria.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className={categoria.color}>
                          {categoria.nombre}
                        </Badge>
                        <span className="text-xs text-gray-500">{formatDate(categoria.creado)}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{categoria.descripcion}</p>
                    </div>
                    <div className="p-4">
                      {renderCategoryDetailContent(categoria)}
                    </div>
                    <div className="p-3 bg-gray-50 border-t flex justify-between">
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                        <Pencil className="h-4 w-4 mr-1" /> Editar
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="clientes" className="mt-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  type="text" 
                  placeholder="Buscar categoría de clientes..." 
                  className="pl-9" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => setSearchQuery("")}
                >
                  <RefreshCcw className="h-4 w-4" />
                  <span>Limpiar</span>
                </Button>
                
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => handleAddCategory("clientes")}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Nueva Categoría</span>
                </Button>
              </div>
            </div>
            
            {/* Lista de categorías de clientes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredCategories.map(categoria => (
                <Card key={categoria.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className={categoria.color}>
                          {categoria.nombre}
                        </Badge>
                        <span className="text-xs text-gray-500">{formatDate(categoria.creado)}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{categoria.descripcion}</p>
                    </div>
                    <div className="p-4">
                      {renderCategoryDetailContent(categoria)}
                    </div>
                    <div className="p-3 bg-gray-50 border-t flex justify-between">
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                        <Pencil className="h-4 w-4 mr-1" /> Editar
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Diálogo para añadir nueva categoría */}
        <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {categoryType === "productos" && "Crear Nueva Categoría de Productos"}
                {categoryType === "proveedores" && "Crear Nueva Categoría de Proveedores"}
                {categoryType === "clientes" && "Crear Nueva Categoría de Clientes"}
              </DialogTitle>
              <DialogDescription>
                Complete los campos para crear una nueva categoría
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="nombre" className="text-sm font-medium">
                  Nombre de la Categoría
                </label>
                <Input id="nombre" placeholder="Nombre de la categoría" />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="descripcion" className="text-sm font-medium">
                  Descripción
                </label>
                <textarea 
                  id="descripcion" 
                  rows={3} 
                  placeholder="Descripción breve de la categoría"
                  className="px-3 py-2 border border-gray-300 rounded-md w-full text-sm"
                ></textarea>
              </div>
              
              {categoryType === "productos" && (
                <div className="grid gap-2">
                  <label htmlFor="color" className="text-sm font-medium">
                    Color
                  </label>
                  <select id="color" className="px-3 py-2 border border-gray-300 rounded-md">
                    <option value="bg-blue-100 text-blue-800 border-blue-400">Azul</option>
                    <option value="bg-green-100 text-green-800 border-green-400">Verde</option>
                    <option value="bg-red-100 text-red-800 border-red-400">Rojo</option>
                    <option value="bg-yellow-100 text-yellow-800 border-yellow-400">Amarillo</option>
                    <option value="bg-purple-100 text-purple-800 border-purple-400">Púrpura</option>
                    <option value="bg-pink-100 text-pink-800 border-pink-400">Rosa</option>
                    <option value="bg-orange-100 text-orange-800 border-orange-400">Naranja</option>
                    <option value="bg-amber-100 text-amber-800 border-amber-400">Ámbar</option>
                  </select>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddCategoryDialogOpen(false)}>
                Cancelar
              </Button>
              <Button>Guardar Categoría</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default CategoriesPage;