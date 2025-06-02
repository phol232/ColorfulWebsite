import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, SlidersHorizontal, ArrowDownUp, ThumbsUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  image: string;
  rating: string;
  isPopular: boolean | null;
  categoryId: number;
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
  icon: string;
}

const ProductsPage: React.FC = () => {
  // Fetch products and categories
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Add to cart functionality
  const { addToCart } = useCart();

  // State for filtering and searching
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [activeTab, setActiveTab] = useState<string>("all");

  // Filter products based on current filters
  const filteredProducts = products.filter((product) => {
    // Search term filter
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.categoryId);
    
    // Price range filter
    const price = product.discountPrice || product.price;
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
    
    // Tab filter
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'popular' && product.isPopular) || 
                      (activeTab === 'new' && new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesCategory && matchesPrice && matchesTab;
  }).sort((a, b) => {
    // Sort products
    switch (sortBy) {
      case "price-asc":
        return (a.discountPrice || a.price) - (b.discountPrice || b.price);
      case "price-desc":
        return (b.discountPrice || b.price) - (a.discountPrice || a.price);
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "rating":
        // Extract numeric value from rating (e.g., "2.5k" -> 2.5)
        const ratingA = parseFloat(a.rating.replace(/[^0-9.]/g, ''));
        const ratingB = parseFloat(b.rating.replace(/[^0-9.]/g, ''));
        return ratingB - ratingA;
      default:
        return 0;
    }
  });

  // Get the min and max price from all products
  useEffect(() => {
    if (products.length > 0) {
      const prices = products.map(p => p.discountPrice || p.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      setPriceRange([minPrice, maxPrice]);
    }
  }, [products]);

  // Toggle category selection
  const toggleCategory = (categoryId: number) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto pb-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar filters */}
          <aside className="w-full md:w-64 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Categories */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">Categorías</h3>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center">
                          <Checkbox 
                            id={`category-${category.id}`}
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={() => toggleCategory(category.id)}
                          />
                          <Label 
                            htmlFor={`category-${category.id}`} 
                            className="ml-2 text-sm"
                          >
                            {category.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Price Range */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">Rango de Precio</h3>
                    <div className="space-y-3">
                      <Slider
                        defaultValue={[priceRange[0], priceRange[1]]}
                        max={1000}
                        step={1}
                        onValueChange={(value) => setPriceRange([value[0], value[1]])}
                        className="py-4"
                      />
                      <div className="flex justify-between text-sm">
                        <span>{formatCurrency(priceRange[0])}</span>
                        <span>{formatCurrency(priceRange[1])}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Sort By */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">Ordenar Por</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          id="sort-relevance" 
                          value="relevance"
                          checked={sortBy === "relevance"}
                          onChange={() => setSortBy("relevance")}
                          className="mr-2"
                        />
                        <Label htmlFor="sort-relevance" className="text-sm">Relevancia</Label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          id="sort-price-asc" 
                          value="price-asc"
                          checked={sortBy === "price-asc"}
                          onChange={() => setSortBy("price-asc")}
                          className="mr-2"
                        />
                        <Label htmlFor="sort-price-asc" className="text-sm">Precio: Menor a Mayor</Label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          id="sort-price-desc" 
                          value="price-desc"
                          checked={sortBy === "price-desc"}
                          onChange={() => setSortBy("price-desc")}
                          className="mr-2"
                        />
                        <Label htmlFor="sort-price-desc" className="text-sm">Precio: Mayor a Menor</Label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          id="sort-rating" 
                          value="rating"
                          checked={sortBy === "rating"}
                          onChange={() => setSortBy("rating")}
                          className="mr-2"
                        />
                        <Label htmlFor="sort-rating" className="text-sm">Mejor Calificados</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main content */}
          <div className="flex-1">
            {/* Search and filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Buscar productos..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Filter className="h-4 w-4 mr-1" />
                      <span>Filtrar</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <ArrowDownUp className="h-4 w-4 mr-1" />
                      <span>Ordenar</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 w-full md:w-auto">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="popular">Populares</TabsTrigger>
                <TabsTrigger value="new">Nuevos</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Results counter */}
            <div className="text-sm text-gray-500 mb-4">
              Mostrando {filteredProducts.length} de {products.length} productos
            </div>

            {/* Products grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow">
                  <div className="relative h-48 bg-gray-100">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-gray-400">Sin imagen</span>
                      </div>
                    )}
                    {product.isPopular && (
                      <Badge className="absolute top-2 right-2 bg-primary text-white border-primary">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <CardContent className="flex-grow flex flex-col p-4">
                    <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 flex items-center">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          {product.rating}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="bg-gray-100">
                        {categories.find(c => c.id === product.categoryId)?.name || 'Sin categoría'}
                      </Badge>
                    </div>
                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <div className="flex items-end gap-1">
                        <span className="font-bold text-lg">
                          {formatCurrency(product.discountPrice || product.price)}
                        </span>
                        {product.discountPrice && (
                          <span className="text-gray-400 text-sm line-through">
                            {formatCurrency(product.price)}
                          </span>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => addToCart({
                            id: product.id,
                            name: product.name,
                            price: product.discountPrice || product.price,
                            image: product.image
                        })}
                      >
                        Agregar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty state */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
                <p className="text-gray-500">
                  Intenta con otros filtros o términos de búsqueda.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductsPage;