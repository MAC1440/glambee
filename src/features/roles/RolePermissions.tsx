
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
import { ShieldCheck, PlusCircle, Trash2, X } from "lucide-react";
import { NewRoleDialog } from "./NewRoleDialog";
import { Label } from "@/components/ui/label";
import { RolesApi, Role, type RolePermissions } from "@/lib/api/rolesApi";
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

// Extended Role type that includes description and permissions (not in DB yet)
export type ExtendedRole = Role & {
  description?: string;
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
  const [rolesData, setRolesData] = useState<ExtendedRole[]>([]);
  // console.log("Roles data: ", rolesData)
  const [selectedRole, setSelectedRole] = useState<ExtendedRole | null>(null);
  const [isNewRoleDialogOpen, setIsNewRoleDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<ExtendedRole | null>(null);

  // Fetch roles from API
  useEffect(() => {
    const loadRoles = async () => {
      try {
        setLoading(true);
        const apiRoles = await RolesApi.getRoles();

        // Fetch permissions for each role
        const extendedRoles: ExtendedRole[] = await Promise.all(
          apiRoles.map(async (role) => {
            const permissions = await RolesApi.getRolePermissions(role.id);
            return {
              ...role,
              description: (role as any).description || "", // Use description from DB or empty string
              permissions: permissions || {}, // Load from DB or use empty object
            };
          })
        );

        setRolesData(extendedRoles);
      } catch (error) {
        console.error("Error loading roles:", error);
        toast({
          title: "Error",
          description: "Failed to load roles. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadRoles();
  }, [toast]);

  const handlePermissionChange = (
    moduleKey: string,
    permissionType: PermissionType
  ) => {
    if (!selectedRole) return;

    setSelectedRole((prevRole) => {
      if (!prevRole) return prevRole;

      const newPermissions = JSON.parse(JSON.stringify(prevRole.permissions || {}));
      if (!newPermissions[moduleKey]) {
        newPermissions[moduleKey] = { create: false, read: false, update: false, delete: false };
      }

      const currentPermissions = newPermissions[moduleKey];
      const isChecked = !currentPermissions[permissionType];
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

      return { ...prevRole, permissions: newPermissions };
    });
  };

  const handleSelectRole = async (roleId: string) => {
    const role = rolesData.find(r => r.id === roleId);
    if (role) {
      // Load permissions from database for the selected role
      try {
        const permissions = await RolesApi.getRolePermissions(roleId);
        setSelectedRole({
          ...role,
          permissions: permissions || {},
        });
      } catch (error) {
        console.error("Error loading permissions:", error);
        // If error, use cached permissions
        setSelectedRole(role);
      }
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedRole) return;

    try {
      // Update role name and description in database
      const updatedRole = await RolesApi.updateRole(selectedRole.id, {
        name: selectedRole.name,
        description: selectedRole.description || null,
      });

      if (!updatedRole) {
        throw new Error("Failed to update role");
      }

      // Save permissions to database
      await RolesApi.saveRolePermissions(selectedRole.id, selectedRole.permissions || {});

      // Update local state with the updated role from DB
      setRolesData((prevData) =>
        prevData.map((role) =>
          role.id === selectedRole.id
            ? {
              ...selectedRole,
              description: (updatedRole as any).description || selectedRole.description || ""
            }
            : role
        )
      );

      toast({
        title: "Role Updated",
        description: `The ${selectedRole.name} role and its permissions have been saved.`,
        style: {
          backgroundColor: "lightgreen",
          color: "black",
        }
      });
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveNewRole = async (newRoleData: { name: string; description?: string | null; }, isEditing: boolean) => {
    try {
      if (isEditing && selectedRole) {
        // Update existing role
        const updatedRole = await RolesApi.updateRole(selectedRole.id, {
          name: newRoleData.name,
          description: newRoleData.description || null,
        });

        if (!updatedRole) {
          throw new Error("Failed to update role");
        }

        // Update local state
        const updatedExtendedRole: ExtendedRole = {
          ...updatedRole,
          description: (updatedRole as any).description || newRoleData.description || "",
          permissions: selectedRole.permissions || {},
        };

        setRolesData((prevData) =>
          prevData.map((role) =>
            role.id === selectedRole.id ? updatedExtendedRole : role
          )
        );

        // Update selected role
        setSelectedRole(updatedExtendedRole);

        toast({
          title: "Role Updated",
          description: `The "${updatedRole.name}" role has been updated.`,
          style: {
            backgroundColor: "lightgreen",
            color: "black",
          }
        });
      } else {
        // Create new role
        const createdRole = await RolesApi.createRole({
          name: newRoleData.name,
          description: newRoleData.description || null,
        });

        // Create extended role with description and permissions
        const newRole: ExtendedRole = {
          ...createdRole,
          description: (createdRole as any).description || newRoleData.description || "",
          permissions: {},
        };

        // Create empty permissions record in database
        await RolesApi.saveRolePermissions(createdRole.id, {});

        setRolesData((prev) => [...prev, newRole]);
        setSelectedRole(newRole);

        toast({
          title: "Role Created",
          description: `The "${newRole.name}" role has been created.`,
          style: {
            backgroundColor: "lightgreen",
            color: "black",
          }
        });
      }
    } catch (error) {
      console.error("Error saving role:", error);
      toast({
        title: "Error",
        description: isEditing ? "Failed to update role. Please try again." : "Failed to create role. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;

    try {
      // Delete the role (this will also clean up permissions, staff assignments, and salons_staff.role)
      await RolesApi.deleteRole(roleToDelete.id);

      // Remove from local state
      const updatedRoles = rolesData.filter((r) => r.id !== roleToDelete.id);
      setRolesData(updatedRoles);

      // Clear selected role
      setSelectedRole(null);

      toast({
        title: "Role Deleted",
        description: `The "${roleToDelete.name}" role has been deleted.`,
        style: {
          backgroundColor: "lightgreen",
          color: "black",
        }
      });

      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    } catch (error: any) {
      console.error("Error deleting role:", error);

      let errorMessage = "Failed to delete role. ";
      if (error?.message?.includes('foreign key') || error?.code === '23503') {
        errorMessage += "This role may be assigned to staff members and cannot be deleted.";
      } else {
        errorMessage += "Please try again.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (role: ExtendedRole) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading roles...</p>
      </div>
    );
  }

  if (rolesData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <p className="text-muted-foreground">No roles found. Create your first role to get started.</p>
        <Button onClick={() => setIsNewRoleDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Role
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Select a Role</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setSelectedRole(null);
                setIsNewRoleDialogOpen(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Role
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Select
                onValueChange={handleSelectRole}
                value={selectedRole?.id || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role to manage" />
                </SelectTrigger>
                <SelectContent>
                  {rolesData.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedRole && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setSelectedRole(null)}
                title="Clear selection"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {selectedRole && (
            <div className="border rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-base mb-4">Selected Role</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                  <p className="font-medium text-lg">{selectedRole.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedRole.description || "No description provided."}
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    // variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsNewRoleDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openDeleteDialog(selectedRole)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>

        <div className="md:col-span-2">
          {selectedRole ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">
                  Permissions for {selectedRole.name}
                </h3>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
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
                          const isChecked = selectedRole.permissions?.[moduleKey]?.[pt.key] || false;
                          let isDisabled = false;
                          // if (pt.key === 'read') {
                          //   const hasUpdate = selectedRole.permissions?.[moduleKey]?.update || false;
                          //   const hasDelete = selectedRole.permissions?.[moduleKey]?.delete || false;
                          //   if (hasUpdate || hasDelete) isDisabled = true;
                          // }

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
              <p className="text-muted-foreground">Please select a role to manage permissions.</p>
            </div>
          )}
        </div>
      </div>

      <NewRoleDialog
        isOpen={isNewRoleDialogOpen}
        onOpenChange={setIsNewRoleDialogOpen}
        onSave={handleSaveNewRole}
        editingRole={selectedRole}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the "{roleToDelete?.name}" role?
              This action cannot be undone. If this role is assigned to staff members,
              you must remove those assignments first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRole} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
