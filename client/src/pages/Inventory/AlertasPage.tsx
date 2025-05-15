import React, { useState, FC } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
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
    AlertTriangle,
    Bell,
    Check,
    XCircle,
    ClipboardList,
    ArrowUpDown,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { API_URL } from "@/config";

interface Producto {
    pro_id: string;
    pro_nombre: string;
    pro_stock: number;
    pro_precio_venta: number;
    detalles: {
        prod_stock_minimo: number;
    };
}

interface Alerta {
    alt_id: string;
    alt_fecha: string;
    alt_titulo: string;
    alt_descripcion: string;
    alt_tipo: "stock_bajo" | "caducidad" | "otro";
    alt_estado: "activa" | "resuelta" | "ignorada";
    producto?: Producto;
}

interface AlertasPageProps {
    onChange?: () => void;
}

const AlertasPage: FC<AlertasPageProps> = ({ onChange }) => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [estadoFiltro, setEstadoFiltro] = useState<"todas" | "activas" | "resueltas" | "ignoradas">("todas");
    const [tipoFiltro, setTipoFiltro] = useState<"todos" | "stock_bajo" | "caducidad" | "otro">("todos");

    // Consulta para obtener alertas del backend
    const { data: alertas = [], isLoading } = useQuery<Alerta[], Error>({
        queryKey: ["alertas"],
        queryFn: () => axios.get(`${API_URL}/api/inventario/alertas`).then(r => r.data),
    });

    const resolverAlerta = useMutation({
        mutationFn: (id: string) => {
            return axios.patch(`${API_URL}/api/inventario/alertas/${id}`, { alt_estado: "resuelta" }).then(r => r.data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["alertas"] });
            if (onChange) onChange();
        }
    });

    const ignorarAlerta = useMutation({
        mutationFn: (id: string) => {
            return axios.patch(`${API_URL}/api/inventario/alertas/${id}`, { alt_estado: "ignorada" }).then(r => r.data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["alertas"] });
            if (onChange) onChange();
        }
    });

    // Filtrado
    const alertasFiltradas = alertas.filter(alerta => {
        // Filtro por búsqueda
        const matchesSearch =
            alerta.alt_titulo.toLowerCase().includes(search.toLowerCase()) ||
            alerta.alt_descripcion.toLowerCase().includes(search.toLowerCase()) ||
            (alerta.producto?.pro_nombre || "").toLowerCase().includes(search.toLowerCase());

        // Filtro por estado
        const matchesEstado =
            estadoFiltro === "todas" ||
            (estadoFiltro === "activas" && alerta.alt_estado === "activa") ||
            (estadoFiltro === "resueltas" && alerta.alt_estado === "resuelta") ||
            (estadoFiltro === "ignoradas" && alerta.alt_estado === "ignorada");

        // Filtro por tipo
        const matchesTipo =
            tipoFiltro === "todos" ||
            alerta.alt_tipo === tipoFiltro;

        return matchesSearch && matchesEstado && matchesTipo;
    });

    // Contadores por estado
    const contadores = {
        activas: alertas.filter(a => a.alt_estado === "activa").length,
        resueltas: alertas.filter(a => a.alt_estado === "resuelta").length,
        ignoradas: alertas.filter(a => a.alt_estado === "ignorada").length,
        total: alertas.length
    };

    const getIconByType = (tipo: string) => {
        switch (tipo) {
            case "stock_bajo":
                return <AlertTriangle className="h-5 w-5 text-amber-500" />;
            case "caducidad":
                return <ClipboardList className="h-5 w-5 text-red-500" />;
            default:
                return <Bell className="h-5 w-5 text-blue-500" />;
        }
    };

    return (
        <>
            {/* Resumen de alertas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500">Total Alertas</p>
                            <p className="text-2xl font-bold">{contadores.total}</p>
                        </div>
                        <Bell className="h-8 w-8 text-gray-400" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500">Activas</p>
                            <p className="text-2xl font-bold">{contadores.activas}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-amber-500" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500">Resueltas</p>
                            <p className="text-2xl font-bold">{contadores.resueltas}</p>
                        </div>
                        <Check className="h-8 w-8 text-green-500" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500">Ignoradas</p>
                            <p className="text-2xl font-bold">{contadores.ignoradas}</p>
                        </div>
                        <XCircle className="h-8 w-8 text-gray-400" />
                    </CardContent>
                </Card>
            </div>

            {/* Búsqueda y Filtros */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                        className="pl-9"
                        placeholder="Buscar alertas..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    <Select value={estadoFiltro} onValueChange={v => setEstadoFiltro(v as any)}>
                        <SelectTrigger className="h-9 w-36">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todas">Todas</SelectItem>
                            <SelectItem value="activas">Activas</SelectItem>
                            <SelectItem value="resueltas">Resueltas</SelectItem>
                            <SelectItem value="ignoradas">Ignoradas</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={tipoFiltro} onValueChange={v => setTipoFiltro(v as any)}>
                        <SelectTrigger className="h-9 w-36">
                            <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="stock_bajo">Stock Bajo</SelectItem>
                            <SelectItem value="caducidad">Caducidad</SelectItem>
                            <SelectItem value="otro">Otros</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Lista de alertas */}
            <div className="space-y-4">
                {isLoading ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                            <p className="mt-2 text-gray-500">Cargando alertas...</p>
                        </CardContent>
                    </Card>
                ) : alertasFiltradas.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-gray-500">
                            No se encontraron alertas que coincidan con los criterios de búsqueda.
                        </CardContent>
                    </Card>
                ) : (
                    alertasFiltradas.map(alerta => (
                        <Card key={alerta.alt_id} className={
                            alerta.alt_estado === "activa"
                                ? "border-l-4 border-l-amber-500"
                                : alerta.alt_estado === "resuelta"
                                    ? "border-l-4 border-l-green-500 opacity-70"
                                    : "border-l-4 border-l-gray-300 opacity-70"
                        }>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between">
                                    <div className="flex items-center gap-2">
                                        {getIconByType(alerta.alt_tipo)}
                                        <CardTitle className="text-lg">{alerta.alt_titulo}</CardTitle>
                                    </div>
                                    <span className="text-sm text-gray-500">{alerta.alt_fecha}</span>
                                </div>
                                <CardDescription>
                                    {alerta.alt_descripcion}
                                </CardDescription>
                            </CardHeader>

                            {alerta.producto && (
                                <CardContent className="pt-0 pb-2">
                                    <div className="bg-gray-50 p-3 rounded-md">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{alerta.producto.pro_nombre}</p>
                                                <p className="text-sm text-gray-500">
                                                    Stock actual: <span className={
                                                    alerta.producto.pro_stock < alerta.producto.detalles.prod_stock_minimo
                                                        ? "text-red-500 font-semibold"
                                                        : ""
                                                }>{alerta.producto.pro_stock}</span>
                                                    {" "}(Mínimo: {alerta.producto.detalles.prod_stock_minimo})
                                                </p>
                                            </div>
                                            <p className="font-semibold text-green-600">
                                                {formatCurrency(alerta.producto.pro_precio_venta)}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            )}

                            {alerta.alt_estado === "activa" && (
                                <CardFooter className="pt-2 flex justify-end gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => ignorarAlerta.mutate(alerta.alt_id)}
                                    >
                                        Ignorar
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => resolverAlerta.mutate(alerta.alt_id)}
                                    >
                                        Marcar como resuelta
                                    </Button>
                                </CardFooter>
                            )}
                        </Card>
                    ))
                )}
            </div>
        </>
    );
};

export default AlertasPage;