"use client";

import * as React from "react";
import { CaretSortIcon } from "@radix-ui/react-icons";
import {
  ColumnDef,
  getFilteredRowModel,
  ColumnFiltersState,
  SortingState,
} from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, BookText } from "lucide-react";
import { Service } from "@/types/service";
import { useToast } from "@/hooks/use-toast";
// Removed unused inventoryItems import
import { ServiceFormDialog } from "../services/ServiceFormDialog";
import { fetchCategories, type Category } from "@/lib/api/categoriesApi";
import { DataTable } from "@/components/ui/data-table";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ServicesApi } from "@/lib/api/servicesApi";

export type ServiceRecipeItem = {
  itemId: string;
  quantity: number;
};

export function ServicesList() {
  const { toast } = useToast();
  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = React.useState(false);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"add" | "edit">("add");
  const [editingService, setEditingService] = React.useState<
    Service | undefined
  >(undefined);
  const [saving, setSaving] = React.useState(false);

  const [globalFilter, setGlobalFilter] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  
  // Ref for the DataTable to access TanStack table instance
  const tableRef = React.useRef<any>(null);

  // Fetch categories from Supabase
  const fetchCategoriesData = React.useCallback(async () => {
    try {
      setLoadingCategories(true);
      const fetchedCategories = await fetchCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  // Fetch all services once (no filtering)
  const fetchServices = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ServicesApi.getServices();

      setServices(response.data || []);
    } catch (err) {
      console.error("💥 Error fetching services:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch services");
      toast({
        title: "Error",
        description: "Failed to fetch services. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Client-side filtering
  const filteredServices = React.useMemo(() => {
    let filtered = services;

    // Apply search filter
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(query) ||
        service.time.toLowerCase().includes(query) ||
        service.price.toString().includes(query)
      );
    }

    // Apply category filter (if needed in future)
    if (categoryFilter && categoryFilter !== "all") {
      // filtered = filtered.filter(service => service.category_id === categoryFilter);
    }

    return filtered;
  }, [services, searchQuery, categoryFilter]);

  // Load services and categories on component mount
  React.useEffect(() => {
    fetchServices();
    fetchCategoriesData();
  }, [fetchServices, fetchCategoriesData]);

  // Handle search input change
  const handleSearchChange = (value: string | number) => {
    setSearchQuery(String(value));
  };

  // Handle category filter change
  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
  };


  const handleOpenDialog = (
    mode: "add" | "edit",
    service?: Service
  ) => {
    setDialogMode(mode);
    setEditingService(service);
    setDialogOpen(true);
  };

  const handleSave = async (serviceData: any) => {
    try {
      setSaving(true);

      if (dialogMode === "add") {
        const savedService = await ServicesApi.createService({
          name: serviceData.name,
          price: serviceData.price,
          time: serviceData.time,
          category_id: serviceData.category_id,
          salon_id: '', // Will be set by the API's getDefaultSalonId() method
        });

        setServices((prev) => [savedService, ...prev]);
        toast({
          title: "✅ Service Added",
          description: `${savedService.name} has been successfully created.`,
          style: {
            backgroundColor: "lightgreen",
            color: "black",
          }
        });
      } else if (editingService) {
        const savedService = await ServicesApi.updateService(editingService.id, {
          name: serviceData.name,
          price: serviceData.price,
          time: `${serviceData.time}`,
          category_id: serviceData.category_id,
        });

        if (savedService) {
          setServices((prev) =>
            prev.map((s) => s.id === savedService.id ? savedService : s)
          );
          toast({
            title: "✅ Service Updated",
            description: `${savedService.name}'s details have been updated.`,
            style: {
              backgroundColor: "lightgreen",
              color: "black",
            }
          });
        }
      }
    } catch (err) {
      console.error("💥 Error saving service:", err);
      toast({
        title: "Error",
        description: `Failed to ${
          dialogMode === "add" ? "create" : "update"
        } service. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    try {
      const serviceName = services.find((s) => s.id === serviceId)?.name || "The service";
      await ServicesApi.deleteService(serviceId);
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
      toast({
        title: "✅ Service Deleted",
        description: `${serviceName} has been removed.`,
        style: {
          backgroundColor: "lightgreen",
          color: "black",
        }
      });
    } catch (err) {
      console.error("💥 Error deleting service:", err);
      toast({
        title: "Error",
        description: "Failed to delete service. Please try again.",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<Service>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const service = row.original;
        // const hasRecipe = service.recipe && service.recipe.length > 0;
        return (
          <div className="flex items-center gap-2">
            <div className="capitalize">{row.getValue("name")}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "time",
      header: "Duration",
      cell: ({ row }) => <div>{row.getValue("time")}</div>,
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("price"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);

        return <div className="font-medium pr-4">{formatted}</div>;
      },
    },
    {
      accessorKey: "category_id",
      header: "Category",
      cell: ({ row }) => {
        const categoryId = row.original.category_id as string;
        const category = categories.find(cat => cat.id === categoryId);
        return <div>{category?.name || 'Unknown'}</div>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        const service = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleOpenDialog("edit", service)}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(service.id)}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-4xl font-headline font-bold">
              All Individual Services
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your individual salon services.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading services...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-4xl font-headline font-bold">
              All Individual Services
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your individual salon services.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={() => fetchServices()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <> 
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-4xl font-headline font-bold">
              All Individual Services
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your individual salon services.
            </p>
          </div>
          <Button onClick={() => handleOpenDialog("add")}>
            <PlusCircle className="mr-2" /> Add Service
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <DebouncedInput
              value={searchQuery ?? ''}
              onValueChange={handleSearchChange}
              placeholder="Search services"
              className="w-full max-w-sm"
            />
            {/* Category filter removed since salons_services uses category_id instead of category string */}
          </div>
        </div>
        <DataTable
          ref={tableRef}
          columns={columns as any}
          data={filteredServices}
        />
      </div>
      <ServiceFormDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        service={editingService}
        onSave={handleSave}
        saving={saving}
        categories={categories}
        loadingCategories={loadingCategories}
      />
    </>
  );
}
