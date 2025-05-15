// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useLocation } from "wouter";
import { API_URL } from "@/config";

interface UserProfile {
  name?: string;
  email?: string;
  avatar?: string;
  role?: string;
  userId: string;
  usr_id?: string;
  sub?: string;
  id?: string;
  user_id?: string;
  google_id?: string;
  perfil?: any;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userProfile: UserProfile;
  login: (token: string, userData?: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Estado inicial de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const token = localStorage.getItem("token");
    return !!token;
  });

  // Estado inicial de perfil de usuario
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    if (typeof window === "undefined") return { userId: "" };
    try {
      const storedProfile = localStorage.getItem("userProfile");
      const storedUserId = localStorage.getItem("userId");
      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        if (!profile.userId && storedUserId) profile.userId = storedUserId;
        return profile;
      }
      return { userId: storedUserId || "" };
    } catch {
      return { userId: "" };
    }
  });

  const [location, setLocation] = useLocation();

  // Función para obtener los datos del usuario del backend
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_URL}/api/user`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        }
      });

      if (response.ok) {
        const data = await response.json();
        const usuario = data.usuario || data; // Ajusta según tu API
        if (usuario && usuario.usr_id) {
          // Guardar en React y localStorage
          setUserProfile(usuario);
          localStorage.setItem("userProfile", JSON.stringify(usuario));
          localStorage.setItem("userId", usuario.usr_id);
        }
      }
    } catch (e) {
      // Si hay error, no hace nada (el usuario tendrá que volver a loguearse)
    }
  };

  // Cargar perfil del usuario cada vez que se autentica
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated]);

  // Redirección automática según autenticación
  useEffect(() => {
    if (isAuthenticated) {
      if (["/", "/login", "/register"].includes(location)) setLocation("/dashboard");
    } else {
      if (
          !["/login", "/register", "/"].includes(location) &&
          !location.includes("auth/google") &&
          !location.includes("api/auth/google/callback")
      ) {
        setLocation("/login");
      }
    }
  }, [location, isAuthenticated, setLocation]);

  // Login: guarda token y consulta el perfil de usuario
  const login = (token: string, userData?: any) => {
    setIsAuthenticated(true);
    localStorage.setItem("token", token);

    // Si tienes datos del usuario (por login tradicional), guárdalos temporalmente
    if (userData && userData.usr_id) {
      setUserProfile(userData);
      localStorage.setItem("userProfile", JSON.stringify(userData));
      localStorage.setItem("userId", userData.usr_id);
    }

    // Pero siempre intenta obtener el perfil desde la API
    fetchUserProfile();

    setLocation("/dashboard");
    setTimeout(() => {
      if (window.location.pathname !== "/dashboard") {
        window.location.href = "/dashboard";
      }
    }, 300);
  };

  // Logout
  const logout = () => {
    setIsAuthenticated(false);
    setUserProfile({ userId: "" });
    localStorage.removeItem("token");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("userId");
    setLocation("/login");
    setTimeout(() => {
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }, 300);
  };

  return (
      <AuthContext.Provider value={{ isAuthenticated, userProfile, login, logout }}>
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};