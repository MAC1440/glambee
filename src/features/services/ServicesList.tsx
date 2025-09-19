
"use client";

import * as React from "react";
import {
  CaretSortIcon,
} from "@radix-ui/react-icons";
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
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, BookText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { services as allServices, serviceCategories, inventoryItems } from "@/lib/placeholder-data";
import { ServiceFormDialog } from "../services/ServiceFormDialog";
import { DataTable } from "@/components/ui/data-table";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


export type ServiceRecipeItem = {
    itemId: string;
    quantity: number;
};

export type Service = {
  id: string;
  name:string;
  description: string;
  price: number | string;
  originalPrice: number | null;
  duration: number | null;
  image: string;
  category: "Service" | "Deal" | "Promotion";
  serviceCategory?: string;
  includedServices?: { value: string; label: string }[];
  artists?: { value: string; label: string }[];
  recipe?: ServiceRecipeItem[];
};

export function ServicesList() {
  const { toast } = useToast();
  const [services, setServices] = React.useState<Service[]>(
    allServices.filter((s) => s.category === "Service")
  );

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"add" | "edit">("add");
  const [editingService, setEditingService] = React.useState<
    Service | undefined
  >(undefined);
  
  const [globalFilter, setGlobalFilter] = React.useState("");

  const handleOpenDialog = (
    mode: "add" | "edit",
    service?: Service
  ) => {
    setDialogMode(mode);
    setEditingService(service);
    setDialogOpen(true);
  };

  const handleSave = (serviceData: Service) => {
    if (dialogMode === "add") {
      const newService = {
        ...serviceData,
        id: `service_${Date.now()}`,
      };
      setServices((prev) => [newService, ...prev]);
      toast({
        title: "Service Added",
        description: `${newService.name} has been successfully created.`,
      });
    } else if (editingService) {
      const updatedService = { ...serviceData, id: editingService.id };
      setServices((prev) =>
        prev.map((s) => (s.id === updatedService.id ? updatedService : s))
      );
      toast({
        title: "Service Updated",
        description: `${updatedService.name}'s details have been updated.`,
      });
    }
  };

  const handleDelete = (serviceId: string) => {
    const serviceName = services.find((s) => s.id === serviceId)?.name || "The service";
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
    toast({
      title: "Service Deleted",
      description: `${serviceName} has been removed.`,
    });
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
          const hasRecipe = row.original.recipe && row.original.recipe.length > 0;
          return (
            <div className="flex items-center gap-2">
                 <div className="capitalize">{row.getValue("name")}</div>
                 {hasRecipe && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <BookText className="h-4 w-4 text-muted-foreground"/>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>This service has a recipe.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                 )}
            </div>
          )
      },
    },
    {
      accessorKey: "serviceCategory",
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
        const category = row.getValue("serviceCategory");
        return category ? <Badge variant="outline">{category as string}</Badge> : null;
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
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
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
              <DropdownMenuItem onClick={() => handleOpenDialog("edit", service)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDelete(service.id)} className="text-red-600">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-4xl font-headline font-bold">Individual Services</h1>
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
                value={globalFilter ?? ""}
                onValueChange={(value) => setGlobalFilter(String(value))}
                className="max-w-sm"
                placeholder="Search all columns..."
            />
            <Select
              onValueChange={(value) => {
                const table = document.querySelector('table'); // A bit of a hack to get table instance
                if (table && (table as any).TANSTACK_TABLE_INSTANCE) {
                    const column = (table as any).TANSTACK_TABLE_INSTANCE.getColumn('serviceCategory');
                    if (column) {
                        column.setFilterValue(value === 'all' ? '' : value);
                    }
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {serviceCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
      </div>
      <DataTable 
        columns={columns} 
        data={services}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
       />
    </div>
    <ServiceFormDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        category="Service"
        service={editingService}
        onSave={handleSave}
        individualServices={[]}
        inventoryItems={inventoryItems}
      />
    </>
  );
}
