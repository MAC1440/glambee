
"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { campaigns as initialCampaigns, campaignSegments } from "@/lib/placeholder-data";
import { cn } from "@/lib/utils";
import { MoreHorizontal, PlusCircle, Send } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CampaignFormDialog } from "./CampaignFormDialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type Campaign = {
  id: string;
  name: string;
  date: string;
  segment: string;
  status: string;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Sent":
      return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
    case "Draft":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300";
  }
};


export function Broadcasts() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = React.useState<Campaign[]>(initialCampaigns);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleSaveCampaign = (values: { name: string; segment: string; }) => {
    const newCampaign: Campaign = {
        id: `camp_${Date.now()}`,
        name: values.name,
        segment: values.segment,
        date: format(new Date(), 'yyyy-MM-dd'),
        status: 'Draft',
    };
    setCampaigns(prev => [newCampaign, ...prev]);
    toast({ title: 'Campaign Created', description: `${newCampaign.name} has been saved as a draft.` });
  };


  const columns: ColumnDef<Campaign>[] = [
    { accessorKey: "name", header: "Campaign Name" },
    { accessorKey: "date", header: "Date" },
    { accessorKey: "segment", header: "Target Segment" },
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
                <DropdownMenuItem>View Details</DropdownMenuItem>
                {row.original.status === "Draft" && (
                <DropdownMenuItem>
                    <Send className="mr-2 h-4 w-4" /> Send Now
                </DropdownMenuItem>
                )}
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
        ),
    },
  ];

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Campaign
          </Button>
        </div>
        <DataTable columns={columns} data={campaigns} />
      </div>
      <CampaignFormDialog 
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveCampaign}
        segments={campaignSegments}
      />
    </>
  );
}
