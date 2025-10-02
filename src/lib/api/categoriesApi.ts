import { supabase } from "@/lib/supabase/client";

export interface Category {
  id: string;
  title: string;
  image_url?: string;
  created_at?: string;
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, title, image_url, created_at')
      .order('title', { ascending: true });

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
