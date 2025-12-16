
"use client";

import { useState, useEffect } from "react";
import {
  allPermissions,
  type PermissionSet,
} from "@/lib/placeholder-data";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldCheck, Trash2, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RolesApi, type RolePermissions } from "@/lib/api/rolesApi";
import { StaffApi, StaffWithCategories } from "@/lib/api/staffApi";
import { SalonsApi } from "@/lib/api/salonsApi";
import { supabase } from "@/lib/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { hasModuleAccess, usePermissions } from "@/hooks/use-permissions";
import { UnauthorizedAccess } from "@/components/ui/unauthorized-access";
import { checkModuleDependencies, ModuleKey as DependencyModuleKey } from "@/lib/utils/module-dependencies";
import { DependencyWarningDialog } from "@/components/ui/dependency-warning-dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
// Extended Staff type that includes permissions
export type ExtendedStaff = StaffWithCategories & {
  permissions?: {
    [key: string]: Partial<PermissionSet>;
  };
};

type PermissionType = keyof PermissionSet;
const permissionTypes: { key: PermissionType; label: string }[] = [
    { key: 'create', label: 'Create' },
    { key: 'read', label: 'Read' },
    { key: 'update', label: 'Update' },
    { key: 'delete', label: 'Delete' },
];

export function RolePermissions() {
  const { toast } = useToast();
  const [staffData, setStaffData] = useState<ExtendedStaff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<ExtendedStaff | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<ExtendedStaff | null>(null);
  const [email, setEmail] = useState<string>("");
  const [salonId, setSalonId] = useState<string | undefined>(undefined);
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [pendingModuleKey, setPendingModuleKey] = useState<string | null>(null);
  const [pendingPermissionType, setPendingPermissionType] = useState<PermissionType | null>(null);
  const [warningMessages, setWarningMessages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const sessionData = localStorage.getItem("session");

  
  // Get permissions for roles module
  const { canUpdate, canDelete, hasModuleAccess } = usePermissions();
  const rolesModuleKey = "rolesPermissions" as const;
  const hasAccess = hasModuleAccess(rolesModuleKey);

  // Fetch staff members and default salon ID
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get default salon ID
        // let defaultSalonId: string | undefined;
        // try {
        //   const { data: existingSalon } = await supabase
        //     .from('salons')
        //     .select('id')
        //     .limit(1)
        //     .maybeSingle();
          
        //   if (existingSalon) {
        //     defaultSalonId = existingSalon.id;
        //     setSalonId(defaultSalonId);
        //   }
        // } catch (error) {
        //   console.warn('Error fetching default salon:', error);
        // }

        // Fetch staff members for the salon
        const staffResponse = await StaffApi.getStaff({ salonId: JSON.parse(sessionData || '').salonId});
        // const staffResponse = await StaffApi.getStaff({ salonId: defaultSalonId });

        // Fetch permissions for each staff member
        const extendedStaff: ExtendedStaff[] = await Promise.all(
          staffResponse.data.map(async (staff) => {
            const permissions = await RolesApi.getStaffPermissions(staff.id);
            return {
              ...staff,
              permissions: permissions || {}, // Load from DB or use empty object
            };
          })
        );

        setStaffData(extendedStaff);
      } catch (error) {
        console.error("Error loading staff:", error);
        toast({
          title: "Error",
          description: "Failed to load staff members. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const handlePermissionChange = (
    moduleKey: string,
    permissionType: PermissionType
  ) => {
    if (!selectedStaff) return;

    const newPermissions = JSON.parse(JSON.stringify(selectedStaff.permissions || {}));
    if (!newPermissions[moduleKey]) {
      newPermissions[moduleKey] = { create: false, read: false, update: false, delete: false };
    }
    
    const currentPermissions = newPermissions[moduleKey];
    const isChecked = !currentPermissions[permissionType];
    
    // If we're checking a permission (not unchecking), check for dependencies
    if (isChecked) {
      // Temporarily apply the change to check dependencies
      const tempPermissions = { ...newPermissions };
      tempPermissions[moduleKey] = { ...currentPermissions, [permissionType]: true };
      
      // Auto-check 'read' if 'create', 'update', or 'delete' is checked (for dependency check)
      if ((permissionType === 'create' || permissionType === 'update' || permissionType === 'delete')) {
        tempPermissions[moduleKey].read = true;
      }
      
      // Check for dependencies
      const dependencyCheck = checkModuleDependencies(
        moduleKey as DependencyModuleKey,
        tempPermissions
      );
      
      if (dependencyCheck.hasWarning) {
        // Store pending change and show warning
        setPendingModuleKey(moduleKey);
        setPendingPermissionType(permissionType);
        setWarningMessages(dependencyCheck.warnings);
        setWarningDialogOpen(true);
        return; // Don't apply change yet
      }
    }

    // Apply the change directly if no warnings
    applyPermissionChange(moduleKey, permissionType, isChecked);
  };

  const applyPermissionChange = (
    moduleKey: string,
    permissionType: PermissionType,
    isChecked: boolean
  ) => {
    if (!selectedStaff) return;

    setSelectedStaff((prevStaff) => {
      if (!prevStaff) return prevStaff;

      const newPermissions = JSON.parse(JSON.stringify(prevStaff.permissions || {}));
      if (!newPermissions[moduleKey]) {
        newPermissions[moduleKey] = { create: false, read: false, update: false, delete: false };
      }
      
      const currentPermissions = newPermissions[moduleKey];
      currentPermissions[permissionType] = isChecked;

      // Auto-check 'read' if 'create', 'update', or 'delete' is checked
      if ((permissionType === 'create' || permissionType === 'update' || permissionType === 'delete') && isChecked) {
        currentPermissions.read = true;
      }
      
      // Auto-uncheck higher permissions if 'read' is unchecked
      if (permissionType === 'read' && !isChecked) {
        currentPermissions.update = false;
        currentPermissions.delete = false;
        currentPermissions.create = false;
      }

      return { ...prevStaff, permissions: newPermissions };
    });
  };
  
  const handleWarningContinue = () => {
    if (pendingModuleKey && pendingPermissionType !== null) {
      // Apply the pending permission change
      const isChecked = true; // We only show warning when checking, not unchecking
      applyPermissionChange(pendingModuleKey, pendingPermissionType, isChecked);
    }
    
    // Close dialog and reset pending state
    setWarningDialogOpen(false);
    setPendingModuleKey(null);
    setPendingPermissionType(null);
    setWarningMessages([]);
  };

  const handleWarningCancel = () => {
    // Don't apply the change, just close the dialog
    setWarningDialogOpen(false);
    setPendingModuleKey(null);
    setPendingPermissionType(null);
    setWarningMessages([]);
  };
  
  const handleSelectStaff = async (staffId: string) => {
    const staff = staffData.find(s => s.id === staffId);
    if (staff) {
      // Load permissions from database for the selected staff member
      try {
        const permissions = await RolesApi.getStaffPermissions(staffId);
        setSelectedStaff({
          ...staff,
          permissions: permissions || {},
        });
      } catch (error) {
        console.error("Error loading permissions:", error);
        // If error, use cached permissions
        setSelectedStaff(staff);
      }
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedStaff || saving) return;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to send permissions notification.",
        variant: "destructive",
      });
      return;
    }

    if (!emailRegex.test(email.trim())) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address (e.g., example@domain.com).",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      // Save permissions to database for the staff member
      await RolesApi.saveStaffPermissions(selectedStaff.id, selectedStaff.permissions || {});

      // Get salon owner name and email from session and salon data
      const session = sessionData ? JSON.parse(sessionData) : null;
      const salonOwnerName = session?.name || "Salon Owner";
      const currentSalonId = session?.salonId || salonId;

      if (!currentSalonId) {
        toast({
          title: "Error",
          description: "Salon ID not found. Please refresh the page.",
          variant: "destructive",
        });
        return;
      }

      // Fetch salon data to get salon owner email
      let salonOwnerEmail: string | null = null;
      try {
        const salonData = await SalonsApi.getSalonById(currentSalonId);
        salonOwnerEmail = salonData?.email || null;
      } catch (error) {
        console.warn("Failed to fetch salon email:", error);
        // Continue without salon email - will use fallback
      }

      // Generate CRM link with salon ID parameter
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const crmLink = `${baseUrl}/auth?salonId=${currentSalonId}&staffEmail=${email}`;

      // Send email with permissions
      const emailResponse = await fetch("/api/email/send-permissions-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          staffName: selectedStaff.name || "Staff Member",
          salonOwnerName: salonOwnerName,
          salonOwnerEmail: salonOwnerEmail, // Pass salon owner email
          permissions: selectedStaff.permissions || {},
          salonId: currentSalonId,
          crmLink: crmLink,
        }),
      });

      const emailResult = await emailResponse.json();

      if (!emailResponse.ok) {
        throw new Error(emailResult.error || "Failed to send email");
      }

      // Update local state
      setStaffData((prevData) =>
        prevData.map((staff) =>
          staff.id === selectedStaff.id
            ? {
              ...selectedStaff,
              permissions: selectedStaff.permissions || {}
            }
            : staff
        )
      );

      // If the affected staff member is currently logged in, update their session
      try {
        const currentSessionData = localStorage.getItem("session");
        if (currentSessionData) {
          const currentSession = JSON.parse(currentSessionData);
          
          // Check if the affected staff member is the currently logged-in user
          if (currentSession.id === selectedStaff.id) {
            // Update session with new permissions
            currentSession.permissions = selectedStaff.permissions || {};
            currentSession.permissions_updated_at = new Date().toISOString();
            localStorage.setItem("session", JSON.stringify(currentSession));
            
            // Dispatch session update event to refresh UI
            window.dispatchEvent(new CustomEvent("sessionUpdated", { detail: currentSession }));
            
          }
        }
      } catch (sessionError) {
        console.warn("Failed to update session for affected staff member:", sessionError);
        // Don't fail the whole operation if session update fails
      }

      toast({
        title: "Permissions Updated & Email Sent",
        description: `Permissions for ${selectedStaff.name} have been saved and email sent to ${email}.`,
        style: {
          backgroundColor: "lightgreen",
          color: "black",
        }
      });

      // Clear email field
      setEmail("");
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update permissions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };


  const handleDeletePermissions = async () => {
    if (!staffToDelete) return;

    try {
      // Delete permissions for the staff member
      await RolesApi.deleteStaffPermissions(staffToDelete.id);

      // Update local state - remove permissions
      setStaffData((prevData) =>
        prevData.map((staff) =>
          staff.id === staffToDelete.id
            ? { ...staff, permissions: {} }
            : staff
        )
      );

      // Clear selected staff if it was the deleted one
      if (selectedStaff?.id === staffToDelete.id) {
        setSelectedStaff(null);
      }

      // If the affected staff member is currently logged in, update their session
      try {
        const currentSessionData = localStorage.getItem("session");
        if (currentSessionData) {
          const currentSession = JSON.parse(currentSessionData);
          
          // Check if the affected staff member is the currently logged-in user
          if (currentSession.id === staffToDelete.id) {
            // Update session to remove permissions
            currentSession.permissions = {};
            // Add a timestamp to force refresh on next check
            currentSession.permissions_updated_at = new Date().toISOString();
            localStorage.setItem("session", JSON.stringify(currentSession));
            
            // Dispatch session update event to refresh UI
            window.dispatchEvent(new CustomEvent("sessionUpdated", { detail: currentSession }));
            
          }
        }
      } catch (sessionError) {
        console.warn("Failed to update session for affected staff member:", sessionError);
        // Don't fail the whole operation if session update fails
      }

      toast({
        title: "Permissions Deleted",
        description: `Permissions for "${staffToDelete.name}" have been removed.`,
        style: {
          backgroundColor: "lightgreen",
          color: "black",
        }
      });

      setDeleteDialogOpen(false);
      setStaffToDelete(null);
    } catch (error: any) {
      console.error("Error deleting permissions:", error);

      toast({
        title: "Error",
        description: "Failed to delete permissions. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (staff: ExtendedStaff) => {
    setStaffToDelete(staff);
    setDeleteDialogOpen(true);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading staff members...</p>
      </div>
    );
  }

  // if (staffData.length === 0) {
  //   return (
  //     <div className="flex flex-col items-center justify-center py-8 space-y-4">
  //       <p className="text-muted-foreground">No staff members found. Add staff members to assign permissions.</p>
  //     </div>
  //   );
  // }

  // if (hasAccess === false) {
  //   return <UnauthorizedAccess moduleName="Role Permissions" />;
  // }

  return (
    <>
      <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-4">
        <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Select a Staff Member</h3>
        </div>
       
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Select
                  onValueChange={handleSelectStaff}
                  value={selectedStaff?.id || ""}
                >
          <SelectTrigger>
                    <SelectValue placeholder="Select a staff member to manage permissions" />
          </SelectTrigger>
          <SelectContent>
                    {staffData.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.name || "Unnamed Staff"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
              </div>
              {selectedStaff && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setSelectedStaff(null)}
                  title="Clear selection"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {selectedStaff && (
              <div className="border rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-base mb-4">Selected Staff</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <p className="font-medium text-lg">{selectedStaff.name || "Unnamed Staff"}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedStaff.phone_number || "No phone number"}
                    </p>
                    {selectedStaff.role && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Role: {selectedStaff.role}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    {canDelete(rolesModuleKey) && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog(selectedStaff)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear Permissions
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

      </div>

      <div className="md:col-span-2">
            {selectedStaff ? (
              <>
        <div className="flex justify-between items-center mb-4">
             <h3 className="font-semibold text-lg">
                    Permissions for {selectedStaff.name || "Staff Member"}
            </h3>
                  {/* <Button onClick={handleSaveChanges}>Save Changes</Button> */}
        </div>
       
        <ScrollArea className="h-96 border rounded-md">
          <div className="space-y-1 p-4">
            {Object.entries(allPermissions).map(([moduleKey, moduleName]) => (
              <div key={moduleKey} className="rounded-md border p-4">
                <h4 className="font-medium text-base mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  {moduleName}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pl-7">
                  {permissionTypes.map(pt => {
                            const isChecked = selectedStaff.permissions?.[moduleKey]?.[pt.key] || false;

                    return (
                        <div key={pt.key} className="flex items-center gap-2">
                            <Checkbox
                                id={`${moduleKey}-${pt.key}`}
                                checked={isChecked}
                                  // disabled={isDisabled}
                                onCheckedChange={() => handlePermissionChange(moduleKey, pt.key)}
                            />
                            <Label htmlFor={`${moduleKey}-${pt.key}`} className="text-sm font-normal">
                                {pt.label}
                            </Label>
                        </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
              </>
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Please select a staff member to manage permissions.</p>
              </div>
            )}
          </div>
        </div>

        {/** Email input field centered between Select a Staff Member and Permissions sections */}
        {selectedStaff && (
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 w-full max-w-md">
              <Input 
                type="email" 
                placeholder="Enter email" 
                className="flex-1" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                disabled={saving}
              />
              {canUpdate(rolesModuleKey) && (
                <Button onClick={handleSaveChanges} disabled={saving}>
                  {saving ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Permissions</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear all permissions for "{staffToDelete?.name}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePermissions} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Clear Permissions
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {pendingModuleKey && (
        <DependencyWarningDialog
          open={warningDialogOpen}
          onOpenChange={setWarningDialogOpen}
          moduleKey={pendingModuleKey as DependencyModuleKey}
          warnings={warningMessages}
          onContinue={handleWarningContinue}
          onCancel={handleWarningCancel}
        />
      )}
    </>
  );
}
