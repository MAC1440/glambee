
"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    console.log("Customers: ", customers)
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormLoading, setIsFormLoading] = useState(false);
    const { toast } = useToast();
    const [globalFilter, setGlobalFilter] = useState('');

    const fetchClients = async () => {
      try {
        setIsLoading(true);
        const response = await ClientsApi.getCustomers();
        // console.log("Clients response: ", response)
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
    }, [])

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
    }).sort((a, b) => {
        // Sort by lastVisit date, handling null values
        const dateA = a.lastVisit === 'N/A' || !a.lastVisit ? new Date(0) : new Date(a.lastVisit);
        const dateB = b.lastVisit === 'N/A' || !b.lastVisit ? new Date(0) : new Date(b.lastVisit);
        return dateB.getTime() - dateA.getTime();
    });

    const filteredClients = clients.filter(client => {
        const filter = globalFilter?.toLowerCase();
        return (
            client?.name?.toLowerCase().includes(filter) ||
            client?.email?.toLowerCase().includes(filter) ||
            client?.phone?.includes(filter)
        )
    })


  const handleSaveClient = async (clientData: ClientFormData) => {
    try {
      setIsFormLoading(true);
      console.log("🚀 Starting client creation...");
      
      // Call the API to create the client
      const newClient = await ClientsApi.createCustomerFromForm(clientData);
      console.log("✅ Client created successfully: ", newClient);

      // Show success toast and refresh data
      if(newClient) {
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
        {!isSelectMode && (
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

      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Loading clients...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Total Appointments</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <TableRow
                      key={client?.id}
                      className="hover:bg-muted/50"
                    >
                      <TableCell>
                        <Link href={`/clients/${(client?.id)}`} className="flex items-center gap-3 group">
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
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>{client?.lastVisit}</TableCell>
                      <TableCell>{client?.appointments}</TableCell>
                      <TableCell className="text-right">
                        ${client?.totalSpent?.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {isSelectMode ? (
                           <Button variant="default" onClick={() => onClientSelect?.(client)}>
                                <UserCheck className="mr-2 h-4 w-4" /> Select
                            </Button>
                        ) : (
                            <div className="flex gap-2 justify-end">
                                <Button asChild variant="outline" size="sm">
                                   <Link href={`/checkout/${(client?.id)}`}>
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    Payment
                                  </Link>
                                </Button>
                                <Button asChild variant="default" size="sm">
                                    <Link href={`/appointments?clientId=${(client?.id)}`}>
                                        <CalendarPlus className="mr-2 h-4 w-4" />
                                        Book
                                    </Link>
                                </Button>
                            </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
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
                        {!isSelectMode && !globalFilter && (
                          <Button onClick={() => setIsFormOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add First Client
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
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
