import React from "react";
import { useLocation, Link } from "wouter";
import { 
  Home,
  ShoppingBag, 
  CheckCircle, 
  MessageSquare, 
  ClipboardList, 
  CreditCard, 
  Settings
} from "lucide-react";

const Sidebar: React.FC = () => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const navigationItems = [
    { name: "Dashboard", icon: <Home className="h-5 w-5 mr-3" />, path: "/" },
    { name: "Food Order", icon: <ShoppingBag className="h-5 w-5 mr-3" />, path: "/food-order" },
    { name: "Feedback", icon: <CheckCircle className="h-5 w-5 mr-3" />, path: "/feedback" },
    { name: "Message", icon: <MessageSquare className="h-5 w-5 mr-3" />, path: "/message" },
    { name: "Order History", icon: <ClipboardList className="h-5 w-5 mr-3" />, path: "/order-history" },
    { name: "Payment details", icon: <CreditCard className="h-5 w-5 mr-3" />, path: "/payment-details" },
    { name: "Customization", icon: <Settings className="h-5 w-5 mr-3" />, path: "/customization" },
  ];

  return (
    <aside className="w-64 bg-white shadow-md hidden md:block">
      <nav className="p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.name}>
              <Link href={item.path}>
                <a className={`flex items-center p-3 rounded-lg ${isActive(item.path) ? 'text-primary bg-[#FEF6F0]' : 'hover:bg-[#FEF6F0]'}`}>
                  {item.icon}
                  {item.name}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
