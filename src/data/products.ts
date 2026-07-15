import { CategoryInfo } from "@/types";

export const categories: CategoryInfo[] = [
  {
    id: "gym-essentials",
    name: "Gym Essentials",
    description: "Proteins, creatine, pre-workout & mass gainer",
    icon: "💪",
    sort_order: 0,
    is_active: true,
  },
  {
    id: "imported",
    name: "Imported Products",
    description: "Premium international brands & authentic supplements",
    icon: "🌍",
    sort_order: 1,
    is_active: true,
  },
];

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}
