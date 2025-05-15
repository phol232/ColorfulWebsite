// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { useLocation } from "wouter";

/* ────────────────────────────────────────────────────────────── */
/* Tipos                                                          */
/* ────────────────────────────────────────────────────────────── */
interface UserProfile {
  name?: string;
  email?: string;
  avatar?: string;
  role?: string;

  /* Identificadores posibles */
  userId: string;
  sub?: string;
  id?: string;
  user_id?: string;
  google_id?: string;
  usr_id?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userProfile: UserProfile;
  login: (token: string, userData?: any) => void;
  logout: () => void;
}

/* ────────────────────────────────────────────────────────────── */
/* Contexto                                                       */
/* ────────────────────────────────────────────────────────────── */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  /* 1) Autenticación inicial: lee token de localStorage */
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem("token"));
  });

  /* 2) Perfil de usuario inicial */
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    if (typeof window === "undefined") return { userId: "" };

    try {
      const storedProfile = localStorage.getItem("userProfile");
      const storedUserId = localStorage.getItem("userId");

      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        if (!profile.userId) profile.userId = storedUserId ?? "";
        return profile;
      }
      return { userId: storedUserId ?? "" };
    } catch (err) {
      console.error("Error rehidratando perfil:", err);
      return { userId: "" };
    }
  });

  const [location, setLocation] = useLocation();

  /* 3) Redirección automática según autenticación */
  React.useEffect(() => {
    if (isAuthenticated) {
      if (["/", "/login", "/register"].includes(location)) {
        setLocation("/dashboard");
      }
    } else {
      const isPublic =
        ["/", "/login", "/register"].includes(location) ||
        location.includes("auth/google");
      if (!isPublic) setLocation("/login");
    }
  }, [isAuthenticated, location, setLocation]);

  /* ──────────────────────────────────────────────────────────── */
  /* login                                                        */
  /* ──────────────────────────────────────────────────────────── */
  const login = (token: string, userData?: any) => {
    setIsAuthenticated(true);

    /* Cuando no recibimos userData (p. ej. token ya incluye todo) */
    if (!userData) {
      localStorage.setItem("token", token);
      setLocation("/dashboard");
      return;
    }

    /* Detectar el ID del usuario */
    const detectedUserId: string =
      userData.userId ||
      userData.user_id ||
      userData.usr_id ||
      userData.google_id ||
      userData.sub ||
      userData.id ||
      "";

    if (!detectedUserId) {
      console.warn("⚠️ No se pudo obtener el ID del usuario.");
    }

    /* Construir el perfil */
    const perfilExtra = userData.perfil ?? {};
    const profile: UserProfile = {
      name:
        perfilExtra.usrp_nombre
          ? `${perfilExtra.usrp_nombre} ${perfilExtra.usrp_apellido ?? ""}`
          : userData.name ?? userData.usr_user,
      email: userData.usr_email ?? userData.email,
      avatar:
        perfilExtra.usrp_imagen ??
        userData.usrp_imagen ??
        userData.picture ??
        userData.avatar ??
        "",
      role: userData.role ?? "Usuario",

      /* Identificadores */
      userId: detectedUserId,
      sub: userData.sub,
      id: userData.id,
      user_id: userData.user_id,
      google_id: userData.google_id,
      usr_id: userData.usr_id,
    };

    /* Persistir en localStorage */
    setUserProfile(profile);
    localStorage.setItem("userProfile", JSON.stringify(profile));
    if (detectedUserId) localStorage.setItem("userId", detectedUserId);
    localStorage.setItem("token", token);

    /* Navegación */
    setLocation("/dashboard");
    setTimeout(() => {
      if (window.location.pathname !== "/dashboard") {
        window.location.href = "/dashboard";
      }
    }, 300);
  };

  /* ──────────────────────────────────────────────────────────── */
  /* logout                                                       */
  /* ──────────────────────────────────────────────────────────── */
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
    <AuthContext.Provider
      value={{ isAuthenticated, userProfile, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* Hook de acceso */
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};