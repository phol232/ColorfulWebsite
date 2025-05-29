// client/src/pages/Categorias/CategoriasProveedoresPage.tsx
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  Pencil,
  Trash2,
  PlusCircle,
  RefreshCcw,
  Briefcase,
} from "lucide-react";
import { API_URL } from "@/config";

interface CategoriaProveedor {
  prov_cat_id: string;
  prov_cat_nombre: string;
  prov_cat_descripcion: string;
  prov_cat_estado: string;
  prov_cat_color: string;
}

interface Props {
  onChange: () => void;
}

const CategoriasProveedoresPage: React.FC<Props> = ({ onChange }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<CategoriaProveedor[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados para CRUD
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CategoriaProveedor | null>(
      null
  );

  // Formularios
  const [form, setForm] = useState({
    prov_cat_nombre: "",
    prov_cat_descripcion: "",
    prov_cat_estado: "Activo",
    prov_cat_color: "",
  });
  const [editForm, setEditForm] = useState({
    prov_cat_id: "",
    prov_cat_nombre: "",
    prov_cat_descripcion: "",
    prov_cat_estado: "Activo",
    prov_cat_color: "",
  });

  // Traer lista
  const fetchItems = () => {
    fetch(`${API_URL}/api/categorias-proveedores`)
        .then((r) => r.json())
        .then((d: CategoriaProveedor[]) => {
          setItems(d);
          onChange?.();
        })
        .catch(console.error);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Filtrado
  const filtered = items.filter(
      (cat) =>
          cat.prov_cat_nombre
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
          cat.prov_cat_descripcion
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
  );

  // Handlers genéricos
  const handleInputChange = (
      e: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
  ) => {
    const { id, value } = e.target;
    setForm((f) => ({ ...f, [id]: value }));
  };
  const handleEditChange = (
      e: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
  ) => {
    const { id, value } = e.target;
    setEditForm((f) => ({ ...f, [id]: value }));
  };

  // Crear
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.append("prov_cat_nombre", form.prov_cat_nombre);
    fd.append("prov_cat_descripcion", form.prov_cat_descripcion);
    fd.append("prov_cat_estado", form.prov_cat_estado);
    fd.append("prov_cat_color", form.prov_cat_color);
    try {
      const res = await fetch(`${API_URL}/api/categorias-proveedores`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: fd,
      });
      if (res.ok) {
        fetchItems();
        onChange?.();
        setIsAddOpen(false);
        setForm({
          prov_cat_nombre: "",
          prov_cat_descripcion: "",
          prov_cat_estado: "Activo",
          prov_cat_color: "",
        });
      } else {
        console.error(await res.json());
        alert("Error al crear categoría");
      }
    } catch (err) {
      console.error(err);
      showError(err, "Error de red al crear categoría");
    } finally {
      setLoading(false);
    }
  };

  // Preparar edición
  const handleEditClick = (cat: CategoriaProveedor) => {
    setEditForm(cat);
    setIsEditOpen(true);
  };

  // Enviar edición
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.append("prov_cat_nombre", editForm.prov_cat_nombre);
    fd.append("prov_cat_descripcion", editForm.prov_cat_descripcion);
    fd.append("prov_cat_estado", editForm.prov_cat_estado);
    fd.append("prov_cat_color", editForm.prov_cat_color);
    try {
      const res = await fetch(
          `${API_URL}/api/categorias-proveedores/${editForm.prov_cat_id}`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "X-HTTP-Method-Override": "PUT",
            },
            body: fd,
          }
      );
      if (res.ok) {
        fetchItems();
        setIsEditOpen(false);
      } else {
        console.error(await res.json());
        alert("Error al editar categoría");
      }
    } catch (err) {
      console.error(err);
      showError(err, "Error de red al editar categoría");
    } finally {
      setLoading(false);
    }
  };

  // Eliminar
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      const res = await fetch(
          `${API_URL}/api/categorias-proveedores/${deleteTarget.prov_cat_id}`,
          { method: "DELETE" }
      );
      if (res.ok) {
        fetchItems();
        onChange?.();
        setDeleteTarget(null);
      } else {
        console.error(await res.json());
        alert("Error al eliminar categoría");
      }
    } catch (err) {
      console.error(err);
      showError(err, "Error de red al eliminar categoría");
    } finally {
      setLoading(false);
    }
  };

  return (
      <>
        {/* Buscador y acciones */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
                type="text"
                placeholder="Buscar categoría de proveedores..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              <RefreshCcw className="h-4 w-4" /> Limpiar
            </Button>
            <Button onClick={() => setIsAddOpen(true)}>
              <PlusCircle className="h-4 w-4" /> Nueva Categoría
            </Button>
          </div>
        </div>

        {/* Lista */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((cat) => (
              <Card key={cat.prov_cat_id} className="overflow-hidden hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex justify-between mb-2">
                    <Badge variant="outline" className={cat.prov_cat_color}>
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
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => handleEditClick(cat)}
                    >
                      <Pencil className="h-4 w-4 mr-1" /> Editar
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                        onClick={() => setDeleteTarget(cat)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
          ))}
        </div>

        {/* Dialog Crear */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nueva Categoría de Proveedores</DialogTitle>
              <DialogDescription>
                Complete los campos para crear una nueva categoría
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="prov_cat_nombre" className="text-sm font-medium">
                  Nombre
                </label>
                <Input
                    id="prov_cat_nombre"
                    value={form.prov_cat_nombre}
                    onChange={handleInputChange}
                    required
                />
              </div>
              <div className="grid gap-2">
                <label
                    htmlFor="prov_cat_descripcion"
                    className="text-sm font-medium"
                >
                  Descripción
                </label>
                <textarea
                    id="prov_cat_descripcion"
                    rows={3}
                    value={form.prov_cat_descripcion}
                    onChange={handleInputChange}
                    className="px-3 py-2 border rounded-md w-full text-sm"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="prov_cat_estado" className="text-sm font-medium">
                  Estado
                </label>
                <select
                    id="prov_cat_estado"
                    value={form.prov_cat_estado}
                    onChange={handleInputChange}
                    className="px-3 py-2 border rounded-md"
                    required
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="prov_cat_color" className="text-sm font-medium">
                  Color
                </label>
                <select
                    id="prov_cat_color"
                    value={form.prov_cat_color}
                    onChange={handleInputChange}
                    className="px-3 py-2 border rounded-md"
                    required
                >
                  <option value="">Selecciona un color</option>
                  <option value="bg-blue-100 text-blue-800 border-blue-400">Azul</option>
                  <option value="bg-green-100 text-green-800 border-green-400">Verde</option>
                  <option value="bg-red-100 text-red-800 border-red-400">Rojo</option>
                  <option value="bg-yellow-100 text-yellow-800 border-yellow-400">Amarillo</option>
                  <option value="bg-purple-100 text-purple-800 border-purple-400">Púrpura</option>
                  <option value="bg-pink-100 text-pink-800 border-pink-400">Rosa</option>
                  <option value="bg-orange-100 text-orange-800 border-orange-400">Naranja</option>
                  <option value="bg-amber-100 text-amber-800 border-amber-400">Ámbar</option>
                  <option value="bg-teal-100 text-teal-800 border-teal-400">Verde Azulado</option>
                  <option value="bg-gray-100 text-gray-800 border-gray-400">Gris</option>
                  {/* …más opciones según tu paleta */}
                </select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Guardando..." : "Guardar Categoría"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog Editar */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Categoría de Proveedores</DialogTitle>
              <DialogDescription>
                Modifica los campos y guarda los cambios
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="prov_cat_nombre" className="text-sm font-medium">
                  Nombre
                </label>
                <Input
                    id="prov_cat_nombre"
                    value={editForm.prov_cat_nombre}
                    onChange={handleEditChange}
                    required
                />
              </div>
              <div className="grid gap-2">
                <label
                    htmlFor="prov_cat_descripcion"
                    className="text-sm font-medium"
                >
                  Descripción
                </label>
                <textarea
                    id="prov_cat_descripcion"
                    rows={3}
                    value={editForm.prov_cat_descripcion}
                    onChange={handleEditChange}
                    className="px-3 py-2 border rounded-md w-full text-sm"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="prov_cat_estado" className="text-sm font-medium">
                  Estado
                </label>
                <select
                    id="prov_cat_estado"
                    value={editForm.prov_cat_estado}
                    onChange={handleEditChange}
                    className="px-3 py-2 border rounded-md"
                    required
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="prov_cat_color" className="text-sm font-medium">
                  Color
                </label>
                <select
                    id="prov_cat_color"
                    value={editForm.prov_cat_color}
                    onChange={handleEditChange}
                    className="px-3 py-2 border rounded-md"
                    required
                >
                  <option value="">Selecciona un color</option>
                  <option value="bg-blue-100 text-blue-800 border-blue-400">Azul</option>
                  <option value="bg-green-100 text-green-800 border-green-400">Verde</option>
                  <option value="bg-red-100 text-red-800 border-red-400">Rojo</option>
                  <option value="bg-yellow-100 text-yellow-800 border-yellow-400">Amarillo</option>
                  <option value="bg-purple-100 text-purple-800 border-purple-400">Púrpura</option>
                  <option value="bg-pink-100 text-pink-800 border-pink-400">Rosa</option>
                  <option value="bg-orange-100 text-orange-800 border-orange-400">Naranja</option>
                  <option value="bg-amber-100 text-amber-800 border-amber-400">Ámbar</option>
                  <option value="bg-teal-100 text-teal-800 border-teal-400">Verde Azulado</option>
                  <option value="bg-gray-100 text-gray-800 border-gray-400">Gris</option>
                </select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog Eliminar */}
        <Dialog
            open={!!deleteTarget}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Eliminar Categoría</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de eliminar "
                {deleteTarget?.prov_cat_nombre}"? Esta acción no se puede
                deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancelar
              </Button>
              <Button
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  disabled={loading}
              >
                {loading ? "Eliminando..." : "Eliminar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
  );
};

export default CategoriasProveedoresPage;