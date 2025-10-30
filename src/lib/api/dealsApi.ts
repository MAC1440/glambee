import { supabase } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/supabase";

type SalonDeal = Database['public']['Tables']['salons_deals']['Row'];
type SalonDealInsert = Database['public']['Tables']['salons_deals']['Insert'];
type SalonDealUpdate = Database['public']['Tables']['salons_deals']['Update'];

export interface DealWithSalon extends SalonDeal {
  salon?: {
    id: string;
    name: string | null;
    address: string | null;
  };
}

export interface DealFilters {
  salonId?: string;
  search?: string;
  isActive?: boolean;
  hasPopup?: boolean;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  hasMore: boolean;
}

export class DealsApi {
  /**
   * Get or create a default salon ID
   */
  private static async getDefaultSalonId(): Promise<string> {
    try {
      const { data: existingSalon, error: fetchError } = await supabase
        .from('salons')
        .select('id')
        .limit(1)
        .single();

      if (existingSalon && !fetchError) {
        return existingSalon.id;
      }

      const { data: newSalon, error: createError } = await supabase
        .from('salons')
        .insert({
          name: 'Default Salon',
          address: 'Default Address',
        })
        .select('id')
        .single();

      if (createError || !newSalon) {
        throw new Error('Failed to create default salon');
      }

      return newSalon.id;
    } catch (error) {
      console.error('Error getting default salon ID:', error);
      throw error;
    }
  }

  /**
   * Get all deals with optional filtering and pagination
   */
  static async getDeals(filters: DealFilters = {}): Promise<PaginatedResponse<DealWithSalon>> {
    try {
      const {
        salonId,
        search,
        isActive,
        hasPopup,
        limit = 50,
        offset = 0
      } = filters;

      let query = supabase
        .from('salons_deals')
        .select(`
          *,
          salon:salons(id, name, address)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (salonId) {
        query = query.eq('salon_id', salonId);
      } else {
        // Try to get default salon, but don't filter if it fails
        try {
          const defaultSalonId = await this.getDefaultSalonId();
          console.log("Using default salon ID:", defaultSalonId);
          query = query.eq('salon_id', defaultSalonId);
        } catch (error) {
          console.log("No default salon found, fetching all deals");
          // Don't filter by salon_id if no default salon exists
        }
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,popup_title.ilike.%${search}%`);
      }

      if (isActive !== undefined) {
        const now = new Date().toISOString();
        if (isActive) {
          query = query
            .or(`valid_from.is.null,valid_from.lte.${now}`)
            .or(`valid_till.is.null,valid_till.gte.${now}`);
        } else {
          query = query
            .or(`valid_from.gt.${now},valid_till.lt.${now}`);
        }
      }

      if (hasPopup !== undefined) {
        query = query.eq('dealpopup', hasPopup);
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      console.log("Executing query with filters:", { salonId, search, isActive, hasPopup, limit, offset });
      const { data, error, count } = await query;

      console.log("Supabase response:", { data, error, count });

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Failed to fetch deals: ${error.message}`);
      }

      return {
        data: data || [],
        count: count || 0,
        hasMore: (data?.length || 0) === limit
      };
    } catch (error) {
      console.error('Error fetching deals:', error);
      throw error;
    }
  }

  /**
   * Get a single deal by ID
   */
  static async getDealById(id: string): Promise<DealWithSalon | null> {
    try {
      const { data, error } = await supabase
        .from('salons_deals')
        .select(`
          *,
          salon:salons(id, name, address)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Deal not found
        }
        throw new Error(`Failed to fetch deal: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching deal:', error);
      throw error;
    }
  }

  /**
   * Create a new deal
   */
  static async createDeal(dealData: Omit<SalonDealInsert, 'salon_id'>): Promise<SalonDeal> {
    try {
      const salonId = await this.getDefaultSalonId();

      const { data, error } = await supabase
        .from('salons_deals')
        .insert({
          ...dealData,
          salon_id: salonId,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create deal: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating deal:', error);
      throw error;
    }
  }

  /**
   * Update an existing deal
   */
  static async updateDeal(id: string, updates: SalonDealUpdate): Promise<SalonDeal> {
    try {
      const { data, error } = await supabase
        .from('salons_deals')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update deal: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error updating deal:', error);
      throw error;
    }
  }

  /**
   * Delete a deal
   */
  static async deleteDeal(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('salons_deals')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete deal: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting deal:', error);
      throw error;
    }
  }

  /**
   * Get active deals (valid within date range)
   */
  static async getActiveDeals(salonId?: string): Promise<DealWithSalon[]> {
    try {
      const { data, error } = await this.getDeals({
        salonId,
        isActive: true,
        limit: 100
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching active deals:', error);
      throw error;
    }
  }

  /**
   * Get deals with popup enabled
   */
  static async getPopupDeals(salonId?: string): Promise<DealWithSalon[]> {
    try {
      const { data, error } = await this.getDeals({
        salonId,
        hasPopup: true,
        limit: 100
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching popup deals:', error);
      throw error;
    }
  }

  /**
   * Toggle deal popup status
   */
  static async toggleDealPopup(id: string, enabled: boolean): Promise<SalonDeal> {
    try {
      const { data, error } = await supabase
        .from('salons_deals')
        .update({
          dealpopup: enabled,
          popup_timestamp: enabled ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to toggle deal popup: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error toggling deal popup:', error);
      throw error;
    }
  }

  /**
   * Update deal popup settings
   */
  static async updateDealPopup(
    id: string, 
    popupSettings: {
      popup_title?: string;
      popup_color?: string;
      popup_template?: string;
    }
  ): Promise<SalonDeal> {
    try {
      const { data, error } = await supabase
        .from('salons_deals')
        .update({
          ...popupSettings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update deal popup: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error updating deal popup:', error);
      throw error;
    }
  }
}
