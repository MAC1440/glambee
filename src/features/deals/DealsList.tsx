"use client";

import * as React from "react";
import { CaretSortIcon } from "@radix-ui/react-icons";
import {
  ColumnDef,
  getFilteredRowModel,
  ColumnFiltersState,
  SortingState,
} from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, Calendar, DollarSign, Image, MessageSquare } from "lucide-react";
import { DealWithSalon, DealFilters } from "@/types/deal";
import { useToast } from "@/hooks/use-toast";
import { DealFormDialog } from "./DealFormDialog";
import { DataTable } from "@/components/ui/data-table";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DealsApi } from "@/lib/api/dealsApi";

export function DealsList() {
  const [deals, setDeals] = React.useState<DealWithSalon[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingDeal, setEditingDeal] = React.useState<DealWithSalon | null>(null);
  const [dialogMode, setDialogMode] = React.useState<"add" | "edit">("add");
  const [saving, setSaving] = React.useState(false);
  const tableRef = React.useRef<any>(null);
  const { toast } = useToast();

  const fetchDeals = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await DealsApi.getDeals({
        search: searchQuery || undefined,
        // limit: 50
      });
      setDeals(response.data);
    } catch (err) {
      console.error("Error loading deals:", err);
      setError(err instanceof Error ? err.message : "Failed to load deals");
      toast({
        title: "Error",
        description: "Failed to load deals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, categoryFilter, toast]);

  // Client-side filtering
  const filteredDeals = React.useMemo(() => {
    let filtered = deals;

    // Apply search filter
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(deal => 
        deal.title.toLowerCase().includes(query) ||
        (deal.popup_title && deal.popup_title.toLowerCase().includes(query)) ||
        deal.price?.toString().includes(query) ||
        deal.discounted_price?.toString().includes(query)
      );
    }

    return filtered;
  }, [deals, searchQuery]);

  // Load deals on component mount
  React.useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  // Handle search input change
  const handleSearchChange = (value: string | number) => {
    setSearchQuery(String(value));
  };

  // Handle category filter change
  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
  };

  const handleOpenDialog = (
    mode: "add" | "edit",
    deal?: DealWithSalon
  ) => {
    setDialogMode(mode);
    setEditingDeal(deal || null);
    setDialogOpen(true);
  };

  const handleSave = async (dealData: any) => {
    try {
      setSaving(true);

      if (dialogMode === "add") {
        const savedDeal = await DealsApi.createDeal(dealData);
        setDeals((prev) => [savedDeal, ...prev]);
        toast({
          title: "✅ Deal Added",
          description: `${savedDeal.title} has been successfully created.`,
          style: {
            backgroundColor: "lightgreen",
            color: "black",
          }
        });
      } else if (editingDeal) {
        const savedDeal = await DealsApi.updateDeal(editingDeal.id, dealData);
        if (savedDeal) {
          setDeals((prev) =>
            prev.map((d) => d.id === savedDeal.id ? savedDeal : d)
          );
          toast({
            title: "✅ Deal Updated",
            description: `${savedDeal.title}'s details have been updated.`,
            style: {
              backgroundColor: "lightgreen",
              color: "black",
            }
          });
        }
      }
      setDialogOpen(false);
      setEditingDeal(null);
    } catch (err) {
      console.error("💥 Error saving deal:", err);
      toast({
        title: "Error",
        description: `Failed to ${
          dialogMode === "add" ? "create" : "update"
        } deal. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (dealId: string) => {
    try {
      const dealName = deals.find((d) => d.id === dealId)?.title || "The deal";
      await DealsApi.deleteDeal(dealId);
      setDeals((prev) => prev.filter((d) => d.id !== dealId));
      toast({
        title: "✅ Deal Deleted",
        description: `${dealName} has been removed.`,
        style: {
          backgroundColor: "lightgreen",
          color: "black",
        }
      });
    } catch (err) {
      console.error("💥 Error deleting deal:", err);
      toast({
        title: "Error",
        description: "Failed to delete deal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTogglePopup = async (id: string, enabled: boolean) => {
    try {
      await DealsApi.toggleDealPopup(id, enabled);
      toast({
        title: "Success",
        description: `Deal popup ${enabled ? "enabled" : "disabled"} successfully.`,
      });
      fetchDeals();
    } catch (error) {
      console.error("Error toggling popup:", error);
      toast({
        title: "Error",
        description: "Failed to update popup status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isDealActive = (deal: DealWithSalon) => {
    const now = new Date();
    const validFrom = deal.valid_from ? new Date(deal.valid_from) : null;
    const validTill = deal.valid_till ? new Date(deal.valid_till) : null;

    if (validFrom && now < validFrom) return false;
    if (validTill && now > validTill) return false;
    return true;
  };

  const columns: ColumnDef<DealWithSalon>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        const deal = row.original;
        return (
          <div className="flex items-center gap-2">
            <div className="capitalize">{row.getValue("title")}</div>
            {deal.media_url && (
              <Image className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("price"));
        const formatted = amount ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount) : 'N/A';
        return <div className="font-medium pr-4">{formatted}</div>;
      },
    },
    {
      accessorKey: "discounted_price",
      header: "Discounted Price",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("discounted_price"));
        const formatted = amount ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount) : 'N/A';
        return <div className="font-medium pr-4">{formatted}</div>;
      },
    },
    {
      accessorKey: "valid_from",
      header: "Valid Period",
      cell: ({ row }) => {
        const deal = row.original;
        // For dates
        const validFrom = deal?.valid_from ? deal?.valid_from.slice(0, 10) : 'N/A';
        const validFromTime = deal?.valid_from ? deal?.valid_from.slice(11, 16) : 'N/A';

        // For time
        const validTill = deal?.valid_till ? deal?.valid_till.slice(0, 10) : 'N/A';
        const validTillTime = deal?.valid_till ? deal?.valid_till.slice(11, 16) : 'N/A';
        return (
          <div className="text-sm">
            <div>From: {validFrom} - {validFromTime}</div>
            <div>Till: {validTill} - {validTillTime}</div>
          </div>
        );
      },
    },
    // {
    //   accessorKey: "status",
    //   header: "Status",
    //   cell: ({ row }) => {
    //     const deal = row.original;
    //     const isActive = isDealActive(deal);
    //     return (
    //       <Badge variant={isActive ? "default" : "secondary"}>
    //         {isActive ? "Active" : "Inactive"}
    //       </Badge>
    //     );
    //   },
    // },
    {
      accessorKey: "deal_discount",
      header: "Deal Discount",
      cell: ({ row }) => {
        const deal = parseFloat(row.getValue("deal_discount"));
        return <div className="font-medium pr-4">{deal ? `${deal}%` : 'N/A'}</div>;
      },
    },
    {
      accessorKey: "dealpopup",
      header: "Popup",
      cell: ({ row }) => {
        const deal = row.original;
        return (
          <Badge variant={deal.dealpopup ? "default" : "outline"}>
            {deal.dealpopup ? "Enabled" : "Disabled"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        const deal = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleOpenDialog("edit", deal)}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleTogglePopup(deal.id, !deal.dealpopup)}
              >
                {deal.dealpopup ? "Disable Popup" : "Enable Popup"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(deal.id)}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-4xl font-headline font-bold">
              All Deals
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your salon deals and promotions.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading deals...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-4xl font-headline font-bold">
              All Deals
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your salon deals and promotions.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={() => fetchDeals()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <> 
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-4xl font-headline font-bold">
              All Deals
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your salon deals and promotions.
            </p>
          </div>
          <Button onClick={() => handleOpenDialog("add")}>
            <PlusCircle className="mr-2" /> Add Deal
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <DebouncedInput
              value={searchQuery ?? ''}
              onValueChange={handleSearchChange}
              placeholder="Search deals"
              className="w-full max-w-sm"
            />
          </div>
        </div>
        <DataTable
          ref={tableRef}
          columns={columns as any}
          data={filteredDeals}
        />
      </div>
      <DealFormDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        deal={editingDeal}
        onSave={handleSave}
        saving={saving}
      />
    </>
  );
}