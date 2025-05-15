import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/config";

const GoogleCallback: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    /* Parámetros de la URL */
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const code = urlParams.get("code");
    const googleError = urlParams.get("error");

    if (googleError) {
      setError(`Error de Google: ${googleError}`);
      console.error("Error de Google:", googleError);
      return;
    }

    /* ─── Caso 1: token presente directamente ─── */
    if (token) {
      console.log("Token recibido directamente en callback:", token);

      /* Decodificar JWT para extraer datos mínimos */
      const decodeJwt = (jwt: string) => {
        try {
          const [, payload] = jwt.split(".");
          if (!payload) return {};
          const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
          return JSON.parse(json);
        } catch (err) {
          console.error("Error al decodificar JWT:", err);
          return {};
        }
      };

      const payload = decodeJwt(token);

      /* Detectar ID */
      const userId: string =
        payload.sub ??
        payload.userId ??
        payload.user_id ??
        payload.usr_id ??
        payload.id ??
        payload.google_id ??
        "";

      if (userId) {
        localStorage.setItem("userId", userId);
      }

      /* Llamar a login con el payload como userData */
      login(token, {
        ...payload,
        userId,
        usr_id: userId,
        user_id: userId,
        id: userId,
        google_id: userId,
      });
      return;
    }

    /* ─── Caso 2: intercambiar code ─── */
    if (code) {
      const exchangeCodeForToken = async () => {
        try {
          console.log(
            "Enviando código a:",
            `${API_URL}/api/auth/google/callback?code=${code}`
          );

          const response = await fetch(
            `${API_URL}/api/auth/google/callback?code=${code}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              credentials: "include",
            }
          );

          console.log("Respuesta del servidor:", response.status);
          const data = await response.json();
          console.log(
            "Datos recibidos:",
            JSON.stringify(data).substring(0, 100) + "..."
          );

          if (data.token) {
            const userData = data.usuario || data.user || data.profile || {};
            const profileExtra = userData.perfil || {};

            const userId: string =
              userData.usr_id ||
              userData.sub ||
              userData.id ||
              userData.user_id ||
              userData.google_id ||
              "";

            console.log("ID de usuario detectado:", userId);

            if (userId) localStorage.setItem("userId", userId);

            login(data.token, {
              ...userData,
              userId,
              usr_id: userId,
              user_id: userId,
              id: userId,
              google_id: userId,
              usrp_imagen:
                profileExtra.usrp_imagen ||
                userData.picture ||
                userData.photoUrl ||
                userData.avatar,
              picture:
                userData.picture ||
                userData.photoUrl ||
                profileExtra.usrp_imagen ||
                userData.avatar,
            });

            setLocation("/dashboard");
          } else {
            console.error("No se recibió token en la respuesta");
            setError("Error al procesar la autenticación con Google");
          }
        } catch (err) {
          console.error("Error de conexión:", err);
          setError("Error de conexión con el servidor");
        }
      };

      exchangeCodeForToken();
    } else {
      setError("No se recibió código de autorización ni token");
    }
  }, [login, setLocation]);

  /* Redirección automática tras error */
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setLocation("/login"), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, setLocation]);

  /* ──────────────────────────────────────────────────────────── */
  /* UI                                                           */
  /* ──────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        {error ? (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Error de autenticación
            </h2>
            <p className="text-gray-600">{error}</p>
            <p className="text-gray-500 mt-4">
              Redirigiendo a la página de login...
            </p>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Autenticando con Google
            </h2>
            <p className="text-gray-600">
              Por favor espere mientras procesamos su inicio de sesión...
            </p>
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