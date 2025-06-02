import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import {
    Search as SearchIcon, AlertTriangle, Bell, Edit, Trash2, PlusCircle, Settings,
    RefreshCcw, Loader2, MessageSquareWarning, Info, CheckCircle2, XCircle, ShieldAlert, Skull,
} from 'lucide-react';
import { API_URL } from '@/config';
import {
    AlertaStock, ProductoAlerta,
    CrearAlertaManualPayload, ConfiguracionAlerta,
    CrearConfiguracionAlertaPayload, CategoriaSimple,
} from '@/types/alertas';
import { useAuth } from '@/context/AuthContext';
// Agrega la siguiente línea para importar useToast
import { useToast } from '@/hooks/use-toast';

const AlertasPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useNotifications();
    const { userProfile, isAuthenticated } = useAuth();
    // Obtén la función toast del hook
    const { toast } = useToast();

    // --- ESTADOS ---
    const [searchTerm, setSearchTerm] = useState('');
    const [estadoFiltro, setEstadoFiltro] = useState<string>('Todos');
    const [productoFiltro, setProductoFiltro] = useState<string>('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [isManualAlertaModalOpen, setIsManualAlertaModalOpen] = useState(false);
    const [selectedAlerta, setSelectedAlerta] = useState<AlertaStock | null>(null);

    const initialManualAlertaForm: CrearAlertaManualPayload = {
        prod_id: '', stock_capturado: '', umbral_evaluado: '', alerta_tipo_generada: '',
        alerta_nivel_generado: 'INFO', mensaje_automatico: '',
    };
    const [manualAlertaForm, setManualAlertaForm] = useState<CrearAlertaManualPayload>(initialManualAlertaForm);

    const initialConfigAlertaFormState: CrearConfiguracionAlertaPayload = {
        config_nombre: '', config_tipo: 'STOCK_DEBAJO_DE_UMBRAL', config_umbral_valor: '',
        config_aplicabilidad: 'GENERAL', id_referencia_aplicabilidad: null, config_descripcion: '',
        config_nivel_alerta_default: 'INFO',
        config_creado_por_usr_id: '',
    };
    const [configAlertaForm, setConfigAlertaForm] = useState<CrearConfiguracionAlertaPayload>(initialConfigAlertaFormState);

    // Importar el usuario desde AuthContext
    const useUserId = () => {
        const { userProfile } = useAuth();
        return userProfile?.userId || null;
    };

    // Obtener userId directamente del userProfile
    const userId = userProfile?.userId || null;

    // --- EFECTO PARA USUARIO ---
    useEffect(() => {
        if (userId) {
            setConfigAlertaForm(prev => ({ ...prev, config_creado_por_usr_id: userId }));
        }
    }, [userId]);

    // --- DATA QUERIES ---
    const { data: alertas = [], isLoading: alertasIsLoading, refetch: refetchAlertas } = useQuery<AlertaStock[], Error>({
        queryKey: ['alertasStock', estadoFiltro, productoFiltro],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (estadoFiltro && estadoFiltro !== 'Todos') params.append('estado_alerta', estadoFiltro);
            if (productoFiltro) params.append('prod_id', productoFiltro);
            const { data } = await axios.get<AlertaStock[]>(`${API_URL}/api/inventario/alertas-stock?${params.toString()}`);
            return data;
        },
        staleTime: 1000 * 60 * 1,
        refetchOnWindowFocus: true,
    });
    const { data: productosParaSelect = [] } = useQuery<ProductoAlerta[], Error>({ queryKey: ['productosParaSelectAlertas'], queryFn: async () => (await axios.get<ProductoAlerta[]>(`${API_URL}/api/productos`)).data, staleTime: 1000 * 60 * 10 });
    const { data: configuracionesParaSelect = [] } = useQuery<ConfiguracionAlerta[], Error>({ queryKey: ['configuracionesParaSelectAlertas'], queryFn: async () => (await axios.get<ConfiguracionAlerta[]>(`${API_URL}/api/inventario/configuracion-alertas`)).data, staleTime: 1000 * 60 * 5 });
    const { data: categoriasParaSelect = [] } = useQuery<CategoriaSimple[], Error>({ queryKey: ['categoriasParaSelectConfigAlertas'], queryFn: async () => (await axios.get<CategoriaSimple[]>(`${API_URL}/api/categorias`)).data, staleTime: 1000 * 60 * 10 });

    // --- MUTATIONS ---
    const updateAlertaMutation = useMutation({
        mutationFn: async (alertaActualizada: Partial<AlertaStock> & { alerta_stock_id: number }) => {
            const { alerta_stock_id, ...payload } = alertaActualizada;
            return axios.put(`${API_URL}/api/inventario/alertas-stock/${alerta_stock_id}`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['alertasStock'] });
            showSuccess('Alerta actualizada correctamente');
            setIsEditModalOpen(false);
        },
        onError: (error: any) => {
            showError(error, 'No se pudo actualizar la alerta');
        },
    });

    const deleteAlertaMutation = useMutation({
        mutationFn: (alertaId: number) => axios.delete(`${API_URL}/api/inventario/alertas-stock/${alertaId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['alertasStock'] });
            showSuccess('Alerta eliminada correctamente');
            setIsDeleteModalOpen(false);
        },
        onError: (error: any) => {
            showError(error, 'No se pudo eliminar la alerta');
        },
    });

    const crearAlertaManualMutation = useMutation({
        mutationFn: async (payload: CrearAlertaManualPayload) => {
            const numericPayload = {
                ...payload,
                stock_capturado: parseFloat(payload.stock_capturado as string),
                umbral_evaluado: parseFloat(payload.umbral_evaluado as string),
            };
            if (isNaN(numericPayload.stock_capturado) || isNaN(numericPayload.umbral_evaluado)) {
                toast({ title: "Error de Datos", description: "Stock y umbral deben ser números.", variant: "destructive" });
                throw new Error("Valores numéricos inválidos.");
            }
            return axios.post(`${API_URL}/api/inventario/alertas-stock/manual`, numericPayload);
        },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['alertasStock'] }); toast({ title: 'Éxito', description: 'Alerta manual creada.' }); setIsManualAlertaModalOpen(false); setManualAlertaForm(initialManualAlertaForm); },
        onError: (error: any) => { toast({ title: 'Error', description: error.response?.data?.message || 'No se pudo crear.', variant: 'destructive' }); },
    });

    const crearConfiguracionAlertaMutation = useMutation({
        mutationFn: async (payload: CrearConfiguracionAlertaPayload) => {
            if (!userId) {
                toast({ title: 'Error de Autenticación', description: 'Debe iniciar sesión.', variant: 'destructive' });
                throw new Error("Usuario no autenticado.");
            }
            const numericPayload = {
                ...payload,
                config_creado_por_usr_id: userId,
                config_umbral_valor: parseFloat(payload.config_umbral_valor as string),
            };
            if (isNaN(numericPayload.config_umbral_valor)) {
                toast({ title: "Error de Datos", description: "Umbral debe ser un número.", variant: "destructive" });
                throw new Error("Umbral inválido.");
            }
            return axios.post(`${API_URL}/api/inventario/configuracion-alertas`, numericPayload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['configuracionesParaSelectAlertas'] });
            toast({ title: 'Éxito', description: 'Configuración creada.' });
            setIsConfigModalOpen(false);
            setConfigAlertaForm({...initialConfigAlertaFormState, config_creado_por_usr_id: userProfile?.userId || '' });
        },
        onError: (error: any) => { toast({ title: 'Error', description: error.response?.data?.message || 'No se pudo crear config.', variant: 'destructive' }); },
    });

    // --- HANDLERS ---
    const handleEdit = (alerta: AlertaStock) => { setSelectedAlerta(alerta); setIsEditModalOpen(true); };
    const handleDelete = (alerta: AlertaStock) => { setSelectedAlerta(alerta); setIsDeleteModalOpen(true); };
    const confirmDelete = () => { if (selectedAlerta) deleteAlertaMutation.mutate(selectedAlerta.alerta_stock_id); };

    // --- FORM HANDLERS ---
    const handleManualAlertaFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setManualAlertaForm(prev => ({ ...prev, [name]: value }));
    };
    const handleManualAlertaSelectChange = (name: keyof CrearAlertaManualPayload, value: string | number | null) => {
        // Si se selecciona "ninguna" para config_alerta_id_origen, establecer como null
        if (name === 'config_alerta_id_origen' && value === 'ninguna') {
            setManualAlertaForm(prev => ({ ...prev, [name]: null }));
        } else {
            setManualAlertaForm(prev => ({ ...prev, [name]: value }));
        }
    };
    const handleConfigAlertaFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setConfigAlertaForm(prev => ({ ...prev, [name]: value }));
    };
    const handleConfigAlertaSelectChange = (name: keyof CrearConfiguracionAlertaPayload, value: string | number | null) => {
        setConfigAlertaForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCrearAlertaManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        crearAlertaManualMutation.mutate(manualAlertaForm);
    };
    const handleCrearConfigAlertaSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated || !userProfile?.userId) {
            toast({ title: "Error de autenticación", description: "Debe iniciar sesión.", variant: "destructive" });
            return;
        }

        // Asegurarse que el ID de usuario esté establecido correctamente antes de enviar
        const formToSend = {
            ...configAlertaForm,
            config_creado_por_usr_id: userProfile.userId
        };

        crearConfiguracionAlertaMutation.mutate(formToSend);
    };

    // --- FILTRADO ---
    const filteredAlertas = useMemo(() => {
        return alertas.filter((alerta) => {
            const searchTermLower = searchTerm.toLowerCase();
            const matchesSearch =
                (alerta.producto?.pro_nombre?.toLowerCase() || '').includes(searchTermLower) ||
                (alerta.mensaje_automatico?.toLowerCase() || '').includes(searchTermLower) ||
                (alerta.alerta_tipo_generada?.toLowerCase() || '').includes(searchTermLower) ||
                (alerta.alerta_stock_id.toString()).includes(searchTermLower);
            const matchesEstado = estadoFiltro === 'Todos' || alerta.estado_alerta === estadoFiltro;
            const matchesProducto = !productoFiltro || alerta.prod_id === productoFiltro;
            return matchesSearch && matchesEstado && matchesProducto;
        });
    }, [alertas, searchTerm, estadoFiltro, productoFiltro]);

    // --- UTILS PARA BADGES ---
    const getEstadoBadgeColor = (estado: string): string => {
        switch (estado) {
            case 'Activa': return 'bg-blue-100 text-blue-700';
            case 'En Revision': return 'bg-yellow-100 text-yellow-800';
            case 'Resuelta': return 'bg-green-100 text-green-800';
            case 'Ignorada': return 'bg-gray-200 text-gray-600';
            default: return '';
        }
    };
    const getNivelAlertaBadgeColor = (nivel: string): string => {
        switch (nivel) {
            case 'INFO': return 'bg-blue-100 text-blue-700';
            case 'ADVERTENCIA': return 'bg-yellow-100 text-yellow-800';
            case 'CRITICO': return 'bg-red-100 text-red-700';
            default: return '';
        }
    };
    const getNivelAlertaIcon = (nivel: string): JSX.Element => {
        switch (nivel) {
            case 'INFO': return <Info className="inline w-4 h-4" />;
            case 'ADVERTENCIA': return <AlertTriangle className="inline w-4 h-4" />;
            case 'CRITICO': return <Skull className="inline w-4 h-4" />;
            default: return <Info className="inline w-4 h-4" />;
        }
    };
    const getEstadoAlertaIcon = (estado: string): JSX.Element => {
        switch (estado) {
            case 'Activa': return <Bell className="inline w-4 h-4" />;
            case 'En Revision': return <ShieldAlert className="inline w-4 h-4" />;
            case 'Resuelta': return <CheckCircle2 className="inline w-4 h-4" />;
            case 'Ignorada': return <XCircle className="inline w-4 h-4" />;
            default: return <Info className="inline w-4 h-4" />;
        }
    };

    // --- RENDER ---
    if (alertasIsLoading) {
        return <div className="flex justify-center items-center min-h-[200px]"><Loader2 className="animate-spin h-6 w-6 mr-2" />Cargando...</div>;
    }

    return (
        <>
            {/* --- FILTROS Y ACCIONES --- */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex-1 w-full md:w-auto">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input placeholder="Buscar alertas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 w-full" />
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
                        <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Estado" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Todos">Todos</SelectItem>
                            <SelectItem value="Activa">Activa</SelectItem>
                            <SelectItem value="En Revision">En Revisión</SelectItem>
                            <SelectItem value="Resuelta">Resuelta</SelectItem>
                            <SelectItem value="Ignorada">Ignorada</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input placeholder="ID Producto" value={productoFiltro} onChange={(e) => setProductoFiltro(e.target.value)} className="w-full sm:w-[150px]" />
                    <Button onClick={() => refetchAlertas()} variant="outline" className="w-full sm:w-auto"><RefreshCcw className="h-4 w-4 mr-2" />Actualizar</Button>
                </div>
            </div>
            <div className="mb-6 flex flex-col sm:flex-row justify-end gap-2">
                <Button onClick={() => setIsConfigModalOpen(true)} variant="default" disabled={false}>
                    <Settings className="h-4 w-4 mr-2" /> Nueva Configuración
                </Button>
                <Button onClick={() => setIsManualAlertaModalOpen(true)} variant="default" disabled={false}>
                    <PlusCircle className="h-4 w-4 mr-2" /> Nueva Alerta
                </Button>
            </div>

            {/* --- LISTADO DE ALERTAS --- */}
            {!alertasIsLoading && alertas.length === 0 && !searchTerm && !productoFiltro && estadoFiltro === 'Todos' && (
                <Card className="text-center"><CardContent className="p-6"><Bell className="h-12 w-12 mx-auto text-gray-400 mb-3" /><p>No hay alertas.</p></CardContent></Card>
            )}
            {!alertasIsLoading && filteredAlertas.length === 0 && (searchTerm || productoFiltro || estadoFiltro !== 'Todos') && (
                <Card className="text-center"><CardContent className="p-6"><MessageSquareWarning className="h-12 w-12 mx-auto text-gray-400 mb-3" /><p>No se encontraron alertas.</p></CardContent></Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAlertas.map((alerta) => (
                    <Card key={alerta.alerta_stock_id} className="flex flex-col" style={{ backgroundColor: '#f0fdfa', borderColor: '#ccfbf1' }}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <Badge className={`${getNivelAlertaBadgeColor(alerta.alerta_nivel_generado)} mb-2`}>{getNivelAlertaIcon(alerta.alerta_nivel_generado)} {alerta.alerta_nivel_generado}</Badge>
                                <Badge className={`${getEstadoBadgeColor(alerta.estado_alerta)} mb-2`}>{getEstadoAlertaIcon(alerta.estado_alerta)} {alerta.estado_alerta}</Badge>
                            </div>
                            <CardTitle className="text-md" style={{ color: '#065f46' }}>{alerta.producto?.pro_nombre || `Alerta ID: ${alerta.alerta_stock_id}`}</CardTitle>
                            <CardDescription className="text-xs">Generada: {new Date(alerta.fecha_generacion).toLocaleString()}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-2 text-sm">
                            <p><strong>Mensaje:</strong> {alerta.mensaje_automatico}</p>
                            <p><strong>Tipo:</strong> {alerta.alerta_tipo_generada}</p>
                            {alerta.producto && (<div className="text-xs p-2 rounded mt-2" style={{ backgroundColor: '#d1fae5' }}><p><strong>ID Prod:</strong> {alerta.prod_id}</p><p><strong>Stock Capturado:</strong> {alerta.stock_capturado}</p><p><strong>Umbral:</strong> {alerta.umbral_evaluado}</p><p className="font-semibold">Stock Actual: {alerta.producto.pro_stock}</p></div>)}
                            {alerta.comentario_resolucion_actual && (<p className="text-xs text-gray-500 italic mt-1"><strong>Info:</strong> {alerta.comentario_resolucion_actual}</p>)}
                            {alerta.estado_alerta === 'Resuelta' && (
                                <div className="mt-2 pt-2 border-t border-dashed">
                                    <p><strong>Resolución:</strong> {alerta.comentario_resolucion || "N/A"}</p>
                                    {alerta.resuelta_por && <p className="text-xs">Por: {alerta.resuelta_por.name || alerta.resuelta_por.usr_nombre || alerta.resuelta_por.usr_user || 'ID: ' + alerta.resuelta_por.usr_id}</p>}
                                    {alerta.fecha_resolucion && <p className="text-xs">Fecha: {new Date(alerta.fecha_resolucion).toLocaleDateString()}</p>}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex gap-2 border-t pt-3 mt-auto">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(alerta)}>
                                <Edit className="h-4 w-4 mr-1" /> Editar
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(alerta)}>
                                <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* --- MODAL EDITAR ALERTA --- */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Alerta</DialogTitle>
                        <DialogDescription>Edita el estado y el comentario de resolución.</DialogDescription>
                    </DialogHeader>
                    {selectedAlerta ? (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const estado_alerta = formData.get('estado_alerta_edit') as AlertaStock['estado_alerta'];
                                const comentario_resolucion = formData.get('comentario_resolucion_edit') as string | null;

                                // Asegurarse de que el usuario esté autenticado para marcar como resuelta
                                if (estado_alerta === 'Resuelta' && (!isAuthenticated || !userProfile?.userId)) {
                                    toast({
                                        title: 'Error',
                                        description: 'Debe iniciar sesión para marcar una alerta como resuelta.',
                                        variant: 'destructive'
                                    });
                                    return;
                                }

                                // Solo establecer resuelta_por_usr_id cuando el estado es 'Resuelta' y el usuario está autenticado
                                const resuelta_por_usr_id = estado_alerta === 'Resuelta' ? userProfile?.userId : null;

                                updateAlertaMutation.mutate({
                                    alerta_stock_id: selectedAlerta.alerta_stock_id,
                                    estado_alerta,
                                    comentario_resolucion: estado_alerta === 'Resuelta'
                                        ? (comentario_resolucion || `Resuelta por ${userProfile?.name || userProfile?.email || userProfile?.userId || 'Usuario'}`)
                                        : null,
                                    resuelta_por_usr_id,
                                    fecha_resolucion: estado_alerta === 'Resuelta' ? new Date().toISOString() : null,
                                });
                            }}>
                            <div className="flex flex-row gap-8 py-2">
                                <div className="flex-1">
                                    <Label htmlFor="estado_alerta_edit" className="text-right">Estado*</Label>
                                    <Select name="estado_alerta_edit" defaultValue={selectedAlerta.estado_alerta} required>
                                        <SelectTrigger id="estado_alerta_edit"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Activa">Activa</SelectItem>
                                            <SelectItem value="En Revision">En Revisión</SelectItem>
                                            <SelectItem value="Resuelta">Resuelta</SelectItem>
                                            <SelectItem value="Ignorada">Ignorada</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex-1">
                                    <Label htmlFor="comentario_resolucion_edit" className="text-right">Comentario</Label>
                                    <Textarea id="comentario_resolucion_edit" name="comentario_resolucion_edit" defaultValue={selectedAlerta.comentario_resolucion || ''} placeholder="Detalles de resolución..." />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" disabled={updateAlertaMutation.isPending}>{updateAlertaMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar</Button>
                            </DialogFooter>
                        </form>
                    ) : (<p className="text-center text-red-500 py-4">No hay alerta seleccionada.</p>)}
                </DialogContent>
            </Dialog>

            {/* --- MODAL ELIMINAR ALERTA --- */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Eliminación</DialogTitle>
                        <DialogDescription>¿Eliminar alerta para "{selectedAlerta?.producto?.pro_nombre || `ID: ${selectedAlerta?.alerta_stock_id}`}"?</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={deleteAlertaMutation.isPending}>{deleteAlertaMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Eliminar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- MODAL NUEVA ALERTA MANUAL (horizontal) --- */}
            <Dialog open={isManualAlertaModalOpen} onOpenChange={setIsManualAlertaModalOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Nueva Alerta Manual</DialogTitle>
                        <DialogDescription>Completa los campos para generar una nueva alerta manualmente.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCrearAlertaManualSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
                        <div className="space-y-3">
                            <Label htmlFor="prod_id_manual_create">Producto*</Label>
                            <Select name="prod_id" value={manualAlertaForm.prod_id} onValueChange={(v) => handleManualAlertaSelectChange('prod_id', v)} required>
                                <SelectTrigger id="prod_id_manual_create"><SelectValue placeholder="Seleccionar producto" /></SelectTrigger>
                                <SelectContent>
                                    {productosParaSelect.map(p => (<SelectItem key={p.pro_id} value={p.pro_id}>{p.pro_nombre} (Stock: {p.pro_stock})</SelectItem>))}
                                </SelectContent>
                            </Select>

                            <Label htmlFor="config_alerta_id_origen_manual_create">Config. Origen (Opcional)</Label>
                            <Select name="config_alerta_id_origen" value={manualAlertaForm.config_alerta_id_origen?.toString() || ""} onValueChange={(v) => handleManualAlertaSelectChange('config_alerta_id_origen', v ? parseInt(v) : null)}>
                                <SelectTrigger id="config_alerta_id_origen_manual_create"><SelectValue placeholder="Ninguna" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ninguna">Ninguna</SelectItem>
                                    {configuracionesParaSelect.map(c => (<SelectItem key={c.config_alerta_id} value={c.config_alerta_id.toString()}>{c.config_nombre}</SelectItem>))}
                                </SelectContent>
                            </Select>

                            <Label htmlFor="stock_capturado_manual_create">Stock Capturado*</Label>
                            <Input id="stock_capturado_manual_create" name="stock_capturado" type="number" value={manualAlertaForm.stock_capturado as string} onChange={handleManualAlertaFormChange} required />

                            <Label htmlFor="umbral_evaluado_manual_create">Umbral Evaluado*</Label>
                            <Input id="umbral_evaluado_manual_create" name="umbral_evaluado" type="number" value={manualAlertaForm.umbral_evaluado as string} onChange={handleManualAlertaFormChange} required />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="alerta_tipo_generada_manual_create">Tipo Alerta*</Label>
                            <Input id="alerta_tipo_generada_manual_create" name="alerta_tipo_generada" value={manualAlertaForm.alerta_tipo_generada} onChange={handleManualAlertaFormChange} placeholder="Ej: Stock Bajo Manual" required />

                            <Label htmlFor="alerta_nivel_generado_manual_create">Nivel Alerta*</Label>
                            <Select name="alerta_nivel_generado" value={manualAlertaForm.alerta_nivel_generado} onValueChange={(v) => handleManualAlertaSelectChange('alerta_nivel_generado', v as CrearAlertaManualPayload['alerta_nivel_generado'])} required>
                                <SelectTrigger id="alerta_nivel_generado_manual_create"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INFO">INFO</SelectItem>
                                    <SelectItem value="ADVERTENCIA">ADVERTENCIA</SelectItem>
                                    <SelectItem value="CRITICO">CRITICO</SelectItem>
                                </SelectContent>
                            </Select>

                            <Label htmlFor="mensaje_automatico_manual_create">Mensaje*</Label>
                            <Textarea id="mensaje_automatico_manual_create" name="mensaje_automatico" value={manualAlertaForm.mensaje_automatico} onChange={handleManualAlertaFormChange} placeholder="Descripción detallada..." required />
                        </div>
                        <DialogFooter className="col-span-1 md:col-span-2">
                            <Button type="button" variant="outline" onClick={() => { setIsManualAlertaModalOpen(false); setManualAlertaForm(initialManualAlertaForm); }}>Cancelar</Button>
                            <Button type="submit" disabled={crearAlertaManualMutation.isPending}>{crearAlertaManualMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Crear Alerta</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* --- MODAL NUEVA CONFIGURACION ALERTA --- */}
            <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Nueva Configuración de Alerta</DialogTitle>
                        <DialogDescription>Registra una nueva configuración de alerta de stock.</DialogDescription>
                    </DialogHeader>
                    {userId ? (
                        <form onSubmit={handleCrearConfigAlertaSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
                                <div className="space-y-3">
                                    <div>
                                        <Label htmlFor="cfg_nombre_create">Nombre*</Label>
                                        <Input id="cfg_nombre_create" name="config_nombre" value={configAlertaForm.config_nombre} onChange={handleConfigAlertaFormChange} placeholder="Ej: Lácteos bajos" required />
                                    </div>
                                    <div>
                                        <Label htmlFor="cfg_tipo_create">Tipo Regla*</Label>
                                        <Select name="config_tipo" value={configAlertaForm.config_tipo} onValueChange={(v) => handleConfigAlertaSelectChange('config_tipo', v as CrearConfiguracionAlertaPayload['config_tipo'])} required>
                                            <SelectTrigger id="cfg_tipo_create"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="STOCK_LLEGA_A_VALOR">Stock Llega a Valor</SelectItem>
                                                <SelectItem value="STOCK_DEBAJO_DE_UMBRAL">Stock Debajo Umbral</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="cfg_umbral_create">Valor Umbral*</Label>
                                        <Input id="cfg_umbral_create" name="config_umbral_valor" type="number" value={configAlertaForm.config_umbral_valor as string} onChange={handleConfigAlertaFormChange} required />
                                    </div>
                                    <div>
                                        <Label htmlFor="cfg_nivel_create">Nivel Alerta*</Label>
                                        <Select
                                            name="config_nivel_alerta_default"
                                            value={configAlertaForm.config_nivel_alerta_default}
                                            onValueChange={(v) => handleConfigAlertaSelectChange('config_nivel_alerta_default', v as CrearConfiguracionAlertaPayload['config_nivel_alerta_default'])}
                                            required
                                        >
                                            <SelectTrigger id="cfg_nivel_create"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="INFO">INFO</SelectItem>
                                                <SelectItem value="ADVERTENCIA">ADVERTENCIA</SelectItem>
                                                <SelectItem value="CRITICO">CRITICO</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <Label htmlFor="cfg_apli_create">Aplicabilidad*</Label>
                                        <Select name="config_aplicabilidad" value={configAlertaForm.config_aplicabilidad} onValueChange={(v) => { handleConfigAlertaSelectChange('config_aplicabilidad', v as CrearConfiguracionAlertaPayload['config_aplicabilidad']); if (v === 'GENERAL') setConfigAlertaForm(prev => ({ ...prev, id_referencia_aplicabilidad: null })); }} required>
                                            <SelectTrigger id="cfg_apli_create"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="GENERAL">General</SelectItem>
                                                <SelectItem value="POR_CATEGORIA">Por Categoría</SelectItem>
                                                <SelectItem value="POR_PRODUCTO_ESPECIFICO">Por Producto</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {configAlertaForm.config_aplicabilidad === 'POR_CATEGORIA' && (
                                        <div>
                                            <Label htmlFor="cfg_ref_cat_create">Categoría*</Label>
                                            <Select name="id_referencia_aplicabilidad" value={configAlertaForm.id_referencia_aplicabilidad || ""} onValueChange={(v) => handleConfigAlertaSelectChange('id_referencia_aplicabilidad', v)} required>
                                                <SelectTrigger id="cfg_ref_cat_create"><SelectValue placeholder="Seleccionar categoría"/></SelectTrigger>
                                                <SelectContent>
                                                    {categoriasParaSelect.map(c => (<SelectItem key={c.cat_id} value={c.cat_id}>{c.cat_nombre}</SelectItem>))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    {configAlertaForm.config_aplicabilidad === 'POR_PRODUCTO_ESPECIFICO' && (
                                        <div>
                                            <Label htmlFor="cfg_ref_prod_create">Producto*</Label>
                                            <Select name="id_referencia_aplicabilidad" value={configAlertaForm.id_referencia_aplicabilidad || ""} onValueChange={(v) => handleConfigAlertaSelectChange('id_referencia_aplicabilidad', v)} required>
                                                <SelectTrigger id="cfg_ref_prod_create"><SelectValue placeholder="Seleccionar producto"/></SelectTrigger>
                                                <SelectContent>
                                                    {productosParaSelect.map(p => (<SelectItem key={p.pro_id} value={p.pro_id}>{p.pro_nombre}</SelectItem>))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    <div>
                                        <Label htmlFor="cfg_desc_create">Descripción</Label>
                                        <Textarea id="cfg_desc_create" name="config_descripcion" value={configAlertaForm.config_descripcion || ''} onChange={handleConfigAlertaFormChange} placeholder="Detalles..." />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="mt-6 flex justify-end">
                                <Button type="button" variant="outline" onClick={() => { setIsConfigModalOpen(false); setConfigAlertaForm(initialConfigAlertaFormState); }}>Cancelar</Button>
                                <Button type="submit" disabled={crearConfiguracionAlertaMutation.isPending}>{crearConfiguracionAlertaMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Crear</Button>
                            </DialogFooter>
                        </form>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-red-500">Inicie sesión para crear configuraciones.</p>
                            <Button onClick={() => setIsConfigModalOpen(false)} variant="outline" className="mt-4">Cerrar</Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AlertasPage;
