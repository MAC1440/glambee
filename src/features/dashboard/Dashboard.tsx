
"use client";

import { useState, useEffect, useMemo } from "react";
import { AppointmentsTable } from "./AppointmentsTable";
import { QuickActions } from "./QuickActions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Activity,
  CalendarCheck,
  CircleDollarSign,
  Users,
  Repeat,
  Loader2,
} from "lucide-react";
import { RevenueChart } from "./RevenueChart";
import type { ScheduleAppointment } from "@/lib/schedule-data";
import { DashboardCalendar } from "./DashboardCalendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isThisMonth, isThisWeek, isToday, format, parseISO } from "date-fns";
import { AppointmentsApi, type AppointmentWithDetails } from "@/lib/api/appointmentsApi";
import { StaffApi, type StaffWithCategories } from "@/lib/api/staffApi";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/use-permissions";
import { UnauthorizedAccess } from "@/components/ui/unauthorized-access";
export function Dashboard() {
  const [period, setPeriod] = useState<"today" | "week" | "month">("today");
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  console.log("Appointments: ", appointments);
  const [staff, setStaff] = useState<StaffWithCategories[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sessionData = localStorage.getItem("session");
  console.log("Session data: ", JSON.parse(sessionData || ''))
  const { hasModuleAccess, canCreate, canRead, canUpdate, canDelete } = usePermissions();
  const dashboardModuleKey = "dashboard" as const;
  // const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const hasAccess = hasModuleAccess(dashboardModuleKey);
  console.log("Has access for dashboard: ", hasAccess)
  // console.log("Can create: ", canCreate(dashboardModuleKey))
  // console.log("Can read: ", canRead(dashboardModuleKey))
  // console.log("Can update: ", canUpdate(dashboardModuleKey))
  // console.log("Can delete: ", canDelete(dashboardModuleKey))
  // useEffect(() => {
  //   console.log("In dash effect....")
  //   const checkAccess = async () => {
  //     // First check synchronously (if permissions are in session)
  //     const syncAccess = hasModuleAccess(dashboardModuleKey);
  //     console.log("Synced access: ", syncAccess)
  //     if (syncAccess) {
  //       setHasAccess(true);
  //       return;
  //     }

  //     // If no permissions in session, fetch them
  //     const sessionData = localStorage.getItem("session");
  //     if (!sessionData) {
  //       setHasAccess(false);
  //       return;
  //     }
  //     console.log("Session data: ", sessionData)

  //     try {
  //       const session = JSON.parse(sessionData);
  //       const userId = session.id;
  //       console.log("User ID: ", userId)
  //       // If user is admin, they have access
  //       if (session.role === "SUPER_ADMIN" || session.role === "SALON_ADMIN" || session.userType === "salon" || session.userType === "SUPER_ADMIN" || session.userType === "SALON_ADMIN") {
  //         setHasAccess(true);
  //         return;
  //       }

  //       // Fetch permissions for staff
  //       if (userId) {
  //         const { fetchAndUpdatePermissions } = await import("@/hooks/use-permissions");
  //         const permissions = await fetchAndUpdatePermissions(userId);
  //         console.log("Permissions: ", permissions)
  //         if (permissions) {
  //           // Check if user has access to deals module
  //           const modulePermissions = permissions[dashboardModuleKey];
  //           console.log("Module permissions: ", modulePermissions)
  //           const access = modulePermissions && (
  //             modulePermissions.read === true ||
  //             modulePermissions.create === true ||
  //             modulePermissions.update === true ||
  //             modulePermissions.delete === true
  //           );
  //           setHasAccess(access || false);
  //         } else {
  //           setHasAccess(false);
  //         }
  //       } else {
  //         setHasAccess(false);
  //       }
  //     } catch (error) {
  //       console.error("Error checking module access:", error);
  //       setHasAccess(false);
  //     }
  //   };

  //   checkAccess();

  //   // Listen for session updates
  //   const handleSessionUpdate = () => {
  //     const syncAccess = hasModuleAccess(dashboardModuleKey);
  //     setHasAccess(syncAccess);
  //   };

  //   window.addEventListener("sessionUpdated", handleSessionUpdate);
  //   return () => {
  //     window.removeEventListener("sessionUpdated", handleSessionUpdate);
  //   };
  // }, [dashboardModuleKey, hasModuleAccess]);

  // Fetch appointments and staff data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch appointments and staff in parallel
        const [appointmentsResponse, staffResponse] = await Promise.all([
          AppointmentsApi.getAppointments({ salonId: JSON.parse(sessionData || '').salonId }),
          StaffApi.getStaff({ salonId: JSON.parse(sessionData || '').salonId })
        ]);

        setAppointments(appointmentsResponse.data || []);
        setStaff(staffResponse.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Transform appointments to ScheduleAppointment format
  const scheduleAppointments: ScheduleAppointment[] = useMemo(() => {
    return appointments.map(apt => ({
      id: apt.id,
      customerName: apt.customer?.name || 'Unknown Customer',
      customerAvatar: apt.customer?.avatar || `https://picsum.photos/seed/${apt.customer?.name}/100`,
      service: apt.services?.map(s => s.name).join(', ') || 'No Service',
      start: new Date(apt.start_time || new Date()),
      end: new Date(apt.end_time || new Date()),
      staffId: apt.staff?.id || 'unassigned'
    }));
  }, [appointments]);
  console.log("Schedule Appointments: ", scheduleAppointments);

  const filteredAppointments = scheduleAppointments.filter(apt => {
    if (period === "today") return isToday(apt.start);
    if (period === "week") return isThisWeek(apt.start, { weekStartsOn: 0 });
    if (period === "month") return isThisMonth(apt.start);
    return false;
  });

  // Convert ScheduleAppointment to Appointment for consistency and to add price
  const convertedFilteredAppointments = filteredAppointments.map(apt => {
    // Get price from the original appointment data
    const originalAppointment = appointments.find(a => a.id === apt.id);
    const price = originalAppointment?.bill || 0;

    return {
      id: apt.id,
      salonId: originalAppointment?.salon_id || 'salon_01',
      customer: {
        id: originalAppointment?.customer?.id || `cust_${apt.customerName}`,
        phone: originalAppointment?.customer?.phone_number || '',
        name: apt.customerName,
        email: originalAppointment?.customer?.email || `${apt.customerName.toLowerCase().replace(' ', '.')}@example.com`
      },
      service: apt.service,
      staff: originalAppointment?.staff?.name || 'Unknown',
      date: format(apt.start, 'yyyy-MM-dd'),
      time: format(apt.start, 'p'),
      price: price,
    }
  });


  // Calculate total revenue for all appointments (not just filtered period)
  const totalRevenue = scheduleAppointments.reduce((sum, apt) => {
    const originalAppointment = appointments.find(a => a.id === apt.id);
    console.log("Original Appointment: ", originalAppointment);
    return sum + (originalAppointment?.bill || 0);
  }, 0);
  console.log("Schedule Appointments length: ", scheduleAppointments?.length);
  console.log("Appointments length: ", appointments?.length);
  console.log("Revenue: ", totalRevenue);

  // Calculate period-specific revenue
  const periodRevenue = convertedFilteredAppointments.reduce((sum, apt) => sum + apt.price, 0);

  // Calculate new clients dynamically
  const newClients = useMemo(() => {
    const startDate = new Date();
    switch (period) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }

    // Count unique customers who have appointments in the period
    const periodCustomers = new Set();
    convertedFilteredAppointments.forEach(apt => {
      periodCustomers.add(apt.customer.id);
    });

    return periodCustomers.size;
  }, [convertedFilteredAppointments, period]);

  // Calculate recurring clients percentage
  const recurringClientsPercentage = useMemo(() => {
    if (convertedFilteredAppointments.length === 0) return 0;

    // Count customers with more than one appointment
    const customerAppointmentCounts = new Map();
    convertedFilteredAppointments.forEach(apt => {
      const count = customerAppointmentCounts.get(apt.customer.id) || 0;
      customerAppointmentCounts.set(apt.customer.id, count + 1);
    });

    const totalCustomers = customerAppointmentCounts.size;
    const recurringCustomers = Array.from(customerAppointmentCounts.values()).filter(count => count > 1).length;

    return totalCustomers > 0 ? Math.round((recurringCustomers / totalCustomers) * 100) : 0;
  }, [convertedFilteredAppointments]);

  const getCardTitle = () => {
    switch (period) {
      case "today": return "Today's Appointments";
      case "week": return "This Week's Appointments";
      case "month": return "This Month's Appointments";
      default: return "Appointments";
    }
  };

  const getRevenueDescription = () => {
    switch (period) {
      case "today": return "Your revenue summary for today.";
      case "week": return "Your revenue summary for this week.";
      case "month": return "Your revenue summary for this month.";
      default: return "Your revenue summary.";
    }
  }


  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <p className="text-destructive">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // if (hasAccess === false) {
  //   return <UnauthorizedAccess moduleName="Dashboard" />;
  // }

  return (
    <div className="flex flex-col gap-8">
      <Tabs defaultValue="today" onValueChange={(value) => setPeriod(value as any)}>
        <div className="flex justify-end">
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Total revenue from all appointments
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Appointments
              </CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{convertedFilteredAppointments.length}</div>
              <p className="text-xs text-muted-foreground">
                In this period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{newClients}</div>
              <p className="text-xs text-muted-foreground">
                Unique clients in this period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recurring Clients</CardTitle>
              <Repeat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recurringClientsPercentage}%</div>
              <p className="text-xs text-muted-foreground">
                Of clients have more than one appointment
              </p>
            </CardContent>
          </Card>
        </div>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <AppointmentsTable
            title={getCardTitle()}
            appointments={convertedFilteredAppointments}
          />
        </Card>
        <Card>
          <QuickActions />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>
              {getRevenueDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart appointments={convertedFilteredAppointments} period={period} />
            <div className="mt-4 text-sm text-muted-foreground">
              Period Revenue: ${periodRevenue.toFixed(2)} | Total Revenue: ${totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>
                A monthly overview of your appointments. Click a date to see
                details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DashboardCalendar allAppointments={scheduleAppointments} staff={staff} period={period} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
