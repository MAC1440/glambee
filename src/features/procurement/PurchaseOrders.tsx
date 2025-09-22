
"use client";

import * as React from "react";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { purchaseOrders } from "@/lib/placeholder-data";
import { cn } from "@/lib/utils";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

type PurchaseOrder = { poNumber: string; supplier: string; date: string; total: number; status: string };

const getStatusColor = (status: string) => {
  switch (status) {
    case "Fulfilled": return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
    case "Sent": return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
    case "Draft": return "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300";
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300";
  }
};

const columns: ColumnDef<PurchaseOrder>[] = [
  { accessorKey: "poNumber", header: "PO #" },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Date <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  { accessorKey: "supplier", header: "Supplier" },
  {
    accessorKey: "total",
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => {
      const total = parseFloat(row.getValue("total"));
      const formatted = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(total);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return <Badge variant="outline" className={cn(getStatusColor(status))}>{status}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Details</DropdownMenuItem>
            {row.original.status !== 'Fulfilled' && <DropdownMenuItem>Mark as Fulfilled</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];

export function PurchaseOrders() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild>
            <Link href="/procurement/po/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Create Purchase Order
            </Link>
        </Button>
      </div>
      <DataTable columns={columns} data={purchaseOrders} />
    </div>
  );
}
