
"use client";

import { useMemo, useState } from "react";
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
import { PlusCircle, LayoutGrid, Calendar, ChevronsUpDown } from "lucide-react";
import { staff as allStaff } from "@/lib/placeholder-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export function Schedule({ appointments }: { appointments: ScheduleAppointment[] }) {
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  const filteredAppointments = useMemo(() => {
    if (!selectedStaffId) {
      return appointments;
    }
    return appointments.filter((apt) => apt.staffId === selectedStaffId);
  }, [appointments, selectedStaffId]);
  
  const todayAppointments = filteredAppointments.filter((apt) =>
    isToday(apt.start)
  );

  const weeklyAppointments = filteredAppointments.filter((apt) =>
    isThisWeek(apt.start, { weekStartsOn: 1 })
  );

  const monthlyAppointments = filteredAppointments.filter((apt) =>
    isThisMonth(apt.start)
  );

  const calendarEvents = filteredAppointments
    .filter(apt => apt.service && apt.customerName)
    .map((apt) => {
    return {
      title: `${apt.service} - ${apt.customerName}`,
      start: apt.start,
      end: apt.end,
      resource: apt,
    };
  });

  const selectedStaffName = useMemo(() => {
    if (!selectedStaffId) {
      return "All Staff";
    }
    return allStaff.find(s => s.id === selectedStaffId)?.name || "All Staff";
  }, [selectedStaffId]);

  const renderAppointmentTable = (
    appointments: ScheduleAppointment[],
    showDate: boolean = false
  ) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Service</TableHead>
          {showDate && (
            <TableHead className="hidden md:table-cell">Date</TableHead>
          )}
          <TableHead className="text-right">Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.length > 0 ? (
          appointments
            .sort(
              (a, b) =>
                a.start.getTime() - b.start.getTime()
            )
            .map((apt) => (
              <TableRow key={apt.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={apt.customerAvatar}
                        alt="Avatar"
                      />
                      <AvatarFallback>
                        {apt.customerName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{apt.customerName}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{apt.service}</TableCell>
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
  );

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
                <DropdownMenuContent className="w-[180px]">
                  <DropdownMenuLabel>Filter by Staff</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setSelectedStaffId(null)}>
                    All Staff
                  </DropdownMenuItem>
                  {allStaff.map((staff) => (
                    <DropdownMenuItem
                      key={staff.id}
                      onSelect={() => setSelectedStaffId(staff.id)}
                    >
                      {staff.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

               <Button asChild>
                  <Link href="/appointments">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Appointment
                  </Link>
                </Button>
            </div>
        </div>

        <TabsContent value="grid" className="mt-4">
          <Tabs defaultValue="day">
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
