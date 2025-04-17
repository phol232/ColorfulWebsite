import React, { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, PlusCircle, RefreshCcw, Briefcase } from "lucide-react";

interface CategoriaProveedor {
  prov_cat_id: string;
  prov_cat_nombre: string;
  prov_cat_descripcion: string;
  prov_cat_estado: string;
  prov_color: string;
}

const mockCategorias: CategoriaProveedor[] = [
  {
    prov_cat_id: "PROV-001",
    prov_cat_nombre: "Distribuidores",
    prov_cat_descripcion: "Proveedores que distribuyen productos a nivel nacional.",
    prov_cat_estado: "Activo",
    prov_color: "bg-green-100 text-green-800 border-green-400"
  },
  {
    prov_cat_id: "PROV-002",
    prov_cat_nombre: "Mayoristas",
    prov_cat_descripcion: "Proveedores mayoristas de productos.",
    prov_cat_estado: "Inactivo",
    prov_color: "bg-red-100 text-red-800 border-red-400"
  },
];

const CategoriasProveedoresPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categorias, setCategorias] = useState<CategoriaProveedor[]>(mockCategorias);

  // Filtrar por búsqueda
  const filteredCategories = categorias.filter(
    (cat) =>
      cat.prov_cat_nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat.prov_cat_descripcion && cat.prov_cat_descripcion.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Gestión de Categorías de Proveedores</h1>
          <p className="text-gray-500">
            Administra las categorías para proveedores
          </p>
        </div>
        {/* Tarjeta resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Categorías de Proveedores</p>
                  <h3 className="text-3xl font-bold mt-1">{categorias.length}</h3>
                  <p className="text-sm text-green-600 mt-1">Proveedores organizados</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Buscador y acciones */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar categoría de proveedores..."
              className="pl-9 border rounded-md py-2 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setSearchQuery("")}
            >
              <RefreshCcw className="h-4 w-4" />
              <span>Limpiar</span>
            </Button>
            <Button
              className="flex items-center gap-2"
              onClick={() => alert("Agregar nueva categoría (demo)")}
            >
              <PlusCircle className="h-4 w-4" />
              <span>Nueva Categoría</span>
            </Button>
          </div>
        </div>
        {/* Lista de categorías */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(filteredCategories as CategoriaProveedor[]).map((categoria) => (
            <Card key={categoria.prov_cat_id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className={categoria.prov_color}>
                    {categoria.prov_cat_nombre}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {categoria.prov_cat_estado}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {categoria.prov_cat_descripcion}
                </p>
                <div className="mt-4 flex justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => alert("Editar categoría (demo)")}
                  >
                    <Pencil className="h-4 w-4 mr-1" /> Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-800"
                    onClick={() => alert("Eliminar categoría (demo)")}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default CategoriasProveedoresPage;