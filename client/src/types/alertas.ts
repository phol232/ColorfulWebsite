//src//types/alertas.ts
export interface Usuario {
    usr_id: string;
    usr_user?: string;
    usr_nombre?: string;
    name?: string;
}

export interface ProductoAlerta {
    pro_id: string;
    pro_nombre: string;
    pro_stock: number;
}

export interface ConfiguracionAlertaOrigen {
    config_alerta_id: number;
    config_nombre: string;
    config_tipo: string;
    config_umbral_valor?: number;
}

export interface AlertaStock {
    alerta_stock_id: number;
    prod_id: string | null;
    config_alerta_id_origen: number | null;
    stock_capturado: number;
    umbral_evaluado: number;
    alerta_tipo_generada: string;
    alerta_nivel_generado: 'INFO' | 'ADVERTENCIA' | 'CRITICO';
    mensaje_automatico: string;
    fecha_generacion: string;
    estado_alerta: 'Activa' | 'En Revision' | 'Resuelta' | 'Ignorada';
    fecha_resolucion: string | null;
    comentario_resolucion: string | null;
    resuelta_por_usr_id: string | null; // Este es el ID que se envía al backend
    creada_por_proceso: string;
    producto?: ProductoAlerta | null;
    configuracion_origen?: ConfiguracionAlertaOrigen | null;
    resuelta_por?: Usuario | null; // El objeto 'resuelta_por' que viene del backend debe coincidir con la interfaz Usuario
    comentario_resolucion_actual?: string;
}

export interface CrearAlertaManualPayload {
    prod_id: string;
    config_alerta_id_origen?: number | null;
    stock_capturado: number | string;
    umbral_evaluado: number | string;
    alerta_tipo_generada: string;
    alerta_nivel_generado: 'INFO' | 'ADVERTENCIA' | 'CRITICO';
    mensaje_automatico: string;
}

export interface ConfiguracionAlerta {
    config_alerta_id: number;
    config_nombre: string;
    config_tipo: 'STOCK_LLEGA_A_VALOR' | 'STOCK_DEBAJO_DE_UMBRAL';
    config_umbral_valor: number;
    config_aplicabilidad: 'GENERAL' | 'POR_CATEGORIA' | 'POR_PRODUCTO_ESPECIFICO';
    id_referencia_aplicabilidad: string | null;
    config_descripcion: string | null;
    config_nivel_alerta_default: 'INFO' | 'ADVERTENCIA' | 'CRITICO';
    config_estado: 'Activa' | 'Inactiva';
    config_creado_por_usr_id: string; // Este es el ID que se envía al backend
    creado_por?: Usuario | null; // El objeto 'creado_por' que viene del backend debe coincidir con la interfaz Usuario
}

export interface CrearConfiguracionAlertaPayload {
    config_nombre: string;
    config_tipo: 'STOCK_LLEGA_A_VALOR' | 'STOCK_DEBAJO_DE_UMBRAL';
    config_umbral_valor: number | string;
    config_aplicabilidad: 'GENERAL' | 'POR_CATEGORIA' | 'POR_PRODUCTO_ESPECIFICO';
    id_referencia_aplicabilidad?: string | null;
    config_descripcion?: string | null;
    config_nivel_alerta_default: 'INFO' | 'ADVERTENCIA' | 'CRITICO';
    config_creado_por_usr_id: string; // Este será userProfile.userId (o userProfile.usr_id si lo tienes)
}

export interface CategoriaSimple {
    cat_id: string;
    cat_nombre: string;
}