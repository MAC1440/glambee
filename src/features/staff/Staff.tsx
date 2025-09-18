
"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { staff as initialStaff } from "@/lib/placeholder-data";
import { PlusCircle, MoreHorizontal, Edit, Trash2, NotebookPen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StaffFormDialog } from "./StaffFormDialog";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { StaffDetailDialog } from "./StaffDetailDialog";

export type StaffMember = {
  id: string;
  name: string;
  role: string;
  department: string;
  salonId: string;
  skills: string[];
  commission: number;
  shiftTimings: string;
};

export type Feedback = {
  id: string;
  date: string;
  author: string;
  note: string;
};


export function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editingStaff, setEditingStaff] = useState<StaffMember | undefined>(
    undefined
  );
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | undefined>(
    undefined
  );
  const { toast } = useToast();

  const getDepartmentColor = (department: string) => {
    switch (department.toLowerCase()) {
      case "stylist":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
      case "nail artist":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300";
      case "receptionist":
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
      case "manager":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300";
      case "assistant":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300";
    }
  };

  const handleOpenDialog = (mode: "add" | "edit", member?: StaffMember) => {
    setDialogMode(mode);
    setEditingStaff(member);
    setDialogOpen(true);
  };
  
  const handleOpenDetailDialog = (member: StaffMember) => {
    setSelectedStaff(member);
    setDetailDialogOpen(true);
  }

  const handleSaveStaff = (staffData: Omit<StaffMember, "id" | "salonId">) => {
    if (dialogMode === "add") {
      const newStaff = {
        ...staffData,
        id: `staff_${Date.now()}`,
        salonId: "salon_01", // Default salon for prototype
      };
      setStaff((prev) => [newStaff, ...prev]);
      toast({
        title: "Success",
        description: `${newStaff.name} has been added.`,
      });
    } else if (editingStaff) {
      const updatedStaff = { ...editingStaff, ...staffData };
      setStaff((prev) =>
        prev.map((s) => (s.id === updatedStaff.id ? updatedStaff : s))
      );
      toast({
        title: "Success",
        description: `${updatedStaff.name}'s details have been updated.`,
      });
    }
  };

  const handleDeleteStaff = (staffId: string) => {
    const staffName = staff.find((s) => s.id === staffId)?.name || "The member";
    setStaff((prev) => prev.filter((s) => s.id !== staffId));
    toast({
      title: "Deleted",
      description: `${staffName} has been removed from the team.`,
    });
  };

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-4xl font-headline font-bold">
              Staff Management
            </h1>
            <p className="text-muted-foreground mt-2">
              View and manage your team members.
            </p>
          </div>
          <Button onClick={() => handleOpenDialog("add")}>
            <PlusCircle className="mr-2" />
            Add Staff Member
          </Button>
        </div>

        <AlertDialog>
          <Card>
            <CardHeader>
              <CardTitle>All Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member) => {
                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage
                                src={`https://picsum.photos/seed/${member.name}/100`}
                                alt="Avatar"
                              />
                              <AvatarFallback>
                                {member.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{member.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                           <Badge
                            variant="outline"
                            className={getDepartmentColor(member.department)}
                          >
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {member.commission}%
                        </TableCell>
                        <TableCell>
                          {member.shiftTimings}
                        </TableCell>
                         <TableCell>
                           <div className="flex flex-wrap gap-1">
                            {member.skills.map(skill => (
                                <Badge key={skill} variant="secondary">{skill}</Badge>
                            ))}
                           </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                               <DropdownMenuItem
                                onClick={() => handleOpenDetailDialog(member)}
                              >
                                <NotebookPen className="mr-2 h-4 w-4" /> View Details & Feedback
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenDialog("edit", member)}
                              >
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-red-500 focus:text-red-500">
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>

                           <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete {member.name} from
                                your staff list. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteStaff(member.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </AlertDialog>
      </div>
      <StaffFormDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        staffMember={editingStaff}
        onSave={handleSaveStaff}
      />
      {selectedStaff && (
         <StaffDetailDialog
            isOpen={detailDialogOpen}
            onOpenChange={setDetailDialogOpen}
            staffMember={selectedStaff}
        />
      )}
    </>
  );
}
