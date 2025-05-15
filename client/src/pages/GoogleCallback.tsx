// src/pages/auth/google/callback.tsx
import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/config";

const GoogleCallback: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (error) {
      setError(`Error de Google: ${error}`);
      return;
    }

    if (token) {
      // 1. Guardar el token
      localStorage.setItem("token", token);

      // 2. Consultar /api/user para obtener el perfil completo
      fetch(`${API_URL}/api/user`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        }
      })
          .then(async (resp) => {
            if (resp.ok) {
              const data = await resp.json();
              const usuario = data.usuario || data; // depende de tu API, pero ambos cubren el caso

              // 3. Guardar el perfil y usr_id en localStorage
              if (usuario && usuario.usr_id) {
                localStorage.setItem("userProfile", JSON.stringify(usuario));
                localStorage.setItem("userId", usuario.usr_id);

                // 4. Llamar login del contexto para guardar en React
                login(token, usuario);

                setLocation("/dashboard");
              } else {
                setError("No se pudo obtener el perfil de usuario.");
              }
            } else {
              setError("No se pudo obtener el perfil del usuario desde el backend.");
            }
          })
          .catch(() => setError("Error al conectar con el backend."));
    } else {
      setError("No se recibió token válido.");
    }
  }, [login, setLocation]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setLocation("/login"), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, setLocation]);

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
          {error ? (
              <div className="text-center">
                <h2 className="text-xl font-semibold text-red-600 mb-2">Error de autenticación</h2>
                <p className="text-gray-600">{error}</p>
                <p className="text-gray-500 mt-4">Redirigiendo a la página de login...</p>
              </div>
          ) : (
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Autenticando con Google</h2>
                <p className="text-gray-600">Por favor espere mientras procesamos su inicio de sesión...</p>
                <div className="mt-4 flex justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              </div>
          )}
        </div>
      </div>
  );
};

export default GoogleCallback;