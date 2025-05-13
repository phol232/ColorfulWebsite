import React, { useState } from "react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Label } from "@/components/ui/label";
import { loginApi } from "@/lib/api";
import { API_URL } from "@/config";
import { useAuth } from "@/context/AuthContext";

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    usr_user: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      rememberMe: checked,
    }));
  };

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await loginApi(formData.usr_user, formData.password);
      if (res.status && res.token) {
        login(res.token); // Utilizamos el método login del contexto
      } else {
        setErrorMsg(res.message || "Error desconocido");
      }
    } catch {
      setErrorMsg("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Asegúrate de que esta URL coincida exactamente con la configurada en tu backend Laravel
    const redirectUrl = `${API_URL}/api/auth/google/redirect`;
    console.log("Iniciando login con Google:", redirectUrl);

    // Guardar el estado actual antes de redirigir
    sessionStorage.setItem('google_auth_pending', 'true');

    // Redireccionar al endpoint de autenticación
    window.location.href = redirectUrl;
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-4xl overflow-hidden bg-white rounded-xl shadow-lg flex min-h-[600px] relative">
          {/* IZQUIERDA */}
          <div className="relative w-[38%] overflow-hidden">
            <div
                className="absolute inset-0 bg-orange-500"
                style={{ clipPath: "polygon(0 0, 100% 0, 90% 100%, 0 100%)" }}
            />
            <div className="relative z-10 text-white px-8 py-10 h-full flex flex-col">
              <div className="font-bold text-xl">SistemaGestión</div>
              <div className="flex-grow flex flex-col justify-center">
                <h2 className="text-2xl font-bold mb-3">¿No tienes cuenta?</h2>
                <p className="text-sm opacity-90 mb-6">
                  Regístrate para acceder a todas las funcionalidades del sistema.
                </p>
                <Link href="/register">
                  <Button
                      variant="outline"
                      className="border-white text-orange-500 hover:bg-white hover:text-orange-500 transition-colors w-full"
                  >
                    CREAR CUENTA
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* DERECHA */}
          <div className="w-[62%] p-12 h-full">
            <div className="max-w-md mx-auto">
              <h1 className="text-2xl font-bold mb-2">Iniciar Sesión</h1>
              <p className="text-gray-600 mb-8">
                Ingresa tus credenciales para acceder al sistema
              </p>
              {errorMsg && (
                  <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4">
                    {errorMsg}
                  </div>
              )}
              <form onSubmit={handleSubmit}>
                {/* Usuario */}
                <div className="space-y-2 mb-4">
                  <Label htmlFor="usr_user">Usuario</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        id="usr_user"
                        name="usr_user"
                        type="text"
                        value={formData.usr_user}
                        onChange={handleChange}
                        placeholder="Tu usuario"
                        className="pl-10"
                        required
                    />
                  </div>
                </div>

                {/* Contraseña */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Contraseña</Label>
                    <Link
                        href="/forgot-password"
                        className="text-sm text-orange-500 hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Ingresa tu contraseña"
                        className="pl-10 pr-10"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                      ) : (
                          <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Recordar sesión */}
                <div className="flex items-center space-x-2 mb-6">
                  <Checkbox
                      id="remember"
                      checked={formData.rememberMe}
                      onCheckedChange={handleCheckboxChange}
                  />
                  <label htmlFor="remember" className="text-sm">
                    Recordar mi sesión
                  </label>
                </div>

                {/* Botón de login */}
                <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    disabled={loading}
                >
                  {loading ? "Iniciando..." : "INICIAR SESIÓN"}
                </Button>

                {/* Botón Google */}
                <div className="mt-4">
                  <Button
                      type="button"
                      variant="outline"
                      className="w-full flex items-center justify-center border-gray-300 hover:bg-gray-100"
                      onClick={handleGoogleLogin}
                  >
                    <svg
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                          d="M22.5 12.066c0-.79-.07-1.551-.203-2.285H12v4.327h6.15c-.265 1.43-1.058 2.641-2.252 3.458v2.877h3.635C21.405 18.38 22.5 15.41 22.5 12.066z"
                          fill="#4285F4"
                      />
                      <path
                          d="M12 22.5c2.812 0 5.18-.903 7.22-2.947l-3.41-2.586c-.945.643-2.215 1.024-3.808 1.024-2.867 0-5.29-1.895-6.153-4.492H2.318v2.672C4.336 19.969 7.91 22.5 12 22.5z"
                          fill="#34A853"
                      />
                      <path
                          d="M5.847 13.406c-.22-.653-.352-1.348-.352-2.157 0-.81.132-1.505.352-2.157V6.421H2.318C1.634 7.88 1.25 9.516 1.25 11.25c0 1.735.383 3.371 1.068 4.829l3.529-2.673z"
                          fill="#FBBC05"
                      />
                      <path
                          d="M12 4.602c1.475 0 2.798.516 3.844 1.469l3.047-3.047C17.175 1.426 14.808.5 12 .5 7.91.5 4.336 3.031 2.318 6.922l3.529 2.672C9.134 4.996 11.457 4.602 12 4.602z"
                          fill="#EA4335"
                      />
                    </svg>
                    INICIAR CON GOOGLE
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
  );
};

export default LoginPage;
