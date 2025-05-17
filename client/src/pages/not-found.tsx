
import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

const NotFoundPage: React.FC = () => {
  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">404 - Página no encontrada</h1>
          <p className="text-gray-600 mb-6">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
          <div className="flex flex-col space-y-2">
            <Link href="/dashboard">
              <Button className="w-full bg-orange-500 hover:bg-orange-600">
                Ir al Dashboard
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>
  );
};

export default NotFoundPage;
