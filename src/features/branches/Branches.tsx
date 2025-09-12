
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { branches as initialBranches, users } from "@/lib/placeholder-data";
import { Building, MapPin, Users, Edit, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BranchFormDialog } from "./BranchFormDialog";
import { useToast } from "@/hooks/use-toast";

// Mock user type for prototype
type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "SUPER_ADMIN" | "SALON_ADMIN";
  salonId: string | null;
};

export type Branch = {
  id: string;
  name: string;
  address: string;
};

export function Branches() {
  const [user, setUser] = useState<User | null>(null);
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editingBranch, setEditingBranch] = useState<Branch | undefined>(
    undefined
  );
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const sessionData = localStorage.getItem("session");
    if (sessionData) {
      const currentUser = JSON.parse(sessionData);
      setUser(currentUser);
      // Redirect if a salon admin tries to access this page
      if (currentUser.role === "SALON_ADMIN") {
        router.push("/");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleOpenDialog = (mode: "add" | "edit", branch?: Branch) => {
    setDialogMode(mode);
    setEditingBranch(branch);
    setDialogOpen(true);
  };

  const handleSaveBranch = (branchData: Omit<Branch, "id">) => {
    if (dialogMode === "add") {
      const newBranch = {
        ...branchData,
        id: `branch_${Date.now()}`,
      };
      setBranches((prev) => [newBranch, ...prev]);
      toast({
        title: "Branch Added",
        description: `${newBranch.name} has been successfully created.`,
      });
    } else if (editingBranch) {
      const updatedBranch = { ...editingBranch, ...branchData };
      setBranches((prev) =>
        prev.map((s) => (s.id === updatedBranch.id ? updatedBranch : s))
      );
      toast({
        title: "Branch Updated",
        description: `${updatedBranch.name}'s details have been updated.`,
      });
    }
  };

  // Only render for super admin
  if (!user || user.role !== "SUPER_ADMIN") {
    return (
      <div className="flex items-center justify-center h-full">
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  const branchAdmins = users.filter((u) => u.role === "SALON_ADMIN");

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-4xl font-headline font-bold">All Branches</h1>
            <p className="text-muted-foreground mt-2">
              Manage all your branches from one place.
            </p>
          </div>
          <Button onClick={() => handleOpenDialog("add")}>
            <PlusCircle className="mr-2" />
            Add Branch
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => {
            const admin = branchAdmins.find((a) => a.salonId === branch.id);
            return (
              <Card key={branch.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-primary" />
                        {branch.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <MapPin className="h-4 w-4" />
                        {branch.address}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Admin: {admin ? admin.name : "Not Assigned"}</span>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/50 p-4">
                  <Button
                    className="w-full"
                    onClick={() => handleOpenDialog("edit", branch)}
                  >
                    <Edit className="mr-2" />
                    Edit Branch
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
      <BranchFormDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        branch={editingBranch}
        onSave={handleSaveBranch}
      />
    </>
  );
}
