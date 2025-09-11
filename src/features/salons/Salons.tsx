
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
import { salons, users } from "@/lib/placeholder-data";
import { Building, MapPin, Users, Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Mock user type for prototype
type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "SUPER_ADMIN" | "SALON_ADMIN";
  salonId: string | null;
};

export function Salons() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

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

  // Only render for super admin
  if (!user || user.role !== "SUPER_ADMIN") {
    return (
      <div className="flex items-center justify-center h-full">
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }
  
  const salonAdmins = users.filter(u => u.role === 'SALON_ADMIN');

  return (
    <div className="flex flex-col gap-8">
      <div className="text-left">
        <h1 className="text-4xl font-headline font-bold">All Salons</h1>
        <p className="text-muted-foreground mt-2">
          Manage all your salon branches from one place.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {salons.map((salon) => {
            const admin = salonAdmins.find(a => a.salonId === salon.id);
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
                <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Admin: {admin ? admin.name : 'Not Assigned'}</span>
                </div>
            </CardContent>
            <CardFooter className="bg-muted/50 p-4">
              <Button className="w-full">Manage Salon</Button>
            </CardFooter>
          </Card>
        )}
        )}
      </div>
    </div>
  );
}
