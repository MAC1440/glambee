
"use client";

import { useState } from "react";
import {
  rolesAndPermissions,
  allPermissions,
  type Role,
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

export function RolePermissions() {
  const { toast } = useToast();
  const [rolesData, setRolesData] =
    useState<Role[]>(rolesAndPermissions);
  const [selectedRole, setSelectedRole] = useState<Role>(rolesData[0]);
  const [isNewRoleDialogOpen, setIsNewRoleDialogOpen] = useState(false);

  const handlePermissionChange = (
    permissionKey: string,
    permissionType: "read" | "write"
  ) => {
    setSelectedRole((prevRole) => {
      const newPermissions = { ...prevRole.permissions };
      if (!newPermissions[permissionKey]) {
        newPermissions[permissionKey] = { read: false, write: false };
      }
      newPermissions[permissionKey][permissionType] =
        !newPermissions[permissionKey][permissionType];

      // If 'write' is enabled, 'read' must also be enabled
      if (
        permissionType === "write" &&
        newPermissions[permissionKey].write === true
      ) {
        newPermissions[permissionKey].read = true;
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
       
        <ScrollArea className="h-96 border rounded-md p-4">
          <div className="space-y-4">
            {Object.entries(allPermissions).map(([module, permissions]) => (
              <div key={module}>
                <h4 className="font-medium text-base mb-2 capitalize">{module.replace(/([A-Z])/g, ' $1')}</h4>
                <div className="space-y-2 pl-4">
                  {permissions.map((permission) => {
                    const hasRead =
                      selectedRole.permissions[permission.key]?.read || false;
                    const hasWrite =
                      selectedRole.permissions[permission.key]?.write || false;

                    return (
                      <div
                        key={permission.key}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                          <span>{permission.label}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`${permission.key}-read`}
                              checked={hasRead}
                              onCheckedChange={() =>
                                handlePermissionChange(permission.key, "read")
                              }
                              disabled={hasWrite}
                            />
                            <label htmlFor={`${permission.key}-read`} className="text-sm">Read</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`${permission.key}-write`}
                              checked={hasWrite}
                              onCheckedChange={() =>
                                handlePermissionChange(permission.key, "write")
                              }
                            />
                             <label htmlFor={`${permission.key}-write`} className="text-sm">Write</label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                 <Separator className="mt-4" />
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
