import React, { ReactNode } from "react";
import { useLocation } from "wouter";
import Sidebar from "./Sidebar";
import Logo from "../ui/Logo";
import { Search, Filter, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-[#FEF6F0] bg-gradient-radial-tr-bl">
      {/* Header */}
      <header className="bg-white p-4 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <Logo />
          
          {/* Search bar - hidden on mobile */}
          <div className="relative w-1/3 hidden md:block">
            <Input 
              type="text" 
              placeholder="Search food" 
              className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <Button 
              variant="ghost" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 p-0 h-auto"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Filter button */}
          <Button className="bg-primary hover:bg-primary/90 text-white">
            Filter
            <Filter className="h-5 w-5 ml-2" />
          </Button>
          
          {/* User profile */}
          <div className="flex items-center">
            <Avatar className="h-8 w-8 bg-gray-100">
              <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=50&h=50&q=80" alt="User avatar" />
              <AvatarFallback>DB</AvatarFallback>
            </Avatar>
            <span className="ml-2 font-medium hidden md:inline-block">David Brown</span>
            <ChevronDown className="h-5 w-5 ml-1 text-gray-400" />
          </div>
        </div>
      </header>
      
      <div className="flex flex-grow">
        {/* Sidebar - hidden on mobile */}
        {!isMobile && <Sidebar />}
        
        {/* Main content */}
        <main className="flex-grow p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
