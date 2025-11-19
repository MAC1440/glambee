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
  assignedRole?: {
    id: string;
    name: string;
  } | null;
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

      console.log("Salon id for api: ", filters.salonId)
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

  /**
   * Get all staff with their assigned roles
   * Returns all staff members regardless of whether they have role assignments
   */
  static async getStaffWithRoles(filters: StaffFilters = {}): Promise<StaffWithCategories[]> {
    try {
      // Fetch staff separately - always fetch all staff
      let staffQuery = supabase
        .from('salons_staff')
        .select('*');

      if (filters.salonId) {
        staffQuery = staffQuery.eq('salon_id', filters.salonId);
      }
      if (filters.role) {
        staffQuery = staffQuery.eq('role', filters.role);
      }
      if (filters.search) {
        staffQuery = staffQuery.ilike('name', `%${filters.search}%`);
      }

      const { data: staff, error: staffError } = await staffQuery.order('name', { ascending: true });

      if (staffError) {
        console.error('Error fetching staff:', staffError);
        throw staffError;
      }

      // Return empty array if no staff found
      if (!staff || staff.length === 0) {
        return [];
      }

      // Get all staff IDs
      const staffIds = staff.map(s => s.id);

      // Fetch role assignments with roles for these staff members
      // Don't throw error if this fails - just continue without roles
      const { data: roleAssignments, error: assignmentsError } = await supabase
        .from('staff_role_assignments')
        .select(`
          staff_id,
          role:staff_roles(
            id,
            name
          )
        `)
        .in('staff_id', staffIds);

      if (assignmentsError) {
        console.warn('Error fetching role assignments (continuing without roles):', assignmentsError);
        // Continue execution - staff will have assignedRole: null
      }

      // Create a map of staff_id to role
      const roleMap = new Map<string, { id: string; name: string }>();
      if (roleAssignments && roleAssignments.length > 0) {
        roleAssignments.forEach((assignment: any) => {
          if (assignment && assignment.role) {
            roleMap.set(assignment.staff_id, {
              id: assignment.role.id,
              name: assignment.role.name
            });
          }
        });
      } else {
        console.log('No role assignments found - all staff will have assignedRole: null');
      }

      // Merge staff with their assigned roles
      // Staff without role assignments will have assignedRole: null
      // Fallback to salons_staff.role column for backward compatibility
      const staffWithRoles: StaffWithCategories[] = staff.map((member) => {
        let assignedRole = roleMap.get(member.id) || null;

        // Fallback: If no role assignment but salons_staff.role has a value, use that
        // This handles cases where the sync hasn't run yet or legacy data exists
        if (!assignedRole && member.role) {
          // Try to find the role by name to get the proper structure
          // For now, we'll use the role string directly as assignedRole.name
          // This is temporary until sync runs
          assignedRole = {
            id: '', // We don't have the ID from just the name
            name: member.role
          };
        }

        return {
          ...member,
          assignedRole, // null if no role assigned
          categories: []
        };
      });

      return staffWithRoles;
    } catch (error) {
      console.error('Failed to fetch staff with roles:', error);
      throw error;
    }
  }

  /**
   * Get assigned role for a staff member
   */
  static async getStaffRole(staffId: string): Promise<{ id: string; name: string } | null> {
    try {
      const { data: assignment, error } = await supabase
        .from('staff_role_assignments')
        .select(`
          role:staff_roles(
            id,
            name
          )
        `)
        .eq('staff_id', staffId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching staff role:', error);
        throw error;
      }

      if (!assignment || !assignment.role) {
        return null;
      }

      return {
        id: assignment.role.id,
        name: assignment.role.name
      };
    } catch (error) {
      console.error('Failed to fetch staff role:', error);
      throw error;
    }
  }

  /**
   * Assign a role to a staff member
   * If a role already exists, it will be updated
   * Also updates the salons_staff.role column for backward compatibility
   */
  static async assignRoleToStaff(staffId: string, roleId: string): Promise<boolean> {
    try {
      // First, get the role name from staff_roles table
      const { data: role, error: roleError } = await supabase
        .from('staff_roles')
        .select('name')
        .eq('id', roleId)
        .single();

      if (roleError || !role) {
        console.error('Error fetching role:', roleError);
        throw new Error('Role not found');
      }

      const roleName = role.name;

      // Check if staff member already has a role assigned
      const { data: existingAssignment } = await supabase
        .from('staff_role_assignments')
        .select('*')
        .eq('staff_id', staffId)
        .maybeSingle();

      if (existingAssignment) {
        // Update existing assignment
        const { error } = await supabase
          .from('staff_role_assignments')
          .update({ role_id: roleId })
          .eq('staff_id', staffId);

        if (error) {
          console.error('Error updating role assignment:', error);
          throw error;
        }
      } else {
        // Create new assignment
        const { error } = await supabase
          .from('staff_role_assignments')
          .insert({
            staff_id: staffId,
            role_id: roleId
          });

        if (error) {
          console.error('Error assigning role to staff:', error);
          throw error;
        }
      }

      // Also update salons_staff.role column for backward compatibility
      const { error: updateStaffError } = await supabase
        .from('salons_staff')
        .update({ role: roleName })
        .eq('id', staffId);

      if (updateStaffError) {
        console.error('Error updating salons_staff.role:', updateStaffError);
        // Don't throw - the role assignment was successful, this is just for backward compatibility
        console.warn('Role assignment succeeded but failed to update salons_staff.role');
      }

      return true;
    } catch (error) {
      console.error('Failed to assign role to staff:', error);
      throw error;
    }
  }

  /**
   * Remove role assignment from a staff member
   * Also clears the salons_staff.role column for backward compatibility
   */
  static async removeRoleFromStaff(staffId: string): Promise<boolean> {
    try {
      // Remove from staff_role_assignments
      const { error } = await supabase
        .from('staff_role_assignments')
        .delete()
        .eq('staff_id', staffId);

      if (error) {
        console.error('Error removing role from staff:', error);
        throw error;
      }

      // Also clear salons_staff.role column for backward compatibility
      const { error: updateStaffError } = await supabase
        .from('salons_staff')
        .update({ role: null })
        .eq('id', staffId);

      if (updateStaffError) {
        console.error('Error clearing salons_staff.role:', updateStaffError);
        // Don't throw - the role removal was successful
        console.warn('Role removal succeeded but failed to clear salons_staff.role');
      }

      return true;
    } catch (error) {
      console.error('Failed to remove role from staff:', error);
      throw error;
    }
  }

  /**
   * Sync salons_staff.role column with staff_role_assignments table
   * This is a one-time migration function to update all existing records
   * Can be called to ensure data consistency
   */
  // static async syncStaffRoles(): Promise<{ updated: number; errors: number }> {
  //   try {
  //     console.log('Starting role sync...');

  //     // Get all role assignments with role names
  //     const { data: assignments, error: assignmentsError } = await supabase
  //       .from('staff_role_assignments')
  //       .select(`
  //         staff_id,
  //         role:staff_roles(
  //           name
  //         )
  //       `);

  //     if (assignmentsError) {
  //       console.error('Error fetching role assignments:', assignmentsError);
  //       throw assignmentsError;
  //     }

  //     if (!assignments || assignments.length === 0) {
  //       console.log('No role assignments found to sync');
  //       return { updated: 0, errors: 0 };
  //     }

  //     let updated = 0;
  //     let errors = 0;

  //     // Update each staff member's role column
  //     for (const assignment of assignments) {
  //       try {
  //         const staffId = assignment.staff_id;
  //         const roleName = (assignment as any).role?.name;

  //         if (!roleName) {
  //           console.warn(`Skipping assignment for staff ${staffId} - role name not found`);
  //           errors++;
  //           continue;
  //         }

  //         const { error: updateError } = await supabase
  //           .from('salons_staff')
  //           .update({ role: roleName })
  //           .eq('id', staffId);

  //         if (updateError) {
  //           console.error(`Error updating staff ${staffId}:`, updateError);
  //           errors++;
  //         } else {
  //           updated++;
  //         }
  //       } catch (error) {
  //         console.error(`Error processing assignment for staff ${assignment.staff_id}:`, error);
  //         errors++;
  //       }
  //     }

  //     console.log(`Role sync completed: ${updated} updated, ${errors} errors`);
  //     return { updated, errors };
  //   } catch (error) {
  //     console.error('Failed to sync staff roles:', error);
  //     throw error;
  //   }
  // }
}
