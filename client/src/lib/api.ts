// client/src/lib/auth.ts  (o donde tengas esta función)
import { API_URL } from "@/config";

export interface LoginResponse {
  status: boolean;
  message: string;
  token?: string;
  usuario?: {
    usr_id: string;
    usr_user: string;
    usr_email: string;
  };
}

export async function loginApi(
  email: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/api/login`, {          
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return res.json();
}
