import React from "react";
import { Button } from "@/components/ui/button";
import { Bot, MessageCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { API_URL } from "@/config";

interface ChatbotButtonProps {
  onClick: () => void;
}

export const ChatbotButton: React.FC<ChatbotButtonProps> = ({ onClick }) => {
  const { userProfile } = useAuth();

  // Obtener imagen de perfil
  const getProfileImage = () => {
    if (userProfile?.avatar) return userProfile.avatar;
    if (userProfile?.perfil?.usrp_imagen) return `${API_URL}/storage/${userProfile.perfil.usrp_imagen}`;
    return "";
  };

  // Obtener iniciales del usuario
  const getInitials = () => {
    if (userProfile?.perfil?.usrp_nombre) {
      const nombre = userProfile.perfil.usrp_nombre;
      const apellido = userProfile.perfil.usrp_apellido || "";
      return `${nombre[0] || ""}${apellido[0] || ""}`.toUpperCase();
    } else if (userProfile?.name) {
      return userProfile.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "AI";
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      <Button
        onClick={onClick}
        size="lg"
        className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700 p-0 relative overflow-hidden"
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Siempre mostrar el ícono del bot, nunca el avatar del usuario */}
          <div className="relative">
            <Bot className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-200" />
          </div>
          {/* Indicador de estado online */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border border-white"></div>
          {/* Pequeño ícono ML en la esquina inferior */}
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-white rounded-full flex items-center justify-center">
            <Bot className="h-2.5 w-2.5 text-blue-600" />
          </div>
        </div>
        <span className="sr-only">Abrir Asistente ML</span>
      </Button>
      
      {/* Tooltip */}
      <div className="absolute bottom-16 right-0 bg-popover border border-border text-popover-foreground px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-md">
        Asistente ML Inteligente
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-popover"></div>
      </div>
    </div>
  );
};
