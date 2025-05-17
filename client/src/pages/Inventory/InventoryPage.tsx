// client/src/pages/InventoryPage.tsx
import React, { useState, FC } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/layouts/MainLayout.tsx";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs.tsx";
import { API_URL } from "@/config.ts";
import ProductosPage from "../Inventory/ProductosPage";
import MovimientosPage from "../Inventory/MovimientosPage";
import AlertasPage from "../Inventory/AlertasPage";

axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;
axios.defaults.headers.common["Accept"] = "application/json";

const InventoryPage: FC = () => {
  const [activeTab, setActiveTab] = useState<"products" | "movements" | "alerts">("products");

  return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-2">Gestión de Inventario</h1>
          <p className="text-gray-600 mb-6">Administra productos, movimientos y alertas del inventario</p>

          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)} className="mb-6">
            <TabsList>
              <TabsTrigger value="products">Productos</TabsTrigger>
              <TabsTrigger value="movements">Movimientos</TabsTrigger>
              <TabsTrigger value="alerts">Alertas</TabsTrigger>
            </TabsList>

            {/* — Productos — */}
            <TabsContent value="products" className="space-y-6">
              <ProductosPage />
            </TabsContent>

            {/* — Movimientos — */}
            <TabsContent value="movements" className="space-y-6">
              <MovimientosPage />
            </TabsContent>

            {/* — Alertas — */}
            <TabsContent value="alerts" className="space-y-6">
              <AlertasPage />
            </TabsContent>

          </Tabs>
        </div>
      </MainLayout>
  );
};

export default InventoryPage;