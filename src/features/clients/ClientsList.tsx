
"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CaretSortIcon } from "@radix-ui/react-icons";
import {
  ColumnDef,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { appointments, mockCustomers as initialMockCustomers } from "@/lib/placeholder-data";
import { PlusCircle, CalendarPlus, UserCheck, DollarSign, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ClientFormDialog } from "./ClientFormDialog";
import { useToast } from "@/hooks/use-toast";
import type { Client, ClientFormData } from "./ClientForm";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { ClientsApi } from "@/lib/api/clientsApi";
import { usePermissions } from "@/hooks/use-permissions";
import { UnauthorizedAccess } from "@/components/ui/unauthorized-access";
import { DataTable } from "@/components/ui/data-table";
const getTagColor = (tag: string) => {
  switch (tag.toLowerCase()) {
    case "vip":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300";
    case "new":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
    case "high spender":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300";
  }
};

type ClientsListProps = {
  isSelectMode?: boolean;
  onClientSelect?: (client: Client) => void;
};


export function ClientsList({ isSelectMode = false, onClientSelect }: ClientsListProps) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const { toast } = useToast();
  const [globalFilter, setGlobalFilter] = useState('');
  const sessionData = localStorage.getItem("session");

  // Get permissions for clients module
  const { canCreate, canUpdate, canDelete, canRead, hasModuleAccess } = usePermissions();
  const clientsModuleKey = "clients" as const;
  const hasAccess = hasModuleAccess(clientsModuleKey);
  const canCreateSchedule = canCreate("schedule");
  const canUpdateSchedule = canUpdate("schedule");

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const salonId = sessionData ? JSON.parse(sessionData).salonId : null;
      const response = await ClientsApi.getCustomers({
        salonId: salonId,
      });
      // API now returns PaginatedResponse, extract data array
      setCustomers(response.data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchClients();
  }, [sessionData])

  // Process customers data - API now returns data with stats already calculated
  const clients = customers?.map(customer => {
    // Use the data from API response which already has appointments, totalSpent, lastVisit, tags
    return {
      ...customer,
      // Ensure we have fallback values
      appointments: customer?.appointments || 0,
      totalSpent: customer?.totalSpent || 0,
      lastVisit: customer?.lastVisit || 'N/A',
      tags: customer?.tags || ['new'],
      // Email and phone are now included from users table via API
      email: customer?.email || 'No email',
      phone: customer?.phone_number || 'No phone'
    };
  });


  const handleSaveClient = async (clientData: ClientFormData) => {
    try {
      setIsFormLoading(true);

      // Call the API to create the client
      const newClient = await ClientsApi.createCustomerFromForm(clientData);

      // Show success toast and refresh data
      if (newClient) {
        toast({
          title: "✅ Success",
          description: `${clientData.name} has been successfully added.`,
          className: "border-green-500 bg-green-50 text-green-900",
        });
        // Refresh the clients list
        await fetchClients();
      }

      // Close form
      setIsFormOpen(false);
    } catch (error: any) {
      console.error("❌ Error creating client:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFormLoading(false);
    }
  };

  // if (hasAccess === false) {
  //   return <UnauthorizedAccess moduleName="Clients" />;
  // }

  // Determine if Actions column should be shown
  // Show if user has ANY of these permissions:
  // - Can update clients (for Payment button)
  // - Can create/update schedule (for Book button)
  const shouldShowActionsColumn = 
    canUpdate(clientsModuleKey) ||
    (canCreateSchedule || canUpdateSchedule);

  // Define columns for DataTable
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            <span>Name</span>
            <Button
              variant="ghost"
              onClick={() => {
                const currentSort = column.getIsSorted();
                column.toggleSorting(currentSort === "asc");
              }}
            >
              <CaretSortIcon />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const client = row.original;
        return (
          <Link href={`/clients/${client?.id}`} className="flex items-center gap-3 group">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={client?.avatar || `https://picsum.photos/seed/${client?.name}/100`}
                alt="Avatar"
              />
              <AvatarFallback>
                {client?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium group-hover:underline">{client?.name}</div>
              <div className="text-sm text-muted-foreground">
                {client?.email || 'No email'}
              </div>
            </div>
          </Link>
        );
      },
    },
    {
      accessorKey: "tags",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            <span>Tags</span>
            <Button
              variant="ghost"
              onClick={() => {
                const currentSort = column.getIsSorted();
                column.toggleSorting(currentSort === "asc");
              }}
            >
              <CaretSortIcon />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const client = row.original;
        return (
          <div className="flex gap-2">
            {client?.tags?.map((tag: string) => (
              <Badge
                key={tag}
                variant="outline"
                className={cn(getTagColor(tag))}
              >
                {tag}
              </Badge>
            ))}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const tagsA = (rowA.original.tags || []).join(', ');
        const tagsB = (rowB.original.tags || []).join(', ');
        return tagsA.localeCompare(tagsB);
      },
    },
    {
      accessorKey: "lastVisit",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            <span>Last Visit</span>
            <Button
              variant="ghost"
              onClick={() => {
                const currentSort = column.getIsSorted();
                column.toggleSorting(currentSort === "asc");
              }}
            >
              <CaretSortIcon />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const lastVisit = row.getValue("lastVisit") as string;
        return <div>{lastVisit}</div>;
      },
      sortingFn: (rowA, rowB) => {
        const dateA = rowA.getValue("lastVisit") as string;
        const dateB = rowB.getValue("lastVisit") as string;
        const timeA = dateA === 'N/A' || !dateA ? new Date(0).getTime() : new Date(dateA).getTime();
        const timeB = dateB === 'N/A' || !dateB ? new Date(0).getTime() : new Date(dateB).getTime();
        return timeB - timeA; // Default to descending (most recent first)
      },
    },
    {
      accessorKey: "appointments",
      header: ({ column }) => {
        return (
          <div className="flex items-center justify-end">
            <span>Total Appointments</span>
            <Button
              variant="ghost"
              onClick={() => {
                const currentSort = column.getIsSorted();
                column.toggleSorting(currentSort === "asc");
              }}
            >
              <CaretSortIcon />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const appointments = row.getValue("appointments") as number;
        return <div className="flex items-center justify-center">{appointments}</div>;
      },
    },
    {
      accessorKey: "totalSpent",
      header: ({ column }) => {
        return (
          <div className="flex items-center justify-end">
            <span>Total Spent</span>
            <Button
              variant="ghost"
              onClick={() => {
                const currentSort = column.getIsSorted();
                column.toggleSorting(currentSort === "asc");
              }}
            >
              <CaretSortIcon />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const totalSpent = row.getValue("totalSpent") as number;
        return <div className="text-center">${totalSpent?.toFixed(2)}</div>;
      },
    },
    // Conditionally include Actions column based on permissions
    ...(shouldShowActionsColumn ? [{
      id: "actions",
      header: ({ column }: { column: any }) => {
        return (
          <div className="flex justify-center">
            <span>Actions</span>
          </div>
        );
      },
      enableHiding: false,
      cell: ({ row }: { row: any }) => {
        const client = row.original;
        return (
          <div className="text-right">
            {isSelectMode ? (
              <Button variant="default"
                onClick={() => {
                  // Update the URL with clientId (no reload, no redirect)
                  const url = new URL(window.location.href);
                  url.searchParams.set("clientId", client.id);
                  window.history.pushState({}, "", url);
                  // Then call parent callback to select client
                  onClientSelect?.(client);
                }}
              >
                <UserCheck className="mr-2 h-4 w-4" /> Select
              </Button>
            ) : (
              <div className="flex gap-2 justify-end">
                {canUpdate(clientsModuleKey) && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/checkout/${client?.id}`}>
                      <DollarSign className="mr-2 h-4 w-4" />
                      Payment
                    </Link>
                  </Button>
                )}
                {(canCreateSchedule || canUpdateSchedule) && (
                <Button asChild variant="default" size="sm">
                  <Link href={`/appointments?clientId=${client?.id}`}>
                    <CalendarPlus className="mr-2 h-4 w-4" />
                      Book
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      },
    }] : []),
  ];

  // Filter clients based on search query (client-side filtering for DataTable)
  const filteredClients = clients.filter(client => {
    const filter = globalFilter?.toLowerCase();
    if (!filter) return true;
    return (
      client?.name?.toLowerCase().includes(filter) ||
      client?.email?.toLowerCase().includes(filter) ||
      client?.phone?.includes(filter)
    );
  });

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-4xl font-headline font-bold">{isSelectMode ? 'Select a Client' : 'Clients'}</h1>
            <p className="text-muted-foreground mt-2">
              {isSelectMode ? 'Choose a client to start a new booking.' : 'View and manage your clients.'}
            </p>
          </div>
          {!isSelectMode && canCreate(clientsModuleKey) && (
            <Button onClick={() => setIsFormOpen(true)}>
              <PlusCircle className="mr-2" />
              Add Client
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <DebouncedInput
            value={globalFilter ?? ""}
            onValueChange={(value) => setGlobalFilter(String(value))}
            className="w-full max-w-sm"
            placeholder="Search by name, email, or phone..."
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Loading clients...</p>
            </div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border rounded-md">
            <div className="flex flex-col items-center gap-4">
              <Search className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="text-lg font-medium text-muted-foreground">
                  {globalFilter ? 'No clients found' : 'No clients available'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {globalFilter
                    ? `No clients match "${globalFilter}". Try a different search term.`
                    : 'Get started by adding your first client.'
                  }
                </p>
              </div>
              {!isSelectMode && !globalFilter && canCreate(clientsModuleKey) && (
                <Button onClick={() => setIsFormOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add First Client
                </Button>
              )}
            </div>
          </div>
        ) : (
          <DataTable
            columns={columns as any}
            data={filteredClients}
          />
        )}
      </div>
      <ClientFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveClient}
        isLoading={isFormLoading}
      />
    </>
  );
}
