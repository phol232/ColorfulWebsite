import React, { useState, useEffect, FC } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useUserId } from "@/hooks/useUserId";
import { useNotifications } from "@/hooks/useNotifications";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import {
    Search as SearchIcon,
    PlusCircle,
    ArrowUpRight,
    ArrowDownLeft,
    Trash2,
    Edit,
    X,
    Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { API_URL } from "@/config";

interface Producto {
    pro_id: string;
    pro_nombre: string;
    pro_stock: number;
}

interface TipoMovimiento {
    tipmov_id: string;
    tipmov_nombre: string;
}

interface Proveedor {
    prov_id: string;
    prov_nombre: string;
}

interface Usuario {
    usr_id: string;
    usr_nombre: string;
}

interface ProductoMovimiento {
    pro_id: string;
    pro_nombre: string;
    pro_stock: number;
    pivot: {
        movprod_cantidad: number;
        movprod_costo_unitario: number;
    };
}

interface Movimiento {
    _loadingTipoNombre: any;
    mov_id: string;
    mov_fecha: string;
    mov_referencia: string;
    mov_notas: string;
    tipoMovimiento: TipoMovimiento;
    proveedor: Proveedor;
    usuario: Usuario;
    productos: ProductoMovimiento[];
}

interface ProductoForm {
    producto: string;
    cantidad: number;
    costo: number;
}

interface MovimientosPageProps {
    onChange?: () => void;
}

const MovimientosPage: FC<MovimientosPageProps> = ({ onChange }) => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useNotifications();
    const [search, setSearch] = useState("");
    const [tipoFiltro, setTipoFiltro] = useState<"todos" | "Entrada" | "Salida">("todos");
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoForm[]>([{ producto: "", cantidad: 1, costo: 0 }]);
    const [productosEncontrados, setProductosEncontrados] = useState<Producto[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [editando, setEditando] = useState<Movimiento | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [movimientoAEliminar, setMovimientoAEliminar] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null); // <-- Agregado para manejar errores
    // Importar el hook useUserId directamente para evitar problemas de disponibilidad
    const { userProfile } = useAuth();
    const userId = useUserId() || "DEV-USR-001"; // Asegurarse de que siempre haya un ID disponible

    // Consulta para obtener movimientos del backend
    const { data: movimientos = [], isLoading } = useQuery<Movimiento[], Error>({
        queryKey: ["movimientos"],
        queryFn: async () => {
            try {
                const response = await axios.get(`${API_URL}/api/inventario/movimientos`);
                return response.data;
            } catch (error) {
                console.error("Error al cargar movimientos:", error);
                showError(error, "Error al cargar los movimientos del inventario");
                return [];
            }
        },
    });

    // Consulta para obtener productos para el formulario
    const { data: productos = [] } = useQuery<Producto[], Error>({
        queryKey: ["productos", "listado"],
        queryFn: async () => {
            try {
                const response = await axios.get(`${API_URL}/api/inventario/productos/lista`);
                return response.data;
            } catch (error) {
                console.error("Error al cargar productos:", error);
                return [];
            }
        },
        staleTime: 300_000,
    });

    // Búsqueda de productos
    useEffect(() => {
        if (searchQuery) {
            const filtrados = productos.filter(p =>
                p.pro_nombre.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setProductosEncontrados(filtrados);
        } else {
            setProductosEncontrados([]);
        }
    }, [searchQuery, productos]);

    // Consulta para obtener tipos de movimientos (fallback a valores predefinidos si la API no está disponible)
    const { data: tiposMovimiento = [] } = useQuery<TipoMovimiento[], Error>({
        queryKey: ["tipos-movimiento"],
        queryFn: async () => {
            try {
                console.log("Fetching tipos-movimientos from API...");
                const response = await axios.get(`${API_URL}/api/tipos-movimientos`);
                console.log("API response de tipos-movimientos:", response.data);

                if (response.data && Array.isArray(response.data)) {
                    if (response.data.length > 0 && typeof response.data[0] === 'string') {
                        // Si son solo strings, convertirlos al formato esperado
                        const convertidos = response.data.map((nombre: string, index: number) => ({
                            tipmov_id: (index + 1).toString(),
                            tipmov_nombre: nombre
                        }));
                        return convertidos;
                    } else if (response.data.length > 0 && typeof response.data[0] === 'object') {
                        // Si ya son objetos pero pueden tener estructura distinta
                        if ('tipmov_nombre' in response.data[0]) {
                            // Ya tienen el formato correcto
                            return response.data;
                        } else if ('nombre' in response.data[0]) {
                            // Adaptar si la propiedad se llama diferente
                            const adaptados = response.data.map((item: any, i: number) => ({
                                tipmov_id: item.id || item.tipmov_id || `TIP-00${i + 1}`,
                                tipmov_nombre: item.nombre || item.name
                            }));
                            return adaptados;
                        }
                    }

                }

                // Fallback a tipos predefinidos
                return [
                    { tipmov_id: "TIP-001", tipmov_nombre: "Entrada" },
                    { tipmov_id: "TIP-002", tipmov_nombre: "Salida" }
                ];
            } catch (error) {
                console.error("Error al cargar tipos de movimiento:", error);
                return [
                    { tipmov_id: "TIP-001", tipmov_nombre: "Entrada" },
                    { tipmov_id: "TIP-002", tipmov_nombre: "Salida" }
                ];
            }
        },
        staleTime: 300_000,
    });

    // Función para obtener el nombre de un tipo de movimiento por su ID
    const obtenerTipoMovimiento = async (tipmovId: string) => {
        try {
            if (!tipmovId) return "Desconocido";

            const response = await axios.get(`${API_URL}/api/tipos-movimientos/${tipmovId}`);
            if (response.data && response.data.tipmov_nombre) {
                return response.data.tipmov_nombre;
            }

            // Buscar en la lista de tipos ya cargados
            const tipoEncontrado = tiposMovimiento.find(t => t.tipmov_id === tipmovId);
            if (tipoEncontrado) {
                return tipoEncontrado.tipmov_nombre;
            }

            return "Desconocido";
        } catch (error) {
            console.error(`Error al obtener tipo de movimiento ${tipmovId}:`, error);
            return "Desconocido";
        }
    };

    // Consulta para obtener proveedores
    const { data: proveedores = [] } = useQuery<Proveedor[], Error>({
        queryKey: ["proveedores"],
        queryFn: async () => {
            try {
                const response = await axios.get(`${API_URL}/api/proveedores`);
                return response.data;
            } catch (error) {
                console.error("Error al cargar proveedores:", error);
                return [];
            }
        },
        staleTime: 300_000,
    });

    // Mutación para crear movimiento
    const crearMovimiento = useMutation({
        mutationFn: async (formData: any) => {
            return axios.post(`${API_URL}/api/inventario/movimientos`, formData).then(r => r.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["movimientos"] });
            // Invalidar también la consulta de productos para actualizar el stock
            queryClient.invalidateQueries({ queryKey: ["productos"] });
            if (onChange) onChange();
            setIsDialogOpen(false);
            limpiarFormulario();
            showSuccess("Movimiento creado correctamente");
        },
        onError: (error) => {
            showError(error, "No se pudo crear el movimiento");
        }
    });

    // Mutación para editar movimiento
    const editarMovimiento = useMutation({
        mutationFn: async ({ id, formData }: { id: string, formData: any }) => {
            return axios.post(`${API_URL}/api/inventario/movimientos/${id}`, {
                ...formData,
                _method: 'PUT' // Para compatibilidad con Laravel cuando no se puede usar PUT directamente
            }).then(r => r.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["movimientos"] });
            // Invalidar también la consulta de productos para actualizar el stock
            queryClient.invalidateQueries({ queryKey: ["productos"] });
            if (onChange) onChange();
            setIsDialogOpen(false);
            setEditando(null);
            limpiarFormulario();
            showSuccess("Movimiento actualizado correctamente");
        },
        onError: (error) => {
            showError(error, "No se pudo actualizar el movimiento");
        }
    });

    // Mutación para eliminar movimiento
    const eliminarMovimiento = useMutation({
        mutationFn: async (id: string) => {
            return axios.delete(`${API_URL}/api/inventario/movimientos/${id}`).then(r => r.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["movimientos"] });
            // Invalidar también la consulta de productos para actualizar el stock
            queryClient.invalidateQueries({ queryKey: ["productos"] });
            if (onChange) onChange();
            setIsDeleteDialogOpen(false);
            setMovimientoAEliminar(null);
            showSuccess("Movimiento eliminado correctamente");
        },
        onError: (error) => {
            showError(error, "No se pudo eliminar el movimiento");
        }
    });

    // Formatear fecha
    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        const options: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "short",
            day: "numeric"
        };
        return new Date(dateString).toLocaleDateString("es-ES", options);
    };

    // Agregar nuevo producto al formulario
    const agregarProducto = () => {
        setProductosSeleccionados(prev => [
            ...prev,
            { producto: "", cantidad: 1, costo: 0 }
        ]);
    };

    // Eliminar producto del formulario
    const eliminarProducto = (index: number) => {
        if (productosSeleccionados.length > 1) {
            setProductosSeleccionados(prev => prev.filter((_, i) => i !== index));
        }
    };

    // Actualizar producto seleccionado
    const actualizarProducto = (index: number, campo: keyof ProductoForm, valor: any) => {
        setProductosSeleccionados(prev => {
            const nuevos = [...prev];
            nuevos[index] = { ...nuevos[index], [campo]: valor };
            return nuevos;
        });
    };

    // Limpiar formulario
    const limpiarFormulario = () => {
        setProductosSeleccionados([{ producto: "", cantidad: 1, costo: 0 }]);
        setSearchQuery("");
        setProductosEncontrados([]);
        setError(null); // Limpiar error al limpiar el formulario
    };

    // Preparar datos para edición
    const prepararEdicion = async (movimiento: Movimiento) => {
        // Si el tipo tiene ID pero no nombre, intentamos obtenerlo
        if (movimiento.tipoMovimiento &&
            movimiento.tipoMovimiento.tipmov_id &&
            !movimiento.tipoMovimiento.tipmov_nombre) {
            try {
                const tipoNombre = await obtenerTipoMovimiento(movimiento.tipoMovimiento.tipmov_id);
                movimiento = {
                    ...movimiento,
                    tipoMovimiento: {
                        ...movimiento.tipoMovimiento,
                        tipmov_nombre: tipoNombre
                    }
                };
            } catch (error) {
                console.error("Error al obtener tipo de movimiento:", error);
            }
        }

        // Si existe la propiedad tipmov_id directamente en el movimiento
        if ('tipmov_id' in movimiento && !(movimiento.tipoMovimiento?.tipmov_nombre)) {
            try {
                const tipoId = (movimiento as any).tipmov_id;
                const tipoNombre = await obtenerTipoMovimiento(tipoId);

                // Crear o actualizar la estructura tipoMovimiento
                movimiento = {
                    ...movimiento,
                    tipoMovimiento: {
                        tipmov_id: tipoId,
                        tipmov_nombre: tipoNombre
                    }
                };
            } catch (error) {
                console.error("Error al obtener tipo de movimiento:", error);
            }
        }

        setEditando(movimiento);

        // Preparar productos del movimiento para el formulario
        const productosForm = movimiento.productos && movimiento.productos.length > 0
            ? movimiento.productos.map(p => ({
                producto: p.pro_nombre,
                cantidad: p.pivot.movprod_cantidad,
                costo: p.pivot.movprod_costo_unitario
            }))
            : [{ producto: "", cantidad: 1, costo: 0 }];

        setProductosSeleccionados(productosForm);
        setIsDialogOpen(true);
    };

    // Manejar envío del formulario
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null); // Limpiar error antes de validar
        const formData = new FormData(e.currentTarget);

        // Usar el userId del hook useUserId que maneja todos los casos de formato de ID
        // Este hook ya tiene incorporado el fallback para desarrollo

        // Imprimir información de depuración
        console.log("ID de usuario para el movimiento:", userId);
        console.log("Estado de autenticación:", userProfile);

        if (!userId) {
            setError("No se pudo identificar al usuario. Por favor, recarga la página o inicia sesión nuevamente.");
            console.error("Error: ID de usuario no disponible", userProfile);
            return;
        }

        // Validar que haya al menos un producto con datos completos
        const productosValidos = productosSeleccionados.filter(
            p => p.producto && p.cantidad > 0
        );

        if (productosValidos.length === 0) {
            setError("Debe agregar al menos un producto válido");
            return;
        }

        // Construir el objeto de datos según el formato exacto esperado por el backend
        const data = {
            tipmov_nombre: formData.get('tipmov_nombre'),
            mov_fecha: formData.get('mov_fecha') + " 23:00:00", // Añadir la hora para el formato correcto
            mov_referencia: formData.get('mov_referencia'),
            mov_notas: formData.get('mov_notas'),
            usr_id: userId, // Usar el ID del usuario autenticado (ya validado con fallback)
            usuario_id: userId, // Alternativa - algunos backends esperan este nombre
            prov_nombre: formData.get('prov_nombre'),
            productos: productosSeleccionados
                .filter(p => p.producto && p.cantidad > 0)
                .map(p => ({
                    prod_nombre: p.producto,
                    movprod_cantidad: p.cantidad,
                    movprod_costo_unitario: p.costo
                }))
        };

        // Mostrar datos que se van a enviar (para depuración)
        console.log("Datos a enviar al servidor:", data);

        if (editando) {
            editarMovimiento.mutate({ id: editando.mov_id, formData: data });
        } else {
            crearMovimiento.mutate(data);
        }
    };

    // Filtrado
    const movimientosFiltrados = movimientos.filter(mov => {
        // Verificar que el objeto tenga toda la estructura necesaria antes de filtrar
        if (!mov || !mov.productos || mov.productos.length === 0) return false;

        // Construir un texto de búsqueda que incluya toda la información relevante
        const searchText = [
            mov.mov_id,
            mov.mov_referencia,
            mov.mov_notas,
            mov.proveedor?.prov_nombre || "",
            ...mov.productos.map(p => p.pro_nombre || "")
        ].join(" ").toLowerCase();

        // Filtro por búsqueda
        const matchesSearch = search === "" || searchText.includes(search.toLowerCase());

        // Filtro por tipo
        const matchesTipo =
            tipoFiltro === "todos" ||
            (tipoFiltro === "Entrada" && mov.tipoMovimiento && mov.tipoMovimiento.tipmov_nombre === "Entrada") ||
            (tipoFiltro === "Salida" && mov.tipoMovimiento && mov.tipoMovimiento.tipmov_nombre === "Salida");

        // Filtro por fecha (si está establecido)
        const matchesFechaDesde = fechaDesde ? mov.mov_fecha >= fechaDesde : true;
        const matchesFechaHasta = fechaHasta ? mov.mov_fecha <= fechaHasta : true;

        return matchesSearch && matchesTipo && matchesFechaDesde && matchesFechaHasta;
    });

    return (
        <>
            {/* Búsqueda y Filtros */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        className="pl-9"
                        placeholder="Buscar por producto o detalles..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    <Select value={tipoFiltro} onValueChange={v => setTipoFiltro(v as any)}>
                        <SelectTrigger className="h-9 w-36">
                            <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="Entrada">Entradas</SelectItem>
                            <SelectItem value="Salida">Salidas</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2">
                        <Input
                            type="date"
                            className="h-9 w-36"
                            placeholder="Desde"
                            value={fechaDesde}
                            onChange={e => setFechaDesde(e.target.value)}
                        />
                        <span>-</span>
                        <Input
                            type="date"
                            className="h-9 w-36"
                            placeholder="Hasta"
                            value={fechaHasta}
                            onChange={e => setFechaHasta(e.target.value)}
                        />
                    </div>

                    <Button size="sm" className="flex items-center gap-1" onClick={() => {
                        setEditando(null);
                        limpiarFormulario();
                        setIsDialogOpen(true);
                    }}>
                        <PlusCircle className="h-4 w-4" />
                        <span>Nuevo Movimiento</span>
                    </Button>
                </div>
            </div>

            {/* Movimientos en tarjetas */}
            {isLoading ? (
                <div className="text-center py-10">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    <p className="mt-2 text-gray-500">Cargando movimientos...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {movimientosFiltrados.length > 0 ? (
                        movimientosFiltrados.map(movimiento => (
                            <Card key={movimiento.mov_id} className="overflow-hidden">
                                <CardHeader className={`pb-2 ${
                                    movimiento.tipoMovimiento?.tipmov_nombre === 'Entrada'
                                        ? 'bg-green-50 border-b border-green-100'
                                        : 'bg-red-50 border-b border-red-100'
                                }`}>
                                    <div className="flex justify-between items-center">
                                        {(() => {
                                            // Ver si tenemos el tipo directamente en el objeto
                                            let tipoNombre = movimiento.tipoMovimiento?.tipmov_nombre;

                                            // Si no tenemos el nombre pero tenemos el ID, usamos ese para obtenerlo
                                            if (!tipoNombre) {
                                                // Si el tipo está en una propiedad alternativa
                                                const tipmovId = movimiento.tipoMovimiento?.tipmov_id ||
                                                    (movimiento as any).tipmov_id;

                                                if (tipmovId) {
                                                    // Usar el ID para buscar en los tipos ya cargados
                                                    const tipoEncontrado = tiposMovimiento.find(t => t.tipmov_id === tipmovId);
                                                    if (tipoEncontrado) {
                                                        tipoNombre = tipoEncontrado.tipmov_nombre;
                                                    } else {
                                                        // En lugar de usar useEffect aquí (lo cual viola las reglas de los hooks),
                                                        // cargamos el nombre asíncronamente y hacemos que se muestre "Cargando..."
                                                        // mientras tanto
                                                        if (!movimiento._loadingTipoNombre) {
                                                            // Evitar múltiples solicitudes
                                                            movimiento._loadingTipoNombre = true;
                                                            obtenerTipoMovimiento(tipmovId).then(nombre => {
                                                                // Esto forzará un re-render con el nombre correcto
                                                                queryClient.setQueryData(["movimientos"], old => {
                                                                    if (!Array.isArray(old)) return old;
                                                                    return old.map(m => {
                                                                        if (m.mov_id === movimiento.mov_id) {
                                                                            return {
                                                                                ...m,
                                                                                tipoMovimiento: {
                                                                                    ...(m.tipoMovimiento || {}),
                                                                                    tipmov_nombre: nombre
                                                                                }
                                                                            };
                                                                        }
                                                                        return m;
                                                                    });
                                                                });
                                                            });
                                                        }
                                                        tipoNombre = "Cargando...";
                                                    }
                                                }
                                            }

                                            // Determinar si es entrada o salida basado en el nombre (o fallback)
                                            const esEntrada = tipoNombre ? tipoNombre === 'Entrada' :
                                                movimiento.mov_id.includes('E');

                                            return (
                                                <Badge className={
                                                    esEntrada
                                                        ? 'bg-green-100 text-green-800 border-green-300'
                                                        : 'bg-red-100 text-red-800 border-red-300'
                                                }>
                                                    {esEntrada ? (
                                                        <ArrowDownLeft className="mr-1 h-3 w-3" />
                                                    ) : (
                                                        <ArrowUpRight className="mr-1 h-3 w-3" />
                                                    )}
                                                    {tipoNombre || 'Cargando...'}
                                                </Badge>
                                            );
                                        })()}
                                        <span className="text-xs text-gray-500">{formatDate(movimiento.mov_fecha)}</span>
                                    </div>
                                    <CardTitle className="text-lg mt-2">
                                        {movimiento.mov_referencia || 'Sin referencia'}
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="pt-3">
                                    <div className="space-y-3">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-1">Productos:</h4>
                                            <ul className="space-y-2">
                                                {movimiento.productos.map((producto, idx) => (
                                                    <li key={idx} className="flex justify-between items-center text-sm border-b border-gray-100 pb-1">
                                                        <span className="font-medium">{producto.pro_nombre}</span>
                                                        <span>
                              {producto.pivot.movprod_cantidad} x {formatCurrency(producto.pivot.movprod_costo_unitario)}
                            </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-1">Proveedor:</h4>
                                            <p className="text-sm">{movimiento.proveedor?.prov_nombre || 'No especificado'}</p>
                                        </div>

                                        {movimiento.mov_notas && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500 mb-1">Notas:</h4>
                                                <p className="text-sm text-gray-700">{movimiento.mov_notas}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>

                                <CardFooter className="border-t bg-gray-50 flex justify-between pt-3 pb-3">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-blue-600 hover:text-blue-800"
                                        onClick={() => prepararEdicion(movimiento)}
                                    >
                                        <Edit className="h-4 w-4 mr-1" /> Editar
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-800"
                                        onClick={() => {
                                            setMovimientoAEliminar(movimiento.mov_id);
                                            setIsDeleteDialogOpen(true);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8 text-gray-500">
                            No se encontraron movimientos que coincidan con los criterios de búsqueda.
                        </div>
                    )}
                </div>
            )}

            {/* Modal de Crear/Editar Movimiento - Rediseñado en formato horizontal */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{editando ? 'Editar Movimiento' : 'Registrar Movimiento'}</DialogTitle>
                        <DialogDescription>
                            {editando ? 'Modifique los datos del movimiento de inventario' : 'Ingrese los datos del movimiento de inventario'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="py-2">
                        {/* Mostrar error si existe */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded">
                                {error}
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            {/* Columna Izquierda - Datos principales */}
                            <div className="md:col-span-5 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label>Tipo de Movimiento *</Label>
                                        {editando ? (
                                            <>
                                                <input
                                                    type="hidden"
                                                    name="tipmov_nombre"
                                                    value={editando.tipoMovimiento?.tipmov_nombre || ""}
                                                />
                                                <div className={`flex items-center px-3 py-2 border rounded-md ${
                                                    editando.tipoMovimiento?.tipmov_nombre === 'Entrada'
                                                        ? 'bg-green-50 border-green-200 text-green-800'
                                                        : 'bg-red-50 border-red-200 text-red-800'
                                                }`}>
                                                    {editando.tipoMovimiento?.tipmov_nombre === 'Entrada' ? (
                                                        <ArrowDownLeft className="mr-2 h-4 w-4" />
                                                    ) : (
                                                        <ArrowUpRight className="mr-2 h-4 w-4" />
                                                    )}
                                                    <span>{editando.tipoMovimiento?.tipmov_nombre || "No especificado"}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <Select
                                                name="tipmov_nombre"
                                                required
                                            >
                                                <SelectTrigger className="w-full text-left">
                                                    <SelectValue placeholder="Seleccionar tipo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {tiposMovimiento.length > 0 ? (
                                                        tiposMovimiento.map(tipo => (
                                                            <SelectItem key={tipo.tipmov_id} value={tipo.tipmov_nombre}>
                                                                {tipo.tipmov_nombre}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <>
                                                            <SelectItem value="Entrada">Entrada</SelectItem>
                                                            <SelectItem value="Salida">Salida</SelectItem>
                                                        </>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Fecha *</Label>
                                        <Input
                                            name="mov_fecha"
                                            type="date"
                                            required
                                            defaultValue={editando?.mov_fecha
                                                ? editando.mov_fecha.split('T')[0]
                                                : new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Proveedor *</Label>
                                    <Select name="prov_nombre" required defaultValue={editando?.proveedor?.prov_nombre}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar proveedor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {proveedores.map(p => (
                                                <SelectItem key={p.prov_id} value={p.prov_nombre}>
                                                    {p.prov_nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Referencia</Label>
                                    <Input
                                        name="mov_referencia"
                                        placeholder="Número de factura, orden, etc."
                                        defaultValue={editando?.mov_referencia || ''}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Notas</Label>
                                    <textarea
                                        name="mov_notas"
                                        placeholder="Descripción o motivo del movimiento"
                                        defaultValue={editando?.mov_notas || ''}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        rows={4}
                                    ></textarea>
                                </div>
                            </div>

                            {/* Columna Derecha - Productos */}
                            <div className="md:col-span-7 space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label>Productos *</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={agregarProducto}
                                        className="text-xs"
                                    >
                                        <Plus className="h-3 w-3 mr-1" /> Agregar Producto
                                    </Button>
                                </div>

                                {/* Lista de productos seleccionados */}
                                <div className="space-y-3 overflow-y-auto max-h-[340px] pr-1">
                                    {productosSeleccionados.map((prod, index) => (
                                        <div key={index} className="p-3 border rounded-md bg-gray-50">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="text-sm font-medium">Producto #{index + 1}</h4>
                                                {productosSeleccionados.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => eliminarProducto(index)}
                                                        className="h-6 w-6 p-0 text-red-600"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                                <div className="md:col-span-6">
                                                    <Label htmlFor={`producto-${index}`} className="text-xs">Seleccionar producto</Label>
                                                    <Select
                                                        value={prod.producto}
                                                        onValueChange={(value) => {
                                                            actualizarProducto(index, 'producto', value);
                                                        }}
                                                    >
                                                        <SelectTrigger id={`producto-${index}`} className="mt-1">
                                                            <SelectValue placeholder="Seleccione un producto" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {productos.map(p => (
                                                                <SelectItem key={p.pro_id} value={p.pro_nombre}>
                                                                    <div className="flex justify-between w-full">
                                                                        <span>{p.pro_nombre}</span>
                                                                        <span className="text-xs text-gray-500">Stock: {p.pro_stock}</span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="md:col-span-3">
                                                    <Label htmlFor={`cantidad-${index}`} className="text-xs">Cantidad</Label>
                                                    <Input
                                                        id={`cantidad-${index}`}
                                                        type="number"
                                                        min="1"
                                                        value={prod.cantidad}
                                                        onChange={(e) => actualizarProducto(index, 'cantidad', parseInt(e.target.value))}
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div className="md:col-span-3">
                                                    <Label htmlFor={`costo-${index}`} className="text-xs">Costo Unitario</Label>
                                                    <Input
                                                        id={`costo-${index}`}
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={prod.costo}
                                                        onChange={(e) => actualizarProducto(index, 'costo', parseFloat(e.target.value))}
                                                        className="mt-1"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="flex justify-end space-x-2 pt-4 mt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsDialogOpen(false);
                                    setEditando(null);
                                    limpiarFormulario();
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit">
                                {editando ? 'Guardar Cambios' : 'Guardar Movimiento'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal de confirmación para eliminar */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Eliminar Movimiento</DialogTitle>
                        <DialogDescription>
                            ¿Está seguro que desea eliminar este movimiento? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="bg-red-50 border border-red-200 text-red-800 p-3 mb-4 rounded-md text-sm">
                            <p className="font-medium">⚠️ Advertencia:</p>
                            <p>Al eliminar este movimiento, se actualizará el stock de los productos asociados.</p>
                        </div>
                    </div>
                    <DialogFooter className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsDeleteDialogOpen(false);
                                setMovimientoAEliminar(null);
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => movimientoAEliminar && eliminarMovimiento.mutate(movimientoAEliminar)}
                        >
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default MovimientosPage;
