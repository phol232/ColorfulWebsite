import React from "react";
import { useLocation, Link } from "wouter";
import { 
  LayoutDashboard,
  Package,
  UtensilsCrossed, 
  Users,
  BarChart2, 
  CreditCard, 
  Settings,
  Search,
  Grid3X3,
  LogOut,
  Boxes,
  ShoppingCart,
  Truck,
  ClipboardList
} from "lucide-react";
import Logo from "../ui/Logo";

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className = "" }) => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, path: "/dashboard" },
    { name: "Inventario", icon: <Boxes className="h-5 w-5" />, path: "/inventory" },
    { name: "Ventas", icon: <ShoppingCart className="h-5 w-5" />, path: "/sales" },
    { name: "Clientes", icon: <Users className="h-5 w-5" />, path: "/customers" },
    { name: "Estadísticas", icon: <BarChart2 className="h-5 w-5" />, path: "/statistics" },
    { name: "Pagos", icon: <CreditCard className="h-5 w-5" />, path: "/payments" },
  ];

  const toolsItems = [
    { name: "Configuración", icon: <Settings className="h-5 w-5" />, path: "/settings" },
    { name: "Pedidos", icon: <ClipboardList className="h-5 w-5" />, path: "/orders" },
    { name: "Proveedores", icon: <Truck className="h-5 w-5" />, path: "/suppliers" },
    { name: "Reportes", icon: <BarChart2 className="h-5 w-5" />, path: "/reports" },
  ];

  const renderMenuItem = (item: any) => {
    const active = isActive(item.path);
    return (
      <Link href={item.path}>
        <div className={`flex items-center p-2.5 rounded-md transition-colors cursor-pointer ${
          active 
            ? 'bg-primary/10 text-primary' 
            : 'text-gray-700 hover:bg-gray-100'
        }`}>
          <span className={`${active ? 'text-primary' : 'text-gray-500'}`}>
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
    <aside className={`w-64 bg-white border-r border-gray-200 flex flex-col h-screen ${className}`}>
      {/* Logo */}
      <div className="flex px-5 py-5">
        <Logo />
      </div>

      {/* Navegación Principal */}
      <div className="flex-grow px-3 overflow-y-auto">
        <div className="mb-6">
          <h3 className="text-gray-500 font-medium text-xs uppercase tracking-wider px-3 mb-3">Menú Principal</h3>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.name}>
                {renderMenuItem(item)}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Herramientas */}
        <div className="mb-6">
          <h3 className="text-gray-500 font-medium text-xs uppercase tracking-wider px-3 mb-3">Herramientas</h3>
          <ul className="space-y-1">
            {toolsItems.map((item) => (
              <li key={item.name}>
                {renderMenuItem(item)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Logout */}
      <div className="px-3 pt-4 pb-5 border-t border-gray-200">
        <Link href="/logout">
          <div className="flex items-center p-2.5 text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer">
            <LogOut className="h-5 w-5" />
            <span className="ml-3 text-sm">Cerrar Sesión</span>
          </div>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
