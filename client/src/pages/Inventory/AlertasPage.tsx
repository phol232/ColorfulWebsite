// client/src/pages/Inventory/AlertasPage.tsx
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
import { useToast } from '@/hooks/use-toast';
import {
    Search as SearchIcon, AlertTriangle, Bell, Edit, Trash2, PlusCircle, Settings,
    RefreshCcw, Loader2, MessageSquareWarning, Briefcase, CheckCircle2, XCircle,
    Info, ShieldAlert, Skull,
} from 'lucide-react';
import { API_URL } from '@/config';
import {
    AlertaStock, ProductoAlerta,
    CrearAlertaManualPayload, ConfiguracionAlerta,
    CrearConfiguracionAlertaPayload, CategoriaSimple,
    // La interfaz Usuario de alertas.ts se usará para el tipo de alerta.resuelta_por
} from '@/types/alertas';
import { useAuth } from '@/context/AuthContext';

const AlertasPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { userProfile, isAuthenticated } = useAuth();

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
        config_creado_por_usr_id: '', // Se llenará con userProfile.userId
    };
    const [configAlertaForm, setConfigAlertaForm] = useState<CrearConfiguracionAlertaPayload>(initialConfigAlertaFormState);

    useEffect(() => {
        // Si el usuario está autenticado y tiene un userId, lo usamos para el formulario de config.
        // Tu userProfile.userId siempre es string, pero puede ser "" si no está autenticado.
        if (isAuthenticated && userProfile.userId) {
            if (configAlertaForm.config_creado_por_usr_id !== userProfile.userId) {
                setConfigAlertaForm(prev => ({ ...prev, config_creado_por_usr_id: userProfile.userId }));
            }
        } else if (configAlertaForm.config_creado_por_usr_id) {
            // Si el usuario se desloguea, limpiar el campo
            setConfigAlertaForm(prev => ({ ...prev, config_creado_por_usr_id: '' }));
        }
    }, [isAuthenticated, userProfile.userId, configAlertaForm.config_creado_por_usr_id]);

    const { data: alertas = [], isLoading: alertasIsLoading, refetch: refetchAlertas } = useQuery<AlertaStock[], Error>({ /* ... */ });
    const { data: productosParaSelect = [] } = useQuery<ProductoAlerta[], Error>({ /* ... */ });
    const { data: configuracionesParaSelect = [] } = useQuery<ConfiguracionAlerta[], Error>({ /* ... */ });
    const { data: categoriasParaSelect = [] } = useQuery<CategoriaSimple[], Error>({ /* ... */ });

    const updateAlertaMutation = useMutation({
        mutationFn: async (alertaActualizada: Partial<AlertaStock> & { alerta_stock_id: number }) => { /* ... */ },
        onSuccess: () => { /* ... */ },
        onError: (error: any) => { /* ... */ },
    });
    const deleteAlertaMutation = useMutation({ /* ... */ });

    const crearAlertaManualMutation = useMutation({
        mutationFn: async (payload: CrearAlertaManualPayload) => {
            const numericPayload = {
                ...payload,
                stock_capturado: parseFloat(payload.stock_capturado as string),
                umbral_evaluado: parseFloat(payload.umbral_evaluado as string),
            };
            if (isNaN(numericPayload.stock_capturado) || isNaN(numericPayload.umbral_evaluado)) {
                toast({ title: "Error de Datos", description: "Stock capturado y umbral deben ser números válidos.", variant: "destructive" });
                throw new Error("Valores numéricos inválidos.");
            }
            return axios.post(`${API_URL}/api/inventario/alertas-stock/manual`, numericPayload);
        },
        onSuccess: () => { /* ... */ },
        onError: (error: any) => { /* ... */ },
    });

    const crearConfiguracionAlertaMutation = useMutation({
        mutationFn: async (payload: CrearConfiguracionAlertaPayload) => {
            if (!isAuthenticated || !userProfile.userId) {
                toast({ title: 'Error de Autenticación', description: 'Debe iniciar sesión para crear una configuración.', variant: 'destructive' });
                throw new Error("Usuario no autenticado o ID de usuario no disponible.");
            }
            const numericPayload = {
                ...payload,
                config_creado_por_usr_id: userProfile.userId, // <- Usar userProfile.userId
                config_umbral_valor: parseFloat(payload.config_umbral_valor as string),
            };
            if (isNaN(numericPayload.config_umbral_valor)) {
                toast({ title: "Error de Datos", description: "Umbral de configuración debe ser un número válido.", variant: "destructive" });
                throw new Error("Valor de umbral inválido.");
            }
            return axios.post(`${API_URL}/api/inventario/configuracion-alertas`, numericPayload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['configuracionesParaSelectAlertas'] });
            toast({ title: 'Éxito', description: 'Configuración de alerta creada.' });
            setIsConfigModalOpen(false);
            // Al resetear, asegurar que el ID del creador se ponga correctamente si el usuario está logueado
            setConfigAlertaForm({...initialConfigAlertaFormState, config_creado_por_usr_id: isAuthenticated && userProfile.userId ? userProfile.userId : '' });
        },
        onError: (error: any) => { /* ... */ },
    });

    const handleEdit = (alerta: AlertaStock) => { setSelectedAlerta(alerta); setIsEditModalOpen(true); };
    const handleDelete = (alerta: AlertaStock) => { setSelectedAlerta(alerta); setIsDeleteModalOpen(true); };
    const confirmDelete = () => { if (selectedAlerta) deleteAlertaMutation.mutate(selectedAlerta.alerta_stock_id); };
    const filteredAlertas = useMemo(() => { /* ... */ }, [alertas, searchTerm, estadoFiltro, productoFiltro]);
    const getEstadoBadgeColor = (estado: string): string => { /* ... */ };
    const getNivelAlertaBadgeColor = (nivel: string): string => { /* ... */ };
    const getNivelAlertaIcon = (nivel: string): JSX.Element => { /* ... */ };
    const getEstadoAlertaIcon = (estado: string): JSX.Element => { /* ... */ };

    const handleManualAlertaFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setManualAlertaForm(prev => ({ ...prev, [name]: value }));
    };
    const handleManualAlertaSelectChange = (name: keyof CrearAlertaManualPayload, value: string | number | null) => {
        setManualAlertaForm(prev => ({ ...prev, [name]: value }));
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
        if (!isAuthenticated || !userProfile.userId) {
            toast({ title: "Error de autenticación", description: "Debe iniciar sesión para realizar esta acción.", variant: "destructive" });
            return;
        }
        // Asegurarse de que el payload final tenga el config_creado_por_usr_id correcto
        const payloadToSend: CrearConfiguracionAlertaPayload = {
            ...configAlertaForm,
            config_creado_por_usr_id: userProfile.userId // <- Usar userProfile.userId
        };
        crearConfiguracionAlertaMutation.mutate(payloadToSend);
    };

    if (alertasIsLoading) { /* ... (Indicador de carga) ... */ }

    return (
        <>
            {/* Filtros y Acciones */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                {/* ... (Filtros) ... */}
            </div>
            <div className="mb-6 flex flex-col sm:flex-row gap-2">
                <Button
                    onClick={() => setIsConfigModalOpen(true)}
                    variant="outline"
                    disabled={!isAuthenticated || !userProfile.userId}
                >
                    <Settings className="h-4 w-4 mr-2" />
                    Configuración de Alertas
                </Button>
                <Button onClick={() => setIsManualAlertaModalOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Nueva Alerta Manual
                </Button>
            </div>

            {/* Listado de Alertas */}
            {!alertasIsLoading && alertas.length === 0 && !searchTerm && !productoFiltro && estadoFiltro === 'Todos' && ( /* ... */ )}
            {!alertasIsLoading && filteredAlertas.length === 0 && (searchTerm || productoFiltro || estadoFiltro !== 'Todos') && ( /* ... */ )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAlertas.map((alerta) => (
                    <Card key={alerta.alerta_stock_id} className="flex flex-col">
                        <CardHeader> {/* ... */} </CardHeader>
                        <CardContent className="flex-grow space-y-2 text-sm">
                            {/* ... */}
                            {alerta.estado_alerta === 'Resuelta' && (
                                <div className="mt-2 pt-2 border-t border-dashed">
                                    <p><strong>Resolución:</strong> {alerta.comentario_resolucion || "Sin comentario."}</p>
                                    {alerta.resuelta_por &&
                                        <p className="text-xs">
                                            Por: {alerta.resuelta_por.usr_nombre || alerta.resuelta_por.usr_user || alerta.resuelta_por.name || 'ID: ' + alerta.resuelta_por.usr_id}
                                        </p>
                                    }
                                    {alerta.fecha_resolucion && <p className="text-xs">Fecha: {new Date(alerta.fecha_resolucion).toLocaleDateString()}</p>}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2 border-t pt-3 mt-auto">
                            <Button
                                variant="outline" size="sm"
                                onClick={() => handleEdit(alerta)}
                                disabled={!isAuthenticated || !userProfile.userId}
                            >
                                <Edit className="h-4 w-4 mr-1" /> Editar
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(alerta)}>
                                <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* --- MODALES --- */}

            {/* Modal para Editar Alerta */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Alerta de Stock</DialogTitle>
                    </DialogHeader>
                    {selectedAlerta && isAuthenticated && userProfile.userId ? (
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const estado_alerta = formData.get('estado_alerta_edit') as AlertaStock['estado_alerta'];
                            const comentario_resolucion = formData.get('comentario_resolucion_edit') as string | null;

                            const resuelta_por_usr_id = estado_alerta === 'Resuelta' ? userProfile.userId : null;

                            updateAlertaMutation.mutate({
                                alerta_stock_id: selectedAlerta.alerta_stock_id,
                                estado_alerta,
                                comentario_resolucion: estado_alerta === 'Resuelta'
                                    ? (comentario_resolucion || `Resuelta por ${userProfile.name || userProfile.email || userProfile.userId}`)
                                    : null,
                                resuelta_por_usr_id, // <- userProfile.userId
                                fecha_resolucion: estado_alerta === 'Resuelta' ? new Date().toISOString() : null,
                            });
                        }}>
                            {/* ... (Contenido del formulario de edición, sin cambios estructurales aquí) ... */}
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="estado_alerta_edit" className="text-right">Estado*</Label>
                                    <Select name="estado_alerta_edit" defaultValue={selectedAlerta.estado_alerta} required>
                                        <SelectTrigger id="estado_alerta_edit" className="col-span-3"> <SelectValue /> </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Activa">Activa</SelectItem>
                                            <SelectItem value="En Revision">En Revisión</SelectItem>
                                            <SelectItem value="Resuelta">Resuelta</SelectItem>
                                            <SelectItem value="Ignorada">Ignorada</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="comentario_resolucion_edit" className="text-right">Comentario</Label>
                                    <Textarea id="comentario_resolucion_edit" name="comentario_resolucion_edit" defaultValue={selectedAlerta.comentario_resolucion || ''} className="col-span-3" placeholder="Comentario sobre la resolución o estado."/>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" disabled={updateAlertaMutation.isPending}>
                                    {updateAlertaMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Guardar Cambios
                                </Button>
                            </DialogFooter>
                        </form>
                    ) : (
                        <p className="text-center text-red-500 py-4">Debe iniciar sesión para editar alertas.</p>
                    )}
                </DialogContent>
            </Dialog>

            {/* Modal para Confirmar Eliminación */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}> {/* ... (sin cambios) ... */} </Dialog>

            {/* Modal para Crear Alerta Manual */}
            <Dialog open={isManualAlertaModalOpen} onOpenChange={setIsManualAlertaModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Crear Alerta de Stock Manual</DialogTitle>
                        <DialogDescription>
                            Completa los campos para generar una nueva alerta manualmente.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCrearAlertaManualSubmit} className="max-h-[70vh] overflow-y-auto p-1">
                        <div className="grid gap-3 py-4">
                            <div className="space-y-1">
                                <Label htmlFor="prod_id_manual">Producto*</Label>
                                <Select name="prod_id" value={manualAlertaForm.prod_id} onValueChange={(v) => handleManualAlertaSelectChange('prod_id', v)} required>
                                    <SelectTrigger id="prod_id_manual"><SelectValue placeholder="Seleccionar producto" /></SelectTrigger>
                                    <SelectContent>
                                        {productosParaSelect.map(p => (<SelectItem key={p.pro_id} value={p.pro_id}>{p.pro_nombre} (Stock: {p.pro_stock})</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="config_alerta_id_origen_manual">Configuración Origen (Opcional)</Label>
                                <Select name="config_alerta_id_origen" value={manualAlertaForm.config_alerta_id_origen?.toString() || ""} onValueChange={(v) => handleManualAlertaSelectChange('config_alerta_id_origen', v ? parseInt(v) : null)}>
                                    <SelectTrigger id="config_alerta_id_origen_manual"><SelectValue placeholder="Ninguna específica" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Ninguna específica</SelectItem>
                                        {configuracionesParaSelect.map(c => (<SelectItem key={c.config_alerta_id} value={c.config_alerta_id.toString()}>{c.config_nombre}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="stock_capturado_manual">Stock Capturado*</Label>
                                <Input id="stock_capturado_manual" name="stock_capturado" type="number" value={manualAlertaForm.stock_capturado as string} onChange={handleManualAlertaFormChange} required />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="umbral_evaluado_manual">Umbral Evaluado*</Label>
                                <Input id="umbral_evaluado_manual" name="umbral_evaluado" type="number" value={manualAlertaForm.umbral_evaluado as string} onChange={handleManualAlertaFormChange} required />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="alerta_tipo_generada_manual">Tipo de Alerta Generada*</Label>
                                <Input id="alerta_tipo_generada_manual" name="alerta_tipo_generada" value={manualAlertaForm.alerta_tipo_generada} onChange={handleManualAlertaFormChange} placeholder="Ej: Stock Bajo Manual" required />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="alerta_nivel_generado_manual">Nivel de Alerta*</Label>
                                <Select name="alerta_nivel_generado" value={manualAlertaForm.alerta_nivel_generado} onValueChange={(v) => handleManualAlertaSelectChange('alerta_nivel_generado', v as CrearAlertaManualPayload['alerta_nivel_generado'])} required>
                                    <SelectTrigger id="alerta_nivel_generado_manual"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INFO">INFO</SelectItem>
                                        <SelectItem value="ADVERTENCIA">ADVERTENCIA</SelectItem>
                                        <SelectItem value="CRITICO">CRITICO</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="mensaje_automatico_manual">Mensaje*</Label>
                                <Textarea id="mensaje_automatico_manual" name="mensaje_automatico" value={manualAlertaForm.mensaje_automatico} onChange={handleManualAlertaFormChange} placeholder="Descripción detallada de la alerta manual" required />
                            </div>
                        </div>
                        <DialogFooter className="mt-2">
                            <Button type="button" variant="outline" onClick={() => { setIsManualAlertaModalOpen(false); setManualAlertaForm(initialManualAlertaForm); }}>Cancelar</Button>
                            <Button type="submit" disabled={crearAlertaManualMutation.isPending}>
                                {crearAlertaManualMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Crear Alerta Manual
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal para Crear Configuración de Alerta */}
            <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Crear Nueva Configuración de Alerta</DialogTitle>
                    </DialogHeader>
                    {isAuthenticated && userProfile.userId ? (
                        <form onSubmit={handleCrearConfigAlertaSubmit} className="max-h-[70vh] overflow-y-auto p-1">
                            <div className="grid gap-3 py-4">
                                <div className="space-y-1">
                                    <Label htmlFor="config_nombre_modal_create_cfg">Nombre Configuración*</Label>
                                    <Input id="config_nombre_modal_create_cfg" name="config_nombre" value={configAlertaForm.config_nombre} onChange={handleConfigAlertaFormChange} placeholder="Ej: Stock crítico general" required />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="config_tipo_modal_create_cfg">Tipo de Regla*</Label>
                                    <Select name="config_tipo" value={configAlertaForm.config_tipo} onValueChange={(v) => handleConfigAlertaSelectChange('config_tipo', v as CrearConfiguracionAlertaPayload['config_tipo'])} required>
                                        <SelectTrigger id="config_tipo_modal_create_cfg"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="STOCK_LLEGA_A_VALOR">Stock Llega a Valor Exacto</SelectItem>
                                            <SelectItem value="STOCK_DEBAJO_DE_UMBRAL">Stock Debajo de Umbral</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="config_umbral_valor_modal_create_cfg">Valor Umbral*</Label>
                                    <Input id="config_umbral_valor_modal_create_cfg" name="config_umbral_valor" type="number" value={configAlertaForm.config_umbral_valor as string} onChange={handleConfigAlertaFormChange} required />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="config_aplicabilidad_modal_create_cfg">Aplicabilidad*</Label>
                                    <Select name="config_aplicabilidad" value={configAlertaForm.config_aplicabilidad} onValueChange={(v) => {
                                        handleConfigAlertaSelectChange('config_aplicabilidad', v as CrearConfiguracionAlertaPayload['config_aplicabilidad']);
                                        if (v === 'GENERAL') {
                                            setConfigAlertaForm(prev => ({...prev, id_referencia_aplicabilidad: null}));
                                        }
                                    }} required>
                                        <SelectTrigger id="config_aplicabilidad_modal_create_cfg"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="GENERAL">General (Todos los productos)</SelectItem>
                                            <SelectItem value="POR_CATEGORIA">Por Categoría</SelectItem>
                                            <SelectItem value="POR_PRODUCTO_ESPECIFICO">Por Producto Específico</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {configAlertaForm.config_aplicabilidad === 'POR_CATEGORIA' && ( /* ... */ )}
                                {configAlertaForm.config_aplicabilidad === 'POR_PRODUCTO_ESPECIFICO' && ( /* ... */ )}
                                <div className="space-y-1">
                                    <Label htmlFor="config_descripcion_modal_create_cfg">Descripción (Opcional)</Label>
                                    <Textarea id="config_descripcion_modal_create_cfg" name="config_descripcion" value={configAlertaForm.config_descripcion || ''} onChange={handleConfigAlertaFormChange} placeholder="Detalles adicionales" />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="config_nivel_alerta_default_modal_create_cfg">Nivel por Defecto*</Label>
                                    <Select name="config_nivel_alerta_default" value={configAlertaForm.config_nivel_alerta_default} onValueChange={(v) => handleConfigAlertaSelectChange('config_nivel_alerta_default', v as CrearConfiguracionAlertaPayload['config_nivel_alerta_default'])} required>
                                        <SelectTrigger id="config_nivel_alerta_default_modal_create_cfg"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="INFO">INFO</SelectItem>
                                            <SelectItem value="ADVERTENCIA">ADVERTENCIA</SelectItem>
                                            <SelectItem value="CRITICO">CRITICO</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter className="mt-2">
                                <Button type="button" variant="outline" onClick={() => { setIsConfigModalOpen(false); setConfigAlertaForm(initialConfigAlertaFormState); }}>Cancelar</Button>
                                <Button type="submit" disabled={crearConfiguracionAlertaMutation.isPending}>
                                    {crearConfiguracionAlertaMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Crear Configuración
                                </Button>
                            </DialogFooter>
                        </form>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-red-500">Debe iniciar sesión para crear configuraciones.</p>
                            <Button onClick={() => setIsConfigModalOpen(false)} variant="outline" className="mt-4">Cerrar</Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AlertasPage;