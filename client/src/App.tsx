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
import { CartProvider } from "./context/CartContext";
import { Toaster } from "./components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import PaymentMethodsPage from "./pages/PaymentMethodsPage";
import BoletasPage from "./pages/BoletasPage";
import SettingsPage from "./pages/SettingsPage";

const App: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <CartProvider>
                    <Switch>
                        <Route path="/" component={HomePage} />
                        <Route path="/login" component={LoginPage} />
                        <Route path="/register" component={RegisterPage} />
                        <Route path="/auth/google/callback" component={GoogleCallback} />

                        <Route path="/dashboard" component={DashboardPage} />

                        <Route path="/inventory" component={InventoryPage} />
                        <Route path="/inventory/productos" component={InventoryPage} />
                        <Route path="/inventory/movimientos" component={InventoryPage} />
                        <Route path="/inventory/alertas" component={InventoryPage} />

                        <Route path="/suppliers" component={SuppliersPage} />
                        <Route path="/customers" component={CustomersPage} />
                        <Route path="/reports" component={ReportsPage} />

                        <Route path="/pos" component={POSPage} />
                        <Route path="/orders" component={OrdersPage} />
                        <Route path="/sales" component={SalesPage} />
                        <Route path="/boletas" component={BoletasPage} />
                        <Route path="/invoices" component={InvoicesPage} />
                        <Route path="/payment-methods" component={PaymentMethodsPage} />

                        <Route path="/categories" component={CategoriesPage} />
                        <Route path="/categories/productos" component={CategoriesPage} />
                        <Route path="/categories/clientes" component={CategoriesPage} />
                        <Route path="/categories/proveedores" component={CategoriesPage} />

                        <Route path="/settings" component={SettingsPage} />

                        <Route path="/:rest*" component={NotFoundPage} />
                    </Switch>
                </CartProvider>
                <Toaster />
            </AuthProvider>
        </QueryClientProvider>
    );
};

export default App;