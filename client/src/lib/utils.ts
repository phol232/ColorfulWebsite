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

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
