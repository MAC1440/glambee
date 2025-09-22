
"use client";

import * as React from "react";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { requisitions as initialRequisitions } from "@/lib/placeholder-data";
import { cn } from "@/lib/utils";
import { MoreHorizontal, PlusCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RequisitionFormDialog } from "./RequisitionFormDialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type RequisitionItem = { name: string, quantity: number };
export type Requisition = { reqNumber: string, requestedBy: string, date: string, status: string, items: RequisitionItem[] };

const getStatusColor = (status: string) => {
  switch (status) {
    case "Approved": return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
    case "Pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
    case "Rejected": return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300";
  }
};

export function Requisitions() {
  const [requisitions, setRequisitions] = React.useState<Requisition[]>(initialRequisitions);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const handleSaveRequisition = (values: any) => {
    const newRequisition: Requisition = {
      reqNumber: `REQ-${Date.now().toString().slice(-4)}`,
      requestedBy: values.requestedBy,
      date: format(new Date(), 'yyyy-MM-dd'),
      status: 'Pending',
      items: values.items.map((item: any) => ({
        name: item.product.label,
        quantity: item.quantity,
      })),
    };
    setRequisitions(prev => [newRequisition, ...prev]);
    toast({ title: "Requisition Submitted", description: `Request ${newRequisition.reqNumber} has been sent for approval.`});
  };

  const columns: ColumnDef<Requisition>[] = [
    { accessorKey: "reqNumber", header: "Req #" },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Date <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    { accessorKey: "requestedBy", header: "Requested By" },
    {
      accessorKey: "items",
      header: "Items",
      cell: ({ row }) => {
          const items = row.getValue("items") as RequisitionItem[];
          return (
              <ul className="list-disc list-inside">
                  {items.map(item => <li key={item.name}>{item.quantity} x {item.name}</li>)}
              </ul>
          )
      }
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
      cell: ({ row }) => {
        const isPending = row.original.status === 'Pending';
        return (
          <div className="text-right">
            {isPending ? (
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem><ThumbsUp className="mr-2 h-4 w-4" /> Approve</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600"><ThumbsDown className="mr-2 h-4 w-4" /> Reject</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            ) : null}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> New Requisition
          </Button>
        </div>
        <DataTable columns={columns} data={requisitions} />
      </div>
      <RequisitionFormDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveRequisition}
      />
    </>
  );
}
