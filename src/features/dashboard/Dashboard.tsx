
"use client";

import { useState }from "react";
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
} from "lucide-react";
import { RevenueChart } from "./RevenueChart";
import type { ScheduleAppointment } from "@/lib/schedule-data";
import { DashboardCalendar } from "./DashboardCalendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isThisMonth, isThisWeek, isToday, format, parseISO } from "date-fns";
import type { Appointment } from "@/lib/api/servicesApi";

export function Dashboard({
  todayAppointments,
  allAppointments,
}: {
  todayAppointments: Appointment[];
  allAppointments: ScheduleAppointment[];
}) {
  const [period, setPeriod] = useState<"today" | "week" | "month">("today");

  const filteredAppointments = allAppointments.filter(apt => {
    if (period === "today") return isToday(apt.start);
    if (period === "week") return isThisWeek(apt.start, { weekStartsOn: 1 });
    if (period === "month") return isThisMonth(apt.start);
    return false;
  });
  
  // Convert ScheduleAppointment to Appointment for consistency
  const convertedFilteredAppointments: Appointment[] = filteredAppointments.map(apt => {
    const service = todayAppointments.find(a => a.service === apt.service);
    return {
        id: apt.id,
        salonId: 'salon_01', // Mock
        customer: {
            id: `cust_${apt.customerName}`, // Mock
            phone: '', // Mock
            name: apt.customerName,
            email: `${apt.customerName.toLowerCase().replace(' ', '.')}@example.com` // Mock
        },
        service: apt.service,
        staff: service?.staff || 'Unknown', // Mock
        date: format(apt.start, 'yyyy-MM-dd'),
        time: format(apt.start, 'p'),
        price: service?.price || 0,
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
              Your revenue summary for the selected period.
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
              <DashboardCalendar allAppointments={allAppointments} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
