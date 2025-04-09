import React, { useState } from "react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff 
} from "lucide-react";
import { Label } from "@/components/ui/label";

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    acceptTerms: false
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
      acceptTerms: checked
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Datos de registro:", formData);
    // Aquí iría la lógica para enviar los datos al backend
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-4xl overflow-hidden bg-white rounded-xl shadow-lg flex min-h-[600px] relative">
        {/* Sección izquierda con diseño diagonal usando clip-path */}
        <div className="relative w-2/5 overflow-hidden">
          {/* Fondo azul principal */}
          <div 
            className="absolute inset-0 bg-orange-500"
            style={{ clipPath: "polygon(0 0, 100% 0, 85% 100%, 0 100%)" }}
          ></div>
          
          {/* Contenido centrado */}
          <div className="relative z-10 text-white p-12 h-full flex flex-col">
            <div className="font-bold text-xl mb-12">SistemaGestión</div>
            
            <div className="flex-grow flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-4">¿Ya tienes una cuenta?</h2>
              <p className="text-sm opacity-90 mb-8">
                Todos los usuarios de nuestro sistema tienen acceso a funciones avanzadas para gestionar inventario, ventas y clientes de manera eficiente.
              </p>
              
              <Link href="/login">
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-orange-500 transition-colors w-full">
                  INICIAR SESIÓN
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Sección derecha - Blanco */}
        <div className="w-3/5 p-12 h-full">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-2">Crea una cuenta nueva</h1>
            <p className="text-gray-600 mb-8">Completa los siguientes datos para registrarte en el sistema</p>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Tu nombre"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      id="apellido"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      placeholder="Tu apellido"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
              
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
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mínimo 8 caracteres"
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
                  id="terms" 
                  checked={formData.acceptTerms}
                  onCheckedChange={handleCheckboxChange}
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Acepto los <Link href="/terms" className="text-orange-500 hover:underline">Términos y Condiciones</Link>
                </label>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={!formData.acceptTerms}
              >
                REGISTRARSE
              </Button>
              

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;