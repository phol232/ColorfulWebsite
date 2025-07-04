import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import {
  LayoutDashboard,
  Users,
  BarChart2,
  CreditCard,
  Settings,
  LogOut,
  Boxes,
  ShoppingCart,
  Truck,
  ClipboardList,
  Receipt,
  Store,
  Tags,
  FileText,
} from "lucide-react";
import Logo from "../ui/Logo";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "@/config.ts";


interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className = "" }) => {
  const [location] = useLocation();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      // Llamar al endpoint de logout en el backend
      const token = localStorage.getItem("token");
      if (token) {
        await fetch(`${API_URL}/api/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      }

      logout();
      console.log("Sesión cerrada correctamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActive = (path: string) => {
    return location === path;
  };

  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, path: "/dashboard" },
    { name: "Inventario", icon: <Boxes className="h-5 w-5" />, path: "/inventory" },
    { name: "Proveedores", icon: <Truck className="h-5 w-5" />, path: "/suppliers" },
    { name: "Clientes", icon: <Users className="h-5 w-5" />, path: "/customers" },
    { name: "Reportes", icon: <BarChart2 className="h-5 w-5" />, path: "/reports" },
  ];

  const salesItems = [
    { name: "Punto de Venta", icon: <Store className="h-5 w-5" />, path: "/pos" },
    { name: "Pedidos", icon: <ClipboardList className="h-5 w-5" />, path: "/orders" },
  ];

  const toolsItems = [
    { name: "Categorías", icon: <Tags className="h-5 w-5" />, path: "/categories" },
    { name: "Pagos", icon: <CreditCard className="h-5 w-5" />, path: "/payment-methods" },
  ];

  const renderMenuItem = (item: any) => {
    const active = isActive(item.path);
    return (
        <Link href={item.path}>
          <div className={`flex items-center p-2.5 rounded-md transition-colors cursor-pointer ${
              active
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}>
          <span className={`${active ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}>
            {item.icon}
          </span>
            <span className="ml-3 text-sm">{item.name}</span>
            {active && <span className="ml-auto">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>}
          </div>
        </Link>
    );
  };

  return (
      <aside className="w-64 bg-card border-r border-border h-screen flex flex-col sticky top-0 z-30">
        {/* Logo */}
        <div className="flex px-5 py-5">
          <Logo />
        </div>


        <div className="flex-1 px-3 overflow-y-auto min-h-0">
          <div className="mb-6">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-xs uppercase tracking-wider px-3 mb-3">Menú Principal</h3>
            <ul className="space-y-1">
              {menuItems.map((item) => (
                  <li key={item.name}>
                    {renderMenuItem(item)}
                  </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-xs uppercase tracking-wider px-3 mb-3">Gestión de Ventas</h3>
            <ul className="space-y-1">
              {salesItems.map((item) => (
                  <li key={item.name}>
                    {renderMenuItem(item)}
                  </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-xs uppercase tracking-wider px-3 mb-3">Comprobantes</h3>
            <ul className="space-y-1">
              <li>
                {renderMenuItem({ name: "Boletas", icon: <Receipt className="h-5 w-5" />, path: "/boletas" })}
              </li>
              <Link href="/invoices">
                <div className="flex items-center p-2.5 rounded-md transition-colors cursor-pointer text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">
                    <FileText className="h-5 w-5" />
                  </span>
                  <span className="ml-3 text-sm">Facturas</span>
                </div>
              </Link>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-xs uppercase tracking-wider px-3 mb-3">Herramientas</h3>
            <ul className="space-y-1">
              {toolsItems.map((item) => (
                  <li key={item.name}>
                    {renderMenuItem(item)}
                  </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
  );
};

export default Sidebar;