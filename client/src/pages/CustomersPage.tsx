
import React, { useState, useEffect, useCallback } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import {
  Search,
  User,
  UserPlus,
  Phone,
  Mail,
  CalendarClock,
  Package,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  CreditCard,
  BarChart2,
  Users,
  UserCheck,
  Filter,
  RefreshCcw,
  MapPin,
  Clock,
  Calendar,
  Tag,
  X,
  Edit,
  Trash2
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/config";

// Interfaces para tipos de datos
interface CategoriaCliente {
  cli_cat_id: string;
  cli_cat_nombre: string;
  cli_cat_descripcion?: string;
}

interface Cliente {
  cli_id: string;
  cli_nombre: string;
  cli_apellido: string;
  cli_email: string;
  cli_telefono?: string;
  cli_direccion?: string;
  cli_genero?: string;
  cli_fecha_nacimiento?: string;
  cli_tipo?: string;
  cli_estado?: string;
  cli_rfc?: string;
  cli_notas?: string;
  created_at: string;
  updated_at: string;
  categorias: CategoriaCliente[];
}

interface FormData {
  cli_nombre: string;
  cli_apellido: string;
  cli_email: string;
  cli_telefono: string;
  cli_direccion: string;
  cli_genero: string;
  cli_fecha_nacimiento: string;
  cli_tipo: string;
  cli_estado: string;
  cli_rfc: string;
  cli_notas: string;
  cli_cat_id: string;
}

const defaultForm: FormData = {
  cli_nombre: "",
  cli_apellido: "",
  cli_email: "",
  cli_telefono: "",
  cli_direccion: "",
  cli_genero: "",
  cli_fecha_nacimiento: "",
  cli_tipo: "Regular",
  cli_estado: "Activo",
  cli_rfc: "",
  cli_notas: "",
  cli_cat_id: ""
};

// Función para formatear fechas
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};

// Función para formatear moneda
const formatCurrency = (amount: number) => {
  return amount.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  });
};

// Obtener color de segmento basado en categoría
const getSegmentColor = (categoria: string) => {
  switch (categoria?.toLowerCase()) {
    case 'vip':
      return "bg-purple-100 text-purple-800 border-purple-400";
    case 'frecuente':
      return "bg-blue-100 text-blue-800 border-blue-400";
    case 'ocasional':
      return "bg-green-100 text-green-800 border-green-400";
    case 'nuevo':
      return "bg-yellow-100 text-yellow-800 border-yellow-400";
    default:
      return "bg-gray-100 text-gray-800 border-gray-400";
  }
};

const CustomersPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [categorias, setCategorias] = useState<CategoriaCliente[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentTab, setCurrentTab] = useState("todos");
  const [selectedCustomer, setSelectedCustomer] = useState<Cliente | null>(null);
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);
  const [showPurchaseHistory, setShowPurchaseHistory] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(defaultForm);
  const [editingId, setEditingId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  // Fetch clientes y categorías
  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/clientes`, {
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setClientes(data);
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar los clientes",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión con el servidor",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchCategorias = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/categorias-clientes`, {
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setCategorias(data);
      }
    } catch (error) {
      console.error("Error fetching categorias:", error);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
    fetchCategorias();
  }, [fetchClientes, fetchCategorias]);

  // Filtrar clientes
  const filteredClientes = clientes.filter(cliente => {
    // Filtro por búsqueda
    if (searchQuery &&
        !`${cliente.cli_nombre} ${cliente.cli_apellido}`.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !cliente.cli_email.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(cliente.cli_telefono || "").toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Filtro por categoría
    if (categoryFilter && !cliente.categorias.some(cat => cat.cli_cat_nombre === categoryFilter)) {
      return false;
    }

    // Filtro por pestaña
    if (currentTab === "inactivos" && cliente.cli_estado !== "Inactivo") {
      return false;
    } else if (currentTab === "vip" && !cliente.categorias.some(cat => cat.cli_cat_nombre.toLowerCase() === "vip")) {
      return false;
    } else if (currentTab === "nuevos" && !cliente.categorias.some(cat => cat.cli_cat_nombre.toLowerCase() === "nuevo")) {
      return false;
    }

    return true;
  });

  // Crear cliente
  const handleCreate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/clientes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Cliente creado correctamente"
        });
        setIsCreateDialogOpen(false);
        setFormData(defaultForm); // Limpiar formulario
        fetchClientes();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Error al crear el cliente",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión con el servidor",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para limpiar el formulario y cerrar modal de crear
  const closeCreateDialog = () => {
    setFormData(defaultForm);
    setIsCreateDialogOpen(false);
  };

  // Actualizar cliente
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/clientes/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Cliente actualizado correctamente"
        });
        setIsEditDialogOpen(false);
        setFormData(defaultForm);
        setEditingId("");
        fetchClientes();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Error al actualizar el cliente",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión con el servidor",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Eliminar cliente
  const handleDelete = async () => {
    if (!selectedCustomer) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/clientes/${selectedCustomer.cli_id}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Cliente eliminado correctamente"
        });
        setIsDeleteDialogOpen(false);
        setSelectedCustomer(null);
        fetchClientes();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Error al eliminar el cliente",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión con el servidor",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleExpandCustomer = (id: string) => {
    if (expandedCustomerId === id) {
      setExpandedCustomerId(null);
    } else {
      setExpandedCustomerId(id);
    }
  };

  const openEditDialog = (cliente: Cliente) => {
    setFormData({
      cli_nombre: cliente.cli_nombre,
      cli_apellido: cliente.cli_apellido,
      cli_email: cliente.cli_email,
      cli_telefono: cliente.cli_telefono || "",
      cli_direccion: cliente.cli_direccion || "",
      cli_genero: cliente.cli_genero || "",
      cli_fecha_nacimiento: cliente.cli_fecha_nacimiento || "",
      cli_tipo: cliente.cli_tipo || "Regular",
      cli_estado: cliente.cli_estado || "Activo",
      cli_rfc: cliente.cli_rfc || "",
      cli_notas: cliente.cli_notas || "",
      cli_cat_id: cliente.categorias[0]?.cli_cat_id || ""
    });
    setEditingId(cliente.cli_id);
    setIsEditDialogOpen(true);
  };

  // Calcular estadísticas
  const totalClientes = clientes.length;
  const clientesActivos = clientes.filter(c => c.cli_estado === "Activo").length;
  const retencionRate = totalClientes > 0 ? ((clientesActivos / totalClientes) * 100).toFixed(1) : "0";

  return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">CLIENTES</h1>
              <p className="text-sm text-gray-500">Administra la información de tus clientes</p>
            </div>

            {/* Dashboard de métricas horizontal */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 md:mt-0">
              <div className="bg-background border rounded-md p-2 shadow-sm">
                <div className="text-xs text-muted-foreground mb-1">Total de Clientes</div>
                <div className="text-base font-semibold">{totalClientes}</div>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <span>+12% este mes</span>
                </div>
              </div>

              <div className="bg-background border rounded-md p-2 shadow-sm">
                <div className="text-xs text-muted-foreground mb-1">Clientes Activos</div>
                <div className="text-base font-semibold">{clientesActivos}</div>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <span>{retencionRate}% de retención</span>
                </div>
              </div>

              <div className="bg-background border rounded-md p-2 shadow-sm">
                <div className="text-xs text-muted-foreground mb-1">Categorías</div>
                <div className="text-base font-semibold">{categorias.length}</div>
                <div className="flex items-center text-xs text-blue-600 mt-1">
                  <span>Disponibles</span>
                </div>
              </div>

              <div className="bg-background border rounded-md p-2 shadow-sm">
                <div className="text-xs text-muted-foreground mb-1">Encontrados</div>
                <div className="text-base font-semibold">{filteredClientes.length}</div>
                <div className="flex items-center text-xs text-gray-600 mt-1">
                  <span>Con filtros actuales</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pestañas y Filtros */}
          <div className="mb-6">
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="todos">Todos los Clientes</TabsTrigger>
                <TabsTrigger value="vip">VIP</TabsTrigger>
                <TabsTrigger value="nuevos">Nuevos</TabsTrigger>
                <TabsTrigger value="inactivos">Inactivos</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                    type="text"
                    placeholder="Buscar cliente por nombre, email o teléfono..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <select
                    className="px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">Todas las Categorías</option>
                  {categorias.map(cat => (
                      <option key={cat.cli_cat_id} value={cat.cli_cat_nombre}>
                        {cat.cli_cat_nombre}
                      </option>
                  ))}
                </select>

                <Button variant="outline" className="flex items-center gap-2" onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("");
                  setCurrentTab("todos");
                }}>
                  <RefreshCcw className="h-4 w-4" />
                  <span>Limpiar</span>
                </Button>

                <Button
                    className="flex items-center gap-2"
                    onClick={() => setIsCreateDialogOpen(true)}
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Nuevo Cliente</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de clientes */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Listado de Clientes</h2>

            {loading ? (
                <div className="p-8 text-center bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-500">Cargando clientes...</p>
                </div>
            ) : filteredClientes.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-lg border border-gray-200">
                  <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No se encontraron clientes con los filtros aplicados</p>
                  <Button
                      variant="link"
                      className="mt-2"
                      onClick={() => {
                        setSearchQuery("");
                        setCategoryFilter("");
                        setCurrentTab("todos");
                      }}
                  >
                    Limpiar filtros
                  </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredClientes.map(cliente => {
                    const categoria = cliente.categorias[0]?.cli_cat_nombre || "Sin categoría";
                    const segmentoColor = getSegmentColor(categoria);

                    return (
                        <Card key={cliente.cli_id} className="overflow-hidden hover:shadow-md transition-shadow">
                          <CardContent className="p-0">
                            {/* Cabecera de la tarjeta */}
                            <div className="p-4 border-b flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-8 rounded-full ${
                                    categoria.toLowerCase().includes("vip") ? 'bg-purple-500' :
                                        categoria.toLowerCase().includes("frecuente") ? 'bg-blue-500' :
                                            categoria.toLowerCase().includes("ocasional") ? 'bg-green-500' :
                                                categoria.toLowerCase().includes("nuevo") ? 'bg-yellow-500' :
                                                    'bg-gray-500'
                                }`}></div>
                                <div>
                                  <div className="text-sm text-gray-500">
                                    Cliente {cliente.cli_id}
                                  </div>
                                  <div className="font-semibold text-base truncate max-w-[200px]">
                                    {cliente.cli_nombre} {cliente.cli_apellido}
                                  </div>
                                </div>
                              </div>

                              <Badge variant="outline" className={segmentoColor}>
                                {categoria}
                              </Badge>
                            </div>

                            {/* Información principal */}
                            <div className="p-4">
                              <div className="mb-3">
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {cliente.cli_email}
                                </div>
                                {cliente.cli_telefono && (
                                    <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                      <Phone className="h-3 w-3" />
                                      {cliente.cli_telefono}
                                    </div>
                                )}
                                {cliente.cli_direccion && (
                                    <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                      <MapPin className="h-3 w-3" />
                                      {cliente.cli_direccion}
                                    </div>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <div className="text-sm text-gray-500">Registrado</div>
                                  <div className="font-semibold text-sm">
                                    {formatDate(cliente.created_at)}
                                  </div>
                                </div>

                                <div>
                                  <div className="text-sm text-gray-500">Estado</div>
                                  <div className="font-semibold text-sm">
                                    {cliente.cli_estado || "Activo"}
                                  </div>
                                </div>
                              </div>

                              {cliente.cli_tipo && (
                                  <div className="grid grid-cols-1 gap-4 mb-4">
                                    <div>
                                      <div className="text-sm text-gray-500">Tipo de Cliente</div>
                                      <div className="font-semibold">
                                        {cliente.cli_tipo}
                                      </div>
                                    </div>
                                  </div>
                              )}
                            </div>

                            {/* Acciones */}
                            <div className="p-4 border-t flex justify-between">
                              <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-orange-500 hover:text-orange-600"
                                  onClick={() => toggleExpandCustomer(cliente.cli_id)}
                              >
                                {expandedCustomerId === cliente.cli_id ? (
                                    <>
                                      <ChevronUp className="h-4 w-4 mr-2" /> Ocultar
                                    </>
                                ) : (
                                    <>
                                      <ChevronDown className="h-4 w-4 mr-2" /> Ver más
                                    </>
                                )}
                              </Button>

                              <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-blue-600"
                                    onClick={() => openEditDialog(cliente)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600"
                                    onClick={() => {
                                      setSelectedCustomer(cliente);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Panel expandible con detalles del cliente */}
                            {expandedCustomerId === cliente.cli_id && (
                                <div className="border-t p-4 bg-gray-50">
                                  <h4 className="text-sm font-semibold mb-4">Información Adicional</h4>

                                  <div className="space-y-2 text-sm">
                                    {cliente.cli_genero && (
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">Género:</span>
                                          <span>{cliente.cli_genero}</span>
                                        </div>
                                    )}
                                    {cliente.cli_fecha_nacimiento && (
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">Fecha de Nacimiento:</span>
                                          <span>{formatDate(cliente.cli_fecha_nacimiento)}</span>
                                        </div>
                                    )}
                                    {cliente.cli_rfc && (
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">RFC:</span>
                                          <span>{cliente.cli_rfc}</span>
                                        </div>
                                    )}
                                    {cliente.cli_notas && (
                                        <div>
                                          <span className="text-gray-500">Notas:</span>
                                          <p className="mt-1 text-xs">{cliente.cli_notas}</p>
                                        </div>
                                    )}
                                  </div>
                                </div>
                            )}
                          </CardContent>
                        </Card>
                    );
                  })}
                </div>
            )}
          </div>

          {/* Modal de crear cliente */}
          <Dialog open={isCreateDialogOpen} onOpenChange={closeCreateDialog}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Añadir Nuevo Cliente</DialogTitle>
                <DialogDescription>
                  Introduce los datos del nuevo cliente
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="nombre" className="text-right text-sm font-medium">
                    Nombre*
                  </label>
                  <Input
                      id="nombre"
                      className="col-span-3"
                      placeholder="Nombre"
                      value={formData.cli_nombre}
                      onChange={(e) => setFormData({...formData, cli_nombre: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="apellido" className="text-right text-sm font-medium">
                    Apellido*
                  </label>
                  <Input
                      id="apellido"
                      className="col-span-3"
                      placeholder="Apellido"
                      value={formData.cli_apellido}
                      onChange={(e) => setFormData({...formData, cli_apellido: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="email" className="text-right text-sm font-medium">
                    Email*
                  </label>
                  <Input
                      id="email"
                      className="col-span-3"
                      placeholder="email@ejemplo.com"
                      type="email"
                      value={formData.cli_email}
                      onChange={(e) => setFormData({...formData, cli_email: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="telefono" className="text-right text-sm font-medium">
                    Teléfono
                  </label>
                  <Input
                      id="telefono"
                      className="col-span-3"
                      placeholder="Teléfono de contacto"
                      value={formData.cli_telefono}
                      onChange={(e) => setFormData({...formData, cli_telefono: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="direccion" className="text-right text-sm font-medium">
                    Dirección
                  </label>
                  <Input
                      id="direccion"
                      className="col-span-3"
                      placeholder="Dirección completa"
                      value={formData.cli_direccion}
                      onChange={(e) => setFormData({...formData, cli_direccion: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="categoria" className="text-right text-sm font-medium">
                    Categoría*
                  </label>
                  <select
                      id="categoria"
                      className="col-span-3 px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.cli_cat_id}
                      onChange={(e) => setFormData({...formData, cli_cat_id: e.target.value})}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map(cat => (
                        <option key={cat.cli_cat_id} value={cat.cli_cat_id}>
                          {cat.cli_cat_nombre}
                        </option>
                    ))}
                  </select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={closeCreateDialog}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate} disabled={loading}>
                  {loading ? "Guardando..." : "Guardar Cliente"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal de editar cliente */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-5xl h-[95vh] max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Cliente</DialogTitle>
                <DialogDescription>
                  Modifica los datos del cliente
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                {/* Primera fila - Información básica */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="edit-nombre" className="block text-sm font-medium mb-2">
                      Nombre*
                    </label>
                    <Input
                        id="edit-nombre"
                        placeholder="Nombre"
                        value={formData.cli_nombre}
                        onChange={(e) => setFormData({...formData, cli_nombre: e.target.value})}
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-apellido" className="block text-sm font-medium mb-2">
                      Apellido*
                    </label>
                    <Input
                        id="edit-apellido"
                        placeholder="Apellido"
                        value={formData.cli_apellido}
                        onChange={(e) => setFormData({...formData, cli_apellido: e.target.value})}
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-email" className="block text-sm font-medium mb-2">
                      Email*
                    </label>
                    <Input
                        id="edit-email"
                        placeholder="email@ejemplo.com"
                        type="email"
                        value={formData.cli_email}
                        onChange={(e) => setFormData({...formData, cli_email: e.target.value})}
                    />
                  </div>
                </div>

                {/* Segunda fila - Contacto */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-telefono" className="block text-sm font-medium mb-2">
                      Teléfono
                    </label>
                    <Input
                        id="edit-telefono"
                        placeholder="Teléfono de contacto"
                        value={formData.cli_telefono}
                        onChange={(e) => setFormData({...formData, cli_telefono: e.target.value})}
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-direccion" className="block text-sm font-medium mb-2">
                      Dirección
                    </label>
                    <Input
                        id="edit-direccion"
                        placeholder="Dirección completa"
                        value={formData.cli_direccion}
                        onChange={(e) => setFormData({...formData, cli_direccion: e.target.value})}
                    />
                  </div>
                </div>

                {/* Tercera fila - Información personal */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="edit-genero" className="block text-sm font-medium mb-2">
                      Género
                    </label>
                    <select
                        id="edit-genero"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.cli_genero}
                        onChange={(e) => setFormData({...formData, cli_genero: e.target.value})}
                    >
                      <option value="">Seleccionar género</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-fecha-nacimiento" className="block text-sm font-medium mb-2">
                      Fecha de Nacimiento
                    </label>
                    <Input
                        id="edit-fecha-nacimiento"
                        type="date"
                        value={formData.cli_fecha_nacimiento}
                        onChange={(e) => setFormData({...formData, cli_fecha_nacimiento: e.target.value})}
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-rfc" className="block text-sm font-medium mb-2">
                      RFC
                    </label>
                    <Input
                        id="edit-rfc"
                        placeholder="RFC del cliente"
                        value={formData.cli_rfc}
                        onChange={(e) => setFormData({...formData, cli_rfc: e.target.value})}
                    />
                  </div>
                </div>

                {/* Cuarta fila - Categorización */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="edit-categoria" className="block text-sm font-medium mb-2">
                      Categoría*
                    </label>
                    <select
                        id="edit-categoria"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.cli_cat_id}
                        onChange={(e) => setFormData({...formData, cli_cat_id: e.target.value})}
                    >
                      <option value="">Seleccionar categoría</option>
                      {categorias.map(cat => (
                          <option key={cat.cli_cat_id} value={cat.cli_cat_id}>
                            {cat.cli_cat_nombre}
                          </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-tipo" className="block text-sm font-medium mb-2">
                      Tipo de Cliente
                    </label>
                    <select
                        id="edit-tipo"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.cli_tipo}
                        onChange={(e) => setFormData({...formData, cli_tipo: e.target.value})}
                    >
                      <option value="Regular">Regular</option>
                      <option value="VIP">VIP</option>
                      <option value="Corporativo">Corporativo</option>
                      <option value="Mayorista">Mayorista</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-estado" className="block text-sm font-medium mb-2">
                      Estado
                    </label>
                    <select
                        id="edit-estado"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.cli_estado}
                        onChange={(e) => setFormData({...formData, cli_estado: e.target.value})}
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                {/* Quinta fila - Notas */}
                <div>
                  <label htmlFor="edit-notas" className="block text-sm font-medium mb-2">
                    Notas
                  </label>
                  <textarea
                      id="edit-notas"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Notas adicionales sobre el cliente"
                      value={formData.cli_notas}
                      onChange={(e) => setFormData({...formData, cli_notas: e.target.value})}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdate} disabled={loading}>
                  {loading ? "Actualizando..." : "Actualizar Cliente"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal de confirmar eliminación */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Confirmar Eliminación</DialogTitle>
                <DialogDescription>
                  ¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.
                </DialogDescription>
              </DialogHeader>

              {selectedCustomer && (
                  <div className="py-4">
                    <p className="text-sm">
                      <strong>Cliente:</strong> {selectedCustomer.cli_nombre} {selectedCustomer.cli_apellido}
                    </p>
                    <p className="text-sm">
                      <strong>Email:</strong> {selectedCustomer.cli_email}
                    </p>
                  </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                  {loading ? "Eliminando..." : "Eliminar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </MainLayout>
  );
};

export default CustomersPage;
