import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Search as SearchIcon,
    Filter as FilterIcon,
    Receipt,
    FileText,
    Eye,
    Download,
    Printer,
    CreditCard,
    RefreshCcw,
    Calendar,
    User,
    DollarSign,
    Hash,
    Clock,
    CheckCircle,
    AlertCircle,
    Package,
    X,
    Info,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "@/config";
import { useToast } from "@/hooks/use-toast";


interface Boleta {
    boleta_id: string;
    boleta_numero: string;
    boleta_fecha: string;
    boleta_subtotal: number;
    boleta_impuestos: number;
    boleta_descuento: number;
    boleta_total: number;
    boleta_estado: string;
    boleta_notas?: string;
    ped_id: string;
    pedido?: {
        ped_id: string;
        ped_fecha: string;
        ped_estado: string;
        ped_tipo: string;
        ped_forma_entrega: string;
        cli_id: string;
        usr_id: string;
        ped_notas?: string;
        detalles?: Array<{
            det_id: string;
            det_cantidad: number;
            det_precio_unitario: number;
            det_subtotal: number;
            prod_id: string;
        }>;
    };
    metodos_pago?: Array<{
        met_id: string;
        met_nombre: string;
        met_descripcion?: string;
        met_estado: string;
        met_tipo?: string;
        met_banco?: string;
        pivot: {
            boleta_id: string;
            met_id: string;
            monto: number;
            referencia: string;
            fecha_registro: string;
        };
    }>;
}

