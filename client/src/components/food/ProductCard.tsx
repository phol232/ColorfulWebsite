import React from "react";
import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: string;
  isFavorite?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  originalPrice,
  image,
  rating,
  isFavorite = false,
}) => {
  const [favorite, setFavorite] = React.useState(isFavorite);
  const { toast } = useToast();
  const { addToCart } = useCart();

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorite(!favorite);
    toast({
      title: !favorite ? "Added to wishlist" : "Removed from wishlist",
      description: `${name} has been ${!favorite ? "added to" : "removed from"} your wishlist`,
    });
  };

  const handleOrderNow = () => {
    addToCart({
      id,
      name,
      price,
      image,
      quantity: 1,
    });
    
    toast({
      title: "Added to cart",
      description: `${name} has been added to your cart`,
    });
  };

  const handleAddToWishlist = () => {
    if (!favorite) {
      setFavorite(true);
      toast({
        title: "Added to wishlist",
        description: `${name} has been added to your wishlist`,
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="relative">
        <button 
          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md z-10"
          onClick={toggleFavorite}
        >
          <Heart 
            className={cn(
              "h-5 w-5",
              favorite ? "text-primary fill-primary" : "text-gray-400"
            )} 
          />
        </button>
        <div className="h-48 bg-gray-200">
          {/* Placeholder for food image */}
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            {name}
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{name}</h3>
        <div className="flex items-baseline mb-3">
          <span className="text-primary font-bold text-xl">${price}</span>
          <span className="text-gray-400 text-sm line-through ml-2">${originalPrice}</span>
          <div className="ml-auto flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm text-gray-600 ml-1">{rating}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="w-1/2 py-2 border border-gray-200 rounded-lg font-medium text-sm hover:bg-gray-50"
            onClick={handleAddToWishlist}
          >
            Wishlist
          </Button>
          <Button
            className="w-1/2 py-2 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary/90"
            onClick={handleOrderNow}
          >
            Order Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
