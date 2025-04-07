import React from "react";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  icon: string;
  name: string;
  isActive?: boolean;
  onClick?: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  icon, 
  name, 
  isActive = false,
  onClick 
}) => {
  return (
    <div
      className={cn(
        "bg-white rounded-lg p-3 shadow-sm flex flex-col items-center hover:shadow-md transition-shadow cursor-pointer",
        isActive && "ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      <div className="w-12 h-12 flex items-center justify-center">
        <span className="text-2xl">{icon}</span>
      </div>
      <span className="mt-1 text-sm font-medium">{name}</span>
    </div>
  );
};

export default CategoryCard;
