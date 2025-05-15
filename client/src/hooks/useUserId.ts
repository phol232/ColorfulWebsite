import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

/**
 * Custom hook to reliably get the user ID from various sources
 * Handles different ID formats and provides a development fallback
 */
export function useUserId(): string {
    const { userProfile, isAuthenticated } = useAuth();
    const [userId, setUserId] = useState<string>("");

    useEffect(() => {
        // Try to get user ID from different sources
        let id = "";

        // Try to get from userProfile first - with more fields for Google auth
        if (userProfile) {
            id = userProfile.userId ||
                userProfile.user_id ||
                userProfile.sub ||
                userProfile.id ||
                userProfile.google_id ||
                userProfile.user_id ||
                "";
        }

        // If no ID found and we're authenticated, try localStorage
        if (!id && isAuthenticated && typeof window !== "undefined") {
            const localStorageId = localStorage.getItem("userId");
            if (localStorageId) {
                id = localStorageId;
            } else {
                // Try to parse userProfile from localStorage as a fallback
                try {
                    const profileStr = localStorage.getItem("userProfile");
                    if (profileStr) {
                        const profile = JSON.parse(profileStr);
                        id = profile.userId ||
                            profile.user_id ||
                            profile.sub ||
                            profile.id ||
                            profile.google_id ||
                            profile.usr_id ||
                            "";

                        // Si encontramos ID en localStorage, asegurémonos de guardarlo
                        if (id) {
                            localStorage.setItem("userId", id);
                            console.log("ID guardado desde localStorage:", id);
                        }
                    }
                } catch (error) {
                    console.error("Error parsing userProfile from localStorage:", error);
                }
            }
        }

        // Si aún no hay ID pero estamos autenticados, intentar buscar en session storage (para Google auth)
        if (!id && isAuthenticated && typeof window !== "undefined") {
            try {
                const sessionProfileStr = sessionStorage.getItem("userProfile");
                if (sessionProfileStr) {
                    const profile = JSON.parse(sessionProfileStr);
                    id = profile.userId ||
                        profile.user_id ||
                        profile.sub ||
                        profile.id ||
                        profile.google_id ||
                        profile.usr_id ||
                        "";

                    // Si encontramos ID en sessionStorage, guardarlo en localStorage para futura referencia
                    if (id) {
                        localStorage.setItem("userId", id);
                        console.log("ID guardado desde sessionStorage:", id);
                    }
                }
            } catch (error) {
                console.error("Error parsing userProfile from sessionStorage:", error);
            }
        }

        // Development fallback - only use if no other ID found
        if (!id) {
            if (process.env.NODE_ENV === "development") {
                console.warn("⚠️ ID de usuario no disponible. Se usará un ID predeterminado para desarrollo.",
                    new Error("Component Stack"));
                id = "72890843"; // Consistent development fallback ID
            }
        }

        setUserId(id);

        // Si tenemos un ID válido pero no está en localStorage, guardarlo
        if (id && id !== "72890843" && typeof window !== "undefined") {
            localStorage.setItem("userId", id);
        }
    }, [userProfile, isAuthenticated]);

    return userId;
}

export default useUserId;