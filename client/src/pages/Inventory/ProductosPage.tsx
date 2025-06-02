import React, { useState, FC } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import {
    Search as SearchIcon,
    PlusCircle,
    Pencil,
    Trash2,
    Download,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { API_URL } from "@/config";
import { useNotifications } from "@/hooks/useNotifications";

interface Categoria { cat_id: string; cat_nombre: string; }
interface Proveedor { prov_id: string; prov_nombre: string; }
interface Detalle {
    prod_descripcion?: string;
    prod_precio_compra: number;
    prod_stock_minimo: number;
    prod_stock_maximo?: number;
    prod_fecha_caducidad?: string;
    prod_imagen?: string;
}
interface Producto {
    pro_id: string;
    pro_nombre: string;
    pro_precio_venta: number;
    pro_stock: number;
    pro_estado: string;
    cat_id: string;
    categoria: Categoria;
    proveedores: Proveedor[];
    detalles: Detalle;
}

interface ProductosPageProps {
    onChange?: () => void;
}

const ProductosPage: FC<ProductosPageProps> = ({ onChange }) => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useNotifications();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selected, setSelected] = useState<Producto | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [editPreview, setEditPreview] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [stockFilter, setStockFilter] = useState<"all"|"low"|"medium"|"high">("all");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null);

    const { data: productos = [], isLoading: loadingProds, isError: prodError } =
        useQuery<Producto[], Error>({
            queryKey: ["productos"],
            queryFn: () => axios.get<Producto[]>("/api/productos").then(r => r.data),
        });

    const { data: formData } =
        useQuery<{ categoriasProductos: Categoria[]; proveedores: Proveedor[] }, Error>({
            queryKey: ["productos", "formData"],
            queryFn: () =>
                axios.get<{ categoriasProductos: Categoria[]; proveedores: Proveedor[] }>(
                    "/api/productos/create"
                ).then(r => r.data),
            staleTime: 300_000,
        });

    const createProducto = useMutation<Producto, any, FormData>({
        mutationFn: fd => axios.post<Producto>("/api/productos", fd).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productos"] });
            setPreview(null);
            if (onChange) onChange();
            showSuccess("Producto creado correctamente");
        },
        onError: (error) => {
            showError(error, "No se pudo crear el producto");
        },
    });

    const updateProducto = useMutation<Producto, any, { id: string; fd: FormData }>(
        {
            mutationFn: ({ id, fd }) => {
                fd.append("_method", "PUT");
                return axios.post<Producto>(`/api/productos/${id}`, fd).then(r => r.data);
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["productos"] });
                setEditPreview(null);
                if (onChange) onChange();
                showSuccess("Producto actualizado correctamente");
            },
            onError: (error) => {
                showError(error, "No se pudo actualizar el producto");
            },
        }
    );

    const deleteProducto = useMutation<void, Error, string>({
        mutationFn: id => axios.delete(`/api/productos/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productos"] });
            if (onChange) onChange();
            showSuccess("Producto eliminado correctamente");
        },
        onError: (error) => {
            showError(error, "No se pudo eliminar el producto");
        },
    });

    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        createProducto.mutate(fd);
        setIsCreateOpen(false);
    };

    const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        updateProducto.mutate({ id: selected!.pro_id, fd });
        setIsEditOpen(false);
    };

    const filtered = productos
        .filter(p =>
            p.pro_nombre.toLowerCase().includes(search.toLowerCase()) ||
            p.pro_id.toLowerCase().includes(search.toLowerCase()) ||
            (p.detalles.prod_descripcion || "")
                .toLowerCase().includes(search.toLowerCase())
        )
        .filter(p => {
            if (stockFilter === "low") return p.pro_stock < 4;
            if (stockFilter === "medium") return p.pro_stock >= 4 && p.pro_stock <= 8;
            if (stockFilter === "high") return p.pro_stock >= 9;
            return true;
        });

    const exportCsv = () => {
        const headers = ["ID","Nombre","PrecioVenta","Stock","Categoría","Proveedor"];
        const rows = filtered.map(p => [
            p.pro_id,
            p.pro_nombre,
            p.pro_precio_venta,
            p.pro_stock,
            p.categoria.cat_nombre,
            p.proveedores[0]?.prov_nombre || ""
        ]);
        const csv = [headers, ...rows]
            .map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(","))
            .join("\r\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "productos.csv"; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            {/* Búsqueda + filtros + export + Nuevo */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                        className="pl-9"
                        placeholder="Buscar nombre, ID o descripción…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={stockFilter} onValueChange={v => setStockFilter(v as any)}>
                        <SelectTrigger className="h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los stocks</SelectItem>
                            <SelectItem value="low">Bajo</SelectItem>
                            <SelectItem value="medium">Medio</SelectItem>
                            <SelectItem value="high">Alto</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={exportCsv}
                    >
                        <Download className="h-4 w-4" />
                        <span>Exportar</span>
                    </Button>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="flex items-center gap-1">
                                <PlusCircle className="h-4 w-4" />
                                <span>Nuevo</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl w-full">
                            <DialogHeader>
                                <DialogTitle>Crear Producto</DialogTitle>
                                <DialogDescription>
                                    Completa los datos del producto
                                </DialogDescription>
                            </DialogHeader>
                            <form
                                onSubmit={handleCreate}
                                encType="multipart/form-data"
                                className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4"
                            >
                                {/* Izquierda */}
                                <div className="space-y-4">
                                    <div>
                                        <Label>Nombre *</Label>
                                        <Input name="pro_nombre" required />
                                    </div>
                                    <div>
                                        <Label>Categoría *</Label>
                                        <Select name="cat_id" required>
                                            <SelectTrigger><SelectValue placeholder="Seleccionar categoría"/></SelectTrigger>
                                            <SelectContent>
                                                {formData?.categoriasProductos.map(c => (
                                                    <SelectItem key={c.cat_id} value={c.cat_id}>
                                                        {c.cat_nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Descripción</Label>
                                        <textarea
                                            name="descripcion"
                                            rows={4}
                                            className="w-full px-3 py-2 border rounded"
                                            placeholder="Descripción detallada"
                                        />
                                    </div>
                                    <div>
                                        <Label>Estado *</Label>
                                        <Select name="pro_estado" defaultValue="Activo" required>
                                            <SelectTrigger><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Activo">Activo</SelectItem>
                                                <SelectItem value="Inactivo">Inactivo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                {/* Derecha */}
                                <div className="space-y-4">
                                    <div className="flex space-x-4">
                                        <div className="flex-1">
                                            <Label>Precio Costo *</Label>
                                            <Input name="precio_costo" type="number" step="0.01" defaultValue="0.00" required/>
                                        </div>
                                        <div className="flex-1">
                                            <Label>Precio Venta *</Label>
                                            <Input name="pro_precio_venta" type="number" step="0.01" defaultValue="0.00" required/>
                                        </div>
                                    </div>
                                    <div className="flex space-x-4">
                                        <div className="flex-1">
                                            <Label>Stock Inicial *</Label>
                                            <Input name="stock_inicial" type="number" defaultValue="0" required/>
                                        </div>
                                        <div className="flex-1">
                                            <Label>Stock Mínimo *</Label>
                                            <Input name="stock_minimo" type="number" defaultValue="0" required/>
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Proveedor</Label>
                                        <Select name="prov_id">
                                            <SelectTrigger><SelectValue placeholder="Seleccionar proveedor"/></SelectTrigger>
                                            <SelectContent>
                                                {formData?.proveedores.map(p => (
                                                    <SelectItem key={p.prov_id} value={p.prov_id}>
                                                        {p.prov_nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Imagen del Producto</Label>
                                        <div className="relative border border-dashed rounded h-32 flex items-center justify-center text-gray-500">
                                            <Input
                                                name="prod_imagen"
                                                type="file"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                onChange={e => {
                                                    const f = e.currentTarget.files?.[0];
                                                    setPreview(f ? URL.createObjectURL(f) : null);
                                                }}
                                            />
                                            <span>Click o arrastra una imagen</span>
                                        </div>
                                        {preview && (
                                            <img
                                                src={preview}
                                                alt="preview"
                                                className="mt-2 w-20 h-20 object-cover rounded"
                                            />
                                        )}
                                    </div>
                                </div>
                                <DialogFooter className="col-span-2 flex justify-end space-x-2">
                                    <DialogClose asChild>
                                        <Button variant="outline">Cancelar</Button>
                                    </DialogClose>
                                    <Button type="submit">Crear Producto</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Grid de productos */}
            {loadingProds ? (
                <p>Cargando productos…</p>
            ) : prodError ? (
                <p className="text-red-600">Error al cargar productos.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                    {filtered.map(prod => (
                        <Card key={prod.pro_id}>
                            <CardHeader>
                                <CardTitle>{prod.pro_nombre}</CardTitle>
                                <CardDescription>
                                    {prod.categoria.cat_nombre} • {prod.proveedores[0]?.prov_nombre}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {prod.detalles.prod_imagen && (
                                    <img
                                        src={prod.detalles.prod_imagen}
                                        alt={prod.pro_nombre}
                                        width={80}
                                        height={80}
                                        className="object-cover rounded mb-2"
                                    />
                                )}
                                <p className="text-green-600 font-bold">
                                    {formatCurrency(prod.pro_precio_venta)}
                                </p>
                                <p>Stock: {prod.pro_stock}</p>
                                <div className="flex gap-2 mt-3">
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            setSelected(prod);
                                            setEditPreview(prod.detalles.prod_imagen ?? null);
                                            setIsEditOpen(true);
                                        }}
                                    >
                                        <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => {
                                            setProductoAEliminar(prod);
                                            setDeleteDialogOpen(true);
                                        }}
                                    >
                                        <Trash2 />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Editar Producto */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-4xl w-full">
                    <DialogHeader>
                        <DialogTitle>Editar Producto</DialogTitle>
                    </DialogHeader>
                    {selected && (
                        <form
                            onSubmit={handleEdit}
                            encType="multipart/form-data"
                            className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4"
                        >
                            {/* Izquierda */}
                            <div className="space-y-4">
                                <div>
                                    <Label>Nombre *</Label>
                                    <Input name="pro_nombre" defaultValue={selected.pro_nombre} required />
                                </div>
                                <div>
                                    <Label>Categoría *</Label>
                                    <Select name="cat_id" defaultValue={selected.cat_id} required>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            {formData?.categoriasProductos.map(c => (
                                                <SelectItem key={c.cat_id} value={c.cat_id}>
                                                    {c.cat_nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Descripción</Label>
                                    <textarea
                                        name="descripcion"
                                        rows={4}
                                        className="w-full px-3 py-2 border rounded"
                                        defaultValue={selected.detalles.prod_descripcion || ""}
                                    />
                                </div>
                                <div>
                                    <Label>Estado *</Label>
                                    <Select name="pro_estado" defaultValue={selected.pro_estado} required>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Activo">Activo</SelectItem>
                                            <SelectItem value="Inactivo">Inactivo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            {/* Derecha */}
                            <div className="space-y-4">
                                <div className="flex space-x-4">
                                    <div className="flex-1">
                                        <Label>Precio Costo *</Label>
                                        <Input
                                            name="precio_costo"
                                            type="number"
                                            step="0.01"
                                            defaultValue={selected.detalles.prod_precio_compra}
                                            required
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <Label>Precio Venta *</Label>
                                        <Input
                                            name="pro_precio_venta"
                                            type="number"
                                            step="0.01"
                                            defaultValue={selected.pro_precio_venta}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex space-x-4">
                                    <div className="flex-1">
                                        <Label>Stock Inicial *</Label>
                                        <Input
                                            name="stock_inicial"
                                            type="number"
                                            defaultValue={selected.pro_stock}
                                            required
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <Label>Stock Mínimo *</Label>
                                        <Input
                                            name="stock_minimo"
                                            type="number"
                                            defaultValue={selected.detalles.prod_stock_minimo}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>Proveedor</Label>
                                    <Select name="prov_id" defaultValue={selected.proveedores[0]?.prov_id}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            {formData?.proveedores.map(p => (
                                                <SelectItem key={p.prov_id} value={p.prov_id}>
                                                    {p.prov_nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Imagen del Producto</Label>
                                    <div className="relative border border-dashed rounded h-32 flex items-center justify-center text-gray-500">
                                        <Input
                                            name="prod_imagen"
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={e => {
                                                const f = e.currentTarget.files?.[0];
                                                setEditPreview(f ? URL.createObjectURL(f) : null);
                                            }}
                                        />
                                        <span>Click o arrastra una imagen</span>
                                    </div>
                                    {editPreview && (
                                        <img
                                            src={editPreview}
                                            alt="preview"
                                            className="mt-2 w-20 h-20 object-cover rounded"
                                        />
                                    )}
                                </div>
                            </div>
                            <DialogFooter className="col-span-2 flex justify-end space-x-2">
                                <DialogClose asChild>
                                    <Button variant="outline">Cancelar</Button>
                                </DialogClose>
                                <Button type="submit">Guardar Cambios</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Modal de confirmación de eliminación */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Eliminar producto?</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar el producto{' '}
                            <span className="font-semibold">{productoAEliminar?.pro_nombre}</span>? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (productoAEliminar) {
                                    deleteProducto.mutate(productoAEliminar.pro_id);
                                }
                                setDeleteDialogOpen(false);
                                setProductoAEliminar(null);
                            }}
                        >
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ProductosPage;
