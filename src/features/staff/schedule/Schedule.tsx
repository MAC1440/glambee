
"use client";

import { useMemo, useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  isToday,
  isThisWeek,
  isThisMonth,
  format,
} from "date-fns";
import { CalendarView } from "./CalendarView";
import type { ScheduleAppointment } from "@/lib/schedule-data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, LayoutGrid, Calendar, ChevronsUpDown, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppointmentsApi, type AppointmentWithDetails } from "@/lib/api/appointmentsApi";
import { StaffApi, type StaffWithCategories } from "@/lib/api/staffApi";
import { usePermissions } from "@/hooks/use-permissions";
import { UnauthorizedAccess } from "@/components/ui/unauthorized-access";

export function Schedule() {
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [staff, setStaff] = useState<StaffWithCategories[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // You can adjust this
  const sessionData = localStorage.getItem("session");
  
  // Get permissions for schedule/appointments module
  const { canCreate, hasModuleAccess } = usePermissions();
  const scheduleModuleKey = "schedule" as const;
  const hasAccess = hasModuleAccess(scheduleModuleKey);
  console.log("Has access for schedule: ", hasAccess)


  // Fetch appointments and staff data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch appointments and staff in parallel
        const [appointmentsResponse, staffResponse] = await Promise.all([
          AppointmentsApi.getAppointments({salonId: JSON.parse(sessionData || '').salonId}),
          StaffApi.getStaff({salonId: JSON.parse(sessionData || '').salonId})
        ]);
        
        setAppointments(appointmentsResponse.data || []);
        setStaff(staffResponse.data || []);
      } catch (err) {
        console.error('Error fetching schedule data:', err);
        setError('Failed to load schedule data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStaffId]);
  
  // Transform appointments to ScheduleAppointment format
  const scheduleAppointments: ScheduleAppointment[] = useMemo(() => {
    return appointments.map(apt => ({
      id: apt.id,
      customerName: apt.customer?.name || 'Unknown Customer',
      customerAvatar: apt.customer?.avatar || `https://picsum.photos/seed/${apt.customer?.name}/100`,
      service: apt.services?.map(s => s.name).join(', ') || 'N/A',
      deal: apt.deals?.map((d) => d.name).join(', ') || 'N/A',
      start: new Date(apt.start_time || new Date()),
      end: new Date(apt.end_time || new Date()),
      staffId: apt.staff?.id || 'unassigned'
    }));
  }, [appointments]);

  console.log("Appointments: ", appointments);
  console.log("Schedule Appointments: ", scheduleAppointments);

  const filteredAppointments = useMemo(() => {
    if (!selectedStaffId) {
      return scheduleAppointments;
    }
    return scheduleAppointments.filter((apt) => apt.staffId === selectedStaffId);
  }, [scheduleAppointments, selectedStaffId]);
  
  console.log("Filtered Appointments: ", filteredAppointments);

  const todayAppointments = filteredAppointments.filter((apt) =>
    isToday(apt.start)
  );

  const weeklyAppointments = filteredAppointments.filter((apt) =>
    isThisWeek(apt.start, { weekStartsOn: 0 })
  );
  // console.log("Filtered appointments weekly: ", weeklyAppointments);

  const monthlyAppointments = filteredAppointments.filter((apt) =>
    isThisMonth(apt.start)
  );

  const calendarEvents = filteredAppointments
    .filter(apt => apt.service && apt.customerName)
    .map((apt) => {
      const staffMember = staff.find(s => s.id === apt.staffId);
      const staffName = staffMember?.name || 'Unassigned';
      let title = ''
      if (apt.service && apt.service !== 'No Service') {
        title = `${apt.service} (Service) - ${apt.customerName} - ${staffName}`
      } 
      else {
        title = `${apt.deal} (Deal) - ${apt.customerName} - ${staffName}`
      }
      
      return {
        title: title,
        start: apt.start,
        end: apt.end,
        resource: apt,
      };
    });

  const selectedStaffName = useMemo(() => {
    if (!selectedStaffId) {
      return "All Staff";
    }
    return staff.find(s => s.id === selectedStaffId)?.name || "All Staff";
  }, [selectedStaffId, staff]);

  const renderAppointmentTable = (
    appointments: ScheduleAppointment[],
    showDate: boolean = false
  ) => {
    const totalPages = Math.ceil(appointments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentAppointments = appointments
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(startIndex, startIndex + itemsPerPage);

    console.log("Current appointments: ", currentAppointments);
  
    return (
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Deal</TableHead>
              {showDate && <TableHead className="hidden md:table-cell">Date</TableHead>}
              <TableHead className="text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentAppointments.length > 0 ? (
              currentAppointments.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={apt.customerAvatar} alt="Avatar" />
                        <AvatarFallback>{apt.customerName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{apt.customerName}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{apt.service}</TableCell>
                  <TableCell>{apt.deal}</TableCell>
                  {showDate && (
                    <TableCell className="hidden md:table-cell">
                      {format(apt.start, "PPP")}
                    </TableCell>
                  )}
                  <TableCell className="text-right">{format(apt.start, "p")}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={showDate ? 4 : 3} className="text-center h-24">
                  No appointments scheduled.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
  
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-end items-center gap-2 py-4 pr-4">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    );
  };
  

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-4xl font-headline font-bold">Schedule</h1>
            <p className="text-muted-foreground mt-2">
              Here are your upcoming appointments.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading schedule...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-4xl font-headline font-bold">Schedule</h1>
            <p className="text-muted-foreground mt-2">
              Here are your upcoming appointments.
            </p>
          </div>
        </div>
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
  //   return <UnauthorizedAccess moduleName="Schedule" />;
  // }

  return (
    <div className="flex flex-col gap-8">
       <Tabs defaultValue="calendar">
        <div className="flex items-center justify-between">
            <div className="text-left">
                <h1 className="text-4xl font-headline font-bold">Schedule</h1>
                <p className="text-muted-foreground mt-2">
                Here are your upcoming appointments.
                </p>
            </div>
            <div className="flex items-center gap-4">
              <TabsList>
                  <TabsTrigger value="grid" className="w-10 h-10"><LayoutGrid className="h-5 w-5" /></TabsTrigger>
                  <TabsTrigger value="calendar" className="w-10 h-10"><Calendar className="h-5 w-5" /></TabsTrigger>
              </TabsList>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[180px] justify-between">
                    {selectedStaffName}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[180px] max-h-[300px]">
                  <DropdownMenuLabel>Filter by Staff</DropdownMenuLabel>
                  <DropdownMenuSeparator className="sticky top-0 z-10" />
                  <div className="max-h-[240px] overflow-y-auto">
                    <DropdownMenuItem onSelect={() => setSelectedStaffId(null)}>
                      All Staff
                    </DropdownMenuItem>
                    {staff.map((staffMember) => (
                      <DropdownMenuItem
                        key={staffMember.id}
                        onSelect={() => setSelectedStaffId(staffMember.id)}
                      >
                        {staffMember.name}
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

                {canCreate(scheduleModuleKey) && (
                <Button asChild>
                  <Link href="/appointments">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Appointment
                  </Link>
                </Button>
              )}
            </div>
        </div>

        <TabsContent value="grid" className="mt-4">
          <Tabs defaultValue="day" onValueChange={() => setCurrentPage(1)}>
            <TabsList>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
            <Card className="mt-4">
              <CardContent className="p-0">
                <TabsContent value="day" className="m-0">
                  {renderAppointmentTable(todayAppointments)}
                </TabsContent>
                <TabsContent value="week" className="m-0">
                  {renderAppointmentTable(weeklyAppointments, true)}
                </TabsContent>
                <TabsContent value="month" className="m-0">
                  {renderAppointmentTable(monthlyAppointments, true)}
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </TabsContent>
        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardContent className="p-2 md:p-4">
              <CalendarView events={calendarEvents} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
