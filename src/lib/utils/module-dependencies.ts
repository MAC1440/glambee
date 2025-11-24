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
    reason: "Without client permissions, staff will not be able to:\n• Select clients when booking appointments\n• View client information in appointment details\n• Search for existing clients\n• Create new client records during booking\n• Access client appointment history"
  },
  {
    module: "schedule",
    dependsOn: ["clients"],
    reason: "Without client permissions, staff will not be able to:\n• View client names in appointments\n• Search or filter appointments by client\n• See client contact information\n• Create appointments for clients\n• Access client history from schedule view"
  },
  {
    module: "appointments",
    dependsOn: ["services"],
    reason: "Without service permissions, staff will not be able to:\n• Add services to appointments\n• View available services for booking\n• See service pricing and duration\n• Select service types during booking\n• Calculate appointment duration based on services"
  },
  {
    module: "schedule",
    dependsOn: ["services"],
    reason: "Without service permissions, staff will not be able to:\n• View service names in appointments\n• See service duration and pricing\n• Add services to appointments\n• Filter appointments by service type\n• Access service details from schedule view"
  },
  {
    module: "billing",
    dependsOn: ["clients", "appointments"],
    reason: "Without client and appointment permissions, staff will not be able to:\n• Select clients for billing\n• Link bills to appointments\n• View client billing history\n• Generate invoices for appointments\n• Access appointment details for billing"
  },
  {
    module: "engage",
    dependsOn: ["clients"],
    reason: "Without client permissions, staff will not be able to:\n• Select clients for messaging campaigns\n• Send messages to specific clients\n• View client contact information\n• Filter clients for engagement activities\n• Create targeted client campaigns"
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
      warnings.push(`${dependency.reason}`);
      // warnings.push(`${dependency.reason} Missing permissions for: ${missingModuleNames}`);
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

