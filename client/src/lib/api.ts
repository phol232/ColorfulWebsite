// client/src/lib/auth.ts
import { API_URL } from "@/config";

export interface LoginResponse {
  status: boolean;
  message: string;
  token?: string;
  usuario?: {
    perfil: {};
    usr_id: string;
    usr_user: string;
    usr_email: string;
  };
}

export interface RegisterResponse {
  status: boolean;
  message: string;
  data?: {
    usuario: {
      usr_id: string;
      usr_user: string;
      usr_email: string;
      perfil?: {
        nombre: string;
        apellido: string;
      };
    };
    token: string;
  };
}

export async function loginApi(
    usr_user: string,
    password: string
): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usr_user, password }),
  });

  return res.json();
}


export async function registerApi(payload: {
  usrp_nombre: string;
  usrp_apellido: string;
  usr_email: string;
  usr_user: string;
  password: string;
  password_confirmation: string;
}): Promise<RegisterResponse> {
  const res = await fetch(`${API_URL}/api/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept":       "application/json",
    },
    body: JSON.stringify(payload),
  });

  return res.json();
}

// Nueva función para emitir boleta desde frontend
export interface EmitirBoletaPayload {
  boleta_numero: string;
  boleta_fecha: string;
  boleta_subtotal: number;
  boleta_impuestos: number;
  boleta_total: number;
  metodos_pago: Array<{
    met_nombre: string;
  }>;
  pedido: {
    cliente: {
      cli_tipo_doc: string;
      cli_numero_doc: string;
      cli_nombre: string;
      cli_apellido: string;
    };
    detalles: Array<{
      det_cantidad: number;
      det_precio_unitario: number;
      det_subtotal: number;
      det_impuesto: number;
      producto: {
        pro_id: string;
        pro_nombre: string;
      };
    }>;
  };
}

export interface EmitirBoletaResponse {
  success: boolean;
  message: string;
  data?: {
    sunat_xml: string | null;
    cdr: string | null;
    request_id: string;
  };
  request_id?: string;
}

export async function emitirBoletaFrontend(payload: EmitirBoletaPayload): Promise<EmitirBoletaResponse> {
  const token = localStorage.getItem("token");
  
  // Crear un AbortController para manejar timeout de 130 segundos (más que el backend)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 130000); // 130 segundos - 10 segundos más que el backend
  
  try {
    const res = await fetch(`${API_URL}/api/facturacion/emitir-frontend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Connection": "keep-alive",
        ...(token && { "Authorization": `Bearer ${token}` }),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Timeout: La operación tardó más de 130 segundos. ApisPeru puede estar sobrecargado.');
    }
    
    throw error;
  }
}

// Nueva función para emitir boleta replicando exactamente Postman
export async function emitirBoletaReplicaPostman(payload: EmitirBoletaPayload): Promise<EmitirBoletaResponse> {
  const token = localStorage.getItem("token");
  
  // Crear un AbortController para manejar timeout de 130 segundos
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 130000);
  
  try {
    console.log('🔄 Probando réplica exacta de Postman');
    
    const res = await fetch(`${API_URL}/api/facturacion/emitir-replica-postman`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Connection": "keep-alive",
        ...(token && { "Authorization": `Bearer ${token}` }),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    
    if (data.success) {
      console.log('🎉 ¡FUNCIONA! Headers de Postman son la clave');
    } else {
      console.error('❌ Falló incluso con headers de Postman');
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Timeout: La operación tardó más de 130 segundos. ApisPeru puede estar sobrecargado.');
    }
    
    throw error;
  }
}

