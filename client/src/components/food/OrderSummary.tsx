import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import CartItem from "./CartItem";
import PaymentMethods from "./PaymentMethods";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";

const PAYMENT_METHODS = [
  {
    id: "paypal",
    name: "PayPal",
    logoUrl: "https://cdn.worldvectorlogo.com/logos/paypal-2.svg",
  },
  {
    id: "mastercard",
    name: "Mastercard",
    logoUrl: "https://cdn.worldvectorlogo.com/logos/mastercard-2.svg",
  },
  {
    id: "visa",
    name: "Visa",
    logoUrl: "https://cdn.worldvectorlogo.com/logos/visa.svg",
  },
  {
    id: "amex",
    name: "American Express",
    logoUrl: "https://cdn.worldvectorlogo.com/logos/american-express-1.svg",
  },
];

const OrderSummary: React.FC = () => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("mastercard");
  const { cartItems, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  
  const tax = totalPrice * 0.07; // 7% tax
  const finalTotal = totalPrice - tax;

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Your cart is empty",
        description: "Add some items to your cart before placing an order",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Order placed successfully!",
      description: `Your order has been placed and will be delivered soon. Payment of $${finalTotal.toFixed(2)} processed via ${selectedPaymentMethod}.`,
    });
    
    clearCart();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <CartItem
              key={item.id}
              id={item.id}
              name={item.name}
              price={item.price}
              image={item.image}
              quantity={item.quantity}
            />
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            Your cart is empty
          </div>
        )}
      </div>

      {/* Payment Summary */}
      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Sub Total</span>
          <span className="font-medium">${totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tax</span>
          <span className="font-medium">-${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200">
          <span>Total Payment</span>
          <span>${finalTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="mt-6">
        <PaymentMethods
          methods={PAYMENT_METHODS}
          selectedMethod={selectedPaymentMethod}
          onSelect={setSelectedPaymentMethod}
        />

        <Button
          className="w-full py-6 bg-primary text-white rounded-lg font-medium hover:bg-primary/90"
          onClick={handlePlaceOrder}
        >
          Place An Order Now
        </Button>
      </div>
    </div>
  );
};

export default OrderSummary;
