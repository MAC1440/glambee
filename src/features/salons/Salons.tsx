
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
import { salons as initialSalons, users } from "@/lib/placeholder-data";
import { Building, MapPin, Users, Edit, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SalonFormDialog } from "./SalonFormDialog";
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

export type Salon = {
  id: string;
  name: string;
  address: string;
};

export function Salons() {
  const [user, setUser] = useState<User | null>(null);
  const [salons, setSalons] = useState<Salon[]>(initialSalons);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editingSalon, setEditingSalon] = useState<Salon | undefined>(
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

  const handleOpenDialog = (mode: "add" | "edit", salon?: Salon) => {
    setDialogMode(mode);
    setEditingSalon(salon);
    setDialogOpen(true);
  };

  const handleSaveSalon = (salonData: Omit<Salon, "id">) => {
    if (dialogMode === "add") {
      const newSalon = {
        ...salonData,
        id: `salon_${Date.now()}`,
      };
      setSalons((prev) => [newSalon, ...prev]);
      toast({
        title: "Salon Added",
        description: `${newSalon.name} has been successfully created.`,
      });
    } else if (editingSalon) {
      const updatedSalon = { ...editingSalon, ...salonData };
      setSalons((prev) =>
        prev.map((s) => (s.id === updatedSalon.id ? updatedSalon : s))
      );
      toast({
        title: "Salon Updated",
        description: `${updatedSalon.name}'s details have been updated.`,
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

  const salonAdmins = users.filter((u) => u.role === "SALON_ADMIN");

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-4xl font-headline font-bold">All Salons</h1>
            <p className="text-muted-foreground mt-2">
              Manage all your salon branches from one place.
            </p>
          </div>
          <Button onClick={() => handleOpenDialog("add")}>
            <PlusCircle className="mr-2" />
            Add Salon
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {salons.map((salon) => {
            const admin = salonAdmins.find((a) => a.salonId === salon.id);
            return (
              <Card key={salon.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-primary" />
                        {salon.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <MapPin className="h-4 w-4" />
                        {salon.address}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog('edit', salon)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Admin: {admin ? admin.name : "Not Assigned"}</span>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/50 p-4">
                  <Button className="w-full">Manage Salon</Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
      <SalonFormDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        salon={editingSalon}
        onSave={handleSaveSalon}
      />
    </>
  );
}
