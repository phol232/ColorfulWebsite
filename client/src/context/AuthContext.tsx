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
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
  });
  const [, setLocation] = useLocation();

  const login = (token: string) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
    setLocation("/dashboard");
    // Fallback por si el navegador no respeta setLocation
    setTimeout(() => {
      if (window.location.pathname !== "/dashboard") {
        window.location.href = "/dashboard";
      }
    }, 200);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setLocation("/login");
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
