import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const categoryIcons = {
  donuts: "🍩",
  burger: "🍔",
  ice: "🍦",
  potato: "🍟",
  invoice: "🧾",
  fuchka: "🧆",
  pizza: "🍕",
  hotdog: "🌭",
  chicken: "🍗",
}

export const formatCurrency = (amount: number) => {
  return amount.toLocaleString('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2
  });
};