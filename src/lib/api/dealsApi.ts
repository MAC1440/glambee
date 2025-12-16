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

      const { data, error, count } = await query;

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
   * Get discount from salon_discounts for a salon (most recently created or updated)
   */
  private static async getSalonDiscount(salonId: string): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .from('salon_discounts')
        .select('deal_discount')
        .eq('salon_id', salonId)
        .order('updated_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching salon discount:', error);
        return null;
      }

      return data?.deal_discount ?? null;
    } catch (error) {
      console.warn('Failed to fetch salon discount:', error);
      return null;
    }
  }

  /**
   * Sync discount from salon_discounts to a specific deal
   */
  private static async syncDealDiscount(dealId: string, salonId: string): Promise<SalonDeal | null> {
    try {
      const discount = await this.getSalonDiscount(salonId);
      if (discount !== null) {
        const { data, error } = await supabase
          .from('salons_deals')
          .update({ deal_discount: discount } as any)
          .eq('id', dealId)
          .select()
          .single();

        if (error) {
          console.warn('Error syncing deal discount:', error);
          return null;
        }

        return data;
      }
      
      return null;
    } catch (error) {
      console.warn('Failed to sync deal discount:', error);
      return null;
    }
  }

  /**
   * Create a new deal
   */
  static async createDeal(dealData: SalonDealInsert): Promise<SalonDeal> {
    try {
      // Ensure we have a valid session and refresh if needed
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        // Try to refresh the session
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshedSession) {
          throw new Error(`Authentication required: ${sessionError?.message || refreshError?.message || 'No active session'}`);
        }
      }

      let salonId: string;

      salonId = dealData.salon_id || await this.getDefaultSalonId();

      if (!salonId) {
        throw new Error('Salon ID is required to create a deal');
      }

      // Ensure salon_id is set
      const dealDataWithSalon = {
        ...dealData,
        salon_id: salonId,
      };

      const { data, error } = await supabase
        .from('salons_deals')
        .insert(dealDataWithSalon)
        .select()
        .single();

      if (error) {
        console.error('Deal creation error:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        
        // Provide more detailed error message for RLS issues
        if (error.code === '42501' || error.message?.includes('row-level security') || error.message?.includes('RLS')) {
          const currentSession = await supabase.auth.getSession();
          console.error('Current session:', {
            userId: currentSession.data.session?.user?.id,
            email: currentSession.data.session?.user?.email,
            salonId: salonId,
          });
          
          throw new Error(
            `Permission denied: Row-level security policy violation. ` +
            `Please ensure:\n` +
            `1. You are logged in with a valid session\n` +
            `2. Your user account has access to salon ID: ${salonId}\n` +
            `3. The RLS policy allows your user role to create deals\n\n` +
            `Error: ${error.message}`
          );
        }
        throw new Error(`Failed to create deal: ${error.message}`);
      }

      // Sync discount from salon_discounts after creation
      try {
        const syncedDeal = await this.syncDealDiscount(data.id, salonId);
        // Return the synced deal with updated discount if sync was successful
        if (syncedDeal) {
          return syncedDeal;
        }
      } catch (syncError) {
        console.warn('Failed to sync discount after deal creation (deal created but discount sync failed):', syncError);
        // Don't throw - deal was created successfully, discount sync is secondary
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
      // First, get the current deal to get salon_id
      const currentDeal = await this.getDealById(id);
      if (!currentDeal) {
        throw new Error('Deal not found');
      }

      const salonId = currentDeal.salon_id;

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

      // Sync discount from salon_discounts after update
      try {
        const syncedDeal = await this.syncDealDiscount(data.id, salonId);
        // Return the synced deal with updated discount if sync was successful
        if (syncedDeal) {
          return syncedDeal;
        }
      } catch (syncError) {
        console.warn('Failed to sync discount after deal update (deal updated but discount sync failed):', syncError);
        // Don't throw - deal was updated successfully, discount sync is secondary
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
      // Use .select() to return the deleted record, which changes status from 204 to 200
      // This makes the response clearer in devtools and confirms the deletion
      const { data, error } = await supabase
        .from('salons_deals')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to delete deal: ${error.message}`);
      }

      // If data is returned, deletion was successful
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
      const response = await this.getDeals({
        salonId,
        isActive: true,
        limit: 100
      });

      return response.data;
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
      const response = await this.getDeals({
        salonId,
        hasPopup: true,
        limit: 100
      });

      return response.data;
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
      popup_price?: number | null;
      popup_color?: string | null;
      popup_template?: string | null;
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
