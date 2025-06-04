
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
    AlertCircle
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
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
        cli_nombre: string;
        usr_nombre: string;
        detalles?: Array<{
            det_id: string;
            det_cantidad: number;
            det_precio_unitario: number;
            det_subtotal: number;
            producto?: {
                pro_nombre: string;
                pro_descripcion?: string;
            };
        }>;
    };
    pagos?: Array<{
        pago_id: string;
        monto: number;
        fecha_pago: string;
        nota_pago?: string;
        metodo_pago?: {
            met_nombre: string;
            met_tipo?: string;
            met_banco?: string;
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

    const { toast } = useToast();

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

    // Filtrar boletas según la búsqueda
    const filteredBoletas = boletas.filter(boleta => {
        if (!searchQuery) return true;

        const searchLower = searchQuery.toLowerCase();
        return (
            boleta.boleta_numero.toLowerCase().includes(searchLower) ||
            boleta.boleta_id.toLowerCase().includes(searchLower) ||
            boleta.ped_id.toLowerCase().includes(searchLower) ||
            boleta.pedido?.cli_nombre?.toLowerCase().includes(searchLower)
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

    const handlePrint = (boleta: Boleta) => {
        toast({
            title: "Imprimiendo boleta",
            description: `La boleta ${boleta.boleta_numero} se está imprimiendo.`
        });
    };

    const handleDownload = (boleta: Boleta) => {
        toast({
            title: "Descargando boleta",
            description: `La boleta ${boleta.boleta_numero} se está descargando.`
        });
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
                                        <p className="font-medium">{boleta.pedido?.cli_nombre || 'Cliente'}</p>
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

                                {boleta.pagos && boleta.pagos.length > 0 && (
                                    <div className="text-sm">
                                        <span className="text-gray-500">Métodos de pago: </span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {boleta.pagos.map((pago, index) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {pago.metodo_pago?.met_nombre}: {formatCurrency(pago.monto)}
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
                                        >
                                            <Printer className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleDownload(boleta)}
                                            className="text-green-600 hover:text-green-700"
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
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
                    <DialogContent className="sm:max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Detalles de la Boleta</DialogTitle>
                            <DialogDescription>
                                Información completa de la boleta {selectedBoleta.boleta_numero}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Información de la Boleta</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Número:</span>
                                            <span className="font-medium">{selectedBoleta.boleta_numero}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Fecha:</span>
                                            <span>{formatDate(selectedBoleta.boleta_fecha)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Estado:</span>
                                            <span>{getStatusBadge(selectedBoleta.boleta_estado)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Pedido:</span>
                                            <span>{selectedBoleta.ped_id}</span>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Cliente</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Nombre:</span>
                                            <span>{selectedBoleta.pedido?.cli_nombre || 'No disponible'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Atendido por:</span>
                                            <span>{selectedBoleta.pedido?.usr_nombre || 'No disponible'}</span>
                                        </div>
                                    </div>
                                </div>

                                {selectedBoleta.boleta_notas && (
                                    <>
                                        <Separator />
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">Notas</h3>
                                            <p className="text-sm bg-gray-50 p-2 rounded">{selectedBoleta.boleta_notas}</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="space-y-4">
                                {/* Productos del pedido */}
                                {selectedBoleta.pedido?.detalles && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Productos</h3>
                                        <div className="border rounded-md divide-y max-h-64 overflow-y-auto">
                                            {selectedBoleta.pedido.detalles.map((detalle, index) => (
                                                <div key={index} className="p-3">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <p className="font-medium text-sm">
                                                                {detalle.producto?.pro_nombre || 'Producto'}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {formatCurrency(detalle.det_precio_unitario)} x {detalle.det_cantidad}
                                                            </p>
                                                        </div>
                                                        <p className="font-medium">{formatCurrency(detalle.det_subtotal)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Métodos de pago */}
                                {selectedBoleta.pagos && selectedBoleta.pagos.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Métodos de Pago</h3>
                                        <div className="border rounded-md divide-y">
                                            {selectedBoleta.pagos.map((pago, index) => (
                                                <div key={index} className="p-3 flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium text-sm">{pago.metodo_pago?.met_nombre}</p>
                                                        {pago.nota_pago && (
                                                            <p className="text-xs text-gray-500">{pago.nota_pago}</p>
                                                        )}
                                                    </div>
                                                    <p className="font-bold text-green-600">{formatCurrency(pago.monto)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Resumen financiero */}
                                <div className="bg-gray-50 p-3 rounded-md">
                                    <div className="space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Subtotal:</span>
                                            <span>{formatCurrency(selectedBoleta.boleta_subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Impuestos:</span>
                                            <span>{formatCurrency(selectedBoleta.boleta_impuestos)}</span>
                                        </div>
                                        {selectedBoleta.boleta_descuento > 0 && (
                                            <div className="flex justify-between text-red-600">
                                                <span>Descuento:</span>
                                                <span>-{formatCurrency(selectedBoleta.boleta_descuento)}</span>
                                            </div>
                                        )}
                                        <Separator className="my-2" />
                                        <div className="flex justify-between font-bold">
                                            <span>Total:</span>
                                            <span>{formatCurrency(selectedBoleta.boleta_total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => handlePrint(selectedBoleta)}
                            >
                                <Printer className="h-4 w-4 mr-2" />
                                Imprimir
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleDownload(selectedBoleta)}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Descargar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </MainLayout>
    );
};

export default BoletasPage;
