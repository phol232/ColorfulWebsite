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
import { CartProvider } from "@/context/CartContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage}/>
      <Route path="/dashboard" component={DashboardPage}/>
      <Route path="/products" component={ProductsPage}/>
      <Route path="/inventory" component={InventoryPage}/>
      <Route path="/pos" component={POSPage}/>
      <Route path="/orders" component={OrdersPage}/>
      <Route path="/sales" component={SalesPage}/>
      <Route path="/invoices" component={InvoicesPage}/>
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
