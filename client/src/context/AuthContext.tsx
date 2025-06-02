import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { API_URL } from '@/config';
import { useNotifications } from '@/hooks/useNotifications';
import { useLocation } from "wouter";

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const token = localStorage.getItem("token");
    return !!token;
  });

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
  const { showSuccess, showError } = useNotifications();

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
        const usuario = data.usuario || data.user || data;
        const userId = usuario.usr_id || usuario.id || usuario.user_id ||
            usuario.sub || usuario.google_id;

        if (usuario && userId) {
          const normalizedProfile = {
            ...usuario,
            userId: userId,
            avatar: usuario.perfil?.usrp_imagen
                ? `${API_URL}/storage/${usuario.perfil.usrp_imagen}`
                : undefined
          };

          setUserProfile(normalizedProfile);
          localStorage.setItem("userProfile", JSON.stringify(normalizedProfile));
          localStorage.setItem("userId", userId);

          showSuccess("El perfil de usuario se ha cargado correctamente.");
          return normalizedProfile;
        }
      } else {
        const errorText = await response.text();
        showError(errorText, "Error al cargar el perfil");
      }
    } catch (e) {
      showError(e, "Error al cargar el perfil");
    }
    return null;
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated]);

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

  const login = (token: string, userData?: any) => {
    setIsAuthenticated(true);
    localStorage.setItem("token", token);

    if (userData) {
      const userId = userData.usr_id || userData.id || userData.user_id ||
          userData.sub || userData.google_id || userData.userId;

      if (userId) {
        const normalizedUserData = {
          ...userData,
          userId: userId,
          avatar: userData.perfil?.usrp_imagen
              ? `${API_URL}/storage/${userData.perfil.usrp_imagen}`
              : undefined
        };

        setUserProfile(normalizedUserData);
        localStorage.setItem("userProfile", JSON.stringify(normalizedUserData));
        localStorage.setItem("userId", userId);
        showSuccess("Sesión iniciada correctamente.");
      } else {
        showError("No se pudo identificar el ID del usuario.", "Error al iniciar sesión");
      }
    }

    fetchUserProfile();

    setLocation("/dashboard");
    setTimeout(() => {
      if (window.location.pathname !== "/dashboard") {
        window.location.href = "/dashboard";
      }
    }, 300);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserProfile({ userId: "" });
    localStorage.removeItem("token");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("userId");
    setLocation("/login");
    showSuccess("Sesión cerrada correctamente.");
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