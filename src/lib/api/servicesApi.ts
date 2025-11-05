import { supabase } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/supabase";

type SalonService = Database['public']['Tables']['salons_services']['Row'];
type SalonServiceInsert = Database['public']['Tables']['salons_services']['Insert'];
type SalonServiceUpdate = Database['public']['Tables']['salons_services']['Update'];

export interface ServiceWithStaff extends SalonService {
  staff?: {
    id: string;
    name: string | null;
    avatar: string | null;
    role: string | null;
  }[];
  duration?: number; // Convert time string to minutes
}

export interface ServiceFilters {
  salonId?: string;
  categoryId?: string;
  gender?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  hasMore: boolean;
}

export class ServicesApi {
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
          activity_status: 'active',
          is_premium: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (createError || !newSalon) {
        throw new Error('Failed to create default salon');
      }

      return newSalon.id;
    } catch (error) {
      console.error('Error getting default salon:', error);
      throw new Error('Failed to get salon ID');
    }
  }

  /**
   * Get all salon services with optional filtering and pagination
   */
  static async getServices(filters: ServiceFilters = {}): Promise<PaginatedResponse<ServiceWithStaff>> {
    try {
      const limit = filters.limit;
      const offset = filters.offset || 0;

      let query = supabase
        .from('salons_services')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.salonId) {
        query = query.eq('salon_id', filters.salonId);
      } else {
        // Try to get default salon, but don't filter if it fails
        try {
          const defaultSalonId = await this.getDefaultSalonId();
          query = query.eq('salon_id', defaultSalonId);
        } catch (error) {
          console.log("No default salon found, fetching all services");
          // Don't filter by salon_id if no default salon exists
        }
      }
      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }
      if (filters.gender) {
        query = query.eq('gender', filters.gender);
      }
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      query = query.order('created_at', { ascending: false });

      if (limit !== undefined && limit > 0) {
        query = query.range(offset, offset + limit - 1);
      }

      const { data: services, error, count } = await query

      if (error) {
        console.error('Error fetching services:', error);
        throw error;
      }

      // Transform data to include staff and duration
      const servicesWithStaff: ServiceWithStaff[] = services?.map(service => {
        // Convert time string to duration in minutes
        const duration = this.parseTimeToMinutes(service.time);

        return {
          ...service,
          staff: [], // Will be populated separately if needed
          duration
        };
      }) || [];

      return {
        data: servicesWithStaff,
        count: count || 0,
        hasMore: limit !== undefined ? (offset + limit) < (count || 0) : false
      };
    } catch (error) {
      console.error('Failed to fetch services:', error);
      throw error;
    }
  }

  /**
   * Get a single service by ID
   */
  static async getServiceById(id: string): Promise<ServiceWithStaff | null> {
    try {
      const { data: service, error } = await supabase
        .from('salons_services')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !service) {
        return null;
      }

      const duration = this.parseTimeToMinutes(service.time);

      return {
        ...service,
        staff: [], // Will be populated separately if needed
        duration
      };
    } catch (error) {
      console.error('Failed to fetch service:', error);
      return null;
    }
  }

  /**
   * Get services by salon ID
   */
  static async getServicesBySalon(salonId: string): Promise<ServiceWithStaff[]> {
    try {
      const response = await this.getServices({ salonId });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch services by salon:', error);
      throw error;
    }
  }

  /**
   * Search services by name
   */
  static async searchServices(searchTerm: string, salonId?: string): Promise<ServiceWithStaff[]> {
    try {
      const response = await this.getServices({ 
        search: searchTerm, 
        salonId,
        limit: 20 
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search services:', error);
      throw error;
    }
  }

  /**
   * Get services by category
   */
  static async getServicesByCategory(categoryId: string, salonId?: string): Promise<ServiceWithStaff[]> {
    try {
      const response = await this.getServices({ 
        categoryId, 
        salonId 
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch services by category:', error);
      throw error;
    }
  }

  /**
   * Create a new service
   */
  static async createService(serviceData: SalonServiceInsert): Promise<ServiceWithStaff> {
    try {
      // Ensure salon_id is set
      if (!serviceData.salon_id) {
        serviceData.salon_id = await this.getDefaultSalonId();
      }
      
      const { data: service, error } = await supabase
        .from('salons_services')
        .insert({
          ...serviceData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating service:', error);
        throw error;
      }

      const duration = this.parseTimeToMinutes(service.time);

      return {
        ...service,
        staff: [],
        duration
      };
    } catch (error) {
      console.error('Failed to create service:', error);
      throw error;
    }
  }

  /**
   * Update a service
   */
  static async updateService(id: string, updates: SalonServiceUpdate): Promise<ServiceWithStaff | null> {
    try {
      const { data: service, error } = await supabase
        .from('salons_services')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating service:', error);
        throw error;
      }

      const duration = this.parseTimeToMinutes(service.time);

      return {
        ...service,
        staff: [],
        duration
      };
    } catch (error) {
      console.error('Failed to update service:', error);
      throw error;
    }
  }

  /**
   * Delete a service
   */
  static async deleteService(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('salons_services')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting service:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete service:', error);
      throw error;
    }
  }

  /**
   * Helper function to parse time string to minutes
   */
  private static parseTimeToMinutes(timeString: string): number {
    // Handle different time formats
    if (timeString.includes(':')) {
      // Format: "1:30" or "01:30"
      const [hours, minutes] = timeString.split(':').map(Number);
      return (hours * 60) + minutes;
    } else if (timeString.includes('h')) {
      // Format: "1h30m" or "1.5h"
      const match = timeString.match(/(\d+(?:\.\d+)?)h(?:\d+)?m?/);
      if (match) {
        return Math.round(parseFloat(match[1]) * 60);
      }
    } else {
      // Assume it's just a number (minutes)
      const minutes = parseInt(timeString);
      return isNaN(minutes) ? 30 : minutes; // Default to 30 minutes
    }
    
    return 30; // Default fallback
  }

  /**
   * Get service categories
   */
  static async getServiceCategories(salonId?: string): Promise<any[]> {
    try {
      const { data: categories, error } = await supabase
        .from('staff_categories')
        .select('*');

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      return categories || [];
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  }

  /**
   * Get staff for a specific service
   */
  static async getStaffForService(serviceId: string): Promise<any[]> {
    try {
      // First get the service to find its category
      const { data: service, error: serviceError } = await supabase
        .from('salons_services')
        .select('category_id')
        .eq('id', serviceId)
        .single();

      if (serviceError || !service) {
        return [];
      }

      if (!service.category_id) {
        return [];
      }

      // Get staff assigned to this category
      const { data: assignments, error } = await supabase
        .from('staff_category_assignments')
        .select(`
          staff:salons_staff(
            id,
            name,
            avatar,
            role
          )
        `)
        .eq('category_id', service.category_id);

      if (error) {
        console.error('Error fetching staff for service:', error);
        return [];
      }

      return assignments?.map(assignment => assignment.staff).filter(Boolean) || [];
    } catch (error) {
      console.error('Failed to fetch staff for service:', error);
      return [];
    }
  }
}