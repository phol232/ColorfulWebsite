import React from "react";
import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "./pages/LoginPage";
import GoogleCallback from "./pages/GoogleCallback";
import DashboardPage from "./pages/DashboardPage";
import InventoryPage from "./pages/Inventory/InventoryPage";
import SuppliersPage from "./pages/SuppliersPage";
import CustomersPage from "./pages/CustomersPage";
import ReportsPage from "./pages/ReportsPage";
import POSPage from "./pages/POSPage";
import OrdersPage from "./pages/OrdersPage";
import SalesPage from "./pages/SalesPage";
import InvoicesPage from "./pages/InvoicesPage";
import CategoriesPage from "./pages/Categorias/CategoriesPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/not-found";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext"; // Importa el CartProvider
import { Toaster } from "./components/ui/toaster";
import { queryClient } from "./lib/queryClient";

const App: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <CartProvider> {/* Añade el CartProvider aquí */}
                    <Switch>
                        <Route path="/" component={HomePage} />
                        <Route path="/login" component={LoginPage} />
                        <Route path="/register" component={RegisterPage} />
                        <Route path="/auth/google/callback" component={GoogleCallback} />

                        {/* Rutas principales */}
                        <Route path="/dashboard" component={DashboardPage} />

                        {/* Rutas de inventario - La ruta base también renderiza InventoryPage */}
                        <Route path="/inventory" component={InventoryPage} />
                        <Route path="/inventory/productos" component={InventoryPage} />
                        <Route path="/inventory/movimientos" component={InventoryPage} />
                        <Route path="/inventory/alertas" component={InventoryPage} />

                        <Route path="/suppliers" component={SuppliersPage} />
                        <Route path="/customers" component={CustomersPage} />
                        <Route path="/reports" component={ReportsPage} />

                        {/* POS y ventas */}
                        <Route path="/pos" component={POSPage} />
                        <Route path="/orders" component={OrdersPage} />
                        <Route path="/sales" component={SalesPage} />
                        <Route path="/invoices" component={InvoicesPage} />

                        {/* Categorías */}
                        <Route path="/categories" component={CategoriesPage} />
                        <Route path="/categories/productos" component={CategoriesPage} />
                        <Route path="/categories/clientes" component={CategoriesPage} />
                        <Route path="/categories/proveedores" component={CategoriesPage} />

                        {/* Ruta de 404 para cualquier otra ruta no coincidente */}
                        <Route path="/:rest*" component={NotFoundPage} />
                    </Switch>
                </CartProvider>
                <Toaster />
            </AuthProvider>
        </QueryClientProvider>
    );
};

export default App;