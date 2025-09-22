
"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { messageLogs } from "@/lib/placeholder-data";
import { cn } from "@/lib/utils";
import { MoreHorizontal, RefreshCw, Mail, MessageSquare, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

type Log = {
  id: string;
  customerName: string;
  channel: string;
  type: string;
  timestamp: string;
  status: string;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Delivered":
      return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
    case "Sent":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
    case "Failed":
      return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300";
  }
};

const getChannelIcon = (channel: string) => {
    switch(channel.toLowerCase()){
        case 'sms': return <MessageSquare className="h-4 w-4" />;
        case 'email': return <Mail className="h-4 w-4" />;
        case 'push': return <Bell className="h-4 w-4" />;
        default: return null;
    }
}

const columns: ColumnDef<Log>[] = [
  {
    accessorKey: "timestamp",
    header: "Timestamp",
    cell: ({ row }) => {
      const date = new Date(row.getValue("timestamp"));
      return format(date, "Pp");
    },
  },
  { accessorKey: "customerName", header: "Customer" },
  {
    accessorKey: "channel",
    header: "Channel",
    cell: ({ row }) => {
      const channel = row.getValue("channel") as string;
      return (
        <div className="flex items-center gap-2">
          {getChannelIcon(channel)}
          <span>{channel}</span>
        </div>
      );
    },
  },
  { accessorKey: "type", header: "Type" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant="outline" className={cn(getStatusColor(status))}>
          {status}
        </Badge>
      );
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
            <DropdownMenuItem>View Message</DropdownMenuItem>
            {row.original.status === "Failed" && (
              <DropdownMenuItem>
                <RefreshCw className="mr-2 h-4 w-4" /> Retry
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];

export function NotificationLogs() {
  return <DataTable columns={columns} data={messageLogs} />;
}
