import React, { ReactNode, useState } from "react";
import { useLocation } from "wouter";
import Sidebar from "./Sidebar";
import Logo from "../ui/Logo";
import { Search, Filter, ShoppingBasket, Bell, Menu, ChevronLeft, ChevronRight, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { userProfile } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
      <div className="min-h-screen flex bg-[#F5F7FA]">
        {/* Sidebar - hidden on mobile or when closed */}
        {(!isMobile && sidebarOpen) && (
            <Sidebar className="sidebar-visible" />
        )}

        {/* Mobile menu overlay */}
        {isMobile && mobileMenuOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleMobileMenu}>
              <div className="absolute left-0 top-0 h-full w-64 z-50" onClick={(e) => e.stopPropagation()}>
                <Sidebar className="h-full" />
              </div>
            </div>
        )}

        <div className="flex-grow flex flex-col">
          {/* Header */}
          <header className="bg-white py-3 px-4 shadow-sm flex items-center justify-between z-30">
            {/* Left side - hamburger menu on mobile, toggle button on desktop */}
            <div className="flex items-center">
              {isMobile ? (
                  <button onClick={toggleMobileMenu} className="mr-3 p-1 hover:bg-gray-100 rounded-md">
                    <Menu className="h-6 w-6 text-gray-700" />
                  </button>
              ) : (
                  <button
                      onClick={toggleSidebar}
                      className="mr-3 p-1 hover:bg-gray-100 rounded-md"
                      aria-label={sidebarOpen ? "Ocultar menú" : "Mostrar menú"}
                      title={sidebarOpen ? "Ocultar menú" : "Mostrar menú"}
                  >
                    {sidebarOpen ? (
                        <ChevronLeft className="h-5 w-5 text-gray-700" />
                    ) : (
                        <ChevronRight className="h-5 w-5 text-gray-700" />
                    )}
                  </button>
              )}

              {/* Logo when sidebar is collapsed */}
              {!sidebarOpen && !isMobile && (
                  <div className="mr-4">
                    <Logo />
                  </div>
              )}

              {/* Search bar */}
              <div className="relative">
                <div className="flex items-center bg-gray-100 rounded-md pl-2 pr-4 py-1">
                  <Search className="h-4 w-4 text-gray-500 mr-2" />
                  <input
                      type="text"
                      placeholder="Buscar producto..."
                      className="bg-transparent border-none outline-none text-sm w-60"
                  />
                </div>
              </div>
            </div>

            {/* Right side - user profile and buttons */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-500 hover:text-gray-700">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <button className="relative p-2 text-gray-500 hover:text-gray-700">
                <ShoppingBasket className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
              </button>

              <div className="flex items-center">
                <div className="mr-2 text-right hidden md:block">
                  <p className="text-sm font-medium">{userProfile.name || "Usuario"}</p>
                  <p className="text-xs text-gray-500">{userProfile.role || "Administrador"}</p>
                </div>
                <Avatar className="h-8 w-8 border border-gray-300">
                  <AvatarImage src={userProfile.avatar || ""} alt="User avatar" />
                  <AvatarFallback>
                    {userProfile.name ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-grow p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
  );
};

export default MainLayout;
