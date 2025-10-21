
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
import { useMemo, useState, useEffect } from "react";
import { format, parseISO, differenceInYears } from "date-fns";
import { ClientFormDialog } from "./ClientFormDialog";
import { useToast } from "@/hooks/use-toast";
import { ClientsApi, ClientWithDetails } from "@/lib/api/clientsApi";
import { AppointmentsApi, AppointmentWithDetails } from "@/lib/api/appointmentsApi";
import { StaffApi } from "@/lib/api/staffApi";
import type { ClientFormData } from "./ClientForm";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Edit2 } from "lucide-react";

export function ClientDetail({ clientId }: { clientId: string }) {
  const [client, setClient] = useState<ClientWithDetails | null>(null);
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffOptions, setStaffOptions] = useState<Array<{id: string, name: string}>>([]);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const { toast } = useToast();

  // Fetch staff options
  useEffect(() => {
    const fetchStaffOptions = async () => {
      try {
        const response = await StaffApi.getStaff({ limit: 100 });
        setStaffOptions(response.data.map(staff => ({
          id: staff.id,
          name: staff.name || 'Unknown Staff'
        })));
      } catch (error) {
        console.error("Error fetching staff options:", error);
      }
    };

    fetchStaffOptions();
  }, []);

  // Fetch client data and appointments from API
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch client data
        const clientData = await ClientsApi.getCustomerById(clientId);
        setClient(clientData);
        
        // Fetch appointments for this client
        if (clientData) {
          const appointmentsData = await AppointmentsApi.getAppointmentsByCustomerId(clientId);
          setAppointments(appointmentsData);
        }
      } catch (error) {
        console.error("Error fetching client data:", error);
        toast({
          title: "Error",
          description: "Failed to load client details.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (clientId) {
      fetchClientData();
    }
  }, [clientId, toast]);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
          <CardDescription>
            Please wait while we load the client details.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

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

  // Use data from API response which already includes stats
  const totalSpent = client.totalSpent || 0;
  const tags = client.tags || [];

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
  
  const handleSaveClient = async (updatedClientData: ClientFormData) => {
    try {
      setIsFormLoading(true)
      // Update client using comprehensive API - this will update both customers and users tables
      const updatedClient = await ClientsApi.updateCustomerFromForm(clientId, updatedClientData);
      
      if (updatedClient) {
        setClient(updatedClient);
        toast({
          title: "Success",
          description: `${client.name}'s details have been successfully updated.`,
          className: "border-none",
          style: {
            backgroundColor: "lightgreen",
            color: "black",
          }
        });
      }
      setIsFormOpen(false);
    } catch (error: any) {
      console.error("❌ Error updating client:", error);
      toast({
        title: "Error",
        description: error?.message,
        variant: "destructive",
      });
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleStaffEdit = (appointmentId: string) => {
    setEditingStaffId(appointmentId);
  };

  const handleStaffSave = async (appointmentId: string, newStaffId: string | null) => {
    try {
      // Update the appointment with new staff
      await AppointmentsApi.updateAppointmentStaff(appointmentId, newStaffId);
      
      // Update local state
      setAppointments(prev => prev.map(apt => 
        apt.id === appointmentId 
          ? { 
              ...apt, 
              staff: newStaffId 
                ? staffOptions.find(s => s.id === newStaffId) 
                  ? { id: newStaffId, name: staffOptions.find(s => s.id === newStaffId)!.name, avatar: null }
                  : undefined
                : undefined 
            }
          : apt
      ));
      
      setEditingStaffId(null);
      toast({
        title: "Success",
        description: "Staff assignment updated successfully.",
        className: "border-green-500 bg-green-50 text-green-900",
      });
    } catch (error) {
      console.error("Error updating staff:", error);
      toast({
        title: "Error",
        description: "Failed to update staff assignment.",
        variant: "destructive",
      });
    }
  };

  const handleStaffCancel = () => {
    setEditingStaffId(null);
  };
  
  // Generate payment history from appointments (computed on-demand)
  const getPaymentHistory = () => {
    return appointments.map((appointment, index) => ({
      id: `INV-${appointment.id.slice(-6).toUpperCase()}`,
      date: appointment.date,
      amount: appointment.bill || 0,
      status: (appointment.payment_status === 'paid' ? 'Paid' : 'Pending') as "Paid" | "Pending" | "Overdue",
      service: appointment.services?.[0]?.name || 'Service',
    }));
  };

  // Generate services history from appointments (computed on-demand)
  const getServicesHistory = () => {
    const serviceMap = new Map<string, { count: number; total: number }>();
    
    appointments.forEach(appointment => {
      appointment.services?.forEach(service => {
        const existing = serviceMap.get(service.name) || { count: 0, total: 0 };
        serviceMap.set(service.name, {
          count: existing.count + 1,
          total: existing.total + service.price
        });
      });
    });
    
    return Array.from(serviceMap.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      total: data.total,
    }));
  };

  // Note: DOB field is not available in current schema
  const age = null;

  // Compute data once for rendering
  const paymentHistory = getPaymentHistory();
  const servicesHistory = getServicesHistory();

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
             <Link href={`/checkout/${client?.id}`}>
              <DollarSign className="mr-2 h-4 w-4" />
              Add Payment
            </Link>
          </Button>
          <Button variant="outline" onClick={() => setIsFormOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Client
          </Button>
          <Button asChild>
            <Link href={`/appointments?clientId=${client?.id}`}>
              <CalendarPlus className="mr-2 h-4 w-4" />
              Book Appointment
            </Link>
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
                  src={client.avatar || `https://picsum.photos/seed/${client.name || 'client'}/150`}
                  alt={client.name || 'Client'}
                />
                <AvatarFallback className="text-3xl">
                  {client.name?.charAt(0)}
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
                <span className="text-muted-foreground">{(client as any).email || 'No email'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">{(client as any).phone_number || 'No phone'}</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">{client.gender || 'Not specified'}</span>
              </div>
              {/* <div className="flex items-center gap-3">
                <Cake className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Date of birth not available
                </span>
              </div> */}
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
                        <TableHead>Time</TableHead>
                        <TableHead>Staff</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments && appointments.length > 0 ? appointments?.map((appointment) => (
                        <TableRow key={appointment?.id}>
                          <TableCell>{appointment?.date || 'N/A'}</TableCell>
                          <TableCell className="font-medium">
                            {appointment?.services?.map((service) => service.name).join(', ') || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {appointment?.start_time ? format(new Date(appointment.start_time), 'hh:mm a') : 'N/A'}
                          </TableCell>
                          <TableCell className="group relative">
                            {editingStaffId === appointment?.id ? (
                              <div className="flex items-center gap-2">
                                <Select
                                  value={appointment?.staff?.id || ''}
                                  onValueChange={(value) => {
                                    if (value === 'unassigned') {
                                      handleStaffSave(appointment.id, null);
                                    } else {
                                      handleStaffSave(appointment.id, value);
                                    }
                                  }}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Select staff" />
                                  </SelectTrigger>
                                  <SelectContent 
                                    position="popper" 
                                    side="bottom" 
                                    align="start"
                                    sideOffset={4}
                                    avoidCollisions={false}
                                    collisionPadding={0}
                                    className="!transform-none !top-auto !bottom-auto max-h-40 overflow-y-auto"
                                    style={{
                                      position: 'absolute',
                                      top: '100%',
                                      left: 0,
                                      right: 'auto',
                                      bottom: 'auto',
                                      transform: 'none !important'
                                    }}
                                  >
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    {staffOptions.map((staff) => (
                                      <SelectItem key={staff.id} value={staff.id}>
                                        {staff.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleStaffCancel}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 group">
                                <span>{appointment?.staff?.name || 'N/A'}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleStaffEdit(appointment.id)}
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {/* ${totalSpent.toFixed(2)} */}
                            {appointment?.bill || 'N/A'}
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center h-24">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <p className="text-muted-foreground">No appointment history for this client.</p>
                            </div>
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
                      {paymentHistory.length > 0 ? (
                        paymentHistory.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell>{invoice.id}</TableCell>
                            <TableCell>
                              {format(new Date(invoice.date), 'MMM dd, yyyy')}
                            </TableCell>
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
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center h-24">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <p className="text-muted-foreground">No payment history for this client.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
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
                      {servicesHistory.length > 0 ? (
                        servicesHistory.map((service) => (
                          <TableRow key={service.name}>
                            <TableCell className="font-medium">
                              {service.name}
                            </TableCell>
                            <TableCell>{service.count}</TableCell>
                            <TableCell className="text-right">
                              ${service.total.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center h-24">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <p className="text-muted-foreground">No service history for this client.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
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
        client={client as any}
        onSave={handleSaveClient}
        isLoading={isFormLoading}
    />
    </>
  );
}
