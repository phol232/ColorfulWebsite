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
      console.log("Obteniendo perfil de usuario desde API...");
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No hay token disponible");
        return;
      }

      const response = await fetch(`${API_URL}/api/user`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        }
      });

      console.log("Respuesta de /api/user:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("Datos de usuario recibidos:", data);

        // Intentar extraer el usuario de diferentes formatos posibles
        const usuario = data.usuario || data.user || data;

        // Buscar un ID válido en diferentes formatos
        const userId = usuario.usr_id || usuario.id || usuario.user_id ||
            usuario.sub || usuario.google_id;

        if (usuario && userId) {
          // Normalizar el perfil para tener un userId consistente
          const normalizedProfile = {
            ...usuario,
            userId: userId,
            // Construir URL completa del avatar si existe
            avatar: usuario.perfil?.usrp_imagen
                ? `${API_URL}/storage/${usuario.perfil.usrp_imagen}`
                : undefined
          };

          console.log("Perfil normalizado:", normalizedProfile);

          // Guardar en React y localStorage
          setUserProfile(normalizedProfile);
          localStorage.setItem("userProfile", JSON.stringify(normalizedProfile));
          localStorage.setItem("userId", userId);

          return normalizedProfile;
        } else {
          console.warn("Perfil de usuario incompleto:", usuario);
        }
      } else {
        console.error("Error al obtener perfil de usuario:", response.status);
        try {
          const errorText = await response.text();
          console.error("Detalles del error:", errorText);
        } catch (e) {
          // Ignorar error al leer respuesta
        }
      }
    } catch (e) {
      console.error("Error al obtener perfil de usuario:", e);
      // Si hay error, no hace nada (el usuario tendrá que volver a loguearse)
    }
    return null;
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
          !location.includes("auth/microsoft") &&
          !location.includes("api/auth/google/callback") &&
          !location.includes("api/auth/microsoft/callback")
      ) {
        setLocation("/login");
      }
    }
  }, [location, isAuthenticated, setLocation]);

  // Login: guarda token y consulta el perfil de usuario
  const login = (token: string, userData?: any) => {
    setIsAuthenticated(true);
    localStorage.setItem("token", token);

    // Si tienes datos del usuario (por login tradicional o de Google), guárdalos temporalmente
    if (userData) {
      // Intentar encontrar un ID de usuario válido entre diferentes formatos posibles
      const userId = userData.usr_id || userData.id || userData.user_id ||
          userData.sub || userData.google_id || userData.userId;

      if (userId) {
        // Asegurarse de que el perfil tenga un userId normalizado
        const normalizedUserData = {
          ...userData,
          userId: userId,
          // Construir URL completa del avatar si existe
          avatar: userData.perfil?.usrp_imagen
              ? `${API_URL}/storage/${userData.perfil.usrp_imagen}`
              : undefined
        };

        console.log("Guardando perfil de usuario:", normalizedUserData);
        setUserProfile(normalizedUserData);
        localStorage.setItem("userProfile", JSON.stringify(normalizedUserData));
        localStorage.setItem("userId", userId);
      } else {
        console.warn("Login recibió datos de usuario pero sin ID identificable:", userData);
      }
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