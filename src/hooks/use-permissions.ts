"use client";

import { useMemo } from "react";
import { RolePermissions, PermissionSet, RolesApi } from "@/lib/api/rolesApi";

/**
 * Permission checking utility
 * 
 * Module keys should match the keys in allPermissions (placeholder-data.ts):
 * - dashboard
 * - schedule
 * - clients
 * - services
 * - deals
 * - promotions
 * - inventory
 * - procurement
 * - engage
 * - hr / hrm
 * - roles
 * - billing
 * - appointments
 * etc.
 */

export type ModuleKey = 
  | "dashboard"
  | "schedule"
  | "clients"
  | "services"
  | "deals"
  | "promotions"
  | "inventory"
  | "procurement"
  | "engage"
  | "hr"
//   | "hrm"
  | "roles"
  | "billing"
  | "appointments"
  | "staff"
  | "branches"
  | "settings"
  | "reports"
  | "onboardRequests"
  | "rolesPermissions";

interface UserSession {
  id: string;
  role: "SUPER_ADMIN" | "SALON_ADMIN" | "STAFF";
  userType?: "salon" | "customer" | "staff" | "SUPER_ADMIN" | "SALON_ADMIN";
  permissions?: RolePermissions;
}

/**
 * Get current user session from localStorage
 */
function getCurrentUser(): UserSession | null {
  try {
    const sessionData = localStorage.getItem("session");
    if (!sessionData) return null;
    return JSON.parse(sessionData);
  } catch (error) {
    console.error("Error parsing session:", error);
    return null;
  }
}

/**
 * Check if user is admin (Super Admin or Salon Admin)
 */
export function isAdmin(user: UserSession | null): boolean {
  if (!user) return false;
  return user.role === "SUPER_ADMIN" || user.role === "SALON_ADMIN" || user.userType === "salon" || user.userType === "SUPER_ADMIN" || user.userType === "SALON_ADMIN";
}

/**
 * Check if user has permission for a module
 * Admins always have access to all modules
 * For staff, checks permissions from session (returns false if not in session - component should fetch)
 * Also checks if permissions need to be refreshed based on timestamp
 */
export function hasModuleAccess(moduleKey: ModuleKey, user: UserSession | null = null): boolean {
  const currentUser = user || getCurrentUser();
  if (!currentUser) return false;
  
  // Admins have access to all modules
  if (isAdmin(currentUser)) return true;
  
  // Staff members need explicit permission
  if (!currentUser.permissions) {
    // If permissions object exists but is empty, user has no access
    if (currentUser.permissions === null || (typeof currentUser.permissions === 'object' && Object.keys(currentUser.permissions).length === 0)) {
      return false;
    }
    return false;
  }
  
  // Check if permissions were cleared (empty object means no permissions)
  if (typeof currentUser.permissions === 'object' && Object.keys(currentUser.permissions).length === 0) {
    return false;
  }
  
  const modulePermissions = currentUser.permissions[moduleKey];
  if (!modulePermissions) return false;
  
  // If module has any permission (read, create, update, delete), user has access
  return modulePermissions.read === true || 
         modulePermissions.create === true || 
         modulePermissions.update === true || 
         modulePermissions.delete === true;
}

/**
 * Fetch and update permissions in session for a user
 * This is a helper function to be called from components when permissions are not in session
 */
export async function fetchAndUpdatePermissions(userId: string): Promise<RolePermissions | null> {
  try {
    const permissions = await RolesApi.getStaffPermissions(userId);
    
    // Update session with permissions (even if empty/null, to reflect cleared permissions)
    try {
      const sessionData = localStorage.getItem("session");
      if (sessionData) {
        const session = JSON.parse(sessionData);
        // Always update permissions, even if null/empty (to reflect cleared permissions)
        session.permissions = permissions || {};
        session.permissions_updated_at = new Date().toISOString();
        localStorage.setItem("session", JSON.stringify(session));
        // Dispatch event to notify components of session update
        window.dispatchEvent(new CustomEvent("sessionUpdated", { detail: session }));
      }
    } catch (e) {
      console.warn("Failed to update session with permissions:", e);
    }
    
    return permissions;
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return null;
  }
}

/**
 * Check if user has a specific permission type for a module
 * Admins always have all permissions
 */
export function hasPermission(
  moduleKey: ModuleKey,
  permissionType: keyof PermissionSet,
  user: UserSession | null = null
): boolean {
  const currentUser = user || getCurrentUser();
  
  if (!currentUser) return false;
  
  // Admins have all permissions
  if (isAdmin(currentUser)) {
    // Super Admin has delete, Salon Admin might not have delete for some modules
    if (permissionType === "delete" && currentUser.role === "SALON_ADMIN") {
      // Salon Admin might have delete restrictions - check permissions if they exist
      // For now, allow delete for Salon Admin (can be restricted per module later)
      return true;
    }
    return true;
  }
  
  // Staff members need explicit permission
  if (!currentUser.permissions) return false;
  
  const modulePermissions = currentUser.permissions[moduleKey];
  if (!modulePermissions) return false;
  
  // Check specific permission type
  return modulePermissions[permissionType] === true;
}

/**
 * Check if user can perform delete action
 * Non-admin staff should NOT have delete access unless explicitly granted
 */
export function canDelete(moduleKey: ModuleKey, user: UserSession | null = null): boolean {
  const currentUser = user || getCurrentUser();
  
  if (!currentUser) return false;
  
  // Admins can delete (with potential restrictions for Salon Admin)
  if (isAdmin(currentUser)) {
    // Salon Admin might have delete restrictions per module
    // For now, allow delete for all admins
    return true;
  }
  
  // Non-admin staff: Block delete by default (as per requirements)
  // Even if they have delete permission, we block it unless explicitly required
  return false;
  
  // If you need to allow delete for staff in future, uncomment:
  // return hasPermission(moduleKey, "delete", currentUser);
}

/**
 * React hook to check permissions
 */
export function usePermissions() {
  const user = useMemo(() => getCurrentUser(), []);
  
  return {
    user,
    isAdmin: isAdmin(user),
    hasModuleAccess: (moduleKey: ModuleKey) => hasModuleAccess(moduleKey, user),
    hasPermission: (moduleKey: ModuleKey, permissionType: keyof PermissionSet) => 
      hasPermission(moduleKey, permissionType, user),
    // canDelete: (moduleKey: ModuleKey) => canDelete(moduleKey, user),
    canDelete: (moduleKey: ModuleKey) => hasPermission(moduleKey, "delete", user),
    canCreate: (moduleKey: ModuleKey) => hasPermission(moduleKey, "create", user),
    canUpdate: (moduleKey: ModuleKey) => hasPermission(moduleKey, "update", user),
    canRead: (moduleKey: ModuleKey) => hasPermission(moduleKey, "read", user),
  };
}
