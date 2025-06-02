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

