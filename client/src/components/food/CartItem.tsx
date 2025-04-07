import React from "react";
import { useCart } from "@/context/CartContext";
import { X } from "lucide-react";

interface CartItemProps {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

const CartItem: React.FC<CartItemProps> = ({
  id,
  name,
  price,
  image,
  quantity,
}) => {
  const { removeFromCart } = useCart();

  return (
    <div className="flex items-center gap-3 group relative">
      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
        {/* Placeholder for cart item image */}
        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 text-center">
          {name}
        </div>
      </div>
      <div className="flex-grow">
        <h4 className="font-medium">{name}</h4>
        <span className="text-primary font-medium">${price}</span>
        {quantity > 1 && (
          <span className="text-sm text-gray-500 ml-2">x{quantity}</span>
        )}
      </div>
      <button
        onClick={() => removeFromCart(id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default CartItem;
