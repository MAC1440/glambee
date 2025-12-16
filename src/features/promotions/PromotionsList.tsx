
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { PromotionsApi, DiscountWithSalon } from "@/lib/api/promotionsApi";
import { PromotionFormDialog } from "./PromotionFormDialog";
import { usePermissions } from "@/hooks/use-permissions";

export function PromotionsList() {
  const { toast } = useToast();
  const [promotions, setPromotions] = React.useState<DiscountWithSalon[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"add" | "edit">("add");
  const [editingPromotion, setEditingPromotion] = React.useState<DiscountWithSalon | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [promotionToDelete, setPromotionToDelete] = React.useState<DiscountWithSalon | null>(null);
  const sessionData = localStorage.getItem("session");
  
  // Get permissions for promotions module
  const { canCreate, canUpdate, canDelete, canRead } = usePermissions();
  const promotionsModuleKey = "promotions" as const;

  // Fetch promotions on mount
  React.useEffect(() => {
    const loadPromotions = async () => {
      try {
        setLoading(true);
        const response = await PromotionsApi.getDiscounts({salonId: JSON.parse(sessionData || '').salonId});
        setPromotions(response.data);
      } catch (error) {
        console.error("Error loading promotions:", error);
        toast({
          title: "Error",
          description: "Failed to load promotions. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadPromotions();
  }, [toast]);

  const handleOpenDialog = (
    mode: "add" | "edit",
    promotion?: DiscountWithSalon
  ) => {
    setDialogMode(mode);
    setEditingPromotion(promotion);
    setDialogOpen(true);
  };

  const handleSave = async (promotionData: {
    service_discount: number;
    deal_discount: number;
    package_discount: number;
    salon_id?: string;
  }) => {
    try {
      if (dialogMode === "add") {
        const newPromotion = await PromotionsApi.createDiscount({...promotionData, salon_id: JSON.parse(sessionData || '').salonId});
        setPromotions((prev) => [newPromotion, ...prev]);
        toast({
          title: "Promotion Added",
          description: "Discount has been successfully created.",
          style: {
            backgroundColor: "lightgreen",
            color: "black",
          }
        });
      } else if (editingPromotion) {
        const updatedPromotion = await PromotionsApi.updateDiscount(
          editingPromotion.id,
          promotionData
        );
        if (updatedPromotion) {
          setPromotions((prev) =>
            prev.map((p) => (p.id === updatedPromotion.id ? updatedPromotion : p))
          );
          toast({
            title: "Promotion Updated",
            description: "Discount details have been updated.",
            style: {
              backgroundColor: "lightgreen",
              color: "black",
            }
          });
        }
      }
      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving promotion:", error);
      toast({
        title: "Error",
        description: "Failed to save promotion. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (promotion: DiscountWithSalon) => {
    setPromotionToDelete(promotion);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!promotionToDelete) return;

    try {
      await PromotionsApi.deleteDiscount(promotionToDelete.id);
      setPromotions((prev) => prev.filter((p) => p.id !== promotionToDelete.id));
      toast({
        title: "Promotion Deleted",
        description: "Discount has been removed.",
        style: {
          backgroundColor: "lightgreen",
          color: "black",
        }
      });
      setDeleteDialogOpen(false);
      setPromotionToDelete(null);
    } catch (error) {
      console.error("Error deleting promotion:", error);
      toast({
        title: "Error",
        description: "Failed to delete promotion. Please try again.",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<DiscountWithSalon>[] = [
    {
      accessorKey: "service_discount",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            <span>Service Discount (%)</span>
            <Button 
              variant="ghost" 
              onClick={() => {
                // Get current sort state
                const currentSort = column.getIsSorted();
                // If not sorted or descending, sort ascending
                // If ascending, sort descending
                column.toggleSorting(currentSort === "asc");
              }}
            >
              <CaretSortIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const discount = parseFloat(row.getValue("service_discount"));
        return <div className="font-medium">{discount}%</div>;
      },
    },
    {
      accessorKey: "deal_discount",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            <span>Deal Discount (%)</span>
            <Button 
              variant="ghost" 
              onClick={() => {
                // Get current sort state
                const currentSort = column.getIsSorted();
                // If not sorted or descending, sort ascending
                // If ascending, sort descending
                column.toggleSorting(currentSort === "asc");
              }}
            >
              <CaretSortIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const discount = parseFloat(row.getValue("deal_discount"));
        return <div className="font-medium">{discount}%</div>;
      },
    },
    {
      accessorKey: "package_discount",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            <span>Package Discount (%)</span>
            <Button 
              variant="ghost" 
              onClick={() => {
                // Get current sort state
                const currentSort = column.getIsSorted();
                // If not sorted or descending, sort ascending
                // If ascending, sort descending
                column.toggleSorting(currentSort === "asc");
              }}
            >
              <CaretSortIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const discount = parseFloat(row.getValue("package_discount"));
        return <div className="font-medium">{discount}%</div>;
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            <span>Created At</span>
            <Button 
              variant="ghost" 
              onClick={() => {
                // Get current sort state
                const currentSort = column.getIsSorted();
                // If not sorted or descending, sort ascending
                // If ascending, sort descending
                column.toggleSorting(currentSort === "asc");
              }}
            >
              <CaretSortIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return <div className="text-sm">{date.toLocaleDateString()}</div>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        const promotion = row.original;

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
              {canUpdate(promotionsModuleKey) && (
                <DropdownMenuItem onClick={() => handleOpenDialog("edit", promotion)}>
                  Edit
                </DropdownMenuItem>
              )}
              {/* Show Delete only if user has delete permission (admins only per requirements) */}
              {canDelete(promotionsModuleKey) && (
                <>
                  {canUpdate(promotionsModuleKey) && <DropdownMenuSeparator />}
                  <DropdownMenuItem 
                    onClick={() => handleDeleteClick(promotion)} 
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    Delete
                  </DropdownMenuItem>
                </>
              )}
              {/* Show message if no actions available */}
              {!canUpdate(promotionsModuleKey) && !canDelete(promotionsModuleKey) && (
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading promotions...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-4xl font-headline font-bold">Promotions & Discounts</h1>
            <p className="text-muted-foreground mt-2">
              Manage your discount rates for services, deals, and packages.
            </p>
          </div>
          {canCreate(promotionsModuleKey) && (
            <Button onClick={() => handleOpenDialog("add")}>
              <PlusCircle className="mr-2" /> Add Discount
            </Button>
          )}
        </div>
        
        <DataTable 
          columns={columns as any} 
          data={promotions}
        />
      </div>
      <PromotionFormDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        promotion={editingPromotion}
        onSave={handleSave}
      />
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this promotion discount. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setDeleteDialogOpen(false);
                setPromotionToDelete(null);
              }}
              className="bg-gray-100 hover:bg-gray-300 text-gray-900 border-gray-300"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
