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
  Package,
  Pencil,
  Trash2,
  PlusCircle,
  RefreshCcw,
  ShoppingBag,
} from "lucide-react";

const API_URL = "https://3909-190-236-32-145.ngrok-free.app"; 

interface CategoriaProducto {
  cat_id: string;
  cat_nombre: string;
  cat_descripcion: string;
  cat_color: string;
  cat_imagen?: string;
  productos?: number;
  creado?: string;
}

const CategoriesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false);
  const [categoriasProductos, setCategoriasProductos] = useState<CategoriaProducto[]>([]);
  const [form, setForm] = useState({
    cat_nombre: "",
    cat_descripcion: "",
    cat_color: "",
    imagen: null as File | null,
  });
  const [editForm, setEditForm] = useState({
    cat_id: "",
    cat_nombre: "",
    cat_descripcion: "",
    cat_color: "",
    imagen: null as File | null,
    cat_imagen: "",
  });
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<null | CategoriaProducto>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Cargar categorías desde API
  const fetchCategorias = () => {
    fetch(`${API_URL}/api/categorias`)
      .then((res) => res.json())
      .then((data) => setCategoriasProductos(data));
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  // Filtrar por búsqueda
  const filteredCategories = categoriasProductos.filter(
    (cat) =>
      cat.cat_nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat.cat_descripcion && cat.cat_descripcion.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Formatear fecha
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  };

  // Manejadores de inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm((prev) => ({ ...prev, imagen: e.target.files![0] }));
    }
  };

  // --------- EDITAR ------------
  const handleEditClick = (categoria: CategoriaProducto) => {
    setEditForm({
      cat_id: categoria.cat_id,
      cat_nombre: categoria.cat_nombre,
      cat_descripcion: categoria.cat_descripcion,
      cat_color: categoria.cat_color,
      imagen: null,
      cat_imagen: categoria.cat_imagen || "",
    });
    setIsEditCategoryDialogOpen(true);
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setEditForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditForm((prev) => ({ ...prev, imagen: e.target.files![0] }));
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("cat_nombre", editForm.cat_nombre);
    formData.append("cat_descripcion", editForm.cat_descripcion);
    formData.append("cat_color", editForm.cat_color);
    if (editForm.imagen) formData.append("imagen", editForm.imagen);

    const res = await fetch(`${API_URL}/api/categorias/${editForm.cat_id}`, {
      method: "POST", 
      body: formData,
      headers: {
        "X-HTTP-Method-Override": "PUT",
      },
    });

    if (res.ok) {
      fetchCategorias();
      setIsEditCategoryDialogOpen(false);
      setEditForm({
        cat_id: "",
        cat_nombre: "",
        cat_descripcion: "",
        cat_color: "",
        imagen: null,
        cat_imagen: "",
      });
    } else {
      alert("Error al editar categoría");
    }
    setLoading(false);
  };

  // Guardar nueva categoría
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("cat_nombre", form.cat_nombre);
    formData.append("cat_descripcion", form.cat_descripcion);
    formData.append("cat_color", form.cat_color);
    if (form.imagen) formData.append("imagen", form.imagen);

    const res = await fetch(`${API_URL}/api/categorias`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      fetchCategorias();
      setIsAddCategoryDialogOpen(false);
      setForm({ cat_nombre: "", cat_descripcion: "", cat_color: "", imagen: null });
    } else {
      alert("Error al crear categoría");
    }
    setLoading(false);
  };

  // ------- ELIMINAR ---------
  const handleDeleteClick = (categoria: CategoriaProducto) => {
    setDeleteTarget(categoria);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const res = await fetch(`${API_URL}/api/categorias/${deleteTarget.cat_id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      fetchCategorias();
      setDeleteTarget(null);
    } else {
      alert("Error al eliminar categoría");
    }
    setDeleteLoading(false);
  };

  const handleDeleteCancel = () => {
    setDeleteTarget(null);
  };

  // Render detalle de categoría (productos)
  const renderCategoryDetailContent = (category: CategoriaProducto) => (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-500">{category.productos ?? 0} productos</span>
      </div>
      <Badge variant="outline" className={category.cat_color}>
        Activa
      </Badge>
    </div>
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Gestión de Categorías</h1>
          <p className="text-gray-500">
            Administra las categorías para productos
          </p>
        </div>
        {/* Tarjeta resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Categorías de Productos</p>
                  <h3 className="text-3xl font-bold mt-1">{categoriasProductos.length}</h3>
                  <p className="text-sm text-green-600 mt-1">Productos organizados</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Buscador y acciones */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar categoría de productos..."
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
              onClick={() => setIsAddCategoryDialogOpen(true)}
            >
              <PlusCircle className="h-4 w-4" />
              <span>Nueva Categoría</span>
            </Button>
          </div>
        </div>
        {/* Lista de categorías */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(filteredCategories as CategoriaProducto[]).map((categoria) => (
            <Card key={categoria.cat_id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                {/* Imagen pequeña, centrada arriba */}
                {categoria.cat_imagen && (
                  <div className="w-full flex justify-center items-center pt-4">
                    <img
                      src={API_URL + categoria.cat_imagen}
                      alt={categoria.cat_nombre}
                      width={48}
                      height={48}
                      style={{
                        width: "48px",
                        height: "48px",
                        objectFit: "cover",
                        borderRadius: "0.5rem",
                        border: "1px solid #eee",
                        background: "#fafafa"
                      }}
                      onError={e => { (e.target as HTMLImageElement).src = "/img/default-category.png"; }}
                    />
                  </div>
                )}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className={categoria.cat_color}>
                      {categoria.cat_nombre}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatDate(categoria.creado)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {categoria.cat_descripcion}
                  </p>
                </div>
                <div className="p-4">{renderCategoryDetailContent(categoria)}</div>
                <div className="p-3 bg-gray-50 border-t flex justify-between">
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
        {/* Dialog para crear nueva categoría */}
        <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nueva Categoría de Productos</DialogTitle>
              <DialogDescription>
                Complete los campos para crear una nueva categoría
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={handleSubmit}
              className="space-y-4 py-4"
              encType="multipart/form-data"
            >
              <div className="grid gap-2">
                <label htmlFor="cat_nombre" className="text-sm font-medium">
                  Nombre de la Categoría
                </label>
                <Input
                  id="cat_nombre"
                  value={form.cat_nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="cat_descripcion" className="text-sm font-medium">
                  Descripción
                </label>
                <textarea
                  id="cat_descripcion"
                  rows={3}
                  value={form.cat_descripcion}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full text-sm"
                ></textarea>
              </div>
              <div className="grid gap-2">
                <label htmlFor="cat_color" className="text-sm font-medium">
                  Color
                </label>
                <select
                  id="cat_color"
                  value={form.cat_color}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-md"
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
                </select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="imagen" className="text-sm font-medium">
                  Imagen
                </label>
                <Input
                  id="imagen"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsAddCategoryDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Guardando..." : "Guardar Categoría"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        {/* Dialog para editar categoría */}
        <Dialog open={isEditCategoryDialogOpen} onOpenChange={setIsEditCategoryDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Categoría de Productos</DialogTitle>
              <DialogDescription>
                Modifica los campos y guarda los cambios
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={handleEditSubmit}
              className="space-y-4 py-4"
              encType="multipart/form-data"
            >
              <div className="grid gap-2">
                <label htmlFor="edit_cat_nombre" className="text-sm font-medium">
                  Nombre de la Categoría
                </label>
                <Input
                  id="cat_nombre"
                  value={editForm.cat_nombre}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit_cat_descripcion" className="text-sm font-medium">
                  Descripción
                </label>
                <textarea
                  id="cat_descripcion"
                  rows={3}
                  value={editForm.cat_descripcion}
                  onChange={handleEditInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full text-sm"
                ></textarea>
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit_cat_color" className="text-sm font-medium">
                  Color
                </label>
                <select
                  id="cat_color"
                  value={editForm.cat_color}
                  onChange={handleEditInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-md"
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
                </select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit_imagen" className="text-sm font-medium">
                  Imagen
                </label>
                {editForm.cat_imagen && (
                  <div className="mb-2">
                    <img
                      src={API_URL + editForm.cat_imagen}
                      alt="Imagen actual"
                      width={48}
                      height={48}
                      style={{
                        width: "48px",
                        height: "48px",
                        objectFit: "cover",
                        borderRadius: "0.5rem",
                        border: "1px solid #eee",
                        background: "#fafafa"
                      }}
                      onError={e => { (e.target as HTMLImageElement).src = "/img/default-category.png"; }}
                    />
                    <span className="block text-xs text-gray-500">Imagen actual</span>
                  </div>
                )}
                <Input
                  id="imagen"
                  type="file"
                  accept="image/*"
                  onChange={handleEditFileChange}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsEditCategoryDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        {/* Dialog para eliminar categoría */}
        <Dialog open={!!deleteTarget} onOpenChange={handleDeleteCancel}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Eliminar Categoría</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar la categoría "{deleteTarget?.cat_nombre}"? Esta acción no se puede deshacer.
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
      </div>
    </MainLayout>
  );
};

export default CategoriesPage;