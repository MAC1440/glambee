
"use client";

import * as React from "react";
import {
  CaretSortIcon,
} from "@radix-ui/react-icons";
import {
  ColumnDef,
} from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { inventoryItems, suppliers, inventoryCategories } from "@/lib/placeholder-data";
import { DataTable } from "@/components/ui/data-table";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isBefore, parseISO } from "date-fns";
import { cn } from "@/lib/utils";


type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  category: string;
  supplier: string;
  quantity: number;
  lowStockThreshold: number;
  expiryDate: string | null;
};

export function InventoryList() {
  const { toast } = useToast();
  const [items, setItems] = React.useState<InventoryItem[]>(inventoryItems);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const getStatus = (item: InventoryItem) => {
    if (item.expiryDate && isBefore(parseISO(item.expiryDate), new Date())) {
        return "Expired";
    }
    if (item.quantity === 0) {
        return "Out of Stock";
    }
    if (item.quantity <= item.lowStockThreshold) {
        return "Low Stock";
    }
    return "Available";
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
      case "Out of Stock":
         return "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300";
      case "Expired":
        return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300";
    }
  };


  const columns: ColumnDef<InventoryItem>[] = [
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
      accessorKey: "sku",
      header: "SKU",
    },
    {
      accessorKey: "category",
      header: "Category",
       filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
     {
      accessorKey: "quantity",
      header: ({ column }) => {
        return (
          <div className="text-right">
             <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
             >
                Quantity
                <CaretSortIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => <div className="text-right font-medium pr-4">{row.getValue("quantity")}</div>
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = getStatus(row.original);
        return <Badge variant="outline" className={cn(getStatusColor(status))}>{status}</Badge>;
      },
    },
    {
      accessorKey: "supplier",
      header: "Supplier",
       filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>View History</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
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
          <h1 className="text-4xl font-headline font-bold">Inventory</h1>
          <p className="text-muted-foreground mt-2">
            Manage your product stock and suppliers.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2" /> Add Product
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
                    const column = (table as any).TANSTACK_TABLE_INSTANCE.getColumn('category');
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
                {inventoryCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
             <Select
              onValueChange={(value) => {
                const table = document.querySelector('table');
                if (table && (table as any).TANSTACK_TABLE_INSTANCE) {
                    const column = (table as any).TANSTACK_TABLE_INSTANCE.getColumn('supplier');
                    if (column) {
                        column.setFilterValue(value === 'all' ? '' : value);
                    }
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.name}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
      </div>
      <DataTable 
        columns={columns} 
        data={items}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
       />
    </div>
    </>
  );
}
