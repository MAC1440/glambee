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
import { appointments } from "@/lib/placeholder-data";
import { subDays, addDays, format } from "date-fns";

export function Schedule() {
  const today = new Date();
  const yesterday = subDays(today, 1);
  const tomorrow = addDays(today, 1);

  const todayAppointments = appointments.filter(
    (apt) => apt.date === format(today, "yyyy-MM-dd")
  );
  const weeklyAppointments = appointments.filter(
    (apt) =>
      new Date(apt.date) >= today && new Date(apt.date) <= addDays(today, 7)
  );
  const monthlyAppointments = appointments.filter(
    (apt) =>
      new Date(apt.date).getMonth() === today.getMonth() &&
      new Date(apt.date).getFullYear() === today.getFullYear()
  );

  const renderAppointmentTable = (
    appointments: typeof todayAppointments,
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
          appointments.map((apt) => (
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
                    <div className="text-sm text-muted-foreground">
                      {apt.customer.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{apt.service}</TableCell>
              {showDate && (
                <TableCell className="hidden md:table-cell">
                  {apt.date}
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

      <Tabs defaultValue="day">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
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
