// client/src/pages/Categorias/CategoriasPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, Users, Box } from "lucide-react";
import CategoriasProductosPage from "./CategoriasProductosPage";
import CategoriasClientesPage from "./CategoriasClientesPage";
import CategoriasProveedoresPage from "./CategoriasProveedoresPage";
import { API_URL } from "@/config";

const CategoriasPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"productos" | "clientes" | "proveedores">("productos");
  const [countProd, setCountProd] = useState(0);
  const [countCli, setCountCli] = useState(0);
  const [countProv, setCountProv] = useState(0);

  const refreshCounts = useCallback(() => {
    fetch(`${API_URL}/api/categorias`)
      .then(r => r.json())
      .then(d => setCountProd(d.length))
      .catch(() => setCountProd(0));

    fetch(`${API_URL}/api/categorias-clientes`)
      .then(r => r.json())
      .then(d => setCountCli(d.length))
      .catch(() => setCountCli(0));

    fetch(`${API_URL}/api/categorias-proveedores`)
      .then(r => r.json())
      .then(d => setCountProv(d.length))
      .catch(() => setCountProv(0));
  }, []);

  useEffect(() => {
    refreshCounts();
  }, [refreshCounts]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Gestión de Categorías</h1>

        {/* ─── Resumen ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Productos</p>
                <h2 className="text-2xl font-bold">{countProd}</h2>
              </div>
              <ShoppingBag className="h-8 w-8 text-green-500" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Clientes</p>
                <h2 className="text-2xl font-bold">{countCli}</h2>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Proveedores</p>
                <h2 className="text-2xl font-bold">{countProv}</h2>
              </div>
              <Box className="h-8 w-8 text-purple-500" />
            </CardContent>
          </Card>
        </div>

        {/* ─── Navegación Rápida ─── */}
        <nav className="flex border-b mb-6">
          {(["productos","clientes","proveedores"] as const).map(tab => (
            <button
              key={tab}
              className={`px-4 py-2 -mb-px border-b-2 font-medium ${
                activeTab === tab
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab[0].toUpperCase()+tab.slice(1)}
            </button>
          ))}
        </nav>

        {/* ─── Contenido ─── */}
        {activeTab === "productos" && (
          <CategoriasProductosPage onChange={refreshCounts} />
        )}
        {activeTab === "clientes" && (
          <CategoriasClientesPage onChange={refreshCounts} />
        )}
        {activeTab === "proveedores" && (
          <CategoriasProveedoresPage onChange={refreshCounts} />
        )}
      </div>
    </MainLayout>
  );
};

export default CategoriasPage;
