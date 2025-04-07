import React from "react";
import { cn } from "@/lib/utils";

interface PaymentMethod {
  id: string;
  name: string;
  logoUrl: string;
}

interface PaymentMethodsProps {
  methods: PaymentMethod[];
  selectedMethod: string;
  onSelect: (id: string) => void;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  methods,
  selectedMethod,
  onSelect,
}) => {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-600 mb-2">Payment Method</h3>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {methods.map((method) => (
          <div
            key={method.id}
            onClick={() => onSelect(method.id)}
            className={cn(
              "border rounded-lg p-3 flex justify-center cursor-pointer transition-colors",
              selectedMethod === method.id
                ? "border-primary"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <img
              src={method.logoUrl}
              alt={method.name}
              className="h-8 object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethods;
