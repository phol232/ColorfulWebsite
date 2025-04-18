// client/src/pages/Categorias/CategoriasProveedoresPage.tsx
import React, { useState } from "react";
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

interface Props {
  onChange?: () => void;
}

const mock: CategoriaProveedor[] = [
  {
    prov_cat_id: "PROV-001",
    prov_cat_nombre: "Distribuidores",
    prov_cat_descripcion: "…",
    prov_cat_estado: "Activo",
    prov_color: "bg-green-100 text-green-800 border-green-400",
  },
  {
    prov_cat_id: "PROV-002",
    prov_cat_nombre: "Mayoristas",
    prov_cat_descripcion: "…",
    prov_cat_estado: "Inactivo",
    prov_color: "bg-red-100 text-red-800 border-red-400",
  },
];

const CategoriasProveedoresPage: React.FC<Props> = ({ onChange }) => {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<CategoriaProveedor[]>(mock);

  const filtered = items.filter(cat =>
    cat.prov_cat_nombre.toLowerCase().includes(search.toLowerCase()) ||
    cat.prov_cat_descripcion.toLowerCase().includes(search.toLowerCase())
  );

  const handleMockChange = () => {
    // ejemplo de CRUD simulado
    setItems(prev => prev.slice(1));
    onChange?.();
  };

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            className="pl-9 border rounded-md py-2 w-full"
            placeholder="Buscar categoría de proveedores..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSearch("")}>
            <RefreshCcw className="h-4 w-4" /> Limpiar
          </Button>
          <Button onClick={handleMockChange}>
            <PlusCircle className="h-4 w-4" /> Nueva Categoría
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(cat => (
          <Card key={cat.prov_cat_id} className="hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex justify-between mb-2">
                <Badge variant="outline" className={cat.prov_color}>
                  {cat.prov_cat_nombre}
                </Badge>
                <span className="text-xs text-gray-500">
                  {cat.prov_cat_estado}
                </span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                {cat.prov_cat_descripcion}
              </p>
              <div className="mt-4 flex justify-between">
                <Button variant="ghost" size="sm" onClick={() => alert("Editar (demo)")}>
                  <Pencil className="h-4 w-4 mr-1" /> Editar
                </Button>
                <Button variant="ghost" size="sm" onClick={handleMockChange}>
                  <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default CategoriasProveedoresPage;
