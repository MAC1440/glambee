
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

export function Dashboard() {
  const [period, setPeriod] = useState<"today" | "week" | "month">("today");
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [staff, setStaff] = useState<StaffWithCategories[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch appointments and staff data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch appointments and staff in parallel
        const [appointmentsResponse, staffResponse] = await Promise.all([
          AppointmentsApi.getAppointments(),
          StaffApi.getStaff()
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

  const filteredAppointments = scheduleAppointments.filter(apt => {
    if (period === "today") return isToday(apt.start);
    if (period === "week") return isThisWeek(apt.start, { weekStartsOn: 1 });
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


  const totalRevenue = convertedFilteredAppointments.reduce((sum, apt) => sum + apt.price, 0);
  
  // Mock data for other stats as we don't have historical data
  const newClients = period === 'today' ? 12 : (period === 'week' ? 45 : 150);
  
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
                +20.1% from last month
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
                <div className="text-2xl font-bold">+{newClients}</div>
                <p className="text-xs text-muted-foreground">
                In this period
                </p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recurring Clients</CardTitle>
                <Repeat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">63%</div>
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
