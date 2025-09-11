
"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { services } from "@/lib/placeholder-data";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "SUPER_ADMIN" | "SALON_ADMIN";
  salonId: string | null;
};

const ServiceCard = ({
  service,
  showAdminControls,
}: {
  service: any;
  showAdminControls: boolean;
}) => (
  <Card key={service.id} className="flex flex-col overflow-hidden">
    <div className="relative h-56 w-full">
      <Image
        src={service.image}
        alt={service.name}
        fill
        className="object-cover"
        data-ai-hint="hair salon service"
      />
      {service.category === "Discount" && (
        <Badge className="absolute top-2 right-2 bg-red-500 text-white">
          Discount
        </Badge>
      )}
      {service.category === "Deal" && (
        <Badge className="absolute top-2 right-2 bg-secondary text-secondary-foreground">
          Deal
        </Badge>
      )}
    </div>
    <CardHeader>
      <CardTitle className="font-headline text-2xl">{service.name}</CardTitle>
      <CardDescription>{service.description}</CardDescription>
    </CardHeader>
    <CardContent className="flex-grow flex items-end justify-start">
      <div className="flex items-center gap-2">
        <p className="text-2xl font-bold text-primary">${service.price}</p>
        {service.originalPrice && (
          <p className="text-lg text-muted-foreground line-through">
            ${service.originalPrice}
          </p>
        )}
      </div>
    </CardContent>
    <CardFooter className="flex justify-between items-center bg-muted/50 p-4">
      <Button asChild>
        <Link href="/appointments">Book Now</Link>
      </Button>
      {showAdminControls && (
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </CardFooter>
  </Card>
);

export function Services() {
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const sessionData = localStorage.getItem("session");
    if (sessionData) {
      setUser(JSON.parse(sessionData));
    }
  }, []);

  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "SALON_ADMIN";

  const discounts = services.filter((s) => s.category === "Discount");
  const deals = services.filter((s) => s.category === "Deal");
  const individualServices = services.filter((s) => s.category === "Service");

  const renderServiceSection = (title: string, services: any[]) =>
    services.length > 0 && (
      <div className="mb-12">
        <h2 className="text-3xl font-bold font-headline mb-6 text-center">
          {title}
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              showAdminControls={isAdmin}
            />
          ))}
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-4xl font-headline font-bold">Our Services</h1>
          <p className="text-muted-foreground mt-2">
            Explore our menu of beauty and wellness services.
          </p>
        </div>
        {isAdmin && (
          <Button>
            <PlusCircle className="mr-2" />
            Add New Item
          </Button>
        )}
      </div>

      {renderServiceSection("Promotions & Discounts", discounts)}
      {renderServiceSection("Package Deals", deals)}
      {renderServiceSection("Individual Services", individualServices)}
    </div>
  );
}
