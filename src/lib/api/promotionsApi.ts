import { supabase } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/supabase";

type SalonDiscount = Database['public']['Tables']['salon_discounts']['Row'];
type SalonDiscountInsert = Database['public']['Tables']['salon_discounts']['Insert'];
type SalonDiscountUpdate = Database['public']['Tables']['salon_discounts']['Update'];

export interface DiscountWithSalon extends SalonDiscount {
  salon?: {
    id: string;
    name: string | null;
    address: string | null;
  };
}

export interface DiscountFilters {
  salonId?: string;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  hasMore: boolean;
}

export class PromotionsApi {
  /**
   * Get or retrieve a default salon ID
   */
  private static async getDefaultSalonId(): Promise<string> {
    try {
      const { data: existingSalon, error: fetchError } = await supabase
        .from('salons')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existingSalon && !fetchError) {
        return existingSalon.id;
      }

      throw new Error('No salon found');
    } catch (error) {
      console.error('Error getting default salon ID:', error);
      throw error;
    }
  }

  /**
   * Get all discounts with optional filtering and pagination
   */
  static async getDiscounts(filters: DiscountFilters = {}): Promise<PaginatedResponse<DiscountWithSalon>> {
    try {
      const {
        salonId,
        limit = 50,
        offset = 0
      } = filters;

      let query = supabase
        .from('salon_discounts')
        .select(`
          *,
          salon:salons(id, name, address)
        `, { count: 'exact' })
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
          console.log("No default salon found, fetching all discounts");
          // Don't filter by salon_id if no default salon exists
        }
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Failed to fetch discounts: ${error.message}`);
      }

      return {
        data: data || [],
        count: count || 0,
        hasMore: (data?.length || 0) === limit
      };
    } catch (error) {
      console.error('Error fetching discounts:', error);
      throw error;
    }
  }

  /**
   * Get a single discount by ID
   */
  static async getDiscountById(id: string): Promise<DiscountWithSalon | null> {
    try {
      const { data, error } = await supabase
        .from('salon_discounts')
        .select(`
          *,
          salon:salons(id, name, address)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching discount:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch discount:', error);
      return null;
    }
  }

  /**
   * Sync service_discount to recently added or updated services for a salon
   * Only syncs to services created or updated in the last 24 hours
   */
  private static async syncServiceDiscounts(salonId: string, serviceDiscount: number | null): Promise<void> {
    try {
      const updateData: any = {};
      if (serviceDiscount !== null && serviceDiscount !== undefined) {
        updateData.service_discount = serviceDiscount;
      }

      if (Object.keys(updateData).length > 0) {
        // Calculate the cutoff time (24 hours ago)
        const cutoffTime = new Date();
        cutoffTime.setHours(cutoffTime.getHours() - 24);
        const cutoffTimeISO = cutoffTime.toISOString();

        // Only update services that were created or updated in the last 24 hours
        // This ensures only recently added or updated services get the discount synced
        const { error } = await supabase
          .from('salons_services')
          .update({
            ...updateData,
            updated_at: new Date().toISOString() // Update the updated_at timestamp
          })
          .eq('salon_id', salonId)
          .or(`created_at.gte.${cutoffTimeISO},updated_at.gte.${cutoffTimeISO}`);

        if (error) {
          console.error('Error syncing service discounts:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Failed to sync service discounts:', error);
      throw error;
    }
  }

  /**
   * Sync deal_discount to recently added or updated deals for a salon
   * Only syncs to deals created or updated in the last 24 hours
   */
  private static async syncDealDiscounts(salonId: string, dealDiscount: number | null): Promise<void> {
    try {
      const updateData: any = {};
      if (dealDiscount !== null && dealDiscount !== undefined) {
        updateData.deal_discount = dealDiscount;
      }

      if (Object.keys(updateData).length > 0) {
        // Calculate the cutoff time (24 hours ago)
        const cutoffTime = new Date();
        cutoffTime.setHours(cutoffTime.getHours() - 24);
        const cutoffTimeISO = cutoffTime.toISOString();

        // Only update deals that were created or updated in the last 24 hours
        // This ensures only recently added or updated deals get the discount synced
        const { error } = await supabase
          .from('salons_deals')
          .update({
            ...updateData,
            updated_at: new Date().toISOString() // Update the updated_at timestamp
          })
          .eq('salon_id', salonId)
          .or(`created_at.gte.${cutoffTimeISO},updated_at.gte.${cutoffTimeISO}`);

        if (error) {
          console.error('Error syncing deal discounts:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Failed to sync deal discounts:', error);
      throw error;
    }
  }

  /**
   * Create a new discount and sync to services/deals
   */
  static async createDiscount(discountData: {
    service_discount: number;
    deal_discount: number;
    package_discount: number;
    salon_id?: string;
  }): Promise<DiscountWithSalon> {
    try {
      // If salon_id is not provided, get default salon
      let salonId = discountData.salon_id;
      if (!salonId) {
        salonId = await this.getDefaultSalonId();
      }

      const { data, error } = await supabase
        .from('salon_discounts')
        .insert({
          service_discount: discountData.service_discount,
          deal_discount: discountData.deal_discount,
          package_discount: discountData.package_discount,
          salon_id: salonId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          salon:salons(id, name, address)
        `)
        .single();

      if (error) {
        console.error('Error creating discount:', error);
        throw error;
      }

      // Sync discounts to services and deals
      try {
        await Promise.all([
          this.syncServiceDiscounts(salonId, discountData.service_discount),
          this.syncDealDiscounts(salonId, discountData.deal_discount)
        ]);
      } catch (syncError) {
        console.warn('Failed to sync discounts to services/deals (discount created but sync failed):', syncError);
        // Don't throw - discount was created successfully, sync is secondary
      }

      return data;
    } catch (error) {
      console.error('Failed to create discount:', error);
      throw error;
    }
  }

  /**
   * Update a discount and sync to services/deals
   */
  static async updateDiscount(id: string, updates: {
    service_discount?: number;
    deal_discount?: number;
    package_discount?: number;
  }): Promise<DiscountWithSalon | null> {
    try {
      // First, get the current discount to get salon_id
      const currentDiscount = await this.getDiscountById(id);
      if (!currentDiscount) {
        throw new Error('Discount not found');
      }

      const salonId = currentDiscount.salon_id;

      // Update the discount
      const { data, error } = await supabase
        .from('salon_discounts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          salon:salons(id, name, address)
        `)
        .single();

      if (error) {
        console.error('Error updating discount:', error);
        throw error;
      }

      // Sync discounts to services and deals if those fields were updated
      try {
        const syncPromises: Promise<void>[] = [];
        
        if (updates.service_discount !== undefined) {
          syncPromises.push(this.syncServiceDiscounts(salonId, updates.service_discount));
        }
        
        if (updates.deal_discount !== undefined) {
          syncPromises.push(this.syncDealDiscounts(salonId, updates.deal_discount));
        }

        if (syncPromises.length > 0) {
          await Promise.all(syncPromises);
        }
      } catch (syncError) {
        console.warn('Failed to sync discounts to services/deals (discount updated but sync failed):', syncError);
        // Don't throw - discount was updated successfully, sync is secondary
      }

      return data;
    } catch (error) {
      console.error('Failed to update discount:', error);
      throw error;
    }
  }

  /**
   * Delete a discount and clear discounts from services/deals
   */
  static async deleteDiscount(id: string): Promise<boolean> {
    try {
      // First, get the discount to get salon_id before deleting
      const currentDiscount = await this.getDiscountById(id);
      if (!currentDiscount) {
        throw new Error('Discount not found');
      }

      const salonId = currentDiscount.salon_id;

      // Delete the discount
      const { error } = await supabase
        .from('salon_discounts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting discount:', error);
        throw error;
      }

      // Clear discounts from services and deals for this salon
      try {
        await Promise.all([
          this.syncServiceDiscounts(salonId, 0),
          this.syncDealDiscounts(salonId, 0)
        ]);
      } catch (syncError) {
        console.warn('Failed to clear discounts from services/deals (discount deleted but sync failed):', syncError);
        // Don't throw - discount was deleted successfully, sync is secondary
      }

      return true;
    } catch (error) {
      console.error('Failed to delete discount:', error);
      throw error;
    }
  }
}

