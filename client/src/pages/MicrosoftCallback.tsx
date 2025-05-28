
// src/pages/auth/microsoft/callback.tsx
import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/config";

const MicrosoftCallback: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const [, setLocation] = useLocation();
    const { login } = useAuth();

    useEffect(() => {
        console.log("MicrosoftCallback: Iniciando procesamiento");
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const error = urlParams.get('error');
        const code = urlParams.get('code');

        console.log("Parámetros recibidos:", { token, error, code });

        if (error) {
            console.error("Error de autenticación:", error);
            setError(`Error de Microsoft: ${error}`);
            return;
        }

        if (code && !token) {
            console.log("Se recibió código de autorización pero no token");
            window.location.href = `${API_URL}/api/auth/microsoft/callback?code=${code}`;
            return;
        }

        if (token) {
            console.log("Token recibido, procesando...");
            localStorage.setItem("token", token);

            // Obtener información del usuario desde la API
            fetch(`${API_URL}/api/user`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json",
                }
            })
                .then(response => response.json())
                .then(data => {
                    console.log("Datos de usuario recibidos:", data);
                    if (data.status && data.usuario) {
                        login(token, data.usuario);
                    } else {
                        console.error("Error en la respuesta del usuario:", data);
                        setError("Error al obtener información del usuario");
                    }
                })
                .catch(err => {
                    console.error("Error al obtener usuario:", err);
                    login(token); // Login solo con token si falla obtener usuario
                });

            return;
        }

        console.error("No se recibió token ni código válido");
        setError("No se pudo completar la autenticación con Microsoft");
    }, [login, setLocation]);

    // Redirigir en caso de error después de 3 segundos
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setLocation("/login");
            }, 3000);
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
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Autenticando con Microsoft</h2>
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

export default MicrosoftCallback;
