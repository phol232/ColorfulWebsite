import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search as SearchIcon,
    Calendar,
    CreditCard,
    RefreshCcw,
    Plus,
    Edit,
    Trash2,
    Building2,
    FileText,
    CheckCircle,
    AlertCircle
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { API_URL } from "@/config";

interface MetodoPago {
    met_id: string;
    met_nombre: string;
    met_descripcion?: string;
    met_estado: string;
    met_tipo?: string;
    met_banco?: string;
    created_at: string;
    updated_at: string;
}

const PaymentMethodsPage: React.FC = () => {
    const [metodosData, setMetodosData] = useState<MetodoPago[]>([]);
    const [filteredMetodos, setFilteredMetodos] = useState<MetodoPago[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [estadoFilter, setEstadoFilter] = useState("todos");
    const [tipoFilter, setTipoFilter] = useState("todos");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedMetodo, setSelectedMetodo] = useState<MetodoPago | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // Form state
    const [formData, setFormData] = useState({
        met_nombre: "",
        met_descripcion: "",
        met_estado: "Activo",
        met_tipo: "",
        met_banco: ""
    });

    // Fetch métodos de pago from backend
    const fetchMetodosPago = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/metodos-pago`);
            if (response.ok) {
                const data = await response.json();
                setMetodosData(data);
                setFilteredMetodos(data);
            } else {
                toast({
                    title: "Error",
                    description: "No se pudieron cargar los métodos de pago",
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

    useEffect(() => {
        fetchMetodosPago();
    }, []);

    // Filter methods based on search and filters
    useEffect(() => {
        let filtered = metodosData;

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(metodo =>
                metodo.met_nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (metodo.met_descripcion && metodo.met_descripcion.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (metodo.met_banco && metodo.met_banco.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Estado filter
        if (estadoFilter !== "todos") {
            filtered = filtered.filter(metodo => metodo.met_estado === estadoFilter);
        }

        // Tipo filter
        if (tipoFilter !== "todos") {
            filtered = filtered.filter(metodo => metodo.met_tipo === tipoFilter);
        }

        setFilteredMetodos(filtered);
    }, [searchQuery, estadoFilter, tipoFilter, metodosData]);

    // Create método de pago
    const handleCreate = async () => {
        try {
            const response = await fetch(`${API_URL}/api/metodos-pago`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                toast({
                    title: "Éxito",
                    description: "Método de pago creado correctamente"
                });
                setIsCreateDialogOpen(false);
                resetForm();
                fetchMetodosPago();
            } else {
                const error = await response.json();
                toast({
                    title: "Error",
                    description: error.message || "Error al crear el método de pago",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Error de conexión con el servidor",
                variant: "destructive"
            });
        }
    };

    // Update método de pago
    const handleUpdate = async () => {
        if (!selectedMetodo) return;

        try {
            const response = await fetch(`${API_URL}/api/metodos-pago/${selectedMetodo.met_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                toast({
                    title: "Éxito",
                    description: "Método de pago actualizado correctamente"
                });
                setIsEditDialogOpen(false);
                resetForm();
                fetchMetodosPago();
            } else {
                const error = await response.json();
                toast({
                    title: "Error",
                    description: error.message || "Error al actualizar el método de pago",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Error de conexión con el servidor",
                variant: "destructive"
            });
        }
    };

    // Delete método de pago
    const handleDelete = async () => {
        if (!selectedMetodo) return;

        try {
            const response = await fetch(`${API_URL}/api/metodos-pago/${selectedMetodo.met_id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toast({
                    title: "Éxito",
                    description: "Método de pago eliminado correctamente"
                });
                setIsDeleteDialogOpen(false);
                setSelectedMetodo(null);
                fetchMetodosPago();
            } else {
                const error = await response.json();
                toast({
                    title: "Error",
                    description: error.message || "Error al eliminar el método de pago",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Error de conexión con el servidor",
                variant: "destructive"
            });
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            met_nombre: "",
            met_descripcion: "",
            met_estado: "Activo",
            met_tipo: "",
            met_banco: ""
        });
        setSelectedMetodo(null);
    };

    // Open edit dialog
    const openEditDialog = (metodo: MetodoPago) => {
        setSelectedMetodo(metodo);
        setFormData({
            met_nombre: metodo.met_nombre,
            met_descripcion: metodo.met_descripcion || "",
            met_estado: metodo.met_estado,
            met_tipo: metodo.met_tipo || "",
            met_banco: metodo.met_banco || ""
        });
        setIsEditDialogOpen(true);
    };

    // Open delete dialog
    const openDeleteDialog = (metodo: MetodoPago) => {
        setSelectedMetodo(metodo);
        setIsDeleteDialogOpen(true);
    };

    // Clear filters
    const clearFilters = () => {
        setSearchQuery("");
        setEstadoFilter("todos");
        setTipoFilter("todos");
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get unique tipos for filter
    const uniqueTipos = Array.from(new Set(metodosData.map(m => m.met_tipo).filter(Boolean)));

    return (
        <MainLayout>
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">MÉTODOS DE PAGO</h1>
                        <p className="text-gray-500">Gestión de métodos de pago del sistema</p>
                    </div>

                    {/* Statistics cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 md:mt-0">
                        <div className="bg-background border rounded-md p-2 shadow-sm">
                            <div className="text-xs text-muted-foreground mb-1">Total Métodos</div>
                            <div className="text-base font-semibold">{metodosData.length}</div>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                                <CreditCard className="mr-1 h-3 w-3 text-primary" />
                                <span>Registrados</span>
                            </div>
                        </div>

                        <div className="bg-background border rounded-md p-2 shadow-sm">
                            <div className="text-xs text-muted-foreground mb-1">Activos</div>
                            <div className="text-base font-semibold text-green-600">
                                {metodosData.filter(m => m.met_estado === 'Activo').length}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                                <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                                <span>Disponibles</span>
                            </div>
                        </div>

                        <div className="bg-background border rounded-md p-2 shadow-sm">
                            <div className="text-xs text-muted-foreground mb-1">Inactivos</div>
                            <div className="text-base font-semibold text-red-600">
                                {metodosData.filter(m => m.met_estado !== 'Activo').length}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                                <AlertCircle className="mr-1 h-3 w-3 text-red-500" />
                                <span>No disponibles</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            type="text"
                            placeholder="Buscar por nombre, descripción o banco..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos los estados</SelectItem>
                                <SelectItem value="Activo">Activo</SelectItem>
                                <SelectItem value="Inactivo">Inactivo</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={tipoFilter} onValueChange={setTipoFilter}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos los tipos</SelectItem>
                                {uniqueTipos.map(tipo => (
                                    <SelectItem key={tipo} value={tipo!}>{tipo}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button variant="outline" onClick={clearFilters}>
                            <RefreshCcw className="h-4 w-4 mr-2" />
                            Limpiar
                        </Button>

                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Método
                        </Button>
                    </div>
                </div>

                {/* Payment methods cards */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="text-lg">Cargando métodos de pago...</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMetodos.map((metodo) => (
                            <Card key={metodo.met_id} className="overflow-hidden">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <CardTitle className="text-base">{metodo.met_nombre}</CardTitle>
                                            <CardDescription className="text-sm">{metodo.met_id}</CardDescription>
                                        </div>
                                        <Badge variant={metodo.met_estado === 'Activo' ? 'default' : 'secondary'}>
                                            {metodo.met_estado}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    {metodo.met_descripcion && (
                                        <div>
                                            <div className="text-sm text-gray-500">Descripción</div>
                                            <div className="text-sm">{metodo.met_descripcion}</div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        {metodo.met_tipo && (
                                            <div>
                                                <div className="text-gray-500">Tipo</div>
                                                <div className="font-medium">{metodo.met_tipo}</div>
                                            </div>
                                        )}

                                        {metodo.met_banco && (
                                            <div>
                                                <div className="text-gray-500">Banco</div>
                                                <div className="font-medium flex items-center">
                                                    <Building2 className="h-3 w-3 mr-1" />
                                                    {metodo.met_banco}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-500">Última actualización</div>
                                        <div className="text-sm">{formatDate(metodo.updated_at)}</div>
                                    </div>
                                </CardContent>

                                <CardFooter className="pt-2 border-t">
                                    <div className="w-full flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openEditDialog(metodo)}
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Editar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openDeleteDialog(metodo)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Eliminar
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}

                {filteredMetodos.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <div className="text-lg font-medium text-gray-600">No se encontraron métodos de pago</div>
                        <div className="text-gray-500">Intenta ajustar los filtros o crear un nuevo método</div>
                    </div>
                )}
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Crear Nuevo Método de Pago</DialogTitle>
                        <DialogDescription>
                            Agrega un nuevo método de pago al sistema
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="nombre">Nombre *</Label>
                            <Input
                                id="nombre"
                                value={formData.met_nombre}
                                onChange={(e) => setFormData({...formData, met_nombre: e.target.value})}
                                placeholder="Ej: Visa, PayPal, Efectivo"
                            />
                        </div>

                        <div>
                            <Label htmlFor="descripcion">Descripción</Label>
                            <Textarea
                                id="descripcion"
                                value={formData.met_descripcion}
                                onChange={(e) => setFormData({...formData, met_descripcion: e.target.value})}
                                placeholder="Descripción del método de pago"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="estado">Estado</Label>
                                <Select value={formData.met_estado} onValueChange={(value) => setFormData({...formData, met_estado: value})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Activo">Activo</SelectItem>
                                        <SelectItem value="Inactivo">Inactivo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="tipo">Tipo</Label>
                                <Input
                                    id="tipo"
                                    value={formData.met_tipo}
                                    onChange={(e) => setFormData({...formData, met_tipo: e.target.value})}
                                    placeholder="Ej: Tarjeta, Digital"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="banco">Banco</Label>
                            <Input
                                id="banco"
                                value={formData.met_banco}
                                onChange={(e) => setFormData({...formData, met_banco: e.target.value})}
                                placeholder="Nombre del banco (opcional)"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setIsCreateDialogOpen(false);
                            resetForm();
                        }}>
                            Cancelar
                        </Button>
                        <Button onClick={handleCreate}>
                            Crear Método
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar Método de Pago</DialogTitle>
                        <DialogDescription>
                            Modifica la información del método de pago
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-nombre">Nombre *</Label>
                            <Input
                                id="edit-nombre"
                                value={formData.met_nombre}
                                onChange={(e) => setFormData({...formData, met_nombre: e.target.value})}
                                placeholder="Ej: Visa, PayPal, Efectivo"
                            />
                        </div>

                        <div>
                            <Label htmlFor="edit-descripcion">Descripción</Label>
                            <Textarea
                                id="edit-descripcion"
                                value={formData.met_descripcion}
                                onChange={(e) => setFormData({...formData, met_descripcion: e.target.value})}
                                placeholder="Descripción del método de pago"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-estado">Estado</Label>
                                <Select value={formData.met_estado} onValueChange={(value) => setFormData({...formData, met_estado: value})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Activo">Activo</SelectItem>
                                        <SelectItem value="Inactivo">Inactivo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="edit-tipo">Tipo</Label>
                                <Input
                                    id="edit-tipo"
                                    value={formData.met_tipo}
                                    onChange={(e) => setFormData({...formData, met_tipo: e.target.value})}
                                    placeholder="Ej: Tarjeta, Digital"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="edit-banco">Banco</Label>
                            <Input
                                id="edit-banco"
                                value={formData.met_banco}
                                onChange={(e) => setFormData({...formData, met_banco: e.target.value})}
                                placeholder="Nombre del banco (opcional)"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setIsEditDialogOpen(false);
                            resetForm();
                        }}>
                            Cancelar
                        </Button>
                        <Button onClick={handleUpdate}>
                            Actualizar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Eliminar Método de Pago</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar este método de pago? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedMetodo && (
                        <div className="py-4">
                            <div className="bg-gray-50 p-3 rounded-md">
                                <div className="font-medium">{selectedMetodo.met_nombre}</div>
                                <div className="text-sm text-gray-600">{selectedMetodo.met_id}</div>
                                {selectedMetodo.met_descripcion && (
                                    <div className="text-sm text-gray-600 mt-1">{selectedMetodo.met_descripcion}</div>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setIsDeleteDialogOpen(false);
                            setSelectedMetodo(null);
                        }}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
};

export default PaymentMethodsPage;
