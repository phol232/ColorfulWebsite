// src/hooks/useUserId.ts
import { useAuth } from "@/context/AuthContext";

export function useUserId(): string {
  const { userProfile, isAuthenticated } = useAuth();
  if (!isAuthenticated) return "";

  const userId: string =
    userProfile.userId ||
    userProfile.usr_id ||
    userProfile.sub ||
    userProfile.id ||
    userProfile.user_id ||
    userProfile.google_id ||
    "";

  if (userId) return userId;

  /* Intento 2: localStorage */
  if (typeof window !== "undefined") {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) return storedUserId;

    const profileRaw = localStorage.getItem("userProfile");
    if (profileRaw) {
      try {
        const p = JSON.parse(profileRaw);
        return (
          p.userId ||
          p.usr_id ||
          p.sub ||
          p.id ||
          p.user_id ||
          p.google_id ||
          ""
        );
      } catch (e) {
        console.error("Error al parsear userProfile:", e);
      }
    }
  }

  /* Fallback en desarrollo */
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "⚠️ ID de usuario no disponible. Se usará un ID predeterminado para desarrollo."
    );
    return "72890842";
  }

  return "";
}