// src/pages/SuppliersPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  RefreshCcw,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Building,
  XCircle,
} from "lucide-react";
import { API_URL } from "@/config";
import { useNotifications } from "@/hooks/useNotifications";

interface Categoria {
  prov_cat_id: string;
  prov_cat_nombre: string;
}

interface Proveedor {
  prov_id: string;
  prov_nombre: string;
  prov_contacto?: string;
  prov_email?: string;
  prov_telefono?: string;
  prov_direccion?: string;
  prov_rfc?: string;
  prov_notas?: string;
  prov_sitio_web?: string;
  prov_estado: string;
  categorias?: Categoria[];
}

const defaultForm = {
  prov_nombre: "",
  prov_contacto: "",
  prov_telefono: "",
  prov_email: "",
  prov_direccion: "",
  prov_rfc: "",
  prov_notas: "",
  prov_sitio_web: "",
  prov_estado: "Activo",
  categoria: "",
};

const SuppliersPage: React.FC = () => {
  const { showSuccess, showError } = useNotifications();
  const [suppliers, setSuppliers] = useState<Proveedor[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentTab, setCurrentTab] = useState<"todos" | "inactivos">("todos");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newDialog, setNewDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [form, setForm] = useState<any>({ ...defaultForm });
  const [editingId, setEditingId] = useState<string>("");



  const fetchAll = useCallback(async () => {
    const [r1, r2] = await Promise.all([
      fetch(`${API_URL}/api/proveedores`, {
        headers: { Accept: "application/json" },
        credentials: "include",
      }),
      fetch(`${API_URL}/api/categorias-proveedores`, {
        headers: { Accept: "application/json" },
        credentials: "include",
      }),
    ]);
    if (r1.ok && r2.ok) {
      const provs: Proveedor[] = await r1.json();
      setSuppliers(provs.map(p => ({ ...p, categorias: p.categorias || [] })));
      setCategories(await r2.json());
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filtered = suppliers.filter(p => {
    if (
        searchQuery &&
        !p.prov_nombre.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(p.prov_contacto || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) &&
        !(p.prov_email || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    ) return false;
    if (
        categoryFilter &&
        !(p.categorias || []).some(c => c.prov_cat_nombre === categoryFilter)
    ) return false;
    if (currentTab === "inactivos" && p.prov_estado === "Activo") return false;
    return true;
  });

  const handleCreate = async () => {
    const payload = { ...form, categorias: form.categoria ? [form.categoria] : [] };
    const res = await fetch(`${API_URL}/api/proveedores`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setNewDialog(false);
      setForm({ ...defaultForm });
      showSuccess("Proveedor creado correctamente");
      fetchAll();
    } else {
      const errorData = await res.json();
      showError(errorData.message || "Error desconocido", "No se pudo crear el proveedor");
    }
  };

  const openEdit = (p: Proveedor) => {
    setEditingId(p.prov_id);
    setForm({
      prov_nombre: p.prov_nombre || "",
      prov_contacto: p.prov_contacto || "",
      prov_telefono: p.prov_telefono || "",
      prov_email: p.prov_email || "",
      prov_direccion: p.prov_direccion || "",
      prov_rfc: p.prov_rfc || "",
      prov_notas: p.prov_notas || "",
      prov_sitio_web: p.prov_sitio_web || "",
      prov_estado: p.prov_estado,
      categoria: p.categorias?.[0]?.prov_cat_nombre || "",
    });
    setEditDialog(true);
  };

  const handleEdit = async () => {
    const payload = { ...form, categorias: form.categoria ? [form.categoria] : [] };
    const res = await fetch(`${API_URL}/api/proveedores/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setEditDialog(false);
      showSuccess("Proveedor actualizado correctamente");
      fetchAll();
    } else {
      const errorData = await res.json();
      showError(errorData.message || "Error desconocido", "No se pudo actualizar el proveedor");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar proveedor?")) return;
    const res = await fetch(`${API_URL}/api/proveedores/${id}`, {
      method: "DELETE",
      headers: { Accept: "application/json" },
      credentials: "include",
    });
    if (res.ok) {
      showSuccess("Proveedor eliminado correctamente");
      fetchAll();
    } else {
      const errorData = await res.json();
      showError(errorData.message || "Error desconocido", "No se pudo eliminar el proveedor");
    }
  };

  return (
      <MainLayout>
        <div className="relative container mx-auto px-4 py-6">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">PROVEEDORES</h1>
              <p className="text-sm text-gray-500">Administra tus proveedores</p>
            </div>
            <Dialog
                open={newDialog}
                onOpenChange={open => {
                  if (open) setForm({ ...defaultForm });
                  setNewDialog(open);
                }}
            >
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white">
                  <PlusCircle /> Nuevo Proveedor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl grid grid-cols-2 gap-6">
                <DialogHeader className="col-span-2">
                  <DialogTitle>Crear Proveedor</DialogTitle>
                  <DialogDescription>
                    Completa los datos del proveedor
                  </DialogDescription>
                </DialogHeader>

                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="prov_nombre" className="block text-sm font-medium">
                      Nombre *
                    </label>
                    <Input
                        id="prov_nombre"
                        value={form.prov_nombre}
                        onChange={e => setForm({ ...form, prov_nombre: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="prov_contacto" className="block text-sm font-medium">
                      Contacto
                    </label>
                    <Input
                        id="prov_contacto"
                        value={form.prov_contacto}
                        onChange={e => setForm({ ...form, prov_contacto: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="prov_email" className="block text-sm font-medium">
                      Email
                    </label>
                    <Input
                        id="prov_email"
                        type="email"
                        value={form.prov_email}
                        onChange={e => setForm({ ...form, prov_email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="prov_telefono" className="block text-sm font-medium">
                      Teléfono
                    </label>
                    <Input
                        id="prov_telefono"
                        value={form.prov_telefono}
                        onChange={e => setForm({ ...form, prov_telefono: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="prov_direccion" className="block text-sm font-medium">
                      Dirección
                    </label>
                    <Input
                        id="prov_direccion"
                        value={form.prov_direccion}
                        onChange={e => setForm({ ...form, prov_direccion: e.target.value })}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="categoria" className="block text-sm font-medium">
                      Categoría
                    </label>
                    <select
                        id="categoria"
                        className="w-full border rounded p-2"
                        value={form.categoria}
                        onChange={e => setForm({ ...form, categoria: e.target.value })}
                    >
                      <option value="">Seleccionar categoría</option>
                      {categories.map(c => (
                          <option key={c.prov_cat_id} value={c.prov_cat_nombre}>
                            {c.prov_cat_nombre}
                          </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="prov_estado" className="block text-sm font-medium">
                      Estado *
                    </label>
                    <select
                        id="prov_estado"
                        className="w-full border rounded p-2"
                        value={form.prov_estado}
                        onChange={e => setForm({ ...form, prov_estado: e.target.value })}
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="prov_rfc" className="block text-sm font-medium">
                      RFC
                    </label>
                    <Input
                        id="prov_rfc"
                        value={form.prov_rfc}
                        onChange={e => setForm({ ...form, prov_rfc: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="prov_sitio_web" className="block text-sm font-medium">
                      Sitio web
                    </label>
                    <Input
                        id="prov_sitio_web"
                        value={form.prov_sitio_web}
                        onChange={e => setForm({ ...form, prov_sitio_web: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="prov_notas" className="block text-sm font-medium">
                      Notas
                    </label>
                    <Input
                        id="prov_notas"
                        value={form.prov_notas}
                        onChange={e => setForm({ ...form, prov_notas: e.target.value })}
                    />
                  </div>
                </div>

                <div className="col-span-2 flex justify-end">
                  <Button onClick={handleCreate}>Crear Proveedor</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="inactivos">Inactivos</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5" />
                <Input
                    className="pl-10"
                    placeholder="Buscar por nombre, contacto o email..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                  className="px-3 py-2 border rounded"
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {categories.map(c => (
                    <option key={c.prov_cat_id} value={c.prov_cat_nombre}>
                      {c.prov_cat_nombre}
                    </option>
                ))}
              </select>
              <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("");
                    setCurrentTab("todos");
                  }}
              >
                <RefreshCcw /> Limpiar
              </Button>
            </div>
          </div>

          {/* Supplier Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(p => (
                <Card key={p.prov_id} className="hover:shadow-lg transition">
                  <CardHeader className="flex justify-between items-center">
                    <CardTitle>{p.prov_nombre}</CardTitle>
                    <Badge variant="outline">{p.prov_estado}</Badge>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2 text-blue-600">
                      <Mail className="h-4 w-4" /> {p.prov_email}
                    </div>
                    <div className="flex items-center gap-2 mb-2 text-green-600">
                      <Phone className="h-4 w-4" /> {p.prov_telefono}
                    </div>
                    <div className="flex items-center gap-2 mb-4 text-purple-600">
                      <Building className="h-4 w-4" /> {p.prov_direccion}
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center">
                      <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                              setExpandedId(expandedId === p.prov_id ? null : p.prov_id)
                          }
                      >
                        {expandedId === p.prov_id ? (
                            <><ChevronUp /> Ocultar</>
                        ) : (
                            <><ChevronDown /> Detalles</>
                        )}
                      </Button>
                      <div className="flex gap-2">
                        <Button
                            className="bg-blue-500 hover:bg-blue-600 text-white text-sm"
                            onClick={() => openEdit(p)}
                        >
                          Editar
                        </Button>
                        <Button
                            className="bg-red-500 hover:bg-red-600 text-white text-sm"
                            onClick={() => handleDelete(p.prov_id)}
                        >
                          <XCircle className="inline h-4 w-4 mr-1" />Eliminar
                        </Button>
                      </div>
                    </div>
                    {expandedId === p.prov_id && (
                        <div className="mt-4 space-y-1">
                          <strong>Categorías:</strong>{" "}
                          {(p.categorias || [])
                              .map(c => c.prov_cat_nombre)
                              .join(", ")}
                        </div>
                    )}
                  </CardContent>
                </Card>
            ))}
          </div>

          {/* Edit Dialog */}
          <Dialog open={editDialog} onOpenChange={setEditDialog}>
            <DialogContent className="max-w-2xl grid grid-cols-2 gap-6">
              <DialogHeader className="col-span-2">
                <DialogTitle>Editar Proveedor</DialogTitle>
                <DialogDescription>
                  Modifica los datos del proveedor
                </DialogDescription>
              </DialogHeader>

              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit_prov_nombre" className="block text-sm font-medium">
                    Nombre *
                  </label>
                  <Input
                      id="edit_prov_nombre"
                      value={form.prov_nombre}
                      onChange={e => setForm({ ...form, prov_nombre: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="edit_prov_contacto" className="block text-sm font-medium">
                    Contacto
                  </label>
                  <Input
                      id="edit_prov_contacto"
                      value={form.prov_contacto}
                      onChange={e => setForm({ ...form, prov_contacto: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="edit_prov_email" className="block text-sm font-medium">
                    Email
                  </label>
                  <Input
                      id="edit_prov_email"
                      type="email"
                      value={form.prov_email}
                      onChange={e => setForm({ ...form, prov_email: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="edit_prov_telefono" className="block text-sm font-medium">
                    Teléfono
                  </label>
                  <Input
                      id="edit_prov_telefono"
                      value={form.prov_telefono}
                      onChange={e => setForm({ ...form, prov_telefono: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="edit_prov_direccion" className="block text-sm font-medium">
                    Dirección
                  </label>
                  <Input
                      id="edit_prov_direccion"
                      value={form.prov_direccion}
                      onChange={e => setForm({ ...form, prov_direccion: e.target.value })}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit_categoria" className="block text-sm font-medium">
                    Categoría
                  </label>
                  <select
                      id="edit_categoria"
                      className="w-full border rounded p-2"
                      value={form.categoria}
                      onChange={e => setForm({ ...form, categoria: e.target.value })}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(c => (
                        <option key={c.prov_cat_id} value={c.prov_cat_nombre}>
                          {c.prov_cat_nombre}
                        </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="edit_prov_estado" className="block text-sm font-medium">
                    Estado *
                  </label>
                  <select
                      id="edit_prov_estado"
                      className="w-full border rounded p-2"
                      value={form.prov_estado}
                      onChange={e => setForm({ ...form, prov_estado: e.target.value })}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="edit_prov_rfc" className="block text-sm font-medium">
                    RFC
                  </label>
                  <Input
                      id="edit_prov_rfc"
                      value={form.prov_rfc}
                      onChange={e => setForm({ ...form, prov_rfc: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="edit_prov_sitio_web" className="block text-sm font-medium">
                    Sitio web
                  </label>
                  <Input
                      id="edit_prov_sitio_web"
                      value={form.prov_sitio_web}
                      onChange={e => setForm({ ...form, prov_sitio_web: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="edit_prov_notas" className="block text-sm font-medium">
                    Notas
                  </label>
                  <Input
                      id="edit_prov_notas"
                      value={form.prov_notas}
                      onChange={e => setForm({ ...form, prov_notas: e.target.value })}
                  />
                </div>
              </div>

              <div className="col-span-2 flex justify-end">
                <Button onClick={handleEdit}>Guardar Cambios</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </MainLayout>
  );
};

export default SuppliersPage;
