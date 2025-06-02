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
import { registerApi } from "@/lib/api";  // asegúrate de exportarlo ahí
import { useNotifications } from "@/hooks/useNotifications";

const RegisterPage: React.FC = () => {
  const { showSuccess, showError } = useNotifications();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    usrp_nombre: "",
    usrp_apellido: "",
    usr_email: "",
    usr_user: "",
    password: "",
    password_confirmation: "",
    acceptTerms: false
  });
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.acceptTerms) {
      showError("Debes aceptar los términos y condiciones.", "Error de validación");
      return;
    }

    setLoading(true);
    try {
      const res = await registerApi({
        usrp_nombre: formData.usrp_nombre,
        usrp_apellido: formData.usrp_apellido,
        usr_email: formData.usr_email,
        usr_user: formData.usr_user,
        password: formData.password,
        password_confirmation: formData.password_confirmation
      });
      if (res.status && 'token' in res) {
        localStorage.setItem("token", String(res.token));
        showSuccess("Registro exitoso");
        window.location.href = "/dashboard";
      } else {
        showError(res.message || "Error al registrar el usuario.", "Error en el registro");
      }
    } catch (error) {
      showError(error, "No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-4xl overflow-hidden bg-white rounded-xl shadow-lg flex min-h-[600px] relative">
          {/* Izquierda igual */}
          <div className="relative w-[38%] overflow-hidden">
            <div
                className="absolute inset-0 bg-orange-500"
                style={{ clipPath: "polygon(0 0, 100% 0, 90% 100%, 0 100%)" }}
            />
            <div className="relative z-10 text-white px-8 py-10 h-full flex flex-col">
              <div className="font-bold text-xl">SistemaGestión</div>
              <div className="flex-grow flex flex-col justify-center">
                <h2 className="text-2xl font-bold mb-3">¿Ya tienes una cuenta?</h2>
                <p className="text-sm opacity-90 mb-6">
                  Ingresa con tu usuario para administrar tu negocio.
                </p>
                <Link href="/login">
                  <Button
                      variant="outline"
                      className="border-white text-orange-500 hover:bg-white hover:text-orange-500 transition-colors w-full"
                  >
                    INICIAR SESIÓN
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Derecha: formulario de registro */}
          <div className="w-[62%] p-12 h-full">
            <div className="max-w-md mx-auto">
              <h1 className="text-2xl font-bold mb-2">Crea una cuenta nueva</h1>
              <p className="text-gray-600 mb-8">
                Completa los siguientes datos para registrarte.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="usrp_nombre">Nombre</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                          id="usrp_nombre"
                          name="usrp_nombre"
                          value={formData.usrp_nombre}
                          onChange={handleChange}
                          placeholder="Tu nombre"
                          className="pl-10"
                          required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="usrp_apellido">Apellido</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                          id="usrp_apellido"
                          name="usrp_apellido"
                          value={formData.usrp_apellido}
                          onChange={handleChange}
                          placeholder="Tu apellido"
                          className="pl-10"
                          required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <Label htmlFor="usr_email">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        id="usr_email"
                        name="usr_email"
                        type="email"
                        value={formData.usr_email}
                        onChange={handleChange}
                        placeholder="ejemplo@correo.com"
                        className="pl-10"
                        required
                    />
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <Label htmlFor="usr_user">Usuario</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        id="usr_user"
                        name="usr_user"
                        value={formData.usr_user}
                        onChange={handleChange}
                        placeholder="Tu usuario"
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
                        onClick={() => setShowPassword(v => !v)}
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
                <div className="space-y-2 mb-6">
                  <Label htmlFor="password_confirmation">Confirmar Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        id="password_confirmation"
                        name="password_confirmation"
                        type={showPassword ? "text" : "password"}
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        placeholder="Repite tu contraseña"
                        className="pl-10 pr-10"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
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

                <div className="flex items-center space-x-2 mb-6">
                  <Checkbox
                      id="terms"
                      checked={formData.acceptTerms}
                      onCheckedChange={handleCheckboxChange}
                  />
                  <label htmlFor="terms" className="text-sm">
                    Acepto los{" "}
                    <Link href="/terms" className="text-orange-500 hover:underline">
                      Términos y Condiciones
                    </Link>
                  </label>
                </div>

                <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    disabled={loading || !formData.acceptTerms}
                >
                  {loading ? "Registrando..." : "REGISTRARSE"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
  );
};

export default RegisterPage;
