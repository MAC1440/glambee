
"use client";

import { useState } from "react";
import {
  staff as initialStaff,
  rolesAndPermissions,
} from "@/lib/placeholder-data";
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
import type { StaffMember } from "@/features/staff/Staff";

export function StaffRoles() {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const { toast } = useToast();

  const handleRoleChange = (staffId: string, newRole: string) => {
    setStaff((prevStaff) =>
      prevStaff.map((member) =>
        member.id === staffId ? { ...member, role: newRole } : member
      )
    );
    const staffName = staff.find(s => s.id === staffId)?.name;
    toast({
      title: "Role Updated",
      description: `${staffName}'s role has been changed to ${newRole}.`,
    });
  };

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
                    src={`https://picsum.photos/seed/${member.name}/100`}
                    alt="Avatar"
                  />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="font-medium">{member.name}</div>
              </div>
            </TableCell>
            <TableCell>
              <Select
                value={member.role}
                onValueChange={(newRole) => handleRoleChange(member.id, newRole)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {rolesAndPermissions.map((role) => (
                    <SelectItem key={role.name} value={role.name}>
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
