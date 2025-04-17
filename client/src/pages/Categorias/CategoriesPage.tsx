import React, { useState } from "react";
import CategoriasProductosPage from "./CategoriasProductosPage";
import CategoriasClientesPage from "./CategoriasClientesPage";
import CategoriasProveedoresPage from "./CategoriasProveedoresPage";

const CategoriasPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"productos" | "clientes" | "proveedores">("productos");

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab("productos")}>Productos</button>
        <button onClick={() => setActiveTab("clientes")}>Clientes</button>
        <button onClick={() => setActiveTab("proveedores")}>Proveedores</button>
      </div>
      {activeTab === "productos" && <CategoriasProductosPage />}
      {activeTab === "clientes" && <CategoriasClientesPage />}
      {activeTab === "proveedores" && <CategoriasProveedoresPage />}
    </div>
  );
};

export default CategoriasPage;