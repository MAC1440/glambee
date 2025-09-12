
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

export function PromotionsList() {
  const { toast } = useToast();
  const [promotions, setPromotions] = React.useState<Service[]>(
    allServices.filter((s) => s.category === "Promotion")
  );

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"add" | "edit">("add");
  const [editingService, setEditingService] = React.useState<
    Service | undefined
  >(undefined);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  
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
        id: `promo_${Date.now()}`,
      };
      setPromotions((prev) => [newService, ...prev]);
      toast({
        title: "Promotion Added",
        description: `${newService.name} has been successfully created.`,
      });
    } else if (editingService) {
      const updatedService = { ...serviceData };
      setPromotions((prev) =>
        prev.map((s) => (s.id === updatedService.id ? updatedService : s))
      );
      toast({
        title: "Promotion Updated",
        description: `${updatedService.name}'s details have been updated.`,
      });
    }
  };

  const handleDelete = (serviceId: string) => {
    const serviceName = promotions.find((s) => s.id === serviceId)?.name || "The promotion";
    setPromotions((prev) => prev.filter((s) => s.id !== serviceId));
    toast({
      title: "Promotion Deleted",
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
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="line-clamp-2 max-w-xs">{row.getValue("description")}</div>
      ),
    },
     {
      accessorKey: "price",
      header: "Value",
      cell: ({ row }) => {
        return <div className="font-medium">{row.getValue("price")}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const promotion = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleOpenDialog("edit", promotion)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDelete(promotion.id)} className="text-red-600">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: promotions,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  return (
    <>
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-4xl font-headline font-bold">Promotions & Discounts</h1>
          <p className="text-muted-foreground mt-2">
            Manage your special offers and discounts.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog("add")}>
          <PlusCircle className="mr-2" /> Add Promotion
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
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <DataTable columns={columns} data={promotions} />
    </div>
    <ServiceFormDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        category="Promotion"
        service={editingService}
        onSave={handleSave}
        individualServices={[]}
      />
    </>
  );
}

    