
"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { suppliers } from "@/lib/placeholder-data";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Supplier = { id: string; name: string; contactPerson?: string; email?: string; phone?: string; };

// Adding some mock details to suppliers
const detailedSuppliers = suppliers.map((s, i) => ({
    ...s,
    contactPerson: `Contact ${i+1}`,
    email: `contact${i+1}@${s.name.toLowerCase().replace(/\s/g, '')}.com`,
    phone: `+1-555-123-456${i+1}`
}))

const columns: ColumnDef<Supplier>[] = [
  { accessorKey: "name", header: "Supplier Name" },
  { accessorKey: "contactPerson", header: "Contact Person" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "phone", header: "Phone" },
  {
    id: "actions",
    cell: () => (
      <div className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];

export function SupplierManagement() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Supplier</Button>
      </div>
      <DataTable columns={columns} data={detailedSuppliers} />
    </div>
  );
}
