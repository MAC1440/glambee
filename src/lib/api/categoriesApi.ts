import { supabase } from "@/lib/supabase/client";

export interface Category {
  id: string;
  name?: string | null;
  image_url?: string | null;
  created_at?: string | null;
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const { data: categories, error } = await supabase
      .from('staff_categories')
      .select('id, name, image_url, created_at')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    return categories || [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}
