
"use client";

import * as React from "react";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { inventoryItems, suppliers, inventoryCategories } from "@/lib/placeholder-data";
import { DataTable } from "@/components/ui/data-table";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { InventoryItem } from "../inventory/InventoryList";

export function ProductCatalog() {
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns: ColumnDef<InventoryItem>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Name <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
    },
    { accessorKey: "sku", header: "SKU" },
    { accessorKey: "category", header: "Category", filterFn: (row, id, value) => value.includes(row.getValue(id)) },
    { accessorKey: "supplier", header: "Supplier", filterFn: (row, id, value) => value.includes(row.getValue(id)) },
    {
      id: "pricing",
      header: () => <div className="text-right">Mock Price</div>,
      cell: ({ row }) => {
        // Mock price for demonstration
        const price = (parseInt(row.original.id.replace('inv_', '')) * 12.34 % 50) + 10;
        const formatted = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <DebouncedInput
            value={globalFilter ?? ""}
            onValueChange={(value) => setGlobalFilter(String(value))}
            className="max-w-sm"
            placeholder="Search catalog..."
          />
          <Select
            onValueChange={(value) => {
              const table = document.querySelector('table');
              if (table && (table as any).TANSTACK_TABLE_INSTANCE) {
                const column = (table as any).TANSTACK_TABLE_INSTANCE.getColumn('category');
                column?.setFilterValue(value === 'all' ? '' : value);
              }
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {inventoryCategories.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) => {
              const table = document.querySelector('table');
              if (table && (table as any).TANSTACK_TABLE_INSTANCE) {
                const column = (table as any).TANSTACK_TABLE_INSTANCE.getColumn('supplier');
                column?.setFilterValue(value === 'all' ? '' : value);
              }
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.name}>{supplier.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={inventoryItems}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
      />
    </div>
  );
}
