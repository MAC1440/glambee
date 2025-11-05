
"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { StaffApi, StaffWithCategories } from "@/lib/api/staffApi";
import { RolesApi, Role } from "@/lib/api/rolesApi";
import { supabase } from "@/lib/supabase/client";

export function StaffRoles() {
  const [staff, setStaff] = useState<StaffWithCategories[]>([]);
  // console.log("Staffs: ", staff)
  const [roles, setRoles] = useState<Role[]>([]);
  // console.log("Roles: ", roles)
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch staff with roles and available roles
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get default salon ID (optional - if not found, fetch all staff)
        let salonId: string | undefined;
        // try {
        //   const { data: existingSalon } = await supabase
        //     .from('salons')
        //     .select('id')
        //     .limit(1)
        //     .maybeSingle();
          
        //   if (existingSalon) {
        //     salonId = existingSalon.id;
        //     console.log('Using salon filter:', salonId);
        //   } else {
        //     console.log('No salon found - fetching all staff');
        //   }
        // } catch (error) {
        //   console.warn('Error fetching default salon (fetching all staff):', error);
        //   // Continue without salon filter - fetch all staff
        // }

        // Fetch roles
        // console.log('Fetching roles...');
        const rolesData = await RolesApi.getRoles();
        setRoles(rolesData);
        // console.log(`Loaded ${rolesData.length} roles`);

        // Fetch staff with their assigned roles
        // If salonId is undefined, it will fetch ALL staff regardless of salon_id
        // console.log('Fetching staff with roles...');
        const staffData = await StaffApi.getStaffWithRoles(salonId);
        setStaff(staffData);
        // console.log(`Loaded ${staffData.length} staff members`);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load staff and roles. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const handleRoleChange = async (staffId: string, roleId: string) => {
    try {
      // Update in database
      await StaffApi.assignRoleToStaff(staffId, roleId);

      // Update local state
      const selectedRole = roles.find(r => r.id === roleId);
      setStaff((prevStaff) =>
        prevStaff.map((member) =>
          member.id === staffId
            ? {
                ...member,
                assignedRole: selectedRole
                  ? { id: selectedRole.id, name: selectedRole.name }
                  : null,
              }
            : member
        )
      );

      const staffName = staff.find((s) => s.id === staffId)?.name;
      const roleName = selectedRole?.name || "Unknown";

      toast({
        title: "Staff Role Updated",
        description: `${staffName}'s role has been changed to ${roleName}.`,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading staff and roles...</p>
      </div>
    );
  }

  if (staff.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">No staff members found.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Staff Member</TableHead>
          <TableHead className="w-48">Assigned Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {staff.map((member) => (
          <TableRow key={member.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={member.avatar || `https://picsum.photos/seed/${member.name}/100`}
                    alt="Avatar"
                  />
                  <AvatarFallback>
                    {member.name ? member.name.charAt(0).toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="font-medium">{member.name}</div>
              </div>
            </TableCell>
            <TableCell>
              <Select
                value={member.assignedRole?.id || ""}
                onValueChange={(roleId) => handleRoleChange(member.id, roleId)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
