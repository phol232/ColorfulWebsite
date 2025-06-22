
import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, Mail, RefreshCw } from "lucide-react";

const PendingApprovalPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [isFromGoogle, setIsFromGoogle] = useState(false);

  useEffect(() => {
    // Obtener información de la sesión
    const pendingEmail = sessionStorage.getItem('pending_email');
    const googlePending = sessionStorage.getItem('pending_approval_google');
    
    if (pendingEmail) {
      setEmail(pendingEmail);
    }
    
    if (googlePending) {
      setIsFromGoogle(true);
    }
    
    // Limpiar después de obtener los datos
    sessionStorage.removeItem('pending_email');
    sessionStorage.removeItem('pending_approval_google');
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="w-full max-w-md p-6">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Aprobación Pendiente
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Tu solicitud está siendo revisada
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>
                  {email || "Tu solicitud"} está pendiente de aprobación
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">
                    {isFromGoogle ? "Solicitud de acceso enviada" : "Registro completado"}
                  </span>
                </div>
                
                <div className="flex items-center space-x-3 text-sm">
                  <div className="h-5 w-5 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin flex-shrink-0"></div>
                  <span className="text-gray-700">
                    Esperando aprobación del administrador
                  </span>
                </div>
                
                <div className="flex items-center space-x-3 text-sm text-gray-500">
                  <div className="h-5 w-5 border-2 border-gray-200 rounded-full flex-shrink-0"></div>
                  <span>Acceso al sistema habilitado</span>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-blue-800 mb-1">
                    ¿Qué pasa ahora?
                  </p>
                  <p className="text-blue-700">
                    Hemos enviado tu solicitud al administrador. 
                    Recibirás un correo cuando tu cuenta sea aprobada y puedas acceder al sistema.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={handleRefresh}
                variant="outline" 
                className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Verificar Estado
              </Button>
              
              <Link href="/login">
                <Button variant="ghost" className="w-full text-gray-600 hover:text-gray-800">
                  Volver al Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PendingApprovalPage;
