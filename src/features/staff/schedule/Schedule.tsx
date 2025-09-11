
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
import {
  isToday,
  isThisWeek,
  isThisMonth,
  parse,
  format,
} from "date-fns";
import { CalendarView } from "./CalendarView";

type Appointment = {
  id: string;
  salonId: string;
  customer: {
    id: string;
    phone: string;
    name: string;
    email: string;
  };
  service: string;
  staff: string;
  date: string;
  time: string;
  price: number;
};

// Helper to parse date without timezone issues
const parseDate = (dateString: string) => {
  return parse(dateString, 'yyyy-MM-dd', new Date());
};

const parseDateTime = (dateString: string, timeString: string) => {
    // Combine date and time and parse it in a way that respects local time
    // The format 'yyyy-MM-dd h:mm a' handles times like '09:00 AM'
    return parse(`${dateString} ${timeString}`, 'yyyy-MM-dd h:mm a', new Date());
}

export function Schedule({ appointments }: { appointments: Appointment[] }) {
  const todayAppointments = appointments.filter((apt) =>
    isToday(parseDate(apt.date))
  );

  const weeklyAppointments = appointments.filter((apt) =>
    isThisWeek(parseDate(apt.date), { weekStartsOn: 1 })
  );

  const monthlyAppointments = appointments.filter((apt) =>
    isThisMonth(parseDate(apt.date))
  );
  
  const calendarEvents = appointments.map(apt => {
    const startDate = parseDateTime(apt.date, apt.time);
    
    // Assuming 1 hour duration for now, can be replaced by service duration later
    const endDate = new Date(startDate.getTime() + (60 * 60 * 1000)); 

    return {
      title: `${apt.service} - ${apt.customer.name}`,
      start: startDate,
      end: endDate,
      resource: apt,
    }
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
          appointments
            .sort(
              (a, b) =>
                new Date(a.date).getTime() - new Date(b.date).getTime() ||
                a.time.localeCompare(b.time)
            )
            .map((apt) => (
              <TableRow key={apt.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={`https://picsum.photos/seed/${apt.customer.name}/100`}
                        alt="Avatar"
                      />
                      <AvatarFallback>
                        {apt.customer.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{apt.customer.name}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{apt.service}</TableCell>
                {showDate && (
                  <TableCell className="hidden md:table-cell">
                    {format(parseDate(apt.date), "PPP")}
                  </TableCell>
                )}
                <TableCell className="text-right">{apt.time}</TableCell>
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

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

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
