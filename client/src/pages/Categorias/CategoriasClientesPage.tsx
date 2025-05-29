// client/src/pages/Categorias/CategoriasClientesPage.tsx
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
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
  Users,
} from "lucide-react";
import { API_URL } from "@/config";
import { useNotifications } from "@/hooks/useNotifications";

interface CategoriaCliente {
  cli_cat_id: string;
  cli_cat_nombre: string;
  cli_cat_descripcion: string;
  cli_cat_estado: string;
  cli_color: string;
}

interface Props {
  onChange: () => void;
}

const CategoriasClientesPage: React.FC<Props> = ({ onChange }) => {
  const { showSuccess, showError } = useNotifications();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [categoriasClientes, setCategoriasClientes] = useState<CategoriaCliente[]>([]);
  const [form, setForm] = useState({
    cli_cat_nombre: "",
    cli_cat_descripcion: "",
    cli_cat_estado: "Activo",
    cli_color: "",
  });
  const [editForm, setEditForm] = useState({
    cli_cat_id: "",
    cli_cat_nombre: "",
    cli_cat_descripcion: "",
    cli_cat_estado: "Activo",
    cli_color: "",
  });
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<null | CategoriaCliente>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const fetchCategoriasClientes = () => {
    console.log("Solicitando categorías...");
    fetch(`${API_URL}/api/categorias-clientes`)
        .then((res) => {
          console.log("Status respuesta:", res.status);
          return res.json();
        })
        .then((data) => {
          console.log("Datos recibidos:", data.length, "categorías");
          setCategoriasClientes(data);
        })
        .catch((err) => {
          console.error("Error al cargar categorías:", err);
        });
  };

  useEffect(() => {
    fetchCategoriasClientes();
  }, []);

  // Filtrar por búsqueda
  const filteredCategories = categoriasClientes.filter(
      (cat) =>
          cat.cli_cat_nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (cat.cli_cat_descripcion &&
              cat.cli_cat_descripcion.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  // --------- EDITAR ------------
  const handleEditClick = (categoria: CategoriaCliente) => {
    setEditForm({
      cli_cat_id: categoria.cli_cat_id,
      cli_cat_nombre: categoria.cli_cat_nombre,
      cli_cat_descripcion: categoria.cli_cat_descripcion || "",
      cli_cat_estado: categoria.cli_cat_estado || "Activo",
      cli_color: categoria.cli_color || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleEditInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setEditForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("cli_cat_nombre", editForm.cli_cat_nombre);
    formData.append("cli_cat_descripcion", editForm.cli_cat_descripcion);
    formData.append("cli_cat_estado", editForm.cli_cat_estado);
    formData.append("cli_color", editForm.cli_color);

    console.log("Enviando edición...");
    try {
      const res = await fetch(
          `${API_URL}/api/categorias-clientes/${editForm.cli_cat_id}`,
          {
            method: "POST",
            headers: {
              "X-HTTP-Method-Override": "PUT",
              Accept: "application/json",
            },
            body: formData,
          }
      );
      console.log("Status respuesta:", res.status);

      if (res.ok) {
        fetchCategoriasClientes();
        setIsEditDialogOpen(false);
        setEditForm({
          cli_cat_id: "",
          cli_cat_nombre: "",
          cli_cat_descripcion: "",
          cli_cat_estado: "Activo",
          cli_color: "",
        });
        showSuccess("Categoría de cliente actualizada correctamente");
      } else {
        const errorData = await res.json();
        console.error("Error en respuesta:", errorData);
        showError(errorData.message || res.statusText, "No se pudo editar la categoría de cliente");
      }
    } catch (error) {
      console.error("Error al enviar la petición:", error);
      showError(error, "Error al editar categoría de cliente");
    } finally {
      setLoading(false);
    }
  };

  // Guardar nueva categoría
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("cli_cat_nombre", form.cli_cat_nombre);
    formData.append("cli_cat_descripcion", form.cli_cat_descripcion);
    formData.append("cli_cat_estado", form.cli_cat_estado);
    formData.append("cli_color", form.cli_color);

    console.log("Enviando nueva categoría...");
    try {
      const res = await fetch(`${API_URL}/api/categorias-clientes`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });
      console.log("Status respuesta:", res.status);

      if (res.ok) {
        fetchCategoriasClientes();
        onChange?.();
        setIsAddDialogOpen(false);
        setForm({
          cli_cat_nombre: "",
          cli_cat_descripcion: "",
          cli_cat_estado: "Activo",
          cli_color: "",
        });
        showSuccess("Categoría de cliente creada correctamente");
      } else {
        const errorData = await res.json();
        console.error("Error en respuesta:", errorData);
        showError(errorData.message || res.statusText, "No se pudo crear la categoría de cliente");
      }
    } catch (error) {
      console.error("Error al enviar la petición:", error);
      showError(error, "Error al crear categoría de cliente");
    } finally {
      setLoading(false);
    }
  };

  // ------- ELIMINAR ---------
  const handleDeleteClick = (categoria: CategoriaCliente) => {
    setDeleteTarget(categoria);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);

    console.log("Eliminando categoría...");
    try {
      const res = await fetch(
          `${API_URL}/api/categorias-clientes/${deleteTarget.cli_cat_id}`,
          { method: "DELETE" }
      );
      console.log("Status respuesta:", res.status);

      if (res.ok) {
        fetchCategoriasClientes();
        onChange?.();
        setDeleteTarget(null);
        showSuccess("Categoría de cliente eliminada correctamente");
      } else {
        const errorData = await res.json();
        console.error("Error en respuesta:", errorData);
        showError(errorData.message || res.statusText, "No se pudo eliminar la categoría de cliente");
      }
    } catch (error) {
      console.error("Error al enviar la petición:", error);
      showError(error, "Error al eliminar categoría de cliente");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteTarget(null);
  };

  return (
      <>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
                type="text"
                placeholder="Buscar categoría de clientes..."
                className="pl-9"
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
                onClick={() => setIsAddDialogOpen(true)}
            >
              <PlusCircle className="h-4 w-4" />
              <span>Nueva Categoría</span>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCategories.map((categoria) => (
              <Card
                  key={categoria.cli_cat_id}
                  className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className={categoria.cli_color}>
                      {categoria.cli_cat_nombre}
                    </Badge>
                    <span className="text-xs text-gray-500">
                    {categoria.cli_cat_estado}
                  </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {categoria.cli_cat_descripcion}
                  </p>
                  <div className="mt-4 flex justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => handleEditClick(categoria)}
                    >
                      <Pencil className="h-4 w-4 mr-1" /> Editar
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDeleteClick(categoria)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
          ))}
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nueva Categoría de Clientes</DialogTitle>
              <DialogDescription>
                Complete los campos para crear una nueva categoría de clientes
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid gap-2">
                <label
                    htmlFor="cli_cat_nombre"
                    className="text-sm font-medium"
                >
                  Nombre de la Categoría
                </label>
                <Input
                    id="cli_cat_nombre"
                    value={form.cli_cat_nombre}
                    onChange={handleInputChange}
                    required
                />
              </div>
              <div className="grid gap-2">
                <label
                    htmlFor="cli_cat_descripcion"
                    className="text-sm font-medium"
                >
                  Descripción
                </label>
                <textarea
                    id="cli_cat_descripcion"
                    rows={3}
                    value={form.cli_cat_descripcion}
                    onChange={handleInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-md w-full text-sm"
                />
              </div>
              <div className="grid gap-2">
                <label
                    htmlFor="cli_cat_estado"
                    className="text-sm font-medium"
                >
                  Estado
                </label>
                <select
                    id="cli_cat_estado"
                    value={form.cli_cat_estado}
                    onChange={handleInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                    required
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="cli_color" className="text-sm font-medium">
                  Color
                </label>
                <select
                    id="cli_color"
                    value={form.cli_color}
                    onChange={handleInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                    required
                >
                  <option value="">Selecciona un color</option>
                  <option value="bg-blue-100 text-blue-800 border-blue-400">
                    Azul
                  </option>
                  <option value="bg-green-100 text-green-800 border-green-400">
                    Verde
                  </option>
                  <option value="bg-red-100 text-red-800 border-red-400">
                    Rojo
                  </option>
                  <option value="bg-yellow-100 text-yellow-800 border-yellow-400">
                    Amarillo
                  </option>
                  <option value="bg-purple-100 text-purple-800 border-purple-400">
                    Púrpura
                  </option>
                  <option value="bg-pink-100 text-pink-800 border-pink-400">
                    Rosa
                  </option>
                  <option value="bg-orange-100 text-orange-800 border-orange-400">
                    Naranja
                  </option>
                  <option value="bg-amber-100 text-amber-800 border-amber-400">
                    Ámbar
                  </option>
                </select>
              </div>
              <DialogFooter>
                <Button
                    variant="outline"
                    type="button"
                    onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Guardando..." : "Guardar Categoría"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Categoría de Clientes</DialogTitle>
              <DialogDescription>
                Modifica los campos y guarda los cambios
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
              <div className="grid gap-2">
                <label
                    htmlFor="cli_cat_nombre"
                    className="text-sm font-medium"
                >
                  Nombre de la Categoría
                </label>
                <Input
                    id="cli_cat_nombre"
                    value={editForm.cli_cat_nombre}
                    onChange={handleEditInputChange}
                    required
                />
              </div>
              <div className="grid gap-2">
                <label
                    htmlFor="cli_cat_descripcion"
                    className="text-sm font-medium"
                >
                  Descripción
                </label>
                <textarea
                    id="cli_cat_descripcion"
                    rows={3}
                    value={editForm.cli_cat_descripcion}
                    onChange={handleEditInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-md w-full text-sm"
                />
              </div>
              <div className="grid gap-2">
                <label
                    htmlFor="cli_cat_estado"
                    className="text-sm font-medium"
                >
                  Estado
                </label>
                <select
                    id="cli_cat_estado"
                    value={editForm.cli_cat_estado}
                    onChange={handleEditInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                    required
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="cli_color" className="text-sm font-medium">
                  Color
                </label>
                <select
                    id="cli_color"
                    value={editForm.cli_color}
                    onChange={handleEditInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                    required
                >
                  <option value="">Selecciona un color</option>
                  <option value="bg-blue-100 text-blue-800 border-blue-400">
                    Azul
                  </option>
                  <option value="bg-green-100 text-green-800 border-green-400">
                    Verde
                  </option>
                  <option value="bg-red-100 text-red-800 border-red-400">
                    Rojo
                  </option>
                  <option value="bg-yellow-100 text-yellow-800 border-yellow-400">
                    Amarillo
                  </option>
                  <option value="bg-purple-100 text-purple-800 border-purple-400">
                    Púrpura
                  </option>
                  <option value="bg-pink-100 text-pink-800 border-pink-400">
                    Rosa
                  </option>
                  <option value="bg-orange-100 text-orange-800 border-orange-400">
                    Naranja
                  </option>
                  <option value="bg-amber-100 text-amber-800 border-amber-400">
                    Ámbar
                  </option>
                </select>
              </div>
              <DialogFooter>
                <Button
                    variant="outline"
                    type="button"
                    onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={!!deleteTarget} onOpenChange={(isOpen) => !isOpen && handleDeleteCancel()}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Eliminar Categoría de Cliente</DialogTitle>
              <DialogDescription>
                {deleteTarget ? (
                    <>
                      ¿Estás seguro de que deseas eliminar la categoría "
                      {deleteTarget.cli_cat_nombre}"? Esta acción no se puede deshacer.
                    </>
                ) : (
                    "No se ha seleccionado ninguna categoría para eliminar."
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleDeleteCancel}>
                Cancelar
              </Button>
              <Button
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
              >
                {deleteLoading ? "Eliminando..." : "Eliminar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
  );
};
export default CategoriasClientesPage;
