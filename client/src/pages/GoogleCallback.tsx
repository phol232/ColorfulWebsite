
import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/config";

const GoogleCallback: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    // Extrae el token directamente de la URL si viene en ese formato
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      setError(`Error de Google: ${error}`);
      console.error("Error de Google:", error);
      return;
    }

    // Si ya tenemos el token directamente, usarlo
    if (token) {
      console.log("Token recibido directamente en callback:", token);
      login(token);
      return;
    }

    // Si no hay token pero hay código, intercambiarlo por un token
    if (code) {
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
              console.log("Token recibido después de intercambiar código:", data.token);
              login(data.token);
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
    } else {
      setError("No se recibió código de autorización ni token");
    }
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
