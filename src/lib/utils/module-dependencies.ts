/**
 * Module Dependencies Utility
 * Defines which modules depend on other modules for proper functionality
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
  | "roles"
  | "billing"
  | "appointments"
  | "staff"
  | "branches"
  | "settings"
  | "reports"
  | "onboardRequests"
  | "rolesPermissions";

export interface ModuleDependency {
  module: ModuleKey;
  dependsOn: ModuleKey[];
  reason: string;
}

/**
 * Module dependency mappings
 * Defines which modules require other modules to function properly
 */
export const moduleDependencies: ModuleDependency[] = [
  {
    module: "appointments",
    dependsOn: ["clients"],
    reason: "Appointments require selecting clients to book appointments. Without client permissions, staff cannot create or manage appointments."
  },
  {
    module: "schedule",
    dependsOn: ["clients"],
    reason: "Schedule management requires client access to view and manage appointments. Without client permissions, staff cannot see client information in the schedule."
  },
  {
    module: "appointments",
    dependsOn: ["services"],
    reason: "Appointments require selecting services to book. Without service permissions, staff cannot add services to appointments."
  },
  {
    module: "schedule",
    dependsOn: ["services"],
    reason: "Schedule management requires service access to view and manage service bookings. Without service permissions, staff cannot see service details in the schedule."
  },
  {
    module: "billing",
    dependsOn: ["clients", "appointments"],
    reason: "Billing requires access to clients and appointments to generate invoices. Without these permissions, staff cannot create bills for clients or appointments."
  },
  {
    module: "engage",
    dependsOn: ["clients"],
    reason: "Engage features require client access to send messages and campaigns. Without client permissions, staff cannot select clients for engagement activities."
  }
];

/**
 * Get dependencies for a specific module
 */
export function getModuleDependencies(moduleKey: ModuleKey): ModuleDependency | undefined {
  return moduleDependencies.find(dep => dep.module === moduleKey);
}

/**
 * Check if a module has unmet dependencies based on current permissions
 * Returns warnings for missing dependencies
 */
export function checkModuleDependencies(
  moduleKey: ModuleKey,
  currentPermissions: { [key: string]: { read?: boolean; create?: boolean; update?: boolean; delete?: boolean } }
): { hasWarning: boolean; warnings: string[] } {
  const dependency = getModuleDependencies(moduleKey);
  
  if (!dependency) {
    return { hasWarning: false, warnings: [] };
  }

  const warnings: string[] = [];
  const missingModules: ModuleKey[] = [];
  
  // Check if the module itself has any permissions (if not, no need to warn)
  const moduleHasPermissions = currentPermissions[moduleKey]?.read || 
                                currentPermissions[moduleKey]?.create || 
                                currentPermissions[moduleKey]?.update ||
                                currentPermissions[moduleKey]?.delete;
  
  // Only check dependencies if the module has permissions
  if (moduleHasPermissions) {
    for (const requiredModule of dependency.dependsOn) {
      const hasAccess = currentPermissions[requiredModule]?.read || 
                        currentPermissions[requiredModule]?.create || 
                        currentPermissions[requiredModule]?.update;
      
      if (!hasAccess) {
        missingModules.push(requiredModule);
      }
    }
    
    // If any dependencies are missing, show warning with details
    if (missingModules.length > 0) {
      const missingModuleNames = missingModules.map(m => getModuleName(m)).join(", ");
      warnings.push(`${dependency.reason} Missing permissions for: ${missingModuleNames}`);
    }
  }

  return {
    hasWarning: warnings.length > 0,
    warnings
  };
}

/**
 * Check all modules for dependency warnings
 * Returns a map of module keys to their warnings
 */
export function checkAllDependencies(
  permissions: { [key: string]: { read?: boolean; create?: boolean; update?: boolean; delete?: boolean } }
): Map<ModuleKey, string[]> {
  const warnings = new Map<ModuleKey, string[]>();
  
  for (const dependency of moduleDependencies) {
    const { warnings: moduleWarnings } = checkModuleDependencies(dependency.module, permissions);
    if (moduleWarnings.length > 0) {
      warnings.set(dependency.module, moduleWarnings);
    }
  }
  
  return warnings;
}

/**
 * Get a human-readable module name
 */
export function getModuleName(moduleKey: ModuleKey): string {
  const moduleNames: Record<ModuleKey, string> = {
    dashboard: "Dashboard",
    schedule: "Schedule",
    clients: "Clients",
    services: "Services",
    deals: "Deals",
    promotions: "Promotions",
    inventory: "Inventory",
    procurement: "Procurement",
    engage: "Engage",
    hr: "Human Resources",
    roles: "Roles",
    billing: "Billing",
    appointments: "Appointments",
    staff: "Staff",
    branches: "Branches",
    settings: "Settings",
    reports: "Reports",
    onboardRequests: "Onboarding Requests",
    rolesPermissions: "Roles & Permissions"
  };
  
  return moduleNames[moduleKey] || moduleKey;
}

