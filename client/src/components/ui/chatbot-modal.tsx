import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { API_URL } from "@/config";

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
}

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Estado global para mantener el historial de conversación
let globalMessages: ChatMessage[] = [
  {
    id: '1',
    type: 'bot',
    message: '¡Hola! Soy tu asistente de ML inteligente. Puedo ayudarte con predicciones de ventas, análisis de productos y reportes empresariales. ¿En qué te puedo ayudar?',
    timestamp: new Date()
  }
];

export const ChatbotModal: React.FC<ChatbotModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(globalMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const { userProfile } = useAuth();

  // Función para hacer scroll automático al final
  const scrollToBottom = () => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
    } else if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Efecto para hacer scroll automático cuando cambian los mensajes
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  // Efecto para sincronizar con el estado global
  useEffect(() => {
    globalMessages = messages;
  }, [messages]);

  // Función para limpiar el historial
  const clearHistory = () => {
    const initialMessage = {
      id: '1',
      type: 'bot' as const,
      message: '¡Hola! Soy tu asistente de ML inteligente. Puedo ayudarte con predicciones de ventas, análisis de productos y reportes empresariales. ¿En qué te puedo ayudar?',
      timestamp: new Date()
    };
    setMessages([initialMessage]);
    globalMessages = [initialMessage];
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:6020/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: inputMessage
        })
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        message: data.respuesta_del_agente || data.respuesta_final || 'Lo siento, no pude procesar tu solicitud.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        message: 'Lo siento, hubo un error al conectar con el sistema ML. Por favor, verifica que el servidor esté ejecutándose en el puerto 6020.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Función para obtener la imagen de perfil
  const getProfileImage = () => {
    if (userProfile?.perfil?.usrp_imagen) {
      return `${API_URL}/storage/${userProfile.perfil.usrp_imagen}`;
    }
    if (userProfile?.avatar) return userProfile.avatar;
    return "";
  };

  // Función para obtener iniciales
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-600" />
              Asistente ML Inteligente
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="text-gray-500 hover:text-red-500"
              title="Limpiar historial"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col gap-4">
          <div 
            ref={scrollViewportRef}
            className="flex-1 border rounded-lg p-4 bg-gray-50 overflow-y-auto"
            style={{ maxHeight: '400px' }}
          >
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.type === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  {message.type === 'user' ? (
                    <Avatar className="w-8 h-8 border-2 border-white/20">
                      <AvatarImage src={getProfileImage()} alt="Tu foto de perfil" />
                      <AvatarFallback className="bg-blue-600 text-white text-xs">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 text-gray-600">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  
                  <div className={`flex-1 max-w-[80%] ${
                    message.type === 'user' ? 'text-right' : ''
                  }`}>
                    <div className={`inline-block p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border shadow-sm'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block p-3 rounded-lg bg-white border shadow-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-500">Procesando...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Elemento invisible para hacer scroll automático */}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje aquí..."
                disabled={isLoading}
                className="flex-1"
                autoFocus
              />
              <Button 
                onClick={sendMessage} 
                disabled={isLoading || !inputMessage.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-xs text-gray-500 text-center">
              Ejemplos: "¿Cuánto venderé mañana?", "¿Qué productos necesitan stock?", "Cliente top"
            </div>
            
            <div className="text-xs text-gray-400 text-center">
              {messages.length > 1 && `${messages.length - 1} mensajes en el historial`}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
