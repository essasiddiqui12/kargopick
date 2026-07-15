import { categories } from "@/data/products";
import { createAdminClient } from "@/lib/supabase/server";
import type { CategoryInfo, SubcategoryInfo } from "@/types";

export function getCategoryBySlug(id: string): CategoryInfo | undefined {
  return categories.find((c) => c.id === id);
}

export async function getSubcategories(parentId: string): Promise<SubcategoryInfo[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("subcategories")
      .select("*")
      .eq("parent_category", parentId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error("Failed to fetch subcategories:", error);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id as string,
      name: row.name as string,
      description: row.description as string,
      parent_category: row.parent_category as string,
      icon: row.icon as string,
      image_url: (row.image_url as string) || undefined,
      sort_order: Number(row.sort_order),
      is_active: Boolean(row.is_active),
    }));
  } catch {
    return [];
  }
}

export async function getAllSubcategories(): Promise<SubcategoryInfo[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("subcategories")
      .select("*")
      .order("parent_category", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Failed to fetch subcategories:", error);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id as string,
      name: row.name as string,
      description: row.description as string,
      parent_category: row.parent_category as string,
      icon: row.icon as string,
      image_url: (row.image_url as string) || undefined,
      sort_order: Number(row.sort_order),
      is_active: Boolean(row.is_active),
    }));
  } catch {
    return [];
  }
}
