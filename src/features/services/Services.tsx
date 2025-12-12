
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
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
import {
  PlusCircle,
  Edit,
  Trash2,
  MoreVertical,
  ChevronDown,
} from "lucide-react";
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
import { ServiceFormDialog } from "./ServiceFormDialog";
import { useToast } from "@/hooks/use-toast";
import { ServicesApi } from "@/lib/api/servicesApi";
import { Service } from "@/types/service";
import { fetchCategories, type Category } from "@/lib/api/categoriesApi";

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
  onEdit,
  onDelete,
}: {
  service: Service;
  showAdminControls: boolean;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
}) => (
  <Card key={service.id} className="flex flex-col overflow-hidden group">
    <div className="relative h-56 w-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-2">💇‍♀️</div>
        <p className="text-muted-foreground text-sm">Service Image</p>
      </div>
      {service.category_id && (
        <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
          Category: {service.category_id}
        </Badge>
      )}
      {showAdminControls && (
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => onEdit(service)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/40">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete the "
          {service.name}" item.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={() => onDelete(service.id)} className="bg-destructive hover:bg-destructive/90">
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
    <CardHeader>
      <CardTitle className="font-headline text-2xl">{service.name}</CardTitle>
      <CardDescription>Duration: {service.time}</CardDescription>
    </CardHeader>
    <CardContent className="flex-grow flex items-end justify-start">
      <div className="flex items-center gap-2">
        <p className="text-2xl font-bold text-primary">
          PKR {service.price}
        </p>
        {service.starting_from && (
          <p className="text-lg text-muted-foreground">
            Starting from PKR {service.starting_from}
          </p>
        )}
      </div>
    </CardContent>
    <CardFooter className="flex justify-between items-center bg-muted/50 p-4">
      <Button asChild>
        <Link href="/appointments">Book Now</Link>
      </Button>
    </CardFooter>
  </Card>
);

export function Services() {
  const [user, setUser] = useState<User | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editingService, setEditingService] = useState<Service | undefined>(undefined);


  useEffect(() => {
    const sessionData = localStorage.getItem("session");
    if (sessionData) {
      setUser(JSON.parse(sessionData));
    }
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const response = await ServicesApi.getServices();
        setServices(response.data);
      } catch (e) {
        console.error("Error fetching services:", e);
        toast({
          title: "Error",
          description: "Failed to fetch services. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchServices();
  }, [toast]);

  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "SALON_ADMIN";

  const handleOpenDialog = (mode: "add" | "edit", service?: Service) => {
    setDialogMode(mode);
    setEditingService(service);
    setDialogOpen(true);
  };

  const handleSaveService = async (serviceData: any) => {
    try {
      let savedService: Service;
      if (dialogMode === 'add') {
        savedService = await ServicesApi.createService({
          name: serviceData.name,
          price: serviceData.price,
          time: serviceData.duration,
          gender: serviceData.gender,
          has_range: serviceData.has_range || false,
          starting_from: serviceData.has_range ? serviceData.starting_from : null,
          salon_id: '', // Will be set by the API's getDefaultSalonId() method
        });
        setServices(prev => [savedService, ...prev]);
        toast({ title: "Success", description: `${savedService.name} has been added.` });
      } else {
        savedService = await ServicesApi.updateService(serviceData.id, {
          name: serviceData.name,
          price: serviceData.price,
          time: `serviceData.duration`,
          gender: serviceData.gender,
          has_range: serviceData.has_range || false,
          starting_from: serviceData.has_range ? serviceData.starting_from : null,
        }) || serviceData;
        setServices(prev => prev.map(s => s.id === serviceData.id ? savedService : s));
        toast({ title: "Success", description: `${savedService.name} has been updated.` });
      }
    } catch (error) {
      console.error("Error saving service:", error);
      toast({
        title: "Error",
        description: `Failed to ${dialogMode === 'add' ? 'create' : 'update'} service.`
      });
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    const serviceName = services.find(s => s.id === serviceId)?.name || 'The item';
    try {
      await ServicesApi.deleteService(serviceId);
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
      toast({ title: "Deleted", description: `${serviceName} has been removed.` });
    } catch (error) {
      console.error("Error deleting service:", error);
      toast({
        title: "Error",
        description: "Failed to delete service. Please try again."
      });
    }
  };


  // Group by category_id if needed, or just show all services
  // For now, we'll show all services since salons_services doesn't have category field

  const renderServiceSection = (title: string, data: Service[]) =>
    data.length > 0 && (
      <div className="mb-12">
        <h2 className="text-3xl font-bold font-headline mb-6 text-center">
          {title}
        </h2>
        <AlertDialog>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                showAdminControls={isAdmin}
                onEdit={(s) => handleOpenDialog("edit", s)}
                onDelete={handleDeleteService}
              />
            ))}
          </div>
        </AlertDialog>
      </div>
    );

  if (isLoading) return <div>Loading services...</div>;

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-4xl font-headline font-bold">Our Services</h1>
            <p className="text-muted-foreground mt-2">
              Explore our menu of beauty and wellness services.
            </p>
          </div>
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2" /> Add New Item{" "}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleOpenDialog('add')}>
                  Add Service
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {renderServiceSection("All Services", services)}
      </div>

      <ServiceFormDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        service={editingService}
        onSave={handleSaveService}
        categories={categories}
        loadingCategories={loadingCategories}
      />
    </>
  );
}
