// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { useLocation } from "wouter";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
                                                                  children,
                                                                }) => {
  // Lee el token SÍNCRONAMENTE al iniciar para evitar el salto de rutas
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    console.log('Inicializando estado de autenticación');
    if (typeof window === "undefined") return false;

    const token = localStorage.getItem("token");
    const tokenIsValid = token !== null && token !== undefined && token !== "";

    console.log('Token encontrado:', !!token, 'Token válido:', tokenIsValid);
    return tokenIsValid;
  });
  const [location, setLocation] = useLocation();

  // Mejorar lógica de redirección para evitar bucles y comportamientos inesperados
  React.useEffect(() => {
    console.log('Auth state changed:', { isAuthenticated, location });

    // Si el usuario está autenticado y está en rutas públicas, redirigir a dashboard
    if (isAuthenticated) {
      if (location === "/" || location === "/login" || location === "/register") {
        console.log('Redirigiendo a dashboard (autenticado en ruta pública)');
        setLocation("/dashboard");
      }
    }
    // Si el usuario NO está autenticado y NO está en una ruta pública permitida, redirigir a login
    else if (!isAuthenticated &&
        location !== "/login" &&
        location !== "/register" &&
        location !== "/" &&
        !location.includes("auth/google") &&
        !location.includes("api/auth/google/callback") &&
        !location.startsWith("/auth/google") &&
        !location.startsWith("/api/auth/google")) {
      console.log('Redirigiendo a login (no autenticado en ruta protegida)');
      console.log('Ubicación actual:', location);
      setLocation("/login");
    }
  }, [location, isAuthenticated]);

  const login = (token: string) => {
    console.log('Login ejecutado con token');
    // Primero actualizar el estado
    setIsAuthenticated(true);
    // Luego guardar en localStorage
    localStorage.setItem("token", token);
    // Redirigir usando wouter
    setLocation("/dashboard");

    // Fallback si la redirección no funciona correctamente
    setTimeout(() => {
      if (window.location.pathname !== "/dashboard") {
        console.log('Fallback: Redirigiendo manualmente a dashboard');
        window.location.href = "/dashboard";
      }
    }, 300);
  };

  const logout = () => {
    console.log('Logout ejecutado');
    // Primero actualizar el estado
    setIsAuthenticated(false);
    // Luego eliminar de localStorage
    localStorage.removeItem("token");
    // Redirigir usando wouter
    setLocation("/login");

    // Fallback si la redirección no funciona correctamente
    setTimeout(() => {
      if (window.location.pathname !== "/login") {
        console.log('Fallback: Redirigiendo manualmente a login');
        window.location.href = "/login";
      }
    }, 300);
  };

  return (
      <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
