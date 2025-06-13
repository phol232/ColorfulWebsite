import React, { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
    X
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

// Función para formatear la fecha
const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
};

const BoletasPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBoleta, setSelectedBoleta] = useState<Boleta | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [anularBoletaId, setAnularBoletaId] = useState<string | null>(null);

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
            if (!response.ok) throw new Error('Error al anular boleta');
            return response.json();
        },
        onSuccess: async (data, boletaId) => {
            // Buscar la boleta anulada para obtener el pedido asociado
            const boletaAnulada = boletas.find(b => b.boleta_id === boletaId);

            if (boletaAnulada && boletaAnulada.ped_id) {
                // Actualizar el estado del pedido a "Cancelado"
                try {
                    const token = localStorage.getItem('token');
                    const updateResponse = await fetch(`${API_URL}/api/pedidos/${boletaAnulada.ped_id}/estado`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': token ? `Bearer ${token}` : ''
                        },
                        body: JSON.stringify({ ped_estado: "Cancelado" })
                    });

                    if (!updateResponse.ok) {
                        console.error('Error al actualizar estado del pedido');
                    } else {
                        // Invalidar también la consulta de pedidos para refrescar OrdersPage
                        queryClient.invalidateQueries({ queryKey: ['/api/pedidos'] });
                    }
                } catch (error) {
                    console.error('Error updating order status:', error);
                }
            }

            queryClient.invalidateQueries({ queryKey: ['/api/boletas'] });
            toast({
                title: "Boleta anulada",
                description: "La boleta ha sido anulada correctamente y el pedido ha sido marcado como cancelado."
            });
            setAnularBoletaId(null);
            setIsDetailsOpen(false);
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "No se pudo anular la boleta",
                variant: "destructive"
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

    // Calcular estadísticas
    const estadisticas = {
        total: boletas.length,
        totalMonto: boletas.reduce((sum, boleta) => sum + boleta.boleta_total, 0),
        emitidas: boletas.filter(b => b.boleta_estado === 'Emitido').length,
        promedio: boletas.length > 0 ? boletas.reduce((sum, boleta) => sum + boleta.boleta_total, 0) / boletas.length : 0
    };

    const getStatusBadge = (estado: string) => {
        switch(estado.toLowerCase()) {
            case "emitido":
                return <Badge className="bg-green-100 text-green-800 border-green-300">Emitido</Badge>;
            case "anulado":
            case "cancelado":
                return <Badge className="bg-red-100 text-red-800 border-red-300">Anulado</Badge>;
            case "pendiente":
                return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pendiente</Badge>;
            default:
                return <Badge variant="outline">{estado}</Badge>;
        }
    };

    const getStatusIcon = (estado: string) => {
        switch(estado.toLowerCase()) {
            case "emitido":
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case "anulado":
            case "cancelado":
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

            // Primero emitir en SUNAT para obtener documentId
            const sunatResponse = await fetch(`${API_URL}/api/boletas/${boleta.boleta_id}/sunat-json`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });

            if (!sunatResponse.ok) throw new Error('Error al comunicar con SUNAT');

            const sunatData = await sunatResponse.json();
            const documentId = sunatData.respuesta?.documentId;
            const fileName = sunatData.respuesta?.fileName;

            if (!documentId || !fileName) {
                throw new Error('No se pudo obtener información del documento de SUNAT');
            }

            // Descargar PDF de SUNAT
            const response = await fetch(`${API_URL}/api/boletas/${documentId}/pdf/${fileName}`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                }
            });

            if (!response.ok) throw new Error('Error al generar PDF');

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
            toast({
                title: "Error",
                description: "No se pudo imprimir la boleta",
                variant: "destructive"
            });
        }
    };

    const handleDownload = async (boleta: Boleta) => {
        try {
            const token = localStorage.getItem('token');

            // Primero emitir en SUNAT para obtener documentId
            const sunatResponse = await fetch(`${API_URL}/api/boletas/${boleta.boleta_id}/sunat-json`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });

            if (!sunatResponse.ok) throw new Error('Error al comunicar con SUNAT');

            const sunatData = await sunatResponse.json();
            const documentId = sunatData.respuesta?.documentId;
            const fileName = sunatData.respuesta?.fileName;

            if (!documentId || !fileName) {
                throw new Error('No se pudo obtener información del documento de SUNAT');
            }

            // Descargar PDF de SUNAT
            const response = await fetch(`${API_URL}/api/boletas/${documentId}/pdf/${fileName}`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                }
            });

            if (!response.ok) throw new Error('Error al generar PDF');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Boleta_${boleta.boleta_numero.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast({
                title: "PDF descargado",
                description: `La boleta ${boleta.boleta_numero} se ha descargado correctamente.`
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo descargar el PDF",
                variant: "destructive"
            });
        }
    };

    const handleAnular = (boletaId: string) => {
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
                    {filteredBoletas.map((boleta) => (
                        <Card key={boleta.boleta_id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                                <div className="space-y-1">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Hash className="h-4 w-4" />
                                        {boleta.boleta_numero}
                                    </CardTitle>
                                    <CardDescription>
                                        {formatDate(boleta.boleta_fecha)}
                                    </CardDescription>
                                </div>
                                {getStatusIcon(boleta.boleta_estado)}
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
                                        <p className="font-bold text-lg">{formatCurrency(boleta.boleta_total)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Estado</p>
                                        {getStatusBadge(boleta.boleta_estado)}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal:</span>
                                        <span>{formatCurrency(boleta.boleta_subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Impuestos:</span>
                                        <span>{formatCurrency(boleta.boleta_impuestos)}</span>
                                    </div>
                                    {boleta.boleta_descuento > 0 && (
                                        <div className="flex justify-between text-sm text-red-600">
                                            <span>Descuento:</span>
                                            <span>-{formatCurrency(boleta.boleta_descuento)}</span>
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
                                                    {metodo.met_nombre}: {formatCurrency(metodo.pivot.monto)}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>

                            <CardFooter className="pt-2 border-t">
                                <div className="w-full flex justify-between">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-orange-500 hover:text-orange-600"
                                        onClick={() => viewBoletaDetails(boleta)}
                                    >
                                        <Eye className="h-4 w-4 mr-2" /> Ver detalles
                                    </Button>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handlePrint(boleta)}
                                            className="text-blue-600 hover:text-blue-700"
                                            disabled={boleta.boleta_estado.toLowerCase() === 'anulado' || boleta.boleta_estado.toLowerCase() === 'cancelado'}
                                            title={boleta.boleta_estado.toLowerCase() === 'anulado' || boleta.boleta_estado.toLowerCase() === 'cancelado' ? "No se puede imprimir una boleta anulada" : "Imprimir"}
                                        >
                                            <Printer className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleDownload(boleta)}
                                            className="text-green-600 hover:text-green-700"
                                            disabled={boleta.boleta_estado.toLowerCase() === 'anulado' || boleta.boleta_estado.toLowerCase() === 'cancelado'}
                                            title={boleta.boleta_estado.toLowerCase() === 'anulado' || boleta.boleta_estado.toLowerCase() === 'cancelado' ? "No se puede descargar una boleta anulada" : "Descargar"}
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                        {(boleta.boleta_estado.toLowerCase() === 'emitido') && (
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleAnular(boleta.boleta_id)}
                                                className="text-red-600 hover:text-red-700"
                                                title="Anular boleta"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

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
                                        <p className="text-lg font-bold text-gray-800">{formatCurrency(selectedBoleta.boleta_total)}</p>
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
                                                <span>{formatCurrency(selectedBoleta.boleta_subtotal)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>IGV:</span>
                                                <span>{formatCurrency(selectedBoleta.boleta_impuestos)}</span>
                                            </div>
                                            {selectedBoleta.boleta_descuento > 0 && (
                                                <div className="flex justify-between text-red-600">
                                                    <span>Descuento:</span>
                                                    <span>-{formatCurrency(selectedBoleta.boleta_descuento)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contenido principal compacto */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* Productos */}
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
                                                            {formatCurrency(detalle.det_precio_unitario)} × {detalle.det_cantidad}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium text-xs">{formatCurrency(detalle.det_subtotal)}</p>
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
                                                            {formatCurrency(metodo.pivot.monto)}
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
                                    disabled={selectedBoleta.boleta_estado.toLowerCase() === 'anulado' || selectedBoleta.boleta_estado.toLowerCase() === 'cancelado'}
                                >
                                    <Printer className="h-3 w-3" />
                                    Imprimir
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownload(selectedBoleta)}
                                    className="flex items-center gap-1"
                                    disabled={selectedBoleta.boleta_estado.toLowerCase() === 'anulado' || selectedBoleta.boleta_estado.toLowerCase() === 'cancelado'}
                                >
                                    <Download className="h-3 w-3" />
                                    Descargar
                                </Button>
                                {(selectedBoleta.boleta_estado.toLowerCase() === 'emitido') && (
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
                            Anular Boleta
                        </DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas anular esta boleta? Esta acción restaurará el stock de los productos y no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <span className="font-medium text-red-800">Advertencia</span>
                            </div>
                            <p className="text-sm text-red-700">
                                Al anular esta boleta:
                            </p>
                            <ul className="text-sm text-red-700 mt-1 ml-4 list-disc">
                                <li>Se restaurará el stock de todos los productos</li>
                                <li>La boleta cambiará a estado "Anulado"</li>
                                <li>No se podrá imprimir ni descargar</li>
                                <li>Esta acción es irreversible</li>
                            </ul>
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
                            {anularBoletaMutation.isPending ? "Anulando..." : "Sí, Anular Boleta"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
};

export default BoletasPage;