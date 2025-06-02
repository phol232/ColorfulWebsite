// src/pages/auth/google/callback.tsx
import React, { useEffect, useState } from 'react';
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/config";
import { useNotifications } from '@/hooks/useNotifications';

const GoogleCallback: React.FC = () => {
  const { login } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const [, setLocation] = useLocation();


  useEffect(() => {
    console.log("GoogleCallback: Iniciando procesamiento");
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');
    const code = urlParams.get('code'); // Google también puede enviar un código de autorización

    console.log("Parámetros recibidos:", { token, error, code });

    if (error) {
      console.error("Error de autenticación:", error);
      setError(`Error de Google: ${error}`);
      return;
    }

    // Si tenemos código pero no token, puede ser el flujo estándar de OAuth
    if (code && !token) {
      console.log("Se recibió código de autorización pero no token");
      // Este es un caso que el backend debería manejar, pero podemos intentar
      // redirigir al backend para que procese el código
      window.location.href = `${API_URL}/api/auth/google/callback?code=${code}`;
      return;
    }

    if (token) {
      console.log("Token recibido, procesando...");
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
            console.log("Respuesta de API /user:", resp.status);
            if (resp.ok) {
              const data = await resp.json();
              console.log("Datos de usuario recibidos:", data);
              const usuario = data.usuario || data; // depende de tu API, pero ambos cubren el caso

              // 3. Guardar el perfil y usr_id en localStorage
              if (usuario && (usuario.usr_id || usuario.id || usuario.user_id || usuario.sub)) {
                // Asegurarnos de tener un ID válido usando cualquier formato que venga
                const userId = usuario.usr_id || usuario.id || usuario.user_id || usuario.sub;
                usuario.userId = userId; // Normalizar el ID para el contexto

                localStorage.setItem("userProfile", JSON.stringify(usuario));
                localStorage.setItem("userId", userId);

                // 4. Llamar login del contexto para guardar en React
                login(token, usuario);

                console.log("Login exitoso, redirigiendo a dashboard...");
                setLocation("/dashboard");
              } else {
                console.error("Perfil incompleto:", usuario);
                setError("No se pudo obtener el perfil de usuario. Datos incompletos.");
              }
            } else {
              console.error("Error al obtener perfil:", resp.status);
              try {
                const errorData = await resp.text();
                console.error("Detalles:", errorData);
                setError(`Error del servidor: ${resp.status} - ${errorData}`);
              } catch (e) {
                setError(`No se pudo obtener el perfil: Error ${resp.status}`);
              }
            }
          })
          .catch((err) => {
            console.error("Error en la petición:", err);
            setError(`Error al conectar con el backend: ${err.message}`);
          });
    } else {
      console.error("No se recibió token ni código");
      setError("No se recibió token ni código de autorización válido.");
    }
  }, [login, setLocation, showSuccess, showError]);

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