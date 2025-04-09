import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
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
import CategoriesPage from "@/pages/CategoriesPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import { CartProvider } from "@/context/CartContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={DashboardPage}/>
      <Route path="/dashboard" component={DashboardPage}/>
      <Route path="/products" component={ProductsPage}/>
      <Route path="/inventory" component={InventoryPage}/>
      <Route path="/customers" component={CustomersPage}/>
      <Route path="/suppliers" component={SuppliersPage}/>
      <Route path="/reports" component={ReportsPage}/>
      <Route path="/pos" component={POSPage}/>
      <Route path="/orders" component={OrdersPage}/>
      <Route path="/sales" component={SalesPage}/>
      <Route path="/invoices" component={InvoicesPage}/>
      <Route path="/categories" component={CategoriesPage}/>
      <Route path="/login" component={LoginPage}/>
      <Route path="/register" component={RegisterPage}/>
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <Router />
        <Toaster />
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