// Función para formatear la fecha sin conversión de zona horaria
const formatDate = (dateString: string) => {
    // Crear fecha directamente desde el string para evitar conversión de zona horaria
    const date = new Date(dateString.replace('Z', ''));
    return date.toLocaleString('es-PE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

// Función adicional para formato compacto en las tarjetas
const formatDateCompact = (dateString: string) => {
    // Crear fecha directamente desde el string para evitar conversión de zona horaria
    const date = new Date(dateString.replace('Z', ''));
    return date.toLocaleString('es-PE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

const BoletasPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBoleta, setSelectedBoleta] = useState<Boleta | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [anularBoletaId, setAnularBoletaId] = useState<string | null>(null);
    const [deleteOpen, setDeleteOpen] = useState<string | null>(null);
    
    // Estados de paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch boletas desde el backend
    const { data: boletas = [], isLoading, refetch } = useQuery<Boleta[]>({
        queryKey: ['/api/boletas'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/boletas`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) throw new Error('Error fetching boletas');
            const data = await response.json();
            return data.data || data;
        }
    });

    // Fetch clientes para obtener nombres
    const { data: clientes = [] } = useQuery<Array<{cli_id: string, cli_nombre: string}>>({
        queryKey: ['/api/clientes'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/clientes`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) return [];
            const data = await response.json();
            return data.data || data;
        }
    });

    // Fetch usuarios para obtener nombres
    const { data: usuarios = [] } = useQuery<Array<{usr_id: string, usr_nombre: string}>>({
        queryKey: ['/api/usuarios'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/usuarios`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) return [];
            const data = await response.json();
            return data.data || data;
        }
    });

    // Fetch productos para obtener nombres
    const { data: productos = [] } = useQuery<Array<{pro_id: string, pro_nombre: string}>>({
        queryKey: ['/api/productos'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/productos`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) return [];
            const data = await response.json();
            return data.data || data;
        }
    });

    // Obtener información del usuario logueado
    const { data: usuarioLogueado } = useQuery<{usr_id: string, usr_nombre: string}>({
        queryKey: ['/api/auth/me'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/auth/me`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) throw new Error('Error fetching user info');
            const data = await response.json();
            return data.data || data;
        }
    });

    // Mutation para anular boleta
    const anularBoletaMutation = useMutation({
        mutationFn: async (boletaId: string) => {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/boletas/${boletaId}/cancelar`, {
                method: 'PATCH',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
                throw new Error(errorData.message || `Error ${response.status}: No se pudo cancelar la boleta`);
            }
            return response.json();
        },
        onSuccess: async (response, boletaId) => {
            console.log('Respuesta completa del backend:', response);

            try {
                // La respuesta viene directamente del controlador
                const { 
                    message,
                    boleta_id: responseBoletaId,
                    pedido_anulado_id, 
                    nuevo_pedido_id, 
                    cliente_nombre
                } = response;

                // Invalidar consultas para refrescar los datos
                await queryClient.invalidateQueries({ queryKey: ['/api/boletas'] });
                await queryClient.invalidateQueries({ queryKey: ['/api/pedidos'] });

                // Mensaje de éxito detallado
                const successMessage = `${message}. Stock restaurado${cliente_nombre ? ` para ${cliente_nombre}` : ''}${pedido_anulado_id ? `. Pedido ${pedido_anulado_id} anulado` : ''}${nuevo_pedido_id ? ` y nuevo pedido ${nuevo_pedido_id} creado como pendiente` : ''}.`;

                toast({
                    title: "✅ Boleta Cancelada Exitosamente",
                    description: successMessage,
                    duration: 8000,
                    className: "bg-green-50 border-green-200 text-green-800"
                });

                setAnularBoletaId(null);
                setIsDetailsOpen(false);
            } catch (error) {
                console.error('Error procesando respuesta de éxito:', error);
                toast({
                    title: "Boleta cancelada",
                    description: "La boleta se canceló correctamente, pero hubo un problema al procesar la respuesta.",
                    duration: 5000
                });
                setAnularBoletaId(null);
                setIsDetailsOpen(false);
            }
        },
        onError: (error: any) => {
            console.error('Error al anular boleta:', error);
            const errorMessage = error.message || "No se pudo cancelar la boleta. Verifique que la boleta esté en estado válido.";
            toast({
                title: "Error al cancelar boleta",
                description: errorMessage,
                variant: "destructive",
                duration: 6000
            });
        }
    });

    // Función para obtener el nombre del cliente
    const getClienteName = (cli_id?: string) => {
        if (!cli_id) return 'Cliente no disponible';
        const cliente = clientes.find(c => c.cli_id === cli_id);
        return cliente?.cli_nombre || `Cliente ${cli_id}`;
    };

    // Función para obtener el nombre del usuario
    const getUsuarioName = (usr_id?: string) => {
        if (!usr_id) return 'Usuario no disponible';
        const usuario = usuarios.find(u => u.usr_id === usr_id);
        return usuario?.usr_nombre || `Usuario ${usr_id}`;
    };

    // Función para obtener el nombre del producto
    const getProductoName = (prod_id?: string) => {
        if (!prod_id) return 'Producto no disponible';
        const producto = productos.find(p => p.pro_id === prod_id);
        return producto?.pro_nombre || `Producto ${prod_id}`;
    };

    // Filtrar boletas según la búsqueda
    const filteredBoletas = boletas.filter(boleta => {
        if (!searchQuery) return true;

        const searchLower = searchQuery.toLowerCase();
        const clientName = getClienteName(boleta.pedido?.cli_id);

        return (
            boleta.boleta_numero.toLowerCase().includes(searchLower) ||
            boleta.boleta_id.toLowerCase().includes(searchLower) ||
            boleta.ped_id.toLowerCase().includes(searchLower) ||
            clientName.toLowerCase().includes(searchLower)
        );
    });

    // Lógica de paginación
    const totalPages = Math.ceil(filteredBoletas.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBoletas = filteredBoletas.slice(startIndex, endIndex);

    // Resetear página cuando cambien los filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Funciones de navegación
    const goToPage = (page: number) => {
        setCurrentPage(page);
    };

    const goToPreviousPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const goToNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    // Calcular estadísticas
    const estadisticas = {
        total: boletas.length,
        totalMonto: boletas.reduce((sum, boleta) => sum + Number(boleta.boleta_total), 0),
        emitidas: boletas.filter(b => b.boleta_estado === 'EMITIDA').length,
        promedio: boletas.length > 0 ? boletas.reduce((sum, boleta) => sum + Number(boleta.boleta_total), 0) / boletas.length : 0
    };

    // Función helper para verificar si la boleta está anulada/cancelada
    const isBoletaCancelada = (estado: string) => {
        const estadoLower = estado.toLowerCase().trim();
        return estadoLower === 'anulado' || 
               estadoLower === 'cancelado' || 
               estadoLower === 'cancelled' ||
               estadoLower === 'canceled';
    };

    // Función helper para verificar si la boleta está emitida
    const isBoletaEmitida = (estado: string) => {
        const estadoLower = estado.toLowerCase().trim();
        return estadoLower === 'emitido' || estadoLower === 'emitida';
    };

    const getStatusBadge = (estado: string) => {
        const estadoLower = estado.toLowerCase().trim();
        switch(estadoLower) {
            case "emitido":
            case "emitida":
                return <Badge className="bg-green-100 text-green-800 border-green-300">Emitida</Badge>;
            case "anulado":
            case "cancelado":
            case "cancelled":
            case "canceled":
                return <Badge className="bg-red-100 text-red-800 border-red-300">Anulado</Badge>;
            case "pendiente":
                return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pendiente</Badge>;
            default:
                return <Badge variant="outline">{estado}</Badge>;
        }
    };

    const getStatusIcon = (estado: string) => {
        const estadoLower = estado.toLowerCase().trim();
        switch(estadoLower) {
            case "emitido":
            case "emitida":
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case "anulado":
            case "cancelado":
            case "cancelled":
            case "canceled":
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            case "pendiente":
                return <Clock className="h-5 w-5 text-yellow-500" />;
            default:
                return <Receipt className="h-5 w-5 text-gray-500" />;
        }
    };

    const viewBoletaDetails = (boleta: Boleta) => {
        setSelectedBoleta(boleta);
        setIsDetailsOpen(true);
    };

    const handlePrint = async (boleta: Boleta) => {
        try {
            const token = localStorage.getItem('token');

            // Preparar payload exactamente como lo espera el microservicio
            const facturacionPayload = {
                boleta_numero: boleta.boleta_numero,
                boleta_fecha: boleta.boleta_fecha,
                boleta_subtotal: boleta.boleta_subtotal,
                boleta_impuestos: boleta.boleta_impuestos,
                boleta_total: boleta.boleta_total,
                boleta_descuento: boleta.boleta_descuento || 0,
                boleta_estado: boleta.boleta_estado,
                boleta_notas: boleta.boleta_notas || "",
                ped_id: boleta.ped_id,
                metodos_pago: boleta.metodos_pago?.map((metodo: any) => ({
                    met_nombre: metodo.met_nombre || 'Contado',
                    monto: metodo.pivot?.monto || boleta.boleta_total,
                    fecha_pago: metodo.fecha_pago || new Date().toISOString(),
                    nota_pago: metodo.nota_pago || null
                })) || [{ 
                    met_nombre: "Contado", 
                    monto: boleta.boleta_total,
                    fecha_pago: new Date().toISOString(),
                    nota_pago: null
                }],
                pedido: {
                    cliente: {
                        cli_tipo_doc: "1",
                        cli_numero_doc: "00000000",
                        cli_nombre: getClienteName(boleta.pedido?.cli_id)?.split(' ')[0] || 'Cliente',
                        cli_apellido: getClienteName(boleta.pedido?.cli_id)?.split(' ').slice(1).join(' ') || 'Genérico'
                    },
                    detalles: boleta.pedido?.detalles?.map((detalle: any) => ({
                        det_cantidad: detalle.det_cantidad,
                        det_precio_unitario: detalle.det_precio_unitario || detalle.det_precio,
                        det_subtotal: detalle.det_subtotal || (detalle.det_cantidad * (detalle.det_precio_unitario || detalle.det_precio)),
                        det_impuesto: detalle.det_impuestos || detalle.det_impuesto || 0,
                        producto: {
                            pro_id: detalle.producto?.pro_id || `PROD-${Math.random().toString(36).substr(2, 6)}`,
                            pro_nombre: detalle.producto?.pro_nombre || 'Producto'
                        }
                    })) || []
                }
            };

            // Hacer petición a Laravel backend que redirige al microservicio
            const response = await fetch(`${API_URL}/api/facturacion/pdf`, {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(facturacionPayload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
                throw new Error(errorData.message || `Error ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Crear iframe invisible para imprimir
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = url;
            document.body.appendChild(iframe);

            iframe.onload = () => {
                iframe.contentWindow?.print();
                setTimeout(() => {
                    document.body.removeChild(iframe);
                    window.URL.revokeObjectURL(url);
                }, 1000);
            };

            toast({
                title: "Imprimiendo boleta",
                description: `La boleta ${boleta.boleta_numero} se está enviando a la impresora.`
            });
        } catch (error) {
            console.error('Error printing PDF:', error);
            toast({
                title: "Error",
                description: (error as Error).message || "No se pudo imprimir la boleta",
                variant: "destructive"
            });
        }
    };

    // Función para descargar boleta - Generar PDF
    const handleDownload = async (boleta: any) => {
        try {
            toast({
                title: "Generando PDF...",
                description: `Creando el archivo PDF para la boleta ${boleta.boleta_numero}`,
            });

            const token = localStorage.getItem('token');

            // Preparar payload exactamente como lo espera el microservicio
            const facturacionPayload = {
                boleta_numero: boleta.boleta_numero,
                boleta_fecha: boleta.boleta_fecha,
                boleta_subtotal: boleta.boleta_subtotal,
                boleta_impuestos: boleta.boleta_impuestos,
                boleta_total: boleta.boleta_total,
                boleta_descuento: boleta.boleta_descuento || 0,
                boleta_estado: boleta.boleta_estado,
                boleta_notas: boleta.boleta_notas || "",
                ped_id: boleta.ped_id,
                metodos_pago: boleta.metodos_pago?.map((metodo: any) => ({
                    met_nombre: metodo.met_nombre || 'Contado',
                    monto: metodo.pivot?.monto || boleta.boleta_total,
                    fecha_pago: metodo.fecha_pago || new Date().toISOString(),
                    nota_pago: metodo.nota_pago || null
                })) || [{ 
                    met_nombre: "Contado", 
                    monto: boleta.boleta_total,
                    fecha_pago: new Date().toISOString(),
                    nota_pago: null
                }],
                pedido: {
                    cliente: {
                        cli_tipo_doc: "1",
                        cli_numero_doc: "00000000",
                        cli_nombre: getClienteName(boleta.pedido?.cli_id)?.split(' ')[0] || 'Cliente',
                        cli_apellido: getClienteName(boleta.pedido?.cli_id)?.split(' ').slice(1).join(' ') || 'Genérico'
                    },
                    detalles: boleta.pedido?.detalles?.map((detalle: any) => ({
                        det_cantidad: detalle.det_cantidad,
                        det_precio_unitario: detalle.det_precio_unitario || detalle.det_precio,
                        det_subtotal: detalle.det_subtotal || (detalle.det_cantidad * (detalle.det_precio_unitario || detalle.det_precio)),
                        det_impuesto: detalle.det_impuestos || detalle.det_impuesto || 0,
                        producto: {
                            pro_id: detalle.producto?.pro_id || `PROD-${Math.random().toString(36).substr(2, 6)}`,
                            pro_nombre: detalle.producto?.pro_nombre || 'Producto'
                        }
                    })) || []
                }
            };

            // Hacer petición a Laravel backend que redirige al microservicio
            const pdfResponse = await fetch(`${API_URL}/api/facturacion/pdf`, {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(facturacionPayload)
            });

            if (pdfResponse.ok) {
                const blob = await pdfResponse.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `BOL-${boleta.boleta_numero}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                toast({
                    title: "PDF generado exitosamente",
                    description: `Boleta ${boleta.boleta_numero} descargada correctamente.`,
                    duration: 5000
                });
            } else {
                const errorData = await pdfResponse.json().catch(() => ({ message: 'Error desconocido' }));
                throw new Error(`Error al generar PDF: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error al generar PDF:', error);
            toast({
                title: "Error al generar PDF",
                description: (error as Error).message || "Hubo un problema al generar el archivo PDF",
                variant: "destructive"
            });
        }
    };

    const handleAnular = (boletaId: string) => {
        // Verificar el estado actual de la boleta antes de mostrar el modal
        const boleta = boletas.find(b => b.boleta_id === boletaId);
        if (!boleta) {
            toast({
                title: "Error",
                description: "No se encontró la boleta seleccionada.",
                variant: "destructive"
            });
            return;
        }

        if (isBoletaCancelada(boleta.boleta_estado)) {
            toast({
                title: "Boleta ya cancelada",
                description: "Esta boleta ya está anulada y no puede ser cancelada nuevamente.",
                variant: "destructive"
            });
            return;
        }

        if (!isBoletaEmitida(boleta.boleta_estado)) {
            toast({
                title: "Estado inválido",
                description: "Solo se pueden cancelar boletas en estado 'Emitida'.",
                variant: "destructive"
            });
            return;
        }

        setAnularBoletaId(boletaId);
    };

    const confirmAnular = () => {
        if (anularBoletaId) {
            anularBoletaMutation.mutate(anularBoletaId);
        }
    };




    if (isLoading) {
        return (
            <MainLayout>
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-2 text-gray-500">Cargando boletas...</p>
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">BOLETAS</h1>
                        <p className="text-sm text-gray-500">Gestión de comprobantes de pago</p>
                    </div>

                    {/* Dashboard de métricas */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 md:mt-0">
                        <div className="bg-background border rounded-md p-2 shadow-sm">
                            <div className="text-xs text-muted-foreground mb-1">Total Boletas</div>
                            <div className="text-base font-semibold">{estadisticas.total}</div>
                            <div className="flex items-center text-xs text-gray-600 mt-1">
                                <Receipt className="mr-1 h-3 w-3 text-primary" />
                                <span>Comprobantes</span>
                            </div>
                        </div>

                        <div className="bg-background border rounded-md p-2 shadow-sm">
                            <div className="text-xs text-muted-foreground mb-1">Monto Total</div>
                            <div className="text-base font-semibold">{formatCurrency(estadisticas.totalMonto)}</div>
                            <div className="flex items-center text-xs text-gray-600 mt-1">
                                <DollarSign className="mr-1 h-3 w-3 text-green-600" />
                                <span>Facturado</span>
                            </div>
                        </div>

                        <div className="bg-background border rounded-md p-2 shadow-sm">
                            <div className="text-xs text-muted-foreground mb-1">Emitidas</div>
                            <div className="text-base font-semibold">{estadisticas.emitidas}</div>
                            <div className="flex items-center text-xs text-green-600 mt-1">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                <span>Válidas</span>
                            </div>
                        </div>

                        <div className="bg-background border rounded-md p-2 shadow-sm">
                            <div className="text-xs text-muted-foreground mb-1">Promedio</div>
                            <div className="text-base font-semibold">{formatCurrency(estadisticas.promedio)}</div>
                            <div className="flex items-center text-xs text-gray-600 mt-1">
                                <Receipt className="mr-1 h-3 w-3 text-primary" />
                                <span>Por boleta</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros y Buscador */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            type="text"
                            placeholder="Buscar por número de boleta, ID, pedido o cliente..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="flex items-center gap-2" onClick={() => {
                            setSearchQuery("");
                            refetch();
                        }}>
                            <RefreshCcw className="h-4 w-4" />
                            <span>Actualizar</span>
                        </Button>
                    </div>
                </div>

                {/* Lista de Boletas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
{currentBoletas.map((boleta) => (
    <Card
        key={boleta.boleta_id}
        className={`hover:shadow-md transition-shadow ${
            isBoletaEmitida(boleta.boleta_estado) ? "bg-green-50 relative" : ""
        } ${
            isBoletaCancelada(boleta.boleta_estado) ? "opacity-75 bg-red-50" : ""
        }`}
    >
        {isBoletaEmitida(boleta.boleta_estado) && (
            <CheckCircle className="absolute top-0 right-0 m-2 text-green-500 h-5 w-5" />
        )}
        {isBoletaCancelada(boleta.boleta_estado) && (
            <X className="absolute top-0 right-0 m-2 text-red-500 h-5 w-5" />
        )}
        <CardHeader className="pb-2">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-800"># {boleta.boleta_numero}</span>
                    {isBoletaEmitida(boleta.boleta_estado) && (
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="Copiar número"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                </Button>
            </div>
            <div className="text-sm text-gray-600 mb-3">
                {formatDateCompact(boleta.boleta_fecha)}
            </div>
        </CardHeader>

        <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                    <p className="font-medium">{getClienteName(boleta.pedido?.cli_id)}</p>
                    <p className="text-sm text-muted-foreground">Pedido: {boleta.ped_id}</p>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-bold text-lg">{formatCurrency(Number(boleta.boleta_total))}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Estado</p>
                    {getStatusBadge(boleta.boleta_estado)}
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(Number(boleta.boleta_subtotal))}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span>Impuestos:</span>
                    <span>{formatCurrency(Number(boleta.boleta_impuestos))}</span>
                </div>
                {Number(boleta.boleta_descuento) > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                        <span>Descuento:</span>
                        <span>-{formatCurrency(Number(boleta.boleta_descuento))}</span>
                    </div>
                )}
            </div>

            {boleta.boleta_notas && (
                <div className="text-sm">
                    <span className="text-gray-500">Notas: </span>
                    <span>{boleta.boleta_notas}</span>
                </div>
            )}

            {boleta.metodos_pago && boleta.metodos_pago.length > 0 && (
                <div className="text-sm">
                    <span className="text-gray-500">Métodos de pago: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {boleta.metodos_pago.map((metodo, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                                {metodo.met_nombre}: {formatCurrency(Number(metodo.pivot.monto))}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </CardContent>

        <CardFooter className="pt-3 border-t bg-gray-50 rounded-b-lg">
            <div className="w-full flex justify-between items-center">
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-orange-500 hover:text-orange-600 flex items-center gap-2"
                    onClick={() => viewBoletaDetails(boleta)}
                >
                    <Eye className="h-4 w-4" />
                    Ver detalles
                </Button>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrint(boleta)}
                        className="text-blue-600 hover:text-blue-700 border-blue-300 hover:bg-blue-50"
                        disabled={isBoletaCancelada(boleta.boleta_estado)}
                        title={isBoletaCancelada(boleta.boleta_estado) ? "No se puede imprimir una boleta anulada" : "Imprimir"}
                    >
                        <Printer className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(boleta)}
                        className="text-green-600 hover:text-green-700 border-green-300 hover:bg-green-50"
                        disabled={isBoletaCancelada(boleta.boleta_estado)}
                        title={isBoletaCancelada(boleta.boleta_estado) ? "No se puede descargar una boleta anulada" : "Descargar"}
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAnular(boleta.boleta_id)}
                        className="text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
                        disabled={isBoletaCancelada(boleta.boleta_estado)}
                        title={isBoletaCancelada(boleta.boleta_estado) ? "La boleta ya está anulada" : "Anular boleta"}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </CardFooter>
    </Card>
))}
                </div>

                {/* Controles de Paginación */}
                {filteredBoletas.length > 0 && (
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-600">
                            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredBoletas.length)} de {filteredBoletas.length} boletas
                        </div>
                        
                        {totalPages > 1 && (
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={goToPreviousPage}
                                            disabled={currentPage === 1}
                                            className="gap-1 pl-2.5"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Anterior
                                        </Button>
                                    </PaginationItem>
                                    
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <PaginationItem key={page}>
                                            <PaginationLink
                                                onClick={() => goToPage(page)}
                                                isActive={currentPage === page}
                                                className="cursor-pointer"
                                            >
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    
                                    <PaginationItem>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={goToNextPage}
                                            disabled={currentPage === totalPages}
                                            className="gap-1 pr-2.5"
                                        >
                                            Siguiente
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </div>
                )}

                {filteredBoletas.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Receipt className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-gray-500">No se encontraron boletas</p>
                        <p className="text-sm text-gray-400">Las boletas aparecerán aquí cuando se generen desde los pedidos</p>
                    </div>
                )}
            </div>

            {/* Modal de Detalles de la Boleta */}
            {selectedBoleta && (
                <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                    <DialogContent className="sm:max-w-3xl max-h-[95vh] overflow-hidden">
                        <DialogHeader className="pb-2">
                            <DialogTitle className="flex items-center gap-2 text-lg">
                                <Receipt className="h-4 w-4" />
                                Boleta {selectedBoleta.boleta_numero}
                            </DialogTitle>
                            <DialogDescription className="text-sm">
                                {formatDate(selectedBoleta.boleta_fecha)} - {getStatusBadge(selectedBoleta.boleta_estado)}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3 py-2 overflow-y-auto max-h-[78vh]">
                            {/* Header compacto */}
                            <div className="bg-blue-50 border rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-blue-600 p-1.5 rounded">
                                            <Receipt className="h-3 w-3 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-800">{selectedBoleta.boleta_numero}</h3>
                                            <p className="text-xs text-gray-600">{formatDate(selectedBoleta.boleta_fecha)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-gray-800">{formatCurrency(Number(selectedBoleta.boleta_total))}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 text-xs">
                                    {/* Cliente */}
                                    <div className="bg-white p-2 rounded border">
                                        <div className="flex items-center gap-1 mb-1">
                                            <User className="h-3 w-3 text-blue-600" />
                                            <span className="font-medium text-gray-700">Cliente</span>
                                        </div>
                                        <p className="font-medium text-gray-800 text-xs">{getClienteName(selectedBoleta.pedido?.cli_id)}</p>
                                        <p className="text-xs text-gray-500">{selectedBoleta.pedido?.ped_forma_entrega || 'Para Llevar'}</p>
                                    </div>

                                    {/* Pedido */}
                                    <div className="bg-white p-2 rounded border">
                                        <div className="flex items-center gap-1 mb-1">
                                            <Hash className="h-3 w-3 text-green-600" />
                                            <span className="font-medium text-gray-700">Pedido</span>
                                        </div>
                                        <p className="font-medium text-gray-800 text-xs">{selectedBoleta.ped_id}</p>
                                        <p className="text-xs text-gray-500">{selectedBoleta.pedido?.detalles?.length || 0} productos</p>
                                    </div>

                                    {/* Totales */}
                                    <div className="bg-white p-2 rounded border">
                                        <div className="flex items-center gap-1 mb-1">
                                            <DollarSign className="h-3 w-3 text-green-600" />
                                            <span className="font-medium text-gray-700">Totales</span>
                                        </div>
                                        <div className="space-y-0.5 text-xs">
                                            <div className="flex justify-between">
                                                <span>Subtotal:</span>
                                                <span>{formatCurrency(Number(selectedBoleta.boleta_subtotal))}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>IGV:</span>
                                                <span>{formatCurrency(Number(selectedBoleta.boleta_impuestos))}</span>
                                            </div>
                                            {Number(selectedBoleta.boleta_descuento) > 0 && (
                                                <div className="flex justify-between text-red-600">
                                                    <span>Descuento:</span>
                                                    <span>-{formatCurrency(Number(selectedBoleta.boleta_descuento))}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contenido principal compacto */}
                            <div className="grid grid-cols-2 gap-3">
                                {/*Productos */}
                                <div>
                                    <div className="flex items-center gap-1 mb-2">
                                        <Package className="h-4 w-4 text-primary" />
                                        <h3 className="text-sm font-semibold">Productos</h3>
                                    </div>

                                    {selectedBoleta.pedido?.detalles && selectedBoleta.pedido.detalles.length > 0 ? (
                                        <div className="border rounded divide-y max-h-48 overflow-y-auto">
                                            {selectedBoleta.pedido.detalles.map((detalle, index) => (
                                                <div key={index} className="p-2 flex items-center gap-2 text-xs">
                                                    <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                                                        <Package className="h-3 w-3 text-gray-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate text-xs">
                                                            {getProductoName(detalle.prod_id)}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {formatCurrency(Number(detalle.det_precio_unitario))} × {detalle.det_cantidad}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium text-xs">{formatCurrency(Number(detalle.det_subtotal))}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-gray-500 text-xs">
                                            <Package className="h-6 w-6 mx-auto mb-1 text-gray-300" />
                                            <p>No hay productos</p>
                                        </div>
                                    )}
                                </div>

                                {/* Métodos de pago */}
                                <div>
                                    <div className="flex items-center gap-1 mb-2">
                                        <CreditCard className="h-4 w-4 text-primary" />
                                        <h3 className="text-sm font-semibold">Métodos de Pago</h3>
                                    </div>

                                    {selectedBoleta.metodos_pago && selectedBoleta.metodos_pago.length > 0 ? (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {selectedBoleta.metodos_pago.map((metodo, index) => (
                                                <div key={index} className="border rounded p-2">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <div>
                                                            <p className="font-medium text-xs">{metodo.met_nombre}</p>
                                                            <p className="text-xs text-gray-500">{metodo.met_tipo}</p>
                                                            {metodo.met_banco && (
                                                                <p className="text-xs text-gray-400">{metodo.met_banco}</p>
                                                            )}
                                                        </div>
                                                        <p className="font-bold text-green-600 text-sm">
                                                            {formatCurrency(Number(metodo.pivot.monto))}
                                                        </p>
                                                    </div>

                                                    {metodo.pivot.referencia && (
                                                        <div className="text-xs text-gray-500">
                                                            <span className="font-medium">Ref:</span> {metodo.pivot.referencia}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-gray-500 text-xs">
                                            <CreditCard className="h-6 w-6 mx-auto mb-1 text-gray-300" />
                                            <p>Sin métodos de pago</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                        <DialogFooter className="flex flex-col gap-2 border-t pt-3">
                            {/* Notas compactas en el footer */}
                            {selectedBoleta.boleta_notas && (
                                <div className="w-full">
                                    <div className="flex items-center gap-1 mb-2">
                                        <FileText className="h-3 w-3 text-amber-600" />
                                        <span className="font-medium text-xs text-gray-700">Notas:</span>
                                        <span className="text-xs text-gray-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                      {selectedBoleta.boleta_notas}
                    </span>
                                    </div>
                                </div>
                            )}

                            {/* Botones de acción */}
                            <div className="flex gap-2 justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePrint(selectedBoleta)}
                                    className="flex items-center gap-1"
                                    disabled={isBoletaCancelada(selectedBoleta.boleta_estado)}
                                >
                                    <Printer className="h-3 w-3" />
                                    Imprimir
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownload(selectedBoleta)}
                                    className="flex items-center gap-1"
                                    disabled={isBoletaCancelada(selectedBoleta.boleta_estado)}
                                >
                                    <Download className="h-3 w-3" />
                                    Generar PDF
                                </Button>
                                {isBoletaEmitida(selectedBoleta.boleta_estado) && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setIsDetailsOpen(false);
                                            handleAnular(selectedBoleta.boleta_id);
                                        }}
                                        className="flex items-center gap-1 text-red-600 hover:text-red-700 border-red-300"
                                    >
                                        <X className="h-3 w-3" />
                                        Anular
                                    </Button>
                                )}
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Modal de Confirmación para Anular Boleta */}
            <Dialog open={anularBoletaId !== null} onOpenChange={() => setAnularBoletaId(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            Cancelar Boleta
                        </DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas cancelar esta boleta? Se creará automáticamente un nuevo pedido pendiente con los mismos productos.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Info className="h-4 w-4 text-blue-600" />
                                <span className="font-medium text-blue-800">Proceso Automático Optimizado</span>
                            </div>
                            <ul className="text-sm text-blue-700 ml-4 list-disc space-y-1">
                                <li>✅ Stock restaurado automáticamente</li>
                                <li>✅ Boleta marcada como "Cancelado"</li>
                                <li>✅ Pedido original marcado como "Anulado"</li>
                                <li>✅ Nuevo pedido "Pendiente" creado vía procedimiento almacenado</li>
                                <li>✅ Conserva todos los datos: cliente, productos, cantidades y precios</li>
                                <li>✅ Listo para procesar nuevamente el pago</li>
                            </ul>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="h-4 w-4 text-amber-600" />
                                <span className="font-medium text-amber-800">Nota Importante</span>
                            </div>
                            <p className="text-sm text-amber-700">
                                Esta operación es <strong>irreversible</strong>. La boleta cancelada no podrá ser reactivada, pero el nuevo pedido estará disponible inmediatamente en la página de Pedidos.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setAnularBoletaId(null)}
                            disabled={anularBoletaMutation.isPending}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmAnular}
                            disabled={anularBoletaMutation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {anularBoletaMutation.isPending ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Cancelando Boleta...
                                </>
                            ) : (
                                "Sí, Cancelar Boleta"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
};

export default BoletasPage;