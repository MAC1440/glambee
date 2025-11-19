
"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { suppliers as initialSuppliers } from "@/lib/placeholder-data";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { SupplierFormDialog } from "./SupplierFormDialog";
import { usePermissions } from "@/hooks/use-permissions";


type Supplier = { id: string; name: string; contactPerson?: string; email?: string; phone?: string; };

// Adding some mock details to suppliers
const detailedSuppliers = initialSuppliers.map((s, i) => ({
    ...s,
    contactPerson: `Contact ${i+1}`,
    email: `contact${i+1}@${s.name.toLowerCase().replace(/\s/g, '')}.com`,
    phone: `+1-555-123-456${i+1}`
}))

export function SupplierManagement() {
    const { toast } = useToast();
    const [suppliers, setSuppliers] = React.useState<Supplier[]>(detailedSuppliers);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [dialogMode, setDialogMode] = React.useState<"add" | "edit">("add");
    const [editingSupplier, setEditingSupplier] = React.useState<Supplier | undefined>(undefined);
    
    // Get permissions for procurement module
    const { canCreate, canUpdate, canDelete, canRead } = usePermissions();
    const procurementModuleKey = "procurement" as const;

    const handleOpenDialog = (mode: "add" | "edit", supplier?: Supplier) => {
        setDialogMode(mode);
        setEditingSupplier(supplier);
        setDialogOpen(true);
    };

    const handleSaveSupplier = (supplierData: Omit<Supplier, 'id'>) => {
        if (dialogMode === 'add') {
            const newSupplier = { ...supplierData, id: `sup_${Date.now()}` };
            setSuppliers(prev => [newSupplier, ...prev]);
            toast({ title: "Supplier Added", description: `${newSupplier.name} has been added.` });
        } else if (editingSupplier) {
            const updatedSupplier = { ...editingSupplier, ...supplierData };
            setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? updatedSupplier : s));
            toast({ title: "Supplier Updated", description: `${updatedSupplier.name}'s details have been updated.` });
        }
    };

    const columns: ColumnDef<Supplier>[] = [
    { accessorKey: "name", header: "Supplier Name" },
    { accessorKey: "contactPerson", header: "Contact Person" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Phone" },
    {
        id: "actions",
        cell: ({ row }) => {
            const supplier = row.original;
            return (
            <div className="text-right">
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {/* Show Edit only if user has update permission */}
                    {canUpdate(procurementModuleKey) && (
                        <DropdownMenuItem onClick={() => handleOpenDialog('edit', supplier)}>
                            Edit
                        </DropdownMenuItem>
                    )}
                    {/* Show Delete only if user has delete permission (admins only per requirements) */}
                    {canDelete(procurementModuleKey) && (
                        <>
                            {canUpdate(procurementModuleKey) && <DropdownMenuSeparator />}
                            <DropdownMenuItem className="text-red-600">
                                Delete
                            </DropdownMenuItem>
                        </>
                    )}
                    {/* Show message if no actions available */}
                    {!canUpdate(procurementModuleKey) && !canDelete(procurementModuleKey) && (
                        <DropdownMenuItem disabled>
                            No actions available
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
                </DropdownMenu>
            </div>
            )
        },
    },
    ];

    return (
        <>
        <div className="space-y-4">
        <div className="flex justify-end">
            {canCreate(procurementModuleKey) && (
                <Button onClick={() => handleOpenDialog('add')}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Supplier
                </Button>
            )}
        </div>
        <DataTable columns={columns as any} data={suppliers} />
        </div>
        <SupplierFormDialog 
            isOpen={dialogOpen}
            onOpenChange={setDialogOpen}
            mode={dialogMode}
            supplier={editingSupplier}
            onSave={handleSaveSupplier}
        />
        </>
    );
}
