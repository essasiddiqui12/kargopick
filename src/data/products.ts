import { CategoryInfo } from "@/types";

export const categories: CategoryInfo[] = [
  {
    id: "protein",
    name: "Proteins",
    description: "Premium whey, casein & plant-based proteins for muscle growth",
    icon: "💪",
  },
  {
    id: "supplements",
    name: "Gym Supplements",
    description: "Pre-workout, creatine, BCAAs & performance boosters",
    icon: "⚡",
  },
  {
    id: "imported",
    name: "Imported Products",
    description: "Authentic imported fitness gear & supplements from China",
    icon: "🌏",
  },
];

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}
