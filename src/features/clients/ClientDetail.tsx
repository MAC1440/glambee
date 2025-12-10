
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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { format, parseISO, differenceInYears } from "date-fns";
import { ClientFormDialog } from "./ClientFormDialog";
import { useToast } from "@/hooks/use-toast";
import { ClientsApi, ClientWithDetails } from "@/lib/api/clientsApi";
import { AppointmentsApi, AppointmentWithDetails } from "@/lib/api/appointmentsApi";
import { StaffApi } from "@/lib/api/staffApi";
import { ServicesApi } from "@/lib/api/servicesApi";
import type { ClientFormData } from "./ClientForm";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Edit2 } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { CaretSortIcon } from "@radix-ui/react-icons";

export function ClientDetail({ clientId }: { clientId: string }) {
  const [client, setClient] = useState<ClientWithDetails | null>(null);
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  console.log("Appointments: ", appointments?.flatMap((item) => item))
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffOptions, setStaffOptions] = useState<Array<{ id: string, name: string }>>([]);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const { toast } = useToast();
  const sessionData = localStorage.getItem("session");
  const salonId = sessionData ? JSON.parse(sessionData).salonId : null;
  const { canCreate, canUpdate } = usePermissions();
  const clientsModuleKey = "clients" as const;
  const scheduleModuleKey = "schedule" as const;
  const hasScheduleAccess = canCreate(scheduleModuleKey) || canUpdate(scheduleModuleKey);

  // Fetch staff options for a specific appointment based on its service/deal category
  const fetchStaffForAppointment = async (appointment: AppointmentWithDetails) => {
    try {
      setLoadingStaff(true);
      const eligibleStaffMap = new Map<string, any>();

      // Check if appointment has services
      if (appointment.services && appointment.services.length > 0) {
        // Get staff for all services and combine them (union)
        for (const service of appointment.services) {
          if (service.id) {
            const staff = await ServicesApi.getStaffForService(service.id, salonId || '');
            staff.forEach(s => {
              if (!eligibleStaffMap.has(s.id)) {
                eligibleStaffMap.set(s.id, s);
              }
            });
          }
        }
      }
      
      // Check if appointment has deals
      if (appointment.deals && appointment.deals.length > 0) {
        // Get staff for all deals and combine them (union)
        for (const deal of appointment.deals) {
          if (deal.id) {
            const staff = await ServicesApi.getStaffForDeal(deal.id, salonId || '');
            staff.forEach(s => {
              if (!eligibleStaffMap.has(s.id)) {
                eligibleStaffMap.set(s.id, s);
              }
            });
          }
        }
      }

      const eligibleStaff = Array.from(eligibleStaffMap.values());

      // If no eligible staff found, show all staff as fallback
      if (eligibleStaff.length === 0) {
        const response = await StaffApi.getStaff({ limit: 100, salonId });
        setStaffOptions(response.data.map(staff => ({
          id: staff.id,
          name: staff.name || 'Unknown Staff'
        })));
      } else {
        setStaffOptions(eligibleStaff.map(staff => ({
          id: staff.id,
          name: staff.name || 'Unknown Staff'
        })));
      }
    } catch (error) {
      console.error("Error fetching staff options:", error);
      // Fallback to all staff on error
      try {
        const response = await StaffApi.getStaff({ limit: 100, salonId });
        setStaffOptions(response.data.map(staff => ({
          id: staff.id,
          name: staff.name || 'Unknown Staff'
        })));
      } catch (fallbackError) {
        console.error("Error fetching fallback staff:", fallbackError);
      }
    } finally {
      setLoadingStaff(false);
    }
  };

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
          const appointmentsData = await AppointmentsApi.getAppointmentsByCustomerId(clientId, salonId || '');
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

  const handleStaffEdit = async (appointmentId: string) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      setEditingStaffId(appointmentId);
      // Fetch staff options based on appointment's service/deal
      await fetchStaffForAppointment(appointment);
    }
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
        style: {
          backgroundColor: "lightgreen",
          color: "black",
        }
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

  const getAppointments = () => {
    return appointments?.map((appointment) => ({
      id: appointment.id,
      appointmentId: appointment.id,
      date: appointment.date,
      service: appointment.services?.map((item) => item.name).join(' | ') || 'N/A',
      deal: appointment.deals?.map((item) => item.name).join(' | ') || 'N/A',
      time: appointment.start_time ? format(new Date(appointment.start_time), 'hh:mm a') : 'N/A',
      staff: appointment.staff,
      price: appointment.bill || 0,
    })) || []
  }

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

  // Generate deals history from appointments (computed on-demand)
  const getDealsHistory = () => {
    const dealMap = new Map<string, { count: number; total: number }>();

    appointments.forEach(appointment => {
      appointment.deals?.forEach(deal => {
        const existing = dealMap.get(deal.name) || { count: 0, total: 0 };
        dealMap.set(deal.name, {
          count: existing.count + 1,
          total: existing.total + deal.price
        });
      });
    });

    return Array.from(dealMap.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      total: data.total,
    }));
  };

  const appointmentsData = getAppointments()
  const paymentHistory = getPaymentHistory()
  const servicesHistory = getServicesHistory()
  const dealsHistory = getDealsHistory()

  // Appointments columns
  const appointmentsColumns: ColumnDef<typeof appointmentsData[0]>[] = [
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            <span>Date</span>
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
              <CaretSortIcon className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => format(new Date(row.original.date), 'MMM dd, yyyy'),
    },
    {
      accessorKey: "service",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            <span>Service</span>
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
              <CaretSortIcon className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => <span className="font-medium">{row.original.service}</span>,
    },
    {
      accessorKey: "deal",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            <span>Deal</span>
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
              <CaretSortIcon className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        console.log("Row: ", row)
        return (<span className="font-medium">{row.original.deal}</span>)
      },
    },
    {
      accessorKey: "time",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            <span>Time</span>
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
              <CaretSortIcon className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "staff",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            <span>Staff</span>
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
              <CaretSortIcon className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const appointment = appointments.find(apt => apt.id === row.original.appointmentId);
        if (!appointment) return 'N/A';

        return (
          <div className="group relative">
            {editingStaffId === appointment.id ? (
              <div className="flex items-center gap-2">
                <Select
                  value={appointment.staff?.id || ''}
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
                    {loadingStaff ? (
                      <SelectItem value="loading" disabled>Loading staff...</SelectItem>
                    ) : (
                      staffOptions.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.name}
                        </SelectItem>
                      ))
                    )}
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
                <span>{appointment.staff?.name || 'N/A'}</span>
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
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            <span>Price</span>
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
              <CaretSortIcon className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => <div>{row.original.price}</div>,
    },
  ]

  // Payments columns
  const paymentsColumns: ColumnDef<typeof paymentHistory[0]>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <div>
            <span>Invoice ID</span>
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
              <CaretSortIcon className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            <span>Date</span>
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
              <CaretSortIcon className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => format(new Date(row.original.date), 'MMM dd, yyyy'),
    },
    {
      accessorKey: "service",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            <span>Service</span>
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
              <CaretSortIcon className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            <span>Status</span>
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
              <CaretSortIcon className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={cn({
            "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300":
              row.original.status === "Paid",
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300":
              row.original.status === "Pending",
            "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300":
              row.original.status === "Overdue",
          })}
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => {
        // We need to put amount column dynamically at the end of the table for better UI
        return (
          <div className="flex items-center justify-end gap-1">
            <span>Amount</span>
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
              <CaretSortIcon className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => <div className="text-right pr-10">${row.original.amount.toFixed(2)}</div>,
    },
  ];

  // Services columns
  const servicesColumns: ColumnDef<typeof servicesHistory[0]>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            <span>Service Name</span>
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
              <CaretSortIcon className="h-4 w-4" />
            </Button>
            </div>
        );
      },
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: "count",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            <span>Times Booked</span>
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
              <CaretSortIcon className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "total",
      header: ({ column }) => {
        return (
          <div className="flex items-center justify-end">
            <span>Total Spent</span>
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
              <CaretSortIcon className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => <div className="text-right pr-12">${row.original.total.toFixed(2)}</div>,
    },
  ];

  // Deals columns
  const dealsColumns: ColumnDef<typeof dealsHistory[0]>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            <span>Deal Name</span>
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
              <CaretSortIcon className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: "count",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            <span>Times Booked</span>
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
              <CaretSortIcon className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "total",
      header: ({ column }) => {
        return (
          <div className="flex items-center justify-end">
            <span>Total Spent</span>
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
              <CaretSortIcon className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => <div className="text-right pr-12">${row.original.total.toFixed(2)}</div>,
    },
  ];

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
            {canUpdate(clientsModuleKey) && (
              <Button variant="outline" asChild>
                <Link href={`/checkout/${client?.id}`}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Add Payment
                </Link>
              </Button>
            )}
            {(canCreate(clientsModuleKey) || canUpdate(clientsModuleKey)) && (
              <Button variant="outline" onClick={() => setIsFormOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Client
              </Button>
            )}
            {hasScheduleAccess && (
            <Button asChild>
              <Link href={`/appointments?clientId=${client?.id}`}>
                <CalendarPlus className="mr-2 h-4 w-4" />
                  Book Appointment
                </Link>
              </Button>
            )}
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
                      <TabsTrigger value="deals">Deals</TabsTrigger>
                    </TabsList>
                  </div>
                </CardHeader>
                <CardContent>
                  <TabsContent value="appointments">
                    {appointmentsData.length > 0 ? (
                      <DataTable columns={appointmentsColumns as any} data={appointmentsData} />
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No appointment history for this client.</p>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="payments">
                    {paymentHistory.length > 0 ? (
                      <DataTable columns={paymentsColumns as any} data={paymentHistory} />
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No payment history for this client.</p>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="services">
                    {servicesHistory.length > 0 ? (
                      <DataTable columns={servicesColumns as any} data={servicesHistory} />
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No service history for this client.</p>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="deals">
                    {dealsHistory.length > 0 ? (
                      <DataTable columns={dealsColumns as any} data={dealsHistory} />
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No deal history for this client.</p>
                      </div>
                    )}
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
