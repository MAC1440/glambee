import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { appointments } from "@/lib/placeholder-data";

export default function SchedulePage() {
  const todayAppointments = appointments.filter(
    (apt) => apt.date === "2024-07-30"
  );
  const weekAppointments = appointments.filter(
    (apt) => new Date(apt.date) <= new Date("2024-08-05")
  );

  const renderAppointmentTable = (
    appointments: typeof todayAppointments
  ) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Service</TableHead>
          <TableHead className="hidden md:table-cell">Date</TableHead>
          <TableHead className="text-right">Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((apt) => (
          <TableRow key={apt.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={`https://picsum.photos/seed/${apt.customer.name}/100`}
                    alt="Avatar"
                  />
                  <AvatarFallback>{apt.customer.name.charAt(0)}</AvatarFallback>
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
            <TableCell className="hidden md:table-cell">{apt.date}</TableCell>
            <TableCell className="text-right">{apt.time}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="text-left">
        <h1 className="text-4xl font-headline font-bold">My Schedule</h1>
        <p className="text-muted-foreground mt-2">
          Here are your upcoming appointments.
        </p>
      </div>

      <Tabs defaultValue="today">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        <Card className="mt-4">
          <CardContent className="p-0">
            <TabsContent value="today" className="m-0">
              {renderAppointmentTable(todayAppointments)}
            </TabsContent>
            <TabsContent value="week" className="m-0">
              {renderAppointmentTable(weekAppointments)}
            </TabsContent>
            <TabsContent value="all" className="m-0">
              {renderAppointmentTable(appointments)}
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
