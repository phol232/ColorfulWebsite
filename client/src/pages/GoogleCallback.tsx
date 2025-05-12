
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
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      setError(`Error de Google: ${error}`);
      console.error("Error de Google:", error);
      return;
    }

    if (!code) {
      setError("No se recibió código de autorización");
      console.error("URL de callback recibida:", window.location.href);
      console.error("Parámetros URL:", Object.fromEntries(urlParams.entries()));
      return;
    }

    const exchangeCodeForToken = async () => {
      try {
        console.log("Enviando código a:", `${API_URL}/api/auth/google/callback?code=${code}`);

        const response = await fetch(`${API_URL}/api/auth/google/callback?code=${code}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include'
        });

        console.log("Respuesta del servidor:", response.status);

        try {
          const data = await response.json();
          console.log("Datos recibidos:", JSON.stringify(data).substring(0, 100) + "...");

          if (response.ok && data.token) {
            console.log("Token recibido en GoogleCallBack:", data.token);
            login(data.token); // Usar el token para autenticar al usuario

            // Agregar un pequeño retraso antes de la navegación manual
            setTimeout(() => {
              console.log("Navegando al dashboard después del login");
              window.location.href = '/dashboard';
            }, 500);
          } else {
            setError(data.message || "Error al autenticar con Google");
          }
        } catch (jsonError) {
          console.error("Error al procesar JSON:", jsonError);
          setError("Error en la respuesta del servidor");
        }
      } catch (err) {
        setError("Error de conexión con el servidor");
        console.error(err);
      }
    };

    exchangeCodeForToken();
  }, [login, setLocation]);

  // Si hay un error, mostrar mensaje después de 5 segundos redirigir a login
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setLocation('/login');
      }, 5000);

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
