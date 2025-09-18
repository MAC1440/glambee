
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { appointments, mockCustomers } from "@/lib/placeholder-data";
import { cn } from "@/lib/utils";
import {
  Mail,
  Phone,
  Edit,
  CalendarPlus,
  ArrowLeft,
  DollarSign,
  Cake,
  User,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { format, parseISO, differenceInYears } from "date-fns";
import { ClientFormDialog } from "./ClientFormDialog";
import { useToast } from "@/hooks/use-toast";

type Customer = {
  id: string;
  phone: string;
  name: string;
  email: string;
  gender: string;
  dob: string;
};

export function ClientDetail({ client: initialClient }: { client: Customer | undefined }) {
  const [client, setClient] = useState(initialClient);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  
  if (!client) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Client Not Found</CardTitle>
          <CardDescription>
            The client you are looking for does not exist.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const clientAppointments = appointments.filter(
    (apt) => apt.customer.email === client.email
  );

  const totalSpent = clientAppointments.reduce(
    (sum, apt) => sum + apt.price,
    0
  );

  const tags: string[] = [];
  if (clientAppointments.length > 5) {
    tags.push("VIP");
  }
  if (clientAppointments.length > 0 && clientAppointments.length <= 2) {
    tags.push("New");
  }
  if (totalSpent > 500) {
    tags.push("High Spender");
  }

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

  const paymentHistory = clientAppointments.map((apt, index) => {
    const statuses = ["Paid", "Pending", "Overdue"];
    const status = statuses[index % statuses.length];
    return {
      id: `INV-${String(index + 1).padStart(3, "0")}`,
      date: apt.date,
      amount: apt.price,
      status: status as "Paid" | "Pending" | "Overdue",
      service: apt.service,
    };
  });

  const servicesHistory = useMemo(() => {
    const serviceMap = new Map<string, { count: number; total: number }>();
    clientAppointments.forEach((apt) => {
      const existing = serviceMap.get(apt.service) || { count: 0, total: 0 };
      existing.count++;
      existing.total += apt.price;
      serviceMap.set(apt.service, existing);
    });
    return Array.from(serviceMap.entries()).map(([name, data]) => ({
      name,
      ...data,
    }));
  }, [clientAppointments]);
  
  const handleSaveClient = (updatedClientData: Omit<Customer, 'id'>) => {
    const updatedClient = { ...client, ...updatedClientData };
    setClient(updatedClient);

    const customerIndex = mockCustomers.findIndex(c => c.id === client.id);
    if(customerIndex !== -1) {
        mockCustomers[customerIndex] = updatedClient;
    }
    
    toast({
        title: "Client Updated",
        description: `${updatedClient.name}'s details have been successfully updated.`
    });
    setIsFormOpen(false);
  };
  
  const age = client.dob ? differenceInYears(new Date(), parseISO(client.dob)) : null;

  return (
    <>
    <div className="flex flex-col gap-8">
      <div className="flex w-full items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/clients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Client List
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
             <Link href={`/checkout/${encodeURIComponent(client.email)}`}>
              <DollarSign className="mr-2 h-4 w-4" />
              Add Payment
            </Link>
          </Button>
          <Button variant="outline" onClick={() => setIsFormOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Client
          </Button>
          <Button>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Book Appointment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          <Card>
            <CardHeader className="items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage
                  src={`https://picsum.photos/seed/${client.name}/150`}
                  alt={client.name}
                />
                <AvatarFallback className="text-3xl">
                  {client.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">{client.name}</CardTitle>
              <div className="flex gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={cn("text-sm", getTagColor(tag))}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">{client.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">{client.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">{client.gender}</span>
              </div>
              <div className="flex items-center gap-3">
                <Cake className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {client.dob ? `${format(parseISO(client.dob), "MMMM d, yyyy")} (${age} years old)` : "Not specified"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="appointments">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Client History</CardTitle>
                    <CardDescription>
                      Detailed history for {client.name}.
                    </CardDescription>
                  </div>
                  <TabsList>
                    <TabsTrigger value="appointments">Appointments</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                    <TabsTrigger value="services">Services</TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              <CardContent>
                <TabsContent value="appointments">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Staff</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientAppointments.length > 0 ? (
                        clientAppointments.map((apt) => (
                          <TableRow key={apt.id}>
                            <TableCell>{apt.date}</TableCell>
                            <TableCell className="font-medium">
                              {apt.service}
                            </TableCell>
                            <TableCell>{apt.staff}</TableCell>
                            <TableCell className="text-right">
                              ${apt.price.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center h-24">
                            No appointment history for this client.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
                <TabsContent value="payments">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentHistory.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>{invoice.id}</TableCell>
                          <TableCell>{invoice.date}</TableCell>
                          <TableCell>{invoice.service}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn({
                                "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300":
                                  invoice.status === "Paid",
                                "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300":
                                  invoice.status === "Pending",
                                "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300":
                                  invoice.status === "Overdue",
                              })}
                            >
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            ${invoice.amount.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                <TabsContent value="services">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service Name</TableHead>
                        <TableHead>Times Booked</TableHead>
                        <TableHead className="text-right">
                          Total Spent
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {servicesHistory.map((service) => (
                        <TableRow key={service.name}>
                          <TableCell className="font-medium">
                            {service.name}
                          </TableCell>
                          <TableCell>{service.count}</TableCell>
                          <TableCell className="text-right">
                            ${service.total.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </div>
    </div>
    <ClientFormDialog 
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        client={client}
        onSave={handleSaveClient}
    />
    </>
  );
}
