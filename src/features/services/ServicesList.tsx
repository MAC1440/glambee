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
import { supabase } from "@/lib/supabase/client";

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
  // Removed defaultTab state

  const [globalFilter, setGlobalFilter] = React.useState("");
  supabase.auth.getUser().then(({ data, error }) => {
    console.log("supabase.auth.getUser", data, error);
  });

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

  // Fetch services from Supabase
  const fetchServices = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Fetching services from Supabase...");
      const { data: services, error } = await supabase
        .from("services")
        .select("*");
      // .eq('category', 'Service');

      console.log("📊 Supabase response:", { services, error });
      console.log("📋 Services data:", services);
      console.log("❌ Error (if any):", error);

      if (error) {
        console.error("🚨 Supabase error:", error);
        throw error;
      }

      console.log(
        "✅ Services fetched successfully:",
        services?.length || 0,
        "items"
      );
      setServices((services || []) as Service[]);
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

  // Load services and categories on component mount
  React.useEffect(() => {
    fetchServices();
    fetchCategoriesData();
  }, [fetchServices, fetchCategoriesData]);

  // Log services state changes
  React.useEffect(() => {
    console.log("📋 Services state updated:", services);
  }, [services]);

  // Test function to verify Supabase connection
  const testSupabaseConnection = async () => {
    try {
      console.log("🧪 Testing Supabase connection...");
      const { data, error } = await supabase
        .from("services")
        .select("count")
        .limit(1);

      console.log("🧪 Connection test result:", { data, error });

      if (error) {
        console.error("🧪 Connection test failed:", error);
      } else {
        console.log("✅ Supabase connection successful!");
      }
    } catch (err) {
      console.error("🧪 Connection test error:", err);
    }
  };

  // Test connection on component mount
  React.useEffect(() => {
    testSupabaseConnection();
  }, []);

  const handleOpenDialog = (
    mode: "add" | "edit",
    service?: Service
  ) => {
    console.log("🔧 Opening dialog:", { mode, service: service?.name });
    setDialogMode(mode);
    setEditingService(service);
    setDialogOpen(true);
  };

  const handleSave = async (serviceData: Service) => {
    try {
      setSaving(true);
      console.log("💾 Saving service:", {
        dialogMode,
        serviceData: {
          name: serviceData.name,
          description: serviceData.description,
          price: serviceData.price,
          duration: serviceData.duration,
          category: serviceData.category,
        },
      });

      if (dialogMode === "add") {
        console.log("➕ Creating new service...");
        console.log("📤 Data being sent to Supabase:", {
          name: serviceData.name,
          description: serviceData.description,
          price: serviceData.price,
          duration: serviceData.duration,
          category: serviceData.category,
        });

        const { data, error } = await supabase
          .from("services")
          .insert([
            {
              name: serviceData.name,
              description: serviceData.description,
              price: serviceData.price,
              duration: serviceData.duration,
              category: serviceData.category,
            }
          ])
          .select();

        console.log("📊 Create response:", { data, error });

        if (error) {
          console.error("🚨 Create error:", error);
          console.error("🚨 Error details:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          throw error;
        }

        if (data && data.length > 0) {
          console.log("✅ Service created successfully:", data[0]);
          setServices((prev) => [data[0] as Service, ...prev]);
          toast({
            title: "Service Added",
            description: `${data[0].name} has been successfully created.`,
          });
        } else {
          throw new Error("No data returned from create operation");
        }
      } else if (editingService) {
        console.log("✏️ Updating service:", editingService.id);
        console.log("📤 Update data being sent to Supabase:", {
          name: serviceData.name,
          description: serviceData.description,
          price: serviceData.price,
          duration: serviceData.duration,
          category: serviceData.category,
        });

        const { data, error } = await supabase
          .from("services")
          .update({
            name: serviceData.name,
            description: serviceData.description,
            price: serviceData.price,
            duration: serviceData.duration,
            category: serviceData.category,
          })
          .eq("id", editingService.id)
          .select();

        console.log("📊 Update response:", { data, error });

        if (error) {
          console.error("🚨 Update error:", error);
          console.error("🚨 Error details:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          throw error;
        }

        if (data && data.length > 0) {
          console.log("✅ Service updated successfully:", data[0]);
          setServices((prev) =>
            prev.map((s) =>
              s.id === data[0].id ? (data[0] as Service) : s
            )
          );
          toast({
            title: "Service Updated",
            description: `${data[0].name}'s details have been updated.`,
          });
        } else {
          throw new Error("No data returned from update operation");
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
      const serviceName =
        services.find((s) => s.id === serviceId)?.name || "The service";

      console.log("🗑️ Deleting service:", { serviceId, serviceName });

      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", serviceId);

      console.log("📊 Delete response:", { error });

      if (error) {
        console.error("🚨 Delete error:", error);
        throw error;
      }

      console.log("✅ Service deleted successfully:", serviceId);
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
      toast({
        title: "Service Deleted",
        description: `${serviceName} has been removed.`,
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
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const service = row.original;
        // const hasRecipe = service.recipe && service.recipe.length > 0;
        return (
          <div className="flex items-center gap-2">
            <div className="capitalize">{row.getValue("name")}</div>
            {/* {hasRecipe && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleOpenDialog("edit", service, "recipe")}>
                                    <BookText className="h-4 w-4 text-muted-foreground"/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>View/Edit Recipe</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                 )} */}
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Category
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const category = row.getValue("category");
        return category ? (
          <Badge variant="outline">{category as string}</Badge>
        ) : null;
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "duration",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Duration (min)
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("duration")}</div>,
    },
    {
      accessorKey: "price",
      header: ({ column }) => {
        return (
          <div className="text-right">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Price
              <CaretSortIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("price"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);

        return <div className="text-right font-medium pr-4">{formatted}</div>;
      },
    },
    {
      id: "actions",
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
              Individual Services
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
              Individual Services
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your individual salon services.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={fetchServices}>Try Again</Button>
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
              Individual Services
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
            <Input
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search all columns..."
              className="max-w-sm"
            />
            <Select
              onValueChange={(value) => {
                const table = document.querySelector("table"); // A bit of a hack to get table instance
                if (table && (table as any).TANSTACK_TABLE_INSTANCE) {
                  const column = (
                    table as any
                  ).TANSTACK_TABLE_INSTANCE.getColumn("category");
                  if (column) {
                    column.setFilterValue(value === "all" ? "" : value);
                  }
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.title}>
                    {category.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DataTable
          columns={columns as any}
          data={services}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
        />
      </div>
      <ServiceFormDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        service={editingService}
        onSave={handleSave}
        saving={saving}
      />
    </>
  );
}
