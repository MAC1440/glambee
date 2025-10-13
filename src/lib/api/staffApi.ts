import { supabase } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/supabase";

type SalonStaff = Database['public']['Tables']['salons_staff']['Row'];
type SalonStaffInsert = Database['public']['Tables']['salons_staff']['Insert'];
type SalonStaffUpdate = Database['public']['Tables']['salons_staff']['Update'];

export interface StaffWithCategories extends SalonStaff {
  categories?: {
    id: string;
    name: string | null;
    tag_line: string | null;
  }[];
}

export interface StaffFilters {
  salonId?: string;
  role?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  hasMore: boolean;
}

export class StaffApi {
  /**
   * Get all salon staff with optional filtering and pagination
   */
  static async getStaff(filters: StaffFilters = {}): Promise<PaginatedResponse<StaffWithCategories>> {
    try {
      const limit = filters.limit || 50;
      const offset = filters.offset || 0;

      let query = supabase
        .from('salons_staff')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.salonId) {
        query = query.eq('salon_id', filters.salonId);
      }
      if (filters.role) {
        query = query.eq('role', filters.role);
      }
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data: staff, error, count } = await query
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching staff:', error);
        throw error;
      }

      // Transform data to include categories
      const staffWithCategories: StaffWithCategories[] = staff?.map(member => {
        return {
          ...member,
          categories: [] // Will be populated separately if needed
        };
      }) || [];

      return {
        data: staffWithCategories,
        count: count || 0,
        hasMore: (offset + limit) < (count || 0)
      };
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      throw error;
    }
  }

  /**
   * Get a single staff member by ID
   */
  static async getStaffById(id: string): Promise<StaffWithCategories | null> {
    try {
      const { data: staff, error } = await supabase
        .from('salons_staff')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !staff) {
        return null;
      }

      return {
        ...staff,
        categories: [] // Will be populated separately if needed
      };
    } catch (error) {
      console.error('Failed to fetch staff member:', error);
      return null;
    }
  }

  /**
   * Get staff by salon ID
   */
  static async getStaffBySalon(salonId: string): Promise<StaffWithCategories[]> {
    try {
      const response = await this.getStaff({ salonId });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch staff by salon:', error);
      throw error;
    }
  }

  /**
   * Search staff by name
   */
  static async searchStaff(searchTerm: string, salonId?: string): Promise<StaffWithCategories[]> {
    try {
      const response = await this.getStaff({ 
        search: searchTerm, 
        salonId,
        limit: 20 
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search staff:', error);
      throw error;
    }
  }

  /**
   * Get staff by role
   */
  static async getStaffByRole(role: string, salonId?: string): Promise<StaffWithCategories[]> {
    try {
      const response = await this.getStaff({ 
        role, 
        salonId 
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch staff by role:', error);
      throw error;
    }
  }

  /**
   * Get staff by category
   */
  static async getStaffByCategory(categoryId: string, salonId?: string): Promise<StaffWithCategories[]> {
    try {
      const { data: assignments, error } = await supabase
        .from('staff_category_assignments')
        .select(`
          staff:salons_staff(*)
        `)
        .eq('category_id', categoryId);

      if (error) {
        console.error('Error fetching staff by category:', error);
        throw error;
      }

      let staff = assignments?.map(assignment => assignment.staff).filter(Boolean) || [];

      if (salonId) {
        // Filter by salon if provided
        staff = staff.filter(member => member?.salon_id === salonId);
      }

      return staff.map(member => ({
        ...member,
        categories: [] // Will be populated separately if needed
      })) || [];
    } catch (error) {
      console.error('Failed to fetch staff by category:', error);
      throw error;
    }
  }

  /**
   * Create a new staff member
   */
  static async createStaff(staffData: SalonStaffInsert): Promise<StaffWithCategories> {
    try {
      const { data: staff, error } = await supabase
        .from('salons_staff')
        .insert({
          ...staffData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating staff:', error);
        throw error;
      }

      return {
        ...staff,
        categories: []
      };
    } catch (error) {
      console.error('Failed to create staff:', error);
      throw error;
    }
  }

  /**
   * Update a staff member
   */
  static async updateStaff(id: string, updates: SalonStaffUpdate): Promise<StaffWithCategories | null> {
    try {
      const { data: staff, error } = await supabase
        .from('salons_staff')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating staff:', error);
        throw error;
      }

      return {
        ...staff,
        categories: []
      };
    } catch (error) {
      console.error('Failed to update staff:', error);
      throw error;
    }
  }

  /**
   * Delete a staff member
   */
  static async deleteStaff(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('salons_staff')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting staff:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete staff:', error);
      throw error;
    }
  }

  /**
   * Assign staff to a category
   */
  static async assignStaffToCategory(staffId: string, categoryId: string, salonId?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('staff_category_assignments')
        .insert({
          staff_id: staffId,
          category_id: categoryId,
          salon_id: salonId
        });

      if (error) {
        console.error('Error assigning staff to category:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to assign staff to category:', error);
      throw error;
    }
  }

  /**
   * Remove staff from a category
   */
  static async removeStaffFromCategory(staffId: string, categoryId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('staff_category_assignments')
        .delete()
        .eq('staff_id', staffId)
        .eq('category_id', categoryId);

      if (error) {
        console.error('Error removing staff from category:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to remove staff from category:', error);
      throw error;
    }
  }
}
