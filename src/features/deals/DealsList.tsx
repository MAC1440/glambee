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
import { usePermissions } from "@/hooks/use-permissions";
import { UnauthorizedAccess } from "@/components/ui/unauthorized-access";
import { RolesApi } from "@/lib/api/rolesApi";

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
  const sessionData = localStorage.getItem("session");
  console.log("Session data in deals: ", JSON.parse(sessionData || ''))
  const [userPermissions, setUserPermissions] = React.useState<any>(null);
  console.log("User permissions in deals: ", userPermissions)
  // Get permissions for deals module
  const { canCreate, canUpdate, canDelete, canRead, hasModuleAccess } = usePermissions();
  const dealsModuleKey = "deals" as const;
  
  // State to track if user has access (with async permission loading)
  const [hasAccess, setHasAccess] = React.useState<boolean | null>(null);
  
  // Check if user has access to deals module (with async permission fetch if needed)
  React.useEffect(() => {
    const checkAccess = async () => {
      // First check synchronously (if permissions are in session)
      const syncAccess = hasModuleAccess(dealsModuleKey);
      if (syncAccess) {
        setHasAccess(true);
        return;
      }
      
      // If no permissions in session, fetch them
      const sessionData = localStorage.getItem("session");
      if (!sessionData) {
        setHasAccess(false);
        return;
      }
      
      try {
        const session = JSON.parse(sessionData);
        const userId = session.id;
        
        // If user is admin, they have access
        if (session.role === "SUPER_ADMIN" || session.role === "SALON_ADMIN" || session.userType === "salon" || session.userType === "SUPER_ADMIN" || session.userType === "SALON_ADMIN") {
          setHasAccess(true);
          return;
        }
        
        // Fetch permissions for staff
        if (userId) {
          const { fetchAndUpdatePermissions } = await import("@/hooks/use-permissions");
          const permissions = await fetchAndUpdatePermissions(userId);
          
          if (permissions) {
            // Check if user has access to deals module
            const modulePermissions = permissions[dealsModuleKey];
            const access = modulePermissions && (
              modulePermissions.read === true ||
              modulePermissions.create === true ||
              modulePermissions.update === true ||
              modulePermissions.delete === true
            );
            setHasAccess(access || false);
          } else {
            setHasAccess(false);
          }
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error("Error checking module access:", error);
        setHasAccess(false);
      }
    };
    
    checkAccess();
    
    // Listen for session updates
    const handleSessionUpdate = () => {
      const syncAccess = hasModuleAccess(dealsModuleKey);
      setHasAccess(syncAccess);
    };
    
    window.addEventListener("sessionUpdated", handleSessionUpdate);
    return () => {
      window.removeEventListener("sessionUpdated", handleSessionUpdate);
    };
  }, [dealsModuleKey, hasModuleAccess]);

  const fetchDeals = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await DealsApi.getDeals({
        search: searchQuery || undefined,
        salonId: JSON.parse(sessionData || '').salonId,
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

  // const fetchUserPermissionsForThisTab = async () => {
  //   try {
  //     const response = await RolesApi.getStaffPermissions(JSON.parse(sessionData || '').id);
  //     console.log("User permissions: ", response)
  //     setUserPermissions(response)
  //   }
  //   catch (e) {
  //     console.error("Error while fetching permissions...", e)
  //   }
  // }

  // React.useEffect(() => {
  //   fetchUserPermissionsForThisTab()
  // }, [sessionData])

  // React.useEffect(() => {
  //   console.log("Check effect for permissions")
  //   // const keys = Object.keys(userPermissions || '')
  //   // console.log("Keys: ", keys)
  //   if (userPermissions && sessionData ) {
  //     console.log("User permissions: ", userPermissions)
  //     if(!(userPermissions.deals)) {
  //       // navigate('/not-authorized')
  //       console.log("Not authorised...")
  //     }
  //   }
  // }, [userPermissions])

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
        const savedDeal = await DealsApi.createDeal({...dealData, salon_id: JSON.parse(sessionData || '').salonId});
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
            {/* {deal.media_url && (
              <Image className="h-4 w-4 text-muted-foreground" />
            )} */}
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
              {/* Show Edit only if user has update permission */}
              {canUpdate(dealsModuleKey) && (
                <DropdownMenuItem
                  onClick={() => handleOpenDialog("edit", deal)}
                >
                  Edit
                </DropdownMenuItem>
              )}
              {/* Show Popup toggle only if user has update permission */}
              {canUpdate(dealsModuleKey) && (
                <DropdownMenuItem
                  onClick={() => handleTogglePopup(deal.id, !deal.dealpopup)}
                >
                  {deal.dealpopup ? "Disable Popup" : "Enable Popup"}
                </DropdownMenuItem>
              )}
              {/* Show Delete only if user has delete permission (admins only per requirements) */}
              {canDelete(dealsModuleKey) && (
                <>
                  {canUpdate(dealsModuleKey) && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={() => handleDelete(deal.id)}
                    className="text-red-600"
                  >
                    Delete
                  </DropdownMenuItem>
                </>
              )}
              {/* Show message if no actions available */}
              {!canUpdate(dealsModuleKey) && !canDelete(dealsModuleKey) && (
                <DropdownMenuItem disabled>
                  No actions available
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Check if user has access to deals module (show loading while checking)
  // if (hasAccess === null) {
  //   return (
  //     <div className="flex items-center justify-center min-h-[60vh]">
  //       <div className="flex flex-col items-center gap-4">
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  //         <p className="text-muted-foreground">Checking permissions...</p>
  //       </div>
  //     </div>
  //   );
  // }
  
  if (hasAccess === false) {
    return <UnauthorizedAccess moduleName="Deals" />;
  }

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
          {canCreate(dealsModuleKey) && (
            <Button onClick={() => handleOpenDialog("add")}>
              <PlusCircle className="mr-2" /> Add Deal
            </Button>
          )}
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