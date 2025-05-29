
import { useToast } from "@/hooks/use-toast";

export const useNotifications = () => {
    const { toast } = useToast();

    const showSuccess = (message: string = "Operación realizada correctamente") => {
        toast({
            title: "✅ Correcto",
            description: message,
            variant: "default",
        });
    };

    const showError = (error: any, defaultMessage: string = "Ocurrió un error") => {
        let errorMessage = defaultMessage;

        // Extraer mensaje de error del backend
        if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error?.response?.data?.error) {
            errorMessage = error.response.data.error;
        } else if (error?.message) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }

        toast({
            title: "❌ Error",
            description: errorMessage,
            variant: "destructive",
        });
    };

    const showInfo = (message: string) => {
        toast({
            title: "ℹ️ Información",
            description: message,
            variant: "default",
        });
    };

    const showWarning = (message: string) => {
        toast({
            title: "⚠️ Advertencia",
            description: message,
            variant: "default",
        });
    };

    return {
        showSuccess,
        showError,
        showInfo,
        showWarning,
    };
};
