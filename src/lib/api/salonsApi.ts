import { supabase } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/supabase";

type Salon = Database['public']['Tables']['salons']['Row'];

export interface SalonOption {
  id: string;
  name: string | null;
}

export class SalonsApi {
  /**
   * Get all salons (for dropdowns)
   */
  static async getSalons(): Promise<SalonOption[]> {
    try {
      const { data, error } = await supabase
        .from("salons")
        .select("id, name")
        .order("name", { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch salons: ${error.message}`);
      }

      return (data || []) as SalonOption[];
    } catch (error) {
      console.error("Error fetching salons:", error);
      throw error;
    }
  }

  /**
   * Get salon by ID
   */
  static async getSalonById(id: string): Promise<Salon | null> {
    try {
      const { data, error } = await supabase
        .from("salons")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        throw new Error(`Failed to fetch salon: ${error.message}`);
      }

      return data as Salon;
    } catch (error) {
      console.error("Error fetching salon:", error);
      throw error;
    }
  }
}

