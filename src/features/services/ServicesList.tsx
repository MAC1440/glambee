
"use client";

import * as React from "react";
import {
  CaretSortIcon,
  ChevronDownIcon,
} from "@radix-ui/react-icons";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { services as allServices } from "@/lib/placeholder-data";
import { ServiceFormDialog } from "../services/ServiceFormDialog";
import { DataTable } from "@/components/ui/data-table";
import { DebouncedInput } from "@/components/ui/debounced-input";

type Service = {
  id: string;
  name: string;
  description: string;
  price: number | string;
  originalPrice: number | null;
  duration: number | null;
  image: string;
  category: "Service" | "Deal" | "Promotion";
  includedServices?: { value: string; label: string }[];
  artists?: { value: string; label: string }[];
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
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
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
      cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "duration",
      header: "Duration (min)",
      cell: ({ row }) => <div>{row.getValue("duration")}</div>,
    },
    {
      accessorKey: "price",
      header: () => <div className="text-right">Price</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("price"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);

        return <div className="text-right font-medium">{formatted}</div>;
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
          <DebouncedInput
            value={globalFilter ?? ""}
            onValueChange={(value) => setGlobalFilter(String(value))}
            className="max-w-sm"
            placeholder="Search all columns..."
          />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {columns.filter(c => c.id !== 'select' && c.id !== 'actions' && c.accessorKey).map(column => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.accessorKey as string}
                    className="capitalize"
                    checked={true} // Simplified for this example
                    onCheckedChange={(value) => {
                      // In a real app, you'd get the column and call toggleVisibility
                      console.log(`${column.accessorKey} visibility changed to ${value}`)
                    }}
                  >
                    {column.accessorKey as string}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
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
      />
    </>
  );
}
