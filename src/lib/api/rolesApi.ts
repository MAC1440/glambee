import { supabase } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/supabase";

type StaffRole = Database['public']['Tables']['staff_roles']['Row'];
type StaffRoleInsert = Database['public']['Tables']['staff_roles']['Insert'];
type StaffRoleUpdate = Database['public']['Tables']['staff_roles']['Update'];

export interface Role extends StaffRole {}

// Permission types (matches your PermissionSet structure)
export type PermissionSet = {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
};

export type RolePermissions = {
  [moduleKey: string]: Partial<PermissionSet>;
};

// Type for staff_role_permissions table (will be updated after regenerating types)
export interface RolePermission {
  id: string;
  role_id: string;
  permissions: RolePermissions;
  created_at: string | null;
  updated_at: string | null;
}

export class RolesApi {
  /**
   * Get all roles
   */
  static async getRoles(): Promise<Role[]> {
    try {
      const { data: roles, error } = await supabase
        .from('staff_roles')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching roles:', error);
        throw error;
      }

      return roles || [];
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      throw error;
    }
  }

  /**
   * Get a single role by ID
   */
  static async getRoleById(id: string): Promise<Role | null> {
    try {
      const { data: role, error } = await supabase
        .from('staff_roles')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !role) {
        return null;
      }

      return role;
    } catch (error) {
      console.error('Failed to fetch role:', error);
      return null;
    }
  }

  /**
   * Get a role by name
   */
  static async getRoleByName(name: string): Promise<Role | null> {
    try {
      const { data: role, error } = await supabase
        .from('staff_roles')
        .select('*')
        .eq('name', name)
        .single();

      if (error || !role) {
        return null;
      }

      return role;
    } catch (error) {
      console.error('Failed to fetch role by name:', error);
      return null;
    }
  }

  /**
   * Create a new role
   * Accepts name and optional description
   */
  static async createRole(roleData: StaffRoleInsert & { description?: string | null }): Promise<Role> {
    try {
      const { data: role, error } = await supabase
        .from('staff_roles')
        .insert({
          name: roleData.name,
          description: roleData.description || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating role:', error);
        throw error;
      }

      return role;
    } catch (error) {
      console.error('Failed to create role:', error);
      throw error;
    }
  }

  /**
   * Update a role
   * Accepts name and optional description
   */
  static async updateRole(id: string, updates: StaffRoleUpdate & { description?: string | null }): Promise<Role | null> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.name !== undefined) {
        updateData.name = updates.name;
      }

      if (updates.description !== undefined) {
        updateData.description = updates.description || null;
      }

      const { data: role, error } = await supabase
        .from('staff_roles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating role:', error);
        throw error;
      }

      return role;
    } catch (error) {
      console.error('Failed to update role:', error);
      throw error;
    }
  }

  /**
   * Delete a role
   * This will:
   * 1. Find all staff members assigned to this role
   * 2. Clear their salons_staff.role column
   * 3. Delete role permissions
   * 4. Delete the role (which will cascade delete from staff_role_assignments)
   */
  static async deleteRole(id: string): Promise<boolean> {
    try {
      // Step 1: Find all staff members assigned to this role
      const { data: assignments, error: assignmentsError } = await supabase
        .from('staff_role_assignments')
        .select('staff_id')
        .eq('role_id', id);

      if (assignmentsError) {
        console.error('Error fetching role assignments:', assignmentsError);
        // Continue with deletion even if we can't fetch assignments
      }

      // Step 2: Clear salons_staff.role column for all affected staff members
      if (assignments && assignments.length > 0) {
        const staffIds = assignments.map(a => a.staff_id);
        
        // Update all affected staff members to clear their role column
        const { error: updateError } = await supabase
          .from('salons_staff')
          .update({ role: null })
          .in('id', staffIds);

        if (updateError) {
          console.error('Error clearing salons_staff.role for assigned staff:', updateError);
          // Log warning but continue - role assignments will be cleaned up by cascade
          console.warn('Continuing with role deletion despite error clearing salons_staff.role');
        } else {
          console.log(`Cleared salons_staff.role for ${staffIds.length} staff member(s)`);
        }
      }

      // Step 3: Delete role permissions
      try {
        await this.deleteRolePermissions(id);
      } catch (permError) {
        console.warn('Error deleting role permissions (may not exist):', permError);
        // Continue with role deletion even if permissions don't exist
      }

      // Step 4: Delete the role
      // This will cascade delete from staff_role_assignments if ON DELETE CASCADE is set
      const { error } = await supabase
        .from('staff_roles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting role:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete role:', error);
      throw error;
    }
  }

  /**
   * Get permissions for a role
   */
  static async getRolePermissions(roleId: string): Promise<RolePermissions | null> {
    try {
      // Table will exist after regenerating types - using any for now
      const { data, error } = await (supabase as any)
        .from('staff_role_permissions')
        .select('permissions')
        .eq('role_id', roleId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching role permissions:', error);
        throw error;
      }

      if (!data) {
        return null;
      }

      return (data as any).permissions as RolePermissions;
    } catch (error) {
      console.error('Failed to fetch role permissions:', error);
      throw error;
    }
  }

  /**
   * Get role with permissions
   */
  static async getRoleWithPermissions(roleId: string): Promise<{ role: Role; permissions: RolePermissions | null } | null> {
    try {
      const role = await this.getRoleById(roleId);
      if (!role) {
        return null;
      }

      const permissions = await this.getRolePermissions(roleId);
      return { role, permissions };
    } catch (error) {
      console.error('Failed to fetch role with permissions:', error);
      throw error;
    }
  }

  /**
   * Save or update permissions for a role
   */
  static async saveRolePermissions(roleId: string, permissions: RolePermissions): Promise<RolePermission> {
    try {
      // Check if permissions already exist for this role
      // Table will exist after regenerating types - using any for now
      const { data: existing } = await (supabase as any)
        .from('staff_role_permissions')
        .select('id')
        .eq('role_id', roleId)
        .maybeSingle();

      if (existing) {
        // Update existing permissions
        // Table will exist after regenerating types - using any for now
        const { data, error } = await (supabase as any)
          .from('staff_role_permissions')
          .update({
            permissions: permissions as any, // JSONB type
            updated_at: new Date().toISOString()
          })
          .eq('role_id', roleId)
          .select()
          .single();

        if (error) {
          console.error('Error updating role permissions:', error);
          throw error;
        }

        return data as unknown as RolePermission;
      } else {
        // Create new permissions record
        // Table will exist after regenerating types - using any for now
        const { data, error } = await (supabase as any)
          .from('staff_role_permissions')
          .insert({
            role_id: roleId,
            permissions: permissions as any, // JSONB type
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating role permissions:', error);
          throw error;
        }

        return data as unknown as RolePermission;
      }
    } catch (error) {
      console.error('Failed to save role permissions:', error);
      throw error;
    }
  }

  /**
   * Delete permissions for a role
   */
  static async deleteRolePermissions(roleId: string): Promise<boolean> {
    try {
      // Table will exist after regenerating types - using any for now
      const { error } = await (supabase as any)
        .from('staff_role_permissions')
        .delete()
        .eq('role_id', roleId);

      if (error) {
        console.error('Error deleting role permissions:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete role permissions:', error);
      throw error;
    }
  }

  /**
   * Get all roles with their permissions
   */
  static async getRolesWithPermissions(): Promise<Array<{ role: Role; permissions: RolePermissions | null }>> {
    try {
      const roles = await this.getRoles();
      const rolesWithPermissions = await Promise.all(
        roles.map(async (role) => {
          const permissions = await this.getRolePermissions(role.id);
          return { role, permissions };
        })
      );

      return rolesWithPermissions;
    } catch (error) {
      console.error('Failed to fetch roles with permissions:', error);
      throw error;
    }
  }
}
