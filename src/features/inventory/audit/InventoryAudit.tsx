
"use client";

import * as React from "react";
import { useSearchParams } from 'next/navigation';
import { CaretSortIcon } from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { inventoryAuditLog, type AuditLogEntry } from "@/lib/inventory-audit-data";
import { DataTable } from "@/components/ui/data-table";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const getActionColor = (action: string) => {
    switch (action) {
      case "Created":
      case "Received":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
      case "Dispatched":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300";
      case "Wasted":
        return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
      case "Updated":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300";
      case "Sold":
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300";
    }
};

const columns: ColumnDef<AuditLogEntry>[] = [
  {
    accessorKey: "timestamp",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Timestamp
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
        const date = parseISO(row.getValue("timestamp"));
        return <div className="text-left">{format(date, "dd/MM/yyyy p")}</div>
    },
  },
  {
    accessorKey: "itemName",
    header: "Product Name",
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
        const action = row.getValue("action") as string;
        return <Badge variant="outline" className={cn(getActionColor(action))}>{action}</Badge>;
    }
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => {
        const action = row.original.action;
        const quantity = row.getValue("quantity") as number;
        if (action === "Updated") {
            return <div className="text-muted-foreground">N/A</div>;
        }
        return <div>{quantity}</div>;
    }
  },
  {
    accessorKey: "user",
    header: "User",
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => <div className="max-w-xs truncate">{row.getValue("notes")}</div>,
  },
];

export function InventoryAudit() {
  const searchParams = useSearchParams();
  const itemIdFilter = searchParams.get('itemId');

  const [globalFilter, setGlobalFilter] = React.useState(itemIdFilter || "");

  const filteredData = React.useMemo(() => {
      if (itemIdFilter) {
          return inventoryAuditLog.filter(log => log.itemId === itemIdFilter);
      }
      return inventoryAuditLog;
  }, [itemIdFilter]);

  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/inventory">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <div>
                <h1 className="text-3xl font-bold font-headline">Inventory Audit History</h1>
                <p className="text-muted-foreground">A complete log of all stock movements.</p>
            </div>
          </div>
      </div>
      
       <div className="flex items-center justify-between">
          <DebouncedInput
            value={globalFilter ?? ""}
            onValueChange={(value) => setGlobalFilter(String(value))}
            className="max-w-sm"
            placeholder="Search audit log..."
          />
      </div>
      <DataTable 
        columns={columns} 
        data={filteredData}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
       />
    </div>
  );
}
