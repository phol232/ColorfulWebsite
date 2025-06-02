import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// Define the type for cart items
export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

// Define the cart state
interface CartState {
  cartItems: CartItem[];
  totalItems: number;
  totalPrice: number;
}

// Define the cart actions
type CartAction = 
  | { type: 'ADD_TO_CART'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_FROM_CART'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
  | { type: 'CLEAR_CART' };

// Define the cart context
interface CartContextType extends CartState {
  addToCart: (item: { id: number; name: string; price: number; image: string; quantity: number }) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
}

// Create the cart context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Create the cart reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItemIndex = state.cartItems.findIndex(
        (item) => item.id === action.payload.id
      );

      let updatedCartItems: CartItem[];

      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        updatedCartItems = state.cartItems.map((item, index) => {
          if (index === existingItemIndex) {
            return { ...item, quantity: item.quantity + 1 };
          }
          return item;
        });
      } else {
        // Item doesn't exist, add to cart
        updatedCartItems = [
          ...state.cartItems,
          { ...action.payload, quantity: 1 },
        ];
      }

      // Calculate total items and price
      const totalItems = updatedCartItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = updatedCartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      return {
        ...state,
        cartItems: updatedCartItems,
        totalItems,
        totalPrice,
      };
    }

    case 'REMOVE_FROM_CART': {
      const updatedCartItems = state.cartItems.filter(
        (item) => item.id !== action.payload
      );

      // Calculate total items and price
      const totalItems = updatedCartItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = updatedCartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      return {
        ...state,
        cartItems: updatedCartItems,
        totalItems,
        totalPrice,
      };
    }

    case 'UPDATE_QUANTITY': {
      const updatedCartItems = state.cartItems.map((item) => {
        if (item.id === action.payload.id) {
          return { ...item, quantity: action.payload.quantity };
        }
        return item;
      });

      // Calculate total items and price
      const totalItems = updatedCartItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = updatedCartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      return {
        ...state,
        cartItems: updatedCartItems,
        totalItems,
        totalPrice,
      };
    }

    case 'CLEAR_CART':
      return {
        cartItems: [],
        totalItems: 0,
        totalPrice: 0,
      };

    default:
      return state;
  }
};

// Create the cart provider
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initialCartState: CartState = {
    cartItems: [],
    totalItems: 0,
    totalPrice: 0,
  };

  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  // Add to cart
  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    dispatch({ type: 'ADD_TO_CART', payload: item });
  };

  // Remove from cart
  const removeFromCart = (id: number) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  };

  // Update quantity
  const updateQuantity = (id: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  // Clear cart
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Create the cart hook
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
