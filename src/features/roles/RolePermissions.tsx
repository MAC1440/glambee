
"use client";

import { useState } from "react";
import {
  rolesAndPermissions,
  allPermissions,
  type Role,
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
import { ShieldCheck, PlusCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { NewRoleDialog } from "./NewRoleDialog";
import { Label } from "@/components/ui/label";

type PermissionType = keyof PermissionSet;
const permissionTypes: { key: PermissionType; label: string }[] = [
    { key: 'create', label: 'Create' },
    { key: 'read', label: 'Read' },
    { key: 'update', label: 'Update' },
    { key: 'delete', label: 'Delete' },
];

export function RolePermissions() {
  const { toast } = useToast();
  const [rolesData, setRolesData] =
    useState<Role[]>(rolesAndPermissions);
  const [selectedRole, setSelectedRole] = useState<Role>(rolesData[0]);
  const [isNewRoleDialogOpen, setIsNewRoleDialogOpen] = useState(false);

  const handlePermissionChange = (
    moduleKey: string,
    permissionType: PermissionType
  ) => {
    setSelectedRole((prevRole) => {
      const newPermissions = JSON.parse(JSON.stringify(prevRole.permissions));
      if (!newPermissions[moduleKey]) {
        newPermissions[moduleKey] = { create: false, read: false, update: false, delete: false };
      }
      
      const currentPermissions = newPermissions[moduleKey];
      const isChecked = !currentPermissions[permissionType];
      currentPermissions[permissionType] = isChecked;

      // Auto-check 'read' if 'update' or 'delete' is checked
      if ((permissionType === 'update' || permissionType === 'delete') && isChecked) {
        currentPermissions.read = true;
      }
      
      // Auto-uncheck higher permissions if 'read' is unchecked
      if (permissionType === 'read' && !isChecked) {
        currentPermissions.update = false;
        currentPermissions.delete = false;
      }

      return { ...prevRole, permissions: newPermissions };
    });
  };
  
  const handleSelectRole = (roleName: string) => {
    const role = rolesData.find(r => r.name === roleName);
    if(role) {
      setSelectedRole(role);
    }
  }

  const handleSaveChanges = () => {
    setRolesData((prevData) =>
      prevData.map((role) =>
        role.name === selectedRole.name ? selectedRole : role
      )
    );
    toast({
      title: "Permissions Saved",
      description: `Permissions for the ${selectedRole.name} role have been updated.`,
    });
    console.log("Saving new permissions for role:", selectedRole.name);
    console.log(JSON.stringify(selectedRole, null, 2));
  };
  
  const handleSaveNewRole = (newRoleData: { name: string; description: string; }) => {
    const newRole: Role = {
        ...newRoleData,
        permissions: {}
    };
    setRolesData(prev => [...prev, newRole]);
    setSelectedRole(newRole);
    toast({
        title: "Role Created",
        description: `The "${newRole.name}" role has been created.`
    })
  };


  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-4">
        <div className="flex items-center justify-between">
             <h3 className="font-semibold text-lg">Select a Role</h3>
             <Button variant="outline" size="sm" onClick={() => setIsNewRoleDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Role
             </Button>
        </div>
       
        <Select onValueChange={handleSelectRole} value={selectedRole.name}>
          <SelectTrigger>
            <SelectValue placeholder="Select a role to manage" />
          </SelectTrigger>
          <SelectContent>
            {rolesData.map((role) => (
              <SelectItem key={role.name} value={role.name}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
            {selectedRole.description}
        </p>
      </div>

      <div className="md:col-span-2">
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
                     const isChecked = selectedRole.permissions[moduleKey]?.[pt.key] || false;
                     let isDisabled = false;
                      if (pt.key === 'read') {
                        const hasUpdate = selectedRole.permissions[moduleKey]?.update || false;
                        const hasDelete = selectedRole.permissions[moduleKey]?.delete || false;
                        if (hasUpdate || hasDelete) isDisabled = true;
                      }

                    return (
                        <div key={pt.key} className="flex items-center gap-2">
                            <Checkbox
                                id={`${moduleKey}-${pt.key}`}
                                checked={isChecked}
                                disabled={isDisabled}
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
      </div>
    </div>
    <NewRoleDialog
        isOpen={isNewRoleDialogOpen}
        onOpenChange={setIsNewRoleDialogOpen}
        onSave={handleSaveNewRole}
    />
    </>
  );
}
