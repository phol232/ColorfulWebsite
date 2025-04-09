import React, { useState } from "react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff 
} from "lucide-react";
import { Label } from "@/components/ui/label";

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      rememberMe: checked
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Datos de login:", formData);
    // Aquí iría la lógica para enviar los datos al backend
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-4xl overflow-hidden bg-white rounded-xl shadow-lg flex min-h-[600px] relative">
        {/* Sección izquierda con diseño diagonal usando clip-path */}
        <div className="relative w-[38%] overflow-hidden">
          {/* Fondo azul principal */}
          <div 
            className="absolute inset-0 bg-orange-500"
            style={{ clipPath: "polygon(0 0, 100% 0, 90% 100%, 0 100%)" }}
          ></div>
          
          {/* Contenido centrado */}
          <div className="relative z-10 text-white px-8 py-10 h-full flex flex-col">
            <div className="font-bold text-xl">SistemaGestión</div>
            
            <div className="flex-grow flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-3">¿No tienes cuenta?</h2>
              <p className="text-sm opacity-90 mb-6">
                Regístrate para acceder a todas las funcionalidades del sistema y administrar tu negocio de manera eficiente.
              </p>
              
              <Link href="/register">
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-orange-500 transition-colors w-full">
                  CREAR CUENTA
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Sección derecha - Blanco */}
        <div className="w-[62%] p-12 h-full">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-2">Iniciar Sesión</h1>
            <p className="text-gray-600 mb-8">Ingresa tus credenciales para acceder al sistema</p>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-2 mb-4">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ejemplo@correo.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link href="/forgot-password" className="text-sm text-orange-500 hover:underline">
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
                    onClick={toggleShowPassword}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? 
                      <EyeOff className="h-4 w-4" /> : 
                      <Eye className="h-4 w-4" />
                    }
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mb-6">
                <Checkbox 
                  id="remember" 
                  checked={formData.rememberMe}
                  onCheckedChange={handleCheckboxChange}
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Recordar mi sesión
                </label>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                INICIAR SESIÓN
              </Button>
              
              <div className="mt-6 text-center text-sm text-gray-500">
                <p>O inicia sesión con:</p>
                <div className="flex justify-center space-x-4 mt-4">
                  <button className="p-2 border rounded-full">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.5 12.066C22.5 11.234 22.4242 10.463 22.2969 9.71875H12V13.7148H17.9648C17.7617 14.9961 16.9883 16.1289 15.8086 16.8672V19.4531H19.2188C21.2852 17.5742 22.5 15.0469 22.5 12.066Z" fill="#4285F4"/>
                      <path d="M12 22.5C14.8125 22.5 17.1797 21.5977 19.2188 19.4531L15.8086 16.8672C14.8633 17.5195 13.5938 17.8984 12 17.8984C9.13359 17.8984 6.71016 16.0039 5.84766 13.4062H2.31797V16.0781C4.33594 19.9687 7.91016 22.5 12 22.5Z" fill="#34A853"/>
                      <path d="M5.84766 13.4062C5.62734 12.7539 5.49609 12.0586 5.49609 11.25C5.49609 10.4414 5.62734 9.74609 5.84766 9.09375V6.42188H2.31797C1.63359 7.87969 1.25 9.51562 1.25 11.25C1.25 12.9844 1.63359 14.6203 2.31797 16.0781L5.84766 13.4062Z" fill="#FBBC05"/>
                      <path d="M12 4.60156C13.475 4.60156 14.7984 5.11719 15.8438 6.07031L18.8906 3.02344C17.1742 1.42578 14.8078 0.5 12 0.5C7.91016 0.5 4.33594 3.03125 2.31797 6.92188L5.84766 9.59375C6.71016 6.99609 9.13359 4.60156 12 4.60156Z" fill="#EA4335"/>
                    </svg>
                  </button>
                  <button className="p-2 border rounded-full">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 12.0605C22 6.505 17.523 2 12.005 2C6.478 2 2 6.505 2 12.0605C2 17.083 5.657 21.245 10.441 22V15.0215H7.9V12.0605H10.441V9.848C10.441 7.2935 11.93 5.906 14.215 5.906C15.308 5.906 16.453 6.1015 16.453 6.1015V8.562H15.191C13.951 8.562 13.568 9.333 13.568 10.124V12.0605H16.334L15.891 15.0215H13.568V22C18.343 21.245 22 17.083 22 12.0605Z" fill="#1877F2"/>
                    </svg>
                  </button>
                  <button className="p-2 border rounded-full">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.2239 12.8357C17.2125 11.0543 18.0069 9.66612 19.6267 8.59948C18.7244 7.33024 17.3875 6.6291 15.6574 6.48119C14.0148 6.33894 12.2401 7.34924 11.6736 7.34924C11.0784 7.34924 9.50245 6.51965 8.2196 6.51965C5.97489 6.55663 3.55882 8.16673 3.55882 11.459C3.55882 12.5006 3.73809 13.5749 4.09662 14.6814C4.5701 16.1659 6.30705 19.5033 8.11267 19.4549C9.07961 19.4319 9.76048 18.7816 11.0215 18.7816C12.2455 18.7816 12.8737 19.4549 13.9479 19.4549C15.7651 19.4319 17.3243 16.4091 17.7745 14.9207C14.0376 13.2489 14.0148 9.35839 17.2239 8.35394V12.8357Z" fill="black"/>
                      <path d="M14.6801 4.83711C15.9143 3.35937 15.7872 2.02172 15.754 1.5C14.6046 1.57396 13.2945 2.3023 12.5744 3.21573C11.781 4.17855 11.3268 5.33719 11.4379 6.45536C12.6721 6.5064 13.6916 5.95703 14.6801 4.83711Z" fill="black"/>
                    </svg>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;