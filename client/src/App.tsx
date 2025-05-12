// src/App.tsx
import React from "react";
import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/context/CartContext";

import NotFound from "@/pages/not-found";
import DashboardPage from "@/pages/DashboardPage";
import ProductsPage from "@/pages/ProductsPage";
import InventoryPage from "@/pages/InventoryPage";
import POSPage from "@/pages/POSPage";
import OrdersPage from "@/pages/OrdersPage";
import SalesPage from "@/pages/SalesPage";
import InvoicesPage from "@/pages/InvoicesPage";
import CustomersPage from "@/pages/CustomersPage";
import SuppliersPage from "@/pages/SuppliersPage";
import ReportsPage from "@/pages/ReportsPage";
import CategoriesPage from "@/pages/Categorias/CategoriesPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import GoogleCallback from "@/pages/GoogleCallBack";

function PublicRouter() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/auth/google/callback" component={GoogleCallback} />
      <Redirect to="/login" />
    </Switch>
  );
}

function ProtectedRouter() {
  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/inventory" component={InventoryPage} />
      <Route path="/pos" component={POSPage} />
      <Route path="/orders" component={OrdersPage} />
      <Route path="/sales" component={SalesPage} />
      <Route path="/invoices" component={InvoicesPage} />
      <Route path="/customers" component={CustomersPage} />
      <Route path="/suppliers" component={SuppliersPage} />
      <Route path="/reports" component={ReportsPage} />
      <Route path="/categories" component={CategoriesPage} />

      {/** Cualquier otra ruta protegida que no exista */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        {token ? <ProtectedRouter /> : <PublicRouter />}
        <Toaster />
      </CartProvider>
    </QueryClientProvider>
  );
}
