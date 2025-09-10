
"use client";

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
import { addDays, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from "date-fns";

type Appointment = {
  id: string;
  customer_name: string;
  customer_id: string;
  booking_type: string;
  date: string;
  start_time: string;
};

export function Schedule({ appointments }: { appointments: Appointment[] }) {
  const today = new Date();
  
  const todayAppointments = appointments.filter(
    (apt) => apt.date === format(today, "yyyy-MM-dd")
  );

  const startOfCurrentWeek = startOfWeek(today);
  const endOfCurrentWeek = endOfWeek(today);
  const weeklyAppointments = appointments.filter((apt) => {
    const aptDate = parseISO(apt.date);
    return aptDate >= startOfCurrentWeek && aptDate <= endOfCurrentWeek;
  });

  const startOfCurrentMonth = startOfMonth(today);
  const endOfCurrentMonth = endOfMonth(today);
  const monthlyAppointments = appointments.filter((apt) => {
    const aptDate = parseISO(apt.date);
    return aptDate >= startOfCurrentMonth && aptDate <= endOfCurrentMonth;
  });

  const renderAppointmentTable = (
    appointments: Appointment[],
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
          appointments.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.start_time.localeCompare(b.start_time)).map((apt) => (
            <TableRow key={apt.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={`https://picsum.photos/seed/${apt.customer_name}/100`}
                      alt="Avatar"
                    />
                    <AvatarFallback>
                      {apt.customer_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{apt.customer_name}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{apt.booking_type}</TableCell>
              {showDate && (
                <TableCell className="hidden md:table-cell">
                  {format(parseISO(apt.date), "PPP")}
                </TableCell>
              )}
              <TableCell className="text-right">{apt.start_time}</TableCell>
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
      <div className="text-left">
        <h1 className="text-4xl font-headline font-bold">Schedule</h1>
        <p className="text-muted-foreground mt-2">
          Here are your upcoming appointments.
        </p>
      </div>

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
    </div>
  );
}
