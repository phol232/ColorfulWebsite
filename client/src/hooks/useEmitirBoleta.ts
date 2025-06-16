
import { useState } from "react";
import { emitirBoletaFrontend, emitirBoletaReplicaPostman, type EmitirBoletaPayload, type EmitirBoletaResponse } from "@/lib/api";

export function useEmitirBoleta() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");
  const [processingTime, setProcessingTime] = useState<number>(0);
  const [emitiendo, setEmitiendo] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const emitirBoleta = async (payload: EmitirBoletaPayload): Promise<EmitirBoletaResponse | null> => {
    setLoading(true);
    setError(null);
    setProgress("Iniciando emisión de boleta...");
    setProcessingTime(0);

    const startTime = Date.now();
    let progressInterval: NodeJS.Timeout;

    try {
      // Mostrar progreso cada segundo
      progressInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setProcessingTime(elapsed);
        
        if (elapsed < 5) {
          setProgress("Preparando datos para SUNAT...");
        } else if (elapsed < 15) {
          setProgress("Enviando a ApisPeru...");
        } else if (elapsed < 30) {
          setProgress("Procesando en SUNAT...");
        } else if (elapsed < 60) {
          setProgress("Esperando respuesta de SUNAT...");
        } else if (elapsed < 90) {
          setProgress("Finalizando proceso...");
        } else {
          setProgress("Últimos ajustes...");
        }
      }, 1000);

      const response = await emitirBoletaFrontend(payload);
      
      clearInterval(progressInterval);
      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      setProcessingTime(totalTime);
      
      if (response.success) {
        setProgress(`¡Boleta emitida exitosamente en ${totalTime}s!`);
        console.log("Boleta emitida exitosamente:", response);
        return response;
      } else {
        throw new Error(response.message || "Error al emitir la boleta");
      }
    } catch (err) {
      clearInterval(progressInterval!);
      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      setProcessingTime(totalTime);
      
      let errorMessage = "Error desconocido al emitir la boleta";
      
      if (err instanceof Error) {
        if (err.message.includes("timeout") || err.message.includes("TimeoutError")) {
          errorMessage = `Timeout después de ${totalTime}s. ApisPeru puede estar sobrecargado, intenta nuevamente.`;
        } else if (err.message.includes("Network")) {
          errorMessage = "Error de conexión. Verifica tu internet e intenta nuevamente.";
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      setProgress(`Error después de ${totalTime}s`);
      console.error("Error al emitir boleta:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const testPostmanReplica = async (payload: EmitirBoletaPayload): Promise<EmitirBoletaResponse | null> => {
    setEmitiendo(true);
    setError(null);
    setSuccessMessage("");
    setProgress("Iniciando prueba de réplica de Postman...");
    setProcessingTime(0);

    const startTime = Date.now();
    let progressInterval: NodeJS.Timeout;

    try {
      console.log('🔄 Probando réplica exacta de Postman');
      
      // Mostrar progreso cada segundo
      progressInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setProcessingTime(elapsed);
        
        if (elapsed < 3) {
          setProgress("Preparando datos para prueba de Postman...");
        } else if (elapsed < 10) {
          setProgress("Enviando con headers exactos de Postman...");
        } else if (elapsed < 30) {
          setProgress("Procesando con configuración de Postman...");
        } else if (elapsed < 60) {
          setProgress("Esperando respuesta (replicando Postman)...");
        } else {
          setProgress("Finalizando prueba de Postman...");
        }
      }, 1000);

      const response = await emitirBoletaReplicaPostman(payload);
      
      clearInterval(progressInterval);
      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      setProcessingTime(totalTime);
      
      if (response.success) {
        setProgress(`¡FUNCIONA! Headers de Postman son la clave (${totalTime}s)`);
        setSuccessMessage(`¡Éxito! Procesado en ${totalTime}s replicando Postman`);
        console.log('🎉 ¡FUNCIONA! Headers de Postman son la clave');
        return response;
      } else {
        throw new Error(response.message || "Error en la réplica de Postman");
      }
    } catch (err) {
      clearInterval(progressInterval!);
      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      setProcessingTime(totalTime);
      
      let errorMessage = "Error desconocido en la prueba de Postman";
      
      if (err instanceof Error) {
        if (err.message.includes("timeout") || err.message.includes("TimeoutError")) {
          errorMessage = `Timeout después de ${totalTime}s incluso replicando Postman. ApisPeru puede estar muy sobrecargado.`;
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      setProgress(`❌ Falló incluso con headers de Postman después de ${totalTime}s`);
      console.error('❌ Falló incluso con headers de Postman');
      return null;
    } finally {
      setEmitiendo(false);
    }
  };

  return {
    emitirBoleta,
    testPostmanReplica,
    loading,
    emitiendo,
    error,
    progress,
    processingTime,
    successMessage,
    clearError: () => {
      setError(null);
      setProgress("");
      setProcessingTime(0);
      setSuccessMessage("");
    }
  };
}
