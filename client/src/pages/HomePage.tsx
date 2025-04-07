import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import CategoryCard from "@/components/food/CategoryCard";
import ProductCard from "@/components/food/ProductCard";
import OrderSummary from "@/components/food/OrderSummary";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { categoryIcons } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Search } from "lucide-react";

type TabType = "popular" | "recent";

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("popular");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const isMobile = useIsMobile();

  // Fetch categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Fetch products based on active tab and selected category
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/products", activeTab, selectedCategory],
  });

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  return (
    <MainLayout>
      <div className="container mx-auto">
        {/* Mobile Search */}
        {isMobile && (
          <div className="md:hidden mb-4 relative">
            <Input 
              type="text" 
              placeholder="Search food" 
              className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search className="h-5 w-5" />
            </div>
          </div>
        )}

        {/* Categories */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Explore Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {isLoadingCategories ? (
              // Show loading placeholders for categories
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg p-3 shadow-sm h-24 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
                </div>
              ))
            ) : (
              // Render actual categories
              categories.map((category: any) => (
                <CategoryCard
                  key={category.id}
                  icon={categoryIcons[category.icon as keyof typeof categoryIcons] || "🍽️"}
                  name={category.name}
                  isActive={selectedCategory === category.id}
                  onClick={() => handleCategoryClick(category.id)}
                />
              ))
            )}
          </div>
        </section>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 border-b-2 font-medium ${
              activeTab === "popular"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("popular")}
          >
            Popular
          </button>
          <button
            className={`py-2 px-4 border-b-2 font-medium ${
              activeTab === "recent"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("recent")}
          >
            Recent
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Product Grid */}
          <div className="lg:w-3/4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingProducts ? (
                // Show loading placeholders for products
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-6 bg-gray-200 rounded mb-3"></div>
                      <div className="flex items-center mb-3">
                        <div className="h-8 w-16 bg-gray-200 rounded"></div>
                        <div className="h-4 w-10 bg-gray-200 rounded ml-2"></div>
                        <div className="ml-auto flex items-center">
                          <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                          <div className="h-4 w-10 bg-gray-200 rounded ml-1"></div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-1/2 h-10 bg-gray-200 rounded-lg"></div>
                        <div className="w-1/2 h-10 bg-gray-200 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Render actual products
                products.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    originalPrice={product.originalPrice}
                    image={product.image}
                    rating={product.rating}
                    isFavorite={product.isFavorite}
                  />
                ))
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/4">
            <OrderSummary />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage;
