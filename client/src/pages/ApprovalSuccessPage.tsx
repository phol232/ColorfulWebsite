
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ExternalLink, Home } from "lucide-react";

const ApprovalSuccessPage: React.FC = () => {
  const [location] = useLocation();
  const [message, setMessage] = useState<string>('');
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    // Extraer parámetros de la URL si vienen del backend
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const msg = urlParams.get('message');

    if (status === 'true') {
      setIsApproved(true);
      setMessage(msg || 'Acceso aprobado correctamente');
    } else {
      setMessage(msg || 'Error en la aprobación');
    }
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="w-full max-w-md p-6">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              {isApproved ? '¡Acceso Aprobado!' : 'Estado de Aprobación'}
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              {message}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {isApproved ? (
              <div className="text-center space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-green-800 mb-1">
                        Tu cuenta ha sido aprobada
                      </p>
                      <p className="text-green-700">
                        Ya puedes iniciar sesión en el sistema usando tu cuenta de Google o las credenciales registradas.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Link href="/login">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ir al Login
                    </Button>
                  </Link>
                  
                  <Link href="/">
                    <Button variant="outline" className="w-full">
                      <Home className="h-4 w-4 mr-2" />
                      Página Principal
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    Hubo un problema con la aprobación o esta solicitud ya fue procesada.
                  </p>
                </div>
                
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Volver al Login
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApprovalSuccessPage;
