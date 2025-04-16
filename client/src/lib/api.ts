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
  
  export async function loginApi(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch('http://localhost:8000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,     
        password,  
      }),
    });
  
    return res.json();
  }