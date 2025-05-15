// src/App.tsx
import React from "react";
import { Router, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";

import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import GoogleCallback from "@/pages/GoogleCallback";
import DashboardPage from "@/pages/DashboardPage";
import ProductsPage from "@/pages/ProductsPage";
import InventoryPage from "@/pages/Inventory/InventoryPage.tsx";
import POSPage from "@/pages/POSPage";
import OrdersPage from "@/pages/OrdersPage";
import SalesPage from "@/pages/SalesPage";
import InvoicesPage from "@/pages/InvoicesPage";
import CustomersPage from "@/pages/CustomersPage";
import SuppliersPage from "@/pages/SuppliersPage";
import ReportsPage from "@/pages/ReportsPage";
import CategoriesPage from "@/pages/Categorias/CategoriesPage";

const Routes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
      <>
        {/* RUTAS PÚBLICAS */}
        <Route path="/login">
          {!isAuthenticated ? <LoginPage /> : <Redirect to="/dashboard" />}
        </Route>
        <Route path="/register">
          {!isAuthenticated ? <RegisterPage /> : <Redirect to="/dashboard" />}
        </Route>
        <Route path="/auth/google/callback">
          {!isAuthenticated ? <GoogleCallback /> : <Redirect to="/dashboard" />}
        </Route>
        <Route path="/api/auth/google/callback">
          {!isAuthenticated ? <GoogleCallback /> : <Redirect to="/dashboard" />}
        </Route>

        {/* RUTAS PROTEGIDAS */}
        <Route path="/dashboard">
          {isAuthenticated ? <DashboardPage /> : <Redirect to="/login" />}
        </Route>
        <Route path="/products">
          {isAuthenticated ? <ProductsPage /> : <Redirect to="/login" />}
        </Route>
        <Route path="/inventory">
          {isAuthenticated ? <InventoryPage /> : <Redirect to="/login" />}
        </Route>
        <Route path="/pos">
          {isAuthenticated ? <POSPage /> : <Redirect to="/login" />}
        </Route>
        <Route path="/orders">
          {isAuthenticated ? <OrdersPage /> : <Redirect to="/login" />}
        </Route>
        <Route path="/sales">
          {isAuthenticated ? <SalesPage /> : <Redirect to="/login" />}
        </Route>
        <Route path="/invoices">
          {isAuthenticated ? <InvoicesPage /> : <Redirect to="/login" />}
        </Route>
        <Route path="/customers">
          {isAuthenticated ? <CustomersPage /> : <Redirect to="/login" />}
        </Route>
        <Route path="/suppliers">
          {isAuthenticated ? <SuppliersPage /> : <Redirect to="/login" />}
        </Route>
        <Route path="/reports">
          {isAuthenticated ? <ReportsPage /> : <Redirect to="/login" />}
        </Route>
        <Route path="/categories">
          {isAuthenticated ? <CategoriesPage /> : <Redirect to="/login" />}
        </Route>

        {/* RAÍZ / REDIRECCIÓN POR DEFECTO */}
        <Route path="/">
          {isAuthenticated ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
        </Route>

        {/* 404 */}
        <Route>
          <NotFound />
        </Route>
      </>
  );
};

const App: React.FC = () => (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <CartProvider>
            <Routes />
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
);

export default App;